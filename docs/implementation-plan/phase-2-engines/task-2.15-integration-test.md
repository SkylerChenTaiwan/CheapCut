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

**文件狀態**: ✅ 已完成

本文件提供完整的核心引擎整合測試指南,驗證 Phase 2 所有功能。

---

## 功能描述

整合測試所有核心引擎,驗證完整的端對端影片生成流程。

**測試範圍**:

### 引擎 A: 素材處理引擎
- Task 2.1: 素材上傳與儲存
- Task 2.2: 影片分析 (Google Video AI)
- Task 2.3: 標籤轉換
- Task 2.4: 影片切分

### 引擎 B: 配音處理引擎
- Task 2.5: STT 整合 (Whisper)
- Task 2.6: 語意分析
- Task 2.7: 配音切分

### 引擎 C: 智能選片引擎
- Task 2.8: 候選片段查詢
- Task 2.9: AI 選片決策
- Task 2.10: 時間軸生成

### 引擎 D: 影片合成引擎
- Task 2.11: FFmpeg 環境設定
- Task 2.12: 影片合成
- Task 2.13: 字幕疊加
- Task 2.14: 配樂整合

**測試目標**:
- ✅ 驗證完整流程可以從頭到尾執行
- ✅ 驗證各引擎之間的資料傳遞正確
- ✅ 驗證錯誤處理與重試機制
- ✅ 驗證成本追蹤與日誌記錄完整
- ✅ 驗證系統效能符合預期

---

## 前置知識

### 1. 整合測試 vs 單元測試

**單元測試 (Unit Test)**:
- 測試單一功能或函式
- 範例: 測試 `formatSrtTime()` 函式

**整合測試 (Integration Test)**:
- 測試多個元件的整合
- 範例: 測試素材上傳 → 分析 → 切分的完整流程

**端對端測試 (E2E Test)** ← 本 Task 重點:
- 測試完整的使用者流程
- 範例: 從上傳素材到產生最終影片

### 2. 測試資料準備

整合測試需要真實的測試資料:

**測試影片素材**:
- 3-5 個短影片 (10-30 秒)
- 包含不同場景 (室內、室外、人物、風景)
- 格式: MP4, MOV

**測試配音檔案**:
- 2-3 個音檔 (20-60 秒)
- 繁體中文語音
- 格式: MP3, WAV

**測試配樂**:
- 1-2 個音樂檔案 (30-120 秒)
- 免費授權音樂
- 格式: MP3

### 3. 測試環境設定

```bash
# 建立測試資料目錄
mkdir -p test-data/{videos,voiceovers,music}

# 下載測試素材 (範例)
curl -o test-data/videos/sample1.mp4 "https://example.com/sample1.mp4"
curl -o test-data/voiceovers/sample1.mp3 "https://example.com/sample1.mp3"
curl -o test-data/music/background1.mp3 "https://example.com/music1.mp3"
```

---

## 前置依賴

### 檔案依賴
- **Phase 2 所有 Task (2.0-2.14) 都已完成**
- 所有引擎功能已實作
- 所有資料庫 schema 已建立

### 套件依賴
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

### 測試資料依賴
- 測試影片素材 (3-5 個)
- 測試配音檔案 (2-3 個)
- 測試配樂 (1-2 個)

### 環境變數
```bash
# .env.test
DATABASE_URL="postgresql://user:pass@localhost:5432/cheapcut_test"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_KEY="xxx"
GOOGLE_VIDEO_AI_KEY="xxx"
GEMINI_API_KEY="xxx"
OPENAI_API_KEY="xxx"
```

---

## 實作步驟

### Step 1: 建立整合測試框架

**目錄結構**:
```
tests/
├── integration/
│   ├── setup.ts                  # 測試環境初始化
│   ├── teardown.ts               # 測試清理
│   ├── helpers/
│   │   ├── test-data.ts          # 測試資料生成
│   │   └── assertions.ts         # 自訂斷言
│   ├── phase-2/
│   │   ├── engine-a-material.test.ts      # 素材處理引擎
│   │   ├── engine-b-voiceover.test.ts     # 配音處理引擎
│   │   ├── engine-c-selection.test.ts     # 智能選片引擎
│   │   ├── engine-d-composition.test.ts   # 影片合成引擎
│   │   └── full-pipeline.test.ts          # 完整流程
│   └── error-handling.test.ts    # 錯誤處理測試
└── jest.integration.config.js    # Jest 設定
```

