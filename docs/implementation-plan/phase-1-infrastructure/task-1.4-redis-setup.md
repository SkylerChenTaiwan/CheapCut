# Task 1.4: Redis 快取設定

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 1.4 |
| **Task 名稱** | Redis 快取設定 |
| **所屬 Phase** | Phase 1: 基礎設施建立 |
| **預估時間** | 2-3 小時 (設定 0.5h + 實作 1h + 測試 0.5h + 整合 0.5h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 1.1 (資料庫 Schema) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**Redis 連接失敗?** 按照這個順序處理:

1. **檢查錯誤訊息關鍵字**
   ```
   Error: getaddrinfo ENOTFOUND
   → Redis URL 不正確或網路問題

   Error: NOAUTH Authentication required
   → 缺少 Redis 密碼或密碼錯誤

   Error: Connection timeout
   → Redis 服務無法連接
   ```

2. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 檢查環境設定

```bash
# 檢查 Redis URL 是否設定
echo $REDIS_URL
# 應該顯示: redis://...

# 測試 Redis 連接 (需要 redis-cli)
redis-cli -u $REDIS_URL ping
# 應該回應: PONG
```

---

### Step 3: 上網搜尋

**好的搜尋方式**:
```
"ioredis connection refused" ← 包含具體錯誤
"Upstash Redis Node.js setup" ← 包含你在用的服務
"BullMQ Redis connection timeout" ← 具體的技術問題
```

**推薦資源**:
- ioredis 文件: https://github.com/redis/ioredis
- Upstash 文件: https://docs.upstash.com/redis
- BullMQ 文件: https://docs.bullmq.io/

---

## 🎯 功能描述

建立 Redis 快取系統,提升系統效能並支援背景任務處理。

### 為什麼需要這個?

- 🎯 **問題**: 每次選片都要查詢資料庫,速度慢且浪費資源
- ✅ **解決**: 使用 Redis 快取候選片段,大幅提升回應速度
- 💡 **比喻**: Redis 就像書桌上的筆記本,常用資料放在手邊,不用每次都去書櫃找

### 根據 Overall Design

Redis 快取是 **MVP 高優先級功能**,主要用於:

1. **候選片段快取**: 智能選片時產生的候選片段清單 (關鍵用戶體驗)
2. **素材列表快取**: 用戶的素材列表
3. **配樂庫快取**: 配樂清單 (很少變動)
4. **背景任務佇列**: 素材分析、影片合成等長時間任務

### 完成後你會有:

- ✅ Upstash Redis 免費層設定完成
- ✅ Redis 連接封裝與測試
- ✅ 快取服務 (CacheService)
- ✅ 任務佇列服務 (使用 BullMQ)
- ✅ 完整的快取策略定義

---

## 📚 前置知識

### 1. Redis 基礎

**是什麼**: 高效能的記憶體資料庫,常用於快取

**核心概念**:
- **Key-Value 儲存**: 用 key 存取 value,類似 JavaScript 的 Object
- **記憶體儲存**: 資料存在記憶體,讀寫超快 (比 PostgreSQL 快 100 倍以上)
- **TTL (Time To Live)**: 可以設定資料過期時間,自動清除舊資料
- **資料型別**: String、List、Set、Hash、Sorted Set 等

**常用指令**:
```typescript
// 設定值
await redis.set('user:123', JSON.stringify({ name: 'Alice' }))

// 取得值
const user = await redis.get('user:123')

// 設定 TTL (60 秒後過期)
await redis.set('session:xyz', token, 'EX', 60)

// 刪除值
await redis.del('user:123')
```

---

### 2. 快取策略

**什麼時候該用快取?**
- ✅ 資料不常變動 (配樂清單、系統設定)
- ✅ 計算成本高 (候選片段查詢)
- ✅ 可以接受稍微過時的資料 (素材列表)
- ❌ 需要即時資料 (用戶餘額、訂單狀態)

**TTL 策略**:
```typescript
// 短期快取 (1-5 分鐘)
候選片段: 300 秒 (5 分鐘)
  → 用戶在編輯時需要,編輯完就不需要了

// 中期快取 (1-2 小時)
素材列表: 3600 秒 (1 小時)
  → 用戶不會頻繁上傳新素材

// 長期快取 (24 小時)
配樂庫: 86400 秒 (24 小時)
  → 配樂很少變動
```

**快取失效策略**:
```typescript
// 當資料變更時,主動清除快取
await db.materials.create(material)
await cache.delete(`materials:user_${userId}`) // ← 清除舊快取
```

---

### 3. 任務佇列 (BullMQ)

**是什麼**: 基於 Redis 的背景任務佇列系統

**為什麼需要**:
- 素材分析需要 15-30 秒 → 不能讓用戶等待
- 影片合成需要 30-60 秒 → 在背景執行
- 失敗時可以重試 → 提高可靠性

**核心概念**:
```typescript
// Producer: 加入任務
await videoQueue.add('analyze-material', {
  videoId: 'video_001',
  userId: 'user_123'
})

// Consumer: 處理任務
videoQueue.process('analyze-material', async (job) => {
  const { videoId } = job.data
  await analyzeMaterial(videoId)
})
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- Task 1.1: 資料庫 Schema (需要資料表結構)

### 套件依賴
```json
{
  "dependencies": {
    "ioredis": "^5.3.2",
    "bullmq": "^4.12.0"
  },
  "devDependencies": {
    "@types/ioredis": "^5.0.0"
  }
}
```

### 工具依賴
- Upstash Redis 帳號 (免費層)
- REDIS_URL 環境變數

### 環境檢查
```bash
# 檢查 Node.js 版本
node --version
# 應該 >= 18.0.0

# 安裝套件
npm install ioredis bullmq

# 設定環境變數 (.env.local)
REDIS_URL=redis://default:your_password@region.upstash.io:port
```

---

## 📝 實作步驟

### Step 1: 註冊 Upstash 並建立 Redis 資料庫

#### 1.1 註冊 Upstash

前往 https://console.upstash.com/ 註冊帳號 (可用 GitHub 登入)

#### 1.2 建立 Redis 資料庫

1. 點擊「Create Database」
2. 設定:
   - Name: `cheapcut-dev`
   - Type: `Regional`
   - Region: 選擇離你最近的 (例如: `asia-northeast1` 東京)
   - TLS: `Enabled`
   - Eviction: `No Eviction`

3. 點擊「Create」

#### 1.3 取得連接資訊

建立完成後,點擊資料庫名稱進入詳情頁,複製以下資訊:

```bash
# REST API (用於瀏覽器端,本專案不需要)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Redis CLI (用於伺服器端,本專案使用)
REDIS_URL=redis://default:xxxxx@region.upstash.io:port
```

#### 1.4 設定環境變數

```bash
# .env.local (本地開發)
REDIS_URL=redis://default:your_password@region.upstash.io:port

# .env.production (正式環境)
REDIS_URL=redis://default:your_password@region.upstash.io:port
```

**注意**: 不要將 `.env.local` 提交到 Git!

---

### Step 2: 建立 Redis 連接

建立 `src/lib/redis.ts`:

```typescript
/**
 * Redis 連接管理
 *
 * 功能:
 * - 建立並維護 Redis 連接
 * - 處理連接錯誤與重連
 * - 提供統一的 Redis 客戶端
 */

import Redis from 'ioredis'

// 單例模式,確保只有一個 Redis 連接
let redis: Redis | null = null

/**
 * 取得 Redis 客戶端
 *
 * @returns Redis 客戶端實例
 * @throws 如果缺少 REDIS_URL 環境變數
 */
export function getRedisClient(): Redis {
  // 如果已經有連接,直接回傳
  if (redis) {
    return redis
  }

  // 檢查環境變數
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    throw new Error('Missing REDIS_URL environment variable')
  }

  // 建立新連接
  redis = new Redis(redisUrl, {
    // 連接設定
    maxRetriesPerRequest: 3,        // 每個請求最多重試 3 次
    enableReadyCheck: true,          // 啟用就緒檢查
    lazyConnect: false,              // 立即連接,不延遲

    // 重連設定
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000) // 最多等 2 秒
      return delay
    },

    // 連接逾時設定
    connectTimeout: 10000,           // 10 秒連接逾時
    commandTimeout: 5000,            // 5 秒指令逾時
  })

  // 監聽連接事件
  redis.on('connect', () => {
    console.log('[Redis] Connected')
  })

  redis.on('ready', () => {
    console.log('[Redis] Ready to accept commands')
  })

  redis.on('error', (error) => {
    console.error('[Redis] Error:', error.message)
  })

  redis.on('close', () => {
    console.log('[Redis] Connection closed')
  })

  redis.on('reconnecting', () => {
    console.log('[Redis] Reconnecting...')
  })

  return redis
}

