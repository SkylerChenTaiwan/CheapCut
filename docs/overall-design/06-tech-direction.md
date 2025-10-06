# 步驟 6：技術方向選擇

**狀態**：✅ 已完成
**前置依賴**：03-system-boundary.md, 04-module-breakdown.md
**目標**：做出大方向的技術決策（不需要太細節）

---

## 技術選型原則

基於產品目標「最低成本」，我們的技術選型應遵循：

- [x] **成本優先**：免費方案 > 按需計費 > 固定月費
- [x] **快速開發**：選擇熟悉的技術，減少學習曲線
- [x] **可擴展性**：初期簡單，但要能支撐成長
- [x] **社群支援**：有問題能快速找到解決方案（社區資源越多越好）
- [x] **優先使用 GCP**：除非成本差異大或有特殊問題，否則優先選擇 GCP 服務
- [x] **簡潔為上**：越簡單、越單純的方案越好

---

## 1. 前端技術方向

### 框架選擇

| 選項 | 適合原因 | 不適合原因 | 推薦度 |
|------|----------|-----------|--------|
| **Next.js** | 全端框架、Vercel 免費部署、SSR | 可能過重 | ⭐️⭐️⭐️ |
| **React + Vite** | 輕量、靈活 | 需要自己配置很多 | ⭐️⭐️ |
| **純 HTML/JS** | 最簡單 | 缺乏結構 | ⭐️ |

**初步決定**：Next.js

**理由**：
- 社群資源極為豐富，遇到問題容易找到解決方案
- 整合度高，減少配置時間
- Vercel 部署簡單（雖然以 GCP 為主，但前端可以用 Vercel 免費層）
- 開發體驗好，可以快速迭代

---

### UI 元件方案

| 選項 | 優點 | 缺點 |
|------|------|------|
| **Tailwind CSS** | 快速、檔案小 | 需要學習 |
| **shadcn/ui** | 現成元件、美觀 | 基於 Tailwind |
| **原生 CSS** | 完全控制 | 慢 |

**初步決定**：Tailwind CSS + shadcn/ui

**理由**：
- 社群資源非常豐富，範例多
- 開發速度快，不用自己寫太多 CSS
- shadcn/ui 提供現成元件，但程式碼可控（複製到專案中，不是 npm package）

---

## 2. 後端技術方向

### 語言與框架

| 選項 | 適合原因 | 不適合原因 | 推薦度 |
|------|----------|-----------|--------|
| **Node.js (Express/Fastify)** | 與前端同語言、豐富生態 | 單執行緒限制 | ⭐️⭐️⭐️ |
| **Python (FastAPI)** | AI 生態好、簡潔 | 可能需要多學 | ⭐️⭐️⭐️ |
| **Go** | 效能好 | 學習曲線 | ⭐️⭐️ |

**初步決定**：Node.js (Express 或 Fastify)

**理由**：
- 與前端同語言，降低學習成本
- 社群資源極為豐富，npm 生態系完整
- 處理影片相關任務時，可以方便地調用 FFmpeg
- 開發速度快

---

### 部署方式

| 選項 | 成本 | 適用場景 | 推薦度 |
|------|------|----------|--------|
| **GCP Cloud Run** | 按需計費、免費額度 | 容器化應用、長時間處理 | ⭐️⭐️⭐️ |
| **GCP Cloud Functions** | 按需計費 | 輕量 API（有 timeout 限制） | ⭐️⭐️ |
| **GCP App Engine** | 按需計費 | 傳統 web app | ⭐️⭐️ |

**初步決定**：GCP Cloud Run

**理由**：
- 符合優先使用 GCP 的原則
- 支援 Docker 容器，靈活度高
- 可以處理影片生成等長時間任務（timeout 較長）
- 按需計費，初期成本低
- 免費額度：每月 2 百萬次請求、36 萬 GB-秒記憶體

---

## 3. 資料庫方向

### 主資料庫

| 選項 | 免費額度 | 適用場景 | 推薦度 |
|------|----------|----------|--------|
| **GCP Cloud SQL (PostgreSQL)** | 無免費層，但可用小規格 | 完整管理、高可用 | ⭐️⭐️⭐️ |
| **PostgreSQL (Supabase)** | 500MB，免費層 | 關聯資料、需要 SQL | ⭐️⭐️⭐️ |
| **MongoDB (Atlas)** | 512MB 免費 | 靈活 Schema | ⭐️⭐️ |

