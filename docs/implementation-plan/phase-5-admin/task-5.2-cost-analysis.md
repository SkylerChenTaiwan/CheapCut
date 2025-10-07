# Task 5.2: 成本分析模組

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 5.2 |
| **Task 名稱** | 成本分析模組 |
| **所屬 Phase** | Phase 5: 管理後台開發 |
| **預估時間** | 5-6 小時 (API 2.5h + 前端 3h + 整合測試 1h) |
| **難度** | ⭐⭐⭐ 中高 |
| **前置 Task** | Task 1.6 (成本與效能追蹤服務) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息 (90% 的問題都會告訴你原因)

**API 或前端報錯?** 別慌張,按照這個順序處理:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot read property 'breakdown_by_service' of undefined
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 這是關鍵錯誤訊息
   ```

2. **判斷錯誤類型**
   - `Cannot read property of undefined` → API 回傳資料結構不符
   - `401 Unauthorized` → 權限驗證失敗
   - `500 Internal Server Error` → 後端 SQL 或邏輯錯誤
   - `數字顯示 NaN` → 資料類型轉換問題

3. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 上網搜尋 (有技巧的查資料)

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"成本分析錯誤"  ← 太模糊
"圖表顯示不對" ← 沒有具體錯誤訊息
```

**✅ 好的搜尋方式**:
```
"PostgreSQL GROUP BY with SUM aggregate" ← 具體的 SQL 問題
"React pie chart percentage calculation" ← 具體的技術問題
"JavaScript toFixed not a function" ← 資料類型問題
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件** (最準確)
- PostgreSQL Aggregate Functions: https://www.postgresql.org/docs/current/functions-aggregate.html
- Recharts: https://recharts.org/

**優先順序 2: Stack Overflow** (有具體解答)
- 搜尋時加上 `site:stackoverflow.com`

---

### Step 3: 檢查環境設定

```bash
# 檢查後端 API 是否正常運作
curl http://localhost:8000/api/admin/cost/summary?period=monthly

# 檢查前端是否能連線到後端
# 查看瀏覽器 Console 的 Network tab
```

---

## 🎯 Task 目標

建立管理後台的成本分析模組,提供:
- 成本報表 (按時間/服務/功能分類)
- Prompt 成本分析
- 成本預測
- 高成本用戶排名

---

## 📁 檔案結構

```
backend/
├── src/
│   ├── routes/
│   │   └── admin/
│   │       └── cost.ts              # 成本分析 API 路由
│   └── services/
│       └── admin/
│           ├── cost.service.ts      # 成本分析服務
│           └── forecast.service.ts  # 成本預測服務

frontend/
├── pages/
│   └── admin/
│       └── cost.tsx                 # 成本分析頁面
├── components/
│   └── admin/
│       ├── CostSummary.tsx          # 成本總覽組件
│       ├── CostBreakdown.tsx        # 成本分類組件
│       ├── PromptCostTable.tsx      # Prompt 成本表格
│       ├── TopUsersTable.tsx        # 高成本用戶表格
│       └── CostForecast.tsx         # 成本預測組件
```

---

## 📝 實作步驟

### Step 1: 建立成本分析 API 路由

**位置**: `backend/src/routes/admin/cost.ts`

```typescript
import express from 'express'
import { requireAdminAuth, requirePermission } from '../../middleware/adminAuth'
import { CostService } from '../../services/admin/cost.service'
import { ForecastService } from '../../services/admin/forecast.service'

const router = express.Router()
const costService = new CostService()
const forecastService = new ForecastService()

