# 步驟 5：資料流向設計

**狀態**：✅ 已完成
**前置依賴**：02-key-flows.md, 04-module-breakdown.md
**目標**：明確資料如何在系統中流動

---

## 核心概念

CheapCut 有兩條主要的資料流：

1. **流程一：素材管理資料流**
   - 影片檔案 → 分析 → 片段與標籤 → 資料庫
   - 目的：建立可搜尋的素材庫

2. **流程二：影片生成資料流**
   - 配音 → 語意分析 → 選片決策 → 影片合成 → 成品輸出
   - 目的：從配音生成完整短影片

---

## 多步驟處理支援

### 設計考量

服務層（例如：素材處理引擎、配音處理引擎）可能需要多次呼叫 AI：
- 單次呼叫：簡單任務（STT、配樂選擇）
- 多次呼叫：複雜任務（智能選片、影片分析）

資料層需要支援：
1. **追蹤執行進度** - 知道處理到第幾步
2. **儲存中間結果** - 每一步的輸出
3. **失敗重試** - 從失敗的步驟重跑
4. **執行記錄** - Debug 與成本分析

### 任務執行記錄表

```typescript
interface TaskExecution {
  execution_id: string       // UUID
  task_type: string          // 任務類型："material_analysis", "voiceover_processing", "video_generation"
  user_id: string

  // 關聯的業務資料
  related_id: string         // 關聯的 video_id / voiceover_id / timeline_id

  // 執行狀態
  status: 'pending' | 'processing' | 'completed' | 'failed'

  // 進度追蹤
  current_step: string       // 目前步驟名稱（例如："analyzing_scenes"）
  step_index: number         // 目前第幾步（0-based）
  total_steps: number        // 總共幾步
  steps: JSON                // 每一步的詳細資訊
  // 範例：
  // [
  //   {
  //     name: "call_video_ai",
  //     status: "completed",
  //     started_at: "...",
  //     completed_at: "...",
  //     result: { ... },
  //     cost: 0.1
  //   },
  //   {
  //     name: "convert_tags",
  //     status: "processing",
  //     started_at: "...",
  //     result: null
  //   },
  //   {
  //     name: "split_segments",
  //     status: "pending",
  //     result: null
  //   }
  // ]

  // 輸入輸出
  input_data: JSON           // 任務輸入
  output_data: JSON          // 最終輸出

  // 成本與效能
  ai_calls_count: number     // AI 呼叫次數
  total_tokens: number       // 總 token 數
  total_cost: number         // 總成本（USD）

  // 時間
  created_at: Date
  started_at?: Date
  completed_at?: Date
  execution_time?: number    // 執行時間（秒）

  // 錯誤處理
  error_message?: string
  failed_step?: string       // 失敗在哪一步
}
```

### 服務層使用範例

```typescript
class MaterialProcessingEngine {
  async analyze(videoId: string, userId: string) {
    // 1. 建立任務記錄
    const execution = await db.task_executions.create({
      task_type: 'material_analysis',
      related_id: videoId,
      user_id: userId,
      status: 'processing',
      total_steps: 4,
      current_step: 'call_video_ai',
      step_index: 0,
      steps: [
        { name: 'call_video_ai', status: 'processing' },
        { name: 'convert_tags', status: 'pending' },
        { name: 'split_segments', status: 'pending' },
        { name: 'generate_thumbnails', status: 'pending' }
      ],
      input_data: { videoId }
    })

    try {
      // Step 1
      const aiResult = await this.callVideoAI(videoId)
      await this.updateStep(execution.id, 0, 'completed', { result: aiResult })

      // Step 2
      await this.updateProgress(execution.id, 1, 'convert_tags')
      const tags = await this.convertTags(aiResult)
      await this.updateStep(execution.id, 1, 'completed', { result: tags })

      // Step 3 (可能內部多次 AI call)
      await this.updateProgress(execution.id, 2, 'split_segments')
      const segments = await this.splitSegments(aiResult)
      await this.updateStep(execution.id, 2, 'completed', { result: segments })

      // Step 4
      await this.updateProgress(execution.id, 3, 'generate_thumbnails')
      const thumbnails = await this.generateThumbnails(segments)
      await this.updateStep(execution.id, 3, 'completed', { result: thumbnails })

      // 完成
      await this.completeTask(execution.id, { segments, tags, thumbnails })

    } catch (error) {
      await this.failTask(execution.id, error)
      throw error
    }
  }

  private async updateProgress(executionId: string, stepIndex: number, stepName: string) {
    await db.task_executions.update(executionId, {
      step_index: stepIndex,
      current_step: stepName,
      [`steps.${stepIndex}.status`]: 'processing',
      [`steps.${stepIndex}.started_at`]: new Date()
    })
  }

  private async updateStep(executionId: string, stepIndex: number, status: string, data?: any) {
    const updates: any = {
      [`steps.${stepIndex}.status`]: status,
      [`steps.${stepIndex}.completed_at`]: new Date()
    }
    if (data?.result) {
      updates[`steps.${stepIndex}.result`] = data.result
    }
    if (data?.cost) {
      updates[`steps.${stepIndex}.cost`] = data.cost
    }
    await db.task_executions.update(executionId, updates)
  }
}
```

### 前端查詢進度 API

```typescript
// GET /api/tasks/{executionId}
{
  "executionId": "exec-123",
  "taskType": "material_analysis",
  "status": "processing",
  "progress": {
    "currentStep": "split_segments",
    "stepIndex": 2,
    "totalSteps": 4,
    "percentage": 50,
    "message": "正在切分片段..."
  },
  "startedAt": "2025-10-06T10:00:00Z",
  "estimatedCompletion": "2025-10-06T10:02:30Z"
}
```

### AI 呼叫記錄（簡化版）

**注意**：詳細的 logging 設計請見 `10-logging-monitoring.md`

```typescript
// 簡化的 AI 呼叫記錄（可選）
interface AICallRecord {
  call_id: string
  execution_id: string       // 關聯到任務
  step_name: string

  prompt_name: string
  model: string
  tokens: number
  cost: number
  duration: number           // ms

  success: boolean
  error?: string

  created_at: Date
}
```

這個表主要用於：
- 成本追蹤
- 效能分析
- Debug（配合完整 logging 系統）

---

## Prompt 管理系統

### 核心概念

**問題**：AI Prompt 是產品核心競爭力，需要頻繁調整優化，但不應該寫死在程式碼中。

**解決方案**：使用檔案系統管理 Prompt（Markdown 檔案）

**為什麼用檔案而非資料庫？**
- ✅ 可以直接在 VS Code 中編輯
- ✅ Git 版本控制（自動追蹤修改歷史）
- ✅ 可以寫註解、說明文件
- ✅ 支援 Code Review（PR 審查 Prompt 修改）
- ✅ 不需要額外的管理介面

---

### Prompt 檔案結構

```
prompts/
├── voiceover-processing/
│   ├── voiceover-split.md
│   ├── semantic-analysis.md
│   └── README.md
├── video-selection/
│   ├── segment-select.md
│   ├── music-select.md
│   └── README.md
├── material-processing/
│   ├── tag-conversion.md
│   └── README.md
└── README.md
```

---

### Prompt 檔案格式（Markdown + Frontmatter）

**檔案範例**：`prompts/voiceover-processing/voiceover-split.md`

