# Task 3.1: Next.js 專案設定

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 3.1 |
| **Task 名稱** | Next.js 專案設定 |
| **所屬 Phase** | Phase 3: 前端開發 |
| **預估時間** | 2-3 小時 (初始化 1h + 設定 1h + 測試 1h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 2.15 (成本追蹤服務) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的 Next.js 設定問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot find module 'next'
          ^^^^^^^^^^^^^^^^^^^^^^^^  ← 套件沒安裝
   ```

2. **判斷錯誤類型**
   - `Cannot find module` → 套件沒安裝或路徑錯誤
   - `Module parse failed` → TypeScript/Babel 設定問題
   - `Port 3000 is already in use` → 端口被佔用
   - `Error: ENOSPC` → 檔案監視數量限制

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"Next.js 不能跑"  ← 太模糊
"專案設定錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"Next.js 14 TypeScript setup"  ← 包含版本號
"Tailwind CSS Next.js 14 configuration" ← 明確的設定問題
"Next.js app router vs pages router" ← 概念問題
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs/guides/nextjs
- shadcn/ui: https://ui.shadcn.com/docs/installation/next

**優先順序 2: 官方範例**
- Next.js Examples: https://github.com/vercel/next.js/tree/canary/examples

---

### Step 3: 檢查環境設定

```bash
# 檢查 Node.js 版本 (應該 >= 18)
node --version

# 檢查 npm 版本
npm --version

# 檢查當前目錄
pwd

# 清除 Next.js 快取
rm -rf .next
npm run dev
```

---

## 🎯 功能描述

建立 CheapCut 前端專案的基礎架構,包含 Next.js 14、TypeScript、Tailwind CSS 和 shadcn/ui 元件庫。

### 為什麼需要這個?

- 🎯 **問題**: 沒有統一的前端架構,每個頁面風格不一致,開發效率低
- ✅ **解決**: 使用 Next.js + Tailwind + shadcn/ui 建立統一的開發環境
- 💡 **比喻**: 就像蓋房子要先打地基,這個 Task 建立前端開發的基礎

### 完成後你會有:

- ✅ Next.js 14 專案 (使用 App Router)
- ✅ TypeScript 型別檢查
- ✅ Tailwind CSS 樣式系統
- ✅ shadcn/ui 元件庫
- ✅ 統一的專案結構
- ✅ 開發環境設定完成

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. Next.js 14 (App Router)

**是什麼**: React 的全端框架,提供路由、SSR、API Routes 等功能

**核心概念**:
- **App Router**: Next.js 13+ 的新路由系統,基於檔案系統
  - `app/page.tsx` → 首頁 (`/`)
  - `app/login/page.tsx` → 登入頁 (`/login`)
  - `app/layout.tsx` → 全域佈局
- **Server Components**: 預設在伺服器端渲染,效能更好
- **Client Components**: 用 `'use client'` 標記,可以使用瀏覽器 API

**為什麼選 Next.js**:
- 社群資源極豐富,遇到問題容易找解答
- Vercel 免費部署
- 整合度高,減少設定時間

### 2. TypeScript

**是什麼**: JavaScript 的超集,加入型別檢查

**為什麼要用**:
- 在開發時就能發現錯誤,不用等到執行時
- IDE 自動補全和提示
- 程式碼更易維護

**基本語法**:
```typescript
// 定義型別
interface User {
  id: string;
  email: string;
}

// 使用型別
const user: User = {
  id: '123',
  email: 'test@example.com'
}
```

### 3. Tailwind CSS

**是什麼**: Utility-first CSS 框架

**為什麼要用**:
- 快速開發,不用寫 CSS 檔案
- 一致的設計系統
- 檔案小,只打包用到的 class

**基本用法**:
```tsx
<div className="flex items-center justify-center bg-blue-500 text-white p-4">
  Hello World
</div>
```

### 4. shadcn/ui

**是什麼**: 高品質的 React 元件庫

**特色**:
- 不是 npm 套件,直接複製程式碼到專案
- 完全可控,可以自由修改
- 美觀且無障礙 (accessible)

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.15: 成本追蹤服務 (後端 API 已準備好)

### 系統需求
- Node.js >= 18.17.0
- npm >= 9.0.0
- Git

### 環境檢查
```bash
# 檢查 Node.js 版本
node --version
# 應該顯示 v18.x.x 或更高

# 檢查 npm 版本
npm --version
# 應該顯示 9.x.x 或更高
```

---

## 📝 實作步驟

### 步驟 1: 建立 Next.js 專案

在專案根目錄的**上層**執行 (因為我們要建立 `frontend` 資料夾):

```bash
# 使用 create-next-app 建立專案
npx create-next-app@latest frontend
```

**互動式選項**:
```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … No
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias (@/*)? … No
```

**為什麼這樣選**:
- TypeScript: ✅ 型別檢查
- ESLint: ✅ 程式碼品質檢查
- Tailwind CSS: ✅ 快速開發樣式
- src/ directory: ❌ 使用 app/ 目錄就夠了
- App Router: ✅ Next.js 14 的新標準
- Import alias: ❌ 使用預設的 `@/` 即可

**快速檢查**:
```bash
cd frontend
npm run dev
# 應該在 http://localhost:3000 看到 Next.js 預設頁面
```

---

### 步驟 2: 安裝 shadcn/ui

shadcn/ui 需要額外設定:

```bash
# 初始化 shadcn/ui
npx shadcn-ui@latest init
```

**互動式選項**:
```
✔ Would you like to use TypeScript (recommended)? … yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? … app/globals.css
✔ Would you like to use CSS variables for colors? … yes
✔ Are you using a custom tailwind prefix eg. tw-? … no
✔ Where is your tailwind.config.js located? … tailwind.config.ts
✔ Configure the import alias for components: … @/components
✔ Configure the import alias for utils: … @/lib/utils
✔ Are you using React Server Components? … yes
```

**為什麼這樣選**:
- TypeScript: ✅ 與專案一致
- Style: Default 是最通用的風格
- Base color: Slate 是中性色,適合大部分場景
- CSS variables: ✅ 方便自訂主題
- React Server Components: ✅ Next.js 14 預設使用

---

### 步驟 3: 安裝常用元件

安裝幾個專案會用到的基礎元件:

```bash
# 安裝 Button 元件
npx shadcn-ui@latest add button

# 安裝 Input 元件
npx shadcn-ui@latest add input

# 安裝 Card 元件
npx shadcn-ui@latest add card

# 安裝 Toast 通知元件
npx shadcn-ui@latest add toast

# 安裝 Alert 元件 (錯誤顯示用)
npx shadcn-ui@latest add alert
```

**為什麼需要這些**:
- Button: 各種按鈕操作
- Input: 表單輸入
- Card: 卡片式佈局 (素材展示、影片預覽等)
- Toast: 操作回饋通知
- Alert: 錯誤訊息顯示 (支援 Fail Fast 哲學)

---

### 步驟 4: 建立專案目錄結構

建立 CheapCut 前端的目錄結構:

```bash
# 在 frontend/ 目錄下執行
mkdir -p app/(auth)/login
mkdir -p app/(auth)/register
mkdir -p app/(main)/materials
mkdir -p app/(main)/generate
mkdir -p app/(main)/library
mkdir -p components/auth
mkdir -p components/materials
mkdir -p components/video
mkdir -p lib/api
mkdir -p lib/hooks
mkdir -p lib/types
mkdir -p public/icons
```

**目錄結構說明**:

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認證相關頁面群組
│   │   ├── login/                # 登入頁
│   │   │   └── page.tsx
│   │   └── register/             # 註冊頁
│   │       └── page.tsx
│   ├── (main)/                   # 主要功能頁面群組
│   │   ├── materials/            # 素材管理
│   │   │   └── page.tsx
│   │   ├── generate/             # 影片生成
│   │   │   └── page.tsx
│   │   └── library/              # 影片庫
│   │       └── page.tsx
│   ├── layout.tsx                # 全域佈局
│   └── page.tsx                  # 首頁
├── components/                   # React 元件
│   ├── ui/                       # shadcn/ui 元件 (自動生成)
│   ├── auth/                     # 認證相關元件
│   ├── materials/                # 素材相關元件
│   └── video/                    # 影片相關元件
├── lib/                          # 工具函式
│   ├── api/                      # API 呼叫
│   ├── hooks/                    # 自訂 React Hooks
│   ├── types/                    # TypeScript 型別定義
│   └── utils.ts                  # 通用工具 (shadcn 自動生成)
└── public/                       # 靜態資源
    └── icons/                    # 圖示檔案
```

**為什麼用 Route Groups `(auth)` 和 `(main)`?**
- Route Groups 不會影響 URL 路徑
- 可以為不同群組設定不同的 layout
- 例如: `(auth)` 群組可以有簡單的佈局,`(main)` 群組有側邊欄

---

### 步驟 5: 設定環境變數

建立 `.env.local`:

```bash
# 在 frontend/ 目錄下執行
cat > .env.local << 'EOF'
# API 端點
NEXT_PUBLIC_API_URL=http://localhost:8080

# Supabase (認證用)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EOF
```

**環境變數說明**:
- `NEXT_PUBLIC_*`: 前綴的變數會被打包到前端,可以在瀏覽器使用
- `NEXT_PUBLIC_API_URL`: 後端 API 的網址
- Supabase 變數: 用於認證功能

**更新 .gitignore**:
```bash
# 確認 .env.local 不會被 commit
cat .gitignore | grep .env.local
# 如果沒有,手動加入
echo ".env.local" >> .gitignore
```

---

### 步驟 6: 建立 API 客戶端

建立 `lib/api/client.ts`:

```typescript
/**
 * API 客戶端
 *
 * 為什麼需要這個?
 * - 統一管理 API 呼叫邏輯
 * - 自動處理錯誤
 * - 統一加入認證 token
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API 呼叫函式
 *
 * @param endpoint - API 端點 (例如: '/api/materials')
 * @param options - 請求選項
 */
export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  // 建立完整 URL
  const url = `${API_URL}${endpoint}`;

  // 準備請求選項
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // 如果有 body,加入請求
  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  // 發送請求
  const response = await fetch(url, fetchOptions);

  // 解析 JSON
  const data = await response.json();

  // 檢查錯誤
  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'API 錯誤', data);
  }

  return data as T;
}

