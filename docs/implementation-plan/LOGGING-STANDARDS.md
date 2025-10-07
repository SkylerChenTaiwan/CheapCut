# Logging 整合標準文件

**版本**: 1.0
**狀態**: ✅ 已完成
**適用範圍**: 所有 Phase 2 (Engines) 及後續需要記錄執行過程的 Tasks

---

## 📋 目的

本文件定義了所有引擎與服務必須遵循的 Logging 標準,確保:
1. ✅ 所有執行過程都有完整記錄
2. ✅ 錯誤發生時能快速定位問題
3. ✅ AI 呼叫的成本與效能都被追蹤
4. ✅ 資料流傳接都經過驗證

---

## 🎯 核心原則

### 1. Fail Fast, Log Everything Needed

**來自 Overall Design 08-logging-monitoring.md 的核心哲學**:

- ❌ **不要過度 fallback** - 錯誤發生時立即停止
- ✅ **詳細的錯誤上下文** - 記錄足夠資訊來重現問題
- ✅ **明確的失敗點** - 精準定位哪個步驟壞了
- ✅ **可追溯的執行路徑** - 從頭到尾看得到發生什麼事

### 2. 四層 Logging 架構

```
Layer 1: HTTP 請求層 (API Gateway)
         └─ 記錄: request_id, user_id, path, status, duration

Layer 2: 任務執行層 (Background Job)
         └─ 記錄: task_started, task_step_*, task_completed/failed

Layer 3: AI 呼叫層 (AI Service)
         └─ 記錄: ai_call_started, ai_call_completed/failed, 成本

Layer 4: 資料庫操作層 (Database)
         └─ 記錄: 批次操作、交易、失敗的查詢
```

---

## 📝 每個 Task 必須包含的 Logging 章節

在實作步驟中,每個 Task 文件**必須包含**以下章節:

### 模板

```markdown
## 📊 Logging 與錯誤處理整合

### Step X: 整合 TaskLogger

#### 1. 建立 TaskLogger 實例

在引擎的主要方法開始時:

\`\`\`typescript
import { createTaskLogger } from '@/services/task-logger.service'
import { DataFlowValidator } from '@/services/validators/data-flow.validator'

class [EngineName] {
  async process(input: Input, userId: string) {
    // 建立 TaskLogger
    const taskLogger = createTaskLogger('[task_type]', userId)
    const executionId = taskLogger.getExecutionId()
    const validator = new DataFlowValidator(taskLogger.getLogger())

    try {
      // 記錄任務開始
      await taskLogger.taskStarted(
        { /* input data */ },
        ['step_1', 'step_2', 'step_3']  // 所有步驟清單
      )

      // ... 執行步驟 ...

      // 記錄任務完成
      await taskLogger.taskCompleted(
        { /* result summary */ },
        totalCost  // 從 CostTracker 取得
      )

    } catch (error) {
      // 記錄任務失敗
      await taskLogger.taskFailed(
        currentStep,  // 失敗的步驟名稱
        error,
        { /* additional context */ }
      )
      throw error  // ✅ Fail Fast - 不 fallback
    }
  }
}
\`\`\`

#### 2. 記錄每個步驟

\`\`\`typescript
// 步驟開始
await taskLogger.stepStarted(0, 'step_name')

// 執行步驟邏輯
const result = await doSomething()

// 步驟完成
await taskLogger.stepCompleted(0, 'step_name', {
  // result summary
})
\`\`\`

#### 3. 記錄 AI 呼叫 (如適用)

\`\`\`typescript
// 建立 AI Logger
const aiLogger = taskLogger.createAILogger('service_name', 'operation')

// AI 呼叫開始
await aiLogger.callStarted({ /* input */ })

try {
  const response = await aiService.call(...)

  // AI 呼叫成功 (包含成本追蹤)
  await aiLogger.callCompletedOpenAI(
    model,
    response.usage,
    { /* result summary */ }
  )

} catch (error) {
  // AI 呼叫失敗
  await aiLogger.callFailed(error, requestPayload)
  throw error
}
\`\`\`

#### 4. 資料流驗證

\`\`\`typescript
// 驗證 AI 回應
await validator.validateAIResponse(
  callId,
  'schema_name',  // 在 SCHEMAS 中定義
  aiResponse,
  // 可選: 額外的業務邏輯驗證
  (data) => {
    const errors = []
    if (/* business rule violated */) {
      errors.push({ field: 'xxx', message: 'xxx' })
    }
    return errors
  }
)

// 驗證參照完整性
await validator.validateReference(
  selectedId,
  validIds,
  { /* context */ }
)

// 驗證檔案
await validator.validateFile(filePath, {
  mustExist: true,
  minSize: 1024
})
\`\`\`

### 必須記錄的事件清單

根據引擎類型,勾選適用的事件:

**基礎事件** (所有引擎都要):
- [ ] `task_started` - 任務開始
- [ ] `task_step_started` - 每個步驟開始
- [ ] `task_step_completed` - 每個步驟完成
- [ ] `task_completed` - 任務完成 (包含總成本)
- [ ] `task_failed` - 任務失敗 (包含失敗點與上下文)

**AI 呼叫事件** (有使用 AI 的引擎):
- [ ] `ai_call_started` - AI 呼叫開始
- [ ] `ai_call_completed` - AI 呼叫成功 (包含成本與 tokens)
- [ ] `ai_call_failed` - AI 呼叫失敗 (包含完整 request payload)
- [ ] `ai_response_validation_failed` - AI 回應驗證失敗

**資料流驗證事件**:
- [ ] `data_flow_validation_failed` - 資料流驗證失敗 (Schema、參照、檔案等)

**資料庫事件** (有批次寫入的引擎):
- [ ] `db_operation` - 批次操作成功
- [ ] `db_operation_failed` - 資料庫操作失敗
- [ ] `db_operation_empty_result` - 查詢結果為空 (WARN 級別)

**檔案/FFmpeg 事件** (有檔案操作的引擎):
- [ ] `file_operation_failed` - 檔案操作失敗
- [ ] `ffmpeg_execution_failed` - FFmpeg 執行失敗 (包含完整 stderr)

### 必須驗證的資料

根據引擎類型,勾選適用的驗證:

- [ ] AI 回應 Schema 驗證 (使用 Joi/Zod)
- [ ] 數值範圍驗證 (duration, confidence, indices 等)
- [ ] 參照完整性驗證 (ID 是否存在於候選列表)
- [ ] 檔案存在性驗證 (S3/GCS 檔案是否存在且非空)
- [ ] 時間軸一致性驗證 (無縫隙、無重疊、不超過總長度)
- [ ] JSON 結構驗證 (必填欄位、型別正確)

### Fail Fast 檢查清單

- [ ] ✅ 驗證失敗時立即 `throw error`
- [ ] ❌ 不使用 `try-catch` 來忽略錯誤
- [ ] ❌ 不使用 fallback 值來掩蓋問題
- [ ] ✅ 記錄完整錯誤上下文 (input, 中間結果, 失敗點)
- [ ] ✅ 包含足夠資訊來重現問題 (完整的 prompt, payload 等)
\`\`\`

---

## 🔧 必要的 Schema 定義

每個引擎必須在 `src/services/validators/schemas.ts` 中定義其資料 Schema:

```typescript
import Joi from 'joi'

