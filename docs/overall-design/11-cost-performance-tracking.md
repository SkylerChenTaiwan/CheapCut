# 步驟 11：成本效能追蹤系統設計

**狀態**：🔄 討論中
**前置依賴**：02-key-flows.md, 03-system-boundary.md, 04-module-breakdown.md, 05-data-flow.md
**目標**：設計系統的成本追蹤與效能監控機制

---

## 核心目標

建立完整的成本效能追蹤系統，讓我們能夠：

1. **成本追蹤**
   - 知道每個用戶花了多少錢
   - 知道每個功能的成本結構
   - 發現成本異常
   - 支援未來定價決策

2. **效能監控**
   - 找出系統瓶頸
   - 優化用戶體驗
   - 容量規劃

3. **數據驅動決策**
   - 哪個 Prompt 最貴/最慢？
   - 哪個外部服務成本最高？
   - 如何優化以降低成本？

---

## 成本追蹤系統設計

### 埋點策略

**原則**：在每個「花錢的地方」都要記錄

#### 需要追蹤的服務

| 服務 | 計費方式 | 埋點位置 | 成本計算 |
|------|---------|---------|---------|
| Google Video AI | 按影片分鐘數 | 素材處理引擎 | 影片時長 × $0.10/分鐘 |
| OpenAI Whisper (STT) | 按音檔分鐘數 | 配音處理引擎 | 音檔時長 × $0.006/分鐘 |
| OpenAI GPT-4 | 按 tokens | 所有 AI 呼叫 | (prompt_tokens × $0.03 + completion_tokens × $0.06) / 1000 |
| Cloudflare Stream | 按渲染時長 | 影片合成引擎 | 影片時長 × $0.004/45秒 |
| S3/R2 儲存 | 按 GB-月 | 檔案上傳時 | 檔案大小 × $0.01/GB |
| CloudFront 流量 | 按 GB | 檔案下載時 | 流量 × $0.085/GB |

#### 埋點實作範例

```typescript
// 素材處理引擎
class MaterialProcessingEngine {
  private costTracker: CostTracker

  async analyze(videoId: string) {
    const execution = await db.task_executions.create({...})
    const video = await db.videos.findOne({ videoId })

    try {
      // ===== 埋點 1: Video AI 分析 =====
      const aiStart = Date.now()
      const aiResult = await googleVideoAI.analyze(video.file_path)

      await this.costTracker.record({
        execution_id: execution.id,
        user_id: video.user_id,
        service: 'google_video_ai',
        operation: 'video_analysis',
        quantity: video.duration / 60,  // 轉成分鐘
        unit: 'minutes',
        unit_cost: 0.10,
        total_cost: (video.duration / 60) * 0.10,
        duration: Date.now() - aiStart,
        metadata: {
          video_duration: video.duration,
          video_resolution: video.resolution
        }
      })

      // ===== 埋點 2: 生成縮圖並上傳 S3 =====
      const thumbnails = await this.generateThumbnails(segments)
      const uploadStart = Date.now()

      for (const thumb of thumbnails) {
        await s3.upload(thumb.buffer, thumb.key)

        await this.costTracker.record({
          execution_id: execution.id,
          user_id: video.user_id,
          service: 's3',
          operation: 'upload',
          quantity: thumb.size / (1024 * 1024),  // MB
          unit: 'MB',
          unit_cost: 0.01 / 1024,  // $0.01 per GB
          total_cost: (thumb.size / (1024 * 1024 * 1024)) * 0.01,
          duration: Date.now() - uploadStart
        })
      }

      // 成功完成
      await db.task_executions.update(execution.id, {
        status: 'completed',
        total_cost: await this.costTracker.getTotalCost(execution.id)
      })

    } catch (error) {
      // 失敗也要記錄已發生的成本
      await db.task_executions.update(execution.id, {
        status: 'failed',
        total_cost: await this.costTracker.getTotalCost(execution.id),
        error_message: error.message
      })
      throw error
    }
  }
}
```

