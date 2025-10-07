# Task 1.3: 建立 API 基礎架構

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 1.3 |
| **Task 名稱** | 建立 API 基礎架構 |
| **所屬 Phase** | Phase 1: 基礎設施建立 |
| **預估時間** | 3-4 小時 (設計 1h + 實作 1.5h + 測試 1h + 除錯 0.5h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 1.1 (建立資料庫 Schema), Task 1.2 (設定 Supabase Auth) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息 (90% 的問題都會告訴你原因)

**執行時看到錯誤?** 別慌張,按照這個順序處理:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot find module 'express'
          ^^^^^^^^^^^^^^^^^^^^^^^^^^ ← 這是關鍵錯誤訊息
   ```

2. **判斷錯誤類型**
   - `Cannot find module` → 套件沒安裝
   - `Port 3000 is already in use` → 端口被佔用
   - `TypeError: ... is not a function` → 呼叫方式錯誤
   - `supabase is not defined` → 環境變數未設定

3. **先查本文件的「常見問題」章節** (在文末)

---

### Step 2: 上網搜尋 (有技巧的查資料)

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"Node.js 錯誤"  ← 太模糊
"建立 API 失敗" ← 沒有具體錯誤訊息
```

**✅ 好的搜尋方式**:
```
"Express Error Cannot find module express"  ← 包含完整錯誤訊息
"Supabase Auth middleware Node.js" ← 包含你在做的事情
"Node.js TypeScript setup" ← 具體的技術問題
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件** (最準確)
- Express.js: https://expressjs.com/
- Supabase: https://supabase.com/docs
- Node.js: https://nodejs.org/docs/

**優先順序 2: Stack Overflow** (有具體解答)
- 搜尋時加上 `site:stackoverflow.com`
- 看「✓ 已接受的答案」和「高讚數答案」

**優先順序 3: GitHub Issues** (社群討論)
- 搜尋 `site:github.com express issue your-error`

---

### Step 3: 檢查環境設定

很多問題是因為環境設定不對。執行這些檢查:

```bash
# 檢查 Node.js 版本
node --version
# 應該顯示 >= v18.0.0

# 檢查當前目錄 (應該在專案根目錄)
pwd

# 檢查 package.json 是否存在
ls package.json

# 檢查環境變數檔案是否存在
ls .env.local
```

---

### Step 4: 問題還是沒解決?

**準備以下資訊尋求協助**:

```markdown
## 問題描述
我在執行 Task 1.3 的步驟 X 時遇到問題

## 我執行的指令
```bash
[貼上完整的指令，不要只貼一部分]
```

## 完整錯誤訊息
```
[貼上完整的錯誤訊息]
```

## 我的環境
- Node.js 版本: [執行 node --version]
- 作業系統: macOS / Windows / Linux
- 環境變數是否設定: [是/否]

## 我已經嘗試過
1. [列出你嘗試過的方法]
2. [說明結果如何]
```

---

## 🎯 功能描述

建立 CheapCut 的 API 基礎架構,包含 Express.js 設定、路由結構、認證中介層、錯誤處理機制。

### 為什麼需要這個?

- 🎯 **問題**: 沒有 API 框架,前端無法與後端溝通
- ✅ **解決**: 建立完整的 RESTful API 架構,為後續功能開發提供基礎
- 💡 **比喻**: 就像蓋房子的樑柱,API 框架是整個系統的骨幹

### 完成後你會有:

- ✅ 完整的 Express.js 專案結構
- ✅ 統一的路由管理機制
- ✅ Supabase Auth 整合的認證中介層
- ✅ 完善的錯誤處理機制
- ✅ TypeScript 型別支援
- ✅ 開發環境熱重載

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. Express.js

**是什麼**: Node.js 的網頁應用框架

**你需要知道的**:
- 路由 (Route): 定義 API 端點 (例如: `GET /api/videos`)
- 中介層 (Middleware): 處理請求前的邏輯 (例如:驗證身份)
- 請求/回應 (Request/Response): 處理 HTTP 請求與回應
- 錯誤處理: 統一處理應用程式錯誤

### 2. TypeScript

**是什麼**: JavaScript 的超集,加上型別系統

**你需要知道的**:
- 型別定義: 明確變數的型別
- 介面 (Interface): 定義物件的結構
- async/await: 處理非同步操作
- 型別推斷: TypeScript 會自動推斷型別

### 3. RESTful API

**是什麼**: 網頁服務的設計風格

**你需要知道的**:
- HTTP 方法: GET(取得)、POST(建立)、PUT(更新)、DELETE(刪除)
- 狀態碼: 200(成功)、400(請求錯誤)、401(未授權)、500(伺服器錯誤)
- JSON 格式: API 回應的資料格式
- 端點設計: `/api/資源名稱/:id` 的命名規則

### 4. Middleware

**是什麼**: Express.js 的中介處理函數

**你需要知道的**:
- 執行順序: 依照定義順序執行
- next(): 呼叫下一個 middleware
- 錯誤處理: 特殊的 4 參數 middleware
- 驗證邏輯: 檢查 JWT token、權限等

---

## 🔗 前置依賴

### 必須先完成的 Task
- Task 1.1: 建立資料庫 Schema (需要資料庫結構)
- Task 1.2: 設定 Supabase Auth (需要認證功能)

### 系統需求
- Node.js >= 18.0.0
- npm 或 yarn
- Supabase 專案 (已在 Task 1.2 設定)

### 環境檢查
```bash
# 檢查 Node.js 版本
node --version
# 應該顯示 >= v18.0.0

# 檢查 npm 版本
npm --version
# 應該有任何版本

# 確認專案已初始化
ls package.json
# 應該看到 package.json 檔案
```

---

## 📝 實作步驟

### 步驟 1: 初始化 Node.js 專案與安裝套件

**為什麼需要這步驟**: 建立專案基礎結構與安裝必要的套件

在專案根目錄執行:

```bash
# 如果還沒有 package.json,先初始化
# (如果已經有了,跳過這步)
npm init -y

# 安裝 Express.js 核心套件
npm install express cors dotenv

# 安裝 TypeScript 相關套件
npm install --save-dev typescript @types/node @types/express @types/cors ts-node nodemon

# 安裝 Supabase 客戶端
npm install @supabase/supabase-js

# 安裝日期處理套件 (用於 log)
npm install date-fns
```

**預期輸出**:
```
added 150 packages, and audited 151 packages in 12s
found 0 vulnerabilities
```

**快速檢查**:
```bash
# 確認 package.json 中有這些套件
cat package.json | grep express
# 應該看到 "express": "^4.18.x"
```

---

### 步驟 2: 設定 TypeScript

**為什麼需要這步驟**: TypeScript 可以提供型別檢查,減少執行時錯誤

建立 TypeScript 設定檔:

```bash
# 建立 tsconfig.json
npx tsc --init
```

然後編輯 `tsconfig.json`,設定為:

**檔案**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**說明**:
- `outDir`: 編譯後的 JavaScript 檔案會放在 `dist/` 資料夾
- `rootDir`: 原始碼放在 `src/` 資料夾
- `strict`: 啟用嚴格的型別檢查
- `esModuleInterop`: 讓 CommonJS 與 ES Module 可以互相使用

**驗證**:
```bash
# 檢查 tsconfig.json 是否正確
npx tsc --noEmit
# 沒有錯誤訊息就是成功
```

---

### 步驟 3: 建立專案目錄結構

**為什麼需要這步驟**: 清楚的目錄結構讓程式碼易於維護

建立以下目錄結構:

```bash
# 建立目錄
mkdir -p src/routes
mkdir -p src/middleware
mkdir -p src/controllers
mkdir -p src/services
mkdir -p src/types
mkdir -p src/lib
mkdir -p src/utils
```

**目錄說明**:

```
src/
├── routes/          # API 路由定義
│   ├── index.ts     # 主路由檔案
│   ├── materials.routes.ts
│   ├── voiceovers.routes.ts
│   └── videos.routes.ts
├── middleware/      # 中介層
│   ├── auth.middleware.ts      # 認證中介層
│   └── error.middleware.ts     # 錯誤處理中介層
├── controllers/     # 控制器 (處理請求邏輯)
│   ├── materials.controller.ts
│   ├── voiceovers.controller.ts
│   └── videos.controller.ts
├── services/        # 業務邏輯服務
│   └── (後續 Task 會建立)
├── types/           # TypeScript 型別定義
│   ├── express.d.ts
│   └── api.types.ts
├── lib/             # 共用函式庫
│   └── supabase.ts  # Supabase 客戶端
├── utils/           # 工具函數
│   └── logger.ts    # 簡易 Logger
└── server.ts        # 主程式進入點
```

**檢查**:
```bash
# 確認目錄已建立
ls -la src/
# 應該看到所有資料夾
```

---

### 步驟 4: 建立環境變數檔案

**為什麼需要這步驟**: 敏感資訊 (API key) 不應該寫死在程式碼中

建立環境變數檔案:

**檔案**: `.env.local`

```bash
# Node 環境
NODE_ENV=development

# 伺服器設定
PORT=3000
API_PREFIX=/api

# Supabase 設定 (從 Task 1.2 取得)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# CORS 設定 (允許的前端網址)
CORS_ORIGIN=http://localhost:5173
```

**⚠️ 重要**:
- 將 `.env.local` 加入 `.gitignore`,避免提交到 Git
- 實際的 Supabase URL 和 Key 請從 Supabase Dashboard 取得

**建立 .gitignore** (如果還沒有):

**檔案**: `.gitignore`

```
# 環境變數
.env
.env.local
.env.production
.env.*.local

# 依賴
node_modules/

# 編譯輸出
dist/
build/

# Log
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db
```

**驗證**:
```bash
# 確認 .env.local 不會被 Git 追蹤
git status
# 不應該看到 .env.local
```

---

### 步驟 5: 建立 Supabase 客戶端

**為什麼需要這步驟**: 統一管理 Supabase 連線,避免重複程式碼

**檔案**: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// 確認環境變數存在
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 一般客戶端 (前端使用,有 RLS 限制)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 管理員客戶端 (後端使用,繞過 RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey!)

/**
 * 建立帶有用戶 token 的 Supabase 客戶端
 * 用於需要用戶身份的操作 (會受 RLS 限制)
 */
export function createSupabaseClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}
```

**說明**:
- `supabase`: 一般客戶端,受 RLS (Row Level Security) 限制
- `supabaseAdmin`: 管理員客戶端,可繞過 RLS,用於後端操作
- `createSupabaseClient`: 建立帶有用戶 token 的客戶端,用於需要用戶身份的操作

---

### 步驟 6: 建立 TypeScript 型別定義

**為什麼需要這步驟**: 定義 API 的輸入輸出型別,提供型別檢查

**檔案**: `src/types/express.d.ts`

```typescript
// 擴充 Express Request 型別,加入 user 資訊
import { User } from '@supabase/supabase-js'

declare global {
  namespace Express {
    interface Request {
      user?: User  // 認證後的用戶資訊
    }
  }
}
```

**說明**:
- 這個檔案擴充了 Express 的 Request 型別
- 加入 `user` 屬性,儲存認證後的用戶資訊
- 後續在 controller 中可以使用 `req.user` 取得用戶資訊

**檔案**: `src/types/api.types.ts`

```typescript
/**
 * API 統一回應格式
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId?: string
  }
}

/**
 * 分頁資訊
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

/**
 * 分頁回應
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta
}
```

**說明**:
- `ApiResponse`: 統一的 API 回應格式
- `PaginationMeta`: 分頁資訊
- `PaginatedResponse`: 帶分頁的回應格式

---

### 步驟 7: 建立認證中介層

**為什麼需要這步驟**: 保護 API 端點,確保只有登入用戶可以存取

**檔案**: `src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

/**
 * 認證中介層
 * 驗證 JWT token 並將用戶資訊加入 req.user
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 從 Authorization header 取得 token
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供認證 token'
        }
      })
    }

    // 取得 token (移除 "Bearer " 前綴)
    const token = authHeader.substring(7)

    // 驗證 token
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token 無效或已過期'
        }
      })
    }

    // 將用戶資訊加入 request
    req.user = data.user

    // 繼續執行下一個 middleware 或 controller
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: '認證過程發生錯誤'
      }
    })
  }
}

/**
 * 可選的認證中介層
 * 如果有 token 就驗證,沒有也可以繼續
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 沒有 token,繼續但不設定 req.user
      return next()
    }

    const token = authHeader.substring(7)
    const { data } = await supabase.auth.getUser(token)

    if (data.user) {
      req.user = data.user
    }

    next()
  } catch (error) {
    // 驗證失敗也繼續,只是不設定 req.user
    next()
  }
}
```

**說明**:
- `authMiddleware`: 強制認證,沒有 token 會回傳 401
- `optionalAuthMiddleware`: 可選認證,有 token 就驗證,沒有也可以繼續
- Token 從 `Authorization: Bearer <token>` header 取得
- 驗證成功後將用戶資訊存入 `req.user`

---

### 步驟 8: 建立錯誤處理中介層

**為什麼需要這步驟**: 統一處理錯誤,提供一致的錯誤回應格式

**檔案**: `src/middleware/error.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../types/api.types'

/**
 * 自訂錯誤類別
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * 錯誤處理中介層
 * 捕捉所有錯誤並回傳統一格式
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error occurred:', error)

  // 如果是自訂錯誤
  if (error instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    }

    return res.status(error.statusCode).json(response)
  }

  // 未知錯誤
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? '伺服器發生錯誤'
        : error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  }

  return res.status(500).json(response)
}

/**
 * 404 錯誤處理
 */
export function notFoundHandler(req: Request, res: Response) {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `找不到路由: ${req.method} ${req.path}`
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  }

  res.status(404).json(response)
}
```

**說明**:
- `AppError`: 自訂錯誤類別,包含錯誤代碼、訊息、狀態碼
- `errorHandler`: 統一錯誤處理,捕捉所有錯誤並回傳統一格式
- `notFoundHandler`: 處理 404 (找不到路由) 錯誤
- 開發環境會顯示詳細錯誤,正式環境只顯示通用訊息

---

### 步驟 9: 建立基礎路由

**為什麼需要這步驟**: 定義 API 端點,讓前端可以呼叫

**檔案**: `src/routes/index.ts`

```typescript
import { Router } from 'express'

const router = Router()

/**
 * 健康檢查端點
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: '1.0.0'
    }
  })
})

/**
 * API 資訊端點
 * GET /api
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'CheapCut API',
      version: '1.0.0',
      description: '低成本 AI 影片生成服務',
      endpoints: {
        health: '/api/health',
        materials: '/api/materials',
        voiceovers: '/api/voiceovers',
        videos: '/api/videos'
      }
    }
  })
})

// TODO: 後續 Task 會加入其他路由
// import materialsRoutes from './materials.routes'
// import voiceoversRoutes from './voiceovers.routes'
// import videosRoutes from './videos.routes'
//
// router.use('/materials', materialsRoutes)
// router.use('/voiceovers', voiceoversRoutes)
// router.use('/videos', videosRoutes)

export default router
```

**說明**:
- `/api/health`: 健康檢查端點,用於監控服務是否正常
- `/api`: API 資訊端點,列出所有可用的 API
- 後續 Task 會加入其他路由 (materials, voiceovers, videos)

---

### 步驟 10: 建立主程式進入點

**為什麼需要這步驟**: 啟動 Express 伺服器,整合所有設定

**檔案**: `src/server.ts`

```typescript
import express, { Express } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

// 載入環境變數
dotenv.config({ path: '.env.local' })

// 建立 Express 應用
const app: Express = express()
const PORT = process.env.PORT || 3000
const API_PREFIX = process.env.API_PREFIX || '/api'

// =====================================================
// Middleware 設定
// =====================================================

// CORS 設定 (允許前端呼叫 API)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

// JSON 解析
app.use(express.json())

// URL-encoded 解析
app.use(express.urlencoded({ extended: true }))

// 請求 Log (簡易版)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// =====================================================
// 路由設定
// =====================================================

// API 路由
app.use(API_PREFIX, routes)

// 根路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'CheapCut API Server',
      version: '1.0.0',
      apiEndpoint: API_PREFIX
    }
  })
})

// =====================================================
// 錯誤處理
// =====================================================

// 404 處理
app.use(notFoundHandler)

// 統一錯誤處理
app.use(errorHandler)

// =====================================================
// 啟動伺服器
// =====================================================

app.listen(PORT, () => {
  console.log('='.repeat(50))
  console.log('🚀 CheapCut API Server Started')
  console.log('='.repeat(50))
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📍 Server URL:  http://localhost:${PORT}`)
  console.log(`📍 API Endpoint: http://localhost:${PORT}${API_PREFIX}`)
  console.log(`📍 Health Check: http://localhost:${PORT}${API_PREFIX}/health`)
  console.log('='.repeat(50))
})

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  process.exit(0)
})

