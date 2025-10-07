# Task 2.12: 影片合成實作

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.12 |
| **Task 名稱** | 影片合成實作 |
| **所屬 Phase** | Phase 2: 核心引擎實作 |
| **預估時間** | 4-5 小時 (解析時間軸 1h + 片段處理 2h + 合成 1h + 測試 1h) |
| **難度** | ⭐⭐⭐ 中高 |
| **前置 Task** | Task 2.11 (FFmpeg 環境設定) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的影片合成問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Invalid time format
          ^^^^^^^^^^^^^^^^^^^^  ← 時間格式錯誤
   ```

2. **判斷錯誤類型**
   - `Invalid time format` → 時間軸 JSON 格式錯誤
   - `File not found` → 素材檔案路徑錯誤
   - `Codec not supported` → 影片編碼不支援
   - `Audio sync error` → 音訊同步問題
   - `Out of memory` → 記憶體不足

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"影片合成失敗"  ← 太模糊
"FFmpeg 錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"FFmpeg concat demuxer mp4"  ← 具體的合成方法
"FFmpeg merge videos with audio sync" ← 包含具體問題
"fluent-ffmpeg mergeToFile example" ← 具體的 API 用法
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- FFmpeg Concat: https://trac.ffmpeg.org/wiki/Concatenate
- FFmpeg Audio: https://trac.ffmpeg.org/wiki/AudioChannelManipulation
- fluent-ffmpeg: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg

**優先順序 2: 實用教學**
- FFmpeg 合成教學: https://superuser.com/questions/tagged/ffmpeg

---

### Step 3: 檢查時間軸 JSON

```bash
# 檢查 JSON 格式是否正確
cat timeline.json | jq .

# 檢查必要欄位
cat timeline.json | jq '.video_segments'
cat timeline.json | jq '.voiceover_url'

# 檢查時間是否合理
cat timeline.json | jq '.video_segments[].start_time'
```

---

## 🎯 功能描述

實作影片合成引擎,根據時間軸 JSON 將影片片段與配音合成為最終影片。

### 為什麼需要這個?

- 🎯 **問題**: 有了選好的片段和配音,但還沒有組合成完整影片
- ✅ **解決**: 使用 FFmpeg 將片段按照時間軸合成,疊加配音
- 💡 **比喻**: 就像拼圖,把選好的片段按順序拼起來,配上旁白

### 完成後你會有:

- ✅ 時間軸 JSON 解析功能
- ✅ 影片片段剪輯與合併
- ✅ 配音疊加功能
- ✅ 音訊同步處理
- ✅ 最終 MP4 影片輸出
- ✅ 完整的錯誤處理與日誌

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. 時間軸 JSON 格式

**是什麼**: Task 2.10 產生的 JSON,描述影片的組成結構

**格式範例**:
```json
{
  "video_segments": [
    {
      "segment_id": "seg_001",
      "material_id": "mat_123",
      "start_time": 5.2,
      "end_time": 8.7,
      "order": 0
    },
    {
      "segment_id": "seg_002",
      "material_id": "mat_456",
      "start_time": 10.0,
      "end_time": 15.5,
      "order": 1
    }
  ],
  "voiceover_url": "gs://bucket/voiceover.mp3",
  "total_duration": 9.0
}
```

**欄位說明**:
- `video_segments`: 影片片段陣列
  - `segment_id`: 片段 ID
  - `material_id`: 素材 ID (用來查詢素材檔案)
  - `start_time`: 在原素材中的開始時間 (秒)
  - `end_time`: 在原素材中的結束時間 (秒)
  - `order`: 在最終影片中的順序
- `voiceover_url`: 配音檔案的 GCS URL
- `total_duration`: 最終影片總時長

### 2. FFmpeg Concat (合併)

**是什麼**: FFmpeg 合併多個影片的方法

**兩種方式**:

**方式 1: Concat Demuxer** (推薦,速度快)
```bash
# 建立檔案列表
echo "file 'video1.mp4'" > filelist.txt
echo "file 'video2.mp4'" >> filelist.txt

