# Task 2.2: Google Video AI 整合

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.2 |
| **Task 名稱** | Google Video AI 整合 |
| **所屬 Phase** | Phase 2: Engines |
| **預估時間** | 4-5 小時 (API 設定 1h + 實作 2h + 測試 1-2h) |
| **難度** | ⭐⭐⭐ 中等 |
| **前置 Task** | Task 2.1 (GCS 儲存與上傳) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的 Video AI 問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: 7 PERMISSION_DENIED: Video Intelligence API has not been enabled
          ^^^^^^^^^^^^^^^^^^^  ← API 未啟用
   ```

2. **判斷錯誤類型**
   - `PERMISSION_DENIED` → API 未啟用或權限不足
   - `INVALID_ARGUMENT` → 影片格式或參數錯誤
   - `RESOURCE_EXHAUSTED` → 超過配額限制
   - `DEADLINE_EXCEEDED` → 分析時間過長
   - `NOT_FOUND` → GCS 檔案路徑錯誤

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"Video AI 不能用"  ← 太模糊
"影片分析失敗" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"Google Video Intelligence API PERMISSION_DENIED"  ← 包含具體錯誤
"Video Intelligence API label detection example Node.js" ← 明確的功能+語言
"Google Cloud Video AI pricing and quota limits" ← 成本和限制問題
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- Video Intelligence API: https://cloud.google.com/video-intelligence/docs
- Node.js Client Library: https://cloud.google.com/video-intelligence/docs/reference/libraries#client-libraries-install-nodejs
- Features Overview: https://cloud.google.com/video-intelligence/docs/features

**優先順序 2: 官方範例**
- Video AI Samples: https://github.com/googleapis/nodejs-video-intelligence

---

### Step 3: 檢查環境設定

```bash
# 檢查 Video Intelligence API 是否啟用
gcloud services list --enabled | grep videointelligence

# 啟用 API (如果未啟用)
gcloud services enable videointelligence.googleapis.com

# 檢查 GCS 權限
gsutil ls gs://your-bucket-name

# 測試 API 連接
gcloud ml video detect-labels gs://your-bucket-name/test.mp4
```

---

## 🎯 功能描述

整合 Google Video Intelligence API 來自動分析影片內容,為素材打上標籤以便後續智能選片。

### 為什麼需要這個?

- 🎯 **問題**: 用戶上傳的素材影片需要「理解內容」才能智能選片
- ✅ **解決**: 使用 Google Video AI 自動分析場景、物件、動作、情緒
- 💡 **比喻**: 就像請一個 AI 導演先看過所有素材,並做筆記標記每個片段是什麼內容

### 完成後你會有:

- ✅ Video Intelligence API 已設定並可使用
- ✅ 影片分析服務已實作
- ✅ Label Detection (標籤偵測) 功能
- ✅ Shot Change Detection (場景切換偵測) 功能
- ✅ Object Tracking (物件追蹤) 功能
- ✅ 分析結果轉換為 CheapCut 標籤系統

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. Google Video Intelligence API

**是什麼**: Google Cloud 提供的影片分析服務

**核心功能**:
- **Label Detection (標籤偵測)**: 識別影片中的物件、場景、活動
  - 例如: "person", "talking", "office", "computer"
  - 提供信心分數 (confidence score)
  - 包含時間範圍 (哪幾秒出現)
- **Shot Change Detection (場景切換偵測)**: 自動偵測場景變換
  - 找出每個場景的起始和結束時間
  - 適合自動切分影片
- **Object Tracking (物件追蹤)**: 追蹤移動物體
  - 例如: 追蹤畫面中的人物移動
  - 提供物件的位置座標和時間

**為什麼用 Video AI**:
- 準確率高,Google 訓練的模型
- 支援多種影片格式
- 按用量計費,成本可控
- 與 GCS 深度整合,分析速度快

### 2. 非同步處理模式

**是什麼**: Video AI 使用「非同步」分析模式

**運作流程**:
```
1. 提交分析任務 → 取得 operation ID
2. Video AI 在背景處理 (可能需要 1-10 分鐘)
3. 定期檢查 operation 狀態
4. 完成後取得分析結果
```

**為什麼要非同步**:
- 影片分析需要較長時間
- 避免 HTTP 請求 timeout
- 可以同時處理多個影片

**實作方式**:
```typescript
// 提交分析
const [operation] = await client.annotateVideo(request);

