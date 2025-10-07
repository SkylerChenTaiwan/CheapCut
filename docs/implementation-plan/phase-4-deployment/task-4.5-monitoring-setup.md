# Task 4.5: 監控與告警設定

## 📋 Task 資訊

| 項目 | 內容 |
|------|------|
| **Task ID** | 4.5 |
| **Task 名稱** | 監控與告警設定 |
| **所屬 Phase** | Phase 4: 測試與部署 |
| **預估時間** | 5-6 小時 (監控設定 2h + 告警設定 2h + 整合測試 2h) |
| **難度** | ⭐⭐⭐⭐ 中等偏難 |
| **前置 Task** | Task 4.4 (Vercel 前端部署) |

## 🆘 遇到問題怎麼辦?

### Step 1: 先看錯誤訊息

**常見的監控設定問題**:

1. **找到錯誤的關鍵字**
   ```
   Error: Failed to create alert policy: Invalid metric filter
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ← 告警策略設定錯誤
   ```

2. **判斷問題類型**
   - `Metric not found` → 監控指標不存在或名稱錯誤
   - `Permission denied` → IAM 權限不足
   - `Invalid notification channel` → 通知渠道設定錯誤
   - `Sentry initialization failed` → Sentry DSN 設定錯誤
   - `Slack webhook failed` → Slack webhook URL 錯誤或失效

---

### Step 2: 上網搜尋

#### 🔍 搜尋技巧

**❌ 不好的搜尋方式**:
```
"監控設定失敗"  ← 太模糊
"告警不work" ← 沒有具體資訊
```

**✅ 好的搜尋方式**:
```
"Google Cloud Monitoring alert policy not triggering" ← 包含平台和具體問題
"Sentry Next.js integration error" ← 說明技術棧和錯誤
"Cloud Run metrics missing in dashboard" ← 描述完整情境
```

#### 🌐 推薦的搜尋資源

**優先順序 1: 官方文件**
- Cloud Monitoring: https://cloud.google.com/monitoring/docs
- Sentry 文件: https://docs.sentry.io/
- Slack API: https://api.slack.com/messaging/webhooks

**優先順序 2: GCP 社群**
- Google Cloud Community: https://www.googlecloudcommunity.com/
- Sentry Community: https://forum.sentry.io/

**優先順序 3: Stack Overflow**
- 搜尋時加上 `[google-cloud-monitoring]` 或 `[sentry]` tag
- 看「✓ 已接受的答案」

---

### Step 3: 檢查監控狀態

監控設定失敗時,先檢查基本狀態:

```bash
# 檢查 Cloud Monitoring API 是否啟用
gcloud services list --enabled | grep monitoring

# 列出所有告警策略
gcloud alpha monitoring policies list

# 檢查通知渠道
gcloud alpha monitoring channels list

# 查看最新的監控數據
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"' \
  --format=json

# 測試 Slack webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  YOUR_SLACK_WEBHOOK_URL

# 檢查 Sentry 狀態
curl https://sentry.io/api/0/projects/YOUR_ORG/YOUR_PROJECT/ \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

### Step 4: 問題還是沒解決?

**準備以下資訊尋求協助**:

```markdown
## 問題描述
我在執行 Task 4.5 設定監控與告警時遇到問題

## 監控情境
我在設定 [Cloud Monitoring / Sentry / Slack 通知]

## 錯誤訊息
```
[貼上完整的錯誤訊息]
```

## 我的環境
- GCP 專案 ID: xxx
- Cloud Run 服務: cheapcut-api
- Sentry 專案: xxx
- Node.js 版本: v18.12.0

## 我已經嘗試過
1. 檢查 API 是否啟用 → 已啟用
2. 檢查 IAM 權限 → 看起來正確
3. 測試 Slack webhook → 手動測試成功

## 告警策略 YAML
[貼上你的告警策略設定]
```

---

### 🎯 監控心法

1. **先建立基本監控,再逐步完善** - 不要一開始就設定太多告警
2. **設定合理的閾值** - 避免過多的誤報導致告警疲勞
3. **測試告警渠道** - 確保通知能正確送達
4. **定期檢視告警** - 根據實際情況調整閾值
5. **記錄異常模式** - 建立知識庫,加速問題排查

---

## 🎯 功能描述

建立完整的監控和告警系統,即時掌握系統健康狀態。整合 Google Cloud Monitoring、Sentry 錯誤追蹤、Slack 通知等服務,確保問題發生時能立即收到通知並快速處理。

### 為什麼需要這個?

- 🎯 **問題**: 系統出現問題時,開發者不知道,用戶已經受影響
- ✅ **解決**: 主動監控系統狀態,問題發生時立即告警
- 💡 **比喻**: 就像醫院的監視器,隨時監測病人生命跡象,異常時立即通知醫護人員

### 完成後你會有:

- Cloud Monitoring 儀表板
- 自動化告警策略 (CPU、記憶體、錯誤率)
- Sentry 錯誤追蹤整合
- Slack 通知渠道
- Uptime 健康檢查
- 日誌聚合和查詢
- SLO (Service Level Objective) 設定

---

## 📚 前置知識

以下是這個 Task 會用到的概念:

- **Cloud Monitoring**: GCP 的監控服務 → 收集、查看、分析指標和日誌
- **Metrics (指標)**: 數值化的監控數據 → CPU 使用率、記憶體使用量、請求數等
- **Alert Policy (告警策略)**: 定義何時發送告警 → 當 CPU > 80% 時發送通知
- **Notification Channel (通知渠道)**: 告警發送的目標 → Email、Slack、SMS
- **Sentry**: 錯誤追蹤服務 → 自動收集和分析應用程式錯誤
- **SLO/SLA**: 服務水準目標/協議 → 定義系統應達到的可用性標準
- **Log Aggregation (日誌聚合)**: 集中收集和分析日誌 → 方便查詢和除錯

---

## 🔗 前置依賴

### 必須先完成的 Task
- ✅ Task 4.3: GCP Cloud Run 部署
- ✅ Task 4.4: Vercel 前端部署
- ✅ Task 1.4: API 基礎架構

### 需要的帳號和服務

```bash
# 1. GCP 帳號 (已有)
# 2. Sentry 帳號
# 前往 https://sentry.io/ 註冊免費帳號

# 3. Slack workspace 和 webhook
# 前往 https://api.slack.com/messaging/webhooks 建立 incoming webhook
```

### 環境檢查

```bash
# 確認 Cloud Monitoring API 已啟用
gcloud services list --enabled | grep monitoring.googleapis.com

