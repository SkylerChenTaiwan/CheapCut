# Task 4.4: Vercel 前端部署

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 4.4 |
| **Task 名稱** | Vercel 前端部署 |
| **所屬 Phase** | Phase 4: 測試與部署 |
| **預估時間** | 4-5 小時 (環境設定 1.5h + 部署設定 2h + 優化除錯 1.5h) |
| **難度** | ⭐⭐⭐ 中等 |
| **前置 Task** | Task 4.3 (GCP Cloud Run 部署) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的 Vercel 部署問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Command "npm run build" exited with 1
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 建置失敗
   ```

2. **判斷問題類型**
   - `Build failed` → 建置過程出錯,檢查 build 指令和相依套件
   - `Environment variable not found` → 環境變數未設定
   - `API route not found` → API 路由設定錯誤
   - `Module not found` → 缺少依賴套件或路徑錯誤
   - `Timeout` → 建置時間過長,超過 Vercel 限制

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"Vercel 部署失敗"  ← 太模糊
"Next.js 錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"Vercel Next.js build failed module not found" ← 包含平台和具體錯誤
"Vercel environment variables not working" ← 說明具體問題
"Next.js API routes 404 Vercel deployment" ← 描述完整情境
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件**
- Vercel 文件: https://vercel.com/docs
- Next.js 文件: https://nextjs.org/docs
- Vercel 部署指南: https://vercel.com/docs/deployments/overview

**優先順序 2: Vercel 社群**
- Vercel Community: https://github.com/vercel/vercel/discussions
- Next.js Discussions: https://github.com/vercel/next.js/discussions

**優先順序 3: Stack Overflow**
- 搜尋時加上 `[vercel] [next.js]` tag
- 看「✓ 已接受的答案」

---

### Step 3: 檢查部署狀態

Vercel 部署失敗時,先檢查基本狀態:

```bash
# 檢查 Vercel CLI 是否已登入
vercel whoami

# 查看專案狀態
vercel ls

# 查看部署日誌
vercel logs [DEPLOYMENT_URL]

# 檢查環境變數
vercel env ls

# 本地測試建置
npm run build

# 本地測試 production 模式
npm run start
```

---

### Step 4: 問題還是沒解決?

**準備以下資訊尋求協助**:

```markdown
## 問題描述
我在執行 Task 4.4 部署 Next.js 到 Vercel 時遇到問題

## 部署情境
我在部署 [前端應用 / API 路由]

## 錯誤訊息
```
[貼上完整的錯誤訊息和 build log]
```

## 我的環境
- Next.js 版本: 14.x
- Node.js 版本: 18.x
- Vercel 區域: 預設 (自動)
- 框架: Next.js (App Router / Pages Router)

## 我已經嘗試過
1. 本地建置成功 → npm run build 通過
2. 檢查環境變數 → 已在 Vercel 設定
3. 清除 .next 資料夾重新建置 → 還是失敗

## package.json
[貼上你的 package.json]

