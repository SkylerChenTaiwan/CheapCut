# Task 3.8: 下載與分享功能

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 3.8 |
| **Task 名稱** | 下載與分享功能 |
| **所屬 Phase** | Phase 3: 前端開發 |
| **預估時間** | 2-3 小時 (下載功能 0.5h + 分享功能 1h + QR Code 0.5h + 測試 1h) |
| **難度** | ⭐⭐ 中等 |
| **前置 Task** | Task 3.7 (影片預覽播放) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的下載分享問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: CORS policy: No 'Access-Control-Allow-Origin' header
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← CORS 問題
   ```

2. **判斷錯誤類型**
   - `CORS Error` → 跨域資源共享問題
   - `Download failed` → 下載失敗,可能是權限或網路問題
   - `Clipboard API not available` → 瀏覽器不支援剪貼簿 API
   - `Share API not supported` → 瀏覽器不支援原生分享 API

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"下載功能不能用"  ← 太模糊
"分享失敗" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"download file from URL JavaScript CORS"  ← 明確問題
"Web Share API browser support" ← 技術相容性
"QR code generator React component" ← 具體需求
"clipboard API copy text browser support" ← API 支援度
```

#### 🌐 推薦資源

**優先順序 1: 官方文件** (最準確)
- Web Share API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
- Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
- QRCode.js: https://davidshimjs.github.io/qrcodejs/

**優先順序 2: 函式庫文件**
- react-qr-code: https://www.npmjs.com/package/react-qr-code
- file-saver: https://www.npmjs.com/package/file-saver

---

### Step 3: 檢查瀏覽器支援

```javascript
// 檢查 Web Share API 支援
if (navigator.share) {
  console.log('支援原生分享');
} else {
  console.log('不支援,需使用備用方案');
}

// 檢查 Clipboard API 支援
if (navigator.clipboard) {
  console.log('支援剪貼簿 API');
} else {
  console.log('不支援,需使用備用方案');
}
```

---

## 🎯 功能描述

建立 CheapCut 的影片下載與分享功能,讓使用者可以輕鬆下載生成的影片,並分享到社群媒體。

### 為什麼需要這個?

- 🎯 **問題**: 使用者生成影片後,需要簡單的方式下載和分享
- ✅ **解決**: 提供一鍵下載、複製連結、社群分享等功能
- 💡 **比喻**: 就像餐廳用餐後,可以選擇外帶(下載)或推薦給朋友(分享)

### 完成後你會有:

- ✅ 一鍵下載影片功能
- ✅ 複製影片連結到剪貼簿
- ✅ 社群媒體分享 (Facebook, Twitter, Line)
- ✅ QR Code 生成與下載 (可選)
- ✅ 下載進度顯示
- ✅ 優雅的錯誤處理
- ✅ **下載與儲存成本資訊顯示**

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. HTML5 Download Attribute

**是什麼**: HTML5 的 `download` 屬性,讓連結點擊時下載檔案而非開啟

**核心概念**:
- **download 屬性**: 加在 `<a>` 標籤上,指定下載的檔名
- **Blob URL**: 可以用 JavaScript 建立臨時下載連結
- **CORS 限制**: 跨域資源需要正確的 CORS headers

**為什麼使用**:
- 簡單易用,瀏覽器原生支援
- 不需要後端 API
- 使用者體驗好

**基本用法**:
```html
<!-- 直接下載 -->
<a href="https://example.com/video.mp4" download="my-video.mp4">
  下載影片
</a>

<!-- 使用 JavaScript 觸發下載 -->
<script>
function downloadVideo(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
</script>
```

### 2. Clipboard API

**是什麼**: 瀏覽器提供的剪貼簿存取 API

**為什麼需要**:
- 讓使用者可以一鍵複製影片連結
- 比手動選取複製更方便
- 提供更好的使用者體驗

**基本用法**:
```typescript
// 複製文字到剪貼簿
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('複製成功');
  } catch (error) {
    console.error('複製失敗:', error);
  }
}
```

**瀏覽器支援**:
- Chrome / Edge: ✅ 支援
- Firefox: ✅ 支援
- Safari: ✅ 支援 (需 HTTPS)
- 舊版瀏覽器: ❌ 需備用方案 (document.execCommand)

### 3. Web Share API

**是什麼**: 瀏覽器原生的分享 API,可以觸發系統分享面板

