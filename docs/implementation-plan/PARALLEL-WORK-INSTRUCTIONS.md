# 平行工作指示 - Logging 整合批次更新

**目的**: 將剩餘 16 個 Tasks 加入標準的 Logging 章節
**標準文件**: `docs/implementation-plan/LOGGING-STANDARDS.md`
**進度追蹤**: `docs/implementation-plan/LOGGING-INTEGRATION-STATUS.md`

---

## 📋 已完成的範例

請參考以下**已完成**的 Tasks 作為模板:
- ✅ `phase-1-infrastructure/task-1.5-logger-service.md` (Step 6-7: 驗證框架)
- ✅ `phase-2-engines/task-2.0-prompt-management.md` (📊 Logging 章節)

---

## 🎯 工作分配

每個 Claude Code 負責 2-3 個 Tasks，按照以下 prompts 執行。

---

## Prompt 1: Task 2.2 (Video Analysis) + Task 2.3 (Tag Conversion)

**負責人**: Claude Code #1

### Task 2.2: Google Video AI 整合

**檔案**: `docs/implementation-plan/phase-2-engines/task-2.2-video-analysis.md`

**插入位置**: 在文件末尾的「常見問題」章節**之前**插入以下完整章節

**插入內容**:

```markdown
---

## 📊 Logging 與錯誤處理整合

> 參考: [LOGGING-STANDARDS.md](../LOGGING-STANDARDS.md)

### 必須記錄的事件

#### 基礎事件 (TaskLogger)
- [ ] `task_started` - 任務開始
- [ ] `task_step_started` - 開始呼叫 Video AI
- [ ] `task_step_completed` - Video AI 分析完成
- [ ] `task_completed` - 任務完成 (包含總成本)
- [ ] `task_failed` - 任務失敗

#### AI 呼叫事件
- [ ] `ai_call_started` - Google Video AI 呼叫開始
- [ ] `ai_call_completed` - 分析成功 (包含場景數、標籤數、成本)
- [ ] `ai_call_failed` - API 失敗 (包含 status code, error details)
- [ ] `ai_response_validation_failed` - 回應格式驗證失敗

### 整合程式碼範例

```typescript
class VideoAnalysisEngine {
  async analyze(videoId: string, userId: string) {
    // 建立 TaskLogger
    const taskLogger = createTaskLogger('video_analysis', userId)
    const executionId = taskLogger.getExecutionId()
    const validator = new DataFlowValidator(taskLogger.getLogger())

    try {
      const video = await db.videos.findOne({ videoId })

      // 記錄任務開始
      await taskLogger.taskStarted(
        {
          videoId,
          duration: video.duration,
          filePath: video.file_path
        },
        ['call_video_ai', 'process_results']
      )

      // Step 1: 呼叫 Video AI
      await taskLogger.stepStarted(0, 'call_video_ai')

      const aiLogger = taskLogger.createAILogger('google_video_ai', 'video_analysis')

      await aiLogger.callStarted({
        videoUri: video.file_path,
        features: ['LABEL_DETECTION', 'SHOT_CHANGE_DETECTION'],
        videoDuration: video.duration
      })

      const startTime = Date.now()
      const result = await googleVideoAI.annotateVideo({
        inputUri: video.file_path,
        features: ['LABEL_DETECTION', 'SHOT_CHANGE_DETECTION']
      })
      const duration = Date.now() - startTime

      // 計算成本 (按影片分鐘數)
      const cost = (video.duration / 60) * 0.10

      await aiLogger.callCompleted(
        {
          scenes_detected: result.shotAnnotations?.length || 0,
          labels_count: result.labelAnnotations?.length || 0
        },
        cost
      )

      // 驗證 AI 回應 (基本檢查)
      if (!result.shotAnnotations || result.shotAnnotations.length === 0) {
        await taskLogger.getLogger().error('ai_response_validation_failed', {
          validation_error: 'EmptyResult',
          error_message: 'No shot annotations returned',
          video_id: videoId,
          video_duration: video.duration
        })
        throw new ValidationError('Video AI returned no shot annotations')
      }

      await taskLogger.stepCompleted(0, 'call_video_ai', {
        scenes: result.shotAnnotations.length,
        labels: result.labelAnnotations.length,
        duration_ms: duration,
        cost
      })

      // Step 2: 處理結果
      await taskLogger.stepStarted(1, 'process_results')
      // ... 處理邏輯 ...
      await taskLogger.stepCompleted(1, 'process_results')

      // 任務完成
      await taskLogger.taskCompleted(
        {
          scenes_created: result.shotAnnotations.length,
          labels_created: result.labelAnnotations.length
        },
        cost
      )

      return result

    } catch (error) {
      await taskLogger.taskFailed('call_video_ai', error, {
        videoId,
        videoDuration: video?.duration
      })
      throw error  // ✅ Fail Fast
    }
  }
}
```

### 必須驗證的資料

- [ ] AI 回應非空 (至少有 1 個 shot annotation)
- [ ] 場景時間範圍有效 (start < end, 不超過影片長度)
- [ ] 標籤信心度在 0-1 之間

### Fail Fast 檢查清單

- [x] ✅ API 失敗時立即 throw error
- [x] ✅ 回應為空時立即 throw error
- [x] ✅ 記錄完整錯誤上下文 (videoId, API response)
- [x] ❌ 不使用 fallback 或預設值

---
```