/**
 * 關閉 Redis 連接
 *
 * 用於測試環境或應用程式關閉時
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
    console.log('[Redis] Connection closed gracefully')
  }
}

// 預設匯出
export default getRedisClient
```

---

### Step 3: 實作快取服務

建立 `src/services/cache.service.ts`:

```typescript
/**
 * 快取服務
 *
 * 提供統一的快取操作介面,封裝 Redis 操作細節
 */

import { getRedisClient } from '../lib/redis'
import type Redis from 'ioredis'

/**
 * 快取鍵前綴 (用於避免鍵衝突)
 */
export const CachePrefix = {
  CANDIDATE_SEGMENTS: 'candidates:timeline',  // 候選片段
  MATERIALS: 'materials:user',                // 素材列表
  MUSIC_LIBRARY: 'music:library',             // 配樂庫
  USER_SESSION: 'session:user',               // 用戶 session
} as const

/**
 * 快取 TTL (秒)
 */
export const CacheTTL = {
  CANDIDATE_SEGMENTS: 300,    // 5 分鐘
  MATERIALS: 3600,            // 1 小時
  MUSIC_LIBRARY: 86400,       // 24 小時
  USER_SESSION: 1800,         // 30 分鐘
} as const

/**
 * 快取服務類別
 */
export class CacheService {
  private redis: Redis

