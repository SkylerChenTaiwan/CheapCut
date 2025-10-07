# Task 1.6: 成本追蹤服務

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 1.6 |
| **Task 名稱** | 成本追蹤服務 |
| **所屬 Phase** | Phase 1: 基礎設施建立 |
| **預估時間** | 3-4 小時 (設計 1h + 實作 1.5h + 測試 1h + 整合 0.5h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 1.5 (Logger 服務實作) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**成本計算錯誤?** 按照這個順序處理:

1. **檢查錯誤訊息關鍵字**
   ```
   Error: Cannot read property 'cost' of undefined
   → AI 呼叫沒有記錄成本

   Error: Invalid number value
   → 成本值不是數字

   NaN in cost calculation
   → 計算公式錯誤
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
```

**推薦資源**:
- Overall Design 08: logging-monitoring.md (成本追蹤設計)
- OpenAI Pricing: https://openai.com/pricing
- Gemini Pricing: https://ai.google.dev/pricing

---

## 🎯 功能描述

實作成本追蹤服務,記錄所有 AI API 使用量並計算成本。

### 為什麼需要這個?

- 🎯 **問題**: 不知道每個功能花費多少成本,無法優化
- ✅ **解決**: 詳細追蹤每個 AI 呼叫的成本,找出花費最高的地方
- 💡 **比喻**: 就像記帳 app,記錄每筆開支,月底才知道錢花去哪裡

### 根據 Overall Design

**成本優化目標**:
- 追蹤所有 AI API 使用量
- 計算每次呼叫的成本
- 聚合統計每日/每月成本
- 找出成本優化機會

### 完成後你會有:

- ✅ CostTracker 服務 (src/services/cost-tracker.service.ts)
- ✅ AI API 定價配置
- ✅ 成本計算函數
- ✅ 成本報表 API
- ✅ 成本統計與分析

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

### 2. Token 計算

**什麼是 Token**:
- 文字的最小單位,約 4 個字元 = 1 token
- 中文: 約 1.5-2 字 = 1 token
- 英文: 約 0.75 字 = 1 token

**範例**:
```typescript
"Hello World" → 約 2 tokens
"你好世界" → 約 4 tokens
"大家好,今天要介紹我們的新產品" → 約 15 tokens
```

**如何計算**:
- OpenAI 提供 tiktoken 函式庫
- Gemini API 回應會包含 token 數

---

### 3. 成本聚合

**追蹤維度**:
```typescript
// 按用戶統計
SELECT user_id, SUM(cost) FROM api_costs GROUP BY user_id

// 按服務統計
SELECT service, SUM(cost) FROM api_costs GROUP BY service

// 按日期統計
SELECT DATE(created_at), SUM(cost) FROM api_costs GROUP BY DATE(created_at)

// 按任務類型統計
SELECT task_type, SUM(cost) FROM api_costs GROUP BY task_type
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- Task 1.1: 資料庫 Schema (需要 api_costs 表)
- Task 1.5: Logger 服務 (成本追蹤建立在 Logger 之上)

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
# 檢查 api_costs 表是否存在
psql $DATABASE_URL -c "\dt api_costs"

# 安裝套件
npm install tiktoken
```

---

## 📝 實作步驟

### Step 1: 定義 API 定價配置

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

### Step 2: 實作成本計算函數

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
 * 計算 TTS 成本
 *
 * @param model TTS 模型
 * @param characterCount 字元數
 * @returns 成本 (美元)
 */
export function calculateTTSCost(
  model: string,
  characterCount: number
): number {
  const pricing = getOpenAIPricing(model)

  if (!pricing || !('perCharacter' in pricing)) {
    return 0
  }

  return characterCount * pricing.perCharacter
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

### Step 3: 實作成本追蹤服務

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
  calculateTTSCost,
  calculateGeminiCost,
  calculateGoogleVideoAICost,
} from './cost-calculator.service'

/**
 * API 成本記錄介面
 */
export interface APICostRecord {
  user_id?: string
  execution_id?: string
  service: string
  operation: string
  model?: string
  usage: Record<string, any>
  cost: number
  metadata?: Record<string, any>
}

/**
 * 成本追蹤服務類別
 */
export class CostTracker {
  /**
   * 記錄 OpenAI API 使用
   *
   * @param params 參數
   */
  async trackOpenAI(params: {
    userId?: string
    executionId?: string
    model: string
    usage: {
      prompt_tokens: number
      completion_tokens: number
    }
    metadata?: Record<string, any>
  }): Promise<void> {
    const cost = calculateOpenAICost(params.model, params.usage)

    await this.recordCost({
      user_id: params.userId,
      execution_id: params.executionId,
      service: 'openai',
      operation: 'chat',
      model: params.model,
      usage: params.usage,
      cost,
      metadata: params.metadata,
    })
  }

  /**
   * 記錄 Whisper (STT) 使用
   *
   * @param params 參數
   */
  async trackWhisper(params: {
    userId?: string
    executionId?: string
    durationSeconds: number
    metadata?: Record<string, any>
  }): Promise<void> {
    const cost = calculateWhisperCost(params.durationSeconds)

    await this.recordCost({
      user_id: params.userId,
      execution_id: params.executionId,
      service: 'openai',
      operation: 'whisper',
      model: 'whisper-1',
      usage: { duration_seconds: params.durationSeconds },
      cost,
      metadata: params.metadata,
    })
  }

  /**
   * 記錄 TTS 使用
   *
   * @param params 參數
   */
  async trackTTS(params: {
    userId?: string
    executionId?: string
    model: string
    characterCount: number
    metadata?: Record<string, any>
  }): Promise<void> {
    const cost = calculateTTSCost(params.model, params.characterCount)

    await this.recordCost({
      user_id: params.userId,
      execution_id: params.executionId,
      service: 'openai',
      operation: 'tts',
      model: params.model,
      usage: { character_count: params.characterCount },
      cost,
      metadata: params.metadata,
    })
  }

  /**
   * 記錄 Gemini API 使用
   *
   * @param params 參數
   */
  async trackGemini(params: {
    userId?: string
    executionId?: string
    model: string
    usage: {
      prompt_tokens: number
      completion_tokens: number
    }
    metadata?: Record<string, any>
  }): Promise<void> {
    const cost = calculateGeminiCost(params.model, params.usage)

    await this.recordCost({
      user_id: params.userId,
      execution_id: params.executionId,
      service: 'gemini',
      operation: 'generate',
      model: params.model,
      usage: params.usage,
      cost,
      metadata: params.metadata,
    })
  }

  /**
   * 記錄 Google Video AI 使用
   *
   * @param params 參數
   */
  async trackGoogleVideoAI(params: {
    userId?: string
    executionId?: string
    features: string[]
    durationSeconds: number
    metadata?: Record<string, any>
  }): Promise<void> {
    const cost = calculateGoogleVideoAICost(
      params.features,
      params.durationSeconds
    )

    await this.recordCost({
      user_id: params.userId,
      execution_id: params.executionId,
      service: 'google_video_ai',
      operation: 'analyze',
      usage: {
        features: params.features,
        duration_seconds: params.durationSeconds,
      },
      cost,
      metadata: params.metadata,
    })
  }

  /**
   * 寫入成本記錄到資料庫
   *
   * @param record 成本記錄
   */
  private async recordCost(record: APICostRecord): Promise<void> {
    try {
      await db.api_costs.create({
        data: {
          user_id: record.user_id,
          execution_id: record.execution_id,
          service: record.service,
          operation: record.operation,
          model: record.model,
          usage: record.usage,
          cost: record.cost,
          metadata: record.metadata || {},
        },
      })

      console.log(
        `[CostTracker] Recorded: ${record.service} ${record.operation} = $${record.cost.toFixed(4)}`
      )
    } catch (error) {
      console.error('[CostTracker] Failed to record cost:', error)
    }
  }

  /**
   * 查詢用戶總成本
   *
   * @param userId 用戶 ID
   * @param startDate 開始日期 (可選)
   * @param endDate 結束日期 (可選)
   * @returns 總成本
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

    const result = await db.api_costs.aggregate({
      where,
      _sum: {
        cost: true,
      },
    })

    return result._sum.cost || 0
  }

  /**
   * 查詢服務成本統計
   *
   * @param startDate 開始日期
   * @param endDate 結束日期
   * @returns 各服務成本
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

    const results = await db.api_costs.groupBy({
      by: ['service'],
      where,
      _sum: {
        cost: true,
      },
    })

    return results.map(r => ({
      service: r.service,
      totalCost: r._sum.cost || 0,
    }))
  }

  /**
   * 查詢每日成本
   *
   * @param days 查詢天數
   * @returns 每日成本陣列
   */
  async getDailyCosts(days: number = 30): Promise<
    {
      date: string
      totalCost: number
    }[]
  > {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 使用 raw SQL 查詢 (因為需要 DATE 函數)
    const results = await db.$queryRaw<
      { date: Date; total_cost: number }[]
    >`
      SELECT
        DATE(created_at) as date,
        SUM(cost) as total_cost
      FROM api_costs
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    return results.map(r => ({
      date: r.date.toISOString().split('T')[0],
      totalCost: Number(r.total_cost),
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

### Step 4: 整合到 AILogger

修改 `src/services/task-logger.service.ts`,在 AILogger 中自動追蹤成本:

```typescript
/**
 * AI 呼叫 Logger (新增成本追蹤)
 */
export class AILogger {
  private logger: Logger
  private costTracker: CostTracker
  private callId: string
  private service: string
  private operation: string
  private startTime: number
  private userId?: string
  private executionId?: string

  constructor(parentLogger: Logger, service: string, operation: string) {
    this.callId = uuid()
    this.service = service
    this.operation = operation
    this.startTime = Date.now()
    this.costTracker = getCostTracker()

    // 從 parent logger 取得 context
    const context = (parentLogger as any).context
    this.userId = context.user_id
    this.executionId = context.execution_id

    this.logger = parentLogger.child({ call_id: this.callId })
  }

  /**
   * 記錄 OpenAI 呼叫完成 (含成本追蹤)
   */
  async callCompletedOpenAI(
    model: string,
    usage: {
      prompt_tokens: number
      completion_tokens: number
    },
    resultSummary?: Record<string, any>
  ): Promise<void> {
    // 計算成本
    const cost = calculateOpenAICost(model, usage)

    // 記錄 log
    await this.logger.info('ai_call_completed', {
      call_id: this.callId,
      service: this.service,
      operation: this.operation,
      model,
      duration_ms: Date.now() - this.startTime,
      usage,
      cost,
      result_summary: resultSummary,
    }, {
      service: this.service,
      operation: this.operation,
    })

    // 追蹤成本
    await this.costTracker.trackOpenAI({
      userId: this.userId,
      executionId: this.executionId,
      model,
      usage,
    })
  }

  /**
   * 記錄 Whisper 呼叫完成 (含成本追蹤)
   */
  async callCompletedWhisper(
    durationSeconds: number,
    resultSummary?: Record<string, any>
  ): Promise<void> {
    const cost = calculateWhisperCost(durationSeconds)

    await this.logger.info('ai_call_completed', {
      call_id: this.callId,
      service: 'openai',
      operation: 'whisper',
      duration_ms: Date.now() - this.startTime,
      usage: { duration_seconds: durationSeconds },
      cost,
      result_summary: resultSummary,
    }, {
      service: 'openai',
      operation: 'whisper',
    })

    await this.costTracker.trackWhisper({
      userId: this.userId,
      executionId: this.executionId,
      durationSeconds,
    })
  }

  // ... 其他服務的 callCompleted 方法
}
```

---

### Step 5: 實作成本報表 API

建立 `src/controllers/admin/costs.controller.ts`:

```typescript
/**
 * 成本報表 API Controller
 */

import { Request, Response } from 'express'
import { getCostTracker } from '../../services/cost-tracker.service'
import { formatCost } from '../../services/cost-calculator.service'

/**
 * 查詢用戶總成本
 *
 * GET /api/admin/costs/user/:userId?period=7d
 */
export async function getUserCost(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { userId } = req.params
    const { period = '7d' } = req.query

    // 計算時間範圍
    const days = period === '24h' ? 1 : parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const costTracker = getCostTracker()
    const totalCost = await costTracker.getUserTotalCost(userId, startDate)

    res.json({
      userId,
      period,
      totalCost,
      formattedCost: formatCost(totalCost),
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch user cost',
      message: error.message,
    })
  }
}

/**
 * 查詢服務成本分布
 *
 * GET /api/admin/costs/breakdown?period=7d
 */
export async function getCostBreakdown(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { period = '7d' } = req.query

    const days = period === '24h' ? 1 : parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const costTracker = getCostTracker()
    const breakdown = await costTracker.getServiceCostBreakdown(startDate)

    // 計算總成本
    const totalCost = breakdown.reduce((sum, item) => sum + item.totalCost, 0)

    // 計算百分比
    const breakdownWithPercentage = breakdown.map(item => ({
      ...item,
      percentage: totalCost > 0 ? (item.totalCost / totalCost) * 100 : 0,
      formattedCost: formatCost(item.totalCost),
    }))

    res.json({
      period,
      totalCost,
      formattedTotalCost: formatCost(totalCost),
      breakdown: breakdownWithPercentage,
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch cost breakdown',
      message: error.message,
    })
  }
}

/**
 * 查詢每日成本趨勢
 *
 * GET /api/admin/costs/daily?days=30
 */
export async function getDailyCosts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { days = 30 } = req.query

    const costTracker = getCostTracker()
    const dailyCosts = await costTracker.getDailyCosts(Number(days))

    res.json({
      days: Number(days),
      data: dailyCosts.map(item => ({
        date: item.date,
        totalCost: item.totalCost,
        formattedCost: formatCost(item.totalCost),
      })),
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch daily costs',
      message: error.message,
    })
  }
}
```

---

## ✅ 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證成本計算功能

**測試檔案**: `tests/phase-1/task-1.6.basic.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  calculateOpenAICost,
  calculateWhisperCost,
  calculateGeminiCost,
} from '@/services/cost-calculator.service'

