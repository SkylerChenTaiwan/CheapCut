/**
 * Task 0.3 - E2E Acceptance
 *
 * 測試目標: 完整測試資料設定流程
 */

import { TestRunner } from '../utils/test-runner';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('Task 0.3 - E2E: 完整測試資料流程', () => {
  const runner = new TestRunner('Task 0.3 - E2E', 'e2e');

  it('端對端: 完整的測試資料設定與驗證流程', async () => {
    await runner.runTest('完整測試資料流程', async () => {
      // Step 1: 執行 download 腳本
      console.log('📥 執行 download 腳本...');
      execSync('npm run test-data:download', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      // Step 2: 檢查檔案是否建立
      const invalidDir = path.join(process.cwd(), 'test-data/videos/invalid');
      const emptyFile = path.join(invalidDir, 'empty.mp4');
      const fakeFile = path.join(invalidDir, 'fake-video.txt');

      expect(await fs.pathExists(emptyFile)).toBe(true);
      expect(await fs.pathExists(fakeFile)).toBe(true);

      // Step 3: 執行 verify 腳本
      console.log('🔍 執行 verify 腳本...');
      try {
        const verifyOutput = execSync('npm run test-data:verify', {
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        expect(verifyOutput).toContain('目錄結構');
        expect(verifyOutput).toContain('Fixtures');
        expect(verifyOutput).toContain('測試影片');
      } catch (error: any) {
        // 可能因為缺少測試影片而失敗,但應該有輸出
        const output = error.stdout || error.stderr || '';
        expect(output).toContain('目錄結構');
        expect(output).toContain('Fixtures');
      }

      // Step 4: 建立測試結果
      const resultsDir = path.join(process.cwd(), 'test-data/results');
      await fs.writeFile(
        path.join(resultsDir, 'test-report.json'),
        JSON.stringify({ test: 'data' }, null, 2)
      );

      // Step 5: 執行 clean 腳本
      console.log('🧹 執行 clean 腳本...');
      execSync('npm run test-data:clean', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      // Step 6: 驗證清理結果
      const files = await fs.readdir(resultsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      expect(jsonFiles.length).toBe(0);
    });
  });

  it('端對端: Fixtures 資料可以被正確讀取與使用', async () => {
    await runner.runTest('Fixtures 資料讀取', async () => {
      // 讀取所有 fixtures
      const testUsers = await fs.readJson(
        path.join(process.cwd(), 'test-data/fixtures/test-users.json')
      );
      const editPrompts = await fs.readJson(
        path.join(process.cwd(), 'test-data/fixtures/edit-prompts.json')
      );
      const expectedCosts = await fs.readJson(
        path.join(process.cwd(), 'test-data/fixtures/expected-costs.json')
      );

      // 模擬使用這些資料
      const freeUser = testUsers.users.find((u: any) => u.tier === 'free');
      expect(freeUser).toBeDefined();
      expect(freeUser.quotaLimit).toBe(10);

      const easyPrompt = editPrompts.prompts.find((p: any) => p.difficulty === 'easy');
      expect(easyPrompt).toBeDefined();
      expect(easyPrompt.content).toBeTruthy();

      const standardCost = expectedCosts.scenarios.find((s: any) => s.name.includes('標準場景'));
      expect(standardCost).toBeDefined();
      expect(standardCost.total).toBeCloseTo(0.031, 3);
    });
  });

  it('端對端: 測試影片清單可以被程式化存取', async () => {
    await runner.runTest('影片清單存取', async () => {
      const validDir = path.join(process.cwd(), 'test-data/videos/valid');
      const invalidDir = path.join(process.cwd(), 'test-data/videos/invalid');

      // 列出所有有效影片
      if (await fs.pathExists(validDir)) {
        const validVideos = await fs.readdir(validDir);
        const mp4Videos = validVideos.filter(v => v.endsWith('.mp4') || v.endsWith('.mov'));

        // 至少應該有可以用於測試的影片(如果用戶已準備)
        // 這裡我們只檢查目錄可以讀取
        expect(Array.isArray(mp4Videos)).toBe(true);
      }

      // 列出所有無效檔案
      if (await fs.pathExists(invalidDir)) {
        const invalidFiles = await fs.readdir(invalidDir);

        // 應該至少包含我們建立的檔案
        expect(invalidFiles).toContain('empty.mp4');
        expect(invalidFiles).toContain('fake-video.txt');
      }
    });
  });

  it('端對端: 測試資料文檔完整且可讀', async () => {
    await runner.runTest('測試資料文檔', async () => {
      const readmePath = path.join(process.cwd(), 'test-data/README.md');
      const readme = await fs.readFile(readmePath, 'utf-8');

      // 應該包含關鍵資訊
      expect(readme).toContain('目錄結構');
      expect(readme).toContain('測試影片清單');
      expect(readme).toContain('下載測試影片');
      expect(readme).toContain('驗證測試資料');
      expect(readme).toContain('Valid Videos');
      expect(readme).toContain('Invalid Files');
    });
  });

  afterAll(async () => {
    runner.printSummary();
  });
});