/**
 * GET 請求
 */
export function apiGet<T>(endpoint: string, headers?: Record<string, string>) {
  return apiCall<T>(endpoint, { method: 'GET', headers });
}

/**
 * POST 請求
 */
export function apiPost<T>(
  endpoint: string,
  body: any,
  headers?: Record<string, string>
) {
  return apiCall<T>(endpoint, { method: 'POST', body, headers });
}

/**
 * PUT 請求
 */
export function apiPut<T>(
  endpoint: string,
  body: any,
  headers?: Record<string, string>
) {
  return apiCall<T>(endpoint, { method: 'PUT', body, headers });
}

/**
 * DELETE 請求
 */
export function apiDelete<T>(
  endpoint: string,
  headers?: Record<string, string>
) {
  return apiCall<T>(endpoint, { method: 'DELETE', headers });
}
```

---

### 步驟 7: 錯誤處理 UI 設計

建立 `components/ui/error-display.tsx`:

```typescript
/**
 * ErrorDisplay 元件
 *
 * 為什麼需要這個?
 * - 確保 Fail Fast 哲學能夠在前端正確呈現
 * - 統一的錯誤顯示介面
 * - 讓用戶清楚知道發生了什麼問題
 */

import { AlertCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, title = "發生錯誤", onRetry }: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert variant="destructive" className="my-4">
      <XCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm underline hover:no-underline"
          >
            重試
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * 頁面級錯誤邊界元件
 * 用於捕捉整個頁面的 React 錯誤
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <ErrorDisplay
            error={this.state.error || '未知錯誤'}
            title="頁面載入失敗"
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
```

**為什麼要這樣設計?**
- `ErrorDisplay`: 用於顯示 API 錯誤、驗證錯誤等預期內的錯誤
- `ErrorBoundary`: 用於捕捉 React 組件樹中的未預期錯誤
- 符合 Fail Fast 哲學: 明確顯示錯誤,不使用 fallback 掩蓋問題
- 提供重試選項,讓用戶可以嘗試恢復

**使用範例**:
```typescript
// API 錯誤處理
try {
  await apiCall('/api/materials');
} catch (error) {
  return <ErrorDisplay error={error} onRetry={() => refetch()} />;
}

