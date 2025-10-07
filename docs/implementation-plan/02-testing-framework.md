# 測試架構設計文件

## 文件資訊
- **建立日期**: 2025-10-07
- **版本**: 1.0
- **目的**: 定義 CheapCut 專案的測試策略、驗收架構與執行方式

## 📋 目錄
1. [測試原則](#測試原則)
2. [測試層級架構](#測試層級架構)
3. [驗收流程設計](#驗收流程設計)
4. [測試資料管理](#測試資料管理)
5. [CLI 驗收工具](#cli-驗收工具)
6. [實作規範](#實作規範)

---

## 測試原則

### 核心目標
1. **完全自動化**: 所有驗收測試都可透過 CLI 一鍵執行
2. **功能優先**: 重點驗證功能正確性,其次是成本控制,最後是效能
3. **詳細報告**: 驗收結果要清楚說明通過/失敗原因與除錯資訊
4. **可追溯性**: 保留測試結果供事後檢查與分析

### 開發模式
- **節奏**: 穩定推進,不追求快速迭代
- **測試實作**: 完全由 Claude Code 負責,使用者不需撰寫測試程式
- **人工測試**: 使用者以真實用戶身份進行最終驗證
- **驗收時間**: 可接受 10-60 分鐘的完整驗收流程

### 優先順序
1. **功能正確性** - 最重要,確保功能符合預期
2. **成本控制** - 重要,避免超出預算
3. **效能表現** - 次要,在合理範圍即可

---

## 測試層級架構

### Level 1: 基礎驗證 (Basic Verification)

**執行時間**: 1-2 分鐘
**執行時機**: 每個 task 開始前與完成後
**失敗策略**: 立即中止,不繼續後續測試

**檢查項目**:
- [ ] 環境變數完整性檢查
- [ ] 資料庫連線與 Schema 驗證
- [ ] 外部服務可用性檢查 (S3, Replicate API 等)
- [ ] 必要相依套件安裝確認
- [ ] 測試資料完整性檢查

**驗收指令**:
```bash
npm run verify:basic
```

**報告格式**:
```
✓ Basic Verification (1.2s)
  ✓ Environment variables (12/12 found)
  ✓ Database connection
  ✓ Database schema (8 tables verified)
  ✓ S3 connection (bucket: cheapcut-dev accessible)
  ✓ Replicate API (status: operational)
  ✗ Test data files (missing: videos/valid/long-2m.mp4)

Result: FAILED
Missing files:
  - test-data/videos/valid/long-2m.mp4

Please prepare test files according to test-data/README.md
```

---

### Level 2: 功能驗收 (Functional Acceptance)

**執行時間**: 5-15 分鐘
**執行時機**: 完成功能模組實作後
**失敗策略**: 失敗時立即停止,保留所有測試資料與日誌

**檢查項目範例** (依功能模組切分):

#### 使用者模組
- [ ] 註冊流程正確 (email 驗證、密碼加密)
- [ ] 登入流程正確 (JWT token 發放)
- [ ] 權限控制正確 (free/paid/admin 角色)

#### 上傳模組
- [ ] 檔案上傳成功 (多種格式與大小)
- [ ] S3 儲存正確 (檔案路徑、權限設定)
- [ ] 資料庫記錄正確 (metadata 完整)
- [ ] 錯誤處理正確 (無效檔案、超大檔案)

#### 剪輯模組
- [ ] 剪輯任務建立正確
- [ ] Replicate API 呼叫成功
- [ ] 任務狀態追蹤正確
- [ ] 結果檔案處理正確
- [ ] 額度計算與扣除正確

#### 下載模組
- [ ] 檔案下載連結正確
- [ ] 權限驗證正確 (只能下載自己的檔案)
- [ ] 檔案內容完整

**驗收指令**:
```bash
# 測試特定模組
npm run verify:feature -- --module=upload
npm run verify:feature -- --module=editing
npm run verify:feature -- --module=download

# 測試所有功能模組
npm run verify:feature
```

**報告格式**:
```
✓ Feature Verification - Upload Module (8.5s)
  ✓ Upload valid video (test-data/videos/valid/short-10s.mp4)
    - File uploaded: s3://cheapcut-dev/uploads/test_xxx.mp4
    - Database record created: video_id = test_video_001
    - Size: 5.2MB, Duration: 10.3s

  ✓ Upload validation
    - File type validation: ✓
    - File size limit: ✓

  ✗ Error handling - Invalid file
    Expected: HTTP 400 with error message
    Actual: HTTP 500 Internal Server Error
    Error: TypeError: Cannot read property 'type' of undefined

    Test data saved to: test-data/results/2025-10-07_14-30/
    Logs: test-data/results/2025-10-07_14-30/upload-module.log

Result: FAILED (2/3 tests passed)
🛑 Testing stopped. Please fix the error before continuing.
```

---

### Level 3: 端對端驗收 (E2E Acceptance)

**執行時間**: 15-30 分鐘
**執行時機**: 完成完整功能集合後
**失敗策略**: 記錄失敗但繼續執行,最後統一報告

**測試情境**:

#### 情境 1: 新用戶完整流程
1. 註冊新帳號 (test_user_new)
2. 登入取得 token
3. 上傳影片 (short-10s.mp4)
4. 提交剪輯任務 (簡單指令)
5. 等待任務完成
6. 下載結果檔案
7. 驗證額度扣除正確

#### 情境 2: 付費用戶流程
1. 使用付費用戶登入 (test_user_002)
2. 檢查初始額度
3. 執行剪輯任務
4. 驗證額度扣除
5. 模擬額度不足情況
6. 驗證錯誤處理

#### 情境 3: 錯誤處理流程
1. 上傳無效檔案
2. 提交無效剪輯指令
3. 模擬 API 失敗
4. 驗證錯誤訊息與恢復機制

#### 情境 4: 並發處理
1. 同時提交多個剪輯任務
2. 驗證任務佇列正確運作
3. 驗證結果都正確產生

**驗收指令**:
```bash
# 執行特定情境
npm run verify:e2e -- --scenario=new-user
npm run verify:e2e -- --scenario=paid-user
npm run verify:e2e -- --scenario=error-handling
npm run verify:e2e -- --scenario=concurrent

# 執行所有情境
npm run verify:e2e
```

**報告格式**:
```
E2E Verification - All Scenarios (28.3 min)

Scenario 1: New User Flow ✓ (5.2 min)
  ✓ User registration
  ✓ User login
  ✓ Video upload
  ✓ Edit task submission
  ✓ Task completion (waited 3m 45s)
  ✓ File download
  ✓ Credits deduction (expected: -25, actual: -25)

Scenario 2: Paid User Flow ✓ (4.8 min)
  ✓ Login with credits
  ✓ Edit task execution
  ✓ Credits tracking
  ✓ Insufficient credits handling

Scenario 3: Error Handling ✗ (2.1 min)
  ✓ Invalid file upload (correctly rejected)
  ✗ Invalid prompt handling
    Expected: Graceful error message
    Actual: Task stuck in 'processing' state
    Details: test-data/results/latest/scenario-3-error.log

Scenario 4: Concurrent Processing ✓ (16.2 min)
  ✓ 3 tasks submitted simultaneously
  ✓ All tasks completed successfully
  ✓ Results are correct

Result: 3/4 scenarios passed (75%)
Failed scenarios need attention before production deployment.
```

---

### Level 4: 成本驗證 (Cost Verification)

**執行時間**: 10-20 分鐘
**執行時機**: 功能驗收通過後
**失敗策略**: 記錄警告但不中止 (成本超標是警告,不是錯誤)

**檢查項目**:
- [ ] 單次剪輯成本在預期範圍內
- [ ] 儲存成本計算正確
- [ ] API 呼叫次數符合預期
- [ ] 無資源洩漏 (檔案未清理、連線未關閉)
- [ ] 成本效率符合標準 (成本/秒處理時間)

**驗收指令**:
```bash
# 驗證特定任務成本
npm run verify:cost -- --task=upload
npm run verify:cost -- --task=editing

# 完整成本分析
npm run verify:cost -- --full

# 成本趨勢分析 (比對歷史測試)
npm run verify:cost -- --trend
```

**報告格式**:
```
Cost Verification Report (12.5 min)

Task: Edit 10s video (simple prompt)
  Expected cost: $0.025 ± $0.010
  Actual cost:   $0.028
  Status: ✓ PASS (within tolerance)

  Breakdown:
    - Replicate API:  $0.022
    - S3 Storage:     $0.0001
    - Data Transfer:  $0.0005
    - Other:          $0.0054

Task: Edit 30s video (medium complexity)
  Expected cost: $0.065 ± $0.020
  Actual cost:   $0.095
  Status: ⚠ WARNING (higher than expected)

  Breakdown:
    - Replicate API:  $0.088 (⚠ 47% over estimate)
    - S3 Storage:     $0.0004
    - Data Transfer:  $0.0016
    - Other:          $0.005

  Recommendation: Review Replicate API usage for medium complexity tasks

Resource Leak Check:
  ✓ All temporary files cleaned up
  ✓ All database connections closed
  ✓ No orphaned S3 objects

Cost Efficiency:
  ✓ Cost per second: $0.0032/s (threshold: $0.01/s)
  ✓ Storage growth: $0.05/day (threshold: $0.5/day)

Summary: 1 warning, 0 critical issues
Total test cost: $0.342
```

---

## 驗收流程設計

### 完整驗收流程

```
開始驗收
    ↓
┌─────────────────────────┐
│  檢查測試資料是否完整    │
│  (test-data/videos/等)   │
└─────────────────────────┘
    ↓ 完整              ↓ 不完整
    ↓                  顯示缺少項目 → 中止
    ↓
┌─────────────────────────┐
│  建立測試結果資料夾      │
│  (results/timestamp/)    │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  Level 1: 基礎驗證       │
└─────────────────────────┘
    ↓ 通過              ↓ 失敗
    ↓                  🛑 立即停止 → 產生報告
    ↓
┌─────────────────────────┐
│  Level 2: 功能驗收       │
│  (依序執行各模組測試)     │
└─────────────────────────┘
    ↓ 通過              ↓ 失敗
    ↓                  🛑 立即停止 → 產生報告
    ↓
┌─────────────────────────┐
│  Level 3: 端對端驗收     │
│  (執行完整使用情境)      │
└─────────────────────────┘
    ↓ 通過              ↓ 失敗
    ↓                  ⚠ 記錄但繼續
    ↓
┌─────────────────────────┐
│  Level 4: 成本驗證       │
│  (分析成本與效率)        │
└─────────────────────────┘
    ↓ 在範圍內           ↓ 超標
    ↓                  ⚠ 警告但不中止
    ↓
┌─────────────────────────┐
│  產生完整驗收報告        │
│  - JSON (機器可讀)       │
│  - HTML (人類可讀)       │
│  - 終端機輸出摘要        │
└─────────────────────────┘
    ↓
驗收完成
```

### 失敗處理策略

| 測試層級 | 失敗時行為 | 保留資料 | 後續動作 |
|---------|-----------|---------|---------|
| Level 1 基礎驗證 | 立即中止 | ✓ | 修復環境問題後重新執行 |
| Level 2 功能驗收 | 立即中止 | ✓ | 修復程式碼後重新執行 |
| Level 3 E2E 驗收 | 記錄失敗但繼續 | ✓ | 檢視報告,修復關鍵問題 |
| Level 4 成本驗證 | 僅警告 | ✓ | 分析成本,優化效率 |

---

## 測試資料管理

### 資料夾結構

```
test-data/
├── README.md                 # 測試資料準備指南
├── .gitignore               # 忽略影片檔案與測試結果
├── videos/
│   ├── valid/               # 有效測試影片 (不加入 git)
│   └── invalid/             # 無效測試檔案 (不加入 git)
├── fixtures/                # 測試固定資料 (加入 git)
│   ├── test-users.json
│   ├── edit-prompts.json
│   └── expected-costs.json
└── results/                 # 測試結果 (不加入 git)
    ├── 2025-10-07_14-30/
    ├── 2025-10-07_15-45/
    └── latest -> 2025-10-07_15-45/
```

### 測試資料命名規則

**資料庫測試資料**:
- 所有測試用戶: `test_user_*`
- 所有測試影片記錄: `test_video_*`
- 所有測試訂單: `test_order_*`

**檔案命名**:
- 測試影片: 依規格命名 (如 `short-10s.mp4`)
- 上傳的測試檔案: `test_upload_*`
- 處理結果檔案: `test_result_*`

### 資料保留策略

**測試結果**:
- 保留最近 10 次測試結果
- 失敗的測試結果永遠保留 (需手動清理)
- `latest/` 符號連結指向最新測試

**資料庫測試資料**:
- 測試期間保留所有 `test_*` 資料
- 可選擇性清理 (提供清理腳本)
- 失敗時務必保留供除錯

**S3 測試檔案**:
- 測試結束後可選擇保留或清理
- 建議保留最近一次測試的檔案

---

## CLI 驗收工具

### 主要指令

```bash
# 檢查測試環境
npm run verify:check-env        # 檢查環境設定
npm run verify:check-data       # 檢查測試資料完整性

# 執行驗收測試
npm run verify:all              # 完整驗收流程 (所有層級)
npm run verify:basic            # 僅基礎驗證
npm run verify:feature          # 僅功能驗證
npm run verify:e2e              # 僅端對端驗證
npm run verify:cost             # 僅成本驗證

# 針對性測試
npm run verify -- --module=upload         # 測試特定模組
npm run verify -- --task=task-001         # 測試特定 task
npm run verify -- --scenario=new-user     # 測試特定情境
npm run verify -- --level=basic,feature   # 執行指定層級

# 測試結果管理
npm run verify:report                      # 查看最新測試報告
npm run verify:report -- --id=2025-10-07_14-30  # 查看特定測試報告
npm run verify:cleanup                     # 清理舊測試結果
npm run verify:cleanup -- --keep=5         # 保留最近 5 次

# 資料清理
npm run test:cleanup-db                    # 清理資料庫測試資料
npm run test:cleanup-s3                    # 清理 S3 測試檔案
npm run test:cleanup-all                   # 清理所有測試資料 (謹慎!)
```

### 報告輸出格式

每次驗收產生以下檔案:

```
results/2025-10-07_14-30/
├── test-report.json          # 結構化報告 (給程式讀)
├── test-report.html          # 圖形化報告 (給人看)
├── test-report.md            # Markdown 報告
├── test-summary.txt          # 終端機輸出的摘要
├── logs/
│   ├── basic.log            # 基礎驗證日誌
│   ├── feature-upload.log   # 功能驗證日誌
│   ├── feature-editing.log
│   ├── e2e-scenario-1.log   # E2E 情境日誌
│   └── cost-analysis.log    # 成本分析日誌
├── test-data/
│   ├── uploaded/            # 測試上傳的檔案
│   ├── processed/           # 處理後的結果檔案
│   └── database-dump.sql    # 測試期間的資料庫快照
└── screenshots/             # 錯誤截圖 (如果有)
```

---

## 實作規範

### Implementation Plan 中的 Task 定義

每個 task 都必須包含以下驗收資訊:

```markdown
## Task 01: 實作影片上傳功能

### 功能描述
[功能說明...]

### 實作步驟
1. [步驟 1]
2. [步驟 2]
...

### 驗收標準

#### Basic Verification
- [ ] 上傳 API 端點可正常回應 (GET /api/health 返回 200)
- [ ] S3 bucket 連線正常
- [ ] 資料庫 'videos' 表存在

#### Functional Acceptance
- [ ] 可成功上傳 MP4 檔案 (10MB 以下)
- [ ] 上傳的檔案正確儲存到 S3
- [ ] 資料庫正確記錄上傳資訊 (user_id, filename, size, duration)
- [ ] 拒絕無效檔案格式 (返回 400 錯誤)
- [ ] 拒絕超大檔案 (>500MB, 返回 413 錯誤)

#### E2E Acceptance
- [ ] 完整上傳流程: 登入 → 選擇檔案 → 上傳 → 確認成功
- [ ] 上傳多個檔案時都能正確處理

#### Cost Verification
- [ ] 上傳 10MB 檔案成本 < $0.001
- [ ] 上傳 100MB 檔案成本 < $0.01
- [ ] 無資源洩漏 (暫存檔案已清理)

### 驗收指令
\`\`\`bash
npm run verify -- --task=task-01-upload
\`\`\`

### 預期驗收時間
- Basic: < 30 秒
- Feature: 2-3 分鐘
- E2E: 3-5 分鐘
- Cost: 1-2 分鐘
- **總計**: 約 10 分鐘
```

### 驗收測試實作規範

1. **測試檔案位置**: `tests/acceptance/`
   ```
   tests/
   └── acceptance/
       ├── basic/
       │   ├── check-env.test.ts
       │   └── check-services.test.ts
       ├── feature/
       │   ├── upload.test.ts
       │   ├── editing.test.ts
       │   └── download.test.ts
       ├── e2e/
       │   ├── new-user-flow.test.ts
       │   ├── paid-user-flow.test.ts
       │   └── error-handling.test.ts
       └── cost/
           ├── upload-cost.test.ts
           └── editing-cost.test.ts
   ```

2. **測試框架**: 使用 Jest 或 Vitest
   - 支援非同步測試
   - 容易產生報告
   - 可整合 CI/CD (未來)

3. **測試資料引用**:
   ```typescript
   import testUsers from '../../../test-data/fixtures/test-users.json';
   import editPrompts from '../../../test-data/fixtures/edit-prompts.json';
   ```

4. **成本追蹤**:
   - 每次 API 呼叫都記錄預估成本
   - 在測試結束時統計總成本
   - 與 expected-costs.json 比對

5. **錯誤報告**:
   - 失敗時保留完整的錯誤訊息
   - 保留相關的日誌與資料
   - 提供除錯建議

---

## 檢查清單

在開始 Implementation Plan 之前,確認以下項目已完成:

### 測試環境準備
- [ ] `test-data/` 資料夾結構已建立
- [ ] `test-data/README.md` 已撰寫
- [ ] Fixtures 資料檔案已準備 (test-users.json, edit-prompts.json, expected-costs.json)
- [ ] `.gitignore` 已設定 (忽略影片與結果)

### 測試資料準備 (由使用者完成)
- [ ] 5 個有效測試影片已下載並放置
- [ ] 4 個無效測試檔案已準備
- [ ] 測試資料完整性已驗證

### 驗收工具開發 (Task 0)
- [ ] 驗收 CLI 框架已建立
- [ ] 基礎驗證測試已實作
- [ ] 報告產生器已實作
- [ ] 測試結果管理工具已實作

### 文件完成
- [ ] 測試架構設計文件已撰寫 (本文件)
- [ ] Implementation Plan 模板已定義
- [ ] 每個 Task 都包含明確的驗收標準

---

## 附錄

### 相關文件
- [測試資料準備指南](../test-data/README.md)
- [Implementation Plan](./01-implementation-plan.md) (待建立)

### 工具與資源
- Jest/Vitest 測試框架
- Replicate API 文件
- AWS S3 API 文件
- 成本追蹤工具 (待開發)

### 更新記錄
- 2025-10-07: 初始版本,定義完整測試架構
