# Task 3.4: 素材庫管理

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 3.4 |
| **Task 名稱** | 素材庫管理 |
| **所屬 Phase** | Phase 3: 前端開發 |
| **預估時間** | 3-4 小時 (UI 建立 1.5h + API 整合 1h + 測試 1.5h) |
| **難度** | ⭐⭐⭐ 中等偏難 |
| **前置 Task** | Task 3.3 (素材上傳介面) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的素材庫問題**:

1. **資料載入失敗**
   ```
   Error: Failed to fetch materials
          ^^^^^^^^^^^^^^^^^^^^^^^  ← API 呼叫失敗
   ```

2. **判斷錯誤類型**
   - `Failed to fetch` → API 無回應或網路問題
   - `Unauthorized` → 認證 token 失效
   - `No materials found` → 資料庫無資料
   - `Image failed to load` → 縮圖載入失敗

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"資料顯示不出來"  ← 太模糊
"素材庫錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"React infinite scroll implementation"  ← 具體功能
"Next.js Image component optimization"  ← 技術問題
"Debounce search input React"  ← 明確的實作需求
```

#### 🌐 推薦資源

**優先順序 1: 官方文件**
- Next.js Image: https://nextjs.org/docs/app/api-reference/components/image
- React Query: https://tanstack.com/query/latest/docs/react/overview
- SWR: https://swr.vercel.app/

---

### Step 3: 檢查 API 與資料

```bash
# 檢查後端 API 是否運行
curl http://localhost:8080/api/materials

# 應該回傳素材列表 JSON

# 檢查認證 token
# 在瀏覽器 Console:
localStorage.getItem('supabase.auth.token')

# 檢查資料庫
# 確認 materials 表有資料
```

---

## 🎯 功能描述

建立素材庫管理介面,顯示已上傳的素材、縮圖、標籤,支援搜尋和篩選功能。

### 為什麼需要這個?

- 🎯 **問題**: 用戶上傳了素材,但看不到,也無法管理
- ✅ **解決**: 提供素材列表、預覽、搜尋、篩選功能
- 💡 **比喻**: 就像照片庫,可以瀏覽、搜尋、分類照片

### 完成後你會有:

- ✅ 素材列表顯示 (Grid 佈局)
- ✅ 縮圖預覽
- ✅ 素材資訊 (檔名、時長、大小、上傳時間)
- ✅ 標籤顯示與篩選
- ✅ 搜尋功能 (依檔名搜尋)
- ✅ 分析狀態顯示 (分析中、已完成、失敗)
- ✅ 刪除素材功能
- ✅ 載入更多 (Infinite Scroll)

---

## 📚 前置知識

### 1. React Query / SWR (資料獲取)

**是什麼**: React 的資料獲取與快取庫

**為什麼要用**:
- 自動快取資料
- 自動重新獲取
- 載入狀態管理
- 錯誤處理

**基本用法 (SWR)**:
```typescript
import useSWR from 'swr';

const { data, error, isLoading } = useSWR('/api/materials', fetcher);

if (isLoading) return <div>載入中...</div>;
if (error) return <div>錯誤: {error.message}</div>;
return <div>資料: {data}</div>;
```

### 2. Next.js Image 元件

**是什麼**: Next.js 的圖片優化元件

**為什麼要用**:
- 自動圖片優化
- Lazy loading
- 響應式圖片
- 防止 Layout Shift

**基本用法**:
```typescript
import Image from 'next/image';

<Image
  src="/thumbnail.jpg"
  alt="縮圖"
  width={300}
  height={200}
  className="rounded-lg"
/>
```

### 3. Debounce (防抖動)

**是什麼**: 延遲執行函式,避免頻繁觸發

**為什麼需要**:
- 搜尋時避免每個字都發 API 請求
- 提升效能
- 減少伺服器負擔

**基本用法**:
```typescript
import { useDebouncedValue } from '@/lib/hooks/use-debounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 500); // 500ms 延遲

// 只有在停止輸入 500ms 後才會觸發搜尋
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 3.1: Next.js 專案設定
- ✅ Task 3.2: 登入/註冊頁面
- ✅ Task 3.3: 素材上傳介面

### 套件依賴
```json
{
  "dependencies": {
    "swr": "^2.2.4",
    "date-fns": "^3.0.0"
  }
}
```

### 後端 API 需求
- `GET /api/materials`: 取得素材列表 (Task 2.1)
- `GET /api/materials/:id`: 取得單一素材詳情
- `DELETE /api/materials/:id`: 刪除素材

---

## 📝 實作步驟

### 步驟 1: 安裝套件

