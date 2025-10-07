# Task 2.7: 配音切分

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.7 |
| **Task 名稱** | 配音切分 |
| **所屬 Phase** | Phase 2: 核心引擎開發 |
| **預估時間** | 2-3 小時 (STT 整合 1h + 切分實作 1h + 測試 1h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 2.5 (Whisper STT 整合) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的配音切分問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Audio codec not supported
          ^^^^^^^^^^^^^^^^^^^^^^^  ← 音訊格式不支援
   ```

2. **判斷錯誤類型**
   - `Audio codec not supported` → 音訊格式問題
   - `Invalid timestamp` → 時間碼格式錯誤
   - `Segment duration too short` → 片段太短
   - `FFmpeg command failed` → FFmpeg 執行失敗

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"配音切不了"  ← 太模糊
"音訊處理錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"FFmpeg split audio by timestamp"  ← 具體功能
"Whisper API word-level timestamps" ← 明確的時間碼問題
"FFmpeg preserve audio quality" ← 品質相關
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- FFmpeg: https://ffmpeg.org/documentation.html
- Whisper API: https://platform.openai.com/docs/guides/speech-to-text

**優先順序 2: 音訊處理指南**
- Audio Processing: https://trac.ffmpeg.org/wiki/AudioChannelManipulation

---

### Step 3: 檢查 FFmpeg 與 Whisper

```bash
# 檢查 FFmpeg 是否安裝
ffmpeg -version

# 測試簡單的音訊切分
ffmpeg -i input.mp3 -ss 00:00:10 -t 00:00:05 output.mp3

# 檢查 Whisper API 連接
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F model="whisper-1" \
  -F file="@test.mp3"
```

---

## 🎯 功能描述

根據使用者上傳的配音檔案,使用 Whisper STT 取得逐字稿和時間碼,然後用 FFmpeg 按照時間碼切分配音檔,產生對應的配音片段。

### 為什麼需要這個?

- 🎯 **問題**: 使用者上傳整段配音,需要對應到影片片段才能自動配對
- ✅ **解決**: 使用 Whisper 取得字級時間碼,按照字幕切分配音檔
- 💡 **比喻**: 就像把長篇演講切成一句一句,每句話都有對應的音檔和時間

### 完成後你會有:

- ✅ Whisper STT 整合完成
- ✅ 自動取得配音的逐字稿和時間碼
- ✅ 按照字幕時間自動切分配音檔
- ✅ 每個配音片段都有對應的音檔和文字
- ✅ 配音片段儲存到資料庫和儲存空間
- ✅ 支援多種音訊格式

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. OpenAI Whisper STT

**是什麼**: OpenAI 的語音轉文字 API,支援多語言且準確度高

**核心概念**:
- **Word-level Timestamps**: 可以取得每個字的開始和結束時間
- **語言偵測**: 自動偵測語言
- **標點符號**: 自動加入標點符號
- **多格式支援**: 支援 mp3, mp4, m4a, wav 等格式

**API 回傳範例**:
```json
{
  "task": "transcribe",
  "language": "zh",
  "duration": 10.5,
  "text": "大家好,今天要介紹 AI 影片剪輯。",
  "words": [
    {
      "word": "大家好",
      "start": 0.0,
      "end": 0.8
    },
    {
      "word": "今天",
      "start": 1.0,
      "end": 1.3
    }
  ]
}
```

**為什麼選 Whisper**:
- 繁體中文支援良好
- 準確度高
- 價格便宜 ($0.006 / 分鐘)
- 官方 API 穩定

### 2. FFmpeg 音訊切分

**是什麼**: 強大的音視訊處理工具

**核心指令**:
```bash
# 基本切分語法
ffmpeg -i input.mp3 \
  -ss <開始時間> \
  -to <結束時間> \
  -c copy \
  output.mp3

# 範例: 切出 10 秒到 15 秒的片段
ffmpeg -i voiceover.mp3 \
  -ss 00:00:10 \
  -to 00:00:15 \
  -c copy \
  segment_1.mp3
```

**重要參數**:
- `-ss`: 開始時間 (seek start)
- `-to` 或 `-t`: 結束時間或持續時間
- `-c copy`: 複製編碼,不重新編碼 (快速且不失真)
- `-i`: 輸入檔案

**為什麼用 `-c copy`?**
- 不重新編碼,速度快 10 倍以上
- 不會損失音質
- 不會增加檔案大小

### 3. 時間碼格式

**常見格式**:
```typescript
// 秒數格式 (Whisper 使用)
const timestamp = 12.5; // 12.5 秒

// HH:MM:SS.mmm 格式 (FFmpeg 使用)
const timestamp = "00:00:12.500";

// 轉換函式
function secondsToFFmpegTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
}
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.5: Whisper STT 整合 (STT 服務已建立)
- ✅ Task 1.1: 資料庫 Schema (有 voiceover_segments 表)
- ✅ Task 1.2: Supabase Storage (可以儲存音訊檔)