export const SCHEMAS = {
  // AI 語意分析結果
  semantic_analysis: Joi.object({
    topics: Joi.array().items(Joi.string()).min(1).required(),
    keywords: Joi.array().items(Joi.string()).min(1).required(),
    tone: Joi.string().valid('professional', 'casual', 'enthusiastic').required()
  }),

  // AI 選片結果
  segment_selection: Joi.object({
    selectedSegmentId: Joi.string().required(),
    trimStart: Joi.number().min(0).required(),
    trimEnd: Joi.number().min(0).required(),
    reason: Joi.string().optional()
  }),

  // 配音切分結果
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

  // 時間軸 JSON
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

  // ... 其他 Schema
}
```

---

## 📋 Task 更新檢查清單

每個需要更新的 Task 必須完成以下項目:

### Phase 1 Tasks

- [ ] Task 1.5: Logger 服務 - 加入驗證框架實作
- [ ] Task 1.6: Cost Tracker - 確認與 Logger 整合

### Phase 2 Tasks (核心引擎)

- [ ] Task 2.0: Prompt Management - 加入 AI 呼叫 Logging
- [ ] Task 2.1: Storage Upload - 加入檔案操作 Logging
- [ ] Task 2.2: Video Analysis (Google Video AI) - 完整的 AI Logging
- [ ] Task 2.3: Tag Conversion - 資料驗證 Logging
- [ ] Task 2.4: Segment Split - 資料驗證 Logging
- [ ] Task 2.5: STT Integration (Whisper) - AI Logging + 成本追蹤
- [ ] Task 2.6: Semantic Analysis (GPT-4) - 完整的 AI Logging + Schema 驗證
- [ ] Task 2.7: Voiceover Split (GPT-4) - AI Logging + 時間軸驗證
- [ ] Task 2.8: Candidate Query - 查詢結果驗證
- [ ] Task 2.9: AI Selection (Gemini) - 完整的 AI Logging + 參照驗證
- [ ] Task 2.10: Timeline Generation - JSON 結構驗證
- [ ] Task 2.11: FFmpeg Setup - 錯誤記錄
- [ ] Task 2.12: Video Composition - FFmpeg Logging + 檔案驗證
- [ ] Task 2.13: Subtitle Overlay - 資料驗證
- [ ] Task 2.14: Music Integration - 資料驗證
- [ ] Task 2.15: Integration Test - 完整流程 Logging

### Phase 3 Tasks (Frontend - 如適用)

- [ ] Task 3.3: Material Upload - 上傳流程 Logging
- [ ] Task 3.5: Voiceover Recording - 錄音流程 Logging
- [ ] Task 3.6: Video Generation - 生成流程 Logging

---

## 🚨 常見錯誤與修正

### ❌ 錯誤範例 1: 沒有使用 TaskLogger

```typescript
// ❌ 錯誤
async function processVideo(videoId: string) {
  const result = await googleVideoAI.analyze(videoId)
  return result
}
```

```typescript
// ✅ 正確
async function processVideo(videoId: string, userId: string) {
  const taskLogger = createTaskLogger('video_analysis', userId)

  try {
    await taskLogger.taskStarted({ videoId }, ['analyze'])
    await taskLogger.stepStarted(0, 'analyze')

    const result = await googleVideoAI.analyze(videoId)

    await taskLogger.stepCompleted(0, 'analyze', { scenes: result.scenes.length })
    await taskLogger.taskCompleted({ scenes: result.scenes.length }, cost)

    return result
  } catch (error) {
    await taskLogger.taskFailed('analyze', error)
    throw error
  }
}
```

### ❌ 錯誤範例 2: 沒有驗證 AI 回應

```typescript
// ❌ 錯誤
const aiResponse = await openai.chat(...)
const keywords = aiResponse.keywords  // 可能是 undefined!
```

```typescript
// ✅ 正確
const aiResponse = await openai.chat(...)