```typescript
// AI 呼叫的統一埋點（所有 Prompt 都經過這裡）
class PromptManager {
  async executePrompt(category: string, name: string, variables: any) {
    const { prompt, model, temperature } = await this.loadPrompt(category, name)
    const rendered = this.renderPrompt(prompt, variables)

    // 呼叫 AI
    const start = Date.now()
    const response = await openai.chat.completions.create({
      model: model || 'gpt-4',
      temperature: temperature ?? 0.7,
      messages: [{ role: 'user', content: rendered }]
    })
    const duration = Date.now() - start

    // ===== 自動埋點：記錄 AI 成本 =====
    const cost = this.calculateOpenAICost(
      model || 'gpt-4',
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    )

    await costTracker.record({
      execution_id: context.executionId,  // 從上下文取得
      user_id: context.userId,
      service: 'openai',
      operation: `${model || 'gpt-4'}_${category}_${name}`,
      quantity: response.usage.total_tokens,
      unit: 'tokens',
      unit_cost: cost / response.usage.total_tokens,
      total_cost: cost,
      duration,
      metadata: {
        prompt_category: category,
        prompt_name: name,
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens
      }
    })

    return { response, cost, duration }
  }

  private calculateOpenAICost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 }
    }
    const price = pricing[model] || pricing['gpt-4']
    return (promptTokens * price.prompt + completionTokens * price.completion) / 1000
  }
}
```

---

### 資料表設計

#### 1. 成本記錄表（cost_records）

```typescript
interface CostRecord {
  record_id: string          // UUID

  // 關聯資訊
  execution_id: string       // 關聯到任務執行（外鍵）
  user_id: string           // 關聯到用戶（外鍵）- 重要！

  // 服務資訊
  service: 'google_video_ai' | 'openai' | 'whisper' | 's3' | 'cloudfront' | 'cloudflare_stream'
  operation: string         // 具體操作（例如："gpt-4_video_selection_segment_select"）

  // 成本計算
  quantity: number          // 使用量
  unit: string             // 單位："tokens", "minutes", "MB", "GB"
  unit_cost: number        // 單價（USD）
  total_cost: number       // 總費用（USD）

  // 效能資訊
  started_at: Date
  duration: number         // 執行時間（ms）

  // 額外資訊
  metadata: JSON           // 詳細資訊（視服務而定）

  created_at: Date
}

// 索引設計
CREATE INDEX idx_cost_user_date ON cost_records(user_id, created_at DESC);
CREATE INDEX idx_cost_execution ON cost_records(execution_id);
CREATE INDEX idx_cost_service ON cost_records(service, created_at DESC);
```

#### 2. 效能記錄表（performance_records）

```typescript
interface PerformanceRecord {
  record_id: string

  // 關聯資訊
  execution_id: string
  task_type: string        // "material_analysis", "voiceover_processing", "video_generation"
  step_name: string        // 步驟名稱

  // 時間資訊
  started_at: Date
  completed_at: Date
  duration: number         // ms

  // 狀態
  status: 'success' | 'failed'
  error?: string

  // 詳細資訊
  metadata?: JSON          // 資料大小、API 回應時間等

  created_at: Date
}

// 索引設計
CREATE INDEX idx_perf_task_type ON performance_records(task_type, created_at DESC);
CREATE INDEX idx_perf_execution ON performance_records(execution_id);
```

---

### CostTracker 服務實作

