# Task 2.9: AI 選片決策

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.9 |
| **Task 名稱** | AI 選片決策 |
| **所屬 Phase** | Phase 2: 核心引擎開發 |
| **預估時間** | 3-4 小時 (Prompt 設計 1h + API 整合 2h + 測試 1h) |
| **難度** | ⭐⭐⭐ 中高難度 |
| **前置 Task** | Task 2.8 (候選片段查詢) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的 AI 選片問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Invalid response format
          ^^^^^^^^^^^^^^^^^^^^^^^  ← AI 回應格式錯誤
   ```

2. **判斷錯誤類型**
   - `Invalid response format` → AI 回應格式不符預期
   - `Quota exceeded` → Gemini API 配額用完
   - `No candidates available` → 沒有候選片段可選
   - `Selection timeout` → AI 決策時間過長

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"AI 選不出來"  ← 太模糊
"選片錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"Gemini API structured output JSON"  ← 結構化輸出
"LLM prompt engineering for selection" ← Prompt 設計
"Gemini API multi-modal video analysis" ← 多模態分析
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- Gemini API: https://ai.google.dev/docs
- Structured Output: https://ai.google.dev/docs/structured_output

**優先順序 2: Prompt 設計**
- Prompt Engineering Guide: https://www.promptingguide.ai/

---

### Step 3: 檢查 API 與資料

```bash
# 檢查 Gemini API
echo $GEMINI_API_KEY

# 測試 API 連接
curl https://generativelanguage.googleapis.com/v1beta/models \
  -H "x-goog-api-key: $GEMINI_API_KEY"

# 檢查候選片段數量
# 在 Supabase SQL Editor 執行
SELECT COUNT(*) FROM segments WHERE keywords IS NOT NULL;
```

---

## 🎯 功能描述

使用 Google Gemini API 分析配音內容和候選影片片段,智慧選擇最適合的影片片段進行配對,實現自動化的影片內容匹配。

### 為什麼需要這個?

- 🎯 **問題**: 有了候選片段,如何選出最適合搭配配音的那幾個?
- ✅ **解決**: 使用 AI 理解配音語意和影片內容,做出智慧選擇
- 💡 **比喻**: 就像人工剪輯師挑選 B-Roll,AI 理解配音內容後選擇最匹配的畫面

### 完成後你會有:

- ✅ Gemini API 選片整合完成
- ✅ 智慧分析配音與影片的匹配度
- ✅ 自動選擇最佳候選片段
- ✅ 提供選擇理由和信心分數
- ✅ 支援多輪候選篩選
- ✅ 決策過程可追蹤和調整

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. Gemini API 決策能力

**是什麼**: 使用大型語言模型進行智慧決策

**核心概念**:
- **上下文理解**: AI 可以理解配音的語意和情感
- **比較分析**: AI 可以比較多個候選片段的適合度
- **結構化輸出**: 要求 AI 回傳 JSON 格式的決策結果
- **推理能力**: AI 可以說明選擇的理由

**決策流程**:
```typescript
// 1. 輸入配音片段資訊
const voiceoverInfo = {
  text: "今天要介紹 AI 影片剪輯技術",
  keywords: ["AI", "影片", "剪輯"],
  sentiment: "positive"
};

// 2. 輸入候選片段資訊
const candidates = [
  { id: 1, subtitle: "AI 科技展示", keywords: ["AI", "科技"] },
  { id: 2, subtitle: "影片剪輯軟體", keywords: ["影片", "軟體"] }
];

// 3. AI 分析並選擇
const selection = await gemini.select(voiceoverInfo, candidates);

// 4. 結果
{
  selectedId: 1,
  confidence: 0.85,
  reason: "候選片段 1 的 AI 科技內容與配音的 AI 技術主題最匹配"
}
```

### 2. Prompt Engineering 選片策略

**是什麼**: 設計有效的提示詞讓 AI 做出好的選擇

**關鍵要素**:
1. **角色定位**: 告訴 AI 它是專業的影片剪輯師
2. **任務說明**: 明確說明要選擇最適合的影片片段
3. **評估標準**: 提供評估匹配度的標準
4. **輸出格式**: 要求結構化的 JSON 回應

**範例 Prompt**:
```typescript
const prompt = `
你是專業的影片剪輯師,擅長為配音選擇最適合的影片畫面。

配音內容:
"""
${voiceoverText}
"""

配音語意資訊:
- 關鍵字: ${keywords.join(', ')}
- 主題: ${topics.join(', ')}
- 情感: ${sentiment}

候選影片片段:
${candidates.map((c, i) => `
${i + 1}. 片段 ID: ${c.id}
   字幕: ${c.subtitle_text}
   關鍵字: ${c.keywords.join(', ')}
   情感: ${c.sentiment}
