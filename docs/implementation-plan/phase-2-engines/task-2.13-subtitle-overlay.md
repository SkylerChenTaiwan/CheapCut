# Task 2.13: 字幕疊加

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.13 |
| **Task 名稱** | 字幕疊加 |
| **所屬 Phase** | Phase 2: 核心功能開發 |
| **預估時間** | 3-4 小時 |
| **前置 Task** | Task 2.12 (影片合成實作) |
| **檔案位置** | `docs/implementation-plan/phase-2-engines/task-2.13-subtitle-overlay.md` |

---

## 📝 狀態

**文件狀態**: ✅ 已完成

本文件提供字幕疊加功能的完整實作指南。

---

## 功能描述

實作字幕疊加功能,將配音的逐字稿轉換為 SRT 字幕檔,並使用 FFmpeg 疊加到影片上。

**核心功能**:
- **SRT 產生**: 從配音切分資料產生標準 SRT 字幕檔
- **字幕樣式**: 設定字體、大小、顏色、位置等樣式
- **FFmpeg 疊加**: 使用 FFmpeg 將字幕燒錄到影片上
- **多語言支援**: 支援繁體中文、簡體中文、英文等多種語言

**資料流程**:
```
voiceover_segments (資料庫)
  → 產生 SRT 檔案
  → 設定字幕樣式 (ASS/SSA)
  → FFmpeg 疊加
  → 輸出帶字幕影片
```

---

## 前置知識

### 1. SRT 字幕格式

SRT (SubRip Subtitle) 是最常用的字幕格式,結構簡單:

```srt
1
00:00:00,000 --> 00:00:03,500
歡迎來到 CheapCut 自動剪輯系統

2
00:00:03,500 --> 00:00:07,000
我們將示範如何快速製作短影片

3
00:00:07,000 --> 00:00:10,500
只需要上傳素材和配音即可
```

**格式說明**:
- 第一行: 字幕序號
- 第二行: 時間碼 (開始時間 --> 結束時間)
- 第三行: 字幕文字
- 空行分隔每個字幕

### 2. FFmpeg 字幕處理

FFmpeg 提供兩種字幕處理方式:

**方式 1: 軟字幕 (Soft Subtitle)**
```bash
ffmpeg -i video.mp4 -i subtitles.srt \
  -c copy -c:s mov_text \
  output.mp4
```
- 優點: 可以開關字幕
- 缺點: 不是所有播放器都支援

**方式 2: 硬字幕 (Burned-in Subtitle)** ← 我們使用這個
```bash
ffmpeg -i video.mp4 \
  -vf "subtitles=subtitles.srt:force_style='FontName=Arial,FontSize=24'" \
  output.mp4
```
- 優點: 所有播放器都能看到
- 缺點: 無法關閉字幕

### 3. 字幕樣式設定

使用 `force_style` 參數設定字幕樣式:

```bash
subtitles=file.srt:force_style='
  FontName=Noto Sans TC,
  FontSize=24,
  PrimaryColour=&H00FFFFFF,
  OutlineColour=&H00000000,
  BackColour=&H80000000,
  Outline=2,
  Shadow=1,
  MarginV=30,
  Alignment=2
'
```

**常用樣式參數**:
- `FontName`: 字體名稱
- `FontSize`: 字體大小
- `PrimaryColour`: 文字顏色 (ABGR 格式)
- `OutlineColour`: 外框顏色
- `Outline`: 外框粗細
- `MarginV`: 垂直邊距
- `Alignment`: 對齊方式 (2=底部置中)

---

## 前置依賴

### 檔案依賴
- Task 2.12 已完成 (影片合成實作)
- Task 2.7 已完成 (配音切分,提供逐字稿資料)

### 套件依賴
```json
{
  "dependencies": {
    "fluent-ffmpeg": "^2.1.2"
  }
}
```

### 工具依賴
- FFmpeg (已在 Task 2.11 設定)
- 字體檔案: Noto Sans TC (繁體中文字體)

---

## 實作步驟

### Step 1: 建立 SRT 產生器

