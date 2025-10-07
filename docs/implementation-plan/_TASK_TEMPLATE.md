# Task X.X: [Task 名稱]

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | X.X |
| **Task 名稱** | [Task 名稱] |
| **所屬 Phase** | Phase X: [Phase 名稱] |
| **預估時間** | X-X 小時 |
| **前置 Task** | [前置 Task 列表] |
| **檔案位置** | `/Users/skyler/coding/CheapCut/docs/implementation-plan/phase-X-xxx/task-X.X-xxx.md` |

---

## 功能描述

[描述這個 Task 要完成的功能]

---

## 前置知識

### 1. [知識點 1]

[說明]

### 2. [知識點 2]

[說明]

---

## 前置依賴

### 檔案依賴
- [依賴的檔案或 Task]

### 套件依賴
```json
{
  "dependencies": {
    "package-name": "^x.x.x"
  },
  "devDependencies": {
    "@types/package-name": "^x.x.x"
  }
}
```

### 工具依賴
- [需要的工具]

---

## 實作步驟

### Step 1: [步驟名稱]

[說明]

```typescript
// 程式碼範例
```

### Step 2: [步驟名稱]

[說明]

```typescript
// 程式碼範例
```

---

## 驗收標準

### Basic Verification (基礎驗證)

**目標**: [基礎驗證目標]

**測試檔案**: `tests/phase-X/task-X.X.basic.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task X.X - Basic: [測試名稱]', () => {
  const runner = new TestRunner('basic');

  it('[測試項目]', async () => {
    await runner.runTest('測試名稱', async () => {
      // 測試程式碼
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-X/task-X.X.basic.test.ts
```

**通過標準**:
- ✅ [標準 1]
- ✅ [標準 2]

---

### Functional Acceptance (功能驗收)

**目標**: [功能驗收目標]

**測試檔案**: `tests/phase-X/task-X.X.functional.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task X.X - Functional: [測試名稱]', () => {
  const runner = new TestRunner('functional');

  it('[測試項目]', async () => {
    await runner.runTest('測試名稱', async () => {
      // 測試程式碼
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-X/task-X.X.functional.test.ts
```

**通過標準**:
- ✅ [標準 1]
- ✅ [標準 2]

---

### E2E Acceptance (端對端驗收)

**目標**: [端對端驗收目標]

**測試檔案**: `tests/phase-X/task-X.X.e2e.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task X.X - E2E: [測試名稱]', () => {
  const runner = new TestRunner('e2e');

  it('[測試項目]', async () => {
    await runner.runTest('測試名稱', async () => {
      // 測試程式碼
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-X/task-X.X.e2e.test.ts
```

**通過標準**:
- ✅ [標準 1]
- ✅ [標準 2]

---

## 完成檢查清單

實作完成後，請依序檢查以下項目：

### 實作檢查
- [ ] [檢查項目 1]
- [ ] [檢查項目 2]

### 測試檔案
- [ ] `tests/phase-X/task-X.X.basic.test.ts` 已建立
- [ ] `tests/phase-X/task-X.X.functional.test.ts` 已建立
- [ ] `tests/phase-X/task-X.X.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

---

## 常見問題與解決方案

### Q1: [問題]

**A**: [解答]

### Q2: [問題]

**A**: [解答]

---

## Task 完成確認

完成這個 Task 後，你應該能夠：

✅ [能力 1]
✅ [能力 2]

**下一步**: [下一個 Task]

---

**文件版本**: 1.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