**為什麼使用**:
- 原生分享體驗,特別適合行動裝置
- 使用者可以分享到任何已安裝的 app
- 不需要整合各個社群平台 SDK

**基本用法**:
```typescript
async function shareVideo(url: string, title: string) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: '來看看我生成的影片!',
        url: url,
      });
      console.log('分享成功');
    } catch (error) {
      console.error('分享失敗:', error);
    }
  } else {
    console.log('瀏覽器不支援 Web Share API');
  }
}
```

**瀏覽器支援**:
- Chrome Mobile: ✅ 支援
- Safari iOS: ✅ 支援
- Desktop Browser: ⚠️ 部分支援 (需備用方案)

### 4. QR Code 生成

**是什麼**: 將 URL 轉換為 QR Code 圖片

**為什麼需要**:
- 方便行動裝置掃描
- 可以印刷或嵌入文件
- 專業感

**推薦函式庫**: `react-qr-code` (簡單易用)

**基本用法**:
```typescript
import QRCode from 'react-qr-code';

<QRCode value="https://example.com/video/123" size={256} />
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 3.7: 影片預覽播放 (影片已可預覽)
- ✅ Task 3.6: 影片生成介面 (影片已生成)

### 系統需求
- Node.js >= 18.17.0
- 瀏覽器支援 ES6+
- HTTPS (部分 API 需要安全連線)

### 套件需求
```bash
# QR Code 生成
npm install react-qr-code

# 如果需要下載 QR Code 圖片
npm install html2canvas

# 圖示
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

---

## 📝 實作步驟

### 步驟 1: 安裝相依套件

```bash
# 進入 frontend 目錄
cd frontend

# 安裝 QR Code 套件
npm install react-qr-code

# 安裝 html2canvas (用於下載 QR Code)
npm install html2canvas

# 安裝 shadcn/ui 元件
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

**為什麼需要這些**:
- `react-qr-code`: 產生 QR Code 圖片
- `html2canvas`: 將 QR Code 轉換為可下載的圖片
- `dialog`: 顯示分享選項對話框
- `dropdown-menu`: 下載選項選單

---

### 步驟 2: 建立下載工具函式

建立 `lib/utils/download.ts`:

```typescript
/**
 * 檔案下載工具
 *
 * 為什麼需要這個?
 * - 統一管理下載邏輯
 * - 處理跨瀏覽器相容性
 * - 提供錯誤處理
 */

/**
 * 下載檔案
 *
 * @param url - 檔案 URL
 * @param filename - 下載的檔名
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    // 方法 1: 使用 download 屬性 (同源或有 CORS)
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  } catch (error) {
    console.error('下載失敗:', error);
    throw new Error('檔案下載失敗,請稍後再試');
  }
}

/**
 * 使用 Fetch 下載檔案 (支援進度追蹤)
 *
 * @param url - 檔案 URL
 * @param filename - 下載的檔名
 * @param onProgress - 進度回調函式
 */
export async function downloadFileWithProgress(
  url: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 取得檔案大小
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    // 讀取 stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('無法讀取回應內容');
    }

    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      loaded += value.length;

      // 更新進度
      if (onProgress && total > 0) {
        const progress = (loaded / total) * 100;
        onProgress(progress);
      }
    }

    // 合併 chunks
    const blob = new Blob(chunks);
    const blobUrl = URL.createObjectURL(blob);

    // 觸發下載
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.click();

    // 清理
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('下載失敗:', error);
    throw new Error('檔案下載失敗,請稍後再試');
  }
}

/**
 * 從 Canvas 下載圖片
 *
 * @param canvas - Canvas 元素
 * @param filename - 下載的檔名
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error('無法產生圖片');
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  });
}
```

---

### 步驟 3: 建立剪貼簿工具函式

建立 `lib/utils/clipboard.ts`:

```typescript
/**
 * 剪貼簿工具
 *
 * 為什麼需要這個?
 * - 統一管理複製邏輯
 * - 提供降級方案 (fallback)
 * - 處理瀏覽器相容性
 */

