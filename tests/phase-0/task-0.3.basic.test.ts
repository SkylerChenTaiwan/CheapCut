/**
 * Task 0.3 - Basic Verification
 *
 * 測試目標: 確認目錄結構與基本檔案存在
 *
 * 為什麼分成 Basic / Functional / E2E?
 * - Basic: 快速檢查基礎設定 (幾秒鐘完成)
 * - Functional: 檢查功能正確性 (可能需要幾十秒)
 * - E2E: 完整流程測試 (可能需要幾分鐘)
 */

import { TestRunner } from '../utils/test-runner';
import fs from 'fs-extra';
import path from 'path';

describe('Task 0.3 - Basic: 測試資料目錄結構', () => {
  const runner = new TestRunner('Task 0.3 - Basic', 'basic');

  it('應該存在 test-data 根目錄', async () => {
    await runner.runTest('test-data 目錄存在', async () => {
      const testDataDir = path.join(process.cwd(), 'test-data');
      const exists = await fs.pathExists(testDataDir);
      expect(exists).toBe(true);
    });
  });

  it('應該存在所有必要的子目錄', async () => {
    await runner.runTest('子目錄完整', async () => {
      const requiredDirs = [
        'test-data/videos/valid',
        'test-data/videos/invalid',
        'test-data/audio',
        'test-data/fixtures',
        'test-data/results',
        'test-data/scripts',
      ];

      for (const dir of requiredDirs) {
        const dirPath = path.join(process.cwd(), dir);
        const exists = await fs.pathExists(dirPath);
        expect(exists).toBe(true);
      }
    });
  });

  it('應該存在 .gitignore 檔案', async () => {
    await runner.runTest('gitignore 存在', async () => {
      const gitignorePath = path.join(process.cwd(), 'test-data/.gitignore');
      const exists = await fs.pathExists(gitignorePath);
      expect(exists).toBe(true);

      // 檢查內容是否包含必要規則
      const content = await fs.readFile(gitignorePath, 'utf-8');
      expect(content).toContain('videos/**/*.mp4');
      expect(content).toContain('results/**/*.json');
    });
  });

  it('應該存在 README.md', async () => {
    await runner.runTest('README 存在', async () => {
      const readmePath = path.join(process.cwd(), 'test-data/README.md');
      const exists = await fs.pathExists(readmePath);
      expect(exists).toBe(true);
    });
  });

  it('應該存在所有必要的腳本', async () => {
    await runner.runTest('腳本檔案存在', async () => {
      const scripts = [
        'test-data/scripts/download-videos.ts',
        'test-data/scripts/verify-data.ts',
        'test-data/scripts/clean-results.ts',
      ];

      for (const script of scripts) {
        const scriptPath = path.join(process.cwd(), script);
        const exists = await fs.pathExists(scriptPath);
        expect(exists).toBe(true);
      }
    });
  });

  afterAll(async () => {
    runner.printSummary();
  });
});
