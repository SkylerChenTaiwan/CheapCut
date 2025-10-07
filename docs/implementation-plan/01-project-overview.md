# CheapCut Implementation Plan

**版本**: 1.0
**建立日期**: 2025-10-07
**目標**: 從零開始建立 CheapCut MVP 系統

---

## 📋 文件導覽

- **本文件**: 總覽與執行計劃
- **[測試架構文件](docs/implementation-plan/02-testing-framework.md)**: 測試策略與驗收機制
- **測試資料**: `test-data/` 資料夾

---

## 🎯 專案目標

建立一個**影片自動剪輯 SaaS 平台**,讓業務人員能夠:

1. 上傳自己拍攝的影片素材
2. 錄製配音或上傳音檔
3. 由 AI 自動選片並生成社群媒體短影片
4. 預覽並下載成品

**核心價值**: 用極低成本($0.031/支)自動化產出高品質短影片

---

## 📊 技術棧總覽

### 前端
- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS + shadcn/ui
- **狀態管理**: React Context / Zustand

### 後端
- **框架**: Node.js + Express (或 Fastify)
- **語言**: TypeScript
- **認證**: Supabase Auth
- **任務佇列**: Bull / BullMQ (Redis)

### 資料庫
- **主資料庫**: PostgreSQL (Supabase 免費層)
- **快取**: Redis (Upstash 免費層)

### 儲存與 CDN
- **物件儲存**: GCP Cloud Storage
- **CDN**: Cloudflare 免費層

### AI 服務
- **文字生成**: Gemini Flash (免費) / GPT-4 (備用)
- **語音轉文字**: OpenAI Whisper API
- **影片分析**: Google Video Intelligence API

### 影片處理
- **渲染引擎**: FFmpeg (Cloud Run 上執行)
- **編碼庫**: fluent-ffmpeg (Node.js wrapper)

### 部署
- **前端**: Vercel
- **後端**: GCP Cloud Run
- **資料庫**: Supabase (託管)

---

## 🏗️ 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                         用戶端                                │
│                    (Next.js Web App)                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│                   (Express + Cloud Run)                      │
└─┬───────────────────┬─────────────────┬─────────────────┬───┘
  │                   │                 │                 │
  │ 認證              │ 資料查詢         │ 任務提交         │ 檔案上傳
  ▼                   ▼                 ▼                 ▼
┌─────────┐    ┌──────────────┐  ┌──────────────┐  ┌──────────┐
│Supabase │    │ PostgreSQL   │  │ Redis Queue  │  │ GCS      │
│  Auth   │    │  Database    │  │              │  │ Storage  │
└─────────┘    └──────────────┘  └───────┬──────┘  └──────────┘
                                          │
                                          │ 任務消費
                                          ▼
                              ┌─────────────────────┐
                              │   Background Jobs   │
                              │  (Worker Process)   │
                              └──────────┬──────────┘
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   │                     │                     │
                   ▼                     ▼                     ▼
            ┌────────────┐      ┌──────────────┐     ┌─────────────┐
            │ 素材處理    │      │ 配音處理      │     │ 影片生成     │
            │   引擎     │      │   引擎       │     │   引擎      │
            └────────────┘      └──────────────┘     └─────────────┘
                   │                     │                     │
                   └─────────────────────┼─────────────────────┘
                                         │
                                         │ 呼叫外部服務
                                         ▼
                    ┌────────────────────────────────────┐
                    │        External Services           │
                    │  • Google Video AI                 │
                    │  • OpenAI Whisper / GPT            │
                    │  • Gemini Flash                    │
                    └────────────────────────────────────┘
