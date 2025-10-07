# Task 1.2: 設定 Supabase Auth

## Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 1.2 |
| **Task 名稱** | 設定 Supabase Auth |
| **所屬 Phase** | Phase 1: 基礎設施建立 |
| **預估時間** | 2-3 小時 |
| **前置 Task** | Task 1.1 (建立資料庫 Schema) |
| **檔案位置** | `docs/implementation-plan/phase-1-infrastructure/task-1.2-supabase-auth.md` |

---

## 📝 狀態

**文件狀態**: ✅ 已完成

此文件提供完整的 Supabase Authentication 設定指南，包含詳細的實作步驟、測試方法和常見問題解決方案。

---

## 🆘 遇到問題怎麼辦?

如果在設定 Supabase Auth 過程中遇到問題，請按照以下步驟排查：

### Step 1: 檢查 Supabase 專案設定

**為什麼需要檢查**：
- Supabase Auth 功能需要專案正確初始化
- API Key 和 URL 必須正確才能連接
- Email 認證需要在後台啟用

**如何檢查**：

```bash
# 1. 檢查 .env.local 檔案是否存在
cat .env.local

# 應該看到類似以下內容：
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**如果沒有看到這些內容**：
1. 登入 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇你的專案
3. 前往 Settings > API
4. 複製 URL 和 anon key 到 `.env.local`

**如何驗證是否成功**：
```bash
# 在專案根目錄執行
npm run dev

# 應該不會看到 "Missing Supabase credentials" 錯誤
```

---

### Step 2: 檢查 Email Provider 設定

**為什麼需要檢查**：
- Supabase 預設會發送 Email 驗證信
- 如果 Email 設定錯誤，用戶無法完成註冊
- 開發環境需要使用 Supabase 提供的測試 Email

**如何檢查**：

1. 前往 Supabase Dashboard
2. 選擇 Authentication > Settings
3. 檢查 "Email Auth" 是否啟用（Toggle 應該是綠色）
4. 向下捲動到 "SMTP Settings"

**開發環境（推薦）**：
- 使用 Supabase 內建的 Email 服務
- 不需要設定 SMTP
- Email 會顯示在 Authentication > Users > Logs

**正式環境（未來）**：
- 需要設定自己的 SMTP（如 SendGrid、Resend）
- 目前 MVP 階段不需要

**如何驗證是否成功**：
1. 嘗試註冊一個新用戶
2. 前往 Authentication > Logs
3. 應該看到 "User signed up" 記錄
4. 如果有發送 Email，會看到 "Email sent" 記錄

---

### Step 3: 檢查 RLS Policies 設定

**為什麼需要檢查**：
- Row Level Security (RLS) 會阻擋未授權的資料存取
- 如果 Policies 設定錯誤，即使登入成功也無法存取資料
- 這是最常見的「為什麼登入後還是看不到資料」問題

**如何檢查**：

```bash
# 連接到 Supabase 資料庫
# 方法 1: 使用 Supabase Dashboard 的 SQL Editor
# 方法 2: 使用 psql (如果你有安裝)

# 執行以下 SQL 檢查 RLS 是否啟用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

# 應該看到所有資料表的 rowsecurity 欄位都是 true
```

**常見錯誤**：

❌ **錯誤 1**: RLS 啟用但沒有 Policy
```
錯誤訊息：Error: new row violates row-level security policy for table "videos"
原因：資料表啟用了 RLS，但沒有任何 Policy 允許操作
```

**解決方式**：
```sql
-- 檢查是否有 Policy
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'videos';

-- 如果沒有任何結果，需要建立 Policy（參考 Task 1.1）
```

❌ **錯誤 2**: Policy 使用錯誤的函數
```
錯誤訊息：function auth.uid() does not exist
原因：Supabase 版本太舊，或者連接的不是 Supabase 資料庫
```

**解決方式**：
- 確認使用的是 Supabase 託管的 PostgreSQL
- 檢查 Supabase 版本（應該是 v2.0+）

**如何驗證是否成功**：
```javascript
// 在前端執行測試
const { data, error } = await supabase
  .from('videos')
  .select('*')
  .limit(1);

console.log('Data:', data);  // 應該回傳空陣列 [] (如果沒有資料)
console.log('Error:', error); // 應該是 null (沒有錯誤)

// 如果 error 不是 null，代表 RLS Policy 有問題
```

---

### Step 4: 檢查前端與後端的 Token 傳遞

**為什麼需要檢查**：
- 前端登入後會取得 JWT Token
- 每次 API 請求都需要帶上這個 Token
- 後端需要驗證 Token 是否有效
- 如果 Token 沒有正確傳遞，會被視為未登入

**如何檢查（前端）**：

```javascript
// 1. 檢查是否有取得 Session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// 應該看到類似以下結構：
// {
//   access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
//   refresh_token: "...",
//   expires_at: 1234567890,
//   user: { id: "...", email: "..." }
// }

// 2. 檢查 Token 是否有儲存在 localStorage
console.log('Stored auth:', localStorage.getItem('supabase.auth.token'));
```

**如何檢查（後端 API）**：

```javascript
// 在 API Route 中
export default async function handler(req, res) {
  // 1. 檢查 Authorization Header
  console.log('Auth Header:', req.headers.authorization);

  // 應該看到：Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

  // 2. 驗證 Token
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  console.log('User:', user);   // 應該有 user 物件
  console.log('Error:', error); // 應該是 null
}
```

**常見錯誤**：

❌ **錯誤 1**: Token 沒有傳送
```
Headers: {} // 沒有 authorization
原因：前端沒有在 API 請求中加上 Token
```

**解決方式**：
```javascript
// 使用 Supabase Client 的內建功能（推薦）
const { data, error } = await supabase.from('videos').select('*');
// Supabase Client 會自動帶上 Token

// 如果使用 fetch()，需要手動加上
const session = await supabase.auth.getSession();
fetch('/api/videos', {
  headers: {
    'Authorization': `Bearer ${session.data.session.access_token}`
  }
});
```

---

## 功能描述

這個 Task 將設定 CheapCut 專案的使用者認證系統，使用 **Supabase Authentication** 作為認證服務。

### 為什麼需要使用者認證？

1. **資料隔離**：不同使用者的影片素材必須分開，用戶 A 不能看到用戶 B 的影片
2. **付費管理**：未來需要追蹤哪些用戶付費、使用額度等
3. **安全性**：只有登入的使用者才能使用系統功能
4. **使用追蹤**：記錄每個使用者的操作，方便追蹤問題和優化體驗

### 為什麼選擇 Supabase Auth？

| 優點 | 說明 |
|------|------|
| **快速整合** | 1-3 天就能完成，不用自己寫認證邏輯 |
| **免費額度大** | 5 萬月活躍用戶免費，MVP 階段完全夠用 |
| **功能齊全** | Email 驗證、密碼重設、OAuth 登入都內建 |
| **與資料庫整合** | 使用 `auth.uid()` 可以直接在 SQL 中取得當前用戶 ID |
| **安全性高** | JWT Token、密碼加密等安全機制都已處理好 |

### Supabase Auth 運作原理

```
┌─────────────┐                  ┌──────────────┐                 ┌─────────────┐
│             │   1. 註冊/登入    │              │  2. 驗證並產生   │             │
│   前端      │ ───────────────> │  Supabase    │  ──────────────> │  PostgreSQL │
│  (Next.js)  │                  │     Auth     │      JWT Token   │  (Database) │
│             │ <─────────────── │              │ <──────────────  │             │
│             │   3. 回傳 Token   │              │  4. 檢查用戶     │             │
└─────────────┘                  └──────────────┘                 └─────────────┘
       │                                                                  │
       │ 5. 每次 API 請求帶上 Token                                       │
       │                                                                  │
       └──────────────────────────────────────────────────────────────>  │
                                6. 驗證 Token，只回傳該用戶的資料