```bash
# 在 frontend/ 目錄下執行
npm install swr date-fns
```

**為什麼用這些套件**:
- `swr`: 資料獲取與快取
- `date-fns`: 日期格式化

---

### 步驟 2: 建立 Debounce Hook

建立 `lib/hooks/use-debounce.ts`:

```typescript
/**
 * Debounce Hook
 *
 * 為什麼需要這個?
 * - 延遲執行,避免頻繁觸發
 * - 用於搜尋輸入框
 */

'use client';

import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

### 步驟 3: 建立素材 API Hook

建立 `lib/hooks/use-materials.ts`:

```typescript
/**
 * 素材資料 Hook
 *
 * 為什麼需要這個?
 * - 統一管理素材資料獲取
 * - 自動快取與重新獲取
 * - 提供載入狀態
 */

'use client';

import useSWR from 'swr';
import { Material } from '@/lib/types';
import { apiGet, apiDelete } from '@/lib/api/client';

/**
 * 取得素材列表
 */
export function useMaterials(params?: {
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}) {
  // 建立查詢字串
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.tags) queryParams.append('tags', params.tags.join(','));
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const url = `/api/materials${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<{
    materials: Material[];
    total: number;
  }>(url, apiGet);

  return {
    materials: data?.materials || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate, // 用於手動重新獲取
  };
}

/**
 * 刪除素材
 */
export async function deleteMaterial(id: string) {
  try {
    await apiDelete(`/api/materials/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '刪除失敗',
    };
  }
}
```

---

### 步驟 4: 建立素材卡片元件

建立 `components/materials/material-card.tsx`:

```typescript
/**
 * 素材卡片元件
 *
 * 顯示單個素材的資訊
 */

'use client';

