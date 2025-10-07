# Task 0.3: 準備測試資料

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 0.3 |
| **Task 名稱** | 準備測試資料 (Test Data Setup) |
| **所屬 Phase** | Phase 0: 測試環境建立 |
| **預估時間** | 2-3 小時 |
| **前置 Task** | Task 0.1 (驗收 CLI 框架), Task 0.2 (環境檢查測試) |
| **檔案位置** | `/Users/skyler/coding/CheapCut/docs/implementation-plan/phase-0-testing/task-0.3-test-data-setup.md` |

---

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息 (90% 的問題都會告訴你原因)

**常見錯誤模式**:

#### 1. 檔案找不到
```
Error: ENOENT: no such file or directory, open 'test-data/videos/valid/short-clip.mp4'
```
✅ **解決**: 測試影片還沒準備好，先執行 `npm run test-data:download` 或手動準備影片

#### 2. JSON 格式錯誤
```
SyntaxError: Unexpected token } in JSON at position 123
```
✅ **解決**: 檢查 fixtures/*.json 檔案格式，常見問題:
- 多了逗號: `"key": "value",}` ← 最後一個欄位不能有逗號
- 少了引號: `{key: "value"}` ← key 必須加引號
- 用了單引號: `{'key': 'value'}` ← JSON 只能用雙引號

#### 3. 套件找不到
```
Cannot find module 'file-type'
```
✅ **解決**: 執行 `npm install` 安裝依賴套件

#### 4. FFmpeg 錯誤
```
ffmpeg: command not found
```
✅ **解決**: 安裝 FFmpeg
- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt install ffmpeg`
- Windows: 從 https://ffmpeg.org/download.html 下載

---

### Step 2: 上網搜尋 (有技巧的查資料)

**❌ 不好的搜尋方式**:
- "測試影片從哪裡來" ← 太模糊，沒有技術關鍵字
- "影片下載" ← 範圍太廣
- "測試資料怎麼辦" ← 不夠具體

**✅ 好的搜尋方式**:
- "free stock video download mp4 pexels" ← 包含具體來源
- "ffmpeg generate test video command" ← 包含工具名稱
- "file-type npm check video format" ← 包含套件名稱和用途
- "jest mock file system fs-extra" ← 包含測試框架和套件

**進階技巧**:
```
# 限制搜尋在特定網站
site:stackoverflow.com "file-type npm"

# 尋找技術文件
"ffmpeg testsrc" filetype:pdf

# 搜尋最近的內容 (2024 年之後)
"free test videos" after:2024

# 搜尋多個關鍵字
"pexels" OR "pixabay" free video download
```

**推薦資源 (依優先順序)**:
1. 🥇 **官方文件** - 最準確
   - FFmpeg 文件: https://ffmpeg.org/documentation.html
   - file-type: https://github.com/sindresorhus/file-type

2. 🥈 **Stack Overflow** - 實戰經驗
   - 搜尋 "file-type video validation"

3. 🥉 **GitHub Issues** - 別人遇到的問題
   - 在套件的 GitHub repo 搜尋 issues

**使用 AI 工具時的技巧**:

❌ **不好的問法**:
> "怎麼做測試資料"

✅ **好的問法**:
> "我需要為 Node.js 專案準備測試影片，包含有效的 MP4 和故意損壞的檔案。請告訴我:
> 1. 如何用 FFmpeg 生成測試影片
> 2. 如何建立損壞的影片檔案用於錯誤測試
> 3. 推薦的免費測試影片來源"

**關鍵差異**: 好的問法包含了情境、技術棧、具體問題

---

### Step 3: 檢查檔案結構

**檢查目錄是否完整**:
```bash
# 應該要有這些目錄
ls -la test-data/
# 預期看到: videos/ audio/ fixtures/ results/ scripts/

ls -la test-data/videos/
# 預期看到: valid/ invalid/
```

**檢查 fixtures 格式**:
```bash
# 用 jq 檢查 JSON 格式 (macOS/Linux)
cat test-data/fixtures/test-users.json | jq .

# 或用 Node.js 檢查
node -e "console.log(JSON.parse(require('fs').readFileSync('test-data/fixtures/test-users.json')))"
```

**檢查影片檔案**:
```bash
# 用 ffprobe 檢查影片資訊
ffprobe test-data/videos/valid/short-clip.mp4

# 檢查檔案大小
ls -lh test-data/videos/valid/
```

---

### Step 4: 還是不行? 尋求協助

**準備以下資訊後再發問**:

1. **完整的錯誤訊息** (不要只截一部分)
2. **你執行的指令**
3. **你的環境資訊**:
   ```bash
   node --version
   npm --version
   ffmpeg -version
   cat package.json | grep '"file-type"'
   ```
4. **你已經試過的解決方法**

**好的提問範例**:
> 我在執行 `npm run test-data:verify` 時遇到錯誤:
> ```
> Error: Cannot find module 'file-type'
> ```
>
> 環境資訊:
> - Node.js: v20.10.0
> - npm: 10.2.3
> - OS: macOS 14.0
>
> 我已經試過:
> 1. 執行 `npm install` - 沒有解決
> 2. 刪除 node_modules 重新安裝 - 沒有解決
> 3. package.json 中有 `"file-type": "^19.0.0"`
>
> 請問還需要檢查什麼?

---

## 功能描述

### 為什麼需要這個?

- 🎯 **問題**: 沒有一致的測試資料，每次測試結果不同，難以重現問題
- ✅ **解決**: 固定的測試資料集確保所有功能在相同條件下測試
- 💡 **比喻**: 就像實驗室的標準樣本，確保每次實驗條件一致才能得到可靠結果

### 這個 Task 會建立什麼?

建立完整的測試資料集，包括：
1. 📹 **測試用影片檔案** - 有效影片 (5個) + 無效檔案 (4個)
2. 📝 **測試用 Fixtures** - 用戶資料、提示詞、預期成本 (JSON 格式)
3. 🔍 **測試資料驗證腳本** - 自動檢查測試資料是否完整
4. 📚 **測試資料的文檔** - 說明每個檔案的用途與規格

這些測試資料將貫穿整個專案的開發與測試過程。

---

## 前置知識

<details>
<summary>📖 點擊查看詳細的前置知識說明</summary>

### 1. 測試資料的設計原則

- **代表性**: 涵蓋各種常見場景（長短影片、不同解析度、不同格式）
- **可重現性**: 固定的測試資料確保測試結果可重現
- **邊界測試**: 包含邊界條件與錯誤情況
- **成本可控**: 測試資料應該小巧，降低 API 呼叫成本

**為什麼這樣設計?**
- 代表性: 確保測試能涵蓋真實使用情境
- 可重現性: 讓 bug 可以穩定重現，不會時好時壞
- 邊界測試: 找出程式在極端情況下的問題
- 成本可控: 開發階段不要花太多錢在 API 呼叫上

### 2. 影片檔案規格

根據 overall-design 的素材管理設計：
- **支援格式**: MP4, MOV, AVI, MKV
- **解析度**: 720p ~ 4K
- **長度**: 1秒 ~ 60分鐘
- **大小**: 最大 2GB

**為什麼這些規格?**
- MP4 是最常見的格式，MOV 是 iPhone 預設格式
- 720p 到 4K 涵蓋了常見的影片解析度
- 1秒到 60分鐘是合理的短影片長度範圍
- 2GB 限制避免上傳太大的檔案造成問題

### 3. Fixtures 的用途

- `test-users.json`: 模擬用戶資料（認證測試用）
  - 為什麼需要? 測試不同 tier 的 quota 限制

- `edit-prompts.json`: 各種編輯提示詞（AI 選片測試用）
  - 為什麼需要? 測試不同風格的影片剪輯效果

- `expected-costs.json`: 預期成本數據（成本追蹤驗證用）
  - 為什麼需要? 確保 API 成本計算正確，不會超支

</details>

---

## 前置依賴

### 檔案依賴
- ✅ Task 0.1 的 TestRunner 與 ReportGenerator 已實作
- ✅ Task 0.2 的環境變數驗證已完成

### 套件依賴
```json
{
  "dependencies": {
    "fs-extra": "^11.2.0",
    "fast-glob": "^3.3.2",
    "file-type": "^19.0.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4"
  }
}
```

**各套件的用途**:
- `fs-extra`: 增強版的檔案系統操作 (比 fs 更方便)
- `fast-glob`: 快速的檔案搜尋 (用於列出測試影片)
- `file-type`: 從檔案內容判斷真實格式 (不只看副檔名)

### 工具依賴
- **FFmpeg** - 用於驗證影片檔案的元資料（選用，建議安裝）
- **curl 或 wget** - 用於下載測試影片（選用）

---

## 實作步驟

### Step 1: 建立測試資料目錄結構

在專案根目錄執行：

```bash
mkdir -p test-data/videos/valid
mkdir -p test-data/videos/invalid
mkdir -p test-data/audio
mkdir -p test-data/fixtures
mkdir -p test-data/results
mkdir -p test-data/scripts
```

**為什麼這樣分資料夾?**
- `videos/valid`: 存放有效的測試影片
- `videos/invalid`: 存放故意損壞的檔案，用於測試錯誤處理
- `audio`: 未來測試配音功能時會用到
- `fixtures`: 固定的 JSON 測試資料
- `results`: 測試報告輸出目錄
- `scripts`: 管理測試資料的腳本

---

### Step 2: 建立 .gitignore 規則

建立 `test-data/.gitignore`:

```gitignore
# 忽略所有影片和音訊檔案（太大，不適合 commit）
videos/**/*.mp4
videos/**/*.mov
videos/**/*.avi
videos/**/*.mkv
audio/**/*.mp3
audio/**/*.wav
audio/**/*.m4a

