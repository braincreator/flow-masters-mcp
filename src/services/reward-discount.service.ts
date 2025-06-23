import { Payload } from 'payload'
import { BaseService } from './base.service'
import { v4 as uuidv4 } from 'uuid'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface RewardDiscountResult {
  success: boolean
  discountCode?: string
  error?: string
}

export class RewardDiscountService extends BaseService {
  private static instance: RewardDiscountService | null = null

  private constructor(payload: Payload) {
    super(payload)
  }

  public static getInstance(payload: Payload): RewardDiscountService {
    if (!RewardDiscountService.instance) {
      RewardDiscountService.instance = new RewardDiscountService(payload)
    }
    return RewardDiscountService.instance
  }

  /**
   * Создает скидку на основе награды
   * @param userRewardId ID награды пользователя
   */
  async createDiscountFromReward(userRewardId: string): Promise<RewardDiscountResult> {
    try {
      // Получаем информацию о награде пользователя
      const userReward = await this.payload.findByID({
        collection: 'user-rewards',
        id: userRewardId,
        depth: 2, // Включаем данные о награде
      })
      
      // Проверяем, активна ли награда
      if (userReward.status !== 'active') {
        return {
          success: false,
          error: 'Reward is not active',
        }
      }
      
      // Проверяем, является ли награда скидкой
      const reward = userReward.reward
      if (typeof reward === 'string') {
        return {
          success: false,
          error: 'Invalid reward data',
        }
      }
      
      if (reward.rewardType !== 'discount') {
        return {
          success: false,
          error: 'Reward is not a discount',
        }
      }
      
      // Проверяем, указано ли значение скидки
      if (!reward.discountValue || reward.discountValue <= 0 || reward.discountValue > 100) {
        return {
          success: false,
          error: 'Invalid discount value',
        }
      }
      
      // Генерируем уникальный код скидки
      const discountCode = `RW-${userReward.code || this.generateDiscountCode()}`
      
      // Вычисляем срок действия скидки
      const now = new Date()
      const expirationDate = userReward.expiresAt 
        ? new Date(userReward.expiresAt) 
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 дней по умолчанию
      
      // Создаем скидку в системе
      const discount = await this.payload.create({
        collection: 'discounts',
        data: {
          code: discountCode,
          type: 'percentage',
          value: reward.discountValue,
          startDate: now.toISOString(),
          endDate: expirationDate.toISOString(),
          maxUsage: 1, // Одноразовая скидка
          maxUsagePerUser: 1,
          status: 'active',
          metadata: {
            source: 'reward',
            rewardId: reward.id,
            userRewardId: userReward.id,
            userId: userReward.user,
          },
        },
      })
      
      // Обновляем статус награды
      await this.payload.update({
        collection: 'user-rewards',
        id: userRewardId,
        data: {
          status: 'used',
          usedAt: new Date().toISOString(),
          metadata: {
            ...(userReward.metadata || {}),
            discountId: discount.id,
            discountCode,
          },
        },
      })
      
      // Отправляем уведомление пользователю
      const serviceRegistry = this.payload.services
      if (serviceRegistry && serviceRegistry.getNotificationService) {
        const notificationService = serviceRegistry.getNotificationService()
        
        await notificationService.sendNotification({
          userId: userReward.user,
          title: 'Скидка активирована!',
          message: `Ваша скидка ${reward.discountValue}% активирована. Используйте код ${discountCode} при оформлении заказа.`,
          type: 'discount',
          metadata: {
            discountId: discount.id,
            discountCode,
            discountValue: reward.discountValue,
          },
        })
      }
      
      return {
        success: true,
        discountCode,
      }
    } catch (error) {
      logError('Error creating discount from reward:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Проверяет, есть ли у пользователя активные награды-скидки
   * @param userId ID пользователя
   */
  async getUserDiscountRewards(userId: string): Promise<any[]> {
    try {
      const userRewards = await this.payload.find({
        collection: 'user-rewards',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              status: {
                equals: 'active',
              },
            },
          ],
        },
        depth: 2, // Включаем данные о награде
      })
      
      // Фильтруем только награды-скидки
      return userRewards.docs.filter((userReward) => {
        const reward = userReward.reward
        return typeof reward !== 'string' && reward.rewardType === 'discount'
      })
    } catch (error) {
      logError('Error getting user discount rewards:', error)
      return []
    }
  }

  /**
   * Генерирует уникальный код скидки
   */
  private generateDiscountCode(): string {
    const uuid = uuidv4()
    return uuid.substring(0, 8).toUpperCase()
  }
}
