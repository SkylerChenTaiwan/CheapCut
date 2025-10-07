# Task 1.6: 成本與效能追蹤服務

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 1.6 |
| **Task 名稱** | 成本與效能追蹤服務 (Cost & Performance Tracker) |
| **所屬 Phase** | Phase 1: 基礎設施建立 |
| **預估時間** | 5-6 小時 (設計 1.5h + 實作 2.5h + 測試 1.5h + 整合 0.5h) |
| **難度** | ⭐⭐⭐ 中高 |
| **前置 Task** | Task 1.5 (Logger 服務實作), Task 1.1 (資料庫 Schema) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**成本或效能追蹤錯誤?** 按照這個順序處理:

1. **檢查錯誤訊息關鍵字**
   ```
   Error: Cannot read property 'cost' of undefined
   → AI 呼叫沒有記錄成本

   Error: Invalid number value
   → 成本值不是數字

   NaN in cost calculation
   → 計算公式錯誤

   Error: performance_records insert failed
   → 效能記錄寫入失敗,檢查資料表
   ```

2. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 檢查 API 定價

```bash
# 檢查各 API 最新定價
# OpenAI: https://openai.com/pricing
# Gemini: https://ai.google.dev/pricing
# Google Video AI: https://cloud.google.com/video-intelligence/pricing
```

**注意**: API 定價會變動,需要定期更新!

---

### Step 3: 上網搜尋

**好的搜尋方式**:
```
"OpenAI API pricing calculator" ← 尋找定價工具
"Gemini API cost tracking" ← 成本追蹤相關
"PostgreSQL aggregate functions" ← SQL 聚合查詢
"performance bottleneck analysis" ← 效能瓶頸分析
```

**推薦資源**:
- Overall Design 09: cost-performance-tracking.md (成本與效能追蹤設計)
- OpenAI Pricing: https://openai.com/pricing
- Gemini Pricing: https://ai.google.dev/pricing

---

## 🎯 功能描述

實作成本與效能追蹤服務,記錄所有 AI API 使用量並計算成本,同時追蹤每個步驟的執行時間與效能數據。

### 為什麼需要這個?

- 🎯 **問題 1**: 不知道每個功能花費多少成本,無法優化
- ✅ **解決**: 詳細追蹤每個 AI 呼叫的成本,找出花費最高的地方
- 🎯 **問題 2**: 不知道哪個步驟最慢,無法找出瓶頸
- ✅ **解決**: 記錄每個步驟的執行時間,產生效能分析報表
- 💡 **比喻**: 成本追蹤像記帳 app,效能追蹤像健康檢查,兩者都是優化系統的基礎

### 根據 Overall Design

**來源**: docs/overall-design/09-cost-performance-tracking.md

**成本追蹤目標**:
- 追蹤所有 AI API 使用量
- 計算每次呼叫的成本
- 聚合統計每日/每月成本
- 找出成本優化機會

**效能追蹤目標**:
- 記錄每個步驟的執行時間
- 找出系統瓶頸
- 產生效能分析報表
- 支援容量規劃決策

### 完成後你會有:

**成本追蹤**:
- ✅ CostTracker 服務 (src/services/cost-tracker.service.ts)
- ✅ AI API 定價配置
- ✅ 成本計算函數
- ✅ 成本報表 API

**效能追蹤 (新增)**:
- ✅ PerformanceTracker 服務 (src/services/performance-tracker.service.ts)
- ✅ 步驟執行時間記錄
- ✅ 效能瓶頸分析 API
- ✅ 效能報表與統計

---

## 📚 前置知識

### 1. AI API 定價模式

**不同 API 的計費方式**:

**OpenAI (按 token 計費)**:
```typescript
// GPT-4 Turbo
Input:  $0.01 / 1K tokens
Output: $0.03 / 1K tokens

// Whisper (STT)
$0.006 / 分鐘

// TTS
$15.00 / 1M characters
```

**Gemini (按 token 計費,有免費額度)**:
```typescript
// Gemini 1.5 Flash (免費層)
Input:  免費 (有限制)
Output: 免費 (有限制)

// Gemini 1.5 Pro (付費層)
Input:  $0.00125 / 1K tokens
Output: $0.005 / 1K tokens
```

**Google Video AI (按影片長度計費)**:
```typescript
// Label Detection
$0.10 / 分鐘

// Shot Change Detection
$0.05 / 分鐘
```

---

### 2. 效能追蹤指標

**追蹤的指標**:
- **執行時間 (duration)**: 每個步驟花費的時間 (毫秒)
- **成功率 (success rate)**: 成功 vs 失敗的比例
- **P50/P95/P99 延遲**: 不同百分位數的延遲分析
- **瓶頸步驟 (bottleneck)**: 找出最慢的步驟

**範例資料**:
```typescript
{
  task_type: "material_analysis",
  step_name: "call_video_ai",
  started_at: "2025-10-07T10:30:00Z",
  completed_at: "2025-10-07T10:30:15Z",
  duration: 15000,  // 15 秒
  success: true,
  metadata: {
    video_duration: 120,
    features: ["label-detection", "shot-change"]
  }
}
```

---

### 3. 成本與效能的關聯

**成本高通常伴隨效能問題**:
- AI API 呼叫慢 → 成本高 (計費時間長)
- 重複呼叫 API → 成本高 + 效能差
- 處理大檔案 → 成本高 + 時間長

**優化策略**:
1. 找出最慢的步驟 (效能追蹤)
2. 檢查該步驟的成本 (成本追蹤)
3. 同時優化效能與成本

---

## 🔗 前置依賴

### 必須先完成的 Task
- Task 1.1: 資料庫 Schema (需要 cost_records 和 performance_records 表)
- Task 1.5: Logger 服務 (成本與效能追蹤建立在 Logger 之上)

### 套件依賴
```json
{
  "dependencies": {
    "tiktoken": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### 環境檢查
```bash
# 檢查 cost_records 表是否存在
psql $DATABASE_URL -c "\dt cost_records"

# 檢查 performance_records 表是否存在
psql $DATABASE_URL -c "\dt performance_records"

# 安裝套件
npm install tiktoken
```

---

## 📝 實作步驟

### Part 1: 成本追蹤 (CostTracker)

#### Step 1: 定義 API 定價配置

建立 `src/config/api-pricing.ts`:

```typescript
/**
 * API 定價配置
 *
 * 注意: 定價會變動,需要定期更新!
 * 最後更新: 2025-10-07
 */

