# Task 3.5: 配音錄製介面

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 3.5 |
| **Task 名稱** | 配音錄製介面 |
| **所屬 Phase** | Phase 3: 前端開發 |
| **預估時間** | 4-5 小時 (錄音功能 2h + UI 實作 1.5h + 測試 1.5h) |
| **難度** | ⭐⭐⭐⭐ 中高難度 |
| **前置 Task** | Task 3.4 (素材庫管理) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的錄音問題**:

1. **麥克風權限被拒絕**
   ```
   Error: Permission denied
          ^^^^^^^^^^^^^^^^^  ← 用戶拒絕麥克風權限
   ```

2. **判斷錯誤類型**
   - `Permission denied` → 麥克風權限被拒絕
   - `NotFoundError` → 找不到麥克風裝置
   - `NotAllowedError` → 用戶拒絕權限請求
   - `NotReadableError` → 麥克風正被其他程式使用

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"錄音不能用"  ← 太模糊
"麥克風錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"MediaRecorder API React example"  ← 具體 API + 框架
"getUserMedia permission denied handling"  ← 明確問題
"Web Audio API visualizer waveform"  ← 具體功能
```

#### 🌐 推薦資源

**優先順序 1: 官方文件**
- MDN MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- MDN getUserMedia: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

### Step 3: 檢查瀏覽器支援

```bash
# 在瀏覽器 Console 測試
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('麥克風可用', stream))
  .catch(err => console.error('麥克風錯誤', err))

# 檢查瀏覽器支援
console.log('getUserMedia:', !!navigator.mediaDevices?.getUserMedia)
console.log('MediaRecorder:', !!window.MediaRecorder)
```

---

## 🎯 功能描述

建立配音錄製介面,支援瀏覽器錄音、音檔上傳、預覽播放功能。

### 為什麼需要這個?

- 🎯 **問題**: 用戶需要為影片配音,但沒有方便的錄製工具
- ✅ **解決**: 提供瀏覽器內錄音、上傳、預覽功能
- 💡 **比喻**: 就像語音備忘錄,簡單錄製並使用

### 完成後你會有:

- ✅ 瀏覽器錄音功能 (MediaRecorder API)
- ✅ 錄音時長顯示
- ✅ 音檔上傳功能
- ✅ 音訊播放預覽
- ✅ 波形視覺化 (選擇性)
- ✅ 重新錄製功能
- ✅ 麥克風權限處理
- ✅ 音檔格式驗證

---

## 📚 前置知識

### 1. MediaRecorder API

**是什麼**: 瀏覽器提供的媒體錄製 API

**核心概念**:
- **getUserMedia**: 取得麥克風/攝影機存取
- **MediaRecorder**: 錄製音訊/影片
- **Blob**: 儲存錄製的二進位資料

**基本用法**:
```typescript
// 1. 取得麥克風權限
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// 2. 建立 MediaRecorder
const recorder = new MediaRecorder(stream);

// 3. 監聽資料
const chunks: Blob[] = [];
recorder.ondataavailable = (e) => chunks.push(e.data);

// 4. 開始錄音
recorder.start();

// 5. 停止錄音
recorder.stop();

// 6. 取得音檔
recorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'audio/webm' });
  const url = URL.createObjectURL(blob);
};
```

### 2. Audio 元件

**是什麼**: HTML5 的音訊播放元件

**為什麼要用**:
- 內建播放控制
- 支援各種音訊格式
- 可程式化控制

**基本用法**:
```typescript
<audio
  src={audioUrl}
  controls
  onEnded={handleEnded}