# 如果沒有,啟用 API
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# 確認 Cloud Run 服務運行中
gcloud run services list

# 確認有足夠的 IAM 權限
gcloud projects get-iam-policy PROJECT_ID
```

---

## 📝 實作步驟

### 步驟 1: 啟用必要的 GCP API

```bash
#!/bin/bash

echo "========================================"
echo "  啟用監控相關 API"
echo "========================================"

PROJECT_ID="cheapcut-prod"

# 設定專案
gcloud config set project ${PROJECT_ID}

# 啟用必要的 API
echo "Step 1: 啟用 Cloud Monitoring API..."
gcloud services enable monitoring.googleapis.com

echo "Step 2: 啟用 Cloud Logging API..."
gcloud services enable logging.googleapis.com

echo "Step 3: 啟用 Error Reporting API..."
gcloud services enable clouderrorreporting.googleapis.com

echo "Step 4: 啟用 Cloud Trace API..."
gcloud services enable cloudtrace.googleapis.com

echo "Step 5: 啟用 Cloud Profiler API..."
gcloud services enable cloudprofiler.googleapis.com

# 驗證 API 已啟用
echo "Step 6: 驗證 API 狀態..."
gcloud services list --enabled | grep -E "(monitoring|logging|error|trace|profiler)"

echo ""
echo "========================================"
echo "  API 啟用完成!"
echo "========================================"
```

儲存為 `scripts/enable-monitoring-apis.sh`:

```bash
chmod +x scripts/enable-monitoring-apis.sh
./scripts/enable-monitoring-apis.sh
```

---

### 步驟 2: 建立 Cloud Monitoring 工作區

```bash
#!/bin/bash

echo "========================================"
echo "  建立 Monitoring Workspace"
echo "========================================"

PROJECT_ID="cheapcut-prod"

# Cloud Monitoring 工作區會在第一次訪問 Monitoring 時自動建立
# 但我們可以透過 API 確認

# 開啟 Cloud Monitoring Dashboard
echo "請前往以下 URL 建立 Monitoring Workspace:"
echo "https://console.cloud.google.com/monitoring?project=${PROJECT_ID}"
echo ""
echo "首次訪問時會自動建立工作區"
echo ""

# 或使用 gcloud 命令確認
gcloud alpha monitoring dashboards list --project=${PROJECT_ID}

echo "========================================"
echo "  Workspace 設定完成"
echo "========================================"
```

---

### 步驟 3: 建立自訂監控儀表板

建立 `monitoring/dashboard-config.json`:

```json
{
  "displayName": "CheapCut 系統監控儀表板",
  "mosaicLayout": {
    "columns": 12,
    "tiles": [
      {
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Cloud Run - 請求數量",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_RATE",
                      "crossSeriesReducer": "REDUCE_SUM",
                      "groupByFields": ["resource.service_name"]
                    }
                  }
                },
                "plotType": "LINE",
                "targetAxis": "Y1"
              }
            ],
            "timeshiftDuration": "0s",
            "yAxis": {
              "label": "requests/s",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "xPos": 6,
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Cloud Run - 回應延遲 (P95)",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_latencies\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_DELTA",
                      "crossSeriesReducer": "REDUCE_PERCENTILE_95",
                      "groupByFields": ["resource.service_name"]
                    }
                  }
                },
                "plotType": "LINE",
                "targetAxis": "Y1"
              }
            ],
            "yAxis": {
              "label": "ms",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "yPos": 4,
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Cloud Run - CPU 使用率",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/container/cpu/utilizations\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_MEAN",
                      "crossSeriesReducer": "REDUCE_MEAN",
                      "groupByFields": ["resource.service_name"]
                    }
                  }
                },
                "plotType": "LINE",
                "targetAxis": "Y1"
              }
            ],
            "yAxis": {
              "label": "%",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "xPos": 6,
        "yPos": 4,
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Cloud Run - 記憶體使用率",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/container/memory/utilizations\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_MEAN",
                      "crossSeriesReducer": "REDUCE_MEAN",
                      "groupByFields": ["resource.service_name"]
                    }
                  }
                },
                "plotType": "LINE",
                "targetAxis": "Y1"
              }
            ],
            "yAxis": {
              "label": "%",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "yPos": 8,
        "width": 6,
        "height": 4,
        "widget": {
          "title": "API 錯誤率",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.label.response_code_class=\"5xx\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_RATE",
                      "crossSeriesReducer": "REDUCE_SUM",
                      "groupByFields": ["resource.service_name"]
                    }
                  }
                },
                "plotType": "LINE",
                "targetAxis": "Y1"
              }
            ],
            "yAxis": {
              "label": "errors/s",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "xPos": 6,
        "yPos": 8,
        "width": 6,
        "height": 4,
        "widget": {
          "title": "實例數量",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/container/instance_count\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_MAX",
                      "crossSeriesReducer": "REDUCE_MAX",
                      "groupByFields": ["resource.service_name"]
                    }
                  }
                },
                "plotType": "LINE",
                "targetAxis": "Y1"
              }
            ],
            "yAxis": {
              "label": "instances",
              "scale": "LINEAR"
            }
          }
        }
      }
    ]
  }
}
```

建立儀表板的腳本 `scripts/create-dashboard.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  建立監控儀表板"
echo "========================================"

PROJECT_ID="cheapcut-prod"

# 建立儀表板
gcloud monitoring dashboards create \
  --config-from-file=monitoring/dashboard-config.json \
  --project=${PROJECT_ID}

echo ""
echo "儀表板已建立!"
echo "查看儀表板: https://console.cloud.google.com/monitoring/dashboards?project=${PROJECT_ID}"
echo ""
```

---

### 步驟 4: 設定 Uptime Checks (健康檢查)

建立 `monitoring/uptime-check.yaml`:

```yaml
# Cloud Run API 健康檢查
displayName: "CheapCut API Health Check"
monitoredResource:
  type: "uptime_url"
  labels:
    project_id: "cheapcut-prod"
    host: "cheapcut-api-xxx.run.app"
httpCheck:
  path: "/api/health"
  port: 443
  useSsl: true
  validateSsl: true
  requestMethod: GET
period: 60s
timeout: 10s
contentMatchers:
  - content: '"status":"ok"'
    matcher: CONTAINS_STRING
selectedRegions:
  - USA
  - EUROPE
  - ASIA_PACIFIC
```

建立 Uptime Check 的腳本 `scripts/create-uptime-check.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  建立 Uptime Check"
echo "========================================"

PROJECT_ID="cheapcut-prod"
SERVICE_URL="https://cheapcut-api-xxx.run.app"

