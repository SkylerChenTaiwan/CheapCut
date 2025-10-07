# Task 2.5: Whisper STT 整合

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.5 |
| **Task 名稱** | Whisper STT 整合 |
| **所屬 Phase** | Phase 2: Engines |
| **預估時間** | 3-4 小時 (設定 1h + 實作 2h + 測試 1h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 2.1 (GCS 儲存), Task 2.4 (影片切分) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的 Whisper STT 問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: OpenAI API error: invalid_request_error
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← API 請求問題
   ```

2. **判斷錯誤類型**
   - `invalid_api_key` → API 金鑰無效
   - `file_too_large` → 音檔超過 25MB 限制
   - `unsupported_format` → 音檔格式不支援
   - `invalid_language` → 語言代碼錯誤
   - `rate_limit_exceeded` → 超過 API 使用限制
   - `insufficient_quota` → 額度不足

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"語音辨識失敗"  ← 太模糊
"字幕生成錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"OpenAI Whisper API file size limit"  ← 包含具體錯誤
"Whisper API timestamp format SRT" ← 明確的技術問題
"Node.js Whisper API transcription with timestamps" ← 具體的技術棧
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- OpenAI Whisper API: https://platform.openai.com/docs/guides/speech-to-text
- Whisper API Reference: https://platform.openai.com/docs/api-reference/audio
- Supported Formats: https://platform.openai.com/docs/guides/speech-to-text/supported-formats

**優先順序 2: 官方範例**
- OpenAI Node.js SDK: https://github.com/openai/openai-node
- Whisper Examples: https://platform.openai.com/docs/guides/speech-to-text/quickstart

---

### Step 3: 檢查環境設定

```bash
# 檢查 OpenAI API Key
echo $OPENAI_API_KEY

# 檢查音檔格式
ffprobe input.mp3 -show_format -show_streams

# 檢查音檔大小
ls -lh input.mp3

# 測試 API 連線
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@test.mp3" \
  -F model="whisper-1"
```

---

## 🎯 功能描述

整合 OpenAI Whisper API，將影片音軌轉換為文字字幕，支援多語言辨識和時間碼同步。

### 為什麼需要這個?

- 🎯 **問題**: 影片需要自動生成字幕，手動打字太慢
- ✅ **解決**: 使用 OpenAI Whisper API 自動語音轉文字
- 💡 **比喻**: 就像有一個專業速記員，自動把影片的對話寫成字幕

### 完成後你會有:

- ✅ OpenAI Whisper API 已設定
- ✅ 音軌提取與轉換功能
- ✅ 語音辨識與轉錄功能
- ✅ SRT/VTT 字幕格式生成
- ✅ 多語言支援
- ✅ 時間碼精確同步
- ✅ 字幕資料庫儲存

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. OpenAI Whisper API

**是什麼**: OpenAI 提供的語音辨識服務，準確度高且支援多語言

**核心特性**:
- **高準確度**: 使用 Whisper 模型，識別率達 95%+
- **多語言支援**: 支援 99 種語言
- **自動標點**: 自動加上標點符號
- **時間戳**: 可選擇是否返回時間碼 (timestamp)
- **檔案限制**: 最大 25MB

**API 端點**:
```
POST https://api.openai.com/v1/audio/transcriptions
POST https://api.openai.com/v1/audio/translations (翻譯成英文)
```

**支援格式**:
- mp3, mp4, mpeg, mpga, m4a, wav, webm

**回傳格式選項**:
- `json`: 純文字結果
- `verbose_json`: 包含時間戳的詳細結果
- `srt`: 直接輸出 SRT 字幕
- `vtt`: 直接輸出 WebVTT 字幕
- `text`: 純文字

### 2. 音軌提取 (Audio Extraction)

**為什麼需要**: Whisper API 只接受音檔，需要從影片中提取音軌

**使用 FFmpeg 提取**:
```bash
ffmpeg -i input.mp4 -vn -acodec libmp3lame -q:a 2 output.mp3

# 參數說明:
# -vn: 不處理視訊 (video none)
# -acodec libmp3lame: 使用 MP3 編碼
# -q:a 2: 音質等級 (0-9, 越小越好)
```

**檔案大小控制**:
```bash
# 如果原始音檔超過 25MB，降低位元率
ffmpeg -i input.mp4 -vn -acodec libmp3lame -b:a 64k output.mp3

# 或切分成多段
ffmpeg -i input.mp4 -vn -f segment -segment_time 600 -acodec libmp3lame output_%03d.mp3
```

### 3. 字幕格式

**SRT 格式** (SubRip):
```srt
1
00:00:00,000 --> 00:00:04,000
大家好，歡迎來到我的頻道

2
00:00:04,500 --> 00:00:08,000
今天要介紹如何使用 AI 生成影片
```

**VTT 格式** (WebVTT):
```vtt
WEBVTT

00:00:00.000 --> 00:00:04.000
大家好，歡迎來到我的頻道

00:00:04.500 --> 00:00:08.000
今天要介紹如何使用 AI 生成影片
```

**格式差異**:
- SRT: 傳統字幕格式，兼容性好
- VTT: Web 標準，支援樣式設定
- 時間格式不同: SRT 用逗號 (,)，VTT 用句點 (.)

### 4. Whisper API 回傳格式

**Verbose JSON 格式** (`response_format: "verbose_json"`):
```json
{
  "task": "transcribe",
  "language": "zh",
  "duration": 8.5,
  "text": "大家好，歡迎來到我的頻道。今天要介紹如何使用 AI 生成影片。",
  "segments": [
    {
      "id": 0,
      "seek": 0,
      "start": 0.0,
      "end": 4.0,
      "text": "大家好，歡迎來到我的頻道。",
      "tokens": [50364, 1415, ...],
      "temperature": 0.0,
      "avg_logprob": -0.3,
      "compression_ratio": 1.2,
      "no_speech_prob": 0.01
    },
    {
      "id": 1,
      "seek": 0,
      "start": 4.5,
      "end": 8.0,
      "text": "今天要介紹如何使用 AI 生成影片。",
      "tokens": [50614, 2589, ...],
      "temperature": 0.0,
      "avg_logprob": -0.25,
      "compression_ratio": 1.15,
      "no_speech_prob": 0.02
    }
  ]
}
```

**重要欄位說明**:
- `language`: 辨識出的語言代碼 (ISO 639-1)
- `duration`: 音檔總長度 (秒)
- `segments`: 分段結果陣列
- `start/end`: 時間戳 (秒，浮點數)
- `text`: 該段文字
- `no_speech_prob`: 無語音機率 (可用來過濾雜音)

### 5. 多語言支援

**語言代碼** (ISO 639-1):
```typescript
const SUPPORTED_LANGUAGES = {
  'zh': '中文',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  // ... 支援 99 種語言
};
```

**自動檢測語言**:
```typescript
// 不指定 language，Whisper 會自動偵測
const response = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  // 不設定 language 參數
});

