# 測試資料準備指南

本資料夾包含所有用於驗收測試的測試資料。

## 📁 資料夾結構

```
test-data/
├── README.md              # 本文件
├── videos/                # 測試影片檔案
│   ├── valid/            # 有效的測試影片
│   └── invalid/          # 用於測試錯誤處理的無效檔案
├── fixtures/              # 測試用的固定資料
└── results/              # 測試結果保留區 (自動產生)
```

## 🎬 需要準備的測試影片

### 有效影片檔案 (放在 `videos/valid/`)

| 檔案名稱 | 影片長度 | 解析度 | 檔案大小 | 格式 | 用途 |
|---------|---------|--------|---------|------|------|
| `short-10s.mp4` | 10秒 | 1920x1080 | ~5MB | MP4/H.264 | 測試基本上傳與快速剪輯功能 |
| `medium-30s.mp4` | 30秒 | 1920x1080 | ~15MB | MP4/H.264 | 測試標準剪輯流程與成本計算 |
| `long-2m.mp4` | 2分鐘 | 1920x1080 | ~50MB | MP4/H.264 | 測試長影片處理與效能 |
| `vertical-15s.mp4` | 15秒 | 1080x1920 | ~8MB | MP4/H.264 | 測試直式影片 (手機拍攝格式) |
| `low-res-20s.mp4` | 20秒 | 1280x720 | ~10MB | MP4/H.264 | 測試低解析度影片處理 |

### 無效檔案 (放在 `videos/invalid/`)

| 檔案名稱 | 用途 |
|---------|------|
| `corrupted.mp4` | 測試損壞檔案的錯誤處理 |
| `wrong-format.avi` | 測試不支援格式的處理 |
| `too-large.mp4` | 測試檔案大小限制 (>500MB) |
| `not-a-video.txt` | 測試完全錯誤的檔案類型 |

## 📥 如何準備測試影片

### 推薦的免費影片素材網站

1. **Pexels Videos** - https://www.pexels.com/videos/
   - 完全免費,無需註冊
   - 可下載不同解析度
   - 推薦用於取得高品質測試素材

2. **Pixabay** - https://pixabay.com/videos/
   - 免費且無版權限制
   - 多種主題可選

3. **Coverr** - https://coverr.co/
   - 精選短影片素材
   - 適合取得 10-30 秒的短片

### 準備步驟

#### 1. 下載有效測試影片

```bash
# 從上述網站下載影片後,重新命名並放到正確位置
# 範例 (你需要手動下載,這裡只是示意檔案位置)

test-data/videos/valid/short-10s.mp4
test-data/videos/valid/medium-30s.mp4
test-data/videos/valid/long-2m.mp4
test-data/videos/valid/vertical-15s.mp4
test-data/videos/valid/low-res-20s.mp4
```

**注意事項**:
- 確保檔案名稱完全符合上表規格
- 影片長度與解析度盡量接近規格 (不需要完全精確)
- 所有影片都應該是 MP4 格式 (H.264 編碼)

#### 2. 準備無效測試檔案

```bash
# corrupted.mp4 - 建立一個損壞的 MP4 檔案
# 方法: 複製一個正常 MP4,然後刪除前面幾 KB
dd if=videos/valid/short-10s.mp4 of=videos/invalid/corrupted.mp4 bs=1024 skip=100

# wrong-format.avi - 下載或轉換一個 AVI 格式影片
# (可以用 ffmpeg 轉換: ffmpeg -i input.mp4 -c copy output.avi)

# too-large.mp4 - 下載一個超過 500MB 的影片
# 或用 ffmpeg 產生一個大檔案:
# ffmpeg -f lavfi -i testsrc=duration=600:size=1920x1080:rate=30 -pix_fmt yuv420p too-large.mp4

# not-a-video.txt - 建立一個文字檔
echo "This is not a video file" > videos/invalid/not-a-video.txt
```

### 驗證檔案規格

準備好檔案後,可以用 `ffmpeg` 或 `ffprobe` 驗證影片資訊:

```bash
# 安裝 ffmpeg (如果還沒安裝)
# macOS: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg

# 檢查影片資訊
ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=width,height,codec_name videos/valid/short-10s.mp4

# 快速檢查所有影片
for file in videos/valid/*.mp4; do
  echo "=== $file ==="
  ffprobe -v error -show_entries format=duration -show_entries stream=width,height "$file"
done
```