### API 需求
- OpenAI API Key (用於 Whisper)

### 系統需求
- FFmpeg 已安裝

### 套件依賴
```json
{
  "dependencies": {
    "openai": "^4.20.0",
    "fluent-ffmpeg": "^2.1.2"
  },
  "devDependencies": {
    "@types/fluent-ffmpeg": "^2.1.24"
  }
}
```

### 資料庫 Schema

需要 `voiceover_segments` 表:

```sql
CREATE TABLE voiceover_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),

  -- 原始配音檔
  original_audio_url TEXT NOT NULL,

  -- 片段資訊
  text TEXT NOT NULL,
  start_time FLOAT NOT NULL,
  end_time FLOAT NOT NULL,
  duration FLOAT NOT NULL,

  -- 切分後的片段音檔
  segment_audio_url TEXT,

  -- 語意分析 (後續使用)
  keywords JSONB,
  topics JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📝 實作步驟

### 步驟 1: 安裝相依套件

```bash
cd backend
npm install openai fluent-ffmpeg
npm install -D @types/fluent-ffmpeg
```

**快速驗證**:
```bash
# 檢查 FFmpeg
ffmpeg -version

# 檢查套件安裝
node -e "console.log(require('fluent-ffmpeg'))"
```

---

### 步驟 2: 建立 Whisper 服務 (如果尚未建立)

建立 `backend/src/services/whisper.service.ts`:

```typescript
/**
 * Whisper STT 服務
 *
 * 使用 OpenAI Whisper API 進行語音轉文字
 */

import OpenAI from 'openai';
import fs from 'fs';
import { logger } from '../lib/logger';
import { CostTrackerService } from './cost-tracker.service';

export class WhisperService {
  private client: OpenAI;
  private costTracker: CostTrackerService;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    this.client = new OpenAI({ apiKey });
    this.costTracker = new CostTrackerService();
  }

  /**
   * 轉錄音訊檔案並取得字級時間碼
   *
   * @param audioPath - 音訊檔案路徑
   * @param userId - 使用者 ID (用於成本追蹤)
   * @returns 轉錄結果包含文字和時間碼
   */
  async transcribe(
    audioPath: string,
    userId: string
  ): Promise<WhisperTranscription> {
    const startTime = Date.now();

    try {
      logger.info('Starting Whisper transcription', {
        audioPath,
        userId,
      });

      // 檢查檔案存在
      if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
      }

      // 取得檔案大小 (用於成本計算)
      const stats = fs.statSync(audioPath);
      const fileSizeMB = stats.size / (1024 * 1024);

      // 呼叫 Whisper API
      const response = await this.client.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        language: 'zh', // 繁體中文
        response_format: 'verbose_json', // 取得詳細資訊包含時間碼
        timestamp_granularities: ['word'], // 字級時間碼
      });

      const duration = Date.now() - startTime;

      // 追蹤成本
      await this.trackCost(userId, fileSizeMB, duration);

      logger.info('Whisper transcription completed', {
        duration,
        textLength: response.text.length,
        wordCount: response.words?.length || 0,
      });

      // 解析回應
      return {
        text: response.text,
        language: response.language || 'zh',
        duration: response.duration || 0,
        words: response.words || [],
      };

    } catch (error) {
      logger.error('Whisper transcription failed', {
        error: error.message,
        audioPath,
      });
      throw new Error(`Whisper transcription failed: ${error.message}`);
    }
  }

  /**
   * 追蹤 Whisper API 使用成本
   */
  private async trackCost(
    userId: string,
    fileSizeMB: number,
    duration: number
  ): Promise<void> {
    // Whisper 計價: $0.006 / 分鐘
    // 假設音訊長度約等於檔案大小 MB 數 (粗略估算)
    const estimatedMinutes = fileSizeMB / 1; // 1MB ≈ 1 分鐘
    const cost = estimatedMinutes * 0.006;

    await this.costTracker.track({
      userId,
      service: 'whisper-stt',
      operation: 'transcribe',
      inputTokens: 0,
      outputTokens: 0,
      cost,
      duration,
      metadata: {
        fileSizeMB,
        estimatedMinutes,
      },
    });
  }
}

