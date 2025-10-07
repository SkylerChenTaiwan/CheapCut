# Task 5.6: 系統設定與 Prompt 管理

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 5.6 |
| **Task 名稱** | 系統設定與 Prompt 管理 |
| **所屬 Phase** | Phase 5: 管理後台開發 |
| **預估時間** | 5-6 小時 (API 2.5h + 前端 3h + 整合測試 1h) |
| **難度** | ⭐⭐⭐⭐ 高 |
| **前置 Task** | Task 2.0 (Prompt 管理系統) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息 (90% 的問題都會告訴你原因)

**API 或前端報錯?** 別慌張,按照這個順序處理:

1. **找到錯誤的關鍵字**
   ```
   Error: Failed to clear prompt cache - Redis connection timeout
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 這是關鍵錯誤訊息
   ```

2. **判斷錯誤類型**
   - `Failed to clear cache` → 快取清除失敗
   - `Prompt not found` → Prompt 不存在
   - `Git operation failed` → Git 操作失敗
   - `Invalid settings value` → 設定值不合法

3. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 上網搜尋 (有技巧的查資料)

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"Prompt 管理錯誤"  ← 太模糊
"設定無法儲存" ← 沒有具體錯誤訊息
```

**✅ 好的搜尋方式**:
```
"Redis FLUSHDB pattern matching" ← 具體的快取操作
"Git log file history API" ← Git 版本查詢
"Express file system security" ← 檔案操作安全
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件** (最準確)
- Redis Commands: https://redis.io/commands/
- Git Documentation: https://git-scm.com/docs

**優先順序 2: Stack Overflow** (有具體解答)
- 搜尋時加上 `site:stackoverflow.com`

---

### Step 3: 檢查環境設定

```bash
# 檢查 Prompt 檔案是否存在
ls -la prompts/

# 測試 Git 操作
cd prompts && git log --oneline

# 測試 Redis 連線
redis-cli ping
```

---

## 🎯 Task 目標

建立管理後台的系統設定與 Prompt 管理模組,提供:
- Prompt 列表與使用統計
- Prompt 版本歷史查詢
- 快取管理 (清除 Prompt 快取)
- 系統參數設定 (預算、告警閾值等)

---

## 📁 檔案結構

```
backend/
├── src/
│   ├── routes/
│   │   └── admin/
│   │       ├── prompts.ts           # Prompt 管理 API 路由
│   │       └── settings.ts          # 系統設定 API 路由
│   └── services/
│       └── admin/
│           ├── prompts.service.ts   # Prompt 管理服務
│           ├── git.service.ts       # Git 操作服務
│           └── settings.service.ts  # 系統設定服務

frontend/
├── pages/
│   └── admin/
│       ├── prompts.tsx              # Prompt 管理頁面
│       └── settings.tsx             # 系統設定頁面
├── components/
│   └── admin/
│       ├── PromptList.tsx           # Prompt 列表組件
│       ├── PromptVersionHistory.tsx # Prompt 版本歷史組件
│       ├── CacheManager.tsx         # 快取管理組件
│       └── SettingsEditor.tsx       # 設定編輯器組件
```

---

## 📝 實作步驟

### Step 1: 建立 Prompt 管理 API 路由

**位置**: `backend/src/routes/admin/prompts.ts`

```typescript
import express from 'express'
import { requireAdminAuth, requirePermission } from '../../middleware/adminAuth'
import { PromptsService } from '../../services/admin/prompts.service'
import { GitService } from '../../services/admin/git.service'

const router = express.Router()
const promptsService = new PromptsService()
const gitService = new GitService()

// GET /api/admin/prompts
router.get('/',
  requireAdminAuth,
  requirePermission('prompts:view'),
  async (req, res) => {
    try {
      const prompts = await promptsService.getAllPrompts()

      res.json({ prompts })
    } catch (error) {
      console.error('Get prompts API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/admin/prompts/{category}/{name}/versions
router.get('/:category/:name/versions',
  requireAdminAuth,
  requirePermission('prompts:view'),
  async (req, res) => {
    try {
      const { category, name } = req.params

      const versions = await gitService.getPromptVersionHistory(category, name)

      res.json({ versions })
    } catch (error) {
      console.error('Get prompt versions API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// POST /api/admin/prompts/clear-cache
router.post('/clear-cache',
  requireAdminAuth,
  requirePermission('prompts:clear_cache'),
  async (req, res) => {
    try {
      const { category, name } = req.body

      const result = await promptsService.clearPromptCache(category, name)

      res.json(result)
    } catch (error) {
      console.error('Clear cache API error:', error)
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

### Step 2: 實作 Prompt 管理服務

**位置**: `backend/src/services/admin/prompts.service.ts`

```typescript
import { pool } from '../../db'
import fs from 'fs/promises'
import path from 'path'
import { createClient } from 'redis'

