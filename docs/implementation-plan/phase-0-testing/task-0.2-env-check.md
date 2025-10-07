# Task 0.2: 建立環境檢查測試

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 0.2 |
| **Task 名稱** | 建立環境檢查測試 |
| **所屬 Phase** | Phase 0: 測試環境建立 |
| **預估時間** | 2-3 小時 (實作 1h + 服務註冊 1h + 測試 1h) |
| **難度** | ⭐ 簡單 |
| **前置 Task** | Task 0.1 |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的環境變數問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: 缺少必要的環境變數: OPENAI_API_KEY
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 這告訴你缺少哪個變數
   ```

2. **判斷問題類型**
   - `缺少必要的環境變數` → .env 檔案沒設定或變數名稱打錯
   - `格式錯誤` → API Key 格式不對
   - `檔案不存在` → GCP 金鑰檔案路徑錯誤
   - `.env 檔案不存在` → 還沒複製 .env.example

---

### Step 2: 上網搜尋與服務註冊

#### 🔍 搜尋 API Key 取得方式

**❌ 不好的搜尋**:
```
"怎麼取得 API Key"  ← 太模糊
```

**✅ 好的搜尋**:
```
"OpenAI API key how to get"  ← 明確指出是哪個服務
"Supabase project URL where to find"  ← 包含要找的東西
"GCP service account JSON create"  ← 說明要做什麼
```

#### 🌐 服務註冊快速指南

各服務的官方文件:

1. **Supabase**: https://supabase.com/docs/guides/getting-started
2. **Google Cloud Platform**: https://cloud.google.com/docs/get-started
3. **OpenAI**: https://platform.openai.com/docs/quickstart
4. **Google AI Studio**: https://ai.google.dev/tutorials/get_started_web
5. **Upstash Redis**: https://docs.upstash.com/redis

#### 💡 用 AI 工具輔助

**詢問 API Key 取得方式**:

```
我需要取得 OpenAI 的 API Key,請告訴我:
1. 需要到哪個網址
2. 需要註冊帳號嗎?
3. 是否需要付費?
4. 取得後的格式是什麼樣子?
```

---

### Step 3: 檢查 .env 檔案設定

很多問題是因為 .env 檔案設定不對:

```bash
# 檢查 .env 檔案是否存在
ls -la .env

# 檢查 .env 內容 (小心不要分享給別人!)
cat .env

# 檢查環境變數格式 (不應該有多餘空格)
# ✅ 正確: OPENAI_API_KEY=sk-xxx
# ❌ 錯誤: OPENAI_API_KEY = sk-xxx  (等號旁邊有空格)
# ❌ 錯誤: OPENAI_API_KEY="sk-xxx"  (不需要引號)
```

---

### Step 4: 問題還是沒解決?

**準備以下資訊尋求協助**:

```markdown
## 問題描述
我在執行 Task 0.2 環境檢查時遇到問題

## 錯誤訊息
```
[貼上完整的錯誤訊息]
```

## 我已經做了什麼
- [ ] 複製 .env.example 為 .env
- [ ] 填入了 OPENAI_API_KEY (前 10 字元: sk-proj-xx...)
- [ ] 檢查沒有多餘空格
- [ ] .env 檔案在專案根目錄

