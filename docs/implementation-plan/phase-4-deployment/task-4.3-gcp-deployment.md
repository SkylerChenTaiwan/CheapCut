# Task 4.3: GCP Cloud Run 部署

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 4.3 |
| **Task 名稱** | GCP Cloud Run 部署 |
| **所屬 Phase** | Phase 4: 測試與部署 |
| **預估時間** | 5-6 小時 (環境設定 2h + 部署設定 2h + 測試除錯 2h) |
| **難度** | ⭐⭐⭐⭐ 中等偏難 |
| **前置 Task** | Task 4.2 (效能測試) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的 GCP 部署問題**:

1. **找到錯誤的關鍵字**
   ```
   ERROR: (gcloud.run.deploy) Cloud Run error: Container failed to start
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 容器啟動失敗
   ```

2. **判斷問題類型**
   - `Container failed to start` → 應用程式無法啟動,檢查 Dockerfile 和啟動腳本
   - `Permission denied` → 權限不足,檢查 IAM 設定
   - `Timeout` → 啟動時間過長,檢查應用程式初始化邏輯
   - `Out of memory` → 記憶體不足,增加記憶體配置
   - `Invalid image` → Docker image 有問題,重新建置

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"Cloud Run 部署失敗"  ← 太模糊
"GCP 錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"Cloud Run container failed to start node.js" ← 包含平台和技術棧
"gcloud run deploy permission denied" ← 具體錯誤訊息
"Cloud Run environment variables secret manager" ← 說明要解決的問題
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件**
- Cloud Run 文件: https://cloud.google.com/run/docs
- GCP 最佳實踐: https://cloud.google.com/run/docs/tips
- Troubleshooting: https://cloud.google.com/run/docs/troubleshooting

**優先順序 2: GCP 社群**
- Google Cloud Community: https://www.googlecloudcommunity.com/
- Stack Overflow (加上 `[google-cloud-run]` tag)

**優先順序 3: GitHub Issues**
- 搜尋: `site:github.com cloud run [錯誤訊息]`

---

### Step 3: 檢查部署狀態

Cloud Run 部署失敗時,先檢查基本狀態:

```bash
# 檢查 Cloud Run 服務狀態
gcloud run services describe cheapcut-api --region=asia-east1

# 查看最新的日誌
gcloud run services logs read cheapcut-api --region=asia-east1 --limit=50

# 查看容器啟動日誌
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=cheapcut-api" --limit=50 --format=json

# 檢查 IAM 權限
gcloud projects get-iam-policy PROJECT_ID

# 測試連線
curl https://cheapcut-api-xxx.run.app/api/health
```

---

### Step 4: 問題還是沒解決?

**準備以下資訊尋求協助**:

```markdown
## 問題描述
我在執行 Task 4.3 部署到 Cloud Run 時遇到問題

## 部署情境
我在部署 [後端 API / 前端應用]

## 錯誤訊息
```
[貼上完整的錯誤訊息]
```

## 我的環境
- GCP 專案 ID: xxx
- Cloud Run 區域: asia-east1
- Docker image: gcr.io/PROJECT/IMAGE:TAG
- Node.js 版本: v18.12.0

## 我已經嘗試過
1. 檢查 Dockerfile → 本地可以運行
2. 檢查環境變數 → 已設定
3. 增加記憶體配置 → 還是失敗

## Dockerfile
[貼上你的 Dockerfile]

## 部署指令
[貼上你的部署指令]
```

---

### 🎯 部署心法

1. **先本地測試** - 確保 Docker image 在本地能正常運行
2. **逐步部署** - 先部署簡單版本,確認可以運行後再加功能
3. **檢查日誌** - 部署失敗時第一時間看日誌
4. **環境分離** - 開發、測試、正式環境分開
5. **自動化部署** - 用 CI/CD 取代手動部署

---

## 🎯 功能描述