# 合併
ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4
```

**優點**: 速度快,不重新編碼
**缺點**: 要求所有影片格式、解析度、編碼器完全一致

**方式 2: Concat Filter** (較慢但彈性高)
```bash
ffmpeg -i video1.mp4 -i video2.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" output.mp4
```

**優點**: 可處理不同格式的影片
**缺點**: 需要重新編碼,較慢

**我們選擇**: 先統一格式,再用 Concat Demuxer (速度快)

### 3. 音訊合併與同步

**是什麼**: 將影片音軌與配音音軌合併

**基本概念**:
```
原影片:  [視訊軌][音訊軌]
配音:    [音訊軌]

合成後:  [視訊軌][混合音訊軌]
```

**FFmpeg 指令**:
```bash
# 移除原音訊,加入新配音
ffmpeg -i video.mp4 -i voiceover.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac \
  -shortest output.mp4

# -map 0:v: 使用第一個輸入的視訊
# -map 1:a: 使用第二個輸入的音訊
# -shortest: 以最短的流為準
```

**同步問題**:
- 如果配音比影片長 → 影片結束後配音被截斷
- 如果配音比影片短 → 影片後半段沒有聲音

**解決方案**: 在時間軸生成時確保配音與影片長度一致

### 4. 影片編碼參數

**為什麼要了解編碼?**
- 不同參數影響檔案大小、品質、相容性
- 社群平台有不同的規格要求

**推薦設定**:
```typescript
{
  videoCodec: 'libx264',      // H.264 編碼,相容性最好
  audioCodec: 'aac',          // AAC 音訊,相容性好
  videoBitrate: '2000k',      // 2 Mbps,適合 1080p
  audioBitrate: '128k',       // 128 kbps,品質足夠
  format: 'mp4',              // MP4 容器,最通用
  fps: 30,                    // 30 fps,社群媒體標準
  resolution: '1920x1080'     // Full HD
}
```

**社群平台規格參考**:

| 平台 | 解析度 | 位元率 | 格式 |
|------|--------|--------|------|
| YouTube | 1920x1080 | 8 Mbps | MP4 |
| Instagram | 1080x1080 | 5 Mbps | MP4 |
| TikTok | 1080x1920 | 5 Mbps | MP4 |
| Facebook | 1920x1080 | 4 Mbps | MP4 |

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.10: 時間軸 JSON 生成 (智能選片引擎)
- ✅ Task 2.11: FFmpeg 環境設定

### 系統需求
- FFmpeg (已在 Task 2.11 安裝)
- Cloud Storage 存取權限
- 足夠的暫存空間 (至少 2GB)

### 資料庫依賴
需要查詢以下資料表:
- `materials` - 取得素材檔案的 GCS URL
- `material_segments` - 取得片段資訊
- `video_generation_jobs` - 儲存合成進度

---

## 📝 實作步驟

### 步驟 1: 建立時間軸解析器

建立 `backend/src/engines/composition/timeline-parser.ts`:

```typescript
/**
 * 時間軸 JSON 解析器
 *
 * 為什麼需要這個?
 * - 驗證時間軸 JSON 格式
 * - 解析片段資訊
 * - 計算影片總長度
 */

import { Logger } from '../../lib/logger';

const logger = new Logger('TimelineParser');

/**
 * 時間軸格式定義
 */
export interface Timeline {
  video_segments: VideoSegment[];
  voiceover_url: string;
  total_duration: number;
  music_url?: string;      // 可選的背景音樂
  music_volume?: number;   // 背景音樂音量 (0-1)
}

export interface VideoSegment {
  segment_id: string;
  material_id: string;
  start_time: number;  // 在原素材中的開始時間
  end_time: number;    // 在原素材中的結束時間
  order: number;       // 在最終影片中的順序
}

/**
 * 解析時間軸 JSON
 */
