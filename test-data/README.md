# CheapCut 測試資料

## 目錄結構

```
test-data/
├── videos/
│   ├── valid/          # 5 個有效的測試影片
│   └── invalid/        # 4 個無效的測試檔案
├── audio/              # 測試用配音檔案
├── fixtures/           # 固定的測試資料(JSON)
│   ├── test-users.json
│   ├── edit-prompts.json
│   └── expected-costs.json
├── results/            # 測試報告輸出目錄
├── scripts/            # 測試資料管理腳本
│   ├── download-videos.ts
│   ├── verify-data.ts
│   └── clean-results.ts
└── README.md           # 本文件
```

## 測試影片清單

### Valid Videos (5 個)

| 檔案名稱 | 格式 | 解析度 | 長度 | 用途 |
|---------|------|--------|------|------|
| `short-clip.mp4` | MP4 | 720p | 5秒 | 短片測試 |
| `medium-cooking.mp4` | MP4 | 1080p | 30秒 | 料理影片場景 |
| `long-nature.mp4` | MP4 | 1080p | 2分鐘 | 長片測試、多場景 |
| `high-res-4k.mp4` | MP4 | 4K | 10秒 | 高解析度測試 |
| `mov-format.mov` | MOV | 1080p | 15秒 | 格式相容性測試 |

### Invalid Files (4 個)

| 檔案名稱 | 問題 | 用途 |
|---------|------|------|
| `corrupted.mp4` | 損壞的影片檔 | 錯誤處理測試 |
| `empty.mp4` | 0 bytes 空檔案 | 邊界測試 |
| `fake-video.txt` | 文字檔偽裝成影片 | 格式驗證測試 |
| `oversized-dummy.mp4` | 超過 2GB(模擬) | 大小限制測試 |

## 下載測試影片

由於影片檔案過大,我們不將其加入 Git。請執行以下指令準備測試影片:

```bash
npm run test-data:download
```

或手動執行:

```bash
ts-node test-data/scripts/download-videos.ts
```

## 驗證測試資料

```bash
npm run test-data:verify
```

## 清理測試結果

```bash
npm run test-data:clean
```

## 如何準備測試影片?

### 方法 1: 使用 FFmpeg 生成測試影片 (推薦)

```bash
# 生成 5 秒 720p 測試影片
ffmpeg -f lavfi -i testsrc=duration=5:size=1280x720:rate=30 \
  -pix_fmt yuv420p test-data/videos/valid/short-clip.mp4

# 生成 30 秒 1080p 測試影片
ffmpeg -f lavfi -i testsrc=duration=30:size=1920x1080:rate=30 \
  -pix_fmt yuv420p test-data/videos/valid/medium-cooking.mp4

# 生成 2 分鐘 1080p 測試影片
ffmpeg -f lavfi -i testsrc=duration=120:size=1920x1080:rate=30 \
  -pix_fmt yuv420p test-data/videos/valid/long-nature.mp4

# 生成 10 秒 4K 測試影片
ffmpeg -f lavfi -i testsrc=duration=10:size=3840x2160:rate=30 \
  -pix_fmt yuv420p test-data/videos/valid/high-res-4k.mp4

# 生成 15 秒 1080p MOV 格式
ffmpeg -f lavfi -i testsrc=duration=15:size=1920x1080:rate=30 \
  -pix_fmt yuv420p test-data/videos/valid/mov-format.mov
```

### 方法 2: 下載免費測試影片

- **Pexels**: https://www.pexels.com/videos/
- **Pixabay**: https://pixabay.com/videos/
- **Coverr**: https://coverr.co/

### 方法 3: 使用自己的影片

只要符合規格(格式、長度、解析度),任何影片都可以。