```markdown
---
name: voiceover-split
category: voiceover-processing
version: 3
variables:
  - transcript
  - duration
active: true
model: gpt-4
temperature: 0.7
updated: 2025-10-06
notes: |
  v3: 加強了節奏變化的要求
  v2: 修正切分過碎的問題
  v1: 初版
---

# 配音切分 Prompt

## 用途
將配音切分成有節奏的片段，用於智能選片。

## 變數說明
- `transcript`: 配音文字（STT 轉錄結果）
- `duration`: 配音總長度（秒）

---

## Prompt

你是專業影片導演。請將以下配音切分成有節奏的片段。

配音文字：
"""
{{transcript}}
"""

配音總長度：{{duration}} 秒

切分原則：
1. 根據語意自然切分
2. 片段長度要有變化（1-12秒）
3. 重要內容可以較長（5-12秒）
4. 轉場/停頓較短（1-3秒）

請以 JSON 格式回應：
{
  "segments": [
    { "start": 0, "end": 8, "text": "...", "keywords": ["...", "..."] }
  ]
}

---

## 測試範例

### 輸入
```json
{
  "transcript": "大家好，今天要介紹我們的新產品。這個產品有三大特色...",
  "duration": 45
}
```

### 預期輸出
```json
{
  "segments": [
    { "start": 0, "end": 8, "text": "大家好，今天要介紹我們的新產品", "keywords": ["介紹", "產品"] },
    { "start": 8, "end": 10, "text": "(停頓)", "keywords": [] },
    { "start": 10, "end": 22, "text": "這個產品有三大特色...", "keywords": ["產品", "特色"] }
  ]
}
```

---

## 版本歷史
- **v3** (2025-10-06): 加強節奏變化要求
- **v2** (2025-10-05): 修正切分過碎問題
- **v1** (2025-10-01): 初版
```

---

### Prompt 載入與使用

**1. Prompt 載入服務**：

```typescript
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'  // 解析 frontmatter 的套件

interface PromptMetadata {
  name: string
  category: string
  version: number
  variables: string[]
  active: boolean
  model?: string
  temperature?: number
  updated: string
  notes?: string
}

interface PromptData {
  metadata: PromptMetadata
  content: string  // Prompt 本體
}

class PromptManager {
  private promptsDir = path.join(__dirname, '../prompts')
  private cache = new Map<string, PromptData>()

  // 從檔案載入 Prompt
  async loadPrompt(category: string, name: string): Promise<PromptData> {
    const cacheKey = `${category}/${name}`

    // 檢查快取
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // 讀取檔案
    const filePath = path.join(this.promptsDir, category, `${name}.md`)
    const fileContent = await fs.readFile(filePath, 'utf-8')

    // 解析 frontmatter
    const { data, content } = matter(fileContent)

    // 檢查是否啟用
    if (!data.active) {
      throw new Error(`Prompt ${cacheKey} is not active`)
    }

    // 提取 "## Prompt" 區塊的內容
    const promptMatch = content.match(/## Prompt\s+([\s\S]*?)(?=\n##|$)/i)
    if (!promptMatch) {
      throw new Error(`No "## Prompt" section found in ${filePath}`)
    }

    const promptData = {
      metadata: data as PromptMetadata,
      content: promptMatch[1].trim()
    }

    // 快取（開發環境可以關閉快取）
    if (process.env.NODE_ENV === 'production') {
      this.cache.set(cacheKey, promptData)
    }

    return promptData
  }

  // 渲染 Prompt（填入變數）
  renderPrompt(template: string, variables: Record<string, any>): string {
    let rendered = template

    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }

    return rendered
  }

  // 完整執行流程
  async executePrompt(
    category: string,
    name: string,
    variables: Record<string, any>
  ): Promise<{ prompt: string, model?: string, temperature?: number }> {
    const { metadata, content } = await this.loadPrompt(category, name)
    const prompt = this.renderPrompt(content, variables)

    return {
      prompt,
      model: metadata.model,
      temperature: metadata.temperature
    }
  }

  // 清除快取（開發時使用）
  clearCache() {
    this.cache.clear()
  }
}
```

**2. 在業務邏輯中使用**：

```typescript
// 配音切分
async function splitVoiceover(voiceover: Voiceover) {
  // ✅ 從檔案載入 Prompt
  const promptManager = new PromptManager()
  const { prompt, model, temperature } = await promptManager.executePrompt(
    'voiceover-processing',
    'voiceover-split',
    {
      transcript: voiceover.transcript,
      duration: voiceover.duration
    }
  )

  // 呼叫 AI（使用 Prompt 中定義的 model 和 temperature）
  const response = await openai.chat.completions.create({
    model: model || 'gpt-4',
    temperature: temperature ?? 0.7,
    messages: [{ role: 'user', content: prompt }]
  })

  return JSON.parse(response.choices[0].message.content)
}
```

---

### Prompt 分類與檔案清單

| Category | File Name | 用途 | 變數 |
|----------|-----------|------|------|
| `voiceover-processing` | `voiceover-split.md` | 配音切分 | transcript, duration |
| `voiceover-processing` | `semantic-analysis.md` | 語意分析 | text |
| `video-selection` | `segment-select.md` | 智能選片 | voiceText, duration, candidates |
| `video-selection` | `music-select.md` | 配樂選擇 | tone, duration |
| `material-processing` | `tag-conversion.md` | AI 標籤轉換 | apiResponse |

---

### Prompt 優化流程

```
1. 發現問題
   └─> 例如：配音切分經常切得太碎

2. 在 VS Code 中修改 Prompt
   └─> 開啟 prompts/voiceover-processing/voiceover-split.md
   └─> 修改 "## Prompt" 區塊內容
   └─> 更新 frontmatter: version: 4, updated: 2025-10-07
   └─> 加入版本歷史註記

3. 測試新版本
   └─> 開發環境測試（快取已關閉，立即生效）
   └─> 使用測試範例驗證輸出
   └─> 必要時調整 model/temperature 參數

4. Git 提交
   └─> git add prompts/voiceover-processing/voiceover-split.md
   └─> git commit -m "feat(prompt): 改進配音切分邏輯 v4"
   └─> git push

5. 部署到正式環境
   └─> 部署後重啟服務（清除快取）
   └─> 或呼叫 API: POST /api/admin/prompts/clear-cache

6. 監控與回滾
   └─> 觀察效果
   └─> 如有問題，用 Git 回滾：git revert HEAD
```

---

### 開發環境設定

**自動重載 Prompt（開發時）**：

```typescript
// 開發環境：關閉快取，每次都重新讀取檔案
class PromptManager {
  async loadPrompt(category: string, name: string): Promise<PromptData> {
    const cacheKey = `${category}/${name}`

    // 開發環境不使用快取
    if (process.env.NODE_ENV !== 'production') {
      const filePath = path.join(this.promptsDir, category, `${name}.md`)
      const fileContent = await fs.readFile(filePath, 'utf-8')
      // ... 解析並返回
    }

    // 正式環境使用快取
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }
    // ...
  }
}
```

**正式環境：清除快取 API**：

```typescript
// POST /api/admin/prompts/clear-cache
router.post('/admin/prompts/clear-cache', authMiddleware, (req, res) => {
  promptManager.clearCache()
  res.json({ success: true, message: 'Prompt cache cleared' })
})
```

---

## 流程一：素材管理資料流

### 流程圖