describe('Task 1.6 - Basic: Cost Calculator', () => {
  it('應該正確計算 OpenAI GPT-4 成本', () => {
    const cost = calculateOpenAICost('gpt-4-turbo', {
      prompt_tokens: 1000,
      completion_tokens: 500,
    })

    // Input: 1000 * $0.01/1K = $0.01
    // Output: 500 * $0.03/1K = $0.015
    // Total: $0.025
    expect(cost).toBeCloseTo(0.025, 4)
  })

  it('應該正確計算 Whisper 成本', () => {
    // 60 秒 = 1 分鐘
    const cost = calculateWhisperCost(60)

    // 1 分鐘 * $0.006 = $0.006
    expect(cost).toBeCloseTo(0.006, 4)
  })

  it('應該正確計算 Gemini 成本', () => {
    const cost = calculateGeminiCost('gemini-1.5-pro', {
      prompt_tokens: 1000,
      completion_tokens: 500,
    })

    // Input: 1000 * $0.00125/1K = $0.00125
    // Output: 500 * $0.005/1K = $0.0025
    // Total: $0.00375
    expect(cost).toBeCloseTo(0.00375, 5)
  })

  it('免費模型應該回傳 0 成本', () => {
    const cost = calculateGeminiCost('gemini-1.5-flash', {
      prompt_tokens: 1000,
      completion_tokens: 500,
    })

    expect(cost).toBe(0)
  })
})
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.6.basic.test.ts
```

**通過標準**:
- ✅ 各種 API 成本計算正確
- ✅ 免費模型回傳 0 成本
- ✅ 計算精度正確 (小數點 4-5 位)

---

### Functional Acceptance (功能驗收)

**目標**: 驗證成本追蹤服務

**測試檔案**: `tests/phase-1/task-1.6.functional.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getCostTracker } from '@/services/cost-tracker.service'
import { db } from '@/lib/db'

