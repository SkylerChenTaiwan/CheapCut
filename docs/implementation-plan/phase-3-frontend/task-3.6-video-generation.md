# Task 3.6: 影片生成介面

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 3.6 |
| **Task 名稱** | 影片生成介面 |
| **所屬 Phase** | Phase 3: 前端開發 |
| **預估時間** | 3-4 小時 (介面設計 1.5h + 狀態管理 1h + 測試 1h + 整合 0.5h) |
| **難度** | ⭐⭐⭐ 中高 |
| **前置 Task** | Task 3.5 (配音錄製介面) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的生成介面問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot read property 'segments' of undefined
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 資料結構問題
   ```

2. **判斷錯誤類型**
   - `Cannot read property` → 資料未正確載入或為 undefined
   - `Network Error` → API 呼叫失敗
   - `Invalid segments selection` → 素材片段選擇邏輯錯誤
   - `Generation failed` → 後端生成失敗

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"影片生成失敗"  ← 太模糊
"Next.js 影片" ← 沒有具體問題
```

**✅ 好的搜尋方式**:
```
"Next.js form validation with react-hook-form"  ← 表單驗證
"React drag and drop timeline editor" ← 時間軸編輯
"Next.js polling API status updates" ← 輪詢狀態更新
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- React Hook Form: https://react-hook-form.com/
- Zod Validation: https://zod.dev/
- SWR (Data Fetching): https://swr.vercel.app/

**優先順序 2: 範例專案**
- React 影片編輯器範例
- Timeline UI 元件範例

---

### Step 3: 檢查生成狀態

```bash
# 檢查後端 API 是否正常運作
curl -X POST http://localhost:8080/api/video/generate \
  -H "Content-Type: application/json" \
  -d '{"voiceoverUrl":"test.mp3","selectedSegments":[]}'

# 檢查生成任務狀態
curl http://localhost:8080/api/video/job/{jobId}

# 查看 Next.js 開發模式錯誤
npm run dev
# 開啟 Browser Console 查看錯誤
```

---

## 🎯 功能描述

建立 CheapCut 的影片生成介面,讓使用者可以選擇素材片段、搭配配音,並送出影片生成任務。

### 為什麼需要這個?

- 🎯 **問題**: 使用者已經有配音和素材,但無法將它們組合成影片
- ✅ **解決**: 提供直覺的介面選擇素材片段,系統自動生成影片
- 💡 **比喻**: 就像在餐廳點菜,使用者選擇食材(素材),廚房(後端)負責烹飪(生成影片)

### 完成後你會有:

- ✅ 直覺的素材片段選擇介面
- ✅ 配音與素材的時間軸對齊
- ✅ 即時的生成進度顯示
- ✅ 錯誤處理與重試機制
- ✅ 生成完成後自動跳轉預覽
- ✅ **生成成本預估與即時顯示**

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. React Hook Form

**是什麼**: React 的表單管理函式庫,處理表單驗證與狀態

**核心概念**:
- **useForm**: 建立表單實例
- **register**: 註冊表單欄位
- **handleSubmit**: 處理表單提交
- **watch**: 監聽表單欄位變化

**為什麼選 React Hook Form**:
- 效能好,重新渲染次數少
- 整合 Zod 做型別安全的驗證
- API 簡潔易用

**基本用法**:
```typescript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = (data) => {
  console.log(data);
};
```

### 2. Zod Schema Validation

**是什麼**: TypeScript-first 的 schema 驗證函式庫

**為什麼要用**:
- 型別安全,與 TypeScript 完美整合
- 錯誤訊息清楚
- 可以自訂驗證規則

**基本語法**:
```typescript
import { z } from 'zod';