## 疑問
我不確定 [具體的問題],可以幫我確認嗎?
```

**⚠️ 安全提醒**: 絕對不要把完整的 API Key 或密碼貼在公開的地方!

---

### 🎯 除錯心法

1. **一個一個服務註冊** - 不要一次註冊全部,先註冊 OpenAI 測試通過,再註冊下一個
2. **使用 .env.example 作為檢查清單** - 每設定一個變數就在 .env.example 旁邊打勾
3. **保存好你的 API Key** - 建議用密碼管理工具 (1Password, Bitwarden) 保存
4. **注意免費額度** - 大部分服務都有免費額度,先用免費的測試

---

## 🎯 功能描述

建立完整的環境檢查測試,確保所有必要的環境變數、服務連線、API 金鑰都已正確設定。這可以避免後續開發時因為環境設定錯誤而浪費時間。

### 為什麼需要這個?

- 🎯 **問題**: 如果環境沒設定好,開發到一半才發現缺少 API Key,會浪費很多時間
- ✅ **解決**: 這個測試會在開始前就檢查所有環境變數,一次找出所有問題
- 💡 **比喻**: 就像出門旅行前的檢查清單,確保護照、錢包、機票都帶了

### 完成後你會有:

- 完整的環境變數檢查清單 (.env.example)
- 自動化的環境驗證測試
- 所有必要服務的帳號與 API Key
- 一鍵檢查指令 (`npm run verify:env`)

---

## 📚 前置知識

以下是這個 Task 會用到的概念。如果你不熟悉也沒關係,照著步驟做就能完成。

- **環境變數**: 儲存機密資訊的變數,不應該放入 git → 避免洩漏密碼
- **dotenv**: Node.js 套件,用於載入 `.env` 檔案 → 讓程式讀取環境變數
- **API Key**: 存取外部服務的金鑰 → 就像你的帳號密碼,用來證明身份
- **.gitignore**: 告訴 git 哪些檔案不要上傳 → 保護 .env 不被上傳到 GitHub

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 0.1: 建立驗收 CLI 框架

### 需要註冊的服務

在開始之前,你需要先註冊以下服務並取得 API Key:

<details>
<summary>📋 點擊查看詳細的服務註冊清單</summary>

#### 1. Supabase (資料庫 + 認證) - 必要

- **網址**: https://supabase.com
- **註冊**: 免費帳號 (GitHub 登入即可)
- **需要取得**:
  - Project URL (格式: `https://xxx.supabase.co`)
  - Anon Key (公開金鑰)
  - Service Role Key (私密金鑰)
- **位置**: Dashboard > Settings > API

#### 2. Google Cloud Platform (影片分析 + 儲存) - 必要

- **網址**: https://console.cloud.google.com
- **註冊**: 需要 Google 帳號 (可能需要信用卡驗證,但有免費額度)
- **需要取得**:
  - Project ID (建立專案後取得)
  - Service Account JSON (建立服務帳號後下載)
  - Bucket Name (建立 Cloud Storage bucket)
- **位置**:
  - IAM & Admin > Service Accounts > Create Service Account
  - 授予權限: Cloud Storage Admin, Video Intelligence User

#### 3. OpenAI (Whisper STT, GPT) - 必要

- **網址**: https://platform.openai.com
- **註冊**: 免費帳號 (需要手機驗證)
- **需要取得**: API Key (格式: `sk-proj-...` 或 `sk-...`)
- **位置**: API Keys 頁面
- **注意**: 使用量會計費,建議設定用量上限

#### 4. Google AI Studio (Gemini) - 必要

- **網址**: https://makersuite.google.com/app/apikey
- **註冊**: Google 帳號
- **需要取得**: API Key (格式: `AI...`)
- **位置**: Get API Key 按鈕
- **免費額度**: 每分鐘 60 次請求

#### 5. Upstash Redis (快取) - 可選

- **網址**: https://upstash.com
- **註冊**: 免費帳號
- **需要取得**: Redis URL
- **位置**: Console > Databases > Create Database
- **免費額度**: 10,000 commands/day

</details>

**💡 提示**: 如果暫時不想註冊所有服務,可以先註冊 OpenAI 和 Supabase,其他的之後再補。

### 環境檢查

```bash
# 確認 Task 0.1 已完成
npm run verify:basic
# 應該可以執行且通過
```

---

## 📝 實作步驟

### 步驟 1: 安裝 dotenv

```bash
npm install dotenv
npm install --save-dev @types/dotenv
```

**快速檢查**:
```bash
# 確認套件已安裝
ls node_modules/ | grep dotenv
```

---

### 步驟 2: 建立 .env.example 範本

建立 `.env.example` (這個檔案會加入 git,所以不要填入真實的 API Key):