/**
 * 複製文字到剪貼簿
 *
 * @param text - 要複製的文字
 * @returns Promise<boolean> - 是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 方法 1: 使用 Clipboard API (現代瀏覽器)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API 失敗,嘗試備用方案:', error);
      // 降級到方法 2
    }
  }

  // 方法 2: 使用 execCommand (舊版瀏覽器)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    return successful;
  } catch (error) {
    console.error('複製失敗:', error);
    return false;
  }
}

/**
 * 檢查是否支援剪貼簿 API
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}
```

---

### 步驟 4: 建立分享工具函式

建立 `lib/utils/share.ts`:

```typescript
/**
 * 社群分享工具
 *
 * 為什麼需要這個?
 * - 統一管理分享邏輯
 * - 支援多種分享方式
 * - 處理瀏覽器相容性
 */

export interface ShareOptions {
  url: string;
  title?: string;
  text?: string;
}

/**
 * 使用 Web Share API 分享
 */
export async function shareNative(options: ShareOptions): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: options.title,
      text: options.text,
      url: options.url,
    });
    return true;
  } catch (error) {
    // 使用者取消分享不算錯誤
    if ((error as Error).name === 'AbortError') {
      return false;
    }
    console.error('分享失敗:', error);
    return false;
  }
}

/**
 * 分享到 Facebook
 */
