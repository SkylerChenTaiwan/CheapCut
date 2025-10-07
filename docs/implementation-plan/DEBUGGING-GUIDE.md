# CheapCut 問題診斷指南

> **目的**: 當測試或開發時遇到問題,按照本指南的步驟,快速定位問題根源
>
> **適用對象**: 開發者、測試人員、AI 助手
>
> **最後更新**: 2025-10-07

---

## 📋 快速診斷流程圖

```
遇到問題
    ↓
步驟 1: 收集基本資訊 (execution_id, user_id, 錯誤訊息)
    ↓
步驟 2: 查看完整執行過程 (GET /api/admin/logs/execution/:id)
    ↓
步驟 3: 找出失敗步驟 (summary.failedAt)
    ↓
步驟 4: 根據失敗類型,查看對應章節
    ↓
步驟 5: 套用修復方案
```

---

## 🎯 步驟 1: 收集基本資訊

在開始診斷前,先收集以下資訊:

### 必要資訊

| 資訊 | 從哪裡取得 | 範例 |
|------|-----------|------|
| **execution_id** | Console 輸出 / API 回應 | `exec_7f8e9a0b` |
| **user_id** | 測試用戶 ID | `user_test_001` |
| **任務類型** | API 請求 / Console 輸出 | `video_generation` |
| **錯誤訊息** | Console 輸出 (紅色) | `ValidationError: ...` |

### 如何取得 execution_id

**方法 1: 從 Console 找**
```bash
# 任務開始時會輸出
[INFO] task_started {
  "execution_id": "exec_7f8e9a0b",  ← 這個!
  "task_type": "video_generation"
}
```

**方法 2: 從 API 回應找**
```json
{
  "success": true,
  "executionId": "exec_7f8e9a0b"  ← 這個!
}
```

**方法 3: 從資料庫找最新的**
```sql
SELECT execution_id, timestamp, data->>'task_type' as task_type
FROM system_logs
WHERE type = 'task_started'
  AND user_id = 'user_test_001'
ORDER BY timestamp DESC
LIMIT 5;
```

---

## 🔍 步驟 2: 查看完整執行過程

### API 呼叫

```bash
curl -X GET "http://localhost:8080/api/admin/logs/execution/exec_7f8e9a0b"
```

### 回應結構解讀

```json
{
  "executionId": "exec_7f8e9a0b",
  "summary": {
    "totalLogs": 12,           // 共 12 筆 log
    "errorLogs": 2,            // 其中 2 筆是錯誤
    "status": "failed",        // ✅ 任務狀態 (completed/failed/processing)
    "taskType": "video_generation",
    "duration": 45230,         // 執行時間 (毫秒)
    "failedAt": "ai_selection" // ✅ 失敗在哪個步驟 (超重要!)
  },
  "logs": [
    // 所有 log 按時間排序
  ]
}
```

### 關鍵欄位說明

| 欄位 | 意義 | 如何使用 |
|------|------|---------|
| `summary.status` | 任務結果 | `failed` → 有問題需要診斷 |
| `summary.failedAt` | **失敗步驟** | **直接跳到該步驟的診斷章節** |
| `summary.errorLogs` | 錯誤數量 | > 0 表示有錯誤 |
| `logs[].level` | Log 層級 | `ERROR` 是問題所在 |
| `logs[].type` | Log 類型 | 決定用哪個診斷方法 |

---

## 🎯 步驟 3: 根據失敗類型診斷

根據 `summary.failedAt` 或 `logs[].type`,跳到對應章節:

