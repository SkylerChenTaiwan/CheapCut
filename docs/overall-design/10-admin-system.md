# 步驟 12：管理系統設計

**狀態**：✅ 已完成
**前置依賴**：11-cost-performance-tracking.md
**目標**：設計管理後台系統，用於監控、分析與管理

---

## 核心目標

建立管理後台系統，讓管理員/開發者能夠：

1. **監控系統狀態** - 即時掌握系統運作情況
2. **分析成本效能** - 查看成本報表、效能指標
3. **管理用戶** - 查看用戶使用情況、處理異常
4. **管理任務** - 查看失敗任務、手動重試
5. **系統設定** - 調整系統參數、管理 Prompt

---

## 管理後台功能模組

### 模組 1：Dashboard（總覽）

#### 功能需求

**即時指標（今日/本月）**
- 總成本
- 生成影片數
- 活躍用戶數
- 系統健康狀態
- 失敗任務數

**趨勢圖表**
- 成本趨勢（過去 30 天）
- 影片生成量趨勢
- 用戶增長趨勢

**異常告警**
- 成本異常（超過預算）
- 失敗率異常（超過 5%）
- 高成本用戶

#### API 設計

```typescript
// GET /api/admin/dashboard
{
  "realtime": {
    "today": {
      "total_cost": 45.67,
      "videos_generated": 234,
      "active_users": 89,
      "failed_tasks": 12
    },
    "month": {
      "total_cost": 1234.56,
      "videos_generated": 5678,
      "active_users": 345,
      "failed_tasks": 89
    }
  },
  "trends": {
    "cost": [
      { "date": "2025-10-01", "amount": 38.90 },
      { "date": "2025-10-02", "amount": 42.15 },
      ...
    ],
    "videos": [...],
    "users": [...]
  },
  "alerts": [
    {
      "type": "high_cost",
      "severity": "warning",
      "message": "今日成本已超過平均值 50%",
      "data": { ... }
    },
    {
      "type": "high_failure_rate",
      "severity": "error",
      "message": "過去 1 小時失敗率 8.5%",
      "data": { ... }
    }
  ],
  "system_health": {
    "status": "healthy",
    "uptime": "99.8%",
    "avg_response_time": 1234,
    "error_rate": 0.02
  }
}
```

#### 前端介面設計

```
┌─────────────────────────────────────────────────────────┐
│ CheapCut 管理後台                           admin@example.com ▼ │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📊 Dashboard    💰 成本分析    ⚡ 效能監控    👥 用戶管理   │
│  📋 任務管理     ⚙️ 系統設定                              │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  今日概況                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ 總成本   │  │ 生成影片 │  │ 活躍用戶 │  │ 失敗任務 │    │
│  │ $45.67  │  │  234 支  │  │  89 人  │  │  12 個  │    │
│  │ ↑ 12%   │  │ ↑ 8%    │  │ ↑ 15%   │  │ ↓ 5%    │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                           │
│  成本趨勢（過去 30 天）                                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │        ╱╲                                        │    │
│  │    ╱╲╱  ╲    ╱╲                                 │    │
│  │   ╱      ╲╱╱  ╲                                 │    │
│  │ ╱╱            ╲                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ⚠️ 異常告警                                              │
│  • 今日成本已超過平均值 50% (警告)                        │
│  • 用戶 user-123 本月成本 $156 (異常)                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

### 模組 2：成本分析

#### 功能需求

**成本報表**
- 按時間篩選（今日/本週/本月/自訂）
- 按用戶排名（Top 10 高成本用戶）
- 按服務分類（OpenAI、Google Video AI 等）
- 按功能分類（素材分析、影片生成等）

**Prompt 成本分析（重要！）**
- 哪個 Prompt 最貴
- 哪個 Prompt 用最多次
- Prompt 成本趨勢

**成本預測**
- 基於歷史資料預測本月總成本
- 預算告警

#### API 設計

```typescript
// GET /api/admin/cost/summary?period=monthly
{
  "total_cost": 1234.56,
  "breakdown_by_service": [
    { "service": "openai", "cost": 678.90, "percentage": 55 },
    { "service": "google_video_ai", "cost": 345.67, "percentage": 28 },
    { "service": "cloudflare_stream", "cost": 123.45, "percentage": 10 },
    { "service": "s3", "cost": 86.54, "percentage": 7 }
  ],
  "breakdown_by_task_type": [
    { "type": "video_generation", "cost": 789.01, "percentage": 64 },
    { "type": "material_analysis", "cost": 345.55, "percentage": 28 },
    { "type": "voiceover_processing", "cost": 100.00, "percentage": 8 }
  ],
  "top_users": [
    { "user_id": "user-123", "cost": 156.78, "videos_count": 234 },
    { "user_id": "user-456", "cost": 89.12, "videos_count": 145 },
    ...
  ]
}