console.log(response.language); // 回傳偵測到的語言
```

**指定語言** (提高準確度):
```typescript
const response = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  language: 'zh', // 指定為中文
});
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.1: GCS 儲存已設定 (儲存音檔)
- ✅ Task 2.4: 影片切分已實作 (提取音軌)

### 系統需求
- OpenAI API Key (需要付費額度)
- FFmpeg 已安裝
- Node.js >= 18
- 至少 500MB 暫存空間 (處理音檔)

### 環境檢查
```bash
# 檢查 FFmpeg
ffmpeg -version

# 檢查 OpenAI API Key
echo $OPENAI_API_KEY

# 檢查 API 額度
curl https://api.openai.com/v1/dashboard/billing/credit_grants \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### 套件安裝
```bash
cd backend
npm install openai formdata-node
npm install --save-dev @types/node
```

---

## 📝 實作步驟

### 步驟 1: 設定 OpenAI API

在 `backend/.env` 加入:

```env
# OpenAI 設定
OPENAI_API_KEY=sk-...your-api-key...
WHISPER_MODEL=whisper-1
WHISPER_LANGUAGE=  # 留空為自動偵測

# 字幕設定
SUBTITLE_FORMAT=srt  # srt 或 vtt
SUBTITLE_MAX_LENGTH=42  # 每行最大字數
```

**建立設定檔** `backend/src/config/whisper.config.ts`:

```typescript
/**
 * Whisper STT 設定
 */