## 📋 測試資料準備檢查清單

在執行驗收測試前,請確認以下項目:

### 有效影片檔案
- [ ] `videos/valid/short-10s.mp4` (約 10 秒,1080p)
- [ ] `videos/valid/medium-30s.mp4` (約 30 秒,1080p)
- [ ] `videos/valid/long-2m.mp4` (約 2 分鐘,1080p)
- [ ] `videos/valid/vertical-15s.mp4` (約 15 秒,直式)
- [ ] `videos/valid/low-res-20s.mp4` (約 20 秒,720p)

### 無效測試檔案
- [ ] `videos/invalid/corrupted.mp4`
- [ ] `videos/invalid/wrong-format.avi`
- [ ] `videos/invalid/too-large.mp4`
- [ ] `videos/invalid/not-a-video.txt`

### Fixtures 資料
- [ ] `fixtures/test-users.json` (測試用戶資料)
- [ ] `fixtures/edit-prompts.json` (剪輯指令範例)
- [ ] `fixtures/expected-costs.json` (預期成本數據)

## 🔧 測試資料使用規則

### 資料庫測試資料命名規則
所有自動測試產生的資料庫記錄都應該加上 `test_` 前綴,例如:
- 用戶: `test_user_001@example.com`
- 影片: `test_video_xxxxx`
- 訂單: `test_order_xxxxx`

這樣可以:
- 清楚區分測試資料與真實開發資料
- 方便在需要時清理測試資料
- 避免測試影響到開發環境

### 測試結果保留策略
- 每次測試都會在 `results/` 下建立新的時間戳記資料夾
- 保留最近 10 次測試結果
- 失敗的測試結果永遠保留 (需手動刪除)
- `results/latest/` 永遠指向最新一次測試結果

### 清理測試資料

```bash
# 清理資料庫中的測試資料 (未來會提供腳本)
npm run test:cleanup

# 清理舊的測試結果 (保留最近 10 次)
npm run test:cleanup-results

# 完全清理所有測試資料 (謹慎使用!)
npm run test:cleanup-all
```

## 🚀 執行測試

準備好測試資料後,可以執行驗收測試:

```bash
# 檢查測試資料是否完整
npm run verify:check-data

# 執行完整驗收測試
npm run verify:all

# 執行特定模組的測試
npm run verify -- --module=upload
npm run verify -- --module=editing

# 執行特定層級的測試
npm run verify:basic       # 基礎驗證 (~1分鐘)
npm run verify:feature     # 功能驗證 (~10分鐘)
npm run verify:e2e         # 端對端驗證 (~30分鐘)
npm run verify:cost        # 成本驗證 (~10分鐘)
```

## 📊 測試報告

每次測試都會產生詳細的測試報告:

```
test-data/results/2025-10-07_14-30/
├── test-report.json       # 結構化測試報告
├── test-report.html       # 人類可讀的 HTML 報告
├── test-log.txt           # 完整測試日誌
├── uploaded-files/        # 測試上傳的檔案
├── processed-files/       # 測試處理後的檔案
└── screenshots/           # 錯誤截圖 (如果有)
```

查看最新測試報告:
```bash
# 在瀏覽器開啟 HTML 報告
open test-data/results/latest/test-report.html

# 查看 JSON 報告
cat test-data/results/latest/test-report.json | jq
```

## ❓ 常見問題

### Q: 測試影片可以用任何內容嗎?
A: 可以,但建議使用多樣化的內容 (風景、人物、運動等),以便測試不同場景的剪輯效果。

### Q: 影片規格一定要完全符合嗎?
A: 長度和大小可以有 ±10% 的誤差,但解析度和格式應該盡量符合規格。

### Q: 可以用自己拍攝的影片嗎?
A: 可以,但請確保符合檔案規格要求。

### Q: 測試影片要加入 git 嗎?
A: 不用,`test-data/videos/` 已經加入 `.gitignore`,不會被提交到 git。

### Q: 測試資料多久需要更新?
A: 通常不需要更新,除非:
  - 支援的影片格式改變
  - 檔案大小限制改變
  - 需要測試新的場景

## 📝 版本記錄

- 2025-10-07: 初始版本,定義測試資料結構與準備流程