/**
 * OpenAI API 定價
 */
export const OpenAIPricing = {
  // GPT-4 Turbo
  'gpt-4-turbo': {
    input: 0.01 / 1000,   // $0.01 per 1K tokens
    output: 0.03 / 1000,  // $0.03 per 1K tokens
  },

  // GPT-3.5 Turbo
  'gpt-3.5-turbo': {
    input: 0.0005 / 1000,   // $0.0005 per 1K tokens
    output: 0.0015 / 1000,  // $0.0015 per 1K tokens
  },

  // Whisper (STT)
  'whisper-1': {
    perMinute: 0.006,  // $0.006 per minute
  },

  // TTS
  'tts-1': {
    perCharacter: 15.00 / 1000000,  // $15.00 per 1M characters
  },
  'tts-1-hd': {
    perCharacter: 30.00 / 1000000,  // $30.00 per 1M characters
  },
} as const

/**
 * Gemini API 定價
 */
export const GeminiPricing = {
  // Gemini 1.5 Flash (免費層有限制)
  'gemini-1.5-flash': {
    input: 0,   // 免費 (有每日限制)
    output: 0,  // 免費 (有每日限制)
  },

  // Gemini 1.5 Pro
  'gemini-1.5-pro': {
    input: 0.00125 / 1000,   // $0.00125 per 1K tokens
    output: 0.005 / 1000,    // $0.005 per 1K tokens
  },
} as const

/**
 * Google Video AI 定價
 */
export const GoogleVideoAIPricing = {
  'label-detection': {
    perMinute: 0.10,  // $0.10 per minute
  },
  'shot-change-detection': {
    perMinute: 0.05,  // $0.05 per minute
  },
  'explicit-content-detection': {
    perMinute: 0.10,  // $0.10 per minute
  },
} as const

/**
 * 取得 OpenAI 模型定價
 */
export function getOpenAIPricing(model: string) {
  return OpenAIPricing[model as keyof typeof OpenAIPricing]
}

/**
 * 取得 Gemini 模型定價
 */
export function getGeminiPricing(model: string) {
  return GeminiPricing[model as keyof typeof GeminiPricing]
}

/**
 * 取得 Google Video AI 功能定價
 */
export function getGoogleVideoAIPricing(feature: string) {
  return GoogleVideoAIPricing[feature as keyof typeof GoogleVideoAIPricing]
}
```

---

#### Step 2: 實作成本計算函數

建立 `src/services/cost-calculator.service.ts`:

```typescript
/**
 * 成本計算服務
 */

import {
  getOpenAIPricing,
  getGeminiPricing,
  getGoogleVideoAIPricing,
} from '../config/api-pricing'

/**
 * 計算 OpenAI API 成本
 *
 * @param model 模型名稱
 * @param usage Token 使用量 { prompt_tokens, completion_tokens }
 * @returns 成本 (美元)
 */
export function calculateOpenAICost(
  model: string,
  usage: {
    prompt_tokens: number
    completion_tokens: number
  }
): number {
  const pricing = getOpenAIPricing(model)

  if (!pricing) {
    console.warn(`[CostCalculator] Unknown OpenAI model: ${model}`)
    return 0
  }

  // GPT 模型
  if ('input' in pricing && 'output' in pricing) {
    const inputCost = usage.prompt_tokens * pricing.input
    const outputCost = usage.completion_tokens * pricing.output
    return inputCost + outputCost
  }

  return 0
}

/**
 * 計算 Whisper (STT) 成本
 *
 * @param durationSeconds 音檔長度 (秒)
 * @returns 成本 (美元)
 */
export function calculateWhisperCost(durationSeconds: number): number {
  const pricing = getOpenAIPricing('whisper-1')

  if (!pricing || !('perMinute' in pricing)) {
    return 0
  }

  const durationMinutes = durationSeconds / 60
  return durationMinutes * pricing.perMinute
}

/**
 * 計算 Gemini API 成本
 *
 * @param model 模型名稱
 * @param usage Token 使用量
 * @returns 成本 (美元)
 */
export function calculateGeminiCost(
  model: string,
  usage: {
    prompt_tokens: number
    completion_tokens: number
  }
): number {
  const pricing = getGeminiPricing(model)

  if (!pricing) {
    console.warn(`[CostCalculator] Unknown Gemini model: ${model}`)
    return 0
  }

  const inputCost = usage.prompt_tokens * pricing.input
  const outputCost = usage.completion_tokens * pricing.output
  return inputCost + outputCost
}

/**
 * 計算 Google Video AI 成本
 *
 * @param features 使用的功能列表
 * @param durationSeconds 影片長度 (秒)
 * @returns 成本 (美元)
 */
export function calculateGoogleVideoAICost(
  features: string[],
  durationSeconds: number
): number {
  const durationMinutes = durationSeconds / 60
  let totalCost = 0

  features.forEach(feature => {
    const pricing = getGoogleVideoAIPricing(feature)
    if (pricing && 'perMinute' in pricing) {
      totalCost += durationMinutes * pricing.perMinute
    }
  })

  return totalCost
}

/**
 * 格式化成本顯示
 *
 * @param cost 成本 (美元)
 * @returns 格式化字串
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`
}
```

---

#### Step 3: 實作 CostTracker 服務

建立 `src/services/cost-tracker.service.ts`:

```typescript
/**
 * 成本追蹤服務
 *
 * 記錄所有 AI API 使用量並計算成本
 */

import { db } from '../lib/db'
import {
  calculateOpenAICost,
  calculateWhisperCost,
  calculateGeminiCost,
  calculateGoogleVideoAICost,
} from './cost-calculator.service'

/**
 * API 成本記錄介面
 */
export interface CostRecordData {
  user_id?: string
  execution_id?: string
  service: string
  operation: string
  quantity: number
  unit: string
  unit_cost: number
  total_cost: number
  duration: number
  metadata?: Record<string, any>
}

/**
 * 成本追蹤服務類別
 */
