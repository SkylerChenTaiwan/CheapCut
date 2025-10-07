# CheapCut 五人並行開發執行計劃

**版本**: 2.0
**建立日期**: 2025-10-07
**更新日期**: 2025-10-07
**目標**: 五個 Claude Code 獨立開發不同 Task，最大化並行效率

---

## 📋 重要前置作業

### ⚠️ 開始開發前必須先修復的問題

根據一致性分析報告,以下問題必須在開始並行開發前處理:

- [ ] **P0-1**: 新增 Task 3.9 (時間軌編輯器)
- [ ] **P0-2**: 修改 Task 3.6 (加入進度顯示)
- [ ] **P0-3**: 修改 Task 2.12 (異步處理機制)
- [ ] **P1-1**: 修改 Task 2.10 (快取邏輯)

**預估修復時間**: 2-3 小時 (更新文件)

---

## 🎯 並行開發策略總覽

### 關鍵原則

1. **完全獨立**: 每個 Claude 負責完全獨立的 Task
2. **無需同步**: Task 之間無依賴關係，不需等待其他人
3. **各自推進**: 每個 Claude 按自己的節奏開發
4. **批次整合**: 完成後一次性整合所有成果
5. **明確範圍**: 每個 Task 有清楚的輸入/輸出定義

### 人員分配（垂直切片模式）

| Claude Code | 垂直切片 | 範圍（API + 前端） | 可立即開始 |
|------------|---------|------------------|-----------|
| **Claude A** | 影片素材管理 | 上傳、分析、切分、素材庫 | ✅ DAY 1 |
| **Claude B** | 配音處理 | 上傳、轉錄、分析、配音庫 | ✅ DAY 1 |
| **Claude C** | AI 選片時間軸 | 查詢、選片、時間軸預覽 | ✅ DAY 1 |
| **Claude D** | 影片合成渲染 | 合成、字幕、配樂、進度 | ✅ DAY 1 |
| **Claude E** | 基礎設施管理 | 專案、認證、監控、後台 | ✅ DAY 1 |

---

## 📅 獨立 Task 分配計劃

---

## 🎯 真正並行開發模式

### 核心概念

**五個 Claude 同時開始，完全獨立開發**：
- 使用預先定義好的 Interface（已在文件中）
- 每個人獨立完成一個垂直切片（API + 前端）
- 使用 Mock 資料庫（JSON 檔案）
- 使用 Mock 外部 API
- 不依賴其他人的進度

### DAY 0 準備（開始前完成）

**用戶自己先完成**：
1. 建立 `docs/interfaces/` 目錄，定義所有 Interface
2. 建立 `mock-data/` 目錄，準備測試資料
3. 建立基本專案結構（package.json, tsconfig.json）
4. 所有 Claude 都可以 clone 這個 repo

**或者讓 Claude A 花 1 小時完成**，其他人等 1 小時即可開始

---

## 垂直切片 1: 影片素材管理（Video Material）

**執行者**: Claude A
**目標**: 完整的影片上傳、分析、切分流程（API + 前端）
**總時間**: 18-24 小時 (2-3 天)
**可立即開始**: ✅

### 後端 API (10-12 小時)

```
□ 影片上傳 API (2-3 小時)
  - POST /api/videos/upload
  - 使用 Mock GCS (本地儲存)
  - 儲存到 Mock DB (JSON 檔案)

□ 影片分析 API (3-4 小時)
  - POST /api/videos/:id/analyze
  - Mock Google Video AI (回傳假資料)
  - 儲存分析結果

□ 影片切分 API (3-4 小時)
  - POST /api/videos/:id/segment
  - 真實 FFmpeg 切分
  - 生成縮圖

□ 素材查詢 API (2-3 小時)
  - GET /api/videos
  - GET /api/segments?tags=xxx
  - 從 Mock DB 讀取
```

### 前端頁面 (8-12 小時)

```
□ 素材上傳頁面 (4-5 小時)
  - 拖曳上傳組件
  - 上傳進度顯示
  - 呼叫上傳 API

□ 素材庫頁面 (4-5 小時)
  - 素材列表
  - 標籤篩選
  - 預覽功能
```

### 獨立測試

```bash
# 測試上傳
curl -X POST /api/videos/upload -F "video=@test.mp4"

# 啟動前端
npm run dev:video-material
```

---

## 垂直切片 2: 配音處理（Voiceover）

**執行者**: Claude B
**目標**: 完整的配音上傳、轉錄、分析流程（API + 前端）
**總時間**: 16-22 小時 (2-3 天)
**可立即開始**: ✅

