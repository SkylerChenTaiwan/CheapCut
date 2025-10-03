# 步驟 5：資料流向設計

**狀態**：⬜️ 未開始
**前置依賴**：02-key-flows.md, 04-module-breakdown.md
**目標**：明確資料如何在系統中流動

---

## 資料流向圖（待填寫）

```
用戶輸入（腳本）
    ↓
  [前端驗證]
    ↓
  [API 接收]
    ↓
  [存入資料庫：任務狀態=pending]
    ↓
  [影片生成引擎接收]
    ↓
  [AI 處理：腳本 → 場景分解]
    ↓
  [AI 處理：場景 → 圖片 prompt]
    ↓
  [AI 生成圖片] → [暫存]
    ↓
  [AI 生成語音] → [暫存]
    ↓
  [FFmpeg 組裝影片]
    ↓
  [上傳至儲存服務]
    ↓
  [更新資料庫：任務狀態=completed, videoUrl]
    ↓
  [回傳給前端]
    ↓
用戶下載/預覽
```

---

## 核心資料實體

### 1. 用戶輸入資料
```typescript
interface UserInput {
  script: string           // 用戶輸入的腳本
  videoOptions: {
    duration?: number      // 目標時長
    style?: string         // 影片風格
    voiceType?: string     // 語音類型
    // ... 其他選項
  }
}
```

---

### 2. 任務資料
```typescript
interface VideoTask {
  taskId: string
  userId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number         // 0-100
  createdAt: Date

  // 輸入
  inputScript: string
  inputOptions: VideoOptions

  // 處理中的資料
  processedScript?: ProcessedScript
  generatedAssets?: Asset[]

  // 輸出
  videoUrl?: string
  thumbnailUrl?: string
  errorMessage?: string
}
```

---

### 3. 處理後的腳本資料
```typescript
interface ProcessedScript {
  scenes: Scene[]
}

interface Scene {
  sceneId: string
  duration: number         // 秒
  narration: string        // 旁白文字
  imagePrompt: string      // 圖片生成 prompt
  visualDescription: string
}
```

---

### 4. 素材資料
```typescript
interface Asset {
  assetId: string
  type: 'image' | 'audio' | 'video'
  source: 'ai-generated' | 'stock-library' | 'user-upload'
  url: string              // 臨時或永久 URL
  metadata: {
    prompt?: string
    duration?: number
    // ...
  }
}
```

---

### 5. 最終影片資料
```typescript
interface VideoOutput {
  videoId: string
  url: string
  thumbnailUrl: string
  duration: number
  fileSize: number
  format: string
  resolution: string
  createdAt: Date
}
```

---

## 資料流詳細步驟

### 階段 1：接收與驗證
**輸入**：`UserInput`

**處理**：
1. 前端驗證（格式、長度）
2. 送至 API
3. API 再次驗證
4. 建立 `VideoTask` 記錄（status: pending）

**輸出**：`taskId`

**資料位置**：
- 前端記憶體 → API 記憶體 → 資料庫

---

### 階段 2：腳本解析
**輸入**：`UserInput.script`

**處理**：
1. 呼叫 AI（GPT/Claude）分析腳本
2. 拆解成多個場景
3. 為每個場景生成：
   - 旁白文字
   - 視覺描述
   - 圖片生成 prompt

**輸出**：`ProcessedScript`

**資料位置**：
- API → AI 服務 → API 記憶體 → 資料庫（更新 task）

**成本**：每次呼叫 $______

---

### 階段 3：素材生成
**輸入**：`ProcessedScript.scenes[]`

**處理（並行）**：
- 對每個 scene：
  1. 呼叫圖片生成 API（DALL-E / SD）
  2. 呼叫語音合成 API（TTS）
  3. 下載生成的檔案
  4. 暫存到伺服器或物件儲存

**輸出**：`Asset[]`

**資料位置**：
- API → AI 服務 → 臨時儲存

**成本**：圖片 $______ × N，語音 $______ × N

---

### 階段 4：影片組裝
**輸入**：
- `ProcessedScript`（時間軸）
- `Asset[]`（素材）

**處理**：
1. 使用 FFmpeg / Remotion 組裝
2. 套用轉場、字幕
3. 輸出影片檔

**輸出**：暫存的影片檔案

**資料位置**：
- 影片生成引擎的暫存空間

---

### 階段 5：儲存與交付
**輸入**：暫存的影片檔

**處理**：
1. 上傳到物件儲存（S3/R2）
2. 生成縮圖
3. 更新 `VideoTask`（status: completed, videoUrl）
4. 清理暫存檔案

**輸出**：`VideoOutput`

**資料位置**：
- 暫存 → 物件儲存
- 資料庫更新

---

## 資料生命週期

### 暫存資料
| 資料 | 儲存位置 | 保留時間 | 清理時機 |
|------|----------|----------|----------|
| 生成的圖片（處理中） | 伺服器/tmp | 1小時 | 影片完成後 |
| 生成的語音（處理中） | 伺服器/tmp | 1小時 | 影片完成後 |
| 組裝中的影片 | 伺服器/tmp | 1小時 | 上傳完成後 |

### 永久資料
| 資料 | 儲存位置 | 保留時間 |
|------|----------|----------|
| 最終影片 | 物件儲存 | 7天 / 永久（依方案） |
| 任務記錄 | 資料庫 | 永久 |
| 用戶資料 | 資料庫 | 永久 |

---

## 資料同步策略

### 進度更新（任務處理中）
**方式 1：輪詢（Polling）**
- 前端每 N 秒呼叫 `GET /api/videos/:taskId`
- 優點：簡單
- 缺點：頻繁請求

**方式 2：WebSocket**
- 後端主動推送進度
- 優點：即時
- 缺點：複雜度高

**決定**：

---

## 資料安全與隱私

### 敏感資料
| 資料 | 是否敏感 | 保護措施 |
|------|----------|----------|
| 用戶腳本 | 是 | |
| 生成的影片 | 可能 | |
| API 金鑰 | 是 | 環境變數 |

---

## 資料流成本分析

| 階段 | 資料量 | 成本 |
|------|--------|------|
| 腳本解析（AI） | ~1000 tokens | $ |
| 圖片生成 | N 張 × 每張 | $ |
| 語音合成 | M 字 | $ |
| 暫存儲存 | ~100MB | 幾乎免費 |
| 永久儲存 | ~10MB/支 | $ |
| 流量（用戶下載） | ~10MB/次 | $ |

---

**完成檢查**：
- [ ] 明確定義了核心資料實體
- [ ] 畫出了完整的資料流向圖
- [ ] 定義了資料的生命週期
- [ ] 確定了資料同步策略
- [ ] 考慮了資料安全與成本

**完成後**：更新 `00-INDEX.md` 狀態，繼續步驟 6