/>
```

### 3. Blob 與 File 處理

**是什麼**: 二進位資料物件

**關鍵操作**:
- **Blob → URL**: `URL.createObjectURL(blob)`
- **Blob → File**: `new File([blob], 'recording.webm')`
- **File → FormData**: `formData.append('file', file)`

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 3.1: Next.js 專案設定
- ✅ Task 3.2: 登入/註冊頁面
- ✅ Task 3.4: 素材庫管理

### 套件依賴
無需額外套件 (使用瀏覽器原生 API)

### 後端 API 需求
- `POST /api/voiceovers/upload`: 上傳配音檔案

### 瀏覽器需求
- 支援 MediaRecorder API (Chrome 49+, Firefox 25+, Safari 14+)
- HTTPS 環境 (麥克風權限需要)

---

## 📝 實作步驟

### 步驟 1: 建立錄音 Hook

建立 `lib/hooks/use-audio-recorder.ts`:

```typescript
/**
 * 音訊錄製 Hook
 *
 * 為什麼需要這個?
 * - 封裝 MediaRecorder API 複雜邏輯
 * - 提供簡單的錄音介面
 * - 處理瀏覽器相容性
 */

'use client';

import { useState, useRef, useCallback } from 'react';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export function useAudioRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 開始錄音
   */
  const startRecording = useCallback(async () => {
    try {
      // 清除之前的錯誤
      setError(null);

      // 取得麥克風權限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // 建立 MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // 監聽資料
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // 監聽停止事件
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setRecordingState('stopped');

        // 停止計時器
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // 釋放媒體流
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      // 開始錄音
      mediaRecorder.start();
      setRecordingState('recording');
      setRecordingTime(0);

      // 啟動計時器
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('錄音錯誤:', err);

      // 處理各種錯誤
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('您拒絕了麥克風權限,請在瀏覽器設定中允許');
        } else if (err.name === 'NotFoundError') {
          setError('找不到麥克風裝置');
        } else if (err.name === 'NotReadableError') {
          setError('麥克風正在被其他程式使用');
        } else {
          setError(`錄音錯誤: ${err.message}`);
        }
      } else {
        setError('未知錯誤');
      }

      setRecordingState('idle');
    }
  }, []);

  /**
   * 停止錄音
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [recordingState]);

  /**
   * 暫停錄音
   */
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [recordingState]);

  /**
   * 繼續錄音
   */
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  }, [recordingState]);

  /**
   * 重置
   */
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }

    chunksRef.current = [];
    setAudioBlob(null);
    setRecordingState('idle');
    setRecordingTime(0);
    setError(null);
  }, []);

  return {
    recordingState,
    recordingTime,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  };
}
```

---

### 步驟 2: 建立錄音元件

建立 `components/voiceover/audio-recorder.tsx`:

```typescript
/**
 * 音訊錄製元件
 */

'use client';

