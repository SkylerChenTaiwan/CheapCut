# Task 2.3: 標籤轉換與資料庫儲存

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.3 |
| **Task 名稱** | 標籤轉換與資料庫儲存 |
| **所屬 Phase** | Phase 2: Engines |
| **預估時間** | 2-3 小時 (設計 0.5h + 實作 1.5h + 測試 1h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 2.2 (Google Video AI 整合) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的標籤轉換問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot read property 'map' of undefined
          ^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 資料結構問題
   ```

2. **判斷錯誤類型**
   - `undefined is not iterable` → API 回傳格式異常
   - `Foreign key constraint fails` → 資料庫關聯錯誤
   - `Duplicate entry` → 標籤重複插入
   - `Invalid timestamp format` → 時間戳格式錯誤

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"標籤儲存失敗"  ← 太模糊
"資料庫存不進去" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"Video Intelligence API label format structure"  ← 查 API 格式
"Supabase upsert with foreign key relationship" ← 具體的資料庫操作
"PostgreSQL array type insert from TypeScript" ← 明確的技術棧
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- Video Intelligence API Response: https://cloud.google.com/video-intelligence/docs/reference/rest/v1/videos/annotate
- Supabase Database Guide: https://supabase.com/docs/guides/database
- PostgreSQL Array Types: https://www.postgresql.org/docs/current/arrays.html

**優先順序 2: 社群資源**
- Supabase Discussions: https://github.com/supabase/supabase/discussions
- Stack Overflow: 搜尋 "video intelligence api labels"

---

### Step 3: 檢查資料結構

```bash
# 檢查 Video AI 回傳格式
node -e "console.log(JSON.stringify(annotationResult.shotLabelAnnotations, null, 2))"

# 檢查資料庫 schema
npx supabase db dump --schema public

# 測試標籤插入
psql $DATABASE_URL -c "SELECT * FROM video_tags LIMIT 5;"
```

---

## 🎯 功能描述

將 Google Video Intelligence API 回傳的標籤資料轉換成結構化格式，並儲存到 Supabase 資料庫中。

### 為什麼需要這個?

- 🎯 **問題**: Video AI 回傳的 JSON 格式複雜，不能直接存入資料庫
- ✅ **解決**: 轉換成正規化的資料表結構，方便查詢和管理
- 💡 **比喻**: 就像把一疊雜亂的標籤整理成有分類的標籤簿

### 完成後你會有:

- ✅ 標籤資料正規化 schema
- ✅ Video AI 標籤轉換函式
- ✅ 標籤批次儲存機制
- ✅ 標籤查詢 API
- ✅ 標籤信心度過濾
- ✅ 重複標籤去重機制

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. Video Intelligence API 標籤格式

**是什麼**: Google Video AI 回傳的標籤包含物件、場景、動作等資訊

**標籤類型**:
- **Shot Labels**: 場景標籤 (如 "beach", "sunset")
- **Segment Labels**: 片段標籤 (較長時間範圍)
- **Frame Labels**: 幀標籤 (每一幀的內容)

**回傳格式範例**:
```json
{
  "shotLabelAnnotations": [
    {
      "entity": {
        "entityId": "/m/01bqvp",
        "description": "sky",
        "languageCode": "en-US"
      },
      "categoryEntities": [
        {
          "entityId": "/m/01yrx",
          "description": "nature"
        }
      ],
      "segments": [
        {
          "segment": {
            "startTimeOffset": "0s",
            "endTimeOffset": "5.4s"
          },
          "confidence": 0.95
        }
      ]
    }
  ]
}
```

### 2. 資料庫正規化設計

**為什麼需要正規化**: 避免資料重複，提高查詢效率

**我們的 Schema 設計**:

```sql
-- 標籤主表
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id TEXT UNIQUE NOT NULL,  -- Google entity ID
  name TEXT NOT NULL,               -- 標籤名稱
  category TEXT,                    -- 分類
  created_at TIMESTAMP DEFAULT NOW()
);

-- 影片標籤關聯表
CREATE TABLE video_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  confidence FLOAT NOT NULL,        -- 信心度 0-1
  start_time FLOAT NOT NULL,        -- 開始時間 (秒)
  end_time FLOAT NOT NULL,          -- 結束時間 (秒)
  label_type TEXT NOT NULL,         -- 'shot' | 'segment' | 'frame'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_id, tag_id, start_time)
);