**初步決定**：PostgreSQL (Supabase)

**理由**：
- MVP 階段使用 Supabase 免費層，可以節省成本
- 未來如需要可以遷移到 GCP Cloud SQL
- PostgreSQL 社群資源豐富，文檔完整
- Supabase 提供完整的管理介面和 API

---

### 快取（可選）

**需要嗎**：[x] 是

**決定**：GCP Memorystore (Redis) 或 Upstash Redis

**理由**：
- 用於快取 AI 生成結果、用戶 session 等
- GCP Memorystore 是 GCP 原生服務，整合度高
- Upstash 有免費層，初期可以先用
- Redis 社群資源豐富，使用簡單

---

## 4. 影片處理技術

### 影片生成方案

| 方案 | 技術 | 優點 | 缺點 | 推薦度 |
|------|------|------|------|--------|
| **伺服器端 FFmpeg** | FFmpeg CLI | 功能完整、免費 | 需要伺服器資源 | ⭐️⭐️⭐️ |
| **Remotion** | React + Node.js | 用 React 寫影片 | 學習曲線 | ⭐️⭐️⭐️ |
| **瀏覽器端 (Canvas)** | HTML5 Canvas | 零伺服器成本 | 受限於裝置 | ⭐️⭐️ |
| **雲端服務 (Cloudflare Stream)** | SaaS | 完全託管 | 成本高 | ⭐️ |

**初步決定**：伺服器端 FFmpeg

**理由**：
- FFmpeg 是業界標準，社群資源極為豐富
- 功能完整，幾乎可以做任何影片處理
- 完全免費，只需要伺服器運算資源
- 在 Cloud Run 上運行，成本可控
- 大量範例和教學可以參考

---

## 5. AI 服務方向

### 文字生成

| 服務 | 免費額度 | 成本 | 推薦度 |
|------|----------|------|--------|
| **Gemini (Google)** | 免費額度大 | 較便宜 | ⭐️⭐️⭐️ |
| **Grok (xAI)** | 需確認 | 據說便宜 | ⭐️⭐️⭐️ |
| **OpenAI GPT-3.5/4** | $5 credit | $0.5/1M tokens | ⭐️⭐️ |
| **Claude (Anthropic)** | 限時免費 | 類似 GPT | ⭐️⭐️ |

**初步決定**：Gemini 為主，評估 Grok 作為替代方案

**理由**：
- 目前已經使用 Gemini，熟悉度高
- Gemini 整體成本最低，免費額度大
- 需要評估 Grok 的實際效果和成本
- 保持彈性，可以根據成本調整

---

### 圖片生成

**初步決定**：本專案不使用圖片生成

**理由**：
- 根據目前設計，不需要圖片生成功能
- 可以使用免費素材庫 (Unsplash/Pexels) 就足夠

---

### 語音相關

#### 語音轉文字 (STT)

| 服務 | 成本 | 品質 | 推薦度 |
|------|------|------|--------|
| **OpenAI Whisper API** | $0.006/分鐘 | 高 | ⭐️⭐️⭐️ |
| **Google Cloud STT** | $0.006/15秒 | 高 | ⭐️⭐️⭐️ |
| **AssemblyAI** | $0.00025/秒 | 高 | ⭐️⭐️ |

**初步決定**：OpenAI Whisper API

**理由**：
- 效果好，支援多語言
- 價格合理
- 社群資源豐富
- （用戶會自己上傳錄音，所以我們需要 STT）

#### 文字轉語音 (TTS)

| 服務 | 成本 | 品質 | 推薦度 |
|------|------|------|--------|
| **OpenAI TTS** | $15/1M 字 | 高 | ⭐️⭐️⭐️ |
| **Google Cloud TTS** | 0-1M 字免費 | 中 | ⭐️⭐️⭐️ |
| **ElevenLabs** | 10k 字/月免費 | 極高 | ⭐️⭐️ |

**初步決定**：OpenAI TTS

