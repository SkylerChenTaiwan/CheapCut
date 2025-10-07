# Task 0.3: 準備測試資料

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 0.3 |
| **Task 名稱** | 準備測試資料 (Test Data Setup) |
| **所屬 Phase** | Phase 0: 測試環境建立 |
| **預估時間** | 2-3 小時 |
| **前置 Task** | Task 0.1 (驗收 CLI 框架), Task 0.2 (環境檢查測試) |
| **檔案位置** | `/Users/skyler/coding/CheapCut/docs/implementation-plan/phase-0-testing/task-0.3-test-data-setup.md` |

---

## 功能描述

建立完整的測試資料集，包括：
1. 測試用影片檔案（有效/無效）
2. 測試用 fixtures（用戶資料、提示詞、預期成本）
3. 測試資料驗證腳本
4. 測試資料的文檔與使用說明

這些測試資料將貫穿整個專案的開發與測試過程，確保每個功能模組都能在一致的資料集上進行驗證。

---

## 前置知識

### 1. 測試資料的設計原則

- **代表性**: 涵蓋各種常見場景（長短影片、不同解析度、不同格式）
- **可重現性**: 固定的測試資料確保測試結果可重現
- **邊界測試**: 包含邊界條件與錯誤情況
- **成本可控**: 測試資料應該小巧，降低 API 呼叫成本

### 2. 影片檔案規格

根據 overall-design 的素材管理設計：
- 支援格式: MP4, MOV, AVI, MKV
- 解析度: 720p ~ 4K
- 長度: 1秒 ~ 60分鐘
- 大小: 最大 2GB

### 3. Fixtures 的用途

- `test-users.json`: 模擬用戶資料（認證測試用）
- `edit-prompts.json`: 各種編輯提示詞（AI 選片測試用）
- `expected-costs.json`: 預期成本數據（成本追蹤驗證用）

---

## 前置依賴

### 檔案依賴
- Task 0.1 的 TestRunner 與 ReportGenerator 已實作
- Task 0.2 的環境變數驗證已完成

### 套件依賴
```json
{
  "dependencies": {
    "fs-extra": "^11.2.0",
    "fast-glob": "^3.3.2",
    "file-type": "^19.0.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4"
  }
}
```

### 工具依賴
- FFmpeg (用於驗證影片檔案的元資料)
- curl 或 wget (用於下載測試影片)

---

## 實作步驟

### Step 1: 建立測試資料目錄結構

```bash
# 在專案根目錄執行
mkdir -p test-data/videos/valid
mkdir -p test-data/videos/invalid
mkdir -p test-data/audio
mkdir -p test-data/fixtures
mkdir -p test-data/results
mkdir -p test-data/scripts
```

建立 `.gitignore` 規則：

```bash
# test-data/.gitignore
# 忽略所有影片和音訊檔案（太大）
videos/**/*.mp4
videos/**/*.mov
videos/**/*.avi
videos/**/*.mkv
audio/**/*.mp3
audio/**/*.wav
audio/**/*.m4a

# 忽略測試結果
results/**/*.json
results/**/*.html

# 保留 fixtures（JSON 檔案很小，可以 commit）
!fixtures/**/*.json

# 保留 README 與腳本
!README.md
!scripts/**/*.ts
!scripts/**/*.sh
```

建立 `test-data/README.md`：

```markdown
# CheapCut 測試資料

## 目錄結構

```
test-data/
├── videos/
│   ├── valid/          # 5 個有效的測試影片
│   └── invalid/        # 4 個無效的測試檔案
├── audio/              # 測試用配音檔案
├── fixtures/           # 固定的測試資料（JSON）
│   ├── test-users.json
│   ├── edit-prompts.json
│   └── expected-costs.json
├── results/            # 測試報告輸出目錄
├── scripts/            # 測試資料管理腳本
│   ├── download-videos.ts
│   ├── verify-data.ts
│   └── clean-results.ts
└── README.md           # 本文件
```

## 測試影片清單

### Valid Videos (5 個)

| 檔案名稱 | 格式 | 解析度 | 長度 | 用途 |
|---------|------|--------|------|------|
| `short-clip.mp4` | MP4 | 720p | 5秒 | 短片測試 |
| `medium-cooking.mp4` | MP4 | 1080p | 30秒 | 料理影片場景 |
| `long-nature.mp4` | MP4 | 1080p | 2分鐘 | 長片測試、多場景 |
| `high-res-4k.mp4` | MP4 | 4K | 10秒 | 高解析度測試 |
| `mov-format.mov` | MOV | 1080p | 15秒 | 格式相容性測試 |

### Invalid Files (4 個)

| 檔案名稱 | 問題 | 用途 |
|---------|------|------|
| `corrupted.mp4` | 損壞的影片檔 | 錯誤處理測試 |
| `empty.mp4` | 0 bytes 空檔案 | 邊界測試 |
| `fake-video.txt` | 文字檔偽裝成影片 | 格式驗證測試 |
| `oversized-dummy.mp4` | 超過 2GB（模擬） | 大小限制測試 |

## 下載測試影片

由於影片檔案過大，我們不將其加入 Git。請執行以下指令下載：

```bash
npm run test-data:download
```

或手動執行：

```bash
ts-node test-data/scripts/download-videos.ts
```

## 驗證測試資料

```bash
npm run test-data:verify
```

## 清理測試結果

```bash
npm run test-data:clean
```
```

