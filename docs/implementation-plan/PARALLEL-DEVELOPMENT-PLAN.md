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

### 人員分配（獨立 Task 模式）

| Claude Code | 專注領域 | 獨立 Task 範圍 | 無需依賴 |
|------------|---------|--------------|---------|
| **Claude A** | 基礎設施 | Phase 0/1 完整建設 | ✅ 完全獨立 |
| **Claude B** | 影片分析 | 影片分析全流程 | ✅ 完全獨立 |
| **Claude C** | 配音處理 | 配音處理全流程 | ✅ 完全獨立 |
| **Claude D** | AI 選片 | 選片與時間軸生成 | ✅ 完全獨立 |
| **Claude E** | 影片合成 | FFmpeg 合成全流程 | ✅ 完全獨立 |

---

## 📅 獨立 Task 分配計劃

---

## 🎯 獨立開發模式說明

### 核心概念

**每個 Claude 負責一個完整的獨立模組**：
- 從輸入到輸出的完整流程
- 使用 Mock 資料進行獨立測試
- 定義清楚的 Interface 供後續整合
- 不依賴其他 Claude 的進度

### 整合策略

1. **Interface First**: 先定義好各模組的輸入/輸出格式
2. **Mock Testing**: 使用假資料進行獨立測試
3. **Batch Integration**: 所有模組完成後一次整合
4. **Contract Testing**: 確保 Interface 契約符合預期

---

## Phase 0: 基礎設施建立

**執行者**: Claude A
**目標**: 建立完整的基礎設施與測試框架
**總時間**: 25-36 小時 (3-4 天)

### 完整 Task 列表

```
□ Task 0.1: 建立驗收 CLI 框架 (3-4 小時)
□ Task 0.2: 環境檢查測試 (2-3 小時)
□ Task 0.3: 測試資料準備 (4-5 小時)
□ Task 1.1: 資料庫 Schema (2-3 小時)
□ Task 1.2: Supabase Auth (2-3 小時)
□ Task 1.3: API 基礎架構 (3-4 小時)
□ Task 1.4: Redis 設定 (2-3 小時)
□ Task 1.5: Logger 服務 (4-5 小時)
□ Task 1.6: 成本與效能追蹤 (5-6 小時)
```

### 交付成果

- ✅ 完整的驗收測試框架
- ✅ 資料庫 Schema 與 API 路由骨架
- ✅ 認證系統
- ✅ Redis 快取與 Bull Queue
- ✅ Logger 與成本追蹤系統
- ✅ 測試資料集

### 提供給其他 Claude

- API 路由定義文件
- 資料庫 Schema 文件
- Mock 資料產生器
- 測試框架使用說明

---

## Phase 2A: 影片分析模組

**執行者**: Claude B
**目標**: 完整的影片分析流程（獨立開發）
**總時間**: 18-23 小時 (2-3 天)

### 完整 Task 列表

```
□ Task 2.0: Prompt 管理系統 (3-4 小時)
  - 獨立的 PromptManager 模組
  - 使用本地檔案系統儲存 Prompt
  - 版本控制與快取機制

□ Task 2.1: GCS 儲存與上傳 (3-4 小時)
  - 獨立的 StorageService 模組
  - 支援 presigned URL 生成
  - Mock API 供測試使用

□ Task 2.2: Google Video AI 整合 (4-5 小時)
  - 獨立的 VideoAnalysisService
  - 使用 Mock 影片進行測試
  - 輸出標準化的 JSON 格式

□ Task 2.3: 標籤轉換與儲存 (3-4 小時)
  - 獨立的 TagService
  - 標籤標準化邏輯
  - 使用 Mock 資料庫 (JSON 檔案)

□ Task 2.4: 影片切分與縮圖生成 (4-5 小時)
  - 獨立的 SegmentService
  - FFmpeg 切分邏輯
  - 使用測試影片進行驗證
```

### 交付成果

- ✅ 完整的影片分析 Pipeline
- ✅ Prompt 管理系統
- ✅ 儲存服務
- ✅ 標籤處理系統
- ✅ 片段切分系統
- ✅ Interface 定義文件

### 獨立測試方式

使用 Mock 資料：
```bash
npm run test:video-analysis
# 使用測試影片 test-videos/sample.mp4
# 輸出分析結果到 mock-output/video-analysis.json
```

---

## Phase 2B: 配音處理模組

**執行者**: Claude C
**目標**: 完整的配音處理流程（獨立開發）
**總時間**: 17-21 小時 (2-3 天)

### 完整 Task 列表