```

### 主要功能

完成這個 Task 後，系統將具備以下功能：

- ✅ **使用者註冊**：Email + 密碼註冊新帳號
- ✅ **Email 驗證**：新用戶需要驗證 Email 才能使用（可選）
- ✅ **使用者登入**：已註冊用戶登入系統
- ✅ **登入狀態維護**：使用 JWT Token 維持登入狀態，不用每次都輸入密碼
- ✅ **登出功能**：清除 Token，登出系統
- ✅ **密碼重設**：忘記密碼時可以重設（未來擴充）
- ✅ **RLS 整合**：資料表自動依據登入用戶過濾資料
- ✅ **Session 管理**：自動刷新 Token，保持登入狀態

---

## 前置知識

在開始實作前，你需要了解以下概念。這些知識會幫助你理解為什麼要這樣做，以及遇到問題時如何排查。

### 1. Supabase Authentication

**什麼是 Supabase？**

Supabase 是一個開源的 Firebase 替代品，提供以下服務：
- **PostgreSQL 資料庫**：關聯式資料庫
- **Authentication**：使用者認證系統
- **Storage**：檔案儲存
- **Realtime**：即時資料同步

我們使用 Supabase 的主要原因：
1. 免費額度大（5萬月活躍用戶）
2. 與 PostgreSQL 深度整合（可以在 SQL 中使用 `auth.uid()`）
3. 開發速度快（不用自己寫認證邏輯）

**Supabase Auth 的核心概念**：

| 概念 | 說明 | 範例 |
|------|------|------|
| **User** | 使用者帳號，儲存在 `auth.users` 表 | `{ id: "uuid", email: "user@example.com" }` |
| **Session** | 登入時段，包含 access_token 和 refresh_token | `{ access_token: "eyJ...", expires_at: 1234567890 }` |
| **JWT Token** | JSON Web Token，用來驗證使用者身份 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| **auth.uid()** | SQL 函數，回傳當前登入用戶的 ID | `SELECT * FROM videos WHERE user_id = auth.uid()` |

**認證流程**：

```javascript
// 1. 使用者註冊
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
// Supabase 會：
// - 建立新用戶記錄在 auth.users
// - 發送驗證 Email（如果啟用）
// - 回傳 Session（包含 JWT Token）

// 2. 使用者登入
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
// Supabase 會：
// - 驗證密碼是否正確
// - 產生新的 JWT Token
// - 回傳 Session

// 3. 取得當前用戶
const { data: { user } } = await supabase.auth.getUser();
// 從儲存的 Token 解析出用戶資訊

// 4. 登出
await supabase.auth.signOut();
// 清除本地儲存的 Token
```

---

### 2. JWT (JSON Web Token)

**什麼是 JWT？**

JWT 是一種用來傳遞認證資訊的格式，長得像這樣：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**JWT 的三個部分**（用 `.` 分隔）：

1. **Header**（標頭）：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
   ```json
   {
     "alg": "HS256",    // 加密演算法
     "typ": "JWT"       // Token 類型
   }
   ```

2. **Payload**（內容）：`eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`
   ```json
   {
     "sub": "1234567890",           // Subject (用戶 ID)
     "email": "user@example.com",   // 用戶 Email
     "iat": 1516239022,             // Issued At (發行時間)
     "exp": 1516242622              // Expiration (過期時間)
   }
   ```

3. **Signature**（簽章）：`SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
   - 使用 Secret Key 加密前兩部分
   - 用來驗證 Token 沒有被竄改

**為什麼使用 JWT？**

| 優點 | 說明 |
|------|------|
| **無狀態** | 伺服器不需要儲存 Session，所有資訊都在 Token 裡 |
| **可擴展** | 適合分散式系統（多台伺服器） |
| **跨域** | 可以在不同網域使用 |
| **包含資訊** | Token 裡就有用戶 ID，不用查資料庫 |

**如何使用 JWT？**

```javascript
// 前端：登入後取得 Token
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;

// 前端：每次 API 請求帶上 Token
fetch('/api/videos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 後端：驗證 Token 並取得用戶資訊
const token = req.headers.authorization.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(token);

if (error) {
  return res.status(401).json({ error: 'Unauthorized' });
}

// user.id 就是當前登入的用戶 ID
console.log('User ID:', user.id);
```

**JWT 的有效期限**：

- **Access Token**：通常 1 小時（Supabase 預設）
- **Refresh Token**：通常 7 天
- Token 過期後，Supabase Client 會自動用 Refresh Token 取得新的 Access Token

---

### 3. Row Level Security (RLS)

**什麼是 RLS？**

Row Level Security（行級安全）是 PostgreSQL 的功能，可以讓你在資料表層級設定「誰可以看到哪些資料」。

**為什麼需要 RLS？**

假設有以下情況：

```sql
-- videos 資料表
video_id | user_id                              | file_path
---------|--------------------------------------|-------------------
uuid-1   | aaa-111-aaa                          | /user-a/video1.mp4
uuid-2   | bbb-222-bbb                          | /user-b/video2.mp4
uuid-3   | aaa-111-aaa                          | /user-a/video3.mp4
```

**沒有 RLS 的情況**：
```javascript
// 用戶 A 登入後
const { data } = await supabase.from('videos').select('*');
// 結果：會看到所有用戶的影片！（這是安全漏洞）
```

**有 RLS 的情況**：
```sql
-- 建立 Policy
CREATE POLICY "users_can_only_see_own_videos" ON videos
  FOR SELECT
  USING (auth.uid() = user_id);
```

```javascript
// 用戶 A 登入後（user_id = 'aaa-111-aaa'）
const { data } = await supabase.from('videos').select('*');
// 結果：只會看到 uuid-1 和 uuid-3（只有自己的影片）
```

**RLS 的運作原理**：

