# Task 2.15: 核心引擎整合測試

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.15 |
| **Task 名稱** | 核心引擎整合測試 |
| **所屬 Phase** | Phase 2: 核心引擎實作 |
| **預估時間** | 4-5 小時 |
| **前置 Task** | Task 2.14 (配樂整合) |
| **檔案位置** | `docs/implementation-plan/phase-2-engines/task-2.15-integration-test.md` |

---

## 📝 狀態

**文件狀態**: 📝 待撰寫

此文件為骨架，具體內容待填充。

---

## 功能描述

整合測試所有核心引擎（2.A、2.B、2.C、2.D），驗證完整的端對端流程。

**測試範圍**：
- 素材處理引擎（上傳 → 分析 → 切分 → 標籤）
- 配音處理引擎（上傳 → STT → 語意分析 → 切分）
- 智能選片引擎（查詢候選 → AI 選片 → 生成時間軸）
- 影片合成引擎（合成 → 字幕 → 配樂 → 輸出）

**測試目標**：
- 驗證完整流程可以從頭到尾執行
- 驗證各引擎之間的資料傳遞正確
- 驗證錯誤處理與重試機制
- 驗證成本追蹤與日誌記錄完整

---

## 前置知識

### 1. 整合測試 vs 單元測試

TODO: 說明整合測試的概念

### 2. 端對端測試策略

TODO: 說明 E2E 測試的設計

### 3. 測試資料準備

TODO: 說明如何準備測試資料

---

## 前置依賴

### 檔案依賴
- Phase 2 所有 Task (2.0-2.14) 都已完成

### 套件依賴
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

### 測試資料依賴
- 測試影片素材（3-5 個短影片，10-30 秒）
- 測試配音檔案（2-3 個音檔，20-60 秒）
- 測試配樂（1-2 個音樂檔案）

---

## 實作步驟

### Step 1: 建立整合測試框架

TODO: 說明如何建立整合測試結構

```
tests/integration/
├── setup.ts              # 測試環境設定
├── teardown.ts           # 測試清理
├── full-pipeline.test.ts # 完整流程測試
└── error-handling.test.ts # 錯誤處理測試
```

### Step 2: 測試完整的影片生成流程

TODO: 說明完整流程的測試步驟

```typescript
describe('完整影片生成流程', () => {
  it('應該能從素材上傳到影片輸出', async () => {
    // 1. 上傳素材影片
    // 2. 等待素材分析完成
    // 3. 上傳配音
    // 4. 等待配音處理完成
    // 5. 觸發智能選片
    // 6. 等待時間軸生成
    // 7. 觸發影片合成
    // 8. 驗證最終影片
  });
});
```

### Step 3: 測試錯誤處理

TODO: 說明如何測試各種錯誤情況

```typescript
// 測試案例：
// - 上傳無效的影片格式
// - AI 呼叫失敗
// - FFmpeg 合成失敗
// - 資料庫連接失敗
```

### Step 4: 驗證成本與日誌

TODO: 說明如何驗證成本追蹤與日誌記錄

```typescript
it('應該正確記錄所有 AI 呼叫的成本', async () => {
  // 執行完整流程
  // 查詢 cost_records 表
  // 驗證成本計算正確
});

it('應該完整記錄所有執行步驟', async () => {
  // 執行完整流程
  // 查詢 system_logs 表
  // 驗證日誌完整性
});
```

### Step 5: 效能測試

TODO: 說明如何測試系統效能

```typescript
it('應該在合理時間內完成影片生成', async () => {
  const startTime = Date.now();
  // 執行完整流程
  const duration = Date.now() - startTime;

  // 預期：60 秒影片應在 5 分鐘內完成
  expect(duration).toBeLessThan(5 * 60 * 1000);
});
```

---

## 驗收標準

### E2E Acceptance (端對端驗收)

**目標**: 驗證所有核心引擎整合正確運作

**測試檔案**: `tests/integration/full-pipeline.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.15 - E2E: Core Engines Integration', () => {
  const runner = new TestRunner('e2e');

  beforeAll(async () => {
    // 準備測試環境
    // - 清空資料庫測試資料
    // - 準備測試檔案
  });

  it('【流程 1】素材管理完整流程', async () => {
    await runner.runTest('素材管理測試', async () => {
      // 1. 上傳素材影片
      // 2. 呼叫 Google Video AI
      // 3. 標籤轉換
      // 4. 影片切分
      // 5. 驗證資料庫記錄
    });
  });

  it('【流程 2】配音處理完整流程', async () => {
    await runner.runTest('配音處理測試', async () => {
      // 1. 上傳配音
      // 2. 呼叫 Whisper STT
      // 3. 語意分析
      // 4. 配音切分
      // 5. 驗證資料庫記錄
    });
  });

  it('【流程 3】智能選片完整流程', async () => {
    await runner.runTest('智能選片測試', async () => {
      // 前提：已有素材和配音
      // 1. 查詢候選片段
      // 2. AI 選片決策
      // 3. 生成時間軸 JSON
      // 4. 驗證時間軸正確性
    });
  });

  it('【流程 4】影片合成完整流程', async () => {
    await runner.runTest('影片合成測試', async () => {
      // 前提：已有時間軸
      // 1. 影片片段合成
      // 2. 字幕疊加
      // 3. 配樂整合
      // 4. 驗證輸出影片
    });
  });

  it('【完整流程】從零到成品', async () => {
    await runner.runTest('完整影片生成測試', async () => {
      // 1. 上傳 3 個素材影片
      // 2. 等待所有素材分析完成
      // 3. 上傳配音
      // 4. 等待配音處理完成
      // 5. 觸發智能選片
      // 6. 等待時間軸生成
      // 7. 觸發影片合成
      // 8. 驗證最終影片存在且可播放
      // 9. 驗證成本記錄完整
      // 10. 驗證日誌記錄完整
    });
  });

  afterAll(async () => {
    await runner.generateReport();
    // 清理測試資料
  });
});
```