### Step 2: 建立 Fixtures

建立 `test-data/fixtures/test-users.json`：

```json
{
  "users": [
    {
      "id": "test-user-001",
      "email": "test1@example.com",
      "name": "測試用戶 A",
      "tier": "free",
      "quotaUsed": 0,
      "quotaLimit": 10,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": "test-user-002",
      "email": "test2@example.com",
      "name": "測試用戶 B",
      "tier": "pro",
      "quotaUsed": 5,
      "quotaLimit": 100,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": "test-user-003",
      "email": "test3@example.com",
      "name": "測試用戶 C (quota 已滿)",
      "tier": "free",
      "quotaUsed": 10,
      "quotaLimit": 10,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "adminUser": {
    "id": "admin-001",
    "email": "admin@example.com",
    "name": "管理員",
    "role": "admin",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

建立 `test-data/fixtures/edit-prompts.json`：

```json
{
  "prompts": [
    {
      "id": "prompt-001",
      "name": "美食料理風格",
      "content": "選擇食材特寫、料理過程、成品展示的片段，節奏要明快",
      "tags": ["cooking", "food", "fast-paced"],
      "difficulty": "easy"
    },
    {
      "id": "prompt-002",
      "name": "旅遊 Vlog 風格",
      "content": "選擇風景優美、人物互動、有情感張力的片段",
      "tags": ["travel", "vlog", "scenic"],
      "difficulty": "medium"
    },
    {
      "id": "prompt-003",
      "name": "產品開箱風格",
      "content": "選擇產品展示、功能演示、使用情境的片段，要清晰明瞭",
      "tags": ["unboxing", "product", "demo"],
      "difficulty": "easy"
    },
    {
      "id": "prompt-004",
      "name": "教學講解風格",
      "content": "依照講解邏輯順序，選擇操作步驟、重點強調、結果展示的片段",
      "tags": ["tutorial", "education", "step-by-step"],
      "difficulty": "medium"
    },
    {
      "id": "prompt-005",
      "name": "情感故事風格",
      "content": "選擇有情感張力、人物表情、場景轉換的片段，營造起承轉合",
      "tags": ["story", "emotion", "narrative"],
      "difficulty": "hard"
    }
  ]
}
```

建立 `test-data/fixtures/expected-costs.json`：

```json
{
  "apiCosts": {
    "googleVideoAI": {
      "perMinute": 0.025,
      "description": "Google Video Intelligence API - Label Detection"
    },
    "openaiWhisper": {
      "perMinute": 0.006,
      "description": "OpenAI Whisper API - Speech to Text"
    },
    "geminiFlash": {
      "per1MTokens": 0.075,
      "avgTokensPerRequest": 2000,
      "description": "Gemini 1.5 Flash - 語意分析與選片"
    },
    "gcsStorage": {
      "perGB": 0.02,
      "description": "Google Cloud Storage - Standard Storage (月費)"
    },
    "gcsEgress": {
      "perGB": 0.12,
      "description": "GCS Egress to Internet (下載頻寬)"
    }
  },
  "scenarios": [
    {
      "name": "單一影片生成 - 標準場景",
      "description": "素材 5 分鐘, 配音 1 分鐘, 生成 1 分鐘影片",
      "breakdown": {
        "videoAI": 0.025 * 5,
        "whisper": 0.006 * 1,
        "gemini": 0.075 * (2000 / 1000000),
        "storage": 0.001,
        "egress": 0.005
      },
      "total": 0.031,
      "description": "這是 overall-design 中的標準成本估算"
    },
    {
      "name": "單一影片生成 - 長素材",
      "description": "素材 30 分鐘, 配音 3 分鐘, 生成 3 分鐘影片",
      "breakdown": {
        "videoAI": 0.025 * 30,
        "whisper": 0.006 * 3,
        "gemini": 0.075 * (5000 / 1000000),
        "storage": 0.005,
        "egress": 0.015
      },
      "total": 0.79
    },
    {
      "name": "批次處理 - 10 支影片",
      "description": "10 支標準影片的總成本",
      "total": 0.31
    }
  ]
}
```

### Step 3: 建立測試影片下載腳本

建立 `test-data/scripts/download-videos.ts`：

```typescript
/**
 * 下載測試影片腳本
 *
 * 這個腳本會從公開的測試影片庫下載所需的測試影片。
 * 如果你有自己的測試影片，也可以手動放到對應目錄。
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

interface VideoSpec {
  filename: string;
  url?: string; // 如果有公開 URL
  instructions?: string; // 手動準備說明
  size: string;
  duration: string;
}

const VALID_VIDEOS: VideoSpec[] = [
  {
    filename: 'short-clip.mp4',
    instructions: '請準備一個 5 秒的 720p MP4 影片',
    size: '~2MB',
    duration: '5s',
  },
  {
    filename: 'medium-cooking.mp4',
    instructions: '請準備一個 30 秒的料理影片 (1080p MP4)',
    size: '~10MB',
    duration: '30s',
  },
  {
    filename: 'long-nature.mp4',
    instructions: '請準備一個 2 分鐘的風景影片 (1080p MP4)',
    size: '~40MB',
    duration: '2m',
  },
  {
    filename: 'high-res-4k.mp4',
    instructions: '請準備一個 10 秒的 4K 影片',
    size: '~20MB',
    duration: '10s',
  },
  {
    filename: 'mov-format.mov',
    instructions: '請準備一個 15 秒的 MOV 格式影片 (1080p)',
    size: '~15MB',
    duration: '15s',
  },
];

const INVALID_FILES = [
  {
    filename: 'corrupted.mp4',
    instructions: '建立一個損壞的 MP4 檔案（可用文字編輯器建立假 MP4）',
  },
  {
    filename: 'empty.mp4',
    instructions: '建立一個 0 bytes 的空檔案',
  },
  {
    filename: 'fake-video.txt',
    instructions: '建立一個文字檔改名為 .txt（用於測試格式驗證）',
  },
  {
    filename: 'oversized-dummy.mp4',
    instructions: '不需實際建立 2GB 檔案，測試時會 mock 檔案大小',
  },
];

async function setupTestVideos(): Promise<void> {
  console.log('📹 開始準備測試影片...\n');

  const validDir = path.join(__dirname, '../videos/valid');
  const invalidDir = path.join(__dirname, '../videos/invalid');

  await fs.ensureDir(validDir);
  await fs.ensureDir(invalidDir);

  // 檢查 Valid Videos
  console.log('✅ Valid Videos:');
  for (const video of VALID_VIDEOS) {
    const filepath = path.join(validDir, video.filename);
    if (await fs.pathExists(filepath)) {
      console.log(`   ✓ ${video.filename} (已存在)`);
    } else {
      console.log(`   ✗ ${video.filename} (缺少)`);
      console.log(`     → ${video.instructions}`);
      console.log(`     → 預期大小: ${video.size}, 長度: ${video.duration}\n`);
    }
  }

  // 建立 Invalid Files
  console.log('\n❌ Invalid Files:');
  for (const file of INVALID_FILES) {
    const filepath = path.join(invalidDir, file.filename);

    if (file.filename === 'empty.mp4') {
      await fs.writeFile(filepath, '');
      console.log(`   ✓ ${file.filename} (已建立)`);
    } else if (file.filename === 'fake-video.txt') {
      await fs.writeFile(filepath, 'This is not a video file');
      console.log(`   ✓ ${file.filename} (已建立)`);
    } else if (file.filename === 'corrupted.mp4') {
      // 建立一個假的 MP4 header
      const fakeHeader = Buffer.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
        // ... 然後接上亂碼
      ]);
      await fs.writeFile(filepath, Buffer.concat([fakeHeader, Buffer.from('corrupted data')]));
      console.log(`   ✓ ${file.filename} (已建立)`);
    } else {
      console.log(`   - ${file.filename} (${file.instructions})`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📝 下一步:');
  console.log('1. 請根據上面的說明，手動準備缺少的測試影片');
  console.log('2. 或者使用你自己的影片，只要符合規格即可');
  console.log('3. 完成後執行: npm run test-data:verify');
  console.log('='.repeat(60));
}

// 執行
setupTestVideos().catch(console.error);
```

### Step 4: 建立測試資料驗證腳本

建立 `test-data/scripts/verify-data.ts`：

```typescript
/**
 * 測試資料驗證腳本
 *
 * 檢查所有測試資料是否完整且符合規格
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileTypeFromFile } from 'file-type';

interface ValidationResult {
  category: string;
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
  }>;
}

class TestDataValidator {
  private results: ValidationResult[] = [];

  async validate(): Promise<boolean> {
    console.log('🔍 開始驗證測試資料...\n');

    await this.validateDirectoryStructure();
    await this.validateFixtures();
    await this.validateVideos();

    this.printResults();

    return this.results.every(result =>
      result.checks.every(check => check.passed)
    );
  }

  private async validateDirectoryStructure(): Promise<void> {
    const result: ValidationResult = {
      category: '目錄結構',
      checks: [],
    };

    const requiredDirs = [
      'videos/valid',
      'videos/invalid',
      'audio',
      'fixtures',
      'results',
      'scripts',
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(__dirname, '..', dir);
      const exists = await fs.pathExists(dirPath);
      result.checks.push({
        name: dir,
        passed: exists,
        message: exists ? '目錄存在' : '目錄缺少',
      });
    }

    this.results.push(result);
  }

  private async validateFixtures(): Promise<void> {
    const result: ValidationResult = {
      category: 'Fixtures',
      checks: [],
    };

    const fixtures = [
      'test-users.json',
      'edit-prompts.json',
      'expected-costs.json',
    ];

    for (const fixture of fixtures) {
      const filepath = path.join(__dirname, '../fixtures', fixture);

      if (!(await fs.pathExists(filepath))) {
        result.checks.push({
          name: fixture,
          passed: false,
          message: '檔案不存在',
        });
        continue;
      }

      try {
        const content = await fs.readJson(filepath);

        // 基本驗證
        if (fixture === 'test-users.json') {
          const valid = content.users && Array.isArray(content.users) && content.users.length >= 3;
          result.checks.push({
            name: fixture,
            passed: valid,
            message: valid ? `包含 ${content.users.length} 個測試用戶` : '格式不正確',
          });
        } else if (fixture === 'edit-prompts.json') {
          const valid = content.prompts && Array.isArray(content.prompts) && content.prompts.length >= 5;
          result.checks.push({
            name: fixture,
            passed: valid,
            message: valid ? `包含 ${content.prompts.length} 個提示詞` : '格式不正確',
          });
        } else if (fixture === 'expected-costs.json') {
          const valid = content.apiCosts && content.scenarios;
          result.checks.push({
            name: fixture,
            passed: valid,
            message: valid ? '成本資料完整' : '格式不正確',
          });
        }
      } catch (error: any) {
        result.checks.push({
          name: fixture,
          passed: false,
          message: `JSON 解析錯誤: ${error.message}`,
        });
      }
    }

    this.results.push(result);
  }

  private async validateVideos(): Promise<void> {
    const result: ValidationResult = {
      category: '測試影片',
      checks: [],
    };

    // Valid Videos
    const validDir = path.join(__dirname, '../videos/valid');
    const validVideos = ['short-clip.mp4', 'medium-cooking.mp4', 'long-nature.mp4', 'high-res-4k.mp4', 'mov-format.mov'];

    for (const video of validVideos) {
      const filepath = path.join(validDir, video);

      if (!(await fs.pathExists(filepath))) {
        result.checks.push({
          name: `valid/${video}`,
          passed: false,
          message: '檔案不存在',
        });
        continue;
      }

      const stats = await fs.stat(filepath);
      if (stats.size === 0) {
        result.checks.push({
          name: `valid/${video}`,
          passed: false,
          message: '檔案是空的',
        });
        continue;
      }

      // 檢查檔案類型
      const fileType = await fileTypeFromFile(filepath);
      const isVideo = fileType && (fileType.mime.startsWith('video/'));

      result.checks.push({
        name: `valid/${video}`,
        passed: isVideo,
        message: isVideo
          ? `${(stats.size / 1024 / 1024).toFixed(2)} MB, ${fileType.mime}`
          : '不是有效的影片檔案',
      });
    }

    // Invalid Files
    const invalidDir = path.join(__dirname, '../videos/invalid');
    const invalidFiles = ['corrupted.mp4', 'empty.mp4', 'fake-video.txt'];

    for (const file of invalidFiles) {
      const filepath = path.join(invalidDir, file);
      const exists = await fs.pathExists(filepath);

      result.checks.push({
        name: `invalid/${file}`,
        passed: exists,
        message: exists ? '已建立' : '檔案不存在',
      });
    }

    this.results.push(result);
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 驗證結果');
    console.log('='.repeat(60) + '\n');

    for (const result of this.results) {
      console.log(`【${result.category}】`);
      for (const check of result.checks) {
        const icon = check.passed ? '✅' : '❌';
        console.log(`  ${icon} ${check.name}: ${check.message}`);
      }
      console.log('');
    }

    const allPassed = this.results.every(result =>
      result.checks.every(check => check.passed)
    );

    if (allPassed) {
      console.log('🎉 所有測試資料驗證通過！');
    } else {
      console.log('⚠️  部分測試資料缺少或不正確，請檢查上面的錯誤訊息。');
    }
    console.log('='.repeat(60));
  }
}

// 執行
const validator = new TestDataValidator();
validator.validate().then(success => {
  process.exit(success ? 0 : 1);
});
```

### Step 5: 建立清理腳本

建立 `test-data/scripts/clean-results.ts`：

```typescript
/**
 * 清理測試結果腳本
 */

