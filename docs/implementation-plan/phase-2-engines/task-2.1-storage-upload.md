# Task 2.1: GCS 儲存與上傳

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.1 |
| **Task 名稱** | GCS 儲存與上傳 |
| **所屬 Phase** | Phase 2: Engines |
| **預估時間** | 3-4 小時 (設定 1h + 實作 2h + 測試 1h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 1.1 (GCP 專案建立) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的 GCS 問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: (gcloud.auth.application-default.login)
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 認證問題
   ```

2. **判斷錯誤類型**
   - `403 Forbidden` → 權限不足
   - `404 Not Found` → Bucket 不存在
   - `401 Unauthorized` → 認證失效
   - `Storage quota exceeded` → 儲存空間不足
   - `Invalid bucket name` → Bucket 命名不符規則

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"GCS 上傳不了"  ← 太模糊
"儲存失敗" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"GCS signed URL upload 403 forbidden"  ← 包含具體錯誤
"Google Cloud Storage Node.js authentication" ← 明確的技術棧
"GCS bucket CORS configuration" ← 具體的設定問題
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- GCS 官方文件: https://cloud.google.com/storage/docs
- Node.js Client Library: https://cloud.google.com/storage/docs/reference/libraries#client-libraries-install-nodejs
- Signed URL 說明: https://cloud.google.com/storage/docs/access-control/signed-urls

**優先順序 2: 官方範例**
- GCS Node.js Samples: https://github.com/googleapis/nodejs-storage

---

### Step 3: 檢查環境設定

```bash
# 檢查 gcloud 是否安裝
gcloud --version

# 檢查當前認證狀態
gcloud auth list

# 檢查專案設定
gcloud config get-value project

# 檢查 bucket 是否存在
gsutil ls
```

---

## 🎯 功能描述

建立 CheapCut 的影片儲存系統,負責處理用戶上傳的影片素材和生成的成品影片。

### 為什麼需要這個?

- 🎯 **問題**: 影片檔案很大,不能直接存在資料庫裡,需要專門的儲存空間
- ✅ **解決**: 使用 Google Cloud Storage 提供可靠的雲端儲存
- 💡 **比喻**: 就像把影片放到一個超大的雲端硬碟,隨時可以取用

### 完成後你會有:

- ✅ GCS Bucket 已建立並設定完成
- ✅ 安全的影片上傳機制 (Signed URL)
- ✅ 統一的檔案命名規則
- ✅ 完整的上傳 API 端點
- ✅ 檔案 metadata 追蹤系統
- ✅ 自動清理過期檔案機制

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. Google Cloud Storage (GCS)

**是什麼**: Google 提供的物件儲存服務,類似 AWS S3

**核心概念**:
- **Bucket**: 儲存空間的容器,像一個資料夾
  - 每個 Bucket 有唯一名稱 (全球唯一)
  - 可以設定地區、權限、生命週期
- **Object**: 儲存在 Bucket 裡的檔案
  - 每個檔案有路徑 (key)
  - 可以有 metadata (檔案資訊)
- **Signed URL**: 臨時的簽名網址
  - 允許沒有 GCP 帳號的用戶上傳/下載
  - 有時效性 (通常 15 分鐘)

**為什麼選 GCS**:
- 整合 GCP 生態系 (與 Cloud Run 同一個專案)
- 價格透明,有免費額度 (5GB/月)
- 效能穩定,全球 CDN

### 2. Signed URL 機制

**是什麼**: 一種安全的檔案上傳/下載方式

**運作流程**:
```
1. 前端向後端請求上傳權限
2. 後端產生 Signed URL (包含簽名和過期時間)
3. 前端直接用 Signed URL 上傳到 GCS
4. 上傳完成後通知後端
```

**為什麼要用 Signed URL**:
- 前端不需要 GCP 憑證 (更安全)
- 檔案直接上傳到 GCS (不經過後端,省流量)
- 可以設定過期時間 (避免被濫用)

**與一般上傳的差異**:
```
一般上傳: 前端 → 後端 → GCS (後端承受流量壓力)
Signed URL: 前端 → GCS (後端只負責簽名,不處理檔案)
```

### 3. 檔案命名規則

**為什麼需要規則**: 避免檔名衝突,方便管理

**我們的命名規則**:
```
materials/{userId}/{timestamp}_{randomId}.{ext}
outputs/{userId}/{jobId}.mp4
```

**範例**:
```
materials/user_123/1704672000_abc123.mp4
outputs/user_123/job_456.mp4
```

### 4. CORS 設定

**是什麼**: Cross-Origin Resource Sharing (跨來源資源共享)

**為什麼需要**:
- 前端網頁 (如 https://cheapcut.com) 要直接上傳到 GCS
- 瀏覽器預設會阻擋跨網域請求
- 需要在 GCS 設定允許的來源

**設定範例**:
```json
[
  {
    "origin": ["https://cheapcut.com"],
    "method": ["GET", "POST", "PUT"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 1.1: GCP 專案已建立
- ✅ Task 1.2: 資料庫已設定

### 系統需求
- GCP 專案已啟用 Cloud Storage API
- gcloud CLI 已安裝
- Node.js >= 18
- 已設定 GCP 認證

### 環境檢查
```bash
# 檢查 gcloud
gcloud --version

# 檢查認證
gcloud auth list

# 檢查專案
gcloud config get-value project

# 啟用 Cloud Storage API
gcloud services enable storage-api.googleapis.com
```

---

## 📝 實作步驟

### 步驟 1: 建立 GCS Bucket

在 GCP Console 或使用 gcloud CLI:

```bash
# 設定變數
PROJECT_ID="cheapcut-dev"
BUCKET_NAME="cheapcut-storage-dev"
REGION="asia-east1"  # 台灣

# 建立 Bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME

# 確認建立成功
gsutil ls
```

**Bucket 設定說明**:
- `-c STANDARD`: 標準儲存類別 (適合經常存取的檔案)
- `-l asia-east1`: 台灣區域 (降低延遲)
- 命名規則: 使用專案名稱 + 環境 (dev/prod)

**設定 Bucket 權限**:
```bash
# 設定 Bucket 為私有 (預設)
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
```

---

### 步驟 2: 設定 CORS

建立 `cors.json`:

```json
[
  {
    "origin": ["http://localhost:3000", "https://cheapcut.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
```

**套用 CORS 設定**:
```bash
gsutil cors set cors.json gs://$BUCKET_NAME

# 確認設定
gsutil cors get gs://$BUCKET_NAME
```

---

### 步驟 3: 安裝 GCS 套件

在後端專案中安裝:

```bash
cd backend
npm install @google-cloud/storage uuid
npm install --save-dev @types/uuid
```

---

### 步驟 4: 建立 Storage Service

建立 `backend/src/services/storage.service.ts`:

```typescript
/**
 * Storage Service
 *
 * 負責處理所有與 GCS 相關的操作
 *
 * 功能:
 * - 產生 Signed URL (上傳/下載)
 * - 檔案命名管理
 * - 檔案刪除
 */

import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// 初始化 GCS 客戶端
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'cheapcut-storage-dev';
const bucket = storage.bucket(BUCKET_NAME);

/**
 * 檔案類型
 */
export type FileType = 'material' | 'output' | 'voiceover' | 'thumbnail';

/**
 * 產生檔案路徑
 *
 * 命名規則:
 * - materials/{userId}/{timestamp}_{randomId}.{ext}
 * - outputs/{userId}/{jobId}.mp4
 * - voiceovers/{userId}/{timestamp}_{randomId}.mp3
 * - thumbnails/{materialId}/{segmentId}.jpg
 *
 * @param type - 檔案類型
 * @param userId - 用戶 ID
 * @param filename - 原始檔名
 * @param options - 額外選項
 */
function generateFilePath(
  type: FileType,
  userId: string,
  filename: string,
  options?: { jobId?: string; materialId?: string; segmentId?: string }
): string {
  const timestamp = Date.now();
  const randomId = uuidv4().substring(0, 8);
  const ext = filename.split('.').pop();

  switch (type) {
    case 'material':
      return `materials/${userId}/${timestamp}_${randomId}.${ext}`;
    case 'output':
      return `outputs/${userId}/${options?.jobId || randomId}.mp4`;
    case 'voiceover':
      return `voiceovers/${userId}/${timestamp}_${randomId}.mp3`;
    case 'thumbnail':
      return `thumbnails/${options?.materialId}/${options?.segmentId || randomId}.jpg`;
    default:
      throw new Error(`Unknown file type: ${type}`);
  }
}

/**
 * 產生上傳用的 Signed URL
 *
 * @param type - 檔案類型
 * @param userId - 用戶 ID
 * @param filename - 原始檔名
 * @param contentType - MIME type
 * @param options - 額外選項
 * @returns { url, filePath } - 上傳網址和檔案路徑
 */
export async function generateUploadUrl(
  type: FileType,
  userId: string,
  filename: string,
  contentType: string,
  options?: { jobId?: string; materialId?: string; segmentId?: string }
): Promise<{ url: string; filePath: string }> {
  // 產生檔案路徑
  const filePath = generateFilePath(type, userId, filename, options);
  const file = bucket.file(filePath);

  // 產生 Signed URL (15 分鐘有效)
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 分鐘
    contentType,
  });

  return { url, filePath };
}

/**
 * 產生下載用的 Signed URL
 *
 * @param filePath - GCS 檔案路徑
 * @param expiresInMinutes - 過期時間 (分鐘)
 * @returns 下載網址
 */
export async function generateDownloadUrl(
  filePath: string,
  expiresInMinutes: number = 60
): Promise<string> {
  const file = bucket.file(filePath);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });

  return url;
}

/**
 * 刪除檔案
 *
 * @param filePath - GCS 檔案路徑
 */
export async function deleteFile(filePath: string): Promise<void> {
  const file = bucket.file(filePath);
  await file.delete();
}

/**
 * 檢查檔案是否存在
 *
 * @param filePath - GCS 檔案路徑
 * @returns 是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  const file = bucket.file(filePath);
  const [exists] = await file.exists();
  return exists;
}

/**
 * 取得檔案 metadata
 *
 * @param filePath - GCS 檔案路徑
 * @returns 檔案資訊
 */
export async function getFileMetadata(filePath: string) {
  const file = bucket.file(filePath);
  const [metadata] = await file.getMetadata();

  return {
    size: parseInt(metadata.size || '0'),
    contentType: metadata.contentType,
    createdAt: metadata.timeCreated,
    md5Hash: metadata.md5Hash,
  };
}

/**
 * 複製檔案
 *
 * @param sourcePath - 來源路徑
 * @param destPath - 目標路徑
 */
export async function copyFile(
  sourcePath: string,
  destPath: string
): Promise<void> {
  const sourceFile = bucket.file(sourcePath);
  const destFile = bucket.file(destPath);

  await sourceFile.copy(destFile);
}
```

---

### 步驟 5: 建立上傳 API 端點

建立 `backend/src/routes/upload.routes.ts`:

```typescript
/**
 * Upload Routes
 *
 * 提供檔案上傳相關的 API 端點
 */

import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import * as storageService from '../services/storage.service';
import { db } from '../db';

const router = express.Router();

/**
 * POST /api/upload/request
 *
 * 請求上傳權限
 *
 * Request Body:
 * {
 *   "type": "material" | "voiceover",
 *   "filename": "video.mp4",
 *   "contentType": "video/mp4"
 * }
 *
 * Response:
 * {
 *   "uploadUrl": "https://storage.googleapis.com/...",
 *   "fileId": "uuid",
 *   "filePath": "materials/user_123/...",
 *   "expiresIn": 900
 * }
 */
router.post('/request', authenticateUser, async (req, res) => {
  try {
    const { type, filename, contentType } = req.body;
    const userId = req.user!.id;

    // 驗證參數
    if (!type || !filename || !contentType) {
      return res.status(400).json({
        error: 'Missing required fields: type, filename, contentType',
      });
    }

    // 驗證檔案類型
    const allowedTypes = ['material', 'voiceover'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Allowed: ${allowedTypes.join(', ')}`,
      });
    }

    // 產生上傳 URL
    const { url: uploadUrl, filePath } = await storageService.generateUploadUrl(
      type,
      userId,
      filename,
      contentType
    );

    // 在資料庫建立記錄 (pending 狀態)
    const result = await db.query(
      `INSERT INTO uploads (user_id, file_type, file_path, filename, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id, file_path`,
      [userId, type, filePath, filename]
    );

    const fileId = result.rows[0].id;

    res.json({
      uploadUrl,
      fileId,
      filePath,
      expiresIn: 900, // 15 分鐘
    });
  } catch (error) {
    console.error('Upload request error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * POST /api/upload/complete
 *
 * 通知上傳完成
 *
 * Request Body:
 * {
 *   "fileId": "uuid",
 *   "filePath": "materials/user_123/..."
 * }
 */
router.post('/complete', authenticateUser, async (req, res) => {
  try {
    const { fileId, filePath } = req.body;
    const userId = req.user!.id;

    // 驗證參數
    if (!fileId || !filePath) {
      return res.status(400).json({
        error: 'Missing required fields: fileId, filePath',
      });
    }

    // 檢查檔案是否存在
    const exists = await storageService.fileExists(filePath);
    if (!exists) {
      return res.status(400).json({ error: 'File not found in storage' });
    }

    // 取得檔案 metadata
    const metadata = await storageService.getFileMetadata(filePath);

    // 更新資料庫
    await db.query(
      `UPDATE uploads
       SET status = 'completed',
           file_size = $1,
           uploaded_at = NOW()
       WHERE id = $2 AND user_id = $3`,
      [metadata.size, fileId, userId]
    );

    res.json({
      success: true,
      fileSize: metadata.size,
      contentType: metadata.contentType,
    });
  } catch (error) {
    console.error('Upload complete error:', error);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
});

/**
 * DELETE /api/upload/:fileId
 *
 * 刪除已上傳的檔案
 */
router.delete('/:fileId', authenticateUser, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user!.id;

    // 從資料庫取得檔案路徑
    const result = await db.query(
      `SELECT file_path FROM uploads
       WHERE id = $1 AND user_id = $2`,
      [fileId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = result.rows[0].file_path;

    // 刪除 GCS 檔案
    await storageService.deleteFile(filePath);

    // 更新資料庫
    await db.query(
      `UPDATE uploads SET status = 'deleted' WHERE id = $1`,
      [fileId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
```

---

### 步驟 6: 建立資料表

在資料庫執行 (`migrations/002_create_uploads_table.sql`):

```sql
-- 上傳記錄表
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  file_type VARCHAR(20) NOT NULL, -- 'material', 'voiceover'
  file_path VARCHAR(500) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'deleted'
  uploaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_status ON uploads(status);
CREATE INDEX idx_uploads_created_at ON uploads(created_at);

-- 清理過期上傳 (超過 24 小時未完成的)
CREATE OR REPLACE FUNCTION cleanup_pending_uploads()
RETURNS void AS $$
BEGIN
  DELETE FROM uploads
  WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
```

---

### 步驟 7: 前端上傳範例

建立 `frontend/lib/upload.ts`:

```typescript
/**
 * 前端上傳工具
 */

interface UploadOptions {
  onProgress?: (progress: number) => void;
}

/**
 * 上傳檔案到 GCS
 *
 * @param file - 檔案物件
 * @param type - 檔案類型
 * @param options - 上傳選項
 */
export async function uploadFile(
  file: File,
  type: 'material' | 'voiceover',
  options: UploadOptions = {}
): Promise<{ fileId: string; filePath: string }> {
  // Step 1: 請求上傳權限
  const requestRes = await fetch('/api/upload/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      type,
      filename: file.name,
      contentType: file.type,
    }),
  });

  if (!requestRes.ok) {
    throw new Error('Failed to request upload permission');
  }

  const { uploadUrl, fileId, filePath } = await requestRes.json();

  // Step 2: 上傳檔案到 GCS
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 監聽上傳進度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && options.onProgress) {
        const progress = (e.loaded / e.total) * 100;
        options.onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });

  // Step 3: 通知後端上傳完成
  const completeRes = await fetch('/api/upload/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      fileId,
      filePath,
    }),
  });

  if (!completeRes.ok) {
    throw new Error('Failed to complete upload');
  }

  return { fileId, filePath };
}
```

---

### 步驟 8: 設定環境變數

在 `backend/.env`:

```env
# GCP 設定
GCP_PROJECT_ID=cheapcut-dev
GCS_BUCKET_NAME=cheapcut-storage-dev