**檔案**: `tests/integration/setup.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

/**
 * 整合測試環境初始化
 */
export async function setupIntegrationTests(): Promise<void> {
  console.log('🔧 初始化整合測試環境...');

  // 1. 清空測試資料庫
  await prisma.videoSegment.deleteMany({});
  await prisma.materialVideo.deleteMany({});
  await prisma.voiceoverSegment.deleteMany({});
  await prisma.voiceover.deleteMany({});
  await prisma.timeline.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.costRecord.deleteMany({});
  await prisma.systemLog.deleteMany({});

  console.log('  ✅ 資料庫已清空');

  // 2. 建立測試輸出目錄
  const testOutputDirs = [
    './test-output/integration',
    './test-output/e2e',
    './test-output/videos',
    './test-output/srt',
  ];

  for (const dir of testOutputDirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  console.log('  ✅ 測試目錄已建立');

  // 3. 驗證測試資料存在
  const requiredTestData = [
    './test-data/videos/sample1.mp4',
    './test-data/voiceovers/sample1.mp3',
  ];

  for (const file of requiredTestData) {
    try {
      await fs.access(file);
    } catch (err) {
      console.warn(`  ⚠️  警告: 測試檔案不存在: ${file}`);
    }
  }

  console.log('✅ 整合測試環境初始化完成\n');
}
```

**檔案**: `tests/integration/teardown.ts`

```typescript
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 整合測試清理
 */
export async function teardownIntegrationTests(): Promise<void> {
  console.log('\n🧹 清理整合測試環境...');

  // 1. 清理測試檔案 (可選)
  // await fs.rm('./test-output', { recursive: true, force: true });

  // 2. 關閉資料庫連接
  await prisma.$disconnect();

  console.log('✅ 整合測試環境清理完成');
}
```

### Step 2: 建立測試輔助工具

**檔案**: `tests/integration/helpers/test-data.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * 建立測試專案
 */
export async function createTestProject(name: string = 'Test Project') {
  return await prisma.project.create({
    data: {
      project_id: uuidv4(),
      user_id: 'test-user',
      project_name: name,
      status: 'in_progress',
      created_at: new Date(),
    },
  });
}

/**
 * 建立測試素材影片
 */
export async function createTestMaterial(projectId: string, videoUrl: string) {
  return await prisma.materialVideo.create({
    data: {
      material_id: uuidv4(),
      project_id: projectId,
      video_url: videoUrl,
      duration: 30,
      status: 'uploaded',
      created_at: new Date(),
    },
  });
}

/**
 * 建立測試配音
 */
export async function createTestVoiceover(projectId: string, audioUrl: string) {
  return await prisma.voiceover.create({
    data: {
      voiceover_id: uuidv4(),
      project_id: projectId,
      audio_url: audioUrl,
      duration: 45,
      status: 'uploaded',
      created_at: new Date(),
    },
  });
}
```

**檔案**: `tests/integration/helpers/assertions.ts`

```typescript
import fs from 'fs/promises';

/**
 * 驗證檔案存在且大小 > 0
 */
export async function expectFileExists(filePath: string): Promise<void> {
  const stats = await fs.stat(filePath);
  expect(stats.size).toBeGreaterThan(0);
}

/**
 * 驗證影片可播放 (使用 ffprobe)
 */
export async function expectVideoPlayable(videoPath: string): Promise<void> {
  const { execSync } = require('child_process');
  const result = execSync(`ffprobe -v error -show_format ${videoPath}`);
  expect(result.toString()).toContain('format_name');
}

/**
 * 驗證資料庫記錄存在
 */
export async function expectDatabaseRecord(
  table: string,
  id: string
): Promise<void> {
  const prisma = new PrismaClient();
  const record = await (prisma as any)[table].findUnique({
    where: { [`${table}_id`]: id },
  });
  expect(record).toBeTruthy();
}
```

### Step 3: 撰寫各引擎測試

**檔案**: `tests/integration/phase-2/full-pipeline.test.ts`