```
1. 前端發送請求（帶著 JWT Token）
   ↓
2. Supabase 驗證 Token，取得 user_id = 'aaa-111-aaa'
   ↓
3. 執行 SQL 查詢時，自動加上 RLS Policy
   SELECT * FROM videos WHERE user_id = 'aaa-111-aaa'  -- 自動加上！
   ↓
4. 只回傳符合條件的資料
```

**RLS Policy 的種類**：

| Policy 類型 | 說明 | 範例 |
|------------|------|------|
| **SELECT** | 控制可以「看到」哪些資料 | 只能看到自己的影片 |
| **INSERT** | 控制可以「新增」哪些資料 | 只能新增到自己的帳號下 |
| **UPDATE** | 控制可以「修改」哪些資料 | 只能修改自己的影片 |
| **DELETE** | 控制可以「刪除」哪些資料 | 只能刪除自己的影片 |

**完整的 RLS Policy 範例**：

```sql
-- 1. 啟用 RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 2. 建立 SELECT Policy（查詢）
CREATE POLICY "users_select_own_videos" ON videos
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. 建立 INSERT Policy（新增）
CREATE POLICY "users_insert_own_videos" ON videos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. 建立 UPDATE Policy（修改）
CREATE POLICY "users_update_own_videos" ON videos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. 建立 DELETE Policy（刪除）
CREATE POLICY "users_delete_own_videos" ON videos
  FOR DELETE
  USING (auth.uid() = user_id);
```

**USING vs WITH CHECK 的差別**：

- **USING**：檢查「現有」的資料是否符合條件（用於 SELECT, UPDATE, DELETE）
- **WITH CHECK**：檢查「新增/修改後」的資料是否符合條件（用於 INSERT, UPDATE）

範例：
```sql
-- INSERT Policy
CREATE POLICY "users_insert_own_videos" ON videos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- 意思：只能新增 user_id = 自己 ID 的資料

-- 如果嘗試新增別人的資料會失敗：
INSERT INTO videos (user_id, file_path)
VALUES ('other-user-id', '/path');  -- ❌ 錯誤！

-- 只能新增自己的：
INSERT INTO videos (user_id, file_path)
VALUES (auth.uid(), '/path');  -- ✅ 成功
```

**為什麼 RLS 很重要？**

1. **安全性**：即使前端程式碼有漏洞，資料庫層級也會擋住
2. **簡化邏輯**：不用在每個查詢都加 `WHERE user_id = ?`
3. **一致性**：所有查詢都自動套用，不會忘記

---

### 4. Session 管理

**什麼是 Session？**

Session（時段）代表「使用者的一次登入」，包含：

```javascript
{
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // JWT Token
  refresh_token: "v1.abc123...",                            // 用來更新 Token
  expires_at: 1234567890,                                   // Token 過期時間
  expires_in: 3600,                                         // 多久後過期（秒）
  token_type: "bearer",                                     // Token 類型
  user: {                                                   // 使用者資訊
    id: "uuid",
    email: "user@example.com",
    // ...
  }
}
```

**Session 的生命週期**：

```
1. 登入 (signIn)
   ↓
   建立新 Session（access_token 有效期 1 小時）
   ↓
2. 使用中
   ↓
   每次 API 請求帶著 access_token
   ↓
3. Token 快過期（55 分鐘後）
   ↓
   Supabase Client 自動用 refresh_token 換新的 access_token
   ↓
4. 繼續使用
   ↓
5. 登出 (signOut)
   ↓
   清除 Session
```

**Supabase Client 會自動處理的事情**：

1. **儲存 Session**：自動存在 `localStorage`
2. **自動刷新 Token**：Token 快過期時自動更新
3. **監聽狀態變化**：登入/登出時觸發事件

```javascript
// 監聽認證狀態變化
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Event:', event);  // 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'
  console.log('Session:', session);
});

// 常見事件：
// - SIGNED_IN: 使用者登入
// - SIGNED_OUT: 使用者登出
// - TOKEN_REFRESHED: Token 自動更新
// - USER_UPDATED: 使用者資訊更新
```

**手動管理 Session（通常不需要）**：

```javascript
// 取得當前 Session
const { data: { session } } = await supabase.auth.getSession();

// 手動刷新 Session
const { data: { session }, error } = await supabase.auth.refreshSession();

// 設定 Session（例如從 Server-Side 取得）
await supabase.auth.setSession({
  access_token: 'xxx',
  refresh_token: 'yyy'
});
```

---

## 前置依賴

### 檔案依賴

- **Task 1.1 完成**：資料庫 Schema 已建立，RLS Policies 已設定
- **Supabase 專案已建立**：需要有 Supabase 專案的 URL 和 API Key

### 套件依賴

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7"
  }
}
```

**套件說明**：

- `@supabase/supabase-js`：Supabase JavaScript Client，用於前端和後端
- `@supabase/auth-helpers-nextjs`：Next.js 專用的 Auth 輔助工具（簡化整合）

### 工具依賴

- **Supabase CLI**：用於本地開發和管理（可選）
- **Supabase 專案**：已在 [Supabase Dashboard](https://app.supabase.com/) 建立專案
- **Node.js 18+**：執行 Next.js 應用

---

## 實作步驟

### Step 1: 安裝 Supabase 套件

**為什麼需要這個步驟**：
- 需要安裝 Supabase Client 才能在程式中使用認證功能
- Next.js 專用的 auth-helpers 可以簡化整合流程

**執行指令**：

```bash
# 進入專案根目錄
cd /path/to/CheapCut

# 安裝 Supabase 相關套件
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

**預期輸出**：

```
added 12 packages, and audited 500 packages in 5s

150 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**如何驗證安裝成功**：

```bash
# 檢查套件版本
npm list @supabase/supabase-js

# 應該看到：
# @supabase/supabase-js@2.39.0
```

**常見錯誤**：

❌ **錯誤 1**: `npm ERR! ERESOLVE unable to resolve dependency tree`

**原因**：套件版本衝突

**解決方式**：
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs --legacy-peer-deps
```

---

### Step 2: 設定環境變數

**為什麼需要這個步驟**：
- Supabase Client 需要專案的 URL 和 API Key 才能連接
- 環境變數可以在不同環境（開發/測試/正式）使用不同設定
- API Key 屬於敏感資訊，不應該 commit 到 Git

**執行步驟**：

1. **取得 Supabase 專案資訊**：