```
┌─────────────────────────────────────────────────────────────┐
│                     素材管理資料流                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  用戶上傳影片 (MP4)                                           │
│         ↓                                                     │
│  [前端] 檔案驗證（格式、大小）                                │
│         ↓                                                     │
│  [前端] 呼叫 POST /api/materials/upload → 取得 presigned URL  │
│         ↓                                                     │
│  [前端] 直接上傳到 S3/R2                                      │
│         ↓                                                     │
│  [前端] 呼叫 POST /api/materials/analyze                      │
│         ↓                                                     │
│  [後端] API 服務層接收請求                                    │
│         ↓                                                     │
│  [後端] 寫入 videos 表（status: pending）                     │
│         ↓                                                     │
│  [後端] 加入背景任務佇列 → 素材處理引擎                       │
│         ↓                                                     │
│  [素材處理引擎] 下載影片並分析：                              │
│    1. 呼叫 Google Video AI / AWS Rekognition                  │
│    2. 取得場景辨識、物件偵測、動作分析結果                    │
│    3. 將 API 回應轉換為內部 tag 格式                          │
│    4. 自動切分片段（基於場景變化）                            │
│    5. 使用 FFmpeg 生成縮圖                                    │
│         ↓                                                     │
│  [資料庫] 寫入資料：                                          │
│    - videos 表：更新 status = 'analyzed'                      │
│    - segments 表：插入多筆片段記錄                            │
│    - segment_tags 表：插入片段與標籤的關聯                    │
│         ↓                                                     │
│  [快取層] 更新素材列表快取（Redis）                           │
│         ↓                                                     │
│  [前端] 輪詢或 WebSocket 通知 → 顯示分析完成                  │
│         ↓                                                     │
│  用戶瀏覽素材庫（可篩選、預覽）                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 資料實體定義

#### 1. 影片資料（videos 表）

```typescript
interface Video {
  video_id: string          // UUID
  user_id: string          // 用戶 ID（外鍵）
  file_path: string        // S3/R2 URL
  file_size: number        // 檔案大小（bytes）
  duration: number         // 影片長度（秒）
  resolution: string       // 解析度（例如："1920x1080"）
  format: string           // 格式（例如："mp4"）
  upload_time: Date        // 上傳時間
  status: 'pending' | 'analyzing' | 'analyzed' | 'failed'
  error_message?: string   // 如果分析失敗
  metadata?: JSON          // 其他 metadata（編碼格式等）
}
```

#### 2. 片段資料（segments 表）

```typescript
interface Segment {
  segment_id: string       // UUID
  video_id: string        // 所屬影片 ID（外鍵）
  start_time: number      // 片段開始時間（秒）
  end_time: number        // 片段結束時間（秒）
  duration: number        // 片段長度（計算欄位：end_time - start_time）
  thumbnail_url: string   // 縮圖 URL
  description?: string    // AI 生成的片段描述
  scene_type?: string     // 場景類型（例如："indoor", "outdoor", "closeup"）
  created_at: Date
}
```

#### 3. 片段標籤（segment_tags 表）

```typescript
interface SegmentTag {
  segment_id: string      // 片段 ID（外鍵）
  tag: string            // 標籤名稱（例如："產品", "說話", "特寫"）
  tag_type?: string      // 標籤類型（例如："visual", "content", "emotion"）
  confidence?: number    // 信心分數（0-1）
  source: 'ai' | 'user'  // 標籤來源
  created_at: Date
}

// 複合主鍵：(segment_id, tag)
// 索引：tag（用於快速搜尋）
```

#### 4. 標籤系統設計

**內部標籤分類**：

```typescript
// 視覺標籤（Visual Tags）
type VisualTag =
  | '產品特寫'    // 產品鏡頭
  | '人物說話'    // 有人在說話
  | '動作展示'    // 動態展示
  | '文字特效'    // 畫面有文字
  | '環境場景'    // 環境鏡頭
  | '手部操作'    // 手部特寫
  // ...

// 情緒標籤（Emotion Tags）
type EmotionTag =
  | '專業'       // 專業感
  | '輕鬆'       // 輕鬆氛圍
  | '熱情'       // 有活力
  | '平靜'       // 沉穩
  // ...

// 內容標籤（Content Tags）
type ContentTag =
  | '開場'       // 適合開場
  | '轉場'       // 適合轉場
  | '結尾'       // 適合結尾
  | '案例展示'   // 案例說明
  | '產品介紹'   // 產品說明
  // ...
```

**AI 回應轉換邏輯**：

```typescript
// Google Video AI 回應範例
{
  "shotAnnotations": [
    {
      "startTime": "0s",
      "endTime": "5s",
      "labels": [
        { "entity": { "description": "Person" }, "confidence": 0.9 },
        { "entity": { "description": "Speaking" }, "confidence": 0.85 }
      ]
    }
  ]
}

// 轉換為內部 tags
function convertToInternalTags(apiResponse) {
  const tags = []

  // Person + Speaking → '人物說話'
  if (hasLabel('Person') && hasLabel('Speaking')) {
    tags.push({ tag: '人物說話', confidence: 0.85, type: 'visual' })
  }

  // Close-up → '產品特寫'
  if (hasLabel('Close-up') && hasLabel('Product')) {
    tags.push({ tag: '產品特寫', confidence: 0.9, type: 'visual' })
  }

  return tags
}
```

---

### 資料流詳細步驟

#### 階段 1：上傳影片

**前端處理**：
```typescript
// 1. 取得 presigned URL
const response = await fetch('/api/materials/upload', {
  method: 'POST',
  body: JSON.stringify({
    fileName: 'my-video.mp4',
    fileSize: 12345678,
    mimeType: 'video/mp4'
  })
})

const { uploadUrl, videoId } = await response.json()

// 2. 直接上傳到 S3/R2
await fetch(uploadUrl, {
  method: 'PUT',
  body: videoFile
})

// 3. 通知後端上傳完成
await fetch('/api/materials/analyze', {
  method: 'POST',
  body: JSON.stringify({ videoId })
})
```

**資料位置變化**：
- 用戶本地 → 前端記憶體 → S3/R2
- 後端資料庫寫入 `videos` 表

---

#### 階段 2：影片分析（背景處理）

**後端處理流程**：

```typescript
// 素材處理引擎
async function analyzeVideo(videoId: string) {
  // 1. 從資料庫取得影片資訊
  const video = await db.videos.findOne({ videoId })

  // 2. 呼叫外部 AI 服務
  const analysisResult = await googleVideoAI.analyze(video.file_path)

  // 3. 自動切分片段
  const segments = autoSplitSegments(analysisResult, video.duration)
  // 範例：
  // [
  //   { start: 0, end: 5, sceneChange: true },
  //   { start: 5, end: 12, sceneChange: true },
  //   { start: 12, end: 18, sceneChange: false }  // 同一場景，不切分
  // ]

  // 4. 轉換 AI tags 為內部 tags
  const tags = convertToInternalTags(analysisResult)

  // 5. 生成縮圖
  for (const segment of segments) {
    const thumbnailUrl = await generateThumbnail(
      video.file_path,
      segment.start_time + (segment.duration / 2)  // 取中間幀
    )
    segment.thumbnail_url = thumbnailUrl
  }

  // 6. 批次寫入資料庫
  await db.transaction(async (tx) => {
    // 更新影片狀態
    await tx.videos.update({
      videoId,
      status: 'analyzed'
    })

    // 插入片段
    const segmentIds = await tx.segments.insertMany(
      segments.map(seg => ({
        video_id: videoId,
        start_time: seg.start,
        end_time: seg.end,
        duration: seg.end - seg.start,
        thumbnail_url: seg.thumbnail_url,
        description: seg.description
      }))
    )

    // 插入標籤關聯
    const tagRecords = segmentIds.flatMap((segId, idx) =>
      segments[idx].tags.map(tag => ({
        segment_id: segId,
        tag: tag.name,
        tag_type: tag.type,
        confidence: tag.confidence,
        source: 'ai'
      }))
    )

    await tx.segment_tags.insertMany(tagRecords)
  })

  // 7. 清理快取
  await redis.del(`materials:user_${video.user_id}`)
}
```

**資料位置變化**：
- S3 檔案 → Google Video AI → 後端記憶體 → PostgreSQL
- 縮圖：後端生成 → S3

---

#### 階段 3：資料查詢（用戶瀏覽素材）

**查詢邏輯**：

```sql
-- 查詢用戶的所有素材（含標籤）
SELECT
  v.video_id,
  v.file_path,
  v.duration,
  s.segment_id,
  s.start_time,
  s.end_time,
  s.thumbnail_url,
  GROUP_CONCAT(st.tag) as tags
