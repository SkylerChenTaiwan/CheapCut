# Task 2.0: Prompt 管理系統

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.0 |
| **Task 名稱** | Prompt 管理系統 |
| **所屬 Phase** | Phase 2: 核心引擎實作 |
| **預估時間** | 3-4 小時 |
| **前置 Task** | Phase 1 完成 |
| **檔案位置** | `docs/implementation-plan/phase-2-engines/task-2.0-prompt-management.md` |

---

## 📝 狀態

**文件狀態**: 📝 待撰寫

此文件為骨架，具體內容待填充。

---

## 功能描述

根據 Overall Design (05-data-flow.md)，Prompt 是產品核心競爭力，需要：

1. **使用檔案系統管理**（Markdown + Frontmatter）而非資料庫
2. **支援 Git 版本控制**
3. **支援變數替換**（模板引擎）
4. **快取機制**（正式環境）
5. **熱重載**（開發環境）

主要包含：
- 建立 Prompt 檔案結構
- 實作 PromptManager 類別
- 實作模板引擎（變數替換）
- 實作快取機制
- 建立初始 Prompt 檔案

---

## 前置知識

### 1. Markdown Frontmatter

TODO: 說明 YAML frontmatter 的格式

### 2. 模板引擎

TODO: 說明變數替換的概念

### 3. Git 版本控制

TODO: 說明如何追蹤 Prompt 變更

---

## 前置依賴

### 檔案依賴
- Phase 1 已完成

### 套件依賴
```json
{
  "dependencies": {
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "@types/gray-matter": "^4.0.3"
  }
}
```

### 工具依賴
無特殊工具需求

---

## 實作步驟

### Step 1: 建立 Prompt 檔案結構

TODO: 說明如何組織 Prompt 檔案

```
prompts/
├── voiceover-processing/
│   ├── voiceover-split.md
│   ├── semantic-analysis.md
│   └── README.md
├── video-selection/
│   ├── segment-select.md
│   ├── music-select.md
│   └── README.md
├── material-processing/
│   ├── tag-conversion.md
│   └── README.md
└── README.md
```

### Step 2: 建立 Prompt 檔案格式

TODO: 說明 Prompt 檔案的格式

```markdown
---
name: voiceover-split
category: voiceover-processing
version: 1
variables:
  - transcript
  - duration
active: true
model: gemini-flash
temperature: 0.7
updated: 2025-10-07
notes: |
  v1: 初版
---

# 配音切分 Prompt

## 用途
將配音切分成有節奏的片段，用於智能選片。

## 變數說明
- `transcript`: 配音文字（STT 轉錄結果）
- `duration`: 配音總長度（秒）

---

## Prompt

你是專業影片導演。請將以下配音切分成有節奏的片段。

配音文字：
"""
{{transcript}}
"""

配音總長度：{{duration}} 秒

切分原則：
1. 根據語意自然切分
2. 片段長度要有變化（1-12秒）
3. 重要內容可以較長（5-12秒）
4. 轉場/停頓較短（1-3秒）

請以 JSON 格式回應：
{
  "segments": [
    { "start": 0, "end": 8, "text": "...", "keywords": ["...", "..."] }
  ]
}
```

### Step 3: 實作 PromptManager 類別

TODO: 說明如何實作 Prompt 載入與管理

```typescript
// TODO: 提供 PromptManager 範例
// src/services/prompt-manager.ts
```

### Step 4: 實作變數替換

TODO: 說明如何替換 Prompt 中的變數

```typescript
// TODO: 提供變數替換範例
```

### Step 5: 建立初始 Prompt 檔案

TODO: 說明需要建立哪些 Prompt 檔案

- `prompts/voiceover-processing/voiceover-split.md`
- `prompts/voiceover-processing/semantic-analysis.md`
- `prompts/video-selection/segment-select.md`
- `prompts/video-selection/music-select.md`
- `prompts/material-processing/tag-conversion.md`

---

## 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證 Prompt 管理系統是否正常運作

**測試檔案**: `tests/phase-2/task-2.0.basic.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.0 - Basic: Prompt Management', () => {
  const runner = new TestRunner('basic');

  it('應該能夠載入 Prompt', async () => {
    await runner.runTest('Prompt 載入測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該能夠解析 Frontmatter', async () => {
    await runner.runTest('Frontmatter 解析測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.0.basic.test.ts
```