export default app
```

**說明**:
- 載入環境變數 (`.env.local`)
- 設定 CORS (允許前端跨域呼叫)
- 設定 JSON 解析
- 加入請求 Log
- 註冊路由
- 啟動伺服器
- 優雅關閉處理

---

### 步驟 11: 設定開發腳本

**為什麼需要這步驟**: 方便開發時啟動伺服器與自動重載

編輯 `package.json`,加入以下 scripts:

**檔案**: `package.json` (部分)

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

**說明**:
- `npm run dev`: 開發模式,使用 nodemon 自動重載
- `npm run build`: 編譯 TypeScript 為 JavaScript
- `npm start`: 執行編譯後的程式 (正式環境)

**建立 nodemon 設定**:

**檔案**: `nodemon.json`

```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/server.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
```

**說明**:
- 監聽 `src` 資料夾的所有 `.ts` 檔案
- 檔案變更時自動重啟伺服器
- 忽略測試檔案

---

### 步驟 12: 啟動並測試 API

**為什麼需要這步驟**: 驗證 API 是否正常運作

啟動開發伺服器:

```bash
# 啟動開發伺服器
npm run dev
```

**預期輸出**:
```
==================================================
🚀 CheapCut API Server Started
==================================================
📍 Environment: development
📍 Server URL:  http://localhost:3000
📍 API Endpoint: http://localhost:3000/api
📍 Health Check: http://localhost:3000/api/health
==================================================
```

**測試 API**:

開啟另一個終端機,執行:

```bash
# 測試根路由
curl http://localhost:3000