// 等待完成 (SDK 會自動輪詢)
const [response] = await operation.promise();

// 或手動檢查狀態
const done = await operation.done();
```

### 3. 分析結果結構

**Label 範例**:
```json
{
  "entity": {
    "entityId": "/m/01g317",
    "description": "person",
    "languageCode": "en-US"
  },
  "categoryEntities": [
    {
      "entityId": "/m/0k65p",
      "description": "human face"
    }
  ],
  "segments": [
    {
      "segment": {
        "startTimeOffset": { "seconds": 0 },
        "endTimeOffset": { "seconds": 5.5 }
      },
      "confidence": 0.9876
    }
  ]
}
```

**重要欄位說明**:
- `description`: 標籤名稱 (如 "person", "talking")
- `confidence`: 信心分數 (0-1,越高越準確)
- `startTimeOffset` / `endTimeOffset`: 時間範圍
- `categoryEntities`: 父類別 (如 "person" 的父類別是 "human")

### 4. 成本結構

**Video Intelligence API 定價** (2024):
- Label Detection: $0.10 / 分鐘
- Shot Detection: $0.05 / 分鐘
- Object Tracking: $0.15 / 分鐘
- 前 1000 分鐘/月: 免費

**成本估算**:
- 假設每支素材 30 秒
- 只使用 Label + Shot Detection
- 成本: ($0.10 + $0.05) × 0.5 = $0.075 per video
- 約 NT$2.3 / 支

**省錢技巧**:
- 只在素材第一次上傳時分析
- 快取分析結果
- 優先使用免費額度
- 考慮只用 Label Detection (省一半錢)

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.1: GCS 儲存與上傳 (影片已存在 GCS)
- ✅ Task 1.2: 資料庫已設定

### 系統需求
- GCP 專案已建立
- Video Intelligence API 已啟用
- Service Account 有 Video Intelligence User 權限
- Node.js >= 18

### 環境檢查
```bash
# 檢查 API 是否啟用
gcloud services list --enabled | grep videointelligence

# 啟用 API
gcloud services enable videointelligence.googleapis.com

# 檢查權限
gcloud projects get-iam-policy PROJECT_ID | grep videointelligence
```

---

## 📝 實作步驟

### 步驟 1: 安裝 Video Intelligence SDK

在後端專案中安裝:

```bash
cd backend
npm install @google-cloud/video-intelligence
```

---

### 步驟 2: 建立 Video Analysis Service

建立 `backend/src/services/video-analysis.service.ts`:

```typescript
/**
 * Video Analysis Service
 *
 * 負責使用 Google Video Intelligence API 分析影片
 *
 * 功能:
 * - Label Detection (標籤偵測)
 * - Shot Detection (場景切換偵測)
 * - Object Tracking (物件追蹤)
 * - 結果轉換與儲存
 */

import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import { protos } from '@google-cloud/video-intelligence';

// 型別定義
type IAnnotateVideoRequest = protos.google.cloud.videointelligence.v1.IAnnotateVideoRequest;
type IVideoAnnotationResults = protos.google.cloud.videointelligence.v1.IVideoAnnotationResults;