FROM videos v
JOIN segments s ON v.video_id = s.video_id
LEFT JOIN segment_tags st ON s.segment_id = st.segment_id
WHERE v.user_id = $1
  AND v.status = 'analyzed'
GROUP BY s.segment_id
ORDER BY v.upload_time DESC, s.start_time ASC
```

**快取策略**：

```typescript
// 首次查詢時快取
const cacheKey = `materials:user_${userId}`
let materials = await redis.get(cacheKey)

if (!materials) {
  materials = await db.query(/* 上面的 SQL */)
  await redis.set(cacheKey, JSON.stringify(materials), 'EX', 7200)  // 2 小時
}

return materials
```

---

### 資料生命週期

| 資料類型 | 儲存位置 | 保留時間 | 清理策略 |
|---------|---------|---------|---------|
| 原始影片檔案 | S3/R2 | 永久（或依用戶方案） | 用戶刪除或帳號刪除時清理 |
| 片段縮圖 | S3/R2 | 永久 | 隨影片刪除 |
| segments 資料 | PostgreSQL | 永久 | 隨影片刪除（CASCADE） |
| segment_tags 資料 | PostgreSQL | 永久 | 隨片段刪除（CASCADE） |
| 素材列表快取 | Redis | 2 小時 | 自動過期或手動刷新 |

---

## 流程二：影片生成資料流

### 流程圖

```
┌─────────────────────────────────────────────────────────────────┐
│                      影片生成資料流                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  用戶上傳配音（或錄音）                                           │
│         ↓                                                         │
│  [前端] 上傳音檔到 S3/R2                                          │
│         ↓                                                         │
│  [前端] POST /api/voiceover/process                               │
│         ↓                                                         │
│  [後端] 配音處理引擎：                                            │
│    1. 呼叫 STT API (OpenAI Whisper)                               │
│    2. 取得文字腳本 + 時間軸                                       │
│    3. 呼叫 LLM (GPT-4) 進行語意分析                               │
│    4. 提取關鍵字、分析段落主題                                    │
│         ↓                                                         │
│  [資料庫] 寫入 voiceovers 表                                      │
│         ↓                                                         │
│  [前端] POST /api/video/generate                                  │
│         ↓                                                         │
│  [後端] 智能選片引擎：                                            │
│    1. 配音切分（AI 決定如何分段）                                 │
│    2. 為每個段落提取關鍵字                                        │
│    3. 資料庫查詢候選片段（tag 匹配）                              │
│    4. AI 選片決策（導演 Prompt）                                  │
│    5. 生成時間軸 JSON                                             │
│         ↓                                                         │
│  [快取層] 儲存候選片段清單（Redis）                               │
│         ↓                                                         │
│  [資料庫] 寫入 timelines 表（草稿）                               │
│         ↓                                                         │
│  [前端] 顯示時間軌編輯器                                          │
│         ↓                                                         │
│  用戶調整片段（可選）                                             │
│         ↓                                                         │
│  [前端] POST /api/video/render                                    │
│         ↓                                                         │
│  [後端] 影片合成引擎：                                            │
│    1. 解析時間軸 JSON                                             │
│    2. 從 S3 下載所需片段                                          │
│    3. 呼叫影片渲染服務 (FFmpeg / Cloudflare Stream)               │
│    4. 加上配音、字幕、配樂                                        │
│    5. 上傳成品到 S3                                               │
│         ↓                                                         │
│  [資料庫] 寫入 generated_videos 表                                │
│         ↓                                                         │
│  [前端] 顯示下載連結                                              │
│         ↓                                                         │
│  用戶下載影片                                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 資料實體定義

#### 1. 配音資料（voiceovers 表）

```typescript
interface Voiceover {
  voiceover_id: string      // UUID
  user_id: string          // 用戶 ID（外鍵）
  file_path: string        // S3/R2 URL
  duration: number         // 音檔長度（秒）
  transcript: string       // STT 轉錄文字
  transcript_json: JSON    // 帶時間軸的完整轉錄
  // 範例：
  // {
  //   "segments": [
  //     { "text": "大家好", "start": 0.0, "end": 1.2 },
  //     { "text": "今天要介紹", "start": 1.2, "end": 2.5 }
  //   ]
  // }
  semantic_analysis: JSON  // 語意分析結果
  // 範例：
  // {
  //   "topics": ["產品介紹", "功能說明"],
  //   "keywords": ["特色", "優勢", "客戶"],
  //   "tone": "professional"
  // }
  status: 'pending' | 'processed' | 'failed'
  created_at: Date
}
```

#### 2. 時間軸資料（timelines 表）

```typescript
interface Timeline {
  timeline_id: string       // UUID
  user_id: string          // 用戶 ID（外鍵）
  voiceover_id: string     // 配音 ID（外鍵）
  timeline_json: JSON      // 完整的時間軸結構（見下方）
  status: 'draft' | 'final'
  created_at: Date
  updated_at: Date
}
```

**時間軸 JSON 結構**：

```typescript
interface TimelineJSON {
  timeline_id: string
  voiceover_url: string
  total_duration: number      // 總長度（秒）

  segments: TimelineSegment[]

  music?: {
    music_id: string
    music_url: string
    volume: number           // 0-1
    fade_in: number         // 秒
    fade_out: number        // 秒
  }

  subtitle_style?: string    // 字幕樣式 ID
}

interface TimelineSegment {
  index: number              // 片段順序（0-based）
  start_time: number        // 在最終影片中的開始時間
  end_time: number          // 在最終影片中的結束時間
  duration: number          // 長度

  // 影片片段資訊
  video_segment_id: string   // segments 表的 ID
  video_trim_start: number   // 從素材的哪個時間點開始取
  video_trim_end: number     // 取到素材的哪個時間點

  // 字幕資訊
  subtitle_text: string      // 這段要顯示的字幕
  subtitle_start?: number    // 字幕開始時間（相對於 segment）
  subtitle_end?: number      // 字幕結束時間

  // 候選片段（快取用）
  candidates?: string[]      // candidate segment_ids（存在 Redis）
}
```

**範例**：

