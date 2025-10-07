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