`).join('\n')}

請根據以下標準選擇最適合的 1-3 個影片片段:
1. 語意相關性: 影片內容與配音主題的匹配度
2. 情感一致性: 影片情感與配音情感是否一致
3. 視覺吸引力: 影片畫面是否吸引人

請以 JSON 格式回傳選擇結果:
{
  "selections": [
    {
      "candidateId": "片段 ID",
      "confidence": 0.0-1.0,
      "reason": "選擇理由",
      "matchScore": {
        "semantic": 0.0-1.0,
        "emotional": 0.0-1.0,
        "visual": 0.0-1.0
      }
    }
  ]
}
`;
```

### 3. 選片決策演算法

**多階段選擇策略**:

```typescript
// 階段 1: 快速過濾 (使用候選查詢服務)
const candidates = await candidateQuery.query(voiceoverInfo);
// 從 1000+ 片段篩選到 20-50 個

// 階段 2: AI 深度分析 (使用 Gemini)
const selections = await gemini.select(voiceoverInfo, candidates);
// 從 20-50 個精選出 3-5 個

// 階段 3: 後處理優化
const optimized = optimizeSelections(selections);
// 調整順序、去重、檢查時長
```

**為什麼分階段**:
- 節省 API 成本 (不把所有片段都給 AI)
- 提升決策品質 (AI 專注分析少量高品質候選)
- 加快處理速度 (快速過濾 + 精細分析)

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.8: 候選片段查詢 (可以取得候選片段)
- ✅ Task 2.6: 語意分析 (片段已有語意資訊)
- ✅ Task 2.7: 配音切分 (有配音片段需要配對)

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

---

## 📝 實作步驟

### 步驟 1: 建立 AI 選片服務

建立 `backend/src/services/ai-selector.service.ts`:

```typescript
/**
 * AI 選片服務
 *
 * 使用 Gemini API 智慧選擇最適合的影片片段
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CostTrackerService } from './cost-tracker.service';
import { logger } from '../lib/logger';

export class AISelectorService {
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
        temperature: 0.3, // 較低溫度 = 更穩定的選擇
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    this.costTracker = new CostTrackerService();
  }

  /**
   * 為配音片段選擇最佳影片片段
   *
   * @param voiceoverInfo - 配音片段資訊
   * @param candidates - 候選影片片段列表
   * @param userId - 使用者 ID (用於成本追蹤)
   * @returns 選擇結果
   */
  async selectSegments(
    voiceoverInfo: VoiceoverInfo,
    candidates: CandidateSegment[],
    userId: string
  ): Promise<SelectionResult[]> {
    const startTime = Date.now();

    try {
      logger.info('Starting AI segment selection', {
        voiceoverText: voiceoverInfo.text.substring(0, 50),
        candidateCount: candidates.length,
        userId,
      });

      // 1. 建立選片 Prompt
      const prompt = this.buildSelectionPrompt(voiceoverInfo, candidates);

      // 2. 呼叫 Gemini API
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const selectionText = response.text();

      // 3. 解析 JSON 回應
      const selections = this.parseSelectionResult(selectionText);

      // 4. 驗證和後處理
      const validSelections = this.validateSelections(selections, candidates);

      // 5. 追蹤成本
      const duration = Date.now() - startTime;
      await this.trackCost(userId, prompt, selectionText, duration);

      logger.info('AI segment selection completed', {
        selectedCount: validSelections.length,
        duration,
      });

      return validSelections;

    } catch (error) {
      logger.error('AI segment selection failed', {
        error: error.message,
        userId,
      });
      throw new Error(`AI selection failed: ${error.message}`);
    }
  }

  /**
   * 批次處理多個配音片段
   *
   * @param voiceoverSegments - 配音片段列表
   * @param userId - 使用者 ID
   * @returns 所有選擇結果
   */
  async selectBatch(
    voiceoverSegments: VoiceoverInfo[],
    userId: string
  ): Promise<BatchSelectionResult[]> {
    const results: BatchSelectionResult[] = [];

    for (const voiceoverSegment of voiceoverSegments) {
      try {
        // 這裡需要整合 CandidateQueryService 取得候選片段
        // 為了示範,先假設已經有候選片段
        const candidates: CandidateSegment[] = []; // TODO: 實際查詢

        const selections = await this.selectSegments(
          voiceoverSegment,
          candidates,
          userId
        );

        results.push({
          voiceoverSegmentId: voiceoverSegment.id,
          selections,
          success: true,
        });

        // 避免 API rate limit
        await this.sleep(200);

      } catch (error) {
        results.push({
          voiceoverSegmentId: voiceoverSegment.id,
          selections: [],
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * 建立選片 Prompt
   */
  private buildSelectionPrompt(
    voiceoverInfo: VoiceoverInfo,
    candidates: CandidateSegment[]
  ): string {
    return `
你是專業的影片剪輯師,擅長為配音選擇最適合的影片畫面。你的任務是從候選影片片段中,選擇最適合搭配配音的片段。

配音內容:
"""
${voiceoverInfo.text}
"""

配音語意分析:
- 關鍵字: ${voiceoverInfo.keywords?.join(', ') || '無'}
- 主題: ${voiceoverInfo.topics?.join(', ') || '無'}
- 情感: ${voiceoverInfo.sentiment || 'neutral'}
- 語氣: ${voiceoverInfo.tone || '無'}
- 時長: ${voiceoverInfo.duration?.toFixed(2) || '未知'} 秒

候選影片片段 (共 ${candidates.length} 個):
${candidates.map((c, i) => `
${i + 1}. 候選片段 ID: ${c.id}
   字幕內容: ${c.subtitle_text || '無字幕'}
   關鍵字: ${c.keywords?.join(', ') || '無'}
   主題: ${c.topics?.join(', ') || '無'}
   情感: ${c.sentiment || 'neutral'}
   語氣: ${c.tone || '無'}
   時長: ${((c.end_time || 0) - (c.start_time || 0)).toFixed(2)} 秒
`).join('\n')}

請根據以下標準選擇 1-3 個最適合的影片片段:

評估標準:
1. 語意相關性 (權重 50%): 影片內容與配音主題的匹配度
   - 關鍵字重疊度
   - 主題相關性
   - 內容連貫性

2. 情感一致性 (權重 30%): 影片情感與配音情感是否一致
   - 情感傾向匹配
   - 語氣風格匹配

3. 時長適配性 (權重 20%): 影片時長與配音時長是否接近
   - 優先選擇時長接近的片段
   - 可接受略長但不可太短的片段

選擇原則:
- 必須選擇至少 1 個片段,最多 3 個片段
- 按照匹配度從高到低排序
- 每個選擇都要提供詳細理由
- 信心分數要客觀反映匹配程度

請以 JSON 格式回傳選擇結果 (只回傳 JSON,不要其他文字):
{
  "selections": [
    {
      "candidateId": "候選片段的 ID",
      "confidence": 0.85,
      "reason": "詳細的選擇理由",
      "matchScore": {
        "semantic": 0.9,
        "emotional": 0.8,
        "duration": 0.85
      }
    }
  ]
}
`.trim();
  }

  /**
   * 解析 AI 回應的 JSON
   */
  private parseSelectionResult(text: string): SelectionResult[] {
    try {
      // 移除可能的 markdown 程式碼區塊標記
      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // 找到第一個 { 和最後一個 }
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No JSON object found in response');
      }

      const jsonText = cleanText.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonText);

      // 驗證必要欄位
      if (!parsed.selections || !Array.isArray(parsed.selections)) {
        throw new Error('Invalid selections format');
      }

      return parsed.selections.map((s: any) => ({
        candidateId: s.candidateId,
        confidence: s.confidence || 0.5,
        reason: s.reason || '',
        matchScore: {
          semantic: s.matchScore?.semantic || 0.5,
          emotional: s.matchScore?.emotional || 0.5,
          duration: s.matchScore?.duration || 0.5,
        },
      }));

    } catch (error) {
      logger.error('Failed to parse selection result', {
        text,
        error: error.message,
      });

      // 解析失敗時回傳空陣列
      return [];
    }
  }

  /**
   * 驗證選擇結果
   */
  private validateSelections(
    selections: SelectionResult[],
    candidates: CandidateSegment[]
  ): SelectionResult[] {
    const candidateIds = new Set(candidates.map(c => c.id));

    return selections
      .filter(s => {
        // 檢查候選 ID 是否存在
        if (!candidateIds.has(s.candidateId)) {
          logger.warn('Invalid candidate ID in selection', {
            candidateId: s.candidateId,
          });
          return false;
        }

        // 檢查信心分數範圍
        if (s.confidence < 0 || s.confidence > 1) {
          logger.warn('Invalid confidence score', {
            candidateId: s.candidateId,
            confidence: s.confidence,
          });
          return false;
        }

        return true;
      })
      .slice(0, 3); // 最多保留 3 個
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
      service: 'gemini-ai-selection',
      operation: 'select',
      inputTokens,
      outputTokens,
      cost: totalCost,
      duration,
      metadata: {
        model: 'gemini-1.5-flash',
      },
    });
  }

  /**
   * 延遲函式
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 配音片段資訊
 */
export interface VoiceoverInfo {
  id: string;
  text: string;
  keywords?: string[];
  topics?: string[];
  sentiment?: string;
  tone?: string;
  duration?: number;
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
}

/**
 * 選擇結果
 */
export interface SelectionResult {
  candidateId: string;
  confidence: number;
  reason: string;
  matchScore: {
    semantic: number;
    emotional: number;
    duration: number;
  };
}

/**
 * 批次選擇結果
 */
interface BatchSelectionResult {
  voiceoverSegmentId: string;
  selections: SelectionResult[];
  success: boolean;
  error?: string;
}
```

---

### 步驟 2: 建立選片引擎

建立 `backend/src/engines/selection-engine.ts`:

```typescript
/**
 * 選片引擎
 *
 * 整合候選查詢和 AI 選片,完成完整的選片流程
 */

import { AISelectorService } from '../services/ai-selector.service';
import { CandidateQueryService } from '../services/candidate-query.service';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export class SelectionEngine {
  private aiSelector: AISelectorService;
  private candidateQuery: CandidateQueryService;

  constructor() {
    this.aiSelector = new AISelectorService();
    this.candidateQuery = new CandidateQueryService();
  }

  /**
   * 為配音片段選擇影片片段
   *
   * @param voiceoverSegmentId - 配音片段 ID
   * @param userId - 使用者 ID
   * @returns 選擇結果
   */
  async selectForVoiceover(
    voiceoverSegmentId: string,
    userId: string
  ): Promise<SelectionEngineResult> {
    logger.info('Starting selection for voiceover segment', {
      voiceoverSegmentId,
      userId,
    });

    try {
      // 1. 取得配音片段資訊
      const { data: voiceoverSegment, error: fetchError } = await supabase
        .from('voiceover_segments')
        .select('*')
        .eq('id', voiceoverSegmentId)
        .single();

      if (fetchError || !voiceoverSegment) {
        throw new Error('Voiceover segment not found');
      }

      // 2. 查詢候選片段
      const candidates = await this.candidateQuery.queryByVoiceoverSegment(
        voiceoverSegmentId,
        userId
      );

      logger.info('Found candidates', {
        count: candidates.length,
      });

      if (candidates.length === 0) {
        throw new Error('No candidates found for this voiceover segment');
      }

      // 3. 使用 AI 選片
      const selections = await this.aiSelector.selectSegments(
        {
          id: voiceoverSegment.id,
          text: voiceoverSegment.text,
          keywords: voiceoverSegment.keywords,
          topics: voiceoverSegment.topics,
          sentiment: voiceoverSegment.sentiment,
          tone: voiceoverSegment.tone,
          duration: voiceoverSegment.duration,
        },
        candidates,
        userId
      );

      logger.info('AI selection completed', {
        selectedCount: selections.length,
      });

      // 4. 儲存選擇結果
      await this.saveSelections(
        voiceoverSegmentId,
        selections,
        userId
      );

      return {
        voiceoverSegmentId,
        candidatesCount: candidates.length,
        selectionsCount: selections.length,
        selections,
      };

    } catch (error) {
      logger.error('Selection engine failed', {
        error: error.message,
        voiceoverSegmentId,
      });
      throw error;
    }
  }

  /**
   * 批次處理多個配音片段
   *
   * @param voiceoverSegmentIds - 配音片段 ID 列表
   * @param userId - 使用者 ID
   * @returns 批次選擇結果
   */
  async selectBatch(
    voiceoverSegmentIds: string[],
    userId: string
  ): Promise<BatchResult> {
    logger.info('Starting batch selection', {
      count: voiceoverSegmentIds.length,
    });

    const results: BatchResult = {
      total: voiceoverSegmentIds.length,
      success: 0,
      failed: 0,
      selections: [],
    };

    for (const segmentId of voiceoverSegmentIds) {
      try {
        const result = await this.selectForVoiceover(segmentId, userId);
        results.selections.push(result);
        results.success++;

        // 避免 API rate limit
        await this.sleep(300);

      } catch (error) {
        results.failed++;
        logger.error('Batch selection item failed', {
          segmentId,
          error: error.message,
        });
      }
    }

    logger.info('Batch selection completed', results);
    return results;
  }

  /**
   * 儲存選擇結果到資料庫
   */
  private async saveSelections(
    voiceoverSegmentId: string,
    selections: any[],
    userId: string
  ): Promise<void> {
    const records = selections.map((selection, index) => ({
      voiceover_segment_id: voiceoverSegmentId,
      video_segment_id: selection.candidateId,
      user_id: userId,
      confidence: selection.confidence,
      reason: selection.reason,
      match_score: selection.matchScore,
      rank: index + 1,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('segment_selections')
      .insert(records);

    if (error) {
      throw new Error(`Failed to save selections: ${error.message}`);
    }

    logger.info('Selections saved to database', {
      count: records.length,
    });
  }

  /**
   * 延遲函式
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 選片引擎結果
 */
interface SelectionEngineResult {
  voiceoverSegmentId: string;
  candidatesCount: number;
  selectionsCount: number;
  selections: any[];
}

/**
 * 批次結果
 */
interface BatchResult {
  total: number;
  success: number;
  failed: number;
  selections: SelectionEngineResult[];
}
```

---

### 步驟 3: 建立資料庫 Schema

在 Supabase SQL Editor 執行:

```sql
-- 建立選擇結果表
CREATE TABLE IF NOT EXISTS segment_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 關聯
  voiceover_segment_id UUID REFERENCES voiceover_segments(id) ON DELETE CASCADE,
  video_segment_id UUID REFERENCES segments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 選擇資訊
  confidence FLOAT NOT NULL,
  reason TEXT,
  match_score JSONB,
  rank INTEGER NOT NULL,

  -- 時間戳
  created_at TIMESTAMP DEFAULT NOW(),

  -- 確保同一個配音片段不會重複選擇同一個影片片段
  UNIQUE(voiceover_segment_id, video_segment_id)
);

-- 建立索引
CREATE INDEX idx_selections_voiceover ON segment_selections(voiceover_segment_id);
CREATE INDEX idx_selections_video ON segment_selections(video_segment_id);
CREATE INDEX idx_selections_user ON segment_selections(user_id);
CREATE INDEX idx_selections_confidence ON segment_selections(confidence);

-- RLS 政策
ALTER TABLE segment_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own selections"
  ON segment_selections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own selections"
  ON segment_selections FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 步驟 4: 建立 API 端點

在 `backend/src/routes/selection.ts` 建立端點:

```typescript
import { Router } from 'express';
import { SelectionEngine } from '../engines/selection-engine';
import { authenticate } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
const engine = new SelectionEngine();

/**
 * POST /api/selection/select/:voiceoverSegmentId
 *
 * 為配音片段選擇影片片段
 */
router.post('/select/:voiceoverSegmentId', authenticate, async (req, res) => {
  try {
    const { voiceoverSegmentId } = req.params;
    const userId = req.user.id;

    const result = await engine.selectForVoiceover(
      voiceoverSegmentId,
      userId
    );

    res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/selection/batch
 *
 * 批次選擇
 */
router.post('/batch', authenticate, async (req, res) => {
  try {
    const { voiceoverSegmentIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(voiceoverSegmentIds)) {
      return res.status(400).json({
        success: false,
        error: 'voiceoverSegmentIds must be an array',
      });
    }

    const result = await engine.selectBatch(
      voiceoverSegmentIds,
      userId
    );

    res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/selection/results/:voiceoverSegmentId
 *
 * 取得選擇結果
 */
router.get('/results/:voiceoverSegmentId', authenticate, async (req, res) => {
  try {
    const { voiceoverSegmentId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('segment_selections')
      .select(`
        *,
        video_segment:segments(*)
      `)
      .eq('voiceover_segment_id', voiceoverSegmentId)
      .eq('user_id', userId)
      .order('rank', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        voiceoverSegmentId,
        selections: data,
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

### 步驟 5: 註冊路由

在 `backend/src/index.ts` 加入路由:

```typescript
import selectionRoutes from './routes/selection';

// ...

app.use('/api/selection', selectionRoutes);
```

---

### 步驟 6: 測試 AI 選片

```bash
# 啟動開發伺服器
npm run dev

# 測試選片
curl -X POST http://localhost:8080/api/selection/select/voiceover-segment-id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**預期結果**:
```json
{
  "success": true,
  "data": {
    "voiceoverSegmentId": "uuid",
    "candidatesCount": 20,
    "selectionsCount": 3,
    "selections": [
      {
        "candidateId": "segment-1",
        "confidence": 0.92,
        "reason": "片段內容與配音的 AI 技術主題高度匹配,關鍵字重疊度高",
        "matchScore": {
          "semantic": 0.95,
          "emotional": 0.90,
          "duration": 0.88
        }
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
npm run verify:task task-2.9

# 或分別執行
npm test -- tests/phase-2/task-2.9.basic.test.ts
npm test -- tests/phase-2/task-2.9.functional.test.ts
npm test -- tests/phase-2/task-2.9.e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ Gemini API 可以正常呼叫
- ✅ 選擇結果格式正確
- ✅ 選擇理由合理

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/phase-2/task-2.9.basic.test.ts`

1. ✓ Gemini API 可以連接
2. ✓ 可以解析 JSON 回應
3. ✓ 資料庫表已建立
4. ✓ 環境變數設定正確
5. ✓ SDK 正確安裝

### Functional Acceptance (6 tests)

測試檔案: `tests/phase-2/task-2.9.functional.test.ts`

1. ✓ AI 可以正確選擇片段
2. ✓ 信心分數合理
3. ✓ 選擇理由詳細
4. ✓ 匹配分數計算正確
5. ✓ 選擇結果正確儲存
6. ✓ 成本追蹤正確記錄

### E2E Acceptance (3 tests)

測試檔案: `tests/phase-2/task-2.9.e2e.test.ts`

1. ✓ 完整選片流程成功
2. ✓ 批次選片正確
3. ✓ 錯誤處理正確

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### API 設定
- [ ] Gemini API Key 已設定
- [ ] API 連接測試通過
- [ ] SDK 已安裝

### 核心實作
- [ ] `AISelectorService` 已建立
- [ ] `SelectionEngine` 已建立
- [ ] API 端點已建立
- [ ] 路由已註冊

### 資料庫
- [ ] `segment_selections` 表已建立
- [ ] 索引已建立
- [ ] RLS 政策已設定
- [ ] 選擇結果可以正確儲存

### 功能驗證
- [ ] 可以為配音片段選擇影片片段
- [ ] 可以批次選擇
- [ ] 選擇結果合理
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
| `Invalid JSON response` | AI 回應格式錯誤 | 改進 Prompt 或增加解析容錯 |
| `No selections made` | AI 沒有選擇任何片段 | 檢查候選片段品質 |
| `Confidence too low` | 所有選擇信心分數很低 | 增加候選片段數量 |
| `API quota exceeded` | Gemini 配額用完 | 等待重置或優化請求頻率 |

---

### 問題 1: AI 回應格式不正確

**錯誤訊息:**
```
Error: No JSON object found in response
```

**解決方案:**

改進 Prompt 的輸出格式要求:

```typescript
const prompt = `
...

重要: 你必須回傳有效的 JSON 格式,不要包含任何其他文字或說明。

正確的回應範例:
{
  "selections": [
    {
      "candidateId": "abc-123",
      "confidence": 0.85,
      "reason": "選擇理由",
      "matchScore": {
        "semantic": 0.9,
        "emotional": 0.8,
        "duration": 0.85
      }
    }
  ]
}

請現在開始分析並回傳 JSON:
`;
```

---

### 問題 2: AI 選擇品質不佳

**問題**: AI 選擇的片段與配音不太匹配

**解決方案:**

1. **改進候選片段品質**:
```typescript
// 提高候選查詢的門檻
const candidates = await candidateQuery.queryCandidates(
  {
    keywords: voiceoverInfo.keywords,
    topics: voiceoverInfo.topics,
    limit: 30, // 增加候選數量
  },
  userId
);

// 過濾掉低品質候選
const qualityCandidates = candidates.filter(c =>
  c.relevanceScore > 0.3 && // 相關性門檻
  c.keywords.length > 0 &&  // 必須有關鍵字
  c.subtitle_text.length > 10 // 必須有足夠的字幕
);
```

2. **調整 Prompt 評估標準**:
```typescript
const prompt = `
評估標準 (更嚴格):
1. 語意相關性 (權重 60%): 必須高度相關
   - 至少 2 個關鍵字匹配
   - 主題必須一致

2. 情感一致性 (權重 25%): 情感必須匹配
   - positive 配 positive
   - negative 配 negative

3. 時長適配性 (權重 15%): 時長必須接近
   - 誤差不超過 30%

如果沒有任何候選片段達到標準,請說明原因。
`;
```

---

### 問題 3: 成本過高

**問題**: Gemini API 成本超出預算

**解決方案:**

1. **減少候選數量**:
```typescript
// 只給 AI 前 10 個最相關的候選
const topCandidates = candidates
  .sort((a, b) => b.relevanceScore - a.relevanceScore)
  .slice(0, 10);
```

2. **使用更短的 Prompt**:
```typescript
// 簡化候選資訊
${candidates.map((c, i) => `
${i + 1}. ID: ${c.id}
   字幕: ${c.subtitle_text.substring(0, 100)}... // 截斷長字幕
   關鍵字: ${c.keywords.slice(0, 5).join(', ')} // 只取前 5 個關鍵字
`).join('\n')}
```

3. **快取選擇結果**:
```typescript
// 檢查是否已有選擇結果
const existing = await supabase
  .from('segment_selections')
  .select('*')
  .eq('voiceover_segment_id', voiceoverSegmentId);

if (existing.data && existing.data.length > 0) {
  logger.info('Using cached selections');
  return existing.data;
}
```

---

### 問題 4: 選擇結果不穩定

**問題**: 同樣的輸入,每次選擇結果都不同

**解決方案:**

降低 temperature 參數:

```typescript
this.model = this.client.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.1, // 降到 0.1,更穩定
    topP: 0.9,
    maxOutputTokens: 2048,
  }
});
```

---

### 問題 5: 批次處理速度太慢

**問題**: 處理 100 個配音片段需要很長時間

**解決方案:**

使用平行處理 (注意 API rate limit):

```typescript
async selectBatch(
  voiceoverSegmentIds: string[],
  userId: string
): Promise<BatchResult> {
  // 分批處理,每批 5 個
  const batchSize = 5;
  const results: BatchResult = {
    total: voiceoverSegmentIds.length,
    success: 0,
    failed: 0,
    selections: [],
  };

  for (let i = 0; i < voiceoverSegmentIds.length; i += batchSize) {
    const batch = voiceoverSegmentIds.slice(i, i + batchSize);

    // 平行處理這一批
    const batchPromises = batch.map(id =>
      this.selectForVoiceover(id, userId)
        .catch(error => ({ error, id }))
    );

    const batchResults = await Promise.all(batchPromises);

    // 處理結果
    for (const result of batchResults) {
      if ('error' in result) {
        results.failed++;
      } else {
        results.success++;
        results.selections.push(result);
      }
    }

    // 批次之間的延遲
    if (i + batchSize < voiceoverSegmentIds.length) {
      await this.sleep(1000);
    }
  }

  return results;
}
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **Gemini API 文件**: https://ai.google.dev/docs
- **Structured Output**: https://ai.google.dev/docs/structured_output
- **Prompt Engineering Guide**: https://www.promptingguide.ai/
- **LLM for Decision Making**: https://arxiv.org/abs/2305.15324

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 可以成功使用 AI 選擇片段

### 最終驗收指令

```bash
# 進入 backend 目錄
cd backend

# 執行驗收測試
npm run verify:task task-2.9

# 如果全部通過,你應該看到:
# PASS tests/phase-2/task-2.9.basic.test.ts
# PASS tests/phase-2/task-2.9.functional.test.ts
# PASS tests/phase-2/task-2.9.e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 2.9 完成了!

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- AI 選片的品質如何
- Prompt 優化的經驗
- 遇到的主要問題與解決方法
- 成本估算是否準確

這些記錄在之後優化時會很有用!

---

**下一步**: 繼續 Task 2.10 - 時間軸生成

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
