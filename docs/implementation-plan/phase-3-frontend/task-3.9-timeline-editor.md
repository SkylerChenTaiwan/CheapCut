# Task 3.9: 時間軌編輯器

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 3.9 |
| **Task 名稱** | 時間軌編輯器 |
| **所屬 Phase** | Phase 3: 前端開發 |
| **預估時間** | 6-8 小時 (UI 元件 3h + 片段替換 2h + 預覽播放 2h + 測試 1h) |
| **難度** | ⭐⭐⭐⭐ 高難度 |
| **前置 Task** | Task 2.10 (時間軸生成), Task 3.6 (影片生成介面), Task 2.8 (候選片段查詢) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的時間軌編輯問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Cannot sync timeline with player
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 時間軸與播放器同步問題
   ```

2. **判斷錯誤類型**
   - `Cannot sync timeline` → 時間軸與播放器同步失敗
   - `Segment replacement failed` → 片段替換失敗
   - `Timeline render error` → 時間軌 UI 渲染錯誤
   - `Preview playback failed` → 預覽播放失敗

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"時間軌不能用"  ← 太模糊
"編輯器錯誤" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"React video timeline editor component"  ← 時間軌元件
"video.js timeline plugin" ← 影片播放器時間軸插件
"React drag and drop timeline" ← 拖拉時間軸
"synchronize video player with custom timeline" ← 同步播放器與時間軸
```

#### 🌐 推薦資源

**優先順序 1: 時間軌元件庫**
- Remotion: https://www.remotion.dev/ (React 影片編輯框架)
- React Timeline Editor: https://github.com/xzdarcy/react-timeline-editor
- Fabric.js Timeline: https://fabricjs.com/

**優先順序 2: 影片播放器**
- Video.js: https://videojs.com/
- Plyr: https://plyr.io/
- React Player: https://github.com/cookpete/react-player

---

### Step 3: 檢查時間軌資料

```javascript
// 檢查時間軌資料結構
console.log('Timeline data:', timeline);

// 檢查每個片段的時間範圍
timeline.segments.forEach((seg, idx) => {
  console.log(`Segment ${idx}:`, {
    startTime: seg.start_time,
    endTime: seg.end_time,
    duration: seg.end_time - seg.start_time,
    videoSegmentId: seg.video_segment_id
  });
});

// 檢查是否有時間重疊
for (let i = 0; i < timeline.segments.length - 1; i++) {
  if (timeline.segments[i].end_time > timeline.segments[i + 1].start_time) {
    console.error('Overlapping segments:', i, i + 1);
  }
}
```

---

## 🎯 功能描述

建立 CheapCut 的時間軌編輯器,讓使用者可以視覺化預覽 AI 自動生成的時間軸,並手動調整影片片段、字幕和配樂。

### 為什麼需要這個?

- 🎯 **問題**: AI 自動選片可能不符合用戶預期,需要提供調整介面
- ✅ **解決**: 提供直覺的時間軌編輯器,讓用戶可以預覽和調整 AI 生成的結果
- 💡 **比喻**: 就像影片編輯軟體 (Premiere, Final Cut),但更簡化和直覺

### 完成後你會有:

- ✅ 多軌時間軸 UI (配音軌、影片軌、字幕軌、配樂軌)
- ✅ 片段替換功能 (點擊片段 → 顯示候選 → 替換)
- ✅ 即時預覽播放 (根據時間軸動態組合)
- ✅ 字幕文字編輯
- ✅ 配樂選擇與調整
- ✅ 時間軸與播放器同步

---

## 📚 前置知識

以下是這個 Task 會用到的技術。如果你不熟悉也沒關係,只要照著步驟做就能完成。

### 1. Timeline UI 設計模式

**是什麼**: 影片編輯器的時間軌視覺化介面

**核心概念**:
- **多軌道 (Tracks)**: 配音軌、影片軌、字幕軌、配樂軌
- **時間刻度 (Timescale)**: 顯示時間軸 (00:00 - 00:45)
- **片段 (Segments)**: 時間軌上的可視化片段
- **播放指針 (Playhead)**: 顯示當前播放位置

**為什麼使用**:
- 讓用戶直覺理解影片結構
- 提供視覺化的編輯體驗
- 與專業編輯軟體一致的 UX

**基本結構**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【配音音軌】
00:00 ─────────┬─────────┬─────────┬──────── 00:45
            句子1      句子2      句子3
            (5秒)     (8秒)      (10秒)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【影片軌】
[seg_001] [seg_015] [seg_023]
  5秒       8秒       10秒

【字幕軌】
[句子1字幕][句子2字幕][句子3字幕]

【配樂軌】
[========= 背景音樂 =========]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Canvas 或 SVG 渲染