**執行方式**:
```bash
npm test -- tests/integration/full-pipeline.test.ts
```

**通過標準**:
- ✅ 素材管理流程完整運作
- ✅ 配音處理流程完整運作
- ✅ 智能選片流程完整運作
- ✅ 影片合成流程完整運作
- ✅ 完整端對端流程可以成功執行
- ✅ 所有 AI 呼叫成本正確記錄
- ✅ 所有執行步驟日誌完整

---

### Error Handling Tests (錯誤處理測試)

**測試檔案**: `tests/integration/error-handling.test.ts`

```typescript
describe('Task 2.15 - Error Handling', () => {
  it('應該正確處理無效的影片格式', async () => {
    // 上傳 .txt 檔案
    // 預期：回傳錯誤，狀態為 'failed'
  });

  it('應該正確處理 AI API 失敗', async () => {
    // Mock AI API 回傳錯誤
    // 預期：記錄錯誤，可以重試
  });

  it('應該正確處理 FFmpeg 合成失敗', async () => {
    // 提供無效的時間軸 JSON
    // 預期：記錄錯誤，狀態為 'failed'
  });
});
```

---

### Performance Tests (效能測試)

**測試檔案**: `tests/integration/performance.test.ts`

```typescript
describe('Task 2.15 - Performance', () => {
  it('素材分析應在合理時間內完成', async () => {
    // 上傳 30 秒影片
    // 預期：3 分鐘內完成分析
  });

  it('智能選片應在合理時間內完成', async () => {
    // 50 個候選片段
    // 預期：30 秒內完成選片
  });

  it('影片合成應在合理時間內完成', async () => {
    // 合成 60 秒影片
    // 預期：2 分鐘內完成合成
  });
});
```

---

## 完成檢查清單

實作完成後，請依序檢查以下項目：

### 測試檔案
- [ ] `tests/integration/setup.ts` 已建立
- [ ] `tests/integration/teardown.ts` 已建立
- [ ] `tests/integration/full-pipeline.test.ts` 已建立
- [ ] `tests/integration/error-handling.test.ts` 已建立
- [ ] `tests/integration/performance.test.ts` 已建立

### 測試資料
- [ ] 測試影片素材已準備（3-5 個）
- [ ] 測試配音檔案已準備（2-3 個）
- [ ] 測試配樂已準備（1-2 個）

### 驗收測試
- [ ] 所有流程測試全部通過
- [ ] 所有錯誤處理測試全部通過
- [ ] 所有效能測試全部通過

### 文件
- [ ] 測試報告已生成
- [ ] 發現的問題已記錄
- [ ] 效能數據已記錄

---

## 測試報告範例

完成測試後，應產生類似以下的報告：

```
========================================
Phase 2 核心引擎整合測試報告
========================================

執行時間：2025-10-07 14:30:00
測試環境：Development

【測試結果總覽】
✅ 通過：25 / 25 (100%)
⏱️  總執行時間：15 分 32 秒

【流程測試】
✅ 素材管理流程 - 2 分 15 秒
✅ 配音處理流程 - 1 分 45 秒
✅ 智能選片流程 - 35 秒
✅ 影片合成流程 - 2 分 10 秒
✅ 完整端對端流程 - 8 分 25 秒

【成本統計】
總成本：$0.0425
- Google Video AI：$0.015
- Gemini：$0.008
- Whisper：$0.0195

【效能指標】
平均影片生成時間：8.5 分鐘 / 60秒影片
AI 選片準確度：待人工評估

【發現的問題】
無

========================================
```

---

## Task 完成確認

完成這個 Task 後，你應該能夠：

✅ 確認所有核心引擎正確整合
✅ 確認完整流程可以從頭到尾執行
✅ 確認錯誤處理機制正常運作
✅ 確認成本追蹤與日誌記錄完整
✅ 了解系統的效能表現

**下一步**: Phase 3 - 前端介面開發

**重要性**: ⭐⭐⭐⭐⭐ (極高 - Phase 2 的最終驗收)

---

**文件版本**: 1.0 (骨架)
**狀態**: 📝 待撰寫
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