const schema = z.object({
  voiceoverUrl: z.string().url(),
  segments: z.array(z.object({
    segmentId: z.string(),
    order: z.number()
  })).min(1, '至少需要選擇一個片段')
});
```

### 3. 即時狀態輪詢 (Polling)

**是什麼**: 定期向伺服器查詢資料更新的技術

**為什麼需要**:
- 影片生成是長時間任務
- 需要即時顯示進度給使用者
- 生成完成後自動跳轉

**基本實作**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // 每 2 秒查詢一次狀態
    checkJobStatus(jobId);
  }, 2000);

  return () => clearInterval(interval);
}, [jobId]);
```

### 4. 拖曳排序 (Drag and Drop)

**是什麼**: 讓使用者可以拖曳元素改變順序

**為什麼需要**:
- 素材片段順序會影響最終影片
- 拖曳比手動輸入數字直覺

**推薦函式庫**: `@dnd-kit/core` (shadcn/ui 推薦)

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 3.5: 配音錄製介面 (配音已上傳完成)
- ✅ Task 3.4: 素材庫管理 (素材片段已可選擇)
- ✅ Task 2.9: 影片生成服務 (後端 API 已準備好)

### 系統需求
- Node.js >= 18.17.0
- 後端 API 服務正在運行 (port 8080)
- GCS 已設定完成

### 套件需求
```bash
# React Hook Form
npm install react-hook-form @hookform/resolvers

# Zod 驗證
npm install zod

# SWR (資料取得與快取)
npm install swr

# Drag and Drop (可選,視設計需求)
npm install @dnd-kit/core @dnd-kit/sortable
```

---

## 📝 實作步驟

### 步驟 1: 安裝相依套件

```bash
# 進入 frontend 目錄
cd frontend

# 安裝表單處理相關套件
npm install react-hook-form @hookform/resolvers zod

# 安裝資料取得套件
npm install swr

# 安裝 shadcn/ui 額外元件
npx shadcn-ui@latest add select
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add badge
```

**為什麼需要這些**:
- `react-hook-form`: 表單狀態管理
- `@hookform/resolvers`: 整合 Zod 驗證
- `zod`: Schema 驗證
- `swr`: API 資料取得與快取
- `select`: 選擇配音檔案
- `progress`: 顯示生成進度
- `alert`: 錯誤訊息顯示
- `badge`: 片段狀態標籤

---

### 步驟 2: 建立型別定義

更新 `lib/types/index.ts`,新增生成相關型別:

```typescript
// ============================================
// 影片生成相關
// ============================================

export interface VideoGenerationRequest {
  voiceoverUrl: string;
  selectedSegments: SelectedSegment[];
}

export interface SelectedSegment {
  segmentId: string;
  startTime: number;
  endTime: number;
  order: number;
}

export interface VideoGenerationJob {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  voiceoverUrl: string;
  selectedSegments: SelectedSegment[];
  outputVideoUrl?: string;
  progress?: number; // 0-100
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface MaterialSegmentWithMaterial extends MaterialSegment {
  material: Material; // 包含素材資訊,方便顯示
}
```

---

### 步驟 3: 建立生成 API 客戶端

建立 `lib/api/video.ts`:

```typescript
/**
 * 影片生成 API
 *
 * 為什麼需要這個?
 * - 統一管理影片生成相關的 API 呼叫
 * - 提供型別安全的介面
 */

import { apiPost, apiGet } from './client';
import type {
  VideoGenerationRequest,
  VideoGenerationJob,
  ApiResponse
} from '@/lib/types';

/**
 * 建立影片生成任務
 */
export async function createGenerationJob(
  request: VideoGenerationRequest
): Promise<ApiResponse<VideoGenerationJob>> {
  return apiPost<ApiResponse<VideoGenerationJob>>(
    '/api/video/generate',
    request
  );
}

/**
 * 查詢生成任務狀態
 */
export async function getJobStatus(
  jobId: string
): Promise<ApiResponse<VideoGenerationJob>> {
  return apiGet<ApiResponse<VideoGenerationJob>>(
    `/api/video/job/${jobId}`
  );
}

/**
 * 取得使用者的生成歷史
 */
export async function getGenerationHistory(): Promise<
  ApiResponse<VideoGenerationJob[]>
> {
  return apiGet<ApiResponse<VideoGenerationJob[]>>(
    '/api/video/jobs'
  );
}
```