```
□ Task 2.0: Prompt 管理系統 (已由 Claude B 完成，直接使用)

□ Task 2.5: Whisper STT 整合 (3-4 小時)
  - 獨立的 STTService
  - 使用 Mock 音檔進行測試
  - 輸出帶時間軸的 JSON

□ Task 2.6: 語意分析 (4-5 小時)
  - 獨立的 SemanticAnalysisService
  - 使用 Mock Prompt (本地檔案)
  - 輸出關鍵字與主題 JSON

□ Task 2.7: 配音切分 (3-4 小時)
  - 獨立的 VoiceoverSegmentService
  - 基於時間軸切分邏輯
  - 使用 Mock 資料測試

□ Task 2.8: 候選片段查詢 (3-4 小時)
  - 獨立的 QueryService
  - 標籤查詢與相似度排序
  - 使用 Mock 資料庫
```

### 交付成果

- ✅ 完整的配音處理 Pipeline
- ✅ STT 轉錄系統
- ✅ 語意分析系統
- ✅ 配音切分系統
- ✅ 候選片段查詢系統
- ✅ Interface 定義文件

### 獨立測試方式

使用 Mock 資料：
```bash
npm run test:voiceover
# 使用測試音檔 test-audio/sample.mp3
# 輸出分析結果到 mock-output/voiceover-analysis.json
```

---

## Phase 2C: AI 選片模組

**執行者**: Claude D
**目標**: 完整的 AI 選片與時間軸生成（獨立開發）
**總時間**: 16-20 小時 (2-3 天)

### 完整 Task 列表

```
□ Task 2.9: AI 選片決策 (5-6 小時)
  - 獨立的 AISelectionService
  - 使用 Mock Prompt 與候選片段
  - 輸出選片決策 JSON

□ Task 2.10: 時間軸生成 (4-5 小時)
  - 獨立的 TimelineService
  - 生成標準時間軸格式
  - 快取邏輯 (使用本地檔案模擬 Redis)

□ Task 2.16: Prompt A/B 測試機制 (3-4 小時)
  - Prompt 版本管理
  - 效果追蹤與比較

□ Task 整合測試 (4-5 小時)
  - 端到端測試框架
  - 使用 Mock 資料測試完整流程
```

### 交付成果

- ✅ AI 選片系統
- ✅ 時間軸生成系統
- ✅ Prompt A/B 測試機制
- ✅ Interface 定義文件

### 獨立測試方式

使用 Mock 資料：
```bash
npm run test:ai-selection
# 使用 Mock 候選片段 mock-data/candidates.json
# 輸出時間軸到 mock-output/timeline.json
```

---

## Phase 2D: 影片合成模組

**執行者**: Claude E
**目標**: 完整的影片合成流程（獨立開發）
**總時間**: 19-24 小時 (2-3 天)

### 完整 Task 列表

```
□ Task 2.11: FFmpeg 環境設定 (2-3 小時)
  - FFmpeg 安裝與測試
  - FFmpegWrapper 模組

□ Task 2.12: 基礎影片合成 (4-5 小時)
  - 獨立的 VideoCompositionService
  - 片段拼接邏輯
  - 異步處理機制

□ Task 2.13: 字幕疊加 (3-4 小時)
  - 獨立的 SubtitleService
  - SRT 生成與疊加

□ Task 2.14: 配樂整合 (3-4 小時)
  - 獨立的 MusicService
  - 音樂淡入淡出
  - 音量自動調整

□ Task 整合測試 (4-5 小時)
  - 使用 Mock 時間軸測試
  - 完整影片生成驗證

□ Task Cloud Run 部署準備 (3-4 小時)
  - Dockerfile 設定
  - Timeout 與資源配置
```

### 交付成果

- ✅ 完整的影片合成 Pipeline
- ✅ FFmpeg 整合
- ✅ 字幕系統
- ✅ 配樂系統
- ✅ 異步處理機制
- ✅ Cloud Run 部署配置

### 獨立測試方式

使用 Mock 資料：
```bash
npm run test:composition
# 使用 Mock 時間軸 mock-data/timeline.json
# 輸出影片到 mock-output/final-video.mp4
```

---

## Phase 3A: 基礎前端設施

**執行者**: Claude A（完成 Phase 0 後）
**目標**: Next.js 專案與認證系統
**總時間**: 5-7 小時 (1 天)

### 完整 Task 列表

```
□ Task 3.1: Next.js 專案設定 (2-3 小時)
  - 專案初始化
  - 路由結構
  - 共用組件庫

□ Task 3.2: 登入/註冊頁面 (3-4 小時)
  - 整合 Supabase Auth
  - 表單驗證
```