## next.config.js
[貼上你的 next.config.js]
```

---

### 🎯 部署心法

1. **先本地測試** - 確保 `npm run build` 在本地完全成功
2. **環境變數分離** - 開發和正式環境使用不同的環境變數
3. **檢查建置日誌** - Vercel 提供詳細的建置日誌,仔細閱讀
4. **使用預覽部署** - 利用 Preview Deployments 測試變更
5. **漸進式部署** - 先部署簡單版本,確認可行後再加功能

---

## 🎯 功能描述

將 CheapCut 前端應用部署到 Vercel,提供全球 CDN 加速、自動 HTTPS、預覽部署等功能。Vercel 是 Next.js 的官方推薦部署平台,提供最佳的效能和開發體驗。

### 為什麼選擇 Vercel?

- 🎯 **Zero Config**: Next.js 應用無需額外設定即可部署
- ✅ **全球 CDN**: 自動部署到全球邊緣節點,提供最快的載入速度
- 💡 **Git 整合**: 推送到 GitHub 自動觸發部署
- 🔧 **Preview Deployments**: 每個 PR 都有獨立的預覽環境
- 🚀 **Edge Functions**: 在邊緣節點執行 API 路由

### 完成後你會有:

- 部署在 Vercel 的 Next.js 前端應用
- 自動化的 CI/CD 流程 (Git push 即部署)
- 預覽部署環境 (每個 PR 獨立預覽)
- 自訂網域和 HTTPS
- 全球 CDN 加速
- 環境變數管理

---

## 📚 前置知識

以下是這個 Task 會用到的概念:

- **Vercel**: 專為前端框架優化的部署平台 → 提供自動建置、部署、CDN
- **Next.js**: React 框架 → 支援 SSR、SSG、API Routes
- **Edge Network**: 全球邊緣節點 → 將內容快取在離用戶最近的節點
- **Preview Deployments**: 預覽部署 → 每個 Git 分支都有獨立的部署環境
- **Environment Variables**: 環境變數 → 區分開發、預覽、正式環境的設定

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 4.3: GCP Cloud Run 部署 (後端 API 已部署)
- ✅ Task 3.1: 使用者認證介面
- ✅ Task 3.8: 下載與分享介面

### 需要安裝的工具

```bash
# 安裝 Vercel CLI
npm install -g vercel

# 驗證安裝
vercel --version
# 應該顯示: Vercel CLI 28.x.x 或更新版本
```

### Vercel 帳號設定

```bash
# 登入 Vercel (會開啟瀏覽器進行 OAuth 認證)
vercel login

# 確認登入狀態
vercel whoami
# 應該顯示你的 Vercel 用戶名

# 列出專案
vercel ls
```

### 環境檢查

```bash
# 確認 Next.js 專案可以本地建置
cd frontend
npm run build
# 應該成功建置並產生 .next 資料夾

# 確認 production 模式可以運行
npm run start
# 應該在 http://localhost:3000 啟動

# 確認後端 API 已部署
curl https://your-api.run.app/api/health
# 應該回傳 {"status": "ok"}
```

---

## 📝 實作步驟

### 步驟 1: 準備 Next.js 專案配置

建立/修改 `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 啟用嚴格模式
  reactStrictMode: true,

  // 環境變數 (公開給瀏覽器)
  env: {
    // 這些變數會在建置時嵌入前端程式碼
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'CheapCut',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  // 圖片優化設定
  images: {
    // 允許的圖片來源
    domains: [
      'storage.googleapis.com', // GCS
      'lh3.googleusercontent.com', // Google 頭像
    ],
    // 圖片格式優化
    formats: ['image/avif', 'image/webp'],
  },

  // API 路由 rewrite (將前端 API 請求轉發到後端)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },

  // 自訂 headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // 輸出設定
  output: 'standalone', // 優化部署大小

  // Webpack 設定
  webpack: (config, { dev, isServer }) => {
    // 生產環境優化
    if (!dev && !isServer) {
      // 移除 console.log (可選)
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress.drop_console = true;
        }
      });
    }

    return config;
  },
};

module.exports = nextConfig;
```

建立 `frontend/.env.example`:

```bash
# API 設定
NEXT_PUBLIC_API_URL=https://your-api.run.app

# 應用設定
NEXT_PUBLIC_APP_NAME=CheapCut
NEXT_PUBLIC_APP_VERSION=1.0.0