/**
 * Whisper 轉錄結果
 */
export interface WhisperTranscription {
  text: string;
  language: string;
  duration: number;
  words: WhisperWord[];
}

/**
 * Whisper 字級時間碼
 */
export interface WhisperWord {
  word: string;
  start: number;
  end: number;
}
```

---

### 步驟 3: 建立配音切分引擎

建立 `backend/src/engines/voiceover-splitter.ts`:

```typescript
/**
 * 配音切分引擎
 *
 * 負責將配音檔案按照時間碼切分成多個片段
 */

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { WhisperService, WhisperWord } from '../services/whisper.service';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export class VoiceoverSplitter {
  private whisper: WhisperService;

  constructor() {
    this.whisper = new WhisperService();
  }

  /**
   * 處理配音檔案: 轉錄 + 切分
   *
   * @param audioPath - 本地音訊檔案路徑
   * @param userId - 使用者 ID
   * @returns 切分結果
   */
  async process(
    audioPath: string,
    userId: string
  ): Promise<VoiceoverProcessResult> {
    logger.info('Starting voiceover processing', { audioPath, userId });

    try {
      // 1. 使用 Whisper 轉錄
      const transcription = await this.whisper.transcribe(audioPath, userId);

      // 2. 將字組合成句子片段
      const segments = this.groupWordsIntoSegments(transcription.words);

      logger.info('Grouped words into segments', {
        wordCount: transcription.words.length,
        segmentCount: segments.length,
      });

      // 3. 切分音訊檔案
      const splitResults: SplitSegment[] = [];

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        try {
          const outputPath = await this.splitAudio(
            audioPath,
            segment.start,
            segment.end,
            i
          );

          splitResults.push({
            text: segment.text,
            start: segment.start,
            end: segment.end,
            duration: segment.end - segment.start,
            localPath: outputPath,
          });

          logger.info('Audio segment split', {
            index: i,
            text: segment.text.substring(0, 30),
            duration: segment.end - segment.start,
          });

        } catch (error) {
          logger.error('Failed to split audio segment', {
            index: i,
            error: error.message,
          });
        }
      }

      // 4. 上傳到 Supabase Storage
      const uploadedSegments: VoiceoverSegment[] = [];

      for (const segment of splitResults) {
        try {
          const audioUrl = await this.uploadSegment(
            segment.localPath,
            userId
          );

          uploadedSegments.push({
            ...segment,
            audioUrl,
          });

          // 刪除本地檔案
          await fs.unlink(segment.localPath);

        } catch (error) {
          logger.error('Failed to upload segment', {
            text: segment.text,
            error: error.message,
          });
        }
      }

      // 5. 儲存到資料庫
      await this.saveSegments(uploadedSegments, audioPath, userId);

      logger.info('Voiceover processing completed', {
        totalSegments: uploadedSegments.length,
      });

      return {
        totalSegments: uploadedSegments.length,
        segments: uploadedSegments,
      };

    } catch (error) {
      logger.error('Voiceover processing failed', {
        error: error.message,
        audioPath,
      });
      throw error;
    }
  }

  /**
   * 將單字組合成句子片段
   *
   * 策略: 以標點符號或時間間隔分段
   */
  private groupWordsIntoSegments(words: WhisperWord[]): TextSegment[] {
    const segments: TextSegment[] = [];
    let currentSegment: WhisperWord[] = [];
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      currentSegment.push(word);
      currentText += word.word;

      // 判斷是否應該結束當前片段
      const shouldSplit =
        // 有標點符號
        /[。!?、,]$/.test(word.word) ||
        // 或者下一個字的間隔超過 1 秒
        (i < words.length - 1 && words[i + 1].start - word.end > 1.0) ||
        // 或者是最後一個字
        i === words.length - 1;

      if (shouldSplit && currentSegment.length > 0) {
        segments.push({
          text: currentText.trim(),
          start: currentSegment[0].start,
          end: currentSegment[currentSegment.length - 1].end,
        });

        currentSegment = [];
        currentText = '';
      }
    }

    return segments;
  }

  /**
   * 使用 FFmpeg 切分音訊
   *
   * @param inputPath - 輸入音訊檔案
   * @param startTime - 開始時間 (秒)
   * @param endTime - 結束時間 (秒)
   * @param index - 片段索引
   * @returns 輸出檔案路徑
   */
  private async splitAudio(
    inputPath: string,
    startTime: number,
    endTime: number,
    index: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputDir = path.join(process.cwd(), 'temp', 'voiceover-segments');
      const outputPath = path.join(
        outputDir,
        `segment_${index}_${Date.now()}.mp3`
      );

      // 確保輸出目錄存在
      fs.mkdir(outputDir, { recursive: true }).catch(() => {});

      // 轉換時間格式
      const startTimeStr = this.secondsToFFmpegTime(startTime);
      const endTimeStr = this.secondsToFFmpegTime(endTime);

      logger.info('Splitting audio', {
        inputPath,
        startTime: startTimeStr,
        endTime: endTimeStr,
        outputPath,
      });

      ffmpeg(inputPath)
        .setStartTime(startTimeStr)
        .setDuration(endTime - startTime)
        .audioCodec('copy') // 不重新編碼,保持品質
        .output(outputPath)
        .on('end', () => {
          logger.info('Audio split completed', { outputPath });
          resolve(outputPath);
        })
        .on('error', (error) => {
          logger.error('Audio split failed', {
            error: error.message,
            outputPath,
          });
          reject(error);
        })
        .run();
    });
  }

  /**
   * 將秒數轉換為 FFmpeg 時間格式
   */
  private secondsToFFmpegTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
  }

  /**
   * 上傳片段到 Supabase Storage
   */
  private async uploadSegment(
    localPath: string,
    userId: string
  ): Promise<string> {
    const fileName = path.basename(localPath);
    const storagePath = `voiceover-segments/${userId}/${fileName}`;

    const fileBuffer = await fs.readFile(localPath);

    const { data, error } = await supabase.storage
      .from('audio')
      .upload(storagePath, fileBuffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload segment: ${error.message}`);
    }

    // 取得公開 URL
    const { data: urlData } = supabase.storage
      .from('audio')
      .getPublicUrl(storagePath);

    return urlData.publicUrl;
  }

  /**
   * 儲存片段到資料庫
   */
  private async saveSegments(
    segments: VoiceoverSegment[],
    originalAudioUrl: string,
    userId: string
  ): Promise<void> {
    const records = segments.map((segment) => ({
      user_id: userId,
      original_audio_url: originalAudioUrl,
      text: segment.text,
      start_time: segment.start,
      end_time: segment.end,
      duration: segment.duration,
      segment_audio_url: segment.audioUrl,
    }));

    const { error } = await supabase
      .from('voiceover_segments')
      .insert(records);

    if (error) {
      throw new Error(`Failed to save segments: ${error.message}`);
    }

    logger.info('Saved segments to database', {
      count: segments.length,
    });
  }
}

/**
 * 文字片段
 */
interface TextSegment {
  text: string;
  start: number;
  end: number;
}

/**
 * 切分後的片段
 */
interface SplitSegment {
  text: string;
  start: number;
  end: number;
  duration: number;
  localPath: string;
}

/**
 * 配音片段
 */
interface VoiceoverSegment extends SplitSegment {
  audioUrl: string;
}

/**
 * 處理結果
 */
export interface VoiceoverProcessResult {
  totalSegments: number;
  segments: VoiceoverSegment[];
}
```

---

### 步驟 4: 建立 API 端點

在 `backend/src/routes/voiceover.ts` 建立端點:

```typescript
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { VoiceoverSplitter } from '../engines/voiceover-splitter';
import { authenticate } from '../middleware/auth';

const router = Router();
const splitter = new VoiceoverSplitter();

// 設定檔案上傳
const upload = multer({
  dest: 'temp/uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.mp3', '.wav', '.m4a', '.mp4'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

/**
 * POST /api/voiceover/upload
 *
 * 上傳配音檔案並自動切分
 */
router.post('/upload', authenticate, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file uploaded',
      });
    }

    const userId = req.user.id;
    const audioPath = req.file.path;

    // 處理配音檔案
    const result = await splitter.process(audioPath, userId);

    res.json({
      success: true,
      result,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
```

---

### 步驟 5: 註冊路由

在 `backend/src/index.ts` 加入路由:

```typescript
import voiceoverRoutes from './routes/voiceover';

// ...

app.use('/api/voiceover', voiceoverRoutes);
```

---

### 步驟 6: 測試配音切分

```bash
# 啟動開發伺服器
npm run dev

# 使用 curl 測試上傳
curl -X POST http://localhost:8080/api/voiceover/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@test-voiceover.mp3"
```

**預期結果**:
```json
{
  "success": true,
  "result": {
    "totalSegments": 15,
    "segments": [
      {
        "text": "大家好,今天要介紹 AI 影片剪輯。",
        "start": 0.0,
        "end": 2.5,
        "duration": 2.5,
        "audioUrl": "https://..."
      }
    ]
  }
}
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (5 tests): 基礎功能驗證
- 📁 **Functional Acceptance** (6 tests): 功能正確性
- 📁 **E2E Acceptance** (3 tests): 完整流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-2.7

# 或分別執行
npm test -- tests/phase-2/task-2.7.basic.test.ts
npm test -- tests/phase-2/task-2.7.functional.test.ts
npm test -- tests/phase-2/task-2.7.e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ Whisper API 可以正常轉錄
- ✅ FFmpeg 可以正確切分音訊
- ✅ 片段正確儲存到資料庫

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/phase-2/task-2.7.basic.test.ts`

1. ✓ Whisper API 可以連接
2. ✓ FFmpeg 已正確安裝
3. ✓ 可以轉錄簡單音訊
4. ✓ 可以切分音訊檔案
5. ✓ 時間碼格式轉換正確

### Functional Acceptance (6 tests)

測試檔案: `tests/phase-2/task-2.7.functional.test.ts`

1. ✓ 正確取得字級時間碼
2. ✓ 正確組合成句子片段
3. ✓ 音訊切分品質良好
4. ✓ 片段正確上傳到 Storage
5. ✓ 片段正確儲存到資料庫
6. ✓ 成本追蹤正確記錄

### E2E Acceptance (3 tests)

測試檔案: `tests/phase-2/task-2.7.e2e.test.ts`

1. ✓ 完整配音處理流程成功
2. ✓ 批次處理多個配音檔
3. ✓ 錯誤處理正確

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### API 設定
- [ ] OpenAI API Key 已設定
- [ ] Whisper API 連接測試通過
- [ ] FFmpeg 已安裝並可執行

### 核心實作
- [ ] `WhisperService` 已建立
- [ ] `VoiceoverSplitter` 已建立
- [ ] API 端點已建立
- [ ] 路由已註冊

### 資料庫
- [ ] `voiceover_segments` 表已建立
- [ ] 片段可以正確儲存
- [ ] 可以查詢配音片段

### 功能驗證
- [ ] 可以上傳配音檔案
- [ ] 可以自動轉錄文字
- [ ] 可以自動切分片段
- [ ] 可以正確儲存片段
- [ ] 音訊品質良好

### 測試驗收
- [ ] Basic Verification 測試通過 (5/5)
- [ ] Functional Acceptance 測試通過 (6/6)
- [ ] E2E Acceptance 測試通過 (3/3)
- [ ] **總計: 14/14 測試通過**

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

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `FFmpeg not found` | FFmpeg 未安裝 | 安裝 FFmpeg |
| `Audio codec not supported` | 音訊格式問題 | 轉換為 mp3 格式 |
| `Whisper API timeout` | 檔案太大 | 壓縮音訊或分段處理 |
| `Invalid timestamp` | 時間碼格式錯誤 | 檢查時間碼轉換函式 |
| `Segment duration too short` | 切分點太密集 | 調整分段策略 |

---

### 問題 1: FFmpeg 未安裝或找不到

**錯誤訊息:**
```
Error: spawn ffmpeg ENOENT
```

**解決方案:**

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows (使用 Chocolatey)
choco install ffmpeg

# 驗證安裝
ffmpeg -version
```

---

### 問題 2: Whisper 轉錄失敗

**錯誤訊息:**
```
Error: Request timed out
```

**解決方案:**

音訊檔案太大時,Whisper 可能超時。解決方法:

```typescript
// 1. 在上傳前壓縮音訊
private async compressAudio(inputPath: string): Promise<string> {
  const outputPath = inputPath.replace('.mp3', '_compressed.mp3');

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioBitrate('64k') // 降低位元率
      .audioChannels(1) // 單聲道
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

// 2. 分段處理長音訊
async transcribeLongAudio(audioPath: string): Promise<WhisperTranscription[]> {
  const segments = await this.splitLongAudio(audioPath, 600); // 每 10 分鐘切一段
  const results = [];

  for (const segment of segments) {
    const result = await this.whisper.transcribe(segment);
    results.push(result);
  }

  return results;
}
```

---

### 問題 3: 音訊切分品質下降

**問題**: 切分後的音訊有雜音或品質變差

**解決方案:**

確保使用 `-c copy` 參數:

```typescript
ffmpeg(inputPath)
  .setStartTime(startTimeStr)
  .setDuration(duration)
  .audioCodec('copy') // ← 重要: 不重新編碼
  .output(outputPath)
  .run();
```

如果還是有問題,檢查原始檔案格式:

```bash
# 檢查音訊資訊
ffprobe input.mp3

# 如果格式不支援 copy,先轉換格式
ffmpeg -i input.wav -c:a libmp3lame -q:a 2 input.mp3
```

---

### 問題 4: 句子切分不正確

**問題**: 句子切得太短或太長

**解決方案:**

調整分段邏輯:

```typescript
private groupWordsIntoSegments(words: WhisperWord[]): TextSegment[] {
  const segments: TextSegment[] = [];
  let currentSegment: WhisperWord[] = [];
  let currentText = '';

  const MAX_SEGMENT_DURATION = 10; // 最長 10 秒
  const MIN_SEGMENT_DURATION = 2;  // 最短 2 秒

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    currentSegment.push(word);
    currentText += word.word;

    const currentDuration = word.end - currentSegment[0].start;

    const shouldSplit =
      // 有標點符號且長度足夠
      (/[。!?]$/.test(word.word) && currentDuration >= MIN_SEGMENT_DURATION) ||
      // 或者超過最大長度
      currentDuration >= MAX_SEGMENT_DURATION ||
      // 或者是最後一個字
      i === words.length - 1;

    if (shouldSplit && currentSegment.length > 0) {
      segments.push({
        text: currentText.trim(),
        start: currentSegment[0].start,
        end: word.end,
      });

      currentSegment = [];
      currentText = '';
    }
  }

  return segments;
}
```

---

### 問題 5: 繁體中文辨識不準確

**問題**: Whisper 將繁體中文轉成簡體中文

**解決方案:**

Whisper 的 `language` 參數設為 `zh` 會混合繁簡體。可以:

```typescript
// 方案 1: 後處理轉換
import { convert } from 'opencc';

async transcribe(audioPath: string): Promise<WhisperTranscription> {
  const response = await this.client.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
    language: 'zh',
    response_format: 'verbose_json',
    timestamp_granularities: ['word'],
  });

  // 轉換為繁體中文
  const converter = new convert({ from: 'cn', to: 'tw' });
  const traditionalText = converter(response.text);

  return {
    text: traditionalText,
    // ...
  };
}

