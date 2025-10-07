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

**文件狀態**: ✅ 已完成

本文件提供背景配樂整合功能的完整實作指南。

---

## 功能描述

整合背景配樂到影片合成流程,實作音訊混合、音量控制與淡入淡出效果。

**核心功能**:
- **配樂資訊解析**: 從時間軸 JSON 讀取配樂設定
- **音訊混合**: 使用 FFmpeg 混合配音與配樂
- **音量控制**: 自動平衡配音與配樂的音量比例
- **淡入淡出**: 實作開頭與結尾的淡入淡出效果
- **長度匹配**: 處理配樂與影片長度不一致的情況

**資料流程**:
```
時間軸 JSON
  → 解析配樂資訊 (music_url, volume, fade_in/out)
  → 下載配樂檔案
  → FFmpeg 音訊混合 (配音 + 配樂)
  → 輸出帶配樂的影片
```

---

## 前置知識

### 1. FFmpeg 音訊混合

FFmpeg 使用 `amix` filter 混合多軌音訊:

**基本混音**:
```bash
ffmpeg -i video_with_voiceover.mp4 -i background_music.mp3 \
  -filter_complex "[0:a][1:a]amix=inputs=2:duration=first[aout]" \
  -map 0:v -map "[aout]" output.mp4
```

**進階混音 (含音量控制)**:
```bash
ffmpeg -i video.mp4 -i music.mp3 \
  -filter_complex "
    [1:a]volume=0.3[music];
    [0:a][music]amix=inputs=2:duration=first[aout]
  " \
  -map 0:v -map "[aout]" output.mp4
```

### 2. 音量控制

使用 `volume` filter 調整音量:

```bash
# 音量降為 30%
[1:a]volume=0.3[out]

# 音量增加到 150%
[1:a]volume=1.5[out]

# 使用分貝 (dB)
[1:a]volume=-10dB[out]  # 降低 10dB
```

**音量建議**:
- 配音 (主音): 100% (0dB)
- 配樂 (背景): 20-30% (-12 to -10dB)
- 音效: 50-70% (-6 to -3dB)

### 3. 淡入淡出

使用 `afade` filter 實作淡入淡出:

```bash
# 淡入 (開頭 2 秒)
[1:a]afade=t=in:st=0:d=2[out]

# 淡出 (從 43 秒開始,持續 2 秒)
[1:a]afade=t=out:st=43:d=2[out]

# 同時淡入淡出
[1:a]afade=t=in:st=0:d=2,afade=t=out:st=43:d=2[out]
```

### 4. 處理配樂長度

**配樂太短** → 循環播放:
```bash
# 使用 aloop 循環
[1:a]aloop=loop=-1:size=2e+09[music_loop]
```

**配樂太長** → 裁剪:
```bash
# 使用 atrim 裁剪
[1:a]atrim=duration=45[music_trimmed]
```

---

## 前置依賴

### 檔案依賴
- Task 2.12 已完成 (影片合成實作)
- Task 2.13 已完成 (字幕疊加)
- 時間軸 JSON 包含配樂資訊

### 套件依賴
```json
{
  "dependencies": {
    "fluent-ffmpeg": "^2.1.2",
    "axios": "^1.6.0"
  }
}
```

### 工具依賴
- FFmpeg (已在 Task 2.11 設定)
- 免費配樂庫 (例如 Pixabay Music, YouTube Audio Library)

---

## 實作步驟

### Step 1: 定義配樂資料結構

**檔案**: `src/types/timeline.ts` (擴充)

```typescript
export interface TimelineJson {
  project_id: string;
  voiceover_id: string;
  total_duration: number;
  segments: TimelineSegment[];
  music?: MusicConfig;  // ← 新增配樂設定
}

export interface MusicConfig {
  music_id: string;
  music_url: string;      // 配樂檔案 URL
  volume: number;         // 0-1,預設 0.25
  fade_in_duration: number;   // 淡入秒數,預設 2
  fade_out_duration: number;  // 淡出秒數,預設 2
  loop: boolean;          // 是否循環,預設 true
}

export const DEFAULT_MUSIC_CONFIG: Partial<MusicConfig> = {
  volume: 0.25,           // 25% 音量
  fade_in_duration: 2,    // 2 秒淡入
  fade_out_duration: 2,   // 2 秒淡出
  loop: true,             // 預設循環
};
```

