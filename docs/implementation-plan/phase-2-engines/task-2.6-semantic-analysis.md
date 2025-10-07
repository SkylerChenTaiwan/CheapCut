# Task 2.6: 語意分析

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.6 |
| **Task 名稱** | 語意分析 |
| **所屬 Phase** | Phase 2: 核心引擎開發 |
| **預估時間** | 3-4 小時 (API 設定 1h + 實作 2h + 測試 1h) |
| **難度** | ⭐⭐⭐ 中高難度 |
| **前置 Task** | Task 2.5 (Whisper STT 整合) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的 Gemini API 問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: API key not valid
          ^^^^^^^^^^^^^^^^^^  ← API Key 錯誤
   ```

2. **判斷錯誤類型**
   - `API key not valid` → API Key 設定錯誤
   - `Quota exceeded` → API 配額用完
   - `Content blocked` → 內容被安全過濾器擋下
   - `RESOURCE_EXHAUSTED` → 請求頻率過高

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"AI 分析不行"  ← 太模糊
"Gemini 錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"Gemini API semantic analysis example"  ← 包含具體功能
"Google AI Studio quota limits" ← 明確的配額問題
"Gemini Flash vs Pro performance" ← 模型選擇比較
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- Gemini API: https://ai.google.dev/docs
- Prompt Guide: https://ai.google.dev/docs/prompt_best_practices

**優先順序 2: 成本計算**
- Pricing: https://ai.google.dev/pricing

---

### Step 3: 檢查 API 設定

```bash
# 檢查環境變數
echo $GEMINI_API_KEY
# 應該顯示你的 API Key

# 測試 API 連接
curl https://generativelanguage.googleapis.com/v1beta/models \
  -H "x-goog-api-key: $GEMINI_API_KEY"

# 應該回傳可用的模型列表
```

---

## 🎯 功能描述

使用 Google Gemini API 分析影片字幕的語意內容,提取關鍵字、主題和情感,為後續的智慧選片提供依據。

### 為什麼需要這個?

- 🎯 **問題**: 只有字幕文字,無法理解影片內容在講什麼
- ✅ **解決**: 使用 AI 理解語意,知道這段話的主題、情緒、重點
- 💡 **比喻**: 就像閱讀理解,不只看字,還要理解文意和情感

### 完成後你會有:

- ✅ Gemini API 整合完成
- ✅ 自動提取影片片段的關鍵字
- ✅ 分析片段的主題和情感
- ✅ 將分析結果儲存到資料庫
- ✅ 支援批次分析多個片段
- ✅ 成本追蹤和錯誤處理

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. Google Gemini API

**是什麼**: Google 的多模態 AI API,支援文字、圖片、影片分析

**核心概念**:
- **模型選擇**:
  - `gemini-1.5-flash`: 快速、便宜,適合大量分析 (推薦)
  - `gemini-1.5-pro`: 更準確,但較貴
- **Prompt Engineering**: 如何設計提示詞來獲得好的分析結果
- **Token 計算**: 影響成本和回應速度

**為什麼選 Gemini**:
- 免費額度高 (Flash: 每分鐘 15 RPM)
- 支援繁體中文
- 回應速度快
- 整合簡單

### 2. 語意分析 (Semantic Analysis)

**是什麼**: 理解文字背後的意思,而不只是字面意義

**分析維度**:
```typescript
interface SemanticAnalysis {
  // 關鍵字: 這段話的重點詞彙
  keywords: string[];

  // 主題: 這段話在討論什麼
  topics: string[];

  // 情感: 正面/中性/負面
  sentiment: 'positive' | 'neutral' | 'negative';