---

### 步驟 4: 建立生成表單 Schema

建立 `lib/schemas/video-generation.ts`:

```typescript
/**
 * 影片生成表單驗證 Schema
 *
 * 為什麼需要這個?
 * - 確保使用者輸入正確
 * - 提供清楚的錯誤訊息
 * - 與 TypeScript 型別整合
 */

import { z } from 'zod';

export const segmentSchema = z.object({
  segmentId: z.string().min(1, '片段 ID 不能為空'),
  startTime: z.number().min(0, '開始時間必須 >= 0'),
  endTime: z.number().min(0, '結束時間必須 >= 0'),
  order: z.number().int().min(0, '順序必須 >= 0'),
}).refine(
  (data) => data.endTime > data.startTime,
  {
    message: '結束時間必須大於開始時間',
    path: ['endTime'],
  }
);

export const videoGenerationSchema = z.object({
  voiceoverUrl: z
    .string()
    .min(1, '請先上傳或錄製配音')
    .url('配音 URL 格式不正確'),
  selectedSegments: z
    .array(segmentSchema)
    .min(1, '至少需要選擇一個素材片段')
    .max(20, '最多只能選擇 20 個片段'),
});

export type VideoGenerationFormData = z.infer<typeof videoGenerationSchema>;
```

---

### 步驟 5: 建立片段選擇元件

建立 `components/video/SegmentSelector.tsx`:

```typescript
/**
 * 素材片段選擇器
 *
 * 功能:
 * - 顯示可用的素材片段
 * - 支援多選片段
 * - 顯示片段預覽縮圖
 * - 顯示片段時長
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { MaterialSegmentWithMaterial } from '@/lib/types';

interface SegmentSelectorProps {
  segments: MaterialSegmentWithMaterial[];
  selectedSegmentIds: string[];
  onSelectionChange: (segmentIds: string[]) => void;
}

export function SegmentSelector({
  segments,
  selectedSegmentIds,
  onSelectionChange,
}: SegmentSelectorProps) {
  const handleToggle = (segmentId: string) => {
    if (selectedSegmentIds.includes(segmentId)) {
      // 取消選擇
      onSelectionChange(
        selectedSegmentIds.filter((id) => id !== segmentId)
      );
    } else {
      // 新增選擇
      onSelectionChange([...selectedSegmentIds, segmentId]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          選擇素材片段
        </h3>
        <Badge variant="secondary">
          已選擇 {selectedSegmentIds.length} 個片段
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment) => {
          const isSelected = selectedSegmentIds.includes(segment.id);
          const duration = segment.endTime - segment.startTime;

          return (
            <Card
              key={segment.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleToggle(segment.id)}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(segment.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Badge variant="outline">
                    {formatDuration(duration)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                {/* 縮圖 */}
                {segment.thumbnailUrl && (
                  <div className="aspect-video bg-muted rounded-md overflow-hidden mb-2">
                    <img
                      src={segment.thumbnailUrl}
                      alt={segment.description || '片段縮圖'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 描述 */}
                {segment.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {segment.description}
                  </p>
                )}

                {/* 標籤 */}
                {segment.tags && segment.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {segment.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {segment.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{segment.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* 素材檔名 */}
                <p className="text-xs text-muted-foreground mt-2">
                  來源: {segment.material.fileName}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {segments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              尚無可用的素材片段
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              請先上傳素材並完成分析
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

### 步驟 6: 建立生成進度元件

建立 `components/video/GenerationProgress.tsx`:

```typescript
/**
 * 影片生成進度顯示
 *
 * 功能:
 * - 顯示當前生成狀態
 * - 顯示進度條
 * - 輪詢更新狀態
 */