前往 [Supabase Dashboard](https://app.supabase.com/)
- 選擇你的專案
- 點擊左側選單的 "Settings"（齒輪圖示）
- 選擇 "API"
- 你會看到兩個重要的資訊：

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
Project API keys:
  - anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **建立 `.env.local` 檔案**：

```bash
# 在專案根目錄建立環境變數檔案
touch .env.local

# 編輯檔案
nano .env.local
```

3. **加入以下內容**：

```bash
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key（只在後端使用，不要暴露在前端）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要說明**：

| 環境變數 | 用途 | 可否暴露在前端 |
|---------|------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案網址 | ✅ 可以（NEXT_PUBLIC_ 開頭） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 匿名 API Key，受 RLS 保護 | ✅ 可以 |
| `SUPABASE_SERVICE_ROLE_KEY` | 管理員 Key，繞過 RLS | ❌ 絕對不可以！ |

**為什麼 anon key 可以暴露？**
- anon key 受到 RLS 保護，只能存取被允許的資料
- 即使有人拿到 anon key，也無法存取其他用戶的資料

**為什麼 service_role key 不能暴露？**
- service_role key 可以繞過所有 RLS 限制
- 如果被壞人拿到，可以存取所有資料（非常危險！）

4. **將 `.env.local` 加入 `.gitignore`**：

```bash
# 檢查 .gitignore 是否已包含
cat .gitignore | grep .env.local

# 如果沒有，手動加入
echo ".env.local" >> .gitignore
```

**如何驗證設定成功**：

```bash
# 檢查環境變數是否載入
npm run dev

# 在瀏覽器 Console 執行
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
// 應該顯示你的 Supabase URL

console.log(process.env.SUPABASE_SERVICE_ROLE_KEY);
// 應該顯示 undefined（因為沒有 NEXT_PUBLIC_ 前綴，前端看不到）
```

---

### Step 3: 建立 Supabase Client

**為什麼需要這個步驟**：
- 需要一個統一的 Supabase Client 實例，供整個應用使用
- 避免每個檔案都重複建立 Client
- 方便未來切換設定或加入 middleware

**執行步驟**：

1. **建立 Client 檔案**：

```bash
# 建立 lib 目錄（如果不存在）
mkdir -p src/lib

# 建立 Supabase Client 檔案
touch src/lib/supabase.ts
```

2. **撰寫 Client 程式碼**：

開啟 `src/lib/supabase.ts`，加入以下內容：

```typescript
import { createClient } from '@supabase/supabase-js';

// 取得環境變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 檢查環境變數是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 建立 Supabase Client（前端使用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // 將 Session 儲存在 localStorage
    autoRefreshToken: true,      // 自動刷新 Token
    detectSessionInUrl: true     // 從 URL 檢測 Session（用於 OAuth）
  }
});

// 建立 Server-Side Client（後端使用，僅在需要時使用）
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceKey) {
    throw new Error('Missing Supabase Service Role Key');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,     // Server-Side 不需要持久化
      autoRefreshToken: false,   // Server-Side 不需要自動刷新
    }
  });
};
```

**程式碼說明**：

| 設定項 | 說明 | 為什麼需要 |
|-------|------|-----------|
| `persistSession: true` | 將 Session 儲存在 localStorage | 使用者關閉瀏覽器後重新開啟，仍保持登入狀態 |
| `autoRefreshToken: true` | 自動刷新過期的 Token | Token 過期前自動更新，使用者不會突然被登出 |
| `detectSessionInUrl: true` | 從 URL 檢測 Session | 用於 OAuth 登入（Google、Facebook 等） |

3. **建立 Type 定義（可選，但推薦）**：

```bash
touch src/types/database.types.ts
```

開啟 `src/types/database.types.ts`，加入基本型別：

```typescript
// 這個檔案會在 Task 1.1 完成後自動產生
// 目前先定義基本型別

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Video = {
  video_id: string;
  user_id: string;
  file_path: string;
  file_size: number;
  duration: number;
  status: 'pending' | 'analyzing' | 'analyzed' | 'failed';
  created_at: string;
  updated_at: string;
};

// 更多型別定義...
```

**如何驗證設定成功**：

建立測試檔案 `src/pages/test-auth.tsx`：

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestAuth() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    async function checkConnection() {
      try {
        // 嘗試取得當前用戶（即使沒登入也不會報錯）
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          setStatus(`Error: ${error.message}`);
        } else {
          setStatus('Supabase Client connected successfully! ✅');
        }
      } catch (err) {
        setStatus(`Exception: ${err}`);
      }
    }

    checkConnection();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Supabase Auth Test</h1>
      <p>Status: {status}</p>
    </div>
  );
}
```

執行測試：

```bash
npm run dev
# 前往 http://localhost:3000/test-auth
# 應該看到 "Supabase Client connected successfully! ✅"
```

---

### Step 4: 設定 Supabase Auth 選項

**為什麼需要這個步驟**：
- 需要在 Supabase Dashboard 啟用 Email 認證
- 設定 Email 範本和驗證流程
- 配置重定向 URL（用於 Email 驗證和密碼重設）

**執行步驟**：

1. **前往 Supabase Dashboard**