  constructor() {
    this.redis = getRedisClient()
  }

  /**
   * 設定快取
   *
   * @param key 快取鍵
   * @param value 快取值 (會自動序列化為 JSON)
   * @param ttl 過期時間 (秒),預設不過期
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)

    if (ttl) {
      await this.redis.set(key, serialized, 'EX', ttl)
    } else {
      await this.redis.set(key, serialized)
    }
  }

  /**
   * 取得快取
   *
   * @param key 快取鍵
   * @returns 快取值 (自動反序列化),不存在則回傳 null
   */
  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.redis.get(key)

    if (!value) {
      return null
    }

    try {
      return JSON.parse(value) as T
    } catch (error) {
      console.error('[Cache] Failed to parse JSON:', error)
      return null
    }
  }

  /**
   * 刪除快取
   *
   * @param key 快取鍵或鍵陣列
   */
  async delete(key: string | string[]): Promise<void> {
    if (Array.isArray(key)) {
      if (key.length > 0) {
        await this.redis.del(...key)
      }
    } else {
      await this.redis.del(key)
    }
  }

  /**
   * 檢查快取是否存在
   *
   * @param key 快取鍵
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key)
    return result === 1
  }

  /**
   * 設定快取過期時間
   *
   * @param key 快取鍵
   * @param ttl 過期時間 (秒)
   */
  async expire(key: string, ttl: number): Promise<void> {
    await this.redis.expire(key, ttl)
  }

  /**
   * 取得快取剩餘過期時間
   *
   * @param key 快取鍵
   * @returns 剩餘秒數,-1 表示永不過期,-2 表示不存在
   */
  async ttl(key: string): Promise<number> {
    return await this.redis.ttl(key)
  }

  /**
   * 批次刪除快取 (使用模式匹配)
   *
   * @param pattern 鍵模式 (例如: "materials:user_*")
   */
  async deleteByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  /**
   * 清空所有快取 (慎用!)
   */
  async flush(): Promise<void> {
    await this.redis.flushdb()
  }

  // ========================================
  // 業務專用方法
  // ========================================

  /**
   * 快取候選片段
   *
   * @param timelineId 時間軸 ID
   * @param segmentIndex 片段索引
   * @param candidates 候選片段陣列
   */
  async setCandidateSegments(
    timelineId: string,
    segmentIndex: number,
    candidates: any[]
  ): Promise<void> {
    const key = `${CachePrefix.CANDIDATE_SEGMENTS}_${timelineId}:segment_${segmentIndex}`
    await this.set(key, candidates, CacheTTL.CANDIDATE_SEGMENTS)
  }

  /**
   * 取得候選片段快取
   *
   * @param timelineId 時間軸 ID
   * @param segmentIndex 片段索引
   * @returns 候選片段陣列,不存在則回傳 null
   */
  async getCandidateSegments(
    timelineId: string,
    segmentIndex: number
  ): Promise<any[] | null> {
    const key = `${CachePrefix.CANDIDATE_SEGMENTS}_${timelineId}:segment_${segmentIndex}`
    return await this.get(key)
  }

  /**
   * 快取用戶素材列表
   *
   * @param userId 用戶 ID
   * @param materials 素材陣列
   */
  async setUserMaterials(userId: string, materials: any[]): Promise<void> {
    const key = `${CachePrefix.MATERIALS}_${userId}`
    await this.set(key, materials, CacheTTL.MATERIALS)
  }

  /**
   * 取得用戶素材列表快取
   *
   * @param userId 用戶 ID
   * @returns 素材陣列,不存在則回傳 null
   */
  async getUserMaterials(userId: string): Promise<any[] | null> {
    const key = `${CachePrefix.MATERIALS}_${userId}`
    return await this.get(key)
  }

  /**
   * 清除用戶素材列表快取
   *
   * @param userId 用戶 ID
   */
  async deleteUserMaterials(userId: string): Promise<void> {
    const key = `${CachePrefix.MATERIALS}_${userId}`
    await this.delete(key)
  }

  /**
   * 快取配樂庫
   *
   * @param music 配樂陣列
   */
  async setMusicLibrary(music: any[]): Promise<void> {
    const key = CachePrefix.MUSIC_LIBRARY
    await this.set(key, music, CacheTTL.MUSIC_LIBRARY)
  }

  /**
   * 取得配樂庫快取
   *
   * @returns 配樂陣列,不存在則回傳 null
   */
  async getMusicLibrary(): Promise<any[] | null> {
    const key = CachePrefix.MUSIC_LIBRARY
    return await this.get(key)
  }
}