-- 索引優化
CREATE INDEX idx_video_tags_video ON video_tags(video_id);
CREATE INDEX idx_video_tags_confidence ON video_tags(confidence);
CREATE INDEX idx_tags_name ON tags(name);
```

**為什麼這樣設計**:
1. `tags` 表存放標籤本體 → 避免重複儲存相同標籤
2. `video_tags` 表存放關聯 → 記錄哪個影片在什麼時間有什麼標籤
3. `confidence` 欄位 → 過濾低信心度的標籤
4. `UNIQUE` 約束 → 防止重複插入

### 3. 資料轉換策略

**轉換流程**:
```
Video AI Response
  ↓
解析 JSON 結構
  ↓
提取標籤實體
  ↓
正規化時間戳
  ↓
批次插入資料庫
```

**信心度過濾**:
```typescript
// 只保留信心度 >= 0.7 的標籤
const MIN_CONFIDENCE = 0.7;
const validLabels = labels.filter(l => l.confidence >= MIN_CONFIDENCE);
```

**時間戳轉換**:
```typescript
// Video AI 格式: "5.4s" → 數值: 5.4
function parseTimestamp(timestamp: string): number {
  return parseFloat(timestamp.replace('s', ''));
}
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.2: Google Video AI 整合 (提供標籤資料)
- ✅ Task 1.2: Supabase 資料庫設定

### 套件依賴

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "zod": "^3.22.4"
  }
}
```

**為什麼需要這些套件**:
- `@supabase/supabase-js`: 資料庫操作
- `zod`: 資料驗證和型別安全

### 資料庫 Migration

在開始實作前，需要先執行 migration:

```bash
npx supabase migration new add_tags_tables
```

---

## 🛠️ 實作步驟

### Step 1: 建立資料庫 Schema

**目標**: 建立標籤相關的資料表

#### 1.1 建立 Migration 檔案

```bash
npx supabase migration new add_tags_tables
```

#### 1.2 撰寫 SQL Schema

檔案: `supabase/migrations/XXXXXX_add_tags_tables.sql`

```sql
-- 啟用 UUID 擴充
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 標籤主表
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  language_code TEXT DEFAULT 'en-US',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 影片標籤關聯表
CREATE TABLE IF NOT EXISTS video_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  start_time FLOAT NOT NULL CHECK (start_time >= 0),
  end_time FLOAT NOT NULL CHECK (end_time >= start_time),
  label_type TEXT NOT NULL CHECK (label_type IN ('shot', 'segment', 'frame')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_video_tag_time UNIQUE(video_id, tag_id, start_time)
);

-- 索引優化
CREATE INDEX idx_video_tags_video ON video_tags(video_id);
CREATE INDEX idx_video_tags_tag ON video_tags(tag_id);
CREATE INDEX idx_video_tags_confidence ON video_tags(confidence DESC);
CREATE INDEX idx_video_tags_time ON video_tags(start_time, end_time);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_entity ON tags(entity_id);

-- 更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tags ENABLE ROW LEVEL SECURITY;

-- 所有人都可以讀取標籤
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

-- 只有認證用戶可以新增標籤
CREATE POLICY "Authenticated users can insert tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 用戶只能查看自己影片的標籤
CREATE POLICY "Users can view their own video tags"
  ON video_tags FOR SELECT
  USING (
    video_id IN (
      SELECT id FROM videos WHERE user_id = auth.uid()
    )
  );

-- 用戶可以為自己的影片新增標籤
CREATE POLICY "Users can insert tags for their videos"
  ON video_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    video_id IN (
      SELECT id FROM videos WHERE user_id = auth.uid()
    )
  );
```

#### 1.3 執行 Migration

```bash
npx supabase db push
```

**驗證**:
```bash
# 檢查資料表是否建立成功
npx supabase db dump --schema public | grep -A 10 "CREATE TABLE tags"
```

---

### Step 2: 建立型別定義

**目標**: 定義 TypeScript 型別，確保型別安全

檔案: `src/types/tags.ts`

```typescript
import { z } from 'zod';

// ========================================
// Video Intelligence API 回傳格式
// ========================================

export const VideoAIEntitySchema = z.object({
  entityId: z.string(),
  description: z.string(),
  languageCode: z.string().optional(),
});

export const VideoAISegmentSchema = z.object({
  segment: z.object({
    startTimeOffset: z.string(), // 格式: "5.4s"
    endTimeOffset: z.string(),
  }),
  confidence: z.number().min(0).max(1),
});

