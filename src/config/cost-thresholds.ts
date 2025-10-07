/**
 * 成本閾值配置
 *
 * 用於成本告警系統
 */

/**
 * 系統預設閾值
 */
export const DefaultCostThresholds = {
  /**
   * 用戶每日成本限額 (美元)
   * 超過此金額將觸發告警
   */
  userDailyLimit: 10.0,

  /**
   * 用戶每月成本限額 (美元)
   */
  userMonthlyLimit: 100.0,

  /**
   * 單次執行成本限額 (美元)
   * 超過此金額將觸發告警
   */
  executionLimit: 5.0,

  /**
   * 系統每日總成本限額 (美元)
   */
  systemDailyLimit: 500.0,

  /**
   * 系統每月總成本限額 (美元)
   */
  systemMonthlyLimit: 5000.0,
} as const

/**
 * 用戶成本閾值介面
 */
export interface UserCostThreshold {
  user_id: string
  daily_limit?: number
  monthly_limit?: number
  execution_limit?: number
}

/**
 * 取得用戶成本閾值
 *
 * @param userId 用戶 ID
 * @returns 用戶閾值 (如果沒有自訂,回傳預設值)
 */
export async function getUserThresholds(
  userId: string
): Promise<UserCostThreshold> {
  // TODO: 從資料庫查詢用戶自訂閾值
  // const customThresholds = await db.user_cost_thresholds.findUnique({
  //   where: { user_id: userId }
  // })

  // 目前先回傳預設值
  return {
    user_id: userId,
    daily_limit: DefaultCostThresholds.userDailyLimit,
    monthly_limit: DefaultCostThresholds.userMonthlyLimit,
    execution_limit: DefaultCostThresholds.executionLimit,
  }
}

/**
 * 取得系統成本閾值
 */
export function getSystemThresholds() {
  return {
    daily_limit: DefaultCostThresholds.systemDailyLimit,
    monthly_limit: DefaultCostThresholds.systemMonthlyLimit,
  }
}