// GET /api/admin/cost/prompts?period=monthly
{
  "prompts": [
    {
      "prompt_name": "segment_select",
      "category": "video_selection",
      "total_cost": 234.56,
      "avg_cost": 0.048,
      "calls_count": 4887,
      "total_tokens": 1234567
    },
    {
      "prompt_name": "voiceover_split",
      "category": "voiceover_processing",
      "total_cost": 123.45,
      "avg_cost": 0.032,
      "calls_count": 3858,
      "total_tokens": 678901
    }
  ]
}

// GET /api/admin/cost/forecast
{
  "current_month_to_date": 1234.56,
  "days_elapsed": 15,
  "days_remaining": 16,
  "projected_total": 2469.12,  // 簡單預測：current * (31 / 15)
  "budget": 2000,
  "budget_status": "over_budget",  // "under_budget" | "on_track" | "over_budget"
  "alert": "預計超出預算 $469.12 (23%)"
}
```

#### 前端介面設計

```
┌─────────────────────────────────────────────────────────┐
│ 成本分析                                                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  篩選：[本月 ▼]  [所有服務 ▼]  [所有用戶 ▼]               │
│                                                           │
│  總成本：$1,234.56                                        │
│  預算：$2,000  (已使用 62%)  ⚠️ 預計超支 $469             │
│                                                           │
│  按服務分類                        按功能分類               │
│  ┌─────────────────────────┐  ┌──────────────────────┐  │
│  │ OpenAI        55% $679  │  │ 影片生成    64% $789 │  │
│  │ Video AI      28% $346  │  │ 素材分析    28% $346 │  │
│  │ Stream        10% $123  │  │ 配音處理     8% $100 │  │
│  │ S3             7% $87   │  └──────────────────────┘  │
│  └─────────────────────────┘                            │
│                                                           │
│  Prompt 成本排名 (Top 5)                                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 1. segment_select        $234.56  (4,887 次)    │    │
│  │ 2. voiceover_split       $123.45  (3,858 次)    │    │
│  │ 3. semantic_analysis     $89.01   (2,967 次)    │    │
│  │ 4. music_select          $45.67   (1,522 次)    │    │
│  │ 5. tag_conversion        $23.45   (782 次)      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  高成本用戶 (Top 10)                                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │ user-123  $156.78  (234 支影片)  [查看詳情]     │    │
│  │ user-456   $89.12  (145 支影片)  [查看詳情]     │    │
│  │ ...                                              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

### 模組 3：效能監控

#### 功能需求

**任務效能分析**
- 平均耗時（按任務類型）
- P95/P99 耗時
- 最慢的任務

**瓶頸分析**
- 哪個步驟最慢
- 哪個 Prompt 回應最慢
- 哪個外部 API 最慢

**趨勢分析**
- 效能是否在變差
- 與上週/上月對比

#### API 設計

```typescript
// GET /api/admin/performance/summary?period=weekly
{
  "by_task_type": [
    {
      "task_type": "video_generation",
      "avg_duration": 45000,    // ms
      "p95_duration": 78000,
      "p99_duration": 120000,
      "max_duration": 180000,
      "count": 1234
    },
    {
      "task_type": "material_analysis",
      "avg_duration": 35000,
      "p95_duration": 60000,
      "count": 456
    }
  ],
  "bottlenecks": [
    {
      "step_name": "render_video",
      "task_type": "video_generation",
      "avg_duration": 38000,
      "percentage_of_total": 84  // 佔整個任務 84% 的時間
    },
    {
      "step_name": "call_video_ai",
      "task_type": "material_analysis",
      "avg_duration": 28000,
      "percentage_of_total": 80
    }
  ],
  "slowest_prompts": [
    {
      "prompt_name": "segment_select",
      "avg_duration": 3500,
      "p95_duration": 6000,
      "calls_count": 4887
    }
  ]
}

// GET /api/admin/performance/trend?period=daily&days=30
{
  "trend": [
    { "date": "2025-10-01", "avg_duration": 42000 },
    { "date": "2025-10-02", "avg_duration": 45000 },
    ...
  ],
  "change_percentage": 8.5,  // 比上週慢了 8.5%
  "status": "degrading"      // "improving" | "stable" | "degrading"
}
```

---

### 模組 4：任務管理

