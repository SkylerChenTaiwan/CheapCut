# 步驟 10：Logging & Monitoring 設計

**狀態**：🚧 進行中
**前置依賴**：05-data-flow.md
**目標**：設計系統的 logging、monitoring 與 observability 策略

---

## 核心設計哲學

### Fail Fast, Log Everything Needed（快速失敗，記錄所有必要資訊）

**核心原則**：
- ❌ **不要過度 fallback** - 錯誤發生時立即停止，不嘗試修復或繞過
- ✅ **詳細的錯誤上下文** - 記錄足夠資訊來重現問題
- ✅ **明確的失敗點** - 精準定位哪個步驟壞了
- ✅ **可追溯的執行路徑** - 從頭到尾看得到發生什麼事

**設計目標**：
> 寧願生成失敗並清楚知道問題在哪，也不要有很多 fallback 來掩蓋錯誤，最後生成的結果依然不能用。

---

## 流程一：素材上傳與處理的 Logging 設計

### 流程概覽

```
用戶上傳影片 (MP4)
  ↓
前端檔案驗證
  ↓
POST /api/materials/upload → 取得 presigned URL
  ↓
直接上傳到 S3/R2
  ↓
POST /api/materials/analyze → 開始分析
  ↓
[背景任務] 素材處理引擎
  ├─ Step 1: 呼叫 Video AI
  ├─ Step 2: 轉換標籤
  ├─ Step 3: 切分片段
  └─ Step 4: 生成縮圖
  ↓
寫入資料庫（segments、tags）
  ↓
完成
```

### Log 層級設計

#### 層級 1：HTTP 請求層（API Gateway）

**目的**：記錄每個 API 請求的基本資訊

```typescript
// 格式：JSON 結構化 log
{
  "level": "INFO",
  "timestamp": "2025-10-07T10:23:45.123Z",
  "type": "http_request",
  "method": "POST",
  "path": "/api/materials/analyze",
  "user_id": "user_abc123",
  "request_id": "req_xyz789",  // 用於串連後續 log
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "body": {
    "videoId": "video_001"
  },
  "status": 200,
  "duration_ms": 145
}
```

**何時記錄**：
- ✅ 每個 API 請求開始時
- ✅ 每個 API 請求結束時（含 status code 與 duration）

**失敗時**：
```typescript
{
  "level": "ERROR",
  "type": "http_request",
  "request_id": "req_xyz789",
  "error": "ValidationError: videoId is required",
  "stack_trace": "...",
  "status": 400
}
```

---

#### 層級 2：任務執行層（Background Job）

**目的**：追蹤背景任務的整體狀態

**Step 0: 任務開始**
```typescript
{
  "level": "INFO",
  "timestamp": "2025-10-07T10:23:46.000Z",
  "type": "task_started",
  "execution_id": "exec_001",
  "task_type": "material_analysis",
  "user_id": "user_abc123",
  "related_id": "video_001",
  "request_id": "req_xyz789",  // 關聯 HTTP 請求
  "input": {
    "videoId": "video_001",
    "filePath": "s3://bucket/videos/video_001.mp4",
    "duration": 120,
    "fileSize": 52428800  // 50MB
  },
  "steps": [
    "call_video_ai",
    "convert_tags",
    "split_segments",
    "generate_thumbnails"
  ]
}
```

**Step N: 步驟進度更新**
```typescript
{
  "level": "INFO",
  "type": "task_step_started",
  "execution_id": "exec_001",
  "step_index": 0,
  "step_name": "call_video_ai",
  "timestamp": "2025-10-07T10:23:46.100Z"
}
```

**Step N: 步驟完成**
```typescript
{
  "level": "INFO",
  "type": "task_step_completed",
  "execution_id": "exec_001",
  "step_index": 0,
  "step_name": "call_video_ai",
  "duration_ms": 15240,
  "timestamp": "2025-10-07T10:24:01.340Z",
  "result_summary": {
    "scenes_detected": 12,
    "labels_count": 45,
    "confidence_avg": 0.87
  }
}
```

**任務完成**
```typescript
{
  "level": "INFO",
  "type": "task_completed",
  "execution_id": "exec_001",
  "task_type": "material_analysis",
  "duration_ms": 28540,
  "total_cost": 0.10,
  "ai_calls_count": 1,
  "result_summary": {
    "segments_created": 12,
    "tags_created": 45,
    "thumbnails_generated": 12
  }
}
```

**任務失敗（關鍵！）**
```typescript
{
  "level": "ERROR",
  "type": "task_failed",
  "execution_id": "exec_001",
  "task_type": "material_analysis",
  "failed_step": "call_video_ai",
  "step_index": 0,
  "error_type": "VideoAIAPIError",
  "error_message": "Google Video AI returned 500: Internal Server Error",
  "error_details": {
    "api_endpoint": "https://videointelligence.googleapis.com/v1/videos:annotate",
    "request_id": "google_req_abc",
    "status_code": 500,
    "response_body": "{ error: 'Internal Server Error' }"
  },
  "context": {
    "videoId": "video_001",
    "filePath": "s3://bucket/videos/video_001.mp4",
    "videoDuration": 120,
    "retryAttempt": 0  // 第幾次重試
  },
  "stack_trace": "Error: VideoAIAPIError\n  at VideoAIService.analyze...",
  "timestamp": "2025-10-07T10:24:01.450Z"
}
```

---

#### 層級 3：AI 呼叫層（AI Service）

**目的**：記錄每次 AI API 呼叫的完整資訊

**AI 呼叫開始**
```typescript
{
  "level": "INFO",
  "type": "ai_call_started",
  "call_id": "ai_call_001",
  "execution_id": "exec_001",
  "step_name": "call_video_ai",
  "service": "google_video_ai",
  "operation": "video_analysis",
  "model": "video-intelligence-v1",
  "input": {
    "videoUri": "s3://bucket/videos/video_001.mp4",
    "features": ["LABEL_DETECTION", "SHOT_CHANGE_DETECTION"],
    "videoDuration": 120
  },
  "timestamp": "2025-10-07T10:23:46.100Z"
}
```

**AI 呼叫成功**
```typescript
{
  "level": "INFO",
  "type": "ai_call_completed",
  "call_id": "ai_call_001",
  "execution_id": "exec_001",
  "service": "google_video_ai",
  "duration_ms": 15240,
  "cost": 0.10,
  "result_summary": {
    "scenes_detected": 12,
    "labels_count": 45,
    "confidence_avg": 0.87
  },
  // ⚠️ 正式環境不存完整 response（太大）
  // ⚠️ 開發環境可以存（debug 用）
  "response": null,  // 或存到 S3 後提供 URL
  "timestamp": "2025-10-07T10:24:01.340Z"
}
```

**AI 呼叫失敗（超級重要！）**
```typescript
{
  "level": "ERROR",
  "type": "ai_call_failed",
  "call_id": "ai_call_001",
  "execution_id": "exec_001",
  "service": "google_video_ai",
  "operation": "video_analysis",
  "duration_ms": 5120,
  "error_type": "APIError",
  "error_message": "Google Video AI returned 500: Internal Server Error",
  "error_details": {
    "status_code": 500,
    "api_request_id": "google_req_abc",
    "response_headers": {
      "x-goog-request-id": "google_req_abc",
      "content-type": "application/json"
    },
    "response_body": "{ error: { code: 500, message: 'Internal Server Error' } }"
  },
  // ✅ 失敗時一定要存完整的 request payload（用於重現問題）
  "request_payload": {
    "videoUri": "s3://bucket/videos/video_001.mp4",
    "features": ["LABEL_DETECTION", "SHOT_CHANGE_DETECTION"]
  },
  "timestamp": "2025-10-07T10:23:51.220Z"
}
```

---

#### 層級 4：資料庫操作層（Database）

**目的**：記錄關鍵的資料庫操作（不是所有操作，只記錄關鍵的）

**何時記錄**：
- ✅ 批次寫入（insertMany）
- ✅ 資料庫交易（transaction）
- ❌ 單筆查詢（太多，不記錄）
- ✅ 失敗的查詢（一定要記錄）

**批次寫入成功**
```typescript
{
  "level": "INFO",
  "type": "db_operation",
  "execution_id": "exec_001",
  "operation": "insertMany",
  "table": "segments",
  "rows_affected": 12,
  "duration_ms": 45,
  "timestamp": "2025-10-07T10:24:01.400Z"
}
```

