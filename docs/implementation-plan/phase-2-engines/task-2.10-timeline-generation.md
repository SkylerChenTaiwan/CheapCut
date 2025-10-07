# Task 2.10: 時間軸生成

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.10 |
| **Task 名稱** | 時間軸生成 |
| **所屬 Phase** | Phase 2: 核心引擎開發 |
| **預估時間** | 2-3 小時 (格式設計 1h + 實作 1h + 測試 1h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 2.9 (AI 選片決策) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的時間軸生成問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Timeline validation failed
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 時間軸格式驗證失敗
   ```

2. **判斷錯誤類型**
   - `Timeline validation failed` → 時間軸格式不正確
   - `Overlapping segments` → 片段時間重疊
   - `Invalid duration` → 時長計算錯誤
   - `Missing segment data` → 片段資料缺失

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"時間軸錯誤"  ← 太模糊
"JSON 格式問題" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"video editing timeline JSON format"  ← 影片編輯時間軸格式
"FFmpeg concat protocol JSON" ← FFmpeg 串接協議
"video timeline data structure" ← 時間軸資料結構
```

#### 🌐 推薦資源

**優先順序 1: 影片編輯規範**
- EDL Format: https://en.wikipedia.org/wiki/Edit_decision_list
- FFmpeg Concat: https://ffmpeg.org/ffmpeg-formats.html#concat

**優先順序 2: JSON Schema**
- JSON Schema: https://json-schema.org/

---

### Step 3: 檢查資料完整性

```sql
-- 檢查選擇結果
SELECT COUNT(*) FROM segment_selections;

-- 檢查片段資料完整性
SELECT
  ss.id,
  vs.text as voiceover_text,
  s.subtitle_text as video_text,
  s.start_time,
  s.end_time
FROM segment_selections ss
JOIN voiceover_segments vs ON ss.voiceover_segment_id = vs.id
JOIN segments s ON ss.video_segment_id = s.id
LIMIT 10;
```

---

## 🎯 功能描述

根據 AI 選片決策結果,產生完整的影片編輯時間軸 JSON,包含所有配音片段、影片片段、時間資訊和轉場效果,作為最終影片合成的藍圖。

### 為什麼需要這個?

- 🎯 **問題**: 有了選片結果,如何組織成可以實際編輯的時間軸?
- ✅ **解決**: 產生標準化的時間軸 JSON,包含所有編輯所需資訊
- 💡 **比喻**: 就像建築藍圖,詳細標註每個片段的位置、時長和銜接方式

### 完成後你會有:

- ✅ 標準化的時間軸 JSON 格式
- ✅ 完整的片段時間計算
- ✅ 配音和影片的對應關係
- ✅ 轉場效果設定
- ✅ 時間軸驗證機制
- ✅ 支援匯出和儲存

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. 影片編輯時間軸概念

**是什麼**: 影片編輯的時間線,標記每個素材的播放時間和順序

**核心概念**:
```typescript
// 時間軸的基本結構
interface Timeline {
  // 總時長
  totalDuration: number;

  // 所有軌道
  tracks: Track[];
}

interface Track {
  type: 'video' | 'audio';
  segments: Segment[];
}

interface Segment {
  id: string;
  startTime: number;  // 在時間軸上的開始時間
  duration: number;   // 持續時間
  sourceFile: string; // 來源檔案
  sourceStart: number; // 在來源檔案中的開始位置
  sourceEnd: number;   // 在來源檔案中的結束位置
}
```

**為什麼重要**:
- 讓 FFmpeg 知道如何組合影片
- 提供給前端預覽使用
- 記錄完整的編輯資訊

### 2. 時間計算邏輯

**累積時間計算**:
```typescript
// 範例: 計算片段在時間軸上的位置
let currentTime = 0;

for (const segment of segments) {
  segment.timelineStart = currentTime;
  segment.timelineDuration = segment.sourceEnd - segment.sourceStart;
  segment.timelineEnd = currentTime + segment.timelineDuration;

  currentTime = segment.timelineEnd;
}

// 總時長
const totalDuration = currentTime;
```

**時間對齊**:
```typescript
// 配音和影片需要時間對齊
interface AlignedSegment {
  voiceover: {
    startTime: number;
    endTime: number;
    duration: number;
  };
  video: {
    startTime: number;
    endTime: number;
    duration: number;
  };
  // 如果配音比影片長,影片需要循環或延長
  // 如果影片比配音長,影片需要裁剪
  strategy: 'loop' | 'trim' | 'exact';
}
```

### 3. JSON 資料格式設計

**時間軸 JSON 結構**:
```typescript
interface TimelineJSON {
  version: string;
  metadata: {
    createdAt: string;
    userId: string;
    totalDuration: number;
    segmentCount: number;
  };
  tracks: {
    video: VideoTrack;
    audio: AudioTrack;
  };
  transitions: Transition[];
  export: ExportSettings;
}

interface VideoTrack {
  segments: VideoSegment[];
}

interface VideoSegment {
  id: string;
  order: number;
  timelineStart: number;
  timelineDuration: number;
  source: {
    materialId: string;
    segmentId: string;
    fileUrl: string;
    sourceStart: number;
    sourceEnd: number;
  };
  transform: {
    crop?: CropSettings;
    scale?: ScaleSettings;
  };
}

interface AudioTrack {
  segments: AudioSegment[];
}

interface AudioSegment {
  id: string;
  order: number;
  timelineStart: number;
  timelineDuration: number;
  source: {
    voiceoverSegmentId: string;
    fileUrl: string;
  };
  volume: number;
}

interface Transition {
  type: 'crossfade' | 'cut';
  position: number;
  duration: number;
}

interface ExportSettings {
  resolution: string;
  fps: number;
  codec: string;
}
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.9: AI 選片決策 (有選片結果)
- ✅ Task 2.7: 配音切分 (有配音片段)
- ✅ Task 2.4: 片段切分 (有影片片段)

### 套件依賴
```json
{
  "dependencies": {
    "ajv": "^8.12.0"
  },
  "devDependencies": {
    "@types/ajv": "^1.0.0"
  }
}
```

---

## 📝 實作步驟

### 步驟 1: 設計時間軸 JSON Schema

建立 `backend/src/schemas/timeline.schema.ts`:

```typescript
/**
 * 時間軸 JSON Schema
 *
 * 定義時間軸的標準格式
 */

export const TimelineSchema = {
  type: 'object',
  required: ['version', 'metadata', 'tracks'],
  properties: {
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+$',
      description: '時間軸格式版本'
    },
    metadata: {
      type: 'object',
      required: ['createdAt', 'userId', 'totalDuration', 'segmentCount'],
      properties: {
        createdAt: { type: 'string', format: 'date-time' },
        userId: { type: 'string', format: 'uuid' },
        totalDuration: { type: 'number', minimum: 0 },
        segmentCount: { type: 'integer', minimum: 0 },
      }
    },
    tracks: {
      type: 'object',
      required: ['video', 'audio'],
      properties: {
        video: {
          type: 'object',
          required: ['segments'],
          properties: {
            segments: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'order', 'timelineStart', 'timelineDuration', 'source'],
                properties: {
                  id: { type: 'string' },
                  order: { type: 'integer', minimum: 0 },
                  timelineStart: { type: 'number', minimum: 0 },
                  timelineDuration: { type: 'number', minimum: 0 },
                  source: {
                    type: 'object',
                    required: ['materialId', 'segmentId', 'fileUrl', 'sourceStart', 'sourceEnd'],
                    properties: {
                      materialId: { type: 'string' },
                      segmentId: { type: 'string' },
                      fileUrl: { type: 'string', format: 'uri' },
                      sourceStart: { type: 'number', minimum: 0 },
                      sourceEnd: { type: 'number', minimum: 0 },
                      thumbnailUrl: { type: 'string', format: 'uri' },
                    }
                  },
                  transform: {
                    type: 'object',
                    properties: {
                      crop: {
                        type: 'object',
                        properties: {
                          x: { type: 'number' },
                          y: { type: 'number' },
                          width: { type: 'number' },
                          height: { type: 'number' },
                        }
                      },
                      scale: {
                        type: 'object',
                        properties: {
                          width: { type: 'integer' },
                          height: { type: 'integer' },
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        audio: {
          type: 'object',
          required: ['segments'],
          properties: {
            segments: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'order', 'timelineStart', 'timelineDuration', 'source'],
                properties: {
                  id: { type: 'string' },
                  order: { type: 'integer', minimum: 0 },
                  timelineStart: { type: 'number', minimum: 0 },
                  timelineDuration: { type: 'number', minimum: 0 },
                  source: {
                    type: 'object',
                    required: ['voiceoverSegmentId', 'fileUrl'],
                    properties: {
                      voiceoverSegmentId: { type: 'string' },
                      fileUrl: { type: 'string', format: 'uri' },
                      text: { type: 'string' },
                    }
                  },
                  volume: { type: 'number', minimum: 0, maximum: 2 },
                  fadeIn: { type: 'number', minimum: 0 },
                  fadeOut: { type: 'number', minimum: 0 },
                }
              }
            }
          }
        }
      }
    },
    transitions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'position', 'duration'],
        properties: {
          type: { type: 'string', enum: ['crossfade', 'cut', 'fade'] },
          position: { type: 'number', minimum: 0 },
          duration: { type: 'number', minimum: 0 },
        }
      }
    },
    export: {
      type: 'object',
      properties: {
        resolution: { type: 'string', pattern: '^\\d+x\\d+$' },
        fps: { type: 'integer', minimum: 1, maximum: 120 },
        codec: { type: 'string' },
        bitrate: { type: 'string' },
      }
    }
  }
};