#### 功能需求

**任務列表**
- 查看所有任務（可篩選狀態）
- 失敗任務列表
- 處理中的任務

**任務詳情**
- 查看任務的完整執行記錄
- 查看每一步的耗時、成本
- 查看錯誤訊息

**任務操作**
- 手動重試失敗任務
- 取消執行中的任務
- 查看任務的 log

#### API 設計

```typescript
// GET /api/admin/tasks?status=failed&limit=50
{
  "tasks": [
    {
      "execution_id": "exec-123",
      "task_type": "video_generation",
      "user_id": "user-456",
      "status": "failed",
      "failed_step": "render_video",
      "error_message": "Cloudflare Stream API timeout",
      "created_at": "2025-10-06T10:00:00Z",
      "duration": 67000,
      "total_cost": 0.85
    },
    ...
  ],
  "total": 123,
  "page": 1,
  "limit": 50
}

// GET /api/admin/tasks/{executionId}
{
  "execution_id": "exec-123",
  "task_type": "video_generation",
  "user_id": "user-456",
  "status": "failed",
  "steps": [
    {
      "name": "stt",
      "status": "completed",
      "started_at": "2025-10-06T10:00:00Z",
      "completed_at": "2025-10-06T10:00:02Z",
      "duration": 2000,
      "cost": 0.006
    },
    {
      "name": "semantic_analysis",
      "status": "completed",
      "duration": 3500,
      "cost": 0.012
    },
    {
      "name": "select_segments",
      "status": "completed",
      "duration": 15000,
      "cost": 0.045
    },
    {
      "name": "render_video",
      "status": "failed",
      "started_at": "2025-10-06T10:00:20Z",
      "duration": 45000,
      "error": "Cloudflare Stream API timeout after 45s"
    }
  ],
  "total_duration": 67000,
  "total_cost": 0.85,
  "cost_breakdown": [
    { "service": "openai", "cost": 0.057 },
    { "service": "whisper", "cost": 0.006 },
    { "service": "cloudflare_stream", "cost": 0 }  // 失敗了，沒收費
  ]
}

// POST /api/admin/tasks/{executionId}/retry
{
  "retry_from_step": "render_video",  // 從失敗的步驟重試
  "new_execution_id": "exec-456"
}

// GET /api/admin/tasks/{executionId}/logs
{
  "logs": [
    {
      "timestamp": "2025-10-06T10:00:00Z",
      "level": "info",
      "message": "Task started",
      "data": { ... }
    },
    {
      "timestamp": "2025-10-06T10:00:02Z",
      "level": "info",
      "message": "STT completed",
      "data": { ... }
    },
    ...
    {
      "timestamp": "2025-10-06T10:01:05Z",
      "level": "error",
      "message": "Cloudflare Stream API timeout",
      "error": { ... }
    }
  ]
}
```

---

### 模組 5：用戶管理

#### 功能需求

**用戶列表**
- 查看所有用戶
- 按成本排序
- 按使用量排序

**用戶詳情**
- 查看用戶的使用情況
- 查看用戶的成本明細
- 查看用戶的影片列表

**用戶操作**
- 查看用戶詳細資料
- 調整用戶配額
- 封禁/解封用戶

#### API 設計

```typescript
// GET /api/admin/users?sortBy=cost&order=desc&limit=50
{
  "users": [
    {
      "user_id": "user-123",
      "email": "user@example.com",
      "total_cost": 156.78,
      "videos_generated": 234,
      "materials_uploaded": 45,
      "created_at": "2025-09-01T00:00:00Z",
      "status": "active"
    },
    ...
  ]
}

// GET /api/admin/users/{userId}
{
  "user_id": "user-123",
  "email": "user@example.com",
  "created_at": "2025-09-01T00:00:00Z",
  "status": "active",
  "usage": {
    "total_cost": 156.78,
    "videos_generated": 234,
    "materials_uploaded": 45,
    "total_storage_mb": 1234
  },
  "quota": {
    "max_videos_per_month": 1000,
    "max_storage_mb": 10000
  },
  "cost_trend": [
    { "month": "2025-09", "cost": 67.89 },
    { "month": "2025-10", "cost": 88.89 }
  ]
}

// PATCH /api/admin/users/{userId}
{
  "status": "banned",  // "active" | "banned" | "suspended"
  "quota": {
    "max_videos_per_month": 500
  }
}
```

---

### 模組 6：系統設定

#### 功能需求

**Prompt 管理**
- 查看所有 Prompt
- 查看 Prompt 版本歷史（Git）
- 啟用/停用 Prompt
- 查看 Prompt 使用統計