# Google OAuth (如果使用)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Sentry (錯誤追蹤,可選)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# 環境
NEXT_PUBLIC_ENV=production
```

---

### 步驟 2: 建立 Vercel 配置檔

建立 `frontend/vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": [
    "hnd1"
  ],
  "env": {
    "NEXT_PUBLIC_APP_NAME": "CheapCut"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": "@api-url"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-api.run.app/api/:path*"
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

**配置說明**:
- `regions`: 部署區域 (hnd1 = 東京,最接近台灣)
- `env`: 環境變數
- `headers`: 自訂 HTTP headers
- `rewrites`: API 路由轉發
- `redirects`: URL 重導向

---

### 步驟 3: 優化專案結構和依賴

更新 `frontend/package.json`:

```json
{
  "name": "cheapcut-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "vercel-build": "npm run build"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

建立 `.vercelignore`:

```
# 不要上傳到 Vercel 的檔案
node_modules
.next
.git
.env.local
.env*.local
npm-debug.log
.DS_Store
coverage
.vscode
.idea
*.log
.cache
```

---

### 步驟 4: 建立環境變數管理腳本

建立 `scripts/setup-vercel-env.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  設定 Vercel 環境變數"
echo "========================================"

# 設定變數
PROJECT_NAME="cheapcut-frontend"
API_URL_PROD="https://cheapcut-api-xxx.run.app"
API_URL_PREVIEW="https://cheapcut-api-staging-xxx.run.app"

cd frontend

# Production 環境變數
echo "Step 1: 設定 Production 環境變數..."
vercel env add NEXT_PUBLIC_API_URL production <<< "$API_URL_PROD"
vercel env add NEXT_PUBLIC_ENV production <<< "production"

# Preview 環境變數
echo "Step 2: 設定 Preview 環境變數..."
vercel env add NEXT_PUBLIC_API_URL preview <<< "$API_URL_PREVIEW"
vercel env add NEXT_PUBLIC_ENV preview <<< "preview"

# Development 環境變數
echo "Step 3: 設定 Development 環境變數..."
vercel env add NEXT_PUBLIC_API_URL development <<< "http://localhost:3000"
vercel env add NEXT_PUBLIC_ENV development <<< "development"

# 列出所有環境變數
echo "Step 4: 驗證環境變數..."
vercel env ls

echo ""
echo "========================================"
echo "  環境變數設定完成!"
echo "========================================"
```

設定執行權限:

```bash
chmod +x scripts/setup-vercel-env.sh
```

---

### 步驟 5: 本地測試建置

在部署前,先確保本地建置成功:

```bash
cd frontend

# 清除舊的建置
rm -rf .next

# 安裝依賴
npm ci

# 執行 TypeScript 型別檢查
npm run type-check

# 執行 Linting
npm run lint

# 建置專案
npm run build

# 測試 production 模式
npm run start
# 開啟 http://localhost:3000 測試
```

**檢查清單**:
- ✅ TypeScript 型別檢查通過
- ✅ ESLint 沒有錯誤
- ✅ Build 成功完成
- ✅ Production 模式可以啟動
- ✅ 所有頁面可以正常顯示
- ✅ API 請求正常運作

---

### 步驟 6: 首次部署到 Vercel

建立 `scripts/deploy-to-vercel.sh`:

```bash
#!/bin/bash

set -e

echo "========================================"
echo "  部署到 Vercel"
echo "========================================"

cd frontend

# 確認登入狀態
echo "Step 1: 確認 Vercel 登入狀態..."
vercel whoami

# 連結專案 (首次部署)
echo "Step 2: 連結 Vercel 專案..."
vercel link --yes

# 建置並部署到 production
echo "Step 3: 部署到 Production..."
vercel --prod

# 取得部署 URL
echo "Step 4: 取得部署資訊..."
DEPLOYMENT_URL=$(vercel ls --prod | grep "cheapcut" | head -n 1 | awk '{print $2}')

echo ""
echo "========================================"
echo "  部署完成!"
echo "========================================"
echo ""
echo "Production URL: https://${DEPLOYMENT_URL}"
echo ""
echo "測試部署:"
echo "  curl https://${DEPLOYMENT_URL}"
echo ""
```

執行部署:

```bash
chmod +x scripts/deploy-to-vercel.sh
./scripts/deploy-to-vercel.sh
```

**或使用互動式部署**:

```bash
cd frontend

# 首次部署 (會詢問設定)
vercel

# 選擇設定:
# - Set up and deploy: Yes
# - Which scope: 選擇你的帳號
# - Link to existing project: No
# - Project name: cheapcut-frontend
# - Directory: ./
# - Override settings: No

# 部署完成後,部署到 production
vercel --prod
```

---

### 步驟 7: 設定 GitHub 自動部署

```bash
# 在 Vercel Dashboard 連接 GitHub repository
# 1. 前往 https://vercel.com/dashboard
# 2. 點選 "Add New..." > "Project"
# 3. 選擇 "Import Git Repository"
# 4. 授權 Vercel 存取你的 GitHub
# 5. 選擇 CheapCut repository
# 6. 設定:
#    - Framework Preset: Next.js
#    - Root Directory: frontend
#    - Build Command: npm run build
#    - Output Directory: .next
#    - Install Command: npm install

# 設定環境變數 (在 Vercel Dashboard)
# Settings > Environment Variables
```

建立 GitHub Actions workflow (可選,用於額外的檢查):

建立 `.github/workflows/vercel-preview.yml`:

```yaml
name: Vercel Preview Deployment

on:
  pull_request:
    branches:
      - main
    paths:
      - 'frontend/**'

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Type check
        run: |
          cd frontend
          npm run type-check

      - name: Lint
        run: |
          cd frontend
          npm run lint

      - name: Build
        run: |
          cd frontend
          npm run build

      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Build successful! Vercel will deploy a preview.'
            })