export const VideoAILabelSchema = z.object({
  entity: VideoAIEntitySchema,
  categoryEntities: z.array(VideoAIEntitySchema).optional(),
  segments: z.array(VideoAISegmentSchema),
});

export const VideoAIResponseSchema = z.object({
  shotLabelAnnotations: z.array(VideoAILabelSchema).optional(),
  segmentLabelAnnotations: z.array(VideoAILabelSchema).optional(),
  frameLabelAnnotations: z.array(VideoAILabelSchema).optional(),
});

export type VideoAIResponse = z.infer<typeof VideoAIResponseSchema>;
export type VideoAILabel = z.infer<typeof VideoAILabelSchema>;

// ========================================
// 資料庫型別
// ========================================

export interface Tag {
  id: string;
  entity_id: string;
  name: string;
  category: string | null;
  language_code: string;
  created_at: string;
  updated_at: string;
}

export interface VideoTag {
  id: string;
  video_id: string;
  tag_id: string;
  confidence: number;
  start_time: number;
  end_time: number;
  label_type: 'shot' | 'segment' | 'frame';
  created_at: string;
}

// ========================================
// 轉換用的中間格式
// ========================================

export interface NormalizedTag {
  entityId: string;
  name: string;
  category?: string;
  languageCode: string;
}

export interface NormalizedVideoTag {
  videoId: string;
  tag: NormalizedTag;
  confidence: number;
  startTime: number;
  endTime: number;
  labelType: 'shot' | 'segment' | 'frame';
}

// ========================================
// 設定常數
// ========================================

export const TAG_CONFIG = {
  MIN_CONFIDENCE: 0.7,      // 最小信心度閾值
  MAX_TAGS_PER_VIDEO: 100,  // 每部影片最多標籤數
  BATCH_SIZE: 50,           // 批次插入大小
} as const;
```

---

### Step 3: 實作標籤轉換邏輯

**目標**: 將 Video AI 回傳的標籤轉換成正規化格式

檔案: `src/lib/engines/tag-converter.ts`

```typescript
import { VideoAIResponse, VideoAILabel, NormalizedVideoTag, NormalizedTag, TAG_CONFIG } from '@/types/tags';

/**
 * 解析時間戳字串
 * @example "5.4s" → 5.4
 */
function parseTimestamp(timestamp: string): number {
  if (!timestamp) return 0;
  const match = timestamp.match(/^(\d+\.?\d*)s?$/);
  if (!match) {
    throw new Error(`Invalid timestamp format: ${timestamp}`);
  }
  return parseFloat(match[1]);
}

/**
 * 轉換單一標籤
 */
function convertLabel(
  label: VideoAILabel,
  videoId: string,
  labelType: 'shot' | 'segment' | 'frame'
): NormalizedVideoTag[] {
  const normalizedTag: NormalizedTag = {
    entityId: label.entity.entityId,
    name: label.entity.description,
    category: label.categoryEntities?.[0]?.description,
    languageCode: label.entity.languageCode || 'en-US',
  };

  // 每個 segment 都產生一個 VideoTag
  return label.segments
    .filter(segment => segment.confidence >= TAG_CONFIG.MIN_CONFIDENCE)
    .map(segment => ({
      videoId,
      tag: normalizedTag,
      confidence: segment.confidence,
      startTime: parseTimestamp(segment.segment.startTimeOffset),
      endTime: parseTimestamp(segment.segment.endTimeOffset),
      labelType,
    }));
}

/**
 * 轉換 Video AI 回傳的所有標籤
 */
export function convertVideoAILabels(
  response: VideoAIResponse,
  videoId: string
): NormalizedVideoTag[] {
  const allTags: NormalizedVideoTag[] = [];

  // 處理 Shot Labels
  if (response.shotLabelAnnotations) {
    response.shotLabelAnnotations.forEach(label => {
      allTags.push(...convertLabel(label, videoId, 'shot'));
    });
  }

  // 處理 Segment Labels
  if (response.segmentLabelAnnotations) {
    response.segmentLabelAnnotations.forEach(label => {
      allTags.push(...convertLabel(label, videoId, 'segment'));
    });
  }

  // 處理 Frame Labels
  if (response.frameLabelAnnotations) {
    response.frameLabelAnnotations.forEach(label => {
      allTags.push(...convertLabel(label, videoId, 'frame'));
    });
  }

  // 按信心度排序並限制數量
  return allTags
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, TAG_CONFIG.MAX_TAGS_PER_VIDEO);
}