將 CheapCut 後端 API 部署到 Google Cloud Run,提供可擴展的無伺服器部署環境。Cloud Run 會自動處理流量擴展,只需為實際使用的運算資源付費。

### 為什麼選擇 Cloud Run?

- 🎯 **無伺服器**: 不需管理伺服器,自動擴展
- ✅ **按用量計費**: 沒有流量時不收費
- 💡 **快速部署**: 從 Docker image 到上線只需幾分鐘
- 🔧 **整合 GCP 生態系**: 與其他 GCP 服務無縫整合

### 完成後你會有:

- 部署在 Cloud Run 的後端 API
- 自動化的 CI/CD 流程
- 環境變數管理 (使用 Secret Manager)
- 自動擴展配置
- HTTPS 和自訂網域設定

---

## 📚 前置知識

以下是這個 Task 會用到的概念:

- **Docker**: 容器化應用程式 → 確保在任何環境都能一致運行
- **Cloud Run**: GCP 的無伺服器容器平台 → 自動擴展和管理容器
- **Container Registry**: 存放 Docker images → 類似 Docker Hub 的私有倉庫
- **Secret Manager**: 管理敏感資料 → 安全存放 API keys 和密碼
- **IAM**: 權限管理 → 控制誰可以存取什麼資源

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 4.1: 整合測試
- ✅ Task 4.2: 效能測試
- ✅ Task 1.4: API 基礎架構

### 需要安裝的工具

```bash
# 安裝 Google Cloud SDK
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# 下載並執行: https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe

# 驗證安裝
gcloud version
```

### GCP 帳號設定

```bash
# 登入 GCP
gcloud auth login

# 建立新專案 (或使用現有專案)
gcloud projects create cheapcut-prod --name="CheapCut Production"

# 設定專案
gcloud config set project cheapcut-prod

# 啟用必要的 API
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 環境檢查

```bash
# 確認 Docker 已安裝
docker --version
# 應該顯示: Docker version 20.x.x 或更新

# 確認 gcloud 已設定
gcloud config list
# 應該看到你的專案 ID

# 確認整合測試通過
npm run test:integration
# 應該全部通過

# 確認本地應用程式可以運行
npm run dev:backend
# 應該在 http://localhost:3000 啟動
```

---

## 📝 實作步驟

### 步驟 1: 建立 Dockerfile

建立 `backend/Dockerfile`:

```dockerfile
# 多階段建置 (Multi-stage build)
# 為什麼使用多階段建置?
# - 減少最終 image 大小
# - 分離建置環境和執行環境
# - 提升安全性

# ==================== 建置階段 ====================
FROM node:18-alpine AS builder

# 設定工作目錄
WORKDIR /app

# 複製 package files
COPY package*.json ./
COPY tsconfig.json ./

# 安裝所有依賴 (包含 devDependencies)
RUN npm ci

# 複製原始碼
COPY src ./src

# 建置 TypeScript
RUN npm run build

# 移除開發依賴
RUN npm prune --production

# ==================== 執行階段 ====================
FROM node:18-alpine

# 設定環境變數
ENV NODE_ENV=production

# 建立非 root 用戶 (安全性最佳實踐)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 設定工作目錄
WORKDIR /app

# 從建置階段複製必要檔案
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# 切換到非 root 用戶
USER nodejs

# Cloud Run 會提供 PORT 環境變數
EXPOSE 8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 啟動應用程式
CMD ["node", "dist/server.js"]
```

建立 `backend/.dockerignore`:

```
# 不要複製到 Docker image 的檔案
node_modules
npm-debug.log
.env
.env.*
.git
.gitignore
.vscode
.idea
*.md
tests
coverage
.github
.dockerignore
Dockerfile
```

---

### 步驟 2: 修改應用程式以支援 Cloud Run

建立 `backend/src/config/cloud-run.ts`:

```typescript
/**
 * Cloud Run 特定配置
 *
 * Cloud Run 的特殊要求:
 * 1. 必須監聽 PORT 環境變數指定的 port (預設 8080)
 * 2. 必須在容器啟動後 4 分鐘內開始接受請求
 * 3. 必須正確處理 SIGTERM 信號以優雅關閉
 */