**資料庫操作失敗**
```typescript
{
  "level": "ERROR",
  "type": "db_operation_failed",
  "execution_id": "exec_001",
  "operation": "insertMany",
  "table": "segments",
  "error_type": "UniqueConstraintViolation",
  "error_message": "duplicate key value violates unique constraint \"segments_pkey\"",
  "error_details": {
    "constraint": "segments_pkey",
    "table": "segments",
    "detail": "Key (segment_id)=(seg_001) already exists."
  },
  // ✅ 記錄導致失敗的資料（脫敏後）
  "failed_data": {
    "segment_id": "seg_001",
    "video_id": "video_001",
    "start_time": 0,
    "end_time": 5
  },
  "timestamp": "2025-10-07T10:24:01.445Z"
}
```

---

### 流程一的完整 Log 範例（成功情況）

```json
[
  { "type": "http_request", "path": "/api/materials/analyze", "request_id": "req_xyz789", "user_id": "user_abc123" },
  { "type": "task_started", "execution_id": "exec_001", "task_type": "material_analysis", "request_id": "req_xyz789" },
  { "type": "task_step_started", "execution_id": "exec_001", "step_name": "call_video_ai", "step_index": 0 },
  { "type": "ai_call_started", "call_id": "ai_call_001", "execution_id": "exec_001", "service": "google_video_ai" },
  { "type": "ai_call_completed", "call_id": "ai_call_001", "duration_ms": 15240, "cost": 0.10 },
  { "type": "task_step_completed", "execution_id": "exec_001", "step_name": "call_video_ai", "duration_ms": 15240 },
  { "type": "task_step_started", "execution_id": "exec_001", "step_name": "convert_tags", "step_index": 1 },
  { "type": "task_step_completed", "execution_id": "exec_001", "step_name": "convert_tags", "duration_ms": 120 },
  { "type": "task_step_started", "execution_id": "exec_001", "step_name": "split_segments", "step_index": 2 },
  { "type": "task_step_completed", "execution_id": "exec_001", "step_name": "split_segments", "duration_ms": 85 },
  { "type": "task_step_started", "execution_id": "exec_001", "step_name": "generate_thumbnails", "step_index": 3 },
  { "type": "task_step_completed", "execution_id": "exec_001", "step_name": "generate_thumbnails", "duration_ms": 8240 },
  { "type": "db_operation", "operation": "insertMany", "table": "segments", "rows_affected": 12, "duration_ms": 45 },
  { "type": "db_operation", "operation": "insertMany", "table": "segment_tags", "rows_affected": 45, "duration_ms": 32 },
  { "type": "task_completed", "execution_id": "exec_001", "duration_ms": 28540, "total_cost": 0.10 }
]
```

### 流程一的完整 Log 範例（失敗情況）

```json
[
  { "type": "http_request", "path": "/api/materials/analyze", "request_id": "req_xyz789" },
  { "type": "task_started", "execution_id": "exec_001", "task_type": "material_analysis" },
  { "type": "task_step_started", "execution_id": "exec_001", "step_name": "call_video_ai", "step_index": 0 },
  { "type": "ai_call_started", "call_id": "ai_call_001", "service": "google_video_ai" },
  {
    "level": "ERROR",
    "type": "ai_call_failed",
    "call_id": "ai_call_001",
    "execution_id": "exec_001",
    "error_message": "Google Video AI returned 500: Internal Server Error",
    "request_payload": { "videoUri": "s3://bucket/videos/video_001.mp4" }
  },
  {
    "level": "ERROR",
    "type": "task_failed",
    "execution_id": "exec_001",
    "failed_step": "call_video_ai",
    "step_index": 0,
    "error_message": "Google Video AI returned 500: Internal Server Error"
  }
]
```

**關鍵點**：
- ✅ 可以清楚看到失敗在哪一步（`call_video_ai`）
- ✅ 有完整的錯誤訊息與 API 回應
- ✅ 有完整的 request payload（可以重現問題）
- ✅ 沒有繼續執行後續步驟（fail fast）

---

## 流程二：用戶上傳音檔生成影片的 Logging 設計

### 流程概覽

```
用戶上傳配音 (MP3)
  ↓
POST /api/voiceover/process
  ↓
[背景任務] 配音處理引擎
  ├─ Step 1: STT (Whisper)
  ├─ Step 2: 語意分析 (GPT-4)
  └─ Step 3: 配音切分 (GPT-4)
  ↓
POST /api/video/generate
  ↓
[背景任務] 智能選片引擎
  ├─ Step 1: 查詢候選片段
  ├─ Step 2: AI 選片決策 (GPT-4) × N
  ├─ Step 3: 配樂選擇 (GPT-4)
  └─ Step 4: 生成時間軸 JSON
  ↓
POST /api/video/render
  ↓
[背景任務] 影片合成引擎
  ├─ Step 1: 下載素材
  ├─ Step 2: FFmpeg 合成
  └─ Step 3: 上傳成品
  ↓
完成
```

### 配音處理引擎的 Logging

#### Step 1: STT（Whisper）

**開始**
```typescript
{
  "level": "INFO",
  "type": "task_step_started",
  "execution_id": "exec_vo_001",
  "step_name": "stt_whisper",
  "step_index": 0,
  "input": {
    "voiceoverId": "vo_001",
    "filePath": "s3://bucket/voiceovers/vo_001.mp3",
    "duration": 45.2,
    "fileSize": 1048576  // 1MB
  }
}
```

**AI 呼叫**
```typescript
{
  "type": "ai_call_started",
  "call_id": "ai_call_whisper_001",
  "execution_id": "exec_vo_001",
  "service": "openai_whisper",
  "model": "whisper-1",
  "operation": "speech_to_text",
  "input": {
    "file": "s3://bucket/voiceovers/vo_001.mp3",
    "language": "zh",
    "response_format": "verbose_json"
  }
}
```

**完成**
```typescript
{
  "type": "ai_call_completed",
  "call_id": "ai_call_whisper_001",
  "duration_ms": 3540,
  "cost": 0.0045,
  "result_summary": {
    "transcript_length": 145,
    "segments_count": 8,
    "language": "zh"
  },
  // ✅ 存完整的轉錄文字（用於 debug）
  "transcript": "大家好，今天要介紹我們的新產品...",
  // ⚠️ 正式環境可以選擇不存（隱私考量）
}
```

**失敗**
```typescript
{
  "level": "ERROR",
  "type": "ai_call_failed",
  "call_id": "ai_call_whisper_001",
  "error_message": "OpenAI Whisper API returned 400: Invalid audio format",
  "error_details": {
    "status_code": 400,
    "response_body": {
      "error": {
        "message": "Invalid audio format. Supported formats: mp3, wav, m4a",
        "type": "invalid_request_error"
      }
    }
  },
  // ✅ 記錄檔案資訊（用於重現問題）
  "file_info": {
    "filePath": "s3://bucket/voiceovers/vo_001.mp3",
    "fileSize": 1048576,
    "mimeType": "audio/mpeg",  // 實際檔案類型
    "fileExtension": ".mp3"
  }
}
```

---

#### Step 2: 語意分析（GPT-4）

**AI 呼叫開始**
```typescript
{
  "type": "ai_call_started",
  "call_id": "ai_call_gpt4_001",
  "execution_id": "exec_vo_001",
  "service": "openai",
  "model": "gpt-4-turbo",
  "operation": "semantic_analysis",
  "prompt_name": "semantic-analysis",
  "prompt_version": 3,
  "input": {
    "transcript": "大家好，今天要介紹我們的新產品...",
    "transcript_length": 145
  }
}
```

**完成**
```typescript
{
  "type": "ai_call_completed",
  "call_id": "ai_call_gpt4_001",
  "duration_ms": 2340,
  "cost": 0.015,
  "tokens": {
    "prompt": 250,
    "completion": 120,
    "total": 370
  },
  "result_summary": {
    "topics": ["產品介紹", "功能說明"],
    "keywords": ["特色", "優勢", "客戶"],
    "tone": "professional"
  },
  // ⚠️ 開發環境存完整 prompt（debug 用）
  // ⚠️ 正式環境不存（太大）
  "full_prompt": null,
  // ✅ 存完整 response（用於 debug AI 輸出）
  "full_response": {
    "topics": ["產品介紹", "功能說明"],
    "keywords": ["特色", "優勢", "客戶"],
    "tone": "professional"
  }
}
```