### Task 2.3: Tag Conversion

**檔案**: `docs/implementation-plan/phase-2-engines/task-2.3-tag-conversion.md`

**插入位置**: 同樣在文件末尾的常見問題之前

**插入內容**:

```markdown
---

## 📊 Logging 與錯誤處理整合

> 參考: [LOGGING-STANDARDS.md](../LOGGING-STANDARDS.md)

### 必須記錄的事件

#### 基礎事件
- [ ] `task_step_started` - 開始標籤轉換
- [ ] `task_step_completed` - 轉換完成
- [ ] `data_flow_validation_failed` - 轉換結果驗證失敗

### 整合程式碼範例

```typescript
class TagConversionEngine {
  async convert(videoAIResult: any, taskLogger: TaskLogger) {
    const validator = new DataFlowValidator(taskLogger.getLogger())

    try {
      await taskLogger.stepStarted(stepIndex, 'convert_tags')

      // 轉換標籤
      const tags = this.convertLabelsToTags(videoAIResult.labelAnnotations)

      // 驗證轉換結果
      if (tags.length === 0) {
        await taskLogger.getLogger().warn('data_flow_validation_failed', {
          validation_error: 'EmptyResult',
          error_message: 'Tag conversion returned no tags',
          input_labels_count: videoAIResult.labelAnnotations?.length || 0
        })
      }

      // 驗證標籤格式
      for (const tag of tags) {
        if (!tag.category || !tag.name) {
          await taskLogger.getLogger().error('data_flow_validation_failed', {
            validation_error: 'InvalidTagFormat',
            error_message: 'Tag missing required fields',
            tag
          })
          throw new ValidationError('Invalid tag format')
        }
      }

      await taskLogger.stepCompleted(stepIndex, 'convert_tags', {
        tags_created: tags.length,
        categories: [...new Set(tags.map(t => t.category))]
      })

      return tags

    } catch (error) {
      throw error  // ✅ Fail Fast
    }
  }
}
```

### Fail Fast 檢查清單

- [x] ✅ 標籤格式錯誤時立即 throw error
- [x] ⚠️  轉換結果為空時記錄 WARN (可能是影片內容問題)
- [x] ✅ 記錄轉換統計資訊

---
```

**提交訊息**:
```bash
git add docs/implementation-plan/phase-2-engines/task-2.{2,3}*.md
git commit -m "feat(docs): Task 2.2-2.3 加入 Logging 整合

- Task 2.2: Video Analysis 完整 TaskLogger 範例
- Task 2.3: Tag Conversion 資料驗證

根據 LOGGING-STANDARDS.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

---

## Prompt 2: Task 2.5 (STT) + Task 2.6 (Semantic Analysis)

**負責人**: Claude Code #2

### Task 2.5: STT Integration (Whisper)

**檔案**: `docs/implementation-plan/phase-2-engines/task-2.5-stt-integration.md`

**插入位置**: 在「常見問題」之前

**插入內容**:

```markdown
---

## 📊 Logging 與錯誤處理整合

> 參考: [LOGGING-STANDARDS.md](../LOGGING-STANDARDS.md)

### 必須記錄的事件

#### 基礎事件
- [ ] `task_started` - 任務開始
- [ ] `task_step_started` - 開始 STT
- [ ] `task_step_completed` - STT 完成
- [ ] `task_completed` - 任務完成 (包含成本)
- [ ] `task_failed` - 任務失敗

#### AI 呼叫事件
- [ ] `ai_call_started` - Whisper 呼叫開始
- [ ] `ai_call_completed` - 轉錄成功 (包含時長、成本)
- [ ] `ai_call_failed` - Whisper API 失敗

### 整合程式碼範例

