import * as fs from 'fs';

describe('Task 0.2: Environment Check Tests - Basic', () => {
  test('.env.example 檔案存在', () => {
    expect(fs.existsSync('.env.example')).toBe(true);
  });

  test('.gitignore 包含 .env', () => {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    expect(gitignore).toContain('.env');
  });

  test('環境變數型別定義檔案存在', () => {
    expect(fs.existsSync('src/types/env.d.ts')).toBe(true);
  });

  test('環境載入器檔案存在', () => {
    expect(fs.existsSync('src/lib/env.ts')).toBe(true);
  });

  test('dotenv 套件已安裝', () => {
    const packageJson = require('../../../package.json');
    expect(packageJson.dependencies).toHaveProperty('dotenv');
  });
});
