# Task 1.5: Logger 服務實作

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 1.5 |
| **Task 名稱** | Logger 服務實作 |
| **所屬 Phase** | Phase 1: 基礎設施建立 |
| **預估時間** | 4-5 小時 (設計 1h + 實作 2h + 測試 1h + 整合 1h) |
| **難度** | ⭐⭐⭐ 中高 |
| **前置 Task** | Task 1.1 (資料庫 Schema) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**Log 無法寫入資料庫?** 按照這個順序處理:

1. **檢查錯誤訊息關鍵字**
   ```
   Error: relation "system_logs" does not exist
   → 資料表未建立,檢查 Migration

   Error: column "execution_id" does not exist
   → Schema 與程式碼不一致

   Error: invalid input syntax for type json
   → JSON 格式錯誤
   ```

2. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 檢查資料庫

```bash
# 連接資料庫
psql $DATABASE_URL

# 檢查 system_logs 表是否存在
\dt system_logs

# 查看表結構
\d system_logs

# 查看最近的 log
SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 10;
```

---

### Step 3: 上網搜尋

**好的搜尋方式**:
```
"PostgreSQL JSONB insert error" ← 包含具體錯誤
"Node.js structured logging best practices" ← 設計模式
"TypeScript logger interface design" ← 型別定義
```

**推薦資源**:
- Overall Design 08: logging-monitoring.md (本專案設計)
- PostgreSQL JSONB: https://www.postgresql.org/docs/current/datatype-json.html
- Pino (高效能 logger): https://github.com/pinojs/pino

---

## 🎯 功能描述

實作統一的 Logger 服務,記錄所有系統事件並支援結構化查詢。

### 為什麼需要這個?

- 🎯 **問題**: 系統出錯時不知道哪裡壞了,無法追蹤問題根源
- ✅ **解決**: 詳細記錄所有步驟與錯誤,快速定位問題
- 💡 **比喻**: Logger 就像飛機的黑盒子,記錄所有發生的事,出問題時可以回放

### 根據 Overall Design (08-logging-monitoring.md)

**核心設計哲學**: **Fail Fast, Log Everything Needed**

- ❌ 不要過度 fallback - 錯誤發生時立即停止
- ✅ 詳細的錯誤上下文 - 記錄足夠資訊來重現問題
- ✅ 明確的失敗點 - 精準定位哪個步驟壞了
- ✅ 可追溯的執行路徑 - 從頭到尾看得到發生什麼事

### 完成後你會有:

- ✅ Logger 類別 (src/services/logger.service.ts)
- ✅ system_logs 資料表設計
- ✅ 統一的 Log 格式 (JSON 結構化)
- ✅ Log 查詢 API
- ✅ 完整的錯誤追蹤機制

---

## 📚 前置知識

### 1. 結構化 Logging

**是什麼**: 以結構化格式 (JSON) 記錄 log,而非純文字

**傳統 Logging (不好)**:
```typescript
console.log('User user_123 uploaded video video_001 at 2025-10-07')
```

**結構化 Logging (好)**:
```typescript
logger.info('video_uploaded', {
  userId: 'user_123',
  videoId: 'video_001',
  timestamp: '2025-10-07T10:23:45Z'
})
```

**為什麼結構化好**:
- ✅ 可以查詢特定欄位 (例如: 找出 user_123 的所有 log)
- ✅ 可以聚合統計 (例如: 今天上傳了幾個影片)
- ✅ 可以建立索引加速查詢
- ❌ 純文字 log 只能用正則表達式,很難查詢

---

### 2. Log 層級

**Log 層級定義**:
```typescript
DEBUG: 開發時的詳細資訊 (正式環境不記錄)
INFO:  一般資訊 (任務開始、完成)
WARN:  警告 (可能有問題,但不影響運作)
ERROR: 錯誤 (功能無法運作)
```

**何時使用**:
```typescript
// DEBUG: 變數值、中間結果
logger.debug('ai_response_received', { response: data })

// INFO: 正常流程
logger.info('task_started', { taskId: 'exec_001' })

// WARN: 異常但可處理
logger.warn('cache_miss', { key: 'user_123' })

// ERROR: 錯誤
logger.error('task_failed', { error: 'API timeout' })
```

---

### 3. Log Context (上下文)

**是什麼**: 將相關的 log 串連起來

**範例**:
```typescript
// 建立帶有 execution_id 的 logger
const logger = new Logger({ execution_id: 'exec_001' })

// 所有 log 都會自動包含 execution_id
logger.info('step_1_started', {})  // ← 自動加上 execution_id
logger.info('step_2_started', {})  // ← 自動加上 execution_id

// 查詢時可以用 execution_id 找出所有相關 log
SELECT * FROM system_logs WHERE execution_id = 'exec_001'
```

---

### 4. Log 資料表設計

**system_logs 表結構** (已在 Task 1.1 定義):

```sql
CREATE TABLE system_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL,  -- DEBUG, INFO, WARN, ERROR
  type TEXT NOT NULL,   -- task_started, ai_call_failed 等

  -- 關聯資訊 (用於串連 log)
  execution_id TEXT,
  request_id TEXT,
  user_id TEXT,
  call_id TEXT,

  -- Log 內容 (JSONB 可儲存任意結構)
  data JSONB NOT NULL,

  -- 索引欄位 (加速查詢)
  service TEXT,
  operation TEXT,
  step_name TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_system_logs_execution_id ON system_logs(execution_id);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_type ON system_logs(type);
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- Task 1.1: 資料庫 Schema (需要 system_logs 表)

### 套件依賴
```json
{
  "dependencies": {
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.0"
  }
}
```

### 環境檢查
```bash
# 檢查 system_logs 表是否存在
psql $DATABASE_URL -c "\dt system_logs"

# 安裝套件
npm install uuid
```

---

## 📝 實作步驟

### Step 1: 定義 Log 型別與介面

建立 `src/types/logger.types.ts`:

```typescript
/**
 * Logger 相關型別定義
 */