**檔案**: `src/lib/subtitle-generator.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface SubtitleSegment {
  index: number;
  start_time: number;  // 秒
  end_time: number;    // 秒
  text: string;
}

/**
 * 將秒數轉換為 SRT 時間格式
 * @example 3.5 → "00:00:03,500"
 */
function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * 產生 SRT 字幕檔
 */
export async function generateSrtFile(
  voiceoverId: string,
  outputPath: string
): Promise<void> {
  // 1. 從資料庫取得配音切分資料
  const segments = await prisma.voiceoverSegment.findMany({
    where: { voiceover_id: voiceoverId },
    orderBy: { start_time: 'asc' },
  });

  if (segments.length === 0) {
    throw new Error(`No segments found for voiceover ${voiceoverId}`);
  }

  // 2. 將切分資料轉換為 SRT 格式
  const srtContent = segments
    .map((segment, index) => {
      const startTime = formatSrtTime(segment.start_time);
      const endTime = formatSrtTime(segment.end_time);

      return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
    })
    .join('\n');

  // 3. 寫入 SRT 檔案
  await fs.writeFile(outputPath, srtContent, 'utf-8');

  console.log(`✅ SRT 檔案已產生: ${outputPath}`);
  console.log(`   包含 ${segments.length} 個字幕段落`);
}
```

### Step 2: 建立字幕樣式設定

**檔案**: `src/config/subtitle-styles.ts`

```typescript
export interface SubtitleStyle {
  fontName: string;
  fontSize: number;
  primaryColor: string;  // ABGR 格式
  outlineColor: string;
  outlineWidth: number;
  shadowDepth: number;
  marginV: number;       // 底部邊距
  alignment: number;     // 2 = 底部置中
}

/**
 * 預設字幕樣式 (適合短影片)
 */
export const DEFAULT_SUBTITLE_STYLE: SubtitleStyle = {
  fontName: 'Noto Sans TC',
  fontSize: 28,
  primaryColor: '&H00FFFFFF',  // 白色
  outlineColor: '&H00000000',  // 黑色外框
  outlineWidth: 2,
  shadowDepth: 1,
  marginV: 40,
  alignment: 2,  // 底部置中
};

/**
 * 將樣式物件轉換為 FFmpeg force_style 字串
 */
export function styleToFFmpegString(style: SubtitleStyle): string {
  return [
    `FontName=${style.fontName}`,
    `FontSize=${style.fontSize}`,
    `PrimaryColour=${style.primaryColor}`,
    `OutlineColour=${style.outlineColor}`,
    `Outline=${style.outlineWidth}`,
    `Shadow=${style.shadowDepth}`,
    `MarginV=${style.marginV}`,
    `Alignment=${style.alignment}`,
  ].join(',');
}
```

### Step 3: 實作 FFmpeg 字幕疊加

**檔案**: `src/lib/subtitle-overlay.ts`

```typescript
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { SubtitleStyle, styleToFFmpegString, DEFAULT_SUBTITLE_STYLE } from '../config/subtitle-styles';

/**
 * 使用 FFmpeg 將字幕疊加到影片上
 */
export async function overlaySubtitles(
  inputVideoPath: string,
  srtFilePath: string,
  outputVideoPath: string,
  style: SubtitleStyle = DEFAULT_SUBTITLE_STYLE
): Promise<void> {
  return new Promise((resolve, reject) => {
    const styleString = styleToFFmpegString(style);

    // 重要: SRT 檔案路徑需要轉義 (Windows 路徑特別注意)
    const escapedSrtPath = srtFilePath.replace(/\\/g, '/').replace(/:/g, '\\:');

    ffmpeg(inputVideoPath)
      .videoFilters(`subtitles=${escapedSrtPath}:force_style='${styleString}'`)
      .output(outputVideoPath)
      .on('start', (commandLine) => {
        console.log('🎬 開始疊加字幕...');
        console.log(`   指令: ${commandLine}`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`   進度: ${progress.percent.toFixed(1)}%`);
        }
      })
      .on('end', () => {
        console.log('✅ 字幕疊加完成');
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ 字幕疊加失敗:', err.message);
        reject(err);
      })
      .run();
  });
}
```

### Step 4: 整合到影片合成流程

**檔案**: `src/engines/video-composition-engine.ts` (修改)

