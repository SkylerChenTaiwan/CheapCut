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