/**
 * Log 層級
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

/**
 * Log 類型
 */
export type LogType =
  // HTTP 請求
  | 'http_request'

  // 任務執行
  | 'task_started'
  | 'task_step_started'
  | 'task_step_completed'
  | 'task_completed'
  | 'task_failed'

  // AI 呼叫
  | 'ai_call_started'
  | 'ai_call_completed'
  | 'ai_call_failed'
  | 'ai_response_validation_failed'

  // 資料庫操作
  | 'db_operation'
  | 'db_operation_failed'
  | 'db_operation_empty_result'

  // 檔案操作
  | 'file_operation_failed'

  // 影片處理
  | 'ffmpeg_execution_failed'

  // 資料流驗證
  | 'data_flow_validation_failed'

/**
 * Log Context (用於串連 log)
 */
export interface LogContext {
  execution_id?: string  // 任務執行 ID
  request_id?: string    // HTTP 請求 ID
  user_id?: string       // 用戶 ID
  call_id?: string       // AI 呼叫 ID
}

/**
 * Log Entry (寫入資料庫的結構)
 */
export interface LogEntry {
  log_id: string
  timestamp: Date
  level: LogLevel
  type: LogType

  // Context
  execution_id?: string
  request_id?: string
  user_id?: string
  call_id?: string

  // Log 資料
  data: Record<string, any>

  // 索引欄位
  service?: string
  operation?: string
  step_name?: string

  created_at: Date
}

/**
 * Logger 選項
 */
export interface LoggerOptions {
  service?: string
  operation?: string
  step_name?: string
}
```

---

### Step 2: 實作 Logger 服務

建立 `src/services/logger.service.ts`:

```typescript
/**
 * Logger 服務
 *
 * 提供統一的 logging 介面,記錄所有系統事件
 */

import { v4 as uuid } from 'uuid'
import { db } from '../lib/db'
import type {
  LogLevel,
  LogType,
  LogContext,
  LogEntry,
  LoggerOptions,
} from '../types/logger.types'

/**
 * Logger 類別
 */
export class Logger {
  private context: LogContext

  constructor(context: LogContext = {}) {
    this.context = context
  }

  /**
   * 建立 child logger (繼承 context)
   *
   * @param additionalContext 額外的 context
   * @returns 新的 Logger 實例
   */
  child(additionalContext: Partial<LogContext>): Logger {
    return new Logger({ ...this.context, ...additionalContext })
  }

  /**
   * 記錄 log
   *
   * @param level Log 層級
   * @param type Log 類型
   * @param data Log 資料
   * @param options 選項 (service, operation, step_name)
   */
  async log(
    level: LogLevel,
    type: LogType,
    data: Record<string, any>,
    options?: LoggerOptions
  ): Promise<void> {
    const logEntry: LogEntry = {
      log_id: uuid(),
      timestamp: new Date(),
      level,
      type,
      ...this.context,
      ...options,
      data,
      created_at: new Date(),
    }

    try {
      // 寫入資料庫
      await db.system_logs.create({
        data: logEntry,
      })

      // 開發環境同時輸出到 console
      if (process.env.NODE_ENV !== 'production') {
        this.consoleLog(logEntry)
      }

      // ERROR 級別立即告警
      if (level === 'ERROR') {
        await this.alertError(logEntry)
      }
    } catch (error) {
      // Log 寫入失敗時,至少輸出到 console
      console.error('[Logger] Failed to write log:', error)
      console.error('[Logger] Original log:', logEntry)
    }
  }

  /**
   * 快捷方法: INFO
   */
  async info(
    type: LogType,
    data: Record<string, any>,
    options?: LoggerOptions
  ): Promise<void> {
    return this.log('INFO', type, data, options)
  }

  /**
   * 快捷方法: WARN
   */
  async warn(
    type: LogType,
    data: Record<string, any>,
    options?: LoggerOptions
  ): Promise<void> {
    return this.log('WARN', type, data, options)
  }

  /**
   * 快捷方法: ERROR
   */
  async error(
    type: LogType,
    data: Record<string, any>,
    options?: LoggerOptions
  ): Promise<void> {
    return this.log('ERROR', type, data, options)
  }

  /**
   * 快捷方法: DEBUG
   */
  async debug(
    type: LogType,
    data: Record<string, any>,
    options?: LoggerOptions
  ): Promise<void> {
    // 正式環境不記錄 DEBUG
    if (process.env.NODE_ENV === 'production') {
      return
    }
    return this.log('DEBUG', type, data, options)
  }

  /**
   * 輸出到 console (開發環境)
   *
   * @param logEntry Log 項目
   */
  private consoleLog(logEntry: LogEntry): void {
    const color = this.getConsoleColor(logEntry.level)
    const prefix = `[${logEntry.level}] ${logEntry.type}`

    console.log(color, prefix, '\x1b[0m', JSON.stringify(logEntry, null, 2))
  }

  /**
   * 取得 console 顏色
   *
   * @param level Log 層級
   * @returns ANSI 顏色代碼
   */
  private getConsoleColor(level: LogLevel): string {
    switch (level) {
      case 'DEBUG':
        return '\x1b[36m'  // Cyan
      case 'INFO':
        return '\x1b[32m'  // Green
      case 'WARN':
        return '\x1b[33m'  // Yellow
      case 'ERROR':
        return '\x1b[31m'  // Red
      default:
        return '\x1b[0m'   // Reset
    }
  }

  /**
   * 錯誤告警
   *
   * TODO: 整合 Slack、Email 等告警系統
   *
   * @param logEntry Log 項目
   */
  private async alertError(logEntry: LogEntry): Promise<void> {
    // 目前只輸出到 console
    console.error('[ERROR ALERT]', logEntry)

    // 未來可以整合:
    // - Slack webhook
    // - Email notification
    // - PagerDuty
  }
}

/**
 * 建立預設 logger
 */