# 建立 Uptime Check
gcloud monitoring uptime create cheapcut-api-health \
  --project=${PROJECT_ID} \
  --resource-type=uptime-url \
  --display-name="CheapCut API Health Check" \
  --http-check-path="/api/health" \
  --port=443 \
  --use-ssl \
  --checked-region=USA \
  --checked-region=EUROPE \
  --checked-region=ASIA_PACIFIC \
  --timeout=10s \
  --period=60s

# 建立前端 Uptime Check
gcloud monitoring uptime create cheapcut-frontend-health \
  --project=${PROJECT_ID} \
  --resource-type=uptime-url \
  --display-name="CheapCut Frontend Health Check" \
  --http-check-path="/" \
  --port=443 \
  --use-ssl \
  --checked-region=USA \
  --checked-region=EUROPE \
  --checked-region=ASIA_PACIFIC \
  --timeout=10s \
  --period=60s

echo ""
echo "Uptime Checks 已建立!"
echo "查看: https://console.cloud.google.com/monitoring/uptime?project=${PROJECT_ID}"
echo ""
```

---

### 步驟 5: 設定告警策略 - CPU 和記憶體

建立 `monitoring/alert-cpu-high.yaml`:

```yaml
# CPU 使用率過高告警
displayName: "Cloud Run - CPU 使用率過高"
documentation:
  content: |
    Cloud Run 服務的 CPU 使用率超過 80%。

    **可能原因:**
    - 流量突然增加
    - 程式碼效能問題
    - 無限迴圈或死鎖

    **處理步驟:**
    1. 檢查 Cloud Run 實例數量是否達到上限
    2. 查看日誌確認是否有異常請求
    3. 檢視 Cloud Profiler 找出效能瓶頸
    4. 考慮增加 CPU 配置或優化程式碼
  mimeType: "text/markdown"
conditions:
  - displayName: "CPU utilization > 80%"
    conditionThreshold:
      filter: |
        resource.type = "cloud_run_revision"
        AND metric.type = "run.googleapis.com/container/cpu/utilizations"
      comparison: COMPARISON_GT
      thresholdValue: 0.8
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_MEAN
          crossSeriesReducer: REDUCE_MEAN
          groupByFields:
            - resource.service_name
combiner: OR
enabled: true
```

建立 `monitoring/alert-memory-high.yaml`:

```yaml
# 記憶體使用率過高告警
displayName: "Cloud Run - 記憶體使用率過高"
documentation:
  content: |
    Cloud Run 服務的記憶體使用率超過 85%。

    **可能原因:**
    - 記憶體洩漏
    - 處理大檔案沒有使用 stream
    - 快取過大

    **處理步驟:**
    1. 檢查是否有記憶體洩漏
    2. 使用 Chrome DevTools 分析 heap snapshot
    3. 檢視大檔案處理邏輯
    4. 考慮增加記憶體配置
  mimeType: "text/markdown"
conditions:
  - displayName: "Memory utilization > 85%"
    conditionThreshold:
      filter: |
        resource.type = "cloud_run_revision"
        AND metric.type = "run.googleapis.com/container/memory/utilizations"
      comparison: COMPARISON_GT
      thresholdValue: 0.85
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_MEAN
          crossSeriesReducer: REDUCE_MEAN
          groupByFields:
            - resource.service_name
combiner: OR
enabled: true
```

---

### 步驟 6: 設定告警策略 - 錯誤率和延遲

建立 `monitoring/alert-error-rate.yaml`:

```yaml
# API 錯誤率過高告警
displayName: "API 錯誤率過高 (5xx)"
documentation:
  content: |
    API 的 5xx 錯誤率過高(> 5%)。

    **可能原因:**
    - 資料庫連線失敗
    - 外部 API 超時
    - 程式碼邏輯錯誤
    - 資源耗盡

    **處理步驟:**
    1. 立即查看 Error Reporting 找出具體錯誤
    2. 檢查 Sentry 錯誤詳情
    3. 查看日誌找出錯誤模式
    4. 檢查資料庫和外部服務連線狀態
  mimeType: "text/markdown"
conditions:
  - displayName: "5xx error rate > 5%"
    conditionThreshold:
      filter: |
        resource.type = "cloud_run_revision"
        AND metric.type = "run.googleapis.com/request_count"
        AND metric.label.response_code_class = "5xx"
      comparison: COMPARISON_GT
      thresholdValue: 0.05
      duration: 180s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
          crossSeriesReducer: REDUCE_SUM
          groupByFields:
            - resource.service_name
combiner: OR
enabled: true
```

建立 `monitoring/alert-latency-high.yaml`:

```yaml
# API 延遲過高告警
displayName: "API 回應延遲過高"
documentation:
  content: |
    API 的 P95 回應時間超過 1 秒。

    **可能原因:**
    - 資料庫查詢慢
    - 外部 API 呼叫慢
    - CPU/記憶體不足
    - 網路延遲

    **處理步驟:**
    1. 檢查資料庫查詢效能
    2. 查看是否有慢查詢
    3. 檢視 Cloud Trace 找出慢請求
    4. 考慮增加快取或優化查詢
  mimeType: "text/markdown"
conditions:
  - displayName: "P95 latency > 1000ms"
    conditionThreshold:
      filter: |
        resource.type = "cloud_run_revision"
        AND metric.type = "run.googleapis.com/request_latencies"
      comparison: COMPARISON_GT
      thresholdValue: 1000
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_DELTA
          crossSeriesReducer: REDUCE_PERCENTILE_95
          groupByFields:
            - resource.service_name
combiner: OR
enabled: true
```

---

### 步驟 7: 設定 Slack 通知渠道

建立 `scripts/setup-slack-notifications.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  設定 Slack 通知渠道"
echo "========================================"

PROJECT_ID="cheapcut-prod"

# Slack Webhook URL (從環境變數讀取)
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL}"

if [ -z "$SLACK_WEBHOOK_URL" ]; then
  echo "錯誤: SLACK_WEBHOOK_URL 環境變數未設定"
  echo ""
  echo "請先設定 Slack Incoming Webhook:"
  echo "1. 前往 https://api.slack.com/messaging/webhooks"
  echo "2. 建立新的 Incoming Webhook"
  echo "3. 複製 Webhook URL"
  echo "4. 執行: export SLACK_WEBHOOK_URL='https://hooks.slack.com/services/xxx/yyy/zzz'"
  echo ""
  exit 1
fi