// 建立單例
let cacheService: CacheService | null = null

/**
 * 取得快取服務實例
 */
export function getCacheService(): CacheService {
  if (!cacheService) {
    cacheService = new CacheService()
  }
  return cacheService
}

export default getCacheService
```

---

### Step 4: 設定任務佇列

建立 `src/lib/queue.ts`:

```typescript
/**
 * 任務佇列設定
 *
 * 使用 BullMQ 處理背景任務
 */

import { Queue, Worker, QueueEvents } from 'bullmq'
import { getRedisClient } from './redis'
import type { Job } from 'bullmq'

/**
 * 佇列名稱
 */
export const QueueName = {
  MATERIAL_ANALYSIS: 'material-analysis',   // 素材分析
  VIDEO_GENERATION: 'video-generation',     // 影片生成
  VIDEO_RENDER: 'video-render',             // 影片合成
} as const

/**
 * Redis 連接設定 (BullMQ 格式)
 */
const connection = {
  // 從 ioredis 客戶端取得設定
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  // 或直接使用 Redis URL
  // 但 BullMQ 不支援直接使用 URL,需要手動解析
}

// 如果有 REDIS_URL,解析它
if (process.env.REDIS_URL) {
  const url = new URL(process.env.REDIS_URL)
  connection.host = url.hostname
  connection.port = parseInt(url.port || '6379')
  if (url.password) {
    connection.password = url.password
  }
}

/**
 * 建立佇列
 */