export class CostTracker {
  /**
   * 記錄 OpenAI API 使用
   */
  async trackOpenAI(params: {
    userId?: string
    executionId?: string
    model: string
    usage: {
      prompt_tokens: number
      completion_tokens: number
    }
    duration: number
    metadata?: Record<string, any>
  }): Promise<void> {
    const cost = calculateOpenAICost(params.model, params.usage)
    const totalTokens = params.usage.prompt_tokens + params.usage.completion_tokens

    await this.recordCost({
      user_id: params.userId,
      execution_id: params.executionId,
      service: 'openai',
      operation: `${params.model}_chat`,
      quantity: totalTokens,
      unit: 'tokens',
      unit_cost: cost / totalTokens,
      total_cost: cost,
      duration: params.duration,
      metadata: {
        model: params.model,
        prompt_tokens: params.usage.prompt_tokens,
        completion_tokens: params.usage.completion_tokens,
        ...params.metadata,
      },
    })
  }

  /**
   * 記錄 Whisper (STT) 使用
   */
  async trackWhisper(params: {
    userId?: string
    executionId?: string
    durationSeconds: number
    callDuration: number
    metadata?: Record<string, any>
  }): Promise<void> {
    const cost = calculateWhisperCost(params.durationSeconds)

    await this.recordCost({
      user_id: params.userId,
      execution_id: params.executionId,
      service: 'openai',
      operation: 'whisper_stt',
      quantity: params.durationSeconds / 60,
      unit: 'minutes',
      unit_cost: 0.006,
      total_cost: cost,
      duration: params.callDuration,
      metadata: {
        audio_duration_seconds: params.durationSeconds,
        ...params.metadata,
      },
    })
  }

  /**
   * 記錄 Gemini API 使用
   */
  async trackGemini(params: {
    userId?: string
    executionId?: string
    model: string
    usage: {
      prompt_tokens: number
      completion_tokens: number
    }
    duration: number
    metadata?: Record<string, any>
  }): Promise<void> {
    const cost = calculateGeminiCost(params.model, params.usage)
    const totalTokens = params.usage.prompt_tokens + params.usage.completion_tokens

    await this.recordCost({
      user_id: params.userId,
      execution_id: params.executionId,
      service: 'gemini',
      operation: `${params.model}_generate`,
      quantity: totalTokens,
      unit: 'tokens',
      unit_cost: totalTokens > 0 ? cost / totalTokens : 0,
      total_cost: cost,
      duration: params.duration,
      metadata: {
        model: params.model,
        prompt_tokens: params.usage.prompt_tokens,
        completion_tokens: params.usage.completion_tokens,
        ...params.metadata,
      },
    })
  }

  /**
   * 記錄 Google Video AI 使用
   */
  async trackGoogleVideoAI(params: {
    userId?: string
    executionId?: string
    features: string[]
    durationSeconds: number
    callDuration: number
    metadata?: Record<string, any>
  }): Promise<void> {
    const cost = calculateGoogleVideoAICost(params.features, params.durationSeconds)

    await this.recordCost({
      user_id: params.userId,
      execution_id: params.executionId,
      service: 'google_video_ai',
      operation: 'analyze_video',
      quantity: params.durationSeconds / 60,
      unit: 'minutes',
      unit_cost: cost / (params.durationSeconds / 60),
      total_cost: cost,
      duration: params.callDuration,
      metadata: {
        features: params.features,
        video_duration_seconds: params.durationSeconds,
        ...params.metadata,
      },
    })
  }

  /**
   * 寫入成本記錄到資料庫
   */
  private async recordCost(record: CostRecordData): Promise<void> {
    try {
      await db.cost_records.create({
        data: {
          user_id: record.user_id,
          execution_id: record.execution_id,
          service: record.service,
          operation: record.operation,
          quantity: record.quantity,
          unit: record.unit,
          unit_cost: record.unit_cost,
          total_cost: record.total_cost,
          started_at: new Date(Date.now() - record.duration),
          duration: record.duration,
          metadata: record.metadata || {},
        },
      })

      console.log(
        `[CostTracker] Recorded: ${record.service} ${record.operation} = $${record.total_cost.toFixed(4)} (${record.duration}ms)`
      )
    } catch (error) {
      console.error('[CostTracker] Failed to record cost:', error)
    }
  }

  /**
   * 查詢用戶總成本
   */
  async getUserTotalCost(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const where: any = { user_id: userId }

    if (startDate || endDate) {
      where.created_at = {}
      if (startDate) where.created_at.gte = startDate
      if (endDate) where.created_at.lte = endDate
    }

    const result = await db.cost_records.aggregate({
      where,
      _sum: {
        total_cost: true,
      },
    })

    return result._sum.total_cost || 0
  }

  /**
   * 查詢服務成本統計
   */
  async getServiceCostBreakdown(
    startDate?: Date,
    endDate?: Date
  ): Promise<{ service: string; totalCost: number }[]> {
    const where: any = {}

    if (startDate || endDate) {
      where.created_at = {}
      if (startDate) where.created_at.gte = startDate
      if (endDate) where.created_at.lte = endDate
    }

    const results = await db.cost_records.groupBy({
      by: ['service'],
      where,
      _sum: {
        total_cost: true,
      },
    })

    return results.map(r => ({
      service: r.service,
      totalCost: r._sum.total_cost || 0,
    }))
  }
}

/**
 * 建立成本追蹤器單例
 */
let costTracker: CostTracker | null = null

export function getCostTracker(): CostTracker {
  if (!costTracker) {
    costTracker = new CostTracker()
  }
  return costTracker
}

export default getCostTracker
```

---

#### Step 4: 成本預算告警機制

根據 Overall Design (docs/overall-design/05-data-flow.md 第 1575 行) 的成本估算,建立預算告警系統。

**目標成本** (來自設計文件):
- 單支影片生成: NT$1.8 (約 $0.06 USD)

建立 `src/services/cost-budget-alert.service.ts`:

```typescript
/**
 * 成本預算告警服務
 *
 * 根據 Overall Design 的成本估算,監控實際成本是否超出預算
 * 參考: docs/overall-design/05-data-flow.md
 */

import { getLogger } from './logger.service'

/**
 * 成本預算配置
 *
 * 根據設計文件的成本估算設定
 */
const COST_BUDGETS = {
  video_generation: {
    target: 0.06,   // 目標: $0.06 USD/支 (Overall Design 估算值)
    warning: 0.10,  // 警告: $0.10 USD/支 (超出 67%)
    critical: 0.50, // 嚴重: $0.50 USD/支 (超出 733%)
  },
  material_analysis: {
    target: 0.01,   // 目標: $0.01 USD (素材分析)
    warning: 0.02,  // 警告: $0.02 USD
    critical: 0.05, // 嚴重: $0.05 USD
  },
  voiceover_processing: {
    target: 0.02,   // 目標: $0.02 USD (語音處理)
    warning: 0.04,  // 警告: $0.04 USD
    critical: 0.10, // 嚴重: $0.10 USD
  },
  script_generation: {
    target: 0.01,   // 目標: $0.01 USD (劇本生成)
    warning: 0.02,  // 警告: $0.02 USD
    critical: 0.05, // 嚴重: $0.05 USD
  },
} as const

