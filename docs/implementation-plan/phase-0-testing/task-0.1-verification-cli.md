# Task 0.1: 建立驗收 CLI 框架

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 0.1 |
| **Task 名稱** | 建立驗收 CLI 框架 |
| **所屬 Phase** | Phase 0: 測試環境建立 |
| **預估時間** | 3-4 小時 (實作 2h + 測試 1h + 除錯 1h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | 無 (第一個 task) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息 (90% 的問題都會告訴你原因)

**執行指令後看到錯誤?** 別慌張,按照這個順序處理:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot find module 'typescript'
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 這是關鍵錯誤訊息
   ```

2. **判斷錯誤類型**
   - `Cannot find module` → 套件沒安裝
   - `ENOENT: no such file` → 檔案不存在
   - `SyntaxError` → 程式碼寫錯了
   - `Permission denied` → 權限問題

3. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 上網搜尋 (有技巧的查資料)

如果「常見問題」沒有你的答案,試試這些搜尋方式:

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"程式不能跑"  ← 太模糊
"TypeScript 錯誤" ← 沒有具體錯誤訊息
```

**✅ 好的搜尋方式**:
```
"Cannot find module typescript npm install"  ← 包含錯誤訊息 + 相關技術
"jest ts-jest configuration setup" ← 包含你在做的事情
"npm ERR! code EACCES" ← 完整的錯誤代碼
```

**進階技巧**:
```
site:stackoverflow.com "Cannot find module typescript"  ← 限定在 Stack Overflow
"jest setup" filetype:md ← 只搜尋 Markdown 文件
"ts-node" after:2024 ← 只看 2024 年後的結果（避免過時資訊）
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件** (最準確)
- TypeScript: https://www.typescriptlang.org/docs/
- Jest: https://jestjs.io/docs/getting-started
- Node.js: https://nodejs.org/docs/

**優先順序 2: Stack Overflow** (有具體解答)
- 搜尋時加上 `site:stackoverflow.com`
- 看「✓ 已接受的答案」和「高讚數答案」

**優先順序 3: GitHub Issues** (類似問題的討論)
- 搜尋: `site:github.com [套件名稱] [錯誤訊息]`
- 例如: `site:github.com jest "Cannot find module"`

**不推薦**:
- ❌ 隨機部落格文章 (可能過時)
- ❌ YouTube 影片 (找答案太慢)
- ❌ 使用翻譯後的中文搜尋 (結果較少)

#### 💡 用 AI 工具輔助

**ChatGPT / Claude 搜尋技巧**:

**❌ 不好的問法**:
```
"我的程式壞了"
```

**✅ 好的問法**:
```
我在執行 `npm install` 時遇到這個錯誤:
[貼上完整錯誤訊息]

我的環境是:
- Node.js: v18.12.0
- npm: 9.1.0
- 作業系統: macOS 14.0

我已經嘗試過:
1. 刪除 node_modules 重新安裝
2. 清除 npm cache

請問可能是什麼原因?
```

---

### Step 3: 檢查環境設定

很多問題是因為環境設定不對。執行這些檢查:

```bash
# 檢查 Node.js 版本 (應該 >= 18)
node --version

# 檢查 npm 版本 (應該 >= 9)
npm --version

# 檢查當前目錄 (應該在專案根目錄)
pwd

# 檢查必要檔案是否存在
ls -la package.json tsconfig.json
```

---

### Step 4: 問題還是沒解決?

**準備以下資訊尋求協助**:

```markdown
## 問題描述
我在執行 Task 0.1 的步驟 5 時遇到問題

## 我執行的指令
```bash
npm install --save-dev typescript
```

## 完整錯誤訊息
```
[貼上完整的錯誤訊息，不要只貼一部分]
```

## 我的環境
- Node.js 版本: v18.12.0
- npm 版本: 9.1.0
- 作業系統: macOS 14.0
- 專案目錄: /Users/xxx/CheapCut

## 我已經嘗試過
1. 刪除 node_modules 重新安裝 → 還是一樣錯誤
2. 上網搜尋 "npm install typescript error" → 沒找到解決方案
3. 檢查 package.json → 檔案存在且格式正確

## 相關檔案內容
[如果有需要，貼上相關檔案的內容]
```

---

### 🎯 除錯心法

1. **不要跳步驟** - 每個步驟都有原因,跳過可能導致後續錯誤
2. **看完整錯誤訊息** - 不要只看第一行,完整的 stack trace 很重要
3. **一次改一個地方** - 同時改很多地方會不知道哪個有效
4. **記錄你做過什麼** - 避免重複嘗試失敗的方法
5. **休息一下再回來** - 有時候休息後會突然想到解決方法

---

## 🎯 功能描述

建立一個基礎的驗收測試 CLI 工具,提供統一的測試執行與報告產生機制。這個框架將會被後續所有的 task 使用。

### 為什麼需要這個?

- 🎯 **問題**: 沒有這個工具,每次測試都要手動檢查,容易漏掉錯誤
- ✅ **解決**: 這個 CLI 會自動執行所有測試,並產生報告告訴你哪裡出錯
- 💡 **比喻**: 就像考試的自動閱卷系統,你寫完程式碼後它會自動幫你打分數

### 完成後你會有:

- 可以執行測試的 CLI 工具
- 測試結果記錄機制
- 基礎的測試報告產生功能
- 一鍵驗收指令 (`npm run verify:basic`)

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。
但如果想深入了解,可以參考文末的「延伸學習資源」。

- **Node.js**: JavaScript 執行環境 → 用來跑我們的程式碼
- **npm**: 套件管理工具 → 用來安裝其他人寫好的工具
- **TypeScript**: 帶型別檢查的 JavaScript → 幫助我們在寫程式時就發現錯誤
- **Jest**: 測試框架 → 用來寫自動測試

---

## 🔗 前置依賴

### 必須先完成的 Task
- 無 (這是第一個 task)

### 系統需求
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 環境檢查
```bash
# 檢查 Node.js 版本
node --version
# 應該顯示 v18.x.x 或更高

# 檢查 npm 版本
npm --version
# 應該顯示 9.x.x 或更高
```

---

## 📝 實作步驟

### 步驟 1: 初始化專案

在專案根目錄執行:

```bash
# 初始化 npm 專案
npm init -y

# 安裝 TypeScript
npm install --save-dev typescript @types/node

# 安裝測試框架
npm install --save-dev jest @types/jest ts-jest

# 安裝開發工具
npm install --save-dev ts-node ts-node-dev
```

**快速檢查**:
```bash
# 確認套件已安裝
ls node_modules/ | grep typescript
ls node_modules/ | grep jest
```

---

### 步驟 2: 設定 TypeScript

建立 `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*",
    "tests/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

**檢查設定**:
```bash
# 測試 TypeScript 編譯
npx tsc --noEmit
# 應該沒有錯誤訊息 (因為還沒有 .ts 檔案)
```

---

### 步驟 3: 設定 Jest

建立 `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

---

### 步驟 4: 建立測試資料夾結構

```bash
# 建立測試資料夾
mkdir -p tests/acceptance/basic
mkdir -p tests/acceptance/feature
mkdir -p tests/acceptance/e2e
mkdir -p tests/acceptance/cost
mkdir -p tests/utils

# 建立 src 資料夾
mkdir -p src/lib
mkdir -p src/services
```

**確認結構**:
```bash
tree -L 3 -I 'node_modules'
# 應該看到類似這樣的結構:
# .
# ├── src/
# │   ├── lib/
# │   └── services/
# ├── tests/
# │   ├── acceptance/
# │   │   ├── basic/
# │   │   ├── feature/
# │   │   ├── e2e/
# │   │   └── cost/
# │   └── utils/
# ├── package.json
# ├── tsconfig.json
# └── jest.config.js
```

---

### 步驟 5: 建立測試結果資料結構

建立 `tests/utils/types.ts`:

```typescript
/**
 * 測試結果的型別定義
 *
 * 為什麼用 union type?
 * - 限制只能是這三種狀態之一,避免打錯字
 * - TypeScript 會在編譯時檢查,確保不會出現 'pass' 或 'fail' 這種錯誤
 */
export type TestStatus = 'passed' | 'failed' | 'skipped';

/**
 * 測試層級
 * basic: 基礎驗證
 * feature: 功能驗收
 * e2e: 端對端測試
 * cost: 成本驗證
 */
export type TestLevel = 'basic' | 'feature' | 'e2e' | 'cost';

/**
 * 單一測試的結果
 */
export interface TestResult {
  testName: string;
  level: TestLevel;
  status: TestStatus;
  duration: number; // 毫秒
  error?: {
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * 測試套件的結果 (包含多個測試)
 */
export interface TestSuiteResult {
  suiteName: string;
  level: TestLevel;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  tests: TestResult[];
}

/**
 * 完整測試報告 (包含多個測試套件)
 */
export interface FullTestReport {
  reportId: string;
  timestamp: Date;
  taskId?: string;
  totalDuration: number;
  suites: TestSuiteResult[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
  };
}
```

---

### 步驟 6: 建立測試執行器

建立 `tests/utils/test-runner.ts`:

```typescript
import { TestResult, TestSuiteResult, TestLevel } from './types';

/**
 * 測試執行器
 * 負責執行測試並收集結果
 */
export class TestRunner {
  private results: TestResult[] = [];
  private startTime: Date;

  constructor(private suiteName: string, private level: TestLevel) {
    this.startTime = new Date();
  }

  /**
   * 執行單一測試
   *
   * @param testName 測試名稱
   * @param testFn 測試函數 (async)
   * @param metadata 額外的測試資訊
   */
  async runTest(
    testName: string,
    testFn: () => Promise<void>,
    metadata?: Record<string, any>
  ): Promise<TestResult> {
    const start = Date.now();

    try {
      // 執行測試函數
      await testFn();

      // 測試通過
      const result: TestResult = {
        testName,
        level: this.level,
        status: 'passed',
        duration: Date.now() - start,
        metadata
      };

      this.results.push(result);
      return result;
    } catch (error: any) {
      // 測試失敗
      const result: TestResult = {
        testName,
        level: this.level,
        status: 'failed',
        duration: Date.now() - start,
        error: {
          message: error.message,
          stack: error.stack
        },
        metadata
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * 取得測試套件結果
   */
  getSuiteResult(): TestSuiteResult {
    const endTime = new Date();
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;

    return {
      suiteName: this.suiteName,
      level: this.level,
      startTime: this.startTime,
      endTime,
      duration: endTime.getTime() - this.startTime.getTime(),
      totalTests: this.results.length,
      passed,
      failed,
      skipped,
      tests: this.results
    };
  }

  /**
   * 印出測試結果摘要到 console
   */
  printSummary(): void {
    const result = this.getSuiteResult();

    console.log('\n' + '='.repeat(60));
    console.log(`測試套件: ${result.suiteName}`);
    console.log(`層級: ${result.level}`);
    console.log('='.repeat(60));
    console.log(`總測試數: ${result.totalTests}`);
    console.log(`✓ 通過: ${result.passed}`);
    console.log(`✗ 失敗: ${result.failed}`);
    console.log(`⊘ 跳過: ${result.skipped}`);
    console.log(`耗時: ${result.duration}ms`);
    console.log('='.repeat(60) + '\n');

    // 如果有失敗的測試,印出詳細錯誤
    if (result.failed > 0) {
      console.log('失敗的測試:');
      result.tests
        .filter(t => t.status === 'failed')
        .forEach(t => {
          console.log(`\n✗ ${t.testName}`);
          console.log(`  錯誤: ${t.error?.message}`);
        });
    }
  }
}
```

---

### 步驟 7: 建立報告產生器

建立 `tests/utils/report-generator.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { FullTestReport, TestSuiteResult } from './types';

/**
 * 測試報告產生器
 * 負責產生 JSON 和文字格式的測試報告
 */
export class ReportGenerator {
  /**
   * 產生完整報告
   */
  generateReport(
    suites: TestSuiteResult[],
    taskId?: string
  ): FullTestReport {
    const totalTests = suites.reduce((sum, s) => sum + s.totalTests, 0);
    const passed = suites.reduce((sum, s) => sum + s.passed, 0);
    const failed = suites.reduce((sum, s) => sum + s.failed, 0);
    const skipped = suites.reduce((sum, s) => sum + s.skipped, 0);
    const totalDuration = suites.reduce((sum, s) => sum + s.duration, 0);

    return {
      reportId: this.generateReportId(),
      timestamp: new Date(),
      taskId,
      totalDuration,
      suites,
      summary: {
        totalTests,
        passed,
        failed,
        skipped,
        passRate: totalTests > 0 ? (passed / totalTests) * 100 : 0
      }
    };
  }

  /**
   * 儲存報告為 JSON
   */
  async saveJSON(report: FullTestReport, outputDir: string): Promise<string> {
    const filename = `report-${report.reportId}.json`;
    const filepath = path.join(outputDir, filename);

    // 確保目錄存在
    await fs.promises.mkdir(outputDir, { recursive: true });
    await fs.promises.writeFile(
      filepath,
      JSON.stringify(report, null, 2),
      'utf-8'
    );

    return filepath;
  }

  /**
   * 產生人類可讀的文字報告
   */
  generateTextReport(report: FullTestReport): string {
    let text = '';

    text += '═'.repeat(70) + '\n';
    text += '                    CheapCut 驗收測試報告\n';
    text += '═'.repeat(70) + '\n';
    text += `報告 ID: ${report.reportId}\n`;
    text += `時間: ${report.timestamp.toISOString()}\n`;
    if (report.taskId) {
      text += `Task ID: ${report.taskId}\n`;
    }
    text += `總耗時: ${(report.totalDuration / 1000).toFixed(2)}s\n`;
    text += '═'.repeat(70) + '\n\n';

    text += '總結\n';
    text += '─'.repeat(70) + '\n';
    text += `總測試數: ${report.summary.totalTests}\n`;
    text += `✓ 通過: ${report.summary.passed}\n`;
    text += `✗ 失敗: ${report.summary.failed}\n`;
    text += `⊘ 跳過: ${report.summary.skipped}\n`;
    text += `通過率: ${report.summary.passRate.toFixed(2)}%\n\n`;

    // 列出每個測試套件的結果
    report.suites.forEach(suite => {
      const icon = suite.failed === 0 ? '✓' : '✗';
      text += `${icon} ${suite.suiteName} (${suite.level})\n`;
      text += `  測試數: ${suite.totalTests}, 通過: ${suite.passed}, 失敗: ${suite.failed}\n`;
      text += `  耗時: ${suite.duration}ms\n`;

      // 如果有失敗的測試,列出詳細錯誤
      if (suite.failed > 0) {
        suite.tests
          .filter(t => t.status === 'failed')
          .forEach(t => {
            text += `\n  ✗ ${t.testName}\n`;
            text += `    錯誤: ${t.error?.message}\n`;
          });
      }
      text += '\n';
    });

    return text;
  }

  /**
   * 儲存文字報告
   */
  async saveTextReport(report: FullTestReport, outputDir: string): Promise<string> {
    const filename = `report-${report.reportId}.txt`;
    const filepath = path.join(outputDir, filename);

    const text = this.generateTextReport(report);

    await fs.promises.mkdir(outputDir, { recursive: true });
    await fs.promises.writeFile(filepath, text, 'utf-8');

    return filepath;
  }

  /**
   * 產生報告 ID (時間戳記)
   * 格式: 2025-01-15T10-30-45
   */
  private generateReportId(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }
}
```

---

### 步驟 8: 建立 npm scripts

修改 `package.json`,在 `scripts` 區塊加入以下內容:

```json
{
  "name": "cheapcut",
  "version": "1.0.0",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "verify:basic": "ts-node tests/acceptance/basic/run.ts",
    "verify:feature": "ts-node tests/acceptance/feature/run.ts",
    "verify:e2e": "ts-node tests/acceptance/e2e/run.ts",
    "verify:cost": "ts-node tests/acceptance/cost/run.ts",
    "verify:all": "ts-node tests/run-all.ts",
    "verify:task": "npm test --"
  }
}
```

**提示**: 如果你的 `package.json` 已經有其他 scripts,只要加入這些新的即可,不要刪除原有的。

---

### 步驟 9: 建立簡單的測試範例

建立 `tests/acceptance/basic/run.ts`:

```typescript
import { TestRunner } from '../../utils/test-runner';
import { ReportGenerator } from '../../utils/report-generator';

/**
 * 基礎驗證測試
 * 這個腳本會檢查基本的環境設定
 */
async function runBasicVerification() {
  const runner = new TestRunner('Basic Verification', 'basic');
  const reportGen = new ReportGenerator();

  // 測試 1: Node.js 版本檢查
  await runner.runTest('Node.js version >= 18', async () => {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);

    if (major < 18) {
      throw new Error(`Node.js version ${version} is too old. Need >= 18`);
    }
  });

  // 測試 2: 測試資料夾存在
  await runner.runTest('Test directories exist', async () => {
    const fs = require('fs');
    const dirs = [
      'tests/acceptance/basic',
      'tests/acceptance/feature',
      'tests/acceptance/e2e',
      'tests/acceptance/cost'
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        throw new Error(`Directory ${dir} does not exist`);
      }
    }
  });

  // 測試 3: test-data 資料夾存在
  await runner.runTest('test-data directory exists', async () => {
    const fs = require('fs');

    if (!fs.existsSync('test-data')) {
      throw new Error('test-data directory does not exist');
    }
  });

  // 印出結果到 console
  runner.printSummary();

  // 產生報告
  const suiteResult = runner.getSuiteResult();
  const report = reportGen.generateReport([suiteResult]);

  // 儲存報告到檔案
  const outputDir = 'test-data/results/latest';
  await reportGen.saveJSON(report, outputDir);
  await reportGen.saveTextReport(report, outputDir);

  console.log(`\n報告已儲存到: ${outputDir}`);

  // 如果有失敗,exit code 為 1 (讓 CI/CD 知道測試失敗)
  if (suiteResult.failed > 0) {
    process.exit(1);
  }
}

// 執行測試
runBasicVerification().catch(error => {
  console.error('執行測試時發生錯誤:', error);
  process.exit(1);
});
```

---

### 步驟 10: 建立驗收測試檔案

現在我們要建立用於驗收這個 Task 的測試檔案。

#### Level 1: Basic Verification

建立 `tests/acceptance/basic/task-0.1-verification.test.ts`:

```typescript
import * as fs from 'fs';
import { execSync } from 'child_process';

describe('Task 0.1: Verification CLI Framework - Basic', () => {
  test('專案已初始化', () => {
    expect(fs.existsSync('package.json')).toBe(true);
    expect(fs.existsSync('tsconfig.json')).toBe(true);
    expect(fs.existsSync('jest.config.js')).toBe(true);
  });

  test('必要套件已安裝', () => {
    const packageJson = require('../../../package.json');

    expect(packageJson.devDependencies).toHaveProperty('typescript');
    expect(packageJson.devDependencies).toHaveProperty('jest');
    expect(packageJson.devDependencies).toHaveProperty('ts-jest');
  });

  test('測試資料夾結構完整', () => {
    const dirs = [
      'tests/acceptance/basic',
      'tests/acceptance/feature',
      'tests/acceptance/e2e',
      'tests/acceptance/cost',
      'tests/utils'
    ];

    for (const dir of dirs) {
      expect(fs.existsSync(dir)).toBe(true);
    }
  });

  test('TypeScript 可以編譯', () => {
    expect(() => {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
    }).not.toThrow();
  });
});
```

#### Level 2: Functional Acceptance

建立 `tests/acceptance/feature/task-0.1-runner.test.ts`:

```typescript
import { TestRunner } from '../../utils/test-runner';
import { ReportGenerator } from '../../utils/report-generator';
import * as fs from 'fs';
import { execSync } from 'child_process';

describe('Task 0.1: Test Runner & Report Generator - Functional', () => {
  test('TestRunner 可以執行測試', async () => {
    const runner = new TestRunner('Test Suite', 'basic');

    const result = await runner.runTest('Sample test', async () => {
      expect(1 + 1).toBe(2);
    });

    expect(result.status).toBe('passed');
    expect(result.duration).toBeGreaterThan(0);
  });

  test('TestRunner 可以捕捉失敗', async () => {
    const runner = new TestRunner('Test Suite', 'basic');

    const result = await runner.runTest('Failing test', async () => {
      throw new Error('Expected failure');
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Expected failure');
  });

  test('ReportGenerator 可以產生 JSON 報告', async () => {
    const runner = new TestRunner('Test Suite', 'basic');
    await runner.runTest('Test 1', async () => {});

    const reportGen = new ReportGenerator();
    const report = reportGen.generateReport([runner.getSuiteResult()]);

    expect(report.reportId).toBeDefined();
    expect(report.summary.totalTests).toBe(1);
    expect(report.summary.passed).toBe(1);
  });

  test('ReportGenerator 可以儲存報告', async () => {
    const runner = new TestRunner('Test Suite', 'basic');
    await runner.runTest('Test 1', async () => {});

    const reportGen = new ReportGenerator();
    const report = reportGen.generateReport([runner.getSuiteResult()]);

    const outputDir = 'test-data/results/test-output';
    const jsonPath = await reportGen.saveJSON(report, outputDir);
    const textPath = await reportGen.saveTextReport(report, outputDir);

    expect(fs.existsSync(jsonPath)).toBe(true);
    expect(fs.existsSync(textPath)).toBe(true);

    // 清理測試檔案
    fs.unlinkSync(jsonPath);
    fs.unlinkSync(textPath);
  });

  test('可以執行 npm run verify:basic', () => {
    expect(() => {
      execSync('npm run verify:basic', { stdio: 'pipe' });
    }).not.toThrow();
  });
});
```

#### Level 3: E2E Acceptance

建立 `tests/acceptance/e2e/task-0.1-full-flow.test.ts`:

```typescript
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Task 0.1: Full Verification Flow - E2E', () => {
  test('完整驗收流程可以執行', () => {
    // 執行基礎驗證
    const output = execSync('npm run verify:basic', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    // 檢查輸出包含關鍵資訊
    expect(output).toContain('測試套件: Basic Verification');
    expect(output).toContain('通過:');
    expect(output).toContain('報告已儲存');
  });

  test('測試報告檔案已產生', () => {
    const resultsDir = 'test-data/results/latest';

    expect(fs.existsSync(resultsDir)).toBe(true);

    const files = fs.readdirSync(resultsDir);
    const hasJSON = files.some(f => f.endsWith('.json'));
    const hasTXT = files.some(f => f.endsWith('.txt'));

    expect(hasJSON).toBe(true);
    expect(hasTXT).toBe(true);
  });

  test('測試報告內容正確', () => {
    const resultsDir = 'test-data/results/latest';
    const files = fs.readdirSync(resultsDir);
    const jsonFile = files.find(f => f.endsWith('.json'));

    expect(jsonFile).toBeDefined();

    const reportPath = path.join(resultsDir, jsonFile!);
    const reportContent = fs.readFileSync(reportPath, 'utf-8');
    const report = JSON.parse(reportContent);

    expect(report.reportId).toBeDefined();
    expect(report.timestamp).toBeDefined();
    expect(report.summary).toBeDefined();
    expect(report.summary.totalTests).toBeGreaterThan(0);
    expect(report.suites).toBeInstanceOf(Array);
    expect(report.suites.length).toBeGreaterThan(0);
  });
});
```

---

### 步驟 11: 建立 test-data 目錄

```bash
mkdir -p test-data/results/latest
```

---

### 步驟 12: 測試執行

現在讓我們測試一下是否一切正常:

```bash
# 執行基礎驗證
npm run verify:basic
```

**預期輸出** (✓ 代表應該是綠色的):

```
============================================================
測試套件: Basic Verification
層級: basic
============================================================
總測試數: 3
✓ 通過: 3
✗ 失敗: 0
⊘ 跳過: 0
耗時: 45ms
============================================================

報告已儲存到: test-data/results/latest
```

如果你看到類似的輸出,恭喜!基礎框架已經建立成功了。

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (4 tests): 基礎檔案與設定
- 📁 **Functional Acceptance** (5 tests): 功能正確性
- 📁 **E2E Acceptance** (3 tests): 完整流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-0.1

# 或分別執行
npm test -- task-0.1-verification.test.ts
npm test -- task-0.1-runner.test.ts
npm test -- task-0.1-full-flow.test.ts
```

### 通過標準

- ✅ 所有 12 個測試通過 (4 + 5 + 3)
- ✅ 沒有 TypeScript 編譯錯誤
- ✅ `npm run verify:basic` 可以執行並產生報告
- ✅ 報告檔案存在於 `test-data/results/latest/`

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (4 tests)

測試檔案: `tests/acceptance/basic/task-0.1-verification.test.ts`

1. ✓ 專案已初始化 (package.json, tsconfig.json, jest.config.js 存在)
2. ✓ 必要套件已安裝 (typescript, jest, ts-jest)
3. ✓ 測試資料夾結構完整 (5 個必要目錄)
4. ✓ TypeScript 可以編譯 (npx tsc --noEmit 無錯誤)

### Functional Acceptance (5 tests)

測試檔案: `tests/acceptance/feature/task-0.1-runner.test.ts`

1. ✓ TestRunner 可以執行測試
2. ✓ TestRunner 可以捕捉失敗
3. ✓ ReportGenerator 可以產生 JSON 報告
4. ✓ ReportGenerator 可以儲存報告
5. ✓ npm run verify:basic 可以執行

### E2E Acceptance (3 tests)

測試檔案: `tests/acceptance/e2e/task-0.1-full-flow.test.ts`

1. ✓ 完整驗收流程可以執行
2. ✓ 測試報告檔案已產生 (JSON + TXT)
3. ✓ 測試報告內容正確

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 檔案結構
- [ ] `package.json` 已建立且包含正確的 scripts
- [ ] `tsconfig.json` 已建立
- [ ] `jest.config.js` 已建立
- [ ] `tests/utils/types.ts` 已建立
- [ ] `tests/utils/test-runner.ts` 已建立
- [ ] `tests/utils/report-generator.ts` 已建立
- [ ] `tests/acceptance/basic/run.ts` 已建立
- [ ] `tests/acceptance/basic/task-0.1-verification.test.ts` 已建立
- [ ] `tests/acceptance/feature/task-0.1-runner.test.ts` 已建立
- [ ] `tests/acceptance/e2e/task-0.1-full-flow.test.ts` 已建立
- [ ] 測試資料夾結構完整

### 功能驗證
- [ ] `npm run verify:basic` 可以執行
- [ ] 測試報告會自動產生在 `test-data/results/latest/`
- [ ] 報告包含 JSON 與文字兩種格式
- [ ] TypeScript 編譯無錯誤 (`npx tsc --noEmit`)

### 測試驗收
- [ ] Basic Verification 測試通過 (4/4)
- [ ] Functional Acceptance 測試通過 (5/5)
- [ ] E2E Acceptance 測試通過 (3/3)
- [ ] **總計: 12/12 測試通過**

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `Cannot find module 'typescript'` | 套件沒安裝 | `npm install` |
| `ENOENT: no such file` | 檔案不存在 | 檢查檔案路徑與名稱 |
| `EACCES: permission denied` | 權限不足 | 不要用 `sudo npm` |
| `SyntaxError: Unexpected token` | 語法錯誤 | 檢查程式碼是否有打錯字 |
| `npm ERR! missing script` | script 未定義 | 檢查 package.json |

---

### 問題 1: TypeScript 編譯錯誤

**錯誤訊息:**
```
error TS2307: Cannot find module 'xxx'
```

**解決方案:**
```bash
# 確認套件已安裝
npm install

# 如果還是有問題,清除並重新安裝
rm -rf node_modules package-lock.json
npm install
```

---

### 問題 2: ts-node 執行錯誤

**錯誤訊息:**
```
Cannot find module 'typescript'
```

**解決方案:**
```bash
# 確認 typescript 已安裝為 devDependencies
npm install --save-dev typescript ts-node
```

---

### 問題 3: 測試報告資料夾不存在

**錯誤訊息:**
```
ENOENT: no such file or directory, mkdir 'test-data/results'
```

**解決方案:**

報告產生器已經使用 `recursive: true`,應該會自動建立。如果還是有問題,手動建立:

```bash
mkdir -p test-data/results/latest
```

---

### 問題 4: npm scripts 無法執行

**錯誤訊息:**
```
npm ERR! missing script: verify:basic
```

**解決方案:**

1. 確認 `package.json` 的 scripts 區塊正確
2. 執行 `npm run` 查看所有可用的 scripts

```bash
npm run
# 應該會列出所有可用的 scripts
```

---

### 問題 5: Jest 找不到測試檔案

**錯誤訊息:**
```
No tests found
```

**解決方案:**

檢查 `jest.config.js` 的 `testMatch` 設定:

```javascript
testMatch: ['**/*.test.ts']  // 確認是 .test.ts 結尾
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **TypeScript 官方文件**: https://www.typescriptlang.org/docs/
- **Jest 測試框架**: https://jestjs.io/docs/getting-started
- **Node.js 檔案系統**: https://nodejs.org/api/fs.html
- **npm scripts**: https://docs.npmjs.com/cli/v9/using-npm/scripts

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (12/12)
3. ✅ 完成檢查清單都勾選
4. ✅ 可以執行 `npm run verify:basic` 並看到測試報告

### 最終驗收指令

```bash
# 執行所有驗收測試
npm run verify:task task-0.1

# 如果全部通過,你應該看到:
# PASS tests/acceptance/basic/task-0.1-verification.test.ts
# PASS tests/acceptance/feature/task-0.1-runner.test.ts
# PASS tests/acceptance/e2e/task-0.1-full-flow.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       12 passed, 12 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 0.1 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 遇到的主要問題與解決方法
- 學到的新知識
- 可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: 繼續 Task 0.2 - 建立環境檢查測試