/**
 * 取得 Cloud Run 的 port
 */
export function getPort(): number {
  // Cloud Run 會設定 PORT 環境變數
  return parseInt(process.env.PORT || '8080', 10);
}

/**
 * 檢查是否在 Cloud Run 環境執行
 */
export function isCloudRun(): boolean {
  return process.env.K_SERVICE !== undefined;
}

/**
 * 取得服務資訊
 */
export function getServiceInfo() {
  return {
    service: process.env.K_SERVICE,
    revision: process.env.K_REVISION,
    configuration: process.env.K_CONFIGURATION,
  };
}

/**
 * 設定優雅關閉
 *
 * Cloud Run 會在關閉容器前發送 SIGTERM
 * 我們需要優雅地關閉連線
 */
export function setupGracefulShutdown(
  server: any,
  cleanup: () => Promise<void>
) {
  // 處理 SIGTERM
  process.on('SIGTERM', async () => {
    console.log('收到 SIGTERM,開始優雅關閉...');

    // 停止接受新請求
    server.close(async () => {
      console.log('HTTP 伺服器已關閉');

      try {
        // 執行清理工作 (關閉資料庫連線等)
        await cleanup();
        console.log('清理完成');
        process.exit(0);
      } catch (error) {
        console.error('清理時發生錯誤:', error);
        process.exit(1);
      }
    });

    // 設定逾時,確保在 10 秒內關閉
    setTimeout(() => {
      console.error('強制關閉 (逾時)');
      process.exit(1);
    }, 10000);
  });
}
```

修改 `backend/src/server.ts`:

```typescript
import express from 'express';
import { getPort, setupGracefulShutdown, isCloudRun } from './config/cloud-run';
import { createApp } from './app';
import { closeDatabase } from './lib/database';

const app = createApp();
const port = getPort();

const server = app.listen(port, () => {
  console.log(`🚀 伺服器啟動成功`);
  console.log(`📍 Port: ${port}`);
  console.log(`🌍 環境: ${process.env.NODE_ENV}`);

  if (isCloudRun()) {
    console.log('☁️  運行在 Cloud Run');
  }
});

// 設定優雅關閉
setupGracefulShutdown(server, async () => {
  // 關閉資料庫連線
  await closeDatabase();

  // 其他清理工作...
});

// 處理未捕獲的錯誤
process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise rejection:', reason);
  // 在 production 環境中,可能需要通知錯誤追蹤服務
});

process.on('uncaughtException', (error) => {
  console.error('未捕獲的例外:', error);
  process.exit(1);
});
```

---

### 步驟 3: 本地測試 Docker Image

```bash
# 建置 Docker image
cd backend
docker build -t cheapcut-api:local .

# 查看 image 大小 (應該 < 200MB)
docker images cheapcut-api:local

# 測試運行 (使用環境變數)
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e OPENAI_API_KEY="sk-..." \
  cheapcut-api:local

# 在另一個終端機測試
curl http://localhost:8080/api/health
# 應該回傳: {"status": "ok"}

# 停止容器
docker stop $(docker ps -q --filter ancestor=cheapcut-api:local)
```

**確認清單**:
- ✅ Docker image 建置成功
- ✅ 容器可以啟動
- ✅ API 可以正常回應
- ✅ 健康檢查端點正常

---

### 步驟 4: 建立 Secret Manager 存放敏感資料

```bash
# 建立 secrets
gcloud secrets create database-url \
  --replication-policy="automatic"

gcloud secrets create openai-api-key \
  --replication-policy="automatic"

gcloud secrets create gemini-api-key \
  --replication-policy="automatic"

# 設定 secret 值
echo -n "postgresql://user:pass@host/db" | \
  gcloud secrets versions add database-url --data-file=-