export const WHISPER_CONFIG = {
  // API 設定
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.WHISPER_MODEL || 'whisper-1',

  // 語言設定
  defaultLanguage: process.env.WHISPER_LANGUAGE || undefined, // undefined = 自動偵測
  supportedLanguages: [
    'zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru'
  ],

  // 檔案限制
  maxFileSize: 25 * 1024 * 1024, // 25MB (Whisper API 限制)
  supportedFormats: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'],

  // 字幕設定
  subtitleFormat: (process.env.SUBTITLE_FORMAT || 'srt') as 'srt' | 'vtt',
  maxLineLength: parseInt(process.env.SUBTITLE_MAX_LENGTH || '42'),

  // 音質設定
  audioBitrate: '64k', // 降低檔案大小
  audioCodec: 'libmp3lame',

  // 分段設定 (超過 25MB 時自動切分)
  segmentDuration: 600, // 10 分鐘一段
} as const;
```

---

### 步驟 2: 建立音軌提取服務

建立 `backend/src/services/audio-extractor.service.ts`:

```typescript
/**
 * Audio Extractor Service
 *
 * 從影片中提取音軌，並轉換為 Whisper API 可接受的格式
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { WHISPER_CONFIG } from '../config/whisper.config';

const execAsync = promisify(exec);

/**
 * 檢查音檔大小
 */
async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * 從影片提取音軌
 *
 * @param videoPath - 影片檔案路徑
 * @param outputPath - 輸出音檔路徑
 * @returns 音檔路徑
 */
export async function extractAudio(
  videoPath: string,
  outputPath: string
): Promise<string> {
  // 確保輸出目錄存在
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // 使用 FFmpeg 提取音軌
  const command = [
    'ffmpeg',
    '-i', `"${videoPath}"`,
    '-vn', // 不處理視訊
    '-acodec', WHISPER_CONFIG.audioCodec,
    '-b:a', WHISPER_CONFIG.audioBitrate,
    '-y', // 覆蓋已存在檔案
    `"${outputPath}"`
  ].join(' ');

  await execAsync(command);

  // 檢查檔案是否成功建立
  const exists = await fs.access(outputPath).then(() => true).catch(() => false);
  if (!exists) {
    throw new Error('Failed to extract audio from video');
  }

  return outputPath;
}

/**
 * 切分音檔 (當檔案超過 25MB 時)
 *
 * @param audioPath - 原始音檔路徑
 * @param outputDir - 輸出目錄
 * @returns 切分後的音檔路徑陣列
 */
export async function splitAudio(
  audioPath: string,
  outputDir: string
): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });

  const outputPattern = path.join(outputDir, 'segment_%03d.mp3');

  const command = [
    'ffmpeg',
    '-i', `"${audioPath}"`,
    '-f', 'segment',
    '-segment_time', WHISPER_CONFIG.segmentDuration.toString(),
    '-acodec', 'copy', // 不重新編碼，直接切分
    '-y',
    `"${outputPattern}"`
  ].join(' ');

  await execAsync(command);

  // 列出所有切分的檔案
  const files = await fs.readdir(outputDir);
  const segments = files
    .filter(f => f.startsWith('segment_') && f.endsWith('.mp3'))
    .map(f => path.join(outputDir, f))
    .sort();

  return segments;
}

/**
 * 準備音檔給 Whisper API
 *
 * 如果檔案超過 25MB，自動切分
 *
 * @param videoPath - 影片路徑
 * @param workDir - 工作目錄
 * @returns 準備好的音檔路徑陣列
 */
export async function prepareAudioForWhisper(
  videoPath: string,
  workDir: string
): Promise<string[]> {
  // 提取音軌
  const audioPath = path.join(workDir, 'audio.mp3');
  await extractAudio(videoPath, audioPath);

  // 檢查檔案大小
  const fileSize = await getFileSize(audioPath);

  if (fileSize <= WHISPER_CONFIG.maxFileSize) {
    // 檔案符合限制，直接使用
    return [audioPath];
  } else {
    // 檔案過大，需要切分
    console.log(`Audio file too large (${fileSize} bytes), splitting...`);
    const segmentsDir = path.join(workDir, 'segments');
    return await splitAudio(audioPath, segmentsDir);
  }
}

/**
 * 清理暫存檔案
 */
export async function cleanupAudioFiles(workDir: string): Promise<void> {
  try {
    await fs.rm(workDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Failed to cleanup audio files:', error);
  }
}
```

---

### 步驟 3: 建立 Whisper STT 服務

建立 `backend/src/services/whisper.service.ts`:

```typescript
/**
 * Whisper STT Service
 *
 * 使用 OpenAI Whisper API 進行語音辨識
 */

import OpenAI from 'openai';
import { createReadStream } from 'fs';
import { WHISPER_CONFIG } from '../config/whisper.config';

const openai = new OpenAI({
  apiKey: WHISPER_CONFIG.apiKey,
});

/**
 * Whisper API 回傳的 Segment
 */
export interface WhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

/**
 * Whisper API 完整回傳
 */
export interface WhisperResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
}

