# Task 1.1: 建立資料庫 Schema

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 1.1 |
| **Task 名稱** | 建立資料庫 Schema |
| **所屬 Phase** | Phase 1: 基礎設施建立 |
| **預估時間** | 3-4 小時 (設計 1h + 實作 1.5h + 測試 1h + 除錯 0.5h) |
| **難度** | ⭐⭐⭐ 中高 |
| **前置 Task** | 無 (Phase 1 第一個 task) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息 (90% 的問題都會告訴你原因)

**執行 SQL 後看到錯誤?** 別慌張,按照這個順序處理:

1. **找到錯誤的關鍵字**
   ```
   ERROR: relation "videos" already exists
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 這是關鍵錯誤訊息
   ```

2. **判斷錯誤類型**
   - `relation "xxx" already exists` → 資料表已存在,需要先刪除
   - `syntax error at or near` → SQL 語法錯誤
   - `column "xxx" does not exist` → 欄位名稱打錯
   - `permission denied` → 權限問題

3. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 上網搜尋 (有技巧的查資料)

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"PostgreSQL 錯誤"  ← 太模糊
"建立資料庫失敗" ← 沒有具體錯誤訊息
```

**✅ 好的搜尋方式**:
```
"PostgreSQL ERROR relation already exists"  ← 包含完整錯誤訊息
"Supabase create table foreign key" ← 包含你在做的事情
"PostgreSQL JSONB column index" ← 具體的技術問題
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件** (最準確)
- PostgreSQL: https://www.postgresql.org/docs/
- Supabase: https://supabase.com/docs

**優先順序 2: Stack Overflow** (有具體解答)
- 搜尋時加上 `site:stackoverflow.com`
- 看「✓ 已接受的答案」和「高讚數答案」

**優先順序 3: Supabase Discord** (社群討論)
- https://discord.supabase.com/

---

### Step 3: 檢查環境設定

很多問題是因為環境設定不對。執行這些檢查:

```bash
# 檢查 Supabase CLI 版本
supabase --version
# 應該顯示 >= 1.0.0

# 檢查當前目錄 (應該在專案根目錄)
pwd

# 檢查 Supabase 是否已初始化
ls supabase/
# 應該看到 config.toml 檔案
```

---

### Step 4: 問題還是沒解決?

**準備以下資訊尋求協助**:

```markdown
## 問題描述
我在執行 Task 1.1 的步驟 X 時遇到問題

## 我執行的 SQL
```sql
[貼上完整的 SQL，不要只貼一部分]
```

## 完整錯誤訊息
```
[貼上完整的錯誤訊息]
```

## 我的環境
- Supabase CLI 版本: [執行 supabase --version]
- PostgreSQL 版本: [如果知道的話]
- 作業系統: macOS / Windows / Linux

## 我已經嘗試過
1. [列出你嘗試過的方法]
2. [說明結果如何]
```

---

## 🎯 功能描述

建立 CheapCut 系統所需的完整資料庫結構,包含業務資料表、系統支援表、索引與關聯。

### 為什麼需要這個?

- 🎯 **問題**: 沒有資料庫 schema,系統無法儲存任何資料
- ✅ **解決**: 建立完整的資料表結構,為後續開發提供基礎
- 💡 **比喻**: 就像蓋房子前要先打好地基,資料庫是整個系統的地基

### 完成後你會有:

- 11 張完整的資料表 (7 張業務表 + 4 張系統表)
- 所有必要的索引 (加速查詢)
- 外鍵關聯 (確保資料一致性)
- Row Level Security 設定 (資料安全)
- 完整的 Migration 檔案 (版本控制)

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. PostgreSQL

**是什麼**: 關聯式資料庫管理系統

**你需要知道的**:
- 資料表 (Table): 儲存資料的地方,像 Excel 的工作表
- 欄位 (Column): 資料表中的一欄,像 Excel 的欄位
- 資料型別: TEXT(文字)、INTEGER(整數)、BOOLEAN(真假)、JSONB(JSON 物件) 等
- 主鍵 (Primary Key): 每筆資料的唯一識別碼
- 外鍵 (Foreign Key): 連接不同資料表的欄位

### 2. Supabase

**是什麼**: PostgreSQL 資料庫的雲端託管服務

**你需要知道的**:
- 提供免費的 PostgreSQL 資料庫 (500MB)
- 內建認證功能
- 提供網頁管理介面
- 使用 SQL 語法操作

### 3. Database Migration

**是什麼**: 資料庫版本控制機制

**你需要知道的**:
- 每次變更都會建立一個 migration 檔案
- 可以追蹤所有資料庫變更歷史
- 可以在不同環境套用相同的 schema

### 4. Row Level Security (RLS)

**是什麼**: PostgreSQL 的資料安全機制

**你需要知道的**:
- 確保用戶只能存取自己的資料
- 在資料庫層級強制執行 (比應用層更安全)
- 使用 Policy 定義存取規則

---

## 🔗 前置依賴

### 必須先完成的 Task
- 無 (這是第一個 task)

