# Task 2.14: 配樂整合

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.14 |
| **Task 名稱** | 配樂整合 |
| **所屬 Phase** | Phase 2: 核心引擎實作 |
| **預估時間** | 3-4 小時 |
| **前置 Task** | Task 2.13 (字幕疊加) |
| **檔案位置** | `docs/implementation-plan/phase-2-engines/task-2.14-music-integration.md` |

---

## 📝 狀態

**文件狀態**: 📝 待撰寫

此文件為骨架，具體內容待填充。

---

## 功能描述

整合背景配樂到影片合成流程。

主要包含：
- 讀取時間軸 JSON 中的配樂資訊
- 使用 FFmpeg 混合背景音樂與配音
- 實作音量控制（配樂音量 vs 配音音量）
- 實作淡入淡出效果
- 處理配樂長度與影片長度的匹配

---

## 前置知識

### 1. FFmpeg 音訊混合

TODO: 說明如何混合多軌音訊

### 2. 音量控制

TODO: 說明音量調整與平衡

### 3. 淡入淡出

TODO: 說明音訊淡入淡出效果

---

## 前置依賴

### 檔案依賴
- Task 2.12 已完成（基礎影片合成）
- Task 2.13 已完成（字幕疊加）

### 套件依賴
```json
{
  "dependencies": {
    "fluent-ffmpeg": "^2.1.2"
  }
}
```

### 工具依賴
- FFmpeg（已在 Task 2.11 設定）
- 配樂庫（免費音樂素材）

---

## 實作步驟

### Step 1: 解析配樂資訊

TODO: 說明如何從 timeline JSON 讀取配樂資訊

```typescript
// TODO: 提供解析範例
interface MusicConfig {
  music_id: string
  music_url: string
  volume: number      // 0-1
  fade_in: number     // 秒
  fade_out: number    // 秒
}
```

### Step 2: 下載配樂檔案

TODO: 說明如何下載配樂到暫存目錄

```typescript
// TODO: 提供下載範例
```

### Step 3: 音訊混合

TODO: 說明如何使用 FFmpeg 混合音軌

```bash
# 範例 FFmpeg 指令
ffmpeg -i video.mp4 -i music.mp3 \
  -filter_complex "[1:a]volume=0.3,afade=t=in:st=0:d=1,afade=t=out:st=43:d=2[music]; \
                   [0:a][music]amix=inputs=2:duration=first[aout]" \
  -map 0:v -map "[aout]" output.mp4
```

### Step 4: 處理配樂長度

TODO: 說明如何處理配樂比影片長或短的情況

```typescript
// TODO: 提供長度處理範例
// - 配樂太短：循環播放
// - 配樂太長：裁剪
```

### Step 5: 測試音量平衡

TODO: 說明如何測試配音與配樂的音量平衡

---

## 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證配樂整合是否正常運作

**測試檔案**: `tests/phase-2/task-2.14.basic.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.14 - Basic: Music Integration', () => {
  const runner = new TestRunner('basic');

  it('應該能夠解析配樂資訊', async () => {
    await runner.runTest('配樂資訊解析測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該能夠下載配樂檔案', async () => {
    await runner.runTest('配樂下載測試', async () => {
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
npm test -- tests/phase-2/task-2.14.basic.test.ts
```

**通過標準**:
- ✅ 能夠解析 timeline JSON 中的配樂資訊
- ✅ 能夠下載配樂檔案
- ✅ 配樂檔案格式正確

---

### Functional Acceptance (功能驗收)

**目標**: 驗證音訊混合功能完整性

**測試檔案**: `tests/phase-2/task-2.14.functional.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.14 - Functional: Audio Mixing', () => {
  const runner = new TestRunner('functional');

  it('應該正確混合配音與配樂', async () => {
    await runner.runTest('音訊混合測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該正確設定音量', async () => {
    await runner.runTest('音量控制測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該正確實作淡入淡出', async () => {
    await runner.runTest('淡入淡出測試', async () => {
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
npm test -- tests/phase-2/task-2.14.functional.test.ts
```

**通過標準**:
- ✅ 配音與配樂正確混合
- ✅ 音量比例正確（配樂不會蓋過配音）
- ✅ 淡入淡出效果正確

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證完整配樂整合流程

**測試檔案**: `tests/phase-2/task-2.14.e2e.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.14 - E2E: Complete Music Integration', () => {
  const runner = new TestRunner('e2e');

  it('應該能完整執行配樂整合流程', async () => {
    await runner.runTest('完整配樂整合測試', async () => {
      // TODO: 實作測試程式碼
      // 1. 準備時間軸 JSON（包含配樂）
      // 2. 執行影片合成
      // 3. 驗證輸出影片包含配樂
      // 4. 驗證音量平衡正確
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.14.e2e.test.ts
```

**通過標準**:
- ✅ 完整的配樂整合流程正確運作
- ✅ 輸出影片音質良好
- ✅ 配樂長度處理正確

---

## 完成檢查清單

實作完成後，請依序檢查以下項目：

### 實作檢查
- [ ] 配樂資訊解析已實作
- [ ] 配樂下載功能已實作
- [ ] 音訊混合功能已實作
- [ ] 音量控制已實作
- [ ] 淡入淡出已實作
- [ ] 配樂長度處理已實作
- [ ] 文件已撰寫

### 測試檔案
- [ ] `tests/phase-2/task-2.14.basic.test.ts` 已建立
- [ ] `tests/phase-2/task-2.14.functional.test.ts` 已建立
- [ ] `tests/phase-2/task-2.14.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

---

## 音量平衡建議

根據業界標準：

| 音軌 | 建議音量 | 說明 |
|------|---------|------|
| **配音** | 100% (0dB) | 主要內容，音量最大 |
| **配樂** | 20-30% (-12 to -10dB) | 背景音樂，不能蓋過配音 |
| **音效** | 50-70% (-6 to -3dB) | 如有音效，介於兩者之間 |

---

## 常見問題與解決方案

### Q1: 配樂太大聲，蓋過了配音怎麼辦？

**A**: TODO: 說明音量調整方法

### Q2: 配樂長度與影片長度不匹配怎麼辦？

**A**: TODO: 說明長度匹配策略

### Q3: 淡入淡出效果不自然怎麼辦？

**A**: TODO: 說明淡入淡出參數調整

---

## Task 完成確認

完成這個 Task 後，你應該能夠：

✅ TODO: 列出完成後應具備的能力
✅ TODO: 列出完成後應具備的能力

**下一步**: Task 2.15 - 核心引擎整合測試

---

**文件版本**: 1.0 (骨架)
**狀態**: 📝 待撰寫
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