**失敗（AI 回應格式錯誤）**
```typescript
{
  "level": "ERROR",
  "type": "ai_call_failed",
  "call_id": "ai_call_gpt4_001",
  "error_type": "AIResponseParseError",
  "error_message": "Failed to parse AI response as JSON",
  "error_details": {
    "parseError": "Unexpected token 'T' at position 0",
    // ✅ 一定要存 AI 的原始回應（用於 debug prompt）
    "raw_response": "The transcript talks about a new product with three main features...",
    "expected_format": {
      "topics": ["string"],
      "keywords": ["string"],
      "tone": "string"
    }
  },
  // ✅ 存完整的 prompt（用於重現問題與優化 prompt）
  "full_prompt": "你是專業的語意分析師...",
  "prompt_name": "semantic-analysis",
  "prompt_version": 3
}
```

---

### 智能選片引擎的 Logging

#### Step 1: 查詢候選片段（Database）

```typescript
{
  "type": "task_step_started",
  "execution_id": "exec_gen_001",
  "step_name": "query_candidates",
  "step_index": 0,
  "input": {
    "voiceSegments": [
      { "text": "大家好，今天要介紹", "keywords": ["介紹", "產品"] },
      { "text": "這個產品有三大特色", "keywords": ["產品", "特色", "功能"] }
    ],
    "userId": "user_abc123"
  }
}
```

```typescript
{
  "type": "db_operation",
  "execution_id": "exec_gen_001",
  "operation": "query",
  "table": "segments",
  "query_type": "tag_match",
  "filters": {
    "tags": ["介紹", "產品"],
    "userId": "user_abc123",
    "minDuration": 6.4
  },
  "results_count": 15,
  "duration_ms": 23
}
```

**查詢失敗或結果為空（重要！）**
```typescript
{
  "level": "WARN",
  "type": "db_operation_empty_result",
  "execution_id": "exec_gen_001",
  "operation": "query",
  "table": "segments",
  "filters": {
    "tags": ["介紹", "產品"],
    "userId": "user_abc123"
  },
  "results_count": 0,
  // ⚠️ 這可能導致選片失敗，需要告警
  "impact": "No candidate segments found for voice segment 0",
  "suggestion": "User may need to upload more materials with tags: 介紹, 產品"
}
```

---

#### Step 2: AI 選片決策（GPT-4）

**每個配音片段都要記錄一次**

```typescript
{
  "type": "ai_call_started",
  "call_id": "ai_call_select_001",
  "execution_id": "exec_gen_001",
  "service": "openai",
  "model": "gpt-4-turbo",
  "operation": "segment_selection",
  "prompt_name": "segment-select",
  "prompt_version": 2,
  "input": {
    "voiceSegmentIndex": 0,
    "voiceText": "大家好，今天要介紹",
    "duration": 8,
    "candidatesCount": 15
  }
}
```

**完成**
```typescript
{
  "type": "ai_call_completed",
  "call_id": "ai_call_select_001",
  "duration_ms": 1840,
  "cost": 0.02,
  "tokens": {
    "prompt": 1200,
    "completion": 80,
    "total": 1280
  },
  "result": {
    "selectedSegmentId": "seg_045",
    "trimStart": 0,
    "trimEnd": 8,
    "reason": "最符合開場氛圍，有人物說話鏡頭"
  }
}
```

**失敗（AI 選了不存在的片段）**
```typescript
{
  "level": "ERROR",
  "type": "ai_call_invalid_result",
  "call_id": "ai_call_select_001",
  "error_type": "InvalidSegmentSelection",
  "error_message": "AI selected a segment ID that does not exist in candidates",
  "error_details": {
    "selectedSegmentId": "seg_999",  // 不存在
    "validCandidateIds": ["seg_045", "seg_046", "seg_047"],
    // ✅ 存 AI 的完整回應（用於 debug prompt）
    "ai_response": {
      "selectedSegmentId": "seg_999",
      "reason": "..."
    }
  },
  // ✅ 存完整的 prompt（用於優化 prompt）
  "full_prompt": "...",
  "prompt_name": "segment-select",
  "prompt_version": 2
}
```

---

### 影片合成引擎的 Logging

#### Step 1: 下載素材

```typescript
{
  "type": "task_step_started",
  "execution_id": "exec_render_001",
  "step_name": "download_segments",
  "input": {
    "segmentsCount": 8,
    "totalSize": 52428800  // 50MB
  }
}
```

**單個檔案下載失敗**
```typescript
{
  "level": "ERROR",
  "type": "file_operation_failed",
  "execution_id": "exec_render_001",
  "operation": "download",
  "file_path": "s3://bucket/segments/seg_045.mp4",
  "error_type": "S3DownloadError",
  "error_message": "Failed to download file from S3: NoSuchKey",
  "error_details": {
    "bucket": "bucket",
    "key": "segments/seg_045.mp4",
    "statusCode": 404
  },
  // ✅ 記錄相關的 segment 資訊
  "segment_info": {
    "segmentId": "seg_045",
    "videoId": "video_001",
    "userId": "user_abc123"
  }
}
```

---

#### Step 2: FFmpeg 合成

```typescript
{
  "type": "task_step_started",
  "execution_id": "exec_render_001",
  "step_name": "ffmpeg_compose",
  "input": {
    "segmentsCount": 8,
    "voiceoverPath": "s3://bucket/voiceovers/vo_001.mp3",
    "musicPath": "s3://bucket/music/bgm_001.mp3",
    "subtitlesCount": 8,
    "expectedDuration": 45
  }
}
```

**FFmpeg 執行失敗**
```typescript
{
  "level": "ERROR",
  "type": "ffmpeg_execution_failed",
  "execution_id": "exec_render_001",
  "error_message": "FFmpeg exited with code 1",
  "error_details": {
    "exitCode": 1,
    // ✅ 記錄 FFmpeg 的完整 stderr（超級重要！）
    "stderr": "Error: Invalid data found when processing input...",
    // ✅ 記錄 FFmpeg 指令（用於重現問題）
    "command": "ffmpeg -i input1.mp4 -i input2.mp4 -i voiceover.mp3 -filter_complex...",
    // ✅ 記錄所有輸入檔案資訊
    "input_files": [
      { "path": "/tmp/seg_045.mp4", "size": 5242880, "exists": true },
      { "path": "/tmp/seg_046.mp4", "size": 0, "exists": true },  // 檔案大小為 0！
      { "path": "/tmp/vo_001.mp3", "size": 1048576, "exists": true }
    ]
  }
}
```

---

## Log 資料表設計

### 統一的 Log 表（system_logs）

**為什麼不分表**：
- 所有 log 都需要按 `execution_id` 查詢
- 分表會增加查詢複雜度
- PostgreSQL 的 JSONB 欄位可以高效儲存不同結構的 log

```typescript
interface SystemLog {
  log_id: string              // UUID
  timestamp: Date             // log 時間（精確到毫秒）

  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  type: string                // log 類型（見下方列表）

  // 關聯資訊（用於串連 log）
  execution_id?: string       // 任務 ID
  request_id?: string         // HTTP 請求 ID
  user_id?: string            // 用戶 ID
  call_id?: string            // AI 呼叫 ID

  // Log 內容（JSONB）
  data: JSON                  // 完整的 log 資料

  // 索引欄位（方便查詢）
  service?: string            // 服務名稱（openai, google_video_ai 等）
  operation?: string          // 操作名稱（video_analysis, stt 等）
  step_name?: string          // 步驟名稱（call_video_ai 等）

  created_at: Date            // 資料庫寫入時間
}
```

### Log 類型清單