describe('Task 1.6 - Functional: Cost Tracker', () => {
  let testUserId: string
  let testExecutionId: string

  beforeAll(() => {
    testUserId = 'user_test_' + Date.now()
    testExecutionId = 'exec_test_' + Date.now()
  })

  afterAll(async () => {
    // 清理測試資料
    await db.api_costs.deleteMany({
      where: { user_id: testUserId },
    })
  })

  it('應該能追蹤 OpenAI 使用', async () => {
    const costTracker = getCostTracker()

    await costTracker.trackOpenAI({
      userId: testUserId,
      executionId: testExecutionId,
      model: 'gpt-4-turbo',
      usage: {
        prompt_tokens: 1000,
        completion_tokens: 500,
      },
    })

    // 查詢記錄
    const records = await db.api_costs.findMany({
      where: {
        user_id: testUserId,
        service: 'openai',
      },
    })

    expect(records).toHaveLength(1)
    expect(records[0].cost).toBeCloseTo(0.025, 4)
  })

  it('應該能查詢用戶總成本', async () => {
    const costTracker = getCostTracker()

    // 新增多筆記錄
    await costTracker.trackOpenAI({
      userId: testUserId,
      model: 'gpt-4-turbo',
      usage: { prompt_tokens: 1000, completion_tokens: 500 },
    })

    await costTracker.trackWhisper({
      userId: testUserId,
      durationSeconds: 60,
    })

    // 查詢總成本
    const totalCost = await costTracker.getUserTotalCost(testUserId)

    // 應該包含兩筆記錄的成本
    expect(totalCost).toBeGreaterThan(0)
  })

  it('應該能查詢服務成本分布', async () => {
    const costTracker = getCostTracker()

    const breakdown = await costTracker.getServiceCostBreakdown()

    expect(Array.isArray(breakdown)).toBe(true)
    expect(breakdown.length).toBeGreaterThan(0)
    expect(breakdown[0]).toHaveProperty('service')
    expect(breakdown[0]).toHaveProperty('totalCost')
  })
})
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.6.functional.test.ts
```

**通過標準**:
- ✅ 成本記錄正確寫入資料庫
- ✅ 用戶總成本查詢正確
- ✅ 服務成本分布查詢正確

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證成本報表 API

**測試檔案**: `tests/phase-1/task-1.6.e2e.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '@/app'
import { getCostTracker } from '@/services/cost-tracker.service'
import { db } from '@/lib/db'

