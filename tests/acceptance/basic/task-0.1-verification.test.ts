import * as fs from 'fs';
import { execSync } from 'child_process';

describe('Task 0.1: Verification CLI Framework - Basic', () => {
  test('專案已初始化', () => {
    expect(fs.existsSync('package.json')).toBe(true);
    expect(fs.existsSync('tsconfig.json')).toBe(true);
    expect(fs.existsSync('jest.config.js')).toBe(true);
  });

  test('必要套件已安裝', () => {
    const packageJson = require('../../../package.json');

    expect(packageJson.devDependencies).toHaveProperty('typescript');
    expect(packageJson.devDependencies).toHaveProperty('jest');
    expect(packageJson.devDependencies).toHaveProperty('ts-jest');
  });

  test('測試資料夾結構完整', () => {
    const dirs = [
      'tests/acceptance/basic',
      'tests/acceptance/feature',
      'tests/acceptance/e2e',
      'tests/acceptance/cost',
      'tests/utils'
    ];

    for (const dir of dirs) {
      expect(fs.existsSync(dir)).toBe(true);
    }
  });

  test('TypeScript 可以編譯', () => {
    expect(() => {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
    }).not.toThrow();
  });
});