```json
{
  "timeline_id": "abc-123",
  "voiceover_url": "https://s3.../voiceover.mp3",
  "total_duration": 45,
  "segments": [
    {
      "index": 0,
      "start_time": 0,
      "end_time": 8,
      "duration": 8,
      "video_segment_id": "seg_001",
      "video_trim_start": 0,
      "video_trim_end": 8,
      "subtitle_text": "大家好,今天要介紹我們的新產品",
      "subtitle_start": 0,
      "subtitle_end": 8
    },
    {
      "index": 1,
      "start_time": 8,
      "end_time": 10,
      "duration": 2,
      "video_segment_id": "seg_015",
      "video_trim_start": 2,
      "video_trim_end": 4,
      "subtitle_text": "",
      "subtitle_start": null,
      "subtitle_end": null
    }
  ],
  "music": {
    "music_id": "bgm_001",
    "music_url": "https://s3.../music.mp3",
    "volume": 0.3,
    "fade_in": 1,
    "fade_out": 2
  }
}
```

#### 3. 生成影片資料（generated_videos 表）

```typescript
interface GeneratedVideo {
  video_id: string          // UUID
  user_id: string          // 用戶 ID（外鍵）
  timeline_id: string      // 時間軸 ID（外鍵）
  voiceover_id: string     // 配音 ID（外鍵）

  file_path: string        // S3/R2 URL
  thumbnail_url: string    // 縮圖

  duration: number         // 影片長度（秒）
  file_size: number        // 檔案大小（bytes）
  resolution: string       // 解析度
  format: string           // 格式

  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string

  render_time?: number     // 渲染耗時（秒）

  created_at: Date
  completed_at?: Date
}
```

---

### 資料流詳細步驟

#### 階段 1：配音處理

**處理流程**：

```typescript
// 配音處理引擎
async function processVoiceover(voiceoverId: string) {
  const voiceover = await db.voiceovers.findOne({ voiceoverId })

  // 1. STT（語音轉文字）
  const sttResult = await openai.audio.transcriptions.create({
    file: voiceover.file_path,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment']
  })

  // 回應範例：
  // {
  //   "text": "大家好,今天要介紹我們的新產品...",
  //   "segments": [
  //     { "text": "大家好", "start": 0.0, "end": 1.2 },
  //     { "text": "今天要介紹", "start": 1.2, "end": 2.5 }
  //   ]
  // }

  // 2. 語意分析（使用 LLM）
  const semanticAnalysis = await analyzeSemantic(sttResult.text)

  // 3. 寫入資料庫
  await db.voiceovers.update({
    voiceoverId,
    transcript: sttResult.text,
    transcript_json: sttResult,
    semantic_analysis: semanticAnalysis,
    status: 'processed'
  })

  return { transcript: sttResult.text, semantic: semanticAnalysis }
}

// 語意分析
async function analyzeSemantic(text: string) {
  // ✅ 從 Prompt 管理系統載入
  const promptManager = new PromptManager()
  const prompt = await promptManager.executePrompt(
    'voiceover_processing',
    'semantic_analysis',
    { text }
  )

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  })

  return JSON.parse(response.choices[0].message.content)
}
```

**資料位置變化**：
- S3 音檔 → OpenAI Whisper → 後端記憶體 → PostgreSQL

---

#### 階段 2：智能選片

**處理流程**：

```typescript
// 智能選片引擎
async function generateTimeline(voiceoverId: string, userId: string) {
  const voiceover = await db.voiceovers.findOne({ voiceoverId })

  // 1. 配音切分（AI 決定）
  const segments = await splitVoiceover(voiceover)
  // 範例輸出：
  // [
  //   { start: 0, end: 8, text: "大家好,今天要介紹...", keywords: ["介紹", "產品"] },
  //   { start: 8, end: 10, text: "(停頓)", keywords: [] },
  //   { start: 10, end: 22, text: "這個產品有三大特色...", keywords: ["產品", "特色", "功能"] }
  // ]

  // 2. 為每個段落查詢候選片段
  const timelineSegments = []

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    // 資料庫查詢候選素材
    const candidates = await db.query(`
      SELECT s.segment_id, s.video_id, s.start_time, s.end_time, s.duration,
             s.thumbnail_url, GROUP_CONCAT(st.tag) as tags,
             COUNT(st.tag) as match_count
      FROM segments s
      JOIN segment_tags st ON s.segment_id = st.segment_id
      WHERE st.tag IN (${segment.keywords.map(k => `'${k}'`).join(',')})
        AND s.duration >= ${segment.duration * 0.8}
        AND s.user_id = '${userId}'
      GROUP BY s.segment_id
      ORDER BY match_count DESC
      LIMIT 20
    `)

    // 3. AI 選片決策
    const selectedSegment = await aiSelectSegment(segment, candidates)

    // 4. 建立 timeline segment
    timelineSegments.push({
      index: i,
      start_time: segment.start,
      end_time: segment.end,
      duration: segment.end - segment.start,
      video_segment_id: selectedSegment.segment_id,
      video_trim_start: selectedSegment.trim_start,
      video_trim_end: selectedSegment.trim_end,
      subtitle_text: segment.text,
      subtitle_start: 0,
      subtitle_end: segment.end - segment.start
    })

    // 5. 快取候選片段（供前端替換用）
    await redis.set(
      `candidates:timeline_${timelineId}:segment_${i}`,
      JSON.stringify(candidates),
      'EX', 3600  // 1 小時
    )
  }

  // 6. 組裝完整 timeline JSON
  const timelineJSON = {
    timeline_id: uuidv4(),
    voiceover_url: voiceover.file_path,
    total_duration: voiceover.duration,
    segments: timelineSegments,
    music: await selectMusic(voiceover.semantic_analysis.tone)
  }

  // 7. 寫入資料庫
  await db.timelines.insert({
    timeline_id: timelineJSON.timeline_id,
    user_id: userId,
    voiceover_id: voiceoverId,
    timeline_json: timelineJSON,
    status: 'draft'
  })

  return timelineJSON
}
```

**AI 選片決策**：

```typescript
async function aiSelectSegment(voiceSegment, candidates) {
  // ✅ 從 Prompt 管理系統載入
  const promptManager = new PromptManager()
  const prompt = await promptManager.executePrompt(
    'video_selection',
    'segment_select',
    {
      voiceText: voiceSegment.text,
      duration: voiceSegment.duration,
      candidates: candidates.map((c, i) => `
${i + 1}. ID: ${c.segment_id}
   長度: ${c.duration} 秒
   標籤: ${c.tags}
`).join('\n')
    }
  )

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  })

  return JSON.parse(response.choices[0].message.content)
}
```

**資料位置變化**：
- PostgreSQL（voiceover + segments） → 後端記憶體 → OpenAI → 後端記憶體 → PostgreSQL（timeline） + Redis（候選片段）

---

#### 階段 3：時間軌預覽與調整

**前端查詢候選片段**：

```typescript
// 用戶點擊時間軌上的某個片段 → 顯示候選片段
async function getCandidates(timelineId: string, segmentIndex: number) {
  // 先從快取取
  const cacheKey = `candidates:timeline_${timelineId}:segment_${segmentIndex}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  // 快取過期 → 重新查詢（使用相同的 keywords）
  // ...
}