export function shareToFacebook(url: string): void {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

/**
 * 分享到 Twitter (X)
 */
export function shareToTwitter(url: string, text?: string): void {
  const tweetText = text ? `${text} ${url}` : url;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

/**
 * 分享到 Line
 */
export function shareToLine(url: string, text?: string): void {
  const message = text ? `${text}\n${url}` : url;
  const shareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
  window.open(shareUrl, '_blank');
}

/**
 * 透過 Email 分享
 */
export function shareViaEmail(url: string, subject?: string, body?: string): void {
  const emailSubject = subject || '分享影片';
  const emailBody = body || `來看看這個影片:\n${url}`;
  const mailto = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  window.location.href = mailto;
}

/**
 * 檢查是否支援 Web Share API
 */
export function isShareSupported(): boolean {
  return !!navigator.share;
}
```

---

### 步驟 5: 建立分享對話框元件

建立 `components/video/ShareDialog.tsx`:

```typescript
/**
 * 分享對話框
 *
 * 功能:
 * - 顯示分享選項
 * - 複製連結
 * - 社群媒體分享
 * - QR Code 顯示與下載
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import {
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  Download,
  Check,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { copyToClipboard } from '@/lib/utils/clipboard';
import {
  shareToFacebook,
  shareToTwitter,
  shareToLine,
  shareViaEmail,
  shareNative,
  isShareSupported,
} from '@/lib/utils/share';
import { downloadCanvas } from '@/lib/utils/download';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title?: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  videoUrl,
  title = 'CheapCut 生成的影片',
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  // 複製連結
  const handleCopyLink = async () => {
    const success = await copyToClipboard(videoUrl);

    if (success) {
      setCopied(true);
      toast({
        title: '已複製',
        description: '連結已複製到剪貼簿',
      });

      // 3 秒後恢復圖示
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast({
        title: '複製失敗',
        description: '請手動複製連結',
        variant: 'destructive',
      });
    }
  };

  // 原生分享
  const handleNativeShare = async () => {
    const success = await shareNative({
      url: videoUrl,
      title: title,
      text: '來看看我用 CheapCut 生成的影片!',
    });

    if (success) {
      toast({
        title: '分享成功',
      });
    }
  };

  // 社群媒體分享
  const handleSocialShare = (platform: string) => {
    switch (platform) {
      case 'facebook':
        shareToFacebook(videoUrl);
        break;
      case 'twitter':
        shareToTwitter(videoUrl, '來看看我用 CheapCut 生成的影片!');
        break;
      case 'line':
        shareToLine(videoUrl, '來看看我用 CheapCut 生成的影片!');
        break;
      case 'email':
        shareViaEmail(videoUrl, title);
        break;
    }

    toast({
      title: '已開啟分享',
      description: `正在透過 ${platform} 分享`,
    });
  };

  // 下載 QR Code
  const handleDownloadQRCode = async () => {
    const qrElement = document.getElementById('qr-code-container');
    if (!qrElement) return;

    try {
      const canvas = await html2canvas(qrElement, {
        backgroundColor: '#ffffff',
      });

      downloadCanvas(canvas, `qr-code-${Date.now()}.png`);

      toast({
        title: '下載成功',
        description: 'QR Code 已下載',
      });
    } catch (error) {
      toast({
        title: '下載失敗',
        description: '無法產生 QR Code 圖片',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享影片</DialogTitle>
          <DialogDescription>
            選擇您想要的分享方式
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">連結分享</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>

          {/* 連結分享 */}
          <TabsContent value="link" className="space-y-4">
            {/* 複製連結 */}
            <div className="flex gap-2">
              <Input
                value={videoUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* 原生分享 (如果支援) */}
            {isShareSupported() && (
              <Button
                onClick={handleNativeShare}
                className="w-full"
                variant="outline"
              >
                使用系統分享
              </Button>
            )}

            {/* 社群媒體分享 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">分享到社群媒體</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleSocialShare('facebook')}
                  variant="outline"
                  className="w-full"
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>

                <Button
                  onClick={() => handleSocialShare('twitter')}
                  variant="outline"
                  className="w-full"
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>

                <Button
                  onClick={() => handleSocialShare('line')}
                  variant="outline"
                  className="w-full"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Line
                </Button>

                <Button
                  onClick={() => handleSocialShare('email')}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* QR Code */}
          <TabsContent value="qrcode" className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              {/* QR Code 顯示 */}
              <div
                id="qr-code-container"
                className="p-4 bg-white rounded-lg border"
              >
                <QRCode
                  value={videoUrl}
                  size={200}
                  level="H"
                />
              </div>

              <p className="text-sm text-muted-foreground text-center">
                掃描 QR Code 即可開啟影片
              </p>

              {/* 下載 QR Code */}
              <Button
                onClick={handleDownloadQRCode}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                下載 QR Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 步驟 6: 建立下載按鈕元件

建立 `components/video/DownloadButton.tsx`:

```typescript
/**
 * 下載按鈕
 *
 * 功能:
 * - 下載影片
 * - 顯示下載進度
 * - 錯誤處理
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Download, Loader2 } from 'lucide-react';
import { downloadFileWithProgress } from '@/lib/utils/download';

interface DownloadButtonProps {
  videoUrl: string;
  filename?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function DownloadButton({
  videoUrl,
  filename = 'video.mp4',
  className,
  variant = 'default',
  size = 'default',
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress(0);

    try {
      // 使用帶進度的下載函式
      await downloadFileWithProgress(
        videoUrl,
        filename,
        (progress) => {
          setProgress(progress);
        }
      );

      toast({
        title: '下載完成',
        description: `${filename} 已下載`,
      });
    } catch (error) {
      console.error('下載失敗:', error);

      toast({
        title: '下載失敗',
        description: error instanceof Error ? error.message : '請稍後再試',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant={variant}
        size={size}
        className="w-full"
      >
        {isDownloading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            下載中... {Math.round(progress)}%
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            下載影片
          </>
        )}
      </Button>

      {/* 進度條 */}
      {isDownloading && (
        <Progress value={progress} className="mt-2" />
      )}
    </div>
  );
}
```

---

### 步驟 7: 更新預覽頁面

修改 `app/(main)/preview/[jobId]/page.tsx`,整合下載與分享功能:

```typescript
/**
 * 影片預覽頁面 (更新版)
 *
 * 新增功能:
 * - 下載按鈕 (帶進度)
 * - 分享對話框
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { DownloadButton } from '@/components/video/DownloadButton';
import { ShareDialog } from '@/components/video/ShareDialog';
import { ArrowLeft, Share2 } from 'lucide-react';
import useSWR from 'swr';
import { getJobStatus } from '@/lib/api/video';
import { Skeleton } from '@/components/ui/skeleton';

export default function PreviewPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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

  if (error || !job || job.status !== 'completed') {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">找不到影片或影片尚未完成</p>
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

  // 產生檔名
  const filename = `cheapcut-video-${jobId}.mp4`;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">影片預覽</h1>
            <p className="text-muted-foreground mt-2">
              影片已生成完成,可以預覽、下載和分享
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 下載按鈕 */}
          <DownloadButton
            videoUrl={job.outputVideoUrl!}
            filename={filename}
            size="lg"
          />

          {/* 分享按鈕 */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShareDialogOpen(true)}
          >
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
            </div>
          </CardContent>
        </Card>

        {/* 成本資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>💰 成本資訊</CardTitle>
            <CardDescription>
              此影片產生的成本明細
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">生成處理成本</span>
                <span className="font-medium">$0.05 USD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">儲存成本 (每月)</span>
                <span className="font-medium">$0.01 USD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">下載流量成本 (每次)</span>
                <span className="font-medium">~$0.005 USD</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">累計總成本</span>
                <span className="font-bold text-lg text-primary">$0.06 USD</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 提示: 多次下載同一影片會增加流量成本,建議妥善保存下載的影片
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分享對話框 */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        videoUrl={job.outputVideoUrl!}
        title="CheapCut 生成的影片"
      />
    </div>
  );
}
```

---

### 步驟 8: 新增 Tabs 元件 (如果還沒安裝)

```bash
# 安裝 shadcn/ui Tabs 元件
npx shadcn-ui@latest add tabs
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
# 完成影片生成後,訪問預覽頁面測試下載與分享功能
# http://localhost:3000/preview/{jobId}
```

**預期結果**:
- ✅ 下載按鈕可以正常下載影片
- ✅ 下載進度正確顯示
- ✅ 複製連結功能正常
- ✅ 社群分享按鈕正常開啟分享頁面
- ✅ QR Code 正確顯示
- ✅ QR Code 可以下載

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
- 📁 **Functional Acceptance** (6 tests): 下載分享功能正確性
- 📁 **E2E Acceptance** (3 tests): 完整下載分享流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-3.8

# 或分別執行
npm test -- task-3.8-verification.test.ts
npm test -- task-3.8-functional.test.ts
npm test -- task-3.8-e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ 下載功能正常運作
- ✅ 分享功能正常運作
- ✅ QR Code 正常顯示與下載
- ✅ 錯誤處理完善

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/acceptance/basic/task-3.8-verification.test.ts`

1. ✓ DownloadButton 元件正確渲染
2. ✓ ShareDialog 元件正確渲染
3. ✓ 下載工具函式正確實作
4. ✓ 剪貼簿工具函式正確實作
5. ✓ 分享工具函式正確實作

### Functional Acceptance (6 tests)

測試檔案: `tests/acceptance/feature/task-3.8-functional.test.ts`

1. ✓ 下載功能正常運作
2. ✓ 下載進度正確顯示
3. ✓ 複製連結功能正常
4. ✓ 社群分享連結正確產生
5. ✓ QR Code 正確顯示
6. ✓ QR Code 可以下載

### E2E Acceptance (3 tests)

測試檔案: `tests/acceptance/e2e/task-3.8-e2e.test.ts`

1. ✓ 完整下載流程正確運作
2. ✓ 完整分享流程正確運作
3. ✓ 錯誤處理正確執行

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 套件安裝
- [ ] react-qr-code 已安裝
- [ ] html2canvas 已安裝
- [ ] shadcn/ui 額外元件已安裝

### 檔案建立
- [ ] `lib/utils/download.ts` 已建立
- [ ] `lib/utils/clipboard.ts` 已建立
- [ ] `lib/utils/share.ts` 已建立
- [ ] `components/video/DownloadButton.tsx` 已建立
- [ ] `components/video/ShareDialog.tsx` 已建立
- [ ] `app/(main)/preview/[jobId]/page.tsx` 已更新

### 功能驗證
- [ ] 影片可以正常下載
- [ ] 下載進度正確顯示
- [ ] 複製連結功能正常
- [ ] 社群分享功能正常
- [ ] QR Code 正確顯示
- [ ] QR Code 可以下載
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
| `CORS Error` | 跨域資源共享問題 | 檢查 GCS CORS 設定 |
| `Download failed` | 檔案無法訪問或網路問題 | 確認檔案 URL 有效 |
| `Clipboard API not available` | 瀏覽器不支援或非 HTTPS | 使用 fallback 方案 |
| `Share API not supported` | 瀏覽器不支援 | 提供社群分享按鈕 |

---

### 問題 1: 下載失敗,沒有任何反應

**錯誤訊息:**
```
Failed to download file
```

**解決方案:**

1. **檢查 CORS 設定**:
```bash
# 檢查 GCS CORS
gsutil cors get gs://your-bucket

# 如果沒有設定,建立 cors.json:
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length", "Range"],
    "maxAgeSeconds": 3600
  }
]
EOF