### 交付成果

- ✅ Next.js 專案骨架
- ✅ 認證系統
- ✅ 共用組件庫

---

## Phase 3B: 素材管理介面

**執行者**: Claude B（完成 Phase 2A 後）
**目標**: 素材上傳與管理
**總時間**: 8-10 小時 (1-2 天)

### 完整 Task 列表

```
□ Task 3.3: 素材上傳介面 (4-5 小時)
  - 拖曳上傳組件
  - 上傳進度顯示
  - 使用 Mock API

□ Task 3.4: 素材庫瀏覽 (4-5 小時)
  - 素材列表與篩選
  - 預覽功能
  - 使用 Mock 資料
```

### 交付成果

- ✅ 素材上傳系統
- ✅ 素材管理介面

---

## Phase 3C: 配音管理介面

**執行者**: Claude C（完成 Phase 2B 後）
**目標**: 配音錄製與上傳
**總時間**: 5-6 小時 (1 天)

### 完整 Task 列表

```
□ Task 3.5: 配音錄製/上傳 (5-6 小時)
  - 錄音功能
  - 音檔上傳
  - 波形顯示
  - 使用 Mock API
```

### 交付成果

- ✅ 配音管理系統

---

## Phase 3D: 影片生成介面

**執行者**: Claude D（完成 Phase 2C 後）
**目標**: 影片生成與編輯
**總時間**: 15-20 小時 (2-3 天)

### 完整 Task 列表

```
□ Task 3.6: 影片生成介面 (4-5 小時)
  - 生成參數設定
  - 進度輪詢邏輯
  - 進度條 UI
  - 使用 Mock API

□ Task 3.7: 影片預覽播放 (3-4 小時)
  - 影片播放器
  - 播放控制

□ Task 3.8: 下載與分享 (2-3 小時)
  - 下載功能
  - 分享連結

□ Task 3.9: 時間軌編輯器 (6-8 小時)
  - 時間軌 UI 組件
  - 片段替換功能
  - 即時預覽
  - 使用 Mock 時間軸資料
```

### 交付成果

- ✅ 影片生成系統
- ✅ 時間軌編輯器
- ✅ 預覽與分享功能

---

## Phase 4: 批次整合階段

**執行者**: 全員協作
**目標**: 整合所有獨立模組
**總時間**: 2-3 天

### Step 1: Interface 對齊 (半天)

**所有 Claude 一起進行**：
```
□ 檢查所有模組的輸入/輸出格式
□ 確保 Interface 契約一致
□ 更新文件與範例
```

### Step 2: 模組整合 (1-2 天)

**Claude A 主導，其他人協助**：
```
□ Task 4.1: 模組整合 (8-10 小時)
  - 替換 Mock 資料為真實 API
  - 連接所有模組
  - 端到端測試

□ Task 4.2: 效能測試與優化 (4-5 小時)
  - 壓力測試
  - 效能調優
```

### Step 3: 部署 (半天)

**Claude E 主導**：
```
□ Task 4.3: GCP Cloud Run 部署 (4-5 小時)
□ Task 4.4: Vercel 前端部署 (2-3 小時)
□ Task 4.5: 監控與告警設定 (3-4 小時)
```

### Phase 4 完成標準

- [ ] 所有模組成功整合
- [ ] 端到端測試通過
- [ ] 已部署到正式環境
- [ ] 監控系統運作中

---

## Phase 5: 管理後台開發（獨立並行）

**目標**: 建立管理後台各模組
**時間**: 預估 2-3 天
**執行方式**: 5 人完全獨立並行

---

## Phase 5A: Dashboard 總覽

**執行者**: Claude A
**總時間**: 5-6 小時

```
□ Task 5.1: Dashboard 總覽頁面
  - 系統狀態總覽
  - 關鍵指標顯示
  - 使用 Mock 資料
```

---

## Phase 5B: 成本監控模組

**執行者**: Claude B
**總時間**: 9-11 小時

```
□ Task 5.2: 成本分析模組 (5-6 小時)
  - 成本報表
  - 趨勢分析
  - 使用 Mock 資料

□ Task 5.3: 效能監控模組 (4-5 小時)
  - 效能指標
  - 告警設定
  - 使用 Mock 資料
```

---

## Phase 5C: 系統管理模組

**執行者**: Claude C
**總時間**: 9-11 小時

```
□ Task 5.4: 任務管理模組 (5-6 小時)
  - 任務列表
  - 任務重試
  - 使用 Mock 資料

□ Task 5.5: 用戶管理模組 (4-5 小時)
  - 用戶列表
  - 配額管理
  - 使用 Mock 資料
```