// 用戶替換片段
async function replaceSegment(timelineId: string, segmentIndex: number, newSegmentId: string) {
  const timeline = await db.timelines.findOne({ timelineId })
  const timelineJSON = timeline.timeline_json

  // 更新指定的 segment
  const newSegment = await db.segments.findOne({ segment_id: newSegmentId })

  timelineJSON.segments[segmentIndex].video_segment_id = newSegmentId
  timelineJSON.segments[segmentIndex].video_trim_start = /* 計算裁切 */
  timelineJSON.segments[segmentIndex].video_trim_end = /* 計算裁切 */

  // 更新資料庫
  await db.timelines.update({
    timelineId,
    timeline_json: timelineJSON,
    updated_at: new Date()
  })
}
```

**資料位置變化**：
- Redis → 前端顯示
- 前端修改 → PostgreSQL

---

#### 階段 4：影片合成

**處理流程**：

```typescript
// 影片合成引擎
async function renderVideo(timelineId: string) {
  const timeline = await db.timelines.findOne({ timelineId })
  const timelineJSON = timeline.timeline_json

  // 1. 建立 generated_video 記錄
  const videoId = uuidv4()
  await db.generated_videos.insert({
    video_id: videoId,
    user_id: timeline.user_id,
    timeline_id: timelineId,
    voiceover_id: timeline.voiceover_id,
    status: 'processing'
  })

  // 2. 下載所需素材
  const segmentFiles = await Promise.all(
    timelineJSON.segments.map(seg =>
      downloadSegment(seg.video_segment_id, seg.video_trim_start, seg.video_trim_end)
    )
  )

  // 3. 呼叫渲染服務（FFmpeg 或 Cloudflare Stream）
  const outputUrl = await renderService.compose({
    segments: segmentFiles,
    voiceover: timelineJSON.voiceover_url,
    music: timelineJSON.music,
    subtitles: timelineJSON.segments.map(s => ({
      text: s.subtitle_text,
      start: s.subtitle_start,
      end: s.subtitle_end
    }))
  })

  // 4. 生成縮圖
  const thumbnailUrl = await generateThumbnail(outputUrl, 0)

  // 5. 更新資料庫
  await db.generated_videos.update({
    video_id: videoId,
    file_path: outputUrl,
    thumbnail_url: thumbnailUrl,
    status: 'completed',
    completed_at: new Date()
  })

  return { videoId, url: outputUrl }
}
```

**資料位置變化**：
- PostgreSQL（timeline） → S3（下載素材） → 渲染服務 → S3（成品） → PostgreSQL（generated_videos）

---

### 資料生命週期

| 資料類型 | 儲存位置 | 保留時間 | 清理策略 |
|---------|---------|---------|---------|
| 配音檔案 | S3/R2 | 永久（或 30 天） | 依用戶方案 |
| 配音轉錄文字 | PostgreSQL | 永久 | 隨配音刪除 |
| 時間軸草稿 | PostgreSQL | 永久 | 用戶刪除或過期清理 |
| 候選片段快取 | Redis | 1 小時 | 自動過期 |
| 生成的影片檔案 | S3/R2 | 7 天 / 永久 | 依用戶方案 |
| 影片記錄 | PostgreSQL | 永久 | 用戶刪除時清理 |

---

## 資料同步策略

### 進度更新（處理中）

**方式 1：輪詢（Polling）**

```typescript
// 前端每 2 秒查詢一次
const pollStatus = async (videoId: string) => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/videos/${videoId}/status`)
    const data = await response.json()

    updateProgress(data.status, data.progress)

    if (data.status === 'completed' || data.status === 'failed') {
      clearInterval(interval)
    }
  }, 2000)
}
```

**優點**：
- 實作簡單
- 不需要額外基礎設施

**缺點**：
- 頻繁請求（每支影片每 2 秒一次）
- 伺服器負載較高

---

**方式 2：WebSocket**

```typescript
// 後端推送進度
io.on('connection', (socket) => {
  socket.on('subscribe:video', (videoId) => {
    // 訂閱影片進度
    const listener = (progress) => {
      socket.emit('video:progress', { videoId, progress })
    }

    eventBus.on(`video:${videoId}:progress`, listener)
  })
})

// 影片處理引擎更新進度
async function updateProgress(videoId: string, progress: number) {
  eventBus.emit(`video:${videoId}:progress`, progress)
}
```

**優點**：
- 即時更新
- 伺服器負載低

**缺點**：
- 需要額外基礎設施（Socket.io、Redis Pub/Sub）
- 複雜度較高

---

**決策**：

**MVP 階段**：✅ 使用輪詢（Polling）
- 理由：簡單快速，可先上線
- 優化：設定合理的輪詢間隔（2-3 秒）

**未來優化**：考慮 WebSocket
- 當用戶量大時（> 500 同時在線）
- 或需要更即時的體驗時

---

## 資料安全與隱私

### 敏感資料保護

| 資料類型 | 是否敏感 | 保護措施 |
|---------|---------|---------|
| 用戶配音內容 | 是 | - 上傳使用 HTTPS<br>- S3 設定私有權限<br>- 使用 presigned URL 存取 |
| 配音轉錄文字 | 是 | - 資料庫加密<br>- 用戶隔離（WHERE user_id = $1） |
| 素材影片 | 是 | - S3 私有權限<br>- presigned URL<br>- 不同用戶無法存取彼此素材 |
| 生成的影片 | 可能 | - 預設私有<br>- 用戶可選擇公開分享 |
| API 金鑰 | 是 | - 環境變數儲存<br>- 不寫入程式碼或 Git |

### 存取控制

**用戶隔離原則**：

```sql
-- 所有查詢都必須加上 user_id 過濾
SELECT * FROM videos
WHERE user_id = $1  -- 必須！

SELECT * FROM segments
WHERE video_id IN (
  SELECT video_id FROM videos WHERE user_id = $1
)

-- 使用 Row-Level Security (RLS) 強制執行
-- PostgreSQL 範例
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation_policy ON videos
  USING (user_id = current_user_id());
```

---

## 資料流成本分析

### 流程一：素材管理（單支影片）

| 階段 | 資料量 | 外部服務 | 成本 |
|------|--------|---------|------|
| 上傳影片 | ~50MB | S3 儲存 | $0.0001/GB = $0.000005 |
| 影片分析 | 1 分鐘影片 | Google Video AI | $0.10/分鐘 |
| 生成縮圖 | ~100KB × 5 | S3 儲存 | 可忽略 |
| 資料庫寫入 | ~10KB | PostgreSQL | 免費（託管服務內） |
| **單支影片成本** | - | - | **約 $0.10 = NT$3** |

---

### 流程二：影片生成（45 秒影片）

| 階段 | 資料量 | 外部服務 | 成本 |
|------|--------|---------|------|
| STT（語音轉文字） | 45 秒音檔 | OpenAI Whisper | $0.006/分鐘 = $0.0045 |
| 語意分析 | ~500 tokens | GPT-4 | $0.01 |
| 智能選片（AI） | ~2000 tokens | GPT-4 | $0.04 |
| 資料庫查詢 | ~20 次查詢 | PostgreSQL | 免費 |
| 快取寫入 | ~50KB | Redis | 免費 |
| 影片渲染 | 45 秒影片 | Cloudflare Stream | $0.004/45秒 |
| 成品儲存 | ~10MB | S3 | $0.0002 |
| 用戶下載 | ~10MB | CloudFront | $0.001 |
| **單支影片成本** | - | - | **約 $0.06 = NT$1.8** |

---

### 總成本分析

**假設用戶行為**：
- 每個用戶上傳 10 支素材（一次性）
- 每個用戶每月生成 7.5 支影片

**每月成本（100 用戶）**：
- 素材管理：100 用戶 × 10 支 × NT$3 = NT$3,000（一次性）
- 影片生成：100 用戶 × 7.5 支/月 × NT$1.8 = NT$1,350/月
- **總計**：NT$1,350/月（不含一次性素材上傳成本）