| 類型 | 用途 | 層級 |
|------|------|------|
| `http_request` | HTTP 請求 | INFO |
| `task_started` | 任務開始 | INFO |
| `task_step_started` | 步驟開始 | INFO |
| `task_step_completed` | 步驟完成 | INFO |
| `task_completed` | 任務完成 | INFO |
| `task_failed` | 任務失敗 | ERROR |
| `ai_call_started` | AI 呼叫開始 | INFO |
| `ai_call_completed` | AI 呼叫完成 | INFO |
| `ai_call_failed` | AI 呼叫失敗 | ERROR |
| `ai_call_invalid_result` | AI 回應格式錯誤 | ERROR |
| `db_operation` | 資料庫操作 | INFO |
| `db_operation_failed` | 資料庫操作失敗 | ERROR |
| `db_operation_empty_result` | 查詢結果為空 | WARN |
| `file_operation_failed` | 檔案操作失敗 | ERROR |
| `ffmpeg_execution_failed` | FFmpeg 執行失敗 | ERROR |

### 索引設計

```sql
-- 主要索引
CREATE INDEX idx_system_logs_execution_id ON system_logs(execution_id);
CREATE INDEX idx_system_logs_request_id ON system_logs(request_id);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_type ON system_logs(type);

-- 複合索引（用於常見查詢）
CREATE INDEX idx_system_logs_execution_level ON system_logs(execution_id, level);
CREATE INDEX idx_system_logs_user_timestamp ON system_logs(user_id, timestamp DESC);

-- JSONB 欄位索引（用於查詢特定欄位）
CREATE INDEX idx_system_logs_service ON system_logs(service);
CREATE INDEX idx_system_logs_step_name ON system_logs(step_name);
```

---

## Log 查詢 API 設計

### 1. 查詢任務的所有 Log

```
GET /api/admin/logs/execution/{executionId}
```

**回應**：
```typescript
{
  "executionId": "exec_001",
  "taskType": "material_analysis",
  "status": "failed",
  "logs": [
    { "type": "task_started", "timestamp": "2025-10-07T10:23:46.000Z", ... },
    { "type": "task_step_started", "step_name": "call_video_ai", ... },
    { "type": "ai_call_failed", "error_message": "...", ... },
    { "type": "task_failed", "failed_step": "call_video_ai", ... }
  ],
  "summary": {
    "totalLogs": 4,
    "errorLogs": 2,
    "duration": null,
    "failedAt": "call_video_ai"
  }
}
```

### 2. 查詢用戶的所有失敗任務

```
GET /api/admin/logs/failures?userId={userId}&period=7d
```

**回應**：
```typescript
{
  "failures": [
    {
      "executionId": "exec_001",
      "taskType": "material_analysis",
      "failedStep": "call_video_ai",
      "errorMessage": "Google Video AI returned 500",
      "timestamp": "2025-10-07T10:24:01.450Z"
    },
    {
      "executionId": "exec_005",
      "taskType": "video_generation",
      "failedStep": "ffmpeg_compose",
      "errorMessage": "FFmpeg exited with code 1",
      "timestamp": "2025-10-06T15:30:22.120Z"
    }
  ],
  "total": 2
}
```

### 3. 查詢特定服務的失敗率

```
GET /api/admin/logs/failure-rate?service=google_video_ai&period=7d
```

**回應**：
```typescript
{
  "service": "google_video_ai",
  "period": "7d",
  "totalCalls": 150,
  "failedCalls": 3,
  "failureRate": 0.02,  // 2%
  "errors": [
    { "errorType": "APIError", "count": 2, "message": "500 Internal Server Error" },
    { "errorType": "TimeoutError", "count": 1, "message": "Request timeout" }
  ]
}
```

---

## Logger 服務實作

### Logger 類別設計

```typescript
import { v4 as uuid } from 'uuid'

interface LogContext {
  execution_id?: string
  request_id?: string
  user_id?: string
  call_id?: string
}

class Logger {
  private context: LogContext

  constructor(context: LogContext = {}) {
    this.context = context
  }

  // 建立 child logger（繼承 context）
  child(additionalContext: Partial<LogContext>): Logger {
    return new Logger({ ...this.context, ...additionalContext })
  }

  // 記錄 log
  async log(
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
    type: string,
    data: any,
    options?: {
      service?: string
      operation?: string
      step_name?: string
    }
  ) {
    const logEntry = {
      log_id: uuid(),
      timestamp: new Date(),
      level,
      type,
      ...this.context,
      ...options,
      data,
      created_at: new Date()
    }

    // 寫入資料庫
    await db.system_logs.insert(logEntry)

    // 同時寫到 console（開發環境）
    if (process.env.NODE_ENV !== 'production') {
      console.log(JSON.stringify(logEntry, null, 2))
    }

    // ERROR 級別的 log 立即告警
    if (level === 'ERROR') {
      await this.alertError(logEntry)
    }
  }

  // 快捷方法
  info(type: string, data: any, options?: any) {
    return this.log('INFO', type, data, options)
  }

  error(type: string, data: any, options?: any) {
    return this.log('ERROR', type, data, options)
  }

  warn(type: string, data: any, options?: any) {
    return this.log('WARN', type, data, options)
  }

  debug(type: string, data: any, options?: any) {
    return this.log('DEBUG', type, data, options)
  }

  // 錯誤告警
  private async alertError(logEntry: any) {
    // 可以接入告警系統（Slack、Email 等）
    console.error('[ERROR ALERT]', logEntry)
  }
}

export default Logger
```

### 使用範例

```typescript
class MaterialProcessingEngine {
  async analyze(videoId: string, userId: string) {
    // 建立 execution logger
    const executionId = uuid()
    const logger = new Logger({ execution_id: executionId, user_id: userId })

    // 記錄任務開始
    await logger.info('task_started', {
      task_type: 'material_analysis',
      related_id: videoId,
      input: { videoId }
    })

    try {
      // Step 1: 呼叫 Video AI
      await logger.info('task_step_started', {
        step_index: 0,
        step_name: 'call_video_ai'
      }, { step_name: 'call_video_ai' })

      const aiCallId = uuid()
      const aiLogger = logger.child({ call_id: aiCallId })

      await aiLogger.info('ai_call_started', {
        service: 'google_video_ai',
        operation: 'video_analysis',
        input: { videoUri: video.file_path }
      }, { service: 'google_video_ai', operation: 'video_analysis' })

      const aiResult = await googleVideoAI.analyze(video.file_path)

      await aiLogger.info('ai_call_completed', {
        duration_ms: 15240,
        cost: 0.10,
        result_summary: { scenes_detected: 12 }
      })

      await logger.info('task_step_completed', {
        step_index: 0,
        step_name: 'call_video_ai',
        duration_ms: 15240
      })

      // ... 後續步驟

      // 任務完成
      await logger.info('task_completed', {
        duration_ms: 28540,
        total_cost: 0.10
      })

    } catch (error) {
      // 記錄失敗
      await logger.error('task_failed', {
        failed_step: 'call_video_ai',
        error_type: error.constructor.name,
        error_message: error.message,
        stack_trace: error.stack
      })

      throw error  // ✅ 不 fallback，直接拋出錯誤
    }
  }
}
```

---

## 環境配置

### 開發環境

```typescript
const LOG_CONFIG = {
  // 所有 log 都記錄
  level: 'DEBUG',

  // 存完整的 AI request/response
  storeFullAIPayload: true,

  // 存完整的 prompt/response
  storeFullPrompt: true,

  // 同時輸出到 console
  consoleOutput: true,

  // 不脫敏
  maskSensitiveData: false
}
```

### 正式環境

```typescript
const LOG_CONFIG = {
  // 只記錄 INFO 以上
  level: 'INFO',

  // 不存完整的 AI payload（太大）
  storeFullAIPayload: false,

  // 只在失敗時存 prompt
  storeFullPrompt: 'on_error_only',

  // 不輸出到 console
  consoleOutput: false,

  // 脫敏敏感資料
  maskSensitiveData: true
}
```

---

## 敏感資料處理

### 脫敏規則

```typescript
function maskSensitiveData(data: any): any {
  if (typeof data === 'string') {
    // Email 脫敏
    data = data.replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '***@$2')

    // 電話號碼脫敏
    data = data.replace(/(\d{4})\d{4}(\d{2})/g, '$1****$2')

    // 身分證字號脫敏
    data = data.replace(/([A-Z]\d{2})\d{6}(\d)/g, '$1******$2')
  }

  if (typeof data === 'object' && data !== null) {
    for (const key in data) {
      // API Key 完全隱藏
      if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token')) {
        data[key] = '***'
      } else {
        data[key] = maskSensitiveData(data[key])
      }
    }
  }

  return data
}
```