  // 語氣: 嚴肅/幽默/激動等
  tone: string;
}
```

**為什麼重要**:
- 讓 AI 能夠理解「這段配音在講 A,就該搭配有 A 內容的影片」
- 不是單純的關鍵字匹配,而是真正理解語意

### 3. Prompt Engineering

**是什麼**: 設計有效的 AI 提示詞

**基本原則**:
1. **明確指令**: 告訴 AI 要做什麼
2. **結構化輸出**: 要求 JSON 格式,方便程式處理
3. **提供範例**: 給 AI 看預期的輸出格式
4. **設定限制**: 避免 AI 產生不需要的內容

**範例**:
```typescript
const prompt = `
你是影片內容分析專家。請分析以下字幕內容,提取關鍵資訊。

字幕內容:
"""
${subtitleText}
"""

請以 JSON 格式回傳分析結果:
{
  "keywords": ["關鍵字1", "關鍵字2"],
  "topics": ["主題1", "主題2"],
  "sentiment": "positive|neutral|negative",
  "tone": "語氣描述"
}
`;
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.5: Whisper STT 整合 (已有字幕資料)
- ✅ Task 1.1: 資料庫 Schema (可以儲存分析結果)
- ✅ Task 1.6: 成本追蹤服務 (記錄 API 成本)

### API 需求
- Google AI Studio API Key (免費取得)

### 套件依賴
```json
{
  "dependencies": {
    "@google/generative-ai": "^0.2.0"
  }
}
```

### 資料庫 Schema

需要在 `segments` 表中有以下欄位:

```sql
-- 在 Task 1.1 應該已經建立,這裡僅供參考
CREATE TABLE segments (
  id UUID PRIMARY KEY,
  material_id UUID REFERENCES materials(id),
  start_time FLOAT NOT NULL,
  end_time FLOAT NOT NULL,
  subtitle_text TEXT,

  -- 語意分析結果
  keywords JSONB,        -- ["關鍵字1", "關鍵字2"]
  topics JSONB,          -- ["主題1", "主題2"]
  sentiment TEXT,        -- positive/neutral/negative
  tone TEXT,             -- 語氣描述

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📝 實作步驟

### 步驟 1: 取得 Gemini API Key

前往 Google AI Studio 取得免費 API Key:

```bash
# 1. 開啟瀏覽器前往:
# https://aistudio.google.com/app/apikey

# 2. 點擊 "Get API key"

# 3. 選擇或建立專案

# 4. 複製 API Key

# 5. 加入環境變數
echo "GEMINI_API_KEY=你的API_KEY" >> backend/.env
```

**快速驗證**:
```bash
# 測試 API Key 是否有效
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=你的API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

### 步驟 2: 安裝 Gemini SDK

在 `backend/` 目錄下安裝:

```bash
cd backend
npm install @google/generative-ai
```

**為什麼用官方 SDK?**
- 自動處理 API 請求格式
- 內建重試機制
- TypeScript 型別支援

---

### 步驟 3: 建立 Gemini 客戶端

建立 `backend/src/services/gemini.service.ts`:

```typescript
/**
 * Gemini AI 服務
 *
 * 為什麼需要這個?
 * - 統一管理 Gemini API 呼叫
 * - 自動處理錯誤和重試
 * - 追蹤 API 使用成本
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CostTrackerService } from './cost-tracker.service';
import { logger } from '../lib/logger';

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: any;
  private costTracker: CostTrackerService;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    this.client = new GoogleGenerativeAI(apiKey);

    // 使用 Flash 模型: 快速且便宜
    this.model = this.client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1, // 低溫度 = 更穩定的輸出
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    this.costTracker = new CostTrackerService();
  }

  /**
   * 分析文字的語意
   *
   * @param text - 要分析的文字內容
   * @param userId - 使用者 ID (用於成本追蹤)
   * @returns 語意分析結果
   */
  async analyzeSemantics(
    text: string,
    userId: string
  ): Promise<SemanticAnalysisResult> {
    const startTime = Date.now();

    try {
      // 建立分析 Prompt
      const prompt = this.buildAnalysisPrompt(text);

      // 呼叫 Gemini API
      logger.info('Calling Gemini API for semantic analysis', {
        textLength: text.length,
        userId,
      });

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const analysisText = response.text();

      // 解析 JSON 回應
      const analysis = this.parseAnalysisResult(analysisText);

      // 追蹤成本
      const duration = Date.now() - startTime;
      await this.trackCost(userId, text, analysisText, duration);

      logger.info('Semantic analysis completed', {
        keywords: analysis.keywords.length,
        topics: analysis.topics.length,
        sentiment: analysis.sentiment,
        duration,
      });

      return analysis;

    } catch (error) {
      logger.error('Gemini API error', { error, userId });
      throw new Error(`Semantic analysis failed: ${error.message}`);
    }
  }

  /**
   * 建立分析 Prompt
   */
  private buildAnalysisPrompt(text: string): string {
    return `
