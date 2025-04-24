import { Payload } from 'payload'
import { BaseService } from './base.service'
import { NotificationService } from './notification.service'
import { EmailService } from './email.service'
import { EnrollmentService } from './courses/enrollmentService'

export class RewardService extends BaseService {
  private static instance: RewardService | null = null
  private notificationService: NotificationService | null = null
  private emailService: EmailService | null = null
  private enrollmentService: EnrollmentService | null = null

  private constructor(payload: Payload) {
    super(payload)
    this.notificationService = NotificationService.getInstance(payload)
    this.emailService = EmailService.getInstance(payload)
    this.enrollmentService = new EnrollmentService(payload)
  }

  public static getInstance(payload: Payload): RewardService {
    if (!RewardService.instance) {
      RewardService.instance = new RewardService(payload)
    }
    return RewardService.instance
  }

  /**
   * Проверяет и выдает награды за уровень
   * @param userId ID пользователя
   * @param level Уровень пользователя
   */
  async checkAndAwardLevelRewards(userId: string, level: number): Promise<void> {
    try {
      // Получаем все награды за уровень, которые соответствуют текущему уровню пользователя
      const rewards = await this.payload.find({
        collection: 'rewards',
        where: {
          and: [
            {
              type: {
                equals: 'level',
              },
            },
            {
              requiredLevel: {
                less_than_or_equal: level,
              },
            },
            {
              status: {
                equals: 'active',
              },
            },
          ],
        },
      })

      // Получаем уже выданные награды пользователю
      const userRewards = await this.payload.find({
        collection: 'user-rewards',
        where: {
          user: {
            equals: userId,
          },
        },
      })

      // Создаем карту уже выданных наград для быстрого поиска
      const userRewardsMap = new Map()
      userRewards.docs.forEach((userReward) => {
        userRewardsMap.set(userReward.reward, true)
      })

      // Выдаем новые награды
      for (const reward of rewards.docs) {
        // Проверяем, не выдана ли уже эта награда
        if (!userRewardsMap.has(reward.id)) {
          // Выдаем награду
          await this.awardReward(userId, reward.id)
        }
      }
    } catch (error) {
      console.error('Error checking and awarding level rewards:', error)
      throw error
    }
  }

  /**
   * Проверяет и выдает награды за достижение
   * @param userId ID пользователя
   * @param achievementId ID достижения
   */
  async checkAndAwardAchievementRewards(userId: string, achievementId: string): Promise<void> {
    try {
      // Получаем все награды за достижение, которые соответствуют текущему достижению пользователя
      const rewards = await this.payload.find({
        collection: 'rewards',
        where: {
          and: [
            {
              type: {
                equals: 'achievement',
              },
            },
            {
              requiredAchievement: {
                equals: achievementId,
              },
            },
            {
              status: {
                equals: 'active',
              },
            },
          ],
        },
      })

      // Получаем уже выданные награды пользователю
      const userRewards = await this.payload.find({
        collection: 'user-rewards',
        where: {
          user: {
            equals: userId,
          },
        },
      })

      // Создаем карту уже выданных наград для быстрого поиска
      const userRewardsMap = new Map()
      userRewards.docs.forEach((userReward) => {
        userRewardsMap.set(userReward.reward, true)
      })

      // Выдаем новые награды
      for (const reward of rewards.docs) {
        // Проверяем, не выдана ли уже эта награда
        if (!userRewardsMap.has(reward.id)) {
          // Выдаем награду
          await this.awardReward(userId, reward.id)
        }
      }
    } catch (error) {
      console.error('Error checking and awarding achievement rewards:', error)
      throw error
    }
  }

  /**
   * Проверяет и выдает награды за завершение курса
   * @param userId ID пользователя
   * @param courseId ID курса
   */
  async checkAndAwardCourseRewards(userId: string, courseId: string): Promise<void> {
    try {
      // Получаем все награды за курс, которые соответствуют текущему курсу пользователя
      const rewards = await this.payload.find({
        collection: 'rewards',
        where: {
          and: [
            {
              type: {
                equals: 'course',
              },
            },
            {
              requiredCourse: {
                equals: courseId,
              },
            },
            {
              status: {
                equals: 'active',
              },
            },
          ],
        },
      })

      // Получаем уже выданные награды пользователю
      const userRewards = await this.payload.find({
        collection: 'user-rewards',
        where: {
          user: {
            equals: userId,
          },
        },
      })

      // Создаем карту уже выданных наград для быстрого поиска
      const userRewardsMap = new Map()
      userRewards.docs.forEach((userReward) => {
        userRewardsMap.set(userReward.reward, true)
      })

      // Выдаем новые награды
      for (const reward of rewards.docs) {
        // Проверяем, не выдана ли уже эта награда
        if (!userRewardsMap.has(reward.id)) {
          // Выдаем награду
          await this.awardReward(userId, reward.id)
        }
      }
    } catch (error) {
      console.error('Error checking and awarding course rewards:', error)
      throw error
    }
  }