const redis = createClient({
  url: process.env.REDIS_URL
})
await redis.connect()

const PROMPTS_DIR = path.join(process.cwd(), 'prompts')

interface PromptInfo {
  category: string
  name: string
  version: number
  active: boolean
  updated: string
  usage_stats: {
    calls_last_7days: number
    avg_cost: number
    avg_duration: number
  }
}

export class PromptsService {
  // 取得所有 Prompt
  async getAllPrompts(): Promise<PromptInfo[]> {
    const prompts: PromptInfo[] = []

    // 讀取 prompts 目錄結構
    const categories = await fs.readdir(PROMPTS_DIR)

    for (const category of categories) {
      const categoryPath = path.join(PROMPTS_DIR, category)
      const stat = await fs.stat(categoryPath)

      if (!stat.isDirectory()) continue

      // 讀取該分類下的所有 Prompt 檔案
      const files = await fs.readdir(categoryPath)

      for (const file of files) {
        if (!file.endsWith('.md')) continue

        const name = file.replace('.md', '')
        const filePath = path.join(categoryPath, file)

        // 取得檔案修改時間
        const fileStat = await fs.stat(filePath)

        // 從資料庫取得使用統計
        const statsResult = await pool.query(`
          SELECT
            COUNT(*) as calls_count,
            AVG(cost) as avg_cost,
            AVG(duration) as avg_duration
          FROM performance_tracking
          WHERE prompt_category = $1
            AND prompt_name = $2
            AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        `, [category, name])

        const stats = statsResult.rows[0]

        // 檢查是否啟用 (從設定或預設都啟用)
        const active = true  // 可以從資料庫或設定檔讀取

        prompts.push({
          category,
          name,
          version: 1,  // 可以從 Git 讀取版本號
          active,
          updated: fileStat.mtime.toISOString().split('T')[0],
          usage_stats: {
            calls_last_7days: parseInt(stats.calls_count) || 0,
            avg_cost: parseFloat(stats.avg_cost) || 0,
            avg_duration: parseInt(stats.avg_duration) || 0
          }
        })
      }
    }

    return prompts
  }

  // 清除 Prompt 快取
  async clearPromptCache(category?: string, name?: string) {
    let clearedCount = 0

    if (category && name) {
      // 清除特定 Prompt 的快取
      const pattern = `prompt:${category}:${name}:*`
      const keys = await redis.keys(pattern)

      for (const key of keys) {
        await redis.del(key)
        clearedCount++
      }
    } else if (category) {
      // 清除特定分類的快取
      const pattern = `prompt:${category}:*`
      const keys = await redis.keys(pattern)

      for (const key of keys) {
        await redis.del(key)
        clearedCount++
      }
    } else {
      // 清除所有 Prompt 快取
      const pattern = 'prompt:*'
      const keys = await redis.keys(pattern)

      for (const key of keys) {
        await redis.del(key)
        clearedCount++
      }
    }

    return {
      success: true,
      cleared_count: clearedCount,
      message: `已清除 ${clearedCount} 個快取`
    }
  }
}
```

**檢查點**:
- [ ] 檔案系統操作正確
- [ ] Redis 操作正確
- [ ] 資料聚合邏輯正確
- [ ] 安全性考量 (路徑遍歷攻擊防護)

---

### Step 3: 實作 Git 服務

**位置**: `backend/src/services/admin/git.service.ts`

```typescript
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

const PROMPTS_DIR = path.join(process.cwd(), 'prompts')

interface PromptVersion {
  version: number
  commit: string
  author: string
  date: string
  message: string
  active: boolean
}