echo -n "sk-xxx" | \
  gcloud secrets versions add openai-api-key --data-file=-

echo -n "AIzaSyxxx" | \
  gcloud secrets versions add gemini-api-key --data-file=-

# 驗證 secrets
gcloud secrets list

# 授予 Cloud Run 存取 secrets 的權限
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

### 步驟 5: 部署到 Cloud Run

建立 `scripts/deploy-to-cloud-run.sh`:

```bash
#!/bin/bash

set -e  # 遇到錯誤立即停止

echo "========================================"
echo "  部署到 Cloud Run"
echo "========================================"

# 設定變數
PROJECT_ID="cheapcut-prod"
REGION="asia-east1"
SERVICE_NAME="cheapcut-api"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# 確認專案
echo "Step 1: 確認 GCP 專案..."
gcloud config set project ${PROJECT_ID}

# 建置 Docker image
echo "Step 2: 建置 Docker image..."
cd backend
docker build -t ${IMAGE_NAME}:latest .

# 推送到 Container Registry
echo "Step 3: 推送 image 到 Container Registry..."
docker push ${IMAGE_NAME}:latest

# 部署到 Cloud Run
echo "Step 4: 部署到 Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image=${IMAGE_NAME}:latest \
  --region=${REGION} \
  --platform=managed \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --concurrency=80 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=database-url:latest,OPENAI_API_KEY=openai-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest"

# 取得服務 URL
echo "Step 5: 取得服務 URL..."
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

echo ""
echo "========================================"
echo "  部署完成!"
echo "========================================"
echo ""
echo "服務 URL: ${SERVICE_URL}"
echo ""
echo "測試健康檢查:"
echo "  curl ${SERVICE_URL}/api/health"
echo ""
```

設定執行權限並執行:

```bash
chmod +x scripts/deploy-to-cloud-run.sh
./scripts/deploy-to-cloud-run.sh
```

---

### 步驟 6: 設定自動擴展和效能優化

建立 `scripts/configure-cloud-run.sh`:

```bash
#!/bin/bash

set -e

echo "========================================"
echo "  設定 Cloud Run 效能優化"
echo "========================================"

PROJECT_ID="cheapcut-prod"
REGION="asia-east1"
SERVICE_NAME="cheapcut-api"

# 更新服務設定
echo "更新服務設定..."

gcloud run services update ${SERVICE_NAME} \
  --region=${REGION} \
  --memory=2Gi \
  --cpu=2 \
  --concurrency=100 \
  --min-instances=1 \
  --max-instances=20 \
  --cpu-throttling \
  --execution-environment=gen2

# 設定流量分割 (藍綠部署)
echo "設定流量分割..."
gcloud run services update-traffic ${SERVICE_NAME} \
  --region=${REGION} \
  --to-latest

echo ""
echo "========================================"
echo "  設定完成!"
echo "========================================"
```

**各項設定說明**:

| 設定 | 值 | 說明 |
|-----|---|------|
| memory | 2Gi | 記憶體配置,根據應用需求調整 |
| cpu | 2 | CPU 數量,1-8 之間 |
| concurrency | 100 | 單一容器實例可處理的並發請求數 |
| min-instances | 1 | 最小實例數 (避免冷啟動) |
| max-instances | 20 | 最大實例數 |
| cpu-throttling | 啟用 | 沒有請求時降低 CPU 使用 |
| execution-environment | gen2 | 使用第二代執行環境 (更好的效能) |

---

### 步驟 7: 設定 Cloud Build 自動化部署

建立 `cloudbuild.yaml`:

```yaml
# Cloud Build 配置檔
# 當推送到 GitHub 時自動觸發建置和部署

steps:
  # Step 1: 執行測試
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['ci']
    dir: 'backend'

  - name: 'node:18'
    entrypoint: 'npm'
    args: ['test']
    dir: 'backend'

  # Step 2: 建置 Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/cheapcut-api:$SHORT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/cheapcut-api:latest'
      - './backend'

  # Step 3: 推送 Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/cheapcut-api:$SHORT_SHA'

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/cheapcut-api:latest'

  # Step 4: 部署到 Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'cheapcut-api'
      - '--image=gcr.io/$PROJECT_ID/cheapcut-api:$SHORT_SHA'
      - '--region=asia-east1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--memory=2Gi'
      - '--cpu=2'
      - '--timeout=300'
      - '--set-secrets=DATABASE_URL=database-url:latest,OPENAI_API_KEY=openai-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest'

# 推送 images 到 Container Registry
images:
  - 'gcr.io/$PROJECT_ID/cheapcut-api:$SHORT_SHA'
  - 'gcr.io/$PROJECT_ID/cheapcut-api:latest'

# 逾時設定
timeout: '1800s'

# 選項
options:
  machineType: 'N1_HIGHCPU_8'
  logging: CLOUD_LOGGING_ONLY
```

設定 Cloud Build 觸發器:

```bash
# 連接 GitHub repository
gcloud beta builds triggers create github \
  --repo-name=CheapCut \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml

# 列出所有觸發器
gcloud builds triggers list
```

---

### 步驟 8: 設定自訂網域和 HTTPS

```bash
# 驗證網域所有權
gcloud domains verify cheapcut.com

# 建立網域對應
gcloud run domain-mappings create \
  --service=cheapcut-api \
  --domain=api.cheapcut.com \
  --region=asia-east1

# 取得需要設定的 DNS 記錄
gcloud run domain-mappings describe \
  --domain=api.cheapcut.com \
  --region=asia-east1

# 在你的 DNS 提供商 (如 Cloudflare) 設定 CNAME 記錄
# 記錄類型: CNAME
# 名稱: api
# 目標: ghs.googlehosted.com
```

---

### 步驟 9: 設定 Cloud SQL 資料庫連線

如果使用 Cloud SQL:

```bash
# 建立 Cloud SQL 實例
gcloud sql instances create cheapcut-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=asia-east1

# 建立資料庫
gcloud sql databases create cheapcut \
  --instance=cheapcut-db

# 建立使用者
gcloud sql users create cheapcut \
  --instance=cheapcut-db \
  --password=STRONG_PASSWORD

# 啟用 Cloud SQL Admin API
gcloud services enable sqladmin.googleapis.com

# 授予 Cloud Run 連線權限
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# 更新 Cloud Run 以使用 Cloud SQL
gcloud run services update cheapcut-api \
  --region=asia-east1 \
  --add-cloudsql-instances=PROJECT_ID:asia-east1:cheapcut-db \
  --set-env-vars="DATABASE_URL=postgresql://cheapcut:PASSWORD@/cheapcut?host=/cloudsql/PROJECT_ID:asia-east1:cheapcut-db"
```

---

### 步驟 10: 設定監控和日誌

建立 `scripts/setup-monitoring.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  設定 Cloud Run 監控"
echo "========================================"

PROJECT_ID="cheapcut-prod"
REGION="asia-east1"
SERVICE_NAME="cheapcut-api"

# 建立 Uptime Check (健康檢查)
gcloud monitoring uptime create ${SERVICE_NAME}-uptime-check \
  --resource-type=uptime-url \
  --resource-labels=host=cheapcut-api-xxx.run.app \
  --http-check-path=/api/health \
  --period=60 \
  --timeout=10s

echo ""
echo "========================================"
echo "  監控設定完成!"
echo "========================================"
echo ""
echo "查看監控面板:"
echo "  https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/metrics?project=${PROJECT_ID}"
echo ""
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (4 tests): Docker 和部署基礎
- 📁 **Functional Acceptance** (5 tests): Cloud Run 功能
- 📁 **E2E Acceptance** (3 tests): 完整部署流程

### 執行驗收

```bash
# 1. 測試 Docker image
docker build -t cheapcut-api:test backend/
docker run -d -p 8080:8080 cheapcut-api:test
curl http://localhost:8080/api/health