# 預期回應:
# {
#   "success": true,
#   "data": {
#     "message": "CheapCut API Server",
#     "version": "1.0.0",
#     "apiEndpoint": "/api"
#   }
# }

# 測試健康檢查
curl http://localhost:3000/api/health

# 預期回應:
# {
#   "success": true,
#   "data": {
#     "status": "healthy",
#     "timestamp": "2025-10-07T10:30:00.000Z",
#     "environment": "development",
#     "version": "1.0.0"
#   }
# }

# 測試 API 資訊
curl http://localhost:3000/api

# 預期回應:
# {
#   "success": true,
#   "data": {
#     "name": "CheapCut API",
#     "version": "1.0.0",
#     "description": "低成本 AI 影片生成服務",
#     "endpoints": {
#       "health": "/api/health",
#       "materials": "/api/materials",
#       "voiceovers": "/api/voiceovers",
#       "videos": "/api/videos"
#     }
#   }
# }

# 測試 404
curl http://localhost:3000/api/notfound

# 預期回應:
# {
#   "success": false,
#   "error": {
#     "code": "NOT_FOUND",
#     "message": "找不到路由: GET /api/notfound"
#   },
#   "meta": {
#     "timestamp": "2025-10-07T10:30:00.000Z"
#   }
# }
```

**驗證成功標準**:
- ✅ 伺服器成功啟動
- ✅ 根路由回傳正確資訊
- ✅ 健康檢查端點正常
- ✅ 404 錯誤處理正確
- ✅ 檔案變更時自動重載

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (5 tests): 基礎 API 功能
- 📁 **Functional Acceptance** (4 tests): 認證與錯誤處理
- 📁 **E2E Acceptance** (2 tests): 完整流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm test -- tests/phase-1/task-1.3

# 或分別執行
npm test -- tests/phase-1/task-1.3.basic.test.ts
npm test -- tests/phase-1/task-1.3.functional.test.ts
npm test -- tests/phase-1/task-1.3.e2e.test.ts
```