# 如果在本地開發,需要指定認證檔案
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

---

### 步驟 9: 註冊路由

在 `backend/src/index.ts` 加入:

```typescript
import uploadRoutes from './routes/upload.routes';

app.use('/api/upload', uploadRoutes);
```

---

### 步驟 10: 測試上傳功能

執行測試:
```bash
npm test -- upload
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 手動驗收測試

#### 測試 1: Bucket 設定檢查
```bash
# 確認 Bucket 存在
gsutil ls | grep cheapcut-storage

# 確認 CORS 設定
gsutil cors get gs://cheapcut-storage-dev
```

**通過標準**: 看到 Bucket 和 CORS 設定

---

#### 測試 2: 上傳權限請求
```bash
curl -X POST http://localhost:8080/api/upload/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "material",
    "filename": "test.mp4",
    "contentType": "video/mp4"
  }'
```

**預期回應**:
```json
{
  "uploadUrl": "https://storage.googleapis.com/...",
  "fileId": "uuid",
  "filePath": "materials/user_123/...",
  "expiresIn": 900
}
```

---

#### 測試 3: 實際上傳檔案
```bash
# 使用前一步取得的 uploadUrl
curl -X PUT "UPLOAD_URL" \
  -H "Content-Type: video/mp4" \
  --data-binary @test.mp4