await validator.validateAIResponse(
  callId,
  'semantic_analysis',
  aiResponse
)

const keywords = aiResponse.keywords  // 保證存在
```

### ❌ 錯誤範例 3: 使用 fallback 掩蓋錯誤

```typescript
// ❌ 錯誤
const candidates = await db.query(...)
if (candidates.length === 0) {
  candidates = await db.query({ /* 放寬條件 */ })  // fallback
}
```

```typescript
// ✅ 正確
const candidates = await db.query(...)
if (candidates.length === 0) {
  await logger.error('data_flow_validation_failed', {
    validation_error: 'EmptyQueryResult',
    // ... 詳細資訊
  })
  throw new ValidationError('No candidates found')  // Fail Fast
}
```

### ❌ 錯誤範例 4: 錯誤資訊不足

```typescript
// ❌ 錯誤
catch (error) {
  await logger.error('task_failed', { error: error.message })
  throw error
}
```

```typescript
// ✅ 正確
catch (error) {
  await taskLogger.taskFailed(
    currentStep,
    error,
    {
      input: originalInput,
      intermediateResults: partialResults,
      aiResponse: lastAIResponse,  // 完整的 AI 回應
      requestPayload: lastRequestPayload  // 可以重現問題
    }
  )
  throw error
}
```

---

## 📚 參考文件

- **Overall Design 08**: `docs/overall-design/08-logging-monitoring.md` - 完整的 Logging 設計
- **Overall Design 09**: `docs/overall-design/09-cost-performance-tracking.md` - 成本追蹤設計
- **Task 1.5**: `docs/implementation-plan/phase-1-infrastructure/task-1.5-logger-service.md` - Logger 服務實作
- **Task 1.6**: `docs/implementation-plan/phase-1-infrastructure/task-1.6-cost-tracker.md` - Cost Tracker 實作

---

## ✅ 驗收標準

每個 Task 完成後,必須確認:

1. **Logging 完整性**:
   - [ ] 所有步驟都有 `task_step_started` 和 `task_step_completed`
   - [ ] 所有 AI 呼叫都有 `ai_call_started` 和 `ai_call_completed/failed`
   - [ ] 失敗時有 `task_failed` 且包含完整上下文

2. **驗證完整性**:
   - [ ] AI 回應都經過 Schema 驗證
   - [ ] 關鍵資料流都經過驗證 (參照、檔案、數值範圍)
   - [ ] 驗證失敗時有清楚的錯誤訊息

3. **成本追蹤**:
   - [ ] 所有 AI 呼叫都記錄成本
   - [ ] task_completed 包含總成本

4. **Fail Fast**:
   - [ ] 驗證失敗時立即拋出錯誤
   - [ ] 沒有使用 fallback 掩蓋問題
   - [ ] 錯誤訊息足以重現問題

---

**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