### 後端 API (9-11 小時)

```
□ 配音上傳 API (2-3 小時)
  - POST /api/voiceovers/upload
  - 使用 Mock GCS
  - 儲存到 Mock DB

□ STT 轉錄 API (3-4 小時)
  - POST /api/voiceovers/:id/transcribe
  - Mock Whisper API (回傳假資料)
  - 儲存轉錄結果

□ 語意分析 API (4-5 小時)
  - POST /api/voiceovers/:id/analyze
  - Mock Gemini API
  - 提取關鍵字

□ 配音查詢 API (2-3 小時)
  - GET /api/voiceovers
  - 從 Mock DB 讀取
```

### 前端頁面 (7-11 小時)

```
□ 配音錄製/上傳頁面 (4-6 小時)
  - 錄音功能
  - 音檔上傳
  - 波形顯示

□ 配音管理頁面 (3-5 小時)
  - 配音列表
  - 轉錄文字顯示
  - 關鍵字標籤
```

---

## 垂直切片 3: AI 選片與時間軸（AI Selection）

**執行者**: Claude C
**目標**: 完整的 AI 選片、時間軸生成流程（API + 前端）
**總時間**: 18-24 小時 (2-3 天)
**可立即開始**: ✅

### 後端 API (10-14 小時)

```
□ 候選片段查詢 API (3-4 小時)
  - GET /api/selection/candidates
  - 根據關鍵字查詢 Mock 片段
  - 相似度排序

□ AI 選片 API (5-7 小時)
  - POST /api/selection/select
  - Mock Gemini API
  - 輸出選片決策

□ 時間軸生成 API (4-5 小時)
  - POST /api/timelines/generate
  - 生成時間軸 JSON
  - 儲存到 Mock DB

□ Prompt 管理 API (2-3 小時)
  - GET/POST /api/prompts
  - 版本控制
```

### 前端頁面 (8-10 小時)

```
□ 選片參數設定頁面 (3-4 小時)
  - 上傳配音
  - 設定選片參數

□ 時間軸預覽頁面 (5-6 小時)
  - 時間軸可視化
  - 片段預覽
```

---

## 垂直切片 4: 影片合成（Composition）

**執行者**: Claude D
**目標**: 完整的影片合成、渲染流程（API + 前端）
**總時間**: 18-24 小時 (2-3 天)
**可立即開始**: ✅

### 後端 API (12-16 小時)

```
□ FFmpeg 環境設定 (2-3 小時)
  - 安裝 FFmpeg
  - FFmpegWrapper

□ 影片合成 API (5-7 小時)
  - POST /api/composition/render
  - 讀取 Mock 時間軸
  - FFmpeg 合成
  - 異步處理 (Bull Queue)

□ 字幕生成 API (3-4 小時)
  - SRT 生成
  - 字幕疊加

□ 配樂整合 API (2-3 小時)
  - 音樂混音
  - 音量調整
```

### 前端頁面 (6-8 小時)

```
□ 合成參數設定頁面 (3-4 小時)
  - 字幕樣式設定
  - 配樂選擇

□ 渲染進度頁面 (3-4 小時)
  - 進度條
  - 輪詢狀態
```

---

## 垂直切片 5: 基礎設施與管理（Infrastructure）

**執行者**: Claude E
**目標**: 基礎設施、認證、監控、管理後台
**總時間**: 20-26 小時 (2-3 天)
**可立即開始**: ✅

### 基礎設施 (12-16 小時)

```
□ 專案初始化 (2-3 小時)
  - package.json
  - tsconfig.json
  - 目錄結構

□ Mock 資料庫系統 (3-4 小時)
  - JSON 檔案 CRUD
  - 簡易查詢功能

□ 認證系統 (3-4 小時)
  - Mock Supabase Auth
  - JWT Token

□ Logger 系統 (2-3 小時)
  - 日誌記錄
  - 儲存到檔案

□ 成本追蹤系統 (2-3 小時)
  - API 呼叫計數
  - 成本統計
```

### 管理後台 (8-10 小時)

```
□ Dashboard 頁面 (3-4 小時)
  - 系統狀態
  - 關鍵指標

□ 成本監控頁面 (3-4 小時)
  - 成本報表
  - 趨勢圖表

□ 任務管理頁面 (2-3 小時)
  - 任務列表
  - 任務重試
```

---

## 整合階段: 組合所有垂直切片

**執行者**: 全員協作
**目標**: 整合所有垂直切片，替換 Mock 為真實 API
**總時間**: 2-3 天