export function parseTimeline(timelineJson: string): Timeline {
  try {
    const timeline = JSON.parse(timelineJson) as Timeline;

    // 驗證必要欄位
    if (!timeline.video_segments || !Array.isArray(timeline.video_segments)) {
      throw new Error('缺少 video_segments 欄位或格式錯誤');
    }

    if (!timeline.voiceover_url) {
      throw new Error('缺少 voiceover_url 欄位');
    }

    if (timeline.video_segments.length === 0) {
      throw new Error('video_segments 不能為空');
    }

    // 驗證每個片段
    timeline.video_segments.forEach((segment, index) => {
      if (!segment.segment_id) {
        throw new Error(`片段 ${index} 缺少 segment_id`);
      }
      if (!segment.material_id) {
        throw new Error(`片段 ${index} 缺少 material_id`);
      }
      if (typeof segment.start_time !== 'number') {
        throw new Error(`片段 ${index} 的 start_time 必須是數字`);
      }
      if (typeof segment.end_time !== 'number') {
        throw new Error(`片段 ${index} 的 end_time 必須是數字`);
      }
      if (segment.start_time >= segment.end_time) {
        throw new Error(`片段 ${index} 的 start_time 必須小於 end_time`);
      }
      if (typeof segment.order !== 'number') {
        throw new Error(`片段 ${index} 的 order 必須是數字`);
      }
    });

    // 按 order 排序片段
    timeline.video_segments.sort((a, b) => a.order - b.order);

    // 計算總時長
    const calculatedDuration = timeline.video_segments.reduce(
      (total, segment) => total + (segment.end_time - segment.start_time),
      0
    );

    // 如果沒有 total_duration,使用計算值
    if (!timeline.total_duration) {
      timeline.total_duration = calculatedDuration;
    }

    logger.info('時間軸解析成功', {
      segmentCount: timeline.video_segments.length,
      totalDuration: timeline.total_duration
    });

    return timeline;
  } catch (err) {
    logger.error('時間軸解析失敗', { error: err });
    throw err;
  }
}

/**
 * 取得片段持續時間
 */
export function getSegmentDuration(segment: VideoSegment): number {
  return segment.end_time - segment.start_time;
}

/**
 * 驗證時間軸的總時長是否與配音一致
 */
export function validateDuration(
  timeline: Timeline,
  voiceoverDuration: number,
  tolerance: number = 0.5  // 容許誤差 0.5 秒
): boolean {
  const diff = Math.abs(timeline.total_duration - voiceoverDuration);
  const isValid = diff <= tolerance;

  if (!isValid) {
    logger.warn('時間軸長度與配音長度不一致', {
      timelineDuration: timeline.total_duration,
      voiceoverDuration,
      diff
    });
  }

  return isValid;
}
```

---

### 步驟 2: 建立素材下載器

建立 `backend/src/engines/composition/material-downloader.ts`:

```typescript
/**
 * 素材下載器
 *
 * 為什麼需要這個?
 * - 從 GCS 下載素材到本地暫存
 * - 管理暫存檔案
 * - 提供清理功能
 */

import { Storage } from '@google-cloud/storage';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../../lib/logger';

const storage = new Storage();
const logger = new Logger('MaterialDownloader');

// 暫存目錄
const TEMP_DIR = process.env.TEMP_DIR || '/tmp/cheapcut';

/**
 * 初始化暫存目錄
 */
export async function initTempDir(): Promise<string> {
  const sessionDir = path.join(TEMP_DIR, `session_${Date.now()}`);
  await fs.mkdir(sessionDir, { recursive: true });
  logger.info('建立暫存目錄', { path: sessionDir });
  return sessionDir;
}

/**
 * 從 GCS URL 下載檔案
 *
 * @param gcsUrl - GCS URL (格式: gs://bucket/path/to/file)
 * @param localPath - 本地儲存路徑
 */
