# Task 2.0: Prompt 管理系統

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.0 |
| **Task 名稱** | Prompt 管理系統 |
| **所屬 Phase** | Phase 2: 核心引擎實作 |
| **預估時間** | 3-4 小時 |
| **前置 Task** | Phase 1 完成 |
| **檔案位置** | `docs/implementation-plan/phase-2-engines/task-2.0-prompt-management.md` |

---

## 📝 狀態

**文件狀態**: 📝 待撰寫

此文件為骨架，具體內容待填充。

---

## 功能描述

根據 Overall Design (05-data-flow.md)，Prompt 是產品核心競爭力，需要：

1. **使用檔案系統管理**（Markdown + Frontmatter）而非資料庫
2. **支援 Git 版本控制**
3. **支援變數替換**（模板引擎）
4. **快取機制**（正式環境）
5. **熱重載**（開發環境）

主要包含：
- 建立 Prompt 檔案結構
- 實作 PromptManager 類別
- 實作模板引擎（變數替換）
- 實作快取機制
- 建立初始 Prompt 檔案

---

## 前置知識

### 1. Markdown Frontmatter

**什麼是 Frontmatter?**

Frontmatter 是在 Markdown 檔案開頭用 `---` 包圍的 YAML 格式 metadata。

**範例**:
```markdown
---
title: 我的文章
author: John
date: 2025-10-07
---

# 文章內容
這裡是正文...
```

**在本專案中的用途**:
- 儲存 Prompt 的 metadata(版本、變數、模型設定等)
- 使用 `gray-matter` 套件來解析

### 2. 模板引擎

**什麼是模板引擎?**

模板引擎允許在文字中使用變數佔位符,執行時替換成實際值。

**範例**:
```
你好 {{name}},今天是 {{date}}
```

執行時提供 `{name: "John", date: "2025-10-07"}`,結果為:
```
你好 John,今天是 2025-10-07
```

**在本專案中的用途**:
- Prompt 中使用 `{{transcript}}`, `{{duration}}` 等變數
- 執行時替換成實際的配音文字、時長等資料
- 使用簡單的 `replace` 函式即可實作

### 3. Git 版本控制

**為什麼 Prompt 要用 Git 管理?**

| 優點 | 說明 |
|------|------|
| 自動記錄歷史 | 每次修改都有完整記錄 |
| 可以回溯 | 發現問題可以快速回到舊版本 |
| Code Review | 可以讓團隊審查 Prompt 修改 |
| 協作友善 | 多人可以同時修改不同 Prompt |

**操作流程**:
```bash
# 修改 Prompt 檔案
vim prompts/voiceover-processing/voiceover-split.md

# 提交修改
git add prompts/voiceover-processing/voiceover-split.md
git commit -m "feat(prompt): 改進配音切分邏輯 v2"

# 推送到遠端
git push
```

---

## 前置依賴

### 檔案依賴
- Phase 1 已完成

### 套件依賴
```json
{
  "dependencies": {
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "@types/gray-matter": "^4.0.3"
  }
}
```

### 工具依賴
無特殊工具需求

---

## 實作步驟

### Step 1: 建立 Prompt 檔案結構

**在專案根目錄建立以下資料夾結構**:

```bash
# 建立 Prompt 目錄結構
mkdir -p prompts/voiceover-processing
mkdir -p prompts/video-selection
mkdir -p prompts/material-processing
```

**最終結構**:
```
prompts/
├── voiceover-processing/      # 配音處理相關 Prompt
│   ├── voiceover-split.md    # 配音切分
│   ├── semantic-analysis.md  # 語意分析
│   └── README.md             # 說明文件
├── video-selection/           # 影片選擇相關 Prompt
│   ├── segment-select.md     # 片段選擇
│   ├── music-select.md       # 配樂選擇
│   └── README.md
├── material-processing/       # 素材處理相關 Prompt
│   ├── tag-conversion.md     # 標籤轉換
│   └── README.md
└── README.md                  # 總說明文件
```

**提示**: 每個類別都有獨立的 README.md 來說明該類別的 Prompt 用途。

---

### Step 2: 建立 Prompt 檔案格式

**在 `prompts/voiceover-processing/voiceover-split.md` 建立範例檔案**:

```markdown
---
name: voiceover-split
category: voiceover-processing
version: 1
variables:
  - transcript
  - duration
active: true
model: gemini-flash
temperature: 0.7
updated: 2025-10-07
notes: |
  v1: 初版
---

# 配音切分 Prompt

## 用途
將配音切分成有節奏的片段，用於智能選片。

## 變數說明
- `transcript`: 配音文字（STT 轉錄結果）
- `duration`: 配音總長度（秒）

---

## Prompt

你是專業影片導演。請將以下配音切分成有節奏的片段。

配音文字：
"""
{{transcript}}
"""

配音總長度：{{duration}} 秒

切分原則：
1. 根據語意自然切分
2. 片段長度要有變化（1-12秒）
3. 重要內容可以較長（5-12秒）
4. 轉場/停頓較短（1-3秒）

請以 JSON 格式回應：
{
  "segments": [
    { "start": 0, "end": 8, "text": "...", "keywords": ["...", "..."] }
  ]
}
```

### Step 3: 實作 PromptManager 類別

**建立 `src/services/prompt-manager.ts`**:

這個類別負責:
1. 從檔案系統載入 Prompt
2. 解析 Frontmatter
3. 快取 Prompt (正式環境)
4. 提供變數替換功能

**完整程式碼**:

```typescript
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

interface PromptMetadata {
  name: string;
  category: string;
  version: number;
  variables: string[];
  active: boolean;
  model?: string;
  temperature?: number;
  updated: string;
  notes?: string;
}

interface PromptData {
  metadata: PromptMetadata;
  content: string;
}

export class PromptManager {
  private promptsDir = path.join(__dirname, '../../prompts');
  private cache = new Map<string, PromptData>();

  /**
   * 從檔案載入 Prompt
   */
  async loadPrompt(category: string, name: string): Promise<PromptData> {
    const cacheKey = `${category}/${name}`;

    // 開發環境不使用快取 (方便測試)
    if (process.env.NODE_ENV !== 'production') {
      return await this.readPromptFile(category, name);
    }

    // 正式環境使用快取
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const promptData = await this.readPromptFile(category, name);
    this.cache.set(cacheKey, promptData);
    return promptData;
  }

  /**
   * 從檔案讀取並解析 Prompt
   */
  private async readPromptFile(category: string, name: string): Promise<PromptData> {
    const filePath = path.join(this.promptsDir, category, `${name}.md`);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // 解析 frontmatter
    const { data, content } = matter(fileContent);

    // 檢查是否啟用
    if (!data.active) {
      throw new Error(`Prompt ${category}/${name} is not active`);
    }

    // 提取 "## Prompt" 區塊的內容
    const promptMatch = content.match(/## Prompt\s+([\s\S]*?)(?=\n##|$)/i);
    if (!promptMatch) {
      throw new Error(`No "## Prompt" section found in ${filePath}`);
    }

    return {
      metadata: data as PromptMetadata,
      content: promptMatch[1].trim()
    };
  }

  /**
   * 渲染 Prompt (填入變數)
   */
  renderPrompt(template: string, variables: Record<string, any>): string {
    let rendered = template;

    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    return rendered;
  }

  /**
   * 完整執行流程: 載入 + 渲染
   */
  async executePrompt(
    category: string,
    name: string,
    variables: Record<string, any>
  ): Promise<{ prompt: string; model?: string; temperature?: number }> {
    const { metadata, content } = await this.loadPrompt(category, name);
    const prompt = this.renderPrompt(content, variables);

    return {
      prompt,
      model: metadata.model,
      temperature: metadata.temperature
    };
  }

  /**
   * 清除快取 (開發時使用 或 更新 Prompt 後呼叫)
   */
  clearCache() {
    this.cache.clear();
  }
}
```

**使用範例**:

```typescript
const promptManager = new PromptManager();

// 執行 Prompt
const { prompt, model, temperature } = await promptManager.executePrompt(
  'voiceover-processing',
  'voiceover-split',
  {
    transcript: '大家好,今天要介紹我們的新產品...',
    duration: 45
  }
);

// 呼叫 AI
const response = await ai.chat({
  model: model || 'gemini-flash',
  temperature: temperature ?? 0.7,
  messages: [{ role: 'user', content: prompt }]
});
```

---

### Step 4: 實作變數替換

變數替換已經在 `PromptManager.renderPrompt()` 中實作了。

**工作原理**:

```typescript
// 範本
const template = "你好 {{name}},今天是 {{date}}";

// 變數
const variables = { name: "John", date: "2025-10-07" };

// 使用 RegExp 替換
let rendered = template;
for (const [key, value] of Object.entries(variables)) {
  rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
}

// 結果: "你好 John,今天是 2025-10-07"
```

**注意事項**:
- 使用全域替換 (`'g'` flag) 以替換所有相同變數
- 所有變數都轉換成字串 (`String(value)`)
- 如果變數不存在,佔位符會保留不動

---

