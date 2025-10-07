/**
 * 測試資料驗證腳本
 *
 * 檢查所有測試資料是否完整且符合規格
 *
 * 為什麼需要驗證腳本?
 * - 確保所有開發者的測試環境一致
 * - 在執行測試前先檢查資料是否準備好
 * - 產生易讀的報告,快速找出缺少的檔案
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileTypeFromFile } from 'file-type';

/**
 * 驗證結果的型別定義
 *
 * 為什麼這樣設計?
 * - category: 將檢查項目分組(目錄、Fixtures、影片)
 * - checks: 每組內的詳細檢查項目
 * - passed: 布林值,方便統計通過率
 */
interface ValidationResult {
  category: string;
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
  }>;
}

/**
 * 測試資料驗證器
 *
 * 為什麼用 class?
 * - 可以將驗證結果儲存在 instance 中
 * - 方便在不同方法間共享 results 陣列
 * - 符合物件導向的設計原則
 */
class TestDataValidator {
  private results: ValidationResult[] = [];

  /**
   * 主要驗證函式
   *
   * 執行順序:
   * 1. 驗證目錄結構
   * 2. 驗證 Fixtures
   * 3. 驗證測試影片
   * 4. 顯示結果
   */
  async validate(): Promise<boolean> {
    console.log('🔍 開始驗證測試資料...\n');

    await this.validateDirectoryStructure();
    await this.validateFixtures();
    await this.validateVideos();

    this.printResults();

    // 只有所有檢查都通過才回傳 true
    return this.results.every(result =>
      result.checks.every(check => check.passed)
    );
  }

  /**
   * 驗證目錄結構
   *
   * 檢查所有必要的目錄是否存在
   */
  private async validateDirectoryStructure(): Promise<void> {
    const result: ValidationResult = {
      category: '目錄結構',
      checks: [],
    };

    const requiredDirs = [
      'videos/valid',
      'videos/invalid',
      'audio',
      'fixtures',
      'results',
      'scripts',
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(__dirname, '..', dir);
      const exists = await fs.pathExists(dirPath);
      result.checks.push({
        name: dir,
        passed: exists,
        message: exists ? '目錄存在' : '目錄缺少',
      });
    }

    this.results.push(result);
  }

  /**
   * 驗證 Fixtures
   *
   * 檢查項目:
   * 1. 檔案是否存在
   * 2. JSON 格式是否正確
   * 3. 必要欄位是否完整
   */
  private async validateFixtures(): Promise<void> {
    const result: ValidationResult = {
      category: 'Fixtures',
      checks: [],
    };

    const fixtures = [
      'test-users.json',
      'edit-prompts.json',
      'expected-costs.json',
    ];

    for (const fixture of fixtures) {
      const filepath = path.join(__dirname, '../fixtures', fixture);

      // 檢查檔案是否存在
      if (!(await fs.pathExists(filepath))) {
        result.checks.push({
          name: fixture,
          passed: false,
          message: '檔案不存在',
        });
        continue;
      }

      try {
        const content = await fs.readJson(filepath);

        // 根據不同檔案做基本驗證
        if (fixture === 'test-users.json') {
          // 應該包含 users 陣列,至少 3 個用戶
          const valid = content.users && Array.isArray(content.users) && content.users.length >= 3;
          result.checks.push({
            name: fixture,
            passed: valid,
            message: valid ? `包含 ${content.users.length} 個測試用戶` : '格式不正確',
          });
        } else if (fixture === 'edit-prompts.json') {
          // 應該包含 prompts 陣列,至少 5 個提示詞
          const valid = content.prompts && Array.isArray(content.prompts) && content.prompts.length >= 5;
          result.checks.push({
            name: fixture,
            passed: valid,
            message: valid ? `包含 ${content.prompts.length} 個提示詞` : '格式不正確',
          });
        } else if (fixture === 'expected-costs.json') {
          // 應該包含 apiCosts 和 scenarios
          const valid = content.apiCosts && content.scenarios;
          result.checks.push({
            name: fixture,
            passed: valid,
            message: valid ? '成本資料完整' : '格式不正確',
          });
        }
      } catch (error: any) {
        result.checks.push({
          name: fixture,
          passed: false,
          message: `JSON 解析錯誤: ${error.message}`,
        });
      }
    }

    this.results.push(result);
  }

  /**
   * 驗證測試影片
   *
   * 檢查項目:
   * 1. 有效影片是否存在且非空
   * 2. 檔案類型是否為真正的影片 (用 file-type 檢查)
   * 3. 無效檔案是否已建立
   */
  private async validateVideos(): Promise<void> {
    const result: ValidationResult = {
      category: '測試影片',
      checks: [],
    };

    // 檢查有效影片
    const validDir = path.join(__dirname, '../videos/valid');
    const validVideos = ['short-clip.mp4', 'medium-cooking.mp4', 'long-nature.mp4', 'high-res-4k.mp4', 'mov-format.mov'];

    for (const video of validVideos) {
      const filepath = path.join(validDir, video);

      if (!(await fs.pathExists(filepath))) {
        result.checks.push({
          name: `valid/${video}`,
          passed: false,
          message: '檔案不存在',
        });
        continue;
      }

      const stats = await fs.stat(filepath);
      if (stats.size === 0) {
        result.checks.push({
          name: `valid/${video}`,
          passed: false,
          message: '檔案是空的',
        });
        continue;
      }

      // 用 file-type 檢查真實格式
      // 為什麼不只看副檔名? 因為使用者可能把 .txt 改名成 .mp4
      const fileType = await fileTypeFromFile(filepath);
      const isVideo = !!(fileType && fileType.mime.startsWith('video/'));

      result.checks.push({
        name: `valid/${video}`,
        passed: isVideo,
        message: isVideo
          ? `${(stats.size / 1024 / 1024).toFixed(2)} MB, ${fileType!.mime}`
          : '不是有效的影片檔案',
      });
    }

    // 檢查無效檔案
    const invalidDir = path.join(__dirname, '../videos/invalid');
    const invalidFiles = ['corrupted.mp4', 'empty.mp4', 'fake-video.txt'];

    for (const file of invalidFiles) {
      const filepath = path.join(invalidDir, file);
      const exists = await fs.pathExists(filepath);

      result.checks.push({
        name: `invalid/${file}`,
        passed: exists,
        message: exists ? '已建立' : '檔案不存在',
      });
    }

    this.results.push(result);
  }

  /**
   * 顯示驗證結果
   *
   * 為什麼用這種格式?
   * - 分類顯示,容易閱讀
   * - 用 ✅/❌ 圖示快速辨識
   * - 最後顯示總結
   */
  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 驗證結果');
    console.log('='.repeat(60) + '\n');

    for (const result of this.results) {
      console.log(`【${result.category}】`);
      for (const check of result.checks) {
        const icon = check.passed ? '✅' : '❌';
        console.log(`  ${icon} ${check.name}: ${check.message}`);
      }
      console.log('');
    }

    const allPassed = this.results.every(result =>
      result.checks.every(check => check.passed)
    );

    if (allPassed) {
      console.log('🎉 所有測試資料驗證通過!');
    } else {
      console.log('⚠️  部分測試資料缺少或不正確,請檢查上面的錯誤訊息。');
    }
    console.log('='.repeat(60));
  }
}

// 執行驗證
const validator = new TestDataValidator();
validator.validate().then(success => {
  // 根據驗證結果設定 exit code
  // 為什麼? 讓這個腳本可以用在 CI/CD 流程中
  process.exit(success ? 0 : 1);
});
