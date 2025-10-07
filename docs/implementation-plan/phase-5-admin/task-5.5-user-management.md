# Task 5.5: 用戶管理模組

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 5.5 |
| **Task 名稱** | 用戶管理模組 |
| **所屬 Phase** | Phase 5: 管理後台開發 |
| **預估時間** | 4-5 小時 (API 2h + 前端 2.5h + 整合測試 0.5h) |
| **難度** | ⭐⭐⭐ 中高 |
| **前置 Task** | Task 1.2 (Supabase Auth) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息 (90% 的問題都會告訴你原因)

**API 或前端報錯?** 別慌張,按照這個順序處理:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot update user quota - user not found
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 這是關鍵錯誤訊息
   ```

2. **判斷錯誤類型**
   - `Cannot update user quota` → 配額更新失敗
   - `User not found` → 用戶不存在
   - `Invalid quota value` → 配額值不合法
   - `Permission denied` → 權限不足

3. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 上網搜尋 (有技巧的查資料)

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"用戶管理錯誤"  ← 太模糊
"無法更新" ← 沒有具體錯誤訊息
```

**✅ 好的搜尋方式**:
```
"Supabase Admin API update user" ← 具體的 API 操作
"PostgreSQL update with JOIN" ← 具體的 SQL 問題
"React user management table pagination" ← 具體的前端問題
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件** (最準確)
- Supabase Admin API: https://supabase.com/docs/reference/javascript/auth-admin-api
- PostgreSQL: https://www.postgresql.org/docs/

**優先順序 2: Stack Overflow** (有具體解答)
- 搜尋時加上 `site:stackoverflow.com`

---

### Step 3: 檢查環境設定

```bash
# 檢查後端 API 是否正常運作
curl http://localhost:8000/api/admin/users

# 測試用戶更新功能
curl -X PATCH http://localhost:8000/api/admin/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{"status": "banned"}'
```

---

## 🎯 Task 目標

建立管理後台的用戶管理模組,提供:
- 用戶列表 (可排序、篩選)
- 用戶詳情 (使用情況、成本明細)
- 配額管理
- 用戶狀態管理 (封禁/解封)

---

## 📁 檔案結構

```
backend/
├── src/
│   ├── routes/
│   │   └── admin/
│   │       └── users.ts             # 用戶管理 API 路由
│   └── services/
│       └── admin/
│           └── users.service.ts     # 用戶管理服務

frontend/
├── pages/
│   └── admin/
│       ├── users/
│       │   ├── index.tsx            # 用戶列表頁面
│       │   └── [id].tsx             # 用戶詳情頁面
├── components/
│   └── admin/
│       ├── UserList.tsx             # 用戶列表組件
│       ├── UserDetail.tsx           # 用戶詳情組件
│       ├── UserUsageChart.tsx       # 用戶使用情況圖表
│       ├── UserCostChart.tsx        # 用戶成本趨勢圖表
│       └── UserQuotaEditor.tsx      # 配額編輯器組件
```

---

## 📝 實作步驟

### Step 1: 建立用戶管理 API 路由

**位置**: `backend/src/routes/admin/users.ts`

```typescript
import express from 'express'
import { requireAdminAuth, requirePermission } from '../../middleware/adminAuth'
import { UsersService } from '../../services/admin/users.service'

const router = express.Router()
const usersService = new UsersService()