```

---

## 📅 開發階段規劃

整個專案分為 5 個階段,每個階段都有明確的驗收標準:

| 階段 | 名稱 | 目標 | 預估時間 | 狀態 |
|------|------|------|---------|------|
| **Phase 0** | 測試環境建立 | 建立驗收測試框架 | 3-5 天 | ⏸ 待開始 |
| **Phase 1** | 基礎設施建立 | 資料庫、認證、API 框架 | 5-7 天 | ⏸ 待開始 |
| **Phase 2** | 核心引擎實作 | 三大引擎 + Logging | 10-14 天 | ⏸ 待開始 |
| **Phase 3** | 前端介面開發 | 完整用戶流程 UI | 7-10 天 | ⏸ 待開始 |
| **Phase 4** | 整合測試與部署 | 端對端測試與上線 | 3-5 天 | ⏸ 待開始 |

**總計**: 28-41 天 (約 4-6 週)

---

## 🎯 Phase 0: 測試環境建立

**目標**: 建立自動化驗收測試框架,確保後續每個 task 都能被驗證

**為什麼要先做測試?**
- 你完全依賴 Claude Code 寫程式
- 需要確保每個功能都能自動驗證
- 避免後期發現大量問題

### Task 0.1: 建立驗收 CLI 框架

**功能描述**:
建立一個基礎的驗收測試 CLI 工具,能夠執行測試並產生報告。

**實作步驟**:

1. 初始化 Node.js 專案
```bash
npm init -y
npm install --save-dev jest @types/jest ts-jest typescript
npm install --save-dev @types/node
```

2. 建立 TypeScript 設定
```bash
npx tsc --init
```

3. 建立測試資料夾結構
```
tests/
├── acceptance/
│   ├── basic/
│   ├── feature/
│   ├── e2e/
│   └── cost/
└── utils/
    ├── test-runner.ts
    └── report-generator.ts
```

4. 建立基礎測試執行器 `tests/utils/test-runner.ts`
```typescript
export class TestRunner {
  async runBasicVerification(): Promise<TestResult> {
    // 實作基礎驗證邏輯
  }

  async runFeatureVerification(module: string): Promise<TestResult> {
    // 實作功能驗證邏輯
  }

  async generateReport(results: TestResult[]): Promise<void> {
    // 產生測試報告
  }
}
```

5. 建立 npm scripts 在 `package.json`
```json
{
  "scripts": {
    "verify:basic": "ts-node tests/acceptance/basic/run.ts",
    "verify:feature": "ts-node tests/acceptance/feature/run.ts",
    "verify:all": "ts-node tests/run-all.ts"
  }
}
```

**驗收標準**:

#### Basic Verification
- [ ] 專案已初始化,`package.json` 存在
- [ ] TypeScript 設定正確,可以編譯
- [ ] 測試資料夾結構完整建立
- [ ] 可以執行 `npm run verify:basic` (即使目前沒有測試)

#### Functional Acceptance
- [ ] TestRunner 類別已建立
- [ ] 可以執行空測試並返回結果
- [ ] 測試報告可以正確產生 (JSON 格式)

#### E2E Acceptance
- [ ] 執行 `npm run verify:all` 可以完整執行所有測試階段

**驗收指令**:
```bash
npm run verify -- --task=task-0.1
```

**預期驗收時間**: 30 分鐘

---

### Task 0.2: 建立環境檢查測試

**功能描述**:
實作基礎驗證測試,檢查開發環境是否正確設定。

**實作步驟**:

1. 建立環境變數檢查 `tests/acceptance/basic/check-env.test.ts`
```typescript
describe('Environment Verification', () => {
  test('應該有所有必要的環境變數', () => {
    const required = [
      'DATABASE_URL',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'GCS_PROJECT_ID',
      'OPENAI_API_KEY',
      'GOOGLE_APPLICATION_CREDENTIALS'
    ];

    for (const key of required) {
      expect(process.env[key]).toBeDefined();
    }
  });
});
```

2. 建立 Node.js 版本檢查
```typescript
test('Node.js 版本應該 >= 18', () => {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  expect(major).toBeGreaterThanOrEqual(18);
});
```

3. 建立套件安裝檢查
```typescript
test('所有必要套件已安裝', () => {
  const packages = ['express', 'typescript', 'jest'];
  // 檢查 package.json 與 node_modules
});
```

4. 建立 `.env.example` 檔案
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/cheapcut

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...

# GCP
GCS_PROJECT_ID=cheapcut-project
GOOGLE_APPLICATION_CREDENTIALS=./gcp-key.json

# OpenAI
OPENAI_API_KEY=sk-xxx

# Gemini
GEMINI_API_KEY=xxx
```