### Step 1: Interface 對齊 (半天)

```
□ 檢查所有 API 的輸入/輸出格式
□ 確保 Interface 契約一致
□ 測試 API 互通性
```

### Step 2: 替換 Mock (1-2 天)

各 Claude 負責自己的部分：

```
□ Claude A: 替換 Mock GCS 為真實 GCS
□ Claude A: 替換 Mock Video AI 為真實 API
□ Claude B: 替換 Mock Whisper 為真實 API
□ Claude B: 替換 Mock Gemini 為真實 API
□ Claude C: 替換 Mock Gemini 為真實 API
□ Claude E: 替換 Mock DB 為真實 Supabase
□ Claude E: 設定 Redis
```

### Step 3: 端到端測試 (半天)

```
□ 完整流程測試（上傳素材 → 上傳配音 → 生成影片）
□ 效能測試
□ 部署到 Cloud Run / Vercel
```

---

## 📊 整體時間軸預估（真正並行模式）

| 垂直切片 | 執行方式 | 負責人 | 工作量 | 實際日曆時間 |
|---------|---------|-------|--------|------------|
| **切片 1: 影片素材** | 獨立 | Claude A | 18-24 小時 | 2-3 天 |
| **切片 2: 配音處理** | 獨立 | Claude B | 16-22 小時 | 2-3 天 |
| **切片 3: AI 選片** | 獨立 | Claude C | 18-24 小時 | 2-3 天 |
| **切片 4: 影片合成** | 獨立 | Claude D | 18-24 小時 | 2-3 天 |
| **切片 5: 基礎設施** | 獨立 | Claude E | 20-26 小時 | 2-3 天 |
| **整合階段** | 協作 | 全員 | 16-21 小時 | 2-3 天 |

### 時間軸視覺化（真正並行！）

```
DAY 0: 準備 (1 小時)
  用戶或 Claude E: 建立基本專案結構 + Interface 定義

DAY 1-3: 五個人同時並行開發！
  Claude A: [======== 垂直切片 1: 影片素材 ========]
  Claude B: [======== 垂直切片 2: 配音處理 ========]
  Claude C: [======== 垂直切片 3: AI 選片 ========]
  Claude D: [======== 垂直切片 4: 影片合成 ========]
  Claude E: [======== 垂直切片 5: 基礎設施 ========]

DAY 4-6: 整合階段
  全員:     [========= 整合所有切片 =========]
```

**總日曆時間**: 約 **6 天**（相比原本 12-18 天，快一倍！）
**總工作量**: 90-116 人時
**平均每人**: 18-23 小時

**真正的並行優勢**:
- ✅ **五個人同時開始**，無人閒置
- ✅ 每個人負責完整的垂直切片（API + 前端）
- ✅ 使用 Mock 完全獨立開發
- ✅ Git 衝突極少（不同目錄）
- ✅ 整合階段才替換 Mock

---

## ⚠️ 風險管理（獨立開發模式）

### 關鍵風險

| 風險 | 等級 | 緩解措施 |
|------|------|---------|
| Interface 不一致 | 🔴 高 | 事前定義清楚 Interface，提供範例 |
| 整合困難 | 🟡 中 | Phase 4 預留充足時間，提前進行 Contract Testing |
| Git 衝突 | 🟢 低 | 每個模組使用獨立目錄，極少重疊 |
| 重複開發 | 🟢 低 | 明確分工，定義清楚模組邊界 |

### 成功關鍵

1. **Interface First**: 開始前定義好所有 Interface
2. **Mock Testing**: 每個模組必須能獨立測試
3. **文件齊全**: 每個模組提供完整文件與範例
4. **Contract Testing**: Phase 4 前進行 Interface 契約測試

---

## 📝 進度追蹤模板（獨立開發）

### 各 Claude 進度追蹤

| Claude | 當前 Phase | 當前 Task | 完成度 | 預計完成 | 狀態 |
|--------|-----------|----------|--------|---------|------|
| Claude A | Phase 0 | Task 1.3 | 60% | Day 3 | ⏳ 進行中 |
| Claude B | Phase 2A | Task 2.2 | 40% | Day 5 | ⏳ 進行中 |
| Claude C | Phase 2B | Task 2.5 | 30% | Day 5 | ⏳ 進行中 |
| Claude D | Phase 2C | Task 2.9 | 50% | Day 6 | ⏳ 進行中 |
| Claude E | Phase 2D | Task 2.11 | 20% | Day 6 | ⏳ 進行中 |