- 開啟 [Supabase Dashboard](https://app.supabase.com/)
- 選擇你的專案
- 點擊左側選單的 "Authentication"
- 選擇 "Providers"

2. **啟用 Email Provider**

- 找到 "Email" Provider（應該已經預設啟用）
- 確認 "Enable Email provider" 是開啟狀態（綠色 Toggle）
- 設定選項：

| 選項 | 建議設定 | 說明 |
|------|---------|------|
| **Confirm email** | ✅ 啟用（MVP 可關閉） | 用戶註冊後需驗證 Email |
| **Secure email change** | ✅ 啟用 | 變更 Email 需要驗證 |
| **Secure password change** | ✅ 啟用 | 變更密碼需要重新登入 |

**MVP 階段建議**：
- 關閉 "Confirm email"，讓測試更方便
- 正式上線前再開啟

3. **設定 Site URL 和 Redirect URLs**

- 點擊 "Configuration" > "URL Configuration"
- 設定以下 URL：

```
Site URL: http://localhost:3000

Redirect URLs (每行一個):
http://localhost:3000/auth/callback
http://localhost:3000/**
https://your-production-domain.com/auth/callback
https://your-production-domain.com/**
```

**為什麼需要這些 URL？**
- **Site URL**：預設的重定向網址
- **Redirect URLs**：允許重定向的白名單（防止釣魚攻擊）
- `/**` 代表允許該網域下的所有路徑

4. **設定 Email 範本（可選）**

- 點擊 "Email Templates"
- 可以自訂以下 Email：
  - Confirm signup（註冊驗證）
  - Magic Link（魔術連結登入）
  - Change Email Address（變更 Email）
  - Reset Password（重設密碼）

**MVP 階段**：使用預設範本即可

5. **設定密碼規則（可選）**

- 點擊 "Configuration" > "Policies"
- 設定密碼最小長度（預設 6 位）

```
Minimum password length: 8  (建議)
```

**如何驗證設定成功**：

```bash
# 沒有直接的驗證方式，但可以在下一步測試註冊功能時確認
```

---

### Step 5: 實作註冊功能

**為什麼需要這個步驟**：
- 註冊是使用者使用系統的第一步
- 測試 Supabase Auth 設定是否正確

**執行步驟**：

1. **建立註冊頁面元件**：

```bash
mkdir -p src/components/auth
touch src/components/auth/SignUpForm.tsx
```

2. **撰寫註冊表單**：

開啟 `src/components/auth/SignUpForm.tsx`：

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 呼叫 Supabase Auth API 註冊
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 可選：加入額外的用戶資料
          data: {
            display_name: email.split('@')[0], // 用 Email 前綴當顯示名稱
          }
        }
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        return;
      }

      // 檢查是否需要 Email 驗證
      if (data.user && !data.session) {
        setMessage('Success! Please check your email to confirm your account.');
      } else {
        setMessage('Success! You are now signed up and logged in.');
      }

      // 清空表單
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage(`Exception: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
          <small style={{ color: '#666' }}>
            At least 6 characters
          </small>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: message.includes('Error') ? '#fee' : '#efe',
            borderRadius: '4px',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
```

3. **建立註冊頁面**：

```bash
touch src/pages/signup.tsx
```

開啟 `src/pages/signup.tsx`：

```typescript
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return <SignUpForm />;
}
```

4. **測試註冊功能**：

```bash
# 啟動開發伺服器
npm run dev

# 前往 http://localhost:3000/signup
# 輸入 Email 和密碼（至少 6 位）
# 點擊 Sign Up
```

**預期結果**：

- ✅ 如果關閉 Email 驗證：顯示 "Success! You are now signed up and logged in."
- ✅ 如果開啟 Email 驗證：顯示 "Success! Please check your email to confirm your account."

**如何驗證註冊成功**：

方法 1：**檢查 Supabase Dashboard**
- 前往 Authentication > Users
- 應該看到剛註冊的用戶

方法 2：**檢查資料庫**
```sql
-- 在 Supabase SQL Editor 執行
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**常見錯誤**：

❌ **錯誤 1**: `Error: Invalid email or password`
```
原因：Email 格式錯誤，或密碼少於 6 位
解決方式：確認 Email 包含 @ 和 .，密碼至少 6 位
```

❌ **錯誤 2**: `Error: User already registered`
```
原因：該 Email 已經註冊過
解決方式：使用其他 Email，或在 Dashboard 刪除該用戶後重試
```

❌ **錯誤 3**: `Error: Unable to validate email address: invalid format`
```
原因：Email 格式不符合規範
解決方式：使用標準 Email 格式（例如：user@example.com）
```

---

### Step 6: 實作登入功能

**為什麼需要這個步驟**：
- 讓已註冊的用戶可以登入系統
- 取得 JWT Token，用於後續 API 請求

**執行步驟**：

1. **建立登入表單元件**：

```bash
touch src/components/auth/SignInForm.tsx
```

2. **撰寫登入表單**：

開啟 `src/components/auth/SignInForm.tsx`：

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 呼叫 Supabase Auth API 登入
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        return;
      }

      // 登入成功
      setMessage('Success! Redirecting...');

      // 等待 1 秒後跳轉到首頁
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      setMessage(`Exception: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Sign In</h2>
      <form onSubmit={handleSignIn}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: message.includes('Error') ? '#fee' : '#efe',
            borderRadius: '4px',
          }}
        >
          {message}
        </div>
      )}

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account?{' '}
        <a href="/signup" style={{ color: '#0070f3' }}>
          Sign Up
        </a>
      </p>
    </div>
  );
}
```

3. **建立登入頁面**：

```bash
touch src/pages/signin.tsx
```

開啟 `src/pages/signin.tsx`：

```typescript
import SignInForm from '@/components/auth/SignInForm';

export default function SignInPage() {
  return <SignInForm />;
}
```

4. **測試登入功能**：

```bash
# 前往 http://localhost:3000/signin
# 使用之前註冊的 Email 和密碼登入
```

**預期結果**：
- ✅ 顯示 "Success! Redirecting..."
- ✅ 1 秒後跳轉到首頁

**如何驗證登入成功**：

```javascript
// 在瀏覽器 Console 執行
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// 應該看到 Session 物件，包含 access_token 和 user
```

或檢查 localStorage：

```javascript
// 在瀏覽器 Console 執行
console.log(localStorage.getItem('sb-xxxxx-auth-token'));
// 應該看到 JWT Token
```

**常見錯誤**：

❌ **錯誤 1**: `Error: Invalid login credentials`
```
原因：Email 或密碼錯誤
解決方式：確認 Email 和密碼正確，注意大小寫
```

❌ **錯誤 2**: `Error: Email not confirmed`
```
原因：Email 尚未驗證（如果開啟 Email 驗證）
解決方式：前往 Email 收件匣，點擊驗證連結
或在 Dashboard 手動驗證：Authentication > Users > 選擇用戶 > Send confirmation email
```

---

### Step 7: 實作登出功能

**為什麼需要這個步驟**：
- 讓用戶可以安全登出系統
- 清除本地儲存的 Token

**執行步驟**：

1. **建立登出按鈕元件**：

```bash
touch src/components/auth/SignOutButton.tsx
```

2. **撰寫登出元件**：

開啟 `src/components/auth/SignOutButton.tsx`：

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }

      // 登出成功，跳轉到登入頁
      router.push('/signin');
    } catch (err) {
      alert(`Exception: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: loading ? '#ccc' : '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
```

3. **加入到頁面中測試**：

修改 `src/pages/index.tsx`（首頁）：

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SignOutButton from '@/components/auth/SignOutButton';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 檢查當前登入狀態
    checkUser();

    // 監聽認證狀態變化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // 清除監聽器
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Welcome to CheapCut!</h1>
        <p>Please <a href="/signin">sign in</a> or <a href="/signup">sign up</a> to continue.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome back, {user.email}!</h1>
      <p>User ID: {user.id}</p>
      <SignOutButton />
    </div>
  );
}
```

4. **測試登出功能**：

```bash
# 1. 先登入（如果還沒登入）
http://localhost:3000/signin

# 2. 登入後會跳轉到首頁，應該看到：
# "Welcome back, your-email@example.com!"
# 和一個 "Sign Out" 按鈕

# 3. 點擊 "Sign Out"
# 應該會跳轉回登入頁
```

**如何驗證登出成功**：

```javascript
// 在瀏覽器 Console 執行
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// 應該看到 null
```

---

### Step 8: 建立 Auth Context（可選但推薦）

**為什麼需要這個步驟**：
- 在整個應用中共享登入狀態
- 避免每個頁面都要重複檢查登入狀態
- 提供統一的認證方法

**執行步驟**：

1. **建立 AuthContext**：

```bash
mkdir -p src/contexts
touch src/contexts/AuthContext.tsx
```

2. **撰寫 Context**：

開啟 `src/contexts/AuthContext.tsx`：

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化：檢查當前 Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

3. **在 _app.tsx 中使用**：

修改 `src/pages/_app.tsx`：

