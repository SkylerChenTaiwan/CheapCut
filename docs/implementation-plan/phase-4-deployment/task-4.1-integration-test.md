# Task 4.1: 整合測試

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 4.1 |
| **Task 名稱** | 整合測試 |
| **所屬 Phase** | Phase 4: 測試與部署 |
| **預估時間** | 4-5 小時 (測試設計 2h + 測試實作 2h + 除錯 1h) |
| **難度** | ⭐⭐⭐ 中等偏難 |
| **前置 Task** | Task 3.8 (下載與分享) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的整合測試問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3000
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 後端服務沒有啟動
   ```

2. **判斷問題類型**
   - `ECONNREFUSED` → 服務沒有啟動或 port 錯誤
   - `401 Unauthorized` → 認證失敗,缺少 token
   - `500 Internal Server Error` → 後端出錯,檢查伺服器 log
   - `timeout` → 請求逾時,可能是效能問題

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"測試失敗"  ← 太模糊
"API 錯誤" ← 沒有具體錯誤訊息
```

**✅ 好的搜尋方式**:
```
"Jest supertest ECONNREFUSED" ← 包含工具和錯誤
"integration test API timeout solution" ← 說明問題和需求
"axios mock external API jest" ← 說明要做什麼
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件**
- Jest: https://jestjs.io/docs/getting-started
- Supertest: https://github.com/ladjs/supertest
- Testing Library: https://testing-library.com/docs/

**優先順序 2: Stack Overflow**
- 搜尋時加上 `site:stackoverflow.com`
- 看「✓ 已接受的答案」

**優先順序 3: GitHub Issues**
- 搜尋: `site:github.com [套件名稱] [錯誤訊息]`

---

### Step 3: 檢查服務狀態

很多整合測試失敗是因為服務沒有啟動:

```bash
# 檢查後端是否在運行
curl http://localhost:3000/api/health

# 檢查前端是否在運行
curl http://localhost:3001

# 檢查 database 連線
psql -h localhost -U postgres -d cheapcut -c "SELECT 1"

# 檢查 Redis 連線
redis-cli ping
```

---

### Step 4: 問題還是沒解決?

**準備以下資訊尋求協助**:

```markdown
## 問題描述
我在執行 Task 4.1 整合測試時遇到問題

## 測試情境
我在測試 [具體功能,例如: 使用者上傳影片 API]

## 錯誤訊息
```
[貼上完整的錯誤訊息]
```

## 我的環境
- Node.js 版本: v18.12.0
- 測試框架: Jest 29.x
- 後端是否啟動: 是/否
- 資料庫是否連線: 是/否

## 我已經嘗試過
1. 檢查服務是否啟動 → 服務正常
2. 檢查環境變數 → 已設定
3. 重新安裝套件 → 還是失敗

## 測試程式碼
[貼上相關的測試程式碼]
```

---

### 🎯 除錯心法

1. **測試要獨立** - 每個測試不應該依賴其他測試的結果
2. **清理測試資料** - 測試完要清理建立的資料
3. **用 Mock 隔離外部服務** - 不要每次測試都真的呼叫 OpenAI
4. **檢查測試順序** - 有時候測試順序會影響結果

---

## 🎯 功能描述

建立完整的整合測試套件,測試系統各個模組之間的協作是否正常。整合測試會確保前端、後端、資料庫、外部 API 之間的互動都符合預期。

### 為什麼需要這個?

- 🎯 **問題**: 單元測試只測試單一模組,無法發現模組之間協作的問題
- ✅ **解決**: 整合測試模擬真實情境,測試多個模組一起運作
- 💡 **比喻**: 就像樂團排練,每個樂手(模組)都會演奏,但需要合奏測試確保大家配合得宜

### 完成後你會有:

- 完整的整合測試套件
- API 端點測試
- 前後端整合測試
- 外部服務 mock 機制
- 自動化測試報告

---

## 📚 前置知識

以下是這個 Task 會用到的概念:

- **整合測試**: 測試多個模組一起運作 → 確保模組之間的介面正確
- **API 測試**: 測試 HTTP API 端點 → 用 supertest 模擬 HTTP 請求
- **Mock**: 模擬外部服務的回應 → 避免真的呼叫 OpenAI/Gemini
- **Test Fixtures**: 測試用的固定資料 → 確保測試結果可重現

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 0.1: 建立驗收 CLI 框架
- ✅ Task 0.2: 建立環境檢查測試
- ✅ Task 3.8: 下載與分享功能

### 需要安裝的套件

```bash
# 安裝整合測試相關套件
npm install --save-dev supertest
npm install --save-dev @types/supertest
npm install --save-dev nock  # 用於 mock HTTP 請求
npm install --save-dev @types/nock
```

### 環境檢查

```bash
# 確認 Task 0.1 已完成
npm run verify:basic
# 應該可以執行且通過