type BudgetLevel = 'info' | 'warning' | 'critical'

/**
 * 成本預算告警服務
 */
export class CostBudgetAlert {
  private logger = getLogger()

  /**
   * 檢查成本是否超出預算
   *
   * @param executionId 任務執行 ID
   * @param taskType 任務類型
   * @param totalCost 實際總成本 (USD)
   * @returns 告警等級
   */
  async checkCostBudget(
    executionId: string,
    taskType: string,
    totalCost: number
  ): Promise<BudgetLevel> {
    const budget = COST_BUDGETS[taskType as keyof typeof COST_BUDGETS]

    if (!budget) {
      console.warn(`[CostBudgetAlert] Unknown task type: ${taskType}`)
      return 'info'
    }

    let level: BudgetLevel = 'info'

    // 判斷告警等級
    if (totalCost > budget.critical) {
      level = 'critical'
    } else if (totalCost > budget.warning) {
      level = 'warning'
    }

    // 記錄告警
    if (level !== 'info') {
      const overage = totalCost - budget.target
      const percentageOver = ((totalCost / budget.target) - 1) * 100

      await this.logger.log({
        level: level === 'critical' ? 'ERROR' : 'WARN',
        type: 'COST_ALERT',
        execution_id: executionId,
        data: {
          task_type: taskType,
          actual_cost: totalCost,
          target_cost: budget.target,
          threshold: level === 'critical' ? budget.critical : budget.warning,
          overage: overage,
          overage_percentage: percentageOver.toFixed(1) + '%',
          alert_level: level,
        },
      })

      // CRITICAL 等級發送通知
      if (level === 'critical') {
        await this.sendCriticalAlert({
          executionId,
          taskType,
          actualCost: totalCost,
          targetCost: budget.target,
          overage,
          percentageOver,
        })
      }
    } else {
      // 成本在預算內,記錄 INFO
      await this.logger.log({
        level: 'INFO',
        type: 'COST_OK',
        execution_id: executionId,
        data: {
          task_type: taskType,
          actual_cost: totalCost,
          target_cost: budget.target,
          within_budget: true,
        },
      })
    }

    return level
  }

  /**
   * 發送 Critical 等級告警
   */
  private async sendCriticalAlert(params: {
    executionId: string
    taskType: string
    actualCost: number
    targetCost: number
    overage: number
    percentageOver: number
  }): Promise<void> {
    console.error(`
╔════════════════════════════════════════════════════════════╗
║                    🚨 成本告警 (CRITICAL)                   ║
╠════════════════════════════════════════════════════════════╣
║ 任務類型: ${params.taskType.padEnd(43)} ║
║ 執行 ID:  ${params.executionId.padEnd(43)} ║
║ 實際成本: $${params.actualCost.toFixed(4).padEnd(42)} ║
║ 目標成本: $${params.targetCost.toFixed(4).padEnd(42)} ║
║ 超出金額: $${params.overage.toFixed(4).padEnd(42)} ║
║ 超出比例: ${params.percentageOver.toFixed(1)}%${('').padEnd(42 - params.percentageOver.toFixed(1).length - 1)} ║
╚════════════════════════════════════════════════════════════╝
    `)

    // TODO: 整合通知系統 (Email, Slack, etc.)
    // await notifyAdmin({
    //   subject: `成本告警: ${params.taskType} 超出預算 ${params.percentageOver.toFixed(1)}%`,
    //   message: `執行 ${params.executionId} 的實際成本 $${params.actualCost.toFixed(4)} 超出目標 $${params.targetCost.toFixed(4)}`,
    //   priority: 'high',
    // })
  }

  /**
   * 取得所有預算配置
   */
  getBudgets() {
    return COST_BUDGETS
  }

  /**
   * 取得特定任務的預算
   */
  getTaskBudget(taskType: string) {
    return COST_BUDGETS[taskType as keyof typeof COST_BUDGETS] || null
  }
}

/**
 * 建立成本預算告警服務單例
 */
let costBudgetAlert: CostBudgetAlert | null = null

export function getCostBudgetAlert(): CostBudgetAlert {
  if (!costBudgetAlert) {
    costBudgetAlert = new CostBudgetAlert()
  }
  return costBudgetAlert
}

export default getCostBudgetAlert
```

**整合到 CostTracker**:

修改 `src/services/cost-tracker.service.ts`,在記錄成本後自動檢查預算:

```typescript
import { getCostBudgetAlert } from './cost-budget-alert.service'

export class CostTracker {
  private costBudgetAlert = getCostBudgetAlert()

  /**
   * 檢查任務總成本並觸發告警 (新增)
   */
  async checkExecutionCost(
    executionId: string,
    taskType: string
  ): Promise<void> {
    // 計算該 execution_id 的總成本
    const result = await db.cost_records.aggregate({
      where: { execution_id: executionId },
      _sum: { total_cost: true },
    })

    const totalCost = result._sum.total_cost || 0

    // 檢查是否超出預算
    await this.costBudgetAlert.checkCostBudget(
      executionId,
      taskType,
      totalCost
    )
  }

  // ... 其他方法保持不變
}
```

**API 端點**:

在 `src/controllers/admin/analytics.controller.ts` 中加入預算查詢 API:

```typescript
/**
 * 查詢成本預算配置
 *
 * GET /api/admin/analytics/budgets
 */
export async function getBudgets(
  req: Request,
  res: Response
): Promise<void> {
  const costBudgetAlert = getCostBudgetAlert()
  const budgets = costBudgetAlert.getBudgets()

  res.json({
    budgets,
    note: '成本預算來自 Overall Design 估算值 (docs/overall-design/05-data-flow.md)',
  })
}

/**
 * 查詢任務的預算對比
 *
 * GET /api/admin/analytics/budget-comparison?taskType=video_generation&period=7d
 */
