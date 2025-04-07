import { Payload } from 'payload'
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionPaymentHistory,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
} from '@/types/subscription'
import { ServiceRegistry } from './service.registry'
import { BaseService } from './base.service'
import { PaymentService } from './payment.service'
import { NotificationService } from './notification.service'

interface PaymentResult {
  status: 'successful' | 'failed' | 'pending'
  paymentId: string
  error?: string
}

interface ProcessPaymentParams {
  amount: number
  currency: string
  provider: string
  paymentMethod: string
  paymentToken: string
  metadata: Record<string, any>
}

export class SubscriptionService extends BaseService {
  private static instance: SubscriptionService | null = null
  private paymentService: PaymentService | null = null
  private notificationService: NotificationService | null = null

  constructor(payload: Payload) {
    super(payload)
  }

  private initializeServices() {
    if (!this.paymentService || !this.notificationService) {
      const serviceRegistry = this.getServiceRegistry()
      this.paymentService = serviceRegistry.getPaymentService()
      this.notificationService = serviceRegistry.getNotificationService()
    }
  }

  public static getInstance(payload: Payload): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService(payload)
    }
    return SubscriptionService.instance
  }

  /**
   * Получение всех планов подписок
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (!this.payload) {
      throw new Error('Payload client не инициализирован')
    }

    try {
      const result = await this.payload.find({
        collection: 'subscription-plans',
      })

      return result.docs as unknown as SubscriptionPlan[]
    } catch (error) {
      console.error('Ошибка при получении планов подписок:', error)
      return []
    }
  }

  /**
   * Получение плана подписки по ID
   */
  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
    if (!this.payload) {
      throw new Error('Payload client не инициализирован')
    }

    try {
      const plan = await this.payload.findByID({
        collection: 'subscription-plans',
        id: planId,
      })

      return plan as unknown as SubscriptionPlan
    } catch (error) {
      console.error(`Ошибка при получении плана подписки ${planId}:`, error)
      return null
    }
  }

  /**
   * Получение подписок пользователя
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    if (!this.payload) {
      throw new Error('Payload client не инициализирован')
    }

    try {
      const result = await this.payload.find({
        collection: 'subscriptions',
        where: {
          userId: {
            equals: userId,
          },
        },
      })

      return result.docs as unknown as Subscription[]
    } catch (error) {
      console.error(`Ошибка при получении подписок пользователя ${userId}:`, error)
      return []
    }
  }

  /**
   * Получение активных подписок пользователя
   */
  async getUserActiveSubscriptions(userId: string): Promise<Subscription[]> {
    if (!this.payload) {
      throw new Error('Payload client не инициализирован')
    }

    try {
      const result = await this.payload.find({
        collection: 'subscriptions',
        where: {
          and: [
            {
              userId: {
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
      })

      return result.docs as unknown as Subscription[]
    } catch (error) {
      console.error(`Ошибка при получении активных подписок пользователя ${userId}:`, error)
      return []
    }
  }

  /**
   * Создание новой подписки
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<Subscription | null> {
    this.initializeServices()
    if (!this.payload || !this.paymentService) {
      throw new Error('Сервисы не инициализированы')
    }

    try {
      // Проверяем наличие активной подписки
      const hasActive = await this.hasActiveSubscription(params.userId, params.planId)
      if (hasActive) {
        throw new Error('У пользователя уже есть активная подписка на этот план')
      }

      // Получение плана подписки
      const plan = await this.getSubscriptionPlan(params.planId)
      if (!plan) {
        throw new Error(`План подписки ${params.planId} не найден`)
      }

      // Проверяем поддерживаемый период
      if (!['monthly', 'quarterly', 'yearly'].includes(plan.period)) {
        throw new Error(`Неподдерживаемый период подписки: ${plan.period}`)
      }

      // Рассчитываем дату следующего платежа
      const startDate = params.startDate ? new Date(params.startDate) : new Date()
      const nextPaymentDate = this.calculateNextPaymentDate(startDate, plan.period)

      // Создаем подписку в статусе pending
      const subscription = await this.payload.create({
        collection: 'subscriptions',
        data: {
          userId: params.userId,
          planId: params.planId,
          status: 'pending',
          paymentProvider: params.paymentProvider as 'yoomoney' | 'robokassa' | 'stripe' | 'paypal',
          paymentMethod: params.paymentMethod,
          paymentToken: params.paymentToken,
          period: plan.period,
          amount: plan.price,
          currency: plan.currency as 'RUB' | 'USD' | 'EUR',
          startDate: startDate.toISOString(),
          nextPaymentDate: nextPaymentDate.toISOString(),
          metadata: params.metadata || {},
        },
      })

      // Пытаемся провести первый платеж
      const paymentResult = await this.processSubscriptionPayment(subscription.id)
      if (!paymentResult) {
        // Если платеж не прошел, обновляем статус на failed
        await this.updateSubscription(subscription.id, { status: 'failed' })
        throw new Error('Ошибка при проведении первого платежа')
      }

      return subscription as unknown as Subscription
    } catch (error) {
      console.error('Ошибка при создании подписки:', error)
      return null
    }
  }

  /**
   * Обновление подписки
   */
  async updateSubscription(
    subscriptionId: string,
    params: UpdateSubscriptionParams,
  ): Promise<Subscription | null> {
    if (!this.payload) {
      throw new Error('Payload client не инициализирован')
    }

    try {
      const updatedSubscription = await this.payload.update({
        collection: 'subscriptions',
        id: subscriptionId,
        data: {
          ...params,
          // Если меняется статус на canceled, добавляем дату отмены
          ...(params.status === 'canceled' && { canceledAt: new Date().toISOString() }),
        },
      })

      // Если статус изменился, отправляем уведомление
      if (params.status) {
        await this.sendSubscriptionStatusNotification(
          updatedSubscription as unknown as Subscription,
          params.status,
        )
      }

      return updatedSubscription as unknown as Subscription
    } catch (error) {
      console.error(`Ошибка при обновлении подписки ${subscriptionId}:`, error)
      return null
    }
  }

  /**
   * Отмена подписки
   */
  async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<boolean> {
    if (!this.payload) {
      throw new Error('Payload client не инициализирован')
    }

    try {
      const subscription = (await this.payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
      })) as unknown as Subscription

      if (!subscription) {
        throw new Error(`Подписка ${subscriptionId} не найдена`)
      }

      if (subscription.status !== 'active') {
        throw new Error(`Нельзя отменить подписку в статусе ${subscription.status}`)
      }

      // Если отмена немедленная
      if (immediate) {
        await this.updateSubscription(subscriptionId, {
          status: 'canceled',
          endDate: new Date().toISOString(),
        })
      } else {
        // Отмена после следующего платежного периода
        await this.updateSubscription(subscriptionId, {
          status: 'canceled',
          endDate: subscription.nextPaymentDate,
        })
      }

      return true
    } catch (error) {
      console.error(`Ошибка при отмене подписки ${subscriptionId}:`, error)
      return false
    }
  }

  /**
   * Приостановка подписки
   */
  async pauseSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.payload) {
      throw new Error('Payload client не инициализирован')
    }

    try {
      const subscription = (await this.payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
      })) as unknown as Subscription

      if (!subscription) {
        throw new Error(`Подписка ${subscriptionId} не найдена`)
      }

      if (subscription.status !== 'active') {
        throw new Error(`Нельзя приостановить подписку в статусе ${subscription.status}`)
      }

      await this.updateSubscription(subscriptionId, {
        status: 'paused',
      })

      return true
    } catch (error) {
      console.error(`Ошибка при приостановке подписки ${subscriptionId}:`, error)
      return false
    }
  }

  /**
   * Возобновление подписки
   */
  async resumeSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.payload) {
      throw new Error('Payload client не инициализирован')
    }

    try {
      const subscription = (await this.payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
      })) as unknown as Subscription

      if (!subscription) {
        throw new Error(`Подписка ${subscriptionId} не найдена`)
      }

      if (subscription.status !== 'paused') {
        throw new Error(`Нельзя возобновить подписку в статусе ${subscription.status}`)
      }

      // Рассчитываем новую дату следующего платежа
      const nextPaymentDate = this.calculateNextPaymentDate(new Date(), subscription.period)

      await this.updateSubscription(subscriptionId, {
        status: 'active',
        nextPaymentDate: nextPaymentDate.toISOString(),
      })

      return true
    } catch (error) {
      console.error(`Ошибка при возобновлении подписки ${subscriptionId}:`, error)
      return false
    }
  }

  /**
   * Обработка платежа подписки
   */
  private async processSubscriptionPayment(subscriptionId: string): Promise<boolean> {
    try {
      const subscription = await this.payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
      })

      if (!subscription || !this.paymentService) {
        return false
      }

      const paymentResult = await this.paymentService.processPayment({
        amount: subscription.amount,
        currency: subscription.currency,
        provider: subscription.paymentProvider,
        paymentMethod: subscription.paymentMethod,
        paymentToken: subscription.paymentToken,
        metadata: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          planId: subscription.planId,
        },
      })

      if (paymentResult.status === 'successful') {
        await this.updateSubscription(subscriptionId, {
          status: 'active',
          nextPaymentDate: new Date().toISOString(),
        })
        await this.recordPaymentHistory(subscription, paymentResult)
        return true
      }

      return false
    } catch (error) {
      console.error('Ошибка при обработке платежа:', error)
      return false
    }
  }

  /**
   * Получение истории платежей по подписке
   */
  async getSubscriptionPaymentHistory(
    subscriptionId: string,
  ): Promise<SubscriptionPaymentHistory[]> {
    if (!this.payload) {
      throw new Error('Payload client не инициализирован')
    }

    try {
      const result = await this.payload.find({
        collection: 'subscription-payments',
        where: {
          subscriptionId: {
            equals: subscriptionId,
          },
        },
        sort: '-paymentDate',
      })

      return result.docs as unknown as SubscriptionPaymentHistory[]
    } catch (error) {
      console.error(`Ошибка при получении истории платежей подписки ${subscriptionId}:`, error)
      return []
    }
  }

  /**
   * Запись платежа в историю
   */
  private async recordPaymentHistory(
    subscription: any,
    paymentResult: PaymentResult,
  ): Promise<void> {
    await this.payload.create({
      collection: 'subscription-payments',
      data: {
        subscriptionId: subscription.id,
        amount: subscription.amount,
        currency: subscription.currency as 'RUB' | 'USD' | 'EUR',
        status: paymentResult.status,
        paymentDate: new Date().toISOString(),
        paymentMethod: subscription.paymentMethod,
        transactionId: paymentResult.paymentId,
        error: paymentResult.error,
      },
    })
  }

  /**
   * Отправка уведомления об изменении статуса подписки
   */
  private async sendSubscriptionStatusNotification(
    subscription: Subscription,
    status: SubscriptionStatus,
  ): Promise<void> {
    this.initializeServices()
    if (!this.payload || !this.notificationService) {
      return
    }

    try {
      // Получаем информацию о пользователе
      const user = await this.payload.findByID({
        collection: 'users',
        id: subscription.userId,
      })

      if (!user) {
        throw new Error(`Пользователь ${subscription.userId} не найден`)
      }

      // Получаем информацию о плане подписки
      const plan = await this.getSubscriptionPlan(subscription.planId)
      if (!plan) {
        throw new Error(`План подписки ${subscription.planId} не найден`)
      }

      let message = ''
      switch (status) {
        case 'active':
          message = `Ваша подписка "${plan.name}" активирована. Следующий платеж: ${new Date(subscription.nextPaymentDate).toLocaleDateString()}`
          break
        case 'paused':
          message = `Ваша подписка "${plan.name}" приостановлена. Вы можете возобновить её в любое время.`
          break
        case 'canceled':
          message = `Ваша подписка "${plan.name}" отменена. ${
            subscription.endDate
              ? `Доступ будет активен до ${new Date(subscription.endDate).toLocaleDateString()}`
              : ''
          }`
          break
        case 'expired':
          message = `Срок действия вашей подписки "${plan.name}" истек.`
          break
        case 'failed':
          message = `Возникла проблема с оплатой вашей подписки "${plan.name}". Пожалуйста, проверьте способ оплаты.`
          break
      }

      await this.notificationService.sendDigitalOrderStatusUpdate({
        email: user.email,
        orderNumber: `Sub-${subscription.id.substring(0, 8)}`,
        status,
        message,
      })
    } catch (error) {
      console.error('Ошибка при отправке уведомления о статусе подписки:', error)
    }
  }

  /**
   * Проверка и обработка всех подписок, требующих продления
   */
  async processRecurringPayments(): Promise<{ success: number; failed: number }> {
    if (!this.payload) {
      throw new Error('Payload client не инициализирован')
    }

    const now = new Date()
    const results = { success: 0, failed: 0 }

    try {
      // Находим все активные подписки, у которых дата следующего платежа наступила
      const activeSubscriptions = await this.payload.find({
        collection: 'subscriptions',
        where: {
          and: [
            {
              status: {
                equals: 'active',
              },
            },
            {
              nextPaymentDate: {
                less_than_equal: now.toISOString(),
              },
            },
          ],
        },
      })

      console.log(`Найдено ${activeSubscriptions.docs.length} подписок для обработки...`)

      // Обрабатываем каждую подписку
      for (const subscription of activeSubscriptions.docs as unknown as Subscription[]) {
        try {
          const success = await this.processSubscriptionPayment(subscription.id)
          if (success) {
            results.success++
          } else {
            results.failed++
          }
        } catch (error) {
          console.error(`Ошибка при обработке подписки ${subscription.id}:`, error)
          results.failed++
        }
      }

      // Проверяем просроченные подписки для отметки как expired
      const failedSubscriptions = await this.payload.find({
        collection: 'subscriptions',
        where: {
          and: [
            {
              status: {
                equals: 'failed',
              },
            },
            {
              nextPaymentDate: {
                less_than: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 дней на повторную оплату
              },
            },
          ],
        },
      })

      for (const subscription of failedSubscriptions.docs as unknown as Subscription[]) {
        await this.updateSubscription(subscription.id, {
          status: 'expired',
        })
      }

      return results
    } catch (error) {
      console.error('Ошибка при обработке регулярных платежей:', error)
      return results
    }
  }

  // Вспомогательные методы

  /**
   * Расчет даты следующего платежа
   */
  private calculateNextPaymentDate(startDate: Date, period: string): Date {
    const date = new Date(startDate)
    switch (period) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1)
        break
      case 'quarterly':
        date.setMonth(date.getMonth() + 3)
        break
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1)
        break
      default:
        throw new Error(`Неподдерживаемый период подписки: ${period}`)
    }
    return date
  }

  /**
   * Проверяет наличие активных подписок у пользователя
   */
  private async hasActiveSubscription(userId: string, planId: string): Promise<boolean> {
    const activeSubscriptions = await this.getUserActiveSubscriptions(userId)
    return activeSubscriptions.some((sub) => sub.planId === planId)
  }
}