export class GitService {
  // 取得 Prompt 版本歷史
  async getPromptVersionHistory(category: string, name: string): Promise<PromptVersion[]> {
    const filePath = path.join(category, `${name}.md`)

    // 使用 git log 查詢檔案歷史
    try {
      const { stdout } = await execAsync(
        `git log --follow --pretty=format:"%H|%an|%ad|%s" --date=short -- "${filePath}"`,
        { cwd: PROMPTS_DIR }
      )

      if (!stdout) {
        return []
      }

      const lines = stdout.trim().split('\n')
      const versions: PromptVersion[] = []

      lines.forEach((line, index) => {
        const [commit, author, date, message] = line.split('|')

        versions.push({
          version: lines.length - index,  // 最新的版本號最大
          commit: commit.substring(0, 7),  // 短 hash
          author,
          date,
          message,
          active: index === 0  // 第一筆 (最新) 是啟用的
        })
      })

      return versions
    } catch (error) {
      console.error('Git log error:', error)
      return []
    }
  }

  // 取得特定版本的 Prompt 內容 (可選功能)
  async getPromptContent(category: string, name: string, commit: string): Promise<string> {
    const filePath = path.join(category, `${name}.md`)

    try {
      const { stdout } = await execAsync(
        `git show ${commit}:${filePath}`,
        { cwd: PROMPTS_DIR }
      )

      return stdout
    } catch (error) {
      console.error('Git show error:', error)
      throw new Error('Failed to get prompt content')
    }
  }
}
```

**檢查點**:
- [ ] Git 命令正確
- [ ] 資料解析正確
- [ ] 錯誤處理完善
- [ ] 安全性考量 (命令注入防護)

---

### Step 4: 建立系統設定 API 路由

**位置**: `backend/src/routes/admin/settings.ts`

```typescript
import express from 'express'
import { requireAdminAuth, requirePermission } from '../../middleware/adminAuth'
import { SettingsService } from '../../services/admin/settings.service'

const router = express.Router()
const settingsService = new SettingsService()