```typescript
class CostTracker {
  async record(data: {
    execution_id: string
    user_id: string
    service: string
    operation: string
    quantity: number
    unit: string
    unit_cost: number
    total_cost: number
    duration: number
    metadata?: any
  }) {
    // 1. 寫入 cost_records 表
    await db.cost_records.insert({
      record_id: uuidv4(),
      execution_id: data.execution_id,
      user_id: data.user_id,
      service: data.service,
      operation: data.operation,
      quantity: data.quantity,
      unit: data.unit,
      unit_cost: data.unit_cost,
      total_cost: data.total_cost,
      started_at: new Date(Date.now() - data.duration),
      duration: data.duration,
      metadata: data.metadata,
      created_at: new Date()
    })

    // 2. 更新 task_execution 的總成本
    const totalCost = await this.getTotalCost(data.execution_id)
    await db.task_executions.update(data.execution_id, {
      total_cost: totalCost,
      ai_calls_count: await this.getAICallsCount(data.execution_id)
    })

    // 3. 檢查成本異常（可選）
    if (data.total_cost > 1.0) {  // 單次超過 $1
      await this.alertHighCost(data)
    }
  }

  async getTotalCost(executionId: string): Promise<number> {
    const result = await db.cost_records.aggregate([
      { $match: { execution_id: executionId } },
      { $group: { _id: null, total: { $sum: '$total_cost' } } }
    ])
    return result[0]?.total || 0
  }

  async getAICallsCount(executionId: string): Promise<number> {
    return await db.cost_records.count({
      execution_id: executionId,
      service: { $in: ['openai', 'google_video_ai', 'whisper'] }
    })
  }

  private async alertHighCost(data: any) {
    // 發送告警（Slack、Email 等）
    await notifications.send({
      type: 'high_cost_alert',
      message: `高成本操作: ${data.operation} 花費 $${data.total_cost}`,
      data
    })
  }
}
```

---

## 成本分析 API

### 1. 用戶成本統計

```typescript
// GET /api/analytics/cost/users?period=monthly&topN=10
router.get('/analytics/cost/users', async (req, res) => {
  const { period = 'monthly', topN = 10 } = req.query

  const results = await db.cost_records.aggregate([
    {
      $match: {
        created_at: { $gte: getStartDate(period) }
      }
    },
    {
      $group: {
        _id: '$user_id',
        total_cost: { $sum: '$total_cost' },
        operations_count: { $sum: 1 }
      }
    },
    {
      $sort: { total_cost: -1 }
    },
    {
      $limit: parseInt(topN)
    }
  ])

  res.json(results)
})

// 回應範例
[
  {
    "user_id": "user-123",
    "total_cost": 15.67,
    "operations_count": 234
  },
  {
    "user_id": "user-456",
    "total_cost": 12.34,
    "operations_count": 189
  }
]
```

### 2. 按服務成本統計

```typescript
// GET /api/analytics/cost/services?period=monthly
router.get('/analytics/cost/services', async (req, res) => {
  const { period = 'monthly' } = req.query

  const results = await db.cost_records.aggregate([
    {
      $match: {
        created_at: { $gte: getStartDate(period) }
      }
    },
    {
      $group: {
        _id: '$service',
        total_cost: { $sum: '$total_cost' },
        avg_duration: { $avg: '$duration' },
        operations_count: { $sum: 1 }
      }
    },
    {
      $sort: { total_cost: -1 }
    }
  ])

  res.json(results)
})

// 回應範例
[
  {
    "service": "openai",
    "total_cost": 45.67,
    "avg_duration": 1234,
    "operations_count": 567
  },
  {
    "service": "google_video_ai",
    "total_cost": 23.45,
    "avg_duration": 2500,
    "operations_count": 123
  }
]
```

### 3. 成本趨勢

```typescript
// GET /api/analytics/cost/trend?period=daily&days=30
router.get('/analytics/cost/trend', async (req, res) => {
  const { period = 'daily', days = 30 } = req.query

  const results = await db.cost_records.aggregate([
    {
      $match: {
        created_at: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
        },
        total_cost: { $sum: '$total_cost' },
        operations_count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])

  res.json(results)
})
```

### 4. Prompt 成本分析（重要！）