# 忽略測試結果（每次執行都會重新產生）
results/**/*.json
results/**/*.html

# 保留 fixtures（JSON 檔案很小，可以 commit）
!fixtures/**/*.json

# 保留 README 與腳本（這些是程式碼的一部分）
!README.md
!scripts/**/*.ts
!scripts/**/*.sh
```

**為什麼要這樣設定?**
- 影片檔案太大 (幾 MB ~ 幾百 MB)，會讓 Git repo 變得很肥
- 測試結果是執行時產生的，不需要 commit
- Fixtures 很小 (幾 KB)，而且所有開發者需要用同樣的資料

---

### Step 3: 建立測試資料 README

<details>
<summary>📄 點擊查看完整的 README 內容 (建立 test-data/README.md)</summary>

```markdown
# CheapCut 測試資料

## 目錄結構

```
test-data/
├── videos/
│   ├── valid/          # 5 個有效的測試影片
│   └── invalid/        # 4 個無效的測試檔案
├── audio/              # 測試用配音檔案
├── fixtures/           # 固定的測試資料（JSON）
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
| `oversized-dummy.mp4` | 超過 2GB（模擬） | 大小限制測試 |

## 下載測試影片

由於影片檔案過大，我們不將其加入 Git。請執行以下指令準備測試影片：

```bash
npm run test-data:download
```

或手動執行：

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

只要符合規格（格式、長度、解析度），任何影片都可以。
```

