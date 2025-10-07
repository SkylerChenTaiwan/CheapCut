# Task 3.2: 登入/註冊頁面

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 3.2 |
| **Task 名稱** | 登入/註冊頁面 |
| **所屬 Phase** | Phase 3: 前端開發 |
| **預估時間** | 3-4 小時 (頁面建立 1h + Supabase 整合 1.5h + 測試 1.5h) |
| **難度** | ⭐⭐⭐ 中等偏難 |
| **前置 Task** | Task 3.1 (Next.js 專案設定) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的認證相關問題**:

1. **Supabase 連線錯誤**
   ```
   Error: Invalid JWT
          ^^^^^^^^^^^^  ← JWT token 無效或過期
   ```

2. **判斷錯誤類型**
   - `Invalid JWT` → Token 過期或設定錯誤
   - `Email not confirmed` → Email 尚未驗證
   - `Invalid login credentials` → 帳號密碼錯誤
   - `User already registered` → Email 已被註冊

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"登入不能用"  ← 太模糊
"Supabase 錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"Supabase Auth Next.js 14 setup"  ← 包含版本號
"Supabase signInWithPassword error"  ← 具體的 API 方法
"Next.js useRouter push not working"  ← 明確的問題
```

#### 🌐 推薦資源

**優先順序 1: 官方文件**
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Auth UI: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- Next.js Authentication: https://nextjs.org/docs/app/building-your-application/authentication

---

### Step 3: 檢查環境設定

```bash
# 檢查環境變數
cat .env.local | grep SUPABASE

# 應該看到:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# 檢查 Supabase 專案是否存在
# 到 https://app.supabase.com 確認
```

---

## 🎯 功能描述

建立完整的認證系統,包含登入、註冊、登出功能,整合 Supabase Auth。

### 為什麼需要這個?

- 🎯 **問題**: 沒有認證系統,無法識別用戶,也無法保護用戶資料
- ✅ **解決**: 使用 Supabase Auth 快速建立安全的認證系統
- 💡 **比喻**: 就像辦公大樓的門禁系統,確認身份後才能進入

### 完成後你會有:

- ✅ 登入頁面 (`/login`)
- ✅ 註冊頁面 (`/register`)
- ✅ Supabase Auth 整合
- ✅ 表單驗證
- ✅ 錯誤處理
- ✅ 登入後自動導向主頁
- ✅ 登出功能

---

## 📚 前置知識

### 1. Supabase Auth

**是什麼**: Supabase 提供的認證服務

**核心概念**:
- **signUp**: 註冊新用戶
- **signInWithPassword**: 用 email/password 登入
- **signOut**: 登出
- **Session**: 用戶登入狀態
- **JWT Token**: 用於驗證身份的 token

**為什麼選 Supabase Auth**:
- 完全託管,不用自己寫認證邏輯
- 免費層足夠使用
- 支援多種登入方式 (email, Google, GitHub 等)
- 與 Supabase 資料庫整合

### 2. React Hook Form

**是什麼**: React 的表單處理庫

**為什麼要用**:
- 效能好 (使用 uncontrolled components)
- 內建驗證
- TypeScript 支援好

**基本用法**:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = (data) => {
  console.log(data);
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("email", { required: true })} />
  {errors.email && <span>此欄位必填</span>}
</form>
```

### 3. Zod (驗證 schema)

**是什麼**: TypeScript-first 的 schema 驗證庫

**為什麼要用**:
- 型別安全
- 可重用驗證邏輯
- 錯誤訊息清楚

**基本用法**:
```typescript
const schema = z.object({
  email: z.string().email("Email 格式錯誤"),
  password: z.string().min(6, "密碼至少 6 個字元"),
});
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 3.1: Next.js 專案設定

### 套件依賴
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4"
  }
}
```

### Supabase 設定需求
- Supabase 專案已建立
- Email Auth 已啟用
- Supabase URL 和 Anon Key 已取得

---

## 📝 實作步驟

### 步驟 1: 安裝套件

```bash
# 在 frontend/ 目錄下執行
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs react-hook-form @hookform/resolvers zod
```

---

### 步驟 2: 建立 Supabase Client

建立 `lib/supabase/client.ts`:

```typescript
/**
 * Supabase 客戶端
 *
 * 為什麼需要這個?
 * - 統一管理 Supabase 連線
 * - 在整個應用中重用同一個 client
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * 建立 Supabase Client (用於 Client Components)
 *
 * 為什麼用 createClientComponentClient?
 * - 在 Client Components 中使用
 * - 自動處理 session 更新
 * - 與 Next.js cookies 整合
 */
export function createClient() {
  return createClientComponentClient();
}
```

建立 `lib/supabase/server.ts`:

```typescript
/**
 * Supabase Server Client
 *
 * 用於 Server Components 和 API Routes
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export function createServerClient() {
  return createServerComponentClient({ cookies });
}
```

---

### 步驟 3: 建立驗證 Schema