你是專業的影片內容分析專家。請分析以下字幕文字,提取關鍵資訊。

字幕內容:
"""
${text}
"""

請仔細分析並以 JSON 格式回傳結果,包含:
1. keywords: 3-5個最重要的關鍵字詞 (繁體中文)
2. topics: 1-3個主要討論主題 (繁體中文)
3. sentiment: 整體情感傾向 (positive/neutral/negative)
4. tone: 語氣風格 (例如: 專業、輕鬆、激動、幽默等,繁體中文)

範例輸出:
{
  "keywords": ["AI技術", "影片剪輯", "自動化"],
  "topics": ["人工智慧應用", "影片製作"],
  "sentiment": "positive",
  "tone": "專業且充滿熱情"
}

請只回傳 JSON,不要包含其他說明文字。
`.trim();
  }

  /**
   * 解析 AI 回應的 JSON
   */
  private parseAnalysisResult(text: string): SemanticAnalysisResult {
    try {
      // 移除可能的 markdown 程式碼區塊標記
      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanText);

      // 驗證必要欄位
      if (!parsed.keywords || !Array.isArray(parsed.keywords)) {
        throw new Error('Invalid keywords format');
      }
      if (!parsed.topics || !Array.isArray(parsed.topics)) {
        throw new Error('Invalid topics format');
      }
      if (!['positive', 'neutral', 'negative'].includes(parsed.sentiment)) {
        throw new Error('Invalid sentiment value');
      }

      return {
        keywords: parsed.keywords,
        topics: parsed.topics,
        sentiment: parsed.sentiment,
        tone: parsed.tone || 'neutral',
      };

    } catch (error) {
      logger.error('Failed to parse Gemini response', {
        text,
        error: error.message
      });

      // 如果解析失敗,回傳預設值
      return {
        keywords: [],
        topics: [],
        sentiment: 'neutral',
        tone: 'unknown',
      };
    }
  }

  /**
   * 追蹤 API 使用成本
   */
  private async trackCost(
    userId: string,
    inputText: string,
    outputText: string,
    duration: number
  ): Promise<void> {
    // Gemini Flash 計價 (2024)
    // Input: $0.075 / 1M tokens
    // Output: $0.30 / 1M tokens

    // 粗略估算: 1 token ≈ 4 字元
    const inputTokens = Math.ceil(inputText.length / 4);
    const outputTokens = Math.ceil(outputText.length / 4);

    const inputCost = (inputTokens / 1_000_000) * 0.075;
    const outputCost = (outputTokens / 1_000_000) * 0.30;
    const totalCost = inputCost + outputCost;

    await this.costTracker.track({
      userId,
      service: 'gemini-semantic-analysis',
      operation: 'analyze',
      inputTokens,
      outputTokens,
      cost: totalCost,
      duration,
      metadata: {
        model: 'gemini-1.5-flash',
      },
    });
  }
}

/**
 * 語意分析結果介面
 */
export interface SemanticAnalysisResult {
  keywords: string[];
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  tone: string;
}
```

---

### 步驟 4: 建立分析引擎

