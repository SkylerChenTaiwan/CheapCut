# Task 4.2: 效能測試

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 4.2 |
| **Task 名稱** | 效能測試 |
| **所屬 Phase** | Phase 4: 測試與部署 |
| **預估時間** | 4-5 小時 (測試設計 2h + 測試實作 2h + 調校 1h) |
| **難度** | ⭐⭐⭐ 中等偏難 |
| **前置 Task** | Task 4.1 (整合測試) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的效能測試問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Request timeout after 30000ms
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 請求逾時
   ```

2. **判斷問題類型**
   - `timeout` → 回應時間過長,效能不佳
   - `503 Service Unavailable` → 服務過載,無法處理請求
   - `429 Too Many Requests` → 請求過於頻繁,被限流
   - `Memory exceeded` → 記憶體使用過高

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"效能測試"  ← 太模糊
"太慢" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"k6 load testing node.js" ← 包含工具和技術棧
"artillery performance test timeout" ← 說明問題和工具
"API response time optimization" ← 說明要優化什麼
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件**
- K6: https://k6.io/docs/
- Artillery: https://www.artillery.io/docs
- Autocannon: https://github.com/mcollina/autocannon

**優先順序 2: 效能優化指南**
- Node.js 效能最佳實踐: https://nodejs.org/en/docs/guides/simple-profiling/
- Google Cloud 效能優化: https://cloud.google.com/solutions/performance

**優先順序 3: Stack Overflow**
- 搜尋時加上 `site:stackoverflow.com`
- 看「✓ 已接受的答案」

---

### Step 3: 檢查效能瓶頸

效能問題通常來自以下幾個地方:

```bash
# 檢查 API 回應時間
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health

# 檢查資料庫查詢效能
EXPLAIN ANALYZE SELECT * FROM videos WHERE user_id = 'xxx';

# 檢查記憶體使用
node --inspect src/server.ts
# 然後用 Chrome DevTools 查看記憶體使用

# 檢查 CPU 使用
top -p $(pgrep -f "node")
```

建立 `curl-format.txt`:
```
    time_namelookup:  %{time_namelookup}s\n
       time_connect:  %{time_connect}s\n
    time_appconnect:  %{time_appconnect}s\n
   time_pretransfer:  %{time_pretransfer}s\n
      time_redirect:  %{time_redirect}s\n
 time_starttransfer:  %{time_starttransfer}s\n
                    ----------\n
         time_total:  %{time_total}s\n
```

---

### Step 4: 問題還是沒解決?

**準備以下資訊尋求協助**:

```markdown
## 問題描述
我在執行 Task 4.2 效能測試時發現效能不佳

## 測試情境
我在測試 [具體 API,例如: POST /api/video/generate]
- 並發用戶數: 100
- 測試時長: 60 秒

## 效能指標
- 平均回應時間: 5000ms (目標: <500ms)
- 99th percentile: 15000ms
- 錯誤率: 15%

## 我的環境
- Node.js 版本: v18.12.0
- 資料庫: PostgreSQL 14
- 部署環境: 本地 / Cloud Run

## 我已經嘗試過
1. 增加連線池大小 → 沒有明顯改善
2. 加上資料庫索引 → 稍有改善
3. 增加記憶體 → 還是很慢

## 測試配置
[貼上你的測試腳本]
```

---

### 🎯 效能優化心法

1. **先測量,再優化** - 不要憑感覺,用數據說話
2. **找到瓶頸** - 用 profiling 工具找出最慢的部分
3. **優化熱點** - 優先處理最慢的 20% 程式碼
4. **再次測量** - 確認優化有效果
5. **平衡取捨** - 效能 vs 程式碼可讀性,找到平衡點

---

## 🎯 功能描述

建立完整的效能測試套件,測試系統在高負載情況下的表現。效能測試會模擬大量用戶同時使用系統,確保系統能夠穩定運作並符合效能指標要求。

### 為什麼需要這個?

- 🎯 **問題**: 不知道系統能承受多少用戶,上線後可能因為負載過高而當機
- ✅ **解決**: 效能測試模擬高負載情境,提前發現效能瓶頸
- 💡 **比喻**: 就像橋樑載重測試,要知道能承受多少重量才能安全開放

### 完成後你會有:

- 完整的效能測試套件
- API 效能測試腳本
- 負載測試報告
- 效能瓶頸分析
- 效能優化建議

---

## 📚 前置知識

以下是這個 Task 會用到的概念:

- **負載測試 (Load Testing)**: 測試系統在預期負載下的表現 → 確保正常情況下系統穩定
- **壓力測試 (Stress Testing)**: 測試系統的極限 → 找出系統能承受的最大負載
- **效能指標 (Performance Metrics)**: 回應時間、吞吐量、錯誤率 → 評估系統效能的標準
- **並發 (Concurrency)**: 同時處理多個請求 → 模擬多用戶同時使用

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 4.1: 整合測試
- ✅ Task 1.4: API 基礎架構
- ✅ Task 3.8: 下載與分享功能

### 需要安裝的套件

```bash
# 安裝效能測試工具
npm install --save-dev k6  # 效能測試框架
npm install --save-dev autocannon  # Node.js 效能測試工具
npm install --save-dev clinic  # Node.js 效能分析工具
```

或使用 Artillery:

```bash
# 另一個選擇: Artillery
npm install --global artillery
```

### 環境檢查

```bash
# 確認整合測試通過
npm run test:integration
# 應該全部通過