/**
 * 轉錄單一音檔
 *
 * @param audioPath - 音檔路徑
 * @param language - 語言代碼 (可選，不指定則自動偵測)
 * @returns Whisper API 回傳結果
 */
export async function transcribeAudio(
  audioPath: string,
  language?: string
): Promise<WhisperResponse> {
  const audioFile = createReadStream(audioPath);

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: WHISPER_CONFIG.model,
    response_format: 'verbose_json',
    language: language || WHISPER_CONFIG.defaultLanguage,
    timestamp_granularities: ['segment'],
  });

  return response as unknown as WhisperResponse;
}

/**
 * 轉錄多段音檔並合併結果
 *
 * @param audioPaths - 音檔路徑陣列
 * @param language - 語言代碼
 * @returns 合併後的轉錄結果
 */
export async function transcribeMultipleAudios(
  audioPaths: string[],
  language?: string
): Promise<WhisperResponse> {
  const results: WhisperResponse[] = [];
  let totalDuration = 0;

  for (const audioPath of audioPaths) {
    const result = await transcribeAudio(audioPath, language);
    results.push(result);
    totalDuration += result.duration;
  }

  // 合併所有 segments，並調整時間偏移
  const allSegments: WhisperSegment[] = [];
  let timeOffset = 0;

  for (const result of results) {
    const adjustedSegments = result.segments.map(seg => ({
      ...seg,
      start: seg.start + timeOffset,
      end: seg.end + timeOffset,
    }));
    allSegments.push(...adjustedSegments);
    timeOffset += result.duration;
  }

  // 重新編號 segment ID
  allSegments.forEach((seg, index) => {
    seg.id = index;
  });

  return {
    task: 'transcribe',
    language: results[0]?.language || 'unknown',
    duration: totalDuration,
    text: results.map(r => r.text).join(' '),
    segments: allSegments,
  };
}

/**
 * 過濾掉無語音片段
 *
 * @param segments - 原始 segments
 * @param threshold - 無語音機率閾值 (預設 0.5)
 * @returns 過濾後的 segments
 */
export function filterSilentSegments(
  segments: WhisperSegment[],
  threshold: number = 0.5
): WhisperSegment[] {
  return segments.filter(seg => seg.no_speech_prob < threshold);
}
```

---

### 步驟 4: 建立字幕格式轉換器

建立 `backend/src/services/subtitle-formatter.service.ts`:

```typescript
/**
 * Subtitle Formatter Service
 *
 * 將 Whisper 轉錄結果轉換為字幕格式 (SRT/VTT)
 */

import { WhisperSegment } from './whisper.service';
import { WHISPER_CONFIG } from '../config/whisper.config';

/**
 * 字幕項目
 */
export interface SubtitleItem {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

/**
 * 格式化時間為 SRT 格式 (HH:MM:SS,mmm)
 */
function formatTimeSRT(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':') + ',' + millis.toString().padStart(3, '0');
}

/**
 * 格式化時間為 VTT 格式 (HH:MM:SS.mmm)
 */
function formatTimeVTT(seconds: number): string {
  return formatTimeSRT(seconds).replace(',', '.');
}

/**
 * 將長文字切分為多行 (避免單行過長)
 */
function splitTextIntoLines(text: string, maxLength: number = WHISPER_CONFIG.maxLineLength): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * 將 Whisper Segments 轉換為字幕項目
 */
export function segmentsToSubtitles(segments: WhisperSegment[]): SubtitleItem[] {
  return segments.map((seg, index) => ({
    index: index + 1,
    startTime: seg.start,
    endTime: seg.end,
    text: seg.text.trim(),
  }));
}

/**
 * 生成 SRT 字幕
 */
export function generateSRT(items: SubtitleItem[]): string {
  return items
    .map(item => {
      const lines = splitTextIntoLines(item.text);
      return [
        item.index.toString(),
        `${formatTimeSRT(item.startTime)} --> ${formatTimeSRT(item.endTime)}`,
        ...lines,
        '', // 空行分隔
      ].join('\n');
    })
    .join('\n');
}

/**
 * 生成 VTT 字幕
 */