// 頁面級錯誤邊界
export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

---

### 步驟 8: 建立型別定義

建立 `lib/types/index.ts`:

```typescript
/**
 * CheapCut 前端型別定義
 *
 * 為什麼需要這個?
 * - TypeScript 型別檢查
 * - IDE 自動補全
 * - 與後端 API 保持一致
 */

// ============================================
// 用戶相關
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  tier: 'free' | 'pro';
  quotaUsed: number;
  quotaLimit: number;
  createdAt: string;
}

// ============================================
// 素材相關
// ============================================

export interface Material {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  duration: number;
  size: number;
  uploadedAt: string;
}

export interface MaterialSegment {
  id: string;
  materialId: string;
  startTime: number;
  endTime: number;
  description?: string;
  tags: string[];
  thumbnailUrl?: string;
}

// ============================================
// 影片生成相關
// ============================================

export interface VideoGenerationJob {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  voiceoverUrl: string;
  selectedSegments: SelectedSegment[];
  outputVideoUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface SelectedSegment {
  segmentId: string;
  startTime: number;
  endTime: number;
  order: number;
}

// ============================================
// API Response 格式
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}
```

---

### 步驟 9: 建立全域佈局

修改 `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CheapCut - AI 影片自動剪輯",
  description: "用 AI 自動產製社群媒體短影片,極低成本大量產出",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

---

### 步驟 10: 建立首頁

修改 `app/page.tsx`:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold">
          CheapCut
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          用 AI 自動產製社群媒體短影片
          <br />
          極低成本,大量產出
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button variant="default" size="lg">
              開始使用
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              註冊帳號
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

### 步驟 11: 測試執行

```bash
# 啟動開發伺服器
npm run dev