### Step 2: 實作配樂下載功能

**檔案**: `src/lib/music-downloader.ts`

```typescript
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * 下載配樂檔案到本地暫存目錄
 */
export async function downloadMusic(
  musicUrl: string,
  outputDir: string
): Promise<string> {
  const fileName = `music_${Date.now()}.mp3`;
  const outputPath = path.join(outputDir, fileName);

  console.log(`📥 下載配樂: ${musicUrl}`);

  const response = await axios({
    method: 'GET',
    url: musicUrl,
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log(`✅ 配樂下載完成: ${outputPath}`);
      resolve(outputPath);
    });
    writer.on('error', (err) => {
      console.error(`❌ 配樂下載失敗:`, err);
      reject(err);
    });
  });
}
```

### Step 3: 實作音訊混合功能

**檔案**: `src/lib/audio-mixer.ts`

```typescript
import ffmpeg from 'fluent-ffmpeg';
import { MusicConfig, DEFAULT_MUSIC_CONFIG } from '../types/timeline';

/**
 * 混合配音與配樂
 */
export async function mixAudioWithMusic(
  inputVideoPath: string,      // 已有配音的影片
  musicFilePath: string,        // 配樂檔案
  outputVideoPath: string,      // 輸出路徑
  musicConfig: MusicConfig,     // 配樂設定
  videoDuration: number         // 影片總長度 (秒)
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // 合併預設值
    const config = { ...DEFAULT_MUSIC_CONFIG, ...musicConfig };

    // 建立 filter_complex
    const filters: string[] = [];

    // 1. 處理配樂長度
    if (config.loop) {
      // 循環播放
      filters.push(`[1:a]aloop=loop=-1:size=2e+09[music_loop]`);
      filters.push(`[music_loop]atrim=duration=${videoDuration}[music_trimmed]`);
    } else {
      // 不循環,直接裁剪
      filters.push(`[1:a]atrim=duration=${videoDuration}[music_trimmed]`);
    }

    // 2. 音量調整
    filters.push(`[music_trimmed]volume=${config.volume}[music_vol]`);

    // 3. 淡入淡出
    const fadeOutStart = videoDuration - config.fade_out_duration!;
    filters.push(
      `[music_vol]afade=t=in:st=0:d=${config.fade_in_duration},afade=t=out:st=${fadeOutStart}:d=${config.fade_out_duration}[music]`
    );

    // 4. 混合配音與配樂
    filters.push(`[0:a][music]amix=inputs=2:duration=first[aout]`);

    const filterComplex = filters.join(';');

    console.log('🎵 開始混合音訊...');
    console.log(`   配樂音量: ${config.volume! * 100}%`);
    console.log(`   淡入: ${config.fade_in_duration}s, 淡出: ${config.fade_out_duration}s`);
    console.log(`   循環: ${config.loop ? '是' : '否'}`);

    ffmpeg()
      .input(inputVideoPath)
      .input(musicFilePath)
      .complexFilter(filterComplex)
      .outputOptions([
        '-map 0:v',           // 使用原影片的視訊
        '-map [aout]',        // 使用混合後的音訊
        '-c:v copy',          // 不重新編碼視訊 (節省時間)
        '-c:a aac',           // 音訊編碼為 AAC
        '-b:a 192k',          // 音訊位元率
      ])
      .output(outputVideoPath)
      .on('start', (commandLine) => {
        console.log(`   FFmpeg 指令: ${commandLine}`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`   進度: ${progress.percent.toFixed(1)}%`);
        }
      })
      .on('end', () => {
        console.log('✅ 音訊混合完成');
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ 音訊混合失敗:', err.message);
        reject(err);
      })
      .run();
  });
}
```

### Step 4: 整合到影片合成流程

**檔案**: `src/engines/video-composition-engine.ts` (擴充)