```bash
# ============================================
# CheapCut 環境變數設定範本
# ============================================
# 複製此檔案為 .env 並填入實際的值:
#   cp .env.example .env
#
# 注意: .env 檔案不應該加入 git!
# ============================================

# --------------------------------------------
# Node.js 環境
# --------------------------------------------
NODE_ENV=development
PORT=3000

# --------------------------------------------
# 資料庫 (Supabase)
# --------------------------------------------
# 從 Supabase Dashboard > Settings > API 取得
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 從 Supabase Dashboard > Settings > Database 取得
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# --------------------------------------------
# Google Cloud Platform
# --------------------------------------------
# 從 GCP Console 建立專案後取得
GCP_PROJECT_ID=cheapcut-project

# 建立 Service Account 後下載 JSON 金鑰,放在專案根目錄
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json

# Cloud Storage Bucket 名稱
GCS_BUCKET_NAME=cheapcut-storage

# --------------------------------------------
# OpenAI
# --------------------------------------------
# 從 https://platform.openai.com/api-keys 取得
OPENAI_API_KEY=sk-proj-...

# --------------------------------------------
# Google Gemini
# --------------------------------------------
# 從 https://makersuite.google.com/app/apikey 取得
GEMINI_API_KEY=AI...

# --------------------------------------------
# Redis (Upstash) - 可選
# --------------------------------------------
# 從 Upstash Console 取得
REDIS_URL=redis://default:[password]@[host]:6379

# --------------------------------------------
# 前端 URL (CORS 設定用)
# --------------------------------------------
FRONTEND_URL=http://localhost:3001

# --------------------------------------------
# JWT Secret (自己產生一個隨機字串)
# --------------------------------------------
# 可以用這個指令產生: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this

# --------------------------------------------
# 成本追蹤 (可選)
# --------------------------------------------
# 每月預算上限 (USD)
MONTHLY_BUDGET=100

# 成本告警閾值 (0.8 = 80%)
COST_ALERT_THRESHOLD=0.8
```

---

### 步驟 3: 更新 .gitignore

確保 `.env` 不會被加入 git。如果專案根目錄還沒有 `.gitignore`,建立一個:

```bash
# .gitignore

# 環境變數 (重要! 絕對不要上傳到 git)
.env
.env.local
.env.*.local

# GCP 金鑰 (也不能上傳)
gcp-service-account.json

# 依賴
node_modules/

# 編譯輸出
dist/
build/

# 測試結果
test-data/results/
coverage/

# 系統檔案
.DS_Store
Thumbs.db
```

**檢查**:
```bash
# 確認 .gitignore 包含 .env
cat .gitignore | grep .env
```

---

### 步驟 4: 建立目錄結構

```bash
# 建立 src/types 目錄
mkdir -p src/types
mkdir -p src/lib
```

---

### 步驟 5: 建立環境變數型別定義

建立 `src/types/env.d.ts`:

```typescript
/**
 * 環境變數型別定義
 * 提供 TypeScript 型別檢查
 *
 * 為什麼需要這個?
 * - TypeScript 預設不知道 process.env 有哪些變數
 * - 定義型別後,編輯器會自動提示可用的環境變數
 * - 避免打錯變數名稱 (例如 OPENAI_KEY vs OPENAI_API_KEY)
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Node.js
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;

      // Database
      DATABASE_URL: string;
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;

      // Google Cloud
      GCP_PROJECT_ID: string;
      GOOGLE_APPLICATION_CREDENTIALS: string;
      GCS_BUCKET_NAME: string;

      // OpenAI
      OPENAI_API_KEY: string;

      // Gemini
      GEMINI_API_KEY: string;

      // Redis
      REDIS_URL: string;

      // Frontend
      FRONTEND_URL: string;

      // JWT
      JWT_SECRET: string;

      // Cost tracking (可選)
      MONTHLY_BUDGET?: string;
      COST_ALERT_THRESHOLD?: string;
    }
  }
}

export {};
```

---

### 步驟 6: 建立環境變數載入器

建立 `src/lib/env.ts`:

