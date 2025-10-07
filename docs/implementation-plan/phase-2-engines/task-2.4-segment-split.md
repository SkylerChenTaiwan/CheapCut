# Task 2.4: 影片切分與縮圖生成

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.4 |
| **Task 名稱** | 影片切分與縮圖生成 |
| **所屬 Phase** | Phase 2: Engines |
| **預估時間** | 4-5 小時 (設定 1h + 實作 2.5h + 測試 1.5h) |
| **難度** | ⭐⭐⭐ 中高 |
| **前置 Task** | Task 2.3 (標籤轉換與資料庫儲存) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的 FFmpeg 問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: ffmpeg exited with code 1
          ^^^^^^^^^^^^^^^^^^^^^^^^  ← FFmpeg 執行失敗
   ```

2. **判斷錯誤類型**
   - `ffmpeg: command not found` → FFmpeg 未安裝
   - `Invalid duration specification` → 時間參數格式錯誤
   - `No such file or directory` → 輸入檔案不存在
   - `codec not supported` → 編碼格式不支援
   - `Permission denied` → 檔案權限問題

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"影片切不出來"  ← 太模糊
"縮圖生成失敗" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"ffmpeg segment video by timestamp"  ← 具體的操作
"ffmpeg generate thumbnail from video time"  ← 明確的功能
"Node.js fluent-ffmpeg split video" ← 包含技術棧
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- FFmpeg 官方文件: https://ffmpeg.org/documentation.html
- FFmpeg Wiki: https://trac.ffmpeg.org/wiki
- Fluent-ffmpeg: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg

**優先順序 2: 社群資源**
- FFmpeg Wiki Examples: https://trac.ffmpeg.org/wiki/Create%20a%20thumbnail%20image%20every%20X%20seconds
- Stack Overflow: 搜尋 "ffmpeg segment video"

---

### Step 3: 檢查環境設定

```bash
# 檢查 FFmpeg 是否安裝
ffmpeg -version

# 檢查影片檔案資訊
ffprobe input.mp4

# 測試簡單的縮圖生成
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 test.jpg

# 檢查輸出檔案
ls -lh test.jpg
```

---

## 🎯 功能描述

實作 CheapCut 的影片切分引擎，將影片按照標籤的時間範圍切分成多個片段，並為每個片段產生代表性縮圖。

### 為什麼需要這個?

- 🎯 **問題**: 用戶需要快速瀏覽影片內容，但看完整部影片太耗時
- ✅ **解決**: 將影片切分成有意義的片段，每個片段有縮圖和標籤
- 💡 **比喻**: 就像把一本書分成章節，每章有標題和插圖，方便快速找到想看的內容

### 完成後你會有:

- ✅ FFmpeg 影片切分引擎
- ✅ 智能片段時間計算
- ✅ 高品質縮圖生成
- ✅ 片段資料正規化儲存
- ✅ GCS 檔案管理
- ✅ 完整的錯誤處理機制

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. FFmpeg 基礎

**是什麼**: FFmpeg 是強大的多媒體處理工具，能處理影片、音訊、字幕等

**核心概念**:
- **輸入 (-i)**: 指定來源檔案
- **時間參數 (-ss, -t)**: 控制起始時間和持續時間
- **編碼器 (-c:v, -c:a)**: 指定影片/音訊編碼
- **輸出**: 處理後的檔案

**為什麼選 FFmpeg**:
- 功能完整，支援所有主流格式
- 開源免費，社群活躍
- 效能優異，適合伺服器端處理
- 命令列介面，易於整合

### 2. 影片切分策略

**是什麼**: 將長影片分割成多個短片段的方法

**切分方式**:

**方法 1: 基於時間範圍** (我們使用這個)
```
影片: [0s ────────────── 60s]
標籤: [0-10s] [10-25s] [25-40s] [40-60s]
片段:   ▼       ▼        ▼        ▼
      片段1    片段2    片段3    片段4
```

**方法 2: 固定長度切分**
```
影片: [0s ────────────── 60s]
切分:  [0-15s] [15-30s] [30-45s] [45-60s]
```

**我們的策略**:
- 依照 Video AI 標籤的時間範圍切分
- 每個片段代表一個場景或主題
- 避免片段過短 (< 2秒) 或過長 (> 60秒)

### 3. FFmpeg 切分命令

**基本語法**:
```bash
ffmpeg -i input.mp4 -ss START -t DURATION -c copy output.mp4
```

**參數說明**:
- `-i input.mp4`: 輸入檔案
- `-ss START`: 起始時間 (如 00:00:10)
- `-t DURATION`: 持續時間 (如 5 表示 5 秒)
- `-c copy`: 複製編碼 (不重新編碼，速度快)
- `output.mp4`: 輸出檔案

**精確切分** (避免 keyframe 問題):
```bash
ffmpeg -ss START -i input.mp4 -t DURATION -c:v libx264 -c:a aac output.mp4
```

**為什麼要重新編碼**:
- `-c copy` 快速但可能不精確 (只能在 keyframe 切分)
- `-c:v libx264` 重新編碼，精確到幀，但較慢
- 我們使用重新編碼確保片段時間精確

### 4. 縮圖生成技術

**是什麼**: 從影片中擷取一幀作為預覽圖

**縮圖時間點選擇**:
```
片段: [0s ──────────── 10s]
       ↓       ↓        ↓
      開始    中間      結束