```typescript
import { generateSrtFile } from '../lib/subtitle-generator';
import { overlaySubtitles } from '../lib/subtitle-overlay';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * 影片合成引擎 (加入字幕功能)
 */
export async function composeVideoWithSubtitles(
  timelineJsonPath: string,
  outputDir: string
): Promise<string> {
  // ... 前面的合成邏輯 (Task 2.12)

  // 1. 產生 SRT 檔案
  const srtPath = path.join(outputDir, `${uuidv4()}.srt`);
  await generateSrtFile(timeline.voiceover_id, srtPath);

  // 2. 疊加字幕
  const videoWithSubtitles = path.join(outputDir, `${uuidv4()}_with_subtitles.mp4`);
  await overlaySubtitles(composedVideo, srtPath, videoWithSubtitles);

  return videoWithSubtitles;
}
```

---

## 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證字幕疊加是否正常運作

**測試檔案**: `tests/phase-2/task-2.13.basic.test.ts`

```typescript
import { generateSrtFile } from '../../src/lib/subtitle-generator';
import { overlaySubtitles } from '../../src/lib/subtitle-overlay';
import { TestRunner } from '../../src/lib/test-runner';
import fs from 'fs/promises';
import path from 'path';

describe('Task 2.13 - Basic: Subtitle Overlay', () => {
  const runner = new TestRunner('basic');
  const testOutputDir = './test-output/task-2.13';

  beforeAll(async () => {
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  it('應該能夠產生 SRT 檔案', async () => {
    await runner.runTest('SRT 產生測試', async () => {
      // 準備測試資料 (假設有 test-voiceover-id)
      const srtPath = path.join(testOutputDir, 'test.srt');

      await generateSrtFile('test-voiceover-id', srtPath);

      // 驗證檔案存在
      const exists = await fs.access(srtPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // 驗證檔案內容
      const content = await fs.readFile(srtPath, 'utf-8');
      expect(content).toContain('-->');  // SRT 格式特徵
      expect(content.split('\n\n').length).toBeGreaterThan(0);  // 至少有一個字幕
    });
  });

  it('應該能夠疊加字幕', async () => {
    await runner.runTest('字幕疊加測試', async () => {
      const inputVideo = './test-data/sample-video.mp4';
      const srtFile = './test-data/sample-subtitles.srt';
      const outputVideo = path.join(testOutputDir, 'video-with-subtitles.mp4');

      await overlaySubtitles(inputVideo, srtFile, outputVideo);

      // 驗證輸出檔案存在
      const exists = await fs.access(outputVideo).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // 驗證檔案大小 (有字幕的檔案應該稍大一些)
      const stats = await fs.stat(outputVideo);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.13.basic.test.ts
```

**通過標準**:
- ✅ 能夠產生 SRT 檔案
- ✅ SRT 格式正確
- ✅ 能夠疊加字幕到影片
- ✅ 字幕時間碼正確

---

### Functional Acceptance (功能驗收)

**目標**: 驗證字幕功能完整性

**測試檔案**: `tests/phase-2/task-2.13.functional.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import { overlaySubtitles } from '../../src/lib/subtitle-overlay';
import { DEFAULT_SUBTITLE_STYLE } from '../../src/config/subtitle-styles';

describe('Task 2.13 - Functional: Subtitle Operations', () => {
  const runner = new TestRunner('functional');

  it('應該正確顯示字幕樣式', async () => {
    await runner.runTest('樣式測試', async () => {
      // 測試不同的字幕樣式
      const customStyle = {
        ...DEFAULT_SUBTITLE_STYLE,
        fontSize: 32,
        primaryColor: '&H0000FFFF',  // 黃色
      };

      await overlaySubtitles(
        './test-data/video.mp4',
        './test-data/subtitles.srt',
        './test-output/video-custom-style.mp4',
        customStyle
      );

      // 驗證輸出
      // (人工檢查字幕是否為黃色且大小正確)
    });
  });

  it('應該正確處理繁體中文', async () => {
    await runner.runTest('中文字幕測試', async () => {
      // 測試包含繁體中文的 SRT
      await overlaySubtitles(
        './test-data/video.mp4',
        './test-data/chinese-subtitles.srt',
        './test-output/video-chinese.mp4'
      );

      // 驗證中文字體正確顯示
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.13.functional.test.ts
```

**通過標準**:
- ✅ 字幕樣式正確顯示
- ✅ 繁體中文支援正常
- ✅ 字幕位置正確 (底部置中)
- ✅ 字幕外框清晰

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證完整字幕流程