# 套用 CORS 設定
gsutil cors set cors.json gs://your-bucket
```

2. **檢查檔案 URL**:
```typescript
// 在下載前先測試 URL
const testUrl = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log('Status:', response.status);
    console.log('Headers:', [...response.headers.entries()]);
  } catch (error) {
    console.error('URL 測試失敗:', error);
  }
};
```

---

### 問題 2: 複製連結沒有反應

**問題**: 點擊複製按鈕沒有反應,也沒有錯誤訊息

**解決方案:**

檢查瀏覽器是否支援 Clipboard API:

```typescript
// 加入檢查
const handleCopyLink = async () => {
  console.log('Clipboard API 支援:', !!navigator.clipboard);

  if (!navigator.clipboard) {
    // 使用 fallback
    const success = await copyToClipboard(videoUrl);
    console.log('Fallback 結果:', success);
  } else {
    // 使用 Clipboard API
    const success = await copyToClipboard(videoUrl);
    console.log('複製結果:', success);
  }
};
```

確認網站使用 HTTPS:

```typescript
// Clipboard API 需要 HTTPS (localhost 除外)
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  console.warn('Clipboard API 需要 HTTPS');
}
```

---

### 問題 3: QR Code 無法下載

**錯誤訊息:**
```
Failed to generate image
```

**解決方案:**

確認 html2canvas 正確載入:

```typescript
import html2canvas from 'html2canvas';