**系統參數**
- 成本預算設定
- 告警閾值設定
- 外部 API 金鑰管理

**快取管理**
- 查看快取狀態
- 清除 Prompt 快取
- 清除其他快取

#### API 設計

```typescript
// GET /api/admin/prompts
{
  "prompts": [
    {
      "category": "video_selection",
      "name": "segment_select",
      "version": 3,
      "active": true,
      "updated": "2025-10-06",
      "usage_stats": {
        "calls_last_7days": 4887,
        "avg_cost": 0.048,
        "avg_duration": 3500
      }
    },
    ...
  ]
}

// GET /api/admin/prompts/{category}/{name}/versions
// 透過 Git API 查詢版本歷史
{
  "versions": [
    {
      "version": 3,
      "commit": "abc123",
      "author": "admin@example.com",
      "date": "2025-10-06",
      "message": "優化選片邏輯，減少 token 使用",
      "active": true
    },
    {
      "version": 2,
      "commit": "def456",
      "date": "2025-10-05",
      "message": "修正切分過碎問題",
      "active": false
    }
  ]
}

// POST /api/admin/prompts/clear-cache
{
  "category": "video_selection",  // 可選，不提供則清除全部
  "name": "segment_select"        // 可選
}

// GET /api/admin/settings
{
  "cost_budget": {
    "monthly_limit": 2000,
    "alert_threshold": 0.8  // 80% 時告警
  },
  "performance_alerts": {
    "avg_duration_threshold": 60000,  // 平均超過 60 秒告警
    "failure_rate_threshold": 0.05    // 失敗率超過 5% 告警
  },
  "external_services": {
    "openai": {
      "api_key": "sk-***",  // 遮罩
      "status": "active"
    },
    "google_video_ai": {
      "api_key": "***",
      "status": "active"
    }
  }
}

// PATCH /api/admin/settings
{
  "cost_budget": {
    "monthly_limit": 3000
  }
}
```

---

## 權限控制

### 角色定義

```typescript
enum AdminRole {
  SUPER_ADMIN = 'super_admin',    // 所有權限
  DEVELOPER = 'developer',        // 查看 + 任務管理 + Prompt 管理
  ANALYST = 'analyst',            // 只能查看報表
  SUPPORT = 'support'             // 查看 + 用戶管理
}

// 權限對應表
const permissions = {
  'super_admin': ['*'],
  'developer': [
    'dashboard:view',
    'cost:view',
    'performance:view',
    'tasks:view',
    'tasks:retry',
    'prompts:view',
    'prompts:clear_cache'
  ],
  'analyst': [
    'dashboard:view',
    'cost:view',
    'performance:view'
  ],
  'support': [
    'dashboard:view',
    'users:view',
    'users:update',
    'tasks:view'
  ]
}
```

### 認證機制

```typescript
// JWT Token 包含角色資訊
interface AdminToken {
  admin_id: string
  email: string
  role: AdminRole
  exp: number
}

// 中間件檢查權限
function requirePermission(permission: string) {
  return (req, res, next) => {
    const token = verifyAdminToken(req.headers.authorization)

    if (!hasPermission(token.role, permission)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}

// 使用
router.get('/api/admin/users',
  requirePermission('users:view'),
  getUsersHandler
)

router.patch('/api/admin/users/:id',
  requirePermission('users:update'),
  updateUserHandler
)
```

---

## 前端技術棧建議

### 框架選擇

**選項 1：React + Ant Design**
- 優點：成熟的後台 UI 組件庫
- 適合：快速開發

**選項 2：React + Tailwind + Shadcn/UI**
- 優點：現代化、客製化程度高
- 適合：需要特殊設計

**選項 3：Next.js + 上述任一 UI 庫**
- 優點：SSR、路由簡單
- 適合：需要 SEO 或更好的效能

### 圖表庫

- **Recharts** - 簡單易用
- **Chart.js** - 功能豐富
- **Apache ECharts** - 功能最強大

---

## 完成檢查

- [x] 設計 Dashboard 模組
- [x] 設計成本分析模組
- [x] 設計效能監控模組
- [x] 設計任務管理模組
- [x] 設計用戶管理模組
- [x] 設計系統設定模組
- [x] 設計權限控制機制
- [x] 定義所有管理 API

---

**下一步**：
- [ ] 更新 02-key-flows.md（加入管理流程）
- [ ] 更新 04-module-breakdown.md（加入管理後台模組）
- [ ] 更新 05-data-flow.md（加入成本資料流）