```

**通過標準**: 回應 200 OK

---

#### 測試 4: 完成上傳通知
```bash
curl -X POST http://localhost:8080/api/upload/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fileId": "uuid",
    "filePath": "materials/user_123/..."
  }'
```

**預期回應**:
```json
{
  "success": true,
  "fileSize": 1048576,
  "contentType": "video/mp4"
}
```

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### GCS 設定
- [ ] GCS Bucket 已建立
- [ ] CORS 設定已套用
- [ ] Bucket 權限設定正確

### 後端實作
- [ ] Storage Service 已建立
- [ ] 上傳 API 端點已實作
- [ ] 資料表已建立
- [ ] 環境變數已設定
- [ ] 路由已註冊

### 功能驗證
- [ ] 可以產生 Signed URL
- [ ] 可以實際上傳檔案
- [ ] 資料庫記錄正確
- [ ] 檔案 metadata 正確

### 安全性
- [ ] Signed URL 有時效性
- [ ] 用戶只能上傳自己的檔案
- [ ] 檔案類型驗證

### 測試
- [ ] 單元測試通過
- [ ] 手動測試通過

---

## 🐛 常見問題與解決方案

### 問題 1: 403 Forbidden 錯誤

**錯誤訊息:**
```
Error: 403 Forbidden
The caller does not have permission
```

**可能原因**:
1. Service Account 權限不足
2. Bucket 不存在
3. IAM 設定錯誤

**解決方案**:

```bash
# 確認 Service Account 有權限
gcloud projects get-iam-policy $PROJECT_ID