'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import useSWR from 'swr';
import { getJobStatus } from '@/lib/api/video';
import type { VideoGenerationJob } from '@/lib/types';

interface GenerationProgressProps {
  jobId: string;
  onCompleted?: (job: VideoGenerationJob) => void;
  onFailed?: (job: VideoGenerationJob) => void;
}

export function GenerationProgress({
  jobId,
  onCompleted,
  onFailed,
}: GenerationProgressProps) {
  // 使用 SWR 輪詢任務狀態
  const { data, error } = useSWR(
    jobId ? `/api/video/job/${jobId}` : null,
    () => getJobStatus(jobId),
    {
      refreshInterval: (data) => {
        // 如果任務完成或失敗,停止輪詢
        const status = data?.data?.status;
        if (status === 'completed' || status === 'failed') {
          return 0;
        }
        // 否則每 2 秒輪詢一次
        return 2000;
      },
    }
  );

  const job = data?.data;

  // 監聽任務完成
  useEffect(() => {
    if (job?.status === 'completed' && onCompleted) {
      onCompleted(job);
    } else if (job?.status === 'failed' && onFailed) {
      onFailed(job);
    }
  }, [job?.status]);

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          無法取得生成狀態,請重新整理頁面
        </AlertDescription>
      </Alert>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    pending: {
      label: '等待中',
      icon: Loader2,
      variant: 'secondary' as const,
      description: '任務已建立,等待處理...',
    },
    processing: {
      label: '生成中',
      icon: Loader2,
      variant: 'default' as const,
      description: '正在生成影片,請稍候...',
    },
    completed: {
      label: '完成',
      icon: CheckCircle2,
      variant: 'default' as const,
      description: '影片生成完成!',
    },
    failed: {
      label: '失敗',
      icon: XCircle,
      variant: 'destructive' as const,
      description: job.error || '影片生成失敗',
    },
  };

  const config = statusConfig[job.status];
  const Icon = config.icon;
  const progress = job.progress || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">影片生成進度</CardTitle>
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 進度條 */}
        {(job.status === 'pending' || job.status === 'processing') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">進度</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* 狀態圖示 */}
        <div className="flex items-center justify-center py-8">
          <Icon
            className={`h-16 w-16 ${
              job.status === 'processing' || job.status === 'pending'
                ? 'animate-spin text-primary'
                : job.status === 'completed'
                ? 'text-green-500'
                : 'text-destructive'
            }`}
          />
        </div>

        {/* 任務資訊 */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">任務 ID</span>
            <span className="font-mono text-xs">{job.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">建立時間</span>
            <span>{new Date(job.createdAt).toLocaleString('zh-TW')}</span>
          </div>
          {job.completedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">完成時間</span>
              <span>{new Date(job.completedAt).toLocaleString('zh-TW')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 步驟 7: 建立生成頁面

建立 `app/(main)/generate/page.tsx`:

```typescript
/**
 * 影片生成頁面
 *
 * 流程:
 * 1. 選擇配音
 * 2. 選擇素材片段
 * 3. 送出生成請求
 * 4. 顯示生成進度
 * 5. 完成後跳轉預覽
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SegmentSelector } from '@/components/video/SegmentSelector';
import { GenerationProgress } from '@/components/video/GenerationProgress';
import { videoGenerationSchema, type VideoGenerationFormData } from '@/lib/schemas/video-generation';
import { createGenerationJob } from '@/lib/api/video';
import { toast } from '@/components/ui/use-toast';
import useSWR from 'swr';
import type { VideoGenerationJob } from '@/lib/types';

export default function GeneratePage() {
  const router = useRouter();
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);

  // TODO: 從 API 取得可用的素材片段
  // 暫時使用假資料示範
  const { data: segmentsData } = useSWR('/api/materials/segments', null, {
    fallbackData: { data: [] },
  });

  // TODO: 從上一步 (Task 3.5) 取得配音 URL
  // 這裡假設配音已上傳完成
  const voiceoverUrl = 'https://storage.googleapis.com/bucket/voiceover.mp3';

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VideoGenerationFormData>({
    resolver: zodResolver(videoGenerationSchema),
  });

  const onSubmit = async () => {
    try {
      // 建立選擇的片段資料
      const selectedSegments = selectedSegmentIds.map((id, index) => {
        const segment = segmentsData.data.find((s: any) => s.id === id);
        return {
          segmentId: id,
          startTime: segment.startTime,
          endTime: segment.endTime,
          order: index,
        };
      });

      // 送出生成請求
      const response = await createGenerationJob({
        voiceoverUrl,
        selectedSegments,
      });

      // 設定當前任務 ID,開始顯示進度
      setCurrentJobId(response.data.id);

      toast({
        title: '生成任務已建立',
        description: '正在處理您的影片,請稍候...',
      });
    } catch (error: any) {
      toast({
        title: '建立任務失敗',
        description: error.message || '請稍後再試',
        variant: 'destructive',
      });
    }
  };

  const handleGenerationCompleted = (job: VideoGenerationJob) => {
    toast({
      title: '影片生成完成!',
      description: '即將跳轉至預覽頁面',
    });

    // 3 秒後跳轉至預覽頁面
    setTimeout(() => {
      router.push(`/preview/${job.id}`);
    }, 3000);
  };

  const handleGenerationFailed = (job: VideoGenerationJob) => {
    toast({
      title: '影片生成失敗',
      description: job.error || '請重試或聯絡客服',
      variant: 'destructive',
    });
  };

  // 如果有進行中的任務,顯示進度
  if (currentJobId) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <GenerationProgress
          jobId={currentJobId}
          onCompleted={handleGenerationCompleted}
          onFailed={handleGenerationFailed}
        />

        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => setCurrentJobId(null)}
          >
            返回編輯
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div>
          <h1 className="text-3xl font-bold">生成影片</h1>
          <p className="text-muted-foreground mt-2">
            選擇素材片段,系統將自動搭配配音生成影片
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 配音資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>配音</CardTitle>
              <CardDescription>
                使用上一步錄製或上傳的配音
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <audio controls src={voiceoverUrl} className="w-full">
                  您的瀏覽器不支援音訊播放
                </audio>
              </div>
            </CardContent>
          </Card>

          {/* 素材片段選擇 */}
          <Card>
            <CardHeader>
              <CardTitle>素材片段</CardTitle>
              <CardDescription>
                選擇要使用的素材片段 (可多選)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SegmentSelector
                segments={segmentsData.data}
                selectedSegmentIds={selectedSegmentIds}
                onSelectionChange={setSelectedSegmentIds}
              />

              {errors.selectedSegments && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>
                    {errors.selectedSegments.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 成本預估 */}
          {selectedSegmentIds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>💰 成本預估</CardTitle>
                <CardDescription>
                  本次生成的預估成本
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">影片生成處理</span>
                    <span className="font-medium">~$0.05 USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">TTS 配音合成</span>
                    <span className="font-medium">~$0.02 USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">輸出影片儲存</span>
                    <span className="font-medium">~$0.01 USD/月</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-base">
                    <span className="font-semibold">預估總成本</span>
                    <span className="font-bold text-lg text-primary">~$0.08 USD</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 實際成本會根據影片長度和所選片段數量而有所調整
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 送出按鈕 */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              返回
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedSegmentIds.length === 0}
            >
              {isSubmitting ? '建立中...' : '開始生成'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### 步驟 8: 更新導航連結

更新主頁面或導航欄,加入生成頁面的連結。

修改 `app/(main)/layout.tsx` (如果有側邊欄):

```typescript
// 在導航選單中加入
{
  href: '/generate',
  label: '生成影片',
  icon: VideoIcon,
}
```

---

### 步驟 9: 測試執行

```bash
# 確保後端 API 正在運行
# 在後端目錄執行: npm start

# 啟動前端開發伺服器
cd frontend
npm run dev

# 開啟瀏覽器
# http://localhost:3000/generate
```

**預期結果**:
- ✅ 可以看到配音播放器
- ✅ 可以選擇素材片段
- ✅ 送出生成請求成功
- ✅ 顯示生成進度
- ✅ 生成完成後自動跳轉

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

- 📁 **Basic Verification** (5 tests): 基礎元件與 API
- 📁 **Functional Acceptance** (6 tests): 生成功能正確性
- 📁 **E2E Acceptance** (3 tests): 完整生成流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-3.6

# 或分別執行
npm test -- task-3.6-verification.test.ts
npm test -- task-3.6-functional.test.ts
npm test -- task-3.6-e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ 可以正常選擇片段
- ✅ 可以送出生成請求
- ✅ 進度顯示正確更新
- ✅ 生成完成後正確跳轉

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/acceptance/basic/task-3.6-verification.test.ts`

1. ✓ SegmentSelector 元件正確渲染
2. ✓ GenerationProgress 元件正確渲染
3. ✓ 生成頁面正確載入
4. ✓ API 客戶端正確實作
5. ✓ Zod Schema 驗證正確

### Functional Acceptance (6 tests)

測試檔案: `tests/acceptance/feature/task-3.6-functional.test.ts`

1. ✓ 可以選擇和取消選擇片段
2. ✓ 可以正確送出生成請求
3. ✓ 表單驗證正確執行
4. ✓ 進度輪詢正確運作
5. ✓ 錯誤處理正確
6. ✓ Toast 通知正確顯示

### E2E Acceptance (3 tests)

測試檔案: `tests/acceptance/e2e/task-3.6-e2e.test.ts`

1. ✓ 完整生成流程正確運作
2. ✓ 生成完成後正確跳轉
3. ✓ 生成失敗時正確處理

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 套件安裝
- [ ] react-hook-form 已安裝
- [ ] zod 已安裝
- [ ] swr 已安裝
- [ ] shadcn/ui 額外元件已安裝

### 檔案建立
- [ ] `lib/types/index.ts` 已更新
- [ ] `lib/api/video.ts` 已建立
- [ ] `lib/schemas/video-generation.ts` 已建立
- [ ] `components/video/SegmentSelector.tsx` 已建立
- [ ] `components/video/GenerationProgress.tsx` 已建立
- [ ] `app/(main)/generate/page.tsx` 已建立

### 功能驗證
- [ ] 可以選擇素材片段
- [ ] 可以送出生成請求
- [ ] 生成進度正確顯示
- [ ] 狀態輪詢正確運作
- [ ] 生成完成後正確跳轉
- [ ] 錯誤處理完善

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
| `Cannot read property 'segments'` | 資料未載入 | 檢查 API 呼叫是否成功 |
| `Validation error` | 表單驗證失敗 | 檢查 Zod Schema 定義 |
| `Network Error` | API 無法連線 | 確認後端服務運行中 |
| `Job not found` | 任務 ID 錯誤 | 檢查任務建立是否成功 |

---

### 問題 1: 選擇片段後無法送出

**錯誤訊息:**
```
Validation error: 至少需要選擇一個素材片段
```

**解決方案:**

檢查 `selectedSegmentIds` 狀態是否正確更新:

```typescript
// 在 SegmentSelector 中加入 console.log 除錯
const handleToggle = (segmentId: string) => {
  console.log('Toggle segment:', segmentId);
  console.log('Current selection:', selectedSegmentIds);
  // ...
};
```

確認父元件正確傳遞 `onSelectionChange`:

```typescript
<SegmentSelector
  segments={segmentsData.data}
  selectedSegmentIds={selectedSegmentIds}
  onSelectionChange={setSelectedSegmentIds} // ← 確認這行存在
/>
```

---

### 問題 2: 進度不會更新

**問題**: 送出生成請求後,進度一直停在 0%

**解決方案:**

檢查 SWR 輪詢設定:

```typescript
// 確認 refreshInterval 設定正確
const { data, error } = useSWR(
  jobId ? `/api/video/job/${jobId}` : null,
  () => getJobStatus(jobId),
  {
    refreshInterval: (data) => {
      const status = data?.data?.status;
      console.log('Current status:', status); // ← 加入除錯
      if (status === 'completed' || status === 'failed') {
        return 0; // 停止輪詢
      }
      return 2000; // 每 2 秒輪詢
    },
  }
);
```

檢查後端 API 是否正確回傳進度:

```bash
# 手動測試 API
curl http://localhost:8080/api/video/job/{jobId}

# 應該回傳類似:
# {
#   "data": {
#     "id": "...",
#     "status": "processing",
#     "progress": 45
#   }
# }
```

---

### 問題 3: 生成完成後沒有跳轉

**問題**: 影片生成完成,但頁面沒有自動跳轉

**解決方案:**

檢查 `useEffect` 依賴:

```typescript
useEffect(() => {
  console.log('Job status changed:', job?.status); // ← 加入除錯

  if (job?.status === 'completed' && onCompleted) {
    onCompleted(job);
  } else if (job?.status === 'failed' && onFailed) {
    onFailed(job);
  }
}, [job?.status]); // ← 確認依賴正確
```

確認 `handleGenerationCompleted` 有正確執行:

```typescript
const handleGenerationCompleted = (job: VideoGenerationJob) => {
  console.log('Generation completed, job:', job); // ← 加入除錯

  toast({
    title: '影片生成完成!',
    description: '即將跳轉至預覽頁面',
  });

  setTimeout(() => {
    console.log('Navigating to:', `/preview/${job.id}`); // ← 加入除錯
    router.push(`/preview/${job.id}`);
  }, 3000);
};
```

---

### 問題 4: API 呼叫失敗

**錯誤訊息:**
```
Error: Failed to fetch
```

**解決方案:**

1. **確認後端服務運行中**:
```bash
# 檢查後端 API 是否運行
curl http://localhost:8080/health

# 如果沒有回應,啟動後端
cd backend
npm start
```

2. **檢查環境變數**:
```bash
# 確認 .env.local 設定正確
cat frontend/.env.local

# 應該包含:
# NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. **檢查 CORS 設定** (如果是跨域問題):
```typescript
// 在後端確認 CORS 已正確設定
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

---

### 問題 5: TypeScript 型別錯誤

**錯誤訊息:**
```
Type 'string | undefined' is not assignable to type 'string'
```

**解決方案:**

加入型別檢查或預設值:

```typescript
// ❌ 錯誤寫法
const voiceoverUrl = searchParams.get('voiceover');

// ✅ 正確寫法 1: 型別檢查
const voiceoverUrl = searchParams.get('voiceover');
if (!voiceoverUrl) {
  throw new Error('缺少配音 URL');
}

// ✅ 正確寫法 2: 預設值
const voiceoverUrl = searchParams.get('voiceover') || '';
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **React Hook Form**: https://react-hook-form.com/
- **Zod Validation**: https://zod.dev/
- **SWR**: https://swr.vercel.app/
- **Polling Pattern**: https://www.patterns.dev/posts/polling
- **Drag and Drop**: https://docs.dndkit.com/

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 可以正常執行完整的生成流程

### 最終驗收指令

```bash
# 進入 frontend 目錄
cd frontend

# 執行驗收測試
npm run verify:task task-3.6

# 如果全部通過,你應該看到:
# PASS tests/acceptance/basic/task-3.6-verification.test.ts
# PASS tests/acceptance/feature/task-3.6-functional.test.ts
# PASS tests/acceptance/e2e/task-3.6-e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 3.6 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 遇到的主要問題與解決方法
- 學到的新知識
- 下次可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: 繼續 Task 3.7 - 影片預覽播放

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