建立 `backend/src/engines/semantic-analyzer.ts`:

```typescript
/**
 * 語意分析引擎
 *
 * 負責分析影片片段的語意內容
 */

import { GeminiService } from '../services/gemini.service';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export class SemanticAnalyzer {
  private gemini: GeminiService;

  constructor() {
    this.gemini = new GeminiService();
  }

  /**
   * 分析單個片段
   *
   * @param segmentId - 片段 ID
   * @param userId - 使用者 ID
   */
  async analyzeSegment(
    segmentId: string,
    userId: string
  ): Promise<void> {
    logger.info('Starting segment semantic analysis', { segmentId });

    try {
      // 1. 取得片段的字幕文字
      const { data: segment, error: fetchError } = await supabase
        .from('segments')
        .select('subtitle_text')
        .eq('id', segmentId)
        .single();

      if (fetchError) throw fetchError;
      if (!segment?.subtitle_text) {
        throw new Error('Segment has no subtitle text');
      }

      // 2. 使用 Gemini 分析語意
      const analysis = await this.gemini.analyzeSemantics(
        segment.subtitle_text,
        userId
      );

      // 3. 更新資料庫
      const { error: updateError } = await supabase
        .from('segments')
        .update({
          keywords: analysis.keywords,
          topics: analysis.topics,
          sentiment: analysis.sentiment,
          tone: analysis.tone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', segmentId);

      if (updateError) throw updateError;

      logger.info('Segment semantic analysis completed', {
        segmentId,
        keywords: analysis.keywords.length,
        topics: analysis.topics.length,
      });

    } catch (error) {
      logger.error('Segment semantic analysis failed', {
        segmentId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 批次分析多個片段
   *
   * @param segmentIds - 片段 ID 陣列
   * @param userId - 使用者 ID
   */
  async analyzeBatch(
    segmentIds: string[],
    userId: string
  ): Promise<BatchAnalysisResult> {
    logger.info('Starting batch semantic analysis', {
      count: segmentIds.length,
    });

    const results: BatchAnalysisResult = {
      total: segmentIds.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    // 逐一分析 (避免 API rate limit)
    for (const segmentId of segmentIds) {
      try {
        await this.analyzeSegment(segmentId, userId);
        results.success++;

        // 避免 API rate limit: 每次請求間隔 100ms
        await this.sleep(100);

      } catch (error) {
        results.failed++;
        results.errors.push({
          segmentId,
          error: error.message,
        });
      }
    }

    logger.info('Batch semantic analysis completed', results);
    return results;
  }

  /**
   * 分析整個素材的所有片段
   *
   * @param materialId - 素材 ID
   * @param userId - 使用者 ID
   */
  async analyzeMaterial(
    materialId: string,
    userId: string
  ): Promise<BatchAnalysisResult> {
    logger.info('Starting material semantic analysis', { materialId });

    // 取得素材的所有片段
    const { data: segments, error } = await supabase
      .from('segments')
      .select('id')
      .eq('material_id', materialId)
      .not('subtitle_text', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch segments: ${error.message}`);
    }

    const segmentIds = segments.map(s => s.id);
    return this.analyzeBatch(segmentIds, userId);
  }

  /**
   * 延遲函式
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 批次分析結果
 */
interface BatchAnalysisResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    segmentId: string;
    error: string;
  }>;
}
```

---

### 步驟 5: 建立 API 端點

在 `backend/src/routes/segments.ts` 加入分析端點:

```typescript
import { Router } from 'express';
import { SemanticAnalyzer } from '../engines/semantic-analyzer';
import { authenticate } from '../middleware/auth';

const router = Router();
const analyzer = new SemanticAnalyzer();

/**
 * POST /api/segments/:id/analyze
 *
 * 分析單個片段的語意
 */