# 給予 Storage Admin 權限
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/storage.admin"

# 或只給特定 Bucket 權限
gsutil iam ch serviceAccount:YOUR_SERVICE_ACCOUNT:roles/storage.objectAdmin \
  gs://$BUCKET_NAME
```

---

### 問題 2: CORS 錯誤

**錯誤訊息:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**解決方案**:

1. **確認 CORS 設定**:
```bash
gsutil cors get gs://$BUCKET_NAME
```

2. **重新設定 CORS**:
```bash
gsutil cors set cors.json gs://$BUCKET_NAME
```

3. **確認前端 origin 在允許清單中**:
```json
{
  "origin": ["http://localhost:3000"],
  "method": ["GET", "POST", "PUT"]
}
```

---

### 問題 3: Signed URL 過期

**錯誤訊息:**
```
Error: Request URL has expired
```

**原因**: Signed URL 預設 15 分鐘過期

**解決方案**:

1. **延長過期時間** (在 storage.service.ts):
```typescript
expires: Date.now() + 60 * 60 * 1000, // 1 小時
```

2. **前端重新請求**:
```typescript
// 檢查是否過期
const isExpired = Date.now() > requestTime + 15 * 60 * 1000;
if (isExpired) {
  // 重新請求 upload URL
}
```

---

### 問題 4: 上傳大檔案失敗

**錯誤訊息:**
```
Error: Request entity too large
```

**解決方案**:

1. **使用分段上傳 (Resumable Upload)**:
```typescript
const file = bucket.file(filePath);
const stream = file.createWriteStream({
  resumable: true,
  metadata: {
    contentType: contentType,
  },
});
```

2. **設定 timeout**:
```typescript
const [url] = await file.getSignedUrl({
  version: 'v4',
  action: 'write',
  expires: Date.now() + 60 * 60 * 1000, // 1 小時
  contentType,
});
```

---

### 問題 5: 本地開發認證問題

**錯誤訊息:**
```
Error: Could not load the default credentials
```

**解決方案**:

1. **使用 gcloud auth**:
```bash
gcloud auth application-default login
```

2. **或使用 Service Account Key**:
```bash
# 下載 Service Account Key
gcloud iam service-accounts keys create key.json \
  --iam-account=YOUR_SERVICE_ACCOUNT

# 設定環境變數
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

3. **在 .env 設定**:
```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **GCS 官方文件**: https://cloud.google.com/storage/docs
- **Signed URL 詳解**: https://cloud.google.com/storage/docs/access-control/signed-urls
- **Node.js Client Library**: https://googleapis.dev/nodejs/storage/latest/
- **CORS 設定指南**: https://cloud.google.com/storage/docs/configuring-cors
- **最佳實踐**: https://cloud.google.com/storage/docs/best-practices

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ GCS Bucket 已建立並設定
2. ✅ CORS 已正確設定
3. ✅ Storage Service 已實作
4. ✅ 上傳 API 可以正常運作
5. ✅ 資料庫記錄正確
6. ✅ 所有測試通過

### 最終驗收指令

```bash
# 1. 確認 Bucket
gsutil ls | grep cheapcut-storage

# 2. 確認 CORS
gsutil cors get gs://cheapcut-storage-dev

# 3. 執行測試
npm test -- upload

# 4. 啟動服務測試完整流程
npm run dev
```

**恭喜!** 如果所有驗收都通過,代表 Task 2.1 完成了!

---

**下一步**: 繼續 Task 2.2 - Google Video AI 整合

---

**文件版本**: 1.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