**是什麼**: 用 Canvas 或 SVG 繪製時間軌

**選擇建議**:
- **Canvas**: 效能好,適合大量片段
- **SVG**: 互動性好,適合少量片段
- **HTML/CSS**: 最簡單,適合 MVP

**基本實作 (HTML/CSS)**:
```typescript
// 時間軸容器
<div className="timeline-container">
  {/* 時間刻度 */}
  <div className="timescale">
    <span>00:00</span>
    <span>00:15</span>
    <span>00:30</span>
    <span>00:45</span>
  </div>

  {/* 配音軌 */}
  <div className="track voiceover-track">
    <div className="track-label">配音</div>
    <div className="track-content">
      {/* 配音片段顯示為單一長條 */}
      <div className="segment" style={{ width: '100%' }}>
        <audio src={voiceoverUrl} />
      </div>
    </div>
  </div>

  {/* 影片軌 */}
  <div className="track video-track">
    <div className="track-label">影片</div>
    <div className="track-content">
      {timeline.segments.map(seg => (
        <div
          key={seg.index}
          className="segment video-segment"
          style={{
            left: `${(seg.start_time / totalDuration) * 100}%`,
            width: `${((seg.end_time - seg.start_time) / totalDuration) * 100}%`
          }}
          onClick={() => handleSegmentClick(seg)}
        >
          <img src={seg.thumbnail} alt="" />
          <span>{seg.end_time - seg.start_time}s</span>
        </div>
      ))}
    </div>
  </div>

  {/* 字幕軌 */}
  <div className="track subtitle-track">
    <div className="track-label">字幕</div>
    <div className="track-content">
      {timeline.segments.map(seg => (
        <div
          key={seg.index}
          className="segment subtitle-segment"
          style={{
            left: `${(seg.start_time / totalDuration) * 100}%`,
            width: `${((seg.end_time - seg.start_time) / totalDuration) * 100}%`
          }}
        >
          <span>{seg.subtitle_text}</span>
        </div>
      ))}
    </div>
  </div>

  {/* 配樂軌 */}
  <div className="track music-track">
    <div className="track-label">配樂</div>
    <div className="track-content">
      <div className="segment music-segment" style={{ width: '100%' }}>
        <span>🎵 {timeline.music?.name || '無配樂'}</span>
      </div>
    </div>
  </div>

  {/* 播放指針 */}
  <div
    className="playhead"
    style={{ left: `${(currentTime / totalDuration) * 100}%` }}
  />
</div>
```

### 3. 時間軸與播放器同步

**是什麼**: 播放器播放時,時間軸同步更新

**核心邏輯**:
```typescript
const [currentTime, setCurrentTime] = useState(0);
const playerRef = useRef<HTMLVideoElement>(null);

// 監聽播放器時間更新
useEffect(() => {
  const player = playerRef.current;
  if (!player) return;

  const handleTimeUpdate = () => {
    setCurrentTime(player.currentTime);
  };

  player.addEventListener('timeupdate', handleTimeUpdate);
  return () => player.removeEventListener('timeupdate', handleTimeUpdate);
}, []);

// 點擊時間軸跳轉播放位置
const handleTimelineClick = (e: React.MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = x / rect.width;
  const newTime = percentage * totalDuration;

  if (playerRef.current) {
    playerRef.current.currentTime = newTime;
  }
};
```

### 4. 片段替換 UI 流程

**流程設計** (來自 Overall Design):

1. 用戶點擊時間軌上的某個影片片段
2. 彈出「替換片段介面」
3. 顯示候選片段 (從後端 API 取得)
4. 用戶選擇新片段
5. 系統替換並更新時間軌
6. 預覽播放更新

**候選片段介面設計**:
```
┌─────────────────────────────────────┐
│ 替換這個片段 (需要 5 秒)              │
├─────────────────────────────────────┤
│ 篩選: ☑ 產品 ☐ 特寫 ☐ 說話 ☐ 專業   │
├─────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐      │
│ │[縮圖] │ │[縮圖] │ │[縮圖] │      │
│ │ 8秒   │ │ 7秒   │ │ 6秒   │      │
│ │#產品  │ │#特寫  │ │#說話  │      │
│ └───────┘ └───────┘ └───────┘      │
│                                     │
│ ┌───────┐ ┌───────┐                │
│ │[縮圖] │ │[縮圖] │                │
│ │ 9秒   │ │ 5秒   │   [看更多...]  │
│ │#專業  │ │#產品  │                │
│ └───────┘ └───────┘                │
└─────────────────────────────────────┘
```

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 2.10: 時間軸生成 (後端已產生時間軸 JSON)
- ✅ Task 3.6: 影片生成介面 (影片生成流程已建立)
- ✅ Task 2.8: 候選片段查詢 (後端已支援候選片段查詢)