**驗收標準**:

#### Basic Verification
- [ ] `.env.example` 檔案已建立
- [ ] 環境變數檢查測試已實作
- [ ] Node.js 版本檢查通過

#### Functional Acceptance
- [ ] 執行 `npm run verify:basic` 可以檢測缺少的環境變數
- [ ] 如果環境變數不完整,會清楚列出缺少哪些

#### E2E Acceptance
- [ ] 設定完整的 `.env` 後,所有檢查都通過

**驗收指令**:
```bash
npm run verify -- --task=task-0.2
```

**預期驗收時間**: 20 分鐘

---

### Task 0.3: 建立測試報告產生器

**功能描述**:
實作測試報告產生器,能夠產生結構化的 JSON 報告與人類可讀的 HTML 報告。

**實作步驟**:

1. 建立報告產生器 `tests/utils/report-generator.ts`
```typescript
interface TestReport {
  timestamp: Date;
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  tests: TestDetail[];
}

export class ReportGenerator {
  generateJSON(results: TestResult[]): TestReport {
    // 產生 JSON 報告
  }

  generateHTML(report: TestReport): string {
    // 產生 HTML 報告
  }

  async saveReport(report: TestReport, outputDir: string): Promise<void> {
    // 儲存報告到檔案
  }
}
```

2. 建立 HTML 模板 `tests/templates/report.html`
```html
<!DOCTYPE html>
<html>
<head>
  <title>CheapCut 驗收測試報告</title>
  <style>
    /* 簡潔的 CSS 樣式 */
  </style>
</head>
<body>
  <h1>驗收測試報告</h1>
  <div class="summary">
    <div class="metric">
      <h3>總測試數</h3>
      <p>{{totalTests}}</p>
    </div>
    <div class="metric success">
      <h3>通過</h3>
      <p>{{passed}}</p>
    </div>
    <div class="metric failed">
      <h3>失敗</h3>
      <p>{{failed}}</p>
    </div>
  </div>
  <!-- 詳細測試結果 -->
</body>
</html>
```

3. 整合報告產生到測試流程
```typescript
// tests/run-all.ts
const runner = new TestRunner();
const results = await runner.runAll();
const report = reportGenerator.generateJSON(results);
await reportGenerator.saveReport(report, 'test-data/results/latest');
```

**驗收標準**:

#### Basic Verification
- [ ] ReportGenerator 類別已建立
- [ ] HTML 模板已建立

#### Functional Acceptance
- [ ] 可以產生 JSON 格式的測試報告
- [ ] 可以產生 HTML 格式的測試報告
- [ ] 報告包含所有必要資訊 (測試數、通過/失敗、耗時)
- [ ] 報告正確儲存到 `test-data/results/` 資料夾

#### E2E Acceptance
- [ ] 執行完整測試後,可以開啟 HTML 報告查看結果
- [ ] HTML 報告清楚顯示哪些測試失敗,包含錯誤訊息

**驗收指令**:
```bash
npm run verify -- --task=task-0.3
```

**預期驗收時間**: 1 小時

---

## Phase 0 完成檢查清單

完成 Phase 0 後,你應該有:

- [ ] ✅ 可運作的測試框架
- [ ] ✅ 環境檢查測試
- [ ] ✅ 測試報告產生器
- [ ] ✅ 完整的 `test-data/` 資料夾結構
- [ ] ✅ 所有測試資料已準備 (影片檔案等)
- [ ] ✅ 可以執行 `npm run verify:all` 並看到報告

**Phase 0 驗收**:
```bash
npm run verify:all
# 應該看到完整的測試報告,所有基礎檢查都通過
```

**預計完成時間**: 3-5 天

---

## 🏗️ Phase 1: 基礎設施建立

**目標**: 建立專案基礎架構,包括資料庫、認證、API 框架

### Task 1.1: 建立資料庫 Schema

**功能描述**:
根據設計文件建立完整的 PostgreSQL 資料庫 Schema。