</details>

---

### Step 4: 建立 Fixtures - test-users.json

建立 `test-data/fixtures/test-users.json`:

<details>
<summary>📄 點擊查看完整的 test-users.json 內容</summary>

```json
{
  "users": [
    {
      "id": "test-user-001",
      "email": "test1@example.com",
      "name": "測試用戶 A",
      "tier": "free",
      "quotaUsed": 0,
      "quotaLimit": 10,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": "test-user-002",
      "email": "test2@example.com",
      "name": "測試用戶 B",
      "tier": "pro",
      "quotaUsed": 5,
      "quotaLimit": 100,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": "test-user-003",
      "email": "test3@example.com",
      "name": "測試用戶 C (quota 已滿)",
      "tier": "free",
      "quotaUsed": 10,
      "quotaLimit": 10,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "adminUser": {
    "id": "admin-001",
    "email": "admin@example.com",
    "name": "管理員",
    "role": "admin",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**資料說明**:
- `test-user-001`: Free tier，未使用 quota，用於測試正常流程
- `test-user-002`: Pro tier，部分使用 quota，用於測試 Pro 功能
- `test-user-003`: Free tier，quota 已滿，用於測試 quota 限制錯誤
- `adminUser`: 管理員帳號，用於測試管理功能

</details>

---

### Step 5: 建立 Fixtures - edit-prompts.json

建立 `test-data/fixtures/edit-prompts.json`:

<details>
<summary>📄 點擊查看完整的 edit-prompts.json 內容</summary>

```json
{
  "prompts": [
    {
      "id": "prompt-001",
      "name": "美食料理風格",
      "content": "選擇食材特寫、料理過程、成品展示的片段，節奏要明快",
      "tags": ["cooking", "food", "fast-paced"],
      "difficulty": "easy"
    },
    {
      "id": "prompt-002",
      "name": "旅遊 Vlog 風格",
      "content": "選擇風景優美、人物互動、有情感張力的片段",
      "tags": ["travel", "vlog", "scenic"],
      "difficulty": "medium"
    },
    {
      "id": "prompt-003",
      "name": "產品開箱風格",
      "content": "選擇產品展示、功能演示、使用情境的片段，要清晰明瞭",
      "tags": ["unboxing", "product", "demo"],
      "difficulty": "easy"
    },
    {
      "id": "prompt-004",
      "name": "教學講解風格",
      "content": "依照講解邏輯順序，選擇操作步驟、重點強調、結果展示的片段",
      "tags": ["tutorial", "education", "step-by-step"],
      "difficulty": "medium"
    },
    {
      "id": "prompt-005",
      "name": "情感故事風格",
      "content": "選擇有情感張力、人物表情、場景轉換的片段，營造起承轉合",
      "tags": ["story", "emotion", "narrative"],
      "difficulty": "hard"
    }
  ]
}
```

**資料說明**:
- 涵蓋 5 種常見的短影片風格
- 包含不同難度等級 (easy, medium, hard)
- 每個提示詞都有 tags，方便測試標籤過濾功能

</details>

---

### Step 6: 建立 Fixtures - expected-costs.json

建立 `test-data/fixtures/expected-costs.json`:

<details>
<summary>📄 點擊查看完整的 expected-costs.json 內容</summary>

```json
{
  "apiCosts": {
    "googleVideoAI": {
      "perMinute": 0.025,
      "description": "Google Video Intelligence API - Label Detection"
    },
    "openaiWhisper": {
      "perMinute": 0.006,
      "description": "OpenAI Whisper API - Speech to Text"
    },
    "geminiFlash": {
      "per1MTokens": 0.075,
      "avgTokensPerRequest": 2000,
      "description": "Gemini 1.5 Flash - 語意分析與選片"
    },
    "gcsStorage": {
      "perGB": 0.02,
      "description": "Google Cloud Storage - Standard Storage (月費)"
    },
    "gcsEgress": {
      "perGB": 0.12,
      "description": "GCS Egress to Internet (下載頻寬)"
    }
  },
  "scenarios": [
    {
      "name": "單一影片生成 - 標準場景",
      "description": "素材 5 分鐘, 配音 1 分鐘, 生成 1 分鐘影片",
      "breakdown": {
        "videoAI": 0.125,
        "whisper": 0.006,
        "gemini": 0.00015,
        "storage": 0.001,
        "egress": 0.005
      },
      "total": 0.031,
      "note": "這是 overall-design 中的標準成本估算"
    },
    {
      "name": "單一影片生成 - 長素材",
      "description": "素材 30 分鐘, 配音 3 分鐘, 生成 3 分鐘影片",
      "breakdown": {
        "videoAI": 0.75,
        "whisper": 0.018,
        "gemini": 0.000375,
        "storage": 0.005,
        "egress": 0.015
      },
      "total": 0.79
    },
    {
      "name": "批次處理 - 10 支影片",
      "description": "10 支標準影片的總成本",
      "total": 0.31
    }
  ]
}
```

**資料說明**:
- 包含所有 API 的單價 (來自 overall-design)
- 提供 3 種場景的成本估算
- 用於測試成本追蹤功能是否正確計算

</details>

---

### Step 7: 建立下載影片腳本

建立 `test-data/scripts/download-videos.ts`:

<details>
<summary>📄 點擊查看完整的 download-videos.ts 程式碼</summary>

```typescript
/**
 * 下載測試影片腳本
 *
 * 為什麼需要這個腳本?
 * - 測試影片太大，不適合放在 Git 中
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
 * - 所以這裡只提供規格說明，讓開發者自行準備
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
    instructions: '建立一個損壞的 MP4 檔案（假 header + 亂碼內容）',
  },
  {
    filename: 'empty.mp4',
    instructions: '建立一個 0 bytes 的空檔案',
  },
  {
    filename: 'fake-video.txt',
    instructions: '建立一個文字檔改名為 .txt（用於測試格式驗證）',
  },
  {
    filename: 'oversized-dummy.mp4',
    instructions: '不需實際建立 2GB 檔案，測試時會 mock 檔案大小',
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
      // 建立假影片（其實是文字檔）
      await fs.writeFile(filepath, 'This is not a video file');
      console.log(`   ✓ ${file.filename} (已建立)`);
    } else if (file.filename === 'corrupted.mp4') {
      // 建立一個假的 MP4 header，後面接上亂碼
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
  console.log('   a) 用 FFmpeg 生成 (最快，參考 test-data/README.md)');
  console.log('   b) 從 Pexels/Pixabay 下載免費影片');
  console.log('   c) 使用你自己的影片');
  console.log('');
  console.log('2️⃣  完成後執行驗證:');
  console.log('   npm run test-data:verify');
  console.log('='.repeat(60));
}

// 執行主函式
setupTestVideos().catch(console.error);
```

</details>

---

### Step 8: 建立驗證腳本

建立 `test-data/scripts/verify-data.ts`:

<details>
<summary>📄 點擊查看完整的 verify-data.ts 程式碼</summary>

```typescript
/**
 * 測試資料驗證腳本
 *
 * 檢查所有測試資料是否完整且符合規格
 *
 * 為什麼需要驗證腳本?
 * - 確保所有開發者的測試環境一致
 * - 在執行測試前先檢查資料是否準備好
 * - 產生易讀的報告，快速找出缺少的檔案
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileTypeFromFile } from 'file-type';

/**
 * 驗證結果的型別定義
 *
 * 為什麼這樣設計?
 * - category: 將檢查項目分組（目錄、Fixtures、影片）
 * - checks: 每組內的詳細檢查項目
 * - passed: 布林值，方便統計通過率
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
          // 應該包含 users 陣列，至少 3 個用戶
          const valid = content.users && Array.isArray(content.users) && content.users.length >= 3;
          result.checks.push({
            name: fixture,
            passed: valid,
            message: valid ? `包含 ${content.users.length} 個測試用戶` : '格式不正確',
          });
        } else if (fixture === 'edit-prompts.json') {
          // 應該包含 prompts 陣列，至少 5 個提示詞
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
      const isVideo = fileType && (fileType.mime.startsWith('video/'));

      result.checks.push({
        name: `valid/${video}`,
        passed: isVideo,
        message: isVideo
          ? `${(stats.size / 1024 / 1024).toFixed(2)} MB, ${fileType.mime}`
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
   * - 分類顯示，容易閱讀
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
      console.log('🎉 所有測試資料驗證通過！');
    } else {
      console.log('⚠️  部分測試資料缺少或不正確，請檢查上面的錯誤訊息。');
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
```

</details>

---

### Step 9: 建立清理腳本

建立 `test-data/scripts/clean-results.ts`:

```typescript
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

  console.log('✅ 清理完成！');
}

cleanResults().catch(console.error);
```

---

### Step 10: 更新 package.json

在專案根目錄的 `package.json` 中新增測試資料管理指令：

```json
{
  "scripts": {
    "test-data:download": "ts-node test-data/scripts/download-videos.ts",
    "test-data:verify": "ts-node test-data/scripts/verify-data.ts",
    "test-data:clean": "ts-node test-data/scripts/clean-results.ts"
  }
}
```

**為什麼要加這些 npm scripts?**
- 統一的指令介面，不用記複雜的路徑
- 方便在 CI/CD 中使用
- 符合 npm 生態系的慣例

---

### Step 11: 建立測試檔案 - Basic

建立 `tests/phase-0/task-0.3.basic.test.ts`:

<details>
<summary>📄 點擊查看完整的測試程式碼</summary>

```typescript
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

import { TestRunner } from '../../src/lib/test-runner';
import fs from 'fs-extra';
import path from 'path';

describe('Task 0.3 - Basic: 測試資料目錄結構', () => {
  const runner = new TestRunner('basic');

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
    await runner.generateReport();
  });
});
```

</details>

---

### Step 12: 建立測試檔案 - Functional

建立 `tests/phase-0/task-0.3.functional.test.ts`:

<details>
<summary>📄 點擊查看完整的測試程式碼</summary>

```typescript
/**
 * Task 0.3 - Functional Acceptance
 *
 * 測試目標: 驗證 fixtures 內容與腳本功能
 */