---

## 資料流傳接驗證（Data Contract Validation）

### 核心問題

**場景**：A 模組輸出資料給 B 模組，但 B 模組無法使用：
- AI 回傳的 JSON 格式不符合預期
- 欄位缺失（expected `keywords` but got `tags`）
- 資料型別錯誤（expected `number` but got `string`）
- 數值超出範圍（duration 是負數、confidence > 1.0）
- 關聯資料不存在（segment_id 在資料庫中查不到）

### 設計原則

**✅ 在資料交接點進行驗證並記錄**

每個模組：
1. **輸出前驗證**：確保輸出符合約定格式
2. **輸入後驗證**：確保收到的資料可用
3. **驗證失敗立即記錄並停止**：不嘗試修復或猜測

---

## 驗證點設計

### 驗證點 1：AI 回應 → 業務邏輯

**問題**：AI 回傳的格式不符合預期

#### 範例：語意分析

**預期格式**（Schema）：
```typescript
interface SemanticAnalysisResult {
  topics: string[]           // 必填，至少 1 個
  keywords: string[]         // 必填，至少 1 個
  tone: 'professional' | 'casual' | 'enthusiastic'  // 必填，enum
}
```

**驗證失敗的情況**：

**情況 1：AI 回傳非 JSON**
```typescript
{
  "level": "ERROR",
  "type": "ai_response_validation_failed",
  "call_id": "ai_call_gpt4_001",
  "execution_id": "exec_vo_001",
  "validation_error": "InvalidJSON",
  "error_message": "AI response is not valid JSON",
  "error_details": {
    "raw_response": "The transcript discusses a new product with three main features...",
    "parse_error": "Unexpected token 'T' at position 0"
  },
  "expected_schema": {
    "topics": ["string"],
    "keywords": ["string"],
    "tone": "string"
  },
  // ✅ 記錄完整的 prompt（用於優化）
  "full_prompt": "你是專業的語意分析師。請以 JSON 格式回應...",
  "prompt_name": "semantic-analysis",
  "prompt_version": 3
}
```

**情況 2：AI 回傳 JSON，但欄位缺失**
```typescript
{
  "level": "ERROR",
  "type": "ai_response_validation_failed",
  "call_id": "ai_call_gpt4_001",
  "validation_error": "MissingRequiredField",
  "error_message": "AI response missing required field: keywords",
  "error_details": {
    "missing_fields": ["keywords"],
    "received_data": {
      "topics": ["產品介紹", "功能說明"],
      "tone": "professional"
      // ❌ 缺少 keywords
    },
    "expected_schema": {
      "topics": ["string"],
      "keywords": ["string"],  // ← 必填但缺失
      "tone": "string"
    }
  },
  "full_prompt": "...",
  "prompt_name": "semantic-analysis",
  "prompt_version": 3
}
```

**情況 3：欄位型別錯誤**
```typescript
{
  "level": "ERROR",
  "type": "ai_response_validation_failed",
  "call_id": "ai_call_gpt4_001",
  "validation_error": "InvalidFieldType",
  "error_message": "Field 'keywords' has invalid type",
  "error_details": {
    "field": "keywords",
    "expected_type": "array",
    "actual_type": "string",
    "received_value": "特色, 優勢, 客戶",  // ❌ 應該是 array，但收到 string
    "received_data": {
      "topics": ["產品介紹"],
      "keywords": "特色, 優勢, 客戶",  // 錯誤
      "tone": "professional"
    }
  },
  "full_prompt": "...",
  "prompt_name": "semantic-analysis",
  "prompt_version": 3
}
```

**情況 4：數值超出合理範圍**
```typescript
{
  "level": "ERROR",
  "type": "ai_response_validation_failed",
  "call_id": "ai_call_select_001",
  "validation_error": "InvalidValueRange",
  "error_message": "Field 'trimEnd' exceeds segment duration",
  "error_details": {
    "field": "trimEnd",
    "value": 15,
    "constraint": "must be <= segment.duration (10)",
    "segment_info": {
      "segment_id": "seg_045",
      "duration": 10
    },
    "received_data": {
      "selectedSegmentId": "seg_045",
      "trimStart": 0,
      "trimEnd": 15  // ❌ 片段只有 10 秒，但要裁到 15 秒
    }
  }
}
```

---

### 驗證點 2：資料庫查詢 → 業務邏輯

**問題**：查詢結果為空或不符合預期

#### 範例：查詢候選片段

**驗證失敗的情況**：

**情況 1：查詢結果為空**
```typescript
{
  "level": "ERROR",
  "type": "data_flow_validation_failed",
  "execution_id": "exec_gen_001",
  "validation_error": "EmptyQueryResult",
  "error_message": "No candidate segments found for voice segment",
  "error_details": {
    "from_module": "database",
    "to_module": "intelligent_clip_engine",
    "query_filters": {
      "tags": ["介紹", "產品"],
      "userId": "user_abc123",
      "minDuration": 8
    },
    "expected": "at least 1 segment",
    "actual": "0 segments"
  },
  "context": {
    "voiceSegmentIndex": 0,
    "voiceText": "大家好，今天要介紹",
    "voiceDuration": 8
  },
  "impact": "Cannot proceed with segment selection - no materials available",
  "suggestion": "User needs to upload more materials with tags: 介紹, 產品"
}
```

**情況 2：查詢結果資料不完整**
```typescript
{
  "level": "ERROR",
  "type": "data_flow_validation_failed",
  "execution_id": "exec_gen_001",
  "validation_error": "IncompleteQueryResult",
  "error_message": "Candidate segment missing required fields",
  "error_details": {
    "from_module": "database",
    "to_module": "intelligent_clip_engine",
    "missing_fields": ["thumbnail_url"],
    "affected_segments": [
      { "segment_id": "seg_045", "missing": ["thumbnail_url"] },
      { "segment_id": "seg_046", "missing": ["thumbnail_url"] }
    ],
    "total_segments": 15,
    "affected_count": 2
  },
  "impact": "Cannot display candidate segments without thumbnails"
}
```

---

### 驗證點 3：AI 選片結果 → 時間軸生成

**問題**：AI 選了不存在的片段

```typescript
{
  "level": "ERROR",
  "type": "data_flow_validation_failed",
  "execution_id": "exec_gen_001",
  "validation_error": "InvalidReference",
  "error_message": "AI selected segment ID does not exist in candidate list",
  "error_details": {
    "from_module": "ai_segment_selection",
    "to_module": "timeline_generator",
    "invalid_id": "seg_999",
    "valid_ids": ["seg_045", "seg_046", "seg_047", "seg_048"],
    "ai_response": {
      "selectedSegmentId": "seg_999",  // ❌ 不在候選列表中
      "trimStart": 0,
      "trimEnd": 8,
      "reason": "最符合開場氛圍"
    }
  },
  "context": {
    "voiceSegmentIndex": 0,
    "candidatesProvided": 4
  },
  "full_prompt": "...",
  "prompt_name": "segment-select",
  "prompt_version": 2
}
```

---

### 驗證點 4：時間軸 JSON → 影片合成引擎

**問題**：時間軸資料無法使用

**情況 1：檔案路徑不存在**
```typescript
{
  "level": "ERROR",
  "type": "data_flow_validation_failed",
  "execution_id": "exec_render_001",
  "validation_error": "FileNotFound",
  "error_message": "Segment file does not exist in S3",
  "error_details": {
    "from_module": "timeline_generator",
    "to_module": "video_render_engine",
    "file_path": "s3://bucket/segments/seg_045.mp4",
    "segment_info": {
      "segment_id": "seg_045",
      "video_id": "video_001",
      "in_timeline_index": 0
    },
    "s3_check_result": {
      "exists": false,
      "error": "NoSuchKey"
    }
  },
  "context": {
    "timeline_id": "timeline_001",
    "total_segments": 8
  },
  "impact": "Cannot render video - missing segment file"
}
```