```typescript
class STTEngine {
  async transcribe(voiceoverId: string, userId: string) {
    const taskLogger = createTaskLogger('stt_transcription', userId)
    const executionId = taskLogger.getExecutionId()
    const validator = new DataFlowValidator(taskLogger.getLogger())

    try {
      const voiceover = await db.voiceovers.findOne({ voiceoverId })

      await taskLogger.taskStarted(
        {
          voiceoverId,
          duration: voiceover.duration,
          filePath: voiceover.file_path
        },
        ['whisper_stt', 'save_transcript']
      )

      // Step 1: Whisper STT
      await taskLogger.stepStarted(0, 'whisper_stt')

      const aiLogger = taskLogger.createAILogger('openai_whisper', 'stt')

      await aiLogger.callStarted({
        file: voiceover.file_path,
        language: 'zh',
        duration: voiceover.duration
      })

      const startTime = Date.now()
      const result = await openai.audio.transcriptions.create({
        file: fs.createReadStream(voiceover.file_path),
        model: 'whisper-1',
        language: 'zh',
        response_format: 'verbose_json'
      })
      const duration = Date.now() - startTime

      // 計算成本 (按音檔分鐘數)
      const cost = (voiceover.duration / 60) * 0.006

      await aiLogger.callCompleted(
        {
          transcript_length: result.text.length,
          segments_count: result.segments?.length || 0,
          language: result.language
        },
        cost
      )

      // 驗證轉錄結果
      if (!result.text || result.text.trim().length === 0) {
        await taskLogger.getLogger().error('ai_response_validation_failed', {
          validation_error: 'EmptyTranscript',
          error_message: 'Whisper returned empty transcript',
          voiceover_id: voiceoverId,
          audio_duration: voiceover.duration
        })
        throw new ValidationError('Empty transcript from Whisper')
      }

      await taskLogger.stepCompleted(0, 'whisper_stt', {
        transcript_length: result.text.length,
        duration_ms: duration,
        cost
      })

      // Step 2: 儲存轉錄
      await taskLogger.stepStarted(1, 'save_transcript')
      await db.voiceovers.update(voiceoverId, {
        transcript: result.text,
        transcript_segments: result.segments
      })
      await taskLogger.stepCompleted(1, 'save_transcript')

      await taskLogger.taskCompleted(
        { transcript_length: result.text.length },
        cost
      )

      return result

    } catch (error) {
      await taskLogger.taskFailed('whisper_stt', error, {
        voiceoverId,
        audioDuration: voiceover?.duration
      })
      throw error  // ✅ Fail Fast
    }
  }
}
```

### 必須驗證的資料

- [ ] 轉錄文字非空
- [ ] 音檔格式正確 (mp3, wav, m4a)
- [ ] 音檔時長與預期相符

### Fail Fast 檢查清單

- [x] ✅ 音檔格式錯誤時立即 throw error
- [x] ✅ 轉錄結果為空時立即 throw error
- [x] ✅ 記錄完整錯誤上下文 (file path, duration, error details)

---
```

### Task 2.6: Semantic Analysis (GPT-4)

**檔案**: `docs/implementation-plan/phase-2-engines/task-2.6-semantic-analysis.md`

**插入位置**: 在「常見問題」之前

**插入內容**:

```markdown
---

## 📊 Logging 與錯誤處理整合

> 參考: [LOGGING-STANDARDS.md](../LOGGING-STANDARDS.md)

### 必須記錄的事件

#### 基礎事件
- [ ] `task_started` - 任務開始
- [ ] `task_step_started` - 開始語意分析
- [ ] `task_step_completed` - 分析完成
- [ ] `task_completed` - 任務完成 (包含成本)
- [ ] `task_failed` - 任務失敗

#### AI 呼叫事件 (透過 PromptManager 自動記錄)
- [ ] `ai_call_started` - GPT-4 呼叫開始
- [ ] `ai_call_completed` - 分析成功
- [ ] `ai_call_failed` - GPT-4 失敗
- [ ] `ai_response_validation_failed` - Schema 驗證失敗

### 整合程式碼範例

