# Task 0.2: 建立環境檢查測試

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 0.2 |
| **Task 名稱** | 建立環境檢查測試 |
| **所屬 Phase** | Phase 0: 測試環境建立 |
| **預估時間** | 2-3 小時 |
| **難度** | ⭐ 簡單 |
| **前置 Task** | Task 0.1 |

## 🎯 功能描述

建立完整的環境檢查測試,確保所有必要的環境變數、服務連線、API 金鑰都已正確設定。這可以避免後續開發時因為環境設定錯誤而浪費時間。

**為什麼需要這個?**
- 在開始開發前,確保環境設定完整
- 避免「在我的機器上可以跑」的問題
- 提供清楚的環境設定指南

**完成後你會有:**
- 完整的環境變數檢查清單
- 自動化的環境驗證測試
- `.env.example` 範本檔案

## 📚 前置知識

- **環境變數**: 儲存設定的變數,不應該放入 git
- **dotenv**: Node.js 套件,用於載入 `.env` 檔案
- **API Key**: 存取外部服務的金鑰

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 0.1: 建立驗收 CLI 框架

### 需要註冊的服務
在開始之前,你需要先註冊以下服務並取得 API Key:

1. **Supabase** (資料庫 + 認證)
   - 網址: https://supabase.com
   - 需要: Project URL, Anon Key, Service Role Key

2. **Google Cloud Platform** (影片分析 + 儲存)
   - 網址: https://console.cloud.google.com
   - 需要: Project ID, Service Account JSON

3. **OpenAI** (Whisper STT, GPT)
   - 網址: https://platform.openai.com
   - 需要: API Key

4. **Google AI Studio** (Gemini)
   - 網址: https://makersuite.google.com/app/apikey
   - 需要: API Key

5. **Upstash Redis** (快取)
   - 網址: https://upstash.com
   - 需要: Redis URL

### 環境檢查
```bash
# 確認 Task 0.1 已完成
npm run verify:basic
# 應該可以執行且通過
```

## 📝 實作步驟

### 步驟 1: 安裝 dotenv

```bash
npm install dotenv
npm install --save-dev @types/dotenv
```

---

### 步驟 2: 建立 .env.example 範本

建立 `.env.example` (這個檔案會加入 git):

```bash
# ============================================
# CheapCut 環境變數設定範本
# ============================================
# 複製此檔案為 .env 並填入實際的值
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
# 從 Supabase Dashboard > Settings > Database 取得
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# 從 Supabase Dashboard > Settings > API 取得
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

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
OPENAI_API_KEY=sk-...

# --------------------------------------------
# Google Gemini
# --------------------------------------------
# 從 https://makersuite.google.com/app/apikey 取得
GEMINI_API_KEY=AI...

# --------------------------------------------
# Redis (Upstash)
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

### 步驟 3: 建立 .gitignore

確保 `.env` 不會被加入 git:

```bash
# .gitignore (如果還沒有,新增以下內容)

# 環境變數
.env
.env.local
.env.*.local

# GCP 金鑰
gcp-service-account.json
*.json

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
```

---

### 步驟 4: 建立環境變數型別定義

建立 `src/types/env.d.ts`:

```typescript
/**
 * 環境變數型別定義
 * 提供 TypeScript 型別檢查
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

      // Cost tracking
      MONTHLY_BUDGET?: string;
      COST_ALERT_THRESHOLD?: string;
    }
  }
}

export {};
```

---

### 步驟 5: 建立環境變數載入器

建立 `src/lib/env.ts`:

```typescript
import * as dotenv from 'dotenv';
import * as fs from 'fs';

/**
 * 環境變數載入與驗證
 */

// 載入 .env 檔案
dotenv.config();

/**
 * 必要的環境變數清單
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

  // 檢查可選變數 (只發出警告)
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

    // 檢查必要欄位
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
 */