```typescript
import { setupIntegrationTests, teardownIntegrationTests } from '../setup';
import { createTestProject } from '../helpers/test-data';
import { expectFileExists, expectVideoPlayable } from '../helpers/assertions';
import { TestRunner } from '../../../src/lib/test-runner';

// 引擎導入
import { uploadMaterial } from '../../../src/engines/material-processing-engine';
import { analyzeVideo } from '../../../src/engines/material-processing-engine';
import { processVoiceover } from '../../../src/engines/voiceover-processing-engine';
import { generateTimeline } from '../../../src/engines/smart-selection-engine';
import { composeVideoComplete } from '../../../src/engines/video-composition-engine';

describe('Task 2.15 - E2E: Complete Pipeline', () => {
  const runner = new TestRunner('e2e');

  beforeAll(async () => {
    await setupIntegrationTests();
  });

  afterAll(async () => {
    await runner.generateReport();
    await teardownIntegrationTests();
  });

  describe('【完整流程】從素材到成品', () => {
    it('應該能夠完成完整的影片生成流程', async () => {
      await runner.runTest('完整流程測試', async () => {
        const startTime = Date.now();

        // ==========================================
        // Step 1: 建立專案
        // ==========================================
        console.log('\n📁 Step 1: 建立測試專案');
        const project = await createTestProject('E2E Test Project');
        expect(project.project_id).toBeTruthy();

        // ==========================================
        // Step 2: 上傳素材影片
        // ==========================================
        console.log('\n🎬 Step 2: 上傳素材影片');

        const materialVideos = [
          './test-data/videos/sample1.mp4',
          './test-data/videos/sample2.mp4',
          './test-data/videos/sample3.mp4',
        ];

        const materialIds: string[] = [];

        for (const videoPath of materialVideos) {
          const material = await uploadMaterial(project.project_id, videoPath);
          materialIds.push(material.material_id);
          console.log(`  ✅ 已上傳: ${material.material_id}`);
        }

        expect(materialIds.length).toBe(3);

        // ==========================================
        // Step 3: 分析素材影片
        // ==========================================
        console.log('\n🔍 Step 3: 分析素材影片');

        for (const materialId of materialIds) {
          await analyzeVideo(materialId);
          console.log(`  ✅ 已分析: ${materialId}`);
        }

        // 驗證分析結果
        const segments = await prisma.videoSegment.findMany({
          where: {
            material: {
              project_id: project.project_id,
            },
          },
        });

        expect(segments.length).toBeGreaterThan(0);
        console.log(`  ℹ️  共產生 ${segments.length} 個片段`);

        // ==========================================
        // Step 4: 上傳配音
        // ==========================================
        console.log('\n🎤 Step 4: 上傳配音');

        const voiceoverPath = './test-data/voiceovers/sample1.mp3';
        const voiceover = await uploadVoiceover(project.project_id, voiceoverPath);

        expect(voiceover.voiceover_id).toBeTruthy();
        console.log(`  ✅ 已上傳配音: ${voiceover.voiceover_id}`);

        // ==========================================
        // Step 5: 處理配音 (STT + 語意分析 + 切分)
        // ==========================================
        console.log('\n🗣️  Step 5: 處理配音');

        await processVoiceover(voiceover.voiceover_id);

        // 驗證配音切分結果
        const voiceoverSegments = await prisma.voiceoverSegment.findMany({
          where: { voiceover_id: voiceover.voiceover_id },
        });

        expect(voiceoverSegments.length).toBeGreaterThan(0);
        console.log(`  ℹ️  共產生 ${voiceoverSegments.length} 個配音片段`);

        // ==========================================
        // Step 6: 智能選片
        // ==========================================
        console.log('\n🤖 Step 6: 智能選片');

        const timeline = await generateTimeline(
          project.project_id,
          voiceover.voiceover_id
        );

        expect(timeline.timeline_id).toBeTruthy();
        expect(timeline.timeline_json).toBeTruthy();
        console.log(`  ✅ 時間軸已生成: ${timeline.timeline_id}`);

        // 驗證時間軸 JSON 結構
        const timelineData = JSON.parse(timeline.timeline_json);
        expect(timelineData.segments).toBeTruthy();
        expect(timelineData.segments.length).toBeGreaterThan(0);
        console.log(`  ℹ️  時間軸包含 ${timelineData.segments.length} 個片段`);

        // ==========================================
        // Step 7: 影片合成 (含字幕與配樂)
        // ==========================================
        console.log('\n🎞️  Step 7: 影片合成');

        const outputDir = './test-output/e2e';
        const finalVideo = await composeVideoComplete(
          timeline.timeline_json_path,
          outputDir
        );

        // 驗證輸出影片
        await expectFileExists(finalVideo);
        await expectVideoPlayable(finalVideo);

        console.log(`  ✅ 最終影片: ${finalVideo}`);

        // ==========================================
        // Step 8: 驗證成本記錄
        // ==========================================
        console.log('\n💰 Step 8: 驗證成本記錄');

        const costRecords = await prisma.costRecord.findMany({
          where: { project_id: project.project_id },
        });

        expect(costRecords.length).toBeGreaterThan(0);

        const totalCost = costRecords.reduce(
          (sum, record) => sum + parseFloat(record.cost),
          0
        );

        console.log(`  ℹ️  API 呼叫次數: ${costRecords.length}`);
        console.log(`  ℹ️  總成本: $${totalCost.toFixed(4)}`);

        costRecords.forEach((record) => {
          console.log(`    - ${record.api_name}: $${record.cost}`);
        });

        // ==========================================
        // Step 9: 驗證日誌記錄
        // ==========================================
        console.log('\n📝 Step 9: 驗證日誌記錄');

        const logs = await prisma.systemLog.findMany({
          where: { project_id: project.project_id },
          orderBy: { created_at: 'asc' },
        });

        expect(logs.length).toBeGreaterThan(0);
        console.log(`  ℹ️  系統日誌數量: ${logs.length}`);

        // ==========================================
        // 完成
        // ==========================================
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ 完整流程測試通過! 總耗時: ${duration} 秒`);
      });
    });
  });

  describe('【效能測試】', () => {
    it('素材分析應在合理時間內完成', async () => {
      await runner.runTest('素材分析效能測試', async () => {
        const project = await createTestProject('Performance Test');

        const startTime = Date.now();

        const material = await uploadMaterial(
          project.project_id,
          './test-data/videos/sample1.mp4'
        );

        await analyzeVideo(material.material_id);

        const duration = (Date.now() - startTime) / 1000;

        // 預期: 30 秒影片應在 3 分鐘內完成分析
        expect(duration).toBeLessThan(180);

        console.log(`  ⏱️  分析耗時: ${duration.toFixed(1)} 秒`);
      });
    });

    it('智能選片應在合理時間內完成', async () => {
      await runner.runTest('智能選片效能測試', async () => {
        // 假設已有素材和配音
        const startTime = Date.now();

        const timeline = await generateTimeline(
          'test-project-id',
          'test-voiceover-id'
        );

        const duration = (Date.now() - startTime) / 1000;

        // 預期: 50 個候選片段應在 30 秒內完成選片
        expect(duration).toBeLessThan(30);

        console.log(`  ⏱️  選片耗時: ${duration.toFixed(1)} 秒`);
      });
    });

    it('影片合成應在合理時間內完成', async () => {
      await runner.runTest('影片合成效能測試', async () => {
        const startTime = Date.now();

        const finalVideo = await composeVideoComplete(
          './test-data/timeline.json',
          './test-output/performance'
        );

        const duration = (Date.now() - startTime) / 1000;

        // 預期: 60 秒影片應在 2 分鐘內完成合成
        expect(duration).toBeLessThan(120);

        console.log(`  ⏱️  合成耗時: ${duration.toFixed(1)} 秒`);
      });
    });
  });
});
```

### Step 4: 錯誤處理測試

**檔案**: `tests/integration/error-handling.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import { uploadMaterial } from '../../src/engines/material-processing-engine';