**理由**：
- 效果不錯，聽起來自然
- 價格合理
- 與 Whisper 整合度高

---

## 6. 儲存與 CDN

### 物件儲存

| 服務 | 免費額度 | 特色 | 推薦度 |
|------|----------|------|--------|
| **GCP Cloud Storage** | 5GB/月免費 | GCP 原生整合 | ⭐️⭐️⭐️ |
| **Cloudflare R2** | 10GB 免費 | 無 egress 費用 | ⭐️⭐️⭐️ |
| **Supabase Storage** | 1GB 免費 | 整合資料庫 | ⭐️⭐️ |

**初步決定**：GCP Cloud Storage

**理由**：
- 符合優先使用 GCP 的原則
- 與 Cloud Run 整合度高
- 5GB 免費額度足夠初期使用
- 價格透明，可預測成本
- 如果未來 egress 費用過高，可以考慮 Cloudflare R2

---

### CDN

**需要嗎**：[x] 是

**決定**：GCP Cloud CDN 或 Cloudflare

**理由**：
- 影片檔案較大，使用 CDN 可以加速載入
- GCP Cloud CDN 與 Cloud Storage 整合度高
- Cloudflare 免費層也很好用
- 初期可以先用 Cloudflare 免費層

---

## 7. 開發環境設定

### 本地開發環境
**需要的工具**：
- [x] Node.js (v18+)
- [x] Docker（測試 Cloud Run 環境）
- [x] FFmpeg（本地測試影片生成）
- [x] gcloud CLI（部署到 GCP）

### 本地開發如何跑？

**決定**：選項 B - 混合（推薦）

- 資料庫：Supabase 開發環境（免費層）
- 儲存：GCP Cloud Storage 測試 bucket
- AI 服務：個人 API key（開發時使用）
- 快取：本地 Redis（Docker）或 Upstash 免費層

**理由**：
- 簡單好用，不需要在本地安裝太多服務
- 接近正式環境，減少環境差異
- 開發成本低

### 環境變數管理
```
.env.local（本地開發）
.env.staging（測試環境）
.env.production（正式環境）
```

**必要的環境變數**：
- `DATABASE_URL` - Supabase 連線
- `SUPABASE_KEY` - Supabase API key
- `GCP_PROJECT_ID` - GCP 專案 ID
- `GCP_STORAGE_BUCKET` - Cloud Storage bucket 名稱
- `OPENAI_API_KEY` - OpenAI API key (Whisper, TTS)
- `GEMINI_API_KEY` - Gemini API key
- `REDIS_URL` - Redis 連線（如使用 Upstash）
- `NODE_ENV` - development/staging/production

---

## 8. DevOps 方向

### 版本控制
**決定**：Git + GitHub

**理由**：業界標準，社群資源最豐富

### CI/CD
**決定**：GitHub Actions

**理由**：
- 與 GitHub 整合度高
- 免費額度大（公開 repo 無限制）
- 可以直接部署到 GCP Cloud Run
- 社群資源豐富，有大量現成 actions 可用

### 監控與日誌
**MVP 階段**：
- GCP Cloud Logging（Cloud Run 內建）
- 簡單的 console.log

**未來**：
- GCP Cloud Monitoring（監控 metrics）
- Sentry（錯誤追蹤）

**理由**：
- GCP 內建服務，整合度高
- 初期使用免費層即可
- 簡單好用

---

## 9. 認證與授權

**MVP 階段是否需要登入**：[x] 是

**決定**：Supabase Auth

**理由**：
- 與 Supabase 資料庫整合
- 免費層足夠使用
- 支援多種登入方式（email、Google、GitHub 等）
- 簡單好用，文檔完整

---

## 技術棧總結

### 最終決定：GCP 為主的混合架構

```
前端：Next.js + Tailwind CSS + shadcn/ui
　　　部署：Vercel（或 GCP Cloud Storage + Cloud CDN）

後端：Node.js (Express/Fastify) + Docker
　　　部署：GCP Cloud Run

資料庫：PostgreSQL (Supabase 免費層 → 未來可遷移到 GCP Cloud SQL)

快取：Redis (Upstash 免費層 → 未來可用 GCP Memorystore)

影片處理：FFmpeg (伺服器端)

儲存：GCP Cloud Storage

CDN：Cloudflare（免費層）或 GCP Cloud CDN

AI 服務：
　- 文字生成：Gemini（主要）、評估 Grok
　- 語音轉文字：OpenAI Whisper API
　- 文字轉語音：OpenAI TTS

認證：Supabase Auth

DevOps：
　- 版本控制：Git + GitHub
　- CI/CD：GitHub Actions
　- 監控：GCP Cloud Logging/Monitoring
```