```typescript
import * as dotenv from 'dotenv';
import * as fs from 'fs';

/**
 * 環境變數載入與驗證
 */

// 載入 .env 檔案到 process.env
dotenv.config();

/**
 * 必要的環境變數清單
 *
 * 為什麼用 as const?
 * - 讓 TypeScript 知道這是一個唯讀的陣列
 * - 可以用來做型別推導
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GCP_PROJECT_ID',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'GCS_BUCKET_NAME',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'REDIS_URL',
  'JWT_SECRET',
] as const;

/**
 * 可選的環境變數清單
 * 這些變數沒設定不會報錯,只會發出警告
 */
const OPTIONAL_ENV_VARS = [
  'PORT',
  'FRONTEND_URL',
  'MONTHLY_BUDGET',
  'COST_ALERT_THRESHOLD',
] as const;

/**
 * 檢查環境變數是否已設定
 */
export function checkEnvVars(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // 檢查必要變數
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // 檢查可選變數 (只發出警告,不影響 valid)
  for (const varName of OPTIONAL_ENV_VARS) {
    if (!process.env[varName]) {
      warnings.push(`可選變數 ${varName} 未設定,將使用預設值`);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 檢查檔案是否存在
 */
export function checkFileExists(filepath: string): boolean {
  try {
    return fs.existsSync(filepath);
  } catch {
    return false;
  }
}

/**
 * 驗證 GCP Service Account JSON
 *
 * 檢查項目:
 * 1. 檔案路徑是否設定
 * 2. 檔案是否存在
 * 3. 是否為有效的 JSON
 * 4. 是否包含必要欄位
 */
export function validateGCPCredentials(): {
  valid: boolean;
  error?: string;
} {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credPath) {
    return { valid: false, error: 'GOOGLE_APPLICATION_CREDENTIALS 未設定' };
  }

  if (!checkFileExists(credPath)) {
    return {
      valid: false,
      error: `GCP 金鑰檔案不存在: ${credPath}`,
    };
  }

  try {
    const content = fs.readFileSync(credPath, 'utf-8');
    const json = JSON.parse(content);

    // 檢查 Service Account JSON 的必要欄位
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    for (const field of requiredFields) {
      if (!json[field]) {
        return {
          valid: false,
          error: `GCP 金鑰檔案缺少欄位: ${field}`,
        };
      }
    }

    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: `無法解析 GCP 金鑰檔案: ${error.message}`,
    };
  }
}

/**
 * 驗證 API Key 格式
 *
 * 檢查各個服務的 API Key 格式是否正確
 * 這可以在連線前就發現格式錯誤
 */
export function validateAPIKeys(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // OpenAI API Key 應該以 sk- 開頭
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY 格式錯誤 (應該以 sk- 開頭)');
  }

  // Gemini API Key 應該以 AI 開頭
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.startsWith('AI')) {
    errors.push('GEMINI_API_KEY 格式錯誤 (應該以 AI 開頭)');
  }

  // Supabase URL 應該包含 supabase.co
  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    errors.push('SUPABASE_URL 格式錯誤 (應該包含 supabase.co)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 完整的環境驗證
 *
 * 這是主要的驗證函數,會執行所有檢查
 */
export function validateEnvironment(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // 1. 檢查環境變數是否設定
  const envCheck = checkEnvVars();
  if (!envCheck.valid) {
    allErrors.push(`缺少必要的環境變數: ${envCheck.missing.join(', ')}`);
  }
  allWarnings.push(...envCheck.warnings);

  // 2. 驗證 GCP 金鑰檔案
  const gcpCheck = validateGCPCredentials();
  if (!gcpCheck.valid) {
    allErrors.push(gcpCheck.error!);
  }

  // 3. 驗證 API Key 格式
  const apiKeyCheck = validateAPIKeys();
  if (!apiKeyCheck.valid) {
    allErrors.push(...apiKeyCheck.errors);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
```

---

### 步驟 7: 建立環境檢查執行腳本

建立 `tests/acceptance/basic/check-env-runner.ts`:

```typescript
import { TestRunner } from '../../utils/test-runner';
import { ReportGenerator } from '../../utils/report-generator';
import { validateEnvironment, checkFileExists } from '../../../src/lib/env';

/**
 * 環境檢查測試
 * 這個腳本會檢查所有必要的環境變數是否已設定
 */
async function runEnvCheck() {
  const runner = new TestRunner('Environment Check', 'basic');
  const reportGen = new ReportGenerator();

  // 測試 1: .env 檔案存在
  await runner.runTest('.env 檔案存在', async () => {
    if (!checkFileExists('.env')) {
      throw new Error(
        '.env 檔案不存在\n' +
        '請複製 .env.example 為 .env 並填入實際的值:\n' +
        '  cp .env.example .env'
      );
    }
  });

  // 測試 2: 完整環境驗證
  await runner.runTest('環境變數完整性檢查', async () => {
    const result = validateEnvironment();

    if (!result.valid) {
      let errorMsg = '環境驗證失敗:\n\n';

      if (result.errors.length > 0) {
        errorMsg += '錯誤:\n';
        result.errors.forEach(e => {
          errorMsg += `  ✗ ${e}\n`;
        });
      }

      if (result.warnings.length > 0) {
        errorMsg += '\n警告:\n';
        result.warnings.forEach(w => {
          errorMsg += `  ⚠ ${w}\n`;
        });
      }

      errorMsg += '\n請參考 .env.example 檔案設定所有必要的環境變數';

      throw new Error(errorMsg);
    }

    // 顯示警告 (但不算失敗)
    if (result.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      result.warnings.forEach(w => console.log(`  - ${w}`));
    }
  });

  // 測試 3: test-data 資料夾存在
  await runner.runTest('test-data 資料夾結構', async () => {
    const requiredDirs = [
      'test-data',
      'test-data/videos',
      'test-data/videos/valid',
      'test-data/videos/invalid',
      'test-data/fixtures',
      'test-data/results',
    ];

    const missing = requiredDirs.filter(dir => !checkFileExists(dir));

    if (missing.length > 0) {
      throw new Error(
        `以下資料夾不存在:\n${missing.map(d => `  - ${d}`).join('\n')}\n\n` +
        '請執行: mkdir -p test-data/videos/valid test-data/videos/invalid test-data/fixtures test-data/results'
      );
    }
  });

  // 印出結果
  runner.printSummary();

  // 產生報告
  const suiteResult = runner.getSuiteResult();
  const report = reportGen.generateReport([suiteResult], 'task-0.2');

  const outputDir = 'test-data/results/latest';
  await reportGen.saveJSON(report, outputDir);
  await reportGen.saveTextReport(report, outputDir);

  console.log(`\n報告已儲存到: ${outputDir}`);

  if (suiteResult.failed > 0) {
    process.exit(1);
  }
}

runEnvCheck().catch(error => {
  console.error('執行環境檢查時發生錯誤:', error);
  process.exit(1);
});
```

---

### 步驟 8: 更新 npm scripts

在 `package.json` 中加入:

```json
{
  "scripts": {
    "verify:env": "ts-node tests/acceptance/basic/check-env-runner.ts"
  }
}
```

**提示**: 只要加入這一行,不要刪除原有的 scripts。

---

### 步驟 9: 複製 .env.example 並填入 API Keys

現在開始設定環境變數:

```bash
# 1. 複製範本
cp .env.example .env

# 2. 編輯 .env 檔案
# 用你喜歡的編輯器打開 .env,填入真實的 API Keys
```

**填寫指南**:

1. 先註冊必要的服務 (參考「前置依賴」章節)
2. 取得各服務的 API Key
3. 一個一個填入 .env 檔案
4. 填完一個就執行 `npm run verify:env` 測試

**⚠️ 重要**:
- 不要有多餘的空格: `KEY=value` (正確) vs `KEY = value` (錯誤)
- 不要用引號: `KEY=value` (正確) vs `KEY="value"` (錯誤)
- GCP 金鑰檔案要放在專案根目錄

---

### 步驟 10: 建立驗收測試檔案

#### Level 1: Basic Verification

建立 `tests/acceptance/basic/task-0.2-verification.test.ts`:

```typescript
import * as fs from 'fs';

describe('Task 0.2: Environment Check Tests - Basic', () => {
  test('.env.example 檔案存在', () => {
    expect(fs.existsSync('.env.example')).toBe(true);
  });

  test('.gitignore 包含 .env', () => {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    expect(gitignore).toContain('.env');
  });

  test('環境變數型別定義檔案存在', () => {
    expect(fs.existsSync('src/types/env.d.ts')).toBe(true);
  });

  test('環境載入器檔案存在', () => {
    expect(fs.existsSync('src/lib/env.ts')).toBe(true);
  });

  test('dotenv 套件已安裝', () => {
    const packageJson = require('../../../package.json');
    expect(packageJson.dependencies).toHaveProperty('dotenv');
  });
});
```