# 建立 Slack 通知渠道
gcloud alpha monitoring channels create \
  --display-name="Slack - CheapCut Alerts" \
  --type=slack \
  --channel-labels=url="${SLACK_WEBHOOK_URL}" \
  --project=${PROJECT_ID}

# 取得通知渠道 ID
CHANNEL_ID=$(gcloud alpha monitoring channels list \
  --filter="displayName='Slack - CheapCut Alerts'" \
  --format="value(name)" \
  --project=${PROJECT_ID})

echo ""
echo "Slack 通知渠道已建立!"
echo "Channel ID: ${CHANNEL_ID}"
echo ""

# 測試通知
echo "發送測試訊息到 Slack..."
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"✅ CheapCut 監控系統已設定完成!"}' \
  "${SLACK_WEBHOOK_URL}"

echo ""
echo "========================================"
echo "  設定完成!"
echo "========================================"
```

---

### 步驟 8: 建立告警策略並連接 Slack

建立 `scripts/create-alert-policies.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  建立告警策略"
echo "========================================"

PROJECT_ID="cheapcut-prod"

# 取得 Slack 通知渠道 ID
SLACK_CHANNEL_ID=$(gcloud alpha monitoring channels list \
  --filter="displayName='Slack - CheapCut Alerts'" \
  --format="value(name)" \
  --project=${PROJECT_ID})

if [ -z "$SLACK_CHANNEL_ID" ]; then
  echo "錯誤: 找不到 Slack 通知渠道"
  echo "請先執行: ./scripts/setup-slack-notifications.sh"
  exit 1
fi

echo "使用通知渠道: ${SLACK_CHANNEL_ID}"
echo ""

# 建立 CPU 告警策略
echo "Step 1: 建立 CPU 使用率告警..."
gcloud alpha monitoring policies create \
  --notification-channels="${SLACK_CHANNEL_ID}" \
  --display-name="Cloud Run - CPU 使用率過高" \
  --condition-display-name="CPU utilization > 80%" \
  --condition-threshold-value=0.8 \
  --condition-threshold-duration=300s \
  --condition-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/container/cpu/utilizations"' \
  --condition-comparison=COMPARISON_GT \
  --condition-aggregation-alignment-period=60s \
  --condition-aggregation-per-series-aligner=ALIGN_MEAN \
  --condition-aggregation-cross-series-reducer=REDUCE_MEAN \
  --condition-aggregation-group-by-fields="resource.service_name" \
  --project=${PROJECT_ID}

# 建立記憶體告警策略
echo "Step 2: 建立記憶體使用率告警..."
gcloud alpha monitoring policies create \
  --notification-channels="${SLACK_CHANNEL_ID}" \
  --display-name="Cloud Run - 記憶體使用率過高" \
  --condition-display-name="Memory utilization > 85%" \
  --condition-threshold-value=0.85 \
  --condition-threshold-duration=300s \
  --condition-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/container/memory/utilizations"' \
  --condition-comparison=COMPARISON_GT \
  --condition-aggregation-alignment-period=60s \
  --condition-aggregation-per-series-aligner=ALIGN_MEAN \
  --condition-aggregation-cross-series-reducer=REDUCE_MEAN \
  --condition-aggregation-group-by-fields="resource.service_name" \
  --project=${PROJECT_ID}

# 建立錯誤率告警策略
echo "Step 3: 建立 API 錯誤率告警..."
gcloud alpha monitoring policies create \
  --notification-channels="${SLACK_CHANNEL_ID}" \
  --display-name="API 錯誤率過高 (5xx)" \
  --condition-display-name="5xx error rate > 5%" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=180s \
  --condition-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.label.response_code_class="5xx"' \
  --condition-comparison=COMPARISON_GT \
  --condition-aggregation-alignment-period=60s \
  --condition-aggregation-per-series-aligner=ALIGN_RATE \
  --condition-aggregation-cross-series-reducer=REDUCE_SUM \
  --condition-aggregation-group-by-fields="resource.service_name" \
  --project=${PROJECT_ID}

# 列出所有告警策略
echo ""
echo "Step 4: 驗證告警策略..."
gcloud alpha monitoring policies list --project=${PROJECT_ID}

echo ""
echo "========================================"
echo "  告警策略建立完成!"
echo "========================================"
echo ""
echo "查看告警: https://console.cloud.google.com/monitoring/alerting?project=${PROJECT_ID}"
echo ""
```

---

### 步驟 9: 整合 Sentry 錯誤追蹤

首先註冊 Sentry 帳號並建立專案:

1. 前往 https://sentry.io/signup/
2. 建立帳號
3. 建立新專案,選擇 Node.js

**後端整合 Sentry**:

```bash
# 安裝 Sentry SDK
cd backend
npm install @sentry/node @sentry/profiling-node
```

建立 `backend/src/config/sentry.ts`:

```typescript
/**
 * Sentry 錯誤追蹤設定
 *
 * Sentry 會自動收集:
 * - 未捕獲的例外
 * - 未處理的 Promise rejection
 * - API 請求錯誤
 * - 效能追蹤
 */

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

/**
 * 初始化 Sentry
 */
export function initSentry() {
  // 只在 production 和 staging 環境啟用
  if (process.env.NODE_ENV === 'development') {
    console.log('Sentry disabled in development');
    return;
  }

  Sentry.init({
    // Sentry DSN (從環境變數讀取)
    dsn: process.env.SENTRY_DSN,

    // 環境標籤
    environment: process.env.NODE_ENV || 'production',

    // 發布版本 (用於追蹤哪個版本有問題)
    release: process.env.APP_VERSION || '1.0.0',

    // 錯誤取樣率 (100% = 所有錯誤都上報)
    tracesSampleRate: 1.0,

    // 效能監控取樣率 (10% = 只監控 10% 的請求,避免費用過高)
    profilesSampleRate: 0.1,

    // 整合
    integrations: [
      // 效能分析
      new ProfilingIntegration(),

      // HTTP 追蹤
      new Sentry.Integrations.Http({ tracing: true }),

      // Express 整合
      new Sentry.Integrations.Express({ app: true }),
    ],

    // 忽略特定錯誤
    ignoreErrors: [
      // 忽略客戶端斷線錯誤
      'ECONNRESET',
      'EPIPE',
      'ETIMEDOUT',

      // 忽略取消的請求
      'AbortError',
      'CanceledError',
    ],

    // 在發送前處理事件 (可以過濾敏感資料)
    beforeSend(event, hint) {
      // 移除敏感的 header
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // 移除敏感的 query 參數
      if (event.request?.query_string) {
        event.request.query_string = event.request.query_string
          .replace(/api_key=[^&]+/g, 'api_key=[FILTERED]')
          .replace(/token=[^&]+/g, 'token=[FILTERED]');
      }

      return event;
    },
  });

  console.log('✓ Sentry initialized');
}