### Step 5: 建立初始 Prompt 檔案

**需要建立的 Prompt 檔案**:

| 檔案路徑 | 用途 | 變數 |
|---------|------|------|
| `prompts/voiceover-processing/voiceover-split.md` | 配音切分 | transcript, duration |
| `prompts/voiceover-processing/semantic-analysis.md` | 語意分析 | text |
| `prompts/video-selection/segment-select.md` | 智能選片 | voiceText, duration, candidates |
| `prompts/video-selection/music-select.md` | 配樂選擇 | tone, duration |
| `prompts/material-processing/tag-conversion.md` | 標籤轉換 | apiResponse |

**實作步驟**:

1. 按照 Step 2 的格式,為每個 Prompt 建立檔案
2. 填入正確的 frontmatter (name, category, variables 等)
3. 撰寫 Prompt 內容 (在 `## Prompt` 區塊中)
4. 加入測試範例 (在 `## 測試範例` 區塊中)
5. 設定 `active: true` 啟用 Prompt

**參考 05-data-flow.md 中的 Prompt 範例來撰寫實際內容**。

---

## 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證 Prompt 管理系統是否正常運作

**測試檔案**: `tests/phase-2/task-2.0.basic.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.0 - Basic: Prompt Management', () => {
  const runner = new TestRunner('basic');

  it('應該能夠載入 Prompt', async () => {
    await runner.runTest('Prompt 載入測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該能夠解析 Frontmatter', async () => {
    await runner.runTest('Frontmatter 解析測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.0.basic.test.ts
```

**通過標準**:
- ✅ 能夠載入 Prompt 檔案
- ✅ 能夠解析 Frontmatter
- ✅ Prompt 目錄結構正確

---

### Functional Acceptance (功能驗收)

**目標**: 驗證 Prompt 功能完整性

**測試檔案**: `tests/phase-2/task-2.0.functional.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.0 - Functional: Prompt Operations', () => {
  const runner = new TestRunner('functional');

  it('應該正確替換變數', async () => {
    await runner.runTest('變數替換測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該正確處理快取', async () => {
    await runner.runTest('快取測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  it('應該檢查 Prompt 是否啟用', async () => {
    await runner.runTest('啟用檢查測試', async () => {
      // TODO: 實作測試程式碼
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.0.functional.test.ts
```

**通過標準**:
- ✅ 變數正確替換
- ✅ 快取正確運作
- ✅ 未啟用的 Prompt 會被拒絕

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證完整 Prompt 使用流程

**測試檔案**: `tests/phase-2/task-2.0.e2e.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.0 - E2E: Complete Prompt Flow', () => {
  const runner = new TestRunner('e2e');

  it('應該能完整執行 Prompt 流程', async () => {
    await runner.runTest('完整 Prompt 流程測試', async () => {
      // TODO: 實作測試程式碼
      // 1. 載入 Prompt
      // 2. 替換變數
      // 3. 返回完整 Prompt 內容
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-2/task-2.0.e2e.test.ts
```

**通過標準**:
- ✅ 完整的 Prompt 流程正確運作
- ✅ 所有 Prompt 檔案都能載入
- ✅ 錯誤處理完善

---

## 完成檢查清單

實作完成後，請依序檢查以下項目：

### 實作檢查
- [ ] Prompt 檔案結構已建立
- [ ] PromptManager 類別已實作
- [ ] 變數替換功能已實作
- [ ] 快取機制已實作
- [ ] 所有初始 Prompt 檔案已建立
- [ ] 文件已撰寫

### Prompt 檔案
- [ ] `prompts/voiceover-processing/voiceover-split.md` 已建立
- [ ] `prompts/voiceover-processing/semantic-analysis.md` 已建立
- [ ] `prompts/video-selection/segment-select.md` 已建立
- [ ] `prompts/video-selection/music-select.md` 已建立
- [ ] `prompts/material-processing/tag-conversion.md` 已建立

### 測試檔案
- [ ] `tests/phase-2/task-2.0.basic.test.ts` 已建立
- [ ] `tests/phase-2/task-2.0.functional.test.ts` 已建立
- [ ] `tests/phase-2/task-2.0.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

---

## Prompt 優化流程

完成此 Task 後，未來優化 Prompt 的流程為：

```
1. 發現問題（例如：配音切分經常切得太碎）
   ↓
2. 在 VS Code 中修改 Prompt
   └─> 開啟 prompts/voiceover-processing/voiceover-split.md
   └─> 修改 "## Prompt" 區塊內容
   └─> 更新 frontmatter: version: 2, updated: 2025-10-07
   └─> 加入版本歷史註記
   ↓