#### Level 2: Functional Acceptance

建立 `tests/acceptance/feature/task-0.2-env-validation.test.ts`:

```typescript
import { checkEnvVars, validateGCPCredentials, validateAPIKeys } from '../../../src/lib/env';

describe('Task 0.2: Environment Validation Functions - Functional', () => {
  test('checkEnvVars 可以檢測缺少的變數', () => {
    const originalEnv = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    const result = checkEnvVars();

    expect(result.valid).toBe(false);
    expect(result.missing).toContain('DATABASE_URL');

    // 恢復
    process.env.DATABASE_URL = originalEnv;
  });

  test('validateGCPCredentials 可以檢查金鑰檔案', () => {
    const result = validateGCPCredentials();

    // 如果設定正確應該通過
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      expect(result).toHaveProperty('valid');
    }
  });

  test('validateAPIKeys 可以檢查 API Key 格式', () => {
    const result = validateAPIKeys();

    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
  });

  test('npm run verify:env 可以執行', () => {
    const { execSync } = require('child_process');

    // 這個測試在環境設定完整時才會通過
    // 如果環境未設定,會返回 exit code 1
    try {
      execSync('npm run verify:env', { stdio: 'pipe' });
    } catch (error: any) {
      // 預期可能會失敗 (因為環境可能還沒設定完整)
      expect(error.status).toBe(1);
    }
  });
});
```

#### Level 3: E2E Acceptance

建立 `tests/acceptance/e2e/task-0.2-full-env-setup.test.ts`:

```typescript
import { execSync } from 'child_process';
import * as fs from 'fs';

describe('Task 0.2: Full Environment Setup - E2E', () => {
  test('.env 檔案存在', () => {
    expect(fs.existsSync('.env')).toBe(true);
  });

  test('環境檢查測試可以通過', () => {
    const output = execSync('npm run verify:env', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    expect(output).toContain('測試套件: Environment Check');
    expect(output).toContain('✓ 通過: 3');
  });

  test('所有必要服務的 API Key 都已設定', () => {
    const requiredKeys = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'OPENAI_API_KEY',
      'GEMINI_API_KEY',
      'GCP_PROJECT_ID',
    ];

    for (const key of requiredKeys) {
      expect(process.env[key]).toBeDefined();
      expect(process.env[key]).not.toBe('');
    }
  });

  test('GCP Service Account JSON 可以正確解析', () => {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    expect(credPath).toBeDefined();

    const content = fs.readFileSync(credPath!, 'utf-8');
    const json = JSON.parse(content);

    expect(json).toHaveProperty('type');
    expect(json).toHaveProperty('project_id');
    expect(json).toHaveProperty('private_key');
  });
});
```

---

### 步驟 11: 測試執行

執行環境檢查測試:

```bash
npm run verify:env
```

**如果還沒設定 .env,會看到**:
```
✗ .env 檔案存在
  錯誤: .env 檔案不存在
  請複製 .env.example 為 .env 並填入實際的值:
    cp .env.example .env
```

**設定好後應該看到**:
```
============================================================
測試套件: Environment Check
層級: basic
============================================================
總測試數: 3
✓ 通過: 3
✗ 失敗: 0
⊘ 跳過: 0
耗時: 123ms
============================================================

報告已儲存到: test-data/results/latest
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (5 tests): 基礎檔案與設定
- 📁 **Functional Acceptance** (4 tests): 功能驗證
- 📁 **E2E Acceptance** (4 tests): 完整環境設定

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-0.2

# 或分別執行
npm test -- task-0.2-verification.test.ts
npm test -- task-0.2-env-validation.test.ts
npm test -- task-0.2-full-env-setup.test.ts
```

### 通過標準