策略: 選擇中間點 (5s) 較能代表片段內容
```

**FFmpeg 縮圖命令**:
```bash
ffmpeg -i input.mp4 -ss 5 -vframes 1 -vf scale=320:-1 thumbnail.jpg
```

**參數說明**:
- `-ss 5`: 跳到第 5 秒
- `-vframes 1`: 只擷取 1 幀
- `-vf scale=320:-1`: 縮放寬度到 320px，高度自動調整
- `thumbnail.jpg`: 輸出圖片

**品質優化**:
```bash
ffmpeg -i input.mp4 -ss 5 -vframes 1 \
  -vf "scale=320:-1,format=yuv420p" \
  -q:v 2 thumbnail.jpg
```

- `-q:v 2`: 設定 JPEG 品質 (1-31，數字越小品質越高)
- `format=yuv420p`: 確保相容性

### 5. 時間碼格式轉換

**FFmpeg 支援的時間格式**:
- 秒數: `90` (90 秒)
- HH:MM:SS: `00:01:30` (1 分 30 秒)
- HH:MM:SS.ms: `00:01:30.500` (1 分 30.5 秒)

**我們的轉換函式**:
```typescript
function secondsToTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// 範例
secondsToTimecode(90.5);    // "00:01:30.500"
secondsToTimecode(3665.25); // "01:01:05.250"
```

### 6. 資料庫 Schema 設計

**影片片段表**:
```sql
CREATE TABLE video_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  segment_index INTEGER NOT NULL,  -- 片段順序 (0, 1, 2...)
  start_time FLOAT NOT NULL,       -- 開始時間 (秒)
  end_time FLOAT NOT NULL,         -- 結束時間 (秒)
  duration FLOAT NOT NULL,         -- 持續時間 (秒)
  segment_path TEXT NOT NULL,      -- GCS 片段檔案路徑
  thumbnail_path TEXT NOT NULL,    -- GCS 縮圖路徑
  file_size BIGINT,                -- 片段檔案大小
  thumbnail_size BIGINT,           -- 縮圖檔案大小
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_id, segment_index)
);

CREATE INDEX idx_video_segments_video ON video_segments(video_id);
CREATE INDEX idx_video_segments_time ON video_segments(start_time, end_time);
```

**為什麼這樣設計**:
- `segment_index`: 維持片段順序
- `start_time`, `end_time`, `duration`: 完整的時間資訊
- `segment_path`, `thumbnail_path`: 關聯到 GCS 檔案
- `UNIQUE(video_id, segment_index)`: 避免重複切分

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.1: GCS 儲存與上傳 (用於存放片段和縮圖)
- ✅ Task 2.3: 標籤轉換與資料庫儲存 (提供切分時間點)

### 系統需求
- Node.js >= 18
- FFmpeg >= 4.0 (建議 5.0+)
- GCS Bucket 已設定
- Supabase 已設定

### 安裝 FFmpeg

**macOS**:
```bash
brew install ffmpeg
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install ffmpeg
```

**驗證安裝**:
```bash
ffmpeg -version
ffprobe -version
```

### 套件依賴

```bash
npm install fluent-ffmpeg @types/fluent-ffmpeg
```

---

## 📝 實作步驟

### 步驟 1: 建立資料庫 Schema

**目標**: 建立影片片段相關的資料表

#### 1.1 建立 Migration

```bash
npx supabase migration new add_video_segments_table
```

#### 1.2 撰寫 Schema

檔案: `supabase/migrations/XXXXXX_add_video_segments_table.sql`

```sql
-- 影片片段表
CREATE TABLE IF NOT EXISTS video_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  segment_index INTEGER NOT NULL CHECK (segment_index >= 0),
  start_time FLOAT NOT NULL CHECK (start_time >= 0),
  end_time FLOAT NOT NULL CHECK (end_time > start_time),
  duration FLOAT GENERATED ALWAYS AS (end_time - start_time) STORED,
  segment_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  file_size BIGINT,
  thumbnail_size BIGINT,
  processing_status TEXT DEFAULT 'pending' CHECK (
    processing_status IN ('pending', 'processing', 'completed', 'failed')
  ),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_video_segment UNIQUE(video_id, segment_index)
);

-- 索引優化
CREATE INDEX idx_video_segments_video ON video_segments(video_id);
CREATE INDEX idx_video_segments_time ON video_segments(start_time, end_time);
CREATE INDEX idx_video_segments_status ON video_segments(processing_status);

-- 更新時間觸發器
CREATE TRIGGER update_video_segments_updated_at
  BEFORE UPDATE ON video_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE video_segments ENABLE ROW LEVEL SECURITY;

-- 用戶只能查看自己影片的片段
CREATE POLICY "Users can view their own video segments"
  ON video_segments FOR SELECT
  USING (
    video_id IN (
      SELECT id FROM videos WHERE user_id = auth.uid()
    )
  );