/**
 * 設定 Express 中介軟體
 */
export function getSentryMiddleware() {
  return {
    // 必須在所有路由之前
    requestHandler: Sentry.Handlers.requestHandler(),

    // 必須在所有路由之後,但在錯誤處理器之前
    tracingHandler: Sentry.Handlers.tracingHandler(),

    // 錯誤處理器,必須在所有錯誤處理器之前
    errorHandler: Sentry.Handlers.errorHandler(),
  };
}

/**
 * 手動記錄錯誤
 */
export function captureError(error: Error, context?: any) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * 記錄訊息
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * 設定使用者資訊 (用於追蹤特定使用者的錯誤)
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * 清除使用者資訊
 */
export function clearUser() {
  Sentry.setUser(null);
}
```

更新 `backend/src/server.ts`:

```typescript
import express from 'express';
import { initSentry, getSentryMiddleware } from './config/sentry';
import { createApp } from './app';

// 初始化 Sentry (必須在最前面)
initSentry();

const app = createApp();
const sentry = getSentryMiddleware();

// Sentry 請求處理器 (必須在所有路由之前)
app.use(sentry.requestHandler);
app.use(sentry.tracingHandler);

// ... 你的路由 ...

// Sentry 錯誤處理器 (必須在所有錯誤處理器之前)
app.use(sentry.errorHandler);

// 你的錯誤處理器
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

**前端整合 Sentry**:

```bash
# 安裝 Sentry SDK
cd frontend
npm install @sentry/nextjs
```

執行 Sentry wizard:

```bash
npx @sentry/wizard@latest -i nextjs
```

這會自動建立 `sentry.client.config.js`, `sentry.server.config.js`, `sentry.edge.config.js`

更新 `frontend/sentry.client.config.js`:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_ENV || 'production',

  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // 錯誤取樣率
  tracesSampleRate: 1.0,

  // Session Replay (記錄使用者操作,幫助重現錯誤)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  ignoreErrors: [
    // 忽略瀏覽器擴充套件的錯誤
    /^Non-Error promise rejection captured/,
    /^ResizeObserver loop limit exceeded/,
  ],

  beforeSend(event, hint) {
    // 過濾敏感資料
    if (event.request?.cookies) {
      delete event.request.cookies;
    }

    return event;
  },
});
```

---

### 步驟 10: 建立日誌查詢和分析

建立 `scripts/query-logs.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  查詢 Cloud Run 日誌"
echo "========================================"

PROJECT_ID="cheapcut-prod"
SERVICE_NAME="cheapcut-api"
REGION="asia-east1"

# 查詢最近的錯誤日誌
echo "Step 1: 查詢最近的錯誤日誌..."
gcloud logging read \
  "resource.type=cloud_run_revision
   AND resource.labels.service_name=${SERVICE_NAME}
   AND severity>=ERROR" \
  --limit=20 \
  --format=json \
  --project=${PROJECT_ID}

echo ""
echo "Step 2: 查詢 5xx 錯誤..."
gcloud logging read \
  "resource.type=cloud_run_revision
   AND resource.labels.service_name=${SERVICE_NAME}
   AND httpRequest.status>=500" \
  --limit=20 \
  --format=json \
  --project=${PROJECT_ID}

echo ""
echo "Step 3: 查詢慢請求 (>1s)..."
gcloud logging read \
  "resource.type=cloud_run_revision
   AND resource.labels.service_name=${SERVICE_NAME}
   AND httpRequest.latency>1s" \
  --limit=20 \
  --format=json \
  --project=${PROJECT_ID}

echo ""
echo "========================================"
echo "  日誌查詢完成"
echo "========================================"
```

建立日誌分析查詢 `monitoring/log-queries.sql`:

```sql
-- 查詢 1: 統計各 API 端點的請求數
-- 在 Cloud Logging > Logs Analytics 執行

SELECT
  httpRequest.requestUrl as endpoint,
  COUNT(*) as request_count,
  COUNTIF(httpRequest.status >= 500) as error_count,
  COUNTIF(httpRequest.status >= 500) / COUNT(*) * 100 as error_rate
FROM
  `your-project.global._Default._AllLogs`
WHERE
  resource.type = 'cloud_run_revision'
  AND resource.labels.service_name = 'cheapcut-api'
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
GROUP BY
  endpoint
ORDER BY
  request_count DESC
LIMIT 20;

-- 查詢 2: 找出最慢的 API 端點
SELECT
  httpRequest.requestUrl as endpoint,
  AVG(CAST(REGEXP_EXTRACT(httpRequest.latency, r'(\d+)') AS INT64)) as avg_latency_ms,
  MAX(CAST(REGEXP_EXTRACT(httpRequest.latency, r'(\d+)') AS INT64)) as max_latency_ms,
  COUNT(*) as request_count
FROM
  `your-project.global._Default._AllLogs`
WHERE
  resource.type = 'cloud_run_revision'
  AND resource.labels.service_name = 'cheapcut-api'
  AND httpRequest.latency IS NOT NULL
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
GROUP BY
  endpoint
ORDER BY
  avg_latency_ms DESC
LIMIT 20;

-- 查詢 3: 找出最常見的錯誤訊息
SELECT
  jsonPayload.message as error_message,
  COUNT(*) as occurrence_count,
  MIN(timestamp) as first_seen,
  MAX(timestamp) as last_seen
FROM
  `your-project.global._Default._AllLogs`
WHERE
  resource.type = 'cloud_run_revision'
  AND resource.labels.service_name = 'cheapcut-api'
  AND severity = 'ERROR'
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY
  error_message
ORDER BY
  occurrence_count DESC
LIMIT 20;
```

---

### 步驟 11: 設定 SLO (Service Level Objective)

建立 `monitoring/slo-config.yaml`:

```yaml
# API 可用性 SLO: 99.5%
displayName: "API Availability SLO (99.5%)"
goal: 0.995
rollingPeriod: 2592000s  # 30 天
serviceLevelIndicator:
  requestBased:
    goodTotalRatio:
      # Good requests: 非 5xx 錯誤
      goodServiceFilter: |
        resource.type="cloud_run_revision"
        AND resource.labels.service_name="cheapcut-api"
        AND metric.type="run.googleapis.com/request_count"
        AND metric.label.response_code_class!="5xx"
      # Total requests: 所有請求
      totalServiceFilter: |
        resource.type="cloud_run_revision"
        AND resource.labels.service_name="cheapcut-api"
        AND metric.type="run.googleapis.com/request_count"