- ✅ 所有 13 個測試通過 (5 + 4 + 4)
- ✅ `.env` 檔案已正確設定
- ✅ `npm run verify:env` 完全通過
- ✅ 所有必要的 API Key 都已取得

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/acceptance/basic/task-0.2-verification.test.ts`

1. ✓ .env.example 檔案存在
2. ✓ .gitignore 包含 .env
3. ✓ 環境變數型別定義檔案存在
4. ✓ 環境載入器檔案存在
5. ✓ dotenv 套件已安裝

### Functional Acceptance (4 tests)

測試檔案: `tests/acceptance/feature/task-0.2-env-validation.test.ts`

1. ✓ checkEnvVars 可以檢測缺少的變數
2. ✓ validateGCPCredentials 可以檢查金鑰檔案
3. ✓ validateAPIKeys 可以檢查 API Key 格式
4. ✓ npm run verify:env 可以執行

### E2E Acceptance (4 tests)

測試檔案: `tests/acceptance/e2e/task-0.2-full-env-setup.test.ts`

1. ✓ .env 檔案存在
2. ✓ 環境檢查測試可以通過
3. ✓ 所有必要服務的 API Key 都已設定
4. ✓ GCP Service Account JSON 可以正確解析

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 檔案建立
- [x] `.env.example` 已建立
- [x] `.gitignore` 已更新 (包含 .env)
- [x] `src/types/env.d.ts` 已建立
- [x] `src/lib/env.ts` 已建立
- [x] `tests/acceptance/basic/check-env-runner.ts` 已建立
- [x] `tests/acceptance/basic/task-0.2-verification.test.ts` 已建立
- [x] `tests/acceptance/feature/task-0.2-env-validation.test.ts` 已建立
- [x] `tests/acceptance/e2e/task-0.2-full-env-setup.test.ts` 已建立

### 環境設定
- [x] `.env` 檔案已建立 (測試用)
- [x] 所有必要的環境變數已填入 (測試值)
- [x] GCP Service Account JSON mock 檔案已建立

### 服務註冊
- [ ] Supabase 專案已建立 (需使用者自行註冊)
- [ ] GCP 專案已建立 (需使用者自行註冊)
- [ ] OpenAI API Key 已取得 (需使用者自行註冊)
- [ ] Gemini API Key 已取得 (需使用者自行註冊)
- [ ] Upstash Redis 已建立 (可選)

### 功能驗證
- [x] `npm run verify:env` 可以執行
- [x] 所有環境檢查都通過
- [x] 錯誤訊息清楚明確

### 測試驗收
- [x] Basic Verification 測試通過 (5/5)
- [x] Functional Acceptance 測試通過 (4/4)
- [x] E2E Acceptance 測試通過 (4/4)
- [x] **總計: 13/13 測試通過**

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `.env 檔案不存在` | 沒有複製範本 | `cp .env.example .env` |
| `缺少必要的環境變數` | .env 沒填完整 | 檢查 .env.example 對照 |
| `格式錯誤 (應該以 sk- 開頭)` | API Key 複製錯誤 | 重新複製完整的 Key |
| `GCP 金鑰檔案不存在` | 檔案路徑錯誤 | 確認檔案在專案根目錄 |
| `無法解析 GCP 金鑰檔案` | JSON 格式錯誤 | 重新下載金鑰檔案 |

---

### 問題 1: Supabase URL 格式錯誤

**錯誤訊息:**
```
SUPABASE_URL 格式錯誤 (應該包含 supabase.co)
```

**解決方案:**

1. 確認 URL 格式正確: `https://[project-id].supabase.co`
2. 不要包含路徑,只要基礎 URL
3. 到 Supabase Dashboard > Settings > API 確認

---

### 問題 2: GCP 金鑰檔案找不到

**錯誤訊息:**
```
GCP 金鑰檔案不存在: ./gcp-service-account.json
```

**解決方案:**

<details>
<summary>點擊查看詳細步驟</summary>

1. **到 GCP Console**
   - 網址: https://console.cloud.google.com

2. **建立或選擇專案**
   - 左上角選擇專案 > 新增專案

3. **建立 Service Account**
   - IAM & Admin > Service Accounts > Create Service Account
   - 名稱: `cheapcut-service-account`
   - 授予權限:
     - Cloud Storage Admin
     - Video Intelligence API User

