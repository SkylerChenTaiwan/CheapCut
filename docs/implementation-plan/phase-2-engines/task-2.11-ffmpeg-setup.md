# Task 2.11: FFmpeg 環境設定

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.11 |
| **Task 名稱** | FFmpeg 環境設定 |
| **所屬 Phase** | Phase 2: 核心引擎實作 |
| **預估時間** | 2-3 小時 (Dockerfile 1h + 測試 1h + 工具函式 1h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 2.10 (時間軸 JSON 生成) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的 FFmpeg 問題**:

1. **找到錯誤的關鍵字**
   ```
   ffmpeg: not found
          ^^^^^^^^^^^^  ← FFmpeg 沒安裝
   ```

2. **判斷錯誤類型**
   - `ffmpeg: not found` → FFmpeg 未安裝或路徑錯誤
   - `Permission denied` → 檔案權限問題
   - `Conversion failed` → 影片格式或參數問題
   - `No such file or directory` → 輸入檔案路徑錯誤

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"FFmpeg 不能用"  ← 太模糊
"Docker 錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"install FFmpeg in Docker Alpine"  ← 包含環境資訊
"FFmpeg Cloud Run Dockerfile" ← 明確的使用場景
"fluent-ffmpeg Node.js example" ← 具體的套件用法
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- FFmpeg: https://ffmpeg.org/documentation.html
- fluent-ffmpeg: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
- Cloud Run: https://cloud.google.com/run/docs

**優先順序 2: 範例專案**
- FFmpeg Docker Examples: https://github.com/jrottenberg/ffmpeg

---

### Step 3: 檢查環境設定

```bash
# 檢查 FFmpeg 是否安裝
ffmpeg -version

# 檢查 Docker 是否運行
docker ps

# 檢查 Cloud Run 服務狀態
gcloud run services list
```

---

## 🎯 功能描述

在 Cloud Run 容器中安裝並設定 FFmpeg,建立影片處理的基礎環境。

### 為什麼需要這個?

- 🎯 **問題**: 沒有影片處理工具,無法合成、剪輯、轉碼影片
- ✅ **解決**: 在 Cloud Run 中安裝 FFmpeg,提供強大的影片處理能力
- 💡 **比喻**: 就像木工需要鋸子和錘子,影片處理需要 FFmpeg

### 完成後你會有:

- ✅ Cloud Run 容器中已安裝 FFmpeg
- ✅ FFmpeg 工具函式封裝
- ✅ 基礎的影片處理能力(轉碼、剪輯、合併)
- ✅ 完整的錯誤處理機制
- ✅ FFmpeg 執行日誌記錄

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. FFmpeg

**是什麼**: 開源的多媒體處理工具,可以處理影片、音訊

**核心功能**:
- **轉碼**: 將影片從一種格式轉換為另一種格式
  - 例如: `MP4` → `WebM`
- **剪輯**: 截取影片的特定時間段
  - 例如: 從 10 秒到 20 秒
- **合併**: 將多個影片合併成一個
  - 例如: `video1.mp4` + `video2.mp4` → `merged.mp4`
- **疊加**: 加入字幕、浮水印、音訊

**為什麼選 FFmpeg**:
- 功能強大,幾乎支援所有影音格式
- 開源免費
- 社群龐大,遇到問題容易找解答
- 可以透過命令列操作,適合自動化

**基本指令**:
```bash
# 轉碼影片
ffmpeg -i input.mp4 -c:v libx264 output.mp4

# 剪輯影片 (從 10 秒開始,持續 5 秒)
ffmpeg -i input.mp4 -ss 10 -t 5 output.mp4

# 合併影片
ffmpeg -f concat -i filelist.txt -c copy output.mp4
```

### 2. Docker 與 Cloud Run

**Docker 是什麼**: 容器化技術,將應用程式打包成獨立的容器

**為什麼要用 Docker**:
- 環境一致性: 開發環境 = 生產環境
- 隔離性: 不同專案互不影響
- 可移植性: 可以在任何地方運行

**Cloud Run 是什麼**: Google Cloud 的無伺服器容器平台

**為什麼選 Cloud Run**:
- 自動擴展: 流量大時自動增加容器
- 按使用付費: 沒有流量時不收費
- 簡單部署: 只需要 Dockerfile

**Dockerfile 基礎**:
```dockerfile
# 選擇基礎映像
FROM node:18-alpine

# 安裝套件
RUN apk add --no-cache ffmpeg

# 複製程式碼
COPY . /app

# 設定工作目錄
WORKDIR /app

# 啟動應用
CMD ["node", "index.js"]
```

### 3. fluent-ffmpeg

**是什麼**: Node.js 的 FFmpeg 封裝函式庫

**為什麼要用**:
- 提供友善的 JavaScript API
- 不用直接寫 FFmpeg 命令列
- 內建錯誤處理
- 支援 Promise 和 Callback

**基本用法**:
```typescript
import ffmpeg from 'fluent-ffmpeg';

// 轉碼影片
ffmpeg('input.mp4')
  .output('output.mp4')
  .on('end', () => console.log('完成!'))
  .on('error', (err) => console.error('錯誤:', err))
  .run();
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.10: 時間軸 JSON 生成 (智能選片引擎已完成)

### 系統需求
- Docker
- Google Cloud SDK
- Node.js >= 18

### 環境檢查
```bash
# 檢查 Docker 版本
docker --version
# 應該顯示 Docker version 20.x 或更高

# 檢查 gcloud 版本
gcloud --version
# 應該顯示 Google Cloud SDK 400.0.0 或更高
```

---

## 📝 實作步驟

### 步驟 1: 修改 Dockerfile

在 `backend/` 目錄下,修改現有的 `Dockerfile`:

**為什麼要修改 Dockerfile?**
- Cloud Run 使用 Docker 容器部署
- 需要在容器中安裝 FFmpeg
- 使用 Alpine Linux 可以減小映像大小

```dockerfile
# 使用 Node.js 18 Alpine 基礎映像 (輕量級)
FROM node:18-alpine

# 安裝 FFmpeg
# Alpine 使用 apk 套件管理器
# --no-cache: 不保留快取,減少映像大小
RUN apk add --no-cache ffmpeg

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install --production

# 複製所有程式碼
COPY . .

# 編譯 TypeScript
RUN npm run build

# 暴露端口 (Cloud Run 會使用環境變數 PORT)
EXPOSE 8080

# 啟動應用
CMD ["npm", "start"]
```

**Alpine vs Ubuntu**:
- Alpine: 映像小 (~5MB),啟動快,但套件較少
- Ubuntu: 映像大 (~200MB),套件多,相容性好
- 我們選 Alpine 因為 FFmpeg 在 Alpine 中就有

---

### 步驟 2: 安裝 fluent-ffmpeg 套件

在 `backend/` 目錄下執行:

```bash
npm install fluent-ffmpeg
npm install --save-dev @types/fluent-ffmpeg
```

**為什麼需要這兩個套件?**
- `fluent-ffmpeg`: Node.js 的 FFmpeg 封裝
- `@types/fluent-ffmpeg`: TypeScript 型別定義

---

### 步驟 3: 建立 FFmpeg 工具函式

建立 `backend/src/lib/ffmpeg-utils.ts`:

```typescript
/**
 * FFmpeg 工具函式
 *
 * 為什麼需要這個?
 * - 封裝 FFmpeg 常用操作
 * - 統一錯誤處理
 * - 提供 Promise 介面
 */

import ffmpeg from 'fluent-ffmpeg';
import { Logger } from './logger';

const logger = new Logger('FFmpegUtils');

/**
 * 取得影片資訊
 *
 * @param videoPath - 影片檔案路徑
 * @returns 影片資訊 (時長、解析度、格式等)
 */
export async function getVideoInfo(videoPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        logger.error('取得影片資訊失敗', { error: err, videoPath });
        reject(err);
      } else {
        logger.info('成功取得影片資訊', { videoPath, duration: metadata.format.duration });
        resolve(metadata);
      }
    });
  });
}