```typescript
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

4. **在元件中使用 Auth Context**：

現在可以在任何元件中使用：

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      <p>Hello, {user.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

### Step 9: 建立受保護的 API Route

**為什麼需要這個步驟**：
- 後端 API 需要驗證使用者身份
- 確保只有登入用戶可以存取資料
- 從 Token 取得 user_id，用於 RLS 過濾

**執行步驟**：

1. **建立 API Route 輔助函數**：

```bash
mkdir -p src/lib/api
touch src/lib/api/auth.ts
```

2. **撰寫驗證函數**：

開啟 `src/lib/api/auth.ts`：

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

/**
 * 從 API Request 驗證使用者 Token
 * @returns User 物件，如果驗證失敗則 throw error
 */
export async function authenticateUser(req: NextApiRequest): Promise<User> {
  // 1. 從 Header 取得 Token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  // 2. 驗證 Token
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  return user;
}

/**
 * API Route Middleware：驗證並包裝 handler
 */
export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const user = await authenticateUser(req);
      await handler(req, res, user);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };
}
```

3. **建立受保護的 API**：

```bash
mkdir -p src/pages/api
touch src/pages/api/me.ts
```

開啟 `src/pages/api/me.ts`：

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/api/auth';

/**
 * GET /api/me
 * 回傳當前登入用戶的資訊
 */
export default withAuth(async (req, res, user) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // user 物件已經由 withAuth middleware 驗證並傳入
  res.status(200).json({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  });
});
```

4. **測試 API**：

```bash
# 方法 1: 在瀏覽器 Console 測試（需要先登入）
const { data: { session } } = await supabase.auth.getSession();
const response = await fetch('/api/me', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});
const data = await response.json();
console.log('User data:', data);

# 方法 2: 使用 curl（需要替換 TOKEN）
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:3000/api/me
```

**預期輸出**：

```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**如果沒有帶 Token**：

```bash
curl http://localhost:3000/api/me
```

**預期輸出**：

```json
{
  "error": "Missing or invalid authorization header"
}
```

---

### Step 10: 測試 RLS 整合

**為什麼需要這個步驟**：
- 驗證 Auth 與 RLS 的整合是否正確
- 確保用戶只能存取自己的資料

**執行步驟**：

1. **建立測試 API**：

```bash
touch src/pages/api/videos.ts
```

開啟 `src/pages/api/videos.ts`：

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/videos
 * 取得當前用戶的所有影片
 */
export default withAuth(async (req, res, user) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 因為已經登入，Supabase Client 會自動帶上 Token
  // RLS Policy 會自動過濾，只回傳該用戶的影片
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ videos });
});
```

2. **插入測試資料**：

前往 Supabase Dashboard > SQL Editor，執行：

```sql
-- 插入測試資料（需要替換 user_id）
-- 方法 1: 從 auth.users 取得你的 user_id
SELECT id, email FROM auth.users LIMIT 1;

-- 方法 2: 使用 auth.uid()（需要在前端執行）
-- 複製上面查詢到的 user_id，替換下面的 'YOUR_USER_ID_HERE'

INSERT INTO videos (user_id, file_path, file_size, duration, resolution, format, status)
VALUES
  ('YOUR_USER_ID_HERE', '/uploads/video1.mp4', 1024000, 60.5, '1920x1080', 'mp4', 'analyzed'),
  ('YOUR_USER_ID_HERE', '/uploads/video2.mp4', 2048000, 120.0, '1920x1080', 'mp4', 'analyzed');
```

3. **測試 API**：

```bash
# 在瀏覽器 Console 執行（需要先登入）
const { data: { session } } = await supabase.auth.getSession();
const response = await fetch('/api/videos', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});
const data = await response.json();
console.log('Videos:', data.videos);
```

**預期輸出**：

```json
{
  "videos": [
    {
      "video_id": "uuid-1",
      "user_id": "your-user-id",
      "file_path": "/uploads/video1.mp4",
      "file_size": 1024000,
      "duration": 60.5,
      "status": "analyzed",
      ...
    },
    {
      "video_id": "uuid-2",
      "user_id": "your-user-id",
      "file_path": "/uploads/video2.mp4",
      "file_size": 2048000,
      "duration": 120.0,
      "status": "analyzed",
      ...
    }
  ]
}
```

4. **測試 RLS 隔離**：

註冊第二個帳號，用第二個帳號登入，再次呼叫 `/api/videos`：

**預期結果**：
- 第二個帳號應該看不到第一個帳號的影片
- 回傳空陣列 `{ "videos": [] }`

這證明 RLS 正確運作！

---

## 驗收標準

### Basic Verification (基礎驗證)

**目標**: 驗證 Auth 設定是否成功

**測試檔案**: `tests/phase-1/task-1.2.basic.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import { supabase } from '../../src/lib/supabase';