# 確認後端可以啟動
npm run dev:backend
# 應該在 http://localhost:3000 啟動

# 確認資料庫連線
npm run verify:env
# 應該通過資料庫連線檢查
```

---

## 📝 實作步驟

### 步驟 1: 建立測試資料夾結構

```bash
# 建立整合測試資料夾
mkdir -p tests/integration/api
mkdir -p tests/integration/services
mkdir -p tests/integration/workflows
mkdir -p tests/fixtures
mkdir -p tests/helpers
```

**確認結構**:
```bash
tree tests/integration
# tests/integration/
# ├── api/           # API 端點測試
# ├── services/      # 服務層測試
# └── workflows/     # 完整工作流程測試
```

---

### 步驟 2: 建立測試輔助工具

建立 `tests/helpers/test-server.ts`:

```typescript
import express, { Express } from 'express';
import { Server } from 'http';

/**
 * 測試伺服器管理器
 *
 * 為什麼需要這個?
 * - 每個測試需要獨立的伺服器實例
 * - 避免測試之間互相干擾
 * - 確保測試完畢後伺服器正確關閉
 */
export class TestServer {
  private server?: Server;
  private app: Express;
  private port: number;

  constructor(port: number = 0) {
    this.port = port; // port = 0 表示使用隨機 port
    this.app = express();
  }

  /**
   * 啟動測試伺服器
   */
  async start(appFactory: () => Express): Promise<string> {
    this.app = appFactory();

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        const addr = this.server!.address();
        if (typeof addr === 'object' && addr !== null) {
          const url = `http://localhost:${addr.port}`;
          console.log(`測試伺服器已啟動: ${url}`);
          resolve(url);
        } else {
          reject(new Error('無法取得伺服器位址'));
        }
      });

      this.server.on('error', reject);
    });
  }

  /**
   * 關閉測試伺服器
   */
  async stop(): Promise<void> {
    if (!this.server) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.server!.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('測試伺服器已關閉');
          resolve();
        }
      });
    });
  }

  /**
   * 取得 Express app (用於 supertest)
   */
  getApp(): Express {
    return this.app;
  }
}
```

建立 `tests/helpers/mock-external-services.ts`:

```typescript
import nock from 'nock';

/**
 * 外部服務 Mock 管理器
 *
 * 為什麼要 Mock?
 * - 避免每次測試都真的呼叫 OpenAI/Gemini (浪費錢)
 * - 測試速度更快
 * - 測試結果可重現 (不受外部 API 影響)
 */
export class ExternalServiceMock {
  /**
   * Mock OpenAI Whisper API (語音轉文字)
   */
  mockWhisperAPI(mockResponse: any) {
    return nock('https://api.openai.com')
      .post('/v1/audio/transcriptions')
      .reply(200, mockResponse);
  }

  /**
   * Mock OpenAI Chat API (GPT-4)
   */
  mockChatAPI(mockResponse: any) {
    return nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .reply(200, mockResponse);
  }

  /**
   * Mock Gemini API
   */
  mockGeminiAPI(mockResponse: any) {
    return nock('https://generativelanguage.googleapis.com')
      .post(/\/v1.*/)
      .reply(200, mockResponse);
  }