// 方案 2: 使用 prompt 提示
async transcribe(audioPath: string): Promise<WhisperTranscription> {
  const response = await this.client.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
    language: 'zh',
    response_format: 'verbose_json',
    timestamp_granularities: ['word'],
    prompt: '請使用繁體中文。', // 提示使用繁體
  });

  return response;
}
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **OpenAI Whisper API**: https://platform.openai.com/docs/guides/speech-to-text
- **FFmpeg 文件**: https://ffmpeg.org/documentation.html
- **Audio Processing Guide**: https://trac.ffmpeg.org/wiki/AudioChannelManipulation
- **Fluent-FFmpeg**: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 可以成功上傳配音並自動切分

### 最終驗收指令

```bash
# 進入 backend 目錄
cd backend

# 執行驗收測試
npm run verify:task task-2.7

# 如果全部通過,你應該看到:
# PASS tests/phase-2/task-2.7.basic.test.ts
# PASS tests/phase-2/task-2.7.functional.test.ts
# PASS tests/phase-2/task-2.7.e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 2.7 完成了!

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- Whisper 的實際辨識準確度
- 配音切分的品質如何
- 遇到的主要問題與解決方法
- 成本估算是否準確

這些記錄在之後優化時會很有用!

---

**下一步**: 繼續 Task 2.8 - 候選片段查詢

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