import { Material } from '@/lib/types';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { formatFileSize } from '@/lib/utils/file-validation';
import { Clock, HardDrive, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { deleteMaterial } from '@/lib/hooks/use-materials';
import { useToast } from '@/components/ui/use-toast';

interface MaterialCardProps {
  material: Material;
  onDelete?: () => void;
}

export function MaterialCard({ material, onDelete }: MaterialCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  /**
   * 處理刪除
   */
  const handleDelete = async () => {
    if (!confirm('確定要刪除這個素材嗎?')) return;

    setIsDeleting(true);
    try {
      const result = await deleteMaterial(material.id);
      if (result.success) {
        toast({
          title: '刪除成功',
          description: '素材已刪除',
        });
        onDelete?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: '刪除失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * 格式化時長
   */
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* 縮圖 */}
      <div className="relative aspect-video bg-gray-100">
        {material.thumbnailUrl ? (
          <Image
            src={material.thumbnailUrl}
            alt={material.fileName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            無縮圖
          </div>
        )}
        {/* 時長標籤 */}
        <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(material.duration)}
        </div>
      </div>

      {/* 資訊 */}
      <div className="p-4 space-y-3">
        {/* 檔名 */}
        <h3 className="font-medium truncate" title={material.fileName}>
          {material.fileName}
        </h3>

        {/* 標籤 (如果有的話) */}
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {material.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {material.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{material.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* 詳細資訊 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            {formatFileSize(material.size)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(material.uploadedAt), {
              addSuffix: true,
              locale: zhTW,
            })}
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(material.fileUrl, '_blank')}
          >
            預覽
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

### 步驟 5: 建立搜尋與篩選列

建立 `components/materials/filter-bar.tsx`:

```typescript
/**
 * 篩選列元件
 *
 * 提供搜尋和標籤篩選功能
 */

'use client';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
}

export function FilterBar({
  search,
  onSearchChange,
  selectedTags,
  onTagToggle,
  availableTags,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* 搜尋框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="搜尋素材..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 標籤篩選 */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">篩選標籤</p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                  {isSelected && <X className="w-3 h-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* 已選標籤顯示 */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>已選擇:</span>
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 步驟 6: 安裝缺少的元件

```bash
# 安裝 Badge 元件
npx shadcn-ui@latest add badge
```

---

### 步驟 7: 更新素材庫頁面

更新 `app/(main)/materials/page.tsx`:

```typescript
/**
 * 素材庫頁面 (完整版本)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MaterialCard } from '@/components/materials/material-card';
import { FilterBar } from '@/components/materials/filter-bar';
import { useMaterials } from '@/lib/hooks/use-materials';
import { useDebouncedValue } from '@/lib/hooks/use-debounce';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';

export default function MaterialsPage() {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Debounce 搜尋,避免頻繁 API 呼叫
  const debouncedSearch = useDebouncedValue(search, 500);

  // 取得素材列表
  const { materials, isLoading, error, mutate } = useMaterials({
    search: debouncedSearch,
    tags: selectedTags,
  });

  /**
   * 處理標籤切換
   */
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  /**
   * 取得所有可用標籤
   */
  const availableTags = Array.from(
    new Set(materials.flatMap((m) => m.tags || []))
  ).sort();

  return (
    <div className="container py-8">
      {/* 頁首 */}
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

      {/* 篩選列 */}
      <div className="mb-6">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          availableTags={availableTags}
        />
      </div>

      {/* 素材列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">載入失敗: {error.message}</p>
          <Button onClick={() => mutate()} className="mt-4">
            重試
          </Button>
        </div>
      ) : materials.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          {search || selectedTags.length > 0 ? (
            <>
              <p className="text-muted-foreground">找不到符合條件的素材</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch('');
                  setSelectedTags([]);
                }}
              >
                清除篩選
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">尚未上傳任何素材</p>
              <Link href="/materials/upload">
                <Button className="mt-4">開始上傳</Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onDelete={() => mutate()} // 刪除後重新獲取列表
            />
          ))}
        </div>
      )}

      {/* 素材數量 */}
      {materials.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          共 {materials.length} 個素材
        </div>
      )}
    </div>
  );
}
```

---

### 步驟 8: 更新型別定義 (加入 tags)

修改 `lib/types/index.ts`,為 Material 加入 tags 欄位:

```typescript
export interface Material {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  duration: number;
  size: number;
  uploadedAt: string;
  tags?: string[]; // 新增
  analysisStatus?: 'pending' | 'processing' | 'completed' | 'failed'; // 新增
}
```

---

### 步驟 9: 建立 SWR 設定

建立 `app/providers.tsx`:

```typescript
/**
 * App Providers
 *
 * 全域 Context Providers
 */

'use client';

import { AuthProvider } from '@/lib/contexts/auth-context';
import { SWRConfig } from 'swr';
import { apiGet } from '@/lib/api/client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: apiGet,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </SWRConfig>
  );
}
```

然後更新 `app/layout.tsx`:

```typescript
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
```

---

### 步驟 10: 測試素材庫功能

```bash
# 啟動開發伺服器
npm run dev

# 開啟瀏覽器
# http://localhost:3000/materials
```

**測試項目**:
1. ✅ 素材列表正確顯示
2. ✅ 縮圖正確載入
3. ✅ 搜尋功能運作 (輸入關鍵字)
4. ✅ 標籤篩選運作 (點擊標籤)
5. ✅ 刪除功能運作
6. ✅ 空狀態正確顯示 (無素材時)
7. ✅ 載入狀態正確顯示
8. ✅ 錯誤狀態正確處理

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (5 tests): 基礎元件與資料載入
- 📁 **Functional Acceptance** (7 tests): 搜尋篩選功能
- 📁 **E2E Acceptance** (3 tests): 完整使用流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-3.4

# 或分別執行
npm test -- task-3.4-verification.test.ts
npm test -- task-3.4-functional.test.ts
npm test -- task-3.4-e2e.test.ts
```

### 通過標準

- ✅ 所有 15 個測試通過 (5 + 7 + 3)
- ✅ 素材列表正確顯示
- ✅ 搜尋篩選功能正常
- ✅ 刪除功能正確運作

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/acceptance/basic/task-3.4-verification.test.ts`

1. ✓ MaterialCard 元件存在
2. ✓ FilterBar 元件存在
3. ✓ use-materials Hook 存在
4. ✓ use-debounce Hook 存在
5. ✓ 素材庫頁面存在

### Functional Acceptance (7 tests)

測試檔案: `tests/acceptance/feature/task-3.4-functional.test.ts`

1. ✓ 素材列表正確載入與顯示
2. ✓ 搜尋功能正確運作 (debounce)
3. ✓ 標籤篩選功能正確運作
4. ✓ 多標籤篩選正確運作
5. ✓ 刪除素材功能正確運作
6. ✓ 空狀態正確顯示
7. ✓ 錯誤狀態正確處理

### E2E Acceptance (3 tests)

測試檔案: `tests/acceptance/e2e/task-3.4-e2e.test.ts`

1. ✓ 完整瀏覽流程正確
2. ✓ 搜尋 + 篩選組合正確
3. ✓ 素材管理流程正確 (新增、瀏覽、刪除)

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 套件安裝
- [ ] swr 已安裝
- [ ] date-fns 已安裝
- [ ] Badge 元件已安裝

### 核心檔案
- [ ] `lib/hooks/use-debounce.ts` 已建立
- [ ] `lib/hooks/use-materials.ts` 已建立
- [ ] `components/materials/material-card.tsx` 已建立
- [ ] `components/materials/filter-bar.tsx` 已建立
- [ ] `app/(main)/materials/page.tsx` 已更新
- [ ] `app/providers.tsx` 已建立
- [ ] `lib/types/index.ts` 已更新

### 功能驗證
- [ ] 素材列表正確顯示
- [ ] 縮圖正確載入
- [ ] 搜尋功能運作 (debounce)
- [ ] 標籤篩選運作
- [ ] 多標籤篩選運作
- [ ] 刪除功能運作
- [ ] 空狀態正確顯示
- [ ] 載入狀態正確顯示
- [ ] 錯誤處理正確

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
| `Failed to fetch materials` | API 無回應 | 檢查後端是否運行 |
| `Unauthorized` | Token 失效 | 重新登入 |
| `Image failed to load` | 縮圖 URL 無效 | 檢查 GCS 設定 |
| `Cannot read property 'map'` | 資料格式錯誤 | 檢查 API 回傳格式 |

---

### 問題 1: 素材列表載入失敗

**錯誤訊息**: `Failed to fetch materials`

**解決方案**:

1. **檢查後端 API**:
```bash
curl http://localhost:8080/api/materials
```

2. **檢查認證**:
```typescript
// 在 use-materials.ts 加入 debug
console.log('Fetching:', url);
```

3. **檢查 CORS**:
確認後端有設定 CORS headers

---

### 問題 2: 縮圖無法顯示

**錯誤現象**: 縮圖顯示破圖或載入失敗

**解決方案**:

1. **檢查 URL**:
```typescript
console.log('Thumbnail URL:', material.thumbnailUrl);
// 應該是完整的 URL (https://...)
```

2. **設定 Next.js Image domains**:

修改 `next.config.js`:
```javascript
module.exports = {
  images: {
    domains: [
      'storage.googleapis.com', // GCS
      'your-supabase-project.supabase.co', // Supabase Storage
    ],
  },
};
```

3. **使用 fallback**:
```typescript
<Image
  src={material.thumbnailUrl || '/placeholder.png'}
  alt={material.fileName}
  onError={(e) => {
    e.currentTarget.src = '/placeholder.png';
  }}
/>
```

---

### 問題 3: 搜尋沒有 debounce

**錯誤現象**: 每輸入一個字就發送 API 請求

**解決方案**:

確認有使用 debounce:

```typescript
// ✅ 正確
const debouncedSearch = useDebouncedValue(search, 500);
const { materials } = useMaterials({ search: debouncedSearch });

// ❌ 錯誤 (沒有 debounce)
const { materials } = useMaterials({ search });
```

---

### 問題 4: SWR 不更新資料

**錯誤現象**: 刪除素材後列表沒更新

**解決方案**:

確認有呼叫 `mutate`:

```typescript
<MaterialCard
  material={material}
  onDelete={() => mutate()} // 重新獲取資料
/>
```

或使用全域 mutate:

```typescript
import { mutate } from 'swr';

const handleDelete = async () => {
  await deleteMaterial(id);
  mutate('/api/materials'); // 重新獲取
};
```

---

### 問題 5: 日期格式錯誤

**錯誤訊息**: `Invalid Date`

**解決方案**:

確認日期格式:

```typescript
// 後端應該回傳 ISO 8601 格式
uploadedAt: "2025-10-07T10:30:00Z"

// 前端轉換
new Date(material.uploadedAt)

// 如果格式不對,手動轉換
new Date(material.uploadedAt.replace(' ', 'T') + 'Z')
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **SWR**: https://swr.vercel.app/
- **React Query**: https://tanstack.com/query/latest
- **Next.js Image**: https://nextjs.org/docs/app/api-reference/components/image
- **date-fns**: https://date-fns.org/

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (15/15)
3. ✅ 完成檢查清單都勾選
4. ✅ 素材庫可以正常瀏覽與管理

### 最終驗收指令

```bash
# 進入 frontend 目錄
cd frontend

# 執行驗收測試
npm run verify:task task-3.4

# 如果全部通過,你應該看到:
# PASS tests/acceptance/basic/task-3.4-verification.test.ts
# PASS tests/acceptance/feature/task-3.4-functional.test.ts
# PASS tests/acceptance/e2e/task-3.4-e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       15 passed, 15 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 3.4 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 遇到的主要問題與解決方法
- 學到的新知識 (SWR, Debounce, Image Optimization)
- 下次可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: 繼續 Task 3.5 - 配音錄製介面

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