# 2. 部署到 Cloud Run
./scripts/deploy-to-cloud-run.sh

# 3. 測試部署的服務
SERVICE_URL=$(gcloud run services describe cheapcut-api --region=asia-east1 --format="value(status.url)")
curl ${SERVICE_URL}/api/health
curl ${SERVICE_URL}/api/user/profile -H "Authorization: Bearer TEST_TOKEN"

# 4. 檢查日誌
gcloud run services logs read cheapcut-api --region=asia-east1 --limit=100

# 5. 負載測試
k6 run --env API_URL=${SERVICE_URL} tests/performance/scripts/api-load-test.js
```

### 通過標準

- ✅ Docker image 建置成功且大小 < 200MB
- ✅ 本地 Docker 容器可以正常運行
- ✅ 成功部署到 Cloud Run
- ✅ 健康檢查端點回應正常
- ✅ API 端點可以正常存取
- ✅ Secret Manager 的環境變數正確載入
- ✅ 自動擴展正常運作
- ✅ 日誌可以在 Cloud Console 查看
- ✅ 冷啟動時間 < 5 秒
- ✅ API 回應時間 < 500ms (p95)

<details>
<summary>📊 查看詳細驗收項目</summary>

### Basic Verification (4 tests)

1. ✓ Dockerfile 建置成功
2. ✓ Docker image 大小合理
3. ✓ 容器可以本地運行
4. ✓ 健康檢查正常

### Functional Acceptance (5 tests)

1. ✓ Cloud Run 部署成功
2. ✓ 環境變數正確設定
3. ✓ Secret Manager 整合正常
4. ✓ 自動擴展配置正確
5. ✓ 日誌收集正常

### E2E Acceptance (3 tests)

1. ✓ 完整的 API 請求流程正常
2. ✓ 負載測試通過
3. ✓ CI/CD 自動部署正常

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 實作檢查
- [ ] Dockerfile 已建立並優化
- [ ] 應用程式已修改以支援 Cloud Run
- [ ] 本地 Docker 測試通過
- [ ] Secret Manager 已設定
- [ ] 部署腳本已建立
- [ ] Cloud Run 服務已部署
- [ ] 自動擴展已設定
- [ ] Cloud Build CI/CD 已設定
- [ ] 監控和日誌已設定

### 檔案清單
- [ ] `backend/Dockerfile` 已建立
- [ ] `backend/.dockerignore` 已建立
- [ ] `backend/src/config/cloud-run.ts` 已建立
- [ ] `backend/src/server.ts` 已更新
- [ ] `scripts/deploy-to-cloud-run.sh` 已建立
- [ ] `scripts/configure-cloud-run.sh` 已建立
- [ ] `scripts/setup-monitoring.sh` 已建立
- [ ] `cloudbuild.yaml` 已建立

### 驗收測試
- [ ] Docker 本地測試通過
- [ ] Cloud Run 部署成功
- [ ] API 端點可以存取
- [ ] 效能測試達標
- [ ] 自動部署測試成功

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `Container failed to start` | 應用程式啟動失敗 | 檢查應用程式日誌和 Dockerfile |
| `Permission denied` | IAM 權限不足 | 檢查 Service Account 權限 |
| `Revision timeout` | 啟動時間過長 | 優化應用程式啟動邏輯 |
| `Out of memory` | 記憶體不足 | 增加 memory 配置或優化程式碼 |
| `Secret not found` | Secret 設定錯誤 | 檢查 Secret Manager 設定 |

---

### 問題 1: 容器啟動失敗

**錯誤訊息:**
```
ERROR: (gcloud.run.deploy) Container failed to start. Failed to start and then listen on the port defined by the PORT environment variable.
```

**解決方案:**

1. 確認應用程式監聽正確的 port:

```typescript
// ✅ 正確: 使用 PORT 環境變數
const port = parseInt(process.env.PORT || '8080', 10);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// ❌ 錯誤: 寫死 port
app.listen(3000); // Cloud Run 不會連接到 3000
```

2. 檢查應用程式是否正確啟動:

```bash
# 查看啟動日誌
gcloud run services logs read cheapcut-api --region=asia-east1 --limit=100

