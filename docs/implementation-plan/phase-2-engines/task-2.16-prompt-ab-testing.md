# Task 2.16: Prompt A/B 測試與效果追蹤

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 2.16 |
| **Task 名稱** | Prompt A/B 測試與效果追蹤 |
| **所屬 Phase** | Phase 2: 核心引擎實作 |
| **預估時間** | 4-5 小時 |
| **前置 Task** | Task 2.0 (Prompt Management), Task 1.6 (Cost Tracker) |
| **檔案位置** | `docs/implementation-plan/phase-2-engines/task-2.16-prompt-ab-testing.md` |

---

## 📝 狀態

**文件狀態**: ✅ 已撰寫完成

**目的**: 解決 Prompt 品質追蹤與優化的需求

---

## 功能描述

根據 Overall Design (04-module-breakdown.md:605-626)，Prompt 是產品核心競爭力，需要持續優化。本 Task 實作：

1. **Prompt 版本追蹤** - 記錄每次 AI 呼叫使用的 Prompt 版本
2. **A/B 測試框架** - 支援同時運行多個 Prompt 版本並比較效果
3. **效果分析 API** - 分析不同版本的成本、效能、品質
4. **版本管理介面** - 查看版本歷史、效果對比、回滾決策

主要包含：
- 擴充 PromptManager 支援多版本載入
- 實作 A/B 測試分流邏輯
- 建立 Prompt 效果追蹤機制
- 實作版本效果分析 API
- 建立版本管理查詢介面

---

## 前置知識

### 1. A/B 測試基本概念

**什麼是 A/B 測試？**

A/B 測試是一種實驗方法，同時運行兩個（或多個）版本，比較哪個效果更好。

**在 Prompt 優化中的應用**：
```
場景：想改進「配音切分」Prompt，不確定新版本是否更好

A 版本（v1）：現有的 Prompt
B 版本（v2）：改進後的 Prompt

做法：
- 50% 的請求使用 v1
- 50% 的請求使用 v2
- 追蹤兩個版本的效果（成本、執行時間、結果品質）
- 分析後決定採用哪個版本
```

### 2. 效果指標

**成本指標**：
- 平均 Token 使用量
- 平均 API 呼叫成本
- 成本變化趨勢

**效能指標**：
- 平均回應時間
- 失敗率
- 重試次數

**品質指標**（需要人工評估或自動化指標）：
- 配音切分：片段數量、平均長度、長度變化
- 智能選片：候選片段匹配度、時間軸完整度
- 語意分析：關鍵字數量、主題數量

### 3. Git 版本控制整合

**為什麼要追蹤 Git Commit？**

當 Prompt 檔案修改並提交到 Git 時，我們需要知道：
- 這個版本對應的 Git commit hash
- 這個版本何時開始使用
- 這個版本的效果如何

這樣可以：
- 精確回溯到任何一個版本
- 關聯 Git commit message 了解修改原因
- 用 Git 工具查看 diff

---

## 前置依賴

### 檔案依賴
- Task 2.0 已完成（PromptManager 基礎功能）
- Task 1.6 已完成（成本追蹤服務）
- Task 1.5 已完成（Logger 服務）

### 資料庫依賴
- `cost_records` 表已存在
- `system_logs` 表已存在

### 套件依賴
```json
{
  "dependencies": {
    "simple-git": "^3.19.0"
  },
  "devDependencies": {
    "@types/simple-git": "^3.19.0"
  }
}
```

---

## 實作步驟

### Step 1: 擴充資料庫 Schema

**建立 Prompt 版本追蹤表**：

```sql
-- ============================================
-- Prompt 版本記錄表
-- ============================================

CREATE TABLE prompt_versions (
  version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Prompt 識別
  category VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  version INTEGER NOT NULL,

  -- Git 資訊
  git_commit_hash VARCHAR(40),
  git_commit_message TEXT,
  git_author VARCHAR(255),

  -- 檔案資訊
  file_path TEXT NOT NULL,
  file_content_hash VARCHAR(64) NOT NULL,  -- SHA256 of content

  -- Metadata from frontmatter
  model VARCHAR(50),
  temperature DECIMAL(3, 2),
  variables JSONB,
  notes TEXT,

  -- A/B 測試設定
  is_active BOOLEAN DEFAULT false,
  ab_test_weight INTEGER DEFAULT 0,  -- 0-100, 用於分流比例
  ab_test_group VARCHAR(20),  -- 'control', 'variant_a', 'variant_b', etc.

  -- 啟用時間
  activated_at TIMESTAMP,
  deactivated_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_prompt_versions_unique ON prompt_versions(category, name, version);
CREATE INDEX idx_prompt_versions_active ON prompt_versions(category, name, is_active);
CREATE INDEX idx_prompt_versions_git ON prompt_versions(git_commit_hash);

-- ============================================
-- Prompt 執行記錄表
-- ============================================

CREATE TABLE prompt_executions (
  execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  version_id UUID REFERENCES prompt_versions(version_id) ON DELETE SET NULL,
  task_execution_id UUID REFERENCES task_executions(execution_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,

  -- Prompt 資訊
  category VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  version INTEGER NOT NULL,

  -- 執行資訊
  model VARCHAR(50) NOT NULL,
  temperature DECIMAL(3, 2),

  -- 輸入輸出
  input_variables JSONB NOT NULL,
  rendered_prompt TEXT NOT NULL,  -- 渲染後的完整 prompt
  ai_response TEXT,
  ai_response_json JSONB,

  -- 成本與效能
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost DECIMAL(10, 6),
  duration_ms INTEGER,

  -- 狀態
  status VARCHAR(20) DEFAULT 'completed',  -- completed | failed | timeout
  error_message TEXT,

  -- A/B 測試分組
  ab_test_group VARCHAR(20),

  -- 品質評分（可選，可由人工或自動化評估）
  quality_score DECIMAL(3, 2),  -- 0.00-1.00
  quality_metrics JSONB,  -- 各種品質指標

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompt_executions_version ON prompt_executions(version_id);
CREATE INDEX idx_prompt_executions_task ON prompt_executions(task_execution_id);
CREATE INDEX idx_prompt_executions_user ON prompt_executions(user_id);
CREATE INDEX idx_prompt_executions_prompt ON prompt_executions(category, name, created_at DESC);
CREATE INDEX idx_prompt_executions_ab_test ON prompt_executions(category, name, ab_test_group, created_at DESC);
```