/**
 * TypeScript 型別定義
 */
export interface Timeline {
  version: string;
  metadata: TimelineMetadata;
  tracks: TimelineTracks;
  transitions?: TimelineTransition[];
  export?: ExportSettings;
}

export interface TimelineMetadata {
  createdAt: string;
  userId: string;
  totalDuration: number;
  segmentCount: number;
}

export interface TimelineTracks {
  video: VideoTrack;
  audio: AudioTrack;
}

export interface VideoTrack {
  segments: VideoSegment[];
}

export interface VideoSegment {
  id: string;
  order: number;
  timelineStart: number;
  timelineDuration: number;
  source: VideoSource;
  transform?: VideoTransform;
}

export interface VideoSource {
  materialId: string;
  segmentId: string;
  fileUrl: string;
  sourceStart: number;
  sourceEnd: number;
  thumbnailUrl?: string;
}

export interface VideoTransform {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scale?: {
    width: number;
    height: number;
  };
}

export interface AudioTrack {
  segments: AudioSegment[];
}

export interface AudioSegment {
  id: string;
  order: number;
  timelineStart: number;
  timelineDuration: number;
  source: AudioSource;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface AudioSource {
  voiceoverSegmentId: string;
  fileUrl: string;
  text?: string;
}

export interface TimelineTransition {
  type: 'crossfade' | 'cut' | 'fade';
  position: number;
  duration: number;
}

export interface ExportSettings {
  resolution?: string;
  fps?: number;
  codec?: string;
  bitrate?: string;
}
```

---

### 步驟 2: 建立時間軸生成服務

建立 `backend/src/services/timeline-generator.service.ts`:

```typescript
/**
 * 時間軸生成服務
 *
 * 根據選片結果產生完整的編輯時間軸
 */

import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { Timeline, VideoSegment, AudioSegment } from '../schemas/timeline.schema';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { TimelineSchema } from '../schemas/timeline.schema';

export class TimelineGeneratorService {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv();
    addFormats(this.ajv);
  }