export async function getBudgetComparison(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { taskType, period = '7d' } = req.query

    if (!taskType) {
      res.status(400).json({ error: 'taskType is required' })
      return
    }

    const costBudgetAlert = getCostBudgetAlert()
    const budget = costBudgetAlert.getTaskBudget(taskType as string)

    if (!budget) {
      res.status(404).json({ error: 'Unknown task type' })
      return
    }

    // 計算時間範圍
    const days = period === '24h' ? 1 : parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 查詢該任務類型的實際成本
    const costRecords = await db.cost_records.findMany({
      where: {
        created_at: { gte: startDate },
        metadata: {
          path: ['task_type'],
          equals: taskType,
        },
      },
      select: {
        execution_id: true,
        total_cost: true,
        created_at: true,
      },
    })

    // 按 execution_id 分組計算
    const executionCosts = new Map<string, number>()
    costRecords.forEach(record => {
      const current = executionCosts.get(record.execution_id) || 0
      executionCosts.set(record.execution_id, current + record.total_cost)
    })

    // 統計
    const costs = Array.from(executionCosts.values())
    const avgCost = costs.length > 0
      ? costs.reduce((sum, c) => sum + c, 0) / costs.length
      : 0

    const overBudgetCount = costs.filter(c => c > budget.target).length
    const warningCount = costs.filter(c => c > budget.warning && c <= budget.critical).length
    const criticalCount = costs.filter(c => c > budget.critical).length

    res.json({
      taskType,
      period,
      budget: {
        target: budget.target,
        warning: budget.warning,
        critical: budget.critical,
      },
      actual: {
        totalExecutions: costs.length,
        avgCost,
        minCost: costs.length > 0 ? Math.min(...costs) : 0,
        maxCost: costs.length > 0 ? Math.max(...costs) : 0,
      },
      alerts: {
        overBudgetCount,
        warningCount,
        criticalCount,
        withinBudgetCount: costs.length - overBudgetCount,
      },
      compliance: {
        withinBudgetRate: costs.length > 0
          ? ((costs.length - overBudgetCount) / costs.length * 100).toFixed(1) + '%'
          : 'N/A',
      },
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch budget comparison',
      message: error.message,
    })
  }
}
```

---

### Part 2: 效能追蹤 (PerformanceTracker)

#### Step 5: 實作 PerformanceTracker 服務

建立 `src/services/performance-tracker.service.ts`:

```typescript
/**
 * 效能追蹤服務
 *
 * 記錄每個步驟的執行時間,用於效能分析和瓶頸診斷
 *
 * 參考: docs/overall-design/09-cost-performance-tracking.md
 */

import { db } from '../lib/db'

/**
 * 效能記錄介面
 */
export interface PerformanceRecordData {
  execution_id: string
  user_id?: string
  task_type: string
  step_name: string
  step_type?: string
  started_at: Date
  completed_at: Date
  duration: number
  success: boolean
  error_message?: string
  metadata?: Record<string, any>
}

/**
 * 效能統計結果
 */
export interface PerformanceStats {
  step_name: string
  count: number
  avg_duration: number
  p50_duration: number
  p95_duration: number
  p99_duration: number
  max_duration: number
  success_rate: number
}

/**
 * 效能追蹤服務類別
 */
export class PerformanceTracker {
  /**
   * 記錄步驟執行效能
   *
   * @param data 效能記錄資料
   */
  async record(data: PerformanceRecordData): Promise<void> {
    try {
      await db.performance_records.create({
        data: {
          execution_id: data.execution_id,
          user_id: data.user_id,
          task_type: data.task_type,
          step_name: data.step_name,
          step_type: data.step_type,
          started_at: data.started_at,
          completed_at: data.completed_at,
          duration: data.duration,
          success: data.success,
          error_message: data.error_message,
          metadata: data.metadata || {},
        },
      })

      const statusIcon = data.success ? '✓' : '✗'
      console.log(
        `[PerformanceTracker] ${statusIcon} ${data.step_name}: ${data.duration}ms`
      )
    } catch (error) {
      console.error('[PerformanceTracker] Failed to record performance:', error)
    }
  }

  /**
   * 查詢任務的效能瓶頸
   *
   * 找出平均執行時間最長的步驟
   *
   * @param taskType 任務類型
   * @param limit 回傳數量
   * @returns 瓶頸步驟列表
   */
  async getBottlenecks(
    taskType: string,
    limit: number = 10
  ): Promise<PerformanceStats[]> {
    // 使用 raw SQL 查詢效能統計
    const results = await db.$queryRaw<any[]>`
      SELECT
        step_name,
        COUNT(*) as count,
        AVG(duration) as avg_duration,
        MAX(duration) as max_duration,
        SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as success_rate
      FROM performance_records
      WHERE task_type = ${taskType}
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY step_name
      ORDER BY avg_duration DESC
      LIMIT ${limit}
    `

    return results.map(r => ({
      step_name: r.step_name,
      count: Number(r.count),
      avg_duration: Number(r.avg_duration),
      p50_duration: 0, // 需要額外查詢
      p95_duration: 0, // 需要額外查詢
      p99_duration: 0, // 需要額外查詢
      max_duration: Number(r.max_duration),
      success_rate: Number(r.success_rate),
    }))
  }

  /**
   * 查詢步驟的詳細效能統計
   *
   * @param taskType 任務類型
   * @param stepName 步驟名稱
   * @returns 效能統計
   */
  async getStepStats(
    taskType: string,
    stepName: string
  ): Promise<PerformanceStats | null> {
    const results = await db.$queryRaw<any[]>`
      SELECT
        step_name,
        COUNT(*) as count,
        AVG(duration) as avg_duration,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration) as p50_duration,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95_duration,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration) as p99_duration,
        MAX(duration) as max_duration,
        SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as success_rate
      FROM performance_records
      WHERE task_type = ${taskType}
        AND step_name = ${stepName}
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY step_name
    `

    if (results.length === 0) {
      return null
    }

    const r = results[0]
    return {
      step_name: r.step_name,
      count: Number(r.count),
      avg_duration: Number(r.avg_duration),
      p50_duration: Number(r.p50_duration),
      p95_duration: Number(r.p95_duration),
      p99_duration: Number(r.p99_duration),
      max_duration: Number(r.max_duration),
      success_rate: Number(r.success_rate),
    }
  }