/**
 * 剪輯影片
 *
 * @param inputPath - 輸入影片路徑
 * @param outputPath - 輸出影片路徑
 * @param startTime - 開始時間 (秒)
 * @param duration - 持續時間 (秒)
 */
export async function trimVideo(
  inputPath: string,
  outputPath: string,
  startTime: number,
  duration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.info('開始剪輯影片', { inputPath, startTime, duration });

    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(outputPath)
      .on('start', (commandLine) => {
        logger.debug('FFmpeg 指令', { command: commandLine });
      })
      .on('progress', (progress) => {
        logger.debug('剪輯進度', { percent: progress.percent });
      })
      .on('end', () => {
        logger.info('剪輯完成', { outputPath });
        resolve();
      })
      .on('error', (err) => {
        logger.error('剪輯失敗', { error: err, inputPath, outputPath });
        reject(err);
      })
      .run();
  });
}

/**
 * 合併多個影片
 *
 * @param inputPaths - 輸入影片路徑陣列
 * @param outputPath - 輸出影片路徑
 */
export async function mergeVideos(
  inputPaths: string[],
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.info('開始合併影片', { inputCount: inputPaths.length, outputPath });

    const command = ffmpeg();

    // 加入所有輸入影片
    inputPaths.forEach((inputPath) => {
      command.input(inputPath);
    });

    command
      .on('start', (commandLine) => {
        logger.debug('FFmpeg 指令', { command: commandLine });
      })
      .on('progress', (progress) => {
        logger.debug('合併進度', { percent: progress.percent });
      })
      .on('end', () => {
        logger.info('合併完成', { outputPath });
        resolve();
      })
      .on('error', (err) => {
        logger.error('合併失敗', { error: err, inputPaths, outputPath });
        reject(err);
      })
      .mergeToFile(outputPath);
  });
}

