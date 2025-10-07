import { execSync } from 'child_process';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

describe('Task 0.2: Full Environment Setup - E2E', () => {
  test('.env 檔案存在', () => {
    expect(fs.existsSync('.env')).toBe(true);
  });

  test('環境檢查測試可以通過', () => {
    const output = execSync('npm run verify:env', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    expect(output).toContain('測試套件: Environment Check');
    expect(output).toContain('✓ 通過: 3');
  });

  test('所有必要服務的 API Key 都已設定', () => {
    const requiredKeys = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'OPENAI_API_KEY',
      'GEMINI_API_KEY',
      'GCP_PROJECT_ID',
    ];

    for (const key of requiredKeys) {
      expect(process.env[key]).toBeDefined();
      expect(process.env[key]).not.toBe('');
    }
  });

  test('GCP Service Account JSON 可以正確解析', () => {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    expect(credPath).toBeDefined();

    const content = fs.readFileSync(credPath!, 'utf-8');
    const json = JSON.parse(content);

    expect(json).toHaveProperty('type');
    expect(json).toHaveProperty('project_id');
    expect(json).toHaveProperty('private_key');
  });
});