```typescript
class SemanticAnalysisEngine {
  async analyze(transcript: string, userId: string) {
    const taskLogger = createTaskLogger('semantic_analysis', userId)
    const executionId = taskLogger.getExecutionId()
    const validator = new DataFlowValidator(taskLogger.getLogger())
    const callId = uuid()

    try {
      await taskLogger.taskStarted(
        { transcript_length: transcript.length },
        ['ai_analysis', 'save_results']
      )

      // Step 1: AI 語意分析
      await taskLogger.stepStarted(0, 'ai_analysis')

      // 透過 PromptManager 呼叫 (自動記錄 AI 呼叫與成本)
      const { response, cost } = await promptManager.executePrompt(
        'voiceover-processing',
        'semantic-analysis',
        { transcript, language: 'zh-TW' },
        { executionId, userId, callId }
      )

      // ✅ 驗證 AI 回應 Schema
      await validator.validateAIResponse(
        callId,
        'semantic_analysis',  // 在 schemas.ts 中已定義
        response,
        // 額外業務邏輯驗證
        (data) => {
          const errors = []

          // 關鍵字不應該超過 20 個
          if (data.keywords.length > 20) {
            errors.push({
              field: 'keywords',
              message: 'Too many keywords (max 20)',
              value: data.keywords.length
            })
          }

          // topics 至少要有 1 個
          if (data.topics.length === 0) {
            errors.push({
              field: 'topics',
              message: 'Must have at least 1 topic',
              value: data.topics.length
            })
          }

          return errors
        }
      )

      await taskLogger.stepCompleted(0, 'ai_analysis', {
        topics_count: response.topics.length,
        keywords_count: response.keywords.length,
        tone: response.tone
      })

      // Step 2: 儲存結果
      await taskLogger.stepStarted(1, 'save_results')
      await db.voiceovers.update(voiceoverId, {
        semantic_analysis: response
      })
      await taskLogger.stepCompleted(1, 'save_results')

      await taskLogger.taskCompleted(
        {
          topics: response.topics.length,
          keywords: response.keywords.length
        },
        cost
      )

      return response

    } catch (error) {
      await taskLogger.taskFailed('ai_analysis', error, {
        transcript_length: transcript.length
      })
      throw error  // ✅ Fail Fast
    }
  }
}
```

### 必須驗證的資料

根據 `schemas.ts` 中的定義:

- [x] `topics`: string[] (min 1, required)
- [x] `keywords`: string[] (min 1, max 20, required)
- [x] `tone`: 'professional' | 'casual' | 'enthusiastic' (required)

### Fail Fast 檢查清單

- [x] ✅ Schema 驗證失敗時立即 throw error
- [x] ✅ 業務邏輯驗證失敗時立即 throw error
- [x] ✅ 記錄完整 AI 回應 (用於 debug)
- [x] ❌ 不使用預設值或 fallback

---
```

**提交訊息**:
```bash
git add docs/implementation-plan/phase-2-engines/task-2.{5,6}*.md
git commit -m "feat(docs): Task 2.5-2.6 加入 Logging 整合

- Task 2.5: Whisper STT 完整記錄與成本追蹤
- Task 2.6: Semantic Analysis Schema 驗證

根據 LOGGING-STANDARDS.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

---

## Prompt 3: Task 2.7 (Voiceover Split) + Task 2.9 (AI Selection)

**負責人**: Claude Code #3

### Task 2.7: Voiceover Split (GPT-4)

**檔案**: `docs/implementation-plan/phase-2-engines/task-2.7-voiceover-split.md`

**插入位置**: 在「常見問題」之前

**插入內容**:

```markdown
---

## 📊 Logging 與錯誤處理整合

> 參考: [LOGGING-STANDARDS.md](../LOGGING-STANDARDS.md)

### 必須記錄的事件

#### 基礎事件
- [ ] `task_started` - 任務開始
- [ ] `task_step_started` - 開始配音切分
- [ ] `task_step_completed` - 切分完成
- [ ] `task_completed` - 任務完成
- [ ] `task_failed` - 任務失敗

#### AI 呼叫事件 (透過 PromptManager)
- [ ] `ai_call_started`, `ai_call_completed`, `ai_call_failed`
- [ ] `ai_response_validation_failed` - Schema 或時間軸驗證失敗

### 整合程式碼範例

```typescript
import { validateVoiceoverTiming } from '@/services/validators/data-flow.validator'