  /**
   * 查詢任務執行的效能時間軸
   *
   * @param executionId 任務執行 ID
   * @returns 所有步驟的效能記錄
   */
  async getExecutionTimeline(executionId: string): Promise<
    {
      step_name: string
      started_at: Date
      duration: number
      success: boolean
    }[]
  > {
    const records = await db.performance_records.findMany({
      where: { execution_id: executionId },
      select: {
        step_name: true,
        started_at: true,
        duration: true,
        success: true,
      },
      orderBy: { started_at: 'asc' },
    })

    return records
  }

  /**
   * 查詢慢查詢 (超過閾值的執行)
   *
   * @param taskType 任務類型
   * @param thresholdMs 閾值 (毫秒)
   * @param limit 回傳數量
   * @returns 慢查詢列表
   */
  async getSlowExecutions(
    taskType: string,
    thresholdMs: number,
    limit: number = 20
  ): Promise<
    {
      execution_id: string
      step_name: string
      duration: number
      started_at: Date
    }[]
  > {
    const records = await db.performance_records.findMany({
      where: {
        task_type: taskType,
        duration: { gte: thresholdMs },
      },
      select: {
        execution_id: true,
        step_name: true,
        duration: true,
        started_at: true,
      },
      orderBy: { duration: 'desc' },
      take: limit,
    })

    return records
  }
}

/**
 * 建立效能追蹤器單例
 */
let performanceTracker: PerformanceTracker | null = null

export function getPerformanceTracker(): PerformanceTracker {
  if (!performanceTracker) {
    performanceTracker = new PerformanceTracker()
  }
  return performanceTracker
}

export default getPerformanceTracker
```

---

#### Step 6: 整合到 TaskLogger

修改 `src/services/task-logger.service.ts`,加入效能追蹤:

```typescript
import { getCostTracker } from './cost-tracker.service'
import { getPerformanceTracker } from './performance-tracker.service'

/**
 * 步驟 Logger (新增效能追蹤)
 */
export class StepLogger {
  private logger: Logger
  private costTracker: CostTracker
  private performanceTracker: PerformanceTracker
  private executionId: string
  private userId?: string
  private taskType: string
  private stepName: string
  private stepIndex: number
  private startTime: number
  private startDate: Date

  constructor(
    parentLogger: Logger,
    taskType: string,
    stepName: string,
    stepIndex: number
  ) {
    this.executionId = (parentLogger as any).context.execution_id
    this.userId = (parentLogger as any).context.user_id
    this.taskType = taskType
    this.stepName = stepName
    this.stepIndex = stepIndex
    this.startTime = Date.now()
    this.startDate = new Date()

    this.logger = parentLogger.child({ step_name: stepName, step_index: stepIndex })
    this.costTracker = getCostTracker()
    this.performanceTracker = getPerformanceTracker()
  }

  /**
   * 記錄步驟完成 (含效能追蹤)
   */
  async stepCompleted(result?: Record<string, any>): Promise<void> {
    const duration = Date.now() - this.startTime

    // 記錄 log
    await this.logger.info('step_completed', {
      step_name: this.stepName,
      step_index: this.stepIndex,
      duration_ms: duration,
      result_summary: result,
    })

    // 追蹤效能
    await this.performanceTracker.record({
      execution_id: this.executionId,
      user_id: this.userId,
      task_type: this.taskType,
      step_name: this.stepName,
      started_at: this.startDate,
      completed_at: new Date(),
      duration,
      success: true,
      metadata: result,
    })
  }

  /**
   * 記錄步驟失敗 (含效能追蹤)
   */
  async stepFailed(error: Error): Promise<void> {
    const duration = Date.now() - this.startTime

    // 記錄 log
    await this.logger.error('step_failed', {
      step_name: this.stepName,
      step_index: this.stepIndex,
      duration_ms: duration,
      error: error.message,
      stack: error.stack,
    })

    // 追蹤效能 (失敗也要記錄)
    await this.performanceTracker.record({
      execution_id: this.executionId,
      user_id: this.userId,
      task_type: this.taskType,
      step_name: this.stepName,
      started_at: this.startDate,
      completed_at: new Date(),
      duration,
      success: false,
      error_message: error.message,
    })
  }
}
```

---

#### Step 7: 實作效能分析 API

建立 `src/controllers/admin/performance.controller.ts`:

```typescript
/**
 * 效能分析 API Controller
 *
 * 參考: docs/overall-design/09-cost-performance-tracking.md
 */

import { Request, Response } from 'express'
import { getPerformanceTracker } from '../../services/performance-tracker.service'

/**
 * 查詢效能瓶頸
 *
 * GET /api/admin/performance/bottleneck?taskType=material_analysis
 */
export async function getBottleneck(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { taskType } = req.query

    if (!taskType) {
      res.status(400).json({ error: 'taskType is required' })
      return
    }

    const performanceTracker = getPerformanceTracker()
    const bottlenecks = await performanceTracker.getBottlenecks(
      taskType as string,
      10
    )

    res.json({
      taskType,
      bottlenecks,
      // 標記最慢的 3 個步驟
      criticalSteps: bottlenecks.slice(0, 3).map(b => ({
        step_name: b.step_name,
        avg_duration: b.avg_duration,
        impact: 'high',
      })),
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch bottleneck',
      message: error.message,
    })
  }
}

/**
 * 查詢步驟詳細統計
 *
 * GET /api/admin/performance/step?taskType=material_analysis&stepName=call_video_ai
 */
export async function getStepStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { taskType, stepName } = req.query

    if (!taskType || !stepName) {
      res.status(400).json({ error: 'taskType and stepName are required' })
      return
    }

    const performanceTracker = getPerformanceTracker()
    const stats = await performanceTracker.getStepStats(
      taskType as string,
      stepName as string
    )

    if (!stats) {
      res.status(404).json({ error: 'No data found' })
      return
    }

    res.json(stats)
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch step stats',
      message: error.message,
    })
  }
}

/**
 * 查詢任務執行時間軸
 *
 * GET /api/admin/performance/timeline/:executionId
 */
export async function getExecutionTimeline(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { executionId } = req.params

    const performanceTracker = getPerformanceTracker()
    const timeline = await performanceTracker.getExecutionTimeline(executionId)

    if (timeline.length === 0) {
      res.status(404).json({ error: 'Execution not found' })
      return
    }

    // 計算總時間
    const totalDuration = timeline.reduce((sum, step) => sum + step.duration, 0)

    res.json({
      executionId,
      totalDuration,
      stepCount: timeline.length,
      timeline: timeline.map(step => ({
        ...step,
        percentage: ((step.duration / totalDuration) * 100).toFixed(2) + '%',
      })),
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch execution timeline',
      message: error.message,
    })
  }
}