export function validateEnvironment(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // 1. 檢查環境變數
  const envCheck = checkEnvVars();
  if (!envCheck.valid) {
    allErrors.push(`缺少必要的環境變數: ${envCheck.missing.join(', ')}`);
  }
  allWarnings.push(...envCheck.warnings);

  // 2. 驗證 GCP 金鑰
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

### 步驟 6: 建立環境檢查測試

建立 `tests/acceptance/basic/env-check.test.ts`:

```typescript
import { checkEnvVars, validateGCPCredentials, validateAPIKeys, validateEnvironment } from '../../../src/lib/env';

describe('Environment Variables Check', () => {
  test('所有必要的環境變數已設定', () => {
    const result = checkEnvVars();

    if (!result.valid) {
      console.error('缺少以下環境變數:');
      result.missing.forEach(v => console.error(`  - ${v}`));
    }

    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  test('GCP Service Account 金鑰檔案存在且有效', () => {
    const result = validateGCPCredentials();

    if (!result.valid) {
      console.error('GCP 金鑰驗證失敗:', result.error);
    }

    expect(result.valid).toBe(true);
  });

  test('API Keys 格式正確', () => {
    const result = validateAPIKeys();

    if (!result.valid) {
      console.error('API Key 驗證失敗:');
      result.errors.forEach(e => console.error(`  - ${e}`));
    }

    expect(result.valid).toBe(true);
  });
});
```

---

### 步驟 7: 建立環境檢查執行腳本

建立 `tests/acceptance/basic/check-env-runner.ts`:

```typescript
import { TestRunner } from '../../utils/test-runner';
import { ReportGenerator } from '../../utils/report-generator';
import { validateEnvironment, checkFileExists } from '../../../src/lib/env';

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

---

### 步驟 9: 測試執行

```bash
# 執行環境檢查
npm run verify:env
```

**如果還沒設定 .env,會看到:**
```
✗ .env 檔案存在
  錯誤: .env 檔案不存在
  請複製 .env.example 為 .env 並填入實際的值:
    cp .env.example .env
```

**設定好後應該看到:**
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
```

---

## ✅ 驗收標準

### Level 1: Basic Verification (基礎驗證)

**目標**: 確認環境檢查測試本身可以運作

```typescript
// tests/acceptance/basic/task-0.2-verification.test.ts

import * as fs from 'fs';

describe('Task 0.2: Environment Check Tests', () => {
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

**執行驗收:**
```bash
npm test -- task-0.2-verification.test.ts
```

**通過標準:**
- [ ] 所有 5 個測試都通過
- [ ] `.env.example` 包含所有必要的環境變數

---

### Level 2: Functional Acceptance (功能驗收)

**目標**: 確認環境檢查功能正常運作

```typescript
// tests/acceptance/feature/task-0.2-env-validation.test.ts

import { checkEnvVars, validateGCPCredentials, validateAPIKeys } from '../../../src/lib/env';

describe('Task 0.2: Environment Validation Functions', () => {
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

**執行驗收:**
```bash
npm test -- task-0.2-env-validation.test.ts
```

**通過標準:**
- [ ] 所有測試通過
- [ ] 函數可以正確檢測環境問題

---

### Level 3: E2E Acceptance (端對端驗收)

**目標**: 確認完整的環境設定流程

```typescript
// tests/acceptance/e2e/task-0.2-full-env-setup.test.ts

import { execSync } from 'child_process';
import * as fs from 'fs';

describe('Task 0.2: Full Environment Setup', () => {
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

**執行驗收:**
```bash
npm test -- task-0.2-full-env-setup.test.ts
```

**通過標準:**
- [ ] 所有測試通過
- [ ] `.env` 檔案已正確設定
- [ ] `npm run verify:env` 完全通過

---

## 📋 完成檢查清單

### 檔案建立
- [ ] `.env.example` 已建立
- [ ] `.gitignore` 已更新
- [ ] `src/types/env.d.ts` 已建立
- [ ] `src/lib/env.ts` 已建立
- [ ] `tests/acceptance/basic/env-check.test.ts` 已建立
- [ ] `tests/acceptance/basic/check-env-runner.ts` 已建立

### 環境設定
- [ ] `.env` 檔案已建立 (複製自 .env.example)
- [ ] 所有必要的環境變數已填入
- [ ] GCP Service Account JSON 已下載並放置

### 服務註冊
- [ ] Supabase 專案已建立
- [ ] GCP 專案已建立
- [ ] OpenAI API Key 已取得
- [ ] Gemini API Key 已取得
- [ ] Upstash Redis 已建立 (可選)

### 功能驗證
- [ ] `npm run verify:env` 可以執行
- [ ] 所有環境檢查都通過
- [ ] 錯誤訊息清楚明確

### 測試驗收
- [ ] Basic Verification 測試通過 (5/5)
- [ ] Functional Acceptance 測試通過 (4/4)
- [ ] E2E Acceptance 測試通過 (4/4)

---

## 🐛 常見問題與解決方案

### 問題 1: Supabase URL 格式錯誤

**錯誤訊息:**
```
SUPABASE_URL 格式錯誤 (應該包含 supabase.co)
```

**解決方案:**
- 確認 URL 格式正確: `https://[project-id].supabase.co`
- 不要包含路徑,只要基礎 URL

---

### 問題 2: GCP 金鑰檔案找不到

**錯誤訊息:**
```
GCP 金鑰檔案不存在: ./gcp-service-account.json
```

**解決方案:**
1. 到 GCP Console > IAM & Admin > Service Accounts
2. 建立新的 Service Account
3. 授予權限: Cloud Storage Admin, Video Intelligence API User
4. 建立金鑰 (JSON 格式)
5. 下載後重新命名為 `gcp-service-account.json`
6. 放在專案根目錄

---

### 問題 3: OpenAI API Key 無效

**錯誤訊息:**
```
OPENAI_API_KEY 格式錯誤 (應該以 sk- 開頭)
```

**解決方案:**
- 確認 API Key 格式: `sk-proj-...` 或 `sk-...`
- 到 https://platform.openai.com/api-keys 重新產生

---

### 問題 4: 環境變數沒有載入

**問題**: 明明設定了 .env 但測試說沒有

**解決方案:**
```bash
# 確認 .env 檔案位置 (應該在專案根目錄)
ls -la .env

# 確認內容格式正確 (沒有多餘空格)
cat .env

# 重新啟動測試
npm run verify:env
```

---

## 📚 延伸學習資源

- **dotenv 文件**: https://github.com/motdotla/dotenv
- **Supabase 快速開始**: https://supabase.com/docs/guides/getting-started
- **GCP Service Accounts**: https://cloud.google.com/iam/docs/service-accounts
- **環境變數最佳實踐**: https://12factor.net/config

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過
3. ✅ 完成檢查清單都勾選
4. ✅ `.env` 檔案已正確設定
5. ✅ `npm run verify:env` 完全通過

**最終驗收指令:**
```bash
# 執行所有環境檢查
npm run verify:env

# 執行驗收測試
npm test -- task-0.2

# 如果全部通過,代表 Task 0.2 完成!
```

---

**Task 完成時間記錄**: ___________

**已註冊的服務**:
- [ ] Supabase
- [ ] Google Cloud Platform
- [ ] OpenAI
- [ ] Google AI Studio (Gemini)
- [ ] Upstash Redis

**筆記**: ___________
