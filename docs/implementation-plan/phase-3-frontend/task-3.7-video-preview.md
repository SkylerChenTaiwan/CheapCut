# Task 3.7: 影片預覽播放

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 3.7 |
| **Task 名稱** | 影片預覽播放 |
| **所屬 Phase** | Phase 3: 前端開發 |
| **預估時間** | 2-3 小時 (播放器開發 1h + 控制功能 0.5h + 測試 1h + 整合 0.5h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 3.6 (影片生成介面) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的影片播放問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← CORS 或廣告攔截器
   ```

2. **判斷錯誤類型**
   - `Failed to load resource` → 影片檔案無法載入
   - `MediaError` → 影片格式不支援或檔案損壞
   - `CORS Error` → 跨域資源共享問題
   - `Autoplay blocked` → 瀏覽器自動播放政策

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"影片播放失敗"  ← 太模糊
"video 不能播" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"HTML5 video CORS error fix"  ← 明確問題
"React video player custom controls" ← 功能需求
"Next.js video player component best practices" ← 最佳實踐
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- MDN HTML5 Video: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
- React Player: https://www.npmjs.com/package/react-player
- Video.js: https://videojs.com/

**優先順序 2: 播放器函式庫**
- react-player (推薦): 簡單易用,支援多種格式
- video.js: 功能完整,高度可自訂

---

### Step 3: 檢查播放器狀態

```bash
# 檢查影片檔案是否存在
curl -I https://storage.googleapis.com/bucket/video.mp4

# 測試影片能否在瀏覽器直接播放
# 複製影片 URL 直接在瀏覽器開啟

# 檢查 CORS headers
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  https://storage.googleapis.com/bucket/video.mp4
```

---

## 🎯 功能描述

建立 CheapCut 的影片預覽播放介面,讓使用者可以預覽生成的影片並檢視相關資訊。

### 為什麼需要這個?

- 🎯 **問題**: 影片生成完成後,使用者無法立即預覽結果
- ✅ **解決**: 提供播放器讓使用者可以觀看、暫停、調整音量等
- 💡 **比喻**: 就像餐廳上菜後,讓客人可以看到並品嚐料理,而不是直接打包帶走

### 完成後你會有:

- ✅ HTML5 影片播放器
- ✅ 播放、暫停、進度控制
- ✅ 音量控制與靜音
- ✅ 全螢幕播放支援
- ✅ 影片資訊顯示
- ✅ 響應式設計 (手機、平板、桌面)

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. HTML5 Video Element

**是什麼**: HTML5 原生的影片播放元素

**核心概念**:
- **`<video>` 標籤**: 嵌入影片的 HTML 元素
- **controls 屬性**: 顯示預設控制器
- **src 屬性**: 影片來源 URL
- **autoplay / loop / muted**: 播放選項

**為什麼使用原生 Video**:
- 瀏覽器原生支援,不需額外套件
- 效能好,記憶體占用少
- 適合簡單的播放需求

**基本用法**:
```html
<video controls width="100%" preload="metadata">
  <source src="video.mp4" type="video/mp4" />
  您的瀏覽器不支援影片播放
</video>
```

### 2. React useRef Hook

**是什麼**: React Hook,用來存取 DOM 元素

**為什麼需要**:
- 需要直接控制 video 元素 (播放、暫停等)
- 讀取影片狀態 (當前時間、總長度等)

**基本用法**:
```typescript
const videoRef = useRef<HTMLVideoElement>(null);

// 播放影片
videoRef.current?.play();

// 暫停影片
videoRef.current?.pause();
```

### 3. Video 事件處理

**是什麼**: video 元素會發出各種事件,如播放、暫停、時間更新等

**常用事件**:
- **onPlay**: 開始播放時觸發
- **onPause**: 暫停時觸發
- **onTimeUpdate**: 播放位置更新時觸發 (每秒數次)
- **onEnded**: 播放結束時觸發
- **onLoadedMetadata**: 影片資訊載入完成時觸發

**基本用法**:
```typescript
<video
  onPlay={() => setIsPlaying(true)}
  onPause={() => setIsPlaying(false)}
  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
  onEnded={() => console.log('播放結束')}
/>
```

### 4. 全螢幕 API

**是什麼**: 瀏覽器提供的全螢幕 API

**為什麼需要**:
- 讓使用者可以全螢幕觀看影片
- 提供更好的觀影體驗

**基本用法**:
```typescript
// 進入全螢幕
videoRef.current?.requestFullscreen();

// 離開全螢幕
document.exitFullscreen();

// 檢查是否支援全螢幕
const supportsFullscreen = document.fullscreenEnabled;
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 3.6: 影片生成介面 (影片已生成完成)
- ✅ Task 2.9: 影片生成服務 (後端已提供影片 URL)

### 系統需求
- Node.js >= 18.17.0
- 瀏覽器支援 HTML5 Video
- GCS 影片檔案可公開訪問 (或有正確的 CORS 設定)

### 套件需求
```bash
# 時間格式化
npm install date-fns

# 圖示
npx shadcn-ui@latest add button
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add separator

# 如果要使用第三方播放器 (可選)
npm install react-player
```

---

## 📝 實作步驟

### 步驟 1: 安裝相依套件

```bash
# 進入 frontend 目錄
cd frontend

# 安裝時間處理套件
npm install date-fns

# 安裝 shadcn/ui 元件
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add separator
```

**為什麼需要這些**:
- `date-fns`: 格式化影片時長 (例如: 125 秒 → "2:05")
- `slider`: 音量控制滑桿
- `separator`: 視覺分隔線

---

### 步驟 2: 建立時間格式化工具

建立 `lib/utils/time.ts`:

```typescript
/**
 * 時間格式化工具
 *
 * 為什麼需要這個?
 * - 將秒數轉換為可讀的時間格式
 * - 例如: 125 秒 → "2:05"
 */

/**
 * 格式化秒數為 MM:SS 或 HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    // HH:MM:SS 格式
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    // MM:SS 格式
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * 計算百分比
 */
export function getPercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return (current / total) * 100;
}
```

---

### 步驟 3: 建立影片播放器元件

建立 `components/video/VideoPlayer.tsx`:

```typescript
/**
 * 影片播放器
 *
 * 功能:
 * - 播放/暫停控制
 * - 進度條
 * - 音量控制
 * - 全螢幕支援
 * - 時間顯示
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from 'lucide-react';
import { formatTime, getPercentage } from '@/lib/utils/time';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  className?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export function VideoPlayer({
  videoUrl,
  className,
  autoPlay = false,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 載入影片資訊
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // 監聽全螢幕變化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 播放/暫停
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  // 調整進度
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // 調整音量
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // 靜音切換
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  // 全螢幕切換
  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!document.fullscreenElement) {
        await video.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('全螢幕切換失敗:', error);
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="relative bg-black group">
        {/* Video 元素 */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video object-contain"
          autoPlay={autoPlay}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => {
            setIsPlaying(false);
            onEnded?.();
          }}
          onClick={togglePlay}
        >
          您的瀏覽器不支援影片播放
        </video>

        {/* 控制列 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 進度條 */}
          <Slider
            value={[getPercentage(currentTime, duration)]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="mb-3 cursor-pointer"
          />

          <div className="flex items-center justify-between gap-4">
            {/* 左側控制 */}
            <div className="flex items-center gap-2">
              {/* 播放/暫停 */}
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              {/* 音量控制 */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>

                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-20 cursor-pointer"
                />
              </div>

              {/* 時間顯示 */}
              <span className="text-sm text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* 右側控制 */}
            <div className="flex items-center gap-2">
              {/* 全螢幕 */}
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

---

### 步驟 4: 建立預覽頁面

建立 `app/(main)/preview/[jobId]/page.tsx`:

```typescript
/**
 * 影片預覽頁面
 *
 * 功能:
 * - 顯示影片播放器
 * - 顯示影片資訊
 * - 提供下載和分享選項
 */

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import useSWR from 'swr';
import { getJobStatus } from '@/lib/api/video';
import { Skeleton } from '@/components/ui/skeleton';

export default function PreviewPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  // 取得生成任務資訊
  const { data, error, isLoading } = useSWR(
    jobId ? `/api/video/job/${jobId}` : null,
    () => getJobStatus(jobId)
  );

  const job = data?.data;

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">找不到影片資訊</p>
            <Button asChild className="mt-4">
              <Link href="/generate">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回生成頁面
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (job.status !== 'completed') {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              影片尚未生成完成
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              當前狀態: <Badge>{job.status}</Badge>
            </p>
            <Button asChild className="mt-4">
              <Link href={`/generate?jobId=${jobId}`}>
                查看生成進度
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">影片預覽</h1>
            <p className="text-muted-foreground mt-2">
              影片已生成完成,可以預覽和下載
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href="/library">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回影片庫
            </Link>
          </Button>
        </div>

        {/* 影片播放器 */}
        <VideoPlayer
          videoUrl={job.outputVideoUrl!}
          className="w-full"
        />

        {/* 操作按鈕 */}
        <div className="flex gap-4">
          <Button size="lg" className="flex-1" asChild>
            <a href={job.outputVideoUrl} download>
              <Download className="mr-2 h-5 w-5" />
              下載影片
            </a>
          </Button>

          <Button size="lg" variant="outline" className="flex-1">
            <Share2 className="mr-2 h-5 w-5" />
            分享影片
          </Button>
        </div>

        <Separator />

        {/* 影片資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>影片資訊</CardTitle>
            <CardDescription>
              此影片的詳細資訊
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">任務 ID</p>
                <p className="font-mono text-sm">{job.id}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">生成狀態</p>
                <Badge variant="default">已完成</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">建立時間</p>
                <p className="text-sm">
                  {new Date(job.createdAt).toLocaleString('zh-TW')}
                </p>
              </div>

              {job.completedAt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">完成時間</p>
                  <p className="text-sm">
                    {new Date(job.completedAt).toLocaleString('zh-TW')}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">使用片段數</p>
                <p className="text-sm">{job.selectedSegments.length} 個片段</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">配音檔案</p>
                <audio controls src={job.voiceoverUrl} className="h-8 w-full">
                  瀏覽器不支援音訊播放
                </audio>
              </div>
            </div>

            {/* 影片 URL */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">影片連結</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={job.outputVideoUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(job.outputVideoUrl!);
                  }}
                >
                  複製
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 片段資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>使用的素材片段</CardTitle>
            <CardDescription>
              此影片使用了以下 {job.selectedSegments.length} 個素材片段
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              {job.selectedSegments.map((segment, index) => (
                <div
                  key={segment.segmentId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="text-sm font-medium">片段 {segment.segmentId.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                        {' '}
                        (時長: {formatTime(segment.endTime - segment.startTime)})
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

---

### 步驟 5: 測試執行

```bash
# 確保後端 API 正在運行
# 在後端目錄執行: npm start

# 啟動前端開發伺服器
cd frontend
npm run dev

# 開啟瀏覽器
# 先完成影片生成,然後會自動跳轉到預覽頁面
# 或直接訪問: http://localhost:3000/preview/{jobId}
```

**預期結果**:
- ✅ 影片可以正常載入和播放
- ✅ 播放/暫停按鈕正常運作
- ✅ 進度條可以拖曳調整
- ✅ 音量控制正常
- ✅ 全螢幕功能正常
- ✅ 影片資訊正確顯示

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

- 📁 **Basic Verification** (5 tests): 基礎元件與功能
- 📁 **Functional Acceptance** (6 tests): 播放器功能正確性
- 📁 **E2E Acceptance** (3 tests): 完整預覽流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-3.7

# 或分別執行
npm test -- task-3.7-verification.test.ts
npm test -- task-3.7-functional.test.ts
npm test -- task-3.7-e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ 影片可以正常播放
- ✅ 所有控制功能正常運作
- ✅ 響應式設計在不同裝置正常顯示
- ✅ 影片資訊正確顯示

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/acceptance/basic/task-3.7-verification.test.ts`

1. ✓ VideoPlayer 元件正確渲染
2. ✓ 預覽頁面正確載入
3. ✓ video 元素存在且有正確屬性
4. ✓ 控制按鈕正確顯示
5. ✓ 時間格式化工具正確運作

### Functional Acceptance (6 tests)

測試檔案: `tests/acceptance/feature/task-3.7-functional.test.ts`

1. ✓ 播放/暫停功能正常運作
2. ✓ 進度條可以正確調整播放位置
3. ✓ 音量控制正常運作
4. ✓ 靜音切換正常運作
5. ✓ 全螢幕功能正常運作
6. ✓ 影片結束事件正確觸發

### E2E Acceptance (3 tests)

測試檔案: `tests/acceptance/e2e/task-3.7-e2e.test.ts`

1. ✓ 完整播放流程正確運作
2. ✓ 從生成頁面跳轉至預覽頁面正常
3. ✓ 響應式設計在不同裝置正常

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 套件安裝
- [ ] date-fns 已安裝
- [ ] shadcn/ui 額外元件已安裝

### 檔案建立
- [ ] `lib/utils/time.ts` 已建立
- [ ] `components/video/VideoPlayer.tsx` 已建立
- [ ] `app/(main)/preview/[jobId]/page.tsx` 已建立

### 功能驗證
- [ ] 影片可以正常載入
- [ ] 播放/暫停功能正常
- [ ] 進度控制正常
- [ ] 音量控制正常
- [ ] 全螢幕功能正常
- [ ] 影片資訊正確顯示
- [ ] 響應式設計正常

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
| `Failed to load resource` | 影片 URL 無效或無法訪問 | 檢查 GCS 權限和 CORS |
| `MediaError` | 影片格式不支援 | 確認使用 MP4 (H.264) |
| `CORS Error` | 跨域資源共享問題 | 設定 GCS CORS headers |
| `Autoplay blocked` | 瀏覽器阻止自動播放 | 移除 autoPlay 或加上 muted |

---

### 問題 1: 影片無法載入

**錯誤訊息:**
```
Failed to load resource: net::ERR_FAILED
```

**解決方案:**

1. **檢查影片 URL 是否有效**:
```bash
# 測試影片 URL
curl -I https://storage.googleapis.com/bucket/video.mp4

# 應該回傳 200 OK
```

2. **檢查 GCS 權限**:
```bash
# 確認檔案是公開的,或設定正確的 CORS
gsutil cors get gs://your-bucket

# 設定 CORS (如果需要)
gsutil cors set cors.json gs://your-bucket
```

cors.json 範例:
```json
[
  {
    "origin": ["http://localhost:3000", "https://your-domain.com"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Range"],
    "maxAgeSeconds": 3600
  }
]
```

---

### 問題 2: 播放控制無反應

**問題**: 點擊播放/暫停按鈕沒有反應

**解決方案:**

檢查 videoRef 是否正確綁定:

```typescript
// 確認 ref 有綁定到 video 元素
<video ref={videoRef} ... />

// 確認在使用前檢查 ref
const togglePlay = () => {
  const video = videoRef.current;
  if (!video) {
    console.error('Video ref is null');
    return;
  }
  // ...
};
```

檢查是否有錯誤:

```typescript
<video
  ref={videoRef}
  onError={(e) => {
    console.error('Video error:', e);
  }}
  // ...
/>
```

---

### 問題 3: 進度條不會更新

**問題**: 播放時,進度條停在 0%

**解決方案:**

確認 onTimeUpdate 事件正確設定:

```typescript
<video
  onTimeUpdate={(e) => {
    const currentTime = e.currentTarget.currentTime;
    console.log('Current time:', currentTime); // ← 加入除錯
    setCurrentTime(currentTime);
  }}
  // ...
/>
```

確認 duration 有正確載入:

```typescript
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const handleLoadedMetadata = () => {
    console.log('Duration loaded:', video.duration); // ← 加入除錯
    setDuration(video.duration);
  };

  video.addEventListener('loadedmetadata', handleLoadedMetadata);
  return () => {
    video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  };
}, []);
```

---

### 問題 4: 全螢幕功能無效

**錯誤訊息:**
```
Failed to execute 'requestFullscreen' on 'Element'
```

**解決方案:**

1. **確認瀏覽器支援**:
```typescript
const toggleFullscreen = async () => {
  if (!document.fullscreenEnabled) {
    console.error('瀏覽器不支援全螢幕');
    return;
  }
  // ...
};
```

2. **必須由使用者互動觸發**:
```typescript
// ✅ 正確: 由按鈕點擊觸發
<Button onClick={toggleFullscreen}>全螢幕</Button>

// ❌ 錯誤: 自動觸發會被瀏覽器阻止
useEffect(() => {
  toggleFullscreen(); // 這不會運作
}, []);
```

---

### 問題 5: 手機瀏覽器播放問題

**問題**: iOS Safari 播放行為異常

**解決方案:**

加入 `playsInline` 屬性:

```typescript
<video
  playsInline  // ← 重要: iOS 需要此屬性
  controls
  src={videoUrl}
/>
```

移除自動播放 (iOS 會阻止):

```typescript
// ❌ iOS 會阻止
<video autoPlay ... />

// ✅ 讓使用者手動播放
<video ... />
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **MDN Video Element**: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
- **Fullscreen API**: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
- **React Player Library**: https://github.com/cookpete/react-player
- **Video.js**: https://videojs.com/
- **HLS.js** (串流影片): https://github.com/video-dev/hls.js/

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 影片可以正常播放和控制

### 最終驗收指令

```bash
# 進入 frontend 目錄
cd frontend

# 執行驗收測試
npm run verify:task task-3.7

# 如果全部通過,你應該看到:
# PASS tests/acceptance/basic/task-3.7-verification.test.ts
# PASS tests/acceptance/feature/task-3.7-functional.test.ts
# PASS tests/acceptance/e2e/task-3.7-e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 3.7 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 遇到的主要問題與解決方法
- 學到的新知識
- 下次可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: 繼續 Task 3.8 - 下載與分享

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