### 通過標準

- ✅ 所有 11 個測試通過 (5 + 4 + 2)
- ✅ API 伺服器可以啟動
- ✅ 健康檢查端點正常
- ✅ 認證中介層正確運作
- ✅ 錯誤處理完善

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/phase-1/task-1.3.basic.test.ts`

1. ✓ API 伺服器能夠啟動
2. ✓ 根路由回傳正確資訊
3. ✓ 健康檢查端點正常
4. ✓ API 資訊端點正常
5. ✓ TypeScript 編譯無錯誤

### Functional Acceptance (4 tests)

測試檔案: `tests/phase-1/task-1.3.functional.test.ts`

1. ✓ 認證中介層正確驗證 token
2. ✓ 認證中介層正確拒絕無效 token
3. ✓ 錯誤處理中介層正確捕捉錯誤
4. ✓ 404 錯誤處理正確

### E2E Acceptance (2 tests)

測試檔案: `tests/phase-1/task-1.3.e2e.test.ts`

1. ✓ 完整的 API 請求流程正確運作
2. ✓ 檔案變更時自動重載

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 專案結構
- [ ] `package.json` 已建立並包含所有必要套件
- [ ] `tsconfig.json` 已設定
- [ ] `.env.local` 已建立並設定環境變數
- [ ] `.gitignore` 已加入 `.env.local`
- [ ] 目錄結構完整 (src/routes, src/middleware, src/controllers 等)

### 核心檔案
- [ ] `src/lib/supabase.ts` 已建立 (Supabase 客戶端)
- [ ] `src/types/express.d.ts` 已建立 (型別擴充)
- [ ] `src/types/api.types.ts` 已建立 (API 型別定義)
- [ ] `src/middleware/auth.middleware.ts` 已建立 (認證中介層)
- [ ] `src/middleware/error.middleware.ts` 已建立 (錯誤處理)
- [ ] `src/routes/index.ts` 已建立 (基礎路由)
- [ ] `src/server.ts` 已建立 (主程式)

### 開發設定
- [ ] `nodemon.json` 已設定
- [ ] npm scripts 已設定 (dev, build, start)

### 測試
- [ ] 伺服器可以成功啟動 (`npm run dev`)
- [ ] 根路由正常 (`curl http://localhost:3000`)
- [ ] 健康檢查正常 (`curl http://localhost:3000/api/health`)
- [ ] 404 錯誤處理正常
- [ ] Basic Verification 測試通過 (5/5)
- [ ] Functional Acceptance 測試通過 (4/4)
- [ ] E2E Acceptance 測試通過 (2/2)
- [ ] **總計: 11/11 測試通過**