```typescript
// GET /api/analytics/cost/prompts?period=monthly
router.get('/analytics/cost/prompts', async (req, res) => {
  const results = await db.cost_records.aggregate([
    {
      $match: {
        service: 'openai',
        created_at: { $gte: getStartDate('monthly') }
      }
    },
    {
      $group: {
        _id: '$operation',  // "gpt-4_video_selection_segment_select"
        total_cost: { $sum: '$total_cost' },
        avg_cost: { $avg: '$total_cost' },
        avg_duration: { $avg: '$duration' },
        calls_count: { $sum: 1 }
      }
    },
    {
      $sort: { total_cost: -1 }
    }
  ])

  res.json(results)
})

// 回應範例 - 找出最貴的 Prompt！
[
  {
    "operation": "gpt-4_video_selection_segment_select",
    "total_cost": 12.34,
    "avg_cost": 0.05,
    "avg_duration": 2300,
    "calls_count": 247
  }
]
```

---

## 效能監控系統設計

### 瓶頸分析

```typescript
// GET /api/analytics/performance/bottleneck?taskType=video_generation
router.get('/analytics/performance/bottleneck', async (req, res) => {
  const { taskType } = req.query

  const results = await db.performance_records.aggregate([
    {
      $match: {
        task_type: taskType,
        created_at: { $gte: getStartDate('weekly') }
      }
    },
    {
      $group: {
        _id: '$step_name',
        avg_duration: { $avg: '$duration' },
        p95_duration: { $percentile: { input: '$duration', p: [0.95] } },
        max_duration: { $max: '$duration' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { avg_duration: -1 }
    }
  ])

  res.json(results)
})

// 回應範例 - 找出最慢的步驟！
[
  {
    "step_name": "render_video",
    "avg_duration": 45000,  // 45 秒
    "p95_duration": 78000,
    "max_duration": 120000,
    "count": 123
  },
  {
    "step_name": "ai_segment_select",
    "avg_duration": 15000,
    "p95_duration": 25000,
    "max_duration": 45000,
    "count": 456
  }
]
```

---

## 成本優化建議系統

基於追蹤的資料，自動產生優化建議：

```typescript
class CostOptimizationAdvisor {
  async generateRecommendations(): Promise<Recommendation[]> {
    const recommendations = []

    // 1. 檢查是否有特別貴的 Prompt
    const expensivePrompts = await this.findExpensivePrompts()
    if (expensivePrompts.length > 0) {
      recommendations.push({
        type: 'prompt_optimization',
        priority: 'high',
        message: `Prompt "${expensivePrompts[0].operation}" 平均成本 $${expensivePrompts[0].avg_cost}，建議優化以降低 token 數`,
        data: expensivePrompts[0]
      })
    }

    // 2. 檢查是否有用戶成本異常
    const highCostUsers = await this.findHighCostUsers()
    if (highCostUsers.length > 0) {
      recommendations.push({
        type: 'user_cost_alert',
        priority: 'medium',
        message: `用戶 ${highCostUsers[0].user_id} 本月成本 $${highCostUsers[0].total_cost}，超過平均值 3 倍`,
        data: highCostUsers[0]
      })
    }

    // 3. 檢查服務成本佔比
    const costByService = await this.getCostByService()
    const topService = costByService[0]
    if (topService.percentage > 60) {
      recommendations.push({
        type: 'service_dominance',
        priority: 'medium',
        message: `${topService.service} 佔總成本 ${topService.percentage}%，考慮是否有替代方案`,
        data: topService
      })
    }

    return recommendations
  }
}
```

---

## 完成檢查

- [x] 設計成本追蹤的埋點策略
- [x] 設計 cost_records 資料表
- [x] 設計 performance_records 資料表
- [x] 實作 CostTracker 服務
- [x] 設計成本分析 API
- [x] 設計效能監控 API
- [x] 設計成本優化建議系統

---

**下一步**：
- [ ] 設計管理後台（09-admin-system.md）
- [ ] 更新 02-key-flows.md（加入管理流程）
- [ ] 更新 04-module-breakdown.md（加入追蹤模組）
- [ ] 更新 05-data-flow.md（加入成本資料流）