### 系統需求
- Node.js >= 18.17.0
- 瀏覽器支援 ES6+
- 支援 HTML5 Video

### 套件需求
```bash
# 影片播放器
npm install react-player

# 時間軌元件 (可選,也可以自己用 CSS 做)
npm install react-timeline-editor

# 對話框元件
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
```

---

## 📝 實作步驟

### 步驟 1: 建立時間軌資料結構

定義 `types/timeline.ts`:

```typescript
/**
 * 時間軸資料結構
 *
 * 這個結構對應後端 Task 2.10 產生的時間軸 JSON
 */

export interface TimelineSegment {
  index: number;
  start_time: number;  // 秒
  end_time: number;    // 秒
  video_segment_id: string;
  video_trim_start: number;  // 素材片段的裁切起點
  video_trim_end: number;    // 素材片段的裁切終點
  subtitle_text: string;
  subtitle_style: string;
  thumbnail?: string;  // 縮圖 URL
}

export interface TimelineMusic {
  music_id: string;
  name?: string;
  url?: string;
  volume: number;  // 0-1
  fade_in: number;  // 秒
  fade_out: number; // 秒
}

export interface Timeline {
  timeline_id: string;
  voiceover_url: string;
  total_duration: number;  // 秒
  segments: TimelineSegment[];
  music?: TimelineMusic;
}

export interface CandidateSegment {
  segment_id: string;
  thumbnail: string;
  duration: number;
  tags: string[];
  match_score: number;
}
```

---

### 步驟 2: 建立時間軌 UI 元件

建立 `components/timeline/TimelineEditor.tsx`:

```typescript
/**
 * 時間軌編輯器主元件
 *
 * 功能:
 * - 顯示多軌時間軸 (配音軌、影片軌、字幕軌、配樂軌)
 * - 支援片段點擊
 * - 支援播放同步
 * - 支援替換片段
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Timeline, TimelineSegment } from '@/types/timeline';
import { SegmentReplacementSheet } from './SegmentReplacementSheet';
import { cn } from '@/lib/utils';

interface TimelineEditorProps {
  timeline: Timeline;
  onSegmentReplace: (segmentIndex: number, newSegmentId: string) => void;
  onSubtitleEdit: (segmentIndex: number, newText: string) => void;
  onMusicChange: (musicId: string) => void;
}

export function TimelineEditor({
  timeline,
  onSegmentReplace,
  onSubtitleEdit,
  onMusicChange,
}: TimelineEditorProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<TimelineSegment | null>(null);
  const [replacementSheetOpen, setReplacementSheetOpen] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);

  // 計算片段在時間軸上的位置和寬度 (百分比)
  const getSegmentStyle = (segment: TimelineSegment) => {
    const left = (segment.start_time / timeline.total_duration) * 100;
    const width = ((segment.end_time - segment.start_time) / timeline.total_duration) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  // 處理片段點擊
  const handleSegmentClick = (segment: TimelineSegment) => {
    setSelectedSegment(segment);
    setReplacementSheetOpen(true);
  };

  // 處理片段替換
  const handleReplace = (newSegmentId: string) => {
    if (selectedSegment) {
      onSegmentReplace(selectedSegment.index, newSegmentId);
      setReplacementSheetOpen(false);
      setSelectedSegment(null);
    }
  };

  return (
    <div className="timeline-editor">
      {/* 時間刻度 */}
      <div className="timescale flex justify-between px-4 py-2 text-xs text-muted-foreground border-b">
        {Array.from({ length: Math.ceil(timeline.total_duration / 10) + 1 }, (_, i) => {
          const seconds = i * 10;
          const minutes = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return (
            <span key={i}>
              {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          );
        })}
      </div>

      {/* 時間軸容器 */}
      <div ref={timelineRef} className="timeline-container relative">
        {/* 配音軌 */}
        <div className="track voiceover-track">
          <div className="track-label">配音</div>
          <div className="track-content">
            <div className="segment w-full bg-blue-100 border border-blue-300 rounded flex items-center justify-center">
              <span className="text-xs">🎤 配音音軌</span>
            </div>
          </div>
        </div>

        {/* 影片軌 */}
        <div className="track video-track">
          <div className="track-label">影片</div>
          <div className="track-content relative h-20">
            {timeline.segments.map((segment) => (
              <div
                key={segment.index}
                className={cn(
                  "segment video-segment absolute top-0 h-full",
                  "bg-purple-100 border-2 border-purple-300 rounded cursor-pointer",
                  "hover:border-purple-500 transition-colors",
                  "flex flex-col items-center justify-center p-1"
                )}
                style={getSegmentStyle(segment)}
                onClick={() => handleSegmentClick(segment)}
              >
                {segment.thumbnail && (
                  <img
                    src={segment.thumbnail}
                    alt=""
                    className="w-full h-12 object-cover rounded mb-1"
                  />
                )}
                <span className="text-xs truncate">
                  {(segment.end_time - segment.start_time).toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 字幕軌 */}
        <div className="track subtitle-track">
          <div className="track-label">字幕</div>
          <div className="track-content relative h-16">
            {timeline.segments.map((segment) => (
              <div
                key={segment.index}
                className="segment subtitle-segment absolute top-0 h-full bg-green-100 border border-green-300 rounded flex items-center justify-center px-2"
                style={getSegmentStyle(segment)}
                onClick={() => {
                  const newText = prompt('編輯字幕:', segment.subtitle_text);
                  if (newText !== null) {
                    onSubtitleEdit(segment.index, newText);
                  }
                }}
              >
                <span className="text-xs truncate">{segment.subtitle_text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 配樂軌 */}
        <div className="track music-track">
          <div className="track-label">配樂</div>
          <div className="track-content">
            <div className="segment w-full bg-orange-100 border border-orange-300 rounded flex items-center justify-center cursor-pointer">
              <span className="text-xs">
                🎵 {timeline.music?.name || '選擇配樂'}
              </span>
            </div>
          </div>
        </div>

        {/* 播放指針 */}
        <div
          className="playhead absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
          style={{ left: `${(currentTime / timeline.total_duration) * 100}%` }}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1.5" />
        </div>
      </div>

      {/* 片段替換側邊欄 */}
      {selectedSegment && (
        <SegmentReplacementSheet
          open={replacementSheetOpen}
          onOpenChange={setReplacementSheetOpen}
          segment={selectedSegment}
          timelineId={timeline.timeline_id}
          onReplace={handleReplace}
        />
      )}

      {/* 樣式 */}
      <style jsx>{`
        .timeline-editor {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .track {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          min-height: 60px;
        }

        .track:last-child {
          border-bottom: none;
        }

        .track-label {
          width: 80px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 500;
          background: #f9fafb;
          border-right: 1px solid #e5e7eb;
        }

        .track-content {
          flex: 1;
          padding: 8px;
          position: relative;
        }

        .segment {
          user-select: none;
        }

        .video-segment:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
}
```

---

### 步驟 3: 建立片段替換側邊欄

建立 `components/timeline/SegmentReplacementSheet.tsx`:

```typescript
/**
 * 片段替換側邊欄
 *
 * 功能:
 * - 顯示候選片段
 * - 支援 Tag 篩選
 * - 支援預覽
 * - 支援替換
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TimelineSegment, CandidateSegment } from '@/types/timeline';
import { getCandidateSegments } from '@/lib/api/timeline';
import { cn } from '@/lib/utils';

interface SegmentReplacementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segment: TimelineSegment;
  timelineId: string;
  onReplace: (newSegmentId: string) => void;
}

export function SegmentReplacementSheet({
  open,
  onOpenChange,
  segment,
  timelineId,
  onReplace,
}: SegmentReplacementSheetProps) {
  const [candidates, setCandidates] = useState<CandidateSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [previewSegmentId, setPreviewSegmentId] = useState<string | null>(null);

  const duration = segment.end_time - segment.start_time;

  // 載入候選片段
  useEffect(() => {
    if (!open) return;

    const loadCandidates = async () => {
      setIsLoading(true);
      try {
        const data = await getCandidateSegments(timelineId, segment.index);
        setCandidates(data);
      } catch (error) {
        console.error('載入候選片段失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, [open, timelineId, segment.index]);

  // 篩選候選片段
  const filteredCandidates = selectedTags.length > 0
    ? candidates.filter(c => selectedTags.some(tag => c.tags.includes(tag)))
    : candidates;

  // 取得所有 Tags
  const allTags = Array.from(new Set(candidates.flatMap(c => c.tags)));

  // 處理 Tag 篩選
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>替換影片片段</SheetTitle>
          <SheetDescription>
            需要 {duration.toFixed(1)} 秒的片段
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Tag 篩選器 */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">篩選標籤</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 候選片段列表 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              候選片段 ({filteredCandidates.length})
            </p>

            {isLoading ? (
              // Loading skeleton
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : filteredCandidates.length === 0 ? (
              // 空狀態
              <div className="text-center py-8 text-muted-foreground">
                沒有符合條件的候選片段
              </div>
            ) : (
              // 候選片段網格
              <div className="grid grid-cols-2 gap-4">
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate.segment_id}
                    className={cn(
                      "border-2 rounded-lg overflow-hidden cursor-pointer transition-all",
                      previewSegmentId === candidate.segment_id
                        ? "border-primary ring-2 ring-primary"
                        : "border-border hover:border-primary"
                    )}
                    onClick={() => setPreviewSegmentId(candidate.segment_id)}
                  >
                    {/* 縮圖 */}
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={candidate.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                        {candidate.duration.toFixed(1)}s
                      </div>
                    </div>

                    {/* 資訊 */}
                    <div className="p-2 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {candidate.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        匹配度: {(candidate.match_score * 100).toFixed(0)}%
                      </div>
                    </div>

                    {/* 選擇按鈕 */}
                    {previewSegmentId === candidate.segment_id && (
                      <div className="p-2 pt-0">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReplace(candidate.segment_id);
                          }}
                        >
                          使用這個片段
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

### 步驟 4: 建立 API 函式

建立 `lib/api/timeline.ts`:

```typescript
/**
 * Timeline API 函式
 */

import { CandidateSegment } from '@/types/timeline';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * 取得候選片段
 */
export async function getCandidateSegments(
  timelineId: string,
  segmentIndex: number
): Promise<CandidateSegment[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/timeline/${timelineId}/segment/${segmentIndex}/candidates`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 加入認證 token
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch candidates: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * 替換時間軸片段
 */
export async function replaceTimelineSegment(
  timelineId: string,
  segmentIndex: number,
  newSegmentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/timeline/${timelineId}/segment/${segmentIndex}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        video_segment_id: newSegmentId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to replace segment: ${response.statusText}`);
  }
}

/**
 * 更新字幕文字
 */
export async function updateSubtitle(
  timelineId: string,
  segmentIndex: number,
  newText: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/timeline/${timelineId}/segment/${segmentIndex}/subtitle`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        subtitle_text: newText,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update subtitle: ${response.statusText}`);
  }
}
```

---

### 步驟 5: 整合到影片生成頁面

修改 `app/(main)/generate/[jobId]/edit/page.tsx`:

```typescript
/**
 * 時間軸編輯頁面
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TimelineEditor } from '@/components/timeline/TimelineEditor';
import { getTimeline, replaceTimelineSegment, updateSubtitle } from '@/lib/api/timeline';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

export default function TimelineEditPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  // 載入時間軸資料
  const { data: timeline, error, mutate } = useSWR(
    jobId ? `/api/timeline/${jobId}` : null,
    () => getTimeline(jobId)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 處理片段替換
  const handleSegmentReplace = async (segmentIndex: number, newSegmentId: string) => {
    try {
      await replaceTimelineSegment(timeline.timeline_id, segmentIndex, newSegmentId);

      // 重新載入時間軸
      mutate();

      toast({
        title: '替換成功',
        description: '影片片段已更新',
      });
    } catch (error) {
      console.error('替換失敗:', error);
      toast({
        title: '替換失敗',
        description: '無法替換影片片段,請稍後再試',
        variant: 'destructive',
      });
    }
  };

  // 處理字幕編輯
  const handleSubtitleEdit = async (segmentIndex: number, newText: string) => {
    try {
      await updateSubtitle(timeline.timeline_id, segmentIndex, newText);

      // 重新載入時間軸
      mutate();

      toast({
        title: '更新成功',
        description: '字幕已更新',
      });
    } catch (error) {
      console.error('更新失敗:', error);
      toast({
        title: '更新失敗',
        description: '無法更新字幕,請稍後再試',
        variant: 'destructive',
      });
    }
  };

  // 處理配樂變更
  const handleMusicChange = (musicId: string) => {
    // TODO: 實作配樂變更 API
    console.log('Change music:', musicId);
  };

  // 確認並送出影片合成
  const handleConfirmAndRender = async () => {
    setIsSubmitting(true);
    try {
      // TODO: 呼叫影片合成 API
      toast({
        title: '開始生成影片',
        description: '影片正在合成中,完成後會通知你',
      });

      // 跳轉到進度頁面
      router.push(`/generate/${jobId}/progress`);
    } catch (error) {
      console.error('送出失敗:', error);
      toast({
        title: '送出失敗',
        description: '無法開始影片合成,請稍後再試',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">載入時間軸失敗</p>
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

  if (!timeline) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">編輯時間軸</h1>
            <p className="text-muted-foreground mt-2">
              調整影片片段、字幕和配樂,完成後點擊「確認生成」
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href="/generate">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Link>
          </Button>
        </div>

        {/* 時間軸編輯器 */}
        <Card>
          <CardContent className="p-6">
            <TimelineEditor
              timeline={timeline}
              onSegmentReplace={handleSegmentReplace}
              onSubtitleEdit={handleSubtitleEdit}
              onMusicChange={handleMusicChange}
            />
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" size="lg">
            <Play className="mr-2 h-5 w-5" />
            預覽播放
          </Button>

          <Button
            size="lg"
            onClick={handleConfirmAndRender}
            disabled={isSubmitting}
          >
            {isSubmitting ? '送出中...' : '確認生成影片'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

### 步驟 6: 建立預覽播放功能 (可選)

建立 `components/timeline/TimelinePreview.tsx`:

```typescript
/**
 * 時間軸預覽播放器
 *
 * 功能:
 * - 根據時間軸動態組合片段
 * - 同步播放配音
 * - 顯示字幕
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Timeline } from '@/types/timeline';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface TimelinePreviewProps {
  timeline: Timeline;
  onTimeUpdate?: (currentTime: number) => void;
}

export function TimelinePreview({ timeline, onTimeUpdate }: TimelinePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 找出當前時間對應的片段
  useEffect(() => {
    const segmentIndex = timeline.segments.findIndex(
      seg => currentTime >= seg.start_time && currentTime < seg.end_time
    );
    if (segmentIndex !== -1) {
      setCurrentSegmentIndex(segmentIndex);
    }
  }, [currentTime, timeline.segments]);

  // 播放/暫停
  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      audioRef.current?.pause();
    } else {
      videoRef.current?.play();
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 時間更新
  const handleTimeUpdate = () => {
    const time = audioRef.current?.currentTime || 0;
    setCurrentTime(time);
    onTimeUpdate?.(time);
  };

  const currentSegment = timeline.segments[currentSegmentIndex];

  return (
    <div className="timeline-preview space-y-4">
      {/* 影片預覽區 */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={currentSegment?.video_url}
          muted
        />

        {/* 字幕 */}
        {currentSegment?.subtitle_text && (
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <div className="inline-block bg-black/80 text-white px-4 py-2 rounded">
              {currentSegment.subtitle_text}
            </div>
          </div>
        )}
      </div>

      {/* 配音播放器 (隱藏) */}
      <audio
        ref={audioRef}
        src={timeline.voiceover_url}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* 播放控制 */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon">
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button size="icon" onClick={togglePlay}>
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button variant="outline" size="icon">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* 進度條 */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={timeline.total_duration}
          value={currentTime}
          onChange={(e) => {
            const newTime = parseFloat(e.target.value);
            if (audioRef.current) audioRef.current.currentTime = newTime;
            if (videoRef.current) videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(timeline.total_duration)}</span>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
```

---

### 步驟 7: 測試執行

```bash
# 確保後端 API 正在運行
# 在後端目錄執行: npm start

# 啟動前端開發伺服器
cd frontend
npm run dev

# 開啟瀏覽器
# 完成影片生成後,訪問時間軸編輯頁面
# http://localhost:3000/generate/{jobId}/edit
```

**預期結果**:
- ✅ 時間軌 UI 正確顯示所有軌道
- ✅ 可以點擊影片片段查看候選
- ✅ 可以替換片段並即時更新
- ✅ 可以編輯字幕文字
- ✅ 預覽播放功能正常

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

- 📁 **Basic Verification** (5 tests): 基礎元件與資料結構
- 📁 **Functional Acceptance** (6 tests): 時間軌編輯功能正確性
- 📁 **E2E Acceptance** (3 tests): 完整編輯流程

### 執行驗收

```bash
# 一鍵執行所有驗收測試
npm run verify:task task-3.9

# 或分別執行
npm test -- task-3.9-verification.test.ts
npm test -- task-3.9-functional.test.ts
npm test -- task-3.9-e2e.test.ts
```

### 通過標準

- ✅ 所有 14 個測試通過 (5 + 6 + 3)
- ✅ 時間軌 UI 正確顯示
- ✅ 片段替換功能正常
- ✅ 字幕編輯功能正常
- ✅ 預覽播放功能正常

<details>
<summary>📊 查看詳細測試項目清單</summary>

### Basic Verification (5 tests)

測試檔案: `tests/acceptance/basic/task-3.9-verification.test.ts`

1. ✓ Timeline 資料結構正確定義
2. ✓ TimelineEditor 元件正確渲染
3. ✓ SegmentReplacementSheet 元件正確渲染
4. ✓ API 函式正確實作
5. ✓ 時間計算邏輯正確

### Functional Acceptance (6 tests)

測試檔案: `tests/acceptance/feature/task-3.9-functional.test.ts`

1. ✓ 時間軌正確顯示所有軌道
2. ✓ 片段位置和寬度計算正確
3. ✓ 點擊片段顯示候選列表
4. ✓ 替換片段功能正常
5. ✓ 字幕編輯功能正常
6. ✓ Tag 篩選功能正常

### E2E Acceptance (3 tests)

測試檔案: `tests/acceptance/e2e/task-3.9-e2e.test.ts`

1. ✓ 完整時間軌編輯流程正確運作
2. ✓ 多次替換片段正常運作
3. ✓ 錯誤處理正確執行

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 型別定義
- [ ] `types/timeline.ts` 已建立
- [ ] Timeline 資料結構正確定義
- [ ] CandidateSegment 資料結構正確定義

### 元件建立
- [ ] `components/timeline/TimelineEditor.tsx` 已建立
- [ ] `components/timeline/SegmentReplacementSheet.tsx` 已建立
- [ ] `components/timeline/TimelinePreview.tsx` 已建立 (可選)

### API 函式
- [ ] `lib/api/timeline.ts` 已建立
- [ ] getCandidateSegments API 函式已實作
- [ ] replaceTimelineSegment API 函式已實作
- [ ] updateSubtitle API 函式已實作

### 頁面整合
- [ ] `app/(main)/generate/[jobId]/edit/page.tsx` 已建立
- [ ] 時間軸編輯器已整合到頁面
- [ ] 片段替換功能已整合
- [ ] 字幕編輯功能已整合

### 功能驗證
- [ ] 時間軌 UI 正確顯示所有軌道
- [ ] 片段位置和寬度計算正確
- [ ] 點擊片段可以查看候選
- [ ] 可以替換片段並即時更新
- [ ] 可以編輯字幕文字
- [ ] Tag 篩選功能正常
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
| `Timeline render error` | 時間軸資料格式錯誤 | 檢查 Timeline 資料結構 |
| `Cannot sync timeline` | 播放器同步失敗 | 檢查 timeupdate 事件監聽 |
| `Segment replacement failed` | API 呼叫失敗 | 檢查後端 API 狀態 |
| `Candidates not loading` | 候選片段查詢失敗 | 檢查 Redis 快取與 API |

---

### 問題 1: 時間軌片段位置不正確

**錯誤現象:**
```
片段顯示位置錯誤,重疊或間距過大
```

**解決方案:**

1. **檢查時間計算邏輯**:
```typescript
const getSegmentStyle = (segment: TimelineSegment) => {
  // 確保使用正確的總時長
  const totalDuration = timeline.total_duration;

  // 計算百分比位置
  const left = (segment.start_time / totalDuration) * 100;
  const width = ((segment.end_time - segment.start_time) / totalDuration) * 100;

  console.log(`Segment ${segment.index}:`, {
    startTime: segment.start_time,
    endTime: segment.end_time,
    left: `${left}%`,
    width: `${width}%`
  });

  return { left: `${left}%`, width: `${width}%` };
};
```

2. **檢查時間軸資料完整性**:
```typescript
// 驗證時間軸資料
const validateTimeline = (timeline: Timeline) => {
  let prevEndTime = 0;

  for (const segment of timeline.segments) {
    // 檢查時間是否連續
    if (segment.start_time !== prevEndTime) {
      console.warn('Timeline gap detected:', {
        prevEndTime,
        currentStartTime: segment.start_time,
        gap: segment.start_time - prevEndTime
      });
    }

    // 檢查時間是否有效
    if (segment.end_time <= segment.start_time) {
      console.error('Invalid segment duration:', segment);
    }

    prevEndTime = segment.end_time;
  }
};
```

---

### 問題 2: 候選片段載入失敗

**錯誤訊息:**
```
Failed to fetch candidates: 404 Not Found
```

**解決方案:**

1. **檢查後端 API**:
```bash
# 測試候選片段 API
curl -X GET \
  "http://localhost:8080/api/timeline/{timelineId}/segment/{segmentIndex}/candidates" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

2. **檢查 Redis 快取**:
```typescript
// 在後端檢查快取是否存在
const candidates = await redis.get(
  `candidates:timeline_${timelineId}:segment_${segmentIndex}`
);

if (!candidates) {
  console.error('Candidates not cached for segment:', segmentIndex);
  // 重新生成候選片段
}
```

3. **確認前端 API 呼叫**:
```typescript
const getCandidateSegments = async (timelineId: string, segmentIndex: number) => {
  console.log('Fetching candidates:', { timelineId, segmentIndex });

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/timeline/${timelineId}/segment/${segmentIndex}/candidates`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(errorText);
    }

    const data = await response.json();
    console.log('Candidates loaded:', data);
    return data.data;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
};
```

---

### 問題 3: 片段替換後時間軌未更新

**錯誤現象:**
```
替換片段後,時間軌仍顯示舊片段
```

**解決方案:**

1. **使用 SWR mutate 重新載入**:
```typescript
const { data: timeline, mutate } = useSWR(
  `/api/timeline/${jobId}`,
  () => getTimeline(jobId)
);

const handleSegmentReplace = async (segmentIndex: number, newSegmentId: string) => {
  try {
    await replaceTimelineSegment(timeline.timeline_id, segmentIndex, newSegmentId);

    // 重新載入時間軸
    await mutate();  // ← 關鍵:重新載入資料

    toast({ title: '替換成功' });
  } catch (error) {
    toast({ title: '替換失敗', variant: 'destructive' });
  }
};
```

2. **或使用樂觀更新 (Optimistic Update)**:
```typescript
const handleSegmentReplace = async (segmentIndex: number, newSegmentId: string) => {
  // 樂觀更新:立即更新 UI
  const optimisticTimeline = {
    ...timeline,
    segments: timeline.segments.map((seg, idx) =>
      idx === segmentIndex
        ? { ...seg, video_segment_id: newSegmentId }
        : seg
    ),
  };

  // 更新本地狀態
  mutate(optimisticTimeline, false);

  try {
    // 呼叫 API
    await replaceTimelineSegment(timeline.timeline_id, segmentIndex, newSegmentId);

    // 重新驗證
    mutate();
  } catch (error) {
    // 如果失敗,恢復原本的資料
    mutate();
    toast({ title: '替換失敗', variant: 'destructive' });
  }
};
```

---

### 問題 4: 播放器與時間軸不同步

**錯誤現象:**
```
播放器播放時,播放指針位置不正確
```

**解決方案:**

1. **確保正確監聽 timeupdate 事件**:
```typescript
useEffect(() => {
  const player = playerRef.current;
  if (!player) return;

  const handleTimeUpdate = () => {
    const currentTime = player.currentTime;
    console.log('Player time:', currentTime);
    setCurrentTime(currentTime);
  };

  player.addEventListener('timeupdate', handleTimeUpdate);

  return () => {
    player.removeEventListener('timeupdate', handleTimeUpdate);
  };
}, []);
```

2. **確保播放指針位置計算正確**:
```typescript
<div
  className="playhead"
  style={{
    left: `${(currentTime / timeline.total_duration) * 100}%`
  }}
>
  <div className="playhead-indicator" />
</div>
```

3. **支援點擊時間軸跳轉**:
```typescript
const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = x / rect.width;
  const newTime = percentage * timeline.total_duration;

  console.log('Seek to:', newTime);

  if (playerRef.current) {
    playerRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }
};
```

---

### 問題 5: Tag 篩選沒有反應

**錯誤現象:**
```
點擊 Tag 後,候選片段列表沒有篩選
```

**解決方案:**

1. **檢查篩選邏輯**:
```typescript
const [selectedTags, setSelectedTags] = useState<string[]>([]);

const toggleTag = (tag: string) => {
  setSelectedTags(prev => {
    const newTags = prev.includes(tag)
      ? prev.filter(t => t !== tag)
      : [...prev, tag];

    console.log('Selected tags:', newTags);
    return newTags;
  });
};

const filteredCandidates = selectedTags.length > 0
  ? candidates.filter(c => {
      const hasMatchingTag = selectedTags.some(tag => c.tags.includes(tag));
      console.log('Candidate:', c.segment_id, 'matches:', hasMatchingTag);
      return hasMatchingTag;
    })
  : candidates;

console.log('Filtered candidates:', filteredCandidates.length);
```

2. **確認 Badge 互動**:
```typescript
<Badge
  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
  className="cursor-pointer"
  onClick={() => {
    console.log('Tag clicked:', tag);
    toggleTag(tag);
  }}
>
  {tag}
</Badge>
```

---

## 📚 延伸學習資源

如果你想深入了解這個 Task 使用的技術:

- **Timeline 編輯器設計**: https://www.remotion.dev/docs/timeline
- **React Timeline Editor**: https://github.com/xzdarcy/react-timeline-editor
- **Video.js**: https://videojs.com/
- **影片同步技術**: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event
- **Canvas Timeline**: https://fabricjs.com/

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 所有三層驗收測試都通過 (14/14)
3. ✅ 完成檢查清單都勾選
4. ✅ 時間軌編輯功能都正常運作

### 最終驗收指令

```bash
# 進入 frontend 目錄
cd frontend

# 執行驗收測試
npm run verify:task task-3.9

# 如果全部通過,你應該看到:
# PASS tests/acceptance/basic/task-3.9-verification.test.ts
# PASS tests/acceptance/feature/task-3.9-functional.test.ts
# PASS tests/acceptance/e2e/task-3.9-e2e.test.ts
#
# Test Suites: 3 passed, 3 total
# Tests:       14 passed, 14 total
```

**恭喜!** 如果看到上面的輸出,代表 Task 3.9 完成了! 🎉

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:
- Task 完成時間
- 遇到的主要問題與解決方法
- 學到的新知識
- 下次可以改進的地方

這些記錄在之後回顧時會很有用!

---

**下一步**: 繼續 Task 3.7 (影片預覽播放) 或 Task 3.8 (下載與分享功能)

---

**文件版本**: 1.0
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