```

---

### 步驟 8: 設定自訂網域

```bash
# 方法 1: 使用 Vercel CLI
vercel domains add cheapcut.com

# 方法 2: 使用 Vercel Dashboard
# 1. 前往 Settings > Domains
# 2. 輸入網域名稱: cheapcut.com
# 3. 按照指示設定 DNS 記錄
```

**DNS 設定 (在你的 DNS 提供商,如 Cloudflare)**:

```
# A 記錄 (指向 Vercel)
Type: A
Name: @
Value: 76.76.21.21

# CNAME 記錄 (www 子網域)
Type: CNAME
Name: www
Value: cname.vercel-dns.com

# 或使用 Vercel Nameservers (推薦)
# 將你的網域的 Nameservers 改為:
# ns1.vercel-dns.com
# ns2.vercel-dns.com
```

驗證網域設定:

```bash
# 檢查 DNS 記錄
dig cheapcut.com
dig www.cheapcut.com

# 等待 DNS 傳播 (可能需要幾分鐘到幾小時)
# 檢查網域狀態
vercel domains ls
```

---

### 步驟 9: 效能優化設定

建立 `frontend/src/lib/performance.ts`:

```typescript
/**
 * 效能優化工具
 */

// Web Vitals 追蹤
export function reportWebVitals(metric: any) {
  if (process.env.NEXT_PUBLIC_ENV === 'production') {
    // 發送到分析服務 (如 Google Analytics, Vercel Analytics)
    console.log(metric);

    // 可以整合 Vercel Analytics
    // import { sendToVercelAnalytics } from '@vercel/analytics';
    // sendToVercelAnalytics(metric);
  }
}

// 圖片載入優化
export const imageLoader = ({ src, width, quality }: any) => {
  // 如果圖片在 GCS
  if (src.startsWith('https://storage.googleapis.com')) {
    return `${src}?w=${width}&q=${quality || 75}`;
  }
  return src;
};

// 預載入關鍵資源
export function preloadCriticalResources() {
  // 預載入字型
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.href = '/fonts/inter-var.woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
}
```

更新 `frontend/src/pages/_app.tsx`:

```typescript
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { reportWebVitals, preloadCriticalResources } from '@/lib/performance';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 預載入關鍵資源
    preloadCriticalResources();
  }, []);

  return <Component {...pageProps} />;
}