  /**
   * Выдает награду пользователю
   * @param userId ID пользователя
   * @param rewardId ID награды
   */
  async awardReward(userId: string, rewardId: string): Promise<any> {
    try {
      // Получаем информацию о награде
      const reward = await this.payload.findByID({
        collection: 'rewards',
        id: rewardId,
      })

      // Проверяем, активна ли награда
      if (reward.status !== 'active') {
        throw new Error('Reward is not active')
      }

      // Вычисляем дату истечения награды, если указан срок действия
      let expiresAt = null
      if (reward.expiresAfter) {
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + reward.expiresAfter)
        expiresAt = expirationDate.toISOString()
      }

      // Генерируем уникальный код для награды, если это скидка или бесплатный курс
      let code = null
      if (reward.rewardType === 'discount' || reward.rewardType === 'free_course') {
        code = this.generateRewardCode(userId, rewardId)
      }

      // Создаем запись о награде пользователя
      const userReward = await this.payload.create({
        collection: 'user-rewards',
        data: {
          user: userId,
          reward: rewardId,
          awardedAt: new Date().toISOString(),
          expiresAt,
          status: 'active',
          code,
        },
      })

      // Отправляем уведомление пользователю
      if (this.notificationService) {
        await this.notificationService.sendNotification({
          userId,
          title: 'Новая награда!',
          message: `Вы получили награду: ${reward.title}`,
          type: 'reward',
          metadata: {
            rewardId: rewardId,
            rewardType: reward.rewardType,
            userRewardId: userReward.id,
          },
        })
      }

      // Отправляем email пользователю
      await this.sendRewardEmail(userId, userReward.id)

      // Если это награда типа free_course, автоматически выдаем доступ к курсу
      if (reward.rewardType === 'free_course' && reward.freeCourse) {
        await this.processFreeCourseClaim(userId, userReward.id)
      }

      // Запускаем email-кампанию для награды, если она настроена
      await this.triggerRewardEmailCampaign(userId, userReward.id, 'reward.awarded')

      return userReward
    } catch (error) {
      console.error('Error awarding reward:', error)
      throw error
    }
  }

  /**
   * Генерирует уникальный код для награды
   * @param userId ID пользователя
   * @param rewardId ID награды
   */
  private generateRewardCode(userId: string, rewardId: string): string {
    const timestamp = Date.now().toString(36)
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `RW-${timestamp}-${randomPart}`
  }

  /**
   * Получает все награды пользователя
   * @param userId ID пользователя
   */
  async getUserRewards(userId: string): Promise<any> {
    try {
      const userRewards = await this.payload.find({
        collection: 'user-rewards',
        where: {
          user: {
            equals: userId,
          },
        },
        sort: '-awardedAt',
        depth: 1, // Включаем данные о награде
      })

      return userRewards.docs
    } catch (error) {
      console.error('Error getting user rewards:', error)
      throw error
    }
  }

  /**
   * Получает активные награды пользователя
   * @param userId ID пользователя
   */
  async getActiveUserRewards(userId: string): Promise<any> {
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
        sort: '-awardedAt',
        depth: 1, // Включаем данные о награде
      })

      return userRewards.docs
    } catch (error) {
      console.error('Error getting active user rewards:', error)
      throw error
    }
  }

  /**
   * Использует награду пользователя
   * @param userRewardId ID награды пользователя
   */
  async useReward(userRewardId: string): Promise<any> {
    try {
      // Получаем информацию о награде пользователя
      const userReward = await this.payload.findByID({
        collection: 'user-rewards',
        id: userRewardId,
        depth: 2, // Включаем данные о награде
      })

      // Проверяем, активна ли награда
      if (userReward.status !== 'active') {
        throw new Error('Reward is not active')
      }

      // Получаем информацию о награде
      const reward = userReward.reward
      if (typeof reward === 'string') {
        throw new Error('Invalid reward data')
      }

      // Обрабатываем использование награды в зависимости от типа
      let result
      switch (reward.rewardType) {
        case 'discount':
          // Для скидок используем специальный сервис
          const serviceRegistry = this.payload.services
          if (serviceRegistry && serviceRegistry.getRewardDiscountService) {
            const rewardDiscountService = serviceRegistry.getRewardDiscountService()
            result = await rewardDiscountService.createDiscountFromReward(userRewardId)
            if (!result.success) {
              throw new Error(result.error || 'Failed to create discount')
            }
          }
          break

        case 'free_course':
          // Для бесплатных курсов выдаем доступ
          result = await this.processFreeCourseClaim(userReward.user, userRewardId)
          break

        case 'exclusive_content':
          // Для эксклюзивного контента просто отмечаем как использованный
          result = await this.processExclusiveContentClaim(userReward.user, userRewardId)
          break

        case 'badge':
          // Для бейджей просто отмечаем как использованный
          result = await this.processBadgeClaim(userReward.user, userRewardId)
          break

        case 'certificate':
          // Для сертификатов просто отмечаем как использованный
          result = await this.processCertificateClaim(userReward.user, userRewardId)
          break

        default:
          // Для других типов просто отмечаем как использованный
          result = await this.payload.update({
            collection: 'user-rewards',
            id: userRewardId,
            data: {
              status: 'used',
              usedAt: new Date().toISOString(),
            },
          })
      }

      // Запускаем email-кампанию для использованной награды
      await this.triggerRewardEmailCampaign(userReward.user, userRewardId, 'reward.used')

      return result
    } catch (error) {
      console.error('Error using reward:', error)
      throw error
    }
  }
  /**
   * Отправляет email о награде пользователю
   * @param userId ID пользователя
   * @param userRewardId ID награды пользователя
   */
  private async sendRewardEmail(userId: string, userRewardId: string): Promise<boolean> {
    try {
      if (!this.emailService) {
        console.warn('Email service not available')
        return false
      }

      // Получаем информацию о пользователе
      const user = await this.payload.findByID({
        collection: 'users',
        id: userId,
      })

      // Получаем информацию о награде пользователя
      const userReward = await this.payload.findByID({
        collection: 'user-rewards',
        id: userRewardId,
        depth: 2, // Включаем данные о награде
      })

      // Получаем информацию о награде
      const reward = userReward.reward
      if (typeof reward === 'string') {
        console.error('Invalid reward data')
        return false
      }

      // Формируем данные для шаблона
      const templateData = {
        userName: user.name || 'Пользователь',
        rewardTitle: reward.title,
        rewardDescription: reward.description,
        rewardType: reward.rewardType,
        rewardCode: userReward.code,
        expiresAt: userReward.expiresAt,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
      }

      // Выбираем шаблон в зависимости от типа награды
      let templateSlug = 'reward-generic'
      switch (reward.rewardType) {
        case 'discount':
          templateSlug = 'reward-discount'
          break
        case 'free_course':
          templateSlug = 'reward-free-course'
          break
        case 'badge':
          templateSlug = 'reward-badge'
          break
        case 'certificate':
          templateSlug = 'reward-certificate'
          break
        case 'exclusive_content':
          templateSlug = 'reward-exclusive-content'
          break
      }

      // Отправляем email
      const result = await this.emailService.sendTemplateEmail(
        templateSlug,
        user.email,
        templateData,
        {
          locale: user.locale || 'ru',
        },
      )

      return result
    } catch (error) {
      console.error('Error sending reward email:', error)
      return false
    }
  }

  /**
   * Запускает email-кампанию для награды
   * @param userId ID пользователя
   * @param userRewardId ID награды пользователя
   * @param eventType Тип события
   */
  private async triggerRewardEmailCampaign(
    userId: string,
    userRewardId: string,
    eventType: 'reward.awarded' | 'reward.used' | 'reward.expiring',
  ): Promise<void> {
    try {
      // Получаем информацию о награде пользователя
      const userReward = await this.payload.findByID({
        collection: 'user-rewards',
        id: userRewardId,
        depth: 2, // Включаем данные о награде
      })

      // Получаем информацию о награде
      const reward = userReward.reward
      if (typeof reward === 'string') {
        console.error('Invalid reward data')
        return
      }

      // Ищем подходящие email-кампании
      const campaigns = await this.payload.find({
        collection: 'email-campaigns',
        where: {
          and: [
            {
              status: {
                equals: 'active',
              },
            },
            {
              triggerType: {
                equals: 'event',
              },
            },
            {
              'eventTrigger.eventType': {
                equals: eventType,
              },
            },
          ],
        },
      })

      // Если нет подходящих кампаний, выходим
      if (campaigns.docs.length === 0) {
        return
      }

      // Запускаем каждую подходящую кампанию
      for (const campaign of campaigns.docs) {
        // Проверяем условия кампании, если они есть
        if (campaign.eventTrigger?.conditions) {
          // Здесь можно добавить проверку условий
          // Например, проверить тип награды
          const conditions = campaign.eventTrigger.conditions
          if (conditions.rewardType && conditions.rewardType !== reward.rewardType) {
            continue
          }
        }

        // Запускаем кампанию
        await this.payload.jobs.queue({
          task: 'email-campaign',
          input: {
            campaignId: campaign.id,
            eventData: {
              userId,
              userRewardId,
              rewardId: reward.id,
              rewardType: reward.rewardType,
              eventType,
            },
          },
        })

        console.log(`Queued email campaign ${campaign.id} for reward ${userRewardId}`)
      }
    } catch (error) {
      console.error('Error triggering reward email campaign:', error)
    }
  }

  /**
   * Обрабатывает получение бесплатного курса
   * @param userId ID пользователя
   * @param userRewardId ID награды пользователя
   */
  private async processFreeCourseClaim(userId: string, userRewardId: string): Promise<any> {
    try {
      // Получаем информацию о награде пользователя
      const userReward = await this.payload.findByID({
        collection: 'user-rewards',
        id: userRewardId,
        depth: 2, // Включаем данные о награде
      })

      // Получаем информацию о награде
      const reward = userReward.reward
      if (typeof reward === 'string') {
        throw new Error('Invalid reward data')
      }

      // Проверяем, что это награда типа free_course и указан курс
      if (reward.rewardType !== 'free_course' || !reward.freeCourse) {
        throw new Error('Invalid reward type or missing course')
      }

      // Записываем пользователя на курс
      const enrollment = await this.enrollmentService?.enrollUserInCourse({
        userId,
        courseId: reward.freeCourse,
        source: 'promotion',
        notes: `Enrolled via reward ${userRewardId}`,
      })

      // Обновляем статус награды
      const updatedReward = await this.payload.update({
        collection: 'user-rewards',
        id: userRewardId,
        data: {
          status: 'used',
          usedAt: new Date().toISOString(),
          metadata: {
            ...(userReward.metadata || {}),
            enrollmentId: enrollment.id,
            courseId: reward.freeCourse,
          },
        },
      })

      // Отправляем уведомление пользователю
      if (this.notificationService) {
        await this.notificationService.sendNotification({
          userId,
          title: 'Доступ к курсу открыт!',
          message: `Вы получили доступ к курсу по награде: ${reward.title}`,
          type: 'course_access',
          link: `/courses/${reward.freeCourse}`,
          metadata: {
            rewardId: reward.id,
            userRewardId,
            courseId: reward.freeCourse,
            enrollmentId: enrollment.id,
          },
        })
      }

      return updatedReward
    } catch (error) {
      console.error('Error processing free course claim:', error)
      throw error
    }
  }

  /**
   * Обрабатывает получение эксклюзивного контента
   * @param userId ID пользователя
   * @param userRewardId ID награды пользователя
   */
  private async processExclusiveContentClaim(userId: string, userRewardId: string): Promise<any> {
    try {
      // Получаем информацию о награде пользователя
      const userReward = await this.payload.findByID({
        collection: 'user-rewards',
        id: userRewardId,
        depth: 2, // Включаем данные о награде
      })

      // Получаем информацию о награде
      const reward = userReward.reward
      if (typeof reward === 'string') {
        throw new Error('Invalid reward data')
      }

      // Проверяем, что это награда типа exclusive_content
      if (reward.rewardType !== 'exclusive_content') {
        throw new Error('Invalid reward type')
      }

      // Обновляем статус награды
      const updatedReward = await this.payload.update({
        collection: 'user-rewards',
        id: userRewardId,
        data: {
          status: 'used',
          usedAt: new Date().toISOString(),
        },
      })

      // Отправляем уведомление пользователю
      if (this.notificationService) {
        await this.notificationService.sendNotification({
          userId,
          title: 'Эксклюзивный контент доступен!',
          message: `Вы получили доступ к эксклюзивному контенту: ${reward.title}`,
          type: 'exclusive_content',
          link: reward.contentUrl || '/rewards',
          metadata: {
            rewardId: reward.id,
            userRewardId,
          },
        })
      }

      return updatedReward
    } catch (error) {
      console.error('Error processing exclusive content claim:', error)
      throw error
    }
  }

  /**
   * Обрабатывает получение бейджа
   * @param userId ID пользователя
   * @param userRewardId ID награды пользователя
   */
  private async processBadgeClaim(userId: string, userRewardId: string): Promise<any> {
    try {
      // Получаем информацию о награде пользователя
      const userReward = await this.payload.findByID({
        collection: 'user-rewards',
        id: userRewardId,
        depth: 2, // Включаем данные о награде
      })

      // Получаем информацию о награде
      const reward = userReward.reward
      if (typeof reward === 'string') {
        throw new Error('Invalid reward data')
      }

      // Проверяем, что это награда типа badge
      if (reward.rewardType !== 'badge') {
        throw new Error('Invalid reward type')
      }

      // Обновляем статус награды
      const updatedReward = await this.payload.update({
        collection: 'user-rewards',
        id: userRewardId,
        data: {
          status: 'used',
          usedAt: new Date().toISOString(),
        },
      })

      // Отправляем уведомление пользователю
      if (this.notificationService) {
        await this.notificationService.sendNotification({
          userId,
          title: 'Бейдж активирован!',
          message: `Вы активировали бейдж: ${reward.title}`,
          type: 'badge',
          metadata: {
            rewardId: reward.id,
            userRewardId,
          },
        })
      }

      return updatedReward
    } catch (error) {
      console.error('Error processing badge claim:', error)
      throw error
    }
  }

  /**
   * Обрабатывает получение сертификата
   * @param userId ID пользователя
   * @param userRewardId ID награды пользователя
   */
  private async processCertificateClaim(userId: string, userRewardId: string): Promise<any> {
    try {
      // Получаем информацию о награде пользователя
      const userReward = await this.payload.findByID({
        collection: 'user-rewards',
        id: userRewardId,
        depth: 2, // Включаем данные о награде
      })

      // Получаем информацию о награде
      const reward = userReward.reward
      if (typeof reward === 'string') {
        throw new Error('Invalid reward data')
      }

      // Проверяем, что это награда типа certificate
      if (reward.rewardType !== 'certificate') {
        throw new Error('Invalid reward type')
      }

      // Обновляем статус награды
      const updatedReward = await this.payload.update({
        collection: 'user-rewards',
        id: userRewardId,
        data: {
          status: 'used',
          usedAt: new Date().toISOString(),
        },
      })

      // Отправляем уведомление пользователю
      if (this.notificationService) {
        await this.notificationService.sendNotification({
          userId,
          title: 'Сертификат активирован!',
          message: `Вы активировали сертификат: ${reward.title}`,
          type: 'certificate',
          link: reward.certificateUrl || '/rewards',
          metadata: {
            rewardId: reward.id,
            userRewardId,
          },
        })
      }

      return updatedReward
    } catch (error) {
      console.error('Error processing certificate claim:', error)
      throw error
    }
  }

  /**
   * Проверяет истекающие награды и отправляет уведомления
   */
  async checkExpiringRewards(): Promise<void> {
    try {
      // Получаем текущую дату
      const now = new Date()

      // Получаем дату через 7 дней
      const sevenDaysLater = new Date(now)
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

      // Получаем активные награды, которые истекают в течение 7 дней
      const expiringRewards = await this.payload.find({
        collection: 'user-rewards',
        where: {
          and: [
            {
              status: {
                equals: 'active',
              },
            },
            {
              expiresAt: {
                greater_than: now.toISOString(),
              },
            },
            {
              expiresAt: {
                less_than: sevenDaysLater.toISOString(),
              },
            },
          ],
        },
        depth: 2, // Включаем данные о награде и пользователе
      })

      // Обрабатываем каждую истекающую награду
      for (const userReward of expiringRewards.docs) {
        // Получаем информацию о награде
        const reward = userReward.reward
        if (typeof reward === 'string') {
          continue
        }

        // Получаем информацию о пользователе
        const userId = userReward.user
        if (typeof userId === 'string') {
          // Отправляем уведомление пользователю
          if (this.notificationService) {
            await this.notificationService.sendNotification({
              userId,
              title: 'Награда скоро истечет!',
              message: `Ваша награда "${reward.title}" истекает через ${this.getDaysUntilExpiration(userReward.expiresAt)} дней. Используйте ее сейчас!`,
              type: 'reward_expiring',
              link: '/rewards',
              metadata: {
                rewardId: reward.id,
                userRewardId: userReward.id,
                expiresAt: userReward.expiresAt,
              },
            })
          }

          // Запускаем email-кампанию для истекающей награды
          await this.triggerRewardEmailCampaign(userId, userReward.id, 'reward.expiring')
        }
      }
    } catch (error) {
      console.error('Error checking expiring rewards:', error)
    }
  }

  /**
   * Возвращает количество дней до истечения срока
   * @param expiresAt Дата истечения срока
   */
  private getDaysUntilExpiration(expiresAt: string): number {
    const now = new Date()
    const expiration = new Date(expiresAt)
    const diffTime = expiration.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }
}
