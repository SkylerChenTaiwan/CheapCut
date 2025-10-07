/**
 * Task 0.3 - Functional Acceptance
 *
 * 測試目標: 驗證 fixtures 內容與腳本功能
 */

import { TestRunner } from '../utils/test-runner';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('Task 0.3 - Functional: Fixtures 與腳本功能', () => {
  const runner = new TestRunner('Task 0.3 - Functional', 'feature');

  describe('Fixtures 驗證', () => {
    it('test-users.json 格式正確且包含必要資料', async () => {
      await runner.runTest('test-users.json 驗證', async () => {
        const filepath = path.join(process.cwd(), 'test-data/fixtures/test-users.json');
        const data = await fs.readJson(filepath);

        expect(data.users).toBeDefined();
        expect(Array.isArray(data.users)).toBe(true);
        expect(data.users.length).toBeGreaterThanOrEqual(3);

        // 檢查第一個用戶的必要欄位
        const user = data.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('tier');
        expect(user).toHaveProperty('quotaUsed');
        expect(user).toHaveProperty('quotaLimit');

        // 檢查管理員資料
        expect(data.adminUser).toBeDefined();
        expect(data.adminUser.role).toBe('admin');
      });
    });

    it('edit-prompts.json 格式正確且包含多種風格', async () => {
      await runner.runTest('edit-prompts.json 驗證', async () => {
        const filepath = path.join(process.cwd(), 'test-data/fixtures/edit-prompts.json');
        const data = await fs.readJson(filepath);

        expect(data.prompts).toBeDefined();
        expect(Array.isArray(data.prompts)).toBe(true);
        expect(data.prompts.length).toBeGreaterThanOrEqual(5);

        // 檢查提示詞結構
        const prompt = data.prompts[0];
        expect(prompt).toHaveProperty('id');
        expect(prompt).toHaveProperty('name');
        expect(prompt).toHaveProperty('content');
        expect(prompt).toHaveProperty('tags');
        expect(prompt).toHaveProperty('difficulty');

        // 檢查是否涵蓋不同難度
        const difficulties = data.prompts.map((p: any) => p.difficulty);
        expect(difficulties).toContain('easy');
        expect(difficulties).toContain('medium');
      });
    });

    it('expected-costs.json 包含完整成本資料', async () => {
      await runner.runTest('expected-costs.json 驗證', async () => {
        const filepath = path.join(process.cwd(), 'test-data/fixtures/expected-costs.json');
        const data = await fs.readJson(filepath);

        expect(data.apiCosts).toBeDefined();
        expect(data.scenarios).toBeDefined();

        // 檢查 API 成本
        expect(data.apiCosts.googleVideoAI).toBeDefined();
        expect(data.apiCosts.openaiWhisper).toBeDefined();
        expect(data.apiCosts.geminiFlash).toBeDefined();

        // 檢查場景
        expect(Array.isArray(data.scenarios)).toBe(true);
        const standardScenario = data.scenarios.find((s: any) => s.name.includes('標準場景'));
        expect(standardScenario).toBeDefined();
        expect(standardScenario.total).toBeCloseTo(0.031, 3);
      });
    });
  });

  describe('腳本功能驗證', () => {
    it('download-videos.ts 可以執行', async () => {
      await runner.runTest('download 腳本執行', async () => {
        const scriptPath = path.join(process.cwd(), 'test-data/scripts/download-videos.ts');

        // 應該可以執行而不報錯(即使沒有實際下載)
        expect(() => {
          execSync(`ts-node ${scriptPath}`, { encoding: 'utf-8', stdio: 'pipe' });
        }).not.toThrow();
      });
    });

    it('verify-data.ts 可以執行並產生報告', async () => {
      await runner.runTest('verify 腳本執行', async () => {
        const scriptPath = path.join(process.cwd(), 'test-data/scripts/verify-data.ts');

        try {
          const output = execSync(`ts-node ${scriptPath}`, {
            encoding: 'utf-8',
            stdio: 'pipe'
          });
          expect(output).toContain('驗證結果');
        } catch (error: any) {
          // 腳本可能因為缺少測試影片而失敗,但應該有輸出
          expect(error.stdout || error.stderr).toContain('驗證結果');
        }
      });
    });

    it('clean-results.ts 可以清理結果目錄', async () => {
      await runner.runTest('clean 腳本執行', async () => {
        // 先建立假結果檔案
        const resultsDir = path.join(process.cwd(), 'test-data/results');
        await fs.ensureDir(resultsDir);
        await fs.writeFile(path.join(resultsDir, 'test-result.json'), '{}');

        const scriptPath = path.join(process.cwd(), 'test-data/scripts/clean-results.ts');
        execSync(`ts-node ${scriptPath}`, { encoding: 'utf-8', stdio: 'pipe' });

        const files = await fs.readdir(resultsDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        expect(jsonFiles.length).toBe(0);
      });
    });
  });

  describe('package.json 腳本', () => {
    it('npm scripts 已正確設定', async () => {
      await runner.runTest('npm scripts 設定', async () => {
        const pkgPath = path.join(process.cwd(), 'package.json');
        const pkg = await fs.readJson(pkgPath);

        expect(pkg.scripts['test-data:download']).toBeDefined();
        expect(pkg.scripts['test-data:verify']).toBeDefined();
        expect(pkg.scripts['test-data:clean']).toBeDefined();
      });
    });
  });

  afterAll(async () => {
    runner.printSummary();
  });
});