class VoiceoverSplitEngine {
  async split(voiceoverId: string, userId: string) {
    const taskLogger = createTaskLogger('voiceover_split', userId)
    const executionId = taskLogger.getExecutionId()
    const validator = new DataFlowValidator(taskLogger.getLogger())
    const callId = uuid()

    try {
      const voiceover = await db.voiceovers.findOne({ voiceoverId })

      await taskLogger.taskStarted(
        {
          voiceoverId,
          transcript_length: voiceover.transcript.length,
          duration: voiceover.duration
        },
        ['ai_split', 'validate_timing', 'save_segments']
      )

      // Step 1: AI 切分
      await taskLogger.stepStarted(0, 'ai_split')

      const { response, cost } = await promptManager.executePrompt(
        'voiceover-processing',
        'voiceover-split',
        {
          transcript: voiceover.transcript,
          duration: voiceover.duration
        },
        { executionId, userId, callId }
      )

      // ✅ 驗證 Schema
      await validator.validateAIResponse(
        callId,
        'voiceover_split',  // 在 schemas.ts 中已定義
        response
      )

      await taskLogger.stepCompleted(0, 'ai_split', {
        segments_count: response.segments.length
      })

      // Step 2: 驗證時間軸一致性 ✅ 關鍵驗證！
      await taskLogger.stepStarted(1, 'validate_timing')

      await validateVoiceoverTiming(
        response.segments,
        voiceover.duration,
        taskLogger.getLogger()
      )

      await taskLogger.stepCompleted(1, 'validate_timing')

      // Step 3: 儲存片段
      await taskLogger.stepStarted(2, 'save_segments')
      // ... 儲存邏輯 ...
      await taskLogger.stepCompleted(2, 'save_segments')

      await taskLogger.taskCompleted(
        { segments_created: response.segments.length },
        cost
      )

      return response.segments

    } catch (error) {
      await taskLogger.taskFailed('ai_split', error, {
        voiceoverId,
        duration: voiceover?.duration
      })
      throw error  // ✅ Fail Fast
    }
  }
}
```

### 必須驗證的資料

根據 `schemas.ts`:
- [x] `segments`: array (min 1)
- [x] 每個 segment: `{ start: number, end: number, text: string, keywords: string[] }`

**時間軸一致性** (使用 `validateVoiceoverTiming`):
- [x] start < end
- [x] 無縫隙 (segment[i].end == segment[i+1].start)
- [x] 無重疊
- [x] 不超過總長度

### Fail Fast 檢查清單

- [x] ✅ Schema 驗證失敗時立即 throw error
- [x] ✅ 時間軸驗證失敗時立即 throw error (不嘗試修復)
- [x] ✅ 記錄詳細的時間軸錯誤 (哪個 segment 有問題)

---
```

### Task 2.9: AI Selection (Gemini)

**檔案**: `docs/implementation-plan/phase-2-engines/task-2.9-ai-selection.md`

**插入位置**: 在「常見問題」之前

**插入內容**:

```markdown
---

## 📊 Logging 與錯誤處理整合

> 參考: [LOGGING-STANDARDS.md](../LOGGING-STANDARDS.md)

### 必須記錄的事件

#### 基礎事件
- [ ] `task_started` - 任務開始
- [ ] `task_step_started` - 為每個配音片段選片
- [ ] `task_step_completed` - 選片完成
- [ ] `task_completed` - 所有選片完成
- [ ] `task_failed` - 任務失敗

#### AI 呼叫事件 (每個配音片段都要記錄一次)
- [ ] `ai_call_started` - Gemini 選片開始
- [ ] `ai_call_completed` - 選片成功
- [ ] `ai_call_failed` - Gemini 失敗
- [ ] `ai_response_validation_failed` - Schema 或參照驗證失敗

### 整合程式碼範例

```typescript
class AISelectionEngine {
  async selectClips(voiceoverSegments: any[], userId: string) {
    const taskLogger = createTaskLogger('ai_selection', userId)
    const executionId = taskLogger.getExecutionId()
    const validator = new DataFlowValidator(taskLogger.getLogger())

    try {
      await taskLogger.taskStarted(
        { segments_count: voiceoverSegments.length },
        ['query_candidates', ...voiceoverSegments.map((_, i) => `select_segment_${i}`)]
      )

      const selections = []
      let totalCost = 0

      // 為每個配音片段選片
      for (let i = 0; i < voiceoverSegments.length; i++) {
        const segment = voiceoverSegments[i]

        await taskLogger.stepStarted(i + 1, `select_segment_${i}`)

        // 查詢候選片段
        const candidates = await this.queryCandidates(segment)

        if (candidates.length === 0) {
          await taskLogger.getLogger().error('data_flow_validation_failed', {
            validation_error: 'EmptyQueryResult',
            error_message: `No candidates for voice segment ${i}`,
            error_details: {
              voice_text: segment.text,
              keywords: segment.keywords
            }
          })
          throw new ValidationError(`No candidates for segment ${i}`)
        }

        // AI 選片
        const callId = uuid()
        const { response, cost } = await promptManager.executePrompt(
          'video-selection',
          'segment-select',
          {
            voiceText: segment.text,
            duration: segment.end - segment.start,
            keywords: segment.keywords,
            candidates: candidates.map(c => ({
              id: c.segment_id,
              description: c.description,
              duration: c.duration
            }))
          },
          { executionId, userId, callId }
        )

        // ✅ 驗證 Schema
        await validator.validateAIResponse(
          callId,
          'segment_selection',  // 在 schemas.ts 中已定義
          response
        )

        // ✅ 驗證參照完整性 (selectedSegmentId 必須在候選列表中)
        const candidateIds = candidates.map(c => c.segment_id)
        await validator.validateReference(
          response.selectedSegmentId,
          candidateIds,
          { voiceSegmentIndex: i, voiceText: segment.text }
        )

        // ✅ 驗證數值範圍 (trimEnd <= segment.duration)
        const selectedSegment = candidates.find(c => c.segment_id === response.selectedSegmentId)
        await validator.validateRange(
          response.trimEnd,
          'trimEnd',
          response.trimStart,  // min
          selectedSegment.duration,  // max
          { selectedSegmentId: response.selectedSegmentId }
        )

        await taskLogger.stepCompleted(i + 1, `select_segment_${i}`, {
          selected_id: response.selectedSegmentId,
          trim: `${response.trimStart}-${response.trimEnd}`
        })

        selections.push(response)
        totalCost += cost
      }

      await taskLogger.taskCompleted(
        { selections_count: selections.length },
        totalCost
      )

      return selections

    } catch (error) {
      await taskLogger.taskFailed(`select_segment`, error)
      throw error  // ✅ Fail Fast
    }
  }
}
```

### 必須驗證的資料

根據 `schemas.ts`:
- [x] `selectedSegmentId`: string (required)
- [x] `trimStart`: number >= 0
- [x] `trimEnd`: number >= trimStart

**額外驗證**:
- [x] selectedSegmentId 在候選列表中 (使用 `validateReference`)
- [x] trimEnd <= segment.duration (使用 `validateRange`)

### Fail Fast 檢查清單

- [x] ✅ 候選片段為空時立即 throw error (不嘗試放寬條件)
- [x] ✅ AI 選了不存在的片段時立即 throw error
- [x] ✅ trim 範圍錯誤時立即 throw error
- [x] ✅ 記錄完整的選片上下文 (候選列表、AI 回應、錯誤)

---
```