**執行遷移**：
```bash
# 建立遷移檔案
cat > migrations/002_prompt_ab_testing.sql << 'EOF'
-- 上面的 SQL 內容
EOF

# 執行遷移
npx supabase db push
```

---

### Step 2: 實作 Prompt 版本管理器

**建立 `src/services/prompt-version-manager.ts`**：

```typescript
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import simpleGit from 'simple-git';
import matter from 'gray-matter';
import { db } from '../lib/database';

interface PromptVersionInfo {
  version_id: string;
  category: string;
  name: string;
  version: number;
  git_commit_hash?: string;
  git_commit_message?: string;
  git_author?: string;
  file_content_hash: string;
  model?: string;
  temperature?: number;
  variables?: string[];
  is_active: boolean;
  ab_test_weight: number;
  ab_test_group?: string;
  activated_at?: Date;
}

export class PromptVersionManager {
  private git = simpleGit();
  private promptsDir = path.join(__dirname, '../../prompts');

  /**
   * 註冊新的 Prompt 版本到資料庫
   * 從檔案讀取 Prompt 並記錄版本資訊
   */
  async registerVersion(category: string, name: string): Promise<PromptVersionInfo> {
    const filePath = path.join(this.promptsDir, category, `${name}.md`);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // 解析 frontmatter
    const { data: metadata, content } = matter(fileContent);

    // 計算檔案內容 hash
    const contentHash = crypto
      .createHash('sha256')
      .update(fileContent)
      .digest('hex');

    // 取得 Git 資訊
    const gitInfo = await this.getGitInfo(filePath);

    // 檢查是否已存在相同的版本
    const existing = await db.query(
      `SELECT version_id FROM prompt_versions
       WHERE category = $1 AND name = $2 AND version = $3`,
      [category, name, metadata.version]
    );

    if (existing.rows.length > 0) {
      throw new Error(
        `Version ${metadata.version} of ${category}/${name} already registered`
      );
    }

    // 插入新版本
    const result = await db.query(
      `INSERT INTO prompt_versions (
        category, name, version,
        git_commit_hash, git_commit_message, git_author,
        file_path, file_content_hash,
        model, temperature, variables, notes,
        is_active, ab_test_weight
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        category,
        name,
        metadata.version,
        gitInfo.hash,
        gitInfo.message,
        gitInfo.author,
        filePath,
        contentHash,
        metadata.model,
        metadata.temperature,
        JSON.stringify(metadata.variables),
        metadata.notes,
        metadata.active || false,
        0  // 預設權重為 0
      ]
    );

    return result.rows[0];
  }

  /**
   * 取得檔案的 Git 資訊
   */
  private async getGitInfo(filePath: string): Promise<{
    hash: string;
    message: string;
    author: string;
  }> {
    try {
      const log = await this.git.log({ file: filePath, maxCount: 1 });
      const latest = log.latest;

      if (!latest) {
        return { hash: '', message: '', author: '' };
      }

      return {
        hash: latest.hash,
        message: latest.message,
        author: latest.author_name
      };
    } catch (error) {
      console.error('Failed to get git info:', error);
      return { hash: '', message: '', author: '' };
    }
  }

  /**
   * 啟用特定版本（用於 A/B 測試）
   */
  async activateVersion(
    category: string,
    name: string,
    version: number,
    options: {
      ab_test_group?: string;
      ab_test_weight?: number;
    } = {}
  ): Promise<void> {
    await db.query(
      `UPDATE prompt_versions
       SET is_active = true,
           ab_test_group = $4,
           ab_test_weight = $5,
           activated_at = NOW(),
           updated_at = NOW()
       WHERE category = $1 AND name = $2 AND version = $3`,
      [
        category,
        name,
        version,
        options.ab_test_group || null,
        options.ab_test_weight || 0
      ]
    );
  }

  /**
   * 停用特定版本
   */
  async deactivateVersion(
    category: string,
    name: string,
    version: number
  ): Promise<void> {
    await db.query(
      `UPDATE prompt_versions
       SET is_active = false,
           deactivated_at = NOW(),
           updated_at = NOW()
       WHERE category = $1 AND name = $2 AND version = $3`,
      [category, name, version]
    );
  }

  /**
   * 取得所有啟用的版本（用於 A/B 測試分流）
   */
  async getActiveVersions(
    category: string,
    name: string
  ): Promise<PromptVersionInfo[]> {
    const result = await db.query(
      `SELECT * FROM prompt_versions
       WHERE category = $1 AND name = $2 AND is_active = true
       ORDER BY version DESC`,
      [category, name]
    );

    return result.rows;
  }

  /**
   * 取得版本歷史
   */
  async getVersionHistory(
    category: string,
    name: string
  ): Promise<PromptVersionInfo[]> {
    const result = await db.query(
      `SELECT * FROM prompt_versions
       WHERE category = $1 AND name = $2
       ORDER BY version DESC`,
      [category, name]
    );

    return result.rows;
  }
}
```

---

### Step 3: 擴充 PromptManager 支援 A/B 測試

**修改 `src/services/prompt-manager.ts`**：

```typescript
import { PromptVersionManager } from './prompt-version-manager';
import { db } from '../lib/database';