**前置知識**:
- PostgreSQL 基礎語法
- 資料表關聯 (Foreign Key)
- 索引概念

**實作步驟**:

1. 連接到 Supabase,建立新專案
   - 到 https://supabase.com 註冊
   - 建立新專案 "cheapcut-dev"
   - 記下 Database URL 與 API Keys

2. 建立資料庫遷移檔案 `migrations/001_initial_schema.sql`

```sql
-- ============================================
-- 用戶相關表
-- ============================================

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 影片素材相關表
-- ============================================

CREATE TABLE videos (
  video_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

  -- 檔案資訊
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,

  -- 影片資訊
  duration DECIMAL(10, 2) NOT NULL,
  resolution VARCHAR(20),
  format VARCHAR(20),

  -- 狀態
  status VARCHAR(20) DEFAULT 'pending',
  -- pending | analyzing | analyzed | failed

  error_message TEXT,

  -- Metadata (JSON)
  metadata JSONB,

  -- 時間戳記
  upload_time TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_videos_user ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);

-- ============================================
-- 影片片段表 (分析後產生)
-- ============================================

CREATE TABLE segments (
  segment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,

  -- 片段資訊
  start_time DECIMAL(10, 2) NOT NULL,
  end_time DECIMAL(10, 2) NOT NULL,
  duration DECIMAL(10, 2) NOT NULL,

  -- 檔案路徑
  thumbnail_url TEXT,

  -- AI 生成的描述
  description TEXT,
  scene_type VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_segments_video ON segments(video_id);
CREATE INDEX idx_segments_duration ON segments(duration);

-- ============================================
-- 片段標籤表 (直接儲存標籤字串)
-- ============================================

CREATE TABLE segment_tags (
  segment_id UUID NOT NULL REFERENCES segments(segment_id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  tag_type VARCHAR(50),
  confidence DECIMAL(3, 2),
  source VARCHAR(10) NOT NULL DEFAULT 'ai',
  -- 'ai' | 'user'

  created_at TIMESTAMP DEFAULT NOW(),

  PRIMARY KEY (segment_id, tag)
);

CREATE INDEX idx_segment_tags_tag ON segment_tags(tag);
CREATE INDEX idx_segment_tags_segment ON segment_tags(segment_id);

-- ============================================
-- 配音表
-- ============================================

CREATE TABLE voiceovers (
  voiceover_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

  -- 檔案資訊
  file_path TEXT NOT NULL,
  duration DECIMAL(10, 2) NOT NULL,

  -- STT 轉錄結果
  transcript TEXT,
  transcript_json JSONB,
  -- 帶時間軸的完整轉錄
  -- { "segments": [{ "text": "...", "start": 0.0, "end": 1.2 }] }

  -- 語意分析結果
  semantic_analysis JSONB,
  -- { "topics": [...], "keywords": [...], "tone": "..." }

  -- 狀態
  status VARCHAR(20) DEFAULT 'pending',
  -- pending | processed | failed

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_voiceovers_user ON voiceovers(user_id);
CREATE INDEX idx_voiceovers_status ON voiceovers(status);

-- ============================================
-- 時間軸表 (智能選片結果)
-- ============================================

CREATE TABLE timelines (
  timeline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  voiceover_id UUID NOT NULL REFERENCES voiceovers(voiceover_id) ON DELETE CASCADE,

  -- 時間軸 JSON (包含所有片段、配樂、字幕資訊)
  timeline_json JSONB NOT NULL,

  -- 狀態
  status VARCHAR(20) DEFAULT 'draft',
  -- draft | final

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timelines_user ON timelines(user_id);
CREATE INDEX idx_timelines_voiceover ON timelines(voiceover_id);
CREATE INDEX idx_timelines_status ON timelines(status);

-- ============================================
-- 生成影片表
-- ============================================

CREATE TABLE generated_videos (
  video_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  timeline_id UUID NOT NULL REFERENCES timelines(timeline_id) ON DELETE CASCADE,
  voiceover_id UUID NOT NULL REFERENCES voiceovers(voiceover_id) ON DELETE CASCADE,

  -- 影片資訊
  file_path TEXT,
  thumbnail_url TEXT,
  file_size BIGINT,
  duration DECIMAL(10, 2),
  resolution VARCHAR(20),
  format VARCHAR(20),

  -- 狀態
  status VARCHAR(20) DEFAULT 'pending',
  -- pending | processing | completed | failed

  -- 錯誤訊息
  error_message TEXT,

  -- 時間戳記
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generated_videos_user ON generated_videos(user_id);
CREATE INDEX idx_generated_videos_status ON generated_videos(status);

-- ============================================
-- 任務執行記錄表
-- ============================================

CREATE TABLE task_executions (
  execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

  -- 任務類型
  task_type VARCHAR(50) NOT NULL,
  -- material_analysis | voiceover_processing | video_generation

  -- 關聯資源
  related_id UUID,
  -- 可能是 video_id, voiceover_id, 或 timeline_id

  -- 狀態
  status VARCHAR(20) DEFAULT 'pending',
  -- pending | processing | completed | failed

  -- 進度追蹤
  current_step VARCHAR(100),
  step_index INTEGER DEFAULT 0,
  total_steps INTEGER,
  steps JSONB,
  -- [{ "name": "...", "status": "...", "started_at": "...", "completed_at": "...", "result": {...}, "cost": 0.1 }]

  -- 輸入輸出
  input_data JSONB,
  output_data JSONB,

  -- 成本與效能
  total_cost DECIMAL(10, 6) DEFAULT 0,
  ai_calls_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  execution_time INTEGER,

  -- 錯誤處理
  error_message TEXT,
  failed_step VARCHAR(100),

  -- 時間戳記
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_task_executions_user ON task_executions(user_id);
CREATE INDEX idx_task_executions_type ON task_executions(task_type);
CREATE INDEX idx_task_executions_status ON task_executions(status);
CREATE INDEX idx_task_executions_created ON task_executions(created_at DESC);

-- ============================================
-- 成本記錄表
-- ============================================

CREATE TABLE cost_records (
  record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  execution_id UUID REFERENCES task_executions(execution_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

  -- 服務資訊
  service VARCHAR(50) NOT NULL,
  -- gemini | openai | whisper | google_video_ai | gcs | cloudflare_stream
  operation VARCHAR(100) NOT NULL,

  -- 成本計算
  quantity DECIMAL(15, 6) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_cost DECIMAL(10, 6) NOT NULL,
  total_cost DECIMAL(10, 6) NOT NULL,

  -- 效能
  started_at TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,

  -- 額外資訊
  metadata JSONB,
  -- { "model": "gemini-flash", "prompt_name": "...", "prompt_version": 2, "request_tokens": 1500, "response_tokens": 500 }

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cost_records_execution ON cost_records(execution_id);
CREATE INDEX idx_cost_records_user_date ON cost_records(user_id, created_at DESC);
CREATE INDEX idx_cost_records_service ON cost_records(service, created_at DESC);

-- ============================================
-- 系統日誌表
-- ============================================

CREATE TABLE system_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 時間與級別
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  level VARCHAR(10) NOT NULL,
  -- DEBUG | INFO | WARN | ERROR
  type VARCHAR(50) NOT NULL,
  -- API_REQUEST | AI_CALL | DB_QUERY | FILE_OPERATION | TASK_EXECUTION | ERROR

  -- 關聯資訊
  execution_id UUID,
  request_id VARCHAR(100),
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  call_id VARCHAR(100),

  -- 日誌內容
  data JSONB NOT NULL,

  -- 索引欄位 (從 data 中提取，方便查詢)
  service VARCHAR(50),
  operation VARCHAR(100),
  step_name VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_logs_execution ON system_logs(execution_id);
CREATE INDEX idx_system_logs_request ON system_logs(request_id);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_type ON system_logs(type);
CREATE INDEX idx_system_logs_service ON system_logs(service);
```