-- 用戶可以為自己的影片新增片段
CREATE POLICY "Users can insert segments for their videos"
  ON video_segments FOR INSERT
  TO authenticated
  WITH CHECK (
    video_id IN (
      SELECT id FROM videos WHERE user_id = auth.uid()
    )
  );

-- 用戶可以更新自己影片的片段
CREATE POLICY "Users can update their own video segments"
  ON video_segments FOR UPDATE
  USING (
    video_id IN (
      SELECT id FROM videos WHERE user_id = auth.uid()
    )
  );
```

#### 1.3 執行 Migration

```bash
npx supabase db push
```

---

### 步驟 2: 建立型別定義

**目標**: 定義 TypeScript 型別

檔案: `src/types/segment.ts`

```typescript
import { z } from 'zod';

// ========================================
// 資料庫型別
// ========================================

export interface VideoSegment {
  id: string;
  video_id: string;
  segment_index: number;
  start_time: number;
  end_time: number;
  duration: number;
  segment_path: string;
  thumbnail_path: string;
  file_size: number | null;
  thumbnail_size: number | null;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ========================================
// 切分請求格式
// ========================================

export const SegmentRequestSchema = z.object({
  videoId: z.string().uuid(),
  segments: z.array(
    z.object({
      startTime: z.number().min(0),
      endTime: z.number().min(0),
      index: z.number().int().min(0),
    })
  ).min(1),
});

export type SegmentRequest = z.infer<typeof SegmentRequestSchema>;

// ========================================
// 切分結果格式
// ========================================

export interface SegmentResult {
  segmentIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
  segmentPath: string;
  thumbnailPath: string;
  fileSize: number;
  thumbnailSize: number;
}

// ========================================
// 設定常數
// ========================================

export const SEGMENT_CONFIG = {
  MIN_DURATION: 2,           // 最小片段長度 (秒)
  MAX_DURATION: 300,         // 最大片段長度 (秒)
  THUMBNAIL_WIDTH: 320,      // 縮圖寬度 (px)
  THUMBNAIL_QUALITY: 2,      // JPEG 品質 (1-31, 越小越好)
  VIDEO_CODEC: 'libx264',    // 影片編碼器
  AUDIO_CODEC: 'aac',        // 音訊編碼器
  VIDEO_BITRATE: '1000k',    // 影片位元率
  AUDIO_BITRATE: '128k',     // 音訊位元率
} as const;
```

---

### 步驟 3: 實作 FFmpeg 工具函式

**目標**: 封裝 FFmpeg 操作

檔案: `src/lib/engines/ffmpeg-utils.ts`

```typescript
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { SEGMENT_CONFIG } from '@/types/segment';

const execAsync = promisify(exec);

/**
 * 檢查 FFmpeg 是否已安裝
 */
export async function checkFFmpegInstalled(): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}

/**
 * 取得影片資訊
 */
export async function getVideoInfo(filePath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        codec: videoStream.codec_name || 'unknown',
        bitrate: metadata.format.bit_rate || 0,
      });
    });
  });
}

/**
 * 秒數轉時間碼 (HH:MM:SS.mmm)
 */
export function secondsToTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * 切分影片片段
 *
 * @param inputPath - 輸入影片路徑
 * @param outputPath - 輸出片段路徑
 * @param startTime - 起始時間 (秒)
 * @param duration - 持續時間 (秒)
 */
