# Task 5.3: 效能監控模組

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 5.3 |
| **Task 名稱** | 效能監控模組 |
| **所屬 Phase** | Phase 5: 管理後台開發 |
| **預估時間** | 4-5 小時 (API 2h + 前端 2.5h + 整合測試 0.5h) |
| **難度** | ⭐⭐⭐ 中高 |
| **前置 Task** | Task 1.6 (成本與效能追蹤服務) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息 (90% 的問題都會告訴你原因)

**API 或前端報錯?** 別慌張,按照這個順序處理:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot calculate percentile from undefined array
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 這是關鍵錯誤訊息
   ```

2. **判斷錯誤類型**
   - `Cannot calculate percentile` → 統計計算問題
   - `Division by zero` → 除數為 0
   - `Array is empty` → 沒有資料可計算
   - `Invalid duration value` → 資料格式錯誤

3. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 上網搜尋 (有技巧的查資料)

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"效能監控錯誤"  ← 太模糊
"數字不對" ← 沒有具體錯誤訊息
```

**✅ 好的搜尋方式**:
```
"PostgreSQL percentile_cont function" ← 具體的 SQL 函數
"JavaScript calculate p95 percentile" ← 具體的統計問題
"React chart performance optimization" ← 效能問題
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件** (最準確)
- PostgreSQL Aggregate Functions: https://www.postgresql.org/docs/current/functions-aggregate.html
- Recharts Performance: https://recharts.org/

**優先順序 2: Stack Overflow** (有具體解答)
- 搜尋時加上 `site:stackoverflow.com`

---

### Step 3: 檢查環境設定

```bash
# 檢查後端 API 是否正常運作
curl http://localhost:8000/api/admin/performance/summary?period=weekly

# 檢查資料是否存在
# 查看瀏覽器 Console 的 Network tab
```

---

## 🎯 Task 目標

建立管理後台的效能監控模組,提供:
- 任務效能分析 (平均耗時、P95/P99)
- 瓶頸分析 (哪個步驟最慢)
- Prompt 效能分析
- 效能趨勢分析

---

## 📁 檔案結構

```
backend/
├── src/
│   ├── routes/
│   │   └── admin/
│   │       └── performance.ts           # 效能監控 API 路由
│   └── services/
│       └── admin/
│           └── performance.service.ts   # 效能分析服務

frontend/
├── pages/
│   └── admin/
│       └── performance.tsx              # 效能監控頁面
├── components/
│   └── admin/
│       ├── PerformanceSummary.tsx       # 效能總覽組件
│       ├── TaskPerformanceTable.tsx     # 任務效能表格
│       ├── BottleneckChart.tsx          # 瓶頸分析圖表
│       ├── PromptPerformanceTable.tsx   # Prompt 效能表格
│       └── PerformanceTrend.tsx         # 效能趨勢圖表
```

---

## 📝 實作步驟

### Step 1: 建立效能監控 API 路由

**位置**: `backend/src/routes/admin/performance.ts`

```typescript
import express from 'express'
import { requireAdminAuth, requirePermission } from '../../middleware/adminAuth'
import { PerformanceService } from '../../services/admin/performance.service'

const router = express.Router()
const performanceService = new PerformanceService()

