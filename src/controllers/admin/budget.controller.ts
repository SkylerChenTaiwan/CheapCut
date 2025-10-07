/**
 * 預算管理 API Controller
 *
 * 提供用戶成本閾值設定與預算使用查詢功能
 */

import { getUserThresholds } from '../../config/cost-thresholds'

/**
 * 設定用戶成本閾值
 *
 * PUT /api/admin/budget/user/:userId
 * Body: { daily_limit?: number, monthly_limit?: number, execution_limit?: number }
 *
 * @example
 * // Request
 * PUT /api/admin/budget/user/user123
 * {
 *   "daily_limit": 20.0,
 *   "monthly_limit": 200.0,
 *   "execution_limit": 10.0
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "userId": "user123",
 *   "thresholds": {
 *     "daily_limit": 20.0,
 *     "monthly_limit": 200.0,
 *     "execution_limit": 10.0
 *   }
 * }
 */
export async function setUserBudget(
  userId: string,
  thresholds: {
    daily_limit?: number
    monthly_limit?: number
    execution_limit?: number
  }
): Promise<{
  success: boolean
  userId: string
  thresholds: {
    daily_limit?: number
    monthly_limit?: number
    execution_limit?: number
  }
}> {
  try {
    // TODO: 實際使用時需要整合資料庫
    // await db.user_cost_thresholds.upsert({
    //   where: { user_id: userId },
    //   create: {
    //     user_id: userId,
    //     daily_limit: thresholds.daily_limit,
    //     monthly_limit: thresholds.monthly_limit,
    //     execution_limit: thresholds.execution_limit,
    //   },
    //   update: {
    //     daily_limit: thresholds.daily_limit,
    //     monthly_limit: thresholds.monthly_limit,
    //     execution_limit: thresholds.execution_limit,
    //   },
    // })

    console.log(`[BudgetController] Set budget for user ${userId}:`, thresholds)

    return {
      success: true,
      userId,
      thresholds,
    }
  } catch (error) {
    console.error('[BudgetController] Failed to set user budget:', error)
    throw error
  }
}

/**
 * 查詢用戶預算使用狀況
 *
 * GET /api/admin/budget/user/:userId
 *
 * @example
 * // Request
 * GET /api/admin/budget/user/user123
 *
 * // Response
 * {
 *   "userId": "user123",
 *   "thresholds": {
 *     "user_id": "user123",
 *     "daily_limit": 10.0,
 *     "monthly_limit": 100.0,
 *     "execution_limit": 5.0
 *   },
 *   "usage": {
 *     "daily": {
 *       "cost": 3.5,
 *       "limit": 10.0,
 *       "percentage": 35.0
 *     },
 *     "monthly": {
 *       "cost": 45.2,
 *       "limit": 100.0,
 *       "percentage": 45.2
 *     }
 *   }
 * }
 */
export async function getUserBudget(userId: string): Promise<{
  userId: string
  thresholds: {
    user_id: string
    daily_limit?: number
    monthly_limit?: number
    execution_limit?: number
  }
  usage: {
    daily: {
      cost: number
      limit?: number
      percentage: number
    }
    monthly: {
      cost: number
      limit?: number
      percentage: number
    }
  }
}> {
  try {
    // 取得閾值
    const thresholds = await getUserThresholds(userId)

    // TODO: 實際使用時需要整合資料庫
    // // 取得當日成本
    // const today = new Date()
    // today.setHours(0, 0, 0, 0)
    // const result = await db.api_costs.aggregate({
    //   where: {
    //     user_id: userId,
    //     created_at: { gte: today },
    //   },
    //   _sum: { cost: true },
    // })
    // const dailyCost = result._sum.cost || 0
    //
    // // 取得本月成本
    // const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    // const monthResult = await db.api_costs.aggregate({
    //   where: {
    //     user_id: userId,
    //     created_at: { gte: monthStart },
    //   },
    //   _sum: { cost: true },
    // })
    // const monthlyCost = monthResult._sum.cost || 0

    // 暫時使用模擬數據
    const dailyCost = 0
    const monthlyCost = 0

    return {
      userId,
      thresholds,
      usage: {
        daily: {
          cost: dailyCost,
          limit: thresholds.daily_limit,
          percentage: thresholds.daily_limit
            ? (dailyCost / thresholds.daily_limit) * 100
            : 0,
        },
        monthly: {
          cost: monthlyCost,
          limit: thresholds.monthly_limit,
          percentage: thresholds.monthly_limit
            ? (monthlyCost / thresholds.monthly_limit) * 100
            : 0,
        },
      },
    }
  } catch (error) {
    console.error('[BudgetController] Failed to fetch user budget:', error)
    throw error
  }
}

/**
 * 查詢系統總成本狀況
 *
 * GET /api/admin/budget/system
 *
 * @example
 * // Response
 * {
 *   "daily": {
 *     "cost": 123.45,
 *     "limit": 500.0,
 *     "percentage": 24.69
 *   },
 *   "monthly": {
 *     "cost": 2345.67,
 *     "limit": 5000.0,
 *     "percentage": 46.91
 *   }
 * }
 */
export async function getSystemBudget(): Promise<{
  daily: {
    cost: number
    limit: number
    percentage: number
  }
  monthly: {
    cost: number
    limit: number
    percentage: number
  }
}> {
  try {
    // TODO: 實際使用時需要整合資料庫
    // const today = new Date()
    // today.setHours(0, 0, 0, 0)
    // const dailyResult = await db.api_costs.aggregate({
    //   where: { created_at: { gte: today } },
    //   _sum: { cost: true },
    // })
    // const dailyCost = dailyResult._sum.cost || 0
    //
    // const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    // const monthlyResult = await db.api_costs.aggregate({
    //   where: { created_at: { gte: monthStart } },
    //   _sum: { cost: true },
    // })
    // const monthlyCost = monthlyResult._sum.cost || 0

    // 暫時使用模擬數據
    const dailyCost = 0
    const monthlyCost = 0

    const systemThresholds = {
      daily_limit: 500.0,
      monthly_limit: 5000.0,
    }

    return {
      daily: {
        cost: dailyCost,
        limit: systemThresholds.daily_limit,
        percentage: (dailyCost / systemThresholds.daily_limit) * 100,
      },
      monthly: {
        cost: monthlyCost,
        limit: systemThresholds.monthly_limit,
        percentage: (monthlyCost / systemThresholds.monthly_limit) * 100,
      },
    }
  } catch (error) {
    console.error('[BudgetController] Failed to fetch system budget:', error)
    throw error
  }
}