// GET /api/admin/cost/summary?period=monthly
router.get('/summary',
  requireAdminAuth,
  requirePermission('cost:view'),
  async (req, res) => {
    try {
      const period = req.query.period as string || 'monthly'

      const summary = await costService.getSummary(period)

      res.json(summary)
    } catch (error) {
      console.error('Cost summary API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/admin/cost/prompts?period=monthly
router.get('/prompts',
  requireAdminAuth,
  requirePermission('cost:view'),
  async (req, res) => {
    try {
      const period = req.query.period as string || 'monthly'

      const prompts = await costService.getPromptCosts(period)

      res.json({ prompts })
    } catch (error) {
      console.error('Prompt costs API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/admin/cost/forecast
router.get('/forecast',
  requireAdminAuth,
  requirePermission('cost:view'),
  async (req, res) => {
    try {
      const forecast = await forecastService.getForecast()

      res.json(forecast)
    } catch (error) {
      console.error('Cost forecast API error:', error)
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

### Step 2: 實作成本分析服務

**位置**: `backend/src/services/admin/cost.service.ts`

```typescript
import { pool } from '../../db'

export class CostService {
  // 取得成本總覽
  async getSummary(period: string) {
    const timeCondition = this.getTimeCondition(period)

    // 總成本
    const totalResult = await pool.query(`
      SELECT COALESCE(SUM(total_cost), 0) as total_cost
      FROM cost_tracking
      WHERE ${timeCondition}
    `)
    const totalCost = parseFloat(totalResult.rows[0].total_cost)

    // 按服務分類
    const serviceBreakdown = await this.getBreakdownByService(timeCondition)

    // 按任務類型分類
    const taskTypeBreakdown = await this.getBreakdownByTaskType(timeCondition)

    // 高成本用戶 Top 10
    const topUsers = await this.getTopUsers(timeCondition, 10)

    return {
      total_cost: totalCost,
      breakdown_by_service: serviceBreakdown,
      breakdown_by_task_type: taskTypeBreakdown,
      top_users: topUsers
    }
  }

  // 按服務分類
  private async getBreakdownByService(timeCondition: string) {
    const result = await pool.query(`
      SELECT
        service_name,
        SUM(cost) as cost
      FROM cost_tracking
      WHERE ${timeCondition}
      GROUP BY service_name
      ORDER BY cost DESC
    `)

    const total = result.rows.reduce((sum, row) => sum + parseFloat(row.cost), 0)

    return result.rows.map(row => {
      const cost = parseFloat(row.cost)
      return {
        service: row.service_name,
        cost: cost,
        percentage: total > 0 ? Math.round((cost / total) * 100) : 0
      }
    })
  }

  // 按任務類型分類
  private async getBreakdownByTaskType(timeCondition: string) {
    const result = await pool.query(`
      SELECT
        el.task_type,
        SUM(ct.total_cost) as cost
      FROM cost_tracking ct
      JOIN execution_logs el ON ct.execution_id = el.execution_id
      WHERE ${timeCondition.replace('ct.', '')}
      GROUP BY el.task_type
      ORDER BY cost DESC
    `)

    const total = result.rows.reduce((sum, row) => sum + parseFloat(row.cost), 0)

    return result.rows.map(row => {
      const cost = parseFloat(row.cost)
      return {
        type: row.task_type,
        cost: cost,
        percentage: total > 0 ? Math.round((cost / total) * 100) : 0
      }
    })
  }

  // 高成本用戶排名
  private async getTopUsers(timeCondition: string, limit: number) {
    const result = await pool.query(`
      SELECT
        ct.user_id,
        SUM(ct.total_cost) as cost,
        COUNT(DISTINCT v.id) as videos_count
      FROM cost_tracking ct
      LEFT JOIN videos v ON ct.user_id = v.user_id
        AND ${timeCondition.replace('ct.created_at', 'v.created_at')}
      WHERE ${timeCondition}
      GROUP BY ct.user_id
      ORDER BY cost DESC
      LIMIT $1
    `, [limit])

    return result.rows.map(row => ({
      user_id: row.user_id,
      cost: parseFloat(row.cost),
      videos_count: parseInt(row.videos_count)
    }))
  }

  // 取得 Prompt 成本分析
  async getPromptCosts(period: string) {
    const timeCondition = this.getTimeCondition(period)

    const result = await pool.query(`
      SELECT
        prompt_name,
        prompt_category as category,
        SUM(cost) as total_cost,
        AVG(cost) as avg_cost,
        COUNT(*) as calls_count,
        SUM(input_tokens + output_tokens) as total_tokens
      FROM cost_tracking
      WHERE ${timeCondition}
        AND prompt_name IS NOT NULL
      GROUP BY prompt_name, prompt_category
      ORDER BY total_cost DESC
    `)

    return result.rows.map(row => ({
      prompt_name: row.prompt_name,
      category: row.category,
      total_cost: parseFloat(row.total_cost),
      avg_cost: parseFloat(row.avg_cost),
      calls_count: parseInt(row.calls_count),
      total_tokens: parseInt(row.total_tokens)
    }))
  }

  // 時間條件轉換
  private getTimeCondition(period: string): string {
    switch (period) {
      case 'today':
        return "DATE(created_at) = CURRENT_DATE"
      case 'weekly':
        return "created_at >= CURRENT_DATE - INTERVAL '7 days'"
      case 'monthly':
        return "DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
      case 'yearly':
        return "DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)"
      default:
        return "DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    }
  }
}
```

**檢查點**:
- [ ] SQL 查詢正確無誤
- [ ] 資料聚合邏輯正確
- [ ] 百分比計算正確
- [ ] 效能可接受 (查詢時間 < 2 秒)

---

### Step 3: 實作成本預測服務

**位置**: `backend/src/services/admin/forecast.service.ts`

```typescript
import { pool } from '../../db'

export class ForecastService {
  async getForecast() {
    // 取得本月至今成本
    const monthToDateResult = await pool.query(`
      SELECT COALESCE(SUM(total_cost), 0) as cost
      FROM cost_tracking
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `)
    const currentMonthToDate = parseFloat(monthToDateResult.rows[0].cost)

    // 計算經過的天數
    const now = new Date()
    const daysElapsed = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = daysInMonth - daysElapsed

    // 簡單線性預測
    const projectedTotal = currentMonthToDate * (daysInMonth / daysElapsed)

    // 從設定中取得預算 (這裡先寫死,實際應該從資料庫讀取)
    const budget = 2000

    // 計算預算狀態
    let budgetStatus: 'under_budget' | 'on_track' | 'over_budget'
    let alert: string | undefined

    if (projectedTotal < budget * 0.8) {
      budgetStatus = 'under_budget'
    } else if (projectedTotal <= budget) {
      budgetStatus = 'on_track'
    } else {
      budgetStatus = 'over_budget'
      const overAmount = projectedTotal - budget
      const percentage = Math.round((overAmount / budget) * 100)
      alert = `預計超出預算 $${overAmount.toFixed(2)} (${percentage}%)`
    }

    return {
      current_month_to_date: currentMonthToDate,
      days_elapsed: daysElapsed,
      days_remaining: daysRemaining,
      projected_total: projectedTotal,
      budget: budget,
      budget_status: budgetStatus,
      alert: alert
    }
  }
}
```

**檢查點**:
- [ ] 預測邏輯正確
- [ ] 天數計算正確
- [ ] 預算狀態判斷正確

---

### Step 4: 建立前端成本分析頁面

**位置**: `frontend/pages/admin/cost.tsx`

```typescript
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import CostSummary from '../../components/admin/CostSummary'
import CostBreakdown from '../../components/admin/CostBreakdown'
import PromptCostTable from '../../components/admin/PromptCostTable'
import TopUsersTable from '../../components/admin/TopUsersTable'
import CostForecast from '../../components/admin/CostForecast'
import { fetchCostSummary, fetchPromptCosts, fetchCostForecast } from '../../lib/admin-api'

interface CostData {
  summary: {
    total_cost: number
    breakdown_by_service: Array<{ service: string; cost: number; percentage: number }>
    breakdown_by_task_type: Array<{ type: string; cost: number; percentage: number }>
    top_users: Array<{ user_id: string; cost: number; videos_count: number }>
  }
  prompts: Array<{
    prompt_name: string
    category: string
    total_cost: number
    avg_cost: number
    calls_count: number
    total_tokens: number
  }>
  forecast: {
    current_month_to_date: number
    days_elapsed: number
    days_remaining: number
    projected_total: number
    budget: number
    budget_status: string
    alert?: string
  }
}

export default function CostAnalysis({ initialData }: { initialData: CostData }) {
  const [data, setData] = useState<CostData>(initialData)
  const [period, setPeriod] = useState('monthly')
  const [loading, setLoading] = useState(false)

  const handlePeriodChange = async (newPeriod: string) => {
    setPeriod(newPeriod)
    setLoading(true)

    try {
      const [summary, prompts] = await Promise.all([
        fetchCostSummary(newPeriod),
        fetchPromptCosts(newPeriod)
      ])

      setData({
        ...data,
        summary,
        prompts: prompts.prompts
      })
    } catch (error) {
      console.error('Failed to fetch cost data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">成本分析</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 篩選器 */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-sm font-medium">時間範圍:</label>
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            disabled={loading}
          >
            <option value="today">今日</option>
            <option value="weekly">本週</option>
            <option value="monthly">本月</option>
            <option value="yearly">本年</option>
          </select>
        </div>

        {/* 成本總覽與預測 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CostSummary summary={data.summary} />
          <CostForecast forecast={data.forecast} />
        </div>

        {/* 成本分類 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">成本分類</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CostBreakdown
              title="按服務分類"
              data={data.summary.breakdown_by_service}
              labelKey="service"
            />
            <CostBreakdown
              title="按功能分類"
              data={data.summary.breakdown_by_task_type}
              labelKey="type"
            />
          </div>
        </div>

        {/* Prompt 成本排名 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Prompt 成本排名 (Top 10)</h2>
          <PromptCostTable prompts={data.prompts.slice(0, 10)} />
        </div>

        {/* 高成本用戶 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">高成本用戶 (Top 10)</h2>
          <TopUsersTable users={data.summary.top_users} />
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const token = context.req.cookies.admin_token

    if (!token) {
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false
        }
      }
    }

    const [summary, prompts, forecast] = await Promise.all([
      fetchCostSummary('monthly', token),
      fetchPromptCosts('monthly', token),
      fetchCostForecast(token)
    ])

    return {
      props: {
        initialData: {
          summary,
          prompts: prompts.prompts,
          forecast
        }
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
- [ ] 篩選器功能正常
- [ ] 資料正確呈現

---

### Step 5: 建立前端組件

**位置**: `frontend/components/admin/CostSummary.tsx`

```typescript
interface CostSummaryProps {
  summary: {
    total_cost: number
    breakdown_by_service: Array<{ service: string; cost: number; percentage: number }>
    breakdown_by_task_type: Array<{ type: string; cost: number; percentage: number }>
    top_users: Array<{ user_id: string; cost: number; videos_count: number }>
  }
}

export default function CostSummary({ summary }: CostSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">成本總覽</h3>
      <div className="text-4xl font-bold mb-2">
        ${summary.total_cost.toFixed(2)}
      </div>
      <p className="text-gray-600">總成本</p>
    </div>
  )
}
```

**位置**: `frontend/components/admin/CostBreakdown.tsx`

```typescript
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CostBreakdownProps {
  title: string
  data: Array<{ [key: string]: any; cost: number; percentage: number }>
  labelKey: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function CostBreakdown({ title, data, labelKey }: CostBreakdownProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="percentage"
            nameKey={labelKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={(entry) => `${entry.percentage}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">{item[labelKey]}</span>
            </div>
            <div className="text-sm font-medium">
              ${item.cost.toFixed(2)} ({item.percentage}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**位置**: `frontend/components/admin/PromptCostTable.tsx`

```typescript
interface Prompt {
  prompt_name: string
  category: string
  total_cost: number
  avg_cost: number
  calls_count: number
  total_tokens: number
}

interface PromptCostTableProps {
  prompts: Prompt[]
}

export default function PromptCostTable({ prompts }: PromptCostTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Prompt 名稱
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              類別
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              總成本
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              平均成本
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              呼叫次數
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              總 Token 數
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prompts.map((prompt, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {prompt.prompt_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prompt.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                ${prompt.total_cost.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                ${prompt.avg_cost.toFixed(4)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {prompt.calls_count.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {prompt.total_tokens.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**位置**: `frontend/components/admin/TopUsersTable.tsx`

```typescript
interface User {
  user_id: string
  cost: number
  videos_count: number
}

interface TopUsersTableProps {
  users: User[]
}

export default function TopUsersTable({ users }: TopUsersTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              用戶 ID
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              總成本
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              影片數量
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {user.user_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                ${user.cost.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {user.videos_count} 支
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <button className="text-blue-600 hover:text-blue-800">
                  查看詳情
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**位置**: `frontend/components/admin/CostForecast.tsx`

```typescript
interface CostForecastProps {
  forecast: {
    current_month_to_date: number
    days_elapsed: number
    days_remaining: number
    projected_total: number
    budget: number
    budget_status: string
    alert?: string
  }
}

export default function CostForecast({ forecast }: CostForecastProps) {
  const usagePercentage = (forecast.current_month_to_date / forecast.budget) * 100

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">成本預測</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">本月至今</span>
            <span className="text-sm font-medium">
              ${forecast.current_month_to_date.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                forecast.budget_status === 'over_budget'
                  ? 'bg-red-500'
                  : forecast.budget_status === 'on_track'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">預算</span>
          <span className="text-sm font-medium">${forecast.budget.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">預測總額</span>
          <span className="text-sm font-medium text-blue-600">
            ${forecast.projected_total.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">剩餘天數</span>
          <span className="text-sm font-medium">{forecast.days_remaining} 天</span>
        </div>

        {forecast.alert && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{forecast.alert}</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

**檢查點**:
- [ ] 所有組件可正常顯示
- [ ] 圖表正確呈現
- [ ] 數字格式化正確
- [ ] 響應式設計正常

---

### Step 6: 更新 API 呼叫封裝

**位置**: `frontend/lib/admin-api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchWithAuth(url: string, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    headers,
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchCostSummary(period: string, token?: string) {
  return fetchWithAuth(`${API_URL}/api/admin/cost/summary?period=${period}`, token)
}

export async function fetchPromptCosts(period: string, token?: string) {
  return fetchWithAuth(`${API_URL}/api/admin/cost/prompts?period=${period}`, token)
}

export async function fetchCostForecast(token?: string) {
  return fetchWithAuth(`${API_URL}/api/admin/cost/forecast`, token)
}
```

**檢查點**:
- [ ] API 呼叫正確
- [ ] Token 處理正確
- [ ] 錯誤處理完善

---

## ✅ 驗收標準

### 功能驗收

- [ ] **成本總覽正確**
  - [ ] 總成本計算正確
  - [ ] 按服務分類正確
  - [ ] 按功能分類正確
  - [ ] 百分比計算正確

- [ ] **Prompt 成本分析正確**
  - [ ] 成本排名正確
  - [ ] 呼叫次數統計正確
  - [ ] 平均成本計算正確
  - [ ] Token 統計正確

- [ ] **成本預測正確**
  - [ ] 預測金額合理
  - [ ] 預算狀態判斷正確
  - [ ] 告警正確觸發

- [ ] **高成本用戶正確**
  - [ ] 用戶排名正確
  - [ ] 成本統計正確
  - [ ] 影片數量正確

- [ ] **篩選功能正常**
  - [ ] 時間範圍篩選正確
  - [ ] 資料正確更新

### 效能驗收

- [ ] API 回應時間 < 2 秒
- [ ] 前端頁面載入時間 < 3 秒
- [ ] 圖表渲染流暢

### UI/UX 驗收

- [ ] 響應式設計正常
- [ ] 圖表清晰易讀
- [ ] 數字格式化正確 (千分位、小數點)
- [ ] Loading 狀態顯示

---

## 🐛 常見問題

### 問題 1: 百分比加總不等於 100%

**原因**: 四捨五入導致

**解決方案**:
```typescript
// 調整最大項目的百分比
function adjustPercentages(items: Array<{ percentage: number }>) {
  const total = items.reduce((sum, item) => sum + item.percentage, 0)
  if (total !== 100 && items.length > 0) {
    items[0].percentage += (100 - total)
  }
  return items
}
```

---

### 問題 2: 成本數字顯示為 NaN

**原因**: 資料類型轉換問題

**解決方案**:
```typescript
// 確保從 SQL 取得的數字正確轉換
const cost = parseFloat(row.cost) || 0  // 加上預設值 0
```

---

### 問題 3: Pie Chart 顯示不出來

**原因**: 資料格式不符合 Recharts 要求

**解決方案**:
```typescript
// 檢查資料格式
console.log('Pie chart data:', data)

// 確保資料格式正確
// ✅ 正確格式
[{ service: 'openai', cost: 678.90, percentage: 55 }]

// ❌ 錯誤格式
[{ service: 'openai', cost: '678.90', percentage: '55' }]  // 數字不應該是字串
```

---

### 問題 4: 預測金額明顯不合理

**原因**: 簡單線性預測在月初或月末不準確

**解決方案**:
```typescript
// 可以改用更複雜的預測方法
// 例如:取過去 3 個月的平均值,或使用移動平均
```

---

## 📚 相關資源

### 官方文件
- [PostgreSQL Aggregate Functions](https://www.postgresql.org/docs/current/functions-aggregate.html)
- [Recharts PieChart](https://recharts.org/en-US/api/PieChart)
- [React Table](https://react-table-v7.tanstack.com/)

### 參考範例
- [Cost Dashboard Examples](https://tailwindui.com/components/application-ui/lists/tables)

---

## 🔄 更新記錄

| 日期 | 更新內容 | 更新者 |
|------|---------|--------|
| 2025-10-07 | 建立文件 | Claude |