export class PromptManager {
  private versionManager = new PromptVersionManager();

  // ... 保留原有的方法 ...

  /**
   * 執行 Prompt（支援 A/B 測試）
   * 自動選擇版本、記錄執行、追蹤效果
   */
  async executePromptWithTracking(
    category: string,
    name: string,
    variables: Record<string, any>,
    context: {
      executionId?: string;
      userId?: string;
      taskExecutionId?: string;
    }
  ): Promise<{
    response: any;
    cost: number;
    duration: number;
    versionUsed: number;
  }> {
    const logger = new Logger(context);
    const startTime = Date.now();

    try {
      // 1. 選擇 Prompt 版本（A/B 測試分流）
      const selectedVersion = await this.selectVersion(category, name);

      if (!selectedVersion) {
        throw new Error(`No active version found for ${category}/${name}`);
      }

      // 2. 載入並渲染 Prompt
      const { metadata, content } = await this.loadPrompt(
        category,
        name,
        selectedVersion.version
      );
      const renderedPrompt = this.renderPrompt(content, variables);

      // 3. 呼叫 AI
      const aiStartTime = Date.now();
      const aiResponse = await this.callAI(
        metadata.model || 'gemini-1.5-flash',
        metadata.temperature || 0.7,
        renderedPrompt
      );
      const duration = Date.now() - aiStartTime;

      // 4. 計算成本
      const cost = this.calculateCost(
        metadata.model || 'gemini-1.5-flash',
        aiResponse.usage
      );

      // 5. 記錄 Prompt 執行
      await this.recordExecution({
        version_id: selectedVersion.version_id,
        task_execution_id: context.taskExecutionId,
        user_id: context.userId,
        category,
        name,
        version: selectedVersion.version,
        model: metadata.model || 'gemini-1.5-flash',
        temperature: metadata.temperature || 0.7,
        input_variables: variables,
        rendered_prompt: renderedPrompt,
        ai_response: aiResponse.content,
        ai_response_json: this.tryParseJSON(aiResponse.content),
        prompt_tokens: aiResponse.usage.prompt_tokens,
        completion_tokens: aiResponse.usage.completion_tokens,
        total_tokens: aiResponse.usage.total_tokens,
        cost,
        duration_ms: duration,
        status: 'completed',
        ab_test_group: selectedVersion.ab_test_group
      });

      // 6. 記錄 Logging (整合既有的 Logger)
      await logger.info('ai_call_completed', {
        service: 'prompt_execution',
        category,
        name,
        version: selectedVersion.version,
        ab_test_group: selectedVersion.ab_test_group,
        cost,
        duration_ms: duration,
        tokens: aiResponse.usage
      });

      return {
        response: aiResponse.content,
        cost,
        duration,
        versionUsed: selectedVersion.version
      };

    } catch (error) {
      // 記錄失敗
      await logger.error('prompt_execution_failed', {
        category,
        name,
        error_message: error.message,
        variables
      });

      throw error;
    }
  }

  /**
   * 選擇 Prompt 版本（A/B 測試分流邏輯）
   */
  private async selectVersion(
    category: string,
    name: string
  ): Promise<PromptVersionInfo | null> {
    const activeVersions = await this.versionManager.getActiveVersions(
      category,
      name
    );

    if (activeVersions.length === 0) {
      return null;
    }

    // 如果只有一個啟用版本，直接使用
    if (activeVersions.length === 1) {
      return activeVersions[0];
    }

    // 多個版本：根據權重分流
    const totalWeight = activeVersions.reduce(
      (sum, v) => sum + v.ab_test_weight,
      0
    );

    if (totalWeight === 0) {
      // 沒有設定權重，隨機選擇
      const randomIndex = Math.floor(Math.random() * activeVersions.length);
      return activeVersions[randomIndex];
    }

    // 根據權重選擇
    const random = Math.random() * totalWeight;
    let cumulative = 0;

    for (const version of activeVersions) {
      cumulative += version.ab_test_weight;
      if (random <= cumulative) {
        return version;
      }
    }

    // 預防：萬一沒選中，返回第一個
    return activeVersions[0];
  }