3. 執行遷移
```bash
# 使用 Supabase CLI
npx supabase db push

# 或直接在 Supabase Dashboard 的 SQL Editor 執行
```

4. 驗證 Schema
```typescript
// tests/acceptance/basic/check-database.test.ts
describe('Database Schema Verification', () => {
  test('所有資料表已建立', async () => {
    const tables = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const expectedTables = [
      'users', 'videos', 'segments', 'tags', 'segment_tags',
      'voiceovers', 'voiceover_segments', 'generated_videos',
      'task_executions', 'cost_records', 'system_logs'
    ];

    for (const table of expectedTables) {
      expect(tables.rows.map(r => r.table_name)).toContain(table);
    }
  });

  test('所有索引已建立', async () => {
    // 檢查關鍵索引是否存在
  });
});
```

**驗收標準**:

#### Basic Verification
- [ ] 資料庫連線正常 (可以從本地連接到 Supabase)
- [ ] `migrations/001_initial_schema.sql` 檔案已建立

#### Functional Acceptance
- [ ] 所有 10 張資料表已建立：
  - [ ] users
  - [ ] videos
  - [ ] segments
  - [ ] segment_tags
  - [ ] voiceovers
  - [ ] timelines
  - [ ] generated_videos
  - [ ] task_executions
  - [ ] cost_records
  - [ ] system_logs
