# Task 5.1: Dashboard 總覽頁面

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 5.1 |
| **Task 名稱** | Dashboard 總覽頁面 |
| **所屬 Phase** | Phase 5: 管理後台開發 |
| **預估時間** | 5-6 小時 (API 2h + 前端 3h + 整合測試 1h) |
| **難度** | ⭐⭐⭐ 中高 |
| **前置 Task** | Task 1.6 (成本與效能追蹤服務) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息 (90% 的問題都會告訴你原因)

**API 或前端報錯?** 別慌張,按照這個順序處理:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot read property 'total_cost' of undefined
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 這是關鍵錯誤訊息
   ```

2. **判斷錯誤類型**
   - `Cannot read property of undefined` → API 回傳資料結構不符
   - `401 Unauthorized` → 權限驗證失敗
   - `500 Internal Server Error` → 後端 SQL 或邏輯錯誤
   - `CORS Error` → 跨域設定問題

3. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 上網搜尋 (有技巧的查資料)

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"Dashboard 錯誤"  ← 太模糊
"圖表顯示不出來" ← 沒有具體錯誤訊息
```

**✅ 好的搜尋方式**:
```
"Next.js getServerSideProps undefined data"  ← 包含具體框架和錯誤
"Recharts LineChart data format" ← 具體的技術問題
"PostgreSQL aggregate function with date_trunc" ← 資料庫查詢問題
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件** (最準確)
- Next.js: https://nextjs.org/docs
- Recharts: https://recharts.org/
- PostgreSQL: https://www.postgresql.org/docs/

**優先順序 2: Stack Overflow** (有具體解答)
- 搜尋時加上 `site:stackoverflow.com`

---

### Step 3: 檢查環境設定

```bash
# 檢查後端 API 是否正常運作
curl http://localhost:8000/api/admin/dashboard

# 檢查前端是否能連線到後端
# 查看瀏覽器 Console 的 Network tab
```

---

## 🎯 Task 目標

建立管理後台的 Dashboard 總覽頁面,顯示:
- 即時指標(今日/本月統計)
- 成本趨勢圖
- 異常告警
- 系統健康狀態

---

## 📁 檔案結構

```
backend/
├── src/
│   ├── routes/
│   │   └── admin/
│   │       └── dashboard.ts          # Dashboard API 路由
│   ├── services/
│   │   └── admin/
│   │       ├── dashboard.service.ts  # Dashboard 資料聚合服務
│   │       └── alerts.service.ts     # 告警檢測服務
│   └── middleware/
│       └── adminAuth.ts              # 管理員權限驗證中間件

frontend/
├── pages/
│   └── admin/
│       ├── index.tsx                 # Dashboard 頁面
│       └── _middleware.ts            # 管理後台權限驗證
├── components/
│   └── admin/
│       ├── DashboardStats.tsx        # 統計卡片組件
│       ├── TrendChart.tsx            # 趨勢圖表組件
│       ├── AlertList.tsx             # 告警列表組件
│       └── SystemHealth.tsx          # 系統健康狀態組件
└── lib/
    └── admin-api.ts                  # 管理後台 API 呼叫封裝