# 本地測試 Docker image
docker run -p 8080:8080 -e PORT=8080 cheapcut-api:local
curl http://localhost:8080/api/health
```

3. 確認 Dockerfile 的 CMD 正確:

```dockerfile
# ✅ 正確
CMD ["node", "dist/server.js"]

# ❌ 錯誤: 使用 npm start 可能無法正確處理信號
CMD ["npm", "start"]
```

---

### 問題 2: Secret Manager 無法存取

**錯誤訊息:**
```
Error: Failed to access secret version: Permission denied
```

**解決方案:**

1. 檢查 Service Account 權限:

```bash
# 取得專案編號
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format="value(projectNumber)")

# 授予權限
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

2. 確認 secret 名稱正確:

```bash
# 列出所有 secrets
gcloud secrets list

# 檢查 Cloud Run 設定
gcloud run services describe cheapcut-api --region=asia-east1 --format=yaml
```

3. 驗證 secret 值:

```bash
# 讀取 secret (需要權限)
gcloud secrets versions access latest --secret="database-url"
```

---

### 問題 3: 記憶體使用過高導致容器重啟

**錯誤訊息:**
```
Memory limit exceeded. Container was terminated.
```

**解決方案:**

1. 增加記憶體配置:

```bash
gcloud run services update cheapcut-api \
  --region=asia-east1 \
  --memory=2Gi  # 從 1Gi 增加到 2Gi
```

2. 檢查記憶體使用情況:

```bash
# 在 Cloud Console 查看記憶體使用圖表
# https://console.cloud.google.com/run/detail/asia-east1/cheapcut-api/metrics

# 或使用 gcloud
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/container/memory/utilizations"'
```

3. 優化程式碼記憶體使用:

```typescript
// ❌ 記憶體洩漏: 全域陣列不斷增長
const globalCache = [];
app.get('/api/data', (req, res) => {
  globalCache.push(fetchData()); // 永遠不清理
});

// ✅ 使用 LRU cache 限制大小
import LRU from 'lru-cache';
const cache = new LRU({ max: 500 });

app.get('/api/data', (req, res) => {
  cache.set(key, fetchData());
});
```

---

### 問題 4: 冷啟動時間過長

**問題**: 容器冷啟動需要 10+ 秒

**解決方案:**

1. 設定最小實例數避免冷啟動:

```bash
gcloud run services update cheapcut-api \
  --region=asia-east1 \
  --min-instances=1  # 保持至少 1 個實例運行
```

2. 優化應用程式啟動時間:

```typescript
// ❌ 慢: 啟動時同步處理所有初始化
async function startServer() {
  await connectDatabase();
  await loadAllConfigurations();
  await warmupCaches();
  await validateAllServices();
  app.listen(port);
}

// ✅ 快: 只做必要的初始化,其他延後
async function startServer() {
  await connectDatabase(); // 必要
  app.listen(port); // 馬上開始接受請求

  // 背景執行非必要的初始化
  setTimeout(() => {
    loadAllConfigurations();
    warmupCaches();
  }, 100);
}
```

3. 使用更小的 Docker base image:

```dockerfile
# ❌ 慢: 完整的 Node image
FROM node:18

# ✅ 快: Alpine 版本 (更小更快)
FROM node:18-alpine
```

4. 優化 Dockerfile layer caching:

```dockerfile
# ✅ 正確順序: 先複製不常變動的檔案
COPY package*.json ./
RUN npm ci

# 最後才複製常變動的原始碼
COPY src ./src
RUN npm run build
```

---