export function createLogger(context?: LogContext): Logger {
  return new Logger(context)
}

export default Logger
```

---

### Step 3: 實作 HTTP 請求 Logger Middleware

建立 `src/middleware/logger.middleware.ts`:

```typescript
/**
 * HTTP 請求 Logger Middleware
 *
 * 自動記錄所有 HTTP 請求
 */

import { Request, Response, NextFunction } from 'express'
import { v4 as uuid } from 'uuid'
import { createLogger } from '../services/logger.service'

/**
 * HTTP Logger Middleware
 */
export function httpLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = uuid()
  const startTime = Date.now()

  // 將 request_id 加到 request 物件
  ;(req as any).requestId = requestId

  // 建立 logger 並附加到 request
  ;(req as any).logger = createLogger({
    request_id: requestId,
    user_id: (req as any).user?.id,  // 如果有認證
  })

  // 記錄請求開始
  ;(req as any).logger.info('http_request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    user_agent: req.get('user-agent'),
  })

  // 監聽 response finish 事件
  res.on('finish', async () => {
    const duration = Date.now() - startTime

    await (req as any).logger.info('http_request_completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
    })
  })

  next()
}
```

---

### Step 4: 實作任務執行 Logger

建立 `src/services/task-logger.service.ts`:

```typescript
/**
 * 任務執行 Logger
 *
 * 專門用於記錄背景任務的執行過程
 */

import { v4 as uuid } from 'uuid'
import { Logger } from './logger.service'

/**
 * 任務 Logger 類別
 */
export class TaskLogger {
  private logger: Logger
  private executionId: string
  private taskType: string
  private startTime: number

  constructor(taskType: string, userId?: string) {
    this.executionId = uuid()
    this.taskType = taskType
    this.startTime = Date.now()

    this.logger = new Logger({
      execution_id: this.executionId,
      user_id: userId,
    })
  }

  /**
   * 取得 execution ID
   */
  getExecutionId(): string {
    return this.executionId
  }

  /**
   * 取得 logger
   */
  getLogger(): Logger {
    return this.logger
  }

  /**
   * 記錄任務開始
   *
   * @param input 任務輸入資料
   * @param steps 任務步驟清單
   */
  async taskStarted(
    input: Record<string, any>,
    steps: string[]
  ): Promise<void> {
    await this.logger.info('task_started', {
      task_type: this.taskType,
      execution_id: this.executionId,
      input,
      steps,
    })
  }

  /**
   * 記錄步驟開始
   *
   * @param stepIndex 步驟索引
   * @param stepName 步驟名稱
   */
  async stepStarted(stepIndex: number, stepName: string): Promise<void> {
    await this.logger.info('task_step_started', {
      step_index: stepIndex,
      step_name: stepName,
    }, {
      step_name: stepName,
    })
  }

  /**
   * 記錄步驟完成
   *
   * @param stepIndex 步驟索引
   * @param stepName 步驟名稱
   * @param resultSummary 結果摘要
   */
  async stepCompleted(
    stepIndex: number,
    stepName: string,
    resultSummary?: Record<string, any>
  ): Promise<void> {
    await this.logger.info('task_step_completed', {
      step_index: stepIndex,
      step_name: stepName,
      duration_ms: Date.now() - this.startTime,
      result_summary: resultSummary,
    }, {
      step_name: stepName,
    })
  }

  /**
   * 記錄任務完成
   *
   * @param resultSummary 結果摘要
   * @param totalCost 總成本
   */
  async taskCompleted(
    resultSummary: Record<string, any>,
    totalCost?: number
  ): Promise<void> {
    await this.logger.info('task_completed', {
      task_type: this.taskType,
      execution_id: this.executionId,
      duration_ms: Date.now() - this.startTime,
      total_cost: totalCost,
      result_summary: resultSummary,
    })
  }

  /**
   * 記錄任務失敗
   *
   * @param failedStep 失敗的步驟名稱
   * @param error 錯誤物件
   * @param context 額外的上下文資訊
   */
  async taskFailed(
    failedStep: string,
    error: Error,
    context?: Record<string, any>
  ): Promise<void> {
    await this.logger.error('task_failed', {
      task_type: this.taskType,
      execution_id: this.executionId,
      failed_step: failedStep,
      error_type: error.constructor.name,
      error_message: error.message,
      stack_trace: error.stack,
      context,
    }, {
      step_name: failedStep,
    })
  }

  /**
   * 建立 AI 呼叫 logger
   *
   * @param service AI 服務名稱 (例如: 'openai', 'google_video_ai')
   * @param operation 操作名稱 (例如: 'video_analysis', 'stt')
   * @returns AI Logger
   */
  createAILogger(service: string, operation: string): AILogger {
    return new AILogger(this.logger, service, operation)
  }
}

/**
 * AI 呼叫 Logger
 */
export class AILogger {
  private logger: Logger
  private callId: string
  private service: string
  private operation: string
  private startTime: number

  constructor(parentLogger: Logger, service: string, operation: string) {
    this.callId = uuid()
    this.service = service
    this.operation = operation
    this.startTime = Date.now()

    this.logger = parentLogger.child({ call_id: this.callId })
  }

  /**
   * 記錄 AI 呼叫開始
   *
   * @param input 輸入資料
   */
  async callStarted(input: Record<string, any>): Promise<void> {
    await this.logger.info('ai_call_started', {
      call_id: this.callId,
      service: this.service,
      operation: this.operation,
      input,
    }, {
      service: this.service,
      operation: this.operation,
    })
  }

  /**
   * 記錄 AI 呼叫完成
   *
   * @param resultSummary 結果摘要
   * @param cost 成本
   */
  async callCompleted(
    resultSummary: Record<string, any>,
    cost?: number
  ): Promise<void> {
    await this.logger.info('ai_call_completed', {
      call_id: this.callId,
      service: this.service,
      operation: this.operation,
      duration_ms: Date.now() - this.startTime,
      cost,
      result_summary: resultSummary,
    }, {
      service: this.service,
      operation: this.operation,
    })
  }