/**
 * 查詢慢查詢
 *
 * GET /api/admin/performance/slow?taskType=material_analysis&threshold=5000
 */
export async function getSlowExecutions(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { taskType, threshold = '5000' } = req.query

    if (!taskType) {
      res.status(400).json({ error: 'taskType is required' })
      return
    }

    const performanceTracker = getPerformanceTracker()
    const slowExecutions = await performanceTracker.getSlowExecutions(
      taskType as string,
      parseInt(threshold as string),
      20
    )

    res.json({
      taskType,
      threshold: parseInt(threshold as string),
      count: slowExecutions.length,
      executions: slowExecutions,
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch slow executions',
      message: error.message,
    })
  }
}
```

---

#### Step 8: 整合成本與效能分析 API

建立 `src/controllers/admin/analytics.controller.ts`:

```typescript
/**
 * 綜合分析 API Controller
 *
 * 整合成本與效能數據,提供優化建議
 */

import { Request, Response } from 'express'
import { getCostTracker } from '../../services/cost-tracker.service'
import { getPerformanceTracker } from '../../services/performance-tracker.service'

/**
 * 查詢任務的成本與效能概覽
 *
 * GET /api/admin/analytics/overview?taskType=material_analysis&period=7d
 */
export async function getTaskOverview(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { taskType, period = '7d' } = req.query

    if (!taskType) {
      res.status(400).json({ error: 'taskType is required' })
      return
    }

    const costTracker = getCostTracker()
    const performanceTracker = getPerformanceTracker()

    // 計算時間範圍
    const days = period === '24h' ? 1 : parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 查詢成本分布
    const costBreakdown = await costTracker.getServiceCostBreakdown(startDate)

    // 查詢效能瓶頸
    const bottlenecks = await performanceTracker.getBottlenecks(
      taskType as string,
      5
    )

    // 產生優化建議
    const recommendations = []

    // 建議 1: 成本最高的服務
    if (costBreakdown.length > 0) {
      const topCost = costBreakdown[0]
      recommendations.push({
        type: 'cost',
        priority: 'high',
        title: `${topCost.service} 成本佔比最高`,
        message: `${topCost.service} 佔總成本 ${((topCost.totalCost / costBreakdown.reduce((sum, c) => sum + c.totalCost, 0)) * 100).toFixed(1)}%,建議檢查是否有優化空間`,
        data: topCost,
      })
    }

    // 建議 2: 最慢的步驟
    if (bottlenecks.length > 0) {
      const slowest = bottlenecks[0]
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: `${slowest.step_name} 是效能瓶頸`,
        message: `平均執行時間 ${(slowest.avg_duration / 1000).toFixed(2)} 秒,建議優化此步驟`,
        data: slowest,
      })
    }

    res.json({
      taskType,
      period,
      costBreakdown,
      bottlenecks,
      recommendations,
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch task overview',
      message: error.message,
    })
  }
}
```

---

## ✅ 驗收標準

### Basic Verification (基礎驗證)

**測試檔案**: `tests/phase-1/task-1.6.basic.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  calculateOpenAICost,
  calculateWhisperCost,
} from '@/services/cost-calculator.service'

describe('Task 1.6 - Basic: Cost Calculator', () => {
  it('應該正確計算 OpenAI GPT-4 成本', () => {
    const cost = calculateOpenAICost('gpt-4-turbo', {
      prompt_tokens: 1000,
      completion_tokens: 500,
    })
    expect(cost).toBeCloseTo(0.025, 4)
  })

  it('應該正確計算 Whisper 成本', () => {
    const cost = calculateWhisperCost(60)
    expect(cost).toBeCloseTo(0.006, 4)
  })
})
```

---

### Functional Acceptance (功能驗收)

**測試檔案**: `tests/phase-1/task-1.6.functional.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getCostTracker } from '@/services/cost-tracker.service'
import { getPerformanceTracker } from '@/services/performance-tracker.service'
import { db } from '@/lib/db'

describe('Task 1.6 - Functional: Trackers', () => {
  let testExecutionId: string

  beforeAll(() => {
    testExecutionId = 'exec_test_' + Date.now()
  })

  afterAll(async () => {
    await db.cost_records.deleteMany({
      where: { execution_id: testExecutionId },
    })
    await db.performance_records.deleteMany({
      where: { execution_id: testExecutionId },
    })
  })

  it('應該能追蹤成本', async () => {
    const costTracker = getCostTracker()
    await costTracker.trackOpenAI({
      executionId: testExecutionId,
      model: 'gpt-4-turbo',
      usage: { prompt_tokens: 1000, completion_tokens: 500 },
      duration: 2000,
    })

    const records = await db.cost_records.findMany({
      where: { execution_id: testExecutionId },
    })

    expect(records.length).toBeGreaterThan(0)
  })

  it('應該能追蹤效能', async () => {
    const performanceTracker = getPerformanceTracker()
    await performanceTracker.record({
      execution_id: testExecutionId,
      task_type: 'test_task',
      step_name: 'test_step',
      started_at: new Date(Date.now() - 1000),
      completed_at: new Date(),
      duration: 1000,
      success: true,
    })

    const records = await db.performance_records.findMany({
      where: { execution_id: testExecutionId },
    })

    expect(records.length).toBeGreaterThan(0)
  })

  it('應該能查詢效能瓶頸', async () => {
    const performanceTracker = getPerformanceTracker()
    const bottlenecks = await performanceTracker.getBottlenecks('test_task')

    expect(Array.isArray(bottlenecks)).toBe(true)
  })

  it('應該能檢查成本預算並發出告警', async () => {
    const costBudgetAlert = getCostBudgetAlert()

    // 測試成本在預算內
    let level = await costBudgetAlert.checkCostBudget(
      testExecutionId,
      'video_generation',
      0.05  // $0.05 < target $0.06
    )
    expect(level).toBe('info')

    // 測試成本超出 warning
    level = await costBudgetAlert.checkCostBudget(
      testExecutionId + '_warn',
      'video_generation',
      0.15  // $0.15 > warning $0.10
    )
    expect(level).toBe('warning')

    // 測試成本超出 critical
    level = await costBudgetAlert.checkCostBudget(
      testExecutionId + '_critical',
      'video_generation',
      0.60  // $0.60 > critical $0.50
    )
    expect(level).toBe('critical')
  })
})
```

---

### E2E Acceptance (端對端驗收)

**測試檔案**: `tests/phase-1/task-1.6.e2e.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '@/app'