describe('Task 2.15 - Error Handling', () => {
  const runner = new TestRunner('error-handling');

  it('應該正確處理無效的影片格式', async () => {
    await runner.runTest('無效格式測試', async () => {
      const project = await createTestProject();

      // 上傳 .txt 檔案
      await expect(
        uploadMaterial(project.project_id, './test-data/invalid.txt')
      ).rejects.toThrow('Invalid video format');
    });
  });

  it('應該正確處理 API 呼叫失敗', async () => {
    await runner.runTest('API 失敗測試', async () => {
      // Mock API 錯誤
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(
        new Error('API rate limit exceeded')
      );

      const project = await createTestProject();
      const material = await uploadMaterial(
        project.project_id,
        './test-data/videos/sample1.mp4'
      );

      // 預期: 記錄錯誤,狀態為 'failed'
      await expect(analyzeVideo(material.material_id)).rejects.toThrow();

      const updatedMaterial = await prisma.materialVideo.findUnique({
        where: { material_id: material.material_id },
      });

      expect(updatedMaterial?.status).toBe('failed');
    });
  });

  it('應該正確處理 FFmpeg 合成失敗', async () => {
    await runner.runTest('FFmpeg 失敗測試', async () => {
      // 提供無效的時間軸 JSON
      const invalidTimeline = {
        project_id: 'test',
        segments: [
          {
            segment_id: 'invalid',
            video_url: 'https://non-existent-url.com/video.mp4',
          },
        ],
      };

      await expect(
        composeVideoComplete(JSON.stringify(invalidTimeline), './test-output')
      ).rejects.toThrow();
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

---

## 驗收標準

### E2E Acceptance (端對端驗收)

**執行方式**:
```bash
# 執行所有整合測試
npm test -- tests/integration/

# 只執行完整流程測試
npm test -- tests/integration/phase-2/full-pipeline.test.ts

# 只執行錯誤處理測試
npm test -- tests/integration/error-handling.test.ts
```

**通過標準**:

#### 流程測試
- ✅ 素材管理流程完整運作
- ✅ 配音處理流程完整運作
- ✅ 智能選片流程完整運作
- ✅ 影片合成流程完整運作
- ✅ 完整端對端流程可以成功執行

#### 資料驗證
- ✅ 所有資料庫記錄正確建立
- ✅ 檔案正確儲存到 Supabase
- ✅ 影片可以正常播放

#### 成本與日誌
- ✅ 所有 AI 呼叫成本正確記錄
- ✅ 所有執行步驟日誌完整

#### 效能要求
- ✅ 30 秒影片分析 < 3 分鐘
- ✅ 智能選片 < 30 秒
- ✅ 60 秒影片合成 < 2 分鐘

#### 錯誤處理
- ✅ 無效檔案正確拒絕
- ✅ API 失敗正確重試或記錄
- ✅ FFmpeg 失敗正確處理

---

## 測試報告範例

完成測試後,應產生類似以下的報告:

```
========================================
Phase 2 核心引擎整合測試報告
========================================

執行時間: 2025-10-07 14:30:00
測試環境: Development
資料庫: PostgreSQL 14.5
儲存: Supabase

【測試結果總覽】
✅ 通過: 28 / 28 (100%)
⏱️  總執行時間: 18 分 45 秒

【流程測試】
✅ 引擎 A - 素材處理流程: 2 分 30 秒
   - 上傳素材: ✅
   - 影片分析: ✅
   - 標籤轉換: ✅
   - 影片切分: ✅

✅ 引擎 B - 配音處理流程: 1 分 55 秒
   - STT 轉錄: ✅
   - 語意分析: ✅
   - 配音切分: ✅

✅ 引擎 C - 智能選片流程: 25 秒
   - 候選查詢: ✅
   - AI 選片: ✅
   - 時間軸生成: ✅

✅ 引擎 D - 影片合成流程: 2 分 40 秒
   - 片段合成: ✅
   - 字幕疊加: ✅
   - 配樂整合: ✅

✅ 完整端對端流程: 11 分 20 秒

【成本統計】
總成本: $0.0487
- Google Video AI: $0.0180 (3 次呼叫)
- Gemini 1.5 Flash: $0.0092 (15 次呼叫)
- Whisper API: $0.0215 (1 次呼叫)

【效能指標】
平均素材分析時間: 2.3 分鐘 / 30秒影片
平均智能選片時間: 18 秒 / 50個候選
平均影片合成時間: 1.8 分鐘 / 60秒影片
完整流程時間: 11.3 分鐘 (符合預期)

【資料庫記錄】
✅ Projects: 1
✅ Material Videos: 3
✅ Video Segments: 47
✅ Voiceovers: 1
✅ Voiceover Segments: 12
✅ Timelines: 1
✅ Cost Records: 19
✅ System Logs: 156

【檔案驗證】
✅ 素材影片已上傳 (3 個)
✅ 配音檔案已上傳 (1 個)
✅ 時間軸 JSON 已生成
✅ 最終影片已產生 (60 秒)
✅ SRT 字幕檔已產生

【錯誤處理測試】
✅ 無效影片格式: 正確拒絕
✅ API 失敗重試: 正確處理
✅ FFmpeg 失敗: 正確記錄

【發現的問題】
無

【建議】
1. 考慮增加快取機制,減少重複的 API 呼叫
2. 優化影片分析速度,目前偏慢
3. 增加更多錯誤處理測試案例

========================================
Phase 2 整合測試: 全部通過 ✅
========================================
```

---

## 完成檢查清單

實作完成後,請依序檢查以下項目:

### 測試檔案
- [ ] `tests/integration/setup.ts` 已建立
- [ ] `tests/integration/teardown.ts` 已建立
- [ ] `tests/integration/helpers/test-data.ts` 已建立
- [ ] `tests/integration/helpers/assertions.ts` 已建立
- [ ] `tests/integration/phase-2/full-pipeline.test.ts` 已建立
- [ ] `tests/integration/error-handling.test.ts` 已建立

### 測試資料
- [ ] 測試影片素材已準備 (3-5 個)
- [ ] 測試配音檔案已準備 (2-3 個)
- [ ] 測試配樂已準備 (1-2 個)

### 驗收測試
- [ ] 所有流程測試全部通過
- [ ] 所有效能測試全部通過
- [ ] 所有錯誤處理測試全部通過

### 文件
- [ ] 測試報告已生成
- [ ] 發現的問題已記錄
- [ ] 效能數據已記錄

---

## 常見問題與解決方案

### Q1: 測試執行速度很慢怎麼辦?

**A**: 優化測試策略:

1. **使用測試資料庫**:
```bash
# .env.test
DATABASE_URL="postgresql://localhost:5432/cheapcut_test"
```

2. **Mock 外部 API**:
```typescript
jest.mock('../../src/lib/google-video-ai', () => ({
  analyzeVideo: jest.fn().mockResolvedValue({ labels: [...] }),
}));
```

3. **並行執行測試**:
```bash
npm test -- --maxWorkers=4
```

### Q2: 測試資料庫如何管理?

**A**: 使用 Docker 建立隔離的測試環境:

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:14
    environment:
      POSTGRES_DB: cheapcut_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
```

```bash
# 啟動測試資料庫
docker-compose -f docker-compose.test.yml up -d

# 執行測試
npm test

# 停止測試資料庫
docker-compose -f docker-compose.test.yml down
```

### Q3: 如何處理測試檔案的儲存空間?

**A**: 定期清理測試輸出:

```typescript
// tests/integration/teardown.ts
export async function teardownIntegrationTests(): Promise<void> {
  // 清理測試輸出檔案
  await fs.rm('./test-output', { recursive: true, force: true });

  // 清理 Supabase 測試檔案
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  await supabase.storage
    .from('test-materials')
    .remove(['test-data/**']);
}
```

### Q4: CI/CD 如何執行整合測試?

**A**: GitHub Actions 範例:

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: cheapcut_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install FFmpeg
        run: sudo apt-get install -y ffmpeg

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/cheapcut_test
          GOOGLE_VIDEO_AI_KEY: ${{ secrets.GOOGLE_VIDEO_AI_KEY }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: npm test -- tests/integration/

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: test-output/reports/
```

---

## Task 完成確認

完成這個 Task 後,你應該能夠:

✅ 確認所有核心引擎正確整合
✅ 確認完整流程可以從頭到尾執行
✅ 確認錯誤處理機制正常運作
✅ 確認成本追蹤與日誌記錄完整
✅ 了解系統的效能表現
✅ 產生完整的測試報告
✅ 識別並記錄潛在問題

**Phase 2 完成!** 🎉

所有核心引擎已開發並測試完成,可以進入 Phase 3: 前端介面開發。

---

**重要性**: ⭐⭐⭐⭐⭐ (極高 - Phase 2 的最終驗收)

這個測試確保整個系統的核心功能正確運作,是進入下一階段的關鍵里程碑。

---

**下一步**: Phase 3 - 前端介面開發

---

**文件版本**: 2.0 (完整版)
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