import { TestRunner } from '../../src/lib/test-runner';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('Task 0.3 - Functional: Fixtures 與腳本功能', () => {
  const runner = new TestRunner('functional');

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

        // 應該可以執行而不報錯（即使沒有實際下載）
        expect(() => {
          execSync(`ts-node ${scriptPath}`, { encoding: 'utf-8', stdio: 'pipe' });
        }).not.toThrow();
      });
    });

    it('verify-data.ts 可以執行並產生報告', async () => {
      await runner.runTest('verify 腳本執行', async () => {
        const scriptPath = path.join(process.cwd(), 'test-data/scripts/verify-data.ts');

        const output = execSync(`ts-node ${scriptPath}`, {
          encoding: 'utf-8',
          stdio: 'pipe'
        });

        expect(output).toContain('驗證結果');
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
    await runner.generateReport();
  });
});
```

</details>

---

### Step 13: 建立測試檔案 - E2E

建立 `tests/phase-0/task-0.3.e2e.test.ts`:

<details>
<summary>📄 點擊查看完整的測試程式碼</summary>

```typescript
/**
 * Task 0.3 - E2E Acceptance
 *
 * 測試目標: 完整測試資料設定流程
 */

import { TestRunner } from '../../src/lib/test-runner';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('Task 0.3 - E2E: 完整測試資料流程', () => {
  const runner = new TestRunner('e2e');

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
      const verifyOutput = execSync('npm run test-data:verify', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      expect(verifyOutput).toContain('目錄結構');
      expect(verifyOutput).toContain('Fixtures');
      expect(verifyOutput).toContain('測試影片');

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

        // 至少應該有可以用於測試的影片（如果用戶已準備）
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
    await runner.generateReport();
  });
});
```

</details>

---

## 驗收標準

### 驗收測試架構

- 📁 **Basic Verification** (5 tests): 目錄結構與基本檔案
- 📁 **Functional Acceptance** (7 tests): Fixtures 與腳本功能
- 📁 **E2E Acceptance** (4 tests): 完整測試資料流程

### 執行驗收

```bash
npm run verify:task task-0.3
```

### 通過標準

- ✅ 所有 16 個測試通過 (5 + 7 + 4)
- ✅ `npm run test-data:verify` 顯示驗證報告
- ✅ Fixtures 資料完整且格式正確

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)
1. ✅ test-data 根目錄存在
2. ✅ 所有必要子目錄存在
3. ✅ .gitignore 存在且規則正確
4. ✅ README.md 存在
5. ✅ 所有腳本檔案存在

### Functional Acceptance (7 tests)
1. ✅ test-users.json 格式正確且包含必要資料
2. ✅ edit-prompts.json 格式正確且包含多種風格
3. ✅ expected-costs.json 包含完整成本資料
4. ✅ download-videos.ts 可以執行
5. ✅ verify-data.ts 可以執行並產生報告
6. ✅ clean-results.ts 可以清理結果目錄
7. ✅ npm scripts 已正確設定

### E2E Acceptance (4 tests)
1. ✅ 完整的測試資料設定與驗證流程
2. ✅ Fixtures 資料可以被正確讀取與使用
3. ✅ 測試影片清單可以被程式化存取
4. ✅ 測試資料文檔完整且可讀

</details>

---

## 常見問題與解決方案

### Q1: 測試影片從哪裡取得？

**A**: 有幾種方式 (推薦順序):

1. **用 FFmpeg 生成 (最快)** ⭐
   - 參考 test-data/README.md 中的 FFmpeg 指令
   - 優點: 檔案小、速度快、完全可控
   - 缺點: 只是彩色條，不是真實影片

2. **從免費影片庫下載**
   - Pexels: https://www.pexels.com/videos/
   - Pixabay: https://pixabay.com/videos/
   - Coverr: https://coverr.co/
   - 優點: 真實影片，可以測試真實場景
   - 缺點: 需要手動下載，檔案較大

3. **使用自己的影片**
   - 用手機錄製或從自己的影片庫選
   - 優點: 最符合實際使用情境
   - 缺點: 可能包含隱私資訊，不適合分享

**如何搜尋免費影片**:
- ✅ "pexels free cooking video download"
- ✅ "pixabay nature video 1080p"
- ❌ "免費影片下載" (太模糊)

---

### Q2: 為什麼要用 .gitignore 排除影片檔案？

**A**: 影片檔案通常很大（幾 MB 到幾百 MB），如果 commit 到 Git 會：
- 📦 大幅增加 repo 大小 (可能從幾 MB 變成幾百 MB)
- 🐌 Clone 時間變長 (從幾秒變成幾分鐘)
- 💾 Git 操作變慢 (每次 pull/push 都要傳輸大檔案)
- 💸 浪費 GitHub 儲存空間

**正確做法**:
- ✅ Commit fixtures (JSON 檔案很小，幾 KB)
- ✅ Commit 腳本 (讓其他開發者可以自行準備影片)
- ❌ 不要 commit 影片檔案

---

### Q3: 如果沒有準備測試影片，能否繼續開發？

**A**: 可以！在開發早期階段，你可以：

**Phase 0-1 (基礎設施)**:
- ✅ 先完成 Phase 0 和 Phase 1 的基礎設施
- ✅ 用 Mock/Stub 來模擬影片處理邏輯
- ✅ Fixtures 測試不需要真實影片

**Phase 2 (開始需要影片)**:
- ⚠️ 實作影片分析引擎時，建議準備 1-2 個真實影片
- ⚠️ 可以更早發現格式相容性問題

**建議**: 至少準備 1 個簡單的測試影片 (用 FFmpeg 生成即可)

---

### Q4: expected-costs.json 的數據從哪裡來？

**A**: 這些數據來自 `overall-design/07-cost-estimate.md`。

**如果 API 價格有變動**:
1. 查看各 API 的最新定價頁面
2. 更新 `expected-costs.json` 中的單價
3. 重新計算 `scenarios` 中的預期成本
4. 執行測試確保成本計算邏輯正確

**價格來源**:
- Google Video AI: https://cloud.google.com/video-intelligence/pricing
- OpenAI Whisper: https://openai.com/pricing
- Gemini: https://ai.google.dev/pricing

---

### Q5: 測試資料需要多少儲存空間？

**A**: 預估：

| 項目 | 大小 | 說明 |
|------|------|------|
| 5 個有效影片 | ~100 MB | 取決於影片長度和解析度 |
| 4 個無效檔案 | < 1 MB | 都是小檔案 |
| Fixtures | < 100 KB | JSON 檔案很小 |
| **總計** | **~100 MB** | 可接受的大小 |

**節省空間的技巧**:
- 用 FFmpeg 生成的影片只有幾 MB
- 真實影片可以選擇較短的片段 (5-30秒)
- 不需要 4K 影片，720p/1080p 就夠了

---

### Q6: verify-data.ts 腳本為什麼需要 file-type 套件？

**A**: `file-type` 可以檢查檔案的**真實格式**（從檔案內容判斷），而不是只看副檔名。

**為什麼這很重要?**
```bash
# 使用者可能這樣做:
mv test.txt test.mp4  # 把文字檔改名成影片