describe('Task 1.6 - E2E: Cost Reports API', () => {
  let testUserId: string

  beforeAll(async () => {
    testUserId = 'user_test_' + Date.now()

    // 建立測試資料
    const costTracker = getCostTracker()
    await costTracker.trackOpenAI({
      userId: testUserId,
      model: 'gpt-4-turbo',
      usage: { prompt_tokens: 1000, completion_tokens: 500 },
    })
  })

  afterAll(async () => {
    await db.api_costs.deleteMany({
      where: { user_id: testUserId },
    })
  })

  it('應該能查詢用戶成本', async () => {
    const response = await request(app)
      .get(`/api/admin/costs/user/${testUserId}?period=7d`)
      .expect(200)

    expect(response.body.userId).toBe(testUserId)
    expect(response.body.totalCost).toBeGreaterThan(0)
    expect(response.body.formattedCost).toMatch(/^\$/)
  })

  it('應該能查詢成本分布', async () => {
    const response = await request(app)
      .get('/api/admin/costs/breakdown?period=7d')
      .expect(200)

    expect(response.body.breakdown).toBeDefined()
    expect(Array.isArray(response.body.breakdown)).toBe(true)
  })

  it('應該能查詢每日成本', async () => {
    const response = await request(app)
      .get('/api/admin/costs/daily?days=7')
      .expect(200)

    expect(response.body.data).toBeDefined()
    expect(Array.isArray(response.body.data)).toBe(true)
  })
})
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.6.e2e.test.ts
```

**通過標準**:
- ✅ 成本報表 API 正常運作
- ✅ 回應格式正確
- ✅ 數據計算準確

---

## 📋 完成檢查清單

### 實作檢查
- [ ] API 定價配置 (`src/config/api-pricing.ts`)
- [ ] 成本計算服務 (`src/services/cost-calculator.service.ts`)
- [ ] 成本追蹤服務 (`src/services/cost-tracker.service.ts`)
- [ ] AILogger 整合成本追蹤
- [ ] 成本報表 API (`src/controllers/admin/costs.controller.ts`)
- [ ] api_costs 表已建立 (Task 1.1)

### 測試檔案
- [ ] `tests/phase-1/task-1.6.basic.test.ts` 已建立
- [ ] `tests/phase-1/task-1.6.functional.test.ts` 已建立
- [ ] `tests/phase-1/task-1.6.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