```

---

## 📝 實作步驟

### Step 1: 建立管理員權限驗證中間件

**位置**: `backend/src/middleware/adminAuth.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AdminToken {
  admin_id: string
  email: string
  role: 'super_admin' | 'developer' | 'analyst' | 'support'
  exp: number
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as AdminToken

    // 檢查是否為管理員
    if (!decoded.admin_id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // 將管理員資訊附加到 request
    req.admin = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// 檢查特定權限
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = req.admin
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!hasPermission(admin.role, permission)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}

function hasPermission(role: string, permission: string): boolean {
  const permissions: Record<string, string[]> = {
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

  const rolePermissions = permissions[role] || []
  return rolePermissions.includes('*') || rolePermissions.includes(permission)
}
```

**檢查點**:
- [ ] 中間件可正確驗證 JWT Token
- [ ] 權限檢查邏輯正確
- [ ] 錯誤處理完善

---

### Step 2: 建立 Dashboard API 路由

**位置**: `backend/src/routes/admin/dashboard.ts`

```typescript
import express from 'express'
import { requireAdminAuth, requirePermission } from '../../middleware/adminAuth'
import { DashboardService } from '../../services/admin/dashboard.service'
import { AlertsService } from '../../services/admin/alerts.service'

const router = express.Router()
const dashboardService = new DashboardService()
const alertsService = new AlertsService()

// GET /api/admin/dashboard
router.get('/',
  requireAdminAuth,
  requirePermission('dashboard:view'),
  async (req, res) => {
    try {
      // 取得即時指標
      const realtime = await dashboardService.getRealtimeStats()

      // 取得趨勢資料
      const trends = await dashboardService.getTrends()

      // 取得告警
      const alerts = await alertsService.getActiveAlerts()

      // 取得系統健康狀態
      const systemHealth = await dashboardService.getSystemHealth()

      res.json({
        realtime,
        trends,
        alerts,
        system_health: systemHealth
      })
    } catch (error) {
      console.error('Dashboard API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

export default router
```

**檢查點**:
- [ ] API 路由正確設定
- [ ] 權限驗證正確
- [ ] 錯誤處理完善

---

### Step 3: 實作 Dashboard Service

**位置**: `backend/src/services/admin/dashboard.service.ts`

```typescript
import { pool } from '../../db'

export class DashboardService {
  // 取得即時統計
  async getRealtimeStats() {
    const today = await this.getStatsForPeriod('today')
    const month = await this.getStatsForPeriod('month')

    return {
      today,
      month
    }
  }

  private async getStatsForPeriod(period: 'today' | 'month') {
    const timeCondition = period === 'today'
      ? "DATE(created_at) = CURRENT_DATE"
      : "DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"

    // 總成本
    const costResult = await pool.query(`
      SELECT COALESCE(SUM(total_cost), 0) as total_cost
      FROM cost_tracking
      WHERE ${timeCondition}
    `)

    // 生成影片數
    const videosResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM videos
      WHERE ${timeCondition}
        AND status = 'completed'
    `)

    // 活躍用戶數
    const usersResult = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM execution_logs
      WHERE ${timeCondition}
    `)

    // 失敗任務數
    const failedResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM execution_logs
      WHERE ${timeCondition}
        AND status = 'failed'
    `)

    return {
      total_cost: parseFloat(costResult.rows[0].total_cost),
      videos_generated: parseInt(videosResult.rows[0].count),
      active_users: parseInt(usersResult.rows[0].count),
      failed_tasks: parseInt(failedResult.rows[0].count)
    }
  }

  // 取得趨勢資料 (過去 30 天)
  async getTrends() {
    // 成本趨勢
    const costTrend = await pool.query(`
      SELECT
        DATE(created_at) as date,
        SUM(total_cost) as amount
      FROM cost_tracking
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `)

    // 影片生成趨勢
    const videosTrend = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM videos
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date
    `)

    // 用戶增長趨勢
    const usersTrend = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as count
      FROM execution_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `)

    return {
      cost: costTrend.rows.map(row => ({
        date: row.date,
        amount: parseFloat(row.amount)
      })),
      videos: videosTrend.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      })),
      users: usersTrend.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      }))
    }
  }

  // 取得系統健康狀態
  async getSystemHealth() {
    // 計算 uptime (從資料庫查詢最近 24 小時的成功率)
    const healthResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as success
      FROM execution_logs
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `)

    const total = parseInt(healthResult.rows[0].total)
    const success = parseInt(healthResult.rows[0].success)
    const uptime = total > 0 ? (success / total * 100).toFixed(1) : '0.0'

    // 計算平均回應時間
    const perfResult = await pool.query(`
      SELECT AVG(duration) as avg_duration
      FROM execution_logs
      WHERE created_at >= NOW() - INTERVAL '1 hour'
        AND status = 'completed'
    `)

    const avgDuration = perfResult.rows[0].avg_duration
      ? parseInt(perfResult.rows[0].avg_duration)
      : 0

    // 計算錯誤率
    const errorRate = total > 0 ? ((total - success) / total).toFixed(2) : '0.00'

    return {
      status: parseFloat(errorRate) < 0.05 ? 'healthy' : 'degraded',
      uptime: uptime + '%',
      avg_response_time: avgDuration,
      error_rate: parseFloat(errorRate)
    }
  }
}
```

**檢查點**:
- [ ] SQL 查詢正確無誤
- [ ] 資料聚合邏輯正確
- [ ] 效能可接受 (查詢時間 < 1 秒)

---

### Step 4: 實作告警服務

**位置**: `backend/src/services/admin/alerts.service.ts`

```typescript
import { pool } from '../../db'

interface Alert {
  type: string
  severity: 'info' | 'warning' | 'error'
  message: string
  data?: any
}

export class AlertsService {
  async getActiveAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = []

    // 檢查成本異常
    const costAlert = await this.checkCostAnomaly()
    if (costAlert) alerts.push(costAlert)

    // 檢查失敗率異常
    const failureAlert = await this.checkFailureRate()
    if (failureAlert) alerts.push(failureAlert)

    // 檢查高成本用戶
    const highCostUsers = await this.checkHighCostUsers()
    alerts.push(...highCostUsers)

    return alerts
  }

  private async checkCostAnomaly(): Promise<Alert | null> {
    // 取得今日成本
    const todayResult = await pool.query(`
      SELECT COALESCE(SUM(total_cost), 0) as cost
      FROM cost_tracking
      WHERE DATE(created_at) = CURRENT_DATE
    `)
    const todayCost = parseFloat(todayResult.rows[0].cost)

    // 取得過去 7 天平均成本
    const avgResult = await pool.query(`
      SELECT AVG(daily_cost) as avg_cost
      FROM (
        SELECT DATE(created_at) as date, SUM(total_cost) as daily_cost
        FROM cost_tracking
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          AND DATE(created_at) < CURRENT_DATE
        GROUP BY DATE(created_at)
      ) daily_costs
    `)
    const avgCost = parseFloat(avgResult.rows[0].avg_cost) || 0

    // 如果今日成本超過平均值 50%,發出告警
    if (avgCost > 0 && todayCost > avgCost * 1.5) {
      const percentage = ((todayCost / avgCost - 1) * 100).toFixed(0)
      return {
        type: 'high_cost',
        severity: 'warning',
        message: `今日成本已超過平均值 ${percentage}%`,
        data: { today_cost: todayCost, avg_cost: avgCost }
      }
    }

    return null
  }

  private async checkFailureRate(): Promise<Alert | null> {
    // 檢查過去 1 小時的失敗率
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM execution_logs
      WHERE created_at >= NOW() - INTERVAL '1 hour'
    `)

    const total = parseInt(result.rows[0].total)
    const failed = parseInt(result.rows[0].failed)

    if (total === 0) return null

    const failureRate = failed / total

    // 如果失敗率超過 5%,發出告警
    if (failureRate > 0.05) {
      return {
        type: 'high_failure_rate',
        severity: 'error',
        message: `過去 1 小時失敗率 ${(failureRate * 100).toFixed(1)}%`,
        data: { total, failed, failure_rate: failureRate }
      }
    }

    return null
  }

  private async checkHighCostUsers(): Promise<Alert[]> {
    // 查詢本月成本超過 $100 的用戶
    const result = await pool.query(`
      SELECT
        user_id,
        SUM(total_cost) as total_cost
      FROM cost_tracking
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY user_id
      HAVING SUM(total_cost) > 100
      ORDER BY total_cost DESC
      LIMIT 5
    `)

    return result.rows.map(row => ({
      type: 'high_cost_user',
      severity: 'warning' as const,
      message: `用戶 ${row.user_id} 本月成本 $${parseFloat(row.total_cost).toFixed(2)}`,
      data: { user_id: row.user_id, total_cost: parseFloat(row.total_cost) }
    }))
  }
}
```

**檢查點**:
- [ ] 告警邏輯正確
- [ ] 閾值設定合理
- [ ] 資料查詢效能可接受

---

### Step 5: 建立前端 Dashboard 頁面

**位置**: `frontend/pages/admin/index.tsx`

```typescript
import { GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import DashboardStats from '../../components/admin/DashboardStats'
import TrendChart from '../../components/admin/TrendChart'
import AlertList from '../../components/admin/AlertList'
import SystemHealth from '../../components/admin/SystemHealth'
import { fetchDashboardData } from '../../lib/admin-api'

interface DashboardData {
  realtime: {
    today: Stats
    month: Stats
  }
  trends: {
    cost: Array<{ date: string; amount: number }>
    videos: Array<{ date: string; count: number }>
    users: Array<{ date: string; count: number }>
  }
  alerts: Array<Alert>
  system_health: SystemHealth
}

export default function AdminDashboard({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData)
  const [loading, setLoading] = useState(false)

  // 每 30 秒自動重新整理
  useEffect(() => {
    const interval = setInterval(async () => {
      setLoading(true)
      try {
        const newData = await fetchDashboardData()
        setData(newData)
      } catch (error) {
        console.error('Failed to refresh dashboard:', error)
      } finally {
        setLoading(false)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">CheapCut 管理後台</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計卡片 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">今日概況</h2>
          <DashboardStats stats={data.realtime.today} />
        </div>

        {/* 趨勢圖表 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">成本趨勢 (過去 30 天)</h2>
          <TrendChart data={data.trends.cost} dataKey="amount" color="#3b82f6" />
        </div>

        {/* 告警列表 */}
        {data.alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">⚠️ 異常告警</h2>
            <AlertList alerts={data.alerts} />
          </div>
        )}

        {/* 系統健康狀態 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">系統健康狀態</h2>
          <SystemHealth health={data.system_health} />
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // 從 cookie 取得管理員 token
    const token = context.req.cookies.admin_token

    if (!token) {
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false
        }
      }
    }

    const data = await fetchDashboardData(token)

    return {
      props: {
        initialData: data
      }
    }
  } catch (error) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false
      }
    }
  }
}
```

**檢查點**:
- [ ] 頁面可正常顯示
- [ ] 資料自動重新整理
- [ ] 權限驗證正確

---

### Step 6: 建立前端組件

**位置**: `frontend/components/admin/DashboardStats.tsx`

```typescript
interface Stats {
  total_cost: number
  videos_generated: number
  active_users: number
  failed_tasks: number
}

export default function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="總成本"
        value={`$${stats.total_cost.toFixed(2)}`}
        icon="💰"
      />
      <StatCard
        title="生成影片"
        value={stats.videos_generated.toString()}
        icon="🎬"
      />
      <StatCard
        title="活躍用戶"
        value={stats.active_users.toString()}
        icon="👥"
      />
      <StatCard
        title="失敗任務"
        value={stats.failed_tasks.toString()}
        icon="❌"
      />
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
```

**位置**: `frontend/components/admin/TrendChart.tsx`

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TrendChartProps {
  data: Array<{ date: string; amount?: number; count?: number }>
  dataKey: 'amount' | 'count'
  color: string
}

export default function TrendChart({ data, dataKey, color }: TrendChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**位置**: `frontend/components/admin/AlertList.tsx`

```typescript
interface Alert {
  type: string
  severity: 'info' | 'warning' | 'error'
  message: string
}

export default function AlertList({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="bg-white rounded-lg shadow">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`p-4 border-l-4 ${getSeverityColor(alert.severity)} ${
            index !== alerts.length - 1 ? 'border-b' : ''
          }`}
        >
          <p className="font-medium">{alert.message}</p>
        </div>
      ))}
    </div>
  )
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'error':
      return 'border-red-500 bg-red-50'
    case 'warning':
      return 'border-yellow-500 bg-yellow-50'
    case 'info':
      return 'border-blue-500 bg-blue-50'
    default:
      return 'border-gray-500 bg-gray-50'
  }
}
```

**檢查點**:
- [ ] 所有組件可正常顯示
- [ ] 響應式設計正常
- [ ] 樣式符合需求

---

### Step 7: 建立 API 呼叫封裝

**位置**: `frontend/lib/admin-api.ts`

```typescript
export async function fetchDashboardData(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
    headers,
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }

  return response.json()
}
```

**檢查點**:
- [ ] API 呼叫正確
- [ ] 錯誤處理完善

---

## ✅ 驗收標準

### 功能驗收

- [ ] **即時統計正確**
  - [ ] 今日成本計算正確
  - [ ] 影片數量正確
  - [ ] 活躍用戶數正確
  - [ ] 失敗任務數正確

- [ ] **趨勢圖表正常**
  - [ ] 成本趨勢圖正確顯示
  - [ ] 資料點正確
  - [ ] 時間軸正確

- [ ] **告警功能正常**
  - [ ] 成本異常告警正確觸發
  - [ ] 失敗率告警正確觸發
  - [ ] 高成本用戶告警正確顯示

- [ ] **系統健康狀態正確**
  - [ ] Uptime 計算正確
  - [ ] 平均回應時間正確
  - [ ] 錯誤率正確

- [ ] **權限控制正常**
  - [ ] 未登入無法存取
  - [ ] 非管理員無法存取
  - [ ] 不同角色權限正確

### 效能驗收

- [ ] Dashboard API 回應時間 < 2 秒
- [ ] 前端頁面載入時間 < 3 秒
- [ ] 自動重新整理不影響使用體驗

### 安全性驗收

- [ ] JWT Token 驗證正確
- [ ] 權限檢查無漏洞
- [ ] SQL Injection 防護
- [ ] XSS 防護

---

## 🐛 常見問題

### 問題 1: API 回傳 401 Unauthorized

**原因**: JWT Token 無效或過期

**解決方案**:
```typescript
// 檢查 token 是否正確設定
console.log('Token:', req.headers.authorization)

// 檢查 token 是否過期
const decoded = jwt.decode(token)
console.log('Token expires at:', new Date(decoded.exp * 1000))
```

---

### 問題 2: 趨勢圖表顯示不出來

**原因**: 資料格式不符合 Recharts 要求

**解決方案**:
```typescript
// 檢查資料格式
console.log('Chart data:', data.trends.cost)

// 確保資料格式正確
// ✅ 正確格式
[{ date: '2025-10-01', amount: 38.90 }]

// ❌ 錯誤格式
[{ date: Date, amount: '38.90' }]  // date 應該是字串, amount 應該是數字
```

---

### 問題 3: SQL 查詢效能太慢

**原因**: 缺少索引

**解決方案**:
```sql
-- 為常用查詢欄位建立索引
CREATE INDEX idx_cost_tracking_created_at ON cost_tracking(created_at);
CREATE INDEX idx_execution_logs_created_at ON execution_logs(created_at);
CREATE INDEX idx_execution_logs_status ON execution_logs(status);
```

---

### 問題 4: 告警一直顯示

**原因**: 告警狀態沒有正確管理

**解決方案**:
```typescript
// 可以加入告警狀態管理
// 例如:已讀/未讀、已處理/未處理
// 或是設定告警有效期限
```

---

## 📚 相關資源

### 官方文件
- [Next.js Data Fetching](https://nextjs.org/docs/basic-features/data-fetching)
- [Recharts Documentation](https://recharts.org/en-US/api)
- [PostgreSQL Date/Time Functions](https://www.postgresql.org/docs/current/functions-datetime.html)

### 參考範例
- [Admin Dashboard Examples](https://tailwindui.com/components/application-ui/application-shells/stacked)

---

## 🔄 更新記錄

| 日期 | 更新內容 | 更新者 |
|------|---------|--------|
| 2025-10-07 | 建立文件 | Claude |