import { useAudioRecorder } from '@/lib/hooks/use-audio-recorder';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Square, Play, Pause, RotateCcw, Upload } from 'lucide-react';
import { useState } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const {
    recordingState,
    recordingTime,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  } = useAudioRecorder();

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  /**
   * 格式化時間 (秒 → MM:SS)
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 處理停止錄音
   */
  const handleStop = () => {
    stopRecording();
  };

  /**
   * 處理錄音完成
   */
  const handleComplete = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  /**
   * 生成音訊 URL (用於播放)
   */
  React.useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  return (
    <div className="space-y-6">
      {/* 錯誤訊息 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 錄音狀態顯示 */}
      <div className="flex flex-col items-center space-y-4">
        {/* 時間顯示 */}
        <div className="text-5xl font-mono font-bold">
          {formatTime(recordingTime)}
        </div>

        {/* 狀態指示 */}
        <div className="flex items-center gap-2">
          {recordingState === 'recording' && (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">錄音中...</span>
            </>
          )}
          {recordingState === 'paused' && (
            <span className="text-sm text-muted-foreground">已暫停</span>
          )}
          {recordingState === 'stopped' && (
            <span className="text-sm text-muted-foreground">錄音完成</span>
          )}
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex justify-center gap-4">
        {recordingState === 'idle' && (
          <Button onClick={startRecording} size="lg">
            <Mic className="w-5 h-5 mr-2" />
            開始錄音
          </Button>
        )}

        {recordingState === 'recording' && (
          <>
            <Button onClick={pauseRecording} variant="outline" size="lg">
              <Pause className="w-5 h-5 mr-2" />
              暫停
            </Button>
            <Button onClick={handleStop} variant="destructive" size="lg">
              <Square className="w-5 h-5 mr-2" />
              停止
            </Button>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <Button onClick={resumeRecording} size="lg">
              <Play className="w-5 h-5 mr-2" />
              繼續
            </Button>
            <Button onClick={handleStop} variant="destructive" size="lg">
              <Square className="w-5 h-5 mr-2" />
              停止
            </Button>
          </>
        )}

        {recordingState === 'stopped' && (
          <>
            <Button onClick={reset} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5 mr-2" />
              重新錄製
            </Button>
            <Button onClick={handleComplete} size="lg">
              <Upload className="w-5 h-5 mr-2" />
              使用這段配音
            </Button>
          </>
        )}
      </div>

      {/* 音訊預覽 */}
      {audioUrl && recordingState === 'stopped' && (
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">預覽配音</p>
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
}
```

---

### 步驟 3: 建立音檔上傳元件

建立 `components/voiceover/audio-uploader.tsx`:

```typescript
/**
 * 音檔上傳元件
 */

'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
}

export function AudioUploader({ onFileSelect }: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.webm', '.ogg'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleRemove = () => {
    setSelectedFile(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12
            transition-colors cursor-pointer text-center
            ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg font-medium">放開以上傳音檔</p>
          ) : (
            <>
              <p className="text-lg font-medium">拖放音檔到這裡</p>
              <p className="text-sm text-muted-foreground mt-1">
                或點擊選擇檔案
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                支援 MP3、WAV、M4A、WebM、OGG 格式，最大 50MB
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {audioUrl && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">預覽音檔</p>
              <audio src={audioUrl} controls className="w-full" />
            </div>
          )}

          <Button onClick={handleConfirm} className="w-full">
            使用這個音檔
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

### 步驟 4: 安裝 Alert 元件

```bash
# 安裝 Alert 元件
npx shadcn-ui@latest add alert
```

---

### 步驟 5: 建立配音頁面

建立 `app/(main)/generate/page.tsx`:

```typescript
/**
 * 影片生成頁面
 * (包含配音錄製/上傳)
 */

'use client';

import { useState } from 'react';
import { AudioRecorder } from '@/components/voiceover/audio-recorder';
import { AudioUploader } from '@/components/voiceover/audio-uploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { apiPost } from '@/lib/api/client';

export default function GeneratePage() {
  const [voiceoverFile, setVoiceoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  /**
   * 處理錄音完成
   */
  const handleRecordingComplete = async (audioBlob: Blob) => {
    // 轉換為 File
    const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
      type: 'audio/webm',
    });
    setVoiceoverFile(file);
  };

  /**
   * 處理音檔上傳
   */
  const handleFileSelect = (file: File) => {
    setVoiceoverFile(file);
  };

  /**
   * 上傳配音並開始生成
   */
  const handleStartGeneration = async () => {
    if (!voiceoverFile) return;

    setIsUploading(true);
    try {
      // 上傳配音檔案
      const formData = new FormData();
      formData.append('file', voiceoverFile);

      const response = await apiPost<{ voiceoverId: string }>(
        '/api/voiceovers/upload',
        formData
      );

      toast({
        title: '上傳成功',
        description: '配音已上傳,正在分析內容...',
      });

      // 導向選片頁面
      router.push(`/generate/${response.voiceoverId}`);
    } catch (error) {
      toast({
        title: '上傳失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">開始製作影片</h1>
        <p className="text-muted-foreground mt-2">
          錄製或上傳配音,系統會自動從您的素材庫選擇合適的片段
        </p>
      </div>

      <Tabs defaultValue="record" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record">錄製配音</TabsTrigger>
          <TabsTrigger value="upload">上傳音檔</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-6">
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <AudioUploader onFileSelect={handleFileSelect} />
        </TabsContent>
      </Tabs>

      {/* 確認按鈕 */}
      {voiceoverFile && (
        <div className="mt-8 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">已選擇配音</p>
              <p className="text-sm text-muted-foreground">
                {voiceoverFile.name}
              </p>
            </div>
            <Button
              onClick={handleStartGeneration}
              size="lg"
              disabled={isUploading}
            >
              {isUploading ? '上傳中...' : '開始生成影片'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 步驟 6: 安裝 Tabs 元件

```bash
# 安裝 Tabs 元件
npx shadcn-ui@latest add tabs
```

---

### 步驟 7: 更新 API client (支援 FormData)

修改 `lib/api/client.ts`,加入 FormData 支援:

```typescript
/**
 * API 呼叫函式 (支援 FormData)
 */
export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const url = `${API_URL}${endpoint}`;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      // 如果 body 是 FormData,不設定 Content-Type (瀏覽器自動設定)
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  };

  if (body) {
    fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'API 錯誤', data);
  }

  return data as T;
}
```

---

### 步驟 8: 加入導航連結

更新 `app/(main)/layout.tsx`,加入導航:

```typescript
<nav className="border-b">
  <div className="container flex items-center justify-between h-16">
    <h1 className="text-xl font-bold">CheapCut</h1>
    <div className="flex items-center gap-6">
      <Link href="/materials" className="text-sm hover:underline">
        素材庫
      </Link>
      <Link href="/generate" className="text-sm hover:underline">
        製作影片
      </Link>
      <span className="text-sm text-muted-foreground">
        {user.email}
      </span>
    </div>
  </div>