export const materialAnalysisQueue = new Queue(QueueName.MATERIAL_ANALYSIS, {
  connection,
  defaultJobOptions: {
    attempts: 3,              // 失敗時重試 3 次
    backoff: {
      type: 'exponential',    // 指數退避
      delay: 1000,            // 基礎延遲 1 秒
    },
    removeOnComplete: {
      age: 86400,             // 完成後保留 24 小時
      count: 1000,            // 最多保留 1000 筆
    },
    removeOnFail: {
      age: 604800,            // 失敗後保留 7 天
    },
  },
})

export const videoGenerationQueue = new Queue(QueueName.VIDEO_GENERATION, {
  connection,
  defaultJobOptions: {
    attempts: 2,              // 重試 2 次
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400,
      count: 1000,
    },
    removeOnFail: {
      age: 604800,
    },
  },
})

export const videoRenderQueue = new Queue(QueueName.VIDEO_RENDER, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400,
      count: 1000,
    },
    removeOnFail: {
      age: 604800,
    },
  },
})

/**
 * 任務處理器類型
 */
export type JobProcessor<T = any> = (job: Job<T>) => Promise<void>

/**
 * 建立 Worker
 *
 * @param queueName 佇列名稱
 * @param processor 任務處理器
 */
export function createWorker<T = any>(
  queueName: string,
  processor: JobProcessor<T>
): Worker {
  const worker = new Worker(queueName, processor, {
    connection,
    concurrency: 5,     // 同時處理 5 個任務
  })

  // 監聽事件
  worker.on('completed', (job) => {
    console.log(`[Queue] Job ${job.id} completed`)
  })

  worker.on('failed', (job, error) => {
    console.error(`[Queue] Job ${job?.id} failed:`, error.message)
  })

  worker.on('error', (error) => {
    console.error('[Queue] Worker error:', error)
  })

  return worker
}

/**
 * 建立佇列事件監聽器
 *
 * @param queueName 佇列名稱
 */
export function createQueueEvents(queueName: string): QueueEvents {
  const queueEvents = new QueueEvents(queueName, { connection })

  queueEvents.on('waiting', ({ jobId }) => {
    console.log(`[Queue] Job ${jobId} is waiting`)
  })

  queueEvents.on('active', ({ jobId }) => {
    console.log(`[Queue] Job ${jobId} is active`)
  })

  queueEvents.on('completed', ({ jobId, returnvalue }) => {
    console.log(`[Queue] Job ${jobId} completed`)
  })

  queueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`[Queue] Job ${jobId} failed: ${failedReason}`)
  })

  return queueEvents
}

// 匯出佇列實例
export default {
  materialAnalysis: materialAnalysisQueue,
  videoGeneration: videoGenerationQueue,
  videoRender: videoRenderQueue,
}
```

---

### Step 5: 建立快取策略文件

建立 `docs/cache-strategy.md`:

```markdown
# 快取策略

## 候選片段快取

**Key 格式**: `candidates:timeline_{timelineId}:segment_{index}`

**TTL**: 300 秒 (5 分鐘)

**理由**:
- 用戶在時間軸編輯時需要快速取得候選片段
- 編輯完成後快取就不需要了
- 查詢成本高 (需要多表 JOIN 和標籤匹配)

**失效策略**:
- 用戶修改配音時,自動清除相關快取
- TTL 到期自動清除

---

## 素材列表快取

**Key 格式**: `materials:user_{userId}`

**TTL**: 3600 秒 (1 小時)

**理由**:
- 用戶不會頻繁上傳新素材
- 列表查詢需要包含標籤、片段等關聯資料
- 可以接受稍微過時的資料 (最多延遲 1 小時)

**失效策略**:
- 用戶上傳新素材時,主動清除快取
- 用戶刪除素材時,主動清除快取
- TTL 到期自動清除

---

## 配樂庫快取

**Key 格式**: `music:library`

**TTL**: 86400 秒 (24 小時)

**理由**:
- 配樂庫很少變動 (可能幾天才更新一次)
- 所有用戶共用同一份資料
- 查詢成本低但頻率高