### 問題 5: 部署後 API 回傳 500 錯誤

**錯誤訊息:**
```
Internal Server Error
```

**解決方案:**

1. 檢查詳細的錯誤日誌:

```bash
# 即時查看日誌
gcloud run services logs tail cheapcut-api --region=asia-east1

# 查看最近的錯誤
gcloud logging read \
  "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=50 \
  --format=json
```

2. 常見的錯誤原因:

```typescript
// 原因 1: 環境變數未設定
const apiKey = process.env.OPENAI_API_KEY; // undefined!

// 解決: 檢查是否正確設定 secret
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set');
}

// 原因 2: 資料庫連線失敗
// 檢查 DATABASE_URL 是否正確

// 原因 3: 檔案路徑問題
// Cloud Run 是唯讀檔案系統,只有 /tmp 可寫入
const tempFile = '/tmp/output.mp4'; // ✅ 正確
const localFile = './output.mp4';  // ❌ 錯誤 (production 會失敗)
```

3. 加上詳細的錯誤處理:

```typescript
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message
  });
});
```

---

### 問題 6: Cloud Build 部署失敗

**錯誤訊息:**
```
ERROR: failed to solve: failed to fetch anonymous token
```

**解決方案:**

1. 確認 Cloud Build 有足夠權限:

```bash
# 取得 Cloud Build service account
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# 授予必要權限
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"
```

2. 檢查 cloudbuild.yaml 語法:

```yaml
# ✅ 正確: 使用正確的參數格式
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/cheapcut-api:latest'
      - './backend'

# ❌ 錯誤: 參數格式不正確
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build -t gcr.io/$PROJECT_ID/cheapcut-api:latest ./backend']
```

3. 手動觸發建置測試:

```bash
# 手動執行 Cloud Build
gcloud builds submit --config=cloudbuild.yaml .

# 查看建置日誌
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

---

## 📚 延伸學習資源

如果你想深入了解 Cloud Run:

- **Cloud Run 官方文件**: https://cloud.google.com/run/docs
- **最佳實踐**: https://cloud.google.com/run/docs/tips
- **Node.js on Cloud Run**: https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service
- **成本優化**: https://cloud.google.com/run/docs/tips/general#optimize-costs

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ Dockerfile 建立且優化完成
2. ✅ 本地 Docker 測試通過
3. ✅ Secret Manager 設定完成
4. ✅ 成功部署到 Cloud Run
5. ✅ API 端點可以正常存取
6. ✅ 自動擴展配置完成
7. ✅ CI/CD 自動部署設定完成
8. ✅ 監控和日誌正常運作
9. ✅ 效能測試達標
10. ✅ 完成檢查清單都勾選

### 最終驗收指令

```bash
# 部署到 Cloud Run
./scripts/deploy-to-cloud-run.sh

# 測試部署的服務
SERVICE_URL=$(gcloud run services describe cheapcut-api --region=asia-east1 --format="value(status.url)")
curl ${SERVICE_URL}/api/health

# 執行負載測試
k6 run --env API_URL=${SERVICE_URL} tests/performance/scripts/api-load-test.js

# 如果全部通過,你應該看到:
# ✓ Docker 建置成功
# ✓ 部署到 Cloud Run 成功
# ✓ API 健康檢查通過
# ✓ 負載測試通過
```

**恭喜!** 如果看到上面的輸出,代表 Task 4.3 完成了!

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:

**部署資訊**:
- GCP 專案 ID: ___
- Cloud Run 區域: ___
- 服務 URL: ___
- Docker image: ___

**效能指標**:
- 冷啟動時間: ___秒
- API 回應時間 p95: ___ms
- 記憶體使用: ___MB
- CPU 使用: ___%

**成本估算**:
- 預估每月成本: $___
- 實際使用量: ___ requests/month
- 優化空間: ___

---

**下一步**: Task 4.4 - Vercel 前端部署

---

**文件版本**: 2.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