```typescript
import { downloadMusic } from '../lib/music-downloader';
import { mixAudioWithMusic } from '../lib/audio-mixer';
import { TimelineJson } from '../types/timeline';
import path from 'path';

/**
 * 完整的影片合成流程 (含字幕與配樂)
 */
export async function composeVideoComplete(
  timelineJsonPath: string,
  outputDir: string
): Promise<string> {
  // 1. 讀取時間軸 JSON
  const timeline: TimelineJson = JSON.parse(
    await fs.readFile(timelineJsonPath, 'utf-8')
  );

  // 2. 合成影片片段 (Task 2.12)
  const composedVideo = await composeVideoSegments(timeline, outputDir);

  // 3. 疊加字幕 (Task 2.13)
  const videoWithSubtitles = await addSubtitles(composedVideo, timeline, outputDir);

  // 4. 整合配樂 (Task 2.14) ← 新增
  let finalVideo = videoWithSubtitles;

  if (timeline.music) {
    console.log('🎵 偵測到配樂設定,開始整合配樂...');

    // 下載配樂
    const musicPath = await downloadMusic(timeline.music.music_url, outputDir);

    // 混合音訊
    const videoWithMusic = path.join(outputDir, 'final_with_music.mp4');
    await mixAudioWithMusic(
      videoWithSubtitles,
      musicPath,
      videoWithMusic,
      timeline.music,
      timeline.total_duration
    );

    finalVideo = videoWithMusic;
  } else {
    console.log('ℹ️  未設定配樂,跳過配樂整合');
  }

  return finalVideo;
}
```

### Step 5: 音量平衡測試工具

**檔案**: `src/tools/audio-level-analyzer.ts`

```typescript
import ffmpeg from 'fluent-ffmpeg';

/**
 * 分析影片的音訊音量
 */
export async function analyzeAudioLevels(videoPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .audioFilters('volumedetect')
      .output('/dev/null')
      .on('stderr', (stderrLine) => {
        console.log(stderrLine);
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}

/**
 * 使用範例:
 * await analyzeAudioLevels('./output/final_video.mp4');
 *
 * 輸出範例:
 * [Parsed_volumedetect_0 @ ...] mean_volume: -20.5 dB
 * [Parsed_volumedetect_0 @ ...] max_volume: -5.0 dB
 */
```

---

## 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證配樂整合是否正常運作

**測試檔案**: `tests/phase-2/task-2.14.basic.test.ts`

```typescript
import { downloadMusic } from '../../src/lib/music-downloader';
import { mixAudioWithMusic } from '../../src/lib/audio-mixer';
import { TestRunner } from '../../src/lib/test-runner';
import { MusicConfig } from '../../src/types/timeline';
import fs from 'fs/promises';

describe('Task 2.14 - Basic: Music Integration', () => {
  const runner = new TestRunner('basic');
  const testOutputDir = './test-output/task-2.14';

  beforeAll(async () => {
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  it('應該能夠下載配樂檔案', async () => {
    await runner.runTest('配樂下載測試', async () => {
      const testMusicUrl = 'https://example.com/test-music.mp3';
      const musicPath = await downloadMusic(testMusicUrl, testOutputDir);

      // 驗證檔案存在
      const stats = await fs.stat(musicPath);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  it('應該能夠混合配音與配樂', async () => {
    await runner.runTest('音訊混合測試', async () => {
      const musicConfig: MusicConfig = {
        music_id: 'test-music',
        music_url: 'https://example.com/music.mp3',
        volume: 0.25,
        fade_in_duration: 1,
        fade_out_duration: 1,
        loop: false,
      };

      const outputPath = `${testOutputDir}/video-with-music.mp4`;

      await mixAudioWithMusic(
        './test-data/video-with-voiceover.mp4',
        './test-data/background-music.mp3',
        outputPath,
        musicConfig,
        30  // 30 秒影片
      );

      // 驗證輸出檔案
      const stats = await fs.stat(outputPath);
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
npm test -- tests/phase-2/task-2.14.basic.test.ts
```

**通過標準**:
- ✅ 能夠下載配樂檔案
- ✅ 能夠混合配音與配樂
- ✅ 配樂檔案格式正確

---

### Functional Acceptance (功能驗收)

**目標**: 驗證音訊混合功能完整性