**失效策略**:
- 管理員新增/刪除配樂時,主動清除快取
- TTL 到期自動清除

---

## 快取使用範例

### 範例 1: 候選片段快取

```typescript
import { getCacheService } from '@/services/cache.service'

// 查詢候選片段時
async function getCandidates(timelineId: string, segmentIndex: number) {
  const cache = getCacheService()

  // 1. 先檢查快取
  const cached = await cache.getCandidateSegments(timelineId, segmentIndex)
  if (cached) {
    console.log('[Cache] Hit: candidate segments')
    return cached
  }

  // 2. 快取未命中,查詢資料庫
  console.log('[Cache] Miss: candidate segments')
  const candidates = await db.query(...)

  // 3. 寫入快取
  await cache.setCandidateSegments(timelineId, segmentIndex, candidates)

  return candidates
}
```

### 範例 2: 素材列表快取

```typescript
// 查詢素材列表
async function getUserMaterials(userId: string) {
  const cache = getCacheService()

  const cached = await cache.getUserMaterials(userId)
  if (cached) {
    return cached
  }

  const materials = await db.materials.findMany({ where: { userId } })
  await cache.setUserMaterials(userId, materials)

  return materials
}

// 上傳新素材時清除快取
async function uploadMaterial(userId: string, file: File) {
  const cache = getCacheService()

  // 1. 儲存素材
  const material = await db.materials.create(...)

  // 2. 清除快取
  await cache.deleteUserMaterials(userId)

  return material
}
```
```

---

## ✅ 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證 Redis 連接與基本操作

**測試檔案**: `tests/phase-1/task-1.4.basic.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getRedisClient, closeRedis } from '@/lib/redis'
import { getCacheService } from '@/services/cache.service'

describe('Task 1.4 - Basic: Redis Setup', () => {
  beforeAll(async () => {
    // 確保 Redis 連接正常
    const redis = getRedisClient()
    await redis.ping()
  })

  afterAll(async () => {
    // 清理連接
    await closeRedis()
  })

  it('應該能夠連接 Redis', async () => {
    const redis = getRedisClient()
    const result = await redis.ping()
    expect(result).toBe('PONG')
  })

  it('應該能夠設定和取得快取', async () => {
    const redis = getRedisClient()

    // 設定值
    await redis.set('test:key', 'test-value')

    // 取得值
    const value = await redis.get('test:key')
    expect(value).toBe('test-value')

    // 清理
    await redis.del('test:key')
  })

  it('應該能夠設定 TTL', async () => {
    const redis = getRedisClient()

    // 設定值with TTL (1 秒)
    await redis.set('test:ttl', 'value', 'EX', 1)

    // 立即取得應該存在
    const value1 = await redis.get('test:ttl')
    expect(value1).toBe('value')

    // 等待 1.5 秒後應該過期
    await new Promise(resolve => setTimeout(resolve, 1500))
    const value2 = await redis.get('test:ttl')
    expect(value2).toBeNull()
  })
})
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.4.basic.test.ts
```

**通過標準**:
- ✅ 能夠成功連接 Redis
- ✅ 能夠 SET/GET 資料
- ✅ 能夠設定 TTL 並自動過期
- ✅ 所有測試通過,無錯誤訊息

---

### Functional Acceptance (功能驗收)

**目標**: 驗證快取服務功能完整性

**測試檔案**: `tests/phase-1/task-1.4.functional.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getCacheService } from '@/services/cache.service'
import { closeRedis } from '@/lib/redis'