---

### 架構優點

1. **成本優化**
   - 優先使用免費層服務（Supabase、Upstash、Cloudflare）
   - GCP Cloud Run 按需計費，初期成本低
   - Gemini 免費額度大，成本最低

2. **以 GCP 為主**
   - Cloud Run、Cloud Storage、Cloud Logging 形成完整生態
   - 除非成本差異大，否則優先使用 GCP
   - 未來擴展可以無縫升級 GCP 服務

3. **社群支援強**
   - Next.js、Node.js、FFmpeg、PostgreSQL 都有豐富的社群資源
   - 遇到問題容易找到解決方案
   - 大量現成範例和教學

4. **簡潔易維護**
   - 技術棧單純，使用成熟穩定的技術
   - 避免過度設計，保持簡單

5. **彈性擴展**
   - 初期使用免費服務
   - 需要時可以升級到 GCP 付費服務
   - 可以根據成本調整 AI 服務供應商

---

### 潛在風險與應對

| 風險 | 應對方案 |
|------|----------|
| **Cloud Run timeout** | 影片處理改用非同步佇列（Cloud Tasks） |
| **Supabase 免費層不足** | 遷移到 GCP Cloud SQL |
| **Gemini 效果不佳** | 評估 Grok 或其他更便宜的 LLM |
| **儲存成本過高** | 考慮使用 Cloudflare R2（無 egress 費用） |
| **開發環境複雜** | 使用 Docker Compose 統一環境 |

---

## 技術棧明細表

| 層級 | 技術 | 理由 |
|------|------|------|
| **前端框架** | Next.js | 社群資源豐富、開發速度快 |
| **前端 UI** | Tailwind CSS + shadcn/ui | 快速開發、美觀、可控 |
| **前端部署** | Vercel | 免費、簡單、或用 GCP |
| **後端語言** | Node.js | 與前端同語言、生態豐富 |
| **後端框架** | Express/Fastify | 簡單、穩定、社群大 |
| **後端部署** | GCP Cloud Run | 按需計費、支援長時間處理 |
| **資料庫** | PostgreSQL (Supabase) | 免費層、可遷移到 GCP |
| **快取** | Redis (Upstash) | 免費層、可升級 GCP Memorystore |
| **影片處理** | FFmpeg | 功能完整、免費、社群大 |
| **物件儲存** | GCP Cloud Storage | GCP 原生、整合度高 |
| **CDN** | Cloudflare / GCP Cloud CDN | 加速影片載入 |
| **文字生成** | Gemini | 成本低、免費額度大 |
| **語音轉文字** | OpenAI Whisper | 效果好、價格合理 |
| **文字轉語音** | OpenAI TTS | 效果好、價格合理 |
| **認證** | Supabase Auth | 整合資料庫、免費、簡單 |
| **CI/CD** | GitHub Actions | 免費、整合度高 |
| **監控日誌** | GCP Cloud Logging | GCP 原生、免費層足夠 |

---

**完成檢查**：
- [x] 確定了前端技術方向（Next.js + Tailwind + shadcn/ui）
- [x] 確定了後端技術與部署方式（Node.js + GCP Cloud Run）
- [x] 選擇了資料庫方案（PostgreSQL/Supabase）
- [x] 決定了影片處理技術（FFmpeg）
- [x] 選擇了 AI 服務（Gemini + OpenAI Whisper/TTS）
- [x] 規劃了儲存方案（GCP Cloud Storage + Cloudflare CDN）
- [x] 確定了認證方案（Supabase Auth）
- [x] 規劃了開發環境（混合架構）
- [x] 確定了 DevOps 方向（GitHub Actions + GCP 監控）

**完成後**：更新 `00-INDEX.md` 狀態，繼續步驟 7
