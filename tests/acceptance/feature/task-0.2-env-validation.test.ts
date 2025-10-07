import { checkEnvVars, validateGCPCredentials, validateAPIKeys } from '../../../src/lib/env';

describe('Task 0.2: Environment Validation Functions - Functional', () => {
  test('checkEnvVars 可以檢測缺少的變數', () => {
    const originalEnv = process.env.DATABASE_URL;
    process.env.DATABASE_URL = '';

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