- [ ] 所有 Foreign Key 關聯正確設定
- [ ] 所有索引已建立
- [ ] 可以成功 INSERT 測試資料到每張表

#### E2E Acceptance
- [ ] 執行資料庫檢查測試,所有檢查通過
- [ ] 可以建立完整的資料關聯 (user → video → segments → tags)

**驗收指令**:
```bash
npm run verify -- --task=task-1.1
```

**預期驗收時間**: 1-2 小時

---

### Task 1.2: 設定 Supabase Auth

**功能描述**:
整合 Supabase Auth,實作用戶註冊、登入功能。

**實作步驟**:

1. 安裝 Supabase 客戶端
```bash
npm install @supabase/supabase-js
```

2. 建立 Supabase 客戶端 `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

3. 建立認證服務 `src/services/auth.service.ts`
```typescript
export class AuthService {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    // 在 users 表建立對應記錄
    await db.users.insert({
      user_id: data.user!.id,
      email: data.user!.email!
    });

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  async getUser(token: string) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
  }
}
```

4. 建立認證中間件 `src/middleware/auth.middleware.ts`
```typescript
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await authService.getUser(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

5. 建立認證 API 端點 `src/routes/auth.routes.ts`
```typescript
router.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.signUp(email, password);
  res.json(result);
});

router.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.signIn(email, password);
  res.json(result);
});

router.get('/auth/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});
```

**驗收標準**:

#### Basic Verification
- [ ] Supabase 客戶端已設定
- [ ] 環境變數 `SUPABASE_URL` 與 `SUPABASE_ANON_KEY` 已設定

#### Functional Acceptance
- [ ] 可以成功註冊新用戶 (POST /auth/signup)
- [ ] 可以成功登入 (POST /auth/signin)
- [ ] 登入後會返回 JWT token
- [ ] 使用 token 可以取得用戶資訊 (GET /auth/me)
- [ ] 無效的 token 會被拒絕 (401 錯誤)

#### E2E Acceptance
- [ ] 完整流程: 註冊 → 登入 → 呼叫需要認證的 API
- [ ] 用戶資料正確寫入 `users` 表

**驗收指令**:
```bash
npm run verify -- --task=task-1.2
```

**測試方式**:
```bash
# 註冊
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'

# 登入
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'

# 取得用戶資訊
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

**預期驗收時間**: 2-3 小時

---

### Task 1.3: 建立 API 基礎架構

**功能描述**:
建立 Express API 伺服器基礎架構,包含路由、錯誤處理、日誌等。

**實作步驟**:

1. 安裝必要套件
```bash
npm install express cors helmet dotenv
npm install --save-dev @types/express @types/cors
```

2. 建立主伺服器 `src/server.ts`
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(helmet());
app.use(cors());
app.use(express.json());

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
import authRoutes from './routes/auth.routes';
import materialsRoutes from './routes/materials.routes';
import voiceoversRoutes from './routes/voiceovers.routes';
import videosRoutes from './routes/videos.routes';

app.use('/api', authRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/voiceovers', voiceoversRoutes);
app.use('/api/videos', videosRoutes);

// 全域錯誤處理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

3. 建立路由骨架

`src/routes/materials.routes.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要認證
router.use(authMiddleware);

// 上傳素材影片
router.post('/upload', async (req, res) => {
  // TODO: 實作
  res.status(501).json({ message: 'Not implemented yet' });
});

// 取得上傳用的 presigned URL
router.post('/upload-url', async (req, res) => {
  // TODO: 實作
  res.status(501).json({ message: 'Not implemented yet' });
});

// 開始分析素材
router.post('/:videoId/analyze', async (req, res) => {
  // TODO: 實作
  res.status(501).json({ message: 'Not implemented yet' });
});

// 查詢素材列表
router.get('/', async (req, res) => {
  // TODO: 實作
  res.status(501).json({ message: 'Not implemented yet' });
});

// 查詢單個素材詳情
router.get('/:videoId', async (req, res) => {
  // TODO: 實作
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
```

`src/routes/voiceovers.routes.ts`:
```typescript
const router = Router();
router.use(authMiddleware);

router.post('/upload-url', async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/:voiceoverId/process', async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/', async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
```

`src/routes/videos.routes.ts`:
```typescript
const router = Router();
router.use(authMiddleware);

router.post('/generate', async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/', async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/:videoId', async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
```

4. 建立啟動腳本 `package.json`
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

**驗收標準**:

#### Basic Verification
- [ ] Express 伺服器可以啟動
- [ ] 健康檢查端點可以存取 (GET /health 返回 200)
- [ ] 所有路由骨架已建立

#### Functional Acceptance
- [ ] 所有 API 端點都返回 501 (Not Implemented)
- [ ] 需要認證的端點會檢查 token (無 token 返回 401)
- [ ] CORS 設定正確 (可以從前端呼叫)

#### E2E Acceptance
- [ ] 伺服器可以在開發模式下執行 (npm run dev)
- [ ] 修改程式碼後自動重啟
- [ ] 所有路由都可以正確路由到對應的 handler

**驗收指令**:
```bash
npm run verify -- --task=task-1.3
```

**測試方式**:
```bash
# 啟動伺服器
npm run dev

# 測試健康檢查
curl http://localhost:3000/health

# 測試 API 端點 (應該返回 401 或 501)
curl http://localhost:3000/api/materials
```

**預期驗收時間**: 2-3 小時

---

## Phase 1 完成檢查清單

完成 Phase 1 後,你應該有:

- [ ] ✅ 完整的資料庫 Schema
- [ ] ✅ Supabase Auth 整合
- [ ] ✅ 可運作的 Express API 伺服器
- [ ] ✅ 所有 API 路由骨架
- [ ] ✅ 認證中間件
- [ ] ✅ 健康檢查端點

**Phase 1 驗收**:
```bash
npm run verify -- --phase=phase-1
# 應該顯示所有基礎設施都已正確建立
```

**預計完成時間**: 5-7 天

---

## 🎯 下一步

Phase 1 完成後,接下來是 Phase 2: 核心引擎實作。這是最複雜的部分,會實作:

- 素材處理引擎 (Task 2.1-2.4)
- 配音處理引擎 (Task 2.5-2.7)
- 智能選片引擎 (Task 2.8-2.10)
- 影片合成引擎 (Task 2.11-2.13)
- Logging 系統 (Task 2.14-2.15)

每個 Task 都會有詳細的步驟說明與驗收標準。

---

## 📝 注意事項

1. **按順序執行**: Task 之間有依賴關係,必須按順序完成
2. **完成驗收**: 每個 Task 完成後必須執行驗收測試
3. **記錄問題**: 遇到問題時記錄在 test-data/results/ 中
4. **提交程式碼**: 每完成一個 Task 就 commit (依照 CLAUDE.md 規則)

---

**文件版本**: 1.0
**最後更新**: 2025-10-07
**下一份文件**: Phase 2 詳細計劃 (待撰寫)