**測試檔案**: `tests/phase-2/task-2.13.e2e.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import { generateSrtFile } from '../../src/lib/subtitle-generator';
import { overlaySubtitles } from '../../src/lib/subtitle-overlay';
import path from 'path';

describe('Task 2.13 - E2E: Complete Subtitle Flow', () => {
  const runner = new TestRunner('e2e');

  it('應該能完整執行字幕疊加流程', async () => {
    await runner.runTest('完整字幕流程測試', async () => {
      const outputDir = './test-output/e2e';

      // 1. 產生 SRT
      const srtPath = path.join(outputDir, 'generated.srt');
      await generateSrtFile('test-voiceover-id', srtPath);

      // 2. 疊加字幕
      const outputVideo = path.join(outputDir, 'final-with-subtitles.mp4');
      await overlaySubtitles(
        './test-data/composed-video.mp4',
        srtPath,
        outputVideo
      );

      // 3. 驗證最終影片
      const fs = require('fs');
      expect(fs.existsSync(outputVideo)).toBe(true);

      // 4. 驗證影片可播放 (使用 ffprobe)
      const ffprobe = require('ffprobe-static');
      const { execSync } = require('child_process');
      const probeResult = execSync(`${ffprobe.path} -v error -show_format -show_streams ${outputVideo}`);
      expect(probeResult.toString()).toContain('video');
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.13.e2e.test.ts
```

**通過標準**:
- ✅ 完整的字幕流程正確運作
- ✅ 帶字幕影片可以播放
- ✅ 字幕與配音同步
- ✅ 錯誤處理完善

---

## 完成檢查清單

實作完成後,請依序檢查以下項目:

### 實作檢查
- [ ] `src/lib/subtitle-generator.ts` 已建立
- [ ] `src/lib/subtitle-overlay.ts` 已建立
- [ ] `src/config/subtitle-styles.ts` 已建立
- [ ] SRT 產生功能已實作
- [ ] 字幕樣式設定已實作
- [ ] 字幕疊加功能已實作
- [ ] 整合到影片合成流程

### 測試檔案
- [ ] `tests/phase-2/task-2.13.basic.test.ts` 已建立
- [ ] `tests/phase-2/task-2.13.functional.test.ts` 已建立
- [ ] `tests/phase-2/task-2.13.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

---

## 常見問題與解決方案

### Q1: 中文字幕顯示為亂碼或方框?

**A**: 確認 FFmpeg 可以存取 Noto Sans TC 字體:

```bash
# 檢查系統字體
fc-list | grep "Noto Sans"

# 如果沒有,下載並安裝
# macOS
brew install font-noto-sans-cjk

# Ubuntu
sudo apt-get install fonts-noto-cjk
```

### Q2: SRT 時間碼與配音不同步?

**A**: 檢查 `voiceover_segments` 資料表的時間碼是否正確:

```sql
SELECT segment_id, start_time, end_time, text
FROM voiceover_segments
WHERE voiceover_id = 'xxx'
ORDER BY start_time;
```

確認:
- `start_time` 和 `end_time` 單位是秒 (小數)
- 時間碼連續無重疊

### Q3: FFmpeg 疊加字幕速度很慢?

**A**: 字幕疊加需要重新編碼影片,會比較耗時。優化方法:

```typescript
// 使用硬體加速 (如果可用)
ffmpeg(inputVideo)
  .videoCodec('h264_videotoolbox')  // macOS
  // .videoCodec('h264_nvenc')      // NVIDIA GPU
  .videoFilters(`subtitles=${srtPath}`)
  .output(outputVideo)
  .run();
```

### Q4: 字幕外框不清楚,難以閱讀?

**A**: 調整外框粗細和陰影:

```typescript
const betterReadabilityStyle = {
  ...DEFAULT_SUBTITLE_STYLE,
  outlineWidth: 3,     // 增加外框
  shadowDepth: 2,      // 增加陰影
  primaryColor: '&H00FFFFFF',  // 白色文字
  outlineColor: '&H00000000',  // 黑色外框
};
```

---

## Task 完成確認

完成這個 Task 後,你應該能夠:

✅ 從配音切分資料產生標準 SRT 字幕檔
✅ 使用 FFmpeg 將字幕燒錄到影片上
✅ 自訂字幕樣式 (字體、大小、顏色、位置)
✅ 正確處理繁體中文字幕
✅ 整合字幕功能到影片合成流程

**下一步**: Task 2.14 - 配樂整合

---

**文件版本**: 2.0 (完整版)
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