export function generateVTT(items: SubtitleItem[]): string {
  const header = 'WEBVTT\n\n';
  const body = items
    .map(item => {
      const lines = splitTextIntoLines(item.text);
      return [
        `${formatTimeVTT(item.startTime)} --> ${formatTimeVTT(item.endTime)}`,
        ...lines,
        '', // 空行分隔
      ].join('\n');
    })
    .join('\n');

  return header + body;
}

/**
 * 根據設定生成字幕
 */
export function generateSubtitle(segments: WhisperSegment[]): string {
  const items = segmentsToSubtitles(segments);

  if (WHISPER_CONFIG.subtitleFormat === 'vtt') {
    return generateVTT(items);
  } else {
    return generateSRT(items);
  }
}

/**
 * 儲存字幕到檔案
 */
export async function saveSubtitleFile(
  subtitle: string,
  filePath: string
): Promise<void> {
  const { promises: fs } = require('fs');
  await fs.writeFile(filePath, subtitle, 'utf-8');
}
```

---

### 步驟 5: 建立資料表

在資料庫執行 (`migrations/005_create_subtitles_table.sql`):

```sql
-- 字幕主表
CREATE TABLE subtitles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL, -- ISO 639-1 語言代碼
  format VARCHAR(10) NOT NULL, -- 'srt' 或 'vtt'
  file_path VARCHAR(500), -- GCS 檔案路徑
  duration FLOAT, -- 總時長 (秒)
  word_count INTEGER, -- 字數
  status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 字幕片段表
CREATE TABLE subtitle_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtitle_id UUID NOT NULL REFERENCES subtitles(id) ON DELETE CASCADE,
  segment_index INTEGER NOT NULL,
  start_time FLOAT NOT NULL,
  end_time FLOAT NOT NULL,
  text TEXT NOT NULL,
  confidence FLOAT, -- 信心度 (從 Whisper avg_logprob 計算)
  no_speech_prob FLOAT, -- 無語音機率
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_subtitles_video ON subtitles(video_id);
CREATE INDEX idx_subtitles_language ON subtitles(language);
CREATE INDEX idx_subtitle_segments_subtitle ON subtitle_segments(subtitle_id);
CREATE INDEX idx_subtitle_segments_time ON subtitle_segments(start_time, end_time);

-- 更新時間觸發器
CREATE TRIGGER update_subtitles_updated_at
  BEFORE UPDATE ON subtitles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 步驟 6: 建立字幕儲存服務

建立 `backend/src/services/subtitle-storage.service.ts`:

```typescript
/**
 * Subtitle Storage Service
 *
 * 儲存字幕到資料庫和 GCS
 */

import { db } from '../db';
import { WhisperResponse, WhisperSegment } from './whisper.service';
import * as storageService from './storage.service';
import { WHISPER_CONFIG } from '../config/whisper.config';

/**
 * 儲存字幕到資料庫
 */
export async function saveSubtitleToDatabase(
  videoId: string,
  whisperResponse: WhisperResponse,
  subtitleText: string,
  userId: string
): Promise<{ subtitleId: string; filePath: string }> {
  // 上傳字幕檔案到 GCS
  const filename = `subtitle_${videoId}.${WHISPER_CONFIG.subtitleFormat}`;
  const buffer = Buffer.from(subtitleText, 'utf-8');

  const { url: uploadUrl, filePath } = await storageService.generateUploadUrl(
    'subtitle' as any, // 需要在 storage.service.ts 加入 'subtitle' 類型
    userId,
    filename,
    'text/plain'
  );

  // 上傳字幕內容
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/plain' },
    body: buffer,
  });

  // 插入字幕主表
  const subtitleResult = await db.query(
    `INSERT INTO subtitles (
      video_id, language, format, file_path, duration, word_count, status
    ) VALUES ($1, $2, $3, $4, $5, $6, 'completed')
    RETURNING id`,
    [
      videoId,
      whisperResponse.language,
      WHISPER_CONFIG.subtitleFormat,
      filePath,
      whisperResponse.duration,
      whisperResponse.text.length,
    ]
  );

  const subtitleId = subtitleResult.rows[0].id;

  // 插入字幕片段
  const segmentValues = whisperResponse.segments.map((seg, index) => [
    subtitleId,
    index,
    seg.start,
    seg.end,
    seg.text,
    Math.exp(seg.avg_logprob), // 轉換為 0-1 的信心度
    seg.no_speech_prob,
  ]);

  await db.query(
    `INSERT INTO subtitle_segments (
      subtitle_id, segment_index, start_time, end_time, text, confidence, no_speech_prob
    )
    SELECT * FROM UNNEST($1::uuid[], $2::int[], $3::float[], $4::float[], $5::text[], $6::float[], $7::float[])`,
    [
      segmentValues.map(v => v[0]),
      segmentValues.map(v => v[1]),
      segmentValues.map(v => v[2]),
      segmentValues.map(v => v[3]),
      segmentValues.map(v => v[4]),
      segmentValues.map(v => v[5]),
      segmentValues.map(v => v[6]),
    ]
  );

  return { subtitleId, filePath };
}

/**
 * 查詢影片的字幕
 */
export async function getSubtitles(videoId: string) {
  const result = await db.query(
    `SELECT * FROM subtitles WHERE video_id = $1 ORDER BY created_at DESC`,
    [videoId]
  );

  return result.rows;
}

/**
 * 查詢字幕片段
 */
export async function getSubtitleSegments(subtitleId: string) {
  const result = await db.query(
    `SELECT * FROM subtitle_segments
     WHERE subtitle_id = $1
     ORDER BY segment_index ASC`,
    [subtitleId]
  );

  return result.rows;
}

/**
 * 更新字幕狀態
 */
export async function updateSubtitleStatus(
  subtitleId: string,
  status: 'processing' | 'completed' | 'failed',
  errorMessage?: string
) {
  await db.query(
    `UPDATE subtitles
     SET status = $1, error_message = $2, updated_at = NOW()
     WHERE id = $3`,
    [status, errorMessage || null, subtitleId]
  );
}
```

