# Task 3.3: 素材上傳介面

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 3.3 |
| **Task 名稱** | 素材上傳介面 |
| **所屬 Phase** | Phase 3: 前端開發 |
| **預估時間** | 3-4 小時 (元件建立 1.5h + API 整合 1h + 測試 1.5h) |
| **難度** | ⭐⭐⭐ 中等偏難 |
| **前置 Task** | Task 3.2 (登入/註冊頁面) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的檔案上傳問題**:

1. **檔案太大錯誤**
   ```
   Error: File too large
          ^^^^^^^^^^^^^^^  ← 檔案超過限制
   ```

2. **判斷錯誤類型**
   - `File too large` → 檔案超過 250MB 限制
   - `Invalid file type` → 不是 MP4/MOV 格式
   - `Network error` → 網路連線問題
   - `CORS error` → 跨域請求設定錯誤

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"上傳不能用"  ← 太模糊
"檔案錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"Next.js file upload with progress"  ← 包含技術棧
"React drag and drop file upload"  ← 明確的功能
"FormData file upload fetch API"  ← 具體的實作方式
```

#### 🌐 推薦資源

**優先順序 1: 官方文件**
- MDN File API: https://developer.mozilla.org/en-US/docs/Web/API/File
- React Dropzone: https://react-dropzone.js.org/
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

### Step 3: 檢查檔案與網路

```bash
# 檢查檔案大小 (應該 < 250MB)
ls -lh video.mp4

# 檢查檔案格式
file video.mp4
# 應該顯示: video.mp4: ISO Media, MP4 v2

# 檢查網路連線
ping api.cheapcut.com

# 檢查後端 API
curl http://localhost:8080/api/materials/upload
```

---

## 🎯 功能描述

建立素材上傳介面,支援拖放上傳、進度顯示、錯誤處理,並整合後端 API。

### 為什麼需要這個?

- 🎯 **問題**: 用戶需要上傳影片素材,但沒有友善的上傳介面
- ✅ **解決**: 提供拖放上傳、進度條、預覽等功能
- 💡 **比喻**: 就像 Google Drive 的上傳介面,簡單直覺

### 完成後你會有:

- ✅ 拖放上傳介面 (Drag & Drop)
- ✅ 檔案選擇上傳 (File Input)
- ✅ 上傳進度條
- ✅ 檔案格式驗證 (MP4/MOV)
- ✅ 檔案大小限制 (250MB)
- ✅ 多檔案同時上傳
- ✅ 上傳錯誤處理
- ✅ 上傳成功後導向素材庫
- ✅ **上傳成本資訊展示 (預估儲存成本)**

---

## 📚 前置知識

### 1. HTML5 File API

**是什麼**: 瀏覽器提供的檔案處理 API

**核心概念**:
- **File**: 代表一個檔案物件
- **FileList**: 多個檔案的集合
- **FileReader**: 讀取檔案內容
- **FormData**: 用於上傳檔案的表單資料

**基本用法**:
```typescript
// 取得檔案
const file = event.target.files[0];

// 檢查檔案類型
if (file.type !== 'video/mp4') {
  alert('只支援 MP4 格式');
}

// 檢查檔案大小 (250MB = 250 * 1024 * 1024 bytes)
if (file.size > 250 * 1024 * 1024) {
  alert('檔案太大');
}
```

### 2. Drag and Drop API

**是什麼**: 瀏覽器的拖放 API

**為什麼要用**:
- 更好的使用者體驗
- 支援拖放檔案到網頁
- 現代應用的標準功能

**核心事件**:
- `onDragEnter`: 拖曳進入
- `onDragOver`: 拖曳經過 (必須 preventDefault)
- `onDragLeave`: 拖曳離開
- `onDrop`: 放下檔案

**基本用法**:
```typescript
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  // 處理檔案
};

<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={handleDrop}
>
  拖放檔案到這裡