  /**
   * Mock Google Cloud Storage 上傳
   */
  mockGCSUpload() {
    return nock('https://storage.googleapis.com')
      .post(/.*/)
      .reply(200, { uploaded: true });
  }

  /**
   * 清除所有 mock
   */
  clearAll() {
    nock.cleanAll();
  }
}
```

建立 `tests/helpers/test-db.ts`:

```typescript
import { Pool } from 'pg';

/**
 * 測試資料庫管理器
 *
 * 為什麼需要這個?
 * - 測試前建立測試資料
 * - 測試後清理資料
 * - 確保每個測試都是乾淨的狀態
 */
export class TestDatabase {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
    });
  }

  /**
   * 清空所有測試資料
   *
   * ⚠️ 注意: 只能在測試環境使用!
   */
  async clearAll(): Promise<void> {
    // 確認是測試環境
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('clearAll 只能在測試環境使用!');
    }

    await this.pool.query('TRUNCATE TABLE users CASCADE');
    await this.pool.query('TRUNCATE TABLE videos CASCADE');
    await this.pool.query('TRUNCATE TABLE voiceovers CASCADE');
    await this.pool.query('TRUNCATE TABLE timelines CASCADE');
    await this.pool.query('TRUNCATE TABLE system_logs CASCADE');
  }

  /**
   * 建立測試用戶
   */
  async createTestUser(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO users (email, password_hash, name, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [data.email, data.password, data.name]
    );

    return result.rows[0];
  }

  /**
   * 建立測試影片
   */
  async createTestVideo(data: {
    userId: string;
    filePath: string;
    duration: number;
  }): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO videos (user_id, file_path, duration, status, created_at)
       VALUES ($1, $2, $3, 'completed', NOW())
       RETURNING *`,
      [data.userId, data.filePath, data.duration]
    );

    return result.rows[0];
  }

  /**
   * 關閉連線
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
```

---

### 步驟 3: 建立測試 Fixtures

建立 `tests/fixtures/mock-responses.ts`:

```typescript
/**
 * Mock 回應資料
 *
 * 這些是模擬外部 API 的回應資料
 * 用於測試時不真的呼叫外部服務
 */

/**
 * Mock Whisper API 回應 (語音轉文字)
 */
export const mockWhisperResponse = {
  text: '大家好,今天要介紹我們的新產品。這個產品有三大特色。首先是效能優異。'
};

/**
 * Mock GPT-4 回應 (語意分析)
 */
export const mockSemanticAnalysisResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        topics: ['產品介紹', '功能說明'],
        keywords: ['產品', '特色', '效能'],
        tone: 'professional'
      })
    }
  }]
};

/**
 * Mock GPT-4 回應 (配音切分)
 */
export const mockVoiceoverSplitResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        segments: [
          { start: 0, end: 8, text: '大家好,今天要介紹我們的新產品。', keywords: ['介紹', '產品'] },
          { start: 8, end: 15, text: '這個產品有三大特色。', keywords: ['產品', '特色'] },
          { start: 15, end: 22, text: '首先是效能優異。', keywords: ['效能', '優異'] }
        ]
      })
    }
  }]
};

/**
 * Mock Gemini 回應 (片段選擇)
 */
export const mockSegmentSelectionResponse = {
  candidates: [{
    content: {
      parts: [{
        text: JSON.stringify({
          selectedSegmentId: 'seg_001',
          trimStart: 0,
          trimEnd: 8,
          reason: '最符合開場氛圍'
        })
      }]
    }
  }]
};
```

---

### 步驟 4: 撰寫 API 整合測試

建立 `tests/integration/api/voiceover-upload.test.ts`:

```typescript
import request from 'supertest';
import { TestServer } from '../../helpers/test-server';
import { TestDatabase } from '../../helpers/test-db';
import { ExternalServiceMock } from '../../helpers/mock-external-services';
import { mockWhisperResponse, mockSemanticAnalysisResponse, mockVoiceoverSplitResponse } from '../../fixtures/mock-responses';
import { createApp } from '../../../src/app'; // 你的 Express app

describe('配音上傳 API - 整合測試', () => {
  let testServer: TestServer;
  let testDb: TestDatabase;
  let mockService: ExternalServiceMock;
  let authToken: string;

  beforeAll(async () => {
    // 啟動測試伺服器
    testServer = new TestServer();
    await testServer.start(createApp);

    // 連接測試資料庫
    testDb = new TestDatabase(process.env.TEST_DATABASE_URL!);

    // 建立 mock 服務
    mockService = new ExternalServiceMock();
  });

  afterAll(async () => {
    // 關閉測試伺服器
    await testServer.stop();

    // 關閉資料庫連線
    await testDb.close();
  });

  beforeEach(async () => {
    // 每個測試前清空資料庫
    await testDb.clearAll();

    // 建立測試用戶並取得 token
    const user = await testDb.createTestUser({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });

    // 登入取得 token
    const loginResponse = await request(testServer.getApp())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    authToken = loginResponse.body.token;
  });

  afterEach(() => {
    // 清除所有 mock
    mockService.clearAll();
  });

  test('應該成功上傳配音檔案', async () => {
    // 準備測試檔案
    const testFile = Buffer.from('fake audio content');

    const response = await request(testServer.getApp())
      .post('/api/voiceover/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', testFile, 'test-audio.mp3')
      .field('title', '測試配音');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('voiceoverId');
    expect(response.body).toHaveProperty('uploadUrl');
  });

  test('應該成功處理配音檔案 (完整流程)', async () => {
    // Mock 外部 API
    mockService.mockWhisperAPI(mockWhisperResponse);
    mockService.mockChatAPI(mockSemanticAnalysisResponse);
    mockService.mockChatAPI(mockVoiceoverSplitResponse);
    mockService.mockGCSUpload();

    // 1. 上傳配音
    const uploadResponse = await request(testServer.getApp())
      .post('/api/voiceover/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('fake audio'), 'test.mp3')
      .field('title', '測試配音');

    const voiceoverId = uploadResponse.body.voiceoverId;

    // 2. 開始處理
    const processResponse = await request(testServer.getApp())
      .post(`/api/voiceover/${voiceoverId}/process`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(processResponse.status).toBe(200);
    expect(processResponse.body).toHaveProperty('executionId');

    // 3. 檢查處理狀態
    const statusResponse = await request(testServer.getApp())
      .get(`/api/voiceover/${voiceoverId}/status`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.status).toMatch(/processing|completed/);

    // 4. 等待處理完成 (模擬,實際應該是非同步)
    // 在真實情況中,這裡會輪詢直到完成
  });

  test('沒有認證時應該拒絕請求', async () => {
    const response = await request(testServer.getApp())
      .post('/api/voiceover/upload')
      .attach('file', Buffer.from('fake audio'), 'test.mp3');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('上傳錯誤的檔案格式應該失敗', async () => {
    const response = await request(testServer.getApp())
      .post('/api/voiceover/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('not an audio file'), 'test.txt');

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid file format');
  });
});
```

建立 `tests/integration/api/video-generation.test.ts`:

```typescript
import request from 'supertest';
import { TestServer } from '../../helpers/test-server';
import { TestDatabase } from '../../helpers/test-db';
import { ExternalServiceMock } from '../../helpers/mock-external-services';
import { mockSegmentSelectionResponse } from '../../fixtures/mock-responses';
import { createApp } from '../../../src/app';

describe('影片生成 API - 整合測試', () => {
  let testServer: TestServer;
  let testDb: TestDatabase;
  let mockService: ExternalServiceMock;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    testServer = new TestServer();
    await testServer.start(createApp);
    testDb = new TestDatabase(process.env.TEST_DATABASE_URL!);
    mockService = new ExternalServiceMock();
  });

  afterAll(async () => {
    await testServer.stop();
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clearAll();

    testUser = await testDb.createTestUser({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });

    const loginResponse = await request(testServer.getApp())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    authToken = loginResponse.body.token;

    // 建立測試用的影片素材
    await testDb.createTestVideo({
      userId: testUser.id,
      filePath: 'gs://test-bucket/video1.mp4',
      duration: 30
    });

    await testDb.createTestVideo({
      userId: testUser.id,
      filePath: 'gs://test-bucket/video2.mp4',
      duration: 25
    });
  });

  afterEach(() => {
    mockService.clearAll();
  });

  test('應該成功生成影片 (完整流程)', async () => {
    // Mock AI 服務
    mockService.mockGeminiAPI(mockSegmentSelectionResponse);
    mockService.mockGCSUpload();

    // 1. 開始生成影片
    const generateResponse = await request(testServer.getApp())
      .post('/api/video/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        voiceoverId: 'vo_test_001',
        music: 'bgm_001'
      });

    expect(generateResponse.status).toBe(200);
    expect(generateResponse.body).toHaveProperty('executionId');
    expect(generateResponse.body).toHaveProperty('timelineId');

    const executionId = generateResponse.body.executionId;

    // 2. 檢查生成狀態
    const statusResponse = await request(testServer.getApp())
      .get(`/api/video/status/${executionId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body).toHaveProperty('status');
  });

  test('素材不足時應該回報錯誤', async () => {
    // 清空所有影片素材
    await testDb.clearAll();

    const response = await request(testServer.getApp())
      .post('/api/video/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        voiceoverId: 'vo_test_001'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Not enough materials');
  });
});
```

---

### 步驟 5: 撰寫服務層整合測試

建立 `tests/integration/services/intelligent-clip-engine.test.ts`:

```typescript
import { IntelligentClipEngine } from '../../../src/services/intelligent-clip-engine';
import { TestDatabase } from '../../helpers/test-db';
import { ExternalServiceMock } from '../../helpers/mock-external-services';
import { mockSegmentSelectionResponse } from '../../fixtures/mock-responses';

describe('智能選片引擎 - 整合測試', () => {
  let clipEngine: IntelligentClipEngine;
  let testDb: TestDatabase;
  let mockService: ExternalServiceMock;
  let testUser: any;

  beforeAll(async () => {
    testDb = new TestDatabase(process.env.TEST_DATABASE_URL!);
    mockService = new ExternalServiceMock();
    clipEngine = new IntelligentClipEngine();
  });

  afterAll(async () => {
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clearAll();

    testUser = await testDb.createTestUser({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });

    // 建立測試素材
    await testDb.createTestVideo({
      userId: testUser.id,
      filePath: 'gs://test/video1.mp4',
      duration: 30
    });
  });

  afterEach(() => {
    mockService.clearAll();
  });

  test('應該成功選擇適合的片段', async () => {
    mockService.mockGeminiAPI(mockSegmentSelectionResponse);

    const result = await clipEngine.selectSegments({
      userId: testUser.id,
      voiceSegments: [
        { text: '大家好', duration: 8, keywords: ['介紹'] }
      ]
    });

    expect(result).toHaveProperty('selectedSegments');
    expect(result.selectedSegments).toHaveLength(1);
    expect(result.selectedSegments[0]).toHaveProperty('segmentId');
  });

  test('當沒有合適素材時應該回報', async () => {
    // 清空所有素材
    await testDb.clearAll();

    await expect(
      clipEngine.selectSegments({
        userId: testUser.id,
        voiceSegments: [
          { text: '大家好', duration: 8, keywords: ['介紹'] }
        ]
      })
    ).rejects.toThrow('No suitable segments found');
  });
});
```

---

### 步驟 6: 撰寫完整工作流程測試

建立 `tests/integration/workflows/complete-video-generation.test.ts`:

```typescript
import request from 'supertest';
import { TestServer } from '../../helpers/test-server';
import { TestDatabase } from '../../helpers/test-db';
import { ExternalServiceMock } from '../../helpers/mock-external-services';
import * as mockResponses from '../../fixtures/mock-responses';
import { createApp } from '../../../src/app';