/**
 * 轉碼影片
 *
 * @param inputPath - 輸入影片路徑
 * @param outputPath - 輸出影片路徑
 * @param options - 轉碼選項
 */
export async function convertVideo(
  inputPath: string,
  outputPath: string,
  options: {
    videoCodec?: string;  // 預設: libx264
    audioCodec?: string;  // 預設: aac
    videoBitrate?: string; // 例如: '1000k'
    audioBitrate?: string; // 例如: '128k'
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.info('開始轉碼影片', { inputPath, outputPath, options });

    const command = ffmpeg(inputPath);

    // 設定影片編碼器
    if (options.videoCodec) {
      command.videoCodec(options.videoCodec);
    } else {
      command.videoCodec('libx264'); // 預設使用 H.264
    }

    // 設定音訊編碼器
    if (options.audioCodec) {
      command.audioCodec(options.audioCodec);
    } else {
      command.audioCodec('aac'); // 預設使用 AAC
    }

    // 設定位元率
    if (options.videoBitrate) {
      command.videoBitrate(options.videoBitrate);
    }
    if (options.audioBitrate) {
      command.audioBitrate(options.audioBitrate);
    }

    command
      .output(outputPath)
      .on('start', (commandLine) => {
        logger.debug('FFmpeg 指令', { command: commandLine });
      })
      .on('progress', (progress) => {
        logger.debug('轉碼進度', { percent: progress.percent });
      })
      .on('end', () => {
        logger.info('轉碼完成', { outputPath });
        resolve();
      })
      .on('error', (err) => {
        logger.error('轉碼失敗', { error: err, inputPath, outputPath });
        reject(err);
      })
      .run();
  });
}

/**
 * 檢查 FFmpeg 是否可用
 *
 * @returns FFmpeg 是否可用
 */
