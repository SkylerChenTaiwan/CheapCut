# Task 0.1: 建立驗收 CLI 框架

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 0.1 |
| **Task 名稱** | 建立驗收 CLI 框架 |
| **所屬 Phase** | Phase 0: 測試環境建立 |
| **預估時間** | 3-4 小時 |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | 無 (第一個 task) |

## 🎯 功能描述

建立一個基礎的驗收測試 CLI 工具,提供統一的測試執行與報告產生機制。這個框架將會被後續所有的 task 使用。

**為什麼需要這個?**
- 提供統一的測試執行方式
- 自動產生測試報告
- 讓每個 task 都能被自動驗收

**完成後你會有:**
- 可以執行測試的 CLI 工具
- 測試結果記錄機制
- 基礎的測試報告產生功能

## 📚 前置知識

你需要了解以下概念 (不懂也沒關係,按照步驟做就行):

- **Node.js**: JavaScript 執行環境
- **npm**: Node.js 套件管理工具
- **TypeScript**: JavaScript 的超集,提供型別檢查
- **Jest**: JavaScript 測試框架

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

**執行完成後檢查:**
- [ ] `package.json` 檔案已建立
- [ ] `node_modules/` 資料夾已建立
- [ ] 可以看到安裝的套件

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

**檢查設定:**
```bash
# 測試 TypeScript 編譯
npx tsc --noEmit
# 應該沒有錯誤訊息
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

**確認結構:**
```
.
├── src/
│   ├── lib/
│   └── services/
├── tests/
│   ├── acceptance/
│   │   ├── basic/
│   │   ├── feature/
│   │   ├── e2e/
│   │   └── cost/
│   └── utils/
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

### 步驟 5: 建立測試結果資料結構

建立 `tests/utils/types.ts`:

```typescript
/**
 * 測試結果的型別定義
 */

export type TestStatus = 'passed' | 'failed' | 'skipped';

export type TestLevel = 'basic' | 'feature' | 'e2e' | 'cost';

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
   */
  async runTest(
    testName: string,
    testFn: () => Promise<void>,
    metadata?: Record<string, any>
  ): Promise<TestResult> {
    const start = Date.now();

    try {
      await testFn();

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
   * 印出測試結果摘要
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

    report.suites.forEach(suite => {
      const icon = suite.failed === 0 ? '✓' : '✗';
      text += `${icon} ${suite.suiteName} (${suite.level})\n`;
      text += `  測試數: ${suite.totalTests}, 通過: ${suite.passed}, 失敗: ${suite.failed}\n`;
      text += `  耗時: ${suite.duration}ms\n`;

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
   */
  private generateReportId(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }
}
```

---

### 步驟 8: 建立 npm scripts

修改 `package.json`,加入以下 scripts:

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
    "verify": "ts-node tests/verify-task.ts"
  }
}
```

---

### 步驟 9: 建立簡單的測試範例

建立 `tests/acceptance/basic/run.ts`:

```typescript
import { TestRunner } from '../../utils/test-runner';
import { ReportGenerator } from '../../utils/report-generator';

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

  // 印出結果
  runner.printSummary();

  // 產生報告
  const suiteResult = runner.getSuiteResult();
  const report = reportGen.generateReport([suiteResult]);

  // 儲存報告
  const outputDir = 'test-data/results/latest';
  await reportGen.saveJSON(report, outputDir);
  await reportGen.saveTextReport(report, outputDir);

  console.log(`\n報告已儲存到: ${outputDir}`);

  // 如果有失敗,exit code 為 1
  if (suiteResult.failed > 0) {
    process.exit(1);
  }
}

runBasicVerification().catch(error => {
  console.error('執行測試時發生錯誤:', error);
  process.exit(1);
});
```

---

### 步驟 10: 測試執行

執行基礎驗證測試:

```bash
npm run verify:basic
```

**預期輸出:**
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

---

## ✅ 驗收標準

### Level 1: Basic Verification (基礎驗證)

**目標**: 確認框架本身可以運作

執行以下測試:

```typescript
// tests/acceptance/basic/task-0.1-verification.test.ts