describe('Task 1.4 - Functional: Cache Service', () => {
  let cache: ReturnType<typeof getCacheService>

  beforeAll(() => {
    cache = getCacheService()
  })

  beforeEach(async () => {
    // 每個測試前清空快取
    await cache.flush()
  })

  afterAll(async () => {
    await cache.flush()
    await closeRedis()
  })

  it('應該能快取候選片段', async () => {
    const timelineId = 'timeline_001'
    const segmentIndex = 0
    const candidates = [
      { id: 'seg_001', score: 0.9 },
      { id: 'seg_002', score: 0.8 },
    ]

    // 設定快取
    await cache.setCandidateSegments(timelineId, segmentIndex, candidates)

    // 取得快取
    const cached = await cache.getCandidateSegments(timelineId, segmentIndex)
    expect(cached).toEqual(candidates)
  })

  it('應該能快取用戶素材', async () => {
    const userId = 'user_001'
    const materials = [
      { id: 'mat_001', name: 'video1.mp4' },
      { id: 'mat_002', name: 'video2.mp4' },
    ]

    await cache.setUserMaterials(userId, materials)
    const cached = await cache.getUserMaterials(userId)
    expect(cached).toEqual(materials)
  })

  it('應該正確處理快取失效', async () => {
    const key = 'test:expire'
    const value = { data: 'test' }

    // 設定 1 秒 TTL
    await cache.set(key, value, 1)

    // 立即取得應該存在
    const cached1 = await cache.get(key)
    expect(cached1).toEqual(value)

    // 等待 1.5 秒後應該過期
    await new Promise(resolve => setTimeout(resolve, 1500))
    const cached2 = await cache.get(key)
    expect(cached2).toBeNull()
  })

  it('應該能刪除快取', async () => {
    const userId = 'user_002'
    const materials = [{ id: 'mat_003' }]

    // 設定快取
    await cache.setUserMaterials(userId, materials)
    expect(await cache.getUserMaterials(userId)).toEqual(materials)

    // 刪除快取
    await cache.deleteUserMaterials(userId)
    expect(await cache.getUserMaterials(userId)).toBeNull()
  })

  it('應該能批次刪除快取', async () => {
    // 建立多個快取
    await cache.set('test:batch:1', 'value1')
    await cache.set('test:batch:2', 'value2')
    await cache.set('test:batch:3', 'value3')

    // 批次刪除
    await cache.deleteByPattern('test:batch:*')

    // 驗證已刪除
    expect(await cache.get('test:batch:1')).toBeNull()
    expect(await cache.get('test:batch:2')).toBeNull()
    expect(await cache.get('test:batch:3')).toBeNull()
  })
})
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.4.functional.test.ts
```

**通過標準**:
- ✅ 快取服務所有方法正常運作
- ✅ TTL 正確失效
- ✅ 批次刪除正常運作
- ✅ 業務專用方法正確運作

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證在真實場景中的快取應用

**測試檔案**: `tests/phase-1/task-1.4.e2e.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getCacheService } from '@/services/cache.service'
import { materialAnalysisQueue } from '@/lib/queue'
import { closeRedis } from '@/lib/redis'

describe('Task 1.4 - E2E: Cache Integration', () => {
  let cache: ReturnType<typeof getCacheService>

  beforeAll(() => {
    cache = getCacheService()
  })

  afterAll(async () => {
    await cache.flush()
    await closeRedis()
  })

  it('應該模擬完整的快取流程', async () => {
    const timelineId = 'timeline_e2e'
    const segmentIndex = 0

    // 模擬第一次查詢 (快取未命中)
    let cached = await cache.getCandidateSegments(timelineId, segmentIndex)
    expect(cached).toBeNull()

    // 模擬從資料庫查詢並快取
    const candidates = [
      { id: 'seg_001', score: 0.95 },
      { id: 'seg_002', score: 0.88 },
    ]
    await cache.setCandidateSegments(timelineId, segmentIndex, candidates)

    // 模擬第二次查詢 (快取命中)
    cached = await cache.getCandidateSegments(timelineId, segmentIndex)
    expect(cached).toEqual(candidates)

    // 驗證 TTL 設定正確 (應該是 300 秒)
    const key = `candidates:timeline_${timelineId}:segment_${segmentIndex}`
    const ttl = await cache.ttl(key)
    expect(ttl).toBeGreaterThan(0)
    expect(ttl).toBeLessThanOrEqual(300)
  })

  it('應該能夠加入背景任務', async () => {
    const job = await materialAnalysisQueue.add('analyze-video', {
      videoId: 'video_001',
      userId: 'user_001',
    })

    expect(job.id).toBeDefined()
    expect(job.data).toEqual({
      videoId: 'video_001',
      userId: 'user_001',
    })

    // 清理
    await job.remove()
  })
})
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.4.e2e.test.ts
```

**通過標準**:
- ✅ 完整的快取流程正確運作
- ✅ TTL 設定正確
- ✅ 任務佇列可以加入任務
- ✅ 無錯誤或警告訊息

---

## 📋 完成檢查清單

實作完成後,請依序檢查以下項目:

### 實作檢查
- [ ] Upstash Redis 資料庫已建立
- [ ] Redis 連接已設定 (`src/lib/redis.ts`)
- [ ] 快取服務已實作 (`src/services/cache.service.ts`)
- [ ] 任務佇列已設定 (`src/lib/queue.ts`)
- [ ] 快取策略文件已建立 (`docs/cache-strategy.md`)
- [ ] 環境變數已設定 (`.env.local`)

### 測試檔案
- [ ] `tests/phase-1/task-1.4.basic.test.ts` 已建立
- [ ] `tests/phase-1/task-1.4.functional.test.ts` 已建立
- [ ] `tests/phase-1/task-1.4.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過
- [ ] 無 console 錯誤訊息