**測試檔案**: `tests/phase-2/task-2.14.functional.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import { mixAudioWithMusic } from '../../src/lib/audio-mixer';
import { analyzeAudioLevels } from '../../src/tools/audio-level-analyzer';

describe('Task 2.14 - Functional: Audio Mixing', () => {
  const runner = new TestRunner('functional');

  it('應該正確設定音量', async () => {
    await runner.runTest('音量控制測試', async () => {
      // 測試不同的音量設定
      const volumes = [0.1, 0.25, 0.5];

      for (const volume of volumes) {
        const outputPath = `./test-output/music-volume-${volume}.mp4`;

        await mixAudioWithMusic(
          './test-data/video.mp4',
          './test-data/music.mp3',
          outputPath,
          {
            music_id: 'test',
            music_url: '',
            volume,
            fade_in_duration: 0,
            fade_out_duration: 0,
            loop: false,
          },
          30
        );

        // 分析音量 (人工檢查)
        console.log(`\n音量 ${volume * 100}% 的結果:`);
        await analyzeAudioLevels(outputPath);
      }
    });
  });

  it('應該正確實作淡入淡出', async () => {
    await runner.runTest('淡入淡出測試', async () => {
      await mixAudioWithMusic(
        './test-data/video.mp4',
        './test-data/music.mp3',
        './test-output/music-with-fade.mp4',
        {
          music_id: 'test',
          music_url: '',
          volume: 0.25,
          fade_in_duration: 2,
          fade_out_duration: 3,
          loop: false,
        },
        30
      );

      // 人工檢查淡入淡出效果是否自然
    });
  });

  it('應該正確處理配樂循環', async () => {
    await runner.runTest('配樂循環測試', async () => {
      // 測試短配樂 (10秒) 循環到 30 秒影片
      await mixAudioWithMusic(
        './test-data/video-30s.mp4',
        './test-data/music-10s.mp3',
        './test-output/music-looped.mp4',
        {
          music_id: 'test',
          music_url: '',
          volume: 0.25,
          fade_in_duration: 1,
          fade_out_duration: 1,
          loop: true,  // ← 循環
        },
        30
      );

      // 驗證輸出影片長度正確
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
- ✅ 音量比例正確 (配樂不會蓋過配音)
- ✅ 淡入淡出效果自然
- ✅ 配樂循環正常運作
- ✅ 配樂長度處理正確

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證完整配樂整合流程

**測試檔案**: `tests/phase-2/task-2.14.e2e.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import { composeVideoComplete } from '../../src/engines/video-composition-engine';
import path from 'path';

