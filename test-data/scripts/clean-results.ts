/**
 * 清理測試結果腳本
 *
 * 為什麼需要這個?
 * - 測試報告會累積在 results/ 目錄
 * - 定期清理避免佔用太多空間
 */

import fs from 'fs-extra';
import path from 'path';

async function cleanResults(): Promise<void> {
  const resultsDir = path.join(__dirname, '../results');

  console.log('🧹 清理測試結果...');

  if (await fs.pathExists(resultsDir)) {
    const files = await fs.readdir(resultsDir);

    // 只刪除測試報告檔案 (.json 和 .html)
    // 為什麼? 避免誤刪其他重要檔案
    for (const file of files) {
      if (file.endsWith('.json') || file.endsWith('.html')) {
        await fs.remove(path.join(resultsDir, file));
        console.log(`  ✓ 已刪除: ${file}`);
      }
    }
  }

  console.log('✅ 清理完成!');
}

cleanResults().catch(console.error);