建立 `lib/validations/auth.ts`:

```typescript
/**
 * 認證相關的驗證 schema
 *
 * 為什麼要定義 schema?
 * - 統一驗證規則
 * - 可重用於前端和後端
 * - TypeScript 型別推導
 */

import { z } from 'zod';

/**
 * 登入表單驗證
 */
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email 為必填欄位')
    .email('Email 格式不正確'),
  password: z.string()
    .min(1, '密碼為必填欄位')
    .min(6, '密碼至少需要 6 個字元'),
});

/**
 * 註冊表單驗證
 */
export const registerSchema = z.object({
  email: z.string()
    .min(1, 'Email 為必填欄位')
    .email('Email 格式不正確'),
  password: z.string()
    .min(1, '密碼為必填欄位')
    .min(6, '密碼至少需要 6 個字元')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '密碼需包含大小寫字母和數字'
    ),
  confirmPassword: z.string()
    .min(1, '請確認密碼'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
});

/**
 * 型別推導
 * 從 schema 自動推導出 TypeScript 型別
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

---

### 步驟 4: 建立 Auth Context

建立 `lib/contexts/auth-context.tsx`:

```typescript
/**
 * Auth Context
 *
 * 為什麼需要 Context?
 * - 在整個應用中共享認證狀態
 * - 避免 prop drilling
 * - 統一管理用戶資訊
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // 監聽認證狀態變化
  useEffect(() => {
    // 取得當前 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // 登入
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    router.push('/materials');
    router.refresh();
  };

  // 註冊
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // 註冊成功後,可能需要等待 email 驗證
    // 這裡我們先導向登入頁
    router.push('/login');
  };

  // 登出
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    router.push('/login');
    router.refresh();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 *
 * 使用方式:
 * const { user, signIn, signOut } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

### 步驟 5: 在 Root Layout 加入 AuthProvider

修改 `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/contexts/auth-context";  // 新增

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
        <AuthProvider>  {/* 包裹整個應用 */}
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### 步驟 6: 建立登入頁面

建立 `app/(auth)/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
      toast({
        title: '登入成功',
        description: '歡迎回來!',
      });
    } catch (error: any) {
      toast({
        title: '登入失敗',
        description: error.message || '請檢查您的 Email 和密碼',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">登入</CardTitle>
          <CardDescription>
            輸入您的 Email 和密碼以登入
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密碼
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登入中...' : '登入'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            還沒有帳號?{' '}
            <Link href="/register" className="text-primary hover:underline">
              註冊
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
```

---

### 步驟 7: 建立註冊頁面

建立 `app/(auth)/register/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      await signUp(data.email, data.password);
      toast({
        title: '註冊成功',
        description: '請檢查您的 Email 以驗證帳號',
      });
    } catch (error: any) {
      toast({
        title: '註冊失敗',
        description: error.message || '註冊時發生錯誤',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">註冊</CardTitle>
          <CardDescription>
            建立您的 CheapCut 帳號
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密碼
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                密碼需包含大小寫字母和數字，至少 6 個字元
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                確認密碼
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '註冊中...' : '註冊'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            已經有帳號?{' '}
            <Link href="/login" className="text-primary hover:underline">
              登入
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
```

---

### 步驟 8: 建立 Auth Layout (可選)

建立 `app/(auth)/layout.tsx`:

```typescript
/**
 * Auth Layout
 *
 * 為什麼要單獨的 layout?
 * - 認證頁面不需要側邊欄等元素
 * - 可以有特殊的背景或樣式
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  );
}
```

---

### 步驟 9: 建立受保護的頁面範例

建立 `app/(main)/materials/page.tsx`:

```typescript
/**
 * 素材管理頁面 (範例)
 *
 * 這個頁面只有登入用戶可以訪問
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';

export default function MaterialsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>載入中...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">素材管理</h1>
          <Button variant="outline" onClick={() => signOut()}>
            登出
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-muted-foreground">
            歡迎, {user.email}
          </p>
          <p className="mt-4">
            這是素材管理頁面 (將在 Task 3.4 實作)
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### 步驟 10: 測試認證流程

```bash
# 啟動開發伺服器
npm run dev

# 測試流程:
# 1. 訪問 http://localhost:3000/register
# 2. 註冊新帳號
# 3. 檢查 Email 驗證信 (Supabase 會寄出)
# 4. 訪問 http://localhost:3000/login
# 5. 登入
# 6. 應該被導向 /materials
# 7. 點擊登出,應該被導回 /login
```

**預期結果**:
- ✅ 可以註冊新帳號
- ✅ 可以登入
- ✅ 登入後導向 /materials
- ✅ 可以登出
- ✅ 未登入時訪問 /materials 會被導回 /login

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (6 tests): 基礎檔案與元件
- 📁 **Functional Acceptance** (8 tests): 認證功能
- 📁 **E2E Acceptance** (4 tests): 完整認證流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-3.2

# 或分別執行
npm test -- task-3.2-verification.test.ts
npm test -- task-3.2-functional.test.ts
npm test -- task-3.2-e2e.test.ts
```