describe('Task 1.6 - E2E: Analytics API', () => {
  it('應該能查詢效能瓶頸', async () => {
    const response = await request(app)
      .get('/api/admin/performance/bottleneck?taskType=material_analysis')
      .expect(200)

    expect(response.body.bottlenecks).toBeDefined()
    expect(Array.isArray(response.body.bottlenecks)).toBe(true)
  })

  it('應該能查詢任務概覽', async () => {
    const response = await request(app)
      .get('/api/admin/analytics/overview?taskType=material_analysis&period=7d')
      .expect(200)

    expect(response.body.costBreakdown).toBeDefined()
    expect(response.body.bottlenecks).toBeDefined()
    expect(response.body.recommendations).toBeDefined()
  })

  it('應該能查詢成本預算配置', async () => {
    const response = await request(app)
      .get('/api/admin/analytics/budgets')
      .expect(200)

    expect(response.body.budgets).toBeDefined()
    expect(response.body.budgets.video_generation).toBeDefined()
    expect(response.body.budgets.video_generation.target).toBe(0.06)
  })

  it('應該能查詢預算對比', async () => {
    const response = await request(app)
      .get('/api/admin/analytics/budget-comparison?taskType=video_generation&period=7d')
      .expect(200)

    expect(response.body.budget).toBeDefined()
    expect(response.body.actual).toBeDefined()
    expect(response.body.alerts).toBeDefined()
    expect(response.body.compliance).toBeDefined()
  })
})
```

---

## 📋 完成檢查清單

### 實作檢查

**成本追蹤**:
- [ ] API 定價配置 (`src/config/api-pricing.ts`)
- [ ] 成本計算服務 (`src/services/cost-calculator.service.ts`)
- [ ] CostTracker 服務 (`src/services/cost-tracker.service.ts`)
- [ ] 成本預算告警服務 (`src/services/cost-budget-alert.service.ts`)

**效能追蹤**:
- [ ] PerformanceTracker 服務 (`src/services/performance-tracker.service.ts`)
- [ ] 整合到 TaskLogger (StepLogger)
- [ ] 效能分析 API (`src/controllers/admin/performance.controller.ts`)

**綜合分析**:
- [ ] 綜合分析 API (`src/controllers/admin/analytics.controller.ts`)
- [ ] 成本預算查詢 API (getBudgets, getBudgetComparison)

### 測試檔案
- [ ] `tests/phase-1/task-1.6.basic.test.ts` 已建立
- [ ] `tests/phase-1/task-1.6.functional.test.ts` 已建立
- [ ] `tests/phase-1/task-1.6.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過 (含成本預算告警測試)
- [ ] E2E 測試全部通過 (含預算 API 測試)

### 成本預算告警功能驗收
- [ ] 成本預算閾值已根據 Overall Design 設定
- [ ] 成本超出 warning 閾值會記錄 WARN log
- [ ] 成本超出 critical 閾值會記錄 ERROR log 並顯示告警
- [ ] 可透過 API 查詢預算配置
- [ ] 可透過 API 查看成本 vs 預算對比
- [ ] Dashboard 能顯示預算遵守率 (compliance rate)

---

## ❓ 常見問題與解決方案

### Q1: 效能記錄缺失

**原因**: StepLogger 未呼叫效能追蹤方法

**解決方案**:
1. 確保使用 `stepCompleted()` 或 `stepFailed()`
2. 檢查 PerformanceTracker 是否初始化
3. 查看 console 是否有錯誤訊息

---

### Q2: 效能查詢很慢

**原因**: performance_records 表缺少索引

**解決方案**:
```sql
-- 檢查索引
\di performance_records

-- 建立索引 (應該已在 Task 1.1 建立)
CREATE INDEX idx_performance_records_task_type
  ON performance_records(task_type, created_at DESC);
```

---

### Q3: 瓶頸分析不準確

**原因**: 資料量太少或時間範圍不對

**解決方案**:
1. 確保有足夠的資料 (至少 100+ 筆記錄)
2. 調整時間範圍 (預設 7 天)
3. 檢查 task_type 是否正確

---

### Q4: 成本告警沒有觸發

**原因**: 未呼叫 `CostTracker.checkExecutionCost()`

**解決方案**:
```typescript
// 在任務完成後檢查總成本
const costTracker = getCostTracker()
await costTracker.checkExecutionCost(executionId, 'video_generation')
```

確保在每個任務執行結束時呼叫此方法。

---

### Q5: 預算閾值需要調整

**原因**: API 定價變動或實際成本與估算不符

**解決方案**:
1. 修改 `src/services/cost-budget-alert.service.ts` 中的 `COST_BUDGETS`
2. 參考最新的 API 定價
3. 根據實際執行數據調整閾值
4. 重新部署服務

```typescript
const COST_BUDGETS = {
  video_generation: {
    target: 0.08,   // 調整目標值
    warning: 0.12,  // 調整警告值
    critical: 0.50,
  },
  // ...
}
```

---

### Q6: 如何查看預算遵守率

**原因**: 需要監控成本是否在預算內

**解決方案**:
```bash
# 使用 API 查詢預算對比
curl "http://localhost:3000/api/admin/analytics/budget-comparison?taskType=video_generation&period=7d"

# 查看回傳的 compliance.withinBudgetRate
{
  "compliance": {
    "withinBudgetRate": "85.2%"  // 85.2% 的任務在預算內
  }
}
```

---

## ✨ Task 完成確認

完成這個 Task 後,你應該能夠:

✅ 追蹤所有 AI API 使用量與成本
✅ 計算每次呼叫的精確成本
✅ 監控成本是否超出預算並發出告警
✅ 對比實際成本與 Overall Design 的估算值
✅ 記錄每個步驟的執行時間
✅ 找出效能瓶頸與慢查詢
✅ 查詢成本與效能統計
✅ 產生優化建議

**下一步**: Phase 2 - 核心引擎實作

---

**文件版本**: 2.1
**狀態**: ✅ 已完成 (新增成本預算告警機制)
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
**變更記錄**:
- v2.1: 新增成本預算告警機制,對比 Overall Design 估算值 (2025-10-07)
- v2.0: 整合 PerformanceTracker (2025-10-07)