**提交訊息**:
```bash
git add docs/implementation-plan/phase-2-engines/task-2.{7,9}*.md
git commit -m "feat(docs): Task 2.7, 2.9 加入 Logging 整合

- Task 2.7: Voiceover Split 時間軸驗證
- Task 2.9: AI Selection 參照完整性驗證

根據 LOGGING-STANDARDS.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

---

## Prompt 4: Task 2.10 (Timeline) + Task 2.12 (Video Composition)

**負責人**: Claude Code #4

### Task 2.10: Timeline Generation

**檔案**: `docs/implementation-plan/phase-2-engines/task-2.10-timeline-generation.md`

**插入位置**: 在「常見問題」之前

**插入內容**:

```markdown
---

## 📊 Logging 與錯誤處理整合

> 參考: [LOGGING-STANDARDS.md](../LOGGING-STANDARDS.md)

### 必須記錄的事件

#### 基礎事件
- [ ] `task_started` - 任務開始
- [ ] `task_step_started` - 生成時間軸
- [ ] `task_step_completed` - 時間軸生成完成
- [ ] `task_completed` - 任務完成
- [ ] `task_failed` - 任務失敗
- [ ] `data_flow_validation_failed` - 時間軸結構驗證失敗

### 整合程式碼範例

```typescript
class TimelineGenerationEngine {
  async generateTimeline(selections: any[], voiceoverId: string, userId: string) {
    const taskLogger = createTaskLogger('timeline_generation', userId)
    const executionId = taskLogger.getExecutionId()
    const validator = new DataFlowValidator(taskLogger.getLogger())

    try {
      const voiceover = await db.voiceovers.findOne({ voiceoverId })

      await taskLogger.taskStarted(
        { selections_count: selections.length },
        ['generate_timeline', 'validate_timeline', 'save_timeline']
      )

      // Step 1: 生成時間軸 JSON
      await taskLogger.stepStarted(0, 'generate_timeline')

      const timeline = {
        timeline_id: uuid(),
        voiceover_url: voiceover.file_url,
        total_duration: voiceover.duration,
        segments: selections.map((sel, index) => ({
          index,
          start_time: voiceover.segments[index].start,
          end_time: voiceover.segments[index].end,
          video_segment_id: sel.selectedSegmentId,
          video_trim_start: sel.trimStart,
          video_trim_end: sel.trimEnd
        }))
      }

      await taskLogger.stepCompleted(0, 'generate_timeline', {
        segments_count: timeline.segments.length
      })

      // Step 2: 驗證時間軸結構 ✅ 關鍵驗證！
      await taskLogger.stepStarted(1, 'validate_timeline')

      await validator.validateDataFlow(
        'ai_selection',
        'timeline_generator',
        'timeline',  // 在 schemas.ts 中已定義
        timeline
      )

      // 額外驗證: 時間軸一致性
      const errors = []
      for (let i = 0; i < timeline.segments.length; i++) {
        const seg = timeline.segments[i]

        // 檢查 start < end
        if (seg.start_time >= seg.end_time) {
          errors.push({
            segment_index: i,
            error: 'start_time >= end_time',
            data: seg
          })
        }

        // 檢查 video_trim_end <= segment.duration
        const videoSegment = await db.segments.findOne({ segment_id: seg.video_segment_id })
        if (seg.video_trim_end > videoSegment.duration) {
          errors.push({
            segment_index: i,
            error: 'video_trim_end > segment.duration',
            data: { ...seg, segment_duration: videoSegment.duration }
          })
        }
      }

      if (errors.length > 0) {
        await taskLogger.getLogger().error('data_flow_validation_failed', {
          validation_error: 'InvalidTimelineStructure',
          error_message: 'Timeline has invalid time ranges',
          error_details: { validation_errors: errors }
        })
        throw new ValidationError(`Timeline validation failed: ${errors.length} errors`)
      }

      await taskLogger.stepCompleted(1, 'validate_timeline')

      // Step 3: 儲存時間軸
      await taskLogger.stepStarted(2, 'save_timeline')
      await db.timelines.create({ timeline_json: timeline })
      await taskLogger.stepCompleted(2, 'save_timeline')

      await taskLogger.taskCompleted({ timeline_id: timeline.timeline_id }, 0)

      return timeline

    } catch (error) {
      await taskLogger.taskFailed('generate_timeline', error)
      throw error  // ✅ Fail Fast
    }
  }
}
```