# 開啟瀏覽器
# http://localhost:3000
```

**預期結果**:
- ✅ 看到 CheapCut 首頁
- ✅ 樣式正確顯示 (Tailwind CSS 生效)
- ✅ 按鈕可以點擊 (shadcn/ui Button 元件)
- ✅ 沒有 console 錯誤

**快速檢查**:
```bash
# TypeScript 編譯檢查
npm run build

# ESLint 檢查
npm run lint
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (5 tests): 基礎檔案與設定
- 📁 **Functional Acceptance** (6 tests): 功能正確性
- 📁 **E2E Acceptance** (3 tests): 完整流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-3.1

# 或分別執行
npm test -- task-3.1-verification.test.ts
npm test -- task-3.1-functional.test.ts
npm test -- task-3.1-e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ `npm run dev` 可以啟動開發伺服器
- ✅ `npm run build` 可以成功建置
- ✅ 首頁可以正常訪問

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/acceptance/basic/task-3.1-verification.test.ts`

1. ✓ Next.js 專案已初始化 (package.json, next.config.js 存在)
2. ✓ TypeScript 設定正確 (tsconfig.json 存在且格式正確)
3. ✓ Tailwind CSS 已安裝 (tailwind.config.ts 存在)
4. ✓ shadcn/ui 已初始化 (components/ui 目錄存在)
5. ✓ 專案目錄結構完整

### Functional Acceptance (6 tests)

測試檔案: `tests/acceptance/feature/task-3.1-functional.test.ts`

1. ✓ 開發伺服器可以啟動 (npm run dev)
2. ✓ TypeScript 編譯無錯誤 (npm run build)
3. ✓ ESLint 檢查通過 (npm run lint)
4. ✓ API 客戶端正確實作
5. ✓ 型別定義完整
6. ✓ 環境變數正確設定

### E2E Acceptance (3 tests)

測試檔案: `tests/acceptance/e2e/task-3.1-e2e.test.ts`

1. ✓ 完整建置流程成功
2. ✓ 首頁可以訪問且樣式正確
3. ✓ shadcn/ui 元件正常運作

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 專案初始化
- [ ] `frontend/` 目錄已建立
- [ ] Next.js 14 已安裝
- [ ] TypeScript 設定完成
- [ ] Tailwind CSS 設定完成
- [ ] shadcn/ui 已初始化

### 專案結構
- [ ] `app/` 目錄結構正確
- [ ] `components/` 目錄已建立
- [ ] `lib/` 目錄已建立
- [ ] Route Groups 設定正確

### 核心檔案
- [ ] `lib/api/client.ts` 已建立
- [ ] `lib/types/index.ts` 已建立
- [ ] `components/ui/error-display.tsx` 已建立 (錯誤處理 UI)
- [ ] `app/layout.tsx` 已設定
- [ ] `app/page.tsx` 已建立
- [ ] `.env.local` 已設定

### 元件安裝
- [ ] Button 元件已安裝
- [ ] Input 元件已安裝
- [ ] Card 元件已安裝
- [ ] Toast 元件已安裝
- [ ] Alert 元件已安裝 (錯誤顯示用)

### 功能驗證
- [ ] `npm run dev` 可以啟動
- [ ] `npm run build` 可以建置
- [ ] `npm run lint` 通過檢查
- [ ] 首頁可以正常訪問

### 測試驗收
- [ ] Basic Verification 測試通過 (5/5)
- [ ] Functional Acceptance 測試通過 (6/6)
- [ ] E2E Acceptance 測試通過 (3/3)
- [ ] **總計: 14/14 測試通過**

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `Cannot find module 'next'` | 套件沒安裝 | `npm install` |
| `Port 3000 is already in use` | 端口被佔用 | 關閉其他 Next.js 或改用其他 port |
| `Module parse failed` | TypeScript 設定問題 | 檢查 tsconfig.json |
| `Error: ENOSPC` | 檔案監視數量限制 | `echo fs.inotify.max_user_watches=524288 \| sudo tee -a /etc/sysctl.conf` |
| `Tailwind classes not working` | PostCSS 設定問題 | 檢查 tailwind.config.ts |

---

### 問題 1: create-next-app 失敗

**錯誤訊息:**
```
npm ERR! code ENOENT
npm ERR! syscall lstat
```

**解決方案:**
```bash
# 清除 npm 快取
npm cache clean --force

