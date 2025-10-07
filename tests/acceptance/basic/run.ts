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
