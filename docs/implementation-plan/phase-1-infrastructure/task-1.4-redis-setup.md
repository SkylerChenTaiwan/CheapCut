# Task 1.4: Redis 快取設定

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 1.4 |
| **Task 名稱** | Redis 快取設定 |
| **所屬 Phase** | Phase 1: 基礎設施建立 |
| **預估時間** | 2-3 小時 |
| **前置 Task** | Task 1.3 (建立 API 基礎架構) |
| **檔案位置** | `docs/implementation-plan/phase-1-infrastructure/task-1.4-redis-setup.md` |

---

## 📝 狀態

**文件狀態**: 📝 待撰寫

此文件為骨架，具體內容待填充。

---

## 功能描述

根據 Overall Design，Redis 快取是 **MVP 高優先級功能**，主要用於：

1. **候選片段快取**：智能選片時產生的候選片段清單（關鍵用戶體驗）
2. **素材列表快取**：用戶的素材列表
3. **配樂庫快取**：配樂清單（很少變動）
4. **背景任務佇列**：素材分析、影片合成等長時間任務

主要包含：
- 設定 Redis 連接（使用 Upstash 免費層）
- 實作快取服務封裝
- 設定任務佇列（使用 Bull/BullMQ）
- 建立快取策略（TTL、清除機制）

---

## 前置知識

### 1. Redis 基礎

TODO: 說明 Redis 的基本概念

### 2. 快取策略

TODO: 說明快取的 TTL、失效策略

### 3. 任務佇列

TODO: 說明 Bull/BullMQ 的概念

---

## 前置依賴

### 檔案依賴
- Task 1.3 已完成（API 基礎架構）

### 套件依賴
```json
{
  "dependencies": {
    "ioredis": "^5.3.2",
    "bullmq": "^4.12.0"
  },
  "devDependencies": {
    "@types/ioredis": "^5.0.0"
  }
}
```

### 工具依賴
- Upstash Redis 帳號（或本地 Redis for 開發）
- REDIS_URL 環境變數

---

## 實作步驟

### Step 1: 設定 Redis 連接

TODO: 說明如何連接 Upstash Redis

```typescript
// TODO: 提供 Redis 連接範例
// src/lib/redis.ts
```

### Step 2: 實作快取服務

TODO: 說明如何封裝快取操作

```typescript
// TODO: 提供快取服務範例
// src/services/cache.service.ts
```

### Step 3: 設定任務佇列

TODO: 說明如何設定 BullMQ

```typescript
// TODO: 提供任務佇列範例
// src/lib/queue.ts
```

### Step 4: 定義快取策略

TODO: 說明各類資料的快取 TTL

```typescript
// TODO: 提供快取策略範例
```

---

## 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證 Redis 連接是否正常

**測試檔案**: `tests/phase-1/task-1.4.basic.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 1.4 - Basic: Redis Setup', () => {
  const runner = new TestRunner('basic');

  it('應該能夠連接 Redis', async () => {
    await runner.runTest('Redis 連接測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該能夠設定和取得快取', async () => {
    await runner.runTest('快取操作測試', async () => {
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
npm test -- tests/phase-1/task-1.4.basic.test.ts
```

**通過標準**:
- ✅ 能夠連接 Redis
- ✅ 能夠 SET/GET 資料
- ✅ 能夠設定 TTL

---

### Functional Acceptance (功能驗收)

**目標**: 驗證快取服務功能完整性

**測試檔案**: `tests/phase-1/task-1.4.functional.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 1.4 - Functional: Cache Operations', () => {
  const runner = new TestRunner('functional');

  it('應該正確快取候選片段', async () => {
    await runner.runTest('候選片段快取測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該正確處理快取失效', async () => {
    await runner.runTest('快取失效測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該能夠加入背景任務', async () => {
    await runner.runTest('任務佇列測試', async () => {
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
npm test -- tests/phase-1/task-1.4.functional.test.ts
```

**通過標準**:
- ✅ 快取服務正確運作
- ✅ TTL 正確失效
- ✅ 任務佇列可以加入任務

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證完整快取流程

**測試檔案**: `tests/phase-1/task-1.4.e2e.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 1.4 - E2E: Complete Cache Flow', () => {
  const runner = new TestRunner('e2e');

  it('應該能完整執行快取流程', async () => {
    await runner.runTest('完整快取流程測試', async () => {
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
npm test -- tests/phase-1/task-1.4.e2e.test.ts
```

**通過標準**:
- ✅ 完整的快取流程正確運作
- ✅ 背景任務可以執行
- ✅ 錯誤處理完善

---

## 完成檢查清單

實作完成後，請依序檢查以下項目：

### 實作檢查
- [ ] Redis 連接已設定
- [ ] 快取服務已實作
- [ ] 任務佇列已設定
- [ ] 快取策略已定義
- [ ] 文件已撰寫

### 測試檔案
- [ ] `tests/phase-1/task-1.4.basic.test.ts` 已建立
- [ ] `tests/phase-1/task-1.4.functional.test.ts` 已建立
- [ ] `tests/phase-1/task-1.4.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

---

## 快取策略設計

### 候選片段快取
- **Key 格式**: `candidates:timeline_{timelineId}:segment_{index}`
- **TTL**: 3600 秒（1 小時）
- **理由**: 用戶在時間軸編輯時需要快速取得候選片段

### 素材列表快取
- **Key 格式**: `materials:user_{userId}`
- **TTL**: 7200 秒（2 小時）
- **理由**: 素材列表變動不頻繁

### 配樂庫快取
- **Key 格式**: `music:library`
- **TTL**: 86400 秒（24 小時）
- **理由**: 配樂庫很少變動

---

## 常見問題與解決方案

### Q1: Upstash 免費層有什麼限制？

**A**: TODO: 說明 Upstash 免費層限制

### Q2: 本地開發如何設定 Redis？

**A**: TODO: 說明本地 Redis 設定方式

---

## Task 完成確認

完成這個 Task 後，你應該能夠：

✅ TODO: 列出完成後應具備的能力
✅ TODO: 列出完成後應具備的能力

**下一步**: Phase 2 - 核心引擎實作

---

**文件版本**: 1.0 (骨架)
**狀態**: 📝 待撰寫
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
