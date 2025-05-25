import { Payload } from 'payload'
import { add, parseISO, isAfter, isBefore } from 'date-fns'
import type { Duration } from 'date-fns'
import {
  Subscription as AppSubscription,
  SubscriptionStatus,
  SubscriptionPeriod,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  SubscriptionPaymentHistory,
} from '../types/subscription'
import {
  SubscriptionPlan,
  Order,
  Subscription as PayloadSubscription,
  User,
} from '../payload-types'
import { ServiceRegistry } from './service.registry'
import { BaseService } from './base.service'
import { PaymentService, PaymentResult, PaymentProviderKey } from './payment.service'
import { NotificationService } from './notification.service'

// Constants for retry logic
const MAX_RETRIES = 3 // Maximum number of retry attempts after an initial payment failure
// const RETRY_INTERVAL_DAYS = 3; // This will be replaced by dynamic retry intervals
const SUBSCRIPTION_RENEWAL_PRODUCT_SLUG = 'subscription-renewal-product' // Define a slug for the renewal product

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
  private logger: any // For logging

  constructor(payload: Payload) {
    super(payload)
    this.logger = payload.logger || console // Use Payload logger or fallback to console
  }

  private initializeServices() {
    if (!this.payload) {
      this.logger.error('Payload client is not initialized in SubscriptionService constructor.')
      throw new Error('Payload client is not initialized in SubscriptionService constructor.')
    }
    if (!this.paymentService) {
      this.paymentService = ServiceRegistry.getInstance(this.payload).getPaymentService()
    }
    if (!this.notificationService) {
      this.notificationService = ServiceRegistry.getInstance(this.payload).getNotificationService()
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
      this.logger.error('Payload client не инициализирован в getSubscriptionPlans')
      return []
    }
    try {
      const result = await this.payload.find({
        collection: 'subscription-plans',
      })
      return result.docs as SubscriptionPlan[]
    } catch (error) {
      this.logger.error('Ошибка при получении планов подписок:', error)
      return []
    }
  }

  /**
   * Получение плана подписки по ID
   */
  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
    if (!this.payload) {
      this.logger.error('Payload client не инициализирован в getSubscriptionPlan')
      return null
    }

    try {
      const plan = await this.payload.findByID({
        collection: 'subscription-plans',
        id: planId,
      })
      return plan as SubscriptionPlan
    } catch (error) {
      this.logger.error(`Ошибка при получении плана подписки ${planId}:`, error)
      return null
    }
  }

  /**
   * Получение подписок пользователя
   */
  async getUserSubscriptions(userId: string): Promise<AppSubscription[]> {
    if (!this.payload) {
      this.logger.error('Payload client не инициализирован в getUserSubscriptions')
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
      return result.docs as unknown as AppSubscription[]
    } catch (error) {
      this.logger.error(`Ошибка при получении подписок пользователя ${userId}:`, error)
      return []
    }
  }

  /**
   * Получение активных подписок пользователя
   */
  async getUserActiveSubscriptions(userId: string): Promise<AppSubscription[]> {
    if (!this.payload) {
      this.logger.error('Payload client не инициализирован в getUserActiveSubscriptions')
      throw new Error('Payload client не инициализирован')
    }
    try {
      const result = await this.payload.find({
        collection: 'subscriptions',
        where: {
          and: [{ userId: { equals: userId } }, { status: { equals: 'active' } }],
        },
      })
      return result.docs as unknown as AppSubscription[]
    } catch (error) {
      this.logger.error(`Ошибка при получении активных подписок пользователя ${userId}:`, error)
      return []
    }
  }

  /**
   * Создание новой подписки
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<AppSubscription | null> {
    this.initializeServices()
    if (!this.payload || !this.paymentService) {
      this.logger.error('Сервисы не инициализированы в createSubscription')
      throw new Error('Сервисы не инициализированы')
    }

    try {
      const planId =
        typeof params.planId === 'string' ? params.planId : (params.planId as { id: string }).id
      const userId = typeof params.userId === 'string' ? params.userId : (params.userId as User).id

      const hasActive = await this.hasActiveSubscription(userId, planId)
      if (hasActive) {
        throw new Error('У пользователя уже есть активная подписка на этот план')
      }

      const plan = await this.getSubscriptionPlan(planId)
      if (!plan) {
        throw new Error(`План подписки ${planId} не найден`)
      }

      if (
        !plan.period ||
        !['monthly', 'quarterly', 'yearly', 'annual', 'daily', 'weekly'].includes(plan.period)
      ) {
        throw new Error(`Неподдерживаемый или отсутствующий период подписки: ${plan.period}`)
      }

      const startDate = params.startDate ? new Date(params.startDate) : new Date()
      const nextPaymentDate = this.calculateNextPaymentDate(startDate, plan.period)

      const subscriptionData: any = {
        userId: userId,
        planId: planId,
        order: (params as any).orderId, // Assuming orderId is passed and is a string ID
        status: 'pending',
        paymentProvider: params.paymentProvider as 'yoomoney' | 'robokassa' | 'crypto',
        paymentMethod: params.paymentMethod,
        paymentToken: params.paymentToken,
        period: plan.period,
        amount: plan.price,
        currency: plan.currency as 'RUB' | 'USD' | 'EUR',
        startDate: startDate.toISOString(),
        nextPaymentDate: nextPaymentDate.toISOString(),
        metadata: params.metadata || {},
        paymentRetryAttempt: 0, // Initialize retry attempt
      }

      const newSubscription = await this.payload.create({
        collection: 'subscriptions',
        data: subscriptionData,
      })

      const paymentResult = await this.processInitialSubscriptionPayment(newSubscription.id)
      if (!paymentResult) {
        await this.updateSubscription(newSubscription.id, { status: 'failed' })
        throw new Error('Ошибка при проведении первого платежа')
      }

      return newSubscription as unknown as AppSubscription
    } catch (error: any) {
      this.logger.error('Ошибка при создании подписки:', error)
      return null
    }
  }

  /**
   * Обработка ПЕРВОНАЧАЛЬНОГО платежа при создании подписки.
   * Возвращает true при успехе, false при неудаче.
   * Не обрабатывает логику продления или повторов.
   */
  private async processInitialSubscriptionPayment(subscriptionId: string): Promise<boolean> {
    this.initializeServices()
    if (!this.payload || !this.paymentService) {
      this.logger.error('Сервисы не инициализированы в processInitialSubscriptionPayment')
      return false
    }
    try {
      const subscription = (await this.payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
        depth: 1, // Устанавливаем depth: 1 чтобы получить order.id
      })) as PayloadSubscription & {
        userId?: User | string // Добавляем userId
        order?: Order | string // Добавляем order
        paymentToken?: string | null
        amount?: number | null
        currency?: string | null
        paymentProvider?: PaymentProviderKey | null
      }

      if (!subscription) {
        this.logger.error(
          `Подписка ${subscriptionId} не найдена в processInitialSubscriptionPayment.`,
        )
        return false
      }

      if (!subscription.paymentToken) {
        this.logger.error(
          `Платежный токен отсутствует для подписки ${subscription.id}. Пропуск обработки платежа.`,
        )
        return false
      }
      if (typeof subscription.amount !== 'number' || !subscription.currency) {
        this.logger.error(
          `Отсутствует сумма или валюта для подписки ${subscription.id}. Пропуск обработки платежа.`,
        )
        return false
      }
      if (!subscription.paymentProvider) {
        this.logger.error(
          `Отсутствует платежный провайдер для подписки ${subscription.id}. Пропуск обработки платежа.`,
        )
        return false
      }

      const orderIdForPayment = subscription.order
        ? typeof subscription.order === 'string'
          ? subscription.order
          : subscription.order.id // Доступно, так как depth: 1
        : subscription.id

      if (!this.paymentService) {
        this.logger.error('PaymentService not initialized in processInitialSubscriptionPayment')
        return false
      }

      const paymentResult = await this.paymentService.processPayment(
        subscription.paymentToken,
        subscription.amount,
        subscription.currency as 'RUB' | 'USD' | 'EUR',
        orderIdForPayment,
        subscription.paymentProvider as PaymentProviderKey,
      )

      await this.recordPaymentHistory(subscription, paymentResult, orderIdForPayment)

      if (paymentResult.status === 'succeeded') {
        this.logger.info(`Первоначальный платеж для подписки ${subscriptionId} успешен.`)
        return true
      } else {
        return false
      }
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке платежа для подписки ${subscriptionId}:`, error)
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
      this.logger.error('Payload client не инициализирован в getSubscriptionPaymentHistory')
      throw new Error('Payload client не инициализирован')
    }
    try {
      const result = await this.payload.find({
        collection: 'subscription-payments',
        where: { subscriptionId: { equals: subscriptionId } },
        sort: '-paymentDate',
      })
      return result.docs as unknown as SubscriptionPaymentHistory[]
    } catch (error: any) {
      this.logger.error(`Ошибка при получении истории платежей подписки ${subscriptionId}:`, error)
      return []
    }
  }

  /**
   * Запись платежа в историю
   */
  private async recordPaymentHistory(
    subscription: any, // Subscription type might not have all fields like id, amount, currency, paymentMethod
    paymentResult: PaymentResult,
    orderId?: string, // Optional orderId for renewal orders
  ): Promise<void> {
    try {
      await this.payload.create({
        collection: 'subscription-payments',
        data: {
          subscriptionId: subscription.id,
          orderId: orderId, // Link to the specific renewal order if provided
          amount: subscription.amount,
          currency: subscription.currency as 'RUB' | 'USD' | 'EUR',
          status: paymentResult.status === 'succeeded' ? 'successful' : paymentResult.status,
          paymentDate: new Date().toISOString(),
          paymentMethod: subscription.paymentMethod,
          transactionId: paymentResult.paymentId,
          failureReason: paymentResult.errorMessage,
          rawResponse: paymentResult.rawResponse,
        } as any, // Cast to any to bypass potential type error for orderId
      })
    } catch (error: any) {
      this.logger.error(
        `Ошибка при записи истории платежей для подписки ${subscription.id}:`,
        error,
      )
    }
  }

  /**
   * Отправка уведомления об изменении статуса подписки
   */
  public async sendSubscriptionStatusNotification(
    subscription: PayloadSubscription,
    status: SubscriptionStatus,
  ): Promise<void> {
    this.initializeServices()
    if (!this.notificationService) {
      this.logger.error('NotificationService не инициализирован')
      return
    }

    const planId = typeof subscription.plan === 'string' ? subscription.plan : subscription.plan?.id
    const plan = planId ? await this.getSubscriptionPlan(planId) : null

    if (!plan) {
      this.logger.error(
        `Не удалось найти план подписки ${planId} для уведомления о статусе подписки ${subscription.id}`,
      )
      return
    }

    switch (status) {
      case 'active':
        await this.notificationService.sendSubscriptionActivated(subscription.id)
        break
      case 'paused':
        await this.notificationService.sendSubscriptionPaused(subscription.id)
        break
      case 'canceled':
        await this.notificationService.sendSubscriptionCancelled(subscription.id)
        break
      case 'expired':
        await this.notificationService.sendSubscriptionExpired(subscription.id)
        break
      case 'failed':
        await this.notificationService.sendSubscriptionPaymentFailed(subscription.id)
        break
      default:
        this.logger.warn(`Неизвестный статус подписки для уведомления: ${status}`)
    }
  }

  /**
   * Проверка и обработка всех подписок, требующих продления
   */
  async processRecurringPayments(): Promise<{ success: number; failed: number; errors: number }> {
    this.initializeServices()
    const now = new Date()
    const results = { success: 0, failed: 0, errors: 0 }

    if (!this.payload || !this.paymentService) {
      this.logger.error(
        'Payload client или PaymentService не инициализирован в processRecurringPayments',
      )
      results.errors++
      return results
    }

    try {
      const subscriptionsToProcessQuery = await this.payload.find({
        collection: 'subscriptions',
        where: {
          or: [
            {
              and: [
                { status: { equals: 'active' } },
                { nextPaymentDate: { less_than_equal: now.toISOString() } },
                { cancelAtPeriodEnd: { not_equals: true } },
              ],
            },
            {
              and: [
                { status: { equals: 'failed' } },
                { paymentRetryAttempt: { less_than: MAX_RETRIES } },
                { nextPaymentDate: { less_than_equal: now.toISOString() } },
              ],
            },
          ],
        },
        limit: 100,
        depth: 1,
      })

      // Определяем более точный тип для sub в цикле
      type ProcessableSubscription = PayloadSubscription & {
        user?: User | string | null // user может быть объектом User или ID (строка)
        plan?: SubscriptionPlan | string | null // plan может быть объектом SubscriptionPlan или ID (строка)
        paymentToken?: string | null
        amount?: number | null
        currency?: string | null
        paymentProvider?: PaymentProviderKey | null
        period?: SubscriptionPeriod | null // Добавляем period
        paymentRetryAttempt?: number | null
        lastPaymentAttemptFailed?: boolean | null
        nextPaymentDate?: string | null // Убедимся, что это поле есть
        // order?: Order | string // Если order используется, его тоже нужно типизировать
      }

      const subscriptionsToProcess = subscriptionsToProcessQuery.docs as ProcessableSubscription[]

      this.logger.info(
        `Найдено ${subscriptionsToProcess.length} подписок для обработки регулярных платежей...`,
      )

      for (const sub of subscriptionsToProcess) {
        try {
          this.logger.info(`Обработка регулярного платежа для подписки ${sub.id}`)

          // Исправляем доступ к ID пользователя и плана
          const currentUserId = typeof sub.user === 'string' ? sub.user : sub.user?.id
          const currentPlanId = typeof sub.plan === 'string' ? sub.plan : sub.plan?.id

          if (!currentUserId || !currentPlanId) {
            this.logger.error(
              `Не удалось получить ID пользователя или плана для подписки ${sub.id}. Пропуск.`,
            )
            results.errors++
            continue
          }

          // План может быть уже объектом (depth: 1) или ID
          const planObject =
            typeof sub.plan === 'object' && sub.plan !== null
              ? sub.plan
              : await this.getSubscriptionPlan(currentPlanId)

          if (
            !planObject ||
            !planObject.name ||
            typeof planObject.price !== 'number' ||
            !planObject.currency ||
            !planObject.period
          ) {
            this.logger.error(
              `План подписки ${currentPlanId} (или его критические поля name, price, currency, period) не найден для подписки ${sub.id}. Пропуск.`,
            )
            results.errors++
            await this.updateSubscription(sub.id, {
              status: 'failed',
              lastPaymentAttemptFailed: true,
            })
            continue
          }

          // Проверяем основные поля подписки, необходимые для платежа
          if (!sub.paymentToken) {
            this.logger.warn(
              `Отсутствует платежный токен для подписки ${sub.id}. Пропуск попытки платежа.`,
            )
            results.failed++
            const retryAttempt = (sub.paymentRetryAttempt || 0) + 1
            await this.updateSubscription(sub.id, {
              status: 'failed',
              paymentRetryAttempt: retryAttempt,
              lastPaymentAttemptFailed: true,
            })
            await this.recordPaymentHistory(sub as any, {
              // sub as any для recordPaymentHistory
              status: 'failed',
              errorMessage: 'Missing payment token for recurring payment.',
            })
            continue
          }
          // sub.amount, sub.currency, sub.paymentProvider должны быть доступны напрямую из PayloadSubscription
          // после добавления в коллекцию и перегенерации типов. Если нет, это проблема генерации.
          if (typeof sub.amount !== 'number' || !sub.currency || !sub.paymentProvider) {
            this.logger.error(
              `Отсутствует сумма (${sub.amount}), валюта (${sub.currency}) или провайдер (${sub.paymentProvider}) для подписки ${sub.id}. Пропуск.`,
            )
            results.errors++
            await this.updateSubscription(sub.id, {
              status: 'failed',
              lastPaymentAttemptFailed: true,
            })
            continue
          }

          const orderIdForPayment = sub.id

          const paymentResult = await this.paymentService.processPayment(
            sub.paymentToken, // Должно быть string
            sub.amount, // Должно быть number
            sub.currency as 'RUB' | 'USD' | 'EUR', // Должно быть string
            orderIdForPayment,
            sub.paymentProvider as PaymentProviderKey, // Должно быть PaymentProviderKey
          )

          if (paymentResult.status === 'succeeded') {
            this.logger.info(
              `Успешный платеж для подписки ${sub.id}. ID транзакции: ${paymentResult.paymentId}`,
            )
            let newOrderId: string | undefined = undefined

            try {
              const orderSubTotal = {
                en: { amount: 0, currency: 'USD' },
                ru: { amount: 0, currency: 'RUB' },
              }
              const orderTotal = { ...orderSubTotal }
              const primaryAmount = sub.amount // Должно быть number
              const primaryCurrency = sub.currency.toUpperCase() as 'USD' | 'EUR' | 'RUB' // Должно быть string

              if (primaryCurrency === 'USD') {
                orderSubTotal.en = { amount: primaryAmount, currency: 'USD' }
                orderTotal.en = { amount: primaryAmount, currency: 'USD' }
                orderSubTotal.ru = {
                  amount: primaryAmount * 75, // Approximate USD to RUB conversion
                  currency: 'RUB',
                }
                orderTotal.ru = { amount: primaryAmount * 75, currency: 'RUB' }
              } else if (primaryCurrency === 'RUB') {
                orderSubTotal.ru = { amount: primaryAmount, currency: 'RUB' }
                orderTotal.ru = { amount: primaryAmount, currency: 'RUB' }
                orderSubTotal.en = {
                  amount: primaryAmount / 75, // Approximate RUB to USD conversion
                  currency: 'USD',
                }
                orderTotal.en = { amount: primaryAmount / 75, currency: 'USD' }
              } else if (primaryCurrency === 'EUR') {
                orderSubTotal.en = { amount: primaryAmount, currency: 'EUR' }
                orderTotal.en = { amount: primaryAmount, currency: 'EUR' }
                orderSubTotal.ru = {
                  amount: primaryAmount * 85, // Approximate EUR to RUB conversion
                  currency: 'RUB',
                }
                orderTotal.ru = {
                  amount: primaryAmount * 85,
                  currency: 'RUB',
                }
              } else {
                orderSubTotal.en = {
                  amount: primaryAmount,
                  currency: primaryCurrency as 'RUB' | 'USD' | 'EUR',
                } // Cast to avoid error
                orderTotal.en = {
                  amount: primaryAmount,
                  currency: primaryCurrency as 'RUB' | 'USD' | 'EUR',
                } // Cast to avoid error
                this.logger.warn(
                  `[SubscriptionService] Unexpected primary currency '${primaryCurrency}' for sub ${sub.id}. Only RU total calculated if applicable.`,
                )
              }

              let renewalProductId: string | undefined = undefined
              let renewalProductName = `Renewal for ${planObject.name}`
              try {
                const renewalProduct = await this.payload.find({
                  collection: 'products',
                  where: {
                    slug: {
                      equals: SUBSCRIPTION_RENEWAL_PRODUCT_SLUG,
                    },
                  },
                  limit: 1,
                })
                if (renewalProduct.docs?.length > 0 && renewalProduct.docs[0]) {
                  renewalProductId = renewalProduct.docs[0].id
                  renewalProductName =
                    (renewalProduct.docs[0].title as string) || renewalProductName
                }
              } catch (productError) {
                this.logger.error(
                  `Ошибка при поиске продукта для продления '${SUBSCRIPTION_RENEWAL_PRODUCT_SLUG}':`,
                  productError,
                )
              }

              const newOrderData: Partial<Order> = {
                customer: currentUserId,
                orderType: 'subscription',
                status: 'completed',
                items: [
                  {
                    product: renewalProductId,
                    quantity: 1,
                    price: sub.amount, // Должно быть number
                  },
                ],
                renewalForSubscription: sub.id,
                subtotal: orderSubTotal,
                total: orderTotal,
                paidAt: now.toISOString(),
                paymentId: paymentResult.paymentId,
                paymentProvider: sub.paymentProvider as 'yoomoney' | 'robokassa' | 'crypto', // Должно быть PaymentProviderKey
                orderNumber: `SUB-REN-${sub.id.slice(-6)}-${Date.now()}`,
              }

              const newOrder = await this.payload.create({
                collection: 'orders',
                data: newOrderData as any, // Use type assertion carefully
              })
              newOrderId = newOrder.id
              this.logger.info(`Создан заказ на продление ${newOrderId} для подписки ${sub.id}`)
            } catch (orderError: any) {
              this.logger.error(
                `Критическая ошибка: Не удалось создать заказ на продление для успешной подписки ${sub.id}. Ошибка: ${orderError?.message || String(orderError)}`,
              )
              results.errors++
            }

            // Используем period из объекта плана, который мы получили ранее
            const nextPaymentDate = this.calculateNextPaymentDate(
              now,
              planObject.period as SubscriptionPeriod, // planObject.period должен быть SubscriptionPeriod
            )
            await this.updateSubscription(sub.id, {
              status: 'active',
              nextPaymentDate: nextPaymentDate.toISOString(),
              paymentRetryAttempt: 0,
              lastPaymentDate: now.toISOString(),
              lastPaymentAttemptFailed: false,
            })

            await this.recordPaymentHistory(sub as any, paymentResult, newOrderId) // sub as any для recordPaymentHistory

            if (this.notificationService) {
              this.logger.info(
                `Placeholder: Уведомление об успешном продлении для подписки ${sub.id} (нужен метод sendSubscriptionRenewed)`,
              )
            }
            results.success++
          } else {
            this.logger.warn(
              `Payment failed for subscription ${sub.id}: ${paymentResult.errorMessage}`,
            )
            const newPaymentRetryAttempt = (sub.paymentRetryAttempt || 0) + 1
            let nextRetryDate: Date | null = null
            let retryDelayHours = 0

            if (newPaymentRetryAttempt <= MAX_RETRIES) {
              switch (newPaymentRetryAttempt) {
                case 1:
                  retryDelayHours = 24
                  break
                case 2:
                  retryDelayHours = 48
                  break
                case 3:
                  retryDelayHours = 72
                  break
              }
              nextRetryDate = new Date(now.getTime() + retryDelayHours * 60 * 60 * 1000)

              await this.updateSubscription(sub.id, {
                status: 'failed',
                nextPaymentDate: nextRetryDate.toISOString(),
                paymentRetryAttempt: newPaymentRetryAttempt,
                lastPaymentAttemptFailed: true,
              })
              this.logger.info(
                `Subscription ${sub.id} marked as 'failed'. Next retry attempt scheduled for: ${nextRetryDate.toISOString()}. Attempt ${newPaymentRetryAttempt}/${MAX_RETRIES}.`,
              )

              if (this.notificationService) {
                type DunningPayload = PayloadSubscription & {
                  user: User | string
                  plan: SubscriptionPlan | string
                  paymentRetryAttempts?: number | null
                }
                // Убираем MAX_RETRIES из вызова (еще раз)
                await this.sendDunningNotification(
                  sub as unknown as DunningPayload, // Используем unknown для приведения
                  newPaymentRetryAttempt,
                  // MAX_RETRIES, // Убрано
                  nextRetryDate,
                )
              } else {
                this.logger.warn(
                  `NotificationService not initialized for dunning notification sub ${sub.id}`,
                )
              }
            } else {
              await this.updateSubscription(sub.id, {
                status: 'canceled',
                endDate: now.toISOString(),
                paymentRetryAttempt: newPaymentRetryAttempt,
                lastPaymentAttemptFailed: true,
              })
              this.logger.info(
                `Subscription ${sub.id} canceled after ${MAX_RETRIES} failed payment retry attempts.`,
              )

              if (this.notificationService) {
                await this.notificationService.sendSubscriptionPaymentFailed(sub.id)
              }
            }
            await this.recordPaymentHistory(sub as any, paymentResult) // sub as any для recordPaymentHistory
            results.failed++
          }
        } catch (error: any) {
          this.logger.error(
            `Ошибка при обработке отдельной подписки ${sub?.id || 'UNKNOWN'}: ${error.message}`,
            error,
          )
          results.errors++
          if (sub?.id) {
            try {
              await this.updateSubscription(sub.id, {
                status: 'failed',
                lastPaymentAttemptFailed: true,
              })
            } catch (updateError) {
              this.logger.error(
                `Не удалось обновить статус подписки ${sub.id} на failed после ошибки:`,
                updateError,
              )
            }
          }
        }
      }

      this.logger.info(
        `Обработка регулярных платежей завершена. Успешно: ${results.success}, Неудачно (вкл. повторы): ${results.failed}, Ошибки: ${results.errors}`,
      )
      return results
    } catch (error: any) {
      this.logger.error('Критическая ошибка в processRecurringPayments:', error)
      results.errors++
      return results
    }
  }

  /**
   * Отправка Dunning уведомления (неудачная попытка оплаты)
   */
  public async sendDunningNotification(
    subscription: PayloadSubscription & {
      user: User | string
      plan: SubscriptionPlan | string
      paymentRetryAttempts?: number | null
    },
    attempt: number,
    nextRetryDate: Date,
  ): Promise<void> {
    this.initializeServices()
    if (!this.notificationService) {
      this.logger.error('NotificationService не инициализирован для dunning')
      return
    }

    const userId = typeof subscription.user === 'string' ? subscription.user : subscription.user?.id
    const planId = typeof subscription.plan === 'string' ? subscription.plan : subscription.plan?.id
    const plan = planId ? await this.getSubscriptionPlan(planId) : null

    if (!userId) {
      this.logger.error(
        `Не удалось получить ID пользователя для dunning уведомления подписки ${subscription.id}`,
      )
      return
    }

    try {
      this.logger.info(
        `Placeholder: Отправка Dunning уведомления (попытка ${attempt}) для подписки ${subscription.id}. Используем sendSubscriptionPaymentFailed. Нужны метаданные.`,
      )
      await this.notificationService.sendSubscriptionPaymentFailed(subscription.id)
    } catch (error) {
      this.logger.error(
        `Ошибка при отправке dunning уведомления для подписки ${subscription.id}:`,
        error,
      )
    }
  }

  /**
   * Handles the logic for when a subscription's plan is changed (upgraded/downgraded).
   * Assumes the change takes effect at the next billing cycle. Proration is conceptual.
   */
  public async handleSubscriptionPlanChange(
    subscription: AppSubscription,
    previousPlanId: string,
    newPlanId: string,
  ): Promise<void> {
    this.initializeServices()
    if (!this.payload || !this.notificationService) {
      this.logger.error(
        'Payload client или NotificationService не инициализирован в handleSubscriptionPlanChange',
      )
      return
    }

    const previousPlan = await this.getSubscriptionPlan(previousPlanId)
    const newPlan = await this.getSubscriptionPlan(newPlanId)

    if (!previousPlan || !newPlan) {
      this.logger.error(
        `Не удалось найти старый (${previousPlanId}) или новый (${newPlanId}) план.`,
      )
      return
    }

    // TODO: Логика перерасчета или немедленного списания, если требуется
    // Например, если новый план дороже, можно создать заказ на разницу
    // или просто изменить детали подписки для следующего списания.

    // Тип UpdateSubscriptionParams теперь включает plan, каст не нужен
    const updatedSubscription = await this.updateSubscription(subscription.id, {
      plan: newPlanId, // Передаем ID нового плана в поле plan
    })

    if (updatedSubscription) {
      this.logger.info(
        `Подписка ${subscription.id} успешно изменена с плана ${previousPlan.name} на ${newPlan.name}`,
      )
      // await this.notificationService.sendSubscriptionPlanChanged(
      //   subscription.id,
      //   previousPlan.name,
      //   newPlan.name,
      // )
    } else {
      this.logger.error(`Ошибка при обновлении подписки ${subscription.id} для смены плана.`)
    }
  }

  // Вспомогательные методы

  /**
   * Расчет даты следующего платежа
   */
  private calculateNextPaymentDate(startDate: Date, period: string): Date {
    const date = new Date(startDate)
    switch (period) {
      case 'daily':
        date.setDate(date.getDate() + 1)
        break
      case 'weekly':
        date.setDate(date.getDate() + 7)
        break
      case 'monthly':
        date.setMonth(date.getMonth() + 1)
        break
      case 'quarterly':
        date.setMonth(date.getMonth() + 3)
        break
      case 'yearly':
      case 'annual': // Treat 'annual' same as 'yearly'
        date.setFullYear(date.getFullYear() + 1)
        break
      default:
        this.logger.error(`Неподдерживаемый период подписки: ${period} в calculateNextPaymentDate`)
        throw new Error(`Неподдерживаемый период подписки: ${period}`)
    }
    return date
  }

  /**
   * Проверяет наличие активных подписок у пользователя
   */
  private async hasActiveSubscription(
    userId: string,
    planId: string | { id: string },
  ): Promise<boolean> {
    const currentPlanId = typeof planId === 'string' ? planId : planId.id
    // Используем unknown для приведения, т.к. AppSubscription и PayloadSubscription могут расходиться
    const activeSubscriptions = (await this.getUserActiveSubscriptions(
      userId,
    )) as unknown as PayloadSubscription[]
    return activeSubscriptions.some((sub) => {
      const subPlanId = typeof sub.plan === 'string' ? sub.plan : (sub.plan as { id: string })?.id
      return subPlanId === currentPlanId
    })
  }

  /**
   * Обновление подписки
   */
  async updateSubscription(
    subscriptionId: string,
    params: UpdateSubscriptionParams,
  ): Promise<PayloadSubscription | null> {
    if (!this.payload) {
      this.logger.error('Payload client не инициализирован в updateSubscription')
      throw new Error('Payload client не инициализирован')
    }

    try {
      const updatedSubscription = await this.payload.update({
        collection: 'subscriptions',
        id: subscriptionId,
        data: {
          ...params,
        },
      })

      return updatedSubscription as PayloadSubscription
    } catch (error: any) {
      this.logger.error(`Ошибка при обновлении подписки ${subscriptionId}:`, error)
      return null
    }
  }

  /**
   * Отмена подписки
   */
  async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<boolean> {
    if (!this.payload) {
      this.logger.error('Payload client не инициализирован в cancelSubscription')
      throw new Error('Payload client не инициализирован')
    }
    try {
      const subscription = await this.payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
        depth: 0,
      })
      if (!subscription) throw new Error(`Подписка ${subscriptionId} не найдена`)

      if (subscription.status === 'canceled') {
        this.logger.warn(`Подписка ${subscriptionId} уже отменена.`)
        return true
      }

      const updateData: UpdateSubscriptionParams = {
        status: 'canceled',
      }
      if (immediate) {
        updateData.endDate = new Date().toISOString()
      }

      await this.updateSubscription(subscriptionId, updateData)
      return true
    } catch (error: any) {
      this.logger.error(`Ошибка при отмене подписки ${subscriptionId}:`, error)
      return false
    }
  }

  /**
   * Приостановка подписки
   */
  async pauseSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.payload) {
      this.logger.error('Payload client не инициализирован в pauseSubscription')
      throw new Error('Payload client не инициализирован')
    }
    try {
      const subscription = await this.payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
        depth: 1, // Устанавливаем depth: 1 чтобы получить plan.period
      })
      if (!subscription) throw new Error(`Подписка ${subscriptionId} не найдена`)
      if (subscription.status !== 'active') {
        throw new Error(`Нельзя приостановить подписку в статусе ${subscription.status}`)
      }

      // Проверяем наличие plan и period на нем
      if (typeof subscription.plan === 'string' || !subscription.plan?.period) {
        this.logger.error(
          `Не найден план или период в плане для подписки ${subscriptionId} (depth: 1).`,
        )
        throw new Error(`Не найден период для подписки ${subscriptionId}`)
      }

      const nextPaymentDate = this.calculateNextPaymentDate(
        new Date(),
        subscription.plan.period as SubscriptionPeriod, // Используем period из связанного плана
      )
      await this.updateSubscription(subscriptionId, {
        status: 'paused',
        nextPaymentDate: nextPaymentDate.toISOString(),
      })
      return true
    } catch (error: any) {
      this.logger.error(`Ошибка при приостановке подписки ${subscriptionId}:`, error)
      return false
    }
  }

  /**
   * Возобновление подписки
   */
  async resumeSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.payload) {
      this.logger.error('Payload client не инициализирован в resumeSubscription')
      throw new Error('Payload client не инициализирован')
    }
    try {
      const subscription = await this.payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
        depth: 1, // Устанавливаем depth: 1 чтобы получить plan.period
      })
      if (!subscription) throw new Error(`Подписка ${subscriptionId} не найдена`)
      if (subscription.status !== 'paused') {
        throw new Error(`Нельзя возобновить подписку в статусе ${subscription.status}`)
      }

      // Проверяем наличие plan и period на нем
      if (typeof subscription.plan === 'string' || !subscription.plan?.period) {
        this.logger.error(
          `Не найден план или период в плане для подписки ${subscriptionId} (depth: 1).`,
        )
        throw new Error(`Не найден период для подписки ${subscriptionId}`)
      }

      const nextPaymentDate = this.calculateNextPaymentDate(
        new Date(),
        subscription.plan.period as SubscriptionPeriod, // Используем period из связанного плана
      )
      await this.updateSubscription(subscriptionId, {
        status: 'active',
        nextPaymentDate: nextPaymentDate.toISOString(),
      })
      return true
    } catch (error: any) {
      this.logger.error(`Ошибка при возобновлении подписки ${subscriptionId}:`, error)
      return false
    }
  }
}
