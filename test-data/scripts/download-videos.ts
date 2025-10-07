/**
 * 下載測試影片腳本
 *
 * 為什麼需要這個腳本?
 * - 測試影片太大,不適合放在 Git 中
 * - 這個腳本會指引開發者如何準備測試影片
 * - 自動建立無效檔案用於錯誤測試
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

/**
 * 測試影片規格
 *
 * 為什麼用 interface?
 * - 定義清楚的資料結構
 * - TypeScript 會在編譯時檢查型別
 */
interface VideoSpec {
  filename: string;
  url?: string; // 如果有公開 URL
  instructions?: string; // 手動準備說明
  size: string;
  duration: string;
}

/**
 * 有效測試影片清單
 *
 * 為什麼不直接下載?
 * - 免費的影片素材網站通常需要手動選擇
 * - 或者開發者可能想用自己的影片
 * - 所以這裡只提供規格說明,讓開發者自行準備
 */
const VALID_VIDEOS: VideoSpec[] = [
  {
    filename: 'short-clip.mp4',
    instructions: '請準備一個 5 秒的 720p MP4 影片 (或使用 FFmpeg 生成)',
    size: '~2MB',
    duration: '5s',
  },
  {
    filename: 'medium-cooking.mp4',
    instructions: '請準備一個 30 秒的料理影片 (1080p MP4)',
    size: '~10MB',
    duration: '30s',
  },
  {
    filename: 'long-nature.mp4',
    instructions: '請準備一個 2 分鐘的風景影片 (1080p MP4)',
    size: '~40MB',
    duration: '2m',
  },
  {
    filename: 'high-res-4k.mp4',
    instructions: '請準備一個 10 秒的 4K 影片',
    size: '~20MB',
    duration: '10s',
  },
  {
    filename: 'mov-format.mov',
    instructions: '請準備一個 15 秒的 MOV 格式影片 (1080p)',
    size: '~15MB',
    duration: '15s',
  },
];

/**
 * 無效檔案清單
 *
 * 為什麼需要故意建立損壞的檔案?
 * - 測試程式的錯誤處理能力
 * - 確保程式不會因為壞檔案而 crash
 */
const INVALID_FILES = [
  {
    filename: 'corrupted.mp4',
    instructions: '建立一個損壞的 MP4 檔案(假 header + 亂碼內容)',
  },
  {
    filename: 'empty.mp4',
    instructions: '建立一個 0 bytes 的空檔案',
  },
  {
    filename: 'fake-video.txt',
    instructions: '建立一個文字檔改名為 .txt(用於測試格式驗證)',
  },
  {
    filename: 'oversized-dummy.mp4',
    instructions: '不需實際建立 2GB 檔案,測試時會 mock 檔案大小',
  },
];

/**
 * 主要執行函式
 *
 * 流程:
 * 1. 建立必要目錄
 * 2. 檢查有效影片是否存在
 * 3. 自動建立無效檔案
 * 4. 顯示下一步指引
 */
async function setupTestVideos(): Promise<void> {
  console.log('📹 開始準備測試影片...\n');

  const validDir = path.join(__dirname, '../videos/valid');
  const invalidDir = path.join(__dirname, '../videos/invalid');

  // 確保目錄存在
  await fs.ensureDir(validDir);
  await fs.ensureDir(invalidDir);

  // 檢查 Valid Videos
  console.log('✅ Valid Videos:');
  for (const video of VALID_VIDEOS) {
    const filepath = path.join(validDir, video.filename);
    if (await fs.pathExists(filepath)) {
      console.log(`   ✓ ${video.filename} (已存在)`);
    } else {
      console.log(`   ✗ ${video.filename} (缺少)`);
      console.log(`     → ${video.instructions}`);
      console.log(`     → 預期大小: ${video.size}, 長度: ${video.duration}\n`);
    }
  }

  // 建立 Invalid Files
  console.log('\n❌ Invalid Files:');
  for (const file of INVALID_FILES) {
    const filepath = path.join(invalidDir, file.filename);

    if (file.filename === 'empty.mp4') {
      // 建立空檔案
      await fs.writeFile(filepath, '');
      console.log(`   ✓ ${file.filename} (已建立)`);
    } else if (file.filename === 'fake-video.txt') {
      // 建立假影片(其實是文字檔)
      await fs.writeFile(filepath, 'This is not a video file');
      console.log(`   ✓ ${file.filename} (已建立)`);
    } else if (file.filename === 'corrupted.mp4') {
      // 建立一個假的 MP4 header,後面接上亂碼
      // 為什麼這樣做? MP4 檔案必須以特定 header 開頭
      // 我們建立一個看起來像 MP4 但內容損壞的檔案
      const fakeHeader = Buffer.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
        0x69, 0x73, 0x6f, 0x6d, // "ftyp" + "isom"
      ]);
      await fs.writeFile(filepath, Buffer.concat([fakeHeader, Buffer.from('corrupted data')]));
      console.log(`   ✓ ${file.filename} (已建立)`);
    } else {
      console.log(`   - ${file.filename} (${file.instructions})`);
    }
  }

  // 顯示下一步指引
  console.log('\n' + '='.repeat(60));
  console.log('📝 下一步:');
  console.log('');
  console.log('1️⃣  準備有效影片 (三種方法任選):');
  console.log('   a) 用 FFmpeg 生成 (最快,參考 test-data/README.md)');
  console.log('   b) 從 Pexels/Pixabay 下載免費影片');
  console.log('   c) 使用你自己的影片');
  console.log('');
  console.log('2️⃣  完成後執行驗證:');
  console.log('   npm run test-data:verify');
  console.log('='.repeat(60));
}

// 執行主函式
setupTestVideos().catch(console.error);