### 程式碼品質
- [ ] 所有函數都有 JSDoc 註解
- [ ] 錯誤處理完整
- [ ] 符合 TypeScript 型別安全
- [ ] 遵循專案程式碼風格

---

## ❓ 常見問題與解決方案

### Q1: Redis 連接失敗 "Error: getaddrinfo ENOTFOUND"

**原因**: Redis URL 設定錯誤或網路問題

**解決方案**:
1. 檢查 `.env.local` 中的 `REDIS_URL` 是否正確
2. 確認 Upstash Redis 資料庫狀態是否正常
3. 測試網路連接:
   ```bash
   ping <your-redis-host>
   ```

---

### Q2: "Error: NOAUTH Authentication required"

**原因**: Redis 密碼錯誤或缺失

**解決方案**:
1. 確認 REDIS_URL 包含密碼:
   ```
   redis://default:your_password@host:port
   ```
2. 從 Upstash 控制台重新複製 Redis URL

---

### Q3: BullMQ 任務無法加入

**原因**: Redis 連接設定不正確

**解決方案**:
1. 檢查 `src/lib/queue.ts` 中的 connection 設定
2. 確認 Redis URL 格式正確
3. 測試 Redis 連接:
   ```typescript
   const redis = getRedisClient()
   await redis.ping() // 應該回傳 'PONG'
   ```

---

### Q4: 快取未命中但資料已存在

**原因**: Key 格式不一致

**解決方案**:
1. 檢查 Key 格式是否完全一致
2. 使用 Redis CLI 查看實際的 Key:
   ```bash
   redis-cli -u $REDIS_URL
   KEYS *
   ```
3. 確保沒有多餘的空格或特殊字元

---

### Q5: 本地開發想用本地 Redis 而非 Upstash

**解決方案**:
1. 安裝本地 Redis:
   ```bash
   # macOS
   brew install redis
   brew services start redis

   # Ubuntu
   sudo apt-get install redis-server
   sudo systemctl start redis
   ```

2. 修改 `.env.local`:
   ```bash
   REDIS_URL=redis://localhost:6379
   ```

---

### Q6: Upstash 免費層有什麼限制?

**Upstash Redis 免費層限制**:
- 最大資料庫大小: 256 MB
- 最大指令數: 每日 10,000 次
- 最大連接數: 100 個並發連接
- 最大資料大小: 單一 Key 最大 100 MB

**超過限制怎麼辦?**:
- MVP 階段限制通常足夠
- 如果超過,考慮升級到付費方案
- 或優化快取策略,減少資料大小

---

## ✨ Task 完成確認

完成這個 Task 後,你應該能夠:

✅ 設定並連接 Upstash Redis
✅ 使用快取服務加速查詢
✅ 設定背景任務佇列
✅ 定義並實作快取策略
✅ 撰寫並通過所有驗收測試

**下一步**: Task 1.5 - Logger 服務實作

---

**文件版本**: 1.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
