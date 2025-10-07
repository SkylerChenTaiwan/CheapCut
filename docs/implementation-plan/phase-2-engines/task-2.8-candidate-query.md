# Task 2.8: 候選片段查詢

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.8 |
| **Task 名稱** | 候選片段查詢 |
| **所屬 Phase** | Phase 2: 核心引擎開發 |
| **預估時間** | 3-4 小時 (資料庫查詢 1h + 語意搜尋 2h + 測試 1h) |
| **難度** | ⭐⭐⭐ 中高難度 |
| **前置 Task** | Task 2.6 (語意分析) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的查詢問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: JSONB query failed
          ^^^^^^^^^^^^^^^^^^  ← JSONB 查詢語法錯誤
   ```

2. **判斷錯誤類型**
   - `JSONB query failed` → JSONB 查詢語法問題
   - `Index not found` → 索引未建立
   - `Query timeout` → 查詢太慢需優化
   - `Empty result set` → 沒有匹配的片段

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"查詢不到資料"  ← 太模糊
"資料庫錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"PostgreSQL JSONB array contains query"  ← 具體功能
"Supabase full text search" ← 明確的搜尋問題
"PostgreSQL semantic search vector" ← 語意搜尋
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- PostgreSQL JSONB: https://www.postgresql.org/docs/current/datatype-json.html
- Supabase Queries: https://supabase.com/docs/guides/database/queries

**優先順序 2: 查詢優化**
- PostgreSQL Performance: https://www.postgresql.org/docs/current/performance-tips.html

---

### Step 3: 檢查資料庫與索引

```sql
-- 檢查片段資料
SELECT COUNT(*) FROM segments WHERE keywords IS NOT NULL;

-- 檢查索引是否存在
SELECT indexname FROM pg_indexes WHERE tablename = 'segments';

-- 測試 JSONB 查詢
SELECT * FROM segments
WHERE keywords @> '["測試"]'::jsonb
LIMIT 5;
```

---

## 🎯 功能描述

根據配音片段的文字內容和語意,從素材庫中查詢最相關的影片片段作為候選,為 AI 選片提供素材。

### 為什麼需要這個?

- 🎯 **問題**: 素材庫有上千個片段,如何快速找到與配音相關的片段?
- ✅ **解決**: 結合關鍵字匹配和語意搜尋,智慧查詢相關片段
- 💡 **比喻**: 就像搜尋引擎,輸入關鍵字找到最相關的內容

### 完成後你會有:

- ✅ 支援關鍵字查詢 (JSONB 陣列查詢)
- ✅ 支援主題查詢
- ✅ 支援全文搜尋 (字幕文字)
- ✅ 支援語意相似度計算
- ✅ 多條件組合查詢
- ✅ 結果排序和分頁
- ✅ 查詢效能優化

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. PostgreSQL JSONB 查詢

**是什麼**: PostgreSQL 的 JSON 資料型別,支援高效查詢

**核心操作**:
```sql
-- 檢查 JSONB 陣列是否包含元素
SELECT * FROM segments
WHERE keywords @> '["AI"]'::jsonb;

-- 檢查 JSONB 陣列是否與陣列有交集
SELECT * FROM segments
WHERE keywords ?| array['AI', '影片', '剪輯'];

-- 全文搜尋
SELECT * FROM segments
WHERE subtitle_text ILIKE '%AI 影片%';
```

**為什麼用 JSONB**:
- 靈活儲存陣列和物件
- 支援索引,查詢快速
- 不需要建立額外的關聯表

### 2. 語意相似度計算

**是什麼**: 計算兩段文字的語意相似程度

**簡單方法 - 關鍵字重疊**:
```typescript
// 計算兩組關鍵字的重疊度
function calculateKeywordSimilarity(
  keywords1: string[],
  keywords2: string[]
): number {
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);

  // 計算交集
  const intersection = new Set(
    [...set1].filter(x => set2.has(x))
  );

  // 計算聯集
  const union = new Set([...set1, ...set2]);

  // Jaccard 相似度
  return intersection.size / union.size;
}
```

**進階方法 - 向量相似度**:
- 使用 Embedding (如 OpenAI Embeddings)
- 計算餘弦相似度
- 需要額外的 API 呼叫

### 3. 查詢優化策略

**多階段查詢**:
```typescript
// 策略: 先用快速條件篩選,再用慢速條件排序
async function smartQuery(voiceoverText: string) {
  // 階段 1: 快速篩選 - 關鍵字匹配 (使用索引)
  const candidates = await filterByKeywords(keywords);

  // 階段 2: 精細排序 - 語意相似度
  const ranked = candidates.map(c => ({
    ...c,
    score: calculateSimilarity(voiceoverText, c.subtitle_text),
  }));

  // 階段 3: 取前 N 個
  return ranked.sort((a, b) => b.score - a.score).slice(0, 10);
}
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.6: 語意分析 (片段已有關鍵字和主題)
- ✅ Task 2.4: 片段切分 (素材庫已有片段)
- ✅ Task 2.7: 配音切分 (有配音片段可查詢)