  /**
   * 載入特定版本的 Prompt
   */
  private async loadPrompt(
    category: string,
    name: string,
    version?: number
  ): Promise<{ metadata: any; content: string }> {
    // 如果沒有指定版本，載入最新版本（原有邏輯）
    if (!version) {
      return await this.loadPrompt(category, name);
    }

    // 載入特定版本（從檔案系統讀取）
    // 假設版本號記錄在 frontmatter 的 version 欄位
    const filePath = path.join(this.promptsDir, category, `${name}.md`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // 檢查版本號是否匹配
    if (data.version !== version) {
      throw new Error(
        `Version mismatch: file has v${data.version}, requested v${version}`
      );
    }

    // 提取 Prompt 內容
    const promptMatch = content.match(/## Prompt\s+([\s\S]*?)(?=\n##|$)/i);
    if (!promptMatch) {
      throw new Error(`No "## Prompt" section found in ${filePath}`);
    }

    return {
      metadata: data,
      content: promptMatch[1].trim()
    };
  }

  /**
   * 記錄 Prompt 執行到資料庫
   */
  private async recordExecution(data: {
    version_id: string;
    task_execution_id?: string;
    user_id?: string;
    category: string;
    name: string;
    version: number;
    model: string;
    temperature: number;
    input_variables: any;
    rendered_prompt: string;
    ai_response: string;
    ai_response_json: any;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost: number;
    duration_ms: number;
    status: string;
    ab_test_group?: string;
  }): Promise<void> {
    await db.query(
      `INSERT INTO prompt_executions (
        version_id, task_execution_id, user_id,
        category, name, version,
        model, temperature,
        input_variables, rendered_prompt, ai_response, ai_response_json,
        prompt_tokens, completion_tokens, total_tokens,
        cost, duration_ms, status, ab_test_group
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        data.version_id,
        data.task_execution_id,
        data.user_id,
        data.category,
        data.name,
        data.version,
        data.model,
        data.temperature,
        JSON.stringify(data.input_variables),
        data.rendered_prompt,
        data.ai_response,
        JSON.stringify(data.ai_response_json),
        data.prompt_tokens,
        data.completion_tokens,
        data.total_tokens,
        data.cost,
        data.duration_ms,
        data.status,
        data.ab_test_group
      ]
    );
  }

  /**
   * 嘗試解析 JSON 回應
   */
  private tryParseJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  /**
   * 呼叫 AI（簡化版本，實際應整合 AI 服務）
   */
  private async callAI(
    model: string,
    temperature: number,
    prompt: string
  ): Promise<{ content: string; usage: any }> {
    // 這裡應該呼叫實際的 AI 服務
    // 簡化示範：
    throw new Error('Not implemented - integrate with actual AI service');
  }

  /**
   * 計算成本（簡化版本，實際應使用 CostTracker）
   */
  private calculateCost(model: string, usage: any): number {
    // 這裡應該使用 Task 1.6 的 CostTracker
    throw new Error('Not implemented - use CostTracker from Task 1.6');
  }
}
```

---

### Step 4: 實作 A/B 測試分析 API

**建立 `src/services/prompt-analytics.service.ts`**：

```typescript
import { db } from '../lib/database';

export interface PromptAnalytics {
  category: string;
  name: string;
  version: number;
  ab_test_group?: string;

  // 統計
  total_executions: number;
  success_count: number;
  failure_count: number;
  success_rate: number;

  // 成本
  avg_cost: number;
  total_cost: number;
  min_cost: number;
  max_cost: number;

  // 效能
  avg_duration_ms: number;
  min_duration_ms: number;
  max_duration_ms: number;

  // Token
  avg_prompt_tokens: number;
  avg_completion_tokens: number;
  avg_total_tokens: number;

  // 品質（如果有評分）
  avg_quality_score?: number;
  quality_scores_count?: number;

  // 時間範圍
  period_start: Date;
  period_end: Date;
}

export class PromptAnalyticsService {
  /**
   * 取得 Prompt 的效果分析
   */
  async getPromptAnalytics(
    category: string,
    name: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      groupByVersion?: boolean;
      groupByABTest?: boolean;
    } = {}
  ): Promise<PromptAnalytics[]> {
    const startDate = options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = options.endDate || new Date();

    let groupBy = '';
    if (options.groupByVersion) {
      groupBy = 'version';
    }
    if (options.groupByABTest) {
      groupBy = groupBy ? `${groupBy}, ab_test_group` : 'ab_test_group';
    }

    const query = `
      SELECT
        category,
        name,
        ${options.groupByVersion ? 'version,' : 'MAX(version) as version,'}
        ${options.groupByABTest ? 'ab_test_group,' : ''}

        -- 統計
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE status = 'completed') as success_count,
        COUNT(*) FILTER (WHERE status != 'completed') as failure_count,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric,
          4
        ) as success_rate,

        -- 成本
        AVG(cost) as avg_cost,
        SUM(cost) as total_cost,
        MIN(cost) as min_cost,
        MAX(cost) as max_cost,

        -- 效能
        AVG(duration_ms) as avg_duration_ms,
        MIN(duration_ms) as min_duration_ms,
        MAX(duration_ms) as max_duration_ms,

        -- Token
        AVG(prompt_tokens) as avg_prompt_tokens,
        AVG(completion_tokens) as avg_completion_tokens,
        AVG(total_tokens) as avg_total_tokens,

        -- 品質
        AVG(quality_score) as avg_quality_score,
        COUNT(quality_score) as quality_scores_count,

        -- 時間範圍
        MIN(created_at) as period_start,
        MAX(created_at) as period_end

      FROM prompt_executions
      WHERE category = $1
        AND name = $2
        AND created_at >= $3
        AND created_at <= $4
      ${groupBy ? `GROUP BY category, name${options.groupByVersion ? ', version' : ''}${options.groupByABTest ? ', ab_test_group' : ''}` : ''}
      ORDER BY ${options.groupByVersion ? 'version DESC' : 'total_executions DESC'}
    `;

    const result = await db.query(query, [category, name, startDate, endDate]);
    return result.rows;
  }

  /**
   * 比較兩個版本的效果
   */
  async compareVersions(
    category: string,
    name: string,
    versionA: number,
    versionB: number,
    options: {
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<{
    versionA: PromptAnalytics;
    versionB: PromptAnalytics;
    comparison: {
      cost_diff_percent: number;
      duration_diff_percent: number;
      success_rate_diff: number;
      token_diff_percent: number;
    };
  }> {
    const analytics = await this.getPromptAnalytics(category, name, {
      ...options,
      groupByVersion: true
    });

    const analyticsA = analytics.find(a => a.version === versionA);
    const analyticsB = analytics.find(a => a.version === versionB);

    if (!analyticsA || !analyticsB) {
      throw new Error('One or both versions not found in analytics');
    }

    // 計算差異百分比
    const costDiff = ((analyticsB.avg_cost - analyticsA.avg_cost) / analyticsA.avg_cost) * 100;
    const durationDiff = ((analyticsB.avg_duration_ms - analyticsA.avg_duration_ms) / analyticsA.avg_duration_ms) * 100;
    const successRateDiff = analyticsB.success_rate - analyticsA.success_rate;
    const tokenDiff = ((analyticsB.avg_total_tokens - analyticsA.avg_total_tokens) / analyticsA.avg_total_tokens) * 100;

    return {
      versionA: analyticsA,
      versionB: analyticsB,
      comparison: {
        cost_diff_percent: costDiff,
        duration_diff_percent: durationDiff,
        success_rate_diff: successRateDiff,
        token_diff_percent: tokenDiff
      }
    };
  }

  /**
   * 取得 A/B 測試結果
   */
  async getABTestResults(
    category: string,
    name: string,
    options: {
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<{
    groups: PromptAnalytics[];
    winner?: string;  // 'control', 'variant_a', etc.
    recommendation: string;
  }> {
    const analytics = await this.getPromptAnalytics(category, name, {
      ...options,
      groupByABTest: true
    });

    if (analytics.length === 0) {
      return {
        groups: [],
        recommendation: 'No data available for A/B test'
      };
    }

    // 簡單的贏家判定邏輯：成本最低且成功率 >= 95%
    const qualifiedGroups = analytics.filter(a => a.success_rate >= 0.95);

    if (qualifiedGroups.length === 0) {
      return {
        groups: analytics,
        recommendation: 'All variants have success rate < 95%. Need more data or debugging.'
      };
    }

    // 找出成本最低的
    const winner = qualifiedGroups.reduce((min, current) =>
      current.avg_cost < min.avg_cost ? current : min
    );

    return {
      groups: analytics,
      winner: winner.ab_test_group,
      recommendation: `Recommend using ${winner.ab_test_group} (v${winner.version}): ${(winner.avg_cost * 100).toFixed(4)}¢ avg cost, ${(winner.success_rate * 100).toFixed(2)}% success rate`
    };
  }
}
```

---

### Step 5: 建立管理 API 端點

**建立 `src/routes/admin/prompts.routes.ts`**：

```typescript
import { Router } from 'express';
import { PromptVersionManager } from '../../services/prompt-version-manager';
import { PromptAnalyticsService } from '../../services/prompt-analytics.service';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const versionManager = new PromptVersionManager();
const analyticsService = new PromptAnalyticsService();

// 所有路由都需要管理員權限
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * 取得 Prompt 版本歷史
 * GET /api/admin/prompts/:category/:name/versions
 */
router.get('/:category/:name/versions', async (req, res) => {
  try {
    const { category, name } = req.params;
    const versions = await versionManager.getVersionHistory(category, name);
    res.json({ versions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 註冊新版本
 * POST /api/admin/prompts/:category/:name/register
 */
router.post('/:category/:name/register', async (req, res) => {
  try {
    const { category, name } = req.params;
    const versionInfo = await versionManager.registerVersion(category, name);
    res.json({ version: versionInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 啟用版本（開始 A/B 測試）
 * POST /api/admin/prompts/:category/:name/versions/:version/activate
 * Body: { ab_test_group?: string, ab_test_weight?: number }
 */
router.post('/:category/:name/versions/:version/activate', async (req, res) => {
  try {
    const { category, name, version } = req.params;
    const { ab_test_group, ab_test_weight } = req.body;

    await versionManager.activateVersion(category, name, parseInt(version), {
      ab_test_group,
      ab_test_weight
    });

    res.json({ message: 'Version activated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 停用版本
 * POST /api/admin/prompts/:category/:name/versions/:version/deactivate
 */
router.post('/:category/:name/versions/:version/deactivate', async (req, res) => {
  try {
    const { category, name, version } = req.params;
    await versionManager.deactivateVersion(category, name, parseInt(version));
    res.json({ message: 'Version deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 取得 Prompt 效果分析
 * GET /api/admin/prompts/:category/:name/analytics
 * Query: startDate, endDate, groupByVersion, groupByABTest
 */
router.get('/:category/:name/analytics', async (req, res) => {
  try {
    const { category, name } = req.params;
    const { startDate, endDate, groupByVersion, groupByABTest } = req.query;

    const analytics = await analyticsService.getPromptAnalytics(category, name, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      groupByVersion: groupByVersion === 'true',
      groupByABTest: groupByABTest === 'true'
    });

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 比較兩個版本
 * GET /api/admin/prompts/:category/:name/compare
 * Query: versionA, versionB, startDate, endDate
 */
router.get('/:category/:name/compare', async (req, res) => {
  try {
    const { category, name } = req.params;
    const { versionA, versionB, startDate, endDate } = req.query;

    const comparison = await analyticsService.compareVersions(
      category,
      name,
      parseInt(versionA as string),
      parseInt(versionB as string),
      {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      }
    );

    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 取得 A/B 測試結果
 * GET /api/admin/prompts/:category/:name/ab-test
 * Query: startDate, endDate
 */
router.get('/:category/:name/ab-test', async (req, res) => {
  try {
    const { category, name } = req.params;
    const { startDate, endDate } = req.query;

    const results = await analyticsService.getABTestResults(category, name, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

**整合到主路由 `src/server.ts`**：
```typescript
import adminPromptsRoutes from './routes/admin/prompts.routes';

// ...
app.use('/api/admin/prompts', adminPromptsRoutes);
```

---

## 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證資料庫 Schema 和基礎功能

**測試檔案**: `tests/phase-2/task-2.16.basic.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import { db } from '../../src/lib/database';

describe('Task 2.16 - Basic: Prompt A/B Testing Schema', () => {
  const runner = new TestRunner('basic');

  it('應該有 prompt_versions 表', async () => {
    await runner.runTest('prompt_versions 表檢查', async () => {
      const result = await db.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_name = 'prompt_versions'
      `);
      expect(result.rows.length).toBe(1);
    });
  });

  it('應該有 prompt_executions 表', async () => {
    await runner.runTest('prompt_executions 表檢查', async () => {
      const result = await db.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_name = 'prompt_executions'
      `);
      expect(result.rows.length).toBe(1);
    });
  });

  it('應該能建立測試版本記錄', async () => {
    await runner.runTest('建立測試版本', async () => {
      const result = await db.query(`
        INSERT INTO prompt_versions (
          category, name, version, file_path, file_content_hash
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING version_id
      `, ['test', 'test-prompt', 1, '/test/path', 'abc123']);

      expect(result.rows[0].version_id).toBeDefined();
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**通過標準**:
- ✅ `prompt_versions` 表已建立
- ✅ `prompt_executions` 表已建立
- ✅ 可以插入測試資料
- ✅ 所有索引已建立

---

### Functional Acceptance (功能驗收)

**目標**: 驗證版本管理和 A/B 測試功能

**測試檔案**: `tests/phase-2/task-2.16.functional.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import { PromptVersionManager } from '../../src/services/prompt-version-manager';
import { PromptAnalyticsService } from '../../src/services/prompt-analytics.service';

describe('Task 2.16 - Functional: Version Management & A/B Testing', () => {
  const runner = new TestRunner('functional');
  const versionManager = new PromptVersionManager();
  const analyticsService = new PromptAnalyticsService();

  it('應該能註冊 Prompt 版本', async () => {
    await runner.runTest('註冊版本測試', async () => {
      // 假設已有測試 Prompt 檔案
      const version = await versionManager.registerVersion(
        'voiceover-processing',
        'voiceover-split'
      );

      expect(version.category).toBe('voiceover-processing');
      expect(version.name).toBe('voiceover-split');
      expect(version.version).toBeGreaterThan(0);
    });
  });

  it('應該能啟用和停用版本', async () => {
    await runner.runTest('版本啟用/停用測試', async () => {
      // 啟用版本
      await versionManager.activateVersion(
        'voiceover-processing',
        'voiceover-split',
        1,
        { ab_test_group: 'control', ab_test_weight: 50 }
      );

      const activeVersions = await versionManager.getActiveVersions(
        'voiceover-processing',
        'voiceover-split'
      );

      expect(activeVersions.length).toBeGreaterThan(0);
      expect(activeVersions[0].is_active).toBe(true);

      // 停用版本
      await versionManager.deactivateVersion(
        'voiceover-processing',
        'voiceover-split',
        1
      );

      const afterDeactivate = await versionManager.getActiveVersions(
        'voiceover-processing',
        'voiceover-split'
      );

      expect(afterDeactivate.length).toBe(0);
    });
  });

  it('應該能根據權重分流選擇版本', async () => {
    await runner.runTest('A/B 測試分流測試', async () => {
      // 啟用兩個版本
      await versionManager.activateVersion(
        'voiceover-processing',
        'voiceover-split',
        1,
        { ab_test_group: 'control', ab_test_weight: 70 }
      );

      await versionManager.activateVersion(
        'voiceover-processing',
        'voiceover-split',
        2,
        { ab_test_group: 'variant_a', ab_test_weight: 30 }
      );

      // 模擬 100 次選擇，檢查分佈
      const selections: Record<number, number> = {};

      for (let i = 0; i < 100; i++) {
        const selected = await promptManager.selectVersion(
          'voiceover-processing',
          'voiceover-split'
        );
        selections[selected.version] = (selections[selected.version] || 0) + 1;
      }

      // 檢查分佈大致符合 70:30
      expect(selections[1]).toBeGreaterThan(50);
      expect(selections[2]).toBeGreaterThan(20);
    });
  });

  it('應該能取得效果分析', async () => {
    await runner.runTest('效果分析測試', async () => {
      // 假設已有執行記錄
      const analytics = await analyticsService.getPromptAnalytics(
        'voiceover-processing',
        'voiceover-split',
        { groupByVersion: true }
      );

      expect(analytics.length).toBeGreaterThan(0);
      expect(analytics[0]).toHaveProperty('avg_cost');
      expect(analytics[0]).toHaveProperty('avg_duration_ms');
      expect(analytics[0]).toHaveProperty('success_rate');
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**通過標準**:
- ✅ 可以註冊新版本
- ✅ 可以啟用/停用版本
- ✅ A/B 測試分流正確運作
- ✅ 可以取得效果分析
- ✅ 版本比較功能正常

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證完整的 A/B 測試流程

**測試檔案**: `tests/phase-2/task-2.16.e2e.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';

describe('Task 2.16 - E2E: Complete A/B Testing Flow', () => {
  const runner = new TestRunner('e2e');

  it('應該能完成完整的 A/B 測試流程', async () => {
    await runner.runTest('完整 A/B 測試流程', async () => {
      // 1. 註冊兩個版本
      // 2. 啟用 A/B 測試
      // 3. 執行多次 Prompt（自動分流）
      // 4. 記錄執行結果
      // 5. 分析效果
      // 6. 選出優勝版本
      // 7. 停用劣勢版本

      // TODO: 實作完整流程測試
    });
  });

  it('應該能透過 API 管理版本', async () => {
    await runner.runTest('API 管理版本測試', async () => {
      // 測試所有管理 API
      // - GET /api/admin/prompts/:category/:name/versions
      // - POST /api/admin/prompts/:category/:name/register
      // - POST /api/admin/prompts/:category/:name/versions/:version/activate
      // - GET /api/admin/prompts/:category/:name/analytics
      // - GET /api/admin/prompts/:category/:name/compare

      // TODO: 實作 API 測試
    });
  });

  afterAll(async () => {
    await runner.generateReport();
  });
});
```

**通過標準**:
- ✅ 完整 A/B 測試流程可正常運作
- ✅ 所有管理 API 正常運作
- ✅ 版本選擇、記錄、分析一氣呵成
- ✅ 可以根據分析結果做出決策

---

## 完成檢查清單

實作完成後，請依序檢查以下項目：

### 資料庫 Schema
- [ ] `prompt_versions` 表已建立
- [ ] `prompt_executions` 表已建立
- [ ] 所有索引已建立
- [ ] Foreign Key 關聯正確

### 服務實作
- [ ] PromptVersionManager 已實作
- [ ] PromptManager 已擴充支援 A/B 測試
- [ ] PromptAnalyticsService 已實作
- [ ] 版本選擇邏輯正確（根據權重分流）

### API 端點
- [ ] 版本歷史查詢 API
- [ ] 版本註冊 API
- [ ] 版本啟用/停用 API
- [ ] 效果分析 API
- [ ] 版本比較 API
- [ ] A/B 測試結果 API

### 測試檔案
- [ ] `tests/phase-2/task-2.16.basic.test.ts` 已建立
- [ ] `tests/phase-2/task-2.16.functional.test.ts` 已建立
- [ ] `tests/phase-2/task-2.16.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

---

## 使用範例

### 情境 1：開始 A/B 測試

```bash
# 1. 修改 Prompt 檔案，更新版本號為 2
vim prompts/voiceover-processing/voiceover-split.md
# frontmatter: version: 2

# 2. 提交到 Git
git add prompts/voiceover-processing/voiceover-split.md
git commit -m "feat(prompt): 改進配音切分邏輯 v2 - 更精確的語意分析"
git push

# 3. 註冊新版本
curl -X POST http://localhost:3000/api/admin/prompts/voiceover-processing/voiceover-split/register \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. 啟用 A/B 測試（v1: 80%, v2: 20%）
curl -X POST http://localhost:3000/api/admin/prompts/voiceover-processing/voiceover-split/versions/1/activate \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ab_test_group": "control", "ab_test_weight": 80}'

curl -X POST http://localhost:3000/api/admin/prompts/voiceover-processing/voiceover-split/versions/2/activate \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ab_test_group": "variant_a", "ab_test_weight": 20}'

# 5. 等待收集數據（例如：運行 1 週）

# 6. 查看 A/B 測試結果
curl "http://localhost:3000/api/admin/prompts/voiceover-processing/voiceover-split/ab-test?startDate=2025-10-01&endDate=2025-10-07" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
# {
#   "groups": [
#     {
#       "version": 1,
#       "ab_test_group": "control",
#       "total_executions": 800,
#       "avg_cost": 0.0045,
#       "success_rate": 0.98,
#       "avg_duration_ms": 1200
#     },
#     {
#       "version": 2,
#       "ab_test_group": "variant_a",
#       "total_executions": 200,
#       "avg_cost": 0.0038,
#       "success_rate": 0.97,
#       "avg_duration_ms": 1100
#     }
#   ],
#   "winner": "variant_a",
#   "recommendation": "Recommend using variant_a (v2): 0.38¢ avg cost, 97.00% success rate"
# }

# 7. 停用舊版本，全面使用新版本
curl -X POST http://localhost:3000/api/admin/prompts/voiceover-processing/voiceover-split/versions/1/deactivate \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl -X POST http://localhost:3000/api/admin/prompts/voiceover-processing/voiceover-split/versions/2/activate \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ab_test_group": "production", "ab_test_weight": 100}'
```

### 情境 2：比較兩個版本的效果

```bash
curl "http://localhost:3000/api/admin/prompts/voiceover-processing/voiceover-split/compare?versionA=1&versionB=2&startDate=2025-10-01&endDate=2025-10-07" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
# {
#   "versionA": {
#     "version": 1,
#     "avg_cost": 0.0045,
#     "avg_duration_ms": 1200,
#     "success_rate": 0.98,
#     "total_executions": 800
#   },
#   "versionB": {
#     "version": 2,
#     "avg_cost": 0.0038,
#     "avg_duration_ms": 1100,
#     "success_rate": 0.97,
#     "total_executions": 200
#   },
#   "comparison": {
#     "cost_diff_percent": -15.56,      // v2 便宜 15.56%
#     "duration_diff_percent": -8.33,   // v2 快 8.33%
#     "success_rate_diff": -0.01,       // v2 成功率低 1%
#     "token_diff_percent": -12.00      // v2 使用 token 少 12%
#   }
# }
```

---

## 常見問題與解決方案

### Q1: 為什麼要在資料庫記錄 Prompt 版本？檔案系統不夠嗎？

**A**: 檔案系統只能儲存當前版本，無法記錄：
- 歷史版本的執行數據
- 每個版本何時啟用/停用
- A/B 測試分流設定
- 各版本的效果指標

資料庫讓我們可以：
- 追蹤每個版本的實際效果
- 動態調整 A/B 測試比例
- 快速回滾到舊版本
- 分析版本演進趨勢

### Q2: A/B 測試的分流比例如何設定？

**A**: 建議策略：

**新版本首次測試**：
- Control (舊版本): 80%
- Variant (新版本): 20%
- 目的：降低風險，先小規模驗證

**新版本表現良好**：
- 逐步提高到 50:50
- 收集更多數據進行比較

**新版本明顯優於舊版本**：
- 停用舊版本
- 新版本 100%

**新版本表現不佳**：
- 立即停用新版本
- 回到舊版本 100%
- 分析問題並修正

### Q3: 如何判斷哪個版本更好？

**A**: 綜合考慮多個指標：

**優先指標**：
1. **成功率** - 必須 >= 95%，低於此值不可用
2. **成本** - 在成功率相近時，選擇成本更低的
3. **執行時間** - 影響用戶體驗

**次要指標**：
- Token 使用量
- 品質評分（需要人工評估或自動化指標）

**範例決策**：
```
v1: 成功率 98%, 成本 0.0045, 時長 1200ms
v2: 成功率 97%, 成本 0.0038, 時長 1100ms

分析：
- 成功率都 >= 95% ✅
- v2 成本降低 15.56% 💰
- v2 速度提升 8.33% ⚡
- v2 成功率僅低 1%（可接受）

結論：選擇 v2
```

### Q4: 如何處理 Prompt 版本與 Git 的對應關係？

**A**: 建議流程：

1. **修改 Prompt 時**：
   - 更新 frontmatter 的 `version` 欄位
   - 在 `notes` 中簡述修改內容
   - Git commit message 包含版本號

2. **註冊版本時**：
   - 系統自動記錄當前的 Git commit hash
   - 可以用 `git show <hash>:prompts/xxx.md` 查看該版本內容

3. **回滾版本時**：
   ```bash
   # 查看版本歷史
   git log prompts/voiceover-processing/voiceover-split.md

   # 恢復到特定版本
   git checkout <commit-hash> prompts/voiceover-processing/voiceover-split.md

   # 重新註冊版本
   curl -X POST .../register
   ```

---

## Task 完成確認

完成這個 Task 後，你應該能夠：

✅ 理解 Prompt A/B 測試的目的和方法
✅ 在資料庫中記錄 Prompt 版本和執行結果
✅ 實作 A/B 測試分流邏輯
✅ 分析不同版本的效果
✅ 使用管理 API 管理 Prompt 版本
✅ 根據數據做出版本決策
✅ 追蹤 Prompt 變更對成本和品質的影響

**下一步**: Task 2.15 或繼續優化 Prompt 品質

**重要性**: ⭐⭐⭐⭐ (高 - Prompt 品質直接影響產品核心價值)

---

## 與其他 Task 的整合

### 與 Task 2.0 (Prompt Management) 的關係
- Task 2.0 提供基礎的 Prompt 載入和渲染
- Task 2.16 擴充支援多版本和 A/B 測試
- 兩者共用 PromptManager 類別

### 與 Task 1.6 (Cost Tracker) 的關係
- Task 1.6 記錄成本
- Task 2.16 分析 Prompt 版本的成本差異
- 共用 `cost_records` 表

### 與 Task 1.5 (Logger Service) 的關係
- Task 1.5 記錄執行日誌
- Task 2.16 記錄 Prompt 執行細節
- 共用日誌基礎設施

---

**文件版本**: 1.0
**狀態**: ✅ 已撰寫完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
