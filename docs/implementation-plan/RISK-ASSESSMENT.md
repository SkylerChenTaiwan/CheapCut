# CheapCut 風險評估與修復建議

**版本**: 1.0
**評估日期**: 2025-10-07
**評估範圍**: Implementation Plan vs Overall Design

---

## 📊 執行摘要

### 整體評估分數

| 評估項目 | 評分 | 說明 |
|---------|------|------|
| 需求覆蓋度 | 85% | 核心功能完整,但缺少時間軌編輯 |
| 架構一致性 | 95% | 資料庫、API、技術選型高度一致 |
| 風險控制 | 70% | 存在 3 個高風險問題需處理 |
| 並行開發規劃 | 80% | 依賴關係清楚,但需注意同步點 |
| **整體可行性** | **82%** | **經修復後可順利執行** |

### 發現的問題統計

- 🔴 **高風險問題**: 3 個 (必須立即修復)
- 🟡 **中風險問題**: 3 個 (建議修復)
- 🟢 **低風險問題**: 2 個 (可延後處理)

**總計**: 8 個問題

---

## 🔴 高風險問題 (P0 - 必須立即修復)

### 問題 1: 時間軌編輯功能缺失

**嚴重程度**: 🔴 **Critical**
**影響範圍**: MVP 核心功能

#### 問題描述

- **Overall Design** (`02-key-flows.md` 第 366-475 行) 詳細設計了時間軌預覽與片段替換 UI
- **Implementation Plan** 沒有對應的 Task

#### 影響分析

1. **用戶體驗**: 用戶無法手動調整 AI 選片結果,產品可用性大幅降低
2. **MVP 驗收**: 無法通過「時間軌預覽與調整」的驗收標準
3. **競爭力**: 缺少核心差異化功能

#### 修復方案

```markdown
新增 Task 3.9: 時間軌編輯器

檔案位置: docs/implementation-plan/phase-3-frontend/task-3.9-timeline-editor.md

前置依賴:
- Task 2.10 (時間軸生成)
- Task 3.6 (影片生成介面)
- Task 2.8 (候選片段查詢)

預估時間: 6-8 小時

功能清單:
1. 時間軌 UI 組件 (配音軌、影片軌、字幕軌、配樂軌)
2. 片段替換功能 (點擊 → 顯示候選 → 替換)
3. 預覽播放功能 (根據時間軌動態組合)

API 端點:
- GET /api/timeline/{timelineId}/segment/{index}/candidates
- PUT /api/timeline/{timelineId}/segment/{index}

驗收標準:
- [ ] 時間軌 UI 正確顯示所有軌道
- [ ] 可以點擊片段查看候選
- [ ] 可以替換片段並即時更新
- [ ] 預覽播放正常運作
```

#### 執行計劃

1. **立即**: 建立 Task 3.9 文件 (30 分鐘)
2. **Phase 3**: Claude C 實作 (6-8 小時)
3. **驗收**: 完整端到端測試

**狀態**: ⏸ 待修復

---

### 問題 2: 前端進度顯示缺失

**嚴重程度**: 🔴 **Critical**
**影響範圍**: MVP 驗收標準

#### 問題描述

- **Overall Design** (`02-key-flows.md`) 明確要求進度顯示
- **MVP 驗收標準** (`11-mvp-acceptance-criteria.md`) 要求「進度顯示」功能
- **Current Plan**: Task 1.5 (Logger) 和 Task 1.6 (成本追蹤) 只有後端,缺少前端 UI

#### 影響分析

1. **用戶體驗**: 用戶看不到處理進度,不知道系統是否正在工作
2. **MVP 驗收**: 無法通過「進度顯示」驗收標準
3. **感知效能**: 即使處理速度快,用戶也會覺得慢

#### 修復方案