**圖例**: ⏸ 待開始 | ⏳ 進行中 | ✅ 已完成 | ❌ 遇到問題

---

## 📋 Interface 定義文件

### 開始開發前必須完成

**Claude A 負責建立以下 Interface 定義**：

```typescript
// interfaces/video-analysis.interface.ts
// interfaces/voiceover.interface.ts
// interfaces/ai-selection.interface.ts
// interfaces/composition.interface.ts
// interfaces/storage.interface.ts
```

**提供給所有 Claude**：
- Interface TypeScript 定義
- Mock 資料範例
- 測試用例範例

---

## ✅ 開始前檢查清單

### 環境準備

- [ ] 所有 Claude Code 都已安裝並設定
- [ ] 所有必要的 API Keys 已取得
  - [ ] Supabase URL & Keys
  - [ ] GCP Project & Credentials
  - [ ] OpenAI API Key
  - [ ] Gemini API Key
- [ ] Git repository 已建立
- [ ] 每個 Claude 都可以存取 repository

### Interface 準備（最重要！）

- [ ] **Interface 定義文件已建立**
- [ ] **Mock 資料範例已提供**
- [ ] **所有 Claude 都已閱讀 Interface 文件**
- [ ] **測試用例已準備**

### 文件準備

- [ ] P0 問題已修復 (Task 3.9, 3.6, 2.12, 2.10)
- [ ] 所有 Task 文件已更新
- [ ] 所有 Claude 都已閱讀各自的 Phase 文件

### 分工確認

- [ ] 已指派每個 Claude 的 Phase
- [ ] 已建立獨立的 Git Branch 策略
  - `feature/phase-0-infrastructure` (Claude A)
  - `feature/phase-2a-video-analysis` (Claude B)
  - `feature/phase-2b-voiceover` (Claude C)
  - `feature/phase-2c-ai-selection` (Claude D)
  - `feature/phase-2d-composition` (Claude E)
- [ ] 已建立進度追蹤文件

---

## 🚀 啟動流程（真正並行）

### DAY 0: 準備（1 小時，用戶或 Claude E）

1. **建立基本專案結構**：
   ```bash
   mkdir cheapcut && cd cheapcut
   npm init -y
   mkdir -p src/{api,frontend,mock-db,interfaces}
   ```

2. **建立 Interface 定義文件**：
   ```typescript
   // src/interfaces/video.interface.ts
   // src/interfaces/voiceover.interface.ts
   // src/interfaces/timeline.interface.ts
   // src/interfaces/composition.interface.ts
   ```

3. **建立 Mock 資料目錄**：
   ```bash
   mkdir -p mock-data/{videos,voiceovers,timelines}
   mkdir -p test-assets/{videos,audio}
   ```

4. **所有人 clone repo**

### DAY 1: 五個人同時開始！

**所有 Claude 同時執行**：

1. 切換到各自的 feature branch：
   - `git checkout -b feature/video-material` (Claude A)
   - `git checkout -b feature/voiceover` (Claude B)
   - `git checkout -b feature/ai-selection` (Claude C)
   - `git checkout -b feature/composition` (Claude D)
   - `git checkout -b feature/infrastructure` (Claude E)

2. 閱讀 Interface 文件

3. 開始各自的垂直切片開發

4. 使用 Mock 資料測試

### DAY 2-3: 持續獨立開發

1. 各自按照計劃開發
2. 定期 commit 到各自的 branch
3. 不需要等待其他人

### DAY 4-6: 整合階段

1. 所有人完成各自的垂直切片
2. Merge 所有 branch
3. 替換 Mock 為真實 API
4. 端到端測試
5. 部署

---

## 📚 相關文件

- [00-INDEX.md](./00-INDEX.md) - 執行計劃總索引
- [01-project-overview.md](./01-project-overview.md) - 專案總覽
- [PARALLEL-WORK-INSTRUCTIONS.md](./PARALLEL-WORK-INSTRUCTIONS.md) - 並行工作指引

---

**完成檢查**:
- [x] 重新設計為真正並行開發模式
- [x] 改為垂直切片（API + 前端）
- [x] 移除所有同步點依賴
- [x] **五個人可以同時在 DAY 1 開始**
- [x] 定義了 Mock First 策略
- [x] 提供了新的時間軸預估（6 天完成！）
- [x] 更新了啟動流程

**準備開始**:
- [ ] DAY 0: 建立基本專案結構（1 小時）
- [ ] DAY 0: 建立 Interface 定義文件
- [ ] DAY 1: 五個 Claude 同時開始各自的垂直切片
- [ ] DAY 4: 開始整合