describe('Task 2.14 - E2E: Complete Music Integration', () => {
  const runner = new TestRunner('e2e');

  it('應該能完整執行配樂整合流程', async () => {
    await runner.runTest('完整配樂整合測試', async () => {
      // 1. 準備時間軸 JSON (包含配樂設定)
      const timelineJson = {
        project_id: 'test-project',
        voiceover_id: 'test-voiceover',
        total_duration: 45,
        segments: [
          // ... 片段資料
        ],
        music: {
          music_id: 'test-music',
          music_url: 'https://example.com/background-music.mp3',
          volume: 0.25,
          fade_in_duration: 2,
          fade_out_duration: 2,
          loop: true,
        },
      };

      const timelineJsonPath = './test-output/timeline-with-music.json';
      await fs.writeFile(timelineJsonPath, JSON.stringify(timelineJson, null, 2));

      // 2. 執行完整影片合成 (含配樂)
      const outputDir = './test-output/e2e';
      const finalVideo = await composeVideoComplete(timelineJsonPath, outputDir);

      // 3. 驗證輸出影片存在
      const fs = require('fs');
      expect(fs.existsSync(finalVideo)).toBe(true);

      // 4. 驗證音訊軌包含配音與配樂
      // (使用 ffprobe 檢查音訊)
      const { execSync } = require('child_process');
      const probeResult = execSync(`ffprobe -v error -show_streams ${finalVideo}`);
      expect(probeResult.toString()).toContain('audio');

      // 5. 分析音量平衡
      const { analyzeAudioLevels } = require('../../src/tools/audio-level-analyzer');
      await analyzeAudioLevels(finalVideo);
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
- ✅ 輸出影片包含配音與配樂
- ✅ 音量平衡良好 (配樂不蓋過配音)
- ✅ 淡入淡出效果自然

---

## 完成檢查清單

實作完成後,請依序檢查以下項目:

### 實作檢查
- [ ] `src/lib/music-downloader.ts` 已建立
- [ ] `src/lib/audio-mixer.ts` 已建立
- [ ] `src/tools/audio-level-analyzer.ts` 已建立
- [ ] `src/types/timeline.ts` 已擴充 MusicConfig
- [ ] 配樂下載功能已實作
- [ ] 音訊混合功能已實作
- [ ] 音量控制已實作
- [ ] 淡入淡出已實作
- [ ] 配樂長度處理已實作
- [ ] 整合到影片合成流程

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

根據業界標準:

| 音軌 | 建議音量 | 分貝 (dB) | 說明 |
|------|---------|-----------|------|
| **配音** | 100% | 0dB | 主要內容,音量最大 |
| **配樂** | 20-30% | -12 to -10dB | 背景音樂,不能蓋過配音 |
| **音效** | 50-70% | -6 to -3dB | 如有音效,介於兩者之間 |

**測試方法**:
1. 產生帶配樂的影片
2. 播放並檢查:
   - ✅ 配音清晰可聽
   - ✅ 配樂營造氛圍但不搶戲
   - ✅ 淡入淡出自然
3. 使用 `analyzeAudioLevels()` 工具分析音量

---

## 常見問題與解決方案

### Q1: 配樂太大聲,蓋過了配音怎麼辦?

**A**: 降低配樂音量:

```typescript
const musicConfig: MusicConfig = {
  // ...
  volume: 0.15,  // 從 0.25 降至 0.15 (15%)
};
```

或在 FFmpeg filter 中動態調整:
```typescript
`[music_vol]volume=0.15[music]`
```

### Q2: 配樂長度與影片長度不匹配怎麼辦?

**A**: 根據情況選擇策略:

**配樂較短** → 循環播放:
```typescript
const musicConfig: MusicConfig = {
  // ...
  loop: true,  // 啟用循環
};
```

**配樂較長** → 自動裁剪:
```typescript
// audio-mixer.ts 已自動處理
filters.push(`[music_loop]atrim=duration=${videoDuration}[music_trimmed]`);
```

### Q3: 淡入淡出效果不自然怎麼辦?

**A**: 調整淡入淡出時長:

```typescript
const musicConfig: MusicConfig = {
  // ...
  fade_in_duration: 3,   // 增加到 3 秒 (更平順)
  fade_out_duration: 4,  // 增加到 4 秒
};
```

**經驗法則**:
- 短影片 (< 30s): 1-2 秒
- 中等影片 (30-60s): 2-3 秒
- 長影片 (> 60s): 3-5 秒

### Q4: 如何避免配樂版權問題?

**A**: 使用免費音樂庫:

**推薦來源**:
1. **Pixabay Music**: https://pixabay.com/music/
   - 完全免費
   - 商業使用無需標註

2. **YouTube Audio Library**: https://studio.youtube.com/
   - 免費下載
   - 部分需要標註

3. **Free Music Archive**: https://freemusicarchive.org/
   - CC 授權
   - 需確認授權條款

**實作建議**:
```typescript
// 在資料庫記錄音樂授權資訊
interface MusicMetadata {
  music_id: string;
  title: string;
  author: string;
  source: string;  // "Pixabay", "YouTube Audio Library", etc.
  license: string;  // "CC0", "CC BY", etc.
  attribution_required: boolean;
}
```

---

## Task 完成確認

完成這個 Task 後,你應該能夠:

✅ 從時間軸 JSON 解析配樂設定
✅ 下載配樂檔案到本地
✅ 使用 FFmpeg 混合配音與配樂
✅ 正確設定音量平衡 (配樂不蓋過配音)
✅ 實作平順的淡入淡出效果
✅ 處理配樂長度與影片長度不一致的情況
✅ 整合配樂功能到完整的影片合成流程

**下一步**: Task 2.15 - 核心引擎整合測試

---

**文件版本**: 2.0 (完整版)
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