export async function downloadFromGCS(
  gcsUrl: string,
  localPath: string
): Promise<void> {
  logger.info('開始下載檔案', { gcsUrl, localPath });

  // 解析 GCS URL
  const match = gcsUrl.match(/^gs:\/\/([^\/]+)\/(.+)$/);
  if (!match) {
    throw new Error(`無效的 GCS URL: ${gcsUrl}`);
  }

  const bucketName = match[1];
  const filePath = match[2];

  // 下載檔案
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);

  await file.download({ destination: localPath });

  logger.info('檔案下載完成', { gcsUrl, localPath });
}

/**
 * 上傳檔案到 GCS
 *
 * @param localPath - 本地檔案路徑
 * @param gcsUrl - 目標 GCS URL
 */
export async function uploadToGCS(
  localPath: string,
  gcsUrl: string
): Promise<void> {
  logger.info('開始上傳檔案', { localPath, gcsUrl });

  // 解析 GCS URL
  const match = gcsUrl.match(/^gs:\/\/([^\/]+)\/(.+)$/);
  if (!match) {
    throw new Error(`無效的 GCS URL: ${gcsUrl}`);
  }

  const bucketName = match[1];
  const filePath = match[2];

  // 上傳檔案
  const bucket = storage.bucket(bucketName);
  await bucket.upload(localPath, {
    destination: filePath
  });

  logger.info('檔案上傳完成', { localPath, gcsUrl });
}

/**
 * 清理暫存目錄
 */
export async function cleanupTempDir(sessionDir: string): Promise<void> {
  try {
    await fs.rm(sessionDir, { recursive: true, force: true });
    logger.info('清理暫存目錄', { path: sessionDir });
  } catch (err) {
    logger.error('清理暫存目錄失敗', { error: err, path: sessionDir });
  }
}
```

---

### 步驟 3: 建立影片合成器

建立 `backend/src/engines/composition/video-composer.ts`:

```typescript
/**
 * 影片合成器
 *
 * 為什麼需要這個?
 * - 根據時間軸合成影片
 * - 剪輯片段並合併
 * - 疊加配音
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { Logger } from '../../lib/logger';
import { trimVideo, getVideoInfo } from '../../lib/ffmpeg-utils';
import { Timeline, VideoSegment } from './timeline-parser';
import { downloadFromGCS, uploadToGCS } from './material-downloader';
import { supabase } from '../../lib/supabase';
import ffmpeg from 'fluent-ffmpeg';

const logger = new Logger('VideoComposer');

/**
 * 合成影片
 *
 * @param timeline - 時間軸物件
 * @param sessionDir - 暫存目錄
 * @returns 輸出影片的 GCS URL
 */
export async function composeVideo(
  timeline: Timeline,
  sessionDir: string,
  jobId: string
): Promise<string> {
  logger.info('開始合成影片', { jobId, segmentCount: timeline.video_segments.length });

  // 步驟 1: 下載配音
  const voiceoverPath = path.join(sessionDir, 'voiceover.mp3');
  await downloadFromGCS(timeline.voiceover_url, voiceoverPath);

  // 步驟 2: 處理每個影片片段
  const trimmedSegments: string[] = [];

  for (let i = 0; i < timeline.video_segments.length; i++) {
    const segment = timeline.video_segments[i];
    logger.info('處理片段', { order: segment.order, segmentId: segment.segment_id });

    // 從資料庫取得素材資訊
    const { data: material } = await supabase
      .from('materials')
      .select('file_url')
      .eq('id', segment.material_id)
      .single();

    if (!material) {
      throw new Error(`找不到素材: ${segment.material_id}`);
    }

    // 下載素材
    const materialPath = path.join(sessionDir, `material_${i}.mp4`);
    await downloadFromGCS(material.file_url, materialPath);

    // 剪輯片段
    const trimmedPath = path.join(sessionDir, `trimmed_${i}.mp4`);
    const duration = segment.end_time - segment.start_time;

    await trimVideo(materialPath, trimmedPath, segment.start_time, duration);

    trimmedSegments.push(trimmedPath);
  }

  // 步驟 3: 合併所有片段
  const mergedPath = path.join(sessionDir, 'merged.mp4');
  await mergeVideoSegments(trimmedSegments, mergedPath);

  // 步驟 4: 疊加配音
  const finalPath = path.join(sessionDir, 'final.mp4');
  await overlayVoiceover(mergedPath, voiceoverPath, finalPath);

  // 步驟 5: 上傳到 GCS
  const outputUrl = `gs://${process.env.GCS_BUCKET}/outputs/${jobId}/final.mp4`;
  await uploadToGCS(finalPath, outputUrl);

  logger.info('影片合成完成', { jobId, outputUrl });

  return outputUrl;
}