export async function splitVideoSegment(
  inputPath: string,
  outputPath: string,
  startTime: number,
  duration: number
): Promise<{ fileSize: number }> {
  // 驗證參數
  if (duration < SEGMENT_CONFIG.MIN_DURATION) {
    throw new Error(`Segment duration too short: ${duration}s (min: ${SEGMENT_CONFIG.MIN_DURATION}s)`);
  }
  if (duration > SEGMENT_CONFIG.MAX_DURATION) {
    throw new Error(`Segment duration too long: ${duration}s (max: ${SEGMENT_CONFIG.MAX_DURATION}s)`);
  }

  // 確保輸出目錄存在
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(secondsToTimecode(startTime))
      .setDuration(duration)
      .videoCodec(SEGMENT_CONFIG.VIDEO_CODEC)
      .audioCodec(SEGMENT_CONFIG.AUDIO_CODEC)
      .videoBitrate(SEGMENT_CONFIG.VIDEO_BITRATE)
      .audioBitrate(SEGMENT_CONFIG.AUDIO_BITRATE)
      .output(outputPath)
      .on('end', async () => {
        try {
          const stats = await fs.stat(outputPath);
          resolve({ fileSize: stats.size });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .run();
  });
}

/**
 * 產生縮圖
 *
 * @param inputPath - 輸入影片路徑
 * @param outputPath - 輸出縮圖路徑
 * @param timestamp - 擷取時間點 (秒)
 */
export async function generateThumbnail(
  inputPath: string,
  outputPath: string,
  timestamp: number
): Promise<{ fileSize: number; width: number; height: number }> {
  // 確保輸出目錄存在
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [secondsToTimecode(timestamp)],
        filename: path.basename(outputPath),
        folder: outputDir,
        size: `${SEGMENT_CONFIG.THUMBNAIL_WIDTH}x?`,
      })
      .on('end', async () => {
        try {
          const stats = await fs.stat(outputPath);

          // 使用 ffprobe 取得縮圖尺寸
          const info = await new Promise<{ width: number; height: number }>((res, rej) => {
            ffmpeg.ffprobe(outputPath, (err, metadata) => {
              if (err) {
                rej(err);
                return;
              }
              const videoStream = metadata.streams.find(s => s.codec_type === 'video');
              res({
                width: videoStream?.width || 0,
                height: videoStream?.height || 0,
              });
            });
          });

          resolve({
            fileSize: stats.size,
            width: info.width,
            height: info.height,
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (err) => {
        reject(new Error(`Thumbnail generation error: ${err.message}`));
      });
  });
}

/**
 * 清理暫存檔案
 */
export async function cleanupTempFiles(files: string[]): Promise<void> {
  await Promise.all(
    files.map(async (file) => {
      try {
        await fs.unlink(file);
      } catch (error) {
        console.error(`Failed to delete temp file ${file}:`, error);
      }
    })
  );
}
```

---

### 步驟 4: 實作片段處理引擎

**目標**: 整合 FFmpeg、GCS、資料庫的完整流程

檔案: `src/lib/engines/segment-processor.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as storageService from '@/services/storage.service';
import * as ffmpegUtils from './ffmpeg-utils';
import { SegmentRequest, SegmentResult, SEGMENT_CONFIG } from '@/types/segment';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 處理單一片段
 */
async function processSegment(
  videoFilePath: string,
  segmentIndex: number,
  startTime: number,
  endTime: number,
  videoId: string,
  userId: string
): Promise<SegmentResult> {
  const duration = endTime - startTime;
  const tempDir = os.tmpdir();
  const tempId = uuidv4();

  // 暫存檔案路徑
  const tempSegmentPath = path.join(tempDir, `segment_${tempId}.mp4`);
  const tempThumbnailPath = path.join(tempDir, `thumb_${tempId}.jpg`);

  try {
    // Step 1: 切分影片片段
    console.log(`Splitting segment ${segmentIndex}: ${startTime}s - ${endTime}s`);
    const segmentInfo = await ffmpegUtils.splitVideoSegment(
      videoFilePath,
      tempSegmentPath,
      startTime,
      duration
    );

    // Step 2: 產生縮圖 (取片段中間點)
    const thumbnailTimestamp = duration / 2;
    console.log(`Generating thumbnail at ${thumbnailTimestamp}s`);
    const thumbnailInfo = await ffmpegUtils.generateThumbnail(
      tempSegmentPath,
      tempThumbnailPath,
      thumbnailTimestamp
    );

    // Step 3: 上傳片段到 GCS
    console.log(`Uploading segment ${segmentIndex} to GCS`);
    const segmentGcsPath = `segments/${videoId}/segment_${segmentIndex}.mp4`;
    await uploadFileToGCS(tempSegmentPath, segmentGcsPath);

    // Step 4: 上傳縮圖到 GCS
    console.log(`Uploading thumbnail ${segmentIndex} to GCS`);
    const thumbnailGcsPath = `thumbnails/${videoId}/segment_${segmentIndex}.jpg`;
    await uploadFileToGCS(tempThumbnailPath, thumbnailGcsPath);

    // Step 5: 清理暫存檔案
    await ffmpegUtils.cleanupTempFiles([tempSegmentPath, tempThumbnailPath]);

    return {
      segmentIndex,
      startTime,
      endTime,
      duration,
      segmentPath: segmentGcsPath,
      thumbnailPath: thumbnailGcsPath,
      fileSize: segmentInfo.fileSize,
      thumbnailSize: thumbnailInfo.fileSize,
    };
  } catch (error) {
    // 清理暫存檔案
    await ffmpegUtils.cleanupTempFiles([tempSegmentPath, tempThumbnailPath]);
    throw error;
  }
}

/**
 * 上傳檔案到 GCS
 */
async function uploadFileToGCS(
  localPath: string,
  gcsPath: string
): Promise<void> {
  const fileContent = await fs.readFile(localPath);
  const bucket = storageService.getBucket();
  const file = bucket.file(gcsPath);

  await file.save(fileContent, {
    metadata: {
      contentType: gcsPath.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
    },
  });
}

/**
 * 儲存片段資料到資料庫
 */
async function saveSegmentToDatabase(
  videoId: string,
  result: SegmentResult
): Promise<string> {
  const { data, error } = await supabase
    .from('video_segments')
    .insert({
      video_id: videoId,
      segment_index: result.segmentIndex,
      start_time: result.startTime,
      end_time: result.endTime,
      segment_path: result.segmentPath,
      thumbnail_path: result.thumbnailPath,
      file_size: result.fileSize,
      thumbnail_size: result.thumbnailSize,
      processing_status: 'completed',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save segment to database: ${error.message}`);
  }

  return data.id;
}

/**
 * 處理影片切分 (主函式)
 *
 * @param videoFilePath - 本地影片檔案路徑
 * @param request - 切分請求
 * @param userId - 用戶 ID
 */
export async function processVideoSegmentation(
  videoFilePath: string,
  request: SegmentRequest,
  userId: string
): Promise<{
  processedSegments: number;
  failedSegments: number;
  segments: SegmentResult[];
}> {
  const { videoId, segments } = request;
  const results: SegmentResult[] = [];
  let failedCount = 0;

  // 驗證影片檔案
  try {
    const videoInfo = await ffmpegUtils.getVideoInfo(videoFilePath);
    console.log(`Video info: duration=${videoInfo.duration}s, size=${videoInfo.width}x${videoInfo.height}`);
  } catch (error) {
    throw new Error(`Invalid video file: ${error}`);
  }

  // 處理每個片段
  for (const segment of segments) {
    try {
      console.log(`Processing segment ${segment.index}/${segments.length}`);

      const result = await processSegment(
        videoFilePath,
        segment.index,
        segment.startTime,
        segment.endTime,
        videoId,
        userId
      );

      // 儲存到資料庫
      await saveSegmentToDatabase(videoId, result);

      results.push(result);
    } catch (error) {
      console.error(`Failed to process segment ${segment.index}:`, error);
      failedCount++;

      // 記錄失敗到資料庫
      await supabase
        .from('video_segments')
        .insert({
          video_id: videoId,
          segment_index: segment.index,
          start_time: segment.startTime,
          end_time: segment.endTime,
          segment_path: '',
          thumbnail_path: '',
          processing_status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
        });
    }
  }

  return {
    processedSegments: results.length,
    failedSegments: failedCount,
    segments: results,
  };
}

/**
 * 從標籤自動產生切分請求
 */
export async function generateSegmentsFromTags(
  videoId: string,
  minConfidence: number = 0.7
): Promise<SegmentRequest> {
  // 從資料庫取得影片標籤
  const { data: videoTags, error } = await supabase
    .from('video_tags')
    .select('start_time, end_time, confidence, label_type')
    .eq('video_id', videoId)
    .gte('confidence', minConfidence)
    .eq('label_type', 'shot') // 只使用 shot 標籤
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch video tags: ${error.message}`);
  }

  if (!videoTags || videoTags.length === 0) {
    throw new Error('No tags found for video');
  }

  // 合併重疊的時間範圍
  const mergedSegments = mergeOverlappingSegments(
    videoTags.map((tag) => ({
      startTime: tag.start_time,
      endTime: tag.end_time,
    }))
  );

  // 過濾過短的片段
  const validSegments = mergedSegments.filter(
    (seg) => seg.endTime - seg.startTime >= SEGMENT_CONFIG.MIN_DURATION
  );

  return {
    videoId,
    segments: validSegments.map((seg, index) => ({
      startTime: seg.startTime,
      endTime: seg.endTime,
      index,
    })),
  };
}

/**
 * 合併重疊的時間區間
 */
function mergeOverlappingSegments(
  segments: Array<{ startTime: number; endTime: number }>
): Array<{ startTime: number; endTime: number }> {
  if (segments.length === 0) return [];

  // 按開始時間排序
  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);
  const merged: Array<{ startTime: number; endTime: number }> = [];

  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];

    // 如果重疊或相鄰,合併
    if (next.startTime <= current.endTime) {
      current.endTime = Math.max(current.endTime, next.endTime);
    } else {
      // 不重疊,加入結果並開始新區間
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);
  return merged;
}