describe('完整影片生成流程 - 端對端測試', () => {
  let testServer: TestServer;
  let testDb: TestDatabase;
  let mockService: ExternalServiceMock;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    testServer = new TestServer();
    await testServer.start(createApp);
    testDb = new TestDatabase(process.env.TEST_DATABASE_URL!);
    mockService = new ExternalServiceMock();
  });

  afterAll(async () => {
    await testServer.stop();
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clearAll();

    testUser = await testDb.createTestUser({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });

    const loginResponse = await request(testServer.getApp())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    authToken = loginResponse.body.token;

    // 建立測試素材
    for (let i = 0; i < 5; i++) {
      await testDb.createTestVideo({
        userId: testUser.id,
        filePath: `gs://test/video${i}.mp4`,
        duration: 20 + i * 5
      });
    }
  });

  afterEach(() => {
    mockService.clearAll();
  });

  test('完整流程: 從上傳配音到產出影片', async () => {
    // Mock 所有外部服務
    mockService.mockWhisperAPI(mockResponses.mockWhisperResponse);
    mockService.mockChatAPI(mockResponses.mockSemanticAnalysisResponse);
    mockService.mockChatAPI(mockResponses.mockVoiceoverSplitResponse);
    mockService.mockGeminiAPI(mockResponses.mockSegmentSelectionResponse);
    mockService.mockGCSUpload();

    // Step 1: 上傳配音
    const uploadResponse = await request(testServer.getApp())
      .post('/api/voiceover/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('fake audio'), 'test.mp3')
      .field('title', '測試配音');

    expect(uploadResponse.status).toBe(200);
    const voiceoverId = uploadResponse.body.voiceoverId;

    // Step 2: 處理配音
    const processResponse = await request(testServer.getApp())
      .post(`/api/voiceover/${voiceoverId}/process`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(processResponse.status).toBe(200);

    // Step 3: 生成影片
    const generateResponse = await request(testServer.getApp())
      .post('/api/video/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        voiceoverId: voiceoverId,
        music: 'bgm_001'
      });

    expect(generateResponse.status).toBe(200);
    const executionId = generateResponse.body.executionId;

    // Step 4: 檢查狀態
    const statusResponse = await request(testServer.getApp())
      .get(`/api/video/status/${executionId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body).toHaveProperty('status');

    // Step 5: 下載影片 (假設已完成)
    // 在實際情況中,需要等待 executionId 完成後才能下載
    // 這裡簡化測試流程
  }, 30000); // 設定較長的 timeout
});
```

---

### 步驟 7: 設定 Jest 測試設定

修改 `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/*.test.ts',
    '**/*.integration.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // 整合測試設定
  testTimeout: 30000, // 30 秒 timeout
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  // 分開執行單元測試和整合測試
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/**/*.test.ts'],
      testPathIgnorePatterns: ['integration', 'e2e']
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts']
    }
  ]
};
```

建立 `tests/setup.ts`:

```typescript
/**
 * Jest 測試前置設定
 */

// 設定測試環境變數
process.env.NODE_ENV = 'test';
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost/cheapcut_test';

// 設定 timeout
jest.setTimeout(30000);

// 全域的 beforeAll
beforeAll(async () => {
  console.log('開始整合測試...');
});

// 全域的 afterAll
afterAll(async () => {
  console.log('整合測試完成');
});
```

---

### 步驟 8: 更新 package.json scripts

在 `package.json` 中加入:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --selectProjects unit",
    "test:integration": "jest --selectProjects integration",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration:watch": "jest --selectProjects integration --watch"
  }
}
```

---

### 步驟 9: 建立測試執行腳本

建立 `scripts/run-integration-tests.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  CheapCut 整合測試執行腳本"
echo "========================================"

# 確認測試環境變數
if [ -z "$TEST_DATABASE_URL" ]; then
  echo "錯誤: TEST_DATABASE_URL 環境變數未設定"
  echo "請在 .env.test 中設定測試資料庫"
  exit 1
fi

# 建立測試資料庫 (如果不存在)
echo "Step 1: 準備測試資料庫..."
psql -h localhost -U postgres -c "CREATE DATABASE cheapcut_test;" 2>/dev/null || echo "測試資料庫已存在"

# 執行資料庫 migration
echo "Step 2: 執行資料庫 migration..."
npm run db:migrate:test

# 執行整合測試
echo "Step 3: 執行整合測試..."
npm run test:integration

# 產生測試報告
echo "Step 4: 產生測試報告..."
npm run test:coverage

echo "========================================"
echo "  整合測試完成!"
echo "========================================"
```

設定執行權限:

```bash
chmod +x scripts/run-integration-tests.sh
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (3 tests): 測試框架設定
- 📁 **Functional Acceptance** (5 tests): 整合測試功能
- 📁 **E2E Acceptance** (2 tests): 完整流程

### 執行驗收

```bash
# 執行整合測試
npm run test:integration

# 執行整合測試腳本
./scripts/run-integration-tests.sh

# 產生測試覆蓋率報告
npm run test:coverage
```

### 通過標準

- ✅ 所有 10 個整合測試通過 (3 + 5 + 2)
- ✅ 測試覆蓋率 ≥ 70%
- ✅ 所有 API 端點都有測試
- ✅ 外部服務都有 mock

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (3 tests)

測試檔案: `tests/integration/basic/*.test.ts`

1. ✓ 測試伺服器可以啟動
2. ✓ 測試資料庫連線正常
3. ✓ Mock 服務設定正確

### Functional Acceptance (5 tests)

測試檔案: `tests/integration/api/*.test.ts`

1. ✓ 配音上傳 API 正常運作
2. ✓ 配音處理流程完整
3. ✓ 影片生成 API 正常運作
4. ✓ 認證機制正確
5. ✓ 錯誤處理正確

### E2E Acceptance (2 tests)

測試檔案: `tests/integration/workflows/*.test.ts`

1. ✓ 完整的影片生成流程正確運作
2. ✓ 所有服務整合正常

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 實作檢查
- [ ] 測試輔助工具已建立 (test-server.ts, mock-external-services.ts, test-db.ts)
- [ ] 測試 fixtures 已建立
- [ ] API 整合測試已撰寫
- [ ] 服務層整合測試已撰寫
- [ ] 工作流程測試已撰寫
- [ ] Jest 設定已更新
- [ ] npm scripts 已更新
- [ ] 測試執行腳本已建立

### 測試檔案
- [ ] `tests/helpers/test-server.ts` 已建立
- [ ] `tests/helpers/mock-external-services.ts` 已建立
- [ ] `tests/helpers/test-db.ts` 已建立
- [ ] `tests/fixtures/mock-responses.ts` 已建立
- [ ] `tests/integration/api/voiceover-upload.test.ts` 已建立
- [ ] `tests/integration/api/video-generation.test.ts` 已建立
- [ ] `tests/integration/services/intelligent-clip-engine.test.ts` 已建立
- [ ] `tests/integration/workflows/complete-video-generation.test.ts` 已建立

### 驗收測試
- [ ] 所有整合測試通過
- [ ] 測試覆蓋率達標
- [ ] 沒有測試間的相依性

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `ECONNREFUSED` | 服務沒啟動 | 檢查後端是否運行 |
| `timeout` | 測試執行太久 | 增加 jest timeout 設定 |
| `Database error` | 測試資料庫問題 | 檢查 TEST_DATABASE_URL |
| `401 Unauthorized` | 認證失敗 | 檢查 token 是否正確 |
| `Mock not found` | Mock 設定錯誤 | 檢查 nock 設定 |

---

### 問題 1: 測試伺服器啟動失敗

**錯誤訊息:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解決方案:**

1. 確認沒有其他服務佔用 port
2. 使用隨機 port:

```typescript
// 使用 port 0 讓系統自動分配
const testServer = new TestServer(0);
```

3. 測試完畢確實關閉 server:

```typescript
afterAll(async () => {
  await testServer.stop();
});
```

---

### 問題 2: Mock 沒有生效

**錯誤訊息:**
```
Error: Nock: No match for request
```

**解決方案:**

1. 檢查 Mock 的 URL 和 path 是否正確:

```typescript
// ✅ 正確
nock('https://api.openai.com')
  .post('/v1/chat/completions')
  .reply(200, mockResponse);

// ❌ 錯誤 (URL 多了 /v1)
nock('https://api.openai.com/v1')
  .post('/chat/completions')
  .reply(200, mockResponse);
```

2. 確認 Mock 在請求前設定:

```typescript
// ✅ 正確順序
beforeEach(() => {
  mockService.mockChatAPI(mockResponse); // 先 mock
});

test('test', async () => {
  await someFunction(); // 再執行
});
```

3. 啟用 nock debug:

```typescript
nock.recorder.rec({
  output_objects: true
});
```

---

### 問題 3: 測試資料庫錯誤

**錯誤訊息:**
```
Error: relation "users" does not exist
```

**解決方案:**

1. 確認測試資料庫已建立:

```bash
psql -h localhost -U postgres -c "CREATE DATABASE cheapcut_test;"
```

2. 執行 migration:

```bash
npm run db:migrate:test
```

3. 確認環境變數:

```bash
echo $TEST_DATABASE_URL
# 應該顯示: postgresql://localhost/cheapcut_test
```

---

### 問題 4: 測試之間互相干擾

**問題**: 第一個測試通過,第二個測試失敗

**解決方案:**

1. 確保每個測試前清空資料:

```typescript
beforeEach(async () => {
  await testDb.clearAll(); // 清空所有測試資料
});
```

2. 不要在測試間共享狀態:

```typescript
// ❌ 錯誤 (全域變數)
let userId = 'user_001';

test('test 1', () => {
  userId = 'user_002'; // 會影響其他測試
});

// ✅ 正確 (每個測試獨立)
test('test 1', () => {
  const userId = 'user_001'; // 區域變數
});
```

3. 使用隨機資料:

```typescript
import { v4 as uuid } from 'uuid';

test('test', async () => {
  const userId = uuid(); // 每次都不同
});
```

---

### 問題 5: 測試執行太慢

**問題**: 整合測試執行超過 5 分鐘

**解決方案:**

1. 平行執行測試:

```bash
# 使用多個 worker
jest --maxWorkers=4
```

2. 只執行特定測試:

```bash
# 執行單一測試檔案
jest tests/integration/api/voiceover-upload.test.ts

# 執行符合條件的測試
jest --testNamePattern="upload"
```

3. 使用 Mock 取代真實 API 呼叫:

```typescript
// ❌ 慢 (真的呼叫 OpenAI)
const result = await openai.chat.completions.create(...);

// ✅ 快 (使用 Mock)
mockService.mockChatAPI(mockResponse);
```

---

## 📚 延伸學習資源

如果你想深入了解整合測試:

- **Jest 測試框架**: https://jestjs.io/docs/getting-started
- **Supertest API 測試**: https://github.com/ladjs/supertest
- **Nock HTTP Mock**: https://github.com/nock/nock
- **整合測試最佳實踐**: https://martinfowler.com/articles/practical-test-pyramid.html

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有整合測試都通過 (10/10)
3. ✅ 測試覆蓋率 ≥ 70%
4. ✅ 完成檢查清單都勾選
5. ✅ `npm run test:integration` 完全通過

### 最終驗收指令

```bash
# 執行整合測試
npm run test:integration

# 產生覆蓋率報告
npm run test:coverage

# 執行完整測試腳本
./scripts/run-integration-tests.sh

# 如果全部通過,你應該看到:
# Test Suites: 8 passed, 8 total
# Tests:       10 passed, 10 total
# Coverage:    > 70%
```

**恭喜!** 如果看到上面的輸出,代表 Task 4.1 完成了!

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:

**測試覆蓋率**:
- 目前覆蓋率: __%
- 未覆蓋的關鍵功能: ___
- 下次改進方向: ___

**遇到的問題與解決方法**:
- 記錄哪些測試比較困難
- 記錄你的解決方案
- 下次可以更快完成

**測試執行時間**:
- 完整測試套件執行時間: ___
- 最慢的測試: ___
- 優化方向: ___

---

**下一步**: Task 4.2 - 效能測試

---

**文件版本**: 2.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