# 確認後端正常運行
npm run dev:backend
# 應該在 http://localhost:3000 啟動

# 檢查系統資源
free -h  # 檢查記憶體
df -h    # 檢查磁碟空間
```

---

## 📝 實作步驟

### 步驟 1: 選擇效能測試工具

我們使用 **K6** 作為主要的效能測試工具,原因:

- ✅ 輕量級,資源消耗少
- ✅ 支援 JavaScript/TypeScript
- ✅ 有豐富的指標和報告
- ✅ 可以輸出多種格式的報告

**安裝 K6**:

```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

**驗證安裝**:

```bash
k6 version
# 應該顯示: k6 v0.47.0 (或更新版本)
```

---

### 步驟 2: 建立效能測試資料夾結構

```bash
# 建立效能測試資料夾
mkdir -p tests/performance
mkdir -p tests/performance/scripts
mkdir -p tests/performance/results
mkdir -p tests/performance/helpers
```

**確認結構**:
```bash
tree tests/performance
# tests/performance/
# ├── scripts/       # 測試腳本
# ├── results/       # 測試結果
# └── helpers/       # 輔助工具
```

---

### 步驟 3: 建立基礎測試腳本

建立 `tests/performance/helpers/common.js`:

```javascript
/**
 * 效能測試共用函式
 *
 * 為什麼需要這個?
 * - 避免在每個測試腳本重複寫相同的邏輯
 * - 統一認證、錯誤處理等共用功能
 */

import { check } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * 錯誤率指標
 */
export const errorRate = new Rate('errors');

/**
 * 檢查回應是否成功
 *
 * @param {Object} response - HTTP 回應
 * @param {string} name - 檢查點名稱
 * @returns {boolean} 是否成功
 */
export function checkResponse(response, name = 'response') {
  const success = check(response, {
    [`${name}: status is 200`]: (r) => r.status === 200,
    [`${name}: response time < 500ms`]: (r) => r.timings.duration < 500,
    [`${name}: has valid body`]: (r) => r.body && r.body.length > 0,
  });

  errorRate.add(!success);
  return success;
}

/**
 * 取得認證 token
 *
 * @param {string} baseUrl - API 基礎 URL
 * @returns {string} JWT token
 */
export function getAuthToken(baseUrl) {
  // 這裡應該要實作登入邏輯取得 token
  // 為了測試方便,可以先使用預先產生的測試 token
  return __ENV.TEST_AUTH_TOKEN || 'test-token';
}

/**
 * 建立測試用的 headers
 *
 * @param {string} token - JWT token
 * @returns {Object} headers
 */
export function getHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * 產生隨機字串
 *
 * @param {number} length - 字串長度
 * @returns {string} 隨機字串
 */
export function randomString(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

---

### 步驟 4: 建立 API 效能測試腳本

建立 `tests/performance/scripts/api-load-test.js`:

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { checkResponse, getAuthToken, getHeaders } from '../helpers/common.js';

/**
 * API 負載測試
 *
 * 測試目標:
 * - API 回應時間 < 500ms (p95)
 * - 錯誤率 < 1%
 * - 支援 100 並發用戶
 */

// 自定義指標
const apiResponseTime = new Trend('api_response_time');
const apiErrorRate = new Rate('api_errors');

// 測試選項
export const options = {
  // 階段式負載測試
  stages: [
    { duration: '1m', target: 20 },   // 1分鐘內逐步增加到 20 用戶
    { duration: '3m', target: 20 },   // 維持 20 用戶 3 分鐘
    { duration: '1m', target: 50 },   // 增加到 50 用戶
    { duration: '3m', target: 50 },   // 維持 50 用戶 3 分鐘
    { duration: '1m', target: 100 },  // 增加到 100 用戶
    { duration: '3m', target: 100 },  // 維持 100 用戶 3 分鐘
    { duration: '1m', target: 0 },    // 逐步減少到 0
  ],

  // 效能門檻
  thresholds: {
    // 95% 的請求應在 500ms 內完成
    'http_req_duration': ['p(95)<500'],

    // 99% 的請求應在 1000ms 內完成
    'http_req_duration': ['p(99)<1000'],

    // 錯誤率應低於 1%
    'http_req_failed': ['rate<0.01'],

    // API 錯誤率應低於 1%
    'api_errors': ['rate<0.01'],
  },
};

// 設定基礎 URL
const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export function setup() {
  // 測試前的準備工作
  console.log('開始 API 效能測試');
  console.log(`目標 URL: ${BASE_URL}`);

  // 取得認證 token
  const token = getAuthToken(BASE_URL);

  return { token };
}

export default function(data) {
  const headers = getHeaders(data.token);

  // 測試 1: 取得用戶資料
  let response = http.get(`${BASE_URL}/api/user/profile`, { headers });

  check(response, {
    'profile: status is 200': (r) => r.status === 200,
    'profile: response time < 500ms': (r) => r.timings.duration < 500,
  });

  apiResponseTime.add(response.timings.duration);
  apiErrorRate.add(response.status !== 200);

  sleep(1);

  // 測試 2: 列出配音列表
  response = http.get(`${BASE_URL}/api/voiceover/list`, { headers });

  check(response, {
    'voiceover list: status is 200': (r) => r.status === 200,
    'voiceover list: has items': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.voiceovers);
      } catch {
        return false;
      }
    },
  });

  apiResponseTime.add(response.timings.duration);
  apiErrorRate.add(response.status !== 200);

  sleep(1);

  // 測試 3: 取得影片列表
  response = http.get(`${BASE_URL}/api/video/list`, { headers });

  check(response, {
    'video list: status is 200': (r) => r.status === 200,
  });

  apiResponseTime.add(response.timings.duration);
  apiErrorRate.add(response.status !== 200);

  sleep(2);
}

export function teardown(data) {
  // 測試後的清理工作
  console.log('API 效能測試完成');
}
```

