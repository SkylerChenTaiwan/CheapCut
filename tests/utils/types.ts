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