```markdown
修改 Task 3.6: 影片生成介面

在原有內容基礎上加入:

## 步驟 4: 進度顯示功能 (新增)

### 4.1 進度輪詢邏輯

建立 hooks/useTaskProgress.ts:
```typescript
export function useTaskProgress(taskId: string) {
  const [progress, setProgress] = useState<TaskProgress>({
    status: 'pending',
    currentStep: '',
    stepIndex: 0,
    totalSteps: 0
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/tasks/${taskId}`);
      const data = await response.json();
      setProgress(data);

      if (data.status === 'completed' || data.status === 'failed') {
        clearInterval(interval);
      }
    }, 2000); // 每 2 秒輪詢

    return () => clearInterval(interval);
  }, [taskId]);

  return progress;
}
```

### 4.2 進度條 UI 組件

建立 components/TaskProgress.tsx:
- 顯示當前階段 (分析中、選片中、渲染中)
- 顯示進度條 (stepIndex / totalSteps)
- 顯示預估剩餘時間
- 錯誤狀態顯示

驗收標準 (新增):
- [ ] 進度輪詢正常運作
- [ ] 進度條正確顯示
- [ ] 階段性提示清晰
- [ ] 錯誤狀態正確處理
```

#### 執行計劃

1. **立即**: 更新 Task 3.6 文件 (15 分鐘)
2. **Phase 3**: Claude C 實作 (加 2 小時到原本的 4-5 小時)
3. **驗收**: 測試進度顯示準確性

**狀態**: ⏸ 待修復

---

### 問題 3: 影片處理 Timeout 風險

**嚴重程度**: 🔴 **Critical**
**影響範圍**: 系統可用性

#### 問題描述

- **Overall Design** (`02-key-flows.md` 第 1064-1073 行) 估算最差情況影片生成需 12 分鐘
- **GCP Cloud Run** 預設 request timeout 通常較短
- **Current Plan**: Task 2.12 未提到異步處理機制

#### 影響分析

1. **可用性**: 90 秒以上的影片可能無法生成
2. **用戶體驗**: 長時間請求可能被中斷
3. **成本**: 重試會增加成本

#### 時間分析表

| 影片長度 | 素材分析 | 配音處理 | AI 選片 | 影片渲染 | 總計 | 風險 |
|---------|---------|---------|---------|---------|------|------|
| 30 秒 | 90s | 30s | 30s | 120s | 4.5 分鐘 | 🟢 安全 |
| 60 秒 | 90s | 60s | 60s | 240s | 7.5 分鐘 | 🟡 邊緣 |
| 90 秒 | 90s | 90s | 90s | 360s | 10.5 分鐘 | 🔴 危險 |
| 120 秒 | 90s | 120s | 120s | 480s | 13.5 分鐘 | 🔴 超時 |

#### 修復方案

```markdown
修改 Task 2.12: 基礎影片合成

## 步驟 1: Cloud Run Timeout 設定 (新增)

在 `service.yaml` 或 `cloudbuild.yaml` 設定:
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: cheapcut-api
spec:
  template:
    spec:
      timeoutSeconds: 900  # 15 分鐘 (Cloud Run 最大值)
      containers:
        - image: gcr.io/project/image
          resources:
            limits:
              memory: 2Gi
              cpu: 2
```

## 步驟 2: 異步處理架構 (新增)

### 2.1 API 端點修改

```typescript
// src/routes/videos.routes.ts
router.post('/videos/render', authMiddleware, async (req, res) => {
  const { timelineId } = req.body;
  const userId = req.user.id;

  // 1. 建立任務記錄
  const task = await db.task_executions.create({
    user_id: userId,
    task_type: 'video_generation',
    related_id: timelineId,
    status: 'pending',
    total_steps: 5,
    steps: [
      { name: 'load_timeline', status: 'pending' },
      { name: 'prepare_assets', status: 'pending' },
      { name: 'render_video', status: 'pending' },
      { name: 'add_subtitle', status: 'pending' },
      { name: 'add_music', status: 'pending' }
    ]
  });

  // 2. 加入 Bull Queue
  await videoRenderQueue.add({
    executionId: task.execution_id,
    timelineId,
    userId
  }, {
    attempts: 3,  // 最多重試 3 次
    timeout: 900000  // 15 分鐘
  });

  // 3. 立即返回 task_id (不等待完成)
  res.json({
    taskId: task.execution_id,
    status: 'queued',
    message: '影片生成任務已加入佇列'
  });
});

// 查詢進度端點
router.get('/tasks/:taskId', authMiddleware, async (req, res) => {
  const { taskId } = req.params;

  const task = await db.task_executions.findById(taskId);

  res.json({
    taskId,
    status: task.status,
    currentStep: task.current_step,
    stepIndex: task.step_index,
    totalSteps: task.total_steps,
    steps: task.steps,
    result: task.output_data,
    error: task.error_message
  });
});
```

### 2.2 Worker 實作

```typescript
// src/workers/video-render.worker.ts
import { Queue, Worker } from 'bullmq';

export const videoRenderQueue = new Queue('video-render', {
  connection: redisConnection
});

const worker = new Worker('video-render', async (job) => {
  const { executionId, timelineId, userId } = job.data;

  try {
    // 更新狀態為處理中
    await updateTaskStatus(executionId, 'processing', 'load_timeline', 0);

    // 步驟 1: 載入時間軸
    const timeline = await loadTimeline(timelineId);
    await updateTaskStatus(executionId, 'processing', 'prepare_assets', 1);

    // 步驟 2: 準備素材
    const assets = await prepareAssets(timeline);
    await updateTaskStatus(executionId, 'processing', 'render_video', 2);

    // 步驟 3: 渲染影片 (最耗時)
    const videoPath = await renderVideo(assets, timeline);
    await updateTaskStatus(executionId, 'processing', 'add_subtitle', 3);

    // 步驟 4: 加入字幕
    const withSubtitle = await addSubtitle(videoPath, timeline);
    await updateTaskStatus(executionId, 'processing', 'add_music', 4);

    // 步驟 5: 加入配樂
    const finalVideo = await addMusic(withSubtitle, timeline);

    // 完成
    await updateTaskStatus(executionId, 'completed', null, 5, {
      videoUrl: finalVideo.url,
      fileSize: finalVideo.size,
      duration: finalVideo.duration
    });

    return { success: true };

  } catch (error) {
    // 錯誤處理
    await updateTaskStatus(executionId, 'failed', null, null, null, error.message);
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 2  // 同時處理 2 個任務
});

async function updateTaskStatus(
  executionId: string,
  status: string,
  currentStep: string | null,
  stepIndex: number,
  result?: any,
  error?: string
) {
  await db.task_executions.update(executionId, {
    status,
    current_step: currentStep,
    step_index: stepIndex,
    output_data: result,
    error_message: error,
    updated_at: new Date()
  });
}
```

驗收標準 (新增):
- [ ] Cloud Run timeout 設定為 15 分鐘
- [ ] 渲染任務使用 Bull Queue 處理
- [ ] API 立即返回 task_id (不阻塞)
- [ ] 前端可以輪詢取得進度
- [ ] 超時情況有正確錯誤處理
- [ ] 可以同時處理多個渲染任務
```

#### 執行計劃

1. **立即**: 更新 Task 2.12 文件 (30 分鐘)
2. **Phase 2**: Claude E 實作 (加 2 小時到原本的 4-5 小時)
3. **驗收**: 測試 90 秒以上影片生成

**狀態**: ⏸ 待修復

---

## 🟡 中風險問題 (P1 - 建議修復)

### 問題 4: Redis 快取策略不明確

**嚴重程度**: 🟡 **High**
**影響範圍**: 用戶體驗流暢度

#### 問題描述

- **Overall Design** (`05-data-flow.md` 第 516-563 行) 詳細說明候選片段快取
- **Task 1.4** 只建立 Redis,未說明快取策略
- **Task 2.10** 未明確提到快取候選片段

#### 修復方案

```markdown
修改 Task 2.10: 時間軸生成

在「步驟 3: 生成時間軸 JSON」後加入:

## 步驟 4: 快取候選片段 (新增)

在生成時間軸的同時,將候選片段快取到 Redis 供前端時間軌編輯器使用。

### 4.1 快取格式設計

**Key 格式**: `candidates:timeline_{timeline_id}:segment_{index}`

**Value 格式** (JSON):
```json
{
  "voiceoverSegment": {
    "text": "這是第一段配音",
    "start": 0.0,
    "end": 5.2,
    "keywords": ["貓咪", "可愛", "玩耍"]
  },
  "selectedSegmentId": "seg_123",
  "candidates": [
    {
      "segmentId": "seg_123",
      "thumbnailUrl": "https://...",
      "duration": 5.0,
      "tags": ["貓咪", "玩耍"],
      "score": 0.95,
      "selected": true
    },
    {
      "segmentId": "seg_456",
      "thumbnailUrl": "https://...",
      "duration": 5.2,
      "tags": ["貓咪", "睡覺"],
      "score": 0.78,
      "selected": false
    }
  ]
}
```

### 4.2 快取實作

```typescript
// 在選片過程中快取
for (let i = 0; i < voiceoverSegments.length; i++) {
  const segment = voiceoverSegments[i];
  const candidates = await queryCandidates(segment.keywords);

  // 選出最佳片段
  const selectedSegment = await aiSelectBest(candidates, segment);

  // 快取候選片段 (供時間軌編輯使用)
  const cacheData = {
    voiceoverSegment: segment,
    selectedSegmentId: selectedSegment.segment_id,
    candidates: candidates.map(c => ({
      segmentId: c.segment_id,
      thumbnailUrl: c.thumbnail_url,
      duration: c.duration,
      tags: c.tags,
      score: c.score,
      selected: c.segment_id === selectedSegment.segment_id
    }))
  };

  await redis.set(
    `candidates:timeline_${timeline.timeline_id}:segment_${i}`,
    JSON.stringify(cacheData),
    'EX', 3600  // 1 小時過期
  );

  // 加入時間軸
  timeline.clips.push({
    segmentId: selectedSegment.segment_id,
    startTime: currentTime,
    duration: selectedSegment.duration
  });

  currentTime += selectedSegment.duration;
}
```

### 4.3 API 端點

新增查詢候選片段的 API (供 Task 3.9 使用):

```typescript
// GET /api/timeline/:timelineId/segment/:index/candidates
router.get('/timeline/:timelineId/segment/:index/candidates',
  authMiddleware,
  async (req, res) => {
    const { timelineId, index } = req.params;

    // 從 Redis 讀取
    const cacheKey = `candidates:timeline_${timelineId}:segment_${index}`;
    const cached = await redis.get(cacheKey);

    if (!cached) {
      return res.status(404).json({
        error: '候選片段已過期,請重新生成時間軸'
      });
    }

    res.json(JSON.parse(cached));
  }
);

// PUT /api/timeline/:timelineId/segment/:index
router.put('/timeline/:timelineId/segment/:index',
  authMiddleware,
  async (req, res) => {
    const { timelineId, index } = req.params;
    const { newSegmentId } = req.body;

    // 1. 更新時間軸資料庫
    await updateTimelineSegment(timelineId, index, newSegmentId);

    // 2. 更新快取
    const cacheKey = `candidates:timeline_${timelineId}:segment_${index}`;
    const cached = JSON.parse(await redis.get(cacheKey));
    cached.selectedSegmentId = newSegmentId;
    cached.candidates.forEach(c => {
      c.selected = (c.segmentId === newSegmentId);
    });
    await redis.set(cacheKey, JSON.stringify(cached), 'EX', 3600);

    res.json({ success: true });
  }
);
```

驗收標準 (新增):
- [ ] 候選片段已正確快取到 Redis
- [ ] 快取 key 格式符合 `candidates:timeline_{id}:segment_{index}`
- [ ] 快取過期時間設定為 1 小時
- [ ] API 端點可正確查詢候選片段
- [ ] API 端點可正確更新選擇的片段
```

**狀態**: ⏸ 待修復

---

### 問題 5: Prompt 管理流程不完整

**嚴重程度**: 🟡 **High**
**影響範圍**: 核心競爭力管理

#### 問題描述

- **Overall Design** (`05-data-flow.md` 第 227-569 行) 設計了完整的 Git-based Prompt 管理
- **Task 2.0** 建立 PromptManager,但缺少:
  - Git commit workflow
  - Prompt 測試流程
  - 正式環境快取清除機制

#### 修復方案

```markdown
修改 Task 2.0: Prompt 管理系統

在「步驟 3: 版本控制」後加入:

## 步驟 4: Prompt 優化 Workflow (新增)

### 4.1 Git Workflow

#### 開發環境 Prompt 修改流程

1. **修改 Prompt 檔案**
   ```bash
   vi prompts/semantic-analysis/v2.txt
   ```

2. **本地測試**
   ```bash
   npm run test:prompt semantic-analysis
   ```

3. **Commit 到 Git**
   ```bash
   git add prompts/semantic-analysis/v2.txt
   git commit -m "feat(prompt): 優化語意分析 Prompt v2

   改進點:
   - 加強關鍵字提取準確度
   - 減少誤判率

   測試結果:
   - 準確率: 92% -> 95%
   - 成本: $0.002 -> $0.0018"

   git push origin main
   ```

4. **部署到正式環境**
   ```bash
   # 在 Cloud Run 上執行
   git pull
   npm run prompt:reload
   ```

#### Prompt 版本回退

如果新版本效果不佳:
```bash
# 回退到前一版本
git revert HEAD

# 或指定版本
git checkout <commit-hash> -- prompts/semantic-analysis/v1.txt

# 重新載入
npm run prompt:reload
```

### 4.2 Prompt 測試框架

建立 `tests/prompts/test-prompt.ts`:

```typescript
import { PromptManager } from '@/services/prompt-manager';

interface PromptTestCase {
  input: string;
  expectedKeywords: string[];
  expectedTone: string;
}

async function testPrompt(
  promptName: string,
  version: number,
  testCases: PromptTestCase[]
) {
  const promptManager = new PromptManager();

  const results = {
    passed: 0,
    failed: 0,
    accuracy: 0,
    totalCost: 0
  };

  for (const testCase of testCases) {
    const result = await promptManager.execute(
      promptName,
      { text: testCase.input },
      { version }
    );

    // 驗證結果
    const keywordMatch = testCase.expectedKeywords.every(
      k => result.keywords.includes(k)
    );
    const toneMatch = result.tone === testCase.expectedTone;

    if (keywordMatch && toneMatch) {
      results.passed++;
    } else {
      results.failed++;
      console.log(`Failed:`, testCase.input, result);
    }

    results.totalCost += result.cost;
  }

  results.accuracy = results.passed / testCases.length;

  return results;
}

// 測試案例
const testCases: PromptTestCase[] = [
  {
    input: "這隻小貓咪在花園裡開心地玩耍",
    expectedKeywords: ["貓咪", "花園", "玩耍"],
    expectedTone: "positive"
  },
  // ... 更多測試案例
];

testPrompt('semantic-analysis', 2, testCases).then(results => {
  console.log(`Accuracy: ${results.accuracy * 100}%`);
  console.log(`Total Cost: $${results.totalCost}`);
});
```

執行測試:
```bash
npm run test:prompt semantic-analysis --version=2
```

### 4.3 正式環境快取清除機制

建立 API 端點清除 Prompt 快取:

```typescript
// src/routes/admin.routes.ts
router.post('/admin/prompts/reload',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    const promptManager = PromptManager.getInstance();

    // 1. 清除記憶體快取
    promptManager.clearCache();

    // 2. 清除 Redis 快取
    await redis.del('prompt:*');

    // 3. 重新載入所有 Prompt
    await promptManager.loadAll();

    res.json({
      success: true,
      message: '所有 Prompt 已重新載入'
    });
  }
);
```

驗收標準 (新增):
- [ ] Git workflow 文件已建立
- [ ] Prompt 測試框架已實作
- [ ] 可執行 `npm run test:prompt` 測試 Prompt
- [ ] 正式環境可透過 API 重新載入 Prompt
- [ ] Prompt 版本記錄在 cost_records 表
```

**狀態**: ⏸ 待修復

---

### 問題 6: 成本估算與實際追蹤不一致

**嚴重程度**: 🟡 **Medium**
**影響範圍**: 成本控制

#### 問題描述

- **Overall Design** (`05-data-flow.md` 第 1575 行) 估算單支影片成本 NT$1.8 (約 $0.06 USD)
- **Task 1.6** 實作成本追蹤,但缺少與設計估算值的對比和告警

#### 修復方案

```markdown
修改 Task 1.6: 成本與效能追蹤服務

在「步驟 4: 告警機制」中加入:

### 4.3 成本預算告警 (新增)

根據 Overall Design 的成本估算,設定預算告警:

```typescript
// src/services/cost-tracker.ts
const COST_BUDGETS = {
  video_generation: {
    target: 0.06,  // 目標: $0.06 USD/支
    warning: 0.10,  // 警告: $0.10 USD/支
    critical: 0.50  // 嚴重: $0.50 USD/支
  },
  material_analysis: {
    target: 0.01,
    warning: 0.02,
    critical: 0.05
  },
  voiceover_processing: {
    target: 0.02,
    warning: 0.04,
    critical: 0.10
  }
};

async function checkCostBudget(
  executionId: string,
  taskType: string,
  totalCost: number
) {
  const budget = COST_BUDGETS[taskType];

  if (!budget) return;

  let level: 'info' | 'warning' | 'critical' = 'info';

  if (totalCost > budget.critical) {
    level = 'critical';
  } else if (totalCost > budget.warning) {
    level = 'warning';
  }

  if (level !== 'info') {
    // 記錄告警
    await logger.log({
      level: level === 'critical' ? 'ERROR' : 'WARN',
      type: 'COST_ALERT',
      execution_id: executionId,
      data: {
        task_type: taskType,
        actual_cost: totalCost,
        target_cost: budget.target,
        threshold: level === 'critical' ? budget.critical : budget.warning,
        overage: totalCost - budget.target,
        percentage: ((totalCost / budget.target) - 1) * 100
      }
    });

    // 發送通知 (如果是 critical)
    if (level === 'critical') {
      await notifyAdmin({
        subject: `成本告警: ${taskType} 超出預算`,
        message: `實際成本 $${totalCost} 超出目標 $${budget.target}`
      });
    }
  }
}
```

驗收標準 (新增):
- [ ] 成本預算閾值已設定
- [ ] 成本超出 warning 閾值會記錄 WARN log
- [ ] 成本超出 critical 閾值會發送告警
- [ ] 可在 Dashboard 查看成本 vs 預算對比
```

**狀態**: ⏸ 待修復

---

## 🟢 低風險問題 (P2 - 可延後處理)

### 問題 7: 測試資料準備時間可能不足

**嚴重程度**: 🟢 **Low**
**影響範圍**: 測試階段

#### 問題描述

Task 0.3 預估 2-3 小時準備測試資料,但需要準備:
- 10+ 支不同類型的測試影片
- 5+ 段測試配音
- 多種場景組合

實際可能需要 4-5 小時。

#### 修復方案

更新 Task 0.3 預估時間: 2-3 小時 → 4-5 小時

**狀態**: ⏸ 待修復

---

### 問題 8: FFmpeg 學習曲線

**嚴重程度**: 🟢 **Low**
**影響範圍**: 開發時程

#### 問題描述

Task 2.11-2.14 涉及複雜的 FFmpeg 指令。如果開發者不熟悉 FFmpeg,實際時間可能是預估的 2 倍。

#### 修復方案

1. 預留額外學習時間 (2-3 小時)
2. 準備 FFmpeg 指令參考文件
3. 收集常用範例

建議建立 `docs/ffmpeg-quick-reference.md`:

```markdown
# FFmpeg 快速參考

## 常用指令

### 影片拼接
```bash
ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4
```

### 加入字幕
```bash
ffmpeg -i input.mp4 -vf subtitles=subtitle.srt output.mp4
```

### 混音
```bash
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4
```

## 參考資源
- [FFmpeg 官方文件](https://ffmpeg.org/documentation.html)
- [FFmpeg Wiki](https://trac.ffmpeg.org/wiki)
```

**狀態**: ⏸ 待修復

---

## 📋 修復優先級總表

| 優先級 | 問題編號 | 問題名稱 | 預估修復時間 | 狀態 |
|-------|---------|---------|------------|------|
| 🔴 P0 | 1 | 時間軌編輯功能缺失 | 30 分鐘 (文件) | ⏸ 待修復 |
| 🔴 P0 | 2 | 前端進度顯示缺失 | 15 分鐘 (文件) | ⏸ 待修復 |
| 🔴 P0 | 3 | 影片處理 Timeout 風險 | 30 分鐘 (文件) | ⏸ 待修復 |
| 🟡 P1 | 4 | Redis 快取策略不明確 | 20 分鐘 (文件) | ⏸ 待修復 |
| 🟡 P1 | 5 | Prompt 管理流程不完整 | 30 分鐘 (文件) | ⏸ 待修復 |
| 🟡 P1 | 6 | 成本估算與實際追蹤不一致 | 15 分鐘 (文件) | ⏸ 待修復 |
| 🟢 P2 | 7 | 測試資料準備時間不足 | 5 分鐘 (文件) | ⏸ 待修復 |
| 🟢 P2 | 8 | FFmpeg 學習曲線 | 30 分鐘 (文件) | ⏸ 待修復 |

**總修復時間**: 約 2.5-3 小時 (僅更新文件)

---

## ✅ 修復檢查清單

### 立即執行 (開發前)

- [ ] 建立 Task 3.9 文件 (時間軌編輯器)
- [ ] 更新 Task 3.6 文件 (加入進度顯示)
- [ ] 更新 Task 2.12 文件 (異步處理機制)
- [ ] 更新 Task 2.10 文件 (快取邏輯)
- [ ] 更新 Task 2.0 文件 (Prompt 管理 workflow)
- [ ] 更新 Task 1.6 文件 (成本告警機制)
- [ ] 更新 Task 0.3 預估時間
- [ ] 建立 FFmpeg 快速參考文件

### 驗證

- [ ] 所有 Task 文件更新完成
- [ ] 並行開發計劃已更新
- [ ] 所有團隊成員已閱讀風險評估

---

## 📊 修復後預期改善

| 指標 | 修復前 | 修復後 | 改善 |
|------|-------|-------|------|
| MVP 功能完整度 | 85% | 100% | +15% |
| 系統可用性 | 70% (長影片可能失敗) | 98% | +28% |
| 用戶體驗 | 75% (無進度顯示) | 95% | +20% |
| 成本控制 | 80% (缺少告警) | 95% | +15% |
| **整體風險等級** | **🔴 高** | **🟢 低** | **-2 級** |

---

## 📝 後續追蹤

### 定期檢查

- **每週檢查**: 實作進度是否符合計劃
- **每完成一個 Phase**: 重新評估風險
- **MVP 上線前**: 完整風險重評估

### 風險監控指標

| 指標 | 目標值 | 當前值 | 狀態 |
|------|-------|-------|------|
| 高風險問題數 | 0 | 3 | 🔴 |
| 中風險問題數 | ≤2 | 3 | 🟡 |
| 低風險問題數 | ≤3 | 2 | 🟢 |
| 整體風險分數 | ≤20 | 38 | 🔴 |

**目標**: 修復後整體風險分數降至 < 15

---

**文件版本**: 1.0
**最後更新**: 2025-10-07
**下次審查**: 開發完成 Phase 1 後