/**
 * 查詢影片的所有片段
 */
export async function getVideoSegments(videoId: string) {
  const { data, error } = await supabase
    .from('video_segments')
    .select('*')
    .eq('video_id', videoId)
    .order('segment_index', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch segments: ${error.message}`);
  }

  return data;
}
```

---

### 步驟 5: 更新 Storage Service

**目標**: 新增 getBucket 方法供片段處理使用

檔案: `backend/src/services/storage.service.ts` (新增以下函式)

```typescript
/**
 * 取得 GCS Bucket 實例
 * (供其他模組直接使用)
 */
export function getBucket() {
  return bucket;
}
```

---

### 步驟 6: 建立 API 端點

**目標**: 提供片段處理的 HTTP API

檔案: `src/app/api/videos/[id]/segments/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  processVideoSegmentation,
  generateSegmentsFromTags,
  getVideoSegments
} from '@/lib/engines/segment-processor';
import { SegmentRequestSchema } from '@/types/segment';
import * as storageService from '@/services/storage.service';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

/**
 * GET /api/videos/[id]/segments
 * 查詢影片的所有片段
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const segments = await getVideoSegments(videoId);

    return NextResponse.json({
      success: true,
      data: segments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/videos/[id]/segments
 * 處理影片切分
 *
 * Request Body:
 * {
 *   "autoGenerate": true,  // 自動從標籤產生切分點
 *   "minConfidence": 0.7   // 標籤信心度閾值
 * }
 *
 * 或手動指定:
 * {
 *   "segments": [
 *     { "startTime": 0, "endTime": 10, "index": 0 },
 *     { "startTime": 10, "endTime": 25, "index": 1 }
 *   ]
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tempFiles: string[] = [];

  try {
    const videoId = params.id;
    const body = await request.json();
    const userId = request.headers.get('x-user-id'); // 從 auth middleware

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Step 1: 產生切分請求
    let segmentRequest;

    if (body.autoGenerate) {
      console.log('Auto-generating segments from tags');
      segmentRequest = await generateSegmentsFromTags(
        videoId,
        body.minConfidence || 0.7
      );
    } else {
      // 驗證手動輸入
      segmentRequest = SegmentRequestSchema.parse({
        videoId,
        segments: body.segments,
      });
    }

    console.log(`Processing ${segmentRequest.segments.length} segments`);

    // Step 2: 從 GCS 下載影片到暫存
    const videoPath = await downloadVideoToTemp(videoId);
    tempFiles.push(videoPath);

    // Step 3: 處理切分
    const result = await processVideoSegmentation(
      videoPath,
      segmentRequest,
      userId
    );

    // Step 4: 清理暫存檔案
    await fs.unlink(videoPath);

    return NextResponse.json({
      success: true,
      data: {
        processedSegments: result.processedSegments,
        failedSegments: result.failedSegments,
        totalSegments: segmentRequest.segments.length,
        segments: result.segments,
      },
    });
  } catch (error: any) {
    console.error('Segment processing error:', error);

    // 清理暫存檔案
    for (const file of tempFiles) {
      try {
        await fs.unlink(file);
      } catch {}
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * 從 GCS 下載影片到暫存目錄
 */
async function downloadVideoToTemp(videoId: string): Promise<string> {
  // 假設影片存在 materials/{userId}/{videoId}.mp4
  // 實際實作需要從資料庫查詢正確的 GCS 路徑

  const bucket = storageService.getBucket();
  const tempPath = path.join(os.tmpdir(), `video_${videoId}.mp4`);

  // TODO: 從資料庫取得實際的 GCS 路徑
  const gcsPath = `materials/user_123/${videoId}.mp4`; // 範例路徑

  await bucket.file(gcsPath).download({
    destination: tempPath,
  });

  return tempPath;
}
```

---

## ✅ 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證 FFmpeg 工具函式是否正常運作

**測試檔案**: `tests/phase-2/task-2.4.basic.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TestRunner } from '../../src/lib/test-runner';
import * as ffmpegUtils from '../../src/lib/engines/ffmpeg-utils';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

describe('Task 2.4 - Basic: FFmpeg Utils', () => {
  const runner = new TestRunner('basic');
  const testVideoPath = path.join(__dirname, '../fixtures/test-video.mp4');

  beforeAll(async () => {
    // 確保測試影片存在
    try {
      await fs.access(testVideoPath);
    } catch {
      throw new Error(`Test video not found: ${testVideoPath}`);
    }
  });

  it('應該能夠檢查 FFmpeg 安裝', async () => {
    await runner.runTest('FFmpeg 安裝檢查', async () => {
      const installed = await ffmpegUtils.checkFFmpegInstalled();
      expect(installed).toBe(true);
    });
  });

  it('應該能夠取得影片資訊', async () => {
    await runner.runTest('影片資訊取得', async () => {
      const info = await ffmpegUtils.getVideoInfo(testVideoPath);

      expect(info.duration).toBeGreaterThan(0);
      expect(info.width).toBeGreaterThan(0);
      expect(info.height).toBeGreaterThan(0);
      expect(info.codec).toBeTruthy();
    });
  });

  it('應該能夠轉換時間碼', async () => {
    await runner.runTest('時間碼轉換', async () => {
      expect(ffmpegUtils.secondsToTimecode(0)).toBe('00:00:00.000');
      expect(ffmpegUtils.secondsToTimecode(90.5)).toBe('00:01:30.500');
      expect(ffmpegUtils.secondsToTimecode(3665.25)).toBe('01:01:05.250');
    });
  });

  it('應該能夠切分影片片段', async () => {
    await runner.runTest('影片切分', async () => {
      const outputPath = path.join(os.tmpdir(), 'test-segment.mp4');

      const result = await ffmpegUtils.splitVideoSegment(
        testVideoPath,
        outputPath,
        0,  // 從 0 秒開始
        5   // 持續 5 秒
      );

      expect(result.fileSize).toBeGreaterThan(0);

      // 驗證檔案存在
      await fs.access(outputPath);

      // 清理
      await fs.unlink(outputPath);
    });
  });

  it('應該能夠產生縮圖', async () => {
    await runner.runTest('縮圖生成', async () => {
      const outputPath = path.join(os.tmpdir(), 'test-thumbnail.jpg');

      const result = await ffmpegUtils.generateThumbnail(
        testVideoPath,
        outputPath,
        2.5  // 2.5 秒處
      );

      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);

      // 驗證檔案存在
      await fs.access(outputPath);

      // 清理
      await fs.unlink(outputPath);
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.4.basic.test.ts
```

**通過標準**:
- ✅ FFmpeg 已正確安裝
- ✅ 能夠取得影片資訊
- ✅ 時間碼轉換正確
- ✅ 能夠切分影片
- ✅ 能夠產生縮圖

---

### Functional Acceptance (功能驗收)

**目標**: 驗證片段處理完整功能

**測試檔案**: `tests/phase-2/task-2.4.functional.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TestRunner } from '../../src/lib/test-runner';
import {
  processVideoSegmentation,
  generateSegmentsFromTags,
  getVideoSegments,
} from '../../src/lib/engines/segment-processor';
import path from 'path';

describe('Task 2.4 - Functional: Segment Processing', () => {
  const runner = new TestRunner('functional');
  const testVideoPath = path.join(__dirname, '../fixtures/test-video.mp4');
  const testVideoId = 'test-video-123';
  const testUserId = 'test-user-123';

  it('應該能夠處理影片切分', async () => {
    await runner.runTest('影片切分處理', async () => {
      const request = {
        videoId: testVideoId,
        segments: [
          { startTime: 0, endTime: 5, index: 0 },
          { startTime: 5, endTime: 10, index: 1 },
        ],
      };

      const result = await processVideoSegmentation(
        testVideoPath,
        request,
        testUserId
      );

      expect(result.processedSegments).toBe(2);
      expect(result.failedSegments).toBe(0);
      expect(result.segments).toHaveLength(2);

      // 驗證片段資料
      result.segments.forEach((seg) => {
        expect(seg.segmentPath).toBeTruthy();
        expect(seg.thumbnailPath).toBeTruthy();
        expect(seg.fileSize).toBeGreaterThan(0);
        expect(seg.thumbnailSize).toBeGreaterThan(0);
      });
    });
  });

  it('應該能夠從標籤產生切分請求', async () => {
    await runner.runTest('從標籤產生切分', async () => {
      // 假設已有標籤資料
      const request = await generateSegmentsFromTags(testVideoId, 0.7);

      expect(request.videoId).toBe(testVideoId);
      expect(request.segments.length).toBeGreaterThan(0);

      // 驗證片段順序
      for (let i = 0; i < request.segments.length - 1; i++) {
        expect(request.segments[i].endTime).toBeLessThanOrEqual(
          request.segments[i + 1].startTime
        );
      }
    });
  });

  it('應該能夠查詢片段', async () => {
    await runner.runTest('片段查詢', async () => {
      const segments = await getVideoSegments(testVideoId);

      expect(Array.isArray(segments)).toBe(true);

      if (segments.length > 0) {
        expect(segments[0]).toHaveProperty('segment_index');
        expect(segments[0]).toHaveProperty('start_time');
        expect(segments[0]).toHaveProperty('end_time');
        expect(segments[0]).toHaveProperty('segment_path');
        expect(segments[0]).toHaveProperty('thumbnail_path');
      }
    });
  });

  it('應該正確處理過短的片段', async () => {
    await runner.runTest('過短片段過濾', async () => {
      const request = {
        videoId: testVideoId,
        segments: [
          { startTime: 0, endTime: 0.5, index: 0 }, // 過短
        ],
      };

      await expect(
        processVideoSegmentation(testVideoPath, request, testUserId)
      ).rejects.toThrow('too short');
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.4.functional.test.ts
```

**通過標準**:
- ✅ 片段切分處理正確
- ✅ 從標籤產生切分正常
- ✅ 片段查詢功能正常
- ✅ 正確處理異常情況

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證完整的影片切分流程

**測試檔案**: `tests/phase-2/task-2.4.e2e.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.4 - E2E: Complete Segmentation Flow', () => {
  const runner = new TestRunner('e2e');
  const testVideoId = 'test-video-e2e';

  it('應該能完整執行切分流程', async () => {
    await runner.runTest('完整切分流程', async () => {
      // 1. 呼叫 API 開始切分
      const response = await fetch(
        `${process.env.TEST_BASE_URL}/api/videos/${testVideoId}/segments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'test-user',
          },
          body: JSON.stringify({
            autoGenerate: true,
            minConfidence: 0.7,
          }),
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.processedSegments).toBeGreaterThan(0);

      // 2. 查詢片段
      const getResponse = await fetch(
        `${process.env.TEST_BASE_URL}/api/videos/${testVideoId}/segments`
      );

      expect(getResponse.ok).toBe(true);
      const segments = await getResponse.json();
      expect(segments.data.length).toBeGreaterThan(0);

      // 3. 驗證片段資料完整性
      segments.data.forEach((seg: any) => {
        expect(seg.segment_path).toBeTruthy();
        expect(seg.thumbnail_path).toBeTruthy();
        expect(seg.processing_status).toBe('completed');
      });
    });
  });

  it('應該能處理切分失敗的情況', async () => {
    await runner.runTest('切分失敗處理', async () => {
      const response = await fetch(
        `${process.env.TEST_BASE_URL}/api/videos/invalid-video/segments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'test-user',
          },
          body: JSON.stringify({
            segments: [{ startTime: 0, endTime: 10, index: 0 }],
          }),
        }
      );

      expect(response.ok).toBe(false);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeTruthy();
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.4.e2e.test.ts
```

**通過標準**:
- ✅ 完整的切分流程正確運作
- ✅ 片段和縮圖正確上傳到 GCS
- ✅ 資料庫記錄正確
- ✅ 錯誤處理完善

---

## 📋 完成檢查清單

實作完成後，請依序檢查以下項目：

### 環境檢查
- [ ] FFmpeg 已安裝
- [ ] FFmpeg 版本 >= 4.0
- [ ] GCS Bucket 已設定
- [ ] 資料庫已更新

### 實作檢查
- [ ] 資料庫 Migration 已建立並執行
- [ ] 型別定義已完成 (`src/types/segment.ts`)
- [ ] FFmpeg 工具函式已實作 (`src/lib/engines/ffmpeg-utils.ts`)
- [ ] 片段處理引擎已實作 (`src/lib/engines/segment-processor.ts`)
- [ ] Storage Service 已更新
- [ ] API 端點已建立 (`src/app/api/videos/[id]/segments/route.ts`)

### 測試檔案
- [ ] `tests/phase-2/task-2.4.basic.test.ts` 已建立
- [ ] `tests/phase-2/task-2.4.functional.test.ts` 已建立
- [ ] `tests/phase-2/task-2.4.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

### 資料庫驗證
- [ ] `video_segments` 表已建立
- [ ] 索引已建立
- [ ] RLS 政策已設定
- [ ] 觸發器正常運作

---

## 🐛 常見問題與解決方案

### Q1: FFmpeg command not found

**問題**: 執行時出現 `ffmpeg: command not found`

**原因**: FFmpeg 未安裝或不在 PATH 中

**解決方案**:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# 驗證安裝
ffmpeg -version
```

**如果使用 Docker**:
```dockerfile
FROM node:18

# 安裝 FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

# ... 其他設定
```

---

### Q2: 切分後的影片時間不精確

**問題**: 切分出的片段時間與預期不符

**原因**: 使用 `-c copy` 只能在 keyframe 切分

**解決方案**:

```typescript
// ❌ 不精確 (快速但不準)
ffmpeg(inputPath)
  .setStartTime(startTime)
  .setDuration(duration)
  .videoCodec('copy')  // ← 問題在這
  .audioCodec('copy')

// ✅ 精確 (較慢但準確)
ffmpeg(inputPath)
  .setStartTime(startTime)
  .setDuration(duration)
  .videoCodec('libx264')  // ← 重新編碼
  .audioCodec('aac')
```

**進階優化** (兩階段切分):
```typescript
// 第一階段: 快速定位 (允許誤差)
// 第二階段: 精確切分 (只處理小範圍)
```

---

### Q3: 縮圖品質不佳

**問題**: 產生的縮圖模糊或顏色異常

**原因**: 預設設定未優化

**解決方案**:

```typescript
// ❌ 預設設定
.screenshots({
  timestamps: [time],
  size: '320x?',
})

// ✅ 優化設定
ffmpeg(inputPath)
  .screenshots({
    timestamps: [secondsToTimecode(time)],
    filename: 'thumb.jpg',
    folder: outputDir,
    size: '320x?',
  })
  .outputOptions([
    '-q:v 2',              // JPEG 品質 (1-31, 越小越好)
    '-vf format=yuv420p',  // 色彩格式
  ])
```

---

### Q4: 記憶體溢位

**問題**: 處理大影片時出現 `JavaScript heap out of memory`

**原因**: FFmpeg 處理過程中佔用大量記憶體

**解決方案**:

1. **增加 Node.js 記憶體限制**:
```bash
node --max-old-space-size=4096 server.js
```

2. **分批處理片段**:
```typescript
// 一次只處理 5 個片段
const BATCH_SIZE = 5;
for (let i = 0; i < segments.length; i += BATCH_SIZE) {
  const batch = segments.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(processSegment));
}
```

3. **使用串流處理**:
```typescript
// 避免將整個影片載入記憶體
ffmpeg(inputPath)
  .on('progress', (progress) => {
    console.log(`Processing: ${progress.percent}%`);
  })
  .pipe(outputStream);
```

---

### Q5: GCS 上傳失敗

**問題**: 片段上傳到 GCS 時出現 `403 Forbidden`

**原因**: Service Account 權限不足

**解決方案**:

```bash
# 檢查 Service Account 權限
gcloud projects get-iam-policy $PROJECT_ID

# 給予 Storage Object Admin 權限
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/storage.objectAdmin"
```

---

### Q6: 片段太多導致處理時間過長

**問題**: 單一影片產生超過 100 個片段

**原因**: 標籤過於細碎

**解決方案**:

1. **提高信心度閾值**:
```typescript
const request = await generateSegmentsFromTags(videoId, 0.85); // 0.7 → 0.85
```

2. **限制片段數量**:
```typescript
export const SEGMENT_CONFIG = {
  MAX_SEGMENTS_PER_VIDEO: 50,  // 新增限制
  // ...
};

// 在產生切分時應用
const validSegments = mergedSegments
  .slice(0, SEGMENT_CONFIG.MAX_SEGMENTS_PER_VIDEO);
```

3. **只使用特定類型標籤**:
```typescript
// 只使用 shot 標籤 (場景變化)
.eq('label_type', 'shot')
// 忽略 frame 標籤 (太細碎)
```

---

## 🎓 Task 完成確認

完成這個 Task 後，你應該能夠：

✅ 理解 FFmpeg 基礎操作和參數
✅ 實作影片切分功能
✅ 產生高品質縮圖
✅ 處理時間碼轉換
✅ 整合 GCS 檔案上傳
✅ 設計片段資料 Schema
✅ 實作完整的錯誤處理

**下一步**: Task 2.5 - Whisper STT 整合

---

**文件版本**: 1.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