### 必須驗證的資料

根據 `schemas.ts`:
- [x] `timeline_id`: string
- [x] `voiceover_url`: string (uri)
- [x] `total_duration`: number >= 0
- [x] `segments`: array (min 1)
- [x] 每個 segment 的 start_time < end_time

**額外驗證**:
- [x] video_trim_end <= segment.duration
- [x] 所有 video_segment_id 在資料庫中存在

### Fail Fast 檢查清單

- [x] ✅ 時間範圍錯誤時立即 throw error
- [x] ✅ 片段不存在時立即 throw error
- [x] ✅ 記錄詳細的驗證錯誤

---
```

### Task 2.12: Video Composition

**檔案**: `docs/implementation-plan/phase-2-engines/task-2.12-video-composition.md`

**插入位置**: 在「常見問題」之前

**插入內容**:

```markdown
---

## 📊 Logging 與錯誤處理整合

> 參考: [LOGGING-STANDARDS.md](../LOGGING-STANDARDS.md)

### 必須記錄的事件

#### 基礎事件
- [ ] `task_started` - 任務開始
- [ ] `task_step_started` - 下載素材/執行 FFmpeg
- [ ] `task_step_completed` - 步驟完成
- [ ] `task_completed` - 影片合成完成
- [ ] `task_failed` - 任務失敗

#### 檔案/FFmpeg 事件
- [ ] `file_operation_failed` - 檔案下載失敗
- [ ] `data_flow_validation_failed` - 檔案驗證失敗 (不存在/大小為0)
- [ ] `ffmpeg_execution_failed` - FFmpeg 執行失敗

### 整合程式碼範例