# 只看副檔名: 會以為是 MP4 ✗
# 用 file-type: 發現是 text/plain ✓
```

**file-type 的運作原理**:
- 讀取檔案的前幾個 bytes (magic number)
- 根據 magic number 判斷真實格式
- 例如 MP4 檔案開頭一定是 `00 00 00 xx 66 74 79 70`

---

### Q7: 如何確保測試資料的一致性？

**A**: 三個層次的一致性保證:

**1. Fixtures 一致性 (最重要)**:
- ✅ Fixtures 放在 Git 中
- ✅ 所有開發者使用相同的 JSON 資料
- ✅ 用 verify-data.ts 驗證格式

**2. 影片規格一致性**:
- ✅ README.md 明確描述每個影片的規格
- ✅ verify-data.ts 檢查檔案大小和格式
- 💡 進階: 可以加入 hash 值驗證

**3. 文檔一致性**:
- ✅ README.md 說明如何準備影片
- ✅ download-videos.ts 提供指引
- ✅ 所有開發者遵循相同流程

---

## 完成檢查清單

實作完成後，請依序檢查以下項目：

### 目錄結構
- [ ] `test-data/` 根目錄已建立
- [ ] `test-data/videos/valid/` 已建立
- [ ] `test-data/videos/invalid/` 已建立
- [ ] `test-data/audio/` 已建立
- [ ] `test-data/fixtures/` 已建立
- [ ] `test-data/results/` 已建立
- [ ] `test-data/scripts/` 已建立

### 檔案建立
- [ ] `test-data/.gitignore` 已建立且規則正確
- [ ] `test-data/README.md` 已建立且內容完整
- [ ] `test-data/fixtures/test-users.json` 已建立
- [ ] `test-data/fixtures/edit-prompts.json` 已建立
- [ ] `test-data/fixtures/expected-costs.json` 已建立

### 腳本建立
- [ ] `test-data/scripts/download-videos.ts` 已建立
- [ ] `test-data/scripts/verify-data.ts` 已建立
- [ ] `test-data/scripts/clean-results.ts` 已建立
- [ ] `package.json` 中的 npm scripts 已設定

### 測試檔案
- [ ] `tests/phase-0/task-0.3.basic.test.ts` 已建立
- [ ] `tests/phase-0/task-0.3.functional.test.ts` 已建立
- [ ] `tests/phase-0/task-0.3.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過 (5 tests)
- [ ] Functional 測試全部通過 (7 tests)
- [ ] E2E 測試全部通過 (4 tests)

### 手動檢查
- [ ] 執行 `npm run test-data:download` 沒有錯誤
- [ ] 執行 `npm run test-data:verify` 可以看到驗證報告
- [ ] 執行 `npm run test-data:clean` 可以清理結果
- [ ] 至少準備 1 個測試影片 (或用 FFmpeg 生成)

---

## Task 完成確認

完成這個 Task 後，你應該能夠：

✅ 執行 `npm run test-data:verify` 並看到完整的驗證報告
✅ 了解每個測試資料的用途
✅ 知道如何新增或修改測試資料
✅ 通過所有三層驗收測試（Basic / Functional / E2E）

**下一步**: 開始 Phase 1 - 基礎設施建立 (Task 1.1: 資料庫 Schema)

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