```

建立 SLO 的腳本 `scripts/create-slo.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  建立 SLO"
echo "========================================"

PROJECT_ID="cheapcut-prod"

# 建立 API 可用性 SLO
gcloud alpha monitoring slos create cheapcut-api-availability \
  --service=cheapcut-api \
  --display-name="API Availability SLO (99.5%)" \
  --goal=0.995 \
  --calendar-period=MONTH \
  --request-based-good-total-ratio \
  --good-service-filter='resource.type="cloud_run_revision" AND resource.labels.service_name="cheapcut-api" AND metric.type="run.googleapis.com/request_count" AND metric.label.response_code_class!="5xx"' \
  --total-service-filter='resource.type="cloud_run_revision" AND resource.labels.service_name="cheapcut-api" AND metric.type="run.googleapis.com/request_count"' \
  --project=${PROJECT_ID}

# 建立 API 延遲 SLO
gcloud alpha monitoring slos create cheapcut-api-latency \
  --service=cheapcut-api \
  --display-name="API Latency SLO (95% < 500ms)" \
  --goal=0.95 \
  --calendar-period=MONTH \
  --request-based-good-total-ratio \
  --project=${PROJECT_ID}

echo ""
echo "SLO 已建立!"
echo "查看: https://console.cloud.google.com/monitoring/services?project=${PROJECT_ID}"
echo ""
```

---

### 步驟 12: 建立監控總覽腳本

建立 `scripts/monitoring-status.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "  CheapCut 監控系統狀態"
echo "========================================"

PROJECT_ID="cheapcut-prod"
SERVICE_NAME="cheapcut-api"

# 檢查服務狀態
echo "📊 服務狀態"
echo "─────────────────────────────────────"
gcloud run services describe ${SERVICE_NAME} \
  --region=asia-east1 \
  --project=${PROJECT_ID} \
  --format="table(status.url, status.traffic)"

echo ""

# 檢查告警策略
echo "🔔 告警策略"
echo "─────────────────────────────────────"
gcloud alpha monitoring policies list \
  --project=${PROJECT_ID} \
  --format="table(displayName, enabled, conditionsList[0].displayName)"

echo ""

# 檢查 Uptime Checks
echo "💚 Uptime Checks"
echo "─────────────────────────────────────"
gcloud monitoring uptime list \
  --project=${PROJECT_ID} \
  --format="table(displayName, period, timeout)"

echo ""

# 檢查最近的告警
echo "⚠️  最近的告警 (過去 24 小時)"
echo "─────────────────────────────────────"
gcloud alpha monitoring incidents list \
  --project=${PROJECT_ID} \
  --format="table(displayName, state, startTime)"

echo ""

# 檢查錯誤統計
echo "❌ 錯誤統計 (過去 1 小時)"
echo "─────────────────────────────────────"
gcloud logging read \
  "resource.type=cloud_run_revision
   AND resource.labels.service_name=${SERVICE_NAME}
   AND severity>=ERROR
   AND timestamp>=\"$(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%SZ')\"" \
  --limit=1 \
  --format="value(COUNT())" \
  --project=${PROJECT_ID}

echo ""

# 顯示監控連結
echo "🔗 快速連結"
echo "─────────────────────────────────────"
echo "監控儀表板: https://console.cloud.google.com/monitoring/dashboards?project=${PROJECT_ID}"
echo "告警策略: https://console.cloud.google.com/monitoring/alerting?project=${PROJECT_ID}"
echo "日誌: https://console.cloud.google.com/logs/query?project=${PROJECT_ID}"
echo "Error Reporting: https://console.cloud.google.com/errors?project=${PROJECT_ID}"
echo "Sentry: https://sentry.io/organizations/your-org/projects/"
echo ""

echo "========================================"
echo "  監控系統運行正常 ✓"
echo "========================================"
```

設定執行權限:

```bash
chmod +x scripts/monitoring-status.sh
```

---

## ✅ 驗收標準

完成所有實作步驟後,執行驗收測試確認一切正常。

### 驗收測試架構

本 Task 包含三層驗收測試:

- 📁 **Basic Verification** (3 tests): 監控基礎設定
- 📁 **Functional Acceptance** (4 tests): 告警和通知功能
- 📁 **E2E Acceptance** (2 tests): 完整監控流程

### 執行驗收

```bash
# 1. 啟用監控 API
./scripts/enable-monitoring-apis.sh

# 2. 建立監控儀表板
./scripts/create-dashboard.sh

# 3. 設定 Uptime Check
./scripts/create-uptime-check.sh

# 4. 設定 Slack 通知
export SLACK_WEBHOOK_URL='https://hooks.slack.com/services/xxx'
./scripts/setup-slack-notifications.sh

# 5. 建立告警策略
./scripts/create-alert-policies.sh

# 6. 建立 SLO
./scripts/create-slo.sh

# 7. 檢查監控狀態
./scripts/monitoring-status.sh

# 8. 測試告警 (手動觸發)
# 方式 1: 產生大量請求測試 CPU 告警
ab -n 10000 -c 100 https://your-api.run.app/api/health

# 方式 2: 觸發錯誤測試錯誤率告警
# 呼叫一個會回傳 500 的測試端點