// GET /api/admin/settings
router.get('/',
  requireAdminAuth,
  requirePermission('settings:view'),
  async (req, res) => {
    try {
      const settings = await settingsService.getSettings()

      res.json(settings)
    } catch (error) {
      console.error('Get settings API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// PATCH /api/admin/settings
router.patch('/',
  requireAdminAuth,
  requirePermission('settings:update'),
  async (req, res) => {
    try {
      const updates = req.body

      const result = await settingsService.updateSettings(updates)

      res.json(result)
    } catch (error) {
      console.error('Update settings API error:', error)
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

### Step 5: 實作系統設定服務

**位置**: `backend/src/services/admin/settings.service.ts`

```typescript
import { pool } from '../../db'

interface SystemSettings {
  cost_budget: {
    monthly_limit: number
    alert_threshold: number
  }
  performance_alerts: {
    avg_duration_threshold: number
    failure_rate_threshold: number
  }
  external_services: {
    [key: string]: {
      api_key: string
      status: string
    }
  }
}

export class SettingsService {
  // 取得系統設定
  async getSettings(): Promise<SystemSettings> {
    // 從資料庫讀取設定
    const result = await pool.query(`
      SELECT key, value FROM system_settings
    `)

    const settings: any = {}

    result.rows.forEach(row => {
      // 解析 JSON 值
      settings[row.key] = JSON.parse(row.value)
    })

    // 如果沒有設定,使用預設值
    return {
      cost_budget: settings.cost_budget || {
        monthly_limit: 2000,
        alert_threshold: 0.8
      },
      performance_alerts: settings.performance_alerts || {
        avg_duration_threshold: 60000,
        failure_rate_threshold: 0.05
      },
      external_services: settings.external_services || {
        openai: {
          api_key: this.maskApiKey(process.env.OPENAI_API_KEY || ''),
          status: 'active'
        },
        google_video_ai: {
          api_key: this.maskApiKey(process.env.GOOGLE_VIDEO_AI_KEY || ''),
          status: 'active'
        }
      }
    }
  }

  // 更新系統設定
  async updateSettings(updates: Partial<SystemSettings>) {
    // 更新每個設定項目
    for (const [key, value] of Object.entries(updates)) {
      // 檢查設定是否已存在
      const existingResult = await pool.query(`
        SELECT * FROM system_settings WHERE key = $1
      `, [key])

      if (existingResult.rows.length > 0) {
        // 更新
        await pool.query(`
          UPDATE system_settings
          SET value = $1, updated_at = NOW()
          WHERE key = $2
        `, [JSON.stringify(value), key])
      } else {
        // 插入
        await pool.query(`
          INSERT INTO system_settings (key, value, created_at, updated_at)
          VALUES ($1, $2, NOW(), NOW())
        `, [key, JSON.stringify(value)])
      }
    }

    return {
      success: true,
      message: 'Settings updated successfully'
    }
  }

  // 遮罩 API Key
  private maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '***'
    }

    return apiKey.substring(0, 4) + '***' + apiKey.substring(apiKey.length - 4)
  }
}
```

**檢查點**:
- [ ] 資料庫操作正確
- [ ] 設定驗證邏輯完善
- [ ] API Key 遮罩正確
- [ ] 預設值合理

---

### Step 6: 建立前端 Prompt 管理頁面

**位置**: `frontend/pages/admin/prompts.tsx`

```typescript
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import PromptList from '../../components/admin/PromptList'
import PromptVersionHistory from '../../components/admin/PromptVersionHistory'
import CacheManager from '../../components/admin/CacheManager'
import { fetchPrompts, fetchPromptVersions, clearPromptCache } from '../../lib/admin-api'

interface Prompt {
  category: string
  name: string
  version: number
  active: boolean
  updated: string
  usage_stats: {
    calls_last_7days: number
    avg_cost: number
    avg_duration: number
  }
}

interface PromptsData {
  prompts: Prompt[]
}

export default function PromptsPage({ initialData }: { initialData: PromptsData }) {
  const [data, setData] = useState<PromptsData>(initialData)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  const handleViewVersions = async (prompt: Prompt) => {
    setSelectedPrompt(prompt)

    try {
      const result = await fetchPromptVersions(prompt.category, prompt.name)
      setVersions(result.versions)
      setShowVersionHistory(true)
    } catch (error) {
      console.error('Failed to fetch versions:', error)
      alert('取得版本歷史失敗')
    }
  }

  const handleClearCache = async (category?: string, name?: string) => {
    const confirmMessage = category && name
      ? `確定要清除 ${category}/${name} 的快取嗎?`
      : category
      ? `確定要清除 ${category} 分類的所有快取嗎?`
      : '確定要清除所有 Prompt 快取嗎?'

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const result = await clearPromptCache(category, name)
      alert(result.message)
    } catch (error) {
      console.error('Failed to clear cache:', error)
      alert('清除快取失敗')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Prompt 管理</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 快取管理 */}
        <div className="mb-8">
          <CacheManager onClearCache={handleClearCache} />
        </div>

        {/* Prompt 列表 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Prompt 列表</h2>
          <PromptList
            prompts={data.prompts}
            onViewVersions={handleViewVersions}
          />
        </div>

        {/* 版本歷史 Modal */}
        {showVersionHistory && selectedPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  版本歷史: {selectedPrompt.category}/{selectedPrompt.name}
                </h2>
                <button
                  onClick={() => setShowVersionHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <PromptVersionHistory versions={versions} />
            </div>
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

    const data = await fetchPrompts(token)

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
- [ ] 版本歷史查詢正常
- [ ] 快取清除功能正常

---

### Step 7: 建立前端系統設定頁面

**位置**: `frontend/pages/admin/settings.tsx`

```typescript
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import SettingsEditor from '../../components/admin/SettingsEditor'
import { fetchSettings, updateSettings } from '../../lib/admin-api'

interface Settings {
  cost_budget: {
    monthly_limit: number
    alert_threshold: number
  }
  performance_alerts: {
    avg_duration_threshold: number
    failure_rate_threshold: number
  }
  external_services: {
    [key: string]: {
      api_key: string
      status: string
    }
  }
}

export default function SettingsPage({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [saving, setSaving] = useState(false)

  const handleSave = async (updates: Partial<Settings>) => {
    setSaving(true)

    try {
      await updateSettings(updates)
      setSettings({ ...settings, ...updates })
      alert('設定已儲存')
    } catch (error) {
      console.error('Failed to update settings:', error)
      alert('儲存設定失敗')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">系統設定</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <SettingsEditor
          settings={settings}
          onSave={handleSave}
          saving={saving}
        />
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

    const settings = await fetchSettings(token)

    return {
      props: {
        initialSettings: settings
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
- [ ] 設定儲存功能正常
- [ ] 表單驗證正確

---

### Step 8: 更新 API 呼叫封裝

**位置**: `frontend/lib/admin-api.ts` (新增以下函數)

```typescript
export async function fetchPrompts(token?: string) {
  return fetchWithAuth(`${API_URL}/api/admin/prompts`, token)
}

export async function fetchPromptVersions(category: string, name: string, token?: string) {
  return fetchWithAuth(
    `${API_URL}/api/admin/prompts/${category}/${name}/versions`,
    token
  )
}

export async function clearPromptCache(category?: string, name?: string, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/api/admin/prompts/clear-cache`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ category, name })
  })

  if (!response.ok) {
    throw new Error('Failed to clear cache')
  }

  return response.json()
}

export async function fetchSettings(token?: string) {
  return fetchWithAuth(`${API_URL}/api/admin/settings`, token)
}

export async function updateSettings(updates: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/api/admin/settings`, {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    throw new Error('Failed to update settings')
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

- [ ] **Prompt 管理功能**
  - [ ] 可正確顯示 Prompt 列表
  - [ ] 使用統計正確
  - [ ] 版本歷史查詢正常
  - [ ] 快取清除功能正常

- [ ] **系統設定功能**
  - [ ] 可正確顯示設定
  - [ ] 設定儲存功能正常
  - [ ] 設定驗證正確
  - [ ] API Key 遮罩正確

### 效能驗收

- [ ] Prompt 列表載入時間 < 2 秒
- [ ] 版本歷史查詢時間 < 1 秒
- [ ] 快取清除操作回應時間 < 1 秒
- [ ] 設定儲存回應時間 < 1 秒

### 安全性驗收

- [ ] 權限檢查正確
- [ ] API Key 不會完整顯示
- [ ] 檔案路徑安全 (防止路徑遍歷)
- [ ] Git 命令安全 (防止命令注入)

---

## 🐛 常見問題

### 問題 1: Git 命令執行失敗

**原因**: prompts 目錄不是 Git 倉庫

**解決方案**:
```bash
# 初始化 Git 倉庫
cd prompts
git init
git add .
git commit -m "Initial prompts"
```

---

### 問題 2: Redis KEYS 命令效能問題

**原因**: KEYS 命令會阻塞 Redis

**解決方案**:
```typescript
// 使用 SCAN 代替 KEYS
async function clearCacheWithScan(pattern: string) {
  let cursor = '0'
  let clearedCount = 0

  do {
    const result = await redis.scan(cursor, {
      MATCH: pattern,
      COUNT: 100
    })

    cursor = result.cursor

    for (const key of result.keys) {
      await redis.del(key)
      clearedCount++
    }
  } while (cursor !== '0')

  return clearedCount
}
```

---

### 問題 3: 設定儲存後沒有生效

**原因**: 應用程式需要重啟或重新載入設定

**解決方案**:
```typescript
// 實作設定熱重載機制
// 或在更新設定後發送訊號給應用程式
```

---

### 問題 4: API Key 在 Git 歷史中洩漏

**原因**: API Key 寫在程式碼中並 commit

**解決方案**:
```bash
# 使用 .env 檔案儲存 API Key
# 並將 .env 加入 .gitignore

# 如果已經 commit,使用 git-filter-repo 清除歷史
git filter-repo --path .env --invert-paths
```

---

## 📚 相關資源

### 官方文件
- [Redis SCAN Command](https://redis.io/commands/scan/)
- [Git Log Documentation](https://git-scm.com/docs/git-log)
- [Node.js Child Process](https://nodejs.org/api/child_process.html)

### 安全性
- [OWASP Command Injection](https://owasp.org/www-community/attacks/Command_Injection)
- [Path Traversal Attack Prevention](https://owasp.org/www-community/attacks/Path_Traversal)

---

## 🔄 更新記錄

| 日期 | 更新內容 | 更新者 |
|------|---------|--------|
| 2025-10-07 | 建立文件 | Claude |