const handleDownloadQRCode = async () => {
  console.log('html2canvas:', typeof html2canvas); // 應該是 'function'

  const qrElement = document.getElementById('qr-code-container');
  console.log('QR 元素:', qrElement); // 確認元素存在

  if (!qrElement) {
    console.error('找不到 QR Code 元素');
    return;
  }

  try {
    const canvas = await html2canvas(qrElement, {
      backgroundColor: '#ffffff',
      logging: true, // ← 開啟除錯訊息
    });

    console.log('Canvas 生成成功:', canvas);
    downloadCanvas(canvas, `qr-code-${Date.now()}.png`);
  } catch (error) {
    console.error('Canvas 生成失敗:', error);
  }
};
```

---

### 問題 4: 社群分享視窗被彈窗攔截

**問題**: 點擊分享按鈕,視窗被瀏覽器攔截

**解決方案:**

確認分享函式是由使用者互動觸發:

```typescript
// ✅ 正確: 直接由按鈕觸發
<Button onClick={() => shareToFacebook(url)}>
  分享到 Facebook
</Button>

// ❌ 錯誤: 非同步後觸發會被攔截
<Button onClick={async () => {
  await someAsyncFunction();
  shareToFacebook(url); // 可能被攔截
}}>
  分享
</Button>
```

提供備用方案:

```typescript
const handleShare = (platform: string) => {
  try {
    shareToFacebook(url);
  } catch (error) {
    // 如果被攔截,顯示連結讓使用者手動開啟
    toast({
      title: '請允許彈窗',
      description: '或點擊下方連結手動分享',
      action: (
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          手動分享
        </a>
      ),
    });
  }
};
```

---

### 問題 5: 下載進度不準確

**問題**: 下載進度顯示不正確或跳躍

**解決方案:**

確認伺服器回傳 Content-Length header:

```typescript
const downloadFileWithProgress = async (url: string, filename: string, onProgress) => {
  const response = await fetch(url);

  const contentLength = response.headers.get('content-length');
  console.log('Content-Length:', contentLength); // ← 檢查是否存在

  if (!contentLength) {
    console.warn('伺服器未提供檔案大小,無法顯示進度');
    // 改用不確定進度的 UI
  }

  // ...
};
```

如果沒有 Content-Length,使用不確定進度條:

```typescript
{isDownloading && (
  <>
    {progress > 0 ? (
      <Progress value={progress} className="mt-2" />
    ) : (
      <Progress value={100} className="mt-2 animate-pulse" />
    )}
  </>
)}
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **Web Share API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
- **Clipboard API**: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
- **Fetch API with Progress**: https://javascript.info/fetch-progress
- **QR Code**: https://www.qrcode.com/en/
- **html2canvas**: https://html2canvas.hertzen.com/

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 下載和分享功能都正常運作

### 最終驗收指令

```bash
# 進入 frontend 目錄
cd frontend

# 執行驗收測試
npm run verify:task task-3.8

# 如果全部通過,你應該看到:
# PASS tests/acceptance/basic/task-3.8-verification.test.ts
# PASS tests/acceptance/feature/task-3.8-functional.test.ts
# PASS tests/acceptance/e2e/task-3.8-e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 3.8 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 遇到的主要問題與解決方法
- 學到的新知識
- 下次可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: 繼續 Phase 4 - 整合測試與部署

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