---

## 🐛 常見問題與解決方案

### Q1: `npm run dev` 失敗 - "Cannot find module 'express'"

**錯誤訊息**:
```
Error: Cannot find module 'express'
```

**原因**: 套件沒有安裝

**解決方案**:
```bash
# 重新安裝所有套件
npm install

# 確認 node_modules 資料夾存在
ls node_modules/
# 應該看到 express 資料夾
```

---

### Q2: 伺服器啟動失敗 - "Port 3000 is already in use"

**錯誤訊息**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**原因**: 端口 3000 已被其他程式佔用

**解決方案**:

**方法 1: 找出並關閉佔用端口的程式**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
# 記下 PID，然後執行:
taskkill /PID <PID> /F
```

**方法 2: 使用其他端口**
```bash
# 編輯 .env.local
PORT=3001

# 重新啟動伺服器
npm run dev
```

---

### Q3: TypeScript 編譯錯誤 - "Cannot find name 'process'"

**錯誤訊息**:
```
src/server.ts:5:20 - error TS2304: Cannot find name 'process'.
```

**原因**: 缺少 Node.js 型別定義

**解決方案**:
```bash
# 安裝 Node.js 型別定義
npm install --save-dev @types/node

# 確認 tsconfig.json 中有設定 types
cat tsconfig.json | grep types
# 應該看到: "types": ["node"]
```

---

### Q4: 認證中介層無法取得用戶 - "supabase is not defined"

**錯誤訊息**:
```
ReferenceError: supabase is not defined
```

**原因**: 環境變數未正確載入

**解決方案**:
```bash
# 確認 .env.local 檔案存在
ls .env.local