/**
 * 去除重複的標籤
 */
export function deduplicateTags(tags: NormalizedVideoTag[]): NormalizedVideoTag[] {
  const seen = new Set<string>();
  return tags.filter(tag => {
    const key = `${tag.tag.entityId}-${tag.startTime}-${tag.endTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

**測試轉換邏輯**:

檔案: `src/lib/engines/__tests__/tag-converter.test.ts`

```typescript
import { convertVideoAILabels, deduplicateTags } from '../tag-converter';
import { VideoAIResponse } from '@/types/tags';

describe('Tag Converter', () => {
  const mockResponse: VideoAIResponse = {
    shotLabelAnnotations: [
      {
        entity: {
          entityId: '/m/01bqvp',
          description: 'sky',
          languageCode: 'en-US',
        },
        categoryEntities: [
          {
            entityId: '/m/01yrx',
            description: 'nature',
          },
        ],
        segments: [
          {
            segment: {
              startTimeOffset: '0s',
              endTimeOffset: '5.4s',
            },
            confidence: 0.95,
          },
        ],
      },
    ],
  };

  it('應該正確轉換 Video AI 標籤', () => {
    const result = convertVideoAILabels(mockResponse, 'test-video-id');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      videoId: 'test-video-id',
      tag: {
        entityId: '/m/01bqvp',
        name: 'sky',
        category: 'nature',
      },
      confidence: 0.95,
      startTime: 0,
      endTime: 5.4,
      labelType: 'shot',
    });
  });

  it('應該過濾低信心度標籤', () => {
    const lowConfResponse: VideoAIResponse = {
      shotLabelAnnotations: [
        {
          entity: { entityId: '/m/test', description: 'test' },
          segments: [
            { segment: { startTimeOffset: '0s', endTimeOffset: '1s' }, confidence: 0.5 },
          ],
        },
      ],
    };

    const result = convertVideoAILabels(lowConfResponse, 'test-id');
    expect(result).toHaveLength(0);
  });

  it('應該去除重複標籤', () => {
    const tags = [
      {
        videoId: 'vid',
        tag: { entityId: '/m/1', name: 'tag1', languageCode: 'en' },
        confidence: 0.9,
        startTime: 0,
        endTime: 5,
        labelType: 'shot' as const,
      },
      {
        videoId: 'vid',
        tag: { entityId: '/m/1', name: 'tag1', languageCode: 'en' },
        confidence: 0.9,
        startTime: 0,
        endTime: 5,
        labelType: 'shot' as const,
      },
    ];

    const result = deduplicateTags(tags);
    expect(result).toHaveLength(1);
  });
});
```

---

### Step 4: 實作資料庫儲存

**目標**: 將轉換後的標籤批次儲存到資料庫

檔案: `src/lib/engines/tag-storage.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { NormalizedVideoTag, Tag, VideoTag, TAG_CONFIG } from '@/types/tags';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 批次插入或更新標籤主表
 * 使用 upsert 避免重複插入相同的 entity_id
 */
async function upsertTags(normalizedTags: NormalizedVideoTag[]): Promise<Map<string, string>> {
  // 去重：相同 entityId 只保留一個
  const uniqueTags = Array.from(
    new Map(normalizedTags.map(t => [t.tag.entityId, t.tag])).values()
  );

  const tagsToInsert = uniqueTags.map(tag => ({
    entity_id: tag.entityId,
    name: tag.name,
    category: tag.category || null,
    language_code: tag.languageCode,
  }));

  const { data, error } = await supabase
    .from('tags')
    .upsert(tagsToInsert, {
      onConflict: 'entity_id',
      ignoreDuplicates: false, // 更新 updated_at
    })
    .select('id, entity_id');

  if (error) {
    throw new Error(`Failed to upsert tags: ${error.message}`);
  }

  // 建立 entityId → id 的映射
  const entityIdToIdMap = new Map<string, string>();
  data?.forEach(tag => {
    entityIdToIdMap.set(tag.entity_id, tag.id);
  });

  return entityIdToIdMap;
}

/**
 * 批次插入影片標籤關聯
 */
async function insertVideoTags(
  normalizedTags: NormalizedVideoTag[],
  entityIdToIdMap: Map<string, string>
): Promise<void> {
  const videoTagsToInsert = normalizedTags.map(nt => {
    const tagId = entityIdToIdMap.get(nt.tag.entityId);
    if (!tagId) {
      throw new Error(`Tag ID not found for entity: ${nt.tag.entityId}`);
    }

    return {
      video_id: nt.videoId,
      tag_id: tagId,
      confidence: nt.confidence,
      start_time: nt.startTime,
      end_time: nt.endTime,
      label_type: nt.labelType,
    };
  });

  // 分批插入避免單次請求過大
  const batches = [];
  for (let i = 0; i < videoTagsToInsert.length; i += TAG_CONFIG.BATCH_SIZE) {
    batches.push(videoTagsToInsert.slice(i, i + TAG_CONFIG.BATCH_SIZE));
  }

  for (const batch of batches) {
    const { error } = await supabase
      .from('video_tags')
      .insert(batch);

    if (error) {
      // 忽略重複插入錯誤 (UNIQUE constraint)
      if (!error.message.includes('duplicate key')) {
        throw new Error(`Failed to insert video_tags: ${error.message}`);
      }
    }
  }
}

/**
 * 儲存標籤到資料庫
 * @param normalizedTags 已轉換的標籤陣列
 */
export async function saveTagsToDatabase(
  normalizedTags: NormalizedVideoTag[]
): Promise<{ tagsCount: number; videoTagsCount: number }> {
  if (normalizedTags.length === 0) {
    return { tagsCount: 0, videoTagsCount: 0 };
  }

  try {
    // Step 1: Upsert tags 主表
    const entityIdToIdMap = await upsertTags(normalizedTags);

    // Step 2: Insert video_tags 關聯表
    await insertVideoTags(normalizedTags, entityIdToIdMap);

    return {
      tagsCount: entityIdToIdMap.size,
      videoTagsCount: normalizedTags.length,
    };
  } catch (error) {
    console.error('Failed to save tags:', error);
    throw error;
  }
}

/**
 * 查詢影片的所有標籤
 */
export async function getVideoTags(videoId: string): Promise<Array<VideoTag & { tag: Tag }>> {
  const { data, error } = await supabase
    .from('video_tags')
    .select(`
      *,
      tag:tags(*)
    `)
    .eq('video_id', videoId)
    .order('confidence', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch video tags: ${error.message}`);
  }

  return data as any;
}

/**
 * 查詢特定時間範圍的標籤
 */
export async function getTagsInTimeRange(
  videoId: string,
  startTime: number,
  endTime: number
): Promise<Array<VideoTag & { tag: Tag }>> {
  const { data, error } = await supabase
    .from('video_tags')
    .select(`
      *,
      tag:tags(*)
    `)
    .eq('video_id', videoId)
    .gte('start_time', startTime)
    .lte('end_time', endTime)
    .order('confidence', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tags in time range: ${error.message}`);
  }

  return data as any;
}
```

---

### Step 5: 建立整合 API

**目標**: 提供完整的標籤處理流程 API

檔案: `src/app/api/videos/[id]/tags/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { convertVideoAILabels, deduplicateTags } from '@/lib/engines/tag-converter';
import { saveTagsToDatabase, getVideoTags } from '@/lib/engines/tag-storage';
import { VideoAIResponseSchema } from '@/types/tags';