// 初始化 Video Intelligence 客戶端
const client = new VideoIntelligenceServiceClient({
  projectId: process.env.GCP_PROJECT_ID,
  // 如果在本地開發,需要指定 keyFilename
  // keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 * 分析影片內容
 *
 * @param gcsUri - GCS 影片路徑 (格式: gs://bucket-name/path/to/video.mp4)
 * @param features - 要分析的功能列表
 * @returns 分析結果
 */
export async function analyzeVideo(
  gcsUri: string,
  features: string[] = ['LABEL_DETECTION', 'SHOT_CHANGE_DETECTION']
): Promise<IVideoAnnotationResults> {
  console.log(`開始分析影片: ${gcsUri}`);
  console.log(`分析功能: ${features.join(', ')}`);

  // 建立分析請求
  const request: IAnnotateVideoRequest = {
    inputUri: gcsUri,
    features: features as any[], // 轉換為 API 需要的型別
  };

  try {
    // 提交分析任務 (非同步)
    const [operation] = await client.annotateVideo(request);
    console.log(`分析任務已提交,Operation ID: ${operation.name}`);

    // 等待分析完成 (SDK 會自動輪詢)
    console.log('等待分析完成...');
    const [response] = await operation.promise();
    console.log('分析完成!');

    // 取得第一個影片的分析結果
    const results = response.annotationResults?.[0];
    if (!results) {
      throw new Error('未取得分析結果');
    }

    return results;
  } catch (error) {
    console.error('影片分析失敗:', error);
    throw new Error(`影片分析失敗: ${error}`);
  }
}

/**
 * 提取 Label Detection 結果
 *
 * @param results - Video AI 分析結果
 * @returns 標籤陣列
 */
export function extractLabels(results: IVideoAnnotationResults) {
  const labels = results.segmentLabelAnnotations || [];

  return labels.map((label) => {
    const segments = label.segments || [];
    const firstSegment = segments[0];

    return {
      name: label.entity?.description || '',
      confidence: firstSegment?.confidence || 0,
      startTime: firstSegment?.segment?.startTimeOffset?.seconds || 0,
      endTime: firstSegment?.segment?.endTimeOffset?.seconds || 0,
      // 原始資料 (保留以便除錯)
      raw: {
        entityId: label.entity?.entityId,
        categories: label.categoryEntities?.map((cat) => cat.description),
      },
    };
  });
}

/**
 * 提取 Shot Detection 結果
 *
 * @param results - Video AI 分析結果
 * @returns 場景陣列
 */
export function extractShots(results: IVideoAnnotationResults) {
  const shots = results.shotAnnotations || [];

  return shots.map((shot, index) => {
    const startTime = shot.startTimeOffset?.seconds || 0;
    const endTime = shot.endTimeOffset?.seconds || 0;

    return {
      shotId: index + 1,
      startTime,
      endTime,
      duration: endTime - startTime,
    };
  });
}

/**
 * 提取 Object Tracking 結果
 *
 * @param results - Video AI 分析結果
 * @returns 物件追蹤陣列
 */
export function extractObjects(results: IVideoAnnotationResults) {
  const objects = results.objectAnnotations || [];

  return objects.map((obj) => {
    const frames = obj.frames || [];
    const firstFrame = frames[0];

    return {
      name: obj.entity?.description || '',
      confidence: obj.confidence || 0,
      startTime: firstFrame?.timeOffset?.seconds || 0,
      endTime: frames[frames.length - 1]?.timeOffset?.seconds || 0,
      // 追蹤資料
      trackId: obj.trackId,
      frameCount: frames.length,
    };
  });
}

/**
 * 完整的影片分析流程
 *
 * @param gcsUri - GCS 影片路徑
 * @returns 處理後的分析結果
 */
export async function analyzeVideoComplete(gcsUri: string) {
  // 1. 執行 Video AI 分析
  const results = await analyzeVideo(gcsUri, [
    'LABEL_DETECTION',
    'SHOT_CHANGE_DETECTION',
    // 'OBJECT_TRACKING', // 可選,成本較高
  ]);

  // 2. 提取各類結果
  const labels = extractLabels(results);
  const shots = extractShots(results);
  // const objects = extractObjects(results); // 如果使用 Object Tracking

  console.log(`分析完成: ${labels.length} 個標籤, ${shots.length} 個場景`);

  // 3. 回傳處理後的資料
  return {
    labels,
    shots,
    // objects,
    raw: results, // 保留原始資料供除錯
  };
}

/**
 * 檢查分析任務狀態
 *
 * @param operationName - Operation ID
 * @returns 是否完成
 */
export async function checkAnalysisStatus(operationName: string) {
  const [operation] = await client.checkAnnotateVideoProgress(operationName);
  return {
    done: operation.done,
    progress: operation.metadata?.progressPercent || 0,
  };
}
```

---

### 步驟 3: 建立標籤轉換邏輯

建立 `backend/src/services/tag-converter.service.ts`:

```typescript
/**
 * Tag Converter Service
 *
 * 將 Video AI 的標籤轉換為 CheapCut 的標籤系統
 *
 * 為什麼需要轉換?
 * - Video AI 回傳的標籤很細(如 "computer keyboard", "desktop computer")
 * - 我們需要統一的標籤系統以便搜尋
 * - 需要過濾無用或信心度低的標籤
 */

// 標籤映射表
const TAG_MAPPING: Record<string, string> = {
  // 人物相關
  'person': '人物',
  'human face': '人物',
  'man': '男性',
  'woman': '女性',
  'talking': '說話',
  'conversation': '對話',

  // 場景相關
  'office': '辦公室',
  'room': '室內',
  'outdoor': '戶外',
  'building': '建築',
  'home': '居家',

  // 物件相關
  'computer': '電腦',
  'laptop': '筆電',
  'phone': '手機',
  'desk': '桌子',
  'chair': '椅子',

  // 活動相關
  'working': '工作中',
  'meeting': '會議',
  'presentation': '簡報',
  'typing': '打字',

  // 情緒相關
  'smiling': '微笑',
  'serious': '嚴肅',
  'happy': '開心',
};

/**
 * 轉換 Video AI 標籤為 CheapCut 標籤
 *
 * @param labels - Video AI 標籤陣列
 * @param minConfidence - 最低信心度門檻 (預設 0.5)
 * @returns 轉換後的標籤陣列
 */
export function convertLabelsToTags(
  labels: Array<{
    name: string;
    confidence: number;
    startTime: number;
    endTime: number;
  }>,
  minConfidence: number = 0.5
) {
  return labels
    // 過濾低信心度標籤
    .filter((label) => label.confidence >= minConfidence)
    // 轉換為 CheapCut 標籤
    .map((label) => {
      const tagName = TAG_MAPPING[label.name.toLowerCase()] || label.name;

      return {
        tagName,
        originalName: label.name,
        confidence: label.confidence,
        startTime: label.startTime,
        endTime: label.endTime,
      };
    })
    // 去除重複標籤 (保留信心度最高的)
    .reduce((acc, tag) => {
      const existing = acc.find((t) => t.tagName === tag.tagName);
      if (!existing || existing.confidence < tag.confidence) {
        return [...acc.filter((t) => t.tagName !== tag.tagName), tag];
      }
      return acc;
    }, [] as typeof labels[]);
}

/**
 * 為場景產生預設標籤
 *
 * @param shotIndex - 場景編號
 * @param shotData - 場景資料
 * @returns 場景標籤
 */
export function generateShotTags(
  shotIndex: number,
  shotData: { startTime: number; endTime: number; duration: number }
) {
  const tags = [`場景${shotIndex}`];

  // 根據場景長度加上標籤
  if (shotData.duration < 3) {
    tags.push('短片段');
  } else if (shotData.duration > 10) {
    tags.push('長片段');
  }

  return tags;
}
```

---

### 步驟 4: 建立 API 端點

建立 `backend/src/routes/analysis.routes.ts`:

```typescript
/**
 * Analysis Routes
 *
 * 提供影片分析相關的 API 端點
 */

import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import * as videoAnalysisService from '../services/video-analysis.service';
import * as tagConverterService from '../services/tag-converter.service';
import { db } from '../db';

const router = express.Router();

/**
 * POST /api/analysis/start
 *
 * 開始分析影片
 *
 * Request Body:
 * {
 *   "materialId": "uuid",
 *   "gcsUri": "gs://bucket/path/to/video.mp4"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "analysisId": "uuid",
 *   "message": "分析已開始"
 * }
 */
router.post('/start', authenticateUser, async (req, res) => {
  try {
    const { materialId, gcsUri } = req.body;
    const userId = req.user!.id;

    // 驗證參數
    if (!materialId || !gcsUri) {
      return res.status(400).json({
        error: 'Missing required fields: materialId, gcsUri',
      });
    }

    // 檢查素材是否存在且屬於該用戶
    const material = await db.query(
      `SELECT * FROM materials WHERE id = $1 AND user_id = $2`,
      [materialId, userId]
    );

    if (material.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // 建立分析記錄
    const analysisRecord = await db.query(
      `INSERT INTO video_analysis (material_id, user_id, status)
       VALUES ($1, $2, 'processing')
       RETURNING id`,
      [materialId, userId]
    );

    const analysisId = analysisRecord.rows[0].id;

    // 非同步執行分析 (不要等待完成)
    analyzeVideoAsync(analysisId, materialId, gcsUri).catch((error) => {
      console.error('分析失敗:', error);
      // 更新狀態為失敗
      db.query(
        `UPDATE video_analysis SET status = 'failed', error_message = $1 WHERE id = $2`,
        [error.message, analysisId]
      );
    });

    res.json({
      success: true,
      analysisId,
      message: '分析已開始,請稍候查詢結果',
    });
  } catch (error) {
    console.error('Start analysis error:', error);
    res.status(500).json({ error: 'Failed to start analysis' });
  }
});

/**
 * GET /api/analysis/status/:analysisId
 *
 * 查詢分析狀態
 */
router.get('/status/:analysisId', authenticateUser, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user!.id;

    const result = await db.query(
      `SELECT * FROM video_analysis
       WHERE id = $1 AND user_id = $2`,
      [analysisId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const analysis = result.rows[0];

    res.json({
      analysisId: analysis.id,
      status: analysis.status, // 'processing', 'completed', 'failed'
      createdAt: analysis.created_at,
      completedAt: analysis.completed_at,
      errorMessage: analysis.error_message,
    });
  } catch (error) {
    console.error('Get analysis status error:', error);
    res.status(500).json({ error: 'Failed to get analysis status' });
  }
});

/**
 * GET /api/analysis/results/:materialId
 *
 * 取得分析結果
 */
router.get('/results/:materialId', authenticateUser, async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user!.id;

    // 取得標籤
    const tagsResult = await db.query(
      `SELECT t.* FROM material_tags t
       JOIN materials m ON t.material_id = m.id
       WHERE t.material_id = $1 AND m.user_id = $2`,
      [materialId, userId]
    );

    // 取得場景
    const shotsResult = await db.query(
      `SELECT s.* FROM material_shots s
       JOIN materials m ON s.material_id = m.id
       WHERE s.material_id = $1 AND m.user_id = $2
       ORDER BY s.start_time`,
      [materialId, userId]
    );

    res.json({
      materialId,
      tags: tagsResult.rows,
      shots: shotsResult.rows,
    });
  } catch (error) {
    console.error('Get analysis results error:', error);
    res.status(500).json({ error: 'Failed to get analysis results' });
  }
});

/**
 * 非同步執行影片分析
 */
async function analyzeVideoAsync(
  analysisId: string,
  materialId: string,
  gcsUri: string
) {
  try {
    console.log(`開始分析影片 ${materialId}`);

    // 1. 執行 Video AI 分析
    const analysisResults = await videoAnalysisService.analyzeVideoComplete(gcsUri);

    // 2. 轉換標籤
    const tags = tagConverterService.convertLabelsToTags(analysisResults.labels);

    // 3. 儲存標籤到資料庫
    for (const tag of tags) {
      await db.query(
        `INSERT INTO material_tags (material_id, tag_name, confidence, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5)`,
        [materialId, tag.tagName, tag.confidence, tag.startTime, tag.endTime]
      );
    }

    // 4. 儲存場景資料
    for (const shot of analysisResults.shots) {
      const shotTags = tagConverterService.generateShotTags(shot.shotId, shot);

      await db.query(
        `INSERT INTO material_shots (material_id, shot_number, start_time, end_time, duration, tags)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [materialId, shot.shotId, shot.startTime, shot.endTime, shot.duration, shotTags]
      );
    }

    // 5. 更新分析狀態為完成
    await db.query(
      `UPDATE video_analysis
       SET status = 'completed', completed_at = NOW()
       WHERE id = $1`,
      [analysisId]
    );

    console.log(`影片分析完成: ${materialId}`);
  } catch (error) {
    console.error('影片分析失敗:', error);
    throw error;
  }
}

export default router;
```

---

### 步驟 5: 建立資料表

在資料庫執行 (`migrations/003_create_analysis_tables.sql`):

```sql
-- 影片分析記錄表
CREATE TABLE video_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_video_analysis_material ON video_analysis(material_id);
CREATE INDEX idx_video_analysis_user ON video_analysis(user_id);
CREATE INDEX idx_video_analysis_status ON video_analysis(status);

-- 素材標籤表
CREATE TABLE material_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  confidence FLOAT DEFAULT 0,
  start_time FLOAT DEFAULT 0,
  end_time FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_material_tags_material ON material_tags(material_id);
CREATE INDEX idx_material_tags_name ON material_tags(tag_name);
CREATE INDEX idx_material_tags_confidence ON material_tags(confidence);

-- 素材場景表
CREATE TABLE material_shots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  shot_number INT NOT NULL,
  start_time FLOAT NOT NULL,
  end_time FLOAT NOT NULL,
  duration FLOAT NOT NULL,
  tags TEXT[], -- PostgreSQL 陣列
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_material_shots_material ON material_shots(material_id);
CREATE INDEX idx_material_shots_time ON material_shots(start_time, end_time);
```

---

### 步驟 6: 設定環境變數

在 `backend/.env`:

```env
# GCP 設定
GCP_PROJECT_ID=cheapcut-dev

# 如果在本地開發,需要指定認證檔案
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

---

### 步驟 7: 註冊路由

在 `backend/src/index.ts` 加入:

```typescript
import analysisRoutes from './routes/analysis.routes';

app.use('/api/analysis', analysisRoutes);
```

---

### 步驟 8: 測試分析功能

建立測試腳本 `backend/scripts/test-video-analysis.ts`:

```typescript
/**
 * 測試 Video Analysis
 *
 * 使用方式:
 * ts-node scripts/test-video-analysis.ts gs://bucket/test.mp4
 */

import * as videoAnalysisService from '../src/services/video-analysis.service';
import * as tagConverterService from '../src/services/tag-converter.service';

async function testVideoAnalysis(gcsUri: string) {
  console.log('=== Video Analysis 測試 ===\n');

  try {
    // 1. 執行分析
    console.log('1. 執行影片分析...');
    const results = await videoAnalysisService.analyzeVideoComplete(gcsUri);

    // 2. 顯示標籤
    console.log('\n2. 偵測到的標籤:');
    results.labels.forEach((label, index) => {
      console.log(
        `  ${index + 1}. ${label.name} (信心度: ${(label.confidence * 100).toFixed(1)}%)`
      );
    });

    // 3. 顯示場景
    console.log('\n3. 偵測到的場景:');
    results.shots.forEach((shot) => {
      console.log(
        `  場景 ${shot.shotId}: ${shot.startTime}s - ${shot.endTime}s (${shot.duration}s)`
      );
    });

    // 4. 轉換標籤
    console.log('\n4. 轉換後的 CheapCut 標籤:');
    const tags = tagConverterService.convertLabelsToTags(results.labels);
    tags.forEach((tag, index) => {
      console.log(`  ${index + 1}. ${tag.tagName} (原始: ${tag.originalName})`);
    });

    console.log('\n✅ 測試完成!');
  } catch (error) {
    console.error('\n❌ 測試失敗:', error);
    process.exit(1);
  }
}

// 執行測試
const gcsUri = process.argv[2];
if (!gcsUri) {
  console.error('請提供 GCS URI');
  console.error('使用方式: ts-node test-video-analysis.ts gs://bucket/video.mp4');
  process.exit(1);
}

testVideoAnalysis(gcsUri);
```

執行測試:
```bash
# 先上傳測試影片到 GCS
gsutil cp test-video.mp4 gs://cheapcut-storage-dev/test/

# 執行測試
npx ts-node scripts/test-video-analysis.ts gs://cheapcut-storage-dev/test/test-video.mp4
```

---

### 步驟 9: 整合到素材上傳流程

修改 `backend/src/routes/upload.routes.ts`,在上傳完成後自動觸發分析:

```typescript
// 在 /upload/complete 端點中加入
router.post('/complete', authenticateUser, async (req, res) => {
  try {
    // ... 原有的上傳完成邏輯 ...

    // 觸發影片分析 (非同步,不等待完成)
    if (type === 'material') {
      const gcsUri = `gs://${process.env.GCS_BUCKET_NAME}/${filePath}`;

      // 呼叫分析 API (透過內部 service)
      startVideoAnalysis(fileId, gcsUri, userId).catch((error) => {
        console.error('自動分析失敗:', error);
        // 不影響上傳成功的回應
      });
    }

    res.json({
      success: true,
      fileSize: metadata.size,
      contentType: metadata.contentType,
      analysisStarted: type === 'material', // 告知前端分析已開始
    });
  } catch (error) {
    console.error('Upload complete error:', error);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
});

// 內部函式:開始分析
async function startVideoAnalysis(
  materialId: string,
  gcsUri: string,
  userId: string
) {
  // 建立分析記錄
  const result = await db.query(
    `INSERT INTO video_analysis (material_id, user_id, status)
     VALUES ($1, $2, 'processing')
     RETURNING id`,
    [materialId, userId]
  );

  const analysisId = result.rows[0].id;

  // 非同步執行分析
  analyzeVideoAsync(analysisId, materialId, gcsUri);
}
```

---

### 步驟 10: 前端整合範例

建立 `frontend/lib/api/analysis.ts`:

```typescript
/**
 * 前端 Analysis API
 */

import { apiGet, apiPost } from './client';

/**
 * 開始分析影片
 */
export async function startVideoAnalysis(materialId: string, gcsUri: string) {
  return apiPost('/api/analysis/start', { materialId, gcsUri });
}

/**
 * 查詢分析狀態
 */
export async function getAnalysisStatus(analysisId: string) {
  return apiGet(`/api/analysis/status/${analysisId}`);
}

/**
 * 取得分析結果
 */
export async function getAnalysisResults(materialId: string) {
  return apiGet(`/api/analysis/results/${materialId}`);
}

/**
 * 輪詢分析狀態直到完成
 */
export async function waitForAnalysisComplete(
  analysisId: string,
  onProgress?: (status: string) => void,
  maxWaitTime: number = 300000 // 5 分鐘
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await getAnalysisStatus(analysisId);

    if (onProgress) {
      onProgress(status.status);
    }

    if (status.status === 'completed') {
      return true;
    }

    if (status.status === 'failed') {
      throw new Error(`分析失敗: ${status.errorMessage}`);
    }

    // 等待 5 秒後再次檢查
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('分析逾時');
}
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 手動驗收測試

#### 測試 1: 啟動分析

```bash
curl -X POST http://localhost:8080/api/analysis/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "materialId": "uuid",
    "gcsUri": "gs://cheapcut-storage-dev/materials/test.mp4"
  }'
```

**預期回應**:
```json
{
  "success": true,
  "analysisId": "uuid",
  "message": "分析已開始,請稍候查詢結果"
}
```

---

#### 測試 2: 查詢狀態

```bash
curl http://localhost:8080/api/analysis/status/ANALYSIS_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**預期回應**:
```json
{
  "analysisId": "uuid",
  "status": "processing",
  "createdAt": "2025-10-07T10:00:00Z"
}
```

---

#### 測試 3: 取得結果

```bash
curl http://localhost:8080/api/analysis/results/MATERIAL_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**預期回應**:
```json
{
  "materialId": "uuid",
  "tags": [
    {
      "tagName": "人物",
      "confidence": 0.95,
      "startTime": 0,
      "endTime": 30
    }
  ],
  "shots": [
    {
      "shotNumber": 1,
      "startTime": 0,
      "endTime": 5.5,
      "duration": 5.5
    }
  ]
}
```

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 實作檢查
- [ ] Video Intelligence SDK 已安裝
- [ ] Video Analysis Service 已建立
- [ ] Tag Converter Service 已建立
- [ ] Analysis API 端點已實作
- [ ] 資料表已建立
- [ ] 環境變數已設定
- [ ] 路由已註冊

### 功能驗證
- [ ] 可以成功呼叫 Video Intelligence API
- [ ] 可以取得 Label Detection 結果
- [ ] 可以取得 Shot Detection 結果
- [ ] 標籤轉換邏輯正確
- [ ] 分析結果正確儲存到資料庫
- [ ] API 端點可以正常呼叫

### 測試
- [ ] 測試腳本執行成功
- [ ] 手動測試全部通過

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

## 🐛 常見問題與解決方案

### 問題 1: API 未啟用錯誤

**錯誤訊息:**
```
Error: 7 PERMISSION_DENIED: Video Intelligence API has not been enabled for project
```

**解決方案:**
```bash
# 啟用 API
gcloud services enable videointelligence.googleapis.com

# 確認已啟用
gcloud services list --enabled | grep videointelligence
```

---

### 問題 2: 找不到 GCS 檔案

**錯誤訊息:**
```
Error: 5 NOT_FOUND: Video file not found
```

**解決方案:**

1. **確認 GCS URI 格式正確**:
```typescript
// ✅ 正確
const gcsUri = 'gs://bucket-name/path/to/video.mp4';

// ❌ 錯誤
const gcsUri = 'https://storage.googleapis.com/bucket-name/path/to/video.mp4';
```

2. **確認檔案存在**:
```bash
gsutil ls gs://bucket-name/path/to/video.mp4
```

3. **確認 Service Account 有權限**:
```bash
gsutil iam get gs://bucket-name | grep videointelligence
```

---

### 問題 3: 分析時間過長

**問題**: 影片分析需要很長時間 (> 10 分鐘)

**原因**:
- 影片檔案太大
- 使用太多分析功能
- 網路速度慢

**解決方案:**

1. **只使用必要的功能**:
```typescript
// ❌ 使用所有功能 (慢且貴)
const features = [
  'LABEL_DETECTION',
  'SHOT_CHANGE_DETECTION',
  'OBJECT_TRACKING',
  'TEXT_DETECTION',
  'SPEECH_TRANSCRIPTION',
];

// ✅ 只用需要的功能
const features = [
  'LABEL_DETECTION',
  'SHOT_CHANGE_DETECTION',
];
```

2. **壓縮影片檔案**:
```bash
# 使用 FFmpeg 降低解析度
ffmpeg -i input.mp4 -vf scale=1280:720 -c:a copy output.mp4
```

---

### 問題 4: 成本過高

**問題**: Video AI 成本超出預期

**解決方案:**

1. **快取分析結果** (不要重複分析同一支影片):
```typescript
// 檢查是否已分析過
const existing = await db.query(
  `SELECT * FROM video_analysis
   WHERE material_id = $1 AND status = 'completed'`,
  [materialId]
);

if (existing.rows.length > 0) {
  return { message: '已分析過,使用快取結果' };
}
```

2. **只在必要時分析**:
```typescript
// 讓用戶選擇是否要分析
if (userWantsAutoTagging) {
  await startVideoAnalysis(materialId, gcsUri);
}
```

3. **使用更便宜的功能組合**:
- 只用 Label Detection ($0.10/min)
- 不用 Object Tracking ($0.15/min)

---

### 問題 5: 標籤品質不佳

**問題**: Video AI 回傳的標籤不準確或無用

**解決方案:**

1. **提高信心度門檻**:
```typescript
// 提高到 0.7 (只保留高信心度標籤)
const tags = convertLabelsToTags(labels, 0.7);
```

2. **過濾無用標籤**:
```typescript
// 黑名單
const USELESS_TAGS = ['video', 'media', 'product', 'technology'];

const filtered = tags.filter(
  (tag) => !USELESS_TAGS.includes(tag.tagName.toLowerCase())
);
```

3. **使用 categoryEntities** (父類別標籤通常更準確):
```typescript
const categoryTags = label.categoryEntities?.map((cat) => cat.description);
```

---

## 📚 延伸學習資源

如果你想深入了解 Video Intelligence API:

- **Video Intelligence 官方文件**: https://cloud.google.com/video-intelligence/docs
- **Features 說明**: https://cloud.google.com/video-intelligence/docs/features
- **定價與配額**: https://cloud.google.com/video-intelligence/pricing
- **Node.js 範例**: https://github.com/googleapis/nodejs-video-intelligence/tree/main/samples
- **最佳實踐**: https://cloud.google.com/video-intelligence/docs/best-practices

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ Video Intelligence API 已設定並可使用
2. ✅ Video Analysis Service 已實作
3. ✅ 標籤轉換邏輯已實作
4. ✅ API 端點已建立
5. ✅ 資料表已建立
6. ✅ 測試腳本執行成功
7. ✅ 可以成功分析影片並取得結果
8. ✅ 完成檢查清單都勾選

### 最終驗收指令

```bash
# 1. 上傳測試影片
gsutil cp test-video.mp4 gs://cheapcut-storage-dev/test/

# 2. 執行測試腳本
npx ts-node scripts/test-video-analysis.ts gs://cheapcut-storage-dev/test/test-video.mp4

# 3. 測試 API 端點
curl -X POST http://localhost:8080/api/analysis/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"materialId": "uuid", "gcsUri": "gs://cheapcut-storage-dev/test/test-video.mp4"}'
```

**恭喜!** 如果所有測試都通過,代表 Task 2.2 完成了!

---

**下一步**: 繼續 Task 2.3 - 標籤轉換與資料庫儲存

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