**情況 2：檔案大小為 0**
```typescript
{
  "level": "ERROR",
  "type": "data_flow_validation_failed",
  "execution_id": "exec_render_001",
  "validation_error": "InvalidFileSize",
  "error_message": "Downloaded segment file is empty",
  "error_details": {
    "from_module": "file_download",
    "to_module": "ffmpeg_composer",
    "file_path": "/tmp/seg_046.mp4",
    "file_size": 0,  // ❌ 檔案大小為 0
    "expected": "> 0 bytes",
    "segment_info": {
      "segment_id": "seg_046",
      "s3_path": "s3://bucket/segments/seg_046.mp4"
    }
  },
  "impact": "FFmpeg will fail on this file"
}
```

**情況 3：時間軸 JSON 結構錯誤**
```typescript
{
  "level": "ERROR",
  "type": "data_flow_validation_failed",
  "execution_id": "exec_render_001",
  "validation_error": "InvalidTimelineStructure",
  "error_message": "Timeline segment has invalid time range",
  "error_details": {
    "from_module": "timeline_generator",
    "to_module": "video_render_engine",
    "validation_errors": [
      {
        "segment_index": 2,
        "error": "start_time >= end_time",
        "data": {
          "start_time": 10,
          "end_time": 8  // ❌ 結束時間比開始時間早
        }
      },
      {
        "segment_index": 5,
        "error": "video_trim_end > segment.duration",
        "data": {
          "video_segment_id": "seg_078",
          "video_trim_start": 0,
          "video_trim_end": 15,  // ❌ 超過片段長度
          "segment_duration": 10
        }
      }
    ]
  },
  "timeline_id": "timeline_001"
}
```

---

### 驗證點 5：配音切分結果 → 智能選片引擎

**問題**：配音切分結果格式錯誤

```typescript
{
  "level": "ERROR",
  "type": "data_flow_validation_failed",
  "execution_id": "exec_vo_001",
  "validation_error": "InvalidSegmentTiming",
  "error_message": "Voice segment timing overlaps or has gaps",
  "error_details": {
    "from_module": "voiceover_split",
    "to_module": "intelligent_clip_engine",
    "validation_errors": [
      {
        "segment_index": 1,
        "error": "gap_detected",
        "message": "Gap between segment 0 and 1",
        "segment_0_end": 8,
        "segment_1_start": 10,  // ❌ 有 2 秒空隙
        "gap_duration": 2
      },
      {
        "segment_index": 3,
        "error": "overlap_detected",
        "message": "Segment 3 overlaps with segment 2",
        "segment_2_end": 20,
        "segment_3_start": 18,  // ❌ 有 2 秒重疊
        "overlap_duration": 2
      },
      {
        "segment_index": 5,
        "error": "exceeds_total_duration",
        "message": "Segment end time exceeds voiceover duration",
        "segment_end": 50,
        "voiceover_duration": 45  // ❌ 超過配音總長度
      }
    ],
    "voiceover_id": "vo_001",
    "total_duration": 45
  },
  "ai_response": {
    "segments": [
      { "start": 0, "end": 8, "text": "..." },
      { "start": 10, "end": 18, "text": "..." },  // gap
      { "start": 18, "end": 22, "text": "..." },  // overlap
      // ...
    ]
  },
  "prompt_name": "voiceover-split",
  "prompt_version": 3
}
```

---

## 驗證器實作設計

### Schema 定義與驗證

```typescript
import Joi from 'joi'  // 或使用 zod

// 定義每個資料流的 Schema
const SCHEMAS = {
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
  })
}
```

### 驗證器類別

```typescript
class DataFlowValidator {
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  // 驗證 AI 回應
  async validateAIResponse(
    callId: string,
    schemaName: string,
    data: any,
    additionalChecks?: (data: any) => ValidationError[]
  ): Promise<void> {
    const schema = SCHEMAS[schemaName]
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
          expected_schema: this.getSchemaDescription(schema)
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

        throw new ValidationError(`Business logic validation failed`)
      }
    }
  }

  // 驗證資料流傳接
  async validateDataFlow(
    fromModule: string,
    toModule: string,
    schemaName: string,
    data: any,
    context?: any
  ): Promise<void> {
    const schema = SCHEMAS[schemaName]
    const { error } = schema.validate(data, { abortEarly: false })

    if (error) {
      await this.logger.error('data_flow_validation_failed', {
        validation_error: this.getValidationErrorType(error),
        error_message: error.message,
        error_details: {
          from_module: fromModule,
          to_module: toModule,
          validation_errors: error.details,
          received_data: data
        },
        context
      })

      throw new ValidationError(`Data flow validation failed: ${fromModule} → ${toModule}`)
    }
  }

  // 驗證檔案是否可用
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
        validation_error: 'InvalidFile',
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

  // 驗證參照完整性（例如：AI 選的 segment_id 是否在候選列表中）
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
          context
        }
      })

      throw new ValidationError(`Invalid reference: ${selectedId}`)
    }
  }

  private getValidationErrorType(error: any): string {
    if (error.details[0].type.includes('required')) {
      return 'MissingRequiredField'
    }
    if (error.details[0].type.includes('type')) {
      return 'InvalidFieldType'
    }
    if (error.details[0].type.includes('min') || error.details[0].type.includes('max')) {
      return 'InvalidValueRange'
    }
    return 'SchemaValidationError'
  }

  private async getFileInfo(filePath: string) {
    // 實作檔案檢查邏輯
    if (filePath.startsWith('s3://')) {
      return await this.checkS3File(filePath)
    } else {
      return await this.checkLocalFile(filePath)
    }
  }
}
```

### 使用範例

```typescript
class VoiceoverProcessingEngine {
  async process(voiceoverId: string, userId: string) {
    const logger = new Logger({ execution_id: executionId, user_id: userId })
    const validator = new DataFlowValidator(logger)

    // Step 1: STT
    const sttResult = await whisper.transcribe(voiceover.file_path)

    // Step 2: 語意分析
    const callId = uuid()
    const aiResult = await openai.chat({ ... })

    // ✅ 驗證 AI 回應
    try {
      await validator.validateAIResponse(
        callId,
        'semantic_analysis',
        aiResult,
        // 額外的業務邏輯驗證
        (data) => {
          const errors = []
          if (data.keywords.length > 20) {
            errors.push({
              field: 'keywords',
              message: 'Too many keywords (max 20)',
              value: data.keywords.length
            })
          }
          return errors
        }
      )
    } catch (error) {
      // ❌ 驗證失敗，已經記錄 log，直接拋出錯誤
      throw error
    }

    // 繼續處理...
  }
}

class IntelligentClipEngine {
  async selectClips(voiceoverId: string, userId: string) {
    const logger = new Logger({ execution_id: executionId, user_id: userId })
    const validator = new DataFlowValidator(logger)

    // Step 1: 查詢候選片段
    const candidates = await db.query(...)

    // ✅ 驗證查詢結果
    if (candidates.length === 0) {
      await logger.error('data_flow_validation_failed', {
        validation_error: 'EmptyQueryResult',
        error_message: 'No candidate segments found',
        error_details: {
          from_module: 'database',
          to_module: 'intelligent_clip_engine',
          query_filters: { ... }
        }
      })
      throw new ValidationError('No candidate segments found')
    }

    // Step 2: AI 選片
    const aiResult = await openai.chat({ ... })

    // ✅ 驗證 AI 選片結果
    await validator.validateAIResponse(callId, 'segment_selection', aiResult)

    // ✅ 驗證參照完整性
    const candidateIds = candidates.map(c => c.segment_id)
    await validator.validateReference(
      aiResult.selectedSegmentId,
      candidateIds,
      { voiceSegmentIndex: i }
    )

    // ✅ 驗證數值範圍
    const selectedSegment = candidates.find(c => c.segment_id === aiResult.selectedSegmentId)
    if (aiResult.trimEnd > selectedSegment.duration) {
      await logger.error('data_flow_validation_failed', {
        validation_error: 'InvalidValueRange',
        error_message: 'trimEnd exceeds segment duration',
        error_details: {
          trim_end: aiResult.trimEnd,
          segment_duration: selectedSegment.duration
        }
      })
      throw new ValidationError('Invalid trim range')
    }
  }
}

class VideoRenderEngine {
  async render(timelineId: string, userId: string) {
    const logger = new Logger({ execution_id: executionId, user_id: userId })
    const validator = new DataFlowValidator(logger)

    const timeline = await db.timelines.findOne(timelineId)

    // ✅ 驗證時間軸 JSON 結構
    await validator.validateDataFlow(
      'timeline_generator',
      'video_render_engine',
      'timeline',
      timeline.timeline_json
    )

    // ✅ 驗證所有檔案是否存在且可用
    for (const segment of timeline.timeline_json.segments) {
      const segmentData = await db.segments.findOne(segment.video_segment_id)

      await validator.validateFile(segmentData.file_path, {
        mustExist: true,
        minSize: 1024  // 至少 1KB
      })
    }

    // 繼續渲染...
  }
}
```