```typescript
class VideoCompositionEngine {
  async compose(timelineId: string, userId: string) {
    const taskLogger = createTaskLogger('video_composition', userId)
    const executionId = taskLogger.getExecutionId()
    const validator = new DataFlowValidator(taskLogger.getLogger())

    try {
      const timeline = await db.timelines.findOne({ timelineId })

      await taskLogger.taskStarted(
        { timeline_id: timelineId, segments_count: timeline.timeline_json.segments.length },
        ['download_segments', 'validate_files', 'ffmpeg_compose', 'upload_result']
      )

      // Step 1: 下載素材
      await taskLogger.stepStarted(0, 'download_segments')

      const localFiles = []
      for (const seg of timeline.timeline_json.segments) {
        const segment = await db.segments.findOne({ segment_id: seg.video_segment_id })

        try {
          const localPath = await this.downloadFile(segment.file_path)
          localFiles.push({ segmentId: seg.video_segment_id, path: localPath })
        } catch (error) {
          await taskLogger.getLogger().error('file_operation_failed', {
            operation: 'download',
            file_path: segment.file_path,
            segment_id: seg.video_segment_id,
            error_type: error.constructor.name,
            error_message: error.message
          })
          throw error
        }
      }

      await taskLogger.stepCompleted(0, 'download_segments', {
        files_downloaded: localFiles.length
      })

      // Step 2: 驗證檔案 ✅ 關鍵驗證！
      await taskLogger.stepStarted(1, 'validate_files')

      for (const file of localFiles) {
        await validator.validateFile(file.path, {
          mustExist: true,
          minSize: 1024  // 至少 1KB
        })
      }

      await taskLogger.stepCompleted(1, 'validate_files')

      // Step 3: FFmpeg 合成
      await taskLogger.stepStarted(2, 'ffmpeg_compose')

      const ffmpegCommand = this.buildFFmpegCommand(localFiles, timeline)
      const startTime = Date.now()

      try {
        const result = await this.executeFFmpeg(ffmpegCommand)
        const duration = Date.now() - startTime

        await taskLogger.stepCompleted(2, 'ffmpeg_compose', {
          duration_ms: duration,
          output_size: result.fileSize
        })

      } catch (error) {
        await taskLogger.getLogger().error('ffmpeg_execution_failed', {
          error_message: error.message,
          error_details: {
            exitCode: error.exitCode,
            // ✅ 記錄完整的 stderr (超級重要！)
            stderr: error.stderr,
            // ✅ 記錄 FFmpeg 指令 (用於重現問題)
            command: ffmpegCommand,
            // ✅ 記錄所有輸入檔案資訊
            input_files: localFiles.map(f => ({
              path: f.path,
              size: fs.statSync(f.path).size,
              exists: fs.existsSync(f.path)
            }))
          }
        })
        throw error
      }

      // Step 4: 上傳結果
      await taskLogger.stepStarted(3, 'upload_result')
      const outputUrl = await this.uploadToStorage(result.outputPath)
      await taskLogger.stepCompleted(3, 'upload_result')

      // 計算成本 (Cloudflare Stream)
      const cost = (timeline.timeline_json.total_duration / 45) * 0.004

      await taskLogger.taskCompleted({ output_url: outputUrl }, cost)

      return { url: outputUrl }

    } catch (error) {
      await taskLogger.taskFailed('ffmpeg_compose', error, {
        timeline_id: timelineId
      })
      throw error  // ✅ Fail Fast
    }
  }
}
```

### 必須驗證的資料

- [x] 所有片段檔案存在
- [x] 檔案大小 > 0 bytes
- [x] FFmpeg 執行成功 (exit code 0)

### Fail Fast 檢查清單

- [x] ✅ 檔案不存在時立即 throw error
- [x] ✅ 檔案大小為 0 時立即 throw error
- [x] ✅ FFmpeg 失敗時立即 throw error (記錄完整 stderr 與指令)
- [x] ❌ 不嘗試修復或重新嘗試 (直接失敗)

---
```

**提交訊息**:
```bash
git add docs/implementation-plan/phase-2-engines/task-2.{10,12}*.md
git commit -m "feat(docs): Task 2.10, 2.12 加入 Logging 整合

- Task 2.10: Timeline 時間軸結構驗證
- Task 2.12: Video Composition 檔案驗證與 FFmpeg 錯誤記錄

根據 LOGGING-STANDARDS.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

---

## 📋 工作分配總結

| Claude Code | Tasks | 預估時間 |
|-------------|-------|----------|
| #1 | Task 2.2, 2.3 | 15-20 分鐘 |
| #2 | Task 2.5, 2.6 | 15-20 分鐘 |
| #3 | Task 2.7, 2.9 | 20-25 分鐘 |
| #4 | Task 2.10, 2.12 | 20-25 分鐘 |

**總計**: 4 個 Claude Code 平行作業,約 25 分鐘內完成核心 8 個 Tasks

---

## ✅ 完成後的驗證

所有 Claude Code 完成後,執行:

```bash
# 檢查所有更新的檔案
git log --oneline -10

# 確認 8 個核心 Task 都已更新
ls -la docs/implementation-plan/phase-2-engines/task-2.{2,3,5,6,7,9,10,12}*.md
```

---

## 📝 注意事項

1. **插入位置**: 統一在「常見問題」或「Task 完成確認」之前
2. **提交訊息**: 使用統一格式,包含 Claude Code 標記
3. **不要修改**: 現有的實作步驟或其他章節
4. **驗證**: 插入後確認 Markdown 格式正確 (無語法錯誤)

---

**準備好了嗎?** 複製以上 4 個 Prompt 給 4 個 Claude Code,讓它們平行作業！