</div>
```

### 3. 上傳進度追蹤

**是什麼**: 監控檔案上傳的進度

**為什麼需要**:
- 讓用戶知道上傳狀態
- 避免用戶以為頁面卡住
- 提升使用體驗

**實作方式**:
- 使用 `XMLHttpRequest` (有 progress 事件)
- 或使用 `fetch` + ReadableStream (較複雜)

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 3.1: Next.js 專案設定
- ✅ Task 3.2: 登入/註冊頁面

### 套件依賴
```json
{
  "dependencies": {
    "react-dropzone": "^14.2.3"
  }
}
```

### 後端 API 需求
- `POST /api/materials/upload`: 上傳素材 API (Task 2.1)

---

## 📝 實作步驟

### 步驟 1: 安裝套件

```bash
# 在 frontend/ 目錄下執行
npm install react-dropzone
```

**為什麼用 react-dropzone**:
- 處理了所有拖放邏輯
- 支援多檔案上傳
- 檔案驗證功能
- TypeScript 支援好

---

### 步驟 2: 建立上傳 Hook

建立 `lib/hooks/use-upload.ts`:

```typescript
/**
 * 檔案上傳 Hook
 *
 * 為什麼需要這個?
 * - 統一管理上傳邏輯
 * - 追蹤上傳進度
 * - 處理多檔案上傳
 */

'use client';

import { useState } from 'react';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function useUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());

  /**
   * 上傳單個檔案
   */
  const uploadFile = async (file: File) => {
    const fileName = file.name;

    // 初始化上傳狀態
    setUploads((prev) => new Map(prev).set(fileName, {
      fileName,
      progress: 0,
      status: 'pending',
    }));

    try {
      // 建立 FormData
      const formData = new FormData();
      formData.append('file', file);

      // 建立 XMLHttpRequest (因為 fetch 不支援 progress)
      const xhr = new XMLHttpRequest();

      // 監聽上傳進度
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploads((prev) => new Map(prev).set(fileName, {
            fileName,
            progress,
            status: 'uploading',
          }));
        }
      });

      // 上傳完成
      return new Promise<void>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            setUploads((prev) => new Map(prev).set(fileName, {
              fileName,
              progress: 100,
              status: 'success',
            }));
            resolve();
          } else {
            const error = xhr.responseText || '上傳失敗';
            setUploads((prev) => new Map(prev).set(fileName, {
              fileName,
              progress: 0,
              status: 'error',
              error,
            }));
            reject(new Error(error));
          }
        });

        xhr.addEventListener('error', () => {
          setUploads((prev) => new Map(prev).set(fileName, {
            fileName,
            progress: 0,
            status: 'error',
            error: '網路錯誤',
          }));
          reject(new Error('網路錯誤'));
        });

        // 發送請求
        xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/materials/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      setUploads((prev) => new Map(prev).set(fileName, {
        fileName,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : '上傳失敗',
      }));
      throw error;
    }
  };

  /**
   * 上傳多個檔案
   */
  const uploadFiles = async (files: File[]) => {
    const promises = files.map((file) => uploadFile(file));
    return Promise.allSettled(promises);
  };

  /**
   * 清除上傳記錄
   */
  const clearUploads = () => {
    setUploads(new Map());
  };

  /**
   * 移除單個上傳記錄
   */
  const removeUpload = (fileName: string) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileName);
      return newMap;
    });
  };

  return {
    uploads: Array.from(uploads.values()),
    uploadFile,
    uploadFiles,
    clearUploads,
    removeUpload,
  };
}
```

---

### 步驟 3: 建立檔案驗證工具

建立 `lib/utils/file-validation.ts`:

```typescript
/**
 * 檔案驗證工具
 *
 * 為什麼需要這個?
 * - 統一驗證邏輯
 * - 提供清楚的錯誤訊息
 */

const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime']; // MP4, MOV

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 驗證檔案類型
 */
export function validateFileType(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `不支援的檔案格式: ${file.type}。請使用 MP4 或 MOV 格式。`,
    };
  }
  return { valid: true };
}

/**
 * 驗證檔案大小
 */
export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / (1024 * 1024));
    return {
      valid: false,
      error: `檔案太大: ${sizeMB}MB。最大支援 250MB。`,
    };
  }
  return { valid: true };
}

/**
 * 驗證檔案 (類型 + 大小)
 */
export function validateFile(file: File): ValidationResult {
  const typeResult = validateFileType(file);
  if (!typeResult.valid) return typeResult;

  const sizeResult = validateFileSize(file);
  if (!sizeResult.valid) return sizeResult;

  return { valid: true };
}