// 追蹤 Web Vitals
export { reportWebVitals };
```

建立 `frontend/public/robots.txt`:

```
# 允許所有搜尋引擎爬蟲
User-agent: *
Allow: /

# Sitemap
Sitemap: https://cheapcut.com/sitemap.xml
```

建立 `frontend/public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cheapcut.com</loc>
    <lastmod>2025-10-07</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://cheapcut.com/about</loc>
    <lastmod>2025-10-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

### 步驟 10: 設定分析和監控

安裝 Vercel Analytics:

```bash
cd frontend
npm install @vercel/analytics
```

更新 `frontend/src/pages/_app.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

建立 `scripts/check-deployment-health.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  檢查 Vercel 部署健康狀態"
echo "========================================"

DOMAIN="cheapcut.com"

# 檢查網站是否可訪問
echo "Step 1: 檢查網站可訪問性..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN})
if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✓ 網站可訪問 (HTTP $HTTP_CODE)"
else
  echo "✗ 網站無法訪問 (HTTP $HTTP_CODE)"
  exit 1
fi

# 檢查 HTTPS
echo "Step 2: 檢查 HTTPS..."
if curl -s https://${DOMAIN} > /dev/null; then
  echo "✓ HTTPS 正常"
else
  echo "✗ HTTPS 失敗"
  exit 1
fi

# 檢查回應時間
echo "Step 3: 檢查回應時間..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' https://${DOMAIN})
echo "回應時間: ${RESPONSE_TIME}s"

# 檢查 API 連線
echo "Step 4: 檢查 API 連線..."
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN}/api/health)
if [ "$API_CODE" -eq 200 ]; then
  echo "✓ API 連線正常 (HTTP $API_CODE)"
else
  echo "⚠ API 連線異常 (HTTP $API_CODE)"
fi

echo ""
echo "========================================"
echo "  健康檢查完成!"
echo "========================================"
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (3 tests): 建置和部署基礎
- 📁 **Functional Acceptance** (5 tests): Vercel 功能
- 📁 **E2E Acceptance** (2 tests): 完整使用者流程

### 執行驗收

```bash
# 1. 本地建置測試
cd frontend
npm run build
npm run start

# 2. 部署到 Vercel
./scripts/deploy-to-vercel.sh

# 3. 設定環境變數
./scripts/setup-vercel-env.sh

# 4. 健康檢查
./scripts/check-deployment-health.sh

# 5. 效能測試
npx lighthouse https://cheapcut.com --view
```

### 通過標準

- ✅ 本地建置成功且無錯誤
- ✅ 成功部署到 Vercel
- ✅ Production URL 可以正常訪問
- ✅ 所有頁面載入正常
- ✅ API 請求正常運作
- ✅ 環境變數正確載入
- ✅ HTTPS 自動啟用
- ✅ 自訂網域設定成功 (如有設定)
- ✅ Preview Deployments 正常運作
- ✅ Lighthouse 分數 > 90

<details>
<summary>📊 查看詳細驗收項目</summary>

### Basic Verification (3 tests)

1. ✓ 本地建置成功無錯誤
2. ✓ TypeScript 型別檢查通過
3. ✓ ESLint 檢查通過

### Functional Acceptance (5 tests)

1. ✓ Vercel 部署成功
2. ✓ 環境變數正確設定
3. ✓ API 路由轉發正常
4. ✓ 靜態資源載入成功
5. ✓ Preview Deployments 功能正常

### E2E Acceptance (2 tests)

1. ✓ 完整的使用者流程正常 (註冊、登入、上傳、生成)
2. ✓ Git push 自動觸發部署

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 實作檢查
- [ ] Next.js 配置已優化 (next.config.js)
- [ ] Vercel 配置檔已建立 (vercel.json)
- [ ] 環境變數已設定
- [ ] 本地建置測試通過
- [ ] Vercel CLI 部署成功
- [ ] GitHub 自動部署已設定
- [ ] 自訂網域已設定 (如需要)
- [ ] 效能優化已完成
- [ ] Analytics 已整合