describe('Task 0.1: Verification CLI Framework', () => {
  test('專案已初始化', () => {
    const fs = require('fs');
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
    const fs = require('fs');
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

  test('TypeScript 可以編譯', async () => {
    const { execSync } = require('child_process');

    expect(() => {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
    }).not.toThrow();
  });
});
```

**執行驗收:**
```bash
npm test -- task-0.1-verification.test.ts
```

**通過標準:**
- [ ] 所有 4 個測試都通過
- [ ] 沒有 TypeScript 編譯錯誤

---

### Level 2: Functional Acceptance (功能驗收)

**目標**: 確認測試執行器與報告產生器正常運作

```typescript
// tests/acceptance/feature/task-0.1-runner.test.ts

import { TestRunner } from '../../utils/test-runner';
import { ReportGenerator } from '../../utils/report-generator';
import * as fs from 'fs';

describe('Task 0.1: Test Runner & Report Generator', () => {
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
    const { execSync } = require('child_process');

    expect(() => {
      execSync('npm run verify:basic', { stdio: 'pipe' });
    }).not.toThrow();
  });
});
```

**執行驗收:**
```bash
npm test -- task-0.1-runner.test.ts
```

**通過標準:**
- [ ] 所有 5 個測試都通過
- [ ] 報告檔案正確產生
- [ ] `npm run verify:basic` 可以執行

---

### Level 3: E2E Acceptance (端對端驗收)

**目標**: 確認完整的測試流程可以運作

```typescript
// tests/acceptance/e2e/task-0.1-full-flow.test.ts

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Task 0.1: Full Verification Flow', () => {
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

  test('失敗的測試會返回 exit code 1', () => {
    // 這個測試需要一個會失敗的測試腳本
    // 暫時跳過
  });
});
```

**執行驗收:**
```bash
npm test -- task-0.1-full-flow.test.ts
```

**通過標準:**
- [ ] 所有測試通過
- [ ] 報告檔案正確產生且內容完整
- [ ] 可以查看 JSON 與文字報告

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
- [ ] 測試資料夾結構完整

### 功能驗證
- [ ] `npm run verify:basic` 可以執行
- [ ] 測試報告會自動產生在 `test-data/results/latest/`
- [ ] 報告包含 JSON 與文字兩種格式
- [ ] 所有三層驗收測試都通過

### 測試驗收
- [ ] Basic Verification 測試通過 (4/4)
- [ ] Functional Acceptance 測試通過 (5/5)
- [ ] E2E Acceptance 測試通過 (3/3)

---

## 🐛 常見問題與解決方案

### 問題 1: TypeScript 編譯錯誤

**錯誤訊息:**
```
error TS2307: Cannot find module 'xxx'
```

**解決方案:**
```bash
# 確認套件已安裝
npm install

# 清除並重新安裝
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
- 報告產生器已經使用 `recursive: true`,應該會自動建立
- 如果還是有問題,手動建立:
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
- 確認 `package.json` 的 scripts 區塊正確
- 執行 `npm run` 查看所有可用的 scripts

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **TypeScript 官方文件**: https://www.typescriptlang.org/docs/
- **Jest 測試框架**: https://jestjs.io/docs/getting-started
- **Node.js 檔案系統**: https://nodejs.org/api/fs.html

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過
3. ✅ 完成檢查清單都勾選
4. ✅ 可以執行 `npm run verify:basic` 並看到測試報告

**最終驗收指令:**
```bash
# 執行所有驗收測試
npm test -- task-0.1

# 如果全部通過,代表 Task 0.1 完成!
```

---

**Task 完成時間記錄**: ___________

**遇到的問題**: ___________

**筆記**: ___________