### 資料庫需求
- PostgreSQL 12+
- Supabase 已設定

### 套件依賴
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0"
  }
}
```

### 資料庫索引

需要建立以下索引以提升查詢效能:

```sql
-- JSONB GIN 索引 (支援 @> 和 ?| 操作)
CREATE INDEX idx_segments_keywords ON segments USING GIN (keywords);
CREATE INDEX idx_segments_topics ON segments USING GIN (topics);

-- 全文搜尋索引
CREATE INDEX idx_segments_subtitle_text ON segments USING GIN (to_tsvector('english', subtitle_text));

-- 一般索引
CREATE INDEX idx_segments_user_id ON segments(user_id);
CREATE INDEX idx_segments_material_id ON segments(material_id);
```

---

## 📝 實作步驟

### 步驟 1: 建立資料庫索引

在 Supabase SQL Editor 執行:

```sql
-- 建立 JSONB 索引
CREATE INDEX IF NOT EXISTS idx_segments_keywords
ON segments USING GIN (keywords);

CREATE INDEX IF NOT EXISTS idx_segments_topics
ON segments USING GIN (topics);

-- 建立全文搜尋索引
CREATE INDEX IF NOT EXISTS idx_segments_subtitle_text
ON segments USING GIN (to_tsvector('english', subtitle_text));

-- 建立一般索引
CREATE INDEX IF NOT EXISTS idx_segments_user_id ON segments(user_id);
CREATE INDEX IF NOT EXISTS idx_segments_material_id ON segments(material_id);

-- 驗證索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'segments';
```

---

### 步驟 2: 建立候選片段查詢服務

建立 `backend/src/services/candidate-query.service.ts`:

```typescript
/**
 * 候選片段查詢服務
 *
 * 根據配音內容查詢相關的影片片段
 */

