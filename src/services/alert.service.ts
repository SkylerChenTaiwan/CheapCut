/**
 * 告警服務
 *
 * 支援 Email 和 Slack 通知
 */

/**
 * Email 告警參數
 */
export interface EmailAlertParams {
  to: string
  subject: string
  body: string
  html?: string
}

/**
 * Slack 告警參數
 */
export interface SlackAlertParams {
  channel: string
  message: string
  fields?: Record<string, string>
}

/**
 * 成本告警參數
 */
export interface CostAlertParams {
  alertType: 'user_daily' | 'user_monthly' | 'execution' | 'system_daily' | 'system_monthly'
  userId?: string
  executionId?: string
  currentCost: number
  threshold: number
  breakdown?: Record<string, any>
}

/**
 * 告警服務類別
 */
export class AlertService {
  /**
   * 發送 Email 告警
   */
  async sendEmail(params: EmailAlertParams): Promise<void> {
    try {
      // TODO: 整合 SendGrid 或其他 Email 服務
      console.log('[AlertService] Email Alert:', {
        to: params.to,
        subject: params.subject,
        body: params.body,
      })
    } catch (error) {
      console.error('[AlertService] Failed to send email:', error)
    }
  }

  /**
   * 發送 Slack 告警
   */
  async sendSlack(params: SlackAlertParams): Promise<void> {
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL

      if (!slackWebhookUrl) {
        console.warn('[AlertService] Slack webhook not configured')
        return
      }

      // 構建 Slack 訊息格式
      const payload = {
        channel: params.channel,
        text: params.message,
        attachments: params.fields
          ? [
              {
                color: 'danger',
                fields: Object.entries(params.fields).map(([key, value]) => ({
                  title: key,
                  value,
                  short: true,
                })),
              },
            ]
          : undefined,
      }

      // 發送到 Slack
      const response = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`)
      }

      console.log('[AlertService] Slack alert sent:', params.channel)
    } catch (error) {
      console.error('[AlertService] Failed to send Slack alert:', error)
    }
  }

  /**
   * 發送成本告警
   */
  async sendCostAlert(params: CostAlertParams): Promise<void> {
    const {
      alertType,
      userId,
      executionId,
      currentCost,
      threshold,
      breakdown,
    } = params

    // 構建告警訊息
    let subject = ''
    let message = ''

    switch (alertType) {
      case 'user_daily':
        subject = `⚠️ 成本告警: 用戶每日成本超過限額`
        message = `用戶 ${userId} 今日成本: $${currentCost.toFixed(4)}, 超過限額: $${threshold.toFixed(4)}`
        break

      case 'user_monthly':
        subject = `⚠️ 成本告警: 用戶每月成本超過預算`
        message = `用戶 ${userId} 本月成本: $${currentCost.toFixed(4)}, 超過預算: $${threshold.toFixed(4)}`
        break

      case 'execution':
        subject = `⚠️ 成本告警: 單次執行成本異常高`
        message = `執行 ${executionId} 成本: $${currentCost.toFixed(4)}, 超過閾值: $${threshold.toFixed(4)}`
        break

      case 'system_daily':
        subject = `🚨 系統告警: 每日總成本超過限額`
        message = `系統今日總成本: $${currentCost.toFixed(4)}, 超過限額: $${threshold.toFixed(4)}`
        break

      case 'system_monthly':
        subject = `🚨 系統告警: 每月總成本超過預算`
        message = `系統本月總成本: $${currentCost.toFixed(4)}, 超過預算: $${threshold.toFixed(4)}`
        break
    }

    // 發送 Email
    await this.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@cheapcut.com',
      subject,
      body: message + (breakdown ? `\n\n成本分布:\n${JSON.stringify(breakdown, null, 2)}` : ''),
    })

    // 發送 Slack
    await this.sendSlack({
      channel: '#cost-alerts',
      message: subject,
      fields: {
        'Alert Type': alertType,
        'User ID': userId || 'N/A',
        'Execution ID': executionId || 'N/A',
        'Current Cost': `$${currentCost.toFixed(4)}`,
        'Threshold': `$${threshold.toFixed(4)}`,
      },
    })

    console.log('[AlertService] Cost alert sent:', {
      alert_type: alertType,
      user_id: userId,
      execution_id: executionId,
      current_cost: currentCost,
      threshold,
    })
  }

  /**
   * 檢查是否應該發送告警
   *
   * 避免告警轟炸,同一用戶/執行 1 小時內最多告警 1 次
   */
  async shouldSendAlert(
    alertKey: string,
    cooldownMinutes: number = 60
  ): Promise<boolean> {
    // TODO: 使用 Redis 記錄最後告警時間
    // const lastAlertTime = await redis.get(`alert:${alertKey}`)
    // if (lastAlertTime) {
    //   const elapsed = Date.now() - parseInt(lastAlertTime)
    //   if (elapsed < cooldownMinutes * 60 * 1000) {
    //     return false
    //   }
    // }
    // await redis.set(`alert:${alertKey}`, Date.now().toString(), 'EX', cooldownMinutes * 60)

    // 目前先直接回傳 true (每次都告警)
    return true
  }
}

/**
 * 建立告警服務單例
 */
let alertService: AlertService | null = null

export function getAlertService(): AlertService {
  if (!alertService) {
    alertService = new AlertService()
  }
  return alertService
}

export default getAlertService
