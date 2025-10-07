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