describe('Task 1.2 - Basic: Supabase Auth Setup', () => {
  const runner = new TestRunner('basic');
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123456';

  it('應該能夠連接 Supabase Auth', async () => {
    await runner.runTest('Auth 連接測試', async () => {
      // 嘗試取得當前用戶（即使沒登入也不會報錯）
      const { error } = await supabase.auth.getUser();

      // 只要沒有連接錯誤就算通過
      expect(error?.message).not.toContain('Failed to fetch');
    });
  });

  it('應該能夠註冊新使用者', async () => {
    await runner.runTest('使用者註冊測試', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      expect(error).toBeNull();
      expect(data.user).not.toBeNull();
      expect(data.user?.email).toBe(testEmail);
    });
  });

  it('應該能夠登入使用者', async () => {
    await runner.runTest('使用者登入測試', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      expect(error).toBeNull();
      expect(data.session).not.toBeNull();
      expect(data.session?.access_token).toBeDefined();
      expect(data.user?.email).toBe(testEmail);
    });
  });

  afterAll(async () => {
    // 清理：登出
    await supabase.auth.signOut();
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.2.basic.test.ts
```

**通過標準**:
- ✅ 能夠連接 Supabase Auth
- ✅ 能夠註冊新使用者
- ✅ 能夠登入使用者

---

### Functional Acceptance (功能驗收)

**目標**: 驗證認證功能完整性

**測試檔案**: `tests/phase-1/task-1.2.functional.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import { supabase } from '../../src/lib/supabase';

describe('Task 1.2 - Functional: Auth Operations', () => {
  const runner = new TestRunner('functional');
  const testEmail = `test-func-${Date.now()}@example.com`;
  const testPassword = 'Test123456';
  let accessToken: string;

  beforeAll(async () => {
    // 建立測試用戶
    await supabase.auth.signUp({ email: testEmail, password: testPassword });
  });

  it('應該正確處理登入/登出', async () => {
    await runner.runTest('登入登出測試', async () => {
      // 登入
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      expect(signInError).toBeNull();
      expect(signInData.session).not.toBeNull();

      accessToken = signInData.session!.access_token;

      // 檢查登入狀態
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      expect(getUserError).toBeNull();
      expect(user?.email).toBe(testEmail);

      // 登出
      const { error: signOutError } = await supabase.auth.signOut();
      expect(signOutError).toBeNull();

      // 檢查登出後狀態
      const { data: { session } } = await supabase.auth.getSession();
      expect(session).toBeNull();
    });
  });

  it('應該正確驗證 JWT Token', async () => {
    await runner.runTest('Token 驗證測試', async () => {
      // 先登入取得 Token
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      const token = signInData.session!.access_token;

      // 使用 Token 驗證用戶
      const { data: { user }, error } = await supabase.auth.getUser(token);

      expect(error).toBeNull();
      expect(user).not.toBeNull();
      expect(user?.email).toBe(testEmail);
    });
  });

  it('應該正確處理錯誤的密碼', async () => {
    await runner.runTest('錯誤密碼測試', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'WrongPassword123',
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Invalid');
      expect(data.session).toBeNull();
    });
  });

  afterAll(async () => {
    await supabase.auth.signOut();
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.2.functional.test.ts
```

**通過標準**:
- ✅ 登入/登出正確執行
- ✅ JWT Token 正確驗證
- ✅ 錯誤密碼被正確拒絕

---

### E2E Acceptance (端對端驗收)

**目標**: 驗證完整認證流程與 RLS 整合

**測試檔案**: `tests/phase-1/task-1.2.e2e.test.ts`

```typescript
import { TestRunner } from '../../src/lib/test-runner';
import { supabase } from '../../src/lib/supabase';

describe('Task 1.2 - E2E: Complete Auth Flow', () => {
  const runner = new TestRunner('e2e');
  const user1Email = `user1-${Date.now()}@example.com`;
  const user2Email = `user2-${Date.now()}@example.com`;
  const password = 'Test123456';
  let user1Id: string;
  let user2Id: string;

  it('應該能完整執行認證流程', async () => {
    await runner.runTest('完整認證流程測試', async () => {
      // 1. 註冊兩個用戶
      const { data: user1Data } = await supabase.auth.signUp({
        email: user1Email,
        password,
      });
      user1Id = user1Data.user!.id;

      await supabase.auth.signOut();

      const { data: user2Data } = await supabase.auth.signUp({
        email: user2Email,
        password,
      });
      user2Id = user2Data.user!.id;

      expect(user1Id).not.toBe(user2Id);

      // 2. User 1 登入並新增影片
      await supabase.auth.signOut();
      await supabase.auth.signInWithPassword({ email: user1Email, password });

      const { data: video1, error: insertError1 } = await supabase
        .from('videos')
        .insert({
          user_id: user1Id,
          file_path: '/test/user1-video.mp4',
          file_size: 1024,
          duration: 60,
          status: 'analyzed',
        })
        .select()
        .single();

      expect(insertError1).toBeNull();
      expect(video1).not.toBeNull();

      // 3. User 1 查詢，應該只看到自己的影片
      const { data: user1Videos, error: selectError1 } = await supabase
        .from('videos')
        .select('*');

      expect(selectError1).toBeNull();
      expect(user1Videos).toHaveLength(1);
      expect(user1Videos![0].user_id).toBe(user1Id);

      // 4. User 2 登入
      await supabase.auth.signOut();
      await supabase.auth.signInWithPassword({ email: user2Email, password });

      // 5. User 2 查詢，應該看不到 User 1 的影片
      const { data: user2Videos, error: selectError2 } = await supabase
        .from('videos')
        .select('*');

      expect(selectError2).toBeNull();
      expect(user2Videos).toHaveLength(0);  // User 2 沒有任何影片

      // 6. User 2 嘗試新增影片
      const { data: video2, error: insertError2 } = await supabase
        .from('videos')
        .insert({
          user_id: user2Id,
          file_path: '/test/user2-video.mp4',
          file_size: 2048,
          duration: 120,
          status: 'analyzed',
        })
        .select()
        .single();

      expect(insertError2).toBeNull();
      expect(video2).not.toBeNull();

      // 7. User 2 再次查詢，應該只看到自己的影片
      const { data: user2VideosAfter, error: selectError3 } = await supabase
        .from('videos')
        .select('*');

      expect(selectError3).toBeNull();
      expect(user2VideosAfter).toHaveLength(1);
      expect(user2VideosAfter![0].user_id).toBe(user2Id);
    });
  });

  afterAll(async () => {
    // 清理測試資料
    await supabase.auth.signOut();
    await runner.generateReport();
  });
});
```

**執行方式**:
```bash
npm test -- tests/phase-1/task-1.2.e2e.test.ts
```

**通過標準**:
- ✅ 完整的註冊、登入、登出流程正確運作
- ✅ RLS 正確隔離不同用戶的資料
- ✅ 錯誤處理完善

---

## 完成檢查清單

實作完成後，請依序檢查以下項目：

### 實作檢查
- [ ] Supabase 專案已建立並取得 API Key
- [ ] 環境變數已設定（.env.local）
- [ ] Supabase Client 已建立（src/lib/supabase.ts）
- [ ] Email 認證已啟用（Supabase Dashboard）
- [ ] 註冊功能已實作並測試成功
- [ ] 登入功能已實作並測試成功
- [ ] 登出功能已實作並測試成功
- [ ] AuthContext 已建立（可選）
- [ ] API Route 認證已實作
- [ ] RLS 整合已測試成功

### 測試檔案
- [ ] `tests/phase-1/task-1.2.basic.test.ts` 已建立
- [ ] `tests/phase-1/task-1.2.functional.test.ts` 已建立
- [ ] `tests/phase-1/task-1.2.e2e.test.ts` 已建立

### 驗收測試
- [ ] Basic 測試全部通過
- [ ] Functional 測試全部通過
- [ ] E2E 測試全部通過

### 文件與程式碼品質
- [ ] 程式碼已加上註解說明
- [ ] 環境變數已加入 .gitignore
- [ ] 所有敏感資訊（API Key）未 commit 到 Git

---

## 常見問題與解決方案

### Q1: 為什麼註冊後沒有自動登入？

**A**: 這取決於 Supabase 的 Email 驗證設定。

**情況 1**：如果**開啟** "Confirm email"
- 用戶註冊後需要驗證 Email
- `signUp()` 會回傳 `user` 但 `session` 為 `null`
- 用戶需要點擊 Email 驗證連結後才能登入

**情況 2**：如果**關閉** "Confirm email"（MVP 建議）
- 用戶註冊後立即登入
- `signUp()` 會回傳 `user` 和 `session`

**如何關閉 Email 驗證**：
1. 前往 Supabase Dashboard
2. Authentication > Settings
3. 找到 "Enable email confirmations"
4. 關閉 Toggle

**檢查方式**：
```javascript
const { data, error } = await supabase.auth.signUp({ email, password });

if (data.session) {
  console.log('已自動登入');
} else {
  console.log('需要驗證 Email');
}
```

---

### Q2: 為什麼我看不到其他環境變數（例如 DATABASE_URL）？

**A**: Next.js 的環境變數分為兩種：

1. **前端可見**：以 `NEXT_PUBLIC_` 開頭
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   ```
   - 可以在瀏覽器 Console 存取
   - 可以在 React 元件中使用

2. **後端專用**：沒有 `NEXT_PUBLIC_` 前綴
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=ey...
   DATABASE_URL=postgresql://...
   ```
   - **只能在 API Routes 和 getServerSideProps 中存取**
   - 前端完全看不到（這是安全機制）

**如何檢查**：

```javascript
// 前端（瀏覽器 Console）
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);  // ✅ 可見
console.log(process.env.SUPABASE_SERVICE_ROLE_KEY); // ❌ undefined

// 後端（API Route）
export default function handler(req, res) {
  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);  // ✅ 可見
  console.log(process.env.SUPABASE_SERVICE_ROLE_KEY); // ✅ 可見
  console.log(process.env.DATABASE_URL);              // ✅ 可見
}
```

**常見錯誤**：
- 在前端使用 `DATABASE_URL` → 回傳 `undefined`
- 忘記加 `NEXT_PUBLIC_` 前綴 → 前端看不到

---

### Q3: RLS Policy 擋住我的查詢怎麼辦？

**A**: 這是最常見的問題。RLS 啟用後，所有查詢都會被 Policy 過濾。

**症狀**：
```javascript
const { data, error } = await supabase.from('videos').select('*');
console.log(data);  // 空陣列 []，即使資料庫有資料
console.log(error); // null
```

**原因分析**：

1. **未登入**：
   - `auth.uid()` 回傳 `null`
   - Policy 條件 `auth.uid() = user_id` 永遠是 `false`
   - 結果：看不到任何資料

2. **登入了，但 user_id 不符**：
   - 資料的 `user_id` 是其他用戶的 ID
   - Policy 只允許看到自己的資料
   - 結果：看不到該筆資料

3. **Policy 設定錯誤**：
   - Policy 條件太嚴格
   - 或使用了錯誤的函數

**解決方式**：

**Step 1**：確認是否已登入
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

if (!user) {
  console.log('❌ 未登入，RLS 會擋住所有查詢');
} else {
  console.log('✅ 已登入，User ID:', user.id);
}
```

**Step 2**：確認資料的 user_id 是否正確
```sql
-- 在 Supabase SQL Editor 執行
SELECT video_id, user_id, file_path
FROM videos
LIMIT 10;

-- 檢查 user_id 是否與你的登入 ID 一致
```

**Step 3**：檢查 Policy 是否存在
```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'videos';
```

**Step 4**：暫時關閉 RLS 測試（只在開發環境！）
```sql
-- 暫時關閉 RLS（不要在正式環境做！）
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;

-- 測試查詢
SELECT * FROM videos LIMIT 5;

-- 確認後重新開啟
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
```

**Step 5**：使用 Service Role Key 繞過 RLS（只在後端！）
```typescript
// 只在 API Route 中使用！
import { createServerClient } from '@/lib/supabase';

export default async function handler(req, res) {
  const supabase = createServerClient(); // 使用 Service Role Key

  // 這會繞過 RLS，看到所有資料
  const { data } = await supabase.from('videos').select('*');

  res.json({ data });
}
```

---

### Q4: Token 過期後會怎樣？如何處理？

**A**: Supabase 的 Access Token 預設有效期是 1 小時。

**自動處理機制**：

Supabase Client 會**自動**處理 Token 過期：

1. **監測過期時間**：Client 內部會追蹤 `expires_at`
2. **自動刷新**：在 Token 過期前（約 55 分鐘）自動用 Refresh Token 換新的
3. **觸發事件**：刷新成功會觸發 `TOKEN_REFRESHED` 事件

```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token 已自動更新');
    console.log('新的 Token:', session?.access_token);
  }
});
```

**手動刷新**（通常不需要）：

```javascript
const { data, error } = await supabase.auth.refreshSession();

if (error) {
  console.log('刷新失敗，可能 Refresh Token 也過期了');
  // 需要重新登入
} else {
  console.log('手動刷新成功');
}
```

**Refresh Token 也過期了怎麼辦？**

Refresh Token 預設有效期 7 天。如果用戶超過 7 天沒使用系統：

1. Client 會嘗試刷新，但會失敗
2. 觸發 `SIGNED_OUT` 事件
3. 用戶需要重新登入

```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('Session 過期，請重新登入');
    router.push('/signin');
  }
});
```

**最佳實踐**：

```typescript
// 在 AuthContext 中處理
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_OUT') {
        // Token 過期，重定向到登入頁
        router.push('/signin');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

### Q5: 如何在 Server-Side (getServerSideProps) 中取得當前用戶？

**A**: Next.js 的 Server-Side 需要使用不同的方式取得 Session。

**方法 1**：使用 `@supabase/auth-helpers-nextjs`（推薦）

```bash
npm install @supabase/auth-helpers-nextjs
```

```typescript
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // 建立 Server-Side Supabase Client
  const supabase = createServerSupabaseClient(ctx);

  // 取得當前用戶
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // 未登入，重定向到登入頁
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    };
  }

  // 取得用戶的影片
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  return {
    props: {
      user: session.user,
      videos: videos ?? [],
    },
  };
}