**通過標準**:
- ✅ 能夠載入 Prompt 檔案
- ✅ 能夠解析 Frontmatter
- ✅ Prompt 目錄結構正確

---

### Functional Acceptance (功能驗收)

**目標**: 驗證 Prompt 功能完整性

**測試檔案**: `tests/phase-2/task-2.0.functional.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.0 - Functional: Prompt Operations', () => {
  const runner = new TestRunner('functional');

  it('應該正確替換變數', async () => {
    await runner.runTest('變數替換測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該正確處理快取', async () => {
    await runner.runTest('快取測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該檢查 Prompt 是否啟用', async () => {
    await runner.runTest('啟用檢查測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.0.functional.test.ts
```

**通過標準**:
- ✅ 變數正確替換
- ✅ 快取正確運作
- ✅ 未啟用的 Prompt 會被拒絕

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證完整 Prompt 使用流程

**測試檔案**: `tests/phase-2/task-2.0.e2e.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.0 - E2E: Complete Prompt Flow', () => {
  const runner = new TestRunner('e2e');

  it('應該能完整執行 Prompt 流程', async () => {
    await runner.runTest('完整 Prompt 流程測試', async () => {
      // TODO: 實作測試程式碼
      // 1. 載入 Prompt
      // 2. 替換變數
      // 3. 返回完整 Prompt 內容
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.0.e2e.test.ts
```

**通過標準**:
- ✅ 完整的 Prompt 流程正確運作
- ✅ 所有 Prompt 檔案都能載入
- ✅ 錯誤處理完善

---

## 完成檢查清單

實作完成後，請依序檢查以下項目：

### 實作檢查
- [ ] Prompt 檔案結構已建立
- [ ] PromptManager 類別已實作
- [ ] 變數替換功能已實作
- [ ] 快取機制已實作
- [ ] 所有初始 Prompt 檔案已建立
- [ ] 文件已撰寫

### Prompt 檔案
- [ ] `prompts/voiceover-processing/voiceover-split.md` 已建立
- [ ] `prompts/voiceover-processing/semantic-analysis.md` 已建立
- [ ] `prompts/video-selection/segment-select.md` 已建立
- [ ] `prompts/video-selection/music-select.md` 已建立
- [ ] `prompts/material-processing/tag-conversion.md` 已建立

### 測試檔案
- [ ] `tests/phase-2/task-2.0.basic.test.ts` 已建立
- [ ] `tests/phase-2/task-2.0.functional.test.ts` 已建立
- [ ] `tests/phase-2/task-2.0.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

---

## Prompt 優化流程

完成此 Task 後，未來優化 Prompt 的流程為：

```
1. 發現問題（例如：配音切分經常切得太碎）
   ↓
2. 在 VS Code 中修改 Prompt
   └─> 開啟 prompts/voiceover-processing/voiceover-split.md
   └─> 修改 "## Prompt" 區塊內容
   └─> 更新 frontmatter: version: 2, updated: 2025-10-07
   └─> 加入版本歷史註記
   ↓
3. 測試新版本
   └─> 開發環境測試（快取已關閉，立即生效）
   └─> 驗證輸出是否改善
   ↓
4. Git 提交
   └─> git add prompts/voiceover-processing/voiceover-split.md
   └─> git commit -m "feat(prompt): 改進配音切分邏輯 v2"
   └─> git push
   ↓
5. 部署到正式環境
   └─> 部署後重啟服務（清除快取）
   └─> 或呼叫 API: POST /api/admin/prompts/clear-cache
   ↓
6. 監控與回滾
   └─> 觀察效果
   └─> 如有問題，用 Git 回滾：git revert HEAD
```

---

## 常見問題與解決方案

### Q1: 為什麼用檔案而非資料庫管理 Prompt？

**A**: TODO: 說明檔案系統的優勢

### Q2: 如何追蹤 Prompt 的變更歷史？

**A**: TODO: 說明 Git 版本控制的用法

---

## Task 完成確認

完成這個 Task 後，你應該能夠：

✅ TODO: 列出完成後應具備的能力
✅ TODO: 列出完成後應具備的能力

**下一步**: Task 2.1 - GCS 儲存與上傳

**重要性**: ⭐⭐⭐⭐⭐ (極高 - 所有 AI 相關 Task 都依賴此功能)

---

**文件版本**: 1.0 (骨架)
**狀態**: 📝 待撰寫
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