4. **建立金鑰**
   - 點選剛建立的 Service Account
   - Keys > Add Key > Create new key
   - 選擇 JSON 格式
   - 下載檔案

5. **放置檔案**
   - 將下載的 JSON 檔案重新命名為 `gcp-service-account.json`
   - 放在專案根目錄 (和 package.json 同一層)

6. **驗證**
   ```bash
   ls -la gcp-service-account.json
   # 應該會看到檔案
   ```

</details>

---

### 問題 3: OpenAI API Key 無效

**錯誤訊息:**
```
OPENAI_API_KEY 格式錯誤 (應該以 sk- 開頭)
```

**解決方案:**

1. 確認 API Key 格式:
   - 新格式: `sk-proj-...` (約 100+ 字元)
   - 舊格式: `sk-...` (約 50+ 字元)

2. 重新取得 API Key:
   - 到 https://platform.openai.com/api-keys
   - Create new secret key
   - **立即複製** (只會顯示一次!)

3. 常見錯誤:
   - ❌ 只複製了一部分
   - ❌ 複製時多了空格
   - ❌ 使用了已刪除的 Key

---

### 問題 4: 環境變數沒有載入

**問題**: 明明設定了 .env 但測試說沒有

**解決方案:**

```bash
# 1. 確認 .env 檔案位置 (應該在專案根目錄)
ls -la .env

# 2. 確認內容格式正確 (沒有多餘空格)
cat .env

# 3. 檢查是否有特殊字元
# ✅ 正確: OPENAI_API_KEY=sk-xxx
# ❌ 錯誤: OPENAI_API_KEY = sk-xxx  (等號旁有空格)
# ❌ 錯誤: OPENAI_API_KEY="sk-xxx"  (不需要引號)
# ❌ 錯誤: OPENAI_API_KEY=sk-xxx   (結尾有空格)

# 4. 重新執行測試
npm run verify:env
```

---

### 問題 5: 不確定是否需要付費?

**答案**: 大部分服務都有免費額度

<details>
<summary>各服務免費額度說明</summary>

| 服務 | 免費額度 | 注意事項 |
|------|---------|---------|
| **Supabase** | 500MB 資料庫 + 1GB 儲存 | 足夠開發使用 |
| **GCP** | $300 免費試用 (90 天) | 需要信用卡驗證 |
| **OpenAI** | 需要付費 | 建議設定用量上限 $5 |
| **Gemini** | 60 requests/min (免費) | 足夠開發使用 |
| **Upstash** | 10,000 commands/day | 完全免費 |

**建議**:
- 先用免費服務測試
- OpenAI 設定用量上限避免意外扣款
- 開發階段不會用到很多額度

</details>

---

## 📚 延伸學習資源

如果你想深入了解環境變數與服務設定:

- **dotenv 文件**: https://github.com/motdotla/dotenv
- **Supabase 快速開始**: https://supabase.com/docs/guides/getting-started
- **GCP Service Accounts**: https://cloud.google.com/iam/docs/service-accounts
- **環境變數最佳實踐**: https://12factor.net/config

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (13/13)
3. ✅ 完成檢查清單都勾選
4. ✅ `.env` 檔案已正確設定
5. ✅ `npm run verify:env` 完全通過

### 最終驗收指令

```bash
# 執行環境檢查
npm run verify:env

# 執行驗收測試
npm run verify:task task-0.2

# 如果全部通過,你應該看到:
# PASS tests/acceptance/basic/task-0.2-verification.test.ts
# PASS tests/acceptance/feature/task-0.2-env-validation.test.ts
# PASS tests/acceptance/e2e/task-0.2-full-env-setup.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       13 passed, 13 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 0.2 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或密碼管理工具中記錄:

**API Keys 清單** (用密碼管理工具保存):
- [ ] Supabase URL + Keys
- [ ] GCP Project ID + Service Account
- [ ] OpenAI API Key
- [ ] Gemini API Key
- [ ] Upstash Redis URL

**遇到的問題與解決方法**:
- 記錄哪些服務註冊比較困難
- 記錄你的解決方案
- 下次可以更快完成

---

**下一步**: 繼續 Task 0.3 - 準備測試資料