### 程式碼品質
- [ ] 所有函數都有 JSDoc 註解
- [ ] 成本計算準確
- [ ] 符合 TypeScript 型別安全
- [ ] 遵循專案程式碼風格

---

## ❓ 常見問題與解決方案

### Q1: 成本計算不準確

**原因**: API 定價過時或計算公式錯誤

**解決方案**:
1. 檢查 API 最新定價:
   - OpenAI: https://openai.com/pricing
   - Gemini: https://ai.google.dev/pricing
2. 更新 `src/config/api-pricing.ts`
3. 驗證計算公式

---

### Q2: 成本記錄缺失

**原因**: AILogger 未呼叫成本追蹤方法

**解決方案**:
1. 確保使用 `callCompletedOpenAI` 而非 `callCompleted`
2. 檢查是否有 try-catch 吞掉錯誤
3. 查看 console 是否有錯誤訊息

---

### Q3: 查詢成本很慢

**原因**: 缺少索引或資料量太大

**解決方案**:
1. 確認索引已建立:
   ```sql
   CREATE INDEX idx_api_costs_user_id ON api_costs(user_id);
   CREATE INDEX idx_api_costs_created_at ON api_costs(created_at);
   ```
2. 定期清理舊資料 (保留 90 天即可)
3. 使用時間範圍限制查詢

---

### Q4: Token 計算不準

**原因**: 不同模型的 tokenizer 不同

**解決方案**:
1. 使用 API 回傳的 usage 資料 (最準確)
2. 如需估算,使用官方 tokenizer:
   - OpenAI: `tiktoken`
   - Gemini: 內建 `countTokens` API

---

### Q5: 免費額度追蹤

**原因**: 免費模型成本為 0,無法追蹤使用量

**解決方案**:
1. 在 metadata 記錄使用量:
   ```typescript
   await costTracker.trackGemini({
     model: 'gemini-1.5-flash',
     usage: { prompt_tokens: 1000, completion_tokens: 500 },
     metadata: { is_free_tier: true },
   })
   ```
2. 查詢時加上免費使用量統計

---

## ✨ Task 完成確認

完成這個 Task 後,你應該能夠:

✅ 追蹤所有 AI API 使用量與成本
✅ 計算每次呼叫的精確成本
✅ 查詢用戶、服務、日期的成本統計
✅ 產生成本報表與趨勢分析
✅ 找出成本優化機會

**下一步**: Phase 2 - 核心引擎實作

---

**文件版本**: 1.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