---

### 步驟 7: 建立完整的 STT API

建立 `backend/src/routes/subtitle.routes.ts`:

```typescript
/**
 * Subtitle Routes
 *
 * 字幕相關的 API 端點
 */

import express from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticateUser } from '../middleware/auth.middleware';
import * as audioExtractorService from '../services/audio-extractor.service';
import * as whisperService from '../services/whisper.service';
import * as subtitleFormatterService from '../services/subtitle-formatter.service';
import * as subtitleStorageService from '../services/subtitle-storage.service';

const router = express.Router();

/**
 * POST /api/videos/:videoId/subtitles
 *
 * 為影片生成字幕
 */
router.post('/:videoId/subtitles', authenticateUser, async (req, res) => {
  const { videoId } = req.params;
  const { language } = req.body; // 可選，不指定則自動偵測
  const userId = req.user!.id;

  try {
    // 1. 取得影片資訊
    const { db } = await import('../db');
    const videoResult = await db.query(
      'SELECT file_path FROM videos WHERE id = $1 AND user_id = $2',
      [videoId, userId]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoPath = videoResult.rows[0].file_path;

    // 2. 準備工作目錄
    const workDir = path.join('/tmp', 'whisper', uuidv4());

    // 3. 提取並準備音軌
    const audioPaths = await audioExtractorService.prepareAudioForWhisper(
      videoPath,
      workDir
    );

    // 4. 轉錄音訊
    const whisperResponse = audioPaths.length === 1
      ? await whisperService.transcribeAudio(audioPaths[0], language)
      : await whisperService.transcribeMultipleAudios(audioPaths, language);

    // 5. 過濾無語音片段
    const filteredSegments = whisperService.filterSilentSegments(
      whisperResponse.segments
    );

    // 6. 生成字幕檔案
    const subtitleText = subtitleFormatterService.generateSubtitle(
      filteredSegments
    );

    // 7. 儲存到資料庫和 GCS
    const { subtitleId, filePath } = await subtitleStorageService.saveSubtitleToDatabase(
      videoId,
      { ...whisperResponse, segments: filteredSegments },
      subtitleText,
      userId
    );

    // 8. 清理暫存檔案
    await audioExtractorService.cleanupAudioFiles(workDir);

    res.json({
      success: true,
      data: {
        subtitleId,
        filePath,
        language: whisperResponse.language,
        duration: whisperResponse.duration,
        segmentCount: filteredSegments.length,
        wordCount: whisperResponse.text.length,
      },
    });
  } catch (error: any) {
    console.error('Generate subtitle error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate subtitle' });
  }
});

/**
 * GET /api/videos/:videoId/subtitles
 *
 * 取得影片的所有字幕
 */
router.get('/:videoId/subtitles', authenticateUser, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user!.id;

  try {
    const { db } = await import('../db');

    // 驗證影片擁有權
    const videoResult = await db.query(
      'SELECT id FROM videos WHERE id = $1 AND user_id = $2',
      [videoId, userId]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const subtitles = await subtitleStorageService.getSubtitles(videoId);

    res.json({
      success: true,
      data: subtitles,
    });
  } catch (error: any) {
    console.error('Get subtitles error:', error);
    res.status(500).json({ error: error.message || 'Failed to get subtitles' });
  }
});

/**
 * GET /api/subtitles/:subtitleId/download
 *
 * 下載字幕檔案
 */
router.get('/:subtitleId/download', authenticateUser, async (req, res) => {
  const { subtitleId } = req.params;

  try {
    const { db } = await import('../db');

    const result = await db.query(
      `SELECT s.file_path, s.format, v.user_id
       FROM subtitles s
       JOIN videos v ON s.video_id = v.id
       WHERE s.id = $1`,
      [subtitleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subtitle not found' });
    }

    const { file_path, format } = result.rows[0];

    // 生成下載 URL
    const downloadUrl = await import('../services/storage.service').then(s =>
      s.generateDownloadUrl(file_path, 60)
    );

    res.json({
      success: true,
      data: {
        downloadUrl,
        format,
      },
    });
  } catch (error: any) {
    console.error('Download subtitle error:', error);
    res.status(500).json({ error: error.message || 'Failed to download subtitle' });
  }
});

export default router;
```