/**
 * 合併影片片段
 */
async function mergeVideoSegments(
  segmentPaths: string[],
  outputPath: string
): Promise<void> {
  logger.info('開始合併片段', { count: segmentPaths.length });

  // 建立 concat 檔案列表
  const listPath = path.join(path.dirname(outputPath), 'filelist.txt');
  const listContent = segmentPaths
    .map(p => `file '${p}'`)
    .join('\n');

  await fs.writeFile(listPath, listContent);

  // 使用 FFmpeg concat demuxer 合併
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])  // 不重新編碼,速度快
      .output(outputPath)
      .on('start', (cmd) => {
        logger.debug('FFmpeg 指令', { command: cmd });
      })
      .on('progress', (progress) => {
        logger.debug('合併進度', { percent: progress.percent });
      })
      .on('end', () => {
        logger.info('片段合併完成', { outputPath });
        resolve();
      })
      .on('error', (err) => {
        logger.error('片段合併失敗', { error: err });
        reject(err);
      })
      .run();
  });
}

/**
 * 疊加配音
 */
async function overlayVoiceover(
  videoPath: string,
  voiceoverPath: string,
  outputPath: string
): Promise<void> {
  logger.info('開始疊加配音', { videoPath, voiceoverPath });

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(voiceoverPath)
      .outputOptions([
        '-map 0:v',        // 使用第一個輸入的視訊
        '-map 1:a',        // 使用第二個輸入的音訊 (配音)
        '-c:v copy',       // 視訊不重新編碼
        '-c:a aac',        // 音訊編碼為 AAC
        '-b:a 192k',       // 音訊位元率 192kbps
        '-shortest'        // 以最短的流為準
      ])
      .output(outputPath)
      .on('start', (cmd) => {
        logger.debug('FFmpeg 指令', { command: cmd });
      })
      .on('progress', (progress) => {
        logger.debug('配音疊加進度', { percent: progress.percent });
      })
      .on('end', () => {
        logger.info('配音疊加完成', { outputPath });
        resolve();
      })
      .on('error', (err) => {
        logger.error('配音疊加失敗', { error: err });
        reject(err);
      })
      .run();
  });
}
```

---

### 步驟 4: 建立合成服務 API

建立 `backend/src/routes/composition.ts`:

```typescript
/**
 * 影片合成 API
 */

import { Router } from 'express';
import { Logger } from '../lib/logger';
import { supabase } from '../lib/supabase';
import { parseTimeline } from '../engines/composition/timeline-parser';
import { composeVideo } from '../engines/composition/video-composer';
import { initTempDir, cleanupTempDir } from '../engines/composition/material-downloader';

const router = Router();
const logger = new Logger('CompositionAPI');

/**
 * POST /api/composition/start
 * 開始影片合成
 */
