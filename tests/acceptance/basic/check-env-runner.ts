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