### 系統需求
- Supabase 帳號 (免費即可)
- Supabase CLI >= 1.0.0
- PostgreSQL 客戶端工具 (可選,用於本地測試)

### 環境檢查
```bash
# 檢查 Supabase CLI 是否已安裝
supabase --version
# 應該顯示版本號

# 如果沒安裝,執行:
# macOS/Linux:
brew install supabase/tap/supabase

# Windows:
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

---

## 📝 實作步驟

### 步驟 1: 初始化 Supabase 專案

在專案根目錄執行:

```bash
# 初始化 Supabase (如果還沒做過)
supabase init

# 這會建立 supabase/ 資料夾,包含:
# - config.toml (設定檔)
# - migrations/ (migration 檔案資料夾)
```

**預期輸出**:
```
Supabase CLI initialized successfully.
Config file: supabase/config.toml
```

**快速檢查**:
```bash
# 確認資料夾結構
ls -la supabase/
# 應該看到 config.toml 和 migrations/ 資料夾
```

---

### 步驟 2: 建立資料庫 Migration 檔案

建立新的 migration 檔案:

```bash
# 建立 migration (會自動產生時間戳記檔名)
supabase migration new create_core_tables
```

**預期輸出**:
```
Created new migration at supabase/migrations/20251007123456_create_core_tables.sql
```

**說明**: 這個檔案會記錄所有的資料表建立語句,之後可以重複套用到不同環境。

---

### 步驟 3: 撰寫資料表建立 SQL (業務資料表)

開啟剛建立的 migration 檔案,填入以下內容:

**檔案**: `supabase/migrations/[時間戳記]_create_core_tables.sql`

```sql
-- =====================================================
-- CheapCut 資料庫 Schema
-- 建立日期: 2025-10-07
-- 說明: 建立所有核心業務資料表與系統支援表
-- =====================================================

-- =====================================================
-- 1. 業務資料表 (Business Tables)
-- =====================================================

-- -----------------------------------------------------
-- 1.1 用戶資料表 (users)
-- 說明: 儲存用戶基本資訊 (由 Supabase Auth 管理)
-- 注意: 這個表會自動由 Supabase Auth 建立
-- -----------------------------------------------------
-- 我們不需要手動建立 users 表,但可以擴充它:

-- 為 users 表新增自訂欄位 (如果需要)
-- ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free';

-- -----------------------------------------------------
-- 1.2 影片資料表 (videos)
-- 說明: 儲存用戶上傳的原始影片資訊
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS videos (
  -- 主鍵
  video_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 檔案資訊
  file_path TEXT NOT NULL,           -- S3/R2 URL
  file_size BIGINT NOT NULL,         -- 檔案大小 (bytes)
  duration NUMERIC(10,2) NOT NULL,   -- 影片長度 (秒),支援小數點
  resolution VARCHAR(20),             -- 解析度 (例如: "1920x1080")
  format VARCHAR(10),                 -- 格式 (例如: "mp4")

  -- 處理狀態
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, analyzing, analyzed, failed
  error_message TEXT,                             -- 失敗時的錯誤訊息

  -- 時間戳記
  upload_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 額外資訊 (JSONB 可儲存彈性的資料結構)
  metadata JSONB,

  -- 約束
  CONSTRAINT videos_status_check CHECK (status IN ('pending', 'analyzing', 'analyzed', 'failed'))
);

-- 說明為什麼用 UUID:
-- - UUID 是通用唯一識別碼,不會重複
-- - gen_random_uuid() 會自動產生隨機 UUID
-- - 比自動遞增的整數更安全 (無法猜測 ID)

-- 說明為什麼用 REFERENCES:
-- - ON DELETE CASCADE: 當用戶被刪除時,自動刪除他的所有影片
-- - 確保資料一致性,不會有孤兒資料

-- -----------------------------------------------------
-- 1.3 片段資料表 (segments)
-- 說明: 儲存影片切分後的片段資訊
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS segments (
  -- 主鍵
  segment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  video_id UUID NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,

  -- 片段資訊
  start_time NUMERIC(10,2) NOT NULL,   -- 開始時間 (秒)
  end_time NUMERIC(10,2) NOT NULL,     -- 結束時間 (秒)
  duration NUMERIC(10,2) GENERATED ALWAYS AS (end_time - start_time) STORED,  -- 自動計算長度

  -- 視覺化資訊
  thumbnail_url TEXT NOT NULL,         -- 縮圖 URL
  description TEXT,                     -- AI 生成的片段描述
  scene_type VARCHAR(50),              -- 場景類型 (indoor, outdoor, closeup...)

  -- 時間戳記
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 約束
  CONSTRAINT segments_time_check CHECK (end_time > start_time)
);

-- 說明 GENERATED ALWAYS AS:
-- - duration 會自動計算 (end_time - start_time)
-- - STORED 表示結果會儲存到資料庫 (查詢更快)
-- - 不需要手動計算,避免錯誤