export default function Page({ user, videos }) {
  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <ul>
        {videos.map((video) => (
          <li key={video.video_id}>{video.file_path}</li>
        ))}
      </ul>
    </div>
  );
}
```

**方法 2**：手動從 Cookie 解析 Token

```typescript
import { createServerClient } from '@/lib/supabase';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // 從 Cookie 取得 Token
  const token = ctx.req.cookies['sb-xxxxx-auth-token'];

  if (!token) {
    return {
      redirect: { destination: '/signin', permanent: false },
    };
  }

  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(
    JSON.parse(token).access_token
  );

  if (error || !user) {
    return {
      redirect: { destination: '/signin', permanent: false },
    };
  }

  return {
    props: { user },
  };
}
```

---

## 學習資源

- [Supabase Auth 官方文檔](https://supabase.com/docs/guides/auth)
- [JWT 介紹](https://jwt.io/introduction)
- [Row Level Security 詳解](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

## Task 完成確認

完成這個 Task 後，你應該能夠：

✅ 理解 Supabase Authentication 的運作原理
✅ 設定並使用 Supabase Auth 進行使用者註冊、登入、登出
✅ 理解 JWT Token 的概念與用途
✅ 理解 Row Level Security (RLS) 如何與 Auth 整合
✅ 在前端和後端正確驗證使用者身份
✅ 使用 RLS 自動隔離不同用戶的資料
✅ 建立受保護的 API Route
✅ 處理認證相關的錯誤情況

**下一步**: Task 1.3 - 建立 API 基礎架構

---

**文件版本**: 1.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