  /**
   * 為配音生成時間軸
   *
   * @param voiceoverSegmentIds - 配音片段 ID 列表
   * @param userId - 使用者 ID
   * @returns 時間軸 JSON
   */
  async generateTimeline(
    voiceoverSegmentIds: string[],
    userId: string
  ): Promise<Timeline> {
    logger.info('Starting timeline generation', {
      voiceoverSegmentCount: voiceoverSegmentIds.length,
      userId,
    });

    try {
      // 1. 取得所有配音片段和對應的選擇結果
      const timelineData = await this.fetchTimelineData(
        voiceoverSegmentIds,
        userId
      );

      // 2. 建立影片軌道
      const videoTrack = this.buildVideoTrack(timelineData);

      // 3. 建立音訊軌道
      const audioTrack = this.buildAudioTrack(timelineData);

      // 4. 計算總時長
      const totalDuration = this.calculateTotalDuration(audioTrack);

      // 5. 產生轉場效果
      const transitions = this.generateTransitions(videoTrack);

      // 6. 組裝時間軸
      const timeline: Timeline = {
        version: '1.0',
        metadata: {
          createdAt: new Date().toISOString(),
          userId,
          totalDuration,
          segmentCount: videoTrack.segments.length,
        },
        tracks: {
          video: videoTrack,
          audio: audioTrack,
        },
        transitions,
        export: {
          resolution: '1920x1080',
          fps: 30,
          codec: 'h264',
          bitrate: '5000k',
        },
      };

      // 7. 驗證時間軸
      this.validateTimeline(timeline);

      logger.info('Timeline generation completed', {
        totalDuration,
        videoSegments: videoTrack.segments.length,
        audioSegments: audioTrack.segments.length,
      });

      return timeline;

    } catch (error) {
      logger.error('Timeline generation failed', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * 取得時間軸所需的所有資料
   */
  private async fetchTimelineData(
    voiceoverSegmentIds: string[],
    userId: string
  ): Promise<TimelineData[]> {
    const timelineData: TimelineData[] = [];

    for (const voiceoverSegmentId of voiceoverSegmentIds) {
      // 取得配音片段
      const { data: voiceoverSegment, error: voiceoverError } = await supabase
        .from('voiceover_segments')
        .select('*')
        .eq('id', voiceoverSegmentId)
        .single();

      if (voiceoverError || !voiceoverSegment) {
        logger.warn('Voiceover segment not found', { voiceoverSegmentId });
        continue;
      }

      // 取得對應的選擇結果
      const { data: selections, error: selectionsError } = await supabase
        .from('segment_selections')
        .select(`
          *,
          video_segment:segments(*)
        `)
        .eq('voiceover_segment_id', voiceoverSegmentId)
        .eq('user_id', userId)
        .order('rank', { ascending: true })
        .limit(1); // 只取第一名

      if (selectionsError || !selections || selections.length === 0) {
        logger.warn('No selection found for voiceover segment', {
          voiceoverSegmentId,
        });
        continue;
      }

      timelineData.push({
        voiceoverSegment,
        selection: selections[0],
        videoSegment: selections[0].video_segment,
      });
    }

    return timelineData;
  }

  /**
   * 建立影片軌道
   */
  private buildVideoTrack(timelineData: TimelineData[]): any {
    let currentTime = 0;
    const segments: VideoSegment[] = [];

    for (let i = 0; i < timelineData.length; i++) {
      const data = timelineData[i];
      const videoSeg = data.videoSegment;

      // 計算來源片段的時長
      const sourceDuration = videoSeg.end_time - videoSeg.start_time;

      // 配音片段的時長
      const voiceoverDuration = data.voiceoverSegment.duration;

      // 使用配音時長作為時間軸時長
      const timelineDuration = voiceoverDuration;

      const segment: VideoSegment = {
        id: `video-${i}`,
        order: i,
        timelineStart: currentTime,
        timelineDuration,
        source: {
          materialId: videoSeg.material_id,
          segmentId: videoSeg.id,
          fileUrl: videoSeg.video_url || '',
          sourceStart: videoSeg.start_time,
          sourceEnd: videoSeg.end_time,
          thumbnailUrl: videoSeg.thumbnail_url,
        },
        transform: {
          scale: {
            width: 1920,
            height: 1080,
          }
        },
      };

      segments.push(segment);
      currentTime += timelineDuration;
    }

    return {
      segments,
    };
  }

  /**
   * 建立音訊軌道
   */
  private buildAudioTrack(timelineData: TimelineData[]): any {
    let currentTime = 0;
    const segments: AudioSegment[] = [];

    for (let i = 0; i < timelineData.length; i++) {
      const data = timelineData[i];
      const voiceoverSeg = data.voiceoverSegment;

      const segment: AudioSegment = {
        id: `audio-${i}`,
        order: i,
        timelineStart: currentTime,
        timelineDuration: voiceoverSeg.duration,
        source: {
          voiceoverSegmentId: voiceoverSeg.id,
          fileUrl: voiceoverSeg.segment_audio_url || '',
          text: voiceoverSeg.text,
        },
        volume: 1.0,
      };

      segments.push(segment);
      currentTime += voiceoverSeg.duration;
    }

    return {
      segments,
    };
  }

  /**
   * 計算總時長
   */
  private calculateTotalDuration(audioTrack: any): number {
    if (audioTrack.segments.length === 0) {
      return 0;
    }

    const lastSegment = audioTrack.segments[audioTrack.segments.length - 1];
    return lastSegment.timelineStart + lastSegment.timelineDuration;
  }

  /**
   * 產生轉場效果
   */
  private generateTransitions(videoTrack: any): any[] {
    const transitions = [];

    for (let i = 0; i < videoTrack.segments.length - 1; i++) {
      const currentSegment = videoTrack.segments[i];
      const nextSegment = videoTrack.segments[i + 1];

      // 在片段交接處加入轉場
      transitions.push({
        type: 'crossfade',
        position: currentSegment.timelineStart + currentSegment.timelineDuration,
        duration: 0.3, // 0.3 秒的交叉淡化
      });
    }

    return transitions;
  }

  /**
   * 驗證時間軸格式
   */
  private validateTimeline(timeline: Timeline): void {
    const validate = this.ajv.compile(TimelineSchema);
    const valid = validate(timeline);

    if (!valid) {
      logger.error('Timeline validation failed', {
        errors: validate.errors,
      });
      throw new Error(`Timeline validation failed: ${JSON.stringify(validate.errors)}`);
    }

    // 額外的邏輯驗證
    this.validateTimelineLogic(timeline);
  }

  /**
   * 驗證時間軸邏輯
   */
  private validateTimelineLogic(timeline: Timeline): void {
    // 檢查片段不重疊
    const videoSegments = timeline.tracks.video.segments;
    for (let i = 0; i < videoSegments.length - 1; i++) {
      const current = videoSegments[i];
      const next = videoSegments[i + 1];

      const currentEnd = current.timelineStart + current.timelineDuration;
      if (currentEnd > next.timelineStart) {
        throw new Error(`Video segments overlap at index ${i}`);
      }
    }

    // 檢查音訊和影片軌道長度一致
    const videoDuration = this.calculateTotalDuration(timeline.tracks.video);
    const audioDuration = this.calculateTotalDuration(timeline.tracks.audio);

    if (Math.abs(videoDuration - audioDuration) > 0.1) {
      logger.warn('Video and audio tracks duration mismatch', {
        videoDuration,
        audioDuration,
      });
    }
  }

  /**
   * 儲存時間軸到資料庫
   */
  async saveTimeline(
    timeline: Timeline,
    userId: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from('timelines')
      .insert({
        user_id: userId,
        timeline_json: timeline,
        total_duration: timeline.metadata.totalDuration,
        segment_count: timeline.metadata.segmentCount,
        created_at: timeline.metadata.createdAt,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save timeline: ${error.message}`);
    }

    logger.info('Timeline saved to database', {
      timelineId: data.id,
    });

    return data.id;
  }
}

/**
 * 時間軸資料
 */
interface TimelineData {
  voiceoverSegment: any;
  selection: any;
  videoSegment: any;
}
```

---

### 步驟 3: 建立資料庫 Schema

在 Supabase SQL Editor 執行:

```sql
-- 建立時間軸表
CREATE TABLE IF NOT EXISTS timelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 時間軸 JSON
  timeline_json JSONB NOT NULL,

  -- 摘要資訊
  total_duration FLOAT NOT NULL,
  segment_count INTEGER NOT NULL,

  -- 狀態
  status TEXT DEFAULT 'draft', -- draft, rendering, completed, failed

  -- 輸出
  output_video_url TEXT,

  -- 時間戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- 索引
  CONSTRAINT valid_status CHECK (status IN ('draft', 'rendering', 'completed', 'failed'))
);

-- 建立索引
CREATE INDEX idx_timelines_user ON timelines(user_id);
CREATE INDEX idx_timelines_status ON timelines(status);
CREATE INDEX idx_timelines_created ON timelines(created_at);

-- RLS 政策
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own timelines"
  ON timelines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timelines"
  ON timelines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timelines"
  ON timelines FOR UPDATE
  USING (auth.uid() = user_id);
```

---

### 步驟 4: 建立 API 端點

在 `backend/src/routes/timeline.ts` 建立端點:

```typescript
import { Router } from 'express';
import { TimelineGeneratorService } from '../services/timeline-generator.service';
import { authenticate } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
const generator = new TimelineGeneratorService();

/**
 * POST /api/timeline/generate
 *
 * 產生時間軸
 */
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { voiceoverSegmentIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(voiceoverSegmentIds) || voiceoverSegmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'voiceoverSegmentIds must be a non-empty array',
      });
    }

    // 產生時間軸
    const timeline = await generator.generateTimeline(
      voiceoverSegmentIds,
      userId
    );

    // 儲存時間軸
    const timelineId = await generator.saveTimeline(timeline, userId);

    res.json({
      success: true,
      data: {
        timelineId,
        timeline,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/timeline/:id
 *
 * 取得時間軸
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('timelines')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Timeline not found',
      });
    }

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/timeline/user/list
 *
 * 取得使用者的所有時間軸
 */
router.get('/user/list', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .from('timelines')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        timelines: data,
        total: count,
        limit: Number(limit),
        offset: Number(offset),
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/timeline/:id/status
 *
 * 更新時間軸狀態
 */
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, outputVideoUrl } = req.body;
    const userId = req.user.id;

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (outputVideoUrl) {
      updateData.output_video_url = outputVideoUrl;
    }

    const { data, error } = await supabase
      .from('timelines')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
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
import timelineRoutes from './routes/timeline';

// ...

app.use('/api/timeline', timelineRoutes);
```

---

### 步驟 6: 測試時間軸生成

```bash
# 啟動開發伺服器
npm run dev

# 測試產生時間軸
curl -X POST http://localhost:8080/api/timeline/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "voiceoverSegmentIds": [
      "segment-id-1",
      "segment-id-2",
      "segment-id-3"
    ]
  }'
```

**預期結果**:
```json
{
  "success": true,
  "data": {
    "timelineId": "timeline-uuid",
    "timeline": {
      "version": "1.0",
      "metadata": {
        "createdAt": "2025-10-07T...",
        "userId": "user-uuid",
        "totalDuration": 45.5,
        "segmentCount": 3
      },
      "tracks": {
        "video": {
          "segments": [...]
        },
        "audio": {
          "segments": [...]
        }
      },
      "transitions": [...],
      "export": {
        "resolution": "1920x1080",
        "fps": 30,
        "codec": "h264",
        "bitrate": "5000k"
      }
    }
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
npm run verify:task task-2.10

# 或分別執行
npm test -- tests/phase-2/task-2.10.basic.test.ts
npm test -- tests/phase-2/task-2.10.functional.test.ts
npm test -- tests/phase-2/task-2.10.e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ 時間軸 JSON 格式正確
- ✅ 時間計算準確
- ✅ 驗證機制正常

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/phase-2/task-2.10.basic.test.ts`

1. ✓ 資料庫表已建立
2. ✓ JSON Schema 定義正確
3. ✓ 可以產生基本時間軸
4. ✓ 時間軸格式驗證通過
5. ✓ 可以儲存時間軸

### Functional Acceptance (6 tests)

測試檔案: `tests/phase-2/task-2.10.functional.test.ts`

1. ✓ 時間計算正確
2. ✓ 片段順序正確
3. ✓ 音視訊對齊正確
4. ✓ 轉場效果生成正確
5. ✓ 時間軸驗證正確
6. ✓ 可以查詢時間軸

### E2E Acceptance (3 tests)

測試檔案: `tests/phase-2/task-2.10.e2e.test.ts`

1. ✓ 完整時間軸生成流程成功
2. ✓ 多片段時間軸正確
3. ✓ 錯誤處理正確

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### Schema 設計
- [ ] JSON Schema 已定義
- [ ] TypeScript 型別已定義
- [ ] Schema 驗證器已設定

### 核心實作
- [ ] `TimelineGeneratorService` 已建立
- [ ] 時間計算邏輯已實作
- [ ] 時間軸驗證已實作
- [ ] API 端點已建立
- [ ] 路由已註冊

### 資料庫
- [ ] `timelines` 表已建立
- [ ] 索引已建立
- [ ] RLS 政策已設定
- [ ] 時間軸可以正確儲存

### 功能驗證
- [ ] 可以產生時間軸
- [ ] 時間計算正確
- [ ] 格式驗證正確
- [ ] 可以儲存和查詢

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

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `Timeline validation failed` | JSON 格式不符 Schema | 檢查 Schema 定義 |
| `Overlapping segments` | 時間計算錯誤 | 檢查時間累加邏輯 |
| `Invalid duration` | 片段時長為負或零 | 檢查來源資料 |
| `Missing segment data` | 資料不完整 | 檢查資料庫查詢 |

---

### 問題 1: 時間軸驗證失敗

**錯誤訊息:**
```
Error: Timeline validation failed: [...]
```

**解決方案:**

檢查 JSON 格式是否符合 Schema:

```typescript
// 使用更詳細的錯誤訊息
if (!valid) {
  const errors = validate.errors.map(err => ({
    path: err.instancePath,
    message: err.message,
    params: err.params,
  }));

  logger.error('Timeline validation details', { errors });
  throw new Error(`Timeline validation failed: ${JSON.stringify(errors, null, 2)}`);
}
```

---

### 問題 2: 片段時間重疊

**問題**: 影片片段在時間軸上重疊

**解決方案:**

檢查時間累加邏輯:

```typescript
private buildVideoTrack(timelineData: TimelineData[]): any {
  let currentTime = 0;
  const segments: VideoSegment[] = [];

  for (let i = 0; i < timelineData.length; i++) {
    const data = timelineData[i];

    // 記錄開始時間
    logger.debug('Adding segment to timeline', {
      order: i,
      currentTime,
      duration: data.voiceoverSegment.duration,
    });

    const segment: VideoSegment = {
      id: `video-${i}`,
      order: i,
      timelineStart: currentTime, // 使用當前累積時間
      timelineDuration: data.voiceoverSegment.duration,
      // ...
    };

    segments.push(segment);

    // 更新累積時間
    currentTime += data.voiceoverSegment.duration;
  }

  return { segments };
}
```

---

### 問題 3: 音視訊不同步

**問題**: 音訊和影片時長不一致

**解決方案:**

1. **記錄差異**:
```typescript
const videoDuration = this.calculateTotalDuration(timeline.tracks.video);
const audioDuration = this.calculateTotalDuration(timeline.tracks.audio);
const diff = Math.abs(videoDuration - audioDuration);

logger.warn('Duration mismatch', {
  videoDuration,
  audioDuration,
  difference: diff,
  threshold: 0.1,
});
```

2. **調整策略**:
```typescript
// 如果影片比音訊短,循環影片
if (videoDuration < audioDuration) {
  // 實作影片循環邏輯
}

// 如果影片比音訊長,裁剪影片
if (videoDuration > audioDuration) {
  const lastSegment = videoTrack.segments[videoTrack.segments.length - 1];
  lastSegment.timelineDuration = audioDuration - lastSegment.timelineStart;
}
```

---

### 問題 4: 資料庫查詢失敗

**問題**: 無法取得片段資料

**解決方案:**

增加錯誤處理和重試機制:

```typescript
private async fetchTimelineData(
  voiceoverSegmentIds: string[],
  userId: string
): Promise<TimelineData[]> {
  const timelineData: TimelineData[] = [];
  const errors: string[] = [];

  for (const voiceoverSegmentId of voiceoverSegmentIds) {
    try {
      // 取得配音片段
      const { data: voiceoverSegment, error: voiceoverError } = await supabase
        .from('voiceover_segments')
        .select('*')
        .eq('id', voiceoverSegmentId)
        .single();

      if (voiceoverError) {
        errors.push(`Voiceover ${voiceoverSegmentId}: ${voiceoverError.message}`);
        continue;
      }

      // 取得選擇結果
      // ...

    } catch (error) {
      errors.push(`${voiceoverSegmentId}: ${error.message}`);
    }
  }

  if (timelineData.length === 0) {
    throw new Error(`No timeline data found. Errors: ${errors.join(', ')}`);
  }

  if (errors.length > 0) {
    logger.warn('Some segments failed to load', { errors });
  }

  return timelineData;
}
```

---

### 問題 5: JSON 檔案太大

**問題**: 時間軸 JSON 超過資料庫欄位限制

**解決方案:**

1. **壓縮 JSON**:
```typescript
// 儲存前壓縮
const compressedTimeline = JSON.stringify(timeline);

// 檢查大小
const sizeInMB = Buffer.byteLength(compressedTimeline, 'utf8') / (1024 * 1024);
if (sizeInMB > 10) {
  logger.warn('Timeline JSON is large', { sizeInMB });
}
```

2. **拆分儲存**:
```sql
-- 將大型欄位分開儲存
CREATE TABLE timeline_segments (
  id UUID PRIMARY KEY,
  timeline_id UUID REFERENCES timelines(id),
  track_type TEXT,
  segment_data JSONB
);
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **EDL Format**: https://en.wikipedia.org/wiki/Edit_decision_list
- **FFmpeg Concat Protocol**: https://ffmpeg.org/ffmpeg-formats.html#concat
- **JSON Schema**: https://json-schema.org/
- **Video Editing Concepts**: https://www.videomaker.com/article/c10/18615-video-editing-the-timeline

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 可以成功產生和驗證時間軸

### 最終驗收指令

```bash
# 進入 backend 目錄
cd backend

# 執行驗收測試
npm run verify:task task-2.10

# 如果全部通過,你應該看到:
# PASS tests/phase-2/task-2.10.basic.test.ts
# PASS tests/phase-2/task-2.10.functional.test.ts
# PASS tests/phase-2/task-2.10.e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 2.10 完成了!

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 時間軸生成的效能
- 遇到的邊緣案例
- 遇到的主要問題與解決方法
- 時間計算的優化經驗

這些記錄在之後優化時會很有用!

---

**下一步**: 繼續 Task 2.11 - FFmpeg 環境設定

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