3. 測試新版本
   └─> 開發環境測試（快取已關閉，立即生效）
   └─> 驗證輸出是否改善
   ↓
4. Git 提交
   └─> git add prompts/voiceover-processing/voiceover-split.md
   └─> git commit -m "feat(prompt): 改進配音切分邏輯 v2"
   └─> git push
   ↓
5. 部署到正式環境
   └─> 部署後重啟服務（清除快取）
   └─> 或呼叫 API: POST /api/admin/prompts/clear-cache
   ↓
6. 監控與回滾
   └─> 觀察效果
   └─> 如有問題，用 Git 回滾：git revert HEAD
```

---

## 常見問題與解決方案

### Q1: 為什麼用檔案而非資料庫管理 Prompt?

**A**: 使用檔案系統管理 Prompt 有以下優勢:

| 優勢 | 說明 |
|------|------|
| **可以用 VS Code 直接編輯** | 不需要額外的管理介面 |
| **Git 版本控制** | 自動追蹤修改歷史,可以回溯 |
| **支援 Code Review** | 團隊可以審查 Prompt 修改 |
| **可以寫註解** | Markdown 格式支援豐富的說明文字 |
| **部署簡單** | 直接跟程式碼一起部署 |

如果用資料庫,需要:
- 額外建立管理介面
- 手動記錄版本歷史
- 難以進行 Code Review
- 部署時需要同步資料庫

### Q2: 如何追蹤 Prompt 的變更歷史?

**A**: 使用 Git 的歷史記錄功能:

```bash
# 查看某個 Prompt 的修改歷史
git log --oneline prompts/voiceover-processing/voiceover-split.md

# 查看特定版本的 Prompt 內容
git show abc123:prompts/voiceover-processing/voiceover-split.md

# 比較兩個版本的差異
git diff abc123 def456 prompts/voiceover-processing/voiceover-split.md

# 回溯到舊版本
git checkout abc123 prompts/voiceover-processing/voiceover-split.md
```

每個 Prompt 檔案的 frontmatter 中也有 `version` 和 `notes` 欄位來記錄版本資訊。

### Q3: 如果 Prompt 檔案不存在或格式錯誤會怎樣?

**A**: `PromptManager` 會拋出錯誤:

- 檔案不存在 → `Error: ENOENT: no such file or directory`
- 沒有 `## Prompt` 區塊 → `Error: No "## Prompt" section found`
- `active: false` → `Error: Prompt xxx is not active`

**建議**:
1. 在開發時先測試所有 Prompt 是否能正確載入
2. 寫單元測試檢查 Prompt 格式
3. 使用 TypeScript 定義 frontmatter 的型別

### Q4: 正式環境如何更新 Prompt?

**A**: 兩種方式:

**方式 1: 重新部署** (推薦)
```bash
# 修改 Prompt
vim prompts/xxx/xxx.md

# 提交到 Git
git add prompts/
git commit -m "feat(prompt): 更新 xxx prompt"
git push

# 部署 (快取會自動清除)
npm run deploy
```

**方式 2: 清除快取 API**
```bash
# 不重新部署,只清除快取
curl -X POST https://api.cheapcut.com/admin/prompts/clear-cache
```

建議使用方式 1,因為會留下完整的部署記錄。

---

## 📊 Logging 與錯誤處理整合

> 參考: [LOGGING-STANDARDS.md](../LOGGING-STANDARDS.md)

### 必須記錄的事件

PromptManager 作為所有 AI 呼叫的統一入口,必須記錄:

#### 基礎事件
- [x] Prompt 載入成功/失敗
- [x] Prompt 渲染成功/失敗
- [x] AI 呼叫自動記錄 (透過 PromptManager)
- [x] 成本自動追蹤 (透過 PromptManager)

#### AI 呼叫事件 (自動記錄)
- [x] `ai_call_started` - AI 呼叫開始
- [x] `ai_call_completed` - AI 呼叫成功 (包含成本與 tokens)
- [x] `ai_call_failed` - AI 呼叫失敗

### 整合方式

**在 PromptManager.executePrompt() 中自動記錄**:

```typescript
async executePrompt(
  category: string,
  name: string,
  variables: any,
  context: { executionId?: string; userId?: string; callId?: string }
) {
  const logger = new Logger(context)
  const callId = context.callId || uuid()

  try {
    // 載入 & 渲染 prompt
    const { prompt, model, temperature } = await this.loadPrompt(category, name)
    const rendered = this.renderPrompt(prompt, variables)

    // 記錄 AI 呼叫開始
    await logger.info('ai_call_started', {
      call_id: callId,
      service: 'openai',
      operation: `${model}_${category}_${name}`,
      prompt_category: category,
      prompt_name: name,
      model
    }, { service: 'openai', operation: `${category}_${name}` })

    // 呼叫 AI
    const startTime = Date.now()
    const response = await openai.chat.completions.create({
      model,
      temperature,
      messages: [{ role: 'user', content: rendered }]
    })
    const duration = Date.now() - startTime

    // 計算成本
    const cost = this.calculateCost(model, response.usage)

    // 記錄 AI 呼叫成功
    await logger.info('ai_call_completed', {
      call_id: callId,
      service: 'openai',
      operation: `${model}_${category}_${name}`,
      duration_ms: duration,
      cost,
      tokens: {
        prompt: response.usage.prompt_tokens,
        completion: response.usage.completion_tokens,
        total: response.usage.total_tokens
      },
      result_summary: {
        // 根據不同 prompt 提取摘要
      }
    }, { service: 'openai', operation: `${category}_${name}` })

    // 自動追蹤成本
    await costTracker.trackOpenAI({
      userId: context.userId,
      executionId: context.executionId,
      model,
      usage: {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens
      },
      metadata: {
        prompt_category: category,
        prompt_name: name
      }
    })

    return { response, cost, duration }

  } catch (error) {
    // 記錄 AI 呼叫失敗
    await logger.error('ai_call_failed', {
      call_id: callId,
      service: 'openai',
      operation: `${category}_${name}`,
      error_type: error.constructor.name,
      error_message: error.message,
      error_details: (error as any).details || {},
      // ✅ 記錄完整的 prompt (用於重現問題)
      full_prompt: rendered,
      prompt_variables: variables
    }, { service: 'openai', operation: `${category}_${name}` })

    throw error  // ✅ Fail Fast
  }
}
```

### 必須驗證的資料

由於 PromptManager 本身不處理 AI 回應,驗證由各個使用 PromptManager 的引擎負責:

- [ ] AI 回應 Schema 驗證 (在各引擎中使用 DataFlowValidator)
- [ ] Prompt 檔案存在性驗證 (在 loadPrompt 中)
- [ ] Prompt 格式正確性驗證 (在 loadPrompt 中)

### Fail Fast 檢查清單

- [x] ✅ Prompt 檔案不存在時立即 throw error
- [x] ✅ Prompt 格式錯誤時立即 throw error
- [x] ✅ AI 呼叫失敗時立即 throw error (記錄完整 prompt)
- [x] ❌ 不使用 fallback 或預設值
- [x] ✅ 記錄完整錯誤上下文 (prompt, variables, error details)

### 使用範例

```typescript
// 在其他引擎中使用 PromptManager
class SemanticAnalysisEngine {
  async analyze(transcript: string, userId: string) {
    const taskLogger = createTaskLogger('semantic_analysis', userId)
    const executionId = taskLogger.getExecutionId()

    try {
      await taskLogger.taskStarted({ transcript }, ['ai_analysis'])
      await taskLogger.stepStarted(0, 'ai_analysis')

      // PromptManager 自動記錄 AI 呼叫與成本
      const { response, cost } = await promptManager.executePrompt(
        'voiceover-processing',
        'semantic-analysis',
        { transcript, language: 'zh-TW' },
        { executionId, userId, callId: uuid() }
      )

      // 驗證 AI 回應
      const validator = new DataFlowValidator(taskLogger.getLogger())
      await validator.validateAIResponse(
        callId,
        'semantic_analysis',
        response
      )

      await taskLogger.stepCompleted(0, 'ai_analysis', { topics: response.topics.length })
      await taskLogger.taskCompleted({ topics: response.topics }, cost)

      return response

    } catch (error) {
      await taskLogger.taskFailed('ai_analysis', error)
      throw error
    }
  }
}
```

---

## Task 完成確認

完成這個 Task 後,你應該能夠:

✅ 理解為什麼使用檔案系統管理 Prompt
✅ 建立 Prompt 檔案結構
✅ 撰寫符合格式的 Prompt 檔案
✅ 實作 PromptManager 類別
✅ 使用 PromptManager 載入並渲染 Prompt
✅ 了解如何使用 Git 追蹤 Prompt 變更
✅ 知道如何在正式環境更新 Prompt

**下一步**: Task 2.1 - GCS 儲存與上傳

**重要性**: ⭐⭐⭐⭐⭐ (極高 - 所有 AI 相關 Task 都依賴此功能)

---

**文件版本**: 2.0 (已完成)
**狀態**: ✅ 已撰寫完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