| 失敗類型 | 跳到章節 |
|---------|---------|
| AI 相關錯誤 | [→ AI 呼叫診斷](#-ai-呼叫診斷) |
| 資料驗證錯誤 | [→ 資料驗證診斷](#-資料驗證診斷) |
| 檔案操作錯誤 | [→ 檔案操作診斷](#-檔案操作診斷) |
| FFmpeg 錯誤 | [→ FFmpeg 診斷](#-ffmpeg-診斷) |
| 資料庫錯誤 | [→ 資料庫診斷](#-資料庫診斷) |
| 時間軸錯誤 | [→ 時間軸診斷](#-時間軸診斷) |

---

## 🤖 AI 呼叫診斷

### 識別特徵

Log 中出現以下任一類型:
- `ai_call_failed`
- `ai_response_validation_failed`

### 診斷步驟

#### Step 1: 找出失敗的 AI 呼叫

在 logs 陣列中搜尋 `"level": "ERROR"` 且 `"type"` 包含 `ai_`:

```json
{
  "level": "ERROR",
  "type": "ai_response_validation_failed",
  "data": {
    "call_id": "call_abc123",
    "validation_error": "MissingRequiredField",
    "error_message": "\"selectedSegmentId\" is required",
    "error_details": {
      "validation_errors": [
        {
          "field": "selectedSegmentId",
          "message": "\"selectedSegmentId\" is required",
          "type": "any.required"
        }
      ],
      "received_data": {           // ← ✅ AI 實際回傳的資料
        "reason": "Good match",
        "confidence": 0.85
      },
      "expected_schema": "Schema: segment_selection"
    }
  }
}
```

#### Step 2: 查看 AI 呼叫的完整過程

用 `call_id` 找出相關的 AI 呼叫 log:

```bash
# 從 logs 陣列中篩選
cat logs.json | jq '.logs[] | select(.call_id == "call_abc123")'
```

你會看到:
1. `ai_call_started` - AI 呼叫開始 (包含 input)
2. `ai_call_completed` 或 `ai_call_failed` - AI 回應
3. `ai_response_validation_failed` - 驗證失敗 (如果有)

#### Step 3: 分析問題原因

| 驗證錯誤類型 | 意義 | 可能原因 |
|-------------|------|---------|
| `MissingRequiredField` | 缺少必填欄位 | AI prompt 不夠清楚,沒說明必填欄位 |
| `InvalidFieldType` | 欄位型別錯誤 | AI 回傳了字串,但應該是數字 |
| `InvalidValueRange` | 數值超出範圍 | AI 回傳 `trimStart = -1` (應該 >= 0) |
| `InvalidReference` | 參照不存在 | AI 選了一個不在候選列表的 segment_id |
| `BusinessLogicViolation` | 違反業務邏輯 | 例如: `trimEnd < trimStart` |

#### Step 4: 檢查 AI Input

找到 `ai_call_started` log,查看 `data.input`:

```json
{
  "type": "ai_call_started",
  "data": {
    "call_id": "call_abc123",
    "service": "openai",
    "operation": "chat",
    "input": {
      "prompt": "...",           // ← 檢查 prompt 是否清楚
      "candidates": [...]        // ← 檢查候選資料是否正確
    }
  }
}
```

**檢查清單**:
- [ ] Prompt 是否明確要求回傳所有必填欄位?
- [ ] Prompt 是否說明欄位的型別和格式?
- [ ] 候選資料是否完整 (有 segment_id)?
- [ ] Prompt 是否要求 JSON 格式回傳?

#### Step 5: 修復建議

**問題**: `MissingRequiredField: selectedSegmentId`

**修復方案**:
1. 修改 prompt,明確要求:
   ```
   You MUST return a JSON object with these required fields:
   - selectedSegmentId: string (required)
   - trimStart: number (required, >= 0)
   - trimEnd: number (required, > trimStart)
   - reason: string (optional)
   ```

2. 在 prompt 中提供範例:
   ```
   Example response:
   {
     "selectedSegmentId": "seg_001",
     "trimStart": 0,
     "trimEnd": 5.5,
     "reason": "Good visual match"
   }
   ```

3. 測試修改後的 prompt

---

## ✅ 資料驗證診斷

### 識別特徵

Log 中出現:
- `data_flow_validation_failed`

### 診斷步驟

#### Step 1: 找出驗證失敗的 log

```json
{
  "level": "ERROR",
  "type": "data_flow_validation_failed",
  "data": {
    "validation_error": "InvalidTimelineStructure",
    "error_message": "Timeline has invalid time ranges",
    "error_details": {
      "from_module": "ai_selection",
      "to_module": "timeline_generator",
      "validation_errors": [
        {
          "segment_index": 2,
          "error": "video_trim_end > segment.duration",
          "data": {
            "video_trim_end": 10.5,
            "segment_duration": 8.2  // ← 問題: trim 超過片段長度!
          }
        }
      ]
    }
  }
}
```

#### Step 2: 識別驗證錯誤類型

| 驗證錯誤 | 意義 | 常見原因 |
|---------|------|---------|
| `InvalidTimelineStructure` | 時間軸結構錯誤 | start >= end, 或超出範圍 |
| `InvalidSegmentTiming` | 配音切分時間錯誤 | 有縫隙或重疊 |
| `InvalidReference` | 參照不存在 | segment_id 不在資料庫中 |
| `FileNotFound` | 檔案不存在 | 路徑錯誤或檔案被刪除 |
| `InvalidFileSize` | 檔案大小異常 | 檔案為空或太大 |

#### Step 3: 追溯資料來源

根據 `from_module` 和 `to_module`,找出資料來源:

```json
{
  "from_module": "ai_selection",     // ← 資料從 AI 選片來
  "to_module": "timeline_generator"  // ← 傳給時間軸生成器
}
```

**診斷步驟**:
1. 往前找 `ai_selection` 的輸出 log
2. 檢查輸出資料是否有問題
3. 如果 AI 輸出正確,檢查中間是否有轉換邏輯錯誤

#### Step 4: 檢查實際資料

從 `error_details` 中查看:
- `received_data` - 實際收到的資料
- `validation_errors` - 具體哪些欄位有問題

```json
{
  "validation_errors": [
    {
      "segment_index": 2,          // ← 第 2 個片段
      "error": "video_trim_end > segment.duration",
      "data": {
        "video_trim_end": 10.5,    // ← 要求 trim 到 10.5 秒
        "segment_duration": 8.2    // ← 但片段只有 8.2 秒!
      }
    }
  ]
}
```

#### Step 5: 修復建議

**問題**: `video_trim_end (10.5) > segment.duration (8.2)`

**可能原因**:
1. AI 選片時沒有考慮片段實際長度
2. 候選資料中沒有提供 segment.duration
3. 計算錯誤

**修復方案**:
1. 在 AI 選片時,將 segment.duration 加入候選資料
2. 在 prompt 中明確要求: `trimEnd must not exceed segment.duration`
3. 加入額外驗證: 選片後立即檢查 trim 範圍

---

## 📁 檔案操作診斷

### 識別特徵

Log 中出現:
- `file_operation_failed`
- `data_flow_validation_failed` + `validation_error: "FileNotFound"`

### 診斷步驟

#### Step 1: 找出檔案操作失敗的 log

```json
{
  "level": "ERROR",
  "type": "file_operation_failed",
  "data": {
    "operation": "download",
    "file_path": "gs://bucket/videos/segment_123.mp4",
    "segment_id": "seg_123",
    "error_type": "NotFoundError",
    "error_message": "File not found"
  }
}
```

或

```json
{
  "level": "ERROR",
  "type": "data_flow_validation_failed",
  "data": {
    "validation_error": "FileNotFound",
    "error_message": "File does not exist: /tmp/segment_0.mp4",
    "error_details": {
      "file_path": "/tmp/segment_0.mp4",
      "file_info": {
        "exists": false,
        "size": 0
      }
    }
  }
}
```

#### Step 2: 檢查檔案路徑

**檢查清單**:
- [ ] 路徑是否正確? (檢查拼字、大小寫)
- [ ] 雲端路徑: 是否有權限? Bucket 是否存在?
- [ ] 本地路徑: 暫存目錄是否已建立?
- [ ] 檔案是否在前一步驟產生?

#### Step 3: 往前追溯檔案來源

**情境 1: 下載失敗**

查看 `file_path` 應該從哪裡來:

```bash
# 查詢資料庫中的檔案路徑
SELECT segment_id, file_path
FROM segments
WHERE segment_id = 'seg_123';
```

檢查:
- [ ] 資料庫中的路徑是否正確?
- [ ] 檔案上傳時是否成功?
- [ ] 雲端儲存是否正常?

**情境 2: 本地檔案不存在**

往前找 "應該產生這個檔案" 的步驟:

```bash
# 從 logs 中搜尋檔案路徑
cat logs.json | jq '.logs[] | select(.data | tostring | contains("/tmp/segment_0.mp4"))'
```

檢查:
- [ ] 前一步驟是否執行成功?
- [ ] 前一步驟 log 中是否有錯誤?
- [ ] 檔案產生後是否被意外刪除?

#### Step 4: 檢查檔案狀態

如果檔案存在但有問題:

```json
{
  "file_info": {
    "exists": true,
    "size": 0      // ← 檔案是空的!
  }
}
```

**檢查**:
- [ ] 檔案大小為 0 → 寫入失敗或下載不完整
- [ ] 往前找產生/下載這個檔案的 log
- [ ] 檢查是否有錯誤但被忽略

#### Step 5: 修復建議

| 問題 | 修復方案 |
|------|---------|
| 雲端檔案不存在 | 檢查上傳邏輯,確保上傳成功後才記錄路徑 |
| 本地檔案不存在 | 檢查前一步驟是否真的成功,加強 Fail Fast |
| 檔案大小為 0 | 檢查寫入/下載邏輯,加入檔案大小驗證 |
| 路徑錯誤 | 統一路徑格式,使用常數管理路徑 |

---

## 🎬 FFmpeg 診斷

### 識別特徵

Log 中出現:
- `ffmpeg_execution_failed`

### 診斷步驟

#### Step 1: 找出 FFmpeg 失敗的 log

```json
{
  "level": "ERROR",
  "type": "ffmpeg_execution_failed",
  "data": {
    "error_message": "FFmpeg exited with code 1",
    "error_details": {
      "exitCode": 1,
      "stderr": "Input file '/tmp/segment_0.mp4' does not exist\nConversion failed!",
      "command": "ffmpeg -i /tmp/segment_0.mp4 -i /tmp/segment_1.mp4 -filter_complex \"[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]\" -map \"[v]\" -map \"[a]\" /tmp/output.mp4",
      "input_files": [
        { "path": "/tmp/segment_0.mp4", "exists": false, "size": 0 },
        { "path": "/tmp/segment_1.mp4", "exists": true, "size": 1024000 }
      ]
    }
  }
}
```

#### Step 2: 分析 stderr (最重要!)

FFmpeg 的 `stderr` 包含完整錯誤訊息:

```
Input file '/tmp/segment_0.mp4' does not exist
                                ^^^^^^^^^^^^^^^ ← 找到原因!
Conversion failed!
```

**常見 FFmpeg 錯誤**:

| stderr 內容 | 問題 | 處理方式 |
|------------|------|---------|
| `does not exist` | 輸入檔案不存在 | → 跳到 [檔案操作診斷](#-檔案操作診斷) |
| `Invalid data found` | 檔案損壞 | 檢查檔案來源,重新下載 |
| `Codec not supported` | 不支援的編碼 | 先轉檔,或使用其他 codec |
| `Output file is empty` | 輸出檔案是空的 | 檢查輸入檔案是否有效 |
| `Packet mismatch` | 格式不一致 | 統一所有輸入檔案的格式 |

#### Step 3: 檢查 FFmpeg 指令

從 `command` 欄位複製完整指令,手動執行測試:

```bash
# 複製 command 欄位的內容
ffmpeg -i /tmp/segment_0.mp4 -i /tmp/segment_1.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" /tmp/output.mp4
```

**檢查**:
- [ ] 手動執行是否成功?
- [ ] 輸入檔案路徑是否正確?
- [ ] 參數是否正確?
- [ ] 是否缺少必要的 codec?

#### Step 4: 檢查輸入檔案狀態

從 `input_files` 查看每個檔案:

```json
[
  { "path": "/tmp/segment_0.mp4", "exists": false, "size": 0 },     // ← 問題在這!
  { "path": "/tmp/segment_1.mp4", "exists": true, "size": 1024000 }
]
```

- 第一個檔案不存在 → 往前查為什麼沒產生
- 檔案大小為 0 → 產生失敗或損壞
- 檔案過小 (< 1KB) → 可能不是有效的影片

#### Step 5: 修復建議

**問題**: `Input file '/tmp/segment_0.mp4' does not exist`

**修復步驟**:
1. 往前找 "download_segments" 步驟的 log
2. 檢查該步驟是否有錯誤
3. 如果沒有錯誤但檔案不存在 → **這就是 Fail Fast 沒做好!**
4. 加入檔案驗證: 下載後立即檢查檔案是否存在且大小 > 0

**程式碼修復範例**:
```typescript
// 下載後立即驗證
const localPath = await this.downloadFile(segment.file_path)

// ✅ 加入驗證
if (!fs.existsSync(localPath)) {
  throw new Error(`Downloaded file does not exist: ${localPath}`)
}

const stats = fs.statSync(localPath)
if (stats.size === 0) {
  throw new Error(`Downloaded file is empty: ${localPath}`)
}
```

---

## 🗄️ 資料庫診斷

### 識別特徵

Log 中出現:
- `db_operation_failed`
- `db_operation_empty_result`

### 診斷步驟

#### Step 1: 找出資料庫操作失敗的 log

```json
{
  "level": "ERROR",
  "type": "db_operation_failed",
  "data": {
    "operation": "findOne",
    "table": "segments",
    "query": { "segment_id": "seg_123" },
    "error_type": "NotFoundError",
    "error_message": "Record not found"
  }
}
```

或

```json
{
  "level": "WARN",
  "type": "db_operation_empty_result",
  "data": {
    "operation": "findMany",
    "table": "segments",
    "query": { "material_id": "mat_456" },
    "result_count": 0
  }
}
```

#### Step 2: 重現資料庫查詢

根據 log 中的 query,手動執行:

```sql
-- 根據 log 中的資訊
SELECT * FROM segments WHERE segment_id = 'seg_123';

-- 檢查是否真的不存在
SELECT COUNT(*) FROM segments WHERE segment_id = 'seg_123';

-- 檢查相關資料
SELECT * FROM segments WHERE material_id = 'mat_456';
```

#### Step 3: 往前追溯資料來源

**檢查清單**:
- [ ] 這筆資料應該在哪個步驟建立?
- [ ] 建立步驟是否執行成功?
- [ ] 是否有 transaction rollback?
- [ ] ID 拼寫是否正確?

**查詢資料建立 log**:
```bash
# 搜尋包含該 ID 的所有 log
cat logs.json | jq '.logs[] | select(.data | tostring | contains("seg_123"))'
```

#### Step 4: 檢查資料完整性

如果資料存在但不完整:

```sql
-- 檢查必填欄位是否為空
SELECT segment_id, file_path, duration
FROM segments
WHERE segment_id = 'seg_123';

-- 檢查關聯資料
SELECT s.*, m.status
FROM segments s
LEFT JOIN materials m ON s.material_id = m.id
WHERE s.segment_id = 'seg_123';
```

#### Step 5: 修復建議

| 問題 | 修復方案 |
|------|---------|
| 資料不存在 | 檢查建立邏輯,確保成功後才繼續 |
| 查詢結果為空 | 檢查查詢條件,是否拼寫錯誤或邏輯錯誤 |
| 資料不完整 | 加入欄位驗證,建立時檢查必填欄位 |
| Transaction 問題 | 檢查 rollback 邏輯,確保錯誤處理正確 |

---

## ⏱️ 時間軸診斷

### 識別特徵

Log 中出現:
- `validation_error: "InvalidTimelineStructure"`
- `validation_error: "InvalidSegmentTiming"`

### 診斷步驟

#### Step 1: 找出時間軸驗證失敗的 log

```json
{
  "level": "ERROR",
  "type": "data_flow_validation_failed",
  "data": {
    "validation_error": "InvalidSegmentTiming",
    "error_message": "Voice segment timing has gaps or overlaps",
    "error_details": {
      "validation_errors": [
        {
          "segment_index": 1,
          "error": "gap_detected",
          "message": "Gap between segment 0 and 1",
          "segment_end": 5.2,
          "next_segment_start": 6.0,
          "gap_duration": 0.8
        },
        {
          "segment_index": 3,
          "error": "overlap_detected",
          "message": "Segment 3 overlaps with segment 2",
          "segment_end": 15.5,
          "next_segment_start": 15.0,
          "overlap_duration": 0.5
        }
      ],
      "total_duration": 30.0,
      "segments_count": 5
    }
  }
}
```

#### Step 2: 視覺化時間軸

根據錯誤資訊,畫出時間軸:

```
Segment 0: [0.0 ────────── 5.2]
Segment 1:                        [6.0 ───── 10.5]  ← 縫隙 0.8 秒
Segment 2:                                [10.5 ──── 15.5]
Segment 3:                                       [15.0 ── 20.0]  ← 重疊 0.5 秒
Segment 4:                                               [20.0 ── 30.0]
```

#### Step 3: 檢查時間計算邏輯

**常見問題**:
1. **縫隙 (Gap)**: 前一個片段的 end 不等於下一個的 start
   - 原因: AI 切分時沒有無縫對接
   - 影響: 配音會有靜音

2. **重疊 (Overlap)**: 下一個片段的 start 小於前一個的 end
   - 原因: 時間計算錯誤
   - 影響: 配音會重複

3. **超出範圍**: 某個片段的 end > total_duration
   - 原因: 切分邏輯錯誤
   - 影響: 配音會被截斷

#### Step 4: 往前追溯切分邏輯

查看配音切分步驟的 log:

```bash
# 找出配音切分的 AI 呼叫
cat logs.json | jq '.logs[] | select(.service == "openai" and .operation == "voiceover_split")'
```

檢查:
- [ ] AI 回傳的切分結果是否正確?
- [ ] Prompt 是否要求無縫對接?
- [ ] 是否有後處理邏輯修正時間?

#### Step 5: 修復建議

**問題**: 配音切分有縫隙或重疊

**修復方案**:

**方案 1: 修改 AI Prompt**
```
You MUST ensure:
1. First segment starts at 0.0
2. Each segment's end time equals the next segment's start time (no gaps!)
3. Last segment ends at the total duration

Example for 10-second audio:
[
  { "start": 0.0, "end": 3.5, ... },
  { "start": 3.5, "end": 7.2, ... },  ← end of prev = start of next
  { "start": 7.2, "end": 10.0, ... }
]
```

**方案 2: 加入後處理邏輯**
```typescript
function fixSegmentTiming(segments: Segment[], totalDuration: number): Segment[] {
  const fixed = [...segments]

  // 修正第一個片段
  fixed[0].start = 0

  // 修正中間片段 (無縫對接)
  for (let i = 1; i < fixed.length; i++) {
    fixed[i].start = fixed[i - 1].end
  }

  // 修正最後一個片段
  fixed[fixed.length - 1].end = totalDuration

  return fixed
}
```

**方案 3: 允許小誤差**
```typescript
// 允許 0.1 秒的誤差
const TOLERANCE = 0.1

function validateSegmentTiming(segments: Segment[]): boolean {
  for (let i = 1; i < segments.length; i++) {
    const gap = segments[i].start - segments[i - 1].end
    if (Math.abs(gap) > TOLERANCE) {
      throw new Error(`Gap detected: ${gap}s`)
    }
  }
  return true
}
```

---

## 📊 綜合診斷: 查看失敗統計

當需要找出**共同問題**或**系統性問題**時,使用統計 API:

### 查看所有失敗任務

```bash
curl "http://localhost:8080/api/admin/logs/failures?period=7d"
```

**範例回應**:
```json
{
  "total": 15,
  "period": "7d",
  "failures": [
    {
      "executionId": "exec_001",
      "taskType": "video_generation",
      "failedStep": "ai_selection",        // ← 5 次失敗在這
      "errorMessage": "AI response validation failed",
      "timestamp": "..."
    },
    {
      "executionId": "exec_002",
      "taskType": "video_generation",
      "failedStep": "ai_selection",        // ← 5 次失敗在這
      "errorMessage": "AI response validation failed",
      "timestamp": "..."
    },
    // ... 更多
  ]
}
```

**分析**:
- 如果多個任務在**同一步驟**失敗 → 該步驟有 bug
- 如果多個任務有**同樣錯誤訊息** → 共同問題
- 如果某個用戶頻繁失敗 → 用戶資料有問題

### 查看 AI 服務失敗率

```bash
curl "http://localhost:8080/api/admin/logs/failure-rate?service=openai&period=7d"
```

**範例回應**:
```json
{
  "service": "openai",
  "totalCalls": 150,
  "failureCount": 8,
  "failureRate": 5.33,        // ← 5.33% 失敗率
  "errorTypes": {
    "RateLimitError": 5,      // ← 最常見錯誤
    "ValidationError": 3
  }
}
```

**分析**:
- 失敗率 > 5% → 需要優化
- `RateLimitError` 多 → 需要加入 rate limiting 或 retry
- `ValidationError` 多 → Prompt 需要改進

---

## 🛠️ 進階診斷: 資料庫直接查詢

當 API 不夠用時,直接查詢資料庫:

### 查詢特定錯誤類型

```sql
-- 查詢所有 AI 驗證失敗
SELECT
  execution_id,
  data->>'validation_error' as error_type,
  data->>'error_message' as message,
  data->'error_details'->'received_data' as ai_response,
  timestamp
FROM system_logs
WHERE type = 'ai_response_validation_failed'
ORDER BY timestamp DESC
LIMIT 20;
```

### 查詢特定步驟的平均執行時間

```sql
-- 查詢 AI 選片的平均耗時
SELECT
  AVG((data->>'duration_ms')::numeric) as avg_duration_ms,
  COUNT(*) as total_calls,
  COUNT(CASE WHEN level = 'ERROR' THEN 1 END) as failed_calls
FROM system_logs
WHERE step_name = 'ai_selection'
  AND type IN ('task_step_completed', 'task_failed')
  AND timestamp >= NOW() - INTERVAL '7 days';
```

### 查詢最耗費成本的操作

```sql
-- 查詢最貴的 AI 呼叫
SELECT
  execution_id,
  service,
  operation,
  model,
  cost,
  usage,
  timestamp
FROM api_costs
ORDER BY cost DESC
LIMIT 10;
```

### 追蹤資料流

```sql
-- 追蹤一個 execution 的完整資料流
SELECT
  timestamp,
  type,
  step_name,
  CASE
    WHEN level = 'ERROR' THEN '🔴 ' || type
    WHEN type LIKE '%_completed' THEN '✅ ' || type
    ELSE '⏳ ' || type
  END as status,
  data
FROM system_logs
WHERE execution_id = 'exec_7f8e9a0b'
ORDER BY timestamp ASC;
```

---

## 🎯 診斷範本: 給 AI 助手看的格式

當你要請 AI 幫忙診斷問題時,按照這個格式提供資訊:

```markdown
## 問題描述
[簡短描述問題,例如: "影片生成失敗"]

## 基本資訊
- **execution_id**: exec_7f8e9a0b
- **user_id**: user_test_001
- **task_type**: video_generation
- **錯誤訊息**: ValidationError: AI response validation failed

## 完整 Log
請查看以下 log 並診斷問題:

<details>
<summary>點擊展開完整 log</summary>

```json
{
  "executionId": "exec_7f8e9a0b",
  "summary": {
    "status": "failed",
    "failedAt": "ai_selection",
    "errorLogs": 2
  },
  "logs": [
    // ... 完整 logs 陣列
  ]
}
```

</details>

## 需要協助的部分
請幫我:
1. 找出失敗的根本原因
2. 提供修復建議
3. 如果需要查看更多資訊,告訴我要執行什麼查詢
```

**AI 會自動**:
1. 找出 `failedAt` 步驟
2. 查看對應的 ERROR log
3. 分析 `error_details`
4. 根據本文件的對應章節給出診斷
5. 提供具體的修復建議

---

## 🚀 快速參考: 常見問題速查表

| 看到這個錯誤 | 可能原因 | 快速修復 |
|-------------|---------|---------|
| `MissingRequiredField` | AI prompt 不清楚 | 改進 prompt,加入範例 |
| `InvalidReference` | AI 選了不存在的 ID | 檢查候選資料是否完整 |
| `FileNotFound` | 檔案未產生或路徑錯誤 | 檢查前一步驟,加強驗證 |
| `InvalidFileSize` | 檔案下載/產生失敗 | 檢查檔案操作,加入大小檢查 |
| `FFmpeg exited with code 1` | 輸入檔案有問題 | 檢查 stderr,驗證輸入檔案 |
| `InvalidTimelineStructure` | 時間計算錯誤 | 檢查 AI 切分結果,加入後處理 |
| `InvalidSegmentTiming` | 配音切分有縫隙/重疊 | 修改 prompt 或加入修正邏輯 |
| `RateLimitError` | API 呼叫太頻繁 | 加入 rate limiting |
| `db_operation_failed` | 資料不存在 | 檢查資料建立邏輯 |

---

## 📝 診斷檢查清單

每次診斷問題時,按照這個清單:

### 基礎檢查
- [ ] 收集 `execution_id`
- [ ] 呼叫 `GET /api/admin/logs/execution/:id`
- [ ] 查看 `summary.failedAt` 找出失敗步驟
- [ ] 查看 `summary.errorLogs` 確認有錯誤

### 錯誤分析
- [ ] 找出所有 `level: "ERROR"` 的 log
- [ ] 記錄每個錯誤的 `type` 和 `validation_error`
- [ ] 查看 `error_details` 中的完整資訊
- [ ] 往前找相關步驟的 log

### 根本原因
- [ ] 識別問題類型 (AI/驗證/檔案/FFmpeg/資料庫)
- [ ] 查看實際資料 vs 預期資料
- [ ] 追溯資料來源
- [ ] 找出為什麼資料不符預期

### 修復驗證
- [ ] 提出修復方案
- [ ] 測試修復方案
- [ ] 確認問題不再發生
- [ ] 更新相關文件

---

## 🎓 最佳實踐

### 1. 永遠從 execution_id 開始
不要直接看錯誤訊息,先用 API 查看完整流程。

### 2. 善用 error_details
所有關鍵資訊都在 `error_details` 中:
- 實際收到什麼資料
- 預期要什麼資料
- 哪些欄位有問題

### 3. 往前追溯
問題往往不在失敗的步驟,而在更早的步驟產生的資料。

### 4. 檢查 Fail Fast
如果某個步驟失敗但沒有立即停止 → Fail Fast 沒做好,需要加強驗證。

### 5. 記錄修復經驗
遇到新問題時,把診斷過程和修復方案記錄下來,更新本文件。

---

**文件版本**: 1.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊

**下次更新計劃**:
- 加入更多實際案例
- 加入圖表和流程圖
- 加入自動化診斷腳本
