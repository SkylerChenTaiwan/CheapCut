# Task 5.4: 任務管理模組

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 5.4 |
| **Task 名稱** | 任務管理模組 |
| **所屬 Phase** | Phase 5: 管理後台開發 |
| **預估時間** | 5-6 小時 (API 2.5h + 前端 3h + 整合測試 1h) |
| **難度** | ⭐⭐⭐⭐ 高 |
| **前置 Task** | Task 1.5 (Logger 服務) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息 (90% 的問題都會告訴你原因)

**API 或前端報錯?** 別慌張,按照這個順序處理:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot retry task - missing execution_id
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 這是關鍵錯誤訊息
   ```

2. **判斷錯誤類型**
   - `Cannot retry task` → 重試邏輯問題
   - `Task not found` → 資料庫查詢問題
   - `Invalid status transition` → 狀態機邏輯錯誤
   - `Log stream timeout` → 即時 log 傳輸問題

3. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 上網搜尋 (有技巧的查資料)

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"任務重試錯誤"  ← 太模糊
"Log 顯示不出來" ← 沒有具體錯誤訊息
```

**✅ 好的搜尋方式**:
```
"PostgreSQL SELECT FOR UPDATE lock" ← 具體的鎖定機制
"React Server-Sent Events streaming" ← 即時 log 串流
"Express retry mechanism with idempotency" ← 重試機制
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件** (最準確)
- PostgreSQL Concurrency Control: https://www.postgresql.org/docs/current/mvcc.html
- Server-Sent Events: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

**優先順序 2: Stack Overflow** (有具體解答)
- 搜尋時加上 `site:stackoverflow.com`

---

### Step 3: 檢查環境設定

```bash
# 檢查後端 API 是否正常運作
curl http://localhost:8000/api/admin/tasks?status=failed

# 測試重試功能
curl -X POST http://localhost:8000/api/admin/tasks/{execution_id}/retry

# 檢查 log 串流
curl http://localhost:8000/api/admin/tasks/{execution_id}/logs/stream
```

---

## 🎯 Task 目標

建立管理後台的任務管理模組,提供:
- 任務列表 (可篩選狀態)
- 任務詳情 (完整執行記錄)
- 手動重試失敗任務
- 即時查看任務 log

---

## 📁 檔案結構

```
backend/
├── src/
│   ├── routes/
│   │   └── admin/
│   │       └── tasks.ts             # 任務管理 API 路由
│   └── services/
│       └── admin/
│           ├── tasks.service.ts     # 任務管理服務
│           └── retry.service.ts     # 任務重試服務

frontend/
├── pages/
│   └── admin/
│       ├── tasks/
│       │   ├── index.tsx            # 任務列表頁面
│       │   └── [id].tsx             # 任務詳情頁面
├── components/
│   └── admin/
│       ├── TaskList.tsx             # 任務列表組件
│       ├── TaskDetail.tsx           # 任務詳情組件
│       ├── TaskSteps.tsx            # 任務步驟組件
│       └── LogViewer.tsx            # Log 查看器組件
```

---

## 📝 實作步驟

### Step 1: 建立任務管理 API 路由

**位置**: `backend/src/routes/admin/tasks.ts`

```typescript
import express from 'express'
import { requireAdminAuth, requirePermission } from '../../middleware/adminAuth'
import { TasksService } from '../../services/admin/tasks.service'
import { RetryService } from '../../services/admin/retry.service'

const router = express.Router()
const tasksService = new TasksService()
const retryService = new RetryService()