  /**
   * 記錄 AI 呼叫失敗
   *
   * @param error 錯誤物件
   * @param requestPayload 請求 payload (用於重現問題)
   */
  async callFailed(
    error: Error,
    requestPayload?: Record<string, any>
  ): Promise<void> {
    await this.logger.error('ai_call_failed', {
      call_id: this.callId,
      service: this.service,
      operation: this.operation,
      duration_ms: Date.now() - this.startTime,
      error_type: error.constructor.name,
      error_message: error.message,
      error_details: (error as any).details || {},
      request_payload: requestPayload,
    }, {
      service: this.service,
      operation: this.operation,
    })
  }
}

/**
 * 建立任務 logger
 */
export function createTaskLogger(
  taskType: string,
  userId?: string
): TaskLogger {
  return new TaskLogger(taskType, userId)
}

export default TaskLogger
```

---

### Step 5: 實作 Log 查詢 API

建立 `src/controllers/admin/logs.controller.ts`:

```typescript
/**
 * Log 查詢 API Controller
 */

import { Request, Response } from 'express'
import { db } from '../../lib/db'

/**
 * 查詢任務的所有 log
 *
 * GET /api/admin/logs/execution/:executionId
 */
export async function getExecutionLogs(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { executionId } = req.params

    // 查詢所有 log
    const logs = await db.system_logs.findMany({
      where: { execution_id: executionId },
      orderBy: { timestamp: 'asc' },
    })

    if (logs.length === 0) {
      res.status(404).json({
        error: 'Execution not found',
        executionId,
      })
      return
    }

    // 分析 log
    const taskStarted = logs.find(log => log.type === 'task_started')
    const taskCompleted = logs.find(log => log.type === 'task_completed')
    const taskFailed = logs.find(log => log.type === 'task_failed')
    const errorLogs = logs.filter(log => log.level === 'ERROR')

    const summary = {
      totalLogs: logs.length,
      errorLogs: errorLogs.length,
      status: taskCompleted ? 'completed' : taskFailed ? 'failed' : 'processing',
      taskType: taskStarted?.data.task_type,
      duration: taskCompleted?.data.duration_ms || taskFailed?.data.duration_ms,
      failedAt: taskFailed?.data.failed_step,
    }

    res.json({
      executionId,
      summary,
      logs,
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch logs',
      message: error.message,
    })
  }
}

/**
 * 查詢所有失敗任務
 *
 * GET /api/admin/logs/failures?period=7d&userId=xxx
 */
export async function getFailedTasks(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { period = '7d', userId } = req.query

    // 計算時間範圍
    const hours = period === '24h' ? 24 : parseInt(period as string) * 24
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    // 查詢條件
    const where: any = {
      type: 'task_failed',
      timestamp: { gte: since },
    }

    if (userId) {
      where.user_id = userId
    }

    // 查詢失敗任務
    const failures = await db.system_logs.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      select: {
        execution_id: true,
        user_id: true,
        timestamp: true,
        data: true,
      },
    })

    // 格式化回應
    const formattedFailures = failures.map(f => ({
      executionId: f.execution_id,
      userId: f.user_id,
      taskType: f.data.task_type,
      failedStep: f.data.failed_step,
      errorMessage: f.data.error_message,
      timestamp: f.timestamp,
    }))

    res.json({
      total: failures.length,
      period,
      failures: formattedFailures,
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch failures',
      message: error.message,
    })
  }
}

/**
 * 查詢 AI 服務失敗率
 *
 * GET /api/admin/logs/failure-rate?service=openai&period=7d
 */
export async function getServiceFailureRate(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { service, period = '7d' } = req.query

    if (!service) {
      res.status(400).json({ error: 'Missing service parameter' })
      return
    }

    // 計算時間範圍
    const hours = period === '24h' ? 24 : parseInt(period as string) * 24
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    // 查詢成功與失敗次數
    const [successCount, failureCount] = await Promise.all([
      db.system_logs.count({
        where: {
          type: 'ai_call_completed',
          service: service as string,
          timestamp: { gte: since },
        },
      }),
      db.system_logs.count({
        where: {
          type: 'ai_call_failed',
          service: service as string,
          timestamp: { gte: since },
        },
      }),
    ])

    const totalCalls = successCount + failureCount
    const failureRate = totalCalls > 0 ? failureCount / totalCalls : 0

    // 查詢錯誤類型分布
    const failedLogs = await db.system_logs.findMany({
      where: {
        type: 'ai_call_failed',
        service: service as string,
        timestamp: { gte: since },
      },
      select: { data: true },
    })

    const errorTypes: Record<string, number> = {}
    failedLogs.forEach(log => {
      const errorType = log.data.error_type || 'Unknown'
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1
    })

    res.json({
      service,
      period,
      totalCalls,
      successCount,
      failureCount,
      failureRate: Math.round(failureRate * 10000) / 100,  // 百分比
      errorTypes,
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to calculate failure rate',
      message: error.message,
    })
  }
}
```

---

### Step 6: API 回傳 execution_id

**重要**: 所有啟動背景任務的 API **必須回傳 `executionId`** 給前端!

**範例 API 實作**:

```typescript
/**
 * POST /api/videos/generate
 *
 * 啟動影片生成任務
 */