---

## Log 儲存策略與查詢方式

### 核心問題

**在測試與 Debug 時，我們需要快速找到 Log**：
- 知道 Log 存在哪裡
- 知道如何快速查詢特定任務的 Log
- 知道如何查詢失敗的任務
- 在開發環境與正式環境有不同的查詢方式

---

## Log 儲存位置設計

### 方案：雙寫策略（PostgreSQL + 開發環境 Console）

#### 主要儲存：PostgreSQL `system_logs` 表

**為什麼選 PostgreSQL**：
- ✅ 可以用 SQL 查詢（按 execution_id、user_id、時間範圍等）
- ✅ 支援 JSONB 欄位（彈性儲存不同結構的 log）
- ✅ 已經有 PostgreSQL（不需要額外的基礎設施）
- ✅ 可以 JOIN 其他表（例如：task_executions、users）
- ✅ 有完整的備份機制

**為什麼不用檔案系統**：
- ❌ 查詢困難（需要 grep 或其他工具）
- ❌ 分散在多個檔案（不好聚合）
- ❌ 沒有結構化查詢能力

**為什麼不用專門的 Log 服務（例如：Elasticsearch、CloudWatch）**：
- ❌ MVP 階段增加複雜度
- ❌ 額外成本
- ⚠️ 未來如果 log 量很大（> 1M logs/day），可以考慮

---

#### 輔助輸出：開發環境 Console

**開發環境同時輸出到 console**：
```typescript
if (process.env.NODE_ENV !== 'production') {
  console.log(JSON.stringify(logEntry, null, 2))
}
```

**好處**：
- 開發時可以即時看到 log
- 不需要查詢資料庫

---

## 如何查詢 Log（按場景）

### 場景 1：測試時想看某個任務的所有 Log

#### 方法 1：直接查詢資料庫（開發環境）

```sql
-- 查詢特定 execution_id 的所有 log
SELECT
  timestamp,
  level,
  type,
  step_name,
  data
FROM system_logs
WHERE execution_id = 'exec_001'
ORDER BY timestamp ASC;
```

**何時使用**：
- 開發環境測試時
- 有資料庫存取權限時

---

#### 方法 2：使用管理後台 API

```bash
# 查詢任務的所有 log
curl http://localhost:3000/api/admin/logs/execution/exec_001
```

**回應**：
```json
{
  "executionId": "exec_001",
  "taskType": "material_analysis",
  "status": "failed",
  "logs": [
    {
      "timestamp": "2025-10-07T10:23:46.000Z",
      "level": "INFO",
      "type": "task_started",
      "data": { "task_type": "material_analysis", "input": {...} }
    },
    {
      "timestamp": "2025-10-07T10:23:46.100Z",
      "level": "INFO",
      "type": "ai_call_started",
      "data": { "service": "google_video_ai", ... }
    },
    {
      "timestamp": "2025-10-07T10:23:51.220Z",
      "level": "ERROR",
      "type": "ai_call_failed",
      "data": { "error_message": "...", "request_payload": {...} }
    }
  ],
  "summary": {
    "totalLogs": 3,
    "errorLogs": 1,
    "failedAt": "call_video_ai"
  }
}
```

**何時使用**：
- 沒有資料庫存取權限時
- 需要給非技術人員查看時
- 需要格式化的輸出時

---

#### 方法 3：開發環境看 Console 輸出

**步驟**：
1. 開啟終端機，執行後端服務
2. 觸發任務（例如：上傳影片）
3. 在終端機中即時看到 log 輸出

**範例輸出**：
```json
{
  "level": "INFO",
  "timestamp": "2025-10-07T10:23:46.000Z",
  "type": "task_started",
  "execution_id": "exec_001",
  "data": {
    "task_type": "material_analysis",
    "input": { "videoId": "video_001" }
  }
}
{
  "level": "ERROR",
  "timestamp": "2025-10-07T10:23:51.220Z",
  "type": "ai_call_failed",
  "execution_id": "exec_001",
  "data": {
    "error_message": "Google Video AI returned 500",
    "request_payload": { "videoUri": "s3://..." }
  }
}
```

**何時使用**：
- 開發時即時 debug
- 快速驗證 log 是否正確記錄

---

### 場景 2：想看所有失敗的任務

#### SQL 查詢

```sql
-- 查詢最近 24 小時內所有失敗的任務
SELECT DISTINCT
  l.execution_id,
  l.user_id,
  l.data->>'task_type' as task_type,
  l.data->>'failed_step' as failed_step,
  l.data->>'error_message' as error_message,
  l.timestamp as failed_at
FROM system_logs l
WHERE l.type = 'task_failed'
  AND l.timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY l.timestamp DESC;
```

---

#### API 查詢

```bash
# 查詢所有失敗任務（最近 7 天）
curl http://localhost:3000/api/admin/logs/failures?period=7d
```

**回應**：
```json
{
  "failures": [
    {
      "executionId": "exec_001",
      "taskType": "material_analysis",
      "failedStep": "call_video_ai",
      "errorMessage": "Google Video AI returned 500",
      "timestamp": "2025-10-07T10:24:01.450Z",
      "userId": "user_abc123"
    },
    {
      "executionId": "exec_005",
      "taskType": "video_generation",
      "failedStep": "ffmpeg_compose",
      "errorMessage": "FFmpeg exited with code 1",
      "timestamp": "2025-10-06T15:30:22.120Z",
      "userId": "user_abc123"
    }
  ],
  "total": 2
}
```

---

### 場景 3：想看某個用戶的所有任務

#### SQL 查詢

```sql
-- 查詢某用戶的所有任務執行記錄
SELECT
  l.execution_id,
  l.data->>'task_type' as task_type,
  l.timestamp as started_at,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM system_logs l2
      WHERE l2.execution_id = l.execution_id
        AND l2.type = 'task_failed'
    ) THEN 'failed'
    WHEN EXISTS (
      SELECT 1 FROM system_logs l2
      WHERE l2.execution_id = l.execution_id
        AND l2.type = 'task_completed'
    ) THEN 'completed'
    ELSE 'processing'
  END as status
FROM system_logs l
WHERE l.type = 'task_started'
  AND l.user_id = 'user_abc123'
ORDER BY l.timestamp DESC
LIMIT 50;
```

---

#### API 查詢

```bash
# 查詢用戶的任務歷史
curl http://localhost:3000/api/admin/logs/user/user_abc123/tasks
```

---

### 場景 4：想看某個 AI 服務的失敗率

#### SQL 查詢

```sql
-- 查詢 Google Video AI 的成功率（最近 7 天）
WITH ai_calls AS (
  SELECT
    CASE
      WHEN type = 'ai_call_completed' THEN 'success'
      WHEN type = 'ai_call_failed' THEN 'failure'
    END as result
  FROM system_logs
  WHERE service = 'google_video_ai'
    AND type IN ('ai_call_completed', 'ai_call_failed')
    AND timestamp >= NOW() - INTERVAL '7 days'
)
SELECT
  COUNT(*) FILTER (WHERE result = 'success') as success_count,
  COUNT(*) FILTER (WHERE result = 'failure') as failure_count,
  COUNT(*) as total_count,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'failure')::numeric / COUNT(*)::numeric * 100,
    2
  ) as failure_rate_percentage
FROM ai_calls;
```

---

#### API 查詢

```bash
# 查詢服務失敗率
curl http://localhost:3000/api/admin/logs/failure-rate?service=google_video_ai&period=7d
```

---

### 場景 5：想重現某個錯誤

#### 步驟

1. **找到失敗的 execution_id**

```sql
SELECT execution_id, data->>'error_message' as error
FROM system_logs
WHERE type = 'task_failed'
ORDER BY timestamp DESC
LIMIT 10;
```

2. **查詢該任務的所有 log**

```sql
SELECT timestamp, level, type, step_name, data
FROM system_logs
WHERE execution_id = 'exec_001'
ORDER BY timestamp ASC;
```