# 確認環境變數已設定
cat .env.local | grep SUPABASE_URL
# 應該看到: SUPABASE_URL=https://your-project.supabase.co

# 確認 server.ts 有載入 dotenv
cat src/server.ts | grep dotenv
# 應該看到: import dotenv from 'dotenv'
# 和: dotenv.config({ path: '.env.local' })

# 重新啟動伺服器
npm run dev
```

---

### Q5: CORS 錯誤 - 前端無法呼叫 API

**錯誤訊息** (在瀏覽器 Console):
```
Access to XMLHttpRequest at 'http://localhost:3000/api/health' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**原因**: CORS 設定不正確

**解決方案**:

**方法 1: 檢查 CORS 設定**
```typescript
// 在 src/server.ts 確認有以下設定:
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
```

**方法 2: 設定環境變數**
```bash
# 在 .env.local 中設定正確的前端網址
CORS_ORIGIN=http://localhost:5173
```

**方法 3: 允許所有來源 (僅開發環境)**
```typescript
// ⚠️ 僅用於開發環境
app.use(cors({
  origin: '*'
}))
```

---

### Q6: nodemon 沒有自動重載

**問題**: 修改程式碼後,伺服器沒有自動重啟

**解決方案**:

**檢查 nodemon.json 設定**:
```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/server.ts"
}
```