// GET /api/admin/users?sortBy=cost&order=desc&limit=50&offset=0
router.get('/',
  requireAdminAuth,
  requirePermission('users:view'),
  async (req, res) => {
    try {
      const sortBy = req.query.sortBy as string || 'created_at'
      const order = req.query.order as string || 'desc'
      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0
      const search = req.query.search as string

      const result = await usersService.getUsers({
        sortBy,
        order,
        limit,
        offset,
        search
      })

      res.json(result)
    } catch (error) {
      console.error('Get users API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/admin/users/{userId}
router.get('/:userId',
  requireAdminAuth,
  requirePermission('users:view'),
  async (req, res) => {
    try {
      const { userId } = req.params

      const user = await usersService.getUserDetail(userId)

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json(user)
    } catch (error) {
      console.error('Get user detail API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// PATCH /api/admin/users/{userId}
router.patch('/:userId',
  requireAdminAuth,
  requirePermission('users:update'),
  async (req, res) => {
    try {
      const { userId } = req.params
      const { status, quota } = req.body

      const result = await usersService.updateUser(userId, { status, quota })

      res.json(result)
    } catch (error) {
      console.error('Update user API error:', error)
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

### Step 2: 實作用戶管理服務

**位置**: `backend/src/services/admin/users.service.ts`

```typescript
import { pool } from '../../db'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!  // 使用 Service Key 才能存取 Auth Admin API
)

interface GetUsersParams {
  sortBy: string
  order: string
  limit: number
  offset: number
  search?: string
}

export class UsersService {
  // 取得用戶列表
  async getUsers(params: GetUsersParams) {
    const { sortBy, order, limit, offset, search } = params

    // 建立查詢條件
    let whereConditions = []
    let queryParams: any[] = []
    let paramCount = 1

    if (search) {
      whereConditions.push(`(u.email ILIKE $${paramCount} OR u.id::text ILIKE $${paramCount})`)
      queryParams.push(`%${search}%`)
      paramCount++
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''

    // 排序欄位映射
    const sortByMap: Record<string, string> = {
      'cost': 'total_cost',
      'videos': 'videos_generated',
      'created_at': 'u.created_at'
    }
    const sortColumn = sortByMap[sortBy] || 'u.created_at'

    // 查詢用戶列表
    const usersResult = await pool.query(`
      SELECT
        u.id as user_id,
        u.email,
        u.created_at,
        COALESCE(SUM(ct.total_cost), 0) as total_cost,
        COUNT(DISTINCT v.id) as videos_generated,
        COUNT(DISTINCT m.id) as materials_uploaded,
        COALESCE(SUM(m.file_size), 0) as total_storage_bytes
      FROM auth.users u
      LEFT JOIN cost_tracking ct ON ct.user_id = u.id
      LEFT JOIN videos v ON v.user_id = u.id
      LEFT JOIN materials m ON m.user_id = u.id
      ${whereClause}
      GROUP BY u.id, u.email, u.created_at
      ORDER BY ${sortColumn} ${order.toUpperCase()}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...queryParams, limit, offset])

    // 查詢總數
    const countResult = await pool.query(`
      SELECT COUNT(DISTINCT u.id) as total
      FROM auth.users u
      ${whereClause}
    `, queryParams)

    const total = parseInt(countResult.rows[0].total)

    // 查詢每個用戶的狀態 (從 user_metadata 或自訂 table)
    const users = await Promise.all(usersResult.rows.map(async (row) => {
      // 從 Supabase Auth 取得用戶狀態
      const { data: authUser } = await supabase.auth.admin.getUserById(row.user_id)

      return {
        user_id: row.user_id,
        email: row.email,
        total_cost: parseFloat(row.total_cost),
        videos_generated: parseInt(row.videos_generated),
        materials_uploaded: parseInt(row.materials_uploaded),
        total_storage_mb: Math.round(parseInt(row.total_storage_bytes) / 1024 / 1024),
        created_at: row.created_at,
        status: authUser?.user?.banned_until ? 'banned' : 'active'
      }
    }))

    return {
      users,
      total,
      page: Math.floor(offset / limit) + 1,
      limit
    }
  }

  // 取得用戶詳情
  async getUserDetail(userId: string) {
    // 從 Supabase Auth 取得用戶基本資訊
    const { data: authUser, error } = await supabase.auth.admin.getUserById(userId)

    if (error || !authUser.user) {
      return null
    }

    // 查詢用戶使用情況
    const usageResult = await pool.query(`
      SELECT
        COALESCE(SUM(ct.total_cost), 0) as total_cost,
        COUNT(DISTINCT v.id) as videos_generated,
        COUNT(DISTINCT m.id) as materials_uploaded,
        COALESCE(SUM(m.file_size), 0) as total_storage_bytes
      FROM auth.users u
      LEFT JOIN cost_tracking ct ON ct.user_id = u.id
      LEFT JOIN videos v ON v.user_id = u.id
      LEFT JOIN materials m ON m.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId])

    const usage = usageResult.rows[0] || {
      total_cost: 0,
      videos_generated: 0,
      materials_uploaded: 0,
      total_storage_bytes: 0
    }

    // 查詢用戶配額 (從自訂 table 或 user_metadata)
    const quotaResult = await pool.query(`
      SELECT
        max_videos_per_month,
        max_storage_mb
      FROM user_quotas
      WHERE user_id = $1
    `, [userId])

    const quota = quotaResult.rows[0] || {
      max_videos_per_month: 1000,  // 預設值
      max_storage_mb: 10000
    }

    // 查詢成本趨勢 (過去 6 個月)
    const costTrendResult = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
        SUM(total_cost) as cost
      FROM cost_tracking
      WHERE user_id = $1
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `, [userId])

    return {
      user_id: userId,
      email: authUser.user.email,
      created_at: authUser.user.created_at,
      status: authUser.user.banned_until ? 'banned' : 'active',
      usage: {
        total_cost: parseFloat(usage.total_cost),
        videos_generated: parseInt(usage.videos_generated),
        materials_uploaded: parseInt(usage.materials_uploaded),
        total_storage_mb: Math.round(parseInt(usage.total_storage_bytes) / 1024 / 1024)
      },
      quota: {
        max_videos_per_month: parseInt(quota.max_videos_per_month),
        max_storage_mb: parseInt(quota.max_storage_mb)
      },
      cost_trend: costTrendResult.rows.map(row => ({
        month: row.month,
        cost: parseFloat(row.cost)
      }))
    }
  }

  // 更新用戶
  async updateUser(userId: string, updates: { status?: string; quota?: any }) {
    const { status, quota } = updates

    // 更新用戶狀態
    if (status === 'banned') {
      // 封禁用戶
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'indefinite'
      })

      if (error) {
        throw new Error('Failed to ban user')
      }
    } else if (status === 'active') {
      // 解除封禁
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none'
      })

      if (error) {
        throw new Error('Failed to unban user')
      }
    }

    // 更新用戶配額
    if (quota) {
      // 檢查 quota 是否已存在
      const existingQuota = await pool.query(`
        SELECT * FROM user_quotas WHERE user_id = $1
      `, [userId])

      if (existingQuota.rows.length > 0) {
        // 更新
        await pool.query(`
          UPDATE user_quotas
          SET
            max_videos_per_month = $1,
            max_storage_mb = $2
          WHERE user_id = $3
        `, [quota.max_videos_per_month, quota.max_storage_mb, userId])
      } else {
        // 插入
        await pool.query(`
          INSERT INTO user_quotas (user_id, max_videos_per_month, max_storage_mb)
          VALUES ($1, $2, $3)
        `, [userId, quota.max_videos_per_month, quota.max_storage_mb])
      }
    }

    return {
      success: true,
      message: 'User updated successfully'
    }
  }
}
```

**檢查點**:
- [ ] SQL 查詢正確無誤
- [ ] Supabase Auth API 呼叫正確
- [ ] 資料聚合邏輯正確
- [ ] 效能可接受 (查詢時間 < 2 秒)

---

### Step 3: 建立前端用戶列表頁面

**位置**: `frontend/pages/admin/users/index.tsx`

```typescript
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router'
import UserList from '../../../components/admin/UserList'
import { fetchUsers } from '../../../lib/admin-api'

interface User {
  user_id: string
  email: string
  total_cost: number
  videos_generated: number
  materials_uploaded: number
  total_storage_mb: number
  created_at: string
  status: string
}

interface UsersData {
  users: User[]
  total: number
  page: number
  limit: number
}

export default function UsersPage({ initialData }: { initialData: UsersData }) {
  const router = useRouter()
  const [data, setData] = useState<UsersData>(initialData)
  const [sortBy, setSortBy] = useState('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSortChange = async (newSortBy: string) => {
    const newOrder = sortBy === newSortBy && order === 'desc' ? 'asc' : 'desc'
    setSortBy(newSortBy)
    setOrder(newOrder)

    await fetchUsersData({ sortBy: newSortBy, order: newOrder, search, offset: 0 })
  }

  const handleSearch = async (searchTerm: string) => {
    setSearch(searchTerm)
    await fetchUsersData({ sortBy, order, search: searchTerm, offset: 0 })
  }

  const handlePageChange = async (page: number) => {
    await fetchUsersData({
      sortBy,
      order,
      search,
      offset: (page - 1) * data.limit
    })
  }

  const fetchUsersData = async (params: any) => {
    setLoading(true)

    try {
      const result = await fetchUsers({
        sortBy: params.sortBy,
        order: params.order,
        limit: data.limit,
        offset: params.offset,
        search: params.search
      })

      setData(result)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">用戶管理</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 搜尋與篩選 */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            placeholder="搜尋用戶 (Email 或 ID)"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg flex-1 max-w-md"
          />

          <div className="ml-auto text-sm text-gray-600">
            共 {data.total} 位用戶
          </div>
        </div>

        {/* 用戶列表 */}
        <UserList
          users={data.users}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
          onViewDetail={(userId) => router.push(`/admin/users/${userId}`)}
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

    const data = await fetchUsers({
      sortBy: 'created_at',
      order: 'desc',
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
- [ ] 搜尋功能正常
- [ ] 排序功能正常
- [ ] 分頁功能正常

---

### Step 4: 建立前端用戶詳情頁面

**位置**: `frontend/pages/admin/users/[id].tsx`

```typescript
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router'
import UserDetail from '../../../components/admin/UserDetail'
import UserUsageChart from '../../../components/admin/UserUsageChart'
import UserCostChart from '../../../components/admin/UserCostChart'
import UserQuotaEditor from '../../../components/admin/UserQuotaEditor'
import { fetchUserDetail, updateUser } from '../../../lib/admin-api'

interface UserDetailData {
  user_id: string
  email: string
  created_at: string
  status: string
  usage: {
    total_cost: number
    videos_generated: number
    materials_uploaded: number
    total_storage_mb: number
  }
  quota: {
    max_videos_per_month: number
    max_storage_mb: number
  }
  cost_trend: Array<{ month: string; cost: number }>
}

export default function UserDetailPage({ user }: { user: UserDetailData }) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserDetailData>(user)
  const [showQuotaEditor, setShowQuotaEditor] = useState(false)

  const handleBanUser = async () => {
    if (!confirm('確定要封禁此用戶嗎?')) {
      return
    }

    try {
      await updateUser(currentUser.user_id, { status: 'banned' })
      alert('用戶已封禁')
      setCurrentUser({ ...currentUser, status: 'banned' })
    } catch (error) {
      console.error('Failed to ban user:', error)
      alert('封禁失敗')
    }
  }

  const handleUnbanUser = async () => {
    if (!confirm('確定要解除封禁此用戶嗎?')) {
      return
    }

    try {
      await updateUser(currentUser.user_id, { status: 'active' })
      alert('封禁已解除')
      setCurrentUser({ ...currentUser, status: 'active' })
    } catch (error) {
      console.error('Failed to unban user:', error)
      alert('解除封禁失敗')
    }
  }

  const handleUpdateQuota = async (quota: any) => {
    try {
      await updateUser(currentUser.user_id, { quota })
      alert('配額已更新')
      setCurrentUser({ ...currentUser, quota })
      setShowQuotaEditor(false)
    } catch (error) {
      console.error('Failed to update quota:', error)
      alert('更新配額失敗')
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
            <h1 className="text-2xl font-bold">用戶詳情</h1>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser.status === 'active' ? (
              <button
                onClick={handleBanUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                封禁用戶
              </button>
            ) : (
              <button
                onClick={handleUnbanUser}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                解除封禁
              </button>
            )}
            <button
              onClick={() => setShowQuotaEditor(true)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              調整配額
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 用戶基本資訊 */}
        <div className="mb-8">
          <UserDetail user={currentUser} />
        </div>

        {/* 使用情況 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UserUsageChart usage={currentUser.usage} quota={currentUser.quota} />
          <UserCostChart costTrend={currentUser.cost_trend} />
        </div>

        {/* 配額編輯器 */}
        {showQuotaEditor && (
          <UserQuotaEditor
            currentQuota={currentUser.quota}
            onSave={handleUpdateQuota}
            onCancel={() => setShowQuotaEditor(false)}
          />
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

    const user = await fetchUserDetail(id, token)

    if (!user) {
      return {
        notFound: true
      }
    }

    return {
      props: {
        user
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
- [ ] 封禁/解封功能正常
- [ ] 配額調整功能正常

---

### Step 5: 建立前端組件

**位置**: `frontend/components/admin/UserList.tsx`

```typescript
interface User {
  user_id: string
  email: string
  total_cost: number
  videos_generated: number
  materials_uploaded: number
  total_storage_mb: number
  created_at: string
  status: string
}

interface UserListProps {
  users: User[]
  sortBy: string
  order: string
  onSortChange: (sortBy: string) => void
  onViewDetail: (userId: string) => void
}

export default function UserList({ users, sortBy, order, onSortChange, onViewDetail }: UserListProps) {
  function getSortIcon(column: string) {
    if (sortBy !== column) return '⇅'
    return order === 'desc' ? '↓' : '↑'
  }

  function getStatusColor(status: string): string {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  function getStatusText(status: string): string {
    return status === 'active' ? '正常' : '已封禁'
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange('cost')}
            >
              總成本 {getSortIcon('cost')}
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange('videos')}
            >
              影片數量 {getSortIcon('videos')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              素材數量
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              儲存空間
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange('created_at')}
            >
              建立時間 {getSortIcon('created_at')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              狀態
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.user_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                ${user.total_cost.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                {user.videos_generated}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {user.materials_uploaded}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {user.total_storage_mb} MB
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString('zh-TW')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                  {getStatusText(user.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <button
                  onClick={() => onViewDetail(user.user_id)}
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

**位置**: `frontend/components/admin/UserDetail.tsx`, `UserUsageChart.tsx`, `UserCostChart.tsx`, `UserQuotaEditor.tsx` (略,結構類似其他組件)

**檢查點**:
- [ ] 所有組件可正常顯示
- [ ] 排序圖示正確
- [ ] 狀態顯示正確

---

### Step 6: 更新 API 呼叫封裝

**位置**: `frontend/lib/admin-api.ts` (新增以下函數)

```typescript
export async function fetchUsers(params: {
  sortBy: string
  order: string
  limit: number
  offset: number
  search?: string
}, token?: string) {
  const queryParams = new URLSearchParams()
  queryParams.set('sortBy', params.sortBy)
  queryParams.set('order', params.order)
  queryParams.set('limit', params.limit.toString())
  queryParams.set('offset', params.offset.toString())
  if (params.search) queryParams.set('search', params.search)

  return fetchWithAuth(
    `${API_URL}/api/admin/users?${queryParams.toString()}`,
    token
  )
}

export async function fetchUserDetail(userId: string, token?: string) {
  return fetchWithAuth(`${API_URL}/api/admin/users/${userId}`, token)
}

export async function updateUser(
  userId: string,
  updates: { status?: string; quota?: any },
  token?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    throw new Error('Failed to update user')
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

- [ ] **用戶列表功能**
  - [ ] 可正確顯示用戶列表
  - [ ] 搜尋功能正常
  - [ ] 排序功能正常
  - [ ] 分頁功能正常

- [ ] **用戶詳情功能**
  - [ ] 可正確顯示用戶詳情
  - [ ] 使用情況統計正確
  - [ ] 成本趨勢圖正確

- [ ] **用戶管理功能**
  - [ ] 封禁/解封功能正常
  - [ ] 配額調整功能正常
  - [ ] 操作有確認機制

### 效能驗收

- [ ] 用戶列表載入時間 < 2 秒
- [ ] 用戶詳情載入時間 < 1 秒
- [ ] 更新操作回應時間 < 1 秒

### 安全性驗收

- [ ] 權限檢查正確
- [ ] 敏感操作有確認機制
- [ ] 配額值驗證

---

## 🐛 常見問題

### 問題 1: 無法更新用戶狀態

**原因**: 沒有使用 Supabase Service Key

**解決方案**:
```typescript
// 確保使用 Service Key,不是 anon key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!  // 必須是 Service Key
)
```

---

### 問題 2: 用戶列表查詢很慢

**原因**: 缺少索引

**解決方案**:
```sql
-- 建立索引
CREATE INDEX idx_cost_tracking_user_id ON cost_tracking(user_id);
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_materials_user_id ON materials(user_id);
```

---

### 問題 3: 配額更新後沒有生效

**原因**: 應用程式快取

**解決方案**:
```typescript
// 更新配額後清除快取
await redis.del(`user_quota:${userId}`)
```

---

## 📚 相關資源

### 官方文件
- [Supabase Admin API](https://supabase.com/docs/reference/javascript/auth-admin-api)
- [PostgreSQL Aggregate Functions](https://www.postgresql.org/docs/current/functions-aggregate.html)

---

## 🔄 更新記錄

| 日期 | 更新內容 | 更新者 |
|------|---------|--------|
| 2025-10-07 | 建立文件 | Claude |