---

## Phase 5D: 設定管理模組

**執行者**: Claude D
**總時間**: 5-6 小時

```
□ Task 5.6: 系統設定與 Prompt 管理
  - Prompt 版本管理
  - 快取設定
  - 使用 Mock 資料
```

---

## Phase 5E: 權限與安全

**執行者**: Claude E
**總時間**: 6-8 小時

```
□ Task 5.7: 權限控制系統 (新增)
  - 角色管理
  - 權限檢查
  - 使用 Mock 資料
```

---

## 📊 整體時間軸預估（獨立開發模式）

| Phase | 執行方式 | 負責人 | 工作量 | 實際日曆時間 |
|-------|---------|-------|--------|------------|
| **Phase 0** | 獨立 | Claude A | 25-36 小時 | 3-4 天 |
| **Phase 2A** | 獨立 | Claude B | 18-23 小時 | 2-3 天 |
| **Phase 2B** | 獨立 | Claude C | 17-21 小時 | 2-3 天 |
| **Phase 2C** | 獨立 | Claude D | 16-20 小時 | 2-3 天 |
| **Phase 2D** | 獨立 | Claude E | 19-24 小時 | 2-3 天 |
| **Phase 3A** | 獨立 | Claude A | 5-7 小時 | 1 天 |
| **Phase 3B** | 獨立 | Claude B | 8-10 小時 | 1-2 天 |
| **Phase 3C** | 獨立 | Claude C | 5-6 小時 | 1 天 |
| **Phase 3D** | 獨立 | Claude D | 15-20 小時 | 2-3 天 |
| **Phase 4** | 協作 | 全員 | 16-21 小時 | 2-3 天 |
| **Phase 5A-E** | 獨立 | 各自 | 5-11 小時 | 1-2 天 |

### 時間軸視覺化

```
Week 1:
  Claude A: [======= Phase 0 =======]
  Claude B:                          [=== Phase 2A ===]
  Claude C:                          [=== Phase 2B ===]
  Claude D:                          [=== Phase 2C ===]
  Claude E:                          [=== Phase 2D ===]

Week 2:
  Claude A:                          [P3A]
  Claude B:                          [P3B]
  Claude C:                          [P3C]
  Claude D:                          [==== Phase 3D ====]
  Claude E:                          (待命)

Week 2-3:
  全員:                              [=== Phase 4 整合 ===]

Week 3:
  Claude A: [P5A]
  Claude B: [== P5B ==]
  Claude C: [== P5C ==]
  Claude D: [P5D]
  Claude E: [P5E]
```

**總日曆時間**: 約 2-3 週
**總工作量**: 149-199 人時
**平均每人**: 30-40 小時

**關鍵優勢**:
- ✅ 無需等待同步點
- ✅ 每個人都能持續開發
- ✅ 整合風險集中在 Phase 4
- ✅ 更容易掌控進度

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

## 🚀 啟動流程

### Step 1: Claude A 建立基礎（第一週）

1. 建立 Interface 定義
2. 建立 Mock 資料產生器
3. 完成 Phase 0
4. 通知其他 Claude 可以開始

### Step 2: 其他 Claude 同時開始（第一週末）

1. Clone repository
2. 切換到各自的 feature branch
3. 閱讀 Interface 文件
4. 開始各自的 Phase 開發

### Step 3: 獨立開發（第二週）

1. 各自按照計劃開發
2. 使用 Mock 資料進行測試
3. 定期 commit 到各自的 branch
4. 更新進度追蹤文件

### Step 4: 批次整合（第二週末）

1. 所有人完成各自 Phase
2. 進入 Phase 4 整合階段
3. 一起進行整合測試
4. 部署到正式環境

---

## 📚 相關文件

- [00-INDEX.md](./00-INDEX.md) - 執行計劃總索引
- [01-project-overview.md](./01-project-overview.md) - 專案總覽
- [PARALLEL-WORK-INSTRUCTIONS.md](./PARALLEL-WORK-INSTRUCTIONS.md) - 並行工作指引

---

**完成檢查**:
- [x] 重新設計為獨立開發模式
- [x] 移除所有同步點依賴
- [x] 明確了每個 Claude 的獨立 Phase
- [x] 定義了 Interface First 策略
- [x] 提供了新的時間軸預估
- [x] 更新了風險管理策略
- [x] 提供了啟動流程

**準備開始**:
- [ ] 修復所有 P0 問題
- [ ] Claude A 建立 Interface 定義
- [ ] 確認環境準備完成
- [ ] Claude A 開始 Phase 0