router.post('/:id/analyze', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await analyzer.analyzeSegment(id, userId);

    res.json({
      success: true,
      message: 'Semantic analysis completed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/materials/:id/analyze
 *
 * 分析整個素材的所有片段
 */
router.post('/materials/:id/analyze', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await analyzer.analyzeMaterial(id, userId);

    res.json({
      success: true,
      result,
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

### 步驟 6: 整合到處理流程

在 `backend/src/workflows/material-processing.ts` 中加入語意分析步驟:

```typescript
/**
 * 素材處理工作流程
 */
export class MaterialProcessingWorkflow {
  // ... 其他步驟 ...

  /**
   * 完整處理流程
   */
  async process(materialId: string, userId: string): Promise<void> {
    try {
      // 1. 上傳到儲存空間
      await this.storageUploader.upload(materialId);

      // 2. 影片分析 (取得 metadata)
      await this.videoAnalyzer.analyze(materialId);

      // 3. 標籤轉檔 (分離音視訊)
      await this.tagConverter.convert(materialId);

      // 4. 片段切分
      await this.segmentSplitter.split(materialId);

      // 5. 語音轉文字
      await this.sttEngine.transcribe(materialId);

      // 6. 語意分析 ← 新增的步驟
      const analyzer = new SemanticAnalyzer();
      await analyzer.analyzeMaterial(materialId, userId);

      logger.info('Material processing completed', { materialId });

    } catch (error) {
      logger.error('Material processing failed', {
        materialId,
        error: error.message
      });
      throw error;
    }
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
npm run verify:task task-2.6

# 或分別執行
npm test -- tests/phase-2/task-2.6.basic.test.ts
npm test -- tests/phase-2/task-2.6.functional.test.ts
npm test -- tests/phase-2/task-2.6.e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ Gemini API 可以正常呼叫
- ✅ 語意分析結果正確儲存
- ✅ 成本追蹤正確記錄

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/phase-2/task-2.6.basic.test.ts`

1. ✓ Gemini API 可以連接
2. ✓ 可以分析簡單文字
3. ✓ 回傳正確的 JSON 格式
4. ✓ 環境變數設定正確
5. ✓ SDK 正確安裝

### Functional Acceptance (6 tests)

測試檔案: `tests/phase-2/task-2.6.functional.test.ts`

1. ✓ 正確提取關鍵字
2. ✓ 正確分析主題
3. ✓ 正確判斷情感
4. ✓ 正確分析語氣
5. ✓ 分析結果正確儲存到資料庫
6. ✓ 成本追蹤正確記錄

### E2E Acceptance (3 tests)

測試檔案: `tests/phase-2/task-2.6.e2e.test.ts`

1. ✓ 完整分析流程成功
2. ✓ 批次分析多個片段
3. ✓ 錯誤處理正確

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### API 設定
- [ ] 已取得 Gemini API Key
- [ ] API Key 已加入 `.env`
- [ ] API 連接測試通過
- [ ] SDK 已安裝

### 核心實作
- [ ] `GeminiService` 已建立
- [ ] `SemanticAnalyzer` 已建立
- [ ] API 端點已建立
- [ ] 整合到處理流程

### 資料庫
- [ ] `segments` 表有語意分析欄位
- [ ] 分析結果可以正確儲存
- [ ] 可以查詢分析結果

### 功能驗證
- [ ] 可以分析單個片段
- [ ] 可以批次分析
- [ ] 可以分析整個素材
- [ ] 成本追蹤正確

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
| `API key not valid` | API Key 錯誤 | 檢查 `.env` 中的 API Key |
| `Quota exceeded` | 免費額度用完 | 等待配額重置或升級方案 |
| `Content blocked` | 內容被過濾 | 檢查輸入文字是否有敏感內容 |
| `RESOURCE_EXHAUSTED` | 請求太頻繁 | 增加請求間隔時間 |
| `Invalid JSON` | AI 回應格式錯誤 | 改進 Prompt 或增加解析容錯 |

---

### 問題 1: API Key 無效

**錯誤訊息:**
```
Error: API key not valid. Please pass a valid API key.
```

**解決方案:**

```bash
# 1. 檢查環境變數
echo $GEMINI_API_KEY

# 2. 確認 .env 檔案格式
cat backend/.env | grep GEMINI

# 3. 重新取得 API Key
# 前往 https://aistudio.google.com/app/apikey

# 4. 重新啟動應用程式 (讀取新的環境變數)
npm run dev
```

---

### 問題 2: 超過 API 配額

**錯誤訊息:**
```
Error: Quota exceeded for quota metric 'Generate Content API requests'
```

**解決方案:**

Gemini Flash 免費額度:
- 每分鐘 15 次請求 (RPM)
- 每天 1,500 次請求

**如何避免**:
```typescript
// 在批次分析時增加間隔
async analyzeBatch(segmentIds: string[], userId: string) {
  for (const segmentId of segmentIds) {
    await this.analyzeSegment(segmentId, userId);

    // 增加間隔到 5 秒 (每分鐘 12 次請求)
    await this.sleep(5000);
  }
}
```

---

### 問題 3: AI 回傳的 JSON 格式錯誤

**問題**: 有時候 AI 會回傳包含說明文字的內容,不是純 JSON

**解決方案:**

```typescript
private parseAnalysisResult(text: string): SemanticAnalysisResult {
  try {
    // 1. 移除 markdown 程式碼區塊
    let cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 2. 找到第一個 { 和最後一個 }
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    // 3. 解析 JSON
    const parsed = JSON.parse(cleanText);
    return parsed;

  } catch (error) {
    // 4. 如果還是失敗,回傳預設值
    logger.error('JSON parse failed', { text, error });
    return {
      keywords: [],
      topics: [],
      sentiment: 'neutral',
      tone: 'unknown',
    };
  }
}
```

---

### 問題 4: 成本計算不準確

**問題**: Token 計算與實際帳單不符

**解決方案:**

使用 API 回傳的實際 token 數:

```typescript
const result = await this.model.generateContent(prompt);
const response = result.response;

// 取得實際的 token 使用量
const usageMetadata = response.usageMetadata;
const inputTokens = usageMetadata.promptTokenCount;
const outputTokens = usageMetadata.candidatesTokenCount;

// 使用實際數據計算成本
await this.trackCost(userId, inputTokens, outputTokens, duration);
```

---

### 問題 5: 分析繁體中文效果不好

**問題**: AI 對繁體中文的理解不夠精準

**解決方案:**

在 Prompt 中明確要求繁體中文:

```typescript
const prompt = `
你是專業的繁體中文內容分析專家。請用繁體中文思考和回答。

重要提醒:
1. 關鍵字必須是繁體中文
2. 主題描述必須是繁體中文
3. 語氣描述必須是繁體中文

字幕內容:
"""
${text}
"""

請以繁體中文分析並回傳 JSON...
`;
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **Gemini API 文件**: https://ai.google.dev/docs
- **Prompt Engineering Guide**: https://www.promptingguide.ai/
- **Google AI Studio**: https://aistudio.google.com/ (互動式測試介面)
- **NLP 入門**: https://web.stanford.edu/~jurafsky/slp3/

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 可以成功分析片段並儲存結果

### 最終驗收指令

```bash
# 進入 backend 目錄
cd backend

# 執行驗收測試
npm run verify:task task-2.6

# 如果全部通過,你應該看到:
# PASS tests/phase-2/task-2.6.basic.test.ts
# PASS tests/phase-2/task-2.6.functional.test.ts
# PASS tests/phase-2/task-2.6.e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 2.6 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- Gemini API 的實際使用體驗
- 遇到的主要問題與解決方法
- 分析品質如何,是否需要調整 Prompt
- 成本估算是否準確

這些記錄在之後優化時會很有用!

---

**下一步**: 繼續 Task 2.7 - 配音切分

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