### 檔案清單
- [ ] `frontend/next.config.js` 已建立/更新
- [ ] `frontend/vercel.json` 已建立
- [ ] `frontend/.env.example` 已建立
- [ ] `frontend/.vercelignore` 已建立
- [ ] `scripts/setup-vercel-env.sh` 已建立
- [ ] `scripts/deploy-to-vercel.sh` 已建立
- [ ] `scripts/check-deployment-health.sh` 已建立
- [ ] `.github/workflows/vercel-preview.yml` 已建立 (可選)

### 驗收測試
- [ ] 本地建置測試通過
- [ ] Vercel 部署成功
- [ ] 所有頁面可訪問
- [ ] API 整合正常
- [ ] Preview Deployments 測試通過
- [ ] Lighthouse 效能測試達標

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `Build failed` | 建置錯誤 | 檢查建置日誌和依賴套件 |
| `Module not found` | 缺少依賴 | npm install 缺少的套件 |
| `Environment variable not found` | 環境變數未設定 | 在 Vercel 設定環境變數 |
| `API route 404` | API 路由錯誤 | 檢查 rewrites 設定 |
| `Image optimization error` | 圖片域名未設定 | 在 next.config.js 加入域名 |

---

### 問題 1: 建置失敗 - Module not found

**錯誤訊息:**
```
Error: Cannot find module 'some-package'
```

**解決方案:**

1. 確認套件已安裝:

```bash
# 檢查 package.json
cat frontend/package.json | grep "some-package"

# 安裝缺少的套件
cd frontend
npm install some-package

# 更新 package-lock.json
npm install
```

2. 檢查 import 路徑:

```typescript
// ❌ 錯誤: 路徑不正確
import { something } from '@/components/Something';

// ✅ 正確: 確認檔案存在
import { something } from '@/components/Something/index';
```

3. 檢查 TypeScript 路徑設定:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### 問題 2: 環境變數在瀏覽器中無法使用

**問題**: `process.env.API_URL` 在前端是 undefined

**解決方案:**

1. 確認使用 `NEXT_PUBLIC_` 前綴:

```bash
# ❌ 錯誤: 沒有 NEXT_PUBLIC_ 前綴
API_URL=https://api.example.com

# ✅ 正確: 使用 NEXT_PUBLIC_ 前綴
NEXT_PUBLIC_API_URL=https://api.example.com
```

2. 在 Vercel 設定環境變數:

```bash
# 使用 CLI
vercel env add NEXT_PUBLIC_API_URL production

# 或在 Vercel Dashboard
# Settings > Environment Variables
```

3. 重新部署以套用新的環境變數:

```bash
vercel --prod
```

4. 驗證環境變數:

```typescript
// 在程式碼中檢查
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// 在 Vercel 部署日誌中檢查
// 搜尋 "NEXT_PUBLIC_API_URL"
```

---

### 問題 3: API 路由回傳 404

**錯誤訊息:**
```
404 - This page could not be found
```

**解決方案:**

1. 檢查 API 路由設定:

```javascript
// next.config.js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
    },
  ];
}
```

2. 確認環境變數正確:

```bash
# 檢查環境變數
vercel env ls

# 測試 API URL
curl $NEXT_PUBLIC_API_URL/api/health
```

3. 使用絕對 URL 呼叫 API:

```typescript
// ❌ 可能失敗: 相對路徑
fetch('/api/users');

// ✅ 推薦: 使用絕對 URL
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
```

4. 檢查 CORS 設定:

```typescript
// 後端 API 需要允許前端網域
app.use(cors({
  origin: [
    'https://cheapcut.com',
    'https://www.cheapcut.com',
    'https://*.vercel.app', // Vercel preview deployments
  ],
}));
```

---

### 問題 4: 圖片優化失敗

**錯誤訊息:**
```
Error: Invalid src prop (https://storage.googleapis.com/...) on `next/image`, hostname "storage.googleapis.com" is not configured under images in your `next.config.js`
```