import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export class CandidateQueryService {
  /**
   * 查詢候選片段
   *
   * @param query - 查詢條件
   * @param userId - 使用者 ID
   * @returns 候選片段列表
   */
  async queryCandidates(
    query: CandidateQuery,
    userId: string
  ): Promise<CandidateSegment[]> {
    logger.info('Querying candidate segments', {
      query,
      userId,
    });

    try {
      // 1. 基礎查詢 (只查詢該使用者的片段)
      let queryBuilder = supabase
        .from('segments')
        .select(`
          id,
          material_id,
          start_time,
          end_time,
          subtitle_text,
          keywords,
          topics,
          sentiment,
          tone,
          thumbnail_url
        `)
        .eq('user_id', userId)
        .not('subtitle_text', 'is', null);

      // 2. 關鍵字過濾
      if (query.keywords && query.keywords.length > 0) {
        // 使用 ?| 操作符檢查陣列是否有交集
        queryBuilder = queryBuilder.or(
          query.keywords.map(k => `keywords.cs.{"${k}"}`).join(',')
        );
      }

      // 3. 主題過濾
      if (query.topics && query.topics.length > 0) {
        queryBuilder = queryBuilder.or(
          query.topics.map(t => `topics.cs.{"${t}"}`).join(',')
        );
      }

      // 4. 情感過濾
      if (query.sentiment) {
        queryBuilder = queryBuilder.eq('sentiment', query.sentiment);
      }

      // 5. 全文搜尋
      if (query.searchText) {
        queryBuilder = queryBuilder.ilike('subtitle_text', `%${query.searchText}%`);
      }

      // 6. 執行查詢
      const { data: segments, error } = await queryBuilder
        .limit(query.limit || 50);

      if (error) {
        throw new Error(`Query failed: ${error.message}`);
      }

      // 7. 計算相似度並排序
      const rankedSegments = this.rankSegments(
        segments || [],
        query
      );

      logger.info('Query completed', {
        totalResults: rankedSegments.length,
        query,
      });

      return rankedSegments;

    } catch (error) {
      logger.error('Candidate query failed', {
        error: error.message,
        query,
      });
      throw error;
    }
  }

  /**
   * 根據配音片段查詢候選
   *
   * @param voiceoverSegmentId - 配音片段 ID
   * @param userId - 使用者 ID
   * @returns 候選片段列表
   */
  async queryByVoiceoverSegment(
    voiceoverSegmentId: string,
    userId: string
  ): Promise<CandidateSegment[]> {
    // 1. 取得配音片段的語意資訊
    const { data: voiceoverSegment, error } = await supabase
      .from('voiceover_segments')
      .select('text, keywords, topics')
      .eq('id', voiceoverSegmentId)
      .single();

    if (error || !voiceoverSegment) {
      throw new Error('Voiceover segment not found');
    }

    // 2. 使用語意資訊查詢
    return this.queryCandidates(
      {
        keywords: voiceoverSegment.keywords || [],
        topics: voiceoverSegment.topics || [],
        searchText: voiceoverSegment.text,
        limit: 20,
      },
      userId
    );
  }

  /**
   * 對片段進行排序評分
   */
  private rankSegments(
    segments: any[],
    query: CandidateQuery
  ): CandidateSegment[] {
    return segments.map(segment => {
      let score = 0;

      // 關鍵字匹配分數
      if (query.keywords && query.keywords.length > 0) {
        const keywordScore = this.calculateKeywordOverlap(
          query.keywords,
          segment.keywords || []
        );
        score += keywordScore * 0.5; // 權重 50%
      }

      // 主題匹配分數
      if (query.topics && query.topics.length > 0) {
        const topicScore = this.calculateKeywordOverlap(
          query.topics,
          segment.topics || []
        );
        score += topicScore * 0.3; // 權重 30%
      }

      // 全文搜尋分數
      if (query.searchText && segment.subtitle_text) {
        const textScore = this.calculateTextSimilarity(
          query.searchText,
          segment.subtitle_text
        );
        score += textScore * 0.2; // 權重 20%
      }

      return {
        ...segment,
        relevanceScore: score,
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * 計算關鍵字重疊度 (Jaccard 相似度)
   */
  private calculateKeywordOverlap(
    keywords1: string[],
    keywords2: string[]
  ): number {
    if (keywords1.length === 0 || keywords2.length === 0) {
      return 0;
    }

    const set1 = new Set(keywords1.map(k => k.toLowerCase()));
    const set2 = new Set(keywords2.map(k => k.toLowerCase()));

    // 計算交集
    const intersection = new Set(
      [...set1].filter(x => set2.has(x))
    );

    // 計算聯集
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * 計算文字相似度 (簡單版本)
   */
  private calculateTextSimilarity(
    text1: string,
    text2: string
  ): number {
    // 簡化版: 計算共同出現的字詞比例
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);

    return this.calculateKeywordOverlap(words1, words2);
  }

  /**
   * 文字分詞 (簡單版本)
   */
  private tokenize(text: string): string[] {
    // 移除標點符號,分割成詞
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
  }
}

/**
 * 查詢條件
 */
export interface CandidateQuery {
  keywords?: string[];
  topics?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  searchText?: string;
  limit?: number;
}

/**
 * 候選片段
 */
export interface CandidateSegment {
  id: string;
  material_id: string;
  start_time: number;
  end_time: number;
  subtitle_text: string;
  keywords: string[];
  topics: string[];
  sentiment: string;
  tone: string;
  thumbnail_url?: string;
  relevanceScore: number;
}
```

---

### 步驟 3: 建立 API 端點

在 `backend/src/routes/candidates.ts` 建立端點:

```typescript
import { Router } from 'express';
import { CandidateQueryService } from '../services/candidate-query.service';
import { authenticate } from '../middleware/auth';

const router = Router();
const queryService = new CandidateQueryService();

/**
 * POST /api/candidates/query
 *
 * 查詢候選片段
 */
router.post('/query', authenticate, async (req, res) => {
  try {
    const { keywords, topics, sentiment, searchText, limit } = req.body;
    const userId = req.user.id;

    const candidates = await queryService.queryCandidates(
      {
        keywords,
        topics,
        sentiment,
        searchText,
        limit,
      },
      userId
    );

    res.json({
      success: true,
      data: {
        total: candidates.length,
        candidates,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/candidates/for-voiceover/:id
 *
 * 根據配音片段查詢候選
 */
router.get('/for-voiceover/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const candidates = await queryService.queryByVoiceoverSegment(
      id,
      userId
    );

    res.json({
      success: true,
      data: {
        voiceoverSegmentId: id,
        total: candidates.length,
        candidates,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
```

---

### 步驟 4: 註冊路由

在 `backend/src/index.ts` 加入路由:

```typescript
import candidatesRoutes from './routes/candidates';

// ...

app.use('/api/candidates', candidatesRoutes);
```

---

### 步驟 5: 測試查詢功能

```bash
# 啟動開發伺服器
npm run dev

# 測試查詢
curl -X POST http://localhost:8080/api/candidates/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["AI", "影片"],
    "topics": ["人工智慧"],
    "limit": 10
  }'
```

**預期結果**:
```json
{
  "success": true,
  "data": {
    "total": 8,
    "candidates": [
      {
        "id": "segment-1",
        "subtitle_text": "AI 技術在影片製作中的應用...",
        "keywords": ["AI", "影片", "製作"],
        "topics": ["人工智慧", "影片製作"],
        "relevanceScore": 0.85,
        "thumbnail_url": "https://..."
      }
    ]
  }
}
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (5 tests): 基礎功能驗證
- 📁 **Functional Acceptance** (6 tests): 功能正確性
- 📁 **E2E Acceptance** (3 tests): 完整流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-2.8

# 或分別執行
npm test -- tests/phase-2/task-2.8.basic.test.ts
npm test -- tests/phase-2/task-2.8.functional.test.ts
npm test -- tests/phase-2/task-2.8.e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ 資料庫索引已建立
- ✅ 查詢結果正確
- ✅ 相似度計算準確

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/phase-2/task-2.8.basic.test.ts`

1. ✓ 資料庫索引已建立
2. ✓ 可以執行基本查詢
3. ✓ JSONB 查詢語法正確
4. ✓ 查詢結果格式正確
5. ✓ 空查詢處理正確

### Functional Acceptance (6 tests)

測試檔案: `tests/phase-2/task-2.8.functional.test.ts`

1. ✓ 關鍵字查詢正確
2. ✓ 主題查詢正確
3. ✓ 全文搜尋正確
4. ✓ 相似度計算準確
5. ✓ 結果排序正確
6. ✓ 查詢效能符合要求

### E2E Acceptance (3 tests)

測試檔案: `tests/phase-2/task-2.8.e2e.test.ts`

1. ✓ 完整查詢流程成功
2. ✓ 根據配音片段查詢
3. ✓ 多條件組合查詢

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 資料庫設定
- [ ] JSONB 索引已建立
- [ ] 全文搜尋索引已建立
- [ ] 一般索引已建立
- [ ] 索引效能驗證通過

### 核心實作
- [ ] `CandidateQueryService` 已建立
- [ ] API 端點已建立
- [ ] 路由已註冊
- [ ] 相似度計算已實作

### 功能驗證
- [ ] 可以根據關鍵字查詢
- [ ] 可以根據主題查詢
- [ ] 可以全文搜尋
- [ ] 可以組合多條件查詢
- [ ] 結果正確排序

### 效能優化
- [ ] 查詢速度符合要求 (< 500ms)
- [ ] 索引正確使用
- [ ] 無 N+1 查詢問題

### 測試驗收
- [ ] Basic Verification 測試通過 (5/5)
- [ ] Functional Acceptance 測試通過 (6/6)
- [ ] E2E Acceptance 測試通過 (3/3)
- [ ] **總計: 14/14 測試通過**

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `Index not found` | 索引未建立 | 執行 CREATE INDEX |
| `JSONB query syntax error` | 查詢語法錯誤 | 檢查 JSONB 操作符 |
| `Query timeout` | 查詢太慢 | 建立索引或優化查詢 |
| `Empty result set` | 無匹配結果 | 檢查查詢條件 |
| `Permission denied` | RLS 權限問題 | 檢查 Row Level Security |

---

### 問題 1: JSONB 查詢語法錯誤

**錯誤訊息:**
```
Error: operator does not exist: jsonb @> text
```

**解決方案:**

確保將字串轉換為 JSONB:

```typescript
// ❌ 錯誤
.contains('keywords', '["AI"]')

// ✅ 正確
.contains('keywords', ['AI'])

// 或直接使用 SQL
.or('keywords.cs.{"AI"}')
```

---

### 問題 2: 查詢速度太慢

**問題**: 查詢超過 1 秒

**解決方案:**

1. **檢查索引是否使用**:
```sql
EXPLAIN ANALYZE
SELECT * FROM segments
WHERE keywords @> '["AI"]'::jsonb;
```

2. **建立複合索引**:
```sql
CREATE INDEX idx_segments_user_keywords
ON segments(user_id)
INCLUDE (keywords);
```

3. **限制查詢範圍**:
```typescript
// 加入時間範圍限制
queryBuilder = queryBuilder
  .gte('created_at', oneMonthAgo)
  .limit(50);
```

---

### 問題 3: 相似度計算不準確

**問題**: 排序結果與預期不符

**解決方案:**

調整權重或使用更好的相似度演算法:

```typescript
// 調整權重
score += keywordScore * 0.6;  // 提高關鍵字權重
score += topicScore * 0.3;
score += textScore * 0.1;     // 降低文字權重

// 或使用 TF-IDF
private calculateTfIdf(query: string, document: string): number {
  // 實作 TF-IDF 演算法
  // ...
}
```

---

### 問題 4: 繁體中文全文搜尋不佳

**問題**: ILIKE 查詢對中文效果不好

**解決方案:**

使用 PostgreSQL 的中文全文搜尋:

```sql
-- 建立中文分詞擴充
CREATE EXTENSION IF NOT EXISTS zhparser;

-- 建立中文全文搜尋設定
CREATE TEXT SEARCH CONFIGURATION chinese (PARSER = zhparser);

-- 建立全文搜尋索引
CREATE INDEX idx_segments_subtitle_text_chinese
ON segments USING GIN (to_tsvector('chinese', subtitle_text));

-- 查詢
SELECT * FROM segments
WHERE to_tsvector('chinese', subtitle_text) @@ to_tsquery('chinese', 'AI & 影片');
```

---

### 問題 5: 沒有查詢結果

**問題**: 明明有資料,查詢卻回傳空陣列

**解決方案:**

1. **檢查 RLS 權限**:
```sql
-- 確認 RLS 政策
SELECT * FROM pg_policies WHERE tablename = 'segments';

-- 暫時停用 RLS 測試
ALTER TABLE segments DISABLE ROW LEVEL SECURITY;
```

2. **檢查資料完整性**:
```sql
-- 檢查有多少片段有關鍵字
SELECT COUNT(*) FROM segments WHERE keywords IS NOT NULL;

-- 檢查關鍵字內容
SELECT keywords FROM segments LIMIT 10;
```

3. **簡化查詢條件**:
```typescript
// 先用最簡單的查詢測試
const { data } = await supabase
  .from('segments')
  .select('*')
  .limit(10);

console.log('Found segments:', data.length);
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **PostgreSQL JSONB**: https://www.postgresql.org/docs/current/datatype-json.html
- **Supabase Database**: https://supabase.com/docs/guides/database
- **Full-Text Search**: https://www.postgresql.org/docs/current/textsearch.html
- **Semantic Search**: https://simonwillison.net/2023/Oct/23/embeddings/

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 可以成功查詢候選片段

### 最終驗收指令

```bash
# 進入 backend 目錄
cd backend

# 執行驗收測試
npm run verify:task task-2.8

# 如果全部通過,你應該看到:
# PASS tests/phase-2/task-2.8.basic.test.ts
# PASS tests/phase-2/task-2.8.functional.test.ts
# PASS tests/phase-2/task-2.8.e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 2.8 完成了!

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 查詢效能數據 (平均查詢時間)
- 相似度計算的準確度
- 遇到的主要問題與解決方法
- 索引優化的效果

這些記錄在之後優化時會很有用!

---

**下一步**: 繼續 Task 2.9 - AI 選片決策

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