/**
 * 格式化檔案大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
```

---

### 步驟 4: 建立上傳元件

建立 `components/materials/upload-dropzone.tsx`:

```typescript
/**
 * 素材上傳元件
 *
 * 功能:
 * - 拖放上傳
 * - 點擊選擇檔案
 * - 進度顯示
 * - 錯誤處理
 */

'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '@/lib/hooks/use-upload';
import { validateFile } from '@/lib/utils/file-validation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

export function UploadDropzone() {
  const { uploads, uploadFiles, removeUpload, clearUploads } = useUpload();
  const { toast } = useToast();

  /**
   * 處理檔案選擇
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // 驗證所有檔案
    const validFiles: File[] = [];
    const errors: string[] = [];

    acceptedFiles.forEach((file) => {
      const result = validateFile(file);
      if (result.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${result.error}`);
      }
    });

    // 顯示驗證錯誤
    if (errors.length > 0) {
      toast({
        title: '部分檔案無法上傳',
        description: errors.join('\n'),
        variant: 'destructive',
      });
    }

    // 上傳有效檔案
    if (validFiles.length > 0) {
      try {
        await uploadFiles(validFiles);
        toast({
          title: '上傳完成',
          description: `成功上傳 ${validFiles.length} 個檔案`,
        });
      } catch (error) {
        toast({
          title: '上傳失敗',
          description: error instanceof Error ? error.message : '未知錯誤',
          variant: 'destructive',
        });
      }
    }
  }, [uploadFiles, toast]);

  /**
   * 設定 react-dropzone
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
    },
    maxSize: 250 * 1024 * 1024, // 250MB
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* 拖放區域 */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12
          transition-colors cursor-pointer
          ${isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center">
          <Upload className="w-12 h-12 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg font-medium">放開以上傳檔案</p>
          ) : (
            <>
              <div>
                <p className="text-lg font-medium">
                  拖放影片檔案到這裡
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  或點擊選擇檔案
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                支援 MP4、MOV 格式，單檔最大 250MB
              </div>
            </>
          )}
        </div>
      </div>

      {/* 上傳進度列表 */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">上傳進度</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearUploads}
            >
              清除全部
            </Button>
          </div>

          <div className="space-y-2">
            {uploads.map((upload) => (
              <div
                key={upload.fileName}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {upload.status === 'success' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm truncate flex-1">
                      {upload.fileName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUpload(upload.fileName)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {upload.status === 'uploading' && (
                  <div className="space-y-1">
                    <Progress value={upload.progress} />
                    <p className="text-xs text-muted-foreground text-right">
                      {upload.progress}%
                    </p>
                  </div>
                )}

                {upload.status === 'error' && (
                  <p className="text-xs text-red-500">{upload.error}</p>
                )}

                {upload.status === 'success' && (
                  <p className="text-xs text-green-500">上傳成功</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 步驟 5: 安裝缺少的元件

```bash
# 安裝 Progress 元件
npx shadcn-ui@latest add progress

# 安裝 lucide-react 圖示庫 (如果還沒安裝)
npm install lucide-react
```

---

### 步驟 6: 建立上傳頁面

建立 `app/(main)/materials/upload/page.tsx`:

```typescript
/**
 * 素材上傳頁面
 */

import { UploadDropzone } from '@/components/materials/upload-dropzone';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="container max-w-4xl py-8">
      {/* 頁首 */}
      <div className="mb-8">
        <Link href="/materials">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回素材庫
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">上傳素材</h1>
        <p className="text-muted-foreground mt-2">
          上傳影片素材到您的素材庫，系統會自動分析並標記片段
        </p>
      </div>

      {/* 上傳元件 */}
      <UploadDropzone />

      {/* 說明 */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">上傳須知</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>支援格式: MP4、MOV</li>
          <li>單檔大小限制: 250MB</li>
          <li>上傳後系統會自動分析影片內容</li>
          <li>分析完成後會自動標記片段和生成縮圖</li>
          <li>分析時間約 30 秒 - 2 分鐘 (依影片長度而定)</li>
        </ul>
      </div>

      {/* 成本資訊 */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100">💰 預估成本</h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>• 儲存成本: 約 $0.02 USD/GB/月</p>
          <p>• 250MB 影片每月約 $0.005 USD</p>
          <p>• 分析成本: 約 $0.01 USD/分鐘</p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
            💡 提示: 上傳後可在素材庫查看實際成本累計
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### 步驟 7: 建立素材庫頁面 (臨時版本)

建立 `app/(main)/materials/page.tsx`:

```typescript
/**
 * 素材庫頁面 (臨時版本)
 *
 * 完整版本會在 Task 3.4 實作
 */

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function MaterialsPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">素材庫</h1>
          <p className="text-muted-foreground mt-2">
            管理您的影片素材
          </p>
        </div>
        <Link href="/materials/upload">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            上傳素材
          </Button>
        </Link>
      </div>

      <div className="border-2 border-dashed rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          尚未上傳任何素材
        </p>
        <Link href="/materials/upload">
          <Button className="mt-4">
            開始上傳
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

---

### 步驟 8: 建立 (main) Layout

建立 `app/(main)/layout.tsx`:

```typescript
/**
 * 主要功能頁面佈局
 *
 * 為什麼需要這個?
 * - (main) Route Group 需要自己的 layout
 * - 可以加入導航列、側邊欄等
 */

'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 檢查認證狀態
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 載入中
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>載入中...</p>
      </div>
    );
  }

  // 未登入
  if (!user) {
    return null;
  }

  // 已登入,顯示內容
  return (
    <div className="min-h-screen">
      {/* 導航列 */}
      <nav className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">CheapCut</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main>{children}</main>
    </div>
  );
}
```

---

### 步驟 9: 更新 Auth Context (加入 token 處理)

修改 `lib/contexts/auth-context.tsx`,在 API 呼叫時自動加入 token:

```typescript
// 在檔案最後加入這個工具函式

/**
 * 取得當前用戶的 token
 * 用於 API 呼叫
 */
export async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}
```

然後更新 `lib/hooks/use-upload.ts` 的 uploadFile 函式:

```typescript
import { getAuthToken } from '@/lib/contexts/auth-context';

// 在 xhr.open 之前加入
const token = await getAuthToken();
if (token) {
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
}
```

---

### 步驟 10: 測試上傳功能

```bash
# 啟動開發伺服器
npm run dev

# 開啟瀏覽器
# http://localhost:3000/materials/upload
```

**測試項目**:
1. ✅ 登入後可以訪問上傳頁面
2. ✅ 拖放檔案到上傳區域
3. ✅ 點擊上傳區域選擇檔案
4. ✅ 上傳進度條顯示
5. ✅ 檔案格式驗證 (試試上傳非影片檔案)
6. ✅ 檔案大小驗證 (試試上傳超過 250MB 的檔案)
7. ✅ 多檔案同時上傳
8. ✅ 錯誤訊息顯示

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (5 tests): 基礎元件與功能
- 📁 **Functional Acceptance** (7 tests): 上傳功能正確性
- 📁 **E2E Acceptance** (3 tests): 完整上傳流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-3.3

# 或分別執行
npm test -- task-3.3-verification.test.ts
npm test -- task-3.3-functional.test.ts
npm test -- task-3.3-e2e.test.ts
```

### 通過標準

- ✅ 所有 15 個測試通過 (5 + 7 + 3)
- ✅ 可以上傳檔案並看到進度
- ✅ 檔案驗證正確運作
- ✅ 錯誤訊息清楚顯示

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/acceptance/basic/task-3.3-verification.test.ts`

1. ✓ UploadDropzone 元件存在
2. ✓ use-upload Hook 存在
3. ✓ file-validation 工具存在
4. ✓ 上傳頁面存在
5. ✓ 素材庫頁面存在

### Functional Acceptance (7 tests)

測試檔案: `tests/acceptance/feature/task-3.3-functional.test.ts`

1. ✓ 拖放區域正確渲染
2. ✓ 檔案類型驗證正確 (只接受 MP4/MOV)
3. ✓ 檔案大小驗證正確 (最大 250MB)
4. ✓ 上傳進度追蹤正確
5. ✓ 多檔案同時上傳
6. ✓ 錯誤處理正確
7. ✓ 上傳成功後顯示正確狀態

### E2E Acceptance (3 tests)

測試檔案: `tests/acceptance/e2e/task-3.3-e2e.test.ts`

1. ✓ 完整上傳流程成功
2. ✓ 上傳失敗正確處理
3. ✓ 多檔案上傳流程正確

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 套件安裝
- [ ] react-dropzone 已安裝
- [ ] lucide-react 已安裝
- [ ] Progress 元件已安裝

### 核心檔案
- [ ] `lib/hooks/use-upload.ts` 已建立
- [ ] `lib/utils/file-validation.ts` 已建立
- [ ] `components/materials/upload-dropzone.tsx` 已建立
- [ ] `app/(main)/materials/upload/page.tsx` 已建立
- [ ] `app/(main)/materials/page.tsx` 已建立
- [ ] `app/(main)/layout.tsx` 已建立

### 功能驗證
- [ ] 拖放上傳功能正常
- [ ] 點擊選擇檔案功能正常
- [ ] 上傳進度顯示正確
- [ ] 檔案格式驗證正確
- [ ] 檔案大小驗證正確
- [ ] 多檔案上傳正常
- [ ] 錯誤訊息清楚顯示
- [ ] 上傳成功後狀態正確

### 測試驗收
- [ ] Basic Verification 測試通過 (5/5)
- [ ] Functional Acceptance 測試通過 (7/7)
- [ ] E2E Acceptance 測試通過 (3/3)
- [ ] **總計: 15/15 測試通過**

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `Cannot read property 'files'` | 事件物件錯誤 | 檢查 event.target.files 是否存在 |
| `CORS error` | 跨域設定問題 | 後端加入 CORS headers |
| `Request Entity Too Large` | 檔案超過伺服器限制 | 調整後端檔案大小限制 |
| `Failed to fetch` | 網路或 API 錯誤 | 檢查後端是否運行 |

---

### 問題 1: 拖放無法運作

**錯誤現象**: 拖曳檔案到區域,沒有任何反應

**解決方案**:

確認 `onDragOver` 有正確 preventDefault:

```typescript
<div
  onDragOver={(e) => {
    e.preventDefault(); // 必須要有
    e.stopPropagation();
  }}
  onDrop={handleDrop}
>
```

---

### 問題 2: 上傳進度不顯示

**錯誤現象**: 上傳時進度條不動,直接跳到 100%

**解決方案**:

確認使用 XMLHttpRequest,不是 fetch:

```typescript
// ❌ fetch 不支援 progress
const response = await fetch(url, { body: formData });

// ✅ 使用 XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', (e) => {
  // 更新進度
});
```

---

### 問題 3: CORS 錯誤

**錯誤訊息**:
```
Access to XMLHttpRequest at 'http://localhost:8080/api/materials/upload'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**解決方案**:

後端需要加入 CORS headers (這是後端的工作):

```go
// Go Gin 範例
router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:3000"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    AllowCredentials: true,
}))
```

前端可以暫時繞過 (僅開發環境):

```typescript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};
```

---

### 問題 4: 檔案太大無法上傳

**錯誤訊息**: `Request Entity Too Large` (413)

**解決方案**:

1. **檢查前端驗證**:
```typescript
// 確認有正確限制
const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB
```

2. **檢查後端限制** (這是後端的工作):
```go
// Go Gin 範例
router.MaxMultipartMemory = 250 << 20 // 250MB
```

---

### 問題 5: 上傳後沒有 token

**錯誤訊息**: `Unauthorized` (401)

**解決方案**:

確認 Auth Context 的 getAuthToken 有正確實作:

```typescript
// 檢查 token 是否正確取得
const token = await getAuthToken();
console.log('Token:', token); // 應該有值

// 確認有加入 header
xhr.setRequestHeader('Authorization', `Bearer ${token}`);
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **File API**: https://developer.mozilla.org/en-US/docs/Web/API/File
- **Drag and Drop API**: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
- **react-dropzone**: https://react-dropzone.js.org/
- **XMLHttpRequest**: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (15/15)
3. ✅ 完成檢查清單都勾選
4. ✅ 可以成功上傳檔案並看到進度

### 最終驗收指令

```bash
# 進入 frontend 目錄
cd frontend

# 執行驗收測試
npm run verify:task task-3.3

# 如果全部通過,你應該看到:
# PASS tests/acceptance/basic/task-3.3-verification.test.ts
# PASS tests/acceptance/feature/task-3.3-functional.test.ts
# PASS tests/acceptance/e2e/task-3.3-e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       15 passed, 15 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 3.3 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 遇到的主要問題與解決方法
- 學到的新知識 (Drag & Drop API, File Upload, Progress Tracking)
- 下次可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: 繼續 Task 3.4 - 素材庫管理

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
