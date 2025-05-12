import { Payload } from 'payload'
import { BaseService } from './base.service'
import { EmailService } from './email.service'
import { TelegramService } from './telegram.service'
import {
  Order,
  Subscription,
  User,
  SubscriptionPlan,
  Notification,
  // Setting, // Закомментировано, т.к. тип не найден
} from '../payload-types'
import type { Where } from 'payload'
// import { InitOptions } from 'payload/config' // Не используется
import { getPayload } from 'payload'

// Define notification categories type based on usage in checkUserNotificationPreferences
type NotificationCategory =
  | 'account'
  | 'courses'
  | 'achievements'
  | 'comments'
  | 'newsletter'
  | 'marketing'
  | 'billing_alerts'
  | 'subscription_updates'
  | 'order_updates'

export class NotificationService extends BaseService {
  private static instance: NotificationService | null = null
  private emailService: EmailService | null = null
  private telegramService: TelegramService | null = null

  private constructor(payload: Payload) {
    super(payload)
    this.emailService = EmailService.getInstance(payload)
    this.telegramService = TelegramService.getInstance(payload)
  }

  public static getInstance(payload: Payload): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(payload)
    }
    return NotificationService.instance
  }

  // --- Helper to get common subscription data ---
  private async getSubscriptionContext(subscriptionId: string): Promise<{
    subscription: Subscription | null
    user: User | null
    plan: SubscriptionPlan | null
  }> {
    try {
      const subscription = (await this.payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
        depth: 2, // Depth to populate user and plan
      })) as unknown as Subscription

      if (!subscription) return { subscription: null, user: null, plan: null }

      // Type assertions assuming depth=2 works as expected
      const user =
        typeof subscription.userId === 'object' && subscription.userId !== null
          ? (subscription.userId as User)
          : null
      const plan =
        typeof subscription.planId === 'object' && subscription.planId !== null
          ? (subscription.planId as SubscriptionPlan)
          : null

      // Fetch user separately if only ID is present (shouldn't happen with depth=2 but as fallback)
      if (!user && typeof subscription.userId === 'string') {
        console.warn(`User object not populated for subscription ${subscriptionId} despite depth=2`)
      }
      // Fetch plan separately if only ID is present
      if (!plan && typeof subscription.planId === 'string') {
        console.warn(`Plan object not populated for subscription ${subscriptionId} despite depth=2`)
      }

      return { subscription, user, plan }
    } catch (error) {
      console.error(`Error fetching context for subscription ${subscriptionId}:`, error)
      return { subscription: null, user: null, plan: null }
    }
  }

  // --- Subscription Specific Notifications ---

  async sendSubscriptionActivated(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan || !user.email) {
      console.error(`Missing data for sendSubscriptionActivated: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email

    try {
      const preferences = await this.checkUserNotificationPreferences(
        user.id,
        'subscription_updates',
      )

      if (preferences.allowInApp) {
        await this.payload.create<'notifications', any>({
          collection: 'notifications',
          data: {
            user: user.id,
            title: 'Subscription Activated',
            message: `Your subscription to ${plan.name} is now active.`,
            type: 'subscription_activated' as any,
            isRead: false,
            metadata: {
              subscriptionId: subscription.id,
              planId: plan.id,
              planName: plan.name,
            },
          },
        })
      }

      if (this.emailService && preferences.allowEmail) {
        /* TODO: Implement EmailService.sendSubscriptionActivatedEmail
        await this.emailService.sendSubscriptionActivatedEmail({
          userName,
          email: user.email,
          planName: plan.name,
          startDate: subscription.startDate as string,
          nextPaymentDate: subscription.nextPaymentDate as string,
          locale: userLocale,
        });
        */
        console.log(`Placeholder: Sending Subscription Activated Email to ${user.email}`)
      }

      return true
    } catch (error) {
      console.error(
        `Failed to send subscription activated notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionCancelled(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan || !user.email) {
      console.error(`Missing data for sendSubscriptionCancelled: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email

    try {
      const preferences = await this.checkUserNotificationPreferences(
        user.id,
        'subscription_updates',
      )

      if (preferences.allowInApp) {
        await this.payload.create<'notifications', any>({
          collection: 'notifications',
          data: {
            user: user.id,
            title: 'Subscription Cancelled',
            message: `Your subscription to ${plan.name} has been cancelled.`,
            type: 'subscription_cancelled' as any,
            isRead: false,
            metadata: {
              subscriptionId: subscription.id,
              planId: plan.id,
              planName: plan.name,
            },
          },
        })
      }

      if (this.emailService && preferences.allowEmail) {
        /* TODO: Implement EmailService.sendSubscriptionCancelledEmail
        await this.emailService.sendSubscriptionCancelledEmail({
          userName,
          email: user.email,
          planName: plan.name,
          endDate: subscription.endDate || subscription.canceledAt as string,
          locale: userLocale,
        });
         */
        console.log(`Placeholder: Sending Subscription Cancelled Email to ${user.email}`)
      }

      return true
    } catch (error) {
      console.error(
        `Failed to send subscription cancelled notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionPaymentFailed(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan || !user.email) {
      console.error(`Missing data for sendSubscriptionPaymentFailed: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email

    try {
      const preferences = await this.checkUserNotificationPreferences(user.id, 'billing_alerts') // Different category?

      if (preferences.allowInApp) {
        await this.payload.create<'notifications', any>({
          collection: 'notifications',
          data: {
            user: user.id,
            title: 'Subscription Payment Failed',
            message: `We couldn't process the payment for your ${plan.name} subscription. Please update your payment method.`,
            type: 'subscription_payment_failed' as any,
            isRead: false,
            metadata: {
              subscriptionId: subscription.id,
              planId: plan.id,
              planName: plan.name,
              nextPaymentAttempt: subscription.nextPaymentDate, // Or specific retry date?
            },
          },
        })
      }

      if (this.emailService && preferences.allowEmail) {
        /* TODO: Implement EmailService.sendSubscriptionPaymentFailedEmail
        await this.emailService.sendSubscriptionPaymentFailedEmail({
          userName,
          email: user.email,
          planName: plan.name,
          nextPaymentDate: subscription.nextPaymentDate as string,
          amount: subscription.amount,
          currency: subscription.currency,
          locale: userLocale,
        });
         */
        console.log(`Placeholder: Sending Subscription Payment Failed Email to ${user.email}`)
      }

      return true
    } catch (error) {
      console.error(
        `Failed to send subscription payment failed notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionPlanChanged(subscriptionId: string, oldPlanName: string): Promise<boolean> {
    const { subscription, user, plan: newPlan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !newPlan || !user.email) {
      console.error(`Missing data for sendSubscriptionPlanChanged: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email

    try {
      const preferences = await this.checkUserNotificationPreferences(
        user.id,
        'subscription_updates',
      )

      if (preferences.allowInApp) {
        await this.payload.create<'notifications', any>({
          collection: 'notifications',
          data: {
            user: user.id,
            title: 'Subscription Plan Changed',
            message: `Your subscription plan has been changed from ${oldPlanName} to ${newPlan.name}.`,
            type: 'subscription_plan_changed' as any,
            isRead: false,
            metadata: {
              subscriptionId: subscription.id,
              oldPlanName: oldPlanName,
              newPlanId: newPlan.id,
              newPlanName: newPlan.name,
            },
          },
        })
      }

      if (this.emailService && preferences.allowEmail) {
        /* TODO: Implement EmailService.sendSubscriptionPlanChangedEmail
        await this.emailService.sendSubscriptionPlanChangedEmail({
          userName,
          email: user.email,
          oldPlanName: oldPlanName,
          newPlanName: newPlan.name,
          effectiveDate: new Date().toISOString(), // Or specific date
          locale: userLocale,
        });
         */
        console.log(`Placeholder: Sending Subscription Plan Changed Email to ${user.email}`)
      }

      return true
    } catch (error) {
      console.error(
        `Failed to send subscription plan changed notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionPaused(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan || !user.email) {
      console.error(`Missing data for sendSubscriptionPaused: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email

    try {
      const preferences = await this.checkUserNotificationPreferences(
        user.id,
        'subscription_updates',
      )

      if (preferences.allowInApp) {
        await this.payload.create<'notifications', any>({
          collection: 'notifications',
          data: {
            user: user.id,
            title: 'Subscription Paused',
            message: `Your subscription to ${plan.name} has been paused.`,
            type: 'subscription_paused' as any,
            isRead: false,
            metadata: {
              subscriptionId: subscription.id,
              planId: plan.id,
              planName: plan.name,
            },
          },
        })
      }

      if (this.emailService && preferences.allowEmail) {
        /* TODO: Implement EmailService.sendSubscriptionPausedEmail
        await this.emailService.sendSubscriptionPausedEmail({
          userName,
          email: user.email,
          planName: plan.name,
          pausedAt: subscription.pausedAt as string,
          locale: userLocale,
        });
         */
        console.log(`Placeholder: Sending Subscription Paused Email to ${user.email}`)
      }

      return true
    } catch (error) {
      console.error(`Failed to send subscription paused notification for ${subscriptionId}:`, error)
      return false
    }
  }

  async sendSubscriptionResumed(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan || !user.email) {
      console.error(`Missing data for sendSubscriptionResumed: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email

    try {
      const preferences = await this.checkUserNotificationPreferences(
        user.id,
        'subscription_updates',
      )

      if (preferences.allowInApp) {
        await this.payload.create<'notifications', any>({
          collection: 'notifications',
          data: {
            user: user.id,
            title: 'Subscription Resumed',
            message: `Your subscription to ${plan.name} has been resumed and is now active.`,
            type: 'subscription_resumed' as any,
            isRead: false,
            metadata: {
              subscriptionId: subscription.id,
              planId: plan.id,
              planName: plan.name,
              nextPaymentDate: subscription.nextPaymentDate,
            },
          },
        })
      }

      if (this.emailService && preferences.allowEmail) {
        /* TODO: Implement EmailService.sendSubscriptionResumedEmail
        await this.emailService.sendSubscriptionResumedEmail({
          userName,
          email: user.email,
          planName: plan.name,
          resumedAt: new Date().toISOString(), // Or specific date
          nextPaymentDate: subscription.nextPaymentDate as string,
          locale: userLocale,
        });
         */
        console.log(`Placeholder: Sending Subscription Resumed Email to ${user.email}`)
      }

      return true
    } catch (error) {
      console.error(
        `Failed to send subscription resumed notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionExpired(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan || !user.email) {
      console.error(`Missing data for sendSubscriptionExpired: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email

    try {
      const preferences = await this.checkUserNotificationPreferences(
        user.id,
        'subscription_updates',
      )

      if (preferences.allowInApp) {
        await this.payload.create<'notifications', any>({
          collection: 'notifications',
          data: {
            user: user.id,
            title: 'Subscription Expired',
            message: `Your subscription to ${plan.name} has expired.`,
            type: 'subscription_expired' as any,
            isRead: false,
            metadata: {
              subscriptionId: subscription.id,
              planId: plan.id,
              planName: plan.name,
            },
          },
        })
      }

      if (this.emailService && preferences.allowEmail) {
        /* TODO: Implement EmailService.sendSubscriptionExpiredEmail
        await this.emailService.sendSubscriptionExpiredEmail({
          userName,
          email: user.email,
          planName: plan.name,
          expiredAt: subscription.endDate || new Date().toISOString() as string,
          locale: userLocale,
        });
         */
        console.log(`Placeholder: Sending Subscription Expired Email to ${user.email}`)
      }

      return true
    } catch (error) {
      console.error(
        `Failed to send subscription expired notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendPaymentConfirmation(orderData: {
    orderId: string
    orderNumber: string
    customerEmail: string
    total: number
    currency: string
    items?: Array<{
      product: string
      quantity: number
      price: number
      name?: string
      type?: 'course' | 'product' | 'subscription' | 'other'
    }>
    paymentMethod?: string
    paymentId?: string
    locale?: string
  }): Promise<boolean> {
    try {
      // 1. Get user details and correct locale
      let userName = ''
      let userEmail = orderData.customerEmail
      let userLocale = orderData.locale || 'ru'
      let userId = null
      let order: any | null = null

      try {
        // Fetch order with user relationship populated
        order = await this.payload.findByID({
          collection: 'orders',
          id: orderData.orderId,
          depth: 1, // Include user data
        })

        // TEMPORARY: Access userId with potential type issues
        const orderUserIdField = order?.userId

        if (orderUserIdField && typeof orderUserIdField === 'object' && orderUserIdField.id) {
          const orderUser = orderUserIdField as User
          userName = orderUser.name || ''
          userEmail = orderUser.email || orderData.customerEmail
          userLocale = orderUser.locale || userLocale
          userId = orderUser.id
        } else if (orderUserIdField && typeof orderUserIdField === 'string') {
          userId = orderUserIdField
          console.warn(`User object not populated for order ${orderData.orderId} despite depth=1`)
          // Fetch user details separately if needed beyond preferences
          try {
            const tempUser = await this.payload.findByID({ collection: 'users', id: userId })
            if (tempUser && tempUser.locale) userLocale = tempUser.locale
            if (tempUser && tempUser.email) userEmail = tempUser.email
          } catch (userFetchErr) {
            console.error(`Could not fetch user ${userId} details:`, userFetchErr)
          }
        }
      } catch (fetchError) {
        console.error('Error getting order/user details for payment confirmation:', fetchError)
      }

      // 2. Format order items
      const orderItems = (orderData.items || []).map((item) => ({
        name: item.name || 'Product',
        description: '',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        type: item.type || 'product',
        id: item.product,
      }))

      // 3. Check user notification preferences if we have a user ID
      let preferences = {
        allowInApp: true,
        allowEmail: true,
        allowPush: false,
      }

      if (userId) {
        try {
          preferences = await this.checkUserNotificationPreferences(userId, 'billing_alerts')
        } catch (prefError) {
          console.error(`Failed to get preferences for user ${userId}, using defaults:`, prefError)
        }

        // Create in-app notification for the user
        try {
          await this.payload.create<'notifications', any>({
            collection: 'notifications',
            data: {
              user: userId,
              title: 'Payment Confirmed',
              message: `Your payment for order #${orderData.orderNumber} has been confirmed.`,
              type: 'payment_confirmed' as any,
              isRead: false,
              metadata: {
                orderId: orderData.orderId,
                orderNumber: orderData.orderNumber,
                total: orderData.total,
                currency: orderData.currency,
              },
            },
          })
        } catch (inAppError) {
          console.error(
            `Failed to create in-app payment confirmation for user ${userId}:`,
            inAppError,
          )
        }
      }

      // 4. Send email using our template if allowed by user preferences
      if (this.emailService && preferences.allowEmail) {
        try {
          if (!userEmail) {
            console.error(
              `Cannot send payment confirmation email for order ${orderData.orderId}: User email unknown.`,
            )
          } else {
            await this.emailService.sendPaymentConfirmationEmail({
              userName: userName || userEmail,
              email: userEmail,
              orderNumber: orderData.orderNumber,
              paymentDate: new Date().toISOString(),
              paymentAmount: orderData.total,
              currency: orderData.currency,
              paymentMethod: orderData.paymentMethod,
              transactionId: orderData.paymentId,
              locale: userLocale,
              purchasedItems: orderItems.map((item) => ({
                name: item.name,
                type: item.type as 'course' | 'product' | 'subscription' | 'other',
                id: item.id,
              })),
            })
          }
        } catch (emailError) {
          console.error(`Failed to send payment confirmation email to ${userEmail}:`, emailError)
        }
      }

      // 5. Отправка уведомления в Telegram (для администраторов)
      if (this.telegramService) {
        try {
          await this.telegramService.sendMessage(
            `💰 Новый оплаченный заказ!\n` +
              `Номер заказа: ${orderData.orderNumber}\n` +
              `Сумма: ${orderData.total} ${orderData.currency}\n` +
              `Email клиента: ${userEmail || 'Неизвестен'}`,
          )
        } catch (telegramError) {
          console.error(`Failed to send Telegram payment confirmation:`, telegramError)
        }
      }

      return true
    } catch (error) {
      console.error('Overall failure in sendPaymentConfirmation:', error)
      return false
    }
  }

  async sendDigitalOrderStatusUpdate(orderData: {
    orderId: string
    status: string
    customerEmail?: string
    downloadLinks?: string[]
  }): Promise<boolean> {
    try {
      if (!orderData.orderId || !orderData.status) {
        console.error('Invalid order data for status update notification')
        return false
      }

      // Fetch order with potential user relationship
      const order: any | null = await this.payload.findByID({
        collection: 'orders',
        id: orderData.orderId,
        depth: 1, // Include user data
      })

      if (!order) {
        console.error(`Order not found: ${orderData.orderId}`)
        return false
      }

      // Get user info and locale
      let userId = null
      let userLocale = 'ru'
      let customerEmail = orderData.customerEmail // Start with fallback
      const orderUserIdField = order?.userId

      if (orderUserIdField && typeof orderUserIdField === 'object' && orderUserIdField.id) {
        const orderUser = orderUserIdField as User
        userId = orderUser.id
        userLocale = orderUser.locale || 'ru'
        customerEmail = orderUser.email || customerEmail // Prioritize user email
      } else if (orderUserIdField && typeof orderUserIdField === 'string') {
        userId = orderUserIdField
        console.warn(`User object not populated for order ${orderData.orderId} in status update`)
        // Fetch user details separately if needed
        try {
          const tempUser = await this.payload.findByID({ collection: 'users', id: userId })
          if (tempUser && tempUser.locale) userLocale = tempUser.locale
          if (tempUser && tempUser.email) customerEmail = tempUser.email
        } catch (userFetchErr) {
          console.error(`Could not fetch user ${userId} details:`, userFetchErr)
        }
      }

      if (!customerEmail && !userId) {
        console.error(
          `Cannot send status update for order ${order.id}: No user ID or customer email.`,
        )
        return false // Cannot notify anyone
      }

      // Check preferences
      let preferences = {
        allowInApp: true,
        allowEmail: true,
        allowPush: false,
      }
      if (userId) {
        try {
          preferences = await this.checkUserNotificationPreferences(userId, 'order_updates')
        } catch (prefError) {
          console.error(`Failed to get preferences for user ${userId}, using defaults:`, prefError)
        }
      }

      // Create in-app notification
      if (userId && preferences.allowInApp) {
        let title = 'Order Status Update'
        let message = `Your order #${order.orderNumber} status has been updated to ${orderData.status}`
        let notificationType: string = 'order_status' // Default type

        switch (orderData.status) {
          case 'ready_for_download':
            title = 'Download Ready'
            message = `Your digital products from order #${order.orderNumber} are ready for download.`
            notificationType = 'download_ready'
            break
          case 'completed':
            title = 'Order Completed'
            message = `Your order #${order.orderNumber} has been completed.`
            notificationType = 'order_completed'
            break
        }

        try {
          await this.payload.create<'notifications', any>({
            collection: 'notifications',
            data: {
              user: userId,
              title,
              message,
              type: notificationType as any,
              isRead: false,
              metadata: {
                orderId: orderData.orderId,
                orderNumber: order.orderNumber,
                status: orderData.status,
              },
            },
          })
        } catch (inAppError) {
          console.error(
            `Failed to create in-app status update for user ${userId}, order ${order.id}:`,
            inAppError,
          )
        }
      }

      // Send email notification
      if (preferences.allowEmail && customerEmail) {
        try {
          let templateSlug: string | null = null
          const templateContext: Record<string, any> = {
            orderNumber: order.orderNumber,
          }

          switch (orderData.status) {
            case 'ready_for_download':
              templateSlug = 'digital_product_ready'
              templateContext.downloadLinks = orderData.downloadLinks || []
              templateContext.products =
                order.items?.map((item: any) =>
                  typeof item.product === 'object' ? item.product.title : 'Item',
                ) || []
              break
            case 'completed':
              templateSlug = 'order_completed'
              templateContext.products =
                order.items?.map((item: any) =>
                  typeof item.product === 'object' ? item.product.title : 'Item',
                ) || []
              break
          }

          if (templateSlug && this.emailService) {
            await this.emailService.sendTemplateEmail(
              templateSlug,
              customerEmail,
              templateContext,
              { locale: userLocale },
            )
          } else {
            if (
              templateSlug === null &&
              (orderData.status === 'ready_for_download' || orderData.status === 'completed')
            ) {
              console.warn(`No email template defined for order status: ${orderData.status}`)
            }
          }
        } catch (emailError) {
          console.error(
            `Failed to send status update email to ${customerEmail} for order ${order.id}:`,
            emailError,
          )
        }
      }

      return true // Log errors, but return true if process attempted
    } catch (error) {
      console.error('Overall failure in sendDigitalOrderStatusUpdate:', error)
      return false
    }
  }

  async sendAbandonedCartReminder(cartData: {
    user: any
    items: any[]
    total: number
    currency: string
    lastUpdated: Date
  }): Promise<void> {
    try {
      const { user, items, total, currency, lastUpdated } = cartData

      // Закомментировано из-за проблем с типом Setting/GlobalSlug
      // const settings = await this.payload.findGlobal<'settings', any>({
      //   slug: 'settings',
      // })
      //
      // if (!settings?.notificationSettings?.email?.enableAbandonedCartReminders) {
      //   return
      // }

      // Check user notification preferences
      const preferences = await this.checkUserNotificationPreferences(user.id, 'marketing')

      const templateData = {
        userName: user.name || user.email,
        items: items.map((item) => ({
          title: item.product.title,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
        currency,
        lastUpdated: lastUpdated.toLocaleDateString(),
        cartUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
      }

      await this.payload.create<'notifications', any>({
        collection: 'notifications',
        data: {
          user: user.id,
          type: 'abandoned_cart' as any,
          title: 'Items waiting in your cart',
          message: `You have ${items.length} item(s) in your cart. Complete your purchase before they're gone!`,
          metadata: templateData,
          isRead: false,
        },
      })

      // Send email notification if allowed by user preferences
      if (this.emailService && preferences.allowEmail && user.email) {
        await this.emailService
          .sendTemplateEmail('abandoned-cart', user.email, templateData, {
            locale: user.locale || 'ru',
          })
          .catch((err) => {
            console.error('Failed to send abandoned cart email:', err)
          })
      }
    } catch (error) {
      console.error('Failed to send abandoned cart reminder:', error)
      // Не пробрасываем ошибку, чтобы не прерывать другие процессы
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.payload.update<'notifications', any>({
        collection: 'notifications',
        id: notificationId,
        data: {
          isRead: true,
        },
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  async getUserNotifications(userId: string, options = {}): Promise<any> {
    return this.payload.find({
      collection: 'notifications',
      where: {
        user: {
          equals: userId,
        },
      },
      sort: '-createdAt',
      ...options,
    })
  }

  /**
   * Проверяет настройки уведомлений пользователя
   * @param userId ID пользователя
   * @param notificationType Тип уведомления
   * @returns Объект с флагами, указывающими, какие типы уведомлений разрешены
   */
  async checkUserNotificationPreferences(
    userId: string,
    notificationType: NotificationCategory | string,
  ): Promise<{
    allowInApp: boolean
    allowEmail: boolean
    allowPush: boolean
  }> {
    try {
      const user = await this.payload.findByID({
        collection: 'users',
        id: userId,
      })

      const defaults = {
        allowInApp: true,
        allowEmail: true,
        allowPush: false,
      }

      // Use updated User type for checks
      // TODO: Still verify these fields exist on the User type from payload-types.ts
      const emailPrefs = user?.emailNotifications as Record<string, boolean> | undefined
      const pushPrefs = user?.pushNotifications as Record<string, boolean> | undefined
      const frequency = user?.notificationFrequency

      if (frequency === 'never') {
        return {
          allowInApp: true,
          allowEmail: false,
          allowPush: false,
        }
      }

      let category: NotificationCategory = 'account' // Default
      if (['course_completed', 'lesson_completed', 'course_enrolled'].includes(notificationType)) {
        category = 'courses'
      } else if (['achievement', 'level_up'].includes(notificationType)) {
        category = 'achievements'
      } else if (['comment_reply', 'comment_mention'].includes(notificationType)) {
        category = 'comments'
      } else if (['newsletter', 'broadcast'].includes(notificationType)) {
        category = 'newsletter'
      } else if (['promo', 'discount', 'marketing', 'abandoned_cart'].includes(notificationType)) {
        category = 'marketing'
      } else if (['billing_alerts', 'subscription_payment_failed'].includes(notificationType)) {
        category = 'billing_alerts'
      } else if (
        [
          'subscription_updates',
          'subscription_activated',
          'subscription_cancelled',
          'subscription_plan_changed',
          'subscription_paused',
          'subscription_resumed',
          'subscription_expired',
        ].includes(notificationType)
      ) {
        category = 'subscription_updates'
      } else if (
        [
          'order_updates',
          'payment_confirmed',
          'download_ready',
          'order_completed',
          'order_status',
        ].includes(notificationType)
      ) {
        category = 'order_updates'
      }

      // Access prefs safely using the determined category
      const allowEmail = emailPrefs?.[category] ?? defaults.allowEmail
      const allowPush = pushPrefs?.[category] ?? defaults.allowPush

      return {
        allowInApp: true,
        allowEmail,
        allowPush,
      }
    } catch (error) {
      console.error('Error checking user notification preferences:', error)
      return {
        allowInApp: true,
        allowEmail: true,
        allowPush: false,
      }
    }
  }

  /**
   * Отправляет уведомление пользователю
   * @param data Данные уведомления
   */
  async sendNotification(data: {
    userId: string
    title: string
    message: string
    type: string
    link?: string
    metadata?: Record<string, any>
  }): Promise<any> {
    try {
      // Use defined category type
      const preferences = await this.checkUserNotificationPreferences(
        data.userId,
        data.type as NotificationCategory,
      )

      // Create in-app notification (always)
      const notification = await this.payload.create<'notifications', any>({
        collection: 'notifications',
        data: {
          user: data.userId,
          title: data.title,
          message: data.message,
          type: data.type as any,
          isRead: false,
          link: data.link,
          metadata: data.metadata,
        },
      })

      // If allowed, send email
      if (this.emailService && preferences.allowEmail) {
        try {
          // Get user for email
          const user = await this.payload.findByID({
            collection: 'users',
            id: data.userId,
          })

          if (user.email) {
            await this.emailService
              .sendTemplateEmail(
                'notification',
                user.email,
                {
                  title: data.title,
                  message: data.message,
                  type: data.type,
                  link: data.link,
                  ...data.metadata,
                },
                { locale: user.locale || 'ru' },
              )
              .catch((err) => {
                console.error('Failed to send email notification:', err)
              })
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError)
          // Don't break execution if email couldn't be sent
        }
      }

      // If allowed, send push (future implementation)
      if (preferences.allowPush) {
        console.log('Push notifications are enabled but not implemented yet')
      }

      console.log(`Notification sent to user ${data.userId}: ${data.title}`)
      return notification
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  /**
   * Отмечает все уведомления пользователя как прочитанные
   * @param userId ID пользователя
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    const where: Where = {
      user: {
        equals: userId,
      },
      isRead: {
        equals: false,
      },
    }
    try {
      await this.payload.update<'notifications', any>({
        collection: 'notifications',
        where: where,
        data: {
          isRead: true,
        },
      })
      return true
    } catch (error) {
      console.error(`Error marking all notifications as read for user ${userId}:`, error)
      return false
    }
  }

  private async createNotification(
    type: Notification['type'],
    message: string,
    recipientUserId: string,
    relatedDoc?: {
      collection: 'orders' | 'subscriptions' | 'products'
      id: string
    },
  ): Promise<Notification | null> {
    try {
      // Добавляем отсутствующее поле title
      const notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'> = {
        type: type as any,
        title: this.getNotificationTitle(type as any), // Генерируем заголовок по типу
        message,
        user: recipientUserId,
        isRead: false,
        ...(relatedDoc && { relatedDoc }),
      }

      const newNotification = await this.payload.create<'notifications', any>({
        collection: 'notifications',
        data: notificationData,
      })
      console.log(`Notification created: ${type} for user ${recipientUserId}`)
      return newNotification as Notification
    } catch (error) {
      console.error(`Error creating notification (${type}):`, error)
      return null
    }
  }

  // Вспомогательная функция для генерации заголовка (можно вынести или сделать сложнее)
  private getNotificationTitle(type: string): string {
    // TODO: Implement proper title generation / localization
    switch (type) {
      case 'order_confirmation':
        return 'Заказ подтвержден'
      case 'subscription_activated':
        return 'Подписка активирована'
      case 'subscription_cancelled':
        return 'Подписка отменена'
      case 'payment_failed':
        return 'Ошибка платежа'
      // ... другие типы ...
      default:
        return 'Новое уведомление'
    }
  }

  async sendOrderConfirmation(order: Order): Promise<void> {
    const userId =
      typeof order.customer === 'object' && order.customer !== null
        ? order.customer.id
        : typeof order.customer === 'string'
          ? order.customer
          : null

    if (!userId) {
      console.error('Cannot send order confirmation: User ID not found in order.')
      return
    }
    await this.createNotification(
      'order_confirmation' as any,
      `Ваш заказ #${order.id} успешно оформлен.`,
      userId,
      { collection: 'orders', id: order.id },
    )
  }

  async sendPaymentFailed(subscription: Subscription): Promise<void> {
    const userId =
      typeof subscription.userId === 'object' && subscription.userId !== null
        ? subscription.userId.id
        : typeof subscription.userId === 'string'
          ? subscription.userId
          : null

    if (!userId) {
      console.error('Cannot send payment failed notification: User ID not found in subscription.')
      return
    }
    await this.createNotification(
      'payment_failed' as any,
      `Платеж по подписке ${subscription.id} не прошел. Пожалуйста, обновите платежную информацию.`,
      userId,
      { collection: 'subscriptions', id: subscription.id },
    )
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      // Убираем явные generic-аргументы, полагаемся на вывод типов
      const notification = await this.payload.findByID({
        collection: 'notifications',
        id: notificationId,
        depth: 0,
      })

      // Приведение типа может понадобиться здесь, если вывод типов не сработает идеально
      const typedNotification = notification as Notification | null

      if (
        !typedNotification ||
        (typeof typedNotification.user === 'string'
          ? typedNotification.user !== userId
          : typedNotification.user?.id !== userId)
      ) {
        console.warn(
          `Notification ${notificationId} not found or does not belong to user ${userId}.`,
        )
        return false
      }

      if (typedNotification.isRead === true) {
        return true
      }

      // В update оставляем <'notifications', any>, т.к. там была другая ошибка
      await this.payload.update<'notifications', any>({
        collection: 'notifications',
        id: notificationId,
        data: {
          isRead: true,
        },
      })
      return true
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error)
      return false
    }
  }

  // Переписанный markAllUserNotificationsAsRead с for...of
  async markAllUserNotificationsAsRead(userId: string): Promise<void> {
    try {
      const notificationsToUpdate = await this.payload.find({
        collection: 'notifications',
        where: {
          user: { equals: userId },
          isRead: { equals: false },
        },
        limit: 1000,
        depth: 0,
      })

      let updatedCount = 0
      // Указываем тип для notification в цикле
      for (const notification of notificationsToUpdate.docs as Notification[]) {
        try {
          // Попробуем снова с двумя generic-аргументами
          await this.payload.update<'notifications', any>({
            collection: 'notifications',
            id: notification.id,
            data: { isRead: true },
            depth: 0,
          })
          updatedCount++
        } catch (updateError) {
          console.error(`Failed to mark notification ${notification.id} as read:`, updateError)
        }
      }

      console.log(`Marked ${updatedCount} notifications as read for user ${userId}`)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  async getNotificationsForUser(
    userId: string,
    limit: number = 10,
    page: number = 1,
  ): Promise<{ docs: Notification[]; totalDocs: number } | null> {
    const where: Where = {
      user: {
        equals: userId,
      },
    }
    try {
      const results = await this.payload.find<'notifications', any>({
        collection: 'notifications',
        where,
        sort: '-createdAt',
        limit,
        page,
        depth: 1,
      })
      return results as { docs: Notification[]; totalDocs: number }
    } catch (error) {
      console.error(`Error fetching notifications for user ${userId}:`, error)
      return null
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const where: Where = {
      user: {
        equals: userId,
      },
      isRead: {
        equals: false,
      },
    }
    try {
      const result = await this.payload.count<'notifications'>({
        collection: 'notifications',
        where,
      })
      return result.totalDocs
    } catch (error) {
      console.error(`Error fetching unread notification count for user ${userId}:`, error)
      return 0
    }
  }
}