-- -----------------------------------------------------
-- 1.4 片段標籤表 (segment_tags)
-- 說明: 儲存片段與標籤的關聯 (多對多關係)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS segment_tags (
  -- 複合主鍵 (一個片段可以有多個標籤,但不會重複)
  segment_id UUID NOT NULL REFERENCES segments(segment_id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,

  -- 標籤資訊
  tag_type VARCHAR(50),                -- 標籤類型 (visual, content, emotion)
  confidence NUMERIC(3,2),             -- 信心分數 (0.00-1.00)
  source VARCHAR(20) NOT NULL,         -- ai 或 user

  -- 時間戳記
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 複合主鍵
  PRIMARY KEY (segment_id, tag),

  -- 約束
  CONSTRAINT segment_tags_confidence_check CHECK (confidence >= 0 AND confidence <= 1),
  CONSTRAINT segment_tags_source_check CHECK (source IN ('ai', 'user'))
);

-- 說明複合主鍵:
-- - (segment_id, tag) 組合必須唯一
-- - 同一個片段不會有兩個相同的標籤
-- - 但不同片段可以有相同的標籤

-- -----------------------------------------------------
-- 1.5 配音資料表 (voiceovers)
-- 說明: 儲存用戶上傳或錄製的配音檔案
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS voiceovers (
  -- 主鍵
  voiceover_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 檔案資訊
  file_path TEXT NOT NULL,             -- S3/R2 URL
  duration NUMERIC(10,2) NOT NULL,     -- 音檔長度 (秒)

  -- 轉錄資訊
  transcript TEXT,                      -- STT 轉錄的完整文字
  transcript_json JSONB,                -- 帶時間軸的完整轉錄
  -- transcript_json 範例:
  -- {
  --   "segments": [
  --     {"text": "大家好", "start": 0.0, "end": 1.2},
  --     {"text": "今天要介紹", "start": 1.2, "end": 2.5}
  --   ]
  -- }

  -- 語意分析結果
  semantic_analysis JSONB,              -- AI 語意分析結果
  -- semantic_analysis 範例:
  -- {
  --   "topics": ["產品介紹", "功能說明"],
  --   "keywords": ["特色", "優勢", "客戶"],
  --   "tone": "professional"
  -- }

  -- 處理狀態
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, processed, failed
  error_message TEXT,

  -- 時間戳記
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 約束
  CONSTRAINT voiceovers_status_check CHECK (status IN ('pending', 'processed', 'failed'))
);

-- 說明為什麼用 JSONB:
-- - JSONB 可以儲存複雜的 JSON 物件
-- - 可以使用 PostgreSQL 的 JSON 查詢功能
-- - 比 TEXT 更適合儲存結構化資料
-- - 支援索引,查詢更快

-- -----------------------------------------------------
-- 1.6 時間軸資料表 (timelines)
-- 說明: 儲存影片時間軸 (草稿或最終版)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS timelines (
  -- 主鍵
  timeline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voiceover_id UUID NOT NULL REFERENCES voiceovers(voiceover_id) ON DELETE CASCADE,

  -- 時間軸資料 (完整的 JSON 結構)
  timeline_json JSONB NOT NULL,
  -- timeline_json 包含:
  -- - segments: 每個片段的詳細資訊
  -- - music: 配樂資訊
  -- - subtitle_style: 字幕樣式
  -- 完整結構見 overall-design/05-data-flow.md

  -- 狀態
  status VARCHAR(20) NOT NULL DEFAULT 'draft',  -- draft, final

  -- 時間戳記
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 約束
  CONSTRAINT timelines_status_check CHECK (status IN ('draft', 'final'))
);

-- -----------------------------------------------------
-- 1.7 生成影片表 (generated_videos)
-- 說明: 儲存系統生成的成品影片
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS generated_videos (
  -- 主鍵
  video_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timeline_id UUID NOT NULL REFERENCES timelines(timeline_id) ON DELETE SET NULL,  -- 時間軸可能被刪除
  voiceover_id UUID NOT NULL REFERENCES voiceovers(voiceover_id) ON DELETE SET NULL,

  -- 檔案資訊
  file_path TEXT NOT NULL,             -- S3/R2 URL
  thumbnail_url TEXT NOT NULL,         -- 縮圖 URL
  duration NUMERIC(10,2) NOT NULL,     -- 影片長度 (秒)
  file_size BIGINT NOT NULL,           -- 檔案大小 (bytes)
  resolution VARCHAR(20),               -- 解析度
  format VARCHAR(10),                   -- 格式

  -- 處理狀態
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  error_message TEXT,

  -- 效能資訊
  render_time INTEGER,                  -- 渲染耗時 (秒)

  -- 時間戳記
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- 約束
  CONSTRAINT generated_videos_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- 說明 ON DELETE SET NULL:
-- - 當時間軸被刪除時,這裡的 timeline_id 會設為 NULL
-- - 但影片本身不會被刪除 (因為用戶可能還想保留)
-- - 如果要連影片一起刪,改用 ON DELETE CASCADE

-- =====================================================
-- 2. 系統支援表 (System Support Tables)
-- =====================================================

-- -----------------------------------------------------
-- 2.1 任務執行記錄表 (task_executions)
-- 說明: 記錄所有背景任務的執行狀態 (支援多步驟處理)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS task_executions (
  -- 主鍵
  execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 任務識別
  task_type VARCHAR(100) NOT NULL,     -- material_analysis, voiceover_processing, video_generation
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  related_id UUID NOT NULL,             -- 關聯的業務資料 ID (video_id, voiceover_id...)

  -- 執行狀態
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed

  -- 進度追蹤
  current_step VARCHAR(100),            -- 目前步驟名稱
  step_index INTEGER DEFAULT 0,        -- 目前第幾步 (0-based)
  total_steps INTEGER,                  -- 總共幾步
  steps JSONB,                          -- 每一步的詳細資訊
  -- steps 範例:
  -- [
  --   {"name": "call_video_ai", "status": "completed", "started_at": "...", "result": {...}},
  --   {"name": "convert_tags", "status": "processing", "started_at": "..."},
  --   {"name": "split_segments", "status": "pending"}
  -- ]

  -- 輸入輸出
  input_data JSONB,                     -- 任務輸入
  output_data JSONB,                    -- 最終輸出

  -- 成本與效能
  ai_calls_count INTEGER DEFAULT 0,    -- AI 呼叫次數
  total_tokens BIGINT DEFAULT 0,       -- 總 token 數
  total_cost NUMERIC(10,4) DEFAULT 0,  -- 總成本 (USD),支援到小數點 4 位

  -- 時間
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  execution_time INTEGER,               -- 執行時間 (秒)

  -- 錯誤處理
  error_message TEXT,
  failed_step VARCHAR(100),             -- 失敗在哪一步

  -- 約束
  CONSTRAINT task_executions_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- -----------------------------------------------------
-- 2.2 成本記錄表 (cost_records)
-- 說明: 記錄所有外部服務的成本 (埋點產生)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS cost_records (
  -- 主鍵
  record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  execution_id UUID REFERENCES task_executions(execution_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 服務識別
  service VARCHAR(100) NOT NULL,        -- google_video_ai, openai, whisper, s3...
  operation VARCHAR(200) NOT NULL,      -- 操作名稱 (gpt4_segment_select, video_analysis...)

  -- 成本計算
  quantity NUMERIC(15,6) NOT NULL,      -- 使用量 (支援小數)
  unit VARCHAR(50) NOT NULL,            -- 單位 (tokens, minutes, GB...)
  unit_cost NUMERIC(10,6) NOT NULL,     -- 單價 (USD)
  total_cost NUMERIC(10,4) NOT NULL,    -- 總費用 (USD)

  -- 效能資訊
  started_at TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,            -- 執行時間 (毫秒)

  -- 額外資訊
  metadata JSONB,                        -- 詳細資訊 (model, prompt_name...)

  -- 時間戳記
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- 2.3 效能記錄表 (performance_records)
-- 說明: 記錄系統效能數據 (用於瓶頸分析)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS performance_records (
  -- 主鍵
  record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  execution_id UUID REFERENCES task_executions(execution_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 步驟識別
  task_type VARCHAR(100) NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_type VARCHAR(50),                 -- ai_call, db_query, file_operation...

  -- 時間資訊
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,             -- 耗時 (毫秒)

  -- 狀態
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,

  -- 詳細資訊
  metadata JSONB,

  -- 時間戳記
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- 2.4 系統日誌表 (system_logs)
-- 說明: 統一的系統日誌 (所有 log 都記錄在這裡)
-- 注意: 詳細設計見 overall-design/08-logging-monitoring.md
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS system_logs (
  -- 主鍵
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 時間
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 日誌層級
  level VARCHAR(10) NOT NULL,           -- DEBUG, INFO, WARN, ERROR
  type VARCHAR(100) NOT NULL,           -- http_request, task_started, ai_call_failed...

  -- 關聯資訊 (用於串連 log)
  execution_id UUID,
  request_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  call_id UUID,

  -- Log 內容 (完整的 JSONB)
  data JSONB NOT NULL,

  -- 索引欄位 (方便查詢)
  service VARCHAR(100),                  -- openai, google_video_ai...
  operation VARCHAR(200),                -- video_analysis, stt...
  step_name VARCHAR(100),                -- call_video_ai...

  -- 時間戳記
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 約束
  CONSTRAINT system_logs_level_check CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR'))
);

-- 說明為什麼所有 log 都放一張表:
-- - 按 execution_id 查詢時更方便 (不用 JOIN 多張表)
-- - PostgreSQL 的 JSONB 可以高效儲存不同結構的 log
-- - 可以用 type 欄位區分不同類型的 log
```

---

### 步驟 4: 建立索引 (加速查詢)

繼續在同一個 migration 檔案中加入索引:

```sql
-- =====================================================
-- 3. 索引 (Indexes)
-- 說明: 加速查詢效能
-- =====================================================

-- -----------------------------------------------------
-- 3.1 videos 表索引
-- -----------------------------------------------------
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_upload_time ON videos(upload_time DESC);

-- 說明為什麼需要索引:
-- - user_id: 經常需要查詢特定用戶的影片
-- - status: 需要篩選處理狀態 (例如:只看已分析的影片)
-- - upload_time DESC: 按上傳時間倒序排列 (最新的在前面)

-- -----------------------------------------------------
-- 3.2 segments 表索引
-- -----------------------------------------------------
CREATE INDEX idx_segments_video_id ON segments(video_id);
CREATE INDEX idx_segments_duration ON segments(duration);

-- -----------------------------------------------------
-- 3.3 segment_tags 表索引 (關鍵!)
-- -----------------------------------------------------
CREATE INDEX idx_segment_tags_tag ON segment_tags(tag);
CREATE INDEX idx_segment_tags_segment_id ON segment_tags(segment_id);
CREATE INDEX idx_segment_tags_tag_type ON segment_tags(tag_type);

-- 說明為什麼 tag 索引很重要:
-- - 智能選片時需要按 tag 搜尋片段 (WHERE tag IN ('產品', '特寫'))
-- - 這是系統的核心功能,查詢頻率非常高
-- - 沒有索引的話,查詢會很慢

-- -----------------------------------------------------
-- 3.4 voiceovers 表索引
-- -----------------------------------------------------
CREATE INDEX idx_voiceovers_user_id ON voiceovers(user_id);
CREATE INDEX idx_voiceovers_status ON voiceovers(status);

-- -----------------------------------------------------
-- 3.5 timelines 表索引
-- -----------------------------------------------------
CREATE INDEX idx_timelines_user_id ON timelines(user_id);
CREATE INDEX idx_timelines_voiceover_id ON timelines(voiceover_id);
CREATE INDEX idx_timelines_status ON timelines(status);

-- -----------------------------------------------------
-- 3.6 generated_videos 表索引
-- -----------------------------------------------------
CREATE INDEX idx_generated_videos_user_id ON generated_videos(user_id);
CREATE INDEX idx_generated_videos_timeline_id ON generated_videos(timeline_id);
CREATE INDEX idx_generated_videos_status ON generated_videos(status);

-- -----------------------------------------------------
-- 3.7 task_executions 表索引
-- -----------------------------------------------------
CREATE INDEX idx_task_executions_user_id ON task_executions(user_id);
CREATE INDEX idx_task_executions_status ON task_executions(status);
CREATE INDEX idx_task_executions_task_type ON task_executions(task_type);
CREATE INDEX idx_task_executions_created_at ON task_executions(created_at DESC);

-- -----------------------------------------------------
-- 3.8 cost_records 表索引
-- -----------------------------------------------------
CREATE INDEX idx_cost_records_execution_id ON cost_records(execution_id);
CREATE INDEX idx_cost_records_user_id ON cost_records(user_id);
CREATE INDEX idx_cost_records_service ON cost_records(service);
CREATE INDEX idx_cost_records_created_at ON cost_records(created_at DESC);

-- JSONB 欄位索引 (用於查詢 metadata 中的 prompt_name)
CREATE INDEX idx_cost_records_prompt_name ON cost_records((metadata->>'prompt_name'));

-- 說明 JSONB 索引:
-- - (metadata->>'prompt_name') 表示取出 JSON 中的 prompt_name 欄位
-- - 可以快速查詢特定 prompt 的成本

-- -----------------------------------------------------
-- 3.9 performance_records 表索引
-- -----------------------------------------------------
CREATE INDEX idx_performance_records_execution_id ON performance_records(execution_id);
CREATE INDEX idx_performance_records_step_name ON performance_records(step_name);
CREATE INDEX idx_performance_records_created_at ON performance_records(created_at DESC);

-- -----------------------------------------------------
-- 3.10 system_logs 表索引
-- -----------------------------------------------------
CREATE INDEX idx_system_logs_execution_id ON system_logs(execution_id);
CREATE INDEX idx_system_logs_request_id ON system_logs(request_id);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_type ON system_logs(type);

-- 複合索引 (用於常見查詢)
CREATE INDEX idx_system_logs_execution_level ON system_logs(execution_id, level);
CREATE INDEX idx_system_logs_user_timestamp ON system_logs(user_id, timestamp DESC);

-- JSONB 欄位索引
CREATE INDEX idx_system_logs_service ON system_logs(service);
CREATE INDEX idx_system_logs_step_name ON system_logs(step_name);
```

---

### 步驟 5: 設定 Row Level Security (RLS)

繼續在同一個 migration 檔案中加入 RLS 設定:

```sql
-- =====================================================
-- 4. Row Level Security (RLS)
-- 說明: 確保用戶只能存取自己的資料
-- =====================================================

-- 說明 RLS 的運作方式:
-- - 在資料庫層級強制執行存取控制
-- - 比在應用層檢查更安全 (無法繞過)
-- - 即使 SQL injection 也無法存取其他用戶的資料

-- -----------------------------------------------------
-- 4.1 啟用 RLS
-- -----------------------------------------------------

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE voiceovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- 4.2 建立 RLS 政策
-- -----------------------------------------------------

-- videos: 用戶只能看到自己的影片
CREATE POLICY videos_user_policy ON videos
  FOR ALL
  USING (auth.uid() = user_id);

-- segments: 用戶只能看到自己影片的片段
CREATE POLICY segments_user_policy ON segments
  FOR ALL
  USING (
    video_id IN (
      SELECT video_id FROM videos WHERE user_id = auth.uid()
    )
  );

-- segment_tags: 用戶只能看到自己片段的標籤
CREATE POLICY segment_tags_user_policy ON segment_tags
  FOR ALL
  USING (
    segment_id IN (
      SELECT s.segment_id FROM segments s
      JOIN videos v ON s.video_id = v.video_id
      WHERE v.user_id = auth.uid()
    )
  );

-- voiceovers: 用戶只能看到自己的配音
CREATE POLICY voiceovers_user_policy ON voiceovers
  FOR ALL
  USING (auth.uid() = user_id);

-- timelines: 用戶只能看到自己的時間軸
CREATE POLICY timelines_user_policy ON timelines
  FOR ALL
  USING (auth.uid() = user_id);

-- generated_videos: 用戶只能看到自己生成的影片
CREATE POLICY generated_videos_user_policy ON generated_videos
  FOR ALL
  USING (auth.uid() = user_id);

-- task_executions: 用戶只能看到自己的任務
CREATE POLICY task_executions_user_policy ON task_executions
  FOR ALL
  USING (auth.uid() = user_id);

-- cost_records: 用戶只能看到自己的成本記錄
CREATE POLICY cost_records_user_policy ON cost_records
  FOR ALL
  USING (auth.uid() = user_id);

-- performance_records: 用戶只能看到自己的效能記錄
CREATE POLICY performance_records_user_policy ON performance_records
  FOR ALL
  USING (auth.uid() = user_id);

-- system_logs: 用戶只能看到自己的日誌
CREATE POLICY system_logs_user_policy ON system_logs
  FOR ALL
  USING (auth.uid() = user_id);

-- 說明 auth.uid():
-- - Supabase 提供的函數,回傳目前登入用戶的 ID
-- - 自動從 JWT token 中取得
-- - 如果用戶未登入,回傳 NULL

-- 說明 FOR ALL:
-- - 這個 policy 適用於所有操作 (SELECT, INSERT, UPDATE, DELETE)
-- - 也可以分別設定,例如:
--   CREATE POLICY videos_select_policy ON videos FOR SELECT ...
--   CREATE POLICY videos_insert_policy ON videos FOR INSERT ...
```

---

### 步驟 6: 建立輔助函數 (Triggers)

繼續在同一個 migration 檔案中加入輔助函數:

```sql
-- =====================================================
-- 5. 輔助函數與 Triggers
-- 說明: 自動更新 updated_at 欄位
-- =====================================================

-- -----------------------------------------------------
-- 5.1 建立自動更新 updated_at 的函數
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 說明:
-- - 這是一個 PostgreSQL 函數
-- - 每次資料更新時,自動將 updated_at 設為目前時間
-- - $$ ... $$ 是 PostgreSQL 的字串語法

-- -----------------------------------------------------
-- 5.2 為需要的資料表建立 Trigger
-- -----------------------------------------------------

-- videos
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- voiceovers
CREATE TRIGGER update_voiceovers_updated_at
  BEFORE UPDATE ON voiceovers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- timelines
CREATE TRIGGER update_timelines_updated_at
  BEFORE UPDATE ON timelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 說明 Trigger:
-- - BEFORE UPDATE: 在資料更新前執行
-- - FOR EACH ROW: 對每一筆更新的資料都執行
-- - 自動化,不需要在應用層手動設定 updated_at

-- =====================================================
-- Migration 完成
-- =====================================================
```

---

### 步驟 7: 套用 Migration 到本地資料庫

先在本地測試 migration 是否正確:

```bash
# 啟動本地 Supabase (包含 PostgreSQL)
supabase start

# 這會下載並啟動 Docker 容器,可能需要幾分鐘
# 預期輸出會顯示各種服務的 URL
```

**預期輸出**:
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJhbGci...
service_role key: eyJhbGci...
```

**重要**: 記下這些資訊,後續測試會用到。

然後套用 migration:

```bash
# 套用所有 migration
supabase db reset

# 這會:
# 1. 清空本地資料庫
# 2. 依序執行所有 migration 檔案
# 3. 建立所有資料表、索引、RLS 政策
```

**預期輸出**:
```
Applying migration 20251007123456_create_core_tables.sql...
Migration applied successfully.
```

---

### 步驟 8: 驗證資料表是否建立成功

開啟 Supabase Studio (網頁介面) 檢查:

```bash
# 開啟瀏覽器到 Studio URL
open http://localhost:54323
```

**檢查項目**:
1. 左側選單應該顯示所有資料表
2. 點擊每個資料表,檢查欄位是否正確
3. 檢查 Policies 頁面,確認 RLS 政策已建立

**或使用 SQL 檢查**:

```sql
-- 查詢所有資料表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 應該看到這些表:
-- - cost_records
-- - generated_videos
-- - performance_records
-- - segment_tags
-- - segments
-- - system_logs
-- - task_executions
-- - timelines
-- - videos
-- - voiceovers
```

---

### 步驟 9: 建立測試資料

建立一些測試資料來驗證 schema 是否正確:

開啟 Supabase Studio → SQL Editor,執行:

```sql
-- 建立測試用戶 (使用 Supabase Auth)
-- 注意: 實際使用時應該透過 Supabase Auth API 建立用戶
-- 這裡僅用於測試

-- 建立測試影片
INSERT INTO videos (user_id, file_path, file_size, duration, resolution, format, status)
VALUES (
  auth.uid(),  -- 目前登入的用戶
  's3://test-bucket/test-video.mp4',
  52428800,  -- 50MB
  120.5,      -- 2分鐘
  '1920x1080',
  'mp4',
  'analyzed'
);

-- 取得剛建立的 video_id
-- (在 Studio 中會自動顯示)

-- 建立測試片段 (假設 video_id 為 'xxx-xxx-xxx')
INSERT INTO segments (video_id, start_time, end_time, thumbnail_url, scene_type)
VALUES
  ('xxx-xxx-xxx', 0, 5.2, 's3://test-bucket/thumb1.jpg', 'indoor'),
  ('xxx-xxx-xxx', 5.2, 12.8, 's3://test-bucket/thumb2.jpg', 'closeup'),
  ('xxx-xxx-xxx', 12.8, 20.0, 's3://test-bucket/thumb3.jpg', 'outdoor');

-- 建立測試標籤
INSERT INTO segment_tags (segment_id, tag, tag_type, confidence, source)
SELECT
  segment_id,
  '產品特寫',
  'visual',
  0.92,
  'ai'
FROM segments
WHERE video_id = 'xxx-xxx-xxx'
LIMIT 1;

-- 查詢測試資料
SELECT
  v.video_id,
  v.file_path,
  v.duration,
  s.segment_id,
  s.start_time,
  s.end_time,
  s.duration as segment_duration,
  STRING_AGG(st.tag, ', ') as tags
FROM videos v
JOIN segments s ON v.video_id = s.video_id
LEFT JOIN segment_tags st ON s.segment_id = st.segment_id
WHERE v.user_id = auth.uid()
GROUP BY v.video_id, s.segment_id
ORDER BY v.created_at DESC, s.start_time ASC;
```

**預期結果**: 應該看到剛建立的影片、片段與標籤資料。

---

### 步驟 10: 部署到 Supabase 雲端 (可選)

如果要部署到 Supabase 雲端:

```bash
# 1. 登入 Supabase
supabase login

# 2. 連結到你的 Supabase 專案
supabase link --project-ref YOUR_PROJECT_REF

# 3. 推送 migrations
supabase db push

# 這會將本地的 migration 套用到雲端資料庫
```

**注意**:
- 雲端資料庫的變更是**永久的**,請先在本地測試確認無誤
- 如果是正式環境,建議先備份資料庫

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (5 tests): 基礎資料表與設定
- 📁 **Functional Acceptance** (4 tests): 功能正確性
- 📁 **E2E Acceptance** (3 tests): 完整流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm test -- tests/phase-1/task-1.1

# 或分別執行
npm test -- tests/phase-1/task-1.1.basic.test.ts
npm test -- tests/phase-1/task-1.1.functional.test.ts
npm test -- tests/phase-1/task-1.1.e2e.test.ts
```

### 通過標準

- ✅ 所有 12 個測試通過 (5 + 4 + 3)
- ✅ 資料表已建立且結構正確
- ✅ 索引已建立
- ✅ RLS 政策正確運作
- ✅ 外鍵約束正確執行

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/phase-1/task-1.1.basic.test.ts`

1. ✓ 所有業務資料表已建立 (7 張表)
2. ✓ 所有系統資料表已建立 (4 張表)
3. ✓ 所有必要索引已建立
4. ✓ RLS 已啟用
5. ✓ Triggers 已建立

### Functional Acceptance (4 tests)

測試檔案: `tests/phase-1/task-1.1.functional.test.ts`

1. ✓ 可以正確插入與查詢資料
2. ✓ 外鍵約束正確執行 (CASCADE 刪除)
3. ✓ RLS 政策正確隔離用戶資料
4. ✓ updated_at 自動更新

### E2E Acceptance (3 tests)

測試檔案: `tests/phase-1/task-1.1.e2e.test.ts`

1. ✓ 完整的影片上傳流程 (影片 → 片段 → 標籤)
2. ✓ 完整的配音處理流程 (配音 → 時間軸 → 生成影片)
3. ✓ 成本追蹤資料正確記錄

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### Migration 檔案
- [ ] Migration 檔案已建立 (`supabase/migrations/[時間戳記]_create_core_tables.sql`)
- [ ] SQL 語法無錯誤
- [ ] 所有註解都已填寫

### 資料表
- [ ] 7 張業務資料表已建立
- [ ] 4 張系統資料表已建立
- [ ] 所有欄位型別正確
- [ ] 所有約束 (CHECK, FOREIGN KEY) 正確

### 索引
- [ ] 所有必要索引已建立
- [ ] JSONB 欄位索引已建立 (cost_records, system_logs)

### RLS
- [ ] 所有資料表已啟用 RLS
- [ ] 所有 RLS 政策已建立
- [ ] 政策邏輯正確 (用戶隔離)

### Triggers
- [ ] update_updated_at_column 函數已建立
- [ ] 所有需要的 Triggers 已建立

### 測試
- [ ] 本地測試通過 (supabase start + db reset)
- [ ] 可以在 Studio 中看到所有資料表
- [ ] 測試資料插入成功
- [ ] Basic Verification 測試通過 (5/5)
- [ ] Functional Acceptance 測試通過 (4/4)
- [ ] E2E Acceptance 測試通過 (3/3)
- [ ] **總計: 12/12 測試通過**

---

## 🐛 常見問題與解決方案

### Q1: Migration 執行失敗 - "relation already exists"

**錯誤訊息**:
```
ERROR: relation "videos" already exists
```

**原因**: 資料表已經存在 (可能之前執行過)

**解決方案**:
```bash
# 方法 1: 重置本地資料庫 (會清空所有資料!)
supabase db reset

# 方法 2: 在 SQL 中加上 IF NOT EXISTS (已經加了,檢查語法)
CREATE TABLE IF NOT EXISTS videos ...
```

---

### Q2: RLS 政策導致無法查詢資料

**錯誤訊息**:
查詢回傳空結果,但資料明明存在。

**原因**: RLS 政策阻擋了查詢 (auth.uid() 可能為 NULL)

**解決方案**:

```sql
-- 方法 1: 以 service_role 身份查詢 (繞過 RLS)
-- 在 Supabase Studio 的 SQL Editor 預設就是用 service_role

-- 方法 2: 確認已登入
SELECT auth.uid();  -- 應該回傳用戶 ID,不是 NULL

-- 方法 3: 臨時停用 RLS (僅測試用!)
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
-- 記得測試完要重新啟用!
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
```

---

### Q3: 外鍵約束錯誤

**錯誤訊息**:
```
ERROR: insert or update on table "segments" violates foreign key constraint
Key (video_id)=(xxx) is not present in table "videos"
```

**原因**: 嘗試插入的 video_id 不存在

**解決方案**:
```sql
-- 確認 video_id 是否存在
SELECT video_id FROM videos WHERE video_id = 'xxx';

-- 如果不存在,先建立 video
INSERT INTO videos (...) VALUES (...);
```

---

### Q4: JSONB 查詢無法使用索引

**問題**: 查詢 JSONB 欄位很慢

**解決方案**:
```sql
-- 確認索引是否建立
SELECT indexname FROM pg_indexes
WHERE tablename = 'cost_records'
AND indexdef LIKE '%prompt_name%';

-- 如果沒有,建立索引
CREATE INDEX idx_cost_records_prompt_name
ON cost_records((metadata->>'prompt_name'));

-- 查詢時使用正確的語法
SELECT * FROM cost_records
WHERE metadata->>'prompt_name' = 'segment_select';  -- ✓ 正確,會用索引

-- 不要用
SELECT * FROM cost_records
WHERE metadata LIKE '%segment_select%';  -- ✗ 錯誤,不會用索引
```

---

### Q5: Trigger 沒有自動更新 updated_at

**問題**: 更新資料後,updated_at 還是舊的時間

**解決方案**:

```sql
-- 檢查 Trigger 是否建立
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'videos';

-- 如果沒有,重新建立
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 測試
UPDATE videos SET status = 'analyzed' WHERE video_id = 'xxx';
SELECT video_id, status, updated_at FROM videos WHERE video_id = 'xxx';
-- updated_at 應該是剛剛的時間
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **PostgreSQL 官方文件**: https://www.postgresql.org/docs/
- **Supabase 文件**: https://supabase.com/docs
- **PostgreSQL 索引指南**: https://www.postgresql.org/docs/current/indexes.html
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **JSONB 使用指南**: https://www.postgresql.org/docs/current/datatype-json.html

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ Migration 檔案已建立且可執行
3. ✅ 所有三層驗收測試都通過 (12/12)
4. ✅ 完成檢查清單都勾選
5. ✅ 可以在 Supabase Studio 中看到完整的資料表結構

### 最終驗收指令

```bash
# 重置資料庫並套用 migration
supabase db reset

# 執行所有驗收測試
npm test -- tests/phase-1/task-1.1

# 如果全部通過,你應該看到:
# PASS tests/phase-1/task-1.1.basic.test.ts
# PASS tests/phase-1/task-1.1.functional.test.ts
# PASS tests/phase-1/task-1.1.e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       12 passed, 12 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 1.1 完成了!

---

**下一步**: Task 1.2 - 設定 Supabase Auth

---

**文件版本**: 1.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