### 通過標準

- ✅ 所有 18 個測試通過 (6 + 8 + 4)
- ✅ 可以成功註冊新用戶
- ✅ 可以成功登入
- ✅ 登出功能正常
- ✅ 受保護頁面的訪問控制正確

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (6 tests)

1. ✓ Supabase Client 已建立
2. ✓ Auth Context 已建立
3. ✓ 驗證 Schema 已定義
4. ✓ 登入頁面已建立
5. ✓ 註冊頁面已建立
6. ✓ Auth Layout 已建立

### Functional Acceptance (8 tests)

1. ✓ 登入表單驗證正確
2. ✓ 註冊表單驗證正確
3. ✓ signIn 功能正常
4. ✓ signUp 功能正常
5. ✓ signOut 功能正常
6. ✓ Auth Context 狀態管理正確
7. ✓ 錯誤處理完善
8. ✓ Toast 通知正常

### E2E Acceptance (4 tests)

1. ✓ 完整註冊流程成功
2. ✓ 完整登入流程成功
3. ✓ 受保護頁面訪問控制正確
4. ✓ 登出後無法訪問受保護頁面

</details>

---

## 📋 完成檢查清單

### 套件安裝
- [ ] @supabase/supabase-js 已安裝
- [ ] @supabase/auth-helpers-nextjs 已安裝
- [ ] react-hook-form 已安裝
- [ ] zod 已安裝

### 核心檔案
- [ ] `lib/supabase/client.ts` 已建立
- [ ] `lib/supabase/server.ts` 已建立
- [ ] `lib/validations/auth.ts` 已建立
- [ ] `lib/contexts/auth-context.tsx` 已建立

### 頁面建立
- [ ] `app/(auth)/login/page.tsx` 已建立
- [ ] `app/(auth)/register/page.tsx` 已建立
- [ ] `app/(auth)/layout.tsx` 已建立
- [ ] `app/(main)/materials/page.tsx` 已建立 (範例)

### Supabase 設定
- [ ] Supabase 專案已建立
- [ ] Email Auth 已啟用
- [ ] 環境變數已設定
- [ ] 可以在 Supabase Dashboard 看到用戶

### 功能驗證
- [ ] 可以註冊新用戶
- [ ] 可以登入
- [ ] 可以登出
- [ ] 受保護頁面訪問控制正確
- [ ] 錯誤處理完善

### 測試驗收
- [ ] Basic Verification 測試通過 (6/6)
- [ ] Functional Acceptance 測試通過 (8/8)
- [ ] E2E Acceptance 測試通過 (4/4)
- [ ] **總計: 18/18 測試通過**

---

## 🐛 常見問題與解決方案

### Q1: Supabase 連線失敗

**錯誤訊息:**
```
Error: supabaseUrl is required
```

**解決方案:**

檢查環境變數是否正確設定:

```bash
# 檢查 .env.local
cat .env.local

# 應該看到:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# 重啟開發伺服器
npm run dev
```

---

### Q2: Email 驗證信沒收到

**問題**: 註冊後沒有收到驗證信

**解決方案:**

1. **檢查 Supabase Email 設定**:
   - 到 Supabase Dashboard > Authentication > Email Templates
   - 確認 "Confirm signup" 範本已啟用

2. **檢查垃圾郵件匣**

3. **暫時關閉 Email 驗證 (開發用)**:
   - Supabase Dashboard > Authentication > Settings
   - 關閉 "Enable email confirmations"

---

### Q3: JWT Token 過期

**錯誤訊息:**
```
Error: Invalid JWT
```

**解決方案:**

```typescript
// Supabase 會自動處理 token 更新
// 如果還是有問題,手動檢查 session:

const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Token 已過期,導向登入頁
  router.push('/login');
}
```

---

### Q4: 登入後沒有導向

**問題**: 登入成功但沒有跳轉頁面

**解決方案:**

確認 router.push 和 router.refresh 都有呼叫:

```typescript
await signIn(email, password);
router.push('/materials');
router.refresh();  // 重要! 更新 server components
```

---

### Q5: 表單驗證錯誤不顯示

**問題**: 輸入錯誤但沒有顯示錯誤訊息

**解決方案:**

檢查是否正確使用 react-hook-form:

```typescript
// 確認有傳入 resolver
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),  // 必須有這個
});

// 確認有顯示錯誤
{errors.email && (
  <p className="text-sm text-red-500">{errors.email.message}</p>
)}
```

---

## 📚 延伸學習資源

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
- **Next.js Authentication**: https://nextjs.org/docs/app/building-your-application/authentication

---

## ✅ Task 完成確認

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (18/18)
3. ✅ 完成檢查清單都勾選
4. ✅ 認證功能完整可用

**恭喜!** Task 3.2 完成了! 🎉

**下一步**: 繼續 Task 3.3 - 素材上傳介面

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