**加上系統邊界決策的其他成本**：
- 影片渲染（如使用 Cloudflare Stream）：已包含在上面
- 配樂（Pixabay 免費）：NT$0
- **月總成本**：NT$1,350 + NT$187（渲染）= **NT$1,537/月**

---

## 流程三:成本效能追蹤資料流

### 設計目標

在系統運行過程中，需要即時記錄成本與效能數據，以便：
1. 追蹤每個用戶/任務的成本
2. 分析哪些服務/Prompt 最昂貴
3. 找出效能瓶頸
4. 提供管理後台的數據來源

### 成本資料流向

```
後端引擎執行中
  ↓ (埋點)
CostTracker.record()
  ↓ (寫入)
cost_records 表
  ↓ (聚合)
task_executions.total_cost 更新
  ↓ (查詢)
管理後台 API
  ↓ (顯示)
管理員介面
```

### 成本記錄資料表

```typescript
interface CostRecord {
  record_id: string          // UUID
  execution_id: string       // 關聯到 task_executions
  user_id: string

  // 服務識別
  service: 'google_video_ai' | 'openai' | 'whisper' | 's3' | 'cloudfront' | 'cloudflare_stream'
  operation: string          // 操作名稱："video_analysis", "gpt4_prompt", "whisper_stt"

  // 成本計算
  quantity: number           // 使用量（如：分鐘數、Token 數、GB 數）
  unit: string               // 單位："minutes", "tokens", "GB"
  unit_cost: number          // 單價（USD）
  total_cost: number         // 總成本（USD）

  // 效能數據
  started_at: Date           // 開始時間
  duration: number           // 耗時（毫秒）

  // 額外資訊
  metadata: JSON             // 額外資訊（如：model 名稱、prompt 名稱、回應 tokens）
  // 範例：
  // {
  //   model: "gpt-4-turbo",
  //   prompt_name: "segment_select",
  //   prompt_version: 2,
  //   request_tokens: 1500,
  //   response_tokens: 500
  // }

  created_at: Date
}
```

### 效能記錄資料表

```typescript
interface PerformanceRecord {
  record_id: string
  execution_id: string
  user_id: string

  // 步驟識別
  step_name: string          // "video_analysis", "segment_select", "video_render"
  step_type: 'ai_call' | 'db_query' | 'file_operation' | 'external_api'

  // 效能數據
  started_at: Date
  ended_at: Date
  duration: number           // 耗時（毫秒）

  // 額外資訊
  metadata: JSON             // 如：查詢的 SQL、處理的檔案大小等

  success: boolean
  error_message?: string

  created_at: Date
}
```

### 埋點位置與時機

#### 1. 素材處理引擎埋點

```typescript
class MaterialProcessingEngine {
  async analyze(videoId: string, userId: string) {
    const execution = await db.task_executions.create({...})

    // === 埋點 1: Video AI 分析 ===
    const aiStart = Date.now()
    const video = await db.videos.findOne(videoId)

    const aiResult = await googleVideoAI.analyze(video.file_path)

    await this.costTracker.record({
      execution_id: execution.id,
      user_id: userId,
      service: 'google_video_ai',
      operation: 'video_analysis',
      quantity: video.duration / 60,     // 分鐘數
      unit: 'minutes',
      unit_cost: 0.10,
      total_cost: (video.duration / 60) * 0.10,
      started_at: new Date(aiStart),
      duration: Date.now() - aiStart,
      metadata: {
        video_id: videoId,
        video_duration: video.duration
      }
    })

    // ... 後續步驟
  }
}
```

#### 2. 配音處理引擎埋點

```typescript
class VoiceoverProcessingEngine {
  async process(voiceoverId: string, userId: string) {
    const execution = await db.task_executions.create({...})

    // === 埋點 1: Whisper STT ===
    const sttStart = Date.now()
    const voiceover = await db.voiceovers.findOne(voiceoverId)

    const sttResult = await whisper.transcribe(voiceover.file_path)

    await this.costTracker.record({
      execution_id: execution.id,
      user_id: userId,
      service: 'whisper',
      operation: 'speech_to_text',
      quantity: voiceover.duration / 60,
      unit: 'minutes',
      unit_cost: 0.006,
      total_cost: (voiceover.duration / 60) * 0.006,
      started_at: new Date(sttStart),
      duration: Date.now() - sttStart,
      metadata: {
        voiceover_id: voiceoverId,
        audio_duration: voiceover.duration,
        language: sttResult.language
      }
    })

    // === 埋點 2: GPT-4 語意分析 ===
    const analysisStart = Date.now()
    const promptData = await this.promptManager.load('voiceover', 'semantic_analysis')
    const prompt = this.promptManager.render(promptData, { transcript: sttResult.text })

    const analysisResult = await openai.chat({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }]
    })

    await this.costTracker.record({
      execution_id: execution.id,
      user_id: userId,
      service: 'openai',
      operation: 'gpt4_semantic_analysis',
      quantity: analysisResult.usage.total_tokens,
      unit: 'tokens',
      unit_cost: 0.00001,  // $0.01/1000 tokens
      total_cost: analysisResult.usage.total_tokens * 0.00001,
      started_at: new Date(analysisStart),
      duration: Date.now() - analysisStart,
      metadata: {
        model: 'gpt-4-turbo',
        prompt_name: 'semantic_analysis',
        prompt_version: promptData.metadata.version,
        request_tokens: analysisResult.usage.prompt_tokens,
        response_tokens: analysisResult.usage.completion_tokens
      }
    })
  }
}
```

#### 3. 智能選片引擎埋點

```typescript
class IntelligentClipEngine {
  async selectClips(voiceoverId: string, userId: string) {
    // === 埋點: GPT-4 選片決策 ===
    const selectStart = Date.now()
    const promptData = await this.promptManager.load('clip_selection', 'segment_select')
    const prompt = this.promptManager.render(promptData, {
      voiceover_segments: segments,
      available_clips: candidates
    })

    const selectionResult = await openai.chat({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }]
    })

    await this.costTracker.record({
      execution_id: execution.id,
      user_id: userId,
      service: 'openai',
      operation: 'gpt4_clip_selection',
      quantity: selectionResult.usage.total_tokens,
      unit: 'tokens',
      unit_cost: 0.00001,
      total_cost: selectionResult.usage.total_tokens * 0.00001,
      started_at: new Date(selectStart),
      duration: Date.now() - selectStart,
      metadata: {
        model: 'gpt-4-turbo',
        prompt_name: 'segment_select',
        prompt_version: promptData.metadata.version,
        request_tokens: selectionResult.usage.prompt_tokens,
        response_tokens: selectionResult.usage.completion_tokens,
        segments_count: segments.length,
        candidates_count: candidates.length
      }
    })
  }
}
```

#### 4. 影片合成引擎埋點