---

### 步驟 8: 註冊路由

在 `backend/src/index.ts` 加入:

```typescript
import subtitleRoutes from './routes/subtitle.routes';

app.use('/api/videos', subtitleRoutes);
```

---

### 步驟 9: 前端呼叫範例

建立 `frontend/lib/subtitle.ts`:

```typescript
/**
 * 前端字幕工具
 */

interface GenerateSubtitleOptions {
  language?: string; // 語言代碼，不指定則自動偵測
}

/**
 * 為影片生成字幕
 */
export async function generateSubtitle(
  videoId: string,
  options: GenerateSubtitleOptions = {}
): Promise<{
  subtitleId: string;
  filePath: string;
  language: string;
  duration: number;
}> {
  const response = await fetch(`/api/videos/${videoId}/subtitles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate subtitle');
  }

  const { data } = await response.json();
  return data;
}

/**
 * 取得影片的所有字幕
 */
export async function getSubtitles(videoId: string) {
  const response = await fetch(`/api/videos/${videoId}/subtitles`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get subtitles');
  }

  const { data } = await response.json();
  return data;
}

/**
 * 下載字幕檔案
 */
export async function downloadSubtitle(subtitleId: string): Promise<string> {
  const response = await fetch(`/api/subtitles/${subtitleId}/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download subtitle');
  }

  const { data } = await response.json();
  return data.downloadUrl;
}
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 測試 1: 音軌提取測試

```bash
# 測試 FFmpeg 音軌提取
ffmpeg -i test-video.mp4 -vn -acodec libmp3lame -b:a 64k test-audio.mp3

# 檢查音檔
ffprobe test-audio.mp3 -show_format
```

**通過標準**: 成功產生 MP3 音檔

---

### 測試 2: Whisper API 測試

```bash
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@test-audio.mp3" \
  -F model="whisper-1" \
  -F response_format="verbose_json"
```

**預期回應**:
```json
{
  "task": "transcribe",
  "language": "zh",
  "duration": 10.5,
  "text": "測試文字內容",
  "segments": [...]
}
```

---

### 測試 3: 完整字幕生成

```bash
curl -X POST http://localhost:8080/api/videos/VIDEO_ID/subtitles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "language": "zh"
  }'
```

**預期回應**:
```json
{
  "success": true,
  "data": {
    "subtitleId": "uuid",
    "filePath": "subtitles/user_123/subtitle_video_456.srt",
    "language": "zh",
    "duration": 120.5,
    "segmentCount": 45,
    "wordCount": 1200
  }
}
```

---

### 測試 4: 字幕下載

```bash
curl http://localhost:8080/api/subtitles/SUBTITLE_ID/download \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**通過標準**: 取得字幕檔案下載網址

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 環境設定
- [ ] OpenAI API Key 已設定
- [ ] FFmpeg 已安裝並可用
- [ ] 環境變數已設定

### 服務實作
- [ ] 音軌提取服務已建立
- [ ] Whisper STT 服務已建立
- [ ] 字幕格式轉換器已建立
- [ ] 字幕儲存服務已建立

### 資料庫
- [ ] subtitles 表已建立
- [ ] subtitle_segments 表已建立
- [ ] 索引已建立

### API 端點
- [ ] POST /api/videos/:videoId/subtitles (生成字幕)
- [ ] GET /api/videos/:videoId/subtitles (查詢字幕)
- [ ] GET /api/subtitles/:subtitleId/download (下載字幕)

### 功能驗證
- [ ] 可以從影片提取音軌
- [ ] 可以呼叫 Whisper API
- [ ] 可以生成 SRT/VTT 字幕
- [ ] 字幕正確儲存到資料庫
- [ ] 可以下載字幕檔案

### 進階功能
- [ ] 支援多語言辨識
- [ ] 自動過濾無語音片段
- [ ] 大檔案自動切分
- [ ] 字幕長度控制

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

## 🐛 常見問題與解決方案

### 問題 1: API Key 無效

**錯誤訊息:**
```
Error: Invalid API key provided
```

**解決方案**:

1. **檢查 API Key**:
```bash
echo $OPENAI_API_KEY
```

2. **確認 API Key 有效**:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

3. **檢查額度**:
- 前往 https://platform.openai.com/usage
- 確認有足夠的額度

---

### 問題 2: 檔案過大錯誤

**錯誤訊息:**
```
Error: File is too large. Maximum file size is 25MB
```

**解決方案**:

1. **降低音質**:
```typescript
// 在 whisper.config.ts 調整
audioBitrate: '32k', // 從 64k 降到 32k
```

2. **自動切分**:
```typescript
// prepareAudioForWhisper 已實作自動切分
if (fileSize > 25MB) {
  return await splitAudio(audioPath, segmentsDir);
}
```

---

### 問題 3: 語言辨識錯誤

**錯誤訊息:**
```
Detected language: en, but video is in Chinese
```

**解決方案**:

1. **明確指定語言**:
```typescript
const response = await transcribeAudio(audioPath, 'zh');
```

2. **檢查音訊品質**:
```bash
ffprobe audio.mp3 -show_streams
```

3. **提高音質**:
```typescript
audioBitrate: '128k', // 提高至 128k
```

---

### 問題 4: 字幕時間軸不同步

**問題**: 字幕時間與影片不一致

**原因**: 音軌提取時改變了時長

**解決方案**:

1. **使用原始幀率**:
```bash
ffmpeg -i video.mp4 -vn -acodec libmp3lame -ar 44100 audio.mp3
```

2. **驗證音訊時長**:
```bash
ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 audio.mp3
```

3. **對齊時間軸**:
```typescript
// 如果時長不一致，按比例調整
const ratio = videoDuration / audioDuration;
segments.forEach(seg => {
  seg.start *= ratio;
  seg.end *= ratio;
});
```

---

### 問題 5: Rate Limit 錯誤

**錯誤訊息:**
```
Error: Rate limit exceeded
```

**解決方案**:

1. **加入延遲**:
```typescript
async function transcribeWithRetry(audioPath: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await transcribeAudio(audioPath);
    } catch (error: any) {
      if (error.message.includes('rate_limit') && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待 2 秒
        continue;
      }
      throw error;
    }
  }
}
```

2. **批次處理間隔**:
```typescript
for (const audioPath of audioPaths) {
  const result = await transcribeAudio(audioPath);
  results.push(result);
  await new Promise(resolve => setTimeout(resolve, 1000)); // 每個請求間隔 1 秒
}
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **OpenAI Whisper API**: https://platform.openai.com/docs/guides/speech-to-text
- **FFmpeg Audio Processing**: https://trac.ffmpeg.org/wiki/AudioChannelManipulation
- **SRT Format Spec**: https://en.wikipedia.org/wiki/SubRip
- **WebVTT Standard**: https://www.w3.org/TR/webvtt1/
- **Whisper Model Paper**: https://arxiv.org/abs/2212.04356

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ OpenAI Whisper API 已設定
2. ✅ 音軌提取功能正常
3. ✅ 語音辨識可以運作
4. ✅ 字幕格式正確生成
5. ✅ 資料庫儲存正常
6. ✅ 所有 API 端點正常

### 最終驗收指令

```bash
# 1. 測試音軌提取
npm run test:audio-extract

# 2. 測試 Whisper API
npm run test:whisper

# 3. 測試字幕生成
npm run test:subtitle

# 4. 完整 E2E 測試
npm test -- subtitle.e2e.test.ts
```

**恭喜!** 如果所有驗收都通過,代表 Task 2.5 完成了!

---

**下一步**: Task 2.6 - 語意分析與場景切分

---

**文件版本**: 1.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