router.post('/videos/generate', authenticate, async (req, res) => {
  try {
    const userId = req.user.id
    const { scriptText } = req.body

    // 建立 TaskLogger (會產生 execution_id)
    const taskLogger = createTaskLogger('video_generation', userId)
    const executionId = taskLogger.getExecutionId()  // ← 取得 execution_id

    await taskLogger.taskStarted(
      { scriptText },
      ['stt', 'segmentation', 'ai_selection', 'timeline', 'composition']
    )

    // 非同步處理 (避免 HTTP 超時)
    processVideoGeneration(taskLogger, scriptText).catch(err => {
      console.error('Background task failed:', err)
    })

    // ✅ 回傳 execution_id 給前端
    res.json({
      success: true,
      executionId,  // ← 重點在這!
      message: 'Video generation started'
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

**前端使用方式**:

```typescript
// 發起請求
const response = await fetch('/api/videos/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scriptText: '...' })
})

const { executionId } = await response.json()

// ✅ 顯示在 Console (方便使用者複製)
console.log(`🔍 任務已啟動`)
console.log(`📋 Execution ID: ${executionId}`)
console.log(`💡 如有問題,請提供此 ID 給 AI 診斷`)

// 可選: 顯示在 UI 上
setTaskInfo({ executionId, status: 'processing' })
```

**診斷使用**:

當使用者遇到問題時:
1. 從 Console 複製 `execution_id`
2. 提供給 AI: "我的任務失敗了,execution_id 是 exec_xxx"
3. AI 自動查詢: `curl http://localhost:8080/api/admin/logs/execution/exec_xxx`
4. AI 分析 log 並提供修復建議

---

### Step 7: 實作資料驗證框架

建立 `src/services/validators/schemas.ts`:

```typescript
/**
 * 資料驗證 Schema 定義
 *
 * 根據 Overall Design 08-logging-monitoring.md 的資料流驗證需求
 */

import Joi from 'joi'

/**
 * 所有驗證 Schema
 */
export const SCHEMAS = {
  // ==================== AI 回應 Schema ====================

  /**
   * 語意分析結果 (Task 2.6)
   */
  semantic_analysis: Joi.object({
    topics: Joi.array().items(Joi.string()).min(1).required(),
    keywords: Joi.array().items(Joi.string()).min(1).max(20).required(),
    tone: Joi.string().valid('professional', 'casual', 'enthusiastic').required()
  }),

  /**
   * 配音切分結果 (Task 2.7)
   */
  voiceover_split: Joi.object({
    segments: Joi.array().items(
      Joi.object({
        start: Joi.number().min(0).required(),
        end: Joi.number().min(0).required(),
        text: Joi.string().required(),
        keywords: Joi.array().items(Joi.string()).required()
      })
    ).min(1).required()
  }),

  /**
   * AI 選片結果 (Task 2.9)
   */
  segment_selection: Joi.object({
    selectedSegmentId: Joi.string().required(),
    trimStart: Joi.number().min(0).required(),
    trimEnd: Joi.number().min(0).required(),
    reason: Joi.string().optional()
  }),

  /**
   * 時間軸 JSON (Task 2.10)
   */
  timeline: Joi.object({
    timeline_id: Joi.string().required(),
    voiceover_url: Joi.string().uri().required(),
    total_duration: Joi.number().min(0).required(),
    segments: Joi.array().items(
      Joi.object({
        index: Joi.number().min(0).required(),
        start_time: Joi.number().min(0).required(),
        end_time: Joi.number().min(0).required(),
        video_segment_id: Joi.string().required(),
        video_trim_start: Joi.number().min(0).required(),
        video_trim_end: Joi.number().min(0).required()
      })
    ).min(1).required()
  }),

  // ==================== 可以繼續加入其他 Schema ====================
}

/**
 * 驗證錯誤類型
 */
export type ValidationType =
  | 'MissingRequiredField'
  | 'InvalidFieldType'
  | 'InvalidValueRange'
  | 'SchemaValidationError'
  | 'InvalidReference'
  | 'FileNotFound'
  | 'InvalidFileSize'
  | 'EmptyQueryResult'
  | 'IncompleteQueryResult'
  | 'InvalidSegmentTiming'
  | 'InvalidTimelineStructure'
  | 'BusinessLogicViolation'

/**
 * 驗證錯誤
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
```

---

建立 `src/services/validators/data-flow.validator.ts`:

```typescript
/**
 * 資料流驗證器
 *
 * 根據 Overall Design 08-logging-monitoring.md 的設計實作
 */

import { Logger } from '../logger.service'
import { SCHEMAS, ValidationError } from './schemas'
import type { Schema } from 'joi'

/**
 * 資料流驗證器
 */
export class DataFlowValidator {
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  /**
   * 驗證 AI 回應
   *
   * @param callId AI 呼叫 ID
   * @param schemaName Schema 名稱
   * @param data 要驗證的資料
   * @param additionalChecks 額外的業務邏輯驗證函數
   */
  async validateAIResponse(
    callId: string,
    schemaName: string,
    data: any,
    additionalChecks?: (data: any) => Array<{ field: string; message: string; value?: any }>
  ): Promise<void> {
    const schema = SCHEMAS[schemaName as keyof typeof SCHEMAS]
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`)
    }

    // Step 1: Schema 驗證
    const { error } = schema.validate(data, { abortEarly: false })

    if (error) {
      await this.logger.error('ai_response_validation_failed', {
        call_id: callId,
        validation_error: this.getValidationErrorType(error),
        error_message: error.message,
        error_details: {
          validation_errors: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message,
            type: d.type
          })),
          received_data: data,
          expected_schema: this.getSchemaDescription(schemaName)
        }
      })

      throw new ValidationError(`AI response validation failed: ${error.message}`)
    }

    // Step 2: 額外的業務邏輯驗證
    if (additionalChecks) {
      const errors = additionalChecks(data)
      if (errors.length > 0) {
        await this.logger.error('ai_response_validation_failed', {
          call_id: callId,
          validation_error: 'BusinessLogicViolation',
          error_details: {
            validation_errors: errors,
            received_data: data
          }
        })

        throw new ValidationError(`Business logic validation failed: ${errors.map(e => e.message).join(', ')}`)
      }
    }
  }

  /**
   * 驗證資料流傳接
   *
   * @param fromModule 來源模組
   * @param toModule 目標模組
   * @param schemaName Schema 名稱
   * @param data 資料
   * @param context 上下文資訊
   */
  async validateDataFlow(
    fromModule: string,
    toModule: string,
    schemaName: string,
    data: any,
    context?: any
  ): Promise<void> {
    const schema = SCHEMAS[schemaName as keyof typeof SCHEMAS]
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`)
    }

    const { error } = schema.validate(data, { abortEarly: false })

    if (error) {
      await this.logger.error('data_flow_validation_failed', {
        validation_error: this.getValidationErrorType(error),
        error_message: error.message,
        error_details: {
          from_module: fromModule,
          to_module: toModule,
          validation_errors: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message,
            type: d.type
          })),
          received_data: data
        },
        context
      })

      throw new ValidationError(`Data flow validation failed: ${fromModule} → ${toModule}: ${error.message}`)
    }
  }

  /**
   * 驗證參照完整性
   *
   * 例如: AI 選的 segment_id 是否在候選列表中
   *
   * @param selectedId 選擇的 ID
   * @param validIds 有效 ID 列表
   * @param context 上下文資訊
   */
  async validateReference(
    selectedId: string,
    validIds: string[],
    context: any
  ): Promise<void> {
    if (!validIds.includes(selectedId)) {
      await this.logger.error('data_flow_validation_failed', {
        validation_error: 'InvalidReference',
        error_message: `Selected ID ${selectedId} not in valid list`,
        error_details: {
          invalid_id: selectedId,
          valid_ids: validIds,
          valid_count: validIds.length,
          context
        }
      })

      throw new ValidationError(`Invalid reference: ${selectedId} not in valid list of ${validIds.length} items`)
    }
  }

  /**
   * 驗證檔案是否可用
   *
   * @param filePath 檔案路徑
   * @param constraints 約束條件
   */
  async validateFile(
    filePath: string,
    constraints?: {
      minSize?: number
      maxSize?: number
      mustExist?: boolean
    }
  ): Promise<void> {
    const fileInfo = await this.getFileInfo(filePath)

    const errors: string[] = []

    if (constraints?.mustExist && !fileInfo.exists) {
      errors.push(`File does not exist: ${filePath}`)
    }

    if (fileInfo.exists && fileInfo.size === 0) {
      errors.push(`File is empty: ${filePath}`)
    }

    if (constraints?.minSize && fileInfo.size < constraints.minSize) {
      errors.push(`File too small: ${fileInfo.size} < ${constraints.minSize}`)
    }

    if (constraints?.maxSize && fileInfo.size > constraints.maxSize) {
      errors.push(`File too large: ${fileInfo.size} > ${constraints.maxSize}`)
    }

    if (errors.length > 0) {
      await this.logger.error('data_flow_validation_failed', {
        validation_error: fileInfo.exists ? 'InvalidFileSize' : 'FileNotFound',
        error_message: errors.join('; '),
        error_details: {
          file_path: filePath,
          file_info: fileInfo,
          constraints
        }
      })

      throw new ValidationError(errors.join('; '))
    }
  }

  /**
   * 驗證數值範圍
   *
   * @param value 數值
   * @param field 欄位名稱
   * @param min 最小值
   * @param max 最大值
   * @param context 上下文資訊
   */
  async validateRange(
    value: number,
    field: string,
    min?: number,
    max?: number,
    context?: any
  ): Promise<void> {
    const errors: string[] = []

    if (min !== undefined && value < min) {
      errors.push(`${field} is ${value}, must be >= ${min}`)
    }

    if (max !== undefined && value > max) {
      errors.push(`${field} is ${value}, must be <= ${max}`)
    }

    if (errors.length > 0) {
      await this.logger.error('data_flow_validation_failed', {
        validation_error: 'InvalidValueRange',
        error_message: errors.join('; '),
        error_details: {
          field,
          value,
          min,
          max,
          context
        }
      })

      throw new ValidationError(errors.join('; '))
    }
  }

  /**
   * 取得驗證錯誤類型
   */
  private getValidationErrorType(error: any): string {
    const firstError = error.details[0]
    if (!firstError) return 'SchemaValidationError'

    if (firstError.type.includes('required')) {
      return 'MissingRequiredField'
    }
    if (firstError.type.includes('type')) {
      return 'InvalidFieldType'
    }
    if (firstError.type.includes('min') || firstError.type.includes('max')) {
      return 'InvalidValueRange'
    }
    return 'SchemaValidationError'
  }

  /**
   * 取得 Schema 描述
   */
  private getSchemaDescription(schemaName: string): string {
    // 簡化的 Schema 描述,實際可以更詳細
    return `Schema: ${schemaName}`
  }

  /**
   * 取得檔案資訊
   */
  private async getFileInfo(filePath: string): Promise<{
    exists: boolean
    size: number
    path: string
  }> {
    // 根據路徑類型檢查檔案
    if (filePath.startsWith('s3://') || filePath.startsWith('gs://')) {
      return await this.checkCloudFile(filePath)
    } else {
      return await this.checkLocalFile(filePath)
    }
  }

  /**
   * 檢查雲端檔案 (S3/GCS)
   */
  private async checkCloudFile(filePath: string): Promise<{
    exists: boolean
    size: number
    path: string
  }> {
    // TODO: 實作雲端檔案檢查
    // 這裡先回傳簡單的結果
    return {
      exists: true,
      size: 0,
      path: filePath
    }
  }

  /**
   * 檢查本地檔案
   */
  private async checkLocalFile(filePath: string): Promise<{
    exists: boolean
    size: number
    path: string
  }> {
    const fs = require('fs').promises
    try {
      const stats = await fs.stat(filePath)
      return {
        exists: true,
        size: stats.size,
        path: filePath
      }
    } catch (error) {
      return {
        exists: false,
        size: 0,
        path: filePath
      }
    }
  }
}

/**
 * 驗證時間軸一致性
 *
 * 檢查配音切分結果的時間軸是否正確:
 * - 無縫隙 (每個片段的 end 等於下個片段的 start)
 * - 無重疊
 * - 不超過總長度
 */
export async function validateVoiceoverTiming(
  segments: Array<{ start: number; end: number; text: string }>,
  totalDuration: number,
  logger: Logger
): Promise<void> {
  const errors: Array<{
    segment_index: number
    error: string
    message: string
    [key: string]: any
  }> = []

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    // 檢查 start < end
    if (segment.start >= segment.end) {
      errors.push({
        segment_index: i,
        error: 'invalid_range',
        message: `Segment ${i}: start (${segment.start}) >= end (${segment.end})`,
        start: segment.start,
        end: segment.end
      })
    }

    // 檢查是否超過總長度
    if (segment.end > totalDuration) {
      errors.push({
        segment_index: i,
        error: 'exceeds_total_duration',
        message: `Segment ${i}: end (${segment.end}) > total duration (${totalDuration})`,
        segment_end: segment.end,
        total_duration: totalDuration
      })
    }

    // 檢查與下一個片段的關係
    if (i < segments.length - 1) {
      const nextSegment = segments[i + 1]

      // 檢查縫隙
      if (nextSegment.start > segment.end) {
        const gap = nextSegment.start - segment.end
        errors.push({
          segment_index: i + 1,
          error: 'gap_detected',
          message: `Gap between segment ${i} and ${i + 1}`,
          segment_end: segment.end,
          next_segment_start: nextSegment.start,
          gap_duration: gap
        })
      }

      // 檢查重疊
      if (nextSegment.start < segment.end) {
        const overlap = segment.end - nextSegment.start
        errors.push({
          segment_index: i + 1,
          error: 'overlap_detected',
          message: `Segment ${i + 1} overlaps with segment ${i}`,
          segment_end: segment.end,
          next_segment_start: nextSegment.start,
          overlap_duration: overlap
        })
      }
    }
  }

  if (errors.length > 0) {
    await logger.error('data_flow_validation_failed', {
      validation_error: 'InvalidSegmentTiming',
      error_message: 'Voice segment timing has gaps or overlaps',
      error_details: {
        validation_errors: errors,
        total_duration: totalDuration,
        segments_count: segments.length
      }
    })

    throw new ValidationError(`Invalid voiceover timing: ${errors.length} errors found`)
  }
}
```

---

### Step 7: 安裝驗證套件

```bash
npm install joi
npm install --save-dev @types/joi
```

---

## ✅ 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證 Logger 服務基本功能

**測試檔案**: `tests/phase-1/task-1.5.basic.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createLogger } from '@/services/logger.service'
import { db } from '@/lib/db'

describe('Task 1.5 - Basic: Logger Service', () => {
  let testExecutionId: string

  beforeAll(async () => {
    testExecutionId = 'test_' + Date.now()
  })

  afterAll(async () => {
    // 清理測試資料
    await db.system_logs.deleteMany({
      where: { execution_id: testExecutionId },
    })
  })

  it('應該能夠記錄 INFO 訊息', async () => {
    const logger = createLogger({ execution_id: testExecutionId })

    await logger.info('task_started', {
      task_type: 'test',
      message: 'This is a test',
    })

    // 查詢資料庫
    const logs = await db.system_logs.findMany({
      where: { execution_id: testExecutionId },
    })

    expect(logs).toHaveLength(1)
    expect(logs[0].level).toBe('INFO')
    expect(logs[0].type).toBe('task_started')
    expect(logs[0].data.message).toBe('This is a test')
  })

  it('應該能夠記錄 ERROR 訊息', async () => {
    const logger = createLogger({ execution_id: testExecutionId })

    await logger.error('task_failed', {
      error_message: 'Test error',
    })

    const errorLogs = await db.system_logs.findMany({
      where: {
        execution_id: testExecutionId,
        level: 'ERROR',
      },
    })

    expect(errorLogs.length).toBeGreaterThan(0)
    expect(errorLogs[0].data.error_message).toBe('Test error')
  })

  it('應該能夠建立 child logger', async () => {
    const parentLogger = createLogger({ execution_id: testExecutionId })
    const childLogger = parentLogger.child({ user_id: 'user_test' })

    await childLogger.info('http_request', {
      path: '/test',
    })

    const logs = await db.system_logs.findMany({
      where: {
        execution_id: testExecutionId,
        user_id: 'user_test',
      },
    })

    expect(logs.length).toBeGreaterThan(0)
  })
})
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.5.basic.test.ts
```

**通過標準**:
- ✅ 能夠記錄各種層級的 log
- ✅ Log 正確寫入資料庫
- ✅ Child logger 正確繼承 context
- ✅ 所有測試通過

---

### Functional Acceptance (功能驗收)

**目標**: 驗證 TaskLogger 與 AILogger

**測試檔案**: `tests/phase-1/task-1.5.functional.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTaskLogger } from '@/services/task-logger.service'
import { db } from '@/lib/db'

describe('Task 1.5 - Functional: Task Logger', () => {
  let executionId: string

  afterAll(async () => {
    // 清理測試資料
    if (executionId) {
      await db.system_logs.deleteMany({
        where: { execution_id: executionId },
      })
    }
  })

  it('應該正確記錄完整任務流程', async () => {
    const taskLogger = createTaskLogger('test_task', 'user_test')
    executionId = taskLogger.getExecutionId()

    // 任務開始
    await taskLogger.taskStarted(
      { videoId: 'video_001' },
      ['step_1', 'step_2', 'step_3']
    )

    // 步驟 1
    await taskLogger.stepStarted(0, 'step_1')
    await taskLogger.stepCompleted(0, 'step_1', { result: 'ok' })

    // 步驟 2
    await taskLogger.stepStarted(1, 'step_2')
    await taskLogger.stepCompleted(1, 'step_2', { result: 'ok' })

    // 任務完成
    await taskLogger.taskCompleted({ total_steps: 2 }, 0.10)

    // 驗證 log
    const logs = await db.system_logs.findMany({
      where: { execution_id: executionId },
      orderBy: { timestamp: 'asc' },
    })

    expect(logs.length).toBeGreaterThanOrEqual(5)
    expect(logs[0].type).toBe('task_started')
    expect(logs[logs.length - 1].type).toBe('task_completed')
  })

  it('應該正確記錄 AI 呼叫', async () => {
    const taskLogger = createTaskLogger('test_ai', 'user_test')
    executionId = taskLogger.getExecutionId()

    const aiLogger = taskLogger.createAILogger('openai', 'chat')

    await aiLogger.callStarted({ prompt: 'test' })
    await aiLogger.callCompleted({ tokens: 100 }, 0.05)

    const logs = await db.system_logs.findMany({
      where: {
        execution_id: executionId,
        service: 'openai',
      },
    })

    expect(logs.length).toBe(2)
    expect(logs[0].type).toBe('ai_call_started')
    expect(logs[1].type).toBe('ai_call_completed')
  })
})
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.5.functional.test.ts
```

**通過標準**:
- ✅ TaskLogger 正確記錄任務流程
- ✅ AILogger 正確記錄 AI 呼叫
- ✅ Log 查詢正確
- ✅ Context 正確傳遞

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證 Log 查詢 API

**測試檔案**: `tests/phase-1/task-1.5.e2e.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '@/app'
import { createTaskLogger } from '@/services/task-logger.service'
import { db } from '@/lib/db'

describe('Task 1.5 - E2E: Log Query API', () => {
  let executionId: string

  beforeAll(async () => {
    // 建立測試資料
    const taskLogger = createTaskLogger('test_e2e', 'user_test')
    executionId = taskLogger.getExecutionId()

    await taskLogger.taskStarted({ test: true }, ['step_1'])
    await taskLogger.stepStarted(0, 'step_1')
    await taskLogger.taskFailed('step_1', new Error('Test error'))
  })

  afterAll(async () => {
    await db.system_logs.deleteMany({
      where: { execution_id: executionId },
    })
  })

  it('應該能查詢任務的所有 log', async () => {
    const response = await request(app)
      .get(`/api/admin/logs/execution/${executionId}`)
      .expect(200)

    expect(response.body.executionId).toBe(executionId)
    expect(response.body.summary.status).toBe('failed')
    expect(response.body.logs.length).toBeGreaterThan(0)
  })

  it('應該能查詢失敗任務', async () => {
    const response = await request(app)
      .get('/api/admin/logs/failures?period=24h')
      .expect(200)

    expect(response.body.failures).toBeDefined()
    expect(Array.isArray(response.body.failures)).toBe(true)
  })
})
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.5.e2e.test.ts
```

**通過標準**:
- ✅ Log 查詢 API 正常運作
- ✅ 回應格式正確
- ✅ 錯誤處理完善

---

## 📋 完成檢查清單

### 實作檢查
- [ ] Logger 型別定義 (`src/types/logger.types.ts`)
- [ ] Logger 服務 (`src/services/logger.service.ts`)
- [ ] TaskLogger 服務 (`src/services/task-logger.service.ts`)
- [ ] HTTP Logger Middleware (`src/middleware/logger.middleware.ts`)
- [ ] Log 查詢 API (`src/controllers/admin/logs.controller.ts`)
- [ ] **資料驗證框架** (`src/services/validators/schemas.ts`)
- [ ] **DataFlowValidator** (`src/services/validators/data-flow.validator.ts`)
- [ ] system_logs 表已建立 (Task 1.1)
- [ ] 安裝 joi 套件

### 測試檔案
- [ ] `tests/phase-1/task-1.5.basic.test.ts` 已建立
- [ ] `tests/phase-1/task-1.5.functional.test.ts` 已建立
- [ ] `tests/phase-1/task-1.5.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

### 程式碼品質
- [ ] 所有函數都有 JSDoc 註解
- [ ] 錯誤處理完整
- [ ] 符合 TypeScript 型別安全
- [ ] 遵循專案程式碼風格

---

## ❓ 常見問題與解決方案

### Q1: Log 無法寫入資料庫 "relation does not exist"

**原因**: system_logs 表未建立

**解決方案**:
1. 確認 Task 1.1 已完成
2. 執行 migration:
   ```bash
   npx prisma migrate dev
   ```
3. 檢查表是否存在:
   ```bash
   psql $DATABASE_URL -c "\d system_logs"
   ```

---

### Q2: JSONB 欄位寫入失敗 "invalid input syntax"

**原因**: JSON 格式錯誤或包含非法字元

**解決方案**:
1. 確保 data 是有效的 JSON 物件
2. 檢查是否有 circular reference:
   ```typescript
   // ❌ 錯誤: circular reference
   const obj: any = {}
   obj.self = obj

   // ✅ 正確: 純物件
   const obj = { name: 'test', value: 123 }
   ```

---

### Q3: 開發環境 log 沒有顏色

**原因**: Terminal 不支援 ANSI 顏色

**解決方案**:
1. 使用支援顏色的 terminal (iTerm2, VS Code terminal)
2. 或關閉顏色:
   ```typescript
   // 修改 getConsoleColor 回傳空字串
   ```

---

### Q4: 查詢 log 很慢

**原因**: 缺少索引或資料量太大

**解決方案**:
1. 確認索引已建立:
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'system_logs';
   ```
2. 定期清理舊 log (參考 08-logging-monitoring.md)
3. 使用正確的查詢條件 (使用有索引的欄位)

---

### Q5: ERROR log 沒有觸發告警

**原因**: alertError 方法還未實作完整

**解決方案**:
1. 目前只輸出到 console
2. 未來可整合:
   - Slack webhook
   - Email notification
   - Sentry

---

## ✨ Task 完成確認

完成這個 Task 後,你應該能夠:

✅ 記錄所有系統事件與錯誤
✅ 使用結構化 log 進行查詢與分析
✅ 追蹤完整的任務執行流程
✅ 快速定位問題根源
✅ 查詢各種 log 統計資料

**下一步**: Task 1.6 - 成本追蹤服務

---

**文件版本**: 1.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