# 更新 npm
npm install -g npm@latest

# 重新執行
npx create-next-app@latest frontend
```

---

### 問題 2: shadcn/ui 初始化失敗

**錯誤訊息:**
```
Error: Could not find tailwind.config file
```

**解決方案:**

確認 Tailwind CSS 已正確安裝:

```bash
# 檢查 tailwind.config.ts 是否存在
ls -la tailwind.config.ts

# 如果不存在,重新安裝 Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p --ts
```

---

### 問題 3: TypeScript 型別錯誤

**錯誤訊息:**
```
Type 'string' is not assignable to type 'never'
```

**解決方案:**

檢查 tsconfig.json 設定:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

### 問題 4: 開發伺服器啟動很慢

**問題**: `npm run dev` 啟動需要很長時間

**解決方案:**

```bash
# 清除 .next 快取
rm -rf .next

# 清除 node_modules 重新安裝
rm -rf node_modules package-lock.json
npm install

# 重新啟動
npm run dev
```

---

### 問題 5: 環境變數無法讀取

**問題**: `process.env.NEXT_PUBLIC_API_URL` 是 undefined

**解決方案:**

1. **確認檔案名稱正確**: 必須是 `.env.local` (注意前面的點)
2. **確認變數前綴**: 前端可見的變數必須有 `NEXT_PUBLIC_` 前綴
3. **重新啟動開發伺服器**: 環境變數變更後需要重啟

```bash
# 停止開發伺服器 (Ctrl+C)
# 重新啟動
npm run dev
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **Next.js 14 官方文件**: https://nextjs.org/docs
- **App Router 指南**: https://nextjs.org/docs/app
- **Tailwind CSS 文件**: https://tailwindcss.com/docs
- **shadcn/ui 文件**: https://ui.shadcn.com
- **TypeScript 官方文件**: https://www.typescriptlang.org/docs/

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 可以執行 `npm run dev` 並看到首頁

### 最終驗收指令

```bash
# 進入 frontend 目錄
cd frontend

# 執行驗收測試
npm run verify:task task-3.1

# 如果全部通過,你應該看到:
# PASS tests/acceptance/basic/task-3.1-verification.test.ts
# PASS tests/acceptance/feature/task-3.1-functional.test.ts
# PASS tests/acceptance/e2e/task-3.1-e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 3.1 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 遇到的主要問題與解決方法
- 學到的新知識
- 下次可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: 繼續 Task 3.2 - 登入/註冊頁面

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