---

### 步驟 5: 建立影片生成效能測試

建立 `tests/performance/scripts/video-generation-stress-test.js`:

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { getAuthToken, getHeaders } from '../helpers/common.js';

/**
 * 影片生成壓力測試
 *
 * 測試目標:
 * - 測試影片生成服務的極限
 * - 確認系統在高負載下的穩定性
 * - 找出效能瓶頸
 */

// 自定義指標
const videoGenerationTime = new Trend('video_generation_time');
const videoGenerationErrors = new Rate('video_generation_errors');
const videoGenerationCount = new Counter('video_generation_count');

export const options = {
  // 壓力測試: 逐步增加負載直到系統崩潰
  stages: [
    { duration: '2m', target: 10 },   // 暖身
    { duration: '5m', target: 20 },   // 增加負載
    { duration: '5m', target: 30 },   // 持續增加
    { duration: '5m', target: 40 },   // 壓力測試
    { duration: '2m', target: 0 },    // 降溫
  ],

  thresholds: {
    // 影片生成應在 30 秒內完成 (p95)
    'video_generation_time': ['p(95)<30000'],

    // 錯誤率應低於 5% (壓力測試容許較高的錯誤率)
    'video_generation_errors': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export function setup() {
  console.log('開始影片生成壓力測試');
  const token = getAuthToken(BASE_URL);
  return { token };
}

export default function(data) {
  const headers = getHeaders(data.token);

  // 開始生成影片
  const startTime = Date.now();

  const payload = JSON.stringify({
    voiceoverId: 'test-voiceover-001',
    music: 'bgm_001',
  });

  const response = http.post(
    `${BASE_URL}/api/video/generate`,
    payload,
    { headers }
  );

  const success = check(response, {
    'generation: status is 200': (r) => r.status === 200,
    'generation: has executionId': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.executionId !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (success) {
    videoGenerationCount.add(1);

    // 如果成功啟動,輪詢檢查狀態
    const body = JSON.parse(response.body);
    const executionId = body.executionId;

    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 最多等待 60 秒

    while (!completed && attempts < maxAttempts) {
      sleep(1);
      attempts++;

      const statusResponse = http.get(
        `${BASE_URL}/api/video/status/${executionId}`,
        { headers }
      );

      if (statusResponse.status === 200) {
        const status = JSON.parse(statusResponse.body);

        if (status.status === 'completed') {
          completed = true;
          const duration = Date.now() - startTime;
          videoGenerationTime.add(duration);
          break;
        } else if (status.status === 'failed') {
          videoGenerationErrors.add(1);
          break;
        }
      }
    }

    if (!completed) {
      videoGenerationErrors.add(1);
    }
  } else {
    videoGenerationErrors.add(1);
  }

  sleep(5); // 等待一段時間再發送下一個請求
}

export function teardown(data) {
  console.log('影片生成壓力測試完成');
}
```

---

### 步驟 6: 建立資料庫查詢效能測試

建立 `tests/performance/scripts/database-performance.js`:

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';
import { getAuthToken, getHeaders } from '../helpers/common.js';

/**
 * 資料庫查詢效能測試
 *
 * 測試目標:
 * - 測試資料庫查詢效能
 * - 確認索引是否有效
 * - 找出慢查詢
 */

const dbQueryTime = new Trend('db_query_time');

export const options = {
  // 持續負載測試
  vus: 50,        // 50 個虛擬用戶
  duration: '5m', // 持續 5 分鐘

  thresholds: {
    // 資料庫查詢應在 200ms 內完成 (p95)
    'db_query_time': ['p(95)<200'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export function setup() {
  console.log('開始資料庫效能測試');
  const token = getAuthToken(BASE_URL);
  return { token };
}

export default function(data) {
  const headers = getHeaders(data.token);

  // 測試各種常見的查詢

  // 1. 列表查詢 (分頁)
  let startTime = Date.now();
  let response = http.get(
    `${BASE_URL}/api/voiceover/list?page=1&limit=20`,
    { headers }
  );

  if (response.status === 200) {
    dbQueryTime.add(Date.now() - startTime);
  }

  sleep(0.5);

  // 2. 單一資源查詢
  startTime = Date.now();
  response = http.get(
    `${BASE_URL}/api/voiceover/test-id-001`,
    { headers }
  );

  if (response.status === 200) {
    dbQueryTime.add(Date.now() - startTime);
  }

  sleep(0.5);

  // 3. 搜尋查詢
  startTime = Date.now();
  response = http.get(
    `${BASE_URL}/api/video/search?q=test&page=1&limit=20`,
    { headers }
  );

  if (response.status === 200) {
    dbQueryTime.add(Date.now() - startTime);
  }

  sleep(1);

  // 4. 複雜的關聯查詢
  startTime = Date.now();
  response = http.get(
    `${BASE_URL}/api/timeline/test-timeline-001/full`,
    { headers }
  );

  if (response.status === 200) {
    dbQueryTime.add(Date.now() - startTime);
  }

  sleep(1);
}

export function teardown(data) {
  console.log('資料庫效能測試完成');
}
```

---

### 步驟 7: 建立測試執行腳本

建立 `scripts/run-performance-tests.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  CheapCut 效能測試執行腳本"
echo "========================================"

# 設定環境變數
export API_URL="http://localhost:3000"
export TEST_AUTH_TOKEN="your-test-token-here"

# 確認後端正在運行
echo "Step 1: 檢查後端服務..."
curl -f http://localhost:3000/api/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "錯誤: 後端服務未運行,請先啟動後端"
  echo "執行: npm run dev:backend"
  exit 1
fi

echo "✓ 後端服務運行中"

# 建立結果資料夾
mkdir -p tests/performance/results

# 執行 API 負載測試
echo ""
echo "Step 2: 執行 API 負載測試..."
k6 run \
  --out json=tests/performance/results/api-load-test.json \
  tests/performance/scripts/api-load-test.js

# 執行影片生成壓力測試
echo ""
echo "Step 3: 執行影片生成壓力測試..."
k6 run \
  --out json=tests/performance/results/video-stress-test.json \
  tests/performance/scripts/video-generation-stress-test.js

# 執行資料庫效能測試
echo ""
echo "Step 4: 執行資料庫效能測試..."
k6 run \
  --out json=tests/performance/results/database-performance.json \
  tests/performance/scripts/database-performance.js

# 產生 HTML 報告
echo ""
echo "Step 5: 產生效能報告..."

# 如果安裝了 k6-reporter,產生 HTML 報告
# npm install -g k6-to-junit
# k6-to-junit tests/performance/results/*.json > tests/performance/results/report.xml

echo ""
echo "========================================"
echo "  效能測試完成!"
echo "========================================"
echo ""
echo "測試結果儲存在: tests/performance/results/"
echo ""
echo "查看結果:"
echo "  - API 負載測試: tests/performance/results/api-load-test.json"
echo "  - 影片壓力測試: tests/performance/results/video-stress-test.json"
echo "  - 資料庫測試: tests/performance/results/database-performance.json"
echo ""
```

設定執行權限:

```bash
chmod +x scripts/run-performance-tests.sh
```

---

### 步驟 8: 設定效能測試的 npm scripts

在 `package.json` 中加入:

```json
{
  "scripts": {
    "perf:api": "k6 run tests/performance/scripts/api-load-test.js",
    "perf:video": "k6 run tests/performance/scripts/video-generation-stress-test.js",
    "perf:db": "k6 run tests/performance/scripts/database-performance.js",
    "perf:all": "./scripts/run-performance-tests.sh",
    "perf:report": "k6 run --out json=tests/performance/results/report.json"
  }
}
```

---

### 步驟 9: 建立效能分析工具設定

建立 `scripts/profile-app.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  Node.js 效能分析"
echo "========================================"

# 使用 clinic.js 進行效能分析

# 1. Flame Graph (找出 CPU 熱點)
echo "Step 1: 產生 Flame Graph..."
clinic flame --on-port 'autocannon -c 10 -d 30 http://localhost:3000/api/health' -- node src/server.js

# 2. Bubbleprof (找出非同步延遲)
echo "Step 2: 產生 Bubbleprof..."
clinic bubbleprof --on-port 'autocannon -c 10 -d 30 http://localhost:3000/api/health' -- node src/server.js

# 3. Doctor (綜合診斷)
echo "Step 3: 執行 Doctor 診斷..."
clinic doctor --on-port 'autocannon -c 10 -d 30 http://localhost:3000/api/health' -- node src/server.js

echo ""
echo "========================================"
echo "  效能分析完成!"
echo "========================================"
echo ""
echo "查看報告:"
echo "  clinic 會自動開啟瀏覽器顯示報告"
echo ""
```

設定執行權限:

```bash
chmod +x scripts/profile-app.sh
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (3 tests): 測試工具設定
- 📁 **Functional Acceptance** (4 tests): 效能測試功能
- 📁 **E2E Acceptance** (2 tests): 完整效能測試流程

### 執行驗收

```bash
# 執行完整效能測試
./scripts/run-performance-tests.sh

# 或分別執行
npm run perf:api      # API 負載測試
npm run perf:video    # 影片生成壓力測試
npm run perf:db       # 資料庫效能測試

# 執行效能分析
./scripts/profile-app.sh
```

### 通過標準

- ✅ API 回應時間 p95 < 500ms
- ✅ API 回應時間 p99 < 1000ms
- ✅ 錯誤率 < 1%
- ✅ 支援至少 100 並發用戶
- ✅ 影片生成時間 p95 < 30 秒
- ✅ 資料庫查詢時間 p95 < 200ms

<details>
<summary>📊 查看詳細效能指標</summary>

### API 效能指標

| 指標 | 目標 | 說明 |
|-----|------|------|
| p50 回應時間 | < 200ms | 50% 的請求 |
| p95 回應時間 | < 500ms | 95% 的請求 |
| p99 回應時間 | < 1000ms | 99% 的請求 |
| 錯誤率 | < 1% | HTTP 4xx/5xx 錯誤 |
| 吞吐量 | > 100 req/s | 每秒處理請求數 |

### 影片生成效能指標

| 指標 | 目標 | 說明 |
|-----|------|------|
| p50 生成時間 | < 15s | 50% 的影片 |
| p95 生成時間 | < 30s | 95% 的影片 |
| p99 生成時間 | < 60s | 99% 的影片 |
| 錯誤率 | < 5% | 生成失敗率 |

### 資料庫效能指標

| 指標 | 目標 | 說明 |
|-----|------|------|
| 列表查詢 | < 100ms | 分頁查詢 |
| 單一查詢 | < 50ms | 主鍵查詢 |
| 搜尋查詢 | < 200ms | 全文搜尋 |
| 複雜查詢 | < 500ms | 多表關聯 |

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 實作檢查
- [ ] K6 效能測試工具已安裝
- [ ] 效能測試腳本已建立 (API, 影片生成, 資料庫)
- [ ] 測試執行腳本已建立
- [ ] 效能分析工具已設定
- [ ] npm scripts 已更新

### 測試檔案
- [ ] `tests/performance/helpers/common.js` 已建立
- [ ] `tests/performance/scripts/api-load-test.js` 已建立
- [ ] `tests/performance/scripts/video-generation-stress-test.js` 已建立
- [ ] `tests/performance/scripts/database-performance.js` 已建立
- [ ] `scripts/run-performance-tests.sh` 已建立
- [ ] `scripts/profile-app.sh` 已建立

### 驗收測試
- [ ] API 效能測試通過所有門檻
- [ ] 影片生成壓力測試完成
- [ ] 資料庫效能測試達標
- [ ] 已識別並記錄效能瓶頸

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `Request timeout` | API 回應太慢 | 檢查資料庫查詢、增加 timeout 設定 |
| `Connection refused` | 服務未啟動 | 確認後端服務正在運行 |
| `Too many open files` | 檔案描述符不足 | 增加系統限制: `ulimit -n 10000` |
| `Out of memory` | 記憶體不足 | 減少並發數或增加系統記憶體 |
| `Rate limit exceeded` | 請求過於頻繁 | 調整測試腳本的 sleep 時間 |

---

### 問題 1: K6 測試一直逾時

**錯誤訊息:**
```
WARN[0030] Request Failed    error="request timeout"
```

**解決方案:**

1. 檢查 API 是否正常運作:

```bash
curl -w "@curl-format.txt" http://localhost:3000/api/health
```

2. 增加 timeout 設定:

```javascript
export const options = {
  // 增加 HTTP 請求的 timeout
  httpDebug: 'full',
  insecureSkipTLSVerify: true,

  // 增加整體測試的 timeout
  setupTimeout: '60s',
  teardownTimeout: '60s',
};
```

3. 檢查是否有效能瓶頸:

```bash
# 使用 clinic doctor 診斷
clinic doctor -- node src/server.js
```

---

### 問題 2: 測試結果不穩定

**問題**: 每次測試結果差異很大

**解決方案:**

1. 確保測試環境穩定:

```bash
# 關閉其他佔用資源的程式
# 確保資料庫狀態一致

# 在測試前清空資料庫
npm run db:reset:test
npm run db:seed:test
```

2. 增加測試時間以獲得更穩定的結果:

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 20 },  // 增加暖身時間
    { duration: '10m', target: 20 }, // 增加穩定測試時間
    { duration: '2m', target: 0 },
  ],
};
```

3. 多次執行取平均值:

```bash
# 執行 5 次測試
for i in {1..5}; do
  echo "測試 $i/5"
  npm run perf:api
  sleep 30
done
```

---

### 問題 3: 資料庫查詢很慢

**問題**: 資料庫查詢時間 > 1000ms

**解決方案:**

1. 檢查是否有索引:

```sql
-- 列出所有索引
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename,
    indexname;
```

2. 找出慢查詢:

```sql
-- 啟用查詢日誌
ALTER DATABASE cheapcut SET log_min_duration_statement = 100;

-- 查看慢查詢
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

3. 加上必要的索引:

```sql
-- 常用的索引
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_voiceovers_user_id ON voiceovers(user_id);
CREATE INDEX idx_timelines_user_id ON timelines(user_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
```

4. 使用 EXPLAIN ANALYZE 分析查詢:

```sql
EXPLAIN ANALYZE
SELECT * FROM videos
WHERE user_id = 'user-001'
ORDER BY created_at DESC
LIMIT 20;
```

---

### 問題 4: 記憶體使用過高

**錯誤訊息:**
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

**解決方案:**

1. 增加 Node.js 記憶體限制:

```bash
# 在 package.json 中
"scripts": {
  "dev:backend": "node --max-old-space-size=4096 src/server.js"
}
```

2. 檢查記憶體洩漏:

```bash
# 使用 clinic heapprofiler
clinic heapprofiler -- node src/server.js

# 使用 Chrome DevTools
node --inspect src/server.js
# 然後在 Chrome 打開 chrome://inspect
```

3. 優化記憶體使用:

```javascript
// ❌ 錯誤: 一次載入所有資料
const allVideos = await db.query('SELECT * FROM videos');

// ✅ 正確: 使用分頁
const videos = await db.query(
  'SELECT * FROM videos LIMIT $1 OFFSET $2',
  [limit, offset]
);
```

```javascript
// ❌ 錯誤: 把大檔案完整讀入記憶體
const buffer = fs.readFileSync('large-video.mp4');

// ✅ 正確: 使用 stream
const stream = fs.createReadStream('large-video.mp4');
```

---

### 問題 5: 並發請求導致資料庫連線耗盡

**錯誤訊息:**
```
Error: Connection pool exhausted
```

**解決方案:**

1. 增加連線池大小:

```javascript
// src/lib/database.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,           // 增加最大連線數 (預設 10)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

2. 確保連線正確釋放:

```javascript
// ❌ 錯誤: 連線沒有釋放
const client = await pool.connect();
const result = await client.query('SELECT * FROM users');
// 忘記 client.release()

// ✅ 正確: 使用 try-finally
const client = await pool.connect();
try {
  const result = await client.query('SELECT * FROM users');
  return result.rows;
} finally {
  client.release(); // 確保釋放
}
```

3. 監控連線池狀態:

```javascript
// 定期輸出連線池狀態
setInterval(() => {
  console.log('Pool status:', {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  });
}, 10000);
```

---

## 📊 效能優化建議

### 1. API 優化

```javascript
// 使用快取減少資料庫查詢
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getUser(userId) {
  // 先檢查快取
  const cached = await redis.get(`user:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // 快取未命中,查詢資料庫
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

  // 存入快取 (5 分鐘)
  await redis.setex(`user:${userId}`, 300, JSON.stringify(user));

  return user;
}
```

### 2. 資料庫優化

```sql
-- 使用部分索引 (Partial Index)
-- 只索引常查詢的資料,減少索引大小
CREATE INDEX idx_active_videos
ON videos(user_id, created_at)
WHERE status = 'completed';

-- 使用表達式索引 (Expression Index)
-- 加速特定查詢
CREATE INDEX idx_email_lower
ON users(LOWER(email));
```

### 3. 非同步處理優化

```javascript
// 使用 Promise.all 平行處理
// ❌ 慢: 序列執行
const user = await getUser(userId);
const videos = await getVideos(userId);
const voiceovers = await getVoiceovers(userId);

// ✅ 快: 平行執行
const [user, videos, voiceovers] = await Promise.all([
  getUser(userId),
  getVideos(userId),
  getVoiceovers(userId),
]);
```

---

## 📚 延伸學習資源

如果你想深入了解效能測試:

- **K6 文件**: https://k6.io/docs/
- **Node.js 效能最佳實踐**: https://nodejs.org/en/docs/guides/simple-profiling/
- **PostgreSQL 效能調校**: https://wiki.postgresql.org/wiki/Performance_Optimization
- **Web 效能優化**: https://web.dev/performance/

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 效能測試全部通過門檻
3. ✅ 已識別並記錄效能瓶頸
4. ✅ 完成檢查清單都勾選
5. ✅ `npm run perf:all` 完全通過

### 最終驗收指令

```bash
# 執行完整效能測試
./scripts/run-performance-tests.sh

# 如果全部通過,你應該看到:
# ✓ API 負載測試通過
# ✓ 影片生成壓力測試通過
# ✓ 資料庫效能測試通過
# ✓ 所有效能指標達標
```

**恭喜!** 如果看到上面的輸出,代表 Task 4.2 完成了!

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:

**效能基準線**:
- API p95 回應時間: ___ms
- 影片生成 p95 時間: ___秒
- 資料庫查詢 p95 時間: ___ms
- 最大並發用戶數: ___

**效能瓶頸**:
- 最慢的 API: ___
- 最慢的資料庫查詢: ___
- 需要優化的部分: ___

**優化計畫**:
- 短期優化 (1週內): ___
- 中期優化 (1個月內): ___
- 長期優化 (3個月內): ___

---

**下一步**: Task 4.3 - GCP Cloud Run 部署

---

**文件版本**: 2.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