**解決方案:**

1. 在 next.config.js 加入圖片域名:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: [
      'storage.googleapis.com',
      'lh3.googleusercontent.com',
    ],
  },
};
```

2. 使用 remotePatterns (更安全):

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/your-bucket/**',
      },
    ],
  },
};
```

3. 重新部署:

```bash
vercel --prod
```

---

### 問題 5: 部署速度很慢

**問題**: 部署時間超過 5 分鐘

**解決方案:**

1. 優化依賴安裝:

```json
// package.json
{
  "scripts": {
    "vercel-build": "npm run build"
  }
}
```

2. 使用快取:

```bash
# Vercel 會自動快取 node_modules
# 確保 package-lock.json 存在
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
```

3. 減少依賴套件:

```bash
# 檢查套件大小
npx bundlephobia [package-name]

# 移除不必要的依賴
npm uninstall [unused-package]
```

4. 使用 output: 'standalone':

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
};
```

5. 分析建置時間:

```bash
# 本地建置並分析
ANALYZE=true npm run build
```

---

### 問題 6: Preview Deployment 沒有自動觸發

**問題**: 建立 PR 後沒有自動部署預覽環境

**解決方案:**

1. 檢查 GitHub 整合:

```bash
# 在 Vercel Dashboard
# Settings > Git > GitHub
# 確認 repository 已連接
```

2. 檢查分支設定:

```bash
# 在 Vercel Dashboard
# Settings > Git
# 確認 "Production Branch" 設定為 "main"
# 確認 "Preview Deployments" 已啟用
```

3. 手動觸發部署:

```bash
# 推送到 GitHub
git push origin feature-branch

# 或使用 Vercel CLI 手動部署
vercel
```

4. 檢查 GitHub App 權限:

```bash
# 前往 GitHub Settings
# Applications > Vercel
# 確認有 repository 存取權限
```

---

## 📚 延伸學習資源

如果你想深入了解 Vercel 部署:

- **Vercel 官方文件**: https://vercel.com/docs
- **Next.js 部署指南**: https://nextjs.org/docs/deployment
- **Vercel CLI 文件**: https://vercel.com/docs/cli
- **效能優化指南**: https://vercel.com/docs/concepts/next.js/overview#performance

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ Next.js 專案配置完成
2. ✅ 本地建置測試通過
3. ✅ 環境變數設定完成
4. ✅ 成功部署到 Vercel
5. ✅ Production URL 可以正常訪問
6. ✅ API 整合正常運作
7. ✅ Preview Deployments 設定完成
8. ✅ 自訂網域設定完成 (如需要)
9. ✅ 效能優化完成
10. ✅ 完成檢查清單都勾選

### 最終驗收指令

```bash
# 部署到 Vercel
./scripts/deploy-to-vercel.sh

# 健康檢查
./scripts/check-deployment-health.sh

# Lighthouse 效能測試
npx lighthouse https://cheapcut.com --view

# 如果全部通過,你應該看到:
# ✓ 部署成功
# ✓ 網站可訪問
# ✓ HTTPS 正常
# ✓ API 連線正常
# ✓ Lighthouse 分數 > 90
```

**恭喜!** 如果看到上面的輸出,代表 Task 4.4 完成了!

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:

**部署資訊**:
- Vercel 專案名稱: ___
- Production URL: ___
- 自訂網域: ___
- 部署區域: ___

**效能指標**:
- Lighthouse Performance: ___
- First Contentful Paint: ___ms
- Time to Interactive: ___ms
- Largest Contentful Paint: ___ms

**每月使用量** (Vercel 免費方案限制):
- Bandwidth: ___ GB / 100 GB
- Build Execution: ___ hours / 100 hours
- Serverless Function Invocations: ___ / 100,000

---

**下一步**: Task 4.5 - 監控與告警設定

---

**文件版本**: 2.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