```typescript
class VideoRenderEngine {
  async render(timelineId: string, userId: string) {
    // === 埋點 1: Cloudflare Stream 渲染 ===
    const renderStart = Date.now()
    const timeline = await db.timelines.findOne(timelineId)

    const renderResult = await cloudflareStream.render({
      timeline: timeline.data,
      voiceover: voiceover.file_path,
      music: music.file_path
    })

    await this.costTracker.record({
      execution_id: execution.id,
      user_id: userId,
      service: 'cloudflare_stream',
      operation: 'video_render',
      quantity: timeline.duration / 60,
      unit: 'minutes',
      unit_cost: 0.005,
      total_cost: (timeline.duration / 60) * 0.005,
      started_at: new Date(renderStart),
      duration: Date.now() - renderStart,
      metadata: {
        timeline_id: timelineId,
        video_duration: timeline.duration,
        segments_count: timeline.segments.length
      }
    })

    // === 埋點 2: S3 儲存成品 ===
    const storageStart = Date.now()
    const fileSize = renderResult.file_size  // bytes

    await s3.upload(renderResult.video_path, `videos/${userId}/${videoId}.mp4`)

    await this.costTracker.record({
      execution_id: execution.id,
      user_id: userId,
      service: 's3',
      operation: 'video_storage',
      quantity: fileSize / (1024 * 1024 * 1024),  // GB
      unit: 'GB',
      unit_cost: 0.023,  // $0.023/GB/月
      total_cost: (fileSize / (1024 * 1024 * 1024)) * 0.023,
      started_at: new Date(storageStart),
      duration: Date.now() - storageStart,
      metadata: {
        file_size: fileSize,
        file_path: `videos/${userId}/${videoId}.mp4`
      }
    })
  }
}
```

### CostTracker 服務設計

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
    started_at: Date
    duration: number
    metadata?: any
  }) {
    // 1. 寫入 cost_records
    await db.cost_records.insert({
      record_id: uuid(),
      ...data,
      created_at: new Date()
    })

    // 2. 更新 task_executions 的 total_cost
    const currentCost = await db.task_executions.findOne(data.execution_id)
    await db.task_executions.update(data.execution_id, {
      total_cost: (currentCost.total_cost || 0) + data.total_cost,
      ai_calls_count: currentCost.ai_calls_count + 1
    })

    // 3. 高成本告警（可選）
    if (data.total_cost > 1.0) {
      await this.alertHighCost(data)
    }
  }

  async alertHighCost(data: any) {
    // 記錄到系統 log 或發送通知
    console.warn(`[HIGH COST ALERT] ${data.service} - ${data.operation}: $${data.total_cost}`)
    // 未來可接入告警系統
  }
}
```

### 管理後台查詢資料流

#### 按服務查詢成本

```typescript
// API: GET /api/admin/cost/services?period=monthly
async function getCostByService(period: 'daily' | 'weekly' | 'monthly') {
  const startDate = getStartDate(period)

  const result = await db.query(`
    SELECT
      service,
      COUNT(*) as calls_count,
      SUM(total_cost) as total_cost,
      AVG(total_cost) as avg_cost,
      AVG(duration) as avg_duration
    FROM cost_records
    WHERE created_at >= $1
    GROUP BY service
    ORDER BY total_cost DESC
  `, [startDate])

  return result
}
```

#### 按 Prompt 查詢成本

```typescript
// API: GET /api/admin/cost/prompts?period=monthly
async function getCostByPrompt(period: string) {
  const startDate = getStartDate(period)

  const result = await db.query(`
    SELECT
      metadata->>'prompt_name' as prompt_name,
      metadata->>'prompt_version' as prompt_version,
      COUNT(*) as calls_count,
      SUM(total_cost) as total_cost,
      AVG(total_cost) as avg_cost,
      SUM(quantity) as total_tokens
    FROM cost_records
    WHERE created_at >= $1
      AND service = 'openai'
      AND metadata->>'prompt_name' IS NOT NULL
    GROUP BY prompt_name, prompt_version
    ORDER BY total_cost DESC
  `, [startDate])

  return result
}
```

#### 按用戶查詢成本

```typescript
// API: GET /api/admin/cost/users?period=monthly&limit=50
async function getCostByUser(period: string, limit: number = 50) {
  const startDate = getStartDate(period)

  const result = await db.query(`
    SELECT
      user_id,
      COUNT(DISTINCT execution_id) as tasks_count,
      SUM(total_cost) as total_cost,
      AVG(total_cost) as avg_cost_per_call
    FROM cost_records
    WHERE created_at >= $1
    GROUP BY user_id
    ORDER BY total_cost DESC
    LIMIT $2
  `, [startDate, limit])

  return result
}
```

### 資料表索引設計

為了優化查詢效能，需要建立以下索引：

```sql
-- cost_records 表索引
CREATE INDEX idx_cost_records_execution_id ON cost_records(execution_id);
CREATE INDEX idx_cost_records_user_id ON cost_records(user_id);
CREATE INDEX idx_cost_records_service ON cost_records(service);
CREATE INDEX idx_cost_records_created_at ON cost_records(created_at);
CREATE INDEX idx_cost_records_prompt_name ON cost_records((metadata->>'prompt_name'));

-- performance_records 表索引
CREATE INDEX idx_performance_records_execution_id ON performance_records(execution_id);
CREATE INDEX idx_performance_records_step_name ON performance_records(step_name);
CREATE INDEX idx_performance_records_created_at ON performance_records(created_at);

-- task_executions 表索引
CREATE INDEX idx_task_executions_user_id ON task_executions(user_id);
CREATE INDEX idx_task_executions_status ON task_executions(status);
CREATE INDEX idx_task_executions_created_at ON task_executions(created_at);
```

### 成本資料生命週期

**資料保留策略**：
- **cost_records**: 保留 12 個月（用於長期趨勢分析）
- **performance_records**: 保留 3 個月（主要用於近期瓶頸分析）
- **task_executions**: 保留 6 個月（用於任務追蹤與重試）

**資料歸檔**：
- 超過保留期限的資料可歸檔到 S3（JSON 格式）
- 保留聚合後的統計數據（按月、按服務、按 Prompt）

---

## 完成檢查

- [x] 繪製了三條主要資料流的完整流程圖
- [x] 定義了所有核心資料實體（11 個資料表）
- [x] 明確了每個階段的資料位置變化
- [x] 設計了 Prompt 管理系統（檔案型，支援 Git 版本控制）
- [x] 設計了資料生命週期管理策略
- [x] 確定了資料同步策略（輪詢 vs WebSocket）
- [x] 考慮了資料安全與隱私保護
- [x] 分析了資料流的成本
- [x] 設計了成本效能追蹤資料流
- [x] 定義了埋點位置與 CostTracker 服務
- [x] 設計了管理後台查詢 API 與索引優化

---

## 核心資料表總覽

### 業務資料表（7 個）
1. **videos** - 原始影片
2. **segments** - 影片片段
3. **segment_tags** - 片段標籤
4. **voiceovers** - 配音資料
5. **timelines** - 時間軸（草稿）
6. **generated_videos** - 生成的影片
7. **users** - 用戶資料（未詳細設計）

### 系統支援表（4 個）
8. **task_executions** - 任務執行記錄（支援多步驟處理）
9. **cost_records** - 成本記錄（埋點產生的成本數據）
10. **performance_records** - 效能記錄（埋點產生的效能數據）
11. **admin_users** - 管理員用戶（角色與權限管理）

### Prompt 管理（檔案系統，非資料庫）
- `prompts/` 目錄 - Markdown 檔案（含 frontmatter）
- Git 版本控制
- PromptManager 服務（檔案載入 + 快取）

---

**下一步**：
- [ ] 團隊討論與確認
- [ ] 調整資料結構設計
- [ ] 確認 Prompt 管理系統設計
- [ ] 確認成本估算是否合理
- [ ] 完成後更新 `00-INDEX.md` 狀態，繼續步驟 6