/**
 * GET /api/videos/[id]/tags
 * 查詢影片的所有標籤
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const tags = await getVideoTags(videoId);

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/videos/[id]/tags
 * 處理並儲存 Video AI 標籤
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const body = await request.json();

    // 驗證輸入格式
    const validatedResponse = VideoAIResponseSchema.parse(body);

    // 轉換標籤
    const normalizedTags = convertVideoAILabels(validatedResponse, videoId);

    // 去重
    const uniqueTags = deduplicateTags(normalizedTags);

    // 儲存到資料庫
    const result = await saveTagsToDatabase(uniqueTags);

    return NextResponse.json({
      success: true,
      data: {
        tagsProcessed: normalizedTags.length,
        tagsStored: result.videoTagsCount,
        uniqueTags: result.tagsCount,
      },
    });
  } catch (error: any) {
    console.error('Failed to process tags:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## ✅ 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證標籤轉換是否正常運作

**測試檔案**: `tests/phase-2/task-2.3.basic.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TestRunner } from '../../src/lib/test-runner';
import { convertVideoAILabels } from '../../src/lib/engines/tag-converter';
import { VideoAIResponse } from '../../src/types/tags';

describe('Task 2.3 - Basic: Tag Conversion', () => {
  const runner = new TestRunner('basic');

  const mockVideoAIResponse: VideoAIResponse = {
    shotLabelAnnotations: [
      {
        entity: {
          entityId: '/m/01bqvp',
          description: 'sky',
          languageCode: 'en-US',
        },
        segments: [
          {
            segment: {
              startTimeOffset: '0s',
              endTimeOffset: '5.4s',
            },
            confidence: 0.95,
          },
        ],
      },
    ],
  };

  it('應該能夠轉換標籤格式', async () => {
    await runner.runTest('標籤轉換測試', async () => {
      const result = convertVideoAILabels(mockVideoAIResponse, 'test-video-id');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('tag');
      expect(result[0]).toHaveProperty('confidence');
      expect(result[0]).toHaveProperty('startTime');
      expect(result[0]).toHaveProperty('endTime');
    });
  });

  it('應該正確解析時間戳', async () => {
    await runner.runTest('時間戳解析測試', async () => {
      const result = convertVideoAILabels(mockVideoAIResponse, 'test-video-id');

      expect(result[0].startTime).toBe(0);
      expect(result[0].endTime).toBe(5.4);
    });
  });

  it('應該過濾低信心度標籤', async () => {
    await runner.runTest('信心度過濾測試', async () => {
      const lowConfResponse: VideoAIResponse = {
        shotLabelAnnotations: [
          {
            entity: { entityId: '/m/test', description: 'test' },
            segments: [
              {
                segment: { startTimeOffset: '0s', endTimeOffset: '1s' },
                confidence: 0.5, // 低於閾值
              },
            ],
          },
        ],
      };

      const result = convertVideoAILabels(lowConfResponse, 'test-id');
      expect(result.length).toBe(0);
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.3.basic.test.ts
```

**通過標準**:
- ✅ 能夠轉換標籤格式
- ✅ 時間戳正確解析
- ✅ 信心度過濾正常

---

### Functional Acceptance (功能驗收)

**目標**: 驗證標籤功能完整性

**測試檔案**: `tests/phase-2/task-2.3.functional.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TestRunner } from '../../src/lib/test-runner';
import { saveTagsToDatabase, getVideoTags } from '../../src/lib/engines/tag-storage';
import { NormalizedVideoTag } from '../../src/types/tags';

describe('Task 2.3 - Functional: Tag Operations', () => {
  const runner = new TestRunner('functional');

  const mockNormalizedTags: NormalizedVideoTag[] = [
    {
      videoId: 'test-video-123',
      tag: {
        entityId: '/m/01bqvp',
        name: 'sky',
        category: 'nature',
        languageCode: 'en-US',
      },
      confidence: 0.95,
      startTime: 0,
      endTime: 5.4,
      labelType: 'shot',
    },
  ];

  it('應該正確儲存標籤', async () => {
    await runner.runTest('標籤儲存測試', async () => {
      const result = await saveTagsToDatabase(mockNormalizedTags);

      expect(result.tagsCount).toBeGreaterThan(0);
      expect(result.videoTagsCount).toBe(mockNormalizedTags.length);
    });
  });

  it('應該能夠查詢標籤', async () => {
    await runner.runTest('標籤查詢測試', async () => {
      const tags = await getVideoTags('test-video-123');

      expect(Array.isArray(tags)).toBe(true);
      if (tags.length > 0) {
        expect(tags[0]).toHaveProperty('tag');
        expect(tags[0].tag).toHaveProperty('name');
      }
    });
  });

  it('應該正確處理重複標籤', async () => {
    await runner.runTest('重複標籤測試', async () => {
      // 插入相同標籤兩次
      await saveTagsToDatabase(mockNormalizedTags);
      const result = await saveTagsToDatabase(mockNormalizedTags);

      // 應該使用 upsert，不會報錯
      expect(result.tagsCount).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.3.functional.test.ts
```

**通過標準**:
- ✅ 標籤正確儲存
- ✅ 標籤查詢正常
- ✅ 重複標籤處理正確

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證完整標籤流程

**測試檔案**: `tests/phase-2/task-2.3.e2e.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.3 - E2E: Complete Tag Flow', () => {
  const runner = new TestRunner('e2e');

  it('應該能完整執行標籤流程', async () => {
    await runner.runTest('完整標籤流程測試', async () => {
      // 1. 模擬 Video AI 回傳
      const mockResponse = {
        shotLabelAnnotations: [
          {
            entity: {
              entityId: '/m/01bqvp',
              description: 'sky',
            },
            segments: [
              {
                segment: {
                  startTimeOffset: '0s',
                  endTimeOffset: '5s',
                },
                confidence: 0.95,
              },
            ],
          },
        ],
      };

      // 2. 呼叫 API 處理標籤
      const response = await fetch(`${process.env.TEST_BASE_URL}/api/videos/test-video/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockResponse),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.tagsProcessed).toBeGreaterThan(0);

      // 3. 查詢標籤
      const getResponse = await fetch(`${process.env.TEST_BASE_URL}/api/videos/test-video/tags`);
      expect(getResponse.ok).toBe(true);
      const getTags = await getResponse.json();
      expect(getTags.data.length).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.3.e2e.test.ts
```

**通過標準**:
- ✅ 完整的標籤流程正確運作
- ✅ 標籤資料可以正確查詢
- ✅ 錯誤處理完善

---

## 📋 完成檢查清單

實作完成後，請依序檢查以下項目：

### 實作檢查
- [ ] 資料庫 Migration 已建立並執行
- [ ] 型別定義已完成 (`src/types/tags.ts`)
- [ ] 標籤轉換邏輯已實作 (`src/lib/engines/tag-converter.ts`)
- [ ] 資料庫儲存已實作 (`src/lib/engines/tag-storage.ts`)
- [ ] API 端點已建立 (`src/app/api/videos/[id]/tags/route.ts`)
- [ ] 單元測試已撰寫

### 測試檔案
- [ ] `tests/phase-2/task-2.3.basic.test.ts` 已建立
- [ ] `tests/phase-2/task-2.3.functional.test.ts` 已建立
- [ ] `tests/phase-2/task-2.3.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

### 資料庫驗證
- [ ] `tags` 表已建立
- [ ] `video_tags` 表已建立
- [ ] 索引已建立
- [ ] RLS 政策已設定

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

## 🐛 常見問題與解決方案

### Q1: Foreign key constraint fails

**問題**: 插入 `video_tags` 時出現外鍵約束錯誤

**原因**: 參照的 `video_id` 或 `tag_id` 不存在

**解決方案**:
```typescript
// 確保先插入 tags，再插入 video_tags
await upsertTags(normalizedTags); // 先建立 tag
await insertVideoTags(normalizedTags, entityIdToIdMap); // 再建立關聯
```

---

### Q2: Duplicate entry error

**問題**: 重複插入相同的標籤

**原因**: 沒有使用 `upsert` 或 `UNIQUE` 約束

**解決方案**:
```typescript
// 使用 upsert 避免重複
await supabase
  .from('tags')
  .upsert(tagsToInsert, {
    onConflict: 'entity_id',
  });
```

---

### Q3: 時間戳解析失敗

**問題**: Video AI 回傳的時間戳格式不符預期

**原因**: 不同的 Video AI 版本格式可能不同

**解決方案**:
```typescript
function parseTimestamp(timestamp: string): number {
  // 支援多種格式
  if (timestamp.endsWith('s')) {
    return parseFloat(timestamp.replace('s', ''));
  }
  if (timestamp.includes(':')) {
    // 處理 HH:MM:SS 格式
    const parts = timestamp.split(':').map(Number);
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parseFloat(timestamp);
}
```

---

### Q4: 標籤數量過多導致效能問題

**問題**: 單一影片標籤超過 1000 個，查詢變慢

**原因**: 沒有限制標籤數量

**解決方案**:
```typescript
// 在 TAG_CONFIG 中設定上限
export const TAG_CONFIG = {
  MAX_TAGS_PER_VIDEO: 100,
};

// 在轉換時限制數量
return allTags
  .sort((a, b) => b.confidence - a.confidence)
  .slice(0, TAG_CONFIG.MAX_TAGS_PER_VIDEO);
```

---

## 🎓 Task 完成確認

完成這個 Task 後，你應該能夠：

✅ 理解 Video Intelligence API 的標籤格式
✅ 設計正規化的標籤資料表結構
✅ 實作標籤轉換邏輯
✅ 使用 Supabase 批次儲存資料
✅ 建立標籤查詢 API
✅ 處理重複標籤和信心度過濾

**下一步**: Task 2.4 - 影片切分與縮圖生成

---

**文件版本**: 1.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