</nav>
```

---

### 步驟 9: 測試錄音功能

```bash
# 啟動開發伺服器
npm run dev

# 開啟瀏覽器
# http://localhost:3000/generate
```

**測試項目**:
1. ✅ 麥克風權限請求正常
2. ✅ 錄音功能正常 (開始、暫停、繼續、停止)
3. ✅ 時間計數正確
4. ✅ 音訊預覽正常
5. ✅ 音檔上傳功能正常
6. ✅ Tab 切換正常
7. ✅ 錯誤處理正確 (權限拒絕等)

---

### 步驟 10: 處理 HTTPS 需求

**重要**: MediaRecorder API 需要 HTTPS 環境 (或 localhost)

**開發環境**: localhost 可以正常使用

**生產環境**: 需要 HTTPS

如果需要在本地測試 HTTPS:

```bash
# 使用 mkcert 建立本地 SSL 憑證
npm install -g mkcert
mkcert -install
mkcert localhost

# 在 package.json 加入
"dev:https": "next dev --experimental-https"
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (5 tests): 基礎功能檢查
- 📁 **Functional Acceptance** (6 tests): 錄音上傳功能
- 📁 **E2E Acceptance** (3 tests): 完整流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-3.5

# 或分別執行
npm test -- task-3.5-verification.test.ts
npm test -- task-3.5-functional.test.ts
npm test -- task-3.5-e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ 錄音功能正常運作
- ✅ 音檔上傳功能正常
- ✅ 錯誤處理正確

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/acceptance/basic/task-3.5-verification.test.ts`

1. ✓ AudioRecorder 元件存在
2. ✓ AudioUploader 元件存在
3. ✓ use-audio-recorder Hook 存在
4. ✓ 生成頁面存在
5. ✓ 麥克風權限處理正確

### Functional Acceptance (6 tests)

測試檔案: `tests/acceptance/feature/task-3.5-functional.test.ts`

1. ✓ 錄音功能正確運作 (開始、暫停、停止)
2. ✓ 錄音時間計數正確
3. ✓ 音訊預覽功能正常
4. ✓ 音檔上傳功能正常
5. ✓ 檔案格式驗證正確
6. ✓ Tab 切換功能正常

### E2E Acceptance (3 tests)

測試檔案: `tests/acceptance/e2e/task-3.5-e2e.test.ts`

1. ✓ 完整錄音流程正確
2. ✓ 完整上傳流程正確
3. ✓ 錯誤處理完整 (權限拒絕、格式錯誤等)

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 核心檔案
- [ ] `lib/hooks/use-audio-recorder.ts` 已建立
- [ ] `components/voiceover/audio-recorder.tsx` 已建立
- [ ] `components/voiceover/audio-uploader.tsx` 已建立
- [ ] `app/(main)/generate/page.tsx` 已建立
- [ ] `lib/api/client.ts` 已更新 (支援 FormData)

### 元件安裝
- [ ] Alert 元件已安裝
- [ ] Tabs 元件已安裝

### 功能驗證
- [ ] 麥克風權限請求正常
- [ ] 錄音功能正常 (開始、暫停、停止)
- [ ] 錄音時間計數正確
- [ ] 音訊預覽正常
- [ ] 重新錄製功能正常
- [ ] 音檔上傳功能正常
- [ ] Tab 切換正常
- [ ] 錯誤處理正確

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
| `NotAllowedError` | 用戶拒絕麥克風權限 | 提示用戶在設定中允許 |
| `NotFoundError` | 找不到麥克風 | 檢查裝置連接 |
| `NotReadableError` | 麥克風被佔用 | 關閉其他使用麥克風的程式 |
| `NotSupportedError` | 瀏覽器不支援 | 使用 Chrome/Firefox/Safari 14+ |

---

### 問題 1: 麥克風權限被拒絕

**錯誤訊息**: `NotAllowedError: Permission denied`

**解決方案**:

1. **提供清楚的錯誤訊息**:
```typescript
if (err.name === 'NotAllowedError') {
  setError('您拒絕了麥克風權限。請點擊網址列的鎖頭圖示 → 網站設定 → 允許麥克風');
}
```

2. **引導用戶重新授權**:
提供一個按鈕讓用戶重新請求權限

---

### 問題 2: 錄音沒有聲音

**錯誤現象**: 錄音完成但播放沒聲音

**解決方案**:

1. **檢查 mimeType**:
```typescript
// 檢查瀏覽器支援的格式
const mimeType = MediaRecorder.isTypeSupported('audio/webm')
  ? 'audio/webm'
  : 'audio/mp4';

