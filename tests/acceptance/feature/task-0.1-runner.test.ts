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
    expect(result.duration).toBeGreaterThanOrEqual(0);
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