**手動重啟**:
```bash
# 停止伺服器 (Ctrl + C)
# 重新啟動
npm run dev
```

**如果還是不行,嘗試清除快取**:
```bash
# 刪除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安裝
npm install

# 重新啟動
npm run dev
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **Express.js 官方文件**: https://expressjs.com/
- **TypeScript 官方文件**: https://www.typescriptlang.org/docs/
- **Supabase Auth 文件**: https://supabase.com/docs/guides/auth
- **RESTful API 設計指南**: https://restfulapi.net/
- **Node.js 最佳實踐**: https://github.com/goldbergyoni/nodebestpractices

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ API 伺服器可以成功啟動
3. ✅ 所有三層驗收測試都通過 (11/11)
4. ✅ 完成檢查清單都勾選
5. ✅ 可以使用 curl 或 Postman 測試 API

### 最終驗收指令

```bash
# 啟動伺服器
npm run dev

# 開啟另一個終端機,執行測試
curl http://localhost:3000/api/health

# 執行所有驗收測試
npm test -- tests/phase-1/task-1.3

# 如果全部通過,你應該看到:
# PASS tests/phase-1/task-1.3.basic.test.ts
# PASS tests/phase-1/task-1.3.functional.test.ts
# PASS tests/phase-1/task-1.3.e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       11 passed, 11 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 1.3 完成了!

---

**下一步**: Task 1.4 - Redis 快取設定

---

**文件版本**: 1.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