3. **找到失敗點的詳細資訊**

```sql
-- 查詢 AI 呼叫失敗的完整資訊
SELECT
  data->>'error_message' as error,
  data->>'request_payload' as request,
  data->>'full_prompt' as prompt,
  data->>'error_details' as details
FROM system_logs
WHERE execution_id = 'exec_001'
  AND type = 'ai_call_failed';
```

4. **從 log 中取得輸入資料，重現問題**

---

## 開發環境 Log 查詢工具

### 工具 1：psql 直接查詢

```bash
# 連接到資料庫
psql -U postgres -d cheapcut

# 查詢最近 10 筆失敗任務
SELECT
  execution_id,
  data->>'task_type' as task_type,
  data->>'error_message' as error,
  timestamp
FROM system_logs
WHERE type = 'task_failed'
ORDER BY timestamp DESC
LIMIT 10;
```

---

### 工具 2：簡易 CLI 工具

```bash
# 建立一個簡單的 CLI 工具
# scripts/logs.sh

#!/bin/bash

case "$1" in
  "failures")
    psql -U postgres -d cheapcut -c "
      SELECT
        execution_id,
        data->>'task_type' as task,
        data->>'error_message' as error,
        timestamp
      FROM system_logs
      WHERE type = 'task_failed'
      ORDER BY timestamp DESC
      LIMIT 20;
    "
    ;;
  "execution")
    psql -U postgres -d cheapcut -c "
      SELECT timestamp, level, type, step_name, data
      FROM system_logs
      WHERE execution_id = '$2'
      ORDER BY timestamp ASC;
    "
    ;;
  *)
    echo "Usage: $0 {failures|execution <id>}"
    exit 1
    ;;
esac
```

**使用方式**：
```bash
# 查看所有失敗任務
./scripts/logs.sh failures

# 查看特定任務的 log
./scripts/logs.sh execution exec_001
```

---

### 工具 3：簡易管理後台（未來實作）

**功能**：
- 列出所有任務（可篩選狀態）
- 點擊任務查看詳細 log
- 視覺化顯示任務執行流程
- 高亮顯示錯誤

**技術選擇**：
- 前端：簡單的 HTML + JavaScript
- 後端：已有的 API（`/api/admin/logs/*`）

---

## Log 保留策略與清理

### 保留時間

| Log 類型 | 保留時間 | 理由 |
|---------|---------|------|
| ERROR 級別 | 90 天 | 用於長期問題追蹤 |
| WARN 級別 | 30 天 | 用於發現潛在問題 |
| INFO 級別 | 7 天 | 僅保留近期資料 |
| DEBUG 級別 | 1 天 | 僅開發環境使用 |

### 自動清理任務

```sql
-- 清理 30 天前的 INFO 級別 log
DELETE FROM system_logs
WHERE level = 'INFO'
  AND timestamp < NOW() - INTERVAL '7 days';

-- 清理 90 天前的 ERROR 級別 log
DELETE FROM system_logs
WHERE level = 'ERROR'
  AND timestamp < NOW() - INTERVAL '90 days';
```

**執行方式**：
- 使用 Cron Job 每天執行
- 或使用 PostgreSQL 的 `pg_cron` 擴充套件

---

## 測試時如何使用 Log

### 測試流程範例

#### 測試：上傳影片並分析

**步驟 1：準備測試環境**
```bash
# 開啟終端機，啟動後端服務（開發模式）
npm run dev

# 此時 console 會輸出所有 log
```

**步驟 2：執行測試**
```bash
# 在另一個終端機，執行測試
curl -X POST http://localhost:3000/api/materials/analyze \
  -H "Content-Type: application/json" \
  -d '{"videoId": "video_001"}'
```

**步驟 3：觀察 Console 輸出**
```
服務終端機會即時顯示：
✅ task_started
✅ ai_call_started (google_video_ai)
⏳ 等待 15 秒...
❌ ai_call_failed (錯誤訊息)
❌ task_failed
```

**步驟 4：查詢詳細 log（如果需要）**
```bash
# 從 console 輸出中找到 execution_id
# 然後查詢詳細 log

# 方法 1：API
curl http://localhost:3000/api/admin/logs/execution/exec_001

# 方法 2：資料庫
psql -U postgres -d cheapcut -c "
  SELECT * FROM system_logs
  WHERE execution_id = 'exec_001'
  ORDER BY timestamp;
"
```

**步驟 5：重現問題**
- 從 log 中找到 `ai_call_failed` 的 `request_payload`
- 查看 `full_prompt`（如果有）
- 查看 `error_details`
- 手動呼叫 API 重現問題，或修正程式碼後重新測試

---

### 測試：配音生成影片

**步驟 1：執行生成影片流程**
```bash
curl -X POST http://localhost:3000/api/video/generate \
  -H "Content-Type: application/json" \
  -d '{"voiceoverId": "vo_001"}'
```

**步驟 2：即時觀察進度（從 console）**
```
✅ task_started (video_generation)
✅ task_step_started (query_candidates)
✅ db_operation (15 candidates found)
✅ task_step_started (ai_segment_selection) - segment 0
✅ ai_call_completed
✅ task_step_started (ai_segment_selection) - segment 1
❌ ai_response_validation_failed (InvalidReference)
   → AI 選了不存在的 segment_id: seg_999
   → 有效的 IDs: [seg_045, seg_046, seg_047]
❌ task_failed
```

**步驟 3：找出問題**
- 從 log 看到：AI 選了 `seg_999`，但這個 ID 不在候選列表中
- 查詢完整的 `ai_response` 和 `full_prompt`
- 發現是 prompt 沒有明確告訴 AI 只能選這幾個 ID

**步驟 4：修正並重新測試**
- 修改 prompt（在 `prompts/video-selection/segment-select.md`）
- 重新執行測試
- 確認問題解決

---

## 快速參考：常用查詢

### 查詢最近的失敗任務

```sql
SELECT
  execution_id,
  data->>'task_type' as task,
  data->>'failed_step' as step,
  data->>'error_message' as error,
  timestamp
FROM system_logs
WHERE type = 'task_failed'
ORDER BY timestamp DESC
LIMIT 20;
```

### 查詢特定任務的所有 log

```sql
SELECT timestamp, level, type, step_name, data
FROM system_logs
WHERE execution_id = 'exec_001'
ORDER BY timestamp ASC;
```

### 查詢特定用戶的任務歷史

```sql
SELECT
  execution_id,
  data->>'task_type' as task,
  timestamp
FROM system_logs
WHERE type = 'task_started'
  AND user_id = 'user_abc123'
ORDER BY timestamp DESC
LIMIT 50;
```

### 查詢所有 AI 驗證失敗的情況

```sql
SELECT
  execution_id,
  call_id,
  data->>'validation_error' as error_type,
  data->>'error_message' as message,
  data->>'prompt_name' as prompt,
  timestamp
FROM system_logs
WHERE type = 'ai_response_validation_failed'
ORDER BY timestamp DESC
LIMIT 20;
```

### 查詢所有檔案找不到的錯誤

```sql
SELECT
  execution_id,
  data->>'file_path' as path,
  data->>'error_message' as error,
  timestamp
FROM system_logs
WHERE type = 'data_flow_validation_failed'
  AND data->>'validation_error' = 'FileNotFound'
ORDER BY timestamp DESC;
```

---

## 完成檢查

- [x] 定義核心設計哲學（Fail Fast, Log Everything Needed）
- [x] 設計流程一（素材上傳）的完整 logging 方案
- [x] 設計流程二（生成影片）的完整 logging 方案
- [x] 設計 Log 資料表結構
- [x] 設計 Log 查詢 API
- [x] 實作 Logger 服務類別
- [x] 定義環境配置（開發 vs 正式）
- [x] 設計敏感資料脫敏規則
- [x] 設計資料流傳接驗證機制
- [x] 設計 Log 儲存策略與查詢方式
- [x] 提供測試時的 Log 使用流程
- [ ] 團隊討論與確認
- [ ] 實作 Logger 服務
- [ ] 實作 Log 查詢 API
- [ ] 實作管理後台
- [ ] 整合到現有引擎

---

**下一步**：討論與確認此設計，然後更新 `00-INDEX.md` 狀態