import fs from 'fs-extra';
import path from 'path';

async function cleanResults(): Promise<void> {
  const resultsDir = path.join(__dirname, '../results');

  console.log('🧹 清理測試結果...');

  if (await fs.pathExists(resultsDir)) {
    const files = await fs.readdir(resultsDir);
    for (const file of files) {
      if (file.endsWith('.json') || file.endsWith('.html')) {
        await fs.remove(path.join(resultsDir, file));
        console.log(`  ✓ 已刪除: ${file}`);
      }
    }
  }

  console.log('✅ 清理完成！');
}

cleanResults().catch(console.error);
```

### Step 6: 更新 package.json

在專案根目錄的 `package.json` 中新增測試資料管理指令：

```json
{
  "scripts": {
    "test-data:download": "ts-node test-data/scripts/download-videos.ts",
    "test-data:verify": "ts-node test-data/scripts/verify-data.ts",
    "test-data:clean": "ts-node test-data/scripts/clean-results.ts"
  }
}
```

---

## 驗收標準

### Basic Verification (基礎驗證)

**目標**: 確認目錄結構與基本檔案存在

**測試檔案**: `tests/phase-0/task-0.3.basic.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import fs from 'fs-extra';
import path from 'path';

describe('Task 0.3 - Basic: 測試資料目錄結構', () => {
  const runner = new TestRunner('basic');

  it('應該存在 test-data 根目錄', async () => {
    await runner.runTest('test-data 目錄存在', async () => {
      const testDataDir = path.join(process.cwd(), 'test-data');
      const exists = await fs.pathExists(testDataDir);
      expect(exists).toBe(true);
    });
  });

  it('應該存在所有必要的子目錄', async () => {
    await runner.runTest('子目錄完整', async () => {
      const requiredDirs = [
        'test-data/videos/valid',
        'test-data/videos/invalid',
        'test-data/audio',
        'test-data/fixtures',
        'test-data/results',
        'test-data/scripts',
      ];

      for (const dir of requiredDirs) {
        const dirPath = path.join(process.cwd(), dir);
        const exists = await fs.pathExists(dirPath);
        expect(exists).toBe(true);
      }
    });
  });

  it('應該存在 .gitignore 檔案', async () => {
    await runner.runTest('gitignore 存在', async () => {
      const gitignorePath = path.join(process.cwd(), 'test-data/.gitignore');
      const exists = await fs.pathExists(gitignorePath);
      expect(exists).toBe(true);

      const content = await fs.readFile(gitignorePath, 'utf-8');
      expect(content).toContain('videos/**/*.mp4');
      expect(content).toContain('results/**/*.json');
    });
  });

  it('應該存在 README.md', async () => {
    await runner.runTest('README 存在', async () => {
      const readmePath = path.join(process.cwd(), 'test-data/README.md');
      const exists = await fs.pathExists(readmePath);
      expect(exists).toBe(true);
    });
  });

  it('應該存在所有必要的腳本', async () => {
    await runner.runTest('腳本檔案存在', async () => {
      const scripts = [
        'test-data/scripts/download-videos.ts',
        'test-data/scripts/verify-data.ts',
        'test-data/scripts/clean-results.ts',
      ];

      for (const script of scripts) {
        const scriptPath = path.join(process.cwd(), script);
        const exists = await fs.pathExists(scriptPath);
        expect(exists).toBe(true);
      }
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-0/task-0.3.basic.test.ts
```

**通過標準**:
- ✅ 所有目錄結構正確建立
- ✅ .gitignore 與 README 存在
- ✅ 所有腳本檔案存在

---

### Functional Acceptance (功能驗收)

**目標**: 驗證 fixtures 內容與腳本功能

**測試檔案**: `tests/phase-0/task-0.3.functional.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('Task 0.3 - Functional: Fixtures 與腳本功能', () => {
  const runner = new TestRunner('functional');

  describe('Fixtures 驗證', () => {
    it('test-users.json 格式正確且包含必要資料', async () => {
      await runner.runTest('test-users.json 驗證', async () => {
        const filepath = path.join(process.cwd(), 'test-data/fixtures/test-users.json');
        const data = await fs.readJson(filepath);

        expect(data.users).toBeDefined();
        expect(Array.isArray(data.users)).toBe(true);
        expect(data.users.length).toBeGreaterThanOrEqual(3);

        // 檢查第一個用戶的必要欄位
        const user = data.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('tier');
        expect(user).toHaveProperty('quotaUsed');
        expect(user).toHaveProperty('quotaLimit');

        // 檢查管理員資料
        expect(data.adminUser).toBeDefined();
        expect(data.adminUser.role).toBe('admin');
      });
    });

    it('edit-prompts.json 格式正確且包含多種風格', async () => {
      await runner.runTest('edit-prompts.json 驗證', async () => {
        const filepath = path.join(process.cwd(), 'test-data/fixtures/edit-prompts.json');
        const data = await fs.readJson(filepath);

        expect(data.prompts).toBeDefined();
        expect(Array.isArray(data.prompts)).toBe(true);
        expect(data.prompts.length).toBeGreaterThanOrEqual(5);

        // 檢查提示詞結構
        const prompt = data.prompts[0];
        expect(prompt).toHaveProperty('id');
        expect(prompt).toHaveProperty('name');
        expect(prompt).toHaveProperty('content');
        expect(prompt).toHaveProperty('tags');
        expect(prompt).toHaveProperty('difficulty');

        // 檢查是否涵蓋不同難度
        const difficulties = data.prompts.map((p: any) => p.difficulty);
        expect(difficulties).toContain('easy');
        expect(difficulties).toContain('medium');
      });
    });

    it('expected-costs.json 包含完整成本資料', async () => {
      await runner.runTest('expected-costs.json 驗證', async () => {
        const filepath = path.join(process.cwd(), 'test-data/fixtures/expected-costs.json');
        const data = await fs.readJson(filepath);

        expect(data.apiCosts).toBeDefined();
        expect(data.scenarios).toBeDefined();

        // 檢查 API 成本
        expect(data.apiCosts.googleVideoAI).toBeDefined();
        expect(data.apiCosts.openaiWhisper).toBeDefined();
        expect(data.apiCosts.geminiFlash).toBeDefined();

        // 檢查場景
        expect(Array.isArray(data.scenarios)).toBe(true);
        const standardScenario = data.scenarios.find((s: any) => s.name.includes('標準場景'));
        expect(standardScenario).toBeDefined();
        expect(standardScenario.total).toBeCloseTo(0.031, 3);
      });
    });
  });

  describe('腳本功能驗證', () => {
    it('download-videos.ts 可以執行', async () => {
      await runner.runTest('download 腳本執行', async () => {
        const scriptPath = path.join(process.cwd(), 'test-data/scripts/download-videos.ts');

        // 應該可以執行而不報錯（即使沒有實際下載）
        expect(() => {
          execSync(`ts-node ${scriptPath}`, { encoding: 'utf-8', stdio: 'pipe' });
        }).not.toThrow();
      });
    });

    it('verify-data.ts 可以執行並產生報告', async () => {
      await runner.runTest('verify 腳本執行', async () => {
        const scriptPath = path.join(process.cwd(), 'test-data/scripts/verify-data.ts');

        const output = execSync(`ts-node ${scriptPath}`, {
          encoding: 'utf-8',
          stdio: 'pipe'
        });

        expect(output).toContain('驗證結果');
      });
    });

    it('clean-results.ts 可以清理結果目錄', async () => {
      await runner.runTest('clean 腳本執行', async () => {
        // 先建立假結果檔案
        const resultsDir = path.join(process.cwd(), 'test-data/results');
        await fs.ensureDir(resultsDir);
        await fs.writeFile(path.join(resultsDir, 'test-result.json'), '{}');

        const scriptPath = path.join(process.cwd(), 'test-data/scripts/clean-results.ts');
        execSync(`ts-node ${scriptPath}`, { encoding: 'utf-8', stdio: 'pipe' });

        const files = await fs.readdir(resultsDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        expect(jsonFiles.length).toBe(0);
      });
    });
  });

  describe('package.json 腳本', () => {
    it('npm scripts 已正確設定', async () => {
      await runner.runTest('npm scripts 設定', async () => {
        const pkgPath = path.join(process.cwd(), 'package.json');
        const pkg = await fs.readJson(pkgPath);

        expect(pkg.scripts['test-data:download']).toBeDefined();
        expect(pkg.scripts['test-data:verify']).toBeDefined();
        expect(pkg.scripts['test-data:clean']).toBeDefined();
      });
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-0/task-0.3.functional.test.ts
```

**通過標準**:
- ✅ 所有 fixtures 格式正確且內容完整
- ✅ 所有腳本可以正常執行
- ✅ npm scripts 正確設定

---

### E2E Acceptance (端對端驗收)

**目標**: 完整測試資料設定流程

**測試檔案**: `tests/phase-0/task-0.3.e2e.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('Task 0.3 - E2E: 完整測試資料流程', () => {
  const runner = new TestRunner('e2e');

  it('端對端: 完整的測試資料設定與驗證流程', async () => {
    await runner.runTest('完整測試資料流程', async () => {
      // Step 1: 執行 download 腳本
      console.log('📥 執行 download 腳本...');
      execSync('npm run test-data:download', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      // Step 2: 檢查檔案是否建立
      const invalidDir = path.join(process.cwd(), 'test-data/videos/invalid');
      const emptyFile = path.join(invalidDir, 'empty.mp4');
      const fakeFile = path.join(invalidDir, 'fake-video.txt');

      expect(await fs.pathExists(emptyFile)).toBe(true);
      expect(await fs.pathExists(fakeFile)).toBe(true);

      // Step 3: 執行 verify 腳本
      console.log('🔍 執行 verify 腳本...');
      const verifyOutput = execSync('npm run test-data:verify', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      expect(verifyOutput).toContain('目錄結構');
      expect(verifyOutput).toContain('Fixtures');
      expect(verifyOutput).toContain('測試影片');

      // Step 4: 建立測試結果
      const resultsDir = path.join(process.cwd(), 'test-data/results');
      await fs.writeFile(
        path.join(resultsDir, 'test-report.json'),
        JSON.stringify({ test: 'data' }, null, 2)
      );

      // Step 5: 執行 clean 腳本
      console.log('🧹 執行 clean 腳本...');
      execSync('npm run test-data:clean', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      // Step 6: 驗證清理結果
      const files = await fs.readdir(resultsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      expect(jsonFiles.length).toBe(0);
    });
  });

  it('端對端: Fixtures 資料可以被正確讀取與使用', async () => {
    await runner.runTest('Fixtures 資料讀取', async () => {
      // 讀取所有 fixtures
      const testUsers = await fs.readJson(
        path.join(process.cwd(), 'test-data/fixtures/test-users.json')
      );
      const editPrompts = await fs.readJson(
        path.join(process.cwd(), 'test-data/fixtures/edit-prompts.json')
      );
      const expectedCosts = await fs.readJson(
        path.join(process.cwd(), 'test-data/fixtures/expected-costs.json')
      );

      // 模擬使用這些資料
      const freeUser = testUsers.users.find((u: any) => u.tier === 'free');
      expect(freeUser).toBeDefined();
      expect(freeUser.quotaLimit).toBe(10);

      const easyPrompt = editPrompts.prompts.find((p: any) => p.difficulty === 'easy');
      expect(easyPrompt).toBeDefined();
      expect(easyPrompt.content).toBeTruthy();

      const standardCost = expectedCosts.scenarios.find((s: any) => s.name.includes('標準場景'));
      expect(standardCost).toBeDefined();
      expect(standardCost.total).toBeCloseTo(0.031, 3);
    });
  });

  it('端對端: 測試影片清單可以被程式化存取', async () => {
    await runner.runTest('影片清單存取', async () => {
      const validDir = path.join(process.cwd(), 'test-data/videos/valid');
      const invalidDir = path.join(process.cwd(), 'test-data/videos/invalid');

      // 列出所有有效影片
      if (await fs.pathExists(validDir)) {
        const validVideos = await fs.readdir(validDir);
        const mp4Videos = validVideos.filter(v => v.endsWith('.mp4') || v.endsWith('.mov'));

        // 至少應該有可以用於測試的影片（如果用戶已準備）
        // 這裡我們只檢查目錄可以讀取
        expect(Array.isArray(mp4Videos)).toBe(true);
      }

      // 列出所有無效檔案
      if (await fs.pathExists(invalidDir)) {
        const invalidFiles = await fs.readdir(invalidDir);

        // 應該至少包含我們建立的檔案
        expect(invalidFiles).toContain('empty.mp4');
        expect(invalidFiles).toContain('fake-video.txt');
      }
    });
  });

  it('端對端: 測試資料文檔完整且可讀', async () => {
    await runner.runTest('測試資料文檔', async () => {
      const readmePath = path.join(process.cwd(), 'test-data/README.md');
      const readme = await fs.readFile(readmePath, 'utf-8');

      // 應該包含關鍵資訊
      expect(readme).toContain('目錄結構');
      expect(readme).toContain('測試影片清單');
      expect(readme).toContain('下載測試影片');
      expect(readme).toContain('驗證測試資料');
      expect(readme).toContain('Valid Videos');
      expect(readme).toContain('Invalid Files');
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-0/task-0.3.e2e.test.ts
```

**通過標準**:
- ✅ 完整的測試資料設定流程可以執行
- ✅ 所有 fixtures 可以被正確讀取與使用
- ✅ 測試影片清單可以程式化存取
- ✅ 文檔完整且清晰

---

## 完成檢查清單

實作完成後，請依序檢查以下項目：

### 目錄結構
- [ ] `test-data/` 根目錄已建立
- [ ] `test-data/videos/valid/` 已建立
- [ ] `test-data/videos/invalid/` 已建立
- [ ] `test-data/audio/` 已建立
- [ ] `test-data/fixtures/` 已建立
- [ ] `test-data/results/` 已建立
- [ ] `test-data/scripts/` 已建立

### 檔案建立
- [ ] `test-data/.gitignore` 已建立且規則正確
- [ ] `test-data/README.md` 已建立且內容完整
- [ ] `test-data/fixtures/test-users.json` 已建立
- [ ] `test-data/fixtures/edit-prompts.json` 已建立
- [ ] `test-data/fixtures/expected-costs.json` 已建立

### 腳本建立
- [ ] `test-data/scripts/download-videos.ts` 已建立
- [ ] `test-data/scripts/verify-data.ts` 已建立
- [ ] `test-data/scripts/clean-results.ts` 已建立
- [ ] `package.json` 中的 npm scripts 已設定

### 測試檔案
- [ ] `tests/phase-0/task-0.3.basic.test.ts` 已建立
- [ ] `tests/phase-0/task-0.3.functional.test.ts` 已建立
- [ ] `tests/phase-0/task-0.3.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

### 手動檢查
- [ ] 執行 `npm run test-data:download` 沒有錯誤
- [ ] 執行 `npm run test-data:verify` 可以看到驗證報告
- [ ] 執行 `npm run test-data:clean` 可以清理結果

---

## 常見問題與解決方案

### Q1: 測試影片從哪裡取得？

**A**: 有幾種方式：

1. **使用自己的影片**: 只要符合規格（格式、長度、解析度），任何影片都可以
2. **使用 Pexels/Pixabay 免費影片**: 這些網站提供免費的測試影片
3. **自己錄製**: 用手機錄製簡單的測試影片即可
4. **使用 FFmpeg 生成**: 可以用 FFmpeg 生成測試用的彩色條影片

範例 FFmpeg 指令：
```bash
# 生成 5 秒的測試影片
ffmpeg -f lavfi -i testsrc=duration=5:size=1280x720:rate=30 \
  -pix_fmt yuv420p test-data/videos/valid/short-clip.mp4
```

### Q2: 為什麼要用 .gitignore 排除影片檔案？

**A**: 影片檔案通常很大（幾 MB 到幾百 MB），如果 commit 到 Git 會：
- 大幅增加 repo 大小
- Clone 時間變長
- Git 操作變慢

因此我們只 commit fixtures（JSON 檔案很小），影片由開發者自行準備。

### Q3: 如果沒有準備測試影片，能否繼續開發？

**A**: 可以！在開發早期階段，你可以：
1. 先完成 Phase 0 和 Phase 1 的基礎設施
2. 用 Mock/Stub 來模擬影片處理邏輯
3. 等到 Phase 2 開始實作引擎時，再準備真實的測試影片

不過建議至少準備 1-2 個真實影片，可以更早發現問題。

### Q4: expected-costs.json 的數據從哪裡來？

**A**: 這些數據來自 `overall-design/07-cost-estimate.md`。如果 API 價格有變動，記得更新這個檔案。

### Q5: 測試資料需要多少儲存空間？

**A**: 預估：
- 5 個有效影片: ~100 MB
- 4 個無效檔案: < 1 MB
- Fixtures: < 100 KB
- **總計**: ~100 MB

這是可接受的大小。

### Q6: verify-data.ts 腳本為什麼需要 file-type 套件？

**A**: `file-type` 可以檢查檔案的真實格式（從檔案內容判斷），而不是只看副檔名。這樣可以偵測到 `fake-video.txt` 這種偽裝的檔案。

### Q7: 如何確保測試資料的一致性？

**A**:
1. Fixtures 放在 Git 中，確保所有開發者使用相同資料
2. 影片可以用 hash 值來驗證（在 verify-data.ts 中加入 hash 檢查）
3. README 中明確描述每個影片的規格

---

## Task 完成確認

完成這個 Task 後，你應該能夠：

✅ 執行 `npm run test-data:verify` 並看到完整的驗證報告
✅ 了解每個測試資料的用途
✅ 知道如何新增或修改測試資料
✅ 通過所有三層驗收測試（Basic / Functional / E2E）

**下一步**: 開始 Phase 1 - 基礎設施建立 (Task 1.1: 資料庫 Schema)

---

**文件版本**: 1.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