router.post('/start', async (req, res) => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: '缺少 job_id' });
    }

    logger.info('收到合成請求', { jobId: job_id });

    // 從資料庫取得工作資訊
    const { data: job, error } = await supabase
      .from('video_generation_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (error || !job) {
      return res.status(404).json({ error: '找不到工作' });
    }

    if (job.status !== 'timeline_generated') {
      return res.status(400).json({ error: '工作狀態不正確' });
    }

    // 更新狀態為處理中
    await supabase
      .from('video_generation_jobs')
      .update({ status: 'composing' })
      .eq('id', job_id);

    // 非同步處理 (避免 HTTP 超時)
    processComposition(job_id, job.timeline_json).catch((err) => {
      logger.error('合成失敗', { jobId: job_id, error: err });
    });

    res.json({
      success: true,
      message: '合成已開始',
      job_id
    });

  } catch (err) {
    logger.error('API 錯誤', { error: err });
    res.status(500).json({ error: '內部錯誤' });
  }
});

/**
 * 非同步處理合成
 */
async function processComposition(jobId: string, timelineJson: string) {
  let sessionDir: string | null = null;

  try {
    // 解析時間軸
    const timeline = parseTimeline(timelineJson);

    // 建立暫存目錄
    sessionDir = await initTempDir();

    // 合成影片
    const outputUrl = await composeVideo(timeline, sessionDir, jobId);

    // 更新工作狀態
    await supabase
      .from('video_generation_jobs')
      .update({
        status: 'completed',
        output_video_url: outputUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    logger.info('合成成功', { jobId, outputUrl });

  } catch (err) {
    logger.error('合成處理失敗', { jobId, error: err });

    // 更新工作狀態為失敗
    await supabase
      .from('video_generation_jobs')
      .update({
        status: 'failed',
        error: err instanceof Error ? err.message : '未知錯誤'
      })
      .eq('id', jobId);

  } finally {
    // 清理暫存目錄
    if (sessionDir) {
      await cleanupTempDir(sessionDir);
    }
  }
}

/**
 * GET /api/composition/status/:job_id
 * 查詢合成狀態
 */
router.get('/status/:job_id', async (req, res) => {
  try {
    const { job_id } = req.params;

    const { data: job, error } = await supabase
      .from('video_generation_jobs')
      .select('status, output_video_url, error, completed_at')
      .eq('id', job_id)
      .single();

    if (error || !job) {
      return res.status(404).json({ error: '找不到工作' });
    }

    res.json({
      success: true,
      job_id,
      status: job.status,
      output_video_url: job.output_video_url,
      error: job.error,
      completed_at: job.completed_at
    });

  } catch (err) {
    logger.error('API 錯誤', { error: err });
    res.status(500).json({ error: '內部錯誤' });
  }
});

export default router;
```

在 `backend/src/index.ts` 中註冊路由:

```typescript
import compositionRoutes from './routes/composition';

app.use('/api/composition', compositionRoutes);
```

---

### 步驟 5: 測試合成流程

建立測試腳本 `backend/src/scripts/test-composition.ts`:

```typescript
/**
 * 測試影片合成流程
 */

import { parseTimeline } from '../engines/composition/timeline-parser';
import { composeVideo } from '../engines/composition/video-composer';
import { initTempDir, cleanupTempDir } from '../engines/composition/material-downloader';

async function testComposition() {
  console.log('開始測試影片合成...');

  // 測試時間軸 JSON
  const testTimeline = {
    video_segments: [
      {
        segment_id: 'seg_001',
        material_id: 'your-material-id-1',
        start_time: 5.0,
        end_time: 10.0,
        order: 0
      },
      {
        segment_id: 'seg_002',
        material_id: 'your-material-id-2',
        start_time: 0.0,
        end_time: 5.0,
        order: 1
      }
    ],
    voiceover_url: 'gs://your-bucket/voiceover.mp3',
    total_duration: 10.0
  };

  let sessionDir: string | null = null;

  try {
    // 解析時間軸
    const timeline = parseTimeline(JSON.stringify(testTimeline));
    console.log('✓ 時間軸解析成功');

    // 建立暫存目錄
    sessionDir = await initTempDir();
    console.log('✓ 暫存目錄建立成功');

    // 合成影片
    const outputUrl = await composeVideo(timeline, sessionDir, 'test-job');
    console.log('✓ 影片合成成功:', outputUrl);

  } catch (err) {
    console.error('✗ 測試失敗:', err);
  } finally {
    // 清理
    if (sessionDir) {
      await cleanupTempDir(sessionDir);
      console.log('✓ 清理完成');
    }
  }
}

testComposition();
```

執行測試:
```bash
cd backend
npx ts-node src/scripts/test-composition.ts
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (4 tests): 時間軸解析與基礎功能
- 📁 **Functional Acceptance** (5 tests): 合成功能完整性
- 📁 **E2E Acceptance** (3 tests): 完整合成流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-2.12

# 或分別執行
npm test -- task-2.12.basic.test.ts
npm test -- task-2.12.functional.test.ts
npm test -- task-2.12.e2e.test.ts
```

### 通過標準

- ✅ 所有 12 個測試通過 (4 + 5 + 3)
- ✅ 可以成功解析時間軸 JSON
- ✅ 可以剪輯並合併影片片段
- ✅ 可以疊加配音
- ✅ 最終影片可以播放且音訊同步

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (4 tests)

測試檔案: `tests/phase-2/task-2.12.basic.test.ts`

1. ✓ 時間軸 JSON 解析正確
2. ✓ 時間軸驗證功能正常
3. ✓ 可以下載素材檔案
4. ✓ 可以上傳輸出檔案

### Functional Acceptance (5 tests)

測試檔案: `tests/phase-2/task-2.12.functional.test.ts`

1. ✓ 可以剪輯影片片段
2. ✓ 可以合併多個片段
3. ✓ 可以疊加配音
4. ✓ 音訊與影片同步正確
5. ✓ 輸出影片格式正確

### E2E Acceptance (3 tests)

測試檔案: `tests/phase-2/task-2.12.e2e.test.ts`

1. ✓ 完整合成流程成功執行
2. ✓ API 端點正常運作
3. ✓ 工作狀態正確更新

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 核心功能
- [ ] `timeline-parser.ts` 已建立
- [ ] `material-downloader.ts` 已建立
- [ ] `video-composer.ts` 已建立
- [ ] 合成 API 路由已建立

### 功能實作
- [ ] 時間軸解析功能
- [ ] 素材下載功能
- [ ] 影片剪輯功能
- [ ] 片段合併功能
- [ ] 配音疊加功能
- [ ] 暫存目錄管理

### API 端點
- [ ] `POST /api/composition/start` 已實作
- [ ] `GET /api/composition/status/:job_id` 已實作
- [ ] 非同步處理機制已實作

### 測試
- [ ] 單元測試已建立
- [ ] 測試腳本可以執行
- [ ] 本地測試通過

### 驗收測試
- [ ] Basic Verification 測試通過 (4/4)
- [ ] Functional Acceptance 測試通過 (5/5)
- [ ] E2E Acceptance 測試通過 (3/3)
- [ ] **總計: 12/12 測試通過**

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `Invalid time format` | 時間軸 JSON 格式錯誤 | 檢查 JSON 欄位格式 |
| `File not found` | 素材檔案不存在 | 檢查 GCS URL 是否正確 |
| `Audio out of sync` | 音訊同步問題 | 檢查時間軸總長度 |
| `Codec not supported` | 編碼器不支援 | 使用標準的 H.264/AAC |
| `Concat failed` | 合併失敗 | 檢查片段格式是否一致 |

---

### 問題 1: 音訊與影片不同步

**問題**: 合成後的影片,配音與畫面對不上

**可能原因**:
1. 時間軸總長度與配音長度不一致
2. 影片片段時間計算錯誤
3. FFmpeg 參數設定錯誤

**解決方案**:

```typescript
// 1. 在合成前驗證長度
import { getVideoInfo } from '../../lib/ffmpeg-utils';

const voiceoverInfo = await getVideoInfo(voiceoverPath);
const voiceoverDuration = voiceoverInfo.format.duration;

const isValid = validateDuration(timeline, voiceoverDuration);
if (!isValid) {
  throw new Error('時間軸長度與配音長度不一致');
}

// 2. 確保使用 -shortest 參數
ffmpeg()
  .input(videoPath)
  .input(voiceoverPath)
  .outputOptions(['-shortest'])  // 重要!
  .output(outputPath)
  .run();
```

---

### 問題 2: 合併片段失敗

**錯誤訊息:**
```
[concat @ 0x...] Impossible to open 'trimmed_0.mp4'
```

**可能原因**: 檔案路徑包含特殊字元或空格

**解決方案**:

```typescript
// 使用絕對路徑
const absolutePath = path.resolve(trimmedPath);

// 或在 filelist.txt 中使用引號
const listContent = segmentPaths
  .map(p => `file '${path.resolve(p)}'`)
  .join('\n');
```

---

### 問題 3: 記憶體不足

**錯誤訊息:**
```
Error: Cannot allocate memory
```

**解決方案**:

1. **逐段處理,不要一次全部載入**:
```typescript
// ✅ 好: 逐段處理
for (const segment of timeline.video_segments) {
  await processSegment(segment);
  // 處理完立即清理
}

// ❌ 不好: 全部載入
const allSegments = await Promise.all(
  timeline.video_segments.map(s => processSegment(s))
);
```

2. **增加 Cloud Run 記憶體**:
```bash
gcloud run deploy cheapcut-backend --memory 4Gi
```

---

### 問題 4: 影片格式不一致導致合併失敗

**錯誤訊息:**
```
[concat @ 0x...] Packet mismatch
```

**原因**: 不同素材的編碼、解析度、幀率不一致

**解決方案**:

統一格式後再合併:

```typescript
/**
 * 標準化影片格式
 */
async function normalizeVideo(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .size('1920x1080')      // 統一解析度
      .fps(30)                 // 統一幀率
      .videoBitrate('2000k')
      .audioBitrate('128k')
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

// 在合併前先標準化
for (let i = 0; i < trimmedSegments.length; i++) {
  const normalized = path.join(sessionDir, `normalized_${i}.mp4`);
  await normalizeVideo(trimmedSegments[i], normalized);
  trimmedSegments[i] = normalized;
}
```

---

### 問題 5: 暫存目錄空間不足

**錯誤訊息:**
```
Error: ENOSPC: no space left on device
```

**解決方案**:

1. **及時清理暫存檔案**:
```typescript
// 處理完每個片段後立即刪除原始檔案
await fs.unlink(materialPath);
```

2. **使用 Cloud Storage 作為暫存空間** (進階):
```typescript
// 不下載到本地,直接在 GCS 中處理
// 使用 FFmpeg 的 HTTP 輸入支援
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **FFmpeg Concat**: https://trac.ffmpeg.org/wiki/Concatenate
- **FFmpeg 音訊處理**: https://trac.ffmpeg.org/wiki/AudioChannelManipulation
- **影片編碼最佳實踐**: https://trac.ffmpeg.org/wiki/Encode/H.264
- **fluent-ffmpeg 文件**: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (12/12)
3. ✅ 完成檢查清單都勾選
4. ✅ 可以成功合成測試影片
5. ✅ 音訊與影片同步正確

### 最終驗收指令

```bash
# 進入 backend 目錄
cd backend

# 執行驗收測試
npm run verify:task task-2.12

# 執行測試腳本
npx ts-node src/scripts/test-composition.ts

# 如果全部通過,你應該看到:
# ✓ Basic Verification: 4/4 passed
# ✓ Functional Acceptance: 5/5 passed
# ✓ E2E Acceptance: 3/3 passed
# ✓ 時間軸解析成功
# ✓ 影片合成成功
# ✓ 輸出影片可播放
```

**恭喜!** 如果看到上面的輸出,代表 Task 2.12 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 合成效能數據 (處理時間、檔案大小)
- 遇到的主要問題與解決方法
- 不同素材格式的處理經驗
- 下次可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: Task 2.13 - 字幕疊加

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