// GET /api/admin/performance/summary?period=weekly
router.get('/summary',
  requireAdminAuth,
  requirePermission('performance:view'),
  async (req, res) => {
    try {
      const period = req.query.period as string || 'weekly'

      const summary = await performanceService.getSummary(period)

      res.json(summary)
    } catch (error) {
      console.error('Performance summary API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/admin/performance/trend?period=daily&days=30
router.get('/trend',
  requireAdminAuth,
  requirePermission('performance:view'),
  async (req, res) => {
    try {
      const period = req.query.period as string || 'daily'
      const days = parseInt(req.query.days as string) || 30

      const trend = await performanceService.getTrend(period, days)

      res.json(trend)
    } catch (error) {
      console.error('Performance trend API error:', error)
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

### Step 2: 實作效能分析服務

**位置**: `backend/src/services/admin/performance.service.ts`

```typescript
import { pool } from '../../db'

export class PerformanceService {
  // 取得效能總覽
  async getSummary(period: string) {
    const timeCondition = this.getTimeCondition(period)

    // 按任務類型統計效能
    const byTaskType = await this.getPerformanceByTaskType(timeCondition)

    // 瓶頸分析
    const bottlenecks = await this.getBottlenecks(timeCondition)

    // 最慢的 Prompt
    const slowestPrompts = await this.getSlowestPrompts(timeCondition)

    return {
      by_task_type: byTaskType,
      bottlenecks: bottlenecks,
      slowest_prompts: slowestPrompts
    }
  }

  // 按任務類型統計效能
  private async getPerformanceByTaskType(timeCondition: string) {
    const result = await pool.query(`
      SELECT
        task_type,
        AVG(duration) as avg_duration,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95_duration,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration) as p99_duration,
        MAX(duration) as max_duration,
        COUNT(*) as count
      FROM execution_logs
      WHERE ${timeCondition}
        AND status = 'completed'
        AND duration IS NOT NULL
      GROUP BY task_type
      ORDER BY avg_duration DESC
    `)

    return result.rows.map(row => ({
      task_type: row.task_type,
      avg_duration: parseInt(row.avg_duration),
      p95_duration: parseInt(row.p95_duration),
      p99_duration: parseInt(row.p99_duration),
      max_duration: parseInt(row.max_duration),
      count: parseInt(row.count)
    }))
  }

  // 瓶頸分析
  private async getBottlenecks(timeCondition: string) {
    // 從 execution_steps 表格取得每個步驟的平均耗時
    const result = await pool.query(`
      SELECT
        es.step_name,
        el.task_type,
        AVG(es.duration) as avg_duration,
        AVG(el.duration) as avg_total_duration,
        COUNT(*) as count
      FROM execution_steps es
      JOIN execution_logs el ON es.execution_id = el.execution_id
      WHERE ${timeCondition.replace('created_at', 'el.created_at')}
        AND es.status = 'completed'
        AND es.duration IS NOT NULL
        AND el.duration IS NOT NULL
      GROUP BY es.step_name, el.task_type
      HAVING COUNT(*) >= 10  -- 至少有 10 筆資料才有代表性
      ORDER BY avg_duration DESC
      LIMIT 10
    `)

    return result.rows.map(row => {
      const avgDuration = parseInt(row.avg_duration)
      const avgTotalDuration = parseInt(row.avg_total_duration)
      const percentage = avgTotalDuration > 0
        ? Math.round((avgDuration / avgTotalDuration) * 100)
        : 0

      return {
        step_name: row.step_name,
        task_type: row.task_type,
        avg_duration: avgDuration,
        percentage_of_total: percentage
      }
    })
  }

  // 最慢的 Prompt
  private async getSlowestPrompts(timeCondition: string) {
    const result = await pool.query(`
      SELECT
        prompt_name,
        prompt_category as category,
        AVG(duration) as avg_duration,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95_duration,
        COUNT(*) as calls_count
      FROM performance_tracking
      WHERE ${timeCondition}
        AND prompt_name IS NOT NULL
        AND duration IS NOT NULL
      GROUP BY prompt_name, prompt_category
      HAVING COUNT(*) >= 10
      ORDER BY avg_duration DESC
      LIMIT 10
    `)

    return result.rows.map(row => ({
      prompt_name: row.prompt_name,
      category: row.category,
      avg_duration: parseInt(row.avg_duration),
      p95_duration: parseInt(row.p95_duration),
      calls_count: parseInt(row.calls_count)
    }))
  }

  // 取得效能趨勢
  async getTrend(period: string, days: number) {
    let groupBy: string
    let interval: string

    switch (period) {
      case 'hourly':
        groupBy = "DATE_TRUNC('hour', created_at)"
        interval = `${days} hours`
        break
      case 'daily':
        groupBy = "DATE_TRUNC('day', created_at)"
        interval = `${days} days`
        break
      case 'weekly':
        groupBy = "DATE_TRUNC('week', created_at)"
        interval = `${days} weeks`
        break
      default:
        groupBy = "DATE_TRUNC('day', created_at)"
        interval = `${days} days`
    }

    // 取得趨勢資料
    const trendResult = await pool.query(`
      SELECT
        ${groupBy} as date,
        AVG(duration) as avg_duration
      FROM execution_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
        AND status = 'completed'
        AND duration IS NOT NULL
      GROUP BY ${groupBy}
      ORDER BY date
    `)

    const trend = trendResult.rows.map(row => ({
      date: row.date,
      avg_duration: parseInt(row.avg_duration)
    }))

    // 計算變化百分比 (與前一週/月對比)
    const compareInterval = period === 'weekly' ? '14 weeks' : `${days * 2} days`
    const compareResult = await pool.query(`
      SELECT
        CASE
          WHEN created_at >= CURRENT_DATE - INTERVAL '${interval}' THEN 'current'
          ELSE 'previous'
        END as period,
        AVG(duration) as avg_duration
      FROM execution_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '${compareInterval}'
        AND status = 'completed'
        AND duration IS NOT NULL
      GROUP BY period
    `)

    let changePercentage = 0
    let status: 'improving' | 'stable' | 'degrading' = 'stable'

    if (compareResult.rows.length === 2) {
      const current = parseInt(
        compareResult.rows.find(r => r.period === 'current')?.avg_duration || 0
      )
      const previous = parseInt(
        compareResult.rows.find(r => r.period === 'previous')?.avg_duration || 0
      )

      if (previous > 0) {
        changePercentage = ((current - previous) / previous) * 100

        if (changePercentage < -5) {
          status = 'improving'  // 快了超過 5%
        } else if (changePercentage > 5) {
          status = 'degrading'  // 慢了超過 5%
        }
      }
    }

    return {
      trend,
      change_percentage: parseFloat(changePercentage.toFixed(1)),
      status
    }
  }

  // 時間條件轉換
  private getTimeCondition(period: string): string {
    switch (period) {
      case 'today':
        return "DATE(created_at) = CURRENT_DATE"
      case 'weekly':
        return "created_at >= CURRENT_DATE - INTERVAL '7 days'"
      case 'monthly':
        return "created_at >= CURRENT_DATE - INTERVAL '30 days'"
      default:
        return "created_at >= CURRENT_DATE - INTERVAL '7 days'"
    }
  }
}
```

**檢查點**:
- [ ] SQL 查詢正確無誤
- [ ] 百分位數計算正確
- [ ] 資料聚合邏輯正確
- [ ] 效能可接受 (查詢時間 < 2 秒)

---

### Step 3: 建立前端效能監控頁面

**位置**: `frontend/pages/admin/performance.tsx`

```typescript
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import PerformanceSummary from '../../components/admin/PerformanceSummary'
import TaskPerformanceTable from '../../components/admin/TaskPerformanceTable'
import BottleneckChart from '../../components/admin/BottleneckChart'
import PromptPerformanceTable from '../../components/admin/PromptPerformanceTable'
import PerformanceTrend from '../../components/admin/PerformanceTrend'
import { fetchPerformanceSummary, fetchPerformanceTrend } from '../../lib/admin-api'

interface PerformanceData {
  summary: {
    by_task_type: Array<{
      task_type: string
      avg_duration: number
      p95_duration: number
      p99_duration: number
      max_duration: number
      count: number
    }>
    bottlenecks: Array<{
      step_name: string
      task_type: string
      avg_duration: number
      percentage_of_total: number
    }>
    slowest_prompts: Array<{
      prompt_name: string
      category: string
      avg_duration: number
      p95_duration: number
      calls_count: number
    }>
  }
  trend: {
    trend: Array<{ date: string; avg_duration: number }>
    change_percentage: number
    status: string
  }
}

export default function PerformanceMonitor({ initialData }: { initialData: PerformanceData }) {
  const [data, setData] = useState<PerformanceData>(initialData)
  const [period, setPeriod] = useState('weekly')
  const [loading, setLoading] = useState(false)

  const handlePeriodChange = async (newPeriod: string) => {
    setPeriod(newPeriod)
    setLoading(true)

    try {
      const summary = await fetchPerformanceSummary(newPeriod)

      setData({
        ...data,
        summary
      })
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">效能監控</h1>
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
          </select>
        </div>

        {/* 效能總覽 */}
        <div className="mb-8">
          <PerformanceSummary summary={data.summary} />
        </div>

        {/* 效能趨勢 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">效能趨勢</h2>
          <PerformanceTrend trend={data.trend} />
        </div>

        {/* 任務效能統計 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">任務效能統計</h2>
          <TaskPerformanceTable tasks={data.summary.by_task_type} />
        </div>

        {/* 瓶頸分析 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">瓶頸分析 (Top 10 最慢步驟)</h2>
          <BottleneckChart bottlenecks={data.summary.bottlenecks} />
        </div>

        {/* Prompt 效能 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Prompt 效能 (Top 10 最慢)</h2>
          <PromptPerformanceTable prompts={data.summary.slowest_prompts} />
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

    const [summary, trend] = await Promise.all([
      fetchPerformanceSummary('weekly', token),
      fetchPerformanceTrend('daily', 30, token)
    ])

    return {
      props: {
        initialData: {
          summary,
          trend
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

### Step 4: 建立前端組件

**位置**: `frontend/components/admin/PerformanceSummary.tsx`

```typescript
interface PerformanceSummaryProps {
  summary: {
    by_task_type: Array<{
      task_type: string
      avg_duration: number
      count: number
    }>
  }
}

export default function PerformanceSummary({ summary }: PerformanceSummaryProps) {
  // 計算整體平均耗時
  const totalDuration = summary.by_task_type.reduce(
    (sum, task) => sum + task.avg_duration * task.count,
    0
  )
  const totalCount = summary.by_task_type.reduce((sum, task) => sum + task.count, 0)
  const overallAvg = totalCount > 0 ? totalDuration / totalCount : 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">效能總覽</h3>
      <div className="text-4xl font-bold mb-2">
        {(overallAvg / 1000).toFixed(1)}s
      </div>
      <p className="text-gray-600">平均任務耗時</p>
    </div>
  )
}
```

**位置**: `frontend/components/admin/TaskPerformanceTable.tsx`

```typescript
interface Task {
  task_type: string
  avg_duration: number
  p95_duration: number
  p99_duration: number
  max_duration: number
  count: number
}

interface TaskPerformanceTableProps {
  tasks: Task[]
}

export default function TaskPerformanceTable({ tasks }: TaskPerformanceTableProps) {
  function formatDuration(ms: number): string {
    return (ms / 1000).toFixed(1) + 's'
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              任務類型
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              平均耗時
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              P95
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              P99
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              最大耗時
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              數量
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {task.task_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                {formatDuration(task.avg_duration)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {formatDuration(task.p95_duration)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {formatDuration(task.p99_duration)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {formatDuration(task.max_duration)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {task.count.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**位置**: `frontend/components/admin/BottleneckChart.tsx`

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Bottleneck {
  step_name: string
  task_type: string
  avg_duration: number
  percentage_of_total: number
}

interface BottleneckChartProps {
  bottlenecks: Bottleneck[]
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981']

export default function BottleneckChart({ bottlenecks }: BottleneckChartProps) {
  function getColor(percentage: number): string {
    if (percentage >= 70) return COLORS[0]  // 紅色
    if (percentage >= 50) return COLORS[1]  // 黃色
    return COLORS[2]  // 綠色
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={bottlenecks} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" label={{ value: '平均耗時 (秒)', position: 'bottom' }} />
          <YAxis
            type="category"
            dataKey="step_name"
            width={150}
          />
          <Tooltip
            formatter={(value: number) => [(value / 1000).toFixed(1) + 's', '平均耗時']}
            labelFormatter={(label) => `步驟: ${label}`}
          />
          <Bar dataKey="avg_duration">
            {bottlenecks.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.percentage_of_total)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-3">說明</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2" />
            <span>佔任務總時間 ≥ 70% (嚴重瓶頸)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2" />
            <span>佔任務總時間 50-70% (需注意)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2" />
            <span>佔任務總時間 &lt; 50% (正常)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**位置**: `frontend/components/admin/PromptPerformanceTable.tsx`

```typescript
interface Prompt {
  prompt_name: string
  category: string
  avg_duration: number
  p95_duration: number
  calls_count: number
}

interface PromptPerformanceTableProps {
  prompts: Prompt[]
}

export default function PromptPerformanceTable({ prompts }: PromptPerformanceTableProps) {
  function formatDuration(ms: number): string {
    return (ms / 1000).toFixed(2) + 's'
  }

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
              平均耗時
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              P95
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              呼叫次數
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                {formatDuration(prompt.avg_duration)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {formatDuration(prompt.p95_duration)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {prompt.calls_count.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**位置**: `frontend/components/admin/PerformanceTrend.tsx`

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PerformanceTrendProps {
  trend: {
    trend: Array<{ date: string; avg_duration: number }>
    change_percentage: number
    status: string
  }
}

export default function PerformanceTrend({ trend }: PerformanceTrendProps) {
  function getStatusColor(status: string): string {
    switch (status) {
      case 'improving':
        return 'text-green-600'
      case 'degrading':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  function getStatusText(status: string): string {
    switch (status) {
      case 'improving':
        return '效能改善中'
      case 'degrading':
        return '效能下降'
      default:
        return '效能穩定'
    }
  }

  // 轉換資料格式 (毫秒 -> 秒)
  const chartData = trend.trend.map(point => ({
    date: new Date(point.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
    duration: point.avg_duration / 1000  // 轉換為秒
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">平均耗時趨勢</h3>
        <div className={`text-sm font-medium ${getStatusColor(trend.status)}`}>
          {getStatusText(trend.status)}
          {trend.change_percentage !== 0 && (
            <span className="ml-2">
              ({trend.change_percentage > 0 ? '+' : ''}
              {trend.change_percentage.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: '耗時 (秒)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value: number) => [value.toFixed(1) + 's', '平均耗時']} />
          <Line
            type="monotone"
            dataKey="duration"
            stroke={trend.status === 'degrading' ? '#ef4444' : '#3b82f6'}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
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

### Step 5: 更新 API 呼叫封裝

**位置**: `frontend/lib/admin-api.ts` (新增以下函數)

```typescript
export async function fetchPerformanceSummary(period: string, token?: string) {
  return fetchWithAuth(`${API_URL}/api/admin/performance/summary?period=${period}`, token)
}

export async function fetchPerformanceTrend(period: string, days: number, token?: string) {
  return fetchWithAuth(
    `${API_URL}/api/admin/performance/trend?period=${period}&days=${days}`,
    token
  )
}
```

**檢查點**:
- [ ] API 呼叫正確
- [ ] 錯誤處理完善

---

## ✅ 驗收標準

### 功能驗收

- [ ] **任務效能統計正確**
  - [ ] 平均耗時計算正確
  - [ ] P95/P99 百分位數正確
  - [ ] 最大耗時正確
  - [ ] 數量統計正確

- [ ] **瓶頸分析正確**
  - [ ] 步驟耗時統計正確
  - [ ] 百分比計算正確
  - [ ] 瓶頸排序正確

- [ ] **Prompt 效能分析正確**
  - [ ] 耗時統計正確
  - [ ] 排序正確

- [ ] **效能趨勢正確**
  - [ ] 趨勢圖正確顯示
  - [ ] 變化百分比計算正確
  - [ ] 狀態判斷正確

### 效能驗收

- [ ] API 回應時間 < 2 秒
- [ ] 前端頁面載入時間 < 3 秒
- [ ] 圖表渲染流暢

### UI/UX 驗收

- [ ] 響應式設計正常
- [ ] 圖表清晰易讀
- [ ] 數字格式化正確
- [ ] 顏色標示清楚 (紅/黃/綠)

---

## 🐛 常見問題

### 問題 1: P95/P99 計算結果為 NULL

**原因**: PostgreSQL PERCENTILE_CONT 要求資料量足夠

**解決方案**:
```typescript
// 在 SQL 中加上預設值
COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration), 0) as p95_duration
```

---

### 問題 2: 瓶頸百分比超過 100%

**原因**: 計算邏輯錯誤,步驟耗時不應該相加

**解決方案**:
```typescript
// 每個步驟的百分比應該獨立計算
// percentage = (step_duration / total_duration) * 100
// 而不是 sum(step_duration) / total_duration
```

---

### 問題 3: 效能趨勢圖顯示不完整

**原因**: 某些日期沒有資料

**解決方案**:
```typescript
// 可以在前端填補缺失的日期
function fillMissingDates(data: Array<{ date: string; avg_duration: number }>) {
  // 實作日期填補邏輯
}
```

---

### 問題 4: 毫秒轉秒顯示不正確

**原因**: 忘記除以 1000

**解決方案**:
```typescript
// 確保單位轉換正確
function formatDuration(ms: number): string {
  return (ms / 1000).toFixed(1) + 's'  // 除以 1000 並保留 1 位小數
}
```

---

## 📚 相關資源

### 官方文件
- [PostgreSQL PERCENTILE_CONT](https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE)
- [Recharts BarChart](https://recharts.org/en-US/api/BarChart)
- [Performance Monitoring Best Practices](https://web.dev/performance-monitoring/)

---

## 🔄 更新記錄

| 日期 | 更新內容 | 更新者 |
|------|---------|--------|
| 2025-10-07 | 建立文件 | Claude |
