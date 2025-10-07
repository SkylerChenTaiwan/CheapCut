/**
 * 成本追蹤服務 (含告警功能)
 *
 * 這是一個示範檔案,展示如何將告警功能整合到 CostTracker 中
 * 實際使用時,請將這些方法整合到完整的 cost-tracker.service.ts 中
 */

import { getAlertService } from './alert.service'
import { getUserThresholds, getSystemThresholds } from '../config/cost-thresholds'

/**
 * API 成本記錄介面
 */
export interface APICostRecord {
  user_id?: string
  execution_id?: string
  service: string
  operation: string
  model?: string
  usage: Record<string, any>
  cost: number
  metadata?: Record<string, any>
}

/**
 * 成本追蹤服務類別 (擴充版,含告警)
 */
export class CostTrackerWithAlerts {
  private alertService = getAlertService()

  /**
   * 寫入成本記錄到資料庫 (擴充版,含告警)
   *
   * @param record 成本記錄
   */
  private async recordCost(record: APICostRecord): Promise<void> {
    try {
      // TODO: 實際使用時需要整合資料庫
      // await db.api_costs.create({
      //   data: {
      //     user_id: record.user_id,
      //     execution_id: record.execution_id,
      //     service: record.service,
      //     operation: record.operation,
      //     model: record.model,
      //     usage: record.usage,
      //     cost: record.cost,
      //     metadata: record.metadata || {},
      //   },
      // })

      console.log(
        `[CostTracker] Recorded: ${record.service} ${record.operation} = $${record.cost.toFixed(4)}`
      )

      // 記錄成本後,檢查是否超過閾值
      await this.checkCostThresholds(record)
    } catch (error) {
      console.error('[CostTracker] Failed to record cost:', error)
    }
  }

  /**
   * 檢查成本閾值並發送告警
   *
   * @param record 成本記錄
   */
  private async checkCostThresholds(record: APICostRecord): Promise<void> {
    try {
      // 1. 檢查單次執行成本
      if (record.execution_id && record.user_id) {
        const executionCost = await this.getExecutionTotalCost(record.execution_id)
        const thresholds = await getUserThresholds(record.user_id)

        if (thresholds.execution_limit && executionCost > thresholds.execution_limit) {
          const alertKey = `execution:${record.execution_id}`
          if (await this.alertService.shouldSendAlert(alertKey)) {
            await this.alertService.sendCostAlert({
              alertType: 'execution',
              userId: record.user_id,
              executionId: record.execution_id,
              currentCost: executionCost,
              threshold: thresholds.execution_limit,
            })
          }
        }
      }

      // 2. 檢查用戶每日成本
      if (record.user_id) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dailyCost = await this.getUserTotalCost(record.user_id, today)
        const thresholds = await getUserThresholds(record.user_id)

        if (thresholds.daily_limit && dailyCost > thresholds.daily_limit) {
          const alertKey = `user_daily:${record.user_id}:${today.toISOString().split('T')[0]}`
          if (await this.alertService.shouldSendAlert(alertKey)) {
            await this.alertService.sendCostAlert({
              alertType: 'user_daily',
              userId: record.user_id,
              currentCost: dailyCost,
              threshold: thresholds.daily_limit,
            })
          }
        }
      }

      // 3. 檢查系統每日成本 (每小時最多檢查一次)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const systemDailyCost = await this.getSystemTotalCost(today)
      const systemThresholds = getSystemThresholds()

      if (systemDailyCost > systemThresholds.daily_limit) {
        const alertKey = `system_daily:${today.toISOString().split('T')[0]}`
        if (await this.alertService.shouldSendAlert(alertKey, 60)) {
          await this.alertService.sendCostAlert({
            alertType: 'system_daily',
            currentCost: systemDailyCost,
            threshold: systemThresholds.daily_limit,
          })
        }
      }
    } catch (error) {
      console.error('[CostTracker] Failed to check cost thresholds:', error)
      // 不要因為告警失敗而影響主流程
    }
  }

  /**
   * 查詢執行總成本
   *
   * @param executionId 執行 ID
   * @returns 總成本
   */
  async getExecutionTotalCost(executionId: string): Promise<number> {
    // TODO: 實際使用時需要整合資料庫
    // const result = await db.api_costs.aggregate({
    //   where: { execution_id: executionId },
    //   _sum: { cost: true },
    // })
    // return result._sum.cost || 0

    return 0 // 暫時回傳 0
  }

  /**
   * 查詢用戶總成本
   *
   * @param userId 用戶 ID
   * @param startDate 開始日期 (可選)
   * @param endDate 結束日期 (可選)
   * @returns 總成本
   */
  async getUserTotalCost(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    // TODO: 實際使用時需要整合資料庫
    // const where: any = { user_id: userId }
    // if (startDate || endDate) {
    //   where.created_at = {}
    //   if (startDate) where.created_at.gte = startDate
    //   if (endDate) where.created_at.lte = endDate
    // }
    // const result = await db.api_costs.aggregate({
    //   where,
    //   _sum: { cost: true },
    // })
    // return result._sum.cost || 0

    return 0 // 暫時回傳 0
  }

  /**
   * 查詢系統總成本
   *
   * @param startDate 開始日期
   * @param endDate 結束日期
   * @returns 總成本
   */
  async getSystemTotalCost(startDate?: Date, endDate?: Date): Promise<number> {
    // TODO: 實際使用時需要整合資料庫
    // const where: any = {}
    // if (startDate || endDate) {
    //   where.created_at = {}
    //   if (startDate) where.created_at.gte = startDate
    //   if (endDate) where.created_at.lte = endDate
    // }
    // const result = await db.api_costs.aggregate({
    //   where,
    //   _sum: { cost: true },
    // })
    // return result._sum.cost || 0

    return 0 // 暫時回傳 0
  }
}

/**
 * 使用範例
 *
 * 在實際的 cost-tracker.service.ts 中,將 checkCostThresholds 方法加入到
 * recordCost 方法的最後,即可自動進行成本檢查與告警
 */