export async function checkFFmpegAvailable(): Promise<boolean> {
  try {
    await new Promise((resolve, reject) => {
      ffmpeg.getAvailableFormats((err, formats) => {
        if (err) reject(err);
        else resolve(formats);
      });
    });
    logger.info('FFmpeg 可用');
    return true;
  } catch (err) {
    logger.error('FFmpeg 不可用', { error: err });
    return false;
  }
}
```

---

### 步驟 4: 建立測試檔案

建立 `backend/src/lib/__tests__/ffmpeg-utils.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';
import {
  checkFFmpegAvailable,
  getVideoInfo,
  trimVideo,
  mergeVideos,
  convertVideo
} from '../ffmpeg-utils';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('FFmpeg Utils', () => {
  const testDataDir = path.join(__dirname, '../../../test-data');
  const testVideoPath = path.join(testDataDir, 'test-video.mp4');

  beforeAll(async () => {
    // 確保測試資料目錄存在
    await fs.mkdir(testDataDir, { recursive: true });
  });

  it('應該能檢查 FFmpeg 是否可用', async () => {
    const available = await checkFFmpegAvailable();
    expect(available).toBe(true);
  });

  // 注意: 以下測試需要實際的測試影片檔案
  // 在 CI/CD 中可能需要 skip 或使用 mock

  it.skip('應該能取得影片資訊', async () => {
    const info = await getVideoInfo(testVideoPath);
    expect(info).toBeDefined();
    expect(info.format.duration).toBeGreaterThan(0);
  });

  it.skip('應該能剪輯影片', async () => {
    const outputPath = path.join(testDataDir, 'trimmed.mp4');
    await trimVideo(testVideoPath, outputPath, 0, 5);

    // 檢查輸出檔案是否存在
    const exists = await fs.access(outputPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    // 清理
    await fs.unlink(outputPath);
  });
});
```

---

### 步驟 5: 本地測試

```bash
# 進入 backend 目錄
cd backend

# 執行測試
npm test -- ffmpeg-utils.test.ts

# 預期結果:
# ✓ 應該能檢查 FFmpeg 是否可用
```

**為什麼有些測試是 skip?**
- 因為需要實際的測試影片
- 在開發環境可以手動執行
- 在 CI/CD 環境可以準備測試影片

---

### 步驟 6: 建立 Docker 映像並測試

```bash
# 在 backend/ 目錄下

# 建立 Docker 映像
docker build -t cheapcut-backend .

# 執行容器並測試 FFmpeg
docker run --rm cheapcut-backend ffmpeg -version

# 預期輸出:
# ffmpeg version 6.x.x
# configuration: ...
# libavcodec     60.x.x
```

**如果看到版本資訊,代表 FFmpeg 已成功安裝!**

---

### 步驟 7: 部署到 Cloud Run

```bash
# 設定專案 ID
export PROJECT_ID=your-project-id

# 建立並推送映像到 Artifact Registry
gcloud builds submit --tag gcr.io/${PROJECT_ID}/cheapcut-backend

# 部署到 Cloud Run
gcloud run deploy cheapcut-backend \
  --image gcr.io/${PROJECT_ID}/cheapcut-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --timeout 300s

# 為什麼設定 2Gi 記憶體?
# - FFmpeg 處理影片需要較多記憶體
# - 預設的 256Mi 可能不夠

# 為什麼設定 300s 超時?
# - 影片處理可能需要較長時間
# - 預設的 60s 太短
```

---

### 步驟 8: 建立健康檢查端點

修改 `backend/src/index.ts`,加入 FFmpeg 檢查:

```typescript
import { checkFFmpegAvailable } from './lib/ffmpeg-utils';

// 健康檢查端點
app.get('/health', async (req, res) => {
  const ffmpegAvailable = await checkFFmpegAvailable();

  res.json({
    status: 'ok',
    ffmpeg: ffmpegAvailable ? 'available' : 'unavailable',
    timestamp: new Date().toISOString()
  });
});
```

**測試健康檢查**:
```bash
# 本地測試
curl http://localhost:8080/health

# Cloud Run 測試
curl https://your-service-url.run.app/health

# 預期輸出:
# {
#   "status": "ok",
#   "ffmpeg": "available",
#   "timestamp": "2025-10-07T..."
# }
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (3 tests): FFmpeg 安裝與基礎功能
- 📁 **Functional Acceptance** (4 tests): 工具函式功能完整性
- 📁 **E2E Acceptance** (2 tests): Cloud Run 環境測試

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-2.11

# 或分別執行
npm test -- task-2.11.basic.test.ts
npm test -- task-2.11.functional.test.ts
npm test -- task-2.11.e2e.test.ts
```

### 通過標準

- ✅ 所有 9 個測試通過 (3 + 4 + 2)
- ✅ Docker 映像可以成功建立
- ✅ FFmpeg 在容器中可以執行
- ✅ 健康檢查端點回應正常

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (3 tests)

測試檔案: `tests/phase-2/task-2.11.basic.test.ts`

1. ✓ FFmpeg 已安裝在容器中
2. ✓ fluent-ffmpeg 套件已安裝
3. ✓ FFmpeg 可以執行基本指令

### Functional Acceptance (4 tests)

測試檔案: `tests/phase-2/task-2.11.functional.test.ts`

1. ✓ 可以取得影片資訊
2. ✓ 可以剪輯影片
3. ✓ 可以合併影片
4. ✓ 可以轉碼影片

### E2E Acceptance (2 tests)

測試檔案: `tests/phase-2/task-2.11.e2e.test.ts`

1. ✓ Cloud Run 環境中 FFmpeg 正常運作
2. ✓ 健康檢查端點正確回報 FFmpeg 狀態

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### Dockerfile 設定
- [ ] Dockerfile 已加入 FFmpeg 安裝指令
- [ ] 使用 Alpine Linux 減小映像大小
- [ ] 記憶體設定為 2Gi
- [ ] 超時設定為 300s

### 套件安裝
- [ ] `fluent-ffmpeg` 已安裝
- [ ] `@types/fluent-ffmpeg` 已安裝
- [ ] package.json 已更新

### 工具函式
- [ ] `lib/ffmpeg-utils.ts` 已建立
- [ ] `getVideoInfo()` 函式已實作
- [ ] `trimVideo()` 函式已實作
- [ ] `mergeVideos()` 函式已實作
- [ ] `convertVideo()` 函式已實作
- [ ] `checkFFmpegAvailable()` 函式已實作

### 測試
- [ ] 單元測試已建立
- [ ] 本地測試通過
- [ ] Docker 測試通過

### 部署
- [ ] Docker 映像可以成功建立
- [ ] 已部署到 Cloud Run
- [ ] 健康檢查端點正常運作

### 驗收測試
- [ ] Basic Verification 測試通過 (3/3)
- [ ] Functional Acceptance 測試通過 (4/4)
- [ ] E2E Acceptance 測試通過 (2/2)
- [ ] **總計: 9/9 測試通過**

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `ffmpeg: not found` | FFmpeg 未安裝 | 檢查 Dockerfile,確認安裝指令 |
| `Permission denied` | 檔案權限問題 | 使用 `chmod +x` 或檢查 Docker volume 權限 |
| `No such file or directory` | 路徑錯誤 | 確認檔案路徑正確,使用絕對路徑 |
| `Conversion failed` | FFmpeg 參數錯誤 | 檢查 FFmpeg 指令參數 |
| `Docker build failed` | Dockerfile 語法錯誤 | 檢查 Dockerfile 語法 |

---

### 問題 1: Docker 建立映像失敗

**錯誤訊息:**
```
ERROR: failed to solve: process "/bin/sh -c apk add --no-cache ffmpeg" did not complete successfully
```

**解決方案:**

可能是網路問題,重試或更換 Alpine 鏡像源:

```dockerfile
# 在 Dockerfile 的 RUN 指令前加入
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 然後再安裝 FFmpeg
RUN apk add --no-cache ffmpeg
```

---

### 問題 2: FFmpeg 在容器中無法執行

**錯誤訊息:**
```
Error: Cannot find ffmpeg
```

**解決方案:**

確認 FFmpeg 路徑設定:

```typescript
import ffmpeg from 'fluent-ffmpeg';

// 明確設定 FFmpeg 路徑 (Alpine 預設路徑)
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
ffmpeg.setFfprobePath('/usr/bin/ffprobe');
```

或檢查 FFmpeg 是否真的安裝成功:

```bash
# 進入容器檢查
docker run --rm -it cheapcut-backend sh
which ffmpeg
# 應該顯示: /usr/bin/ffmpeg
```

---

### 問題 3: 記憶體不足

**錯誤訊息:**
```
Error: Cannot allocate memory
```

**解決方案:**

增加 Cloud Run 記憶體配置:

```bash
gcloud run deploy cheapcut-backend \
  --image gcr.io/${PROJECT_ID}/cheapcut-backend \
  --memory 4Gi  # 從 2Gi 增加到 4Gi
```

或在程式碼中處理大檔案時使用串流:

```typescript
// ❌ 不好: 一次讀取整個檔案
const buffer = await fs.readFile(videoPath);

// ✅ 好: 使用串流
const stream = fs.createReadStream(videoPath);
```

---

### 問題 4: 影片處理超時

**錯誤訊息:**
```
Error: Timeout waiting for process to complete
```

**解決方案:**

1. **增加 Cloud Run 超時時間**:
```bash
gcloud run deploy cheapcut-backend \
  --timeout 600s  # 增加到 10 分鐘
```

2. **使用非同步處理**:
- 不要在 HTTP 請求中直接處理影片
- 使用工作佇列 (Cloud Tasks) 非同步處理
- 回傳工作 ID,讓前端輪詢進度

---

### 問題 5: FFmpeg 輸出品質不佳

**問題**: 輸出影片模糊或檔案太大

**解決方案:**

調整 FFmpeg 參數:

```typescript
// 高品質設定
await convertVideo(inputPath, outputPath, {
  videoCodec: 'libx264',
  videoBitrate: '2000k',  // 增加位元率
  audioCodec: 'aac',
  audioBitrate: '192k'
});

// 或使用 preset
ffmpeg(inputPath)
  .videoCodec('libx264')
  .addOption('-preset', 'slow')  // slow = 高品質
  .addOption('-crf', '18')       // 18 = 高品質 (範圍: 0-51)
  .output(outputPath)
  .run();
```

**品質 vs 速度 tradeoff**:
- `preset`: ultrafast, fast, medium, slow, veryslow
- `crf`: 0 (最佳) - 51 (最差), 建議 18-28
- 品質越高,處理時間越長,檔案越大

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **FFmpeg 官方文件**: https://ffmpeg.org/documentation.html
- **fluent-ffmpeg GitHub**: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
- **FFmpeg 實用指令集**: https://github.com/leandromoreira/ffmpeg-libav-tutorial
- **Docker 最佳實踐**: https://docs.docker.com/develop/dev-best-practices/
- **Cloud Run 文件**: https://cloud.google.com/run/docs

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (9/9)
3. ✅ 完成檢查清單都勾選
4. ✅ FFmpeg 在 Cloud Run 中正常運作
5. ✅ 健康檢查端點回應正常

### 最終驗收指令

```bash
# 進入 backend 目錄
cd backend

# 執行驗收測試
npm run verify:task task-2.11

# 測試 Docker 映像
docker build -t cheapcut-backend .
docker run --rm cheapcut-backend ffmpeg -version

# 測試 Cloud Run 部署
curl https://your-service-url.run.app/health

# 如果全部通過,你應該看到:
# ✓ Basic Verification: 3/3 passed
# ✓ Functional Acceptance: 4/4 passed
# ✓ E2E Acceptance: 2/2 passed
# ✓ Docker build: success
# ✓ FFmpeg version: 6.x.x
# ✓ Health check: {"status":"ok","ffmpeg":"available"}
```

**恭喜!** 如果看到上面的輸出,代表 Task 2.11 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 遇到的主要問題與解決方法
- FFmpeg 處理效能數據
- Docker 映像大小
- 下次可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: Task 2.12 - 影片合成實作

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