// GET /api/admin/tasks?status=failed&limit=50&offset=0
router.get('/',
  requireAdminAuth,
  requirePermission('tasks:view'),
  async (req, res) => {
    try {
      const status = req.query.status as string
      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0
      const userId = req.query.user_id as string

      const result = await tasksService.getTasks({ status, limit, offset, userId })

      res.json(result)
    } catch (error) {
      console.error('Get tasks API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/admin/tasks/{executionId}
router.get('/:executionId',
  requireAdminAuth,
  requirePermission('tasks:view'),
  async (req, res) => {
    try {
      const { executionId } = req.params

      const task = await tasksService.getTaskDetail(executionId)

      if (!task) {
        return res.status(404).json({ error: 'Task not found' })
      }

      res.json(task)
    } catch (error) {
      console.error('Get task detail API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// POST /api/admin/tasks/{executionId}/retry
router.post('/:executionId/retry',
  requireAdminAuth,
  requirePermission('tasks:retry'),
  async (req, res) => {
    try {
      const { executionId } = req.params
      const { retry_from_step } = req.body

      const result = await retryService.retryTask(executionId, retry_from_step)

      res.json(result)
    } catch (error) {
      console.error('Retry task API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/admin/tasks/{executionId}/logs
router.get('/:executionId/logs',
  requireAdminAuth,
  requirePermission('tasks:view'),
  async (req, res) => {
    try {
      const { executionId } = req.params

      const logs = await tasksService.getTaskLogs(executionId)

      res.json({ logs })
    } catch (error) {
      console.error('Get task logs API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/admin/tasks/{executionId}/logs/stream
// 即時 log 串流 (使用 Server-Sent Events)
router.get('/:executionId/logs/stream',
  requireAdminAuth,
  requirePermission('tasks:view'),
  async (req, res) => {
    const { executionId } = req.params

    // 設定 SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    try {
      await tasksService.streamTaskLogs(executionId, (log) => {
        res.write(`data: ${JSON.stringify(log)}\n\n`)
      })
    } catch (error) {
      console.error('Stream task logs error:', error)
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
    }

    res.end()
  }
)

export default router
```

**檢查點**:
- [ ] API 路由正確設定
- [ ] 權限驗證正確
- [ ] 錯誤處理完善
- [ ] SSE 串流設定正確

---

### Step 2: 實作任務管理服務

**位置**: `backend/src/services/admin/tasks.service.ts`

```typescript
import { pool } from '../../db'

interface GetTasksParams {
  status?: string
  limit: number
  offset: number
  userId?: string
}

export class TasksService {
  // 取得任務列表
  async getTasks(params: GetTasksParams) {
    const { status, limit, offset, userId } = params

    let whereConditions = []
    let queryParams: any[] = []
    let paramCount = 1

    if (status) {
      whereConditions.push(`status = $${paramCount}`)
      queryParams.push(status)
      paramCount++
    }

    if (userId) {
      whereConditions.push(`user_id = $${paramCount}`)
      queryParams.push(userId)
      paramCount++
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''

    // 取得任務列表
    const tasksResult = await pool.query(`
      SELECT
        execution_id,
        task_type,
        user_id,
        status,
        failed_step,
        error_message,
        created_at,
        completed_at,
        duration,
        (
          SELECT COALESCE(SUM(total_cost), 0)
          FROM cost_tracking
          WHERE execution_id = execution_logs.execution_id
        ) as total_cost
      FROM execution_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...queryParams, limit, offset])

    // 取得總數
    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM execution_logs
      ${whereClause}
    `, queryParams)

    const total = parseInt(countResult.rows[0].total)

    return {
      tasks: tasksResult.rows.map(row => ({
        execution_id: row.execution_id,
        task_type: row.task_type,
        user_id: row.user_id,
        status: row.status,
        failed_step: row.failed_step,
        error_message: row.error_message,
        created_at: row.created_at,
        completed_at: row.completed_at,
        duration: row.duration,
        total_cost: parseFloat(row.total_cost)
      })),
      total,
      page: Math.floor(offset / limit) + 1,
      limit
    }
  }

  // 取得任務詳情
  async getTaskDetail(executionId: string) {
    // 取得任務基本資訊
    const taskResult = await pool.query(`
      SELECT
        execution_id,
        task_type,
        user_id,
        status,
        failed_step,
        error_message,
        created_at,
        completed_at,
        duration
      FROM execution_logs
      WHERE execution_id = $1
    `, [executionId])

    if (taskResult.rows.length === 0) {
      return null
    }

    const task = taskResult.rows[0]

    // 取得任務步驟
    const stepsResult = await pool.query(`
      SELECT
        step_name,
        status,
        started_at,
        completed_at,
        duration,
        error_message
      FROM execution_steps
      WHERE execution_id = $1
      ORDER BY started_at
    `, [executionId])

    // 取得成本明細
    const costsResult = await pool.query(`
      SELECT
        service_name,
        cost,
        prompt_name,
        input_tokens,
        output_tokens
      FROM cost_tracking
      WHERE execution_id = $1
      ORDER BY created_at
    `, [executionId])

    // 計算總成本
    const totalCost = costsResult.rows.reduce(
      (sum, row) => sum + parseFloat(row.cost),
      0
    )

    // 按服務分類成本
    const costByService = costsResult.rows.reduce((acc, row) => {
      const service = row.service_name
      if (!acc[service]) {
        acc[service] = 0
      }
      acc[service] += parseFloat(row.cost)
      return acc
    }, {} as Record<string, number>)

    const costBreakdown = Object.entries(costByService).map(([service, cost]) => ({
      service,
      cost
    }))

    return {
      execution_id: task.execution_id,
      task_type: task.task_type,
      user_id: task.user_id,
      status: task.status,
      failed_step: task.failed_step,
      error_message: task.error_message,
      created_at: task.created_at,
      completed_at: task.completed_at,
      duration: task.duration,
      steps: stepsResult.rows.map(row => ({
        name: row.step_name,
        status: row.status,
        started_at: row.started_at,
        completed_at: row.completed_at,
        duration: row.duration,
        error: row.error_message
      })),
      total_cost: totalCost,
      cost_breakdown: costBreakdown
    }
  }

  // 取得任務 log
  async getTaskLogs(executionId: string) {
    const result = await pool.query(`
      SELECT
        timestamp,
        level,
        message,
        metadata
      FROM logs
      WHERE execution_id = $1
      ORDER BY timestamp
    `, [executionId])

    return result.rows.map(row => ({
      timestamp: row.timestamp,
      level: row.level,
      message: row.message,
      data: row.metadata
    }))
  }

  // 即時串流任務 log
  async streamTaskLogs(executionId: string, callback: (log: any) => void) {
    // 先發送已存在的 log
    const existingLogs = await this.getTaskLogs(executionId)
    for (const log of existingLogs) {
      callback(log)
    }

    // 如果任務還在執行中,持續監聽新的 log
    const taskStatus = await pool.query(`
      SELECT status FROM execution_logs WHERE execution_id = $1
    `, [executionId])

    if (taskStatus.rows[0]?.status === 'processing') {
      // 使用 PostgreSQL LISTEN/NOTIFY 或輪詢實作即時更新
      // 這裡簡化為輪詢實作
      const interval = setInterval(async () => {
        const newLogs = await pool.query(`
          SELECT timestamp, level, message, metadata
          FROM logs
          WHERE execution_id = $1
            AND timestamp > (
              SELECT MAX(timestamp) FROM logs WHERE execution_id = $1
            )
          ORDER BY timestamp
        `, [executionId])

        for (const log of newLogs.rows) {
          callback({
            timestamp: log.timestamp,
            level: log.level,
            message: log.message,
            data: log.metadata
          })
        }

        // 檢查任務是否已完成
        const status = await pool.query(`
          SELECT status FROM execution_logs WHERE execution_id = $1
        `, [executionId])

        if (status.rows[0]?.status !== 'processing') {
          clearInterval(interval)
          callback({ type: 'end' })
        }
      }, 1000)

      // 30 秒後自動停止
      setTimeout(() => {
        clearInterval(interval)
        callback({ type: 'timeout' })
      }, 30000)
    } else {
      callback({ type: 'end' })
    }
  }
}
```

**檢查點**:
- [ ] SQL 查詢正確無誤
- [ ] 分頁邏輯正確
- [ ] 資料聚合邏輯正確
- [ ] Log 串流邏輯正確

---

### Step 3: 實作任務重試服務

**位置**: `backend/src/services/admin/retry.service.ts`

```typescript
import { pool } from '../../db'
import { v4 as uuidv4 } from 'uuid'

export class RetryService {
  async retryTask(executionId: string, retryFromStep?: string) {
    // 取得原始任務資訊
    const taskResult = await pool.query(`
      SELECT
        task_type,
        user_id,
        input_data,
        failed_step
      FROM execution_logs
      WHERE execution_id = $1
    `, [executionId])

    if (taskResult.rows.length === 0) {
      throw new Error('Task not found')
    }

    const task = taskResult.rows[0]

    // 檢查任務狀態是否允許重試
    const statusResult = await pool.query(`
      SELECT status FROM execution_logs WHERE execution_id = $1
    `, [executionId])

    const currentStatus = statusResult.rows[0]?.status

    if (currentStatus !== 'failed') {
      throw new Error(`Cannot retry task with status: ${currentStatus}`)
    }

    // 建立新的 execution_id
    const newExecutionId = uuidv4()

    // 插入新的執行記錄
    await pool.query(`
      INSERT INTO execution_logs (
        execution_id,
        task_type,
        user_id,
        status,
        input_data,
        retry_from_step,
        original_execution_id,
        created_at
      ) VALUES ($1, $2, $3, 'pending', $4, $5, $6, NOW())
    `, [
      newExecutionId,
      task.task_type,
      task.user_id,
      task.input_data,
      retryFromStep || task.failed_step,
      executionId
    ])

    // 將原始任務標記為已重試
    await pool.query(`
      UPDATE execution_logs
      SET retry_execution_id = $1
      WHERE execution_id = $2
    `, [newExecutionId, executionId])

    // 這裡應該觸發實際的任務執行
    // 例如:發送訊息到任務佇列
    // await taskQueue.enqueue(newExecutionId, task.task_type, ...)

    return {
      retry_from_step: retryFromStep || task.failed_step,
      new_execution_id: newExecutionId
    }
  }
}
```

**檢查點**:
- [ ] 重試邏輯正確
- [ ] 狀態檢查完善
- [ ] 資料複製正確
- [ ] 冪等性考慮

---

### Step 4: 建立前端任務列表頁面

**位置**: `frontend/pages/admin/tasks/index.tsx`

```typescript
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router'
import TaskList from '../../../components/admin/TaskList'
import { fetchTasks } from '../../../lib/admin-api'

interface Task {
  execution_id: string
  task_type: string
  user_id: string
  status: string
  failed_step?: string
  error_message?: string
  created_at: string
  duration?: number
  total_cost: number
}

interface TasksData {
  tasks: Task[]
  total: number
  page: number
  limit: number
}

export default function TasksPage({ initialData }: { initialData: TasksData }) {
  const router = useRouter()
  const [data, setData] = useState<TasksData>(initialData)
  const [status, setStatus] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    setLoading(true)

    try {
      const result = await fetchTasks({
        status: newStatus === 'all' ? undefined : newStatus,
        limit: data.limit,
        offset: 0
      })

      setData(result)
      router.push(`/admin/tasks?status=${newStatus}`, undefined, { shallow: true })
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = async (page: number) => {
    setLoading(true)

    try {
      const result = await fetchTasks({
        status: status === 'all' ? undefined : status,
        limit: data.limit,
        offset: (page - 1) * data.limit
      })

      setData(result)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">任務管理</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 篩選器 */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-sm font-medium">狀態:</label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            disabled={loading}
          >
            <option value="all">全部</option>
            <option value="pending">待處理</option>
            <option value="processing">處理中</option>
            <option value="completed">已完成</option>
            <option value="failed">失敗</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            共 {data.total} 筆任務
          </div>
        </div>

        {/* 任務列表 */}
        <TaskList
          tasks={data.tasks}
          onViewDetail={(executionId) => router.push(`/admin/tasks/${executionId}`)}
        />

        {/* 分頁 */}
        {data.total > data.limit && (
          <div className="mt-6 flex justify-center">
            <Pagination
              current={data.page}
              total={data.total}
              pageSize={data.limit}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function Pagination({
  current,
  total,
  pageSize,
  onChange
}: {
  current: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}) {
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        上一頁
      </button>

      <span className="text-sm">
        第 {current} / {totalPages} 頁
      </span>

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        下一頁
      </button>
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

    const status = context.query.status as string

    const data = await fetchTasks({
      status: status && status !== 'all' ? status : undefined,
      limit: 50,
      offset: 0
    }, token)

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
- [ ] 篩選器功能正常
- [ ] 分頁功能正常

---

### Step 5: 建立前端任務詳情頁面

**位置**: `frontend/pages/admin/tasks/[id].tsx`

```typescript
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router'
import TaskDetail from '../../../components/admin/TaskDetail'
import TaskSteps from '../../../components/admin/TaskSteps'
import LogViewer from '../../../components/admin/LogViewer'
import { fetchTaskDetail, retryTask } from '../../../lib/admin-api'

interface TaskDetailData {
  execution_id: string
  task_type: string
  user_id: string
  status: string
  failed_step?: string
  error_message?: string
  created_at: string
  completed_at?: string
  duration?: number
  steps: Array<{
    name: string
    status: string
    started_at: string
    completed_at?: string
    duration?: number
    error?: string
  }>
  total_cost: number
  cost_breakdown: Array<{ service: string; cost: number }>
}

export default function TaskDetailPage({ task }: { task: TaskDetailData }) {
  const router = useRouter()
  const [retrying, setRetrying] = useState(false)
  const [showLogs, setShowLogs] = useState(false)

  const handleRetry = async () => {
    if (!confirm('確定要重試此任務嗎?')) {
      return
    }

    setRetrying(true)

    try {
      const result = await retryTask(task.execution_id, task.failed_step)

      alert(`重試任務已建立: ${result.new_execution_id}`)
      router.push(`/admin/tasks/${result.new_execution_id}`)
    } catch (error) {
      console.error('Failed to retry task:', error)
      alert('重試任務失敗')
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800"
            >
              ← 返回
            </button>
            <h1 className="text-2xl font-bold">任務詳情</h1>
          </div>

          <div className="flex items-center space-x-4">
            {task.status === 'failed' && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {retrying ? '重試中...' : '重試任務'}
              </button>
            )}
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              {showLogs ? '隱藏 Log' : '查看 Log'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 任務基本資訊 */}
        <div className="mb-8">
          <TaskDetail task={task} />
        </div>

        {/* 任務步驟 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">執行步驟</h2>
          <TaskSteps steps={task.steps} />
        </div>

        {/* Log 查看器 */}
        {showLogs && (
          <div>
            <h2 className="text-lg font-semibold mb-4">執行 Log</h2>
            <LogViewer executionId={task.execution_id} />
          </div>
        )}
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

    const { id } = context.params as { id: string }

    const task = await fetchTaskDetail(id, token)

    if (!task) {
      return {
        notFound: true
      }
    }

    return {
      props: {
        task
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
- [ ] 重試功能正常
- [ ] Log 查看功能正常

---

### Step 6: 建立前端組件

**位置**: `frontend/components/admin/TaskList.tsx`

```typescript
interface Task {
  execution_id: string
  task_type: string
  user_id: string
  status: string
  failed_step?: string
  error_message?: string
  created_at: string
  duration?: number
  total_cost: number
}

interface TaskListProps {
  tasks: Task[]
  onViewDetail: (executionId: string) => void
}

export default function TaskList({ tasks, onViewDetail }: TaskListProps) {
  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': '待處理',
      'processing': '處理中',
      'completed': '已完成',
      'failed': '失敗'
    }
    return statusMap[status] || status
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              執行 ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              任務類型
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              用戶 ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              狀態
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              建立時間
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              耗時
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              成本
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.execution_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                {task.execution_id.substring(0, 8)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {task.task_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {task.user_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(task.created_at).toLocaleString('zh-TW')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                {task.duration ? (task.duration / 1000).toFixed(1) + 's' : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                ${task.total_cost.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <button
                  onClick={() => onViewDetail(task.execution_id)}
                  className="text-blue-600 hover:text-blue-800"
                >
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

**位置**: `frontend/components/admin/TaskDetail.tsx`, `TaskSteps.tsx`, `LogViewer.tsx` (略,結構類似上述組件)

**檢查點**:
- [ ] 所有組件可正常顯示
- [ ] 狀態顯示正確
- [ ] 時間格式化正確

---

### Step 7: 更新 API 呼叫封裝

**位置**: `frontend/lib/admin-api.ts` (新增以下函數)

```typescript
export async function fetchTasks(params: {
  status?: string
  limit: number
  offset: number
  userId?: string
}, token?: string) {
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.set('status', params.status)
  queryParams.set('limit', params.limit.toString())
  queryParams.set('offset', params.offset.toString())
  if (params.userId) queryParams.set('user_id', params.userId)

  return fetchWithAuth(
    `${API_URL}/api/admin/tasks?${queryParams.toString()}`,
    token
  )
}

export async function fetchTaskDetail(executionId: string, token?: string) {
  return fetchWithAuth(`${API_URL}/api/admin/tasks/${executionId}`, token)
}

export async function retryTask(executionId: string, retryFromStep?: string, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/api/admin/tasks/${executionId}/retry`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ retry_from_step: retryFromStep })
  })

  if (!response.ok) {
    throw new Error('Failed to retry task')
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

- [ ] **任務列表功能**
  - [ ] 可正確顯示任務列表
  - [ ] 狀態篩選正常
  - [ ] 分頁功能正常
  - [ ] 用戶篩選正常

- [ ] **任務詳情功能**
  - [ ] 可正確顯示任務詳情
  - [ ] 步驟資訊完整
  - [ ] 成本明細正確

- [ ] **任務重試功能**
  - [ ] 可正確重試失敗任務
  - [ ] 從指定步驟重試
  - [ ] 建立新的執行記錄

- [ ] **Log 查看功能**
  - [ ] 可正確顯示 log
  - [ ] 即時串流正常(可選)
  - [ ] Log 格式化正確

### 效能驗收

- [ ] 任務列表載入時間 < 2 秒
- [ ] 任務詳情載入時間 < 1 秒
- [ ] 重試操作回應時間 < 1 秒

### 安全性驗收

- [ ] 權限檢查正確
- [ ] 重試操作有確認機制
- [ ] 防止重複重試

---

## 🐛 常見問題

### 問題 1: 重試任務後原任務還是顯示失敗

**原因**: 這是正常行為,原任務應該保持失敗狀態

**解決方案**:
```typescript
// 在任務詳情頁面顯示重試資訊
if (task.retry_execution_id) {
  // 顯示「此任務已重試,新執行 ID: xxx」
}
```

---

### 問題 2: Log 串流突然中斷

**原因**: 連線逾時或任務已完成

**解決方案**:
```typescript
// 在前端處理重連
if (event.type === 'timeout') {
  // 重新建立連線或顯示提示
}
```

---

### 問題 3: 分頁顯示不正確

**原因**: 頁碼計算錯誤

**解決方案**:
```typescript
// 確保頁碼從 1 開始
const page = Math.floor(offset / limit) + 1
```

---

## 📚 相關資源

### 官方文件
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [PostgreSQL Row Locking](https://www.postgresql.org/docs/current/explicit-locking.html)

---

## 🔄 更新記錄

| 日期 | 更新內容 | 更新者 |
|------|---------|--------|
| 2025-10-07 | 建立文件 | Claude |