# 9. 驗證 Sentry 整合
# 在應用程式中手動拋出錯誤,檢查 Sentry 是否收到
```

### 通過標準

- ✅ Cloud Monitoring API 已啟用
- ✅ 監控儀表板建立成功且顯示數據
- ✅ Uptime Checks 運行正常
- ✅ 告警策略建立成功
- ✅ Slack 通知渠道設定成功
- ✅ 測試告警能正確發送到 Slack
- ✅ Sentry 整合成功且能收集錯誤
- ✅ 日誌查詢正常運作
- ✅ SLO 設定完成

<details>
<summary>📊 查看詳細驗收項目</summary>

### Basic Verification (3 tests)

測試檔案: 手動驗證

1. ✓ Cloud Monitoring API 已啟用
2. ✓ 監控工作區已建立
3. ✓ 可以查詢監控指標

### Functional Acceptance (4 tests)

測試檔案: 手動驗證和測試腳本

1. ✓ 儀表板顯示 Cloud Run 指標
2. ✓ Uptime Check 正常運行
3. ✓ 告警策略能正確觸發
4. ✓ Slack 通知正常發送

### E2E Acceptance (2 tests)

測試檔案: 整合測試

1. ✓ 完整的監控流程: 錯誤發生 → Sentry 收集 → 告警觸發 → Slack 通知
2. ✓ 日誌聚合和查詢正常運作

</details>

---

## 📋 完成檢查清單

完成這個 Task 後,請確認以下項目:

### 實作檢查
- [ ] Cloud Monitoring API 已啟用
- [ ] 監控儀表板已建立
- [ ] Uptime Checks 已設定
- [ ] CPU/記憶體告警已設定
- [ ] 錯誤率告警已設定
- [ ] 延遲告警已設定
- [ ] Slack 通知渠道已設定
- [ ] Sentry 已整合(後端和前端)
- [ ] 日誌查詢腳本已建立
- [ ] SLO 已設定

### 檔案清單
- [ ] `scripts/enable-monitoring-apis.sh` 已建立
- [ ] `scripts/create-dashboard.sh` 已建立
- [ ] `scripts/create-uptime-check.sh` 已建立
- [ ] `scripts/setup-slack-notifications.sh` 已建立
- [ ] `scripts/create-alert-policies.sh` 已建立
- [ ] `scripts/create-slo.sh` 已建立
- [ ] `scripts/query-logs.sh` 已建立
- [ ] `scripts/monitoring-status.sh` 已建立
- [ ] `monitoring/dashboard-config.json` 已建立
- [ ] `monitoring/alert-*.yaml` 已建立
- [ ] `backend/src/config/sentry.ts` 已建立
- [ ] Sentry 前端配置已完成

### 驗收測試
- [ ] 監控儀表板顯示正常
- [ ] Uptime Check 運行正常
- [ ] 告警測試通過
- [ ] Slack 通知測試通過
- [ ] Sentry 錯誤收集正常

---

## 🐛 常見問題與解決方案

### 常見錯誤類型速查表

| 錯誤訊息 | 可能原因 | 快速解法 |
|---------|---------|---------|
| `API not enabled` | 未啟用 API | 執行 enable-monitoring-apis.sh |
| `Permission denied` | IAM 權限不足 | 檢查 Service Account 權限 |
| `Metric not found` | 指標名稱錯誤 | 確認指標類型和 filter |
| `Notification failed` | 通知渠道錯誤 | 測試 Slack webhook |
| `Sentry initialization failed` | DSN 設定錯誤 | 檢查 SENTRY_DSN 環境變數 |
| `Alert not triggering` | 閾值設定問題 | 檢查條件和聚合設定 |

---

### 問題 1: 告警策略未觸發

**問題**: 設定了告警,但從未收到通知

**解決方案:**

1. 檢查告警策略狀態:

```bash
# 列出所有告警策略
gcloud alpha monitoring policies list --project=PROJECT_ID

# 查看特定告警的詳細資訊
gcloud alpha monitoring policies describe POLICY_ID --project=PROJECT_ID
```

2. 檢查告警條件是否滿足:

```bash
# 查看當前的 CPU 使用率
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/container/cpu/utilizations"' \
  --format=json \
  --project=PROJECT_ID

# 如果 CPU 使用率沒有超過閾值,告警不會觸發
```

3. 手動測試告警:

```bash
# 方法 1: 使用 Apache Bench 產生負載
ab -n 100000 -c 200 https://your-api.run.app/api/health

# 方法 2: 暫時降低告警閾值測試
# 將 CPU 告警從 80% 改為 10%
```

4. 檢查通知渠道:

```bash
# 列出通知渠道
gcloud alpha monitoring channels list --project=PROJECT_ID

# 測試 Slack webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test alert"}' \
  YOUR_SLACK_WEBHOOK_URL
```

---

### 問題 2: 監控日誌沒有資料

**錯誤訊息:**
```
No data available for the selected time range
```

**解決方案:**

1. 確認服務有收到請求:

```bash
# 發送測試請求
curl https://your-api.run.app/api/health

# 等待 1-2 分鐘讓日誌傳播
```

2. 檢查日誌 filter 是否正確:

```bash
# 測試基本的日誌查詢
gcloud logging read \
  "resource.type=cloud_run_revision" \
  --limit=10 \
  --project=PROJECT_ID

# 如果沒有結果,檢查 resource.type 是否正確
gcloud logging read \
  "resource.type=*" \
  --limit=10 \
  --project=PROJECT_ID
```

3. 檢查時間範圍:

```javascript
// 在 dashboard-config.json 中
"timeshiftDuration": "0s",  // 不要設定太長的時間偏移
```

4. 確認 Logging API 已啟用:

```bash
gcloud services list --enabled | grep logging.googleapis.com
```

---

### 問題 3: Sentry 錯誤未上報

**問題**: Sentry 沒有收集到應用程式的錯誤

**解決方案:**

1. 檢查 Sentry DSN 是否正確設定:

```bash
# 檢查環境變數
echo $SENTRY_DSN

# 在 Cloud Run 檢查
gcloud run services describe cheapcut-api \
  --region=asia-east1 \
  --format="value(spec.template.spec.containers[0].env)"
```

2. 手動測試 Sentry 連線:

```typescript
// 在程式碼中加入測試
import * as Sentry from '@sentry/node';

// 測試發送錯誤
Sentry.captureException(new Error('Test error from server'));
console.log('Test error sent to Sentry');
```

3. 檢查 Sentry 初始化:

```typescript
// 確認在最早的地方初始化
// server.ts 的第一行
import { initSentry } from './config/sentry';
initSentry();

// 不要在 if (process.env.NODE_ENV === 'production') 內初始化
// 這樣開發環境也能測試
```

4. 檢查網路連線:

```bash
# 從 Cloud Run 容器測試連線
curl -X POST \
  https://o4505134701711360.ingest.sentry.io/api/4505134701711360/store/ \
  -H 'Content-Type: application/json' \
  -H 'X-Sentry-Auth: Sentry sentry_key=YOUR_KEY' \
  -d '{"message":"test"}'
```

5. 查看 Sentry 專案設定:

```bash
# 前往 Sentry Dashboard
# Settings > Projects > Your Project > Client Keys (DSN)
# 確認 DSN 是正確的
```

---

### 問題 4: Slack 通知失敗

**錯誤訊息:**
```
Failed to send notification to channel
```

**解決方案:**

1. 測試 Slack Webhook:

```bash
# 手動測試 webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Hello from CheapCut!"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# 應該在 Slack 頻道看到訊息
```

2. 檢查 webhook URL 格式:

```bash
# ✅ 正確格式
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX

# ❌ 錯誤格式
https://hooks.slack.com/services/T00000000/B00000000/  # 缺少 token
https://slack.com/...  # 不是 hooks.slack.com
```

3. 重新建立 Slack webhook:

```bash
# 如果 webhook 失效,重新建立
# 1. 前往 https://api.slack.com/apps
# 2. 選擇你的 App
# 3. Incoming Webhooks > Add New Webhook to Workspace
# 4. 選擇要發送的頻道
# 5. 複製新的 Webhook URL

# 更新通知渠道
gcloud alpha monitoring channels update CHANNEL_ID \
  --update-channel-labels=url=NEW_WEBHOOK_URL \
  --project=PROJECT_ID
```

4. 檢查 Slack App 權限:

```bash
# 確認 Slack App 有以下權限:
# - incoming-webhook
# - chat:write
```

---

### 問題 5: 監控指標不準確

**問題**: 監控顯示的數據與實際不符

**解決方案:**

1. 檢查聚合設定:

```yaml
# 不同的 aligner 會產生不同的結果
aggregations:
  - alignmentPeriod: 60s
    perSeriesAligner: ALIGN_MEAN     # 平均值
    # perSeriesAligner: ALIGN_MAX    # 最大值
    # perSeriesAligner: ALIGN_SUM    # 總和
    # perSeriesAligner: ALIGN_RATE   # 比率
```

2. 確認時間對齊:

```javascript
// alignmentPeriod 應該與查詢時間範圍匹配
// 查詢 1 小時的數據,用 60s 對齊
// 查詢 1 天的數據,用 300s (5分鐘) 對齊
```

3. 檢查 filter 是否正確:

```bash
# 測試 filter
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"' \
  --format=json

# 檢查回傳的資料是否符合預期
```

4. 比對不同數據源:

```bash
# 比對 Cloud Monitoring 和日誌的數據
# 例如:請求數量

# Cloud Monitoring
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"'

# 日誌統計
gcloud logging read \
  'resource.type="cloud_run_revision"' \
  --format="value(COUNT())"

# 兩者應該接近
```

---

### 問題 6: 日誌查詢速度很慢

**問題**: 日誌查詢需要很長時間才能返回結果

**解決方案:**

1. 限制時間範圍:

```bash
# ❌ 慢: 查詢所有時間
gcloud logging read 'resource.type="cloud_run_revision"'

# ✅ 快: 限制時間範圍
gcloud logging read \
  'resource.type="cloud_run_revision"
   AND timestamp>="2025-10-07T00:00:00Z"' \
  --limit=100
```

2. 使用更精確的 filter:

```bash
# ❌ 慢: 模糊查詢
gcloud logging read 'textPayload=~"error"'

# ✅ 快: 精確查詢
gcloud logging read \
  'resource.type="cloud_run_revision"
   AND resource.labels.service_name="cheapcut-api"
   AND severity="ERROR"'
```

3. 使用 Log Analytics (BigQuery):

```sql
-- 在 Cloud Console > Logging > Logs Analytics
-- 使用 SQL 查詢,比 Log Explorer 快很多

SELECT
  timestamp,
  severity,
  jsonPayload.message
FROM
  `project.region.bucket._AllLogs`
WHERE
  resource.type = 'cloud_run_revision'
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
  AND severity = 'ERROR'
ORDER BY
  timestamp DESC
LIMIT 100;
```

4. 建立日誌指標:

```bash
# 將常用的查詢轉換為指標,查詢更快
gcloud logging metrics create error_count \
  --description="5xx error count" \
  --log-filter='resource.type="cloud_run_revision" AND httpRequest.status>=500'

# 然後用指標查詢
gcloud monitoring time-series list \
  --filter='metric.type="logging.googleapis.com/user/error_count"'
```

---

## 📚 延伸學習資源

如果你想深入了解監控與告警:

- **Cloud Monitoring 文件**: https://cloud.google.com/monitoring/docs
- **告警最佳實踐**: https://cloud.google.com/monitoring/alerts/best-practices
- **Sentry 文件**: https://docs.sentry.io/
- **SLO 指南**: https://sre.google/workbook/implementing-slos/
- **日誌查詢語法**: https://cloud.google.com/logging/docs/view/logging-query-language

---

## ✅ Task 完成確認

當以下所有項目都完成時,這個 Task 就算完成:

1. ✅ 所有實作步驟都完成
2. ✅ 監控儀表板建立成功且顯示數據
3. ✅ Uptime Checks 運行正常
4. ✅ 告警策略建立成功並能觸發
5. ✅ Slack 通知測試成功
6. ✅ Sentry 整合完成且能收集錯誤
7. ✅ 日誌查詢正常運作
8. ✅ SLO 設定完成
9. ✅ 完成檢查清單都勾選
10. ✅ `./scripts/monitoring-status.sh` 顯示一切正常

### 最終驗收指令

```bash
# 執行監控狀態檢查
./scripts/monitoring-status.sh

# 測試告警 (產生負載)
ab -n 10000 -c 100 https://your-api.run.app/api/health

# 檢查 Slack 是否收到通知 (如果觸發閾值)

# 觸發測試錯誤到 Sentry
curl -X POST https://your-api.run.app/api/test/error

# 檢查 Sentry 是否收到錯誤

# 查看儀表板
# 開啟 https://console.cloud.google.com/monitoring/dashboards

# 如果全部通過,你應該看到:
# ✓ 監控儀表板顯示即時數據
# ✓ Uptime Checks 顯示為綠色 (正常)
# ✓ 告警策略已啟用
# ✓ Slack 收到測試通知
# ✓ Sentry 收到測試錯誤
```

**恭喜!** 如果看到上面的輸出,代表 Task 4.5 完成了!

---

## 📝 建議紀錄

建議在你的筆記本或專案管理工具中記錄:

**監控配置**:
- 儀表板 URL: ___
- 告警策略數量: ___
- Uptime Check 頻率: ___
- SLO 目標: ___

**告警記錄**:
- 本週觸發次數: ___
- 最常見的告警類型: ___
- 平均回應時間: ___
- 誤報率: ___%

**錯誤統計** (Sentry):
- 本週錯誤數量: ___
- 最常見的錯誤: ___
- 已修復錯誤: ___
- 待處理錯誤: ___

**改進計畫**:
- 需要調整的告警閾值: ___
- 需要新增的監控指標: ___
- 需要優化的查詢: ___

---

**下一步**: 所有 Phase 4 Task 已完成!系統已成功部署並設定完整監控。

---

**文件版本**: 1.0
**狀態**: ✅ 已完成
**最後更新**: 2025-10-07
**維護者**: CheapCut 開發團隊