const mediaRecorder = new MediaRecorder(stream, { mimeType });
```

2. **檢查 Blob 建立**:
```typescript
// 確保 Blob 的 type 與 MediaRecorder 一致
const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
```

---

### 問題 3: 在 Safari 無法錄音

**錯誤現象**: Safari 不支援 `audio/webm`

**解決方案**:

使用 Safari 支援的格式:

```typescript
const getSupportedMimeType = () => {
  const types = [
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
  ];

  return types.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
};

const mimeType = getSupportedMimeType();
const mediaRecorder = new MediaRecorder(stream, { mimeType });
```

---

### 問題 4: HTTP 環境無法使用麥克風

**錯誤訊息**: `getUserMedia is not supported over HTTP`

**解決方案**:

1. **開發環境**: 使用 localhost (允許 HTTP)
2. **生產環境**: 必須使用 HTTPS

```bash
# Next.js 啟用 HTTPS
npm run dev -- --experimental-https
```

---

### 問題 5: 錄音檔案太大

**問題**: WebM 檔案可能很大

**解決方案**:

1. **設定音訊位元率**:
```typescript
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm',
  audioBitsPerSecond: 128000, // 128kbps
});
```

2. **限制錄音時長**:
```typescript
const MAX_RECORDING_TIME = 300; // 5 分鐘

if (recordingTime >= MAX_RECORDING_TIME) {
  stopRecording();
  toast({
    title: '錄音時間已達上限',
    description: '最長錄音時間為 5 分鐘',
  });
}
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **MediaRecorder API**: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- **getUserMedia**: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Audio Worklet**: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 錄音和上傳功能都正常運作

### 最終驗收指令

```bash
# 進入 frontend 目錄
cd frontend

# 執行驗收測試
npm run verify:task task-3.5

# 如果全部通過,你應該看到:
# PASS tests/acceptance/basic/task-3.5-verification.test.ts
# PASS tests/acceptance/feature/task-3.5-functional.test.ts
# PASS tests/acceptance/e2e/task-3.5-e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 3.5 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 遇到的主要問題與解決方法
- 學到的新知識 (MediaRecorder API, Web Audio)
- 瀏覽器相容性問題
- 下次可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: 繼續 Task 3.6 - 影片生成流程

---

**文件版本**: 2.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
