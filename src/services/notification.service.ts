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
export type NotificationCategory = // Export for use in channel
  | 'account'
  | 'courses'
  | 'achievements'
  | 'comments'
  | 'newsletter'
  | 'marketing'
  | 'billing_alerts'
  | 'subscription_updates'
  | 'order_updates'
  | 'refund_notifications' // For refund_processed
  | 'renewal_reminders' // For subscription_renewal_reminder
  | 'order_shipped_fulfilled' // For order shipped/fulfilled
  | string // Allow other string types for flexibility

export interface NotificationPayload {
  userId: string
  user?: User // Populated user object for locale, email, etc.
  title: string
  message: string
  type: NotificationCategory
  link?: string
  metadata?: Record<string, any>
  locale?: string // Explicit locale, overrides user.locale if provided
  // Channel-specific data can be added here or in metadata
  // For example, for email:
  emailSpecific?: {
    templateSlug: string
    templateContext: Record<string, any>
  }
  // For in-app:
  inAppSpecific?: {
    // any specific fields for in-app if different from generic
  }
}

export interface INotificationChannel {
  channelType: 'email' | 'inApp' | 'sms' | 'push' | string // Extensible
  send(payload: NotificationPayload, serviceInstance: NotificationService): Promise<boolean>
}

class InAppNotificationChannel implements INotificationChannel {
  public channelType = 'inApp'
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  async send(data: NotificationPayload): Promise<boolean> {
    try {
      await this.payload.create<'notifications', any>({
        collection: 'notifications',
        data: {
          user: data.userId,
          title: data.title,
          message: data.message,
          type: data.type as any, // Cast as 'type' field in 'notifications' might be more specific
          isRead: false,
          link: data.link,
          metadata: data.metadata,
        },
      })
      return true
    } catch (error) {
      console.error(`Error sending in-app notification for user ${data.userId}:`, error)
      return false
    }
  }
}

class EmailNotificationChannel implements INotificationChannel {
  public channelType = 'email'
  private emailService: EmailService

  constructor(emailService: EmailService) {
    this.emailService = emailService
  }

  async send(data: NotificationPayload): Promise<boolean> {
    if (!data.user || !data.user.email) {
      console.error(`Email channel: User email not available for user ${data.userId}`)
      return false
    }
    if (!data.emailSpecific?.templateSlug) {
      console.error(`Email channel: Template slug not provided for user ${data.userId}, type ${data.type}`)
      // Fallback to a generic notification email if desired, or return false
      // For now, sending a generic one:
      try {
         await this.emailService.sendTemplateEmail(
          'notification', // Generic template
          data.user.email,
          {
            title: data.title,
            message: data.message,
            type: data.type,
            link: data.link,
            ...(data.metadata || {}),
          },
          { locale: data.locale || data.user.locale || 'ru' },
        )
        return true
      } catch (error) {
        console.error(`Error sending generic email notification to ${data.user.email}:`, error)
        return false
      }
    }

    try {
      await this.emailService.sendTemplateEmail(
        data.emailSpecific.templateSlug,
        data.user.email,
        data.emailSpecific.templateContext,
        { locale: data.locale || data.user.locale || 'ru' },
      )
      return true
    } catch (error) {
      console.error(
        `Error sending email notification (template: ${data.emailSpecific.templateSlug}) to ${data.user.email}:`,
        error,
      )
      return false
    }
  }
}

export class NotificationService extends BaseService {
  private static instance: NotificationService | null = null
  private emailService: EmailService | null = null // Keep for direct use if needed, or phase out
  private telegramService: TelegramService | null = null // Keep for admin notifications
  private channels: INotificationChannel[] = []

  private constructor(payload: Payload) {
    super(payload)
    this.emailService = EmailService.getInstance(payload) // Still init for EmailNotificationChannel
    this.telegramService = TelegramService.getInstance(payload)

    // Register channels
    this.channels.push(new InAppNotificationChannel(payload))
    if (this.emailService) {
      this.channels.push(new EmailNotificationChannel(this.emailService))
    }
    // TODO: Add SMSChannel, PushChannel when implemented
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
        typeof subscription.user === 'object' && subscription.user !== null
          ? (subscription.user as User)
          : null
      const plan =
        typeof subscription.plan === 'object' && subscription.plan !== null
          ? (subscription.plan as SubscriptionPlan)
          : null

      // Fetch user separately if only ID is present (shouldn't happen with depth=2 but as fallback)
      if (!user && typeof subscription.user === 'string') {
        console.warn(`User object not populated for subscription ${subscriptionId} despite depth=2`)
      }
      // Fetch plan separately if only ID is present
      if (!plan && typeof subscription.plan === 'string') {
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
    if (!subscription || !user || !plan) {
      console.error(`Missing data for sendSubscriptionActivated: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user, // Pass the full user object
      title: 'Subscription Activated',
      message: `Your subscription to ${plan.name} is now active.`,
      type: 'subscription_activated',
      locale: userLocale,
      metadata: {
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
      },
      emailSpecific: {
        templateSlug: 'subscription-activated',
        templateContext: {
          userName,
          planName: plan.name,
          startDate: subscription.startedAt as string,
          nextPaymentDate: subscription.expiresAt as string,
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      // Return true if at least one channel succeeded
      return results.some(result => result === true)
    } catch (error) {
      console.error(
        `Failed to dispatch subscription activated notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionCancelled(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan) {
      console.error(`Missing data for sendSubscriptionCancelled: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'Subscription Cancelled',
      message: `Your subscription to ${plan.name} has been cancelled.`,
      type: 'subscription_cancelled',
      locale: userLocale,
      metadata: {
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
      },
      emailSpecific: {
        templateSlug: 'subscription-cancelled',
        templateContext: {
          userName,
          planName: plan.name,
          endDate: subscription.canceledAt || subscription.expiresAt,
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some(result => result === true)
    } catch (error) {
      console.error(
        `Failed to dispatch subscription cancelled notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionPaymentFailed(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan) {
      console.error(`Missing data for sendSubscriptionPaymentFailed: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'Subscription Payment Failed',
      message: `We couldn't process the payment for your ${plan.name} subscription. Please update your payment method.`,
      type: 'subscription_payment_failed',
      locale: userLocale,
      metadata: {
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
        nextPaymentAttempt: subscription.expiresAt, // Or specific retry date?
      },
      emailSpecific: {
        templateSlug: 'subscription-payment-failed',
        templateContext: {
          userName,
          planName: plan.name,
          nextPaymentDate: subscription.expiresAt as string,
          amount: plan.price, // Assuming plan has price
          currency: plan.currency, // Assuming plan has currency
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some(result => result === true)
    } catch (error) {
      console.error(
        `Failed to dispatch subscription payment failed notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionPlanChanged(subscriptionId: string, oldPlanName: string): Promise<boolean> {
    const { subscription, user, plan: newPlan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !newPlan) {
      console.error(`Missing data for sendSubscriptionPlanChanged: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'Subscription Plan Changed',
      message: `Your subscription plan has been changed from ${oldPlanName} to ${newPlan.name}.`,
      type: 'subscription_plan_changed',
      locale: userLocale,
      metadata: {
        subscriptionId: subscription.id,
        oldPlanName: oldPlanName,
        newPlanId: newPlan.id,
        newPlanName: newPlan.name,
      },
      emailSpecific: {
        templateSlug: 'subscription-plan-changed',
        templateContext: {
          userName,
          oldPlanName: oldPlanName,
          newPlanName: newPlan.name,
          effectiveDate: new Date().toISOString(), // Or specific date
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some(result => result === true)
    } catch (error) {
      console.error(
        `Failed to dispatch subscription plan changed notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionPaused(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan) {
      console.error(`Missing data for sendSubscriptionPaused: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'Subscription Paused',
      message: `Your subscription to ${plan.name} has been paused.`,
      type: 'subscription_paused',
      locale: userLocale,
      metadata: {
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
      },
      emailSpecific: {
        templateSlug: 'subscription-paused',
        templateContext: {
          userName,
          planName: plan.name,
          pausedAt: subscription.pausedAt as string,
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some(result => result === true)
    } catch (error) {
      console.error(
        `Failed to dispatch subscription paused notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionResumed(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan) {
      console.error(`Missing data for sendSubscriptionResumed: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'Subscription Resumed',
      message: `Your subscription to ${plan.name} has been resumed and is now active.`,
      type: 'subscription_resumed',
      locale: userLocale,
      metadata: {
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
        nextPaymentDate: subscription.expiresAt,
      },
      emailSpecific: {
        templateSlug: 'subscription-resumed',
        templateContext: {
          userName,
          planName: plan.name,
          resumedAt: new Date().toISOString(),
          nextPaymentDate: subscription.expiresAt as string,
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some(result => result === true)
    } catch (error) {
      console.error(
        `Failed to dispatch subscription resumed notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionExpired(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan) {
      console.error(`Missing data for sendSubscriptionExpired: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'Subscription Expired',
      message: `Your subscription to ${plan.name} has expired.`,
      type: 'subscription_expired',
      locale: userLocale,
      metadata: {
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
      },
      emailSpecific: {
        templateSlug: 'subscription-expired',
        templateContext: {
          userName,
          planName: plan.name,
          expiredAt: subscription.expiresAt as string,
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some(result => result === true)
    } catch (error) {
      console.error(
        `Failed to dispatch subscription expired notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendPaymentConfirmation(orderData: {
    orderId: string
    orderNumber: string
    customerEmail: string // Keep for Telegram and as fallback
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
    locale?: string // Keep as fallback
  }): Promise<boolean> {
    let fetchedUser: User | null = null
    let userIdForNotification: string | null = null
    let finalUserLocale = orderData.locale || 'ru'
    let finalUserName = ''
    let finalUserEmail = orderData.customerEmail // Fallback email

    try {
      // 1. Attempt to fetch full order and user details
      const order = (await this.payload.findByID({
        collection: 'orders',
        id: orderData.orderId,
        depth: 1, // Include user data
      })) as Order | null

      if (order && order.customer) {
        if (typeof order.customer === 'object' && order.customer.id) {
          fetchedUser = order.customer as User
          userIdForNotification = fetchedUser.id
          finalUserLocale = fetchedUser.locale || finalUserLocale
          finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
          finalUserEmail = fetchedUser.email || finalUserEmail
        } else if (typeof order.customer === 'string') {
          userIdForNotification = order.customer
          // Attempt to fetch user if only ID is present
          try {
            fetchedUser = (await this.payload.findByID({
              collection: 'users',
              id: userIdForNotification,
            })) as User
            if (fetchedUser) {
              finalUserLocale = fetchedUser.locale || finalUserLocale
              finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
              finalUserEmail = fetchedUser.email || finalUserEmail
            }
          } catch (userFetchErr) {
            console.error(
              `Could not fetch user ${userIdForNotification} details for payment confirmation:`,
              userFetchErr,
            )
          }
        }
      }
    } catch (fetchError) {
      console.error(
        `Error getting order/user details for payment confirmation (orderId: ${orderData.orderId}):`,
        fetchError,
      )
      // Continue with provided data if fetching fails
    }

    // 2. Format order items (remains the same)
    const orderItems = (orderData.items || []).map(item => ({
      name: item.name || 'Product',
      description: '', // Or fetch from product if available
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      type: item.type || 'product',
      id: item.product,
    }))

    // 3. Send user-facing notifications if userId is available
    let userNotificationSent = false
    if (userIdForNotification) {
      const notificationPayload: NotificationPayload = {
        userId: userIdForNotification,
        user: fetchedUser || undefined, // Pass fetched user if available
        title: 'Payment Confirmed',
        message: `Your payment for order #${orderData.orderNumber} has been confirmed.`,
        type: 'payment_confirmed', // Maps to 'billing_alerts' category
        locale: finalUserLocale,
        metadata: {
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          total: orderData.total,
          currency: orderData.currency,
        },
        emailSpecific: {
          // Using the specific method in EmailService, but could also use a template slug
          // For consistency, let's assume 'payment-confirmation' template exists
          // and EmailNotificationChannel will use sendPaymentConfirmationEmail if slug is 'payment-confirmation'
          // OR we can directly call emailService.sendPaymentConfirmationEmail if we bypass sendNotification for this one.
          // For now, let's assume a generic template 'payment-confirmation' and pass context.
          templateSlug: 'payment-confirmation', // This slug should map to sendPaymentConfirmationEmail or a similar template
          templateContext: {
            userName: finalUserName || finalUserEmail,
            email: finalUserEmail, // EmailService needs this
            orderNumber: orderData.orderNumber,
            paymentDate: new Date().toISOString(),
            paymentAmount: orderData.total,
            currency: orderData.currency,
            paymentMethod: orderData.paymentMethod,
            transactionId: orderData.paymentId,
            purchasedItems: orderItems.map(item => ({
              name: item.name,
              type: item.type as 'course' | 'product' | 'subscription' | 'other',
              id: item.id,
            })),
          },
        },
      }
      try {
        const results = await this.sendNotification(notificationPayload)
        userNotificationSent = results.some(r => r === true)
      } catch (e) {
        console.error(`Failed to dispatch payment confirmation for user ${userIdForNotification}:`, e)
      }
    } else {
      // If no userId, try to send email directly if emailService is available and customerEmail is provided
      // This path is for guest checkouts or when user association fails
      if (this.emailService && orderData.customerEmail) {
        console.log(
          `No user ID for order ${orderData.orderId}, attempting direct email to ${orderData.customerEmail}`,
        )
        try {
          await this.emailService.sendPaymentConfirmationEmail({
            userName: orderData.customerEmail, // Guest, so use email as name
            email: orderData.customerEmail,
            orderNumber: orderData.orderNumber,
            paymentDate: new Date().toISOString(),
            paymentAmount: orderData.total,
            currency: orderData.currency,
            paymentMethod: orderData.paymentMethod,
            transactionId: orderData.paymentId,
            locale: finalUserLocale,
            purchasedItems: orderItems.map(item => ({
              name: item.name,
              type: item.type as 'course' | 'product' | 'subscription' | 'other',
              id: item.id,
            })),
          })
          userNotificationSent = true // Consider it sent if direct email succeeds
        } catch (emailError) {
          console.error(
            `Failed to send direct payment confirmation email to ${orderData.customerEmail}:`,
            emailError,
          )
        }
      } else {
        console.warn(
          `Cannot send payment confirmation for order ${orderData.orderId}: No user ID and no customer email for direct send.`,
        )
      }
    }

    // 4. Отправка уведомления в Telegram (для администраторов) - remains the same
    if (this.telegramService) {
      try {
        await this.telegramService.sendMessage(
          `💰 Новый оплаченный заказ!\n` +
            `Номер заказа: ${orderData.orderNumber}\n` +
            `Сумма: ${orderData.total} ${orderData.currency}\n` +
            `Email клиента: ${finalUserEmail || 'Неизвестен'}`, // Use finalUserEmail
        )
      } catch (telegramError) {
        console.error(`Failed to send Telegram payment confirmation:`, telegramError)
      }
    }

    return userNotificationSent // Return true if user notification (in-app or email) was attempted and succeeded
  }

  async sendDigitalOrderStatusUpdate(orderData: {
    orderId: string
    status: string // e.g., 'ready_for_download', 'completed'
    customerEmail?: string // Fallback if user not found on order
    downloadLinks?: string[]
  }): Promise<boolean> {
    if (!orderData.orderId || !orderData.status) {
      console.error('Invalid order data for status update notification')
      return false
    }

    let fetchedUser: User | null = null
    let userIdForNotification: string | null = null
    let finalUserLocale = 'ru'
    let finalUserName = ''
    let finalUserEmail = orderData.customerEmail // Fallback

    let orderNumberForMessage = orderData.orderId // Fallback if order number not found

    try {
      const order = (await this.payload.findByID({
        collection: 'orders',
        id: orderData.orderId,
        depth: 1, // Include user data
      })) as Order | null

      if (!order) {
        console.error(`Order not found for status update: ${orderData.orderId}`)
        // Decide if we should still attempt to notify if customerEmail is present
        if (!orderData.customerEmail) return false
      } else {
        orderNumberForMessage = order.orderNumber || order.id // Use orderNumber if available
        if (order.customer) {
          if (typeof order.customer === 'object' && order.customer.id) {
            fetchedUser = order.customer as User
            userIdForNotification = fetchedUser.id
            finalUserLocale = fetchedUser.locale || finalUserLocale
            finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
            finalUserEmail = fetchedUser.email || finalUserEmail
          } else if (typeof order.customer === 'string') {
            userIdForNotification = order.customer
            try {
              fetchedUser = (await this.payload.findByID({
                collection: 'users',
                id: userIdForNotification,
              })) as User
              if (fetchedUser) {
                finalUserLocale = fetchedUser.locale || finalUserLocale
                finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
                finalUserEmail = fetchedUser.email || finalUserEmail
              }
            } catch (userFetchErr) {
              console.error(`Could not fetch user ${userIdForNotification} for status update:`, userFetchErr)
            }
          }
        }
      }
    } catch (fetchError) {
      console.error(`Error getting order/user details for status update (orderId: ${orderData.orderId}):`, fetchError)
      if (!orderData.customerEmail && !userIdForNotification) return false // Cannot proceed
    }

    if (!userIdForNotification && !finalUserEmail) {
      console.error(`Cannot send status update for order ${orderData.orderId}: No user ID or customer email.`)
      return false
    }
    
    let title = 'Order Status Update'
    let message = `Your order #${orderNumberForMessage} status has been updated to ${orderData.status}.`
    let notificationType: NotificationCategory = 'order_status'
    let emailTemplateSlug: string | null = null
    const emailTemplateContext: Record<string, any> = {
      orderNumber: orderNumberForMessage,
      userName: finalUserName || finalUserEmail,
    }

    switch (orderData.status) {
      case 'ready_for_download':
        title = 'Download Ready'
        message = `Your digital products from order #${orderNumberForMessage} are ready for download.`
        notificationType = 'download_ready'
        emailTemplateSlug = 'digital_product_ready'
        emailTemplateContext.downloadLinks = orderData.downloadLinks || []
        // emailTemplateContext.products = order?.items?.map((item: any) => typeof item.product === 'object' ? item.product.title : 'Item') || []; // Requires order to be fetched
        break
      case 'completed':
        title = 'Order Completed'
        message = `Your order #${orderNumberForMessage} has been completed.`
        notificationType = 'order_completed'
        emailTemplateSlug = 'order_completed'
        // emailTemplateContext.products = order?.items?.map((item: any) => typeof item.product === 'object' ? item.product.title : 'Item') || []; // Requires order to be fetched
        break
      // Add other relevant statuses here
    }

    let userNotificationSent = false
    if (userIdForNotification) {
      const notificationPayload: NotificationPayload = {
        userId: userIdForNotification,
        user: fetchedUser || undefined,
        title,
        message,
        type: notificationType, // Maps to 'order_updates' category
        locale: finalUserLocale,
        metadata: {
          orderId: orderData.orderId,
          orderNumber: orderNumberForMessage,
          status: orderData.status,
        },
        ...(emailTemplateSlug && {
          emailSpecific: {
            templateSlug: emailTemplateSlug,
            templateContext: emailTemplateContext,
          },
        }),
      }
      try {
        const results = await this.sendNotification(notificationPayload)
        userNotificationSent = results.some(r => r === true)
      } catch (e) {
        console.error(`Failed to dispatch status update for user ${userIdForNotification}, order ${orderData.orderId}:`, e)
      }
    } else if (finalUserEmail && emailTemplateSlug && this.emailService) {
      // Direct email if no user ID but email and template are available
      console.log(`No user ID for order ${orderData.orderId}, attempting direct email for status ${orderData.status} to ${finalUserEmail}`)
      try {
        await this.emailService.sendTemplateEmail(
          emailTemplateSlug,
          finalUserEmail,
          emailTemplateContext,
          { locale: finalUserLocale },
        )
        userNotificationSent = true
      } catch (emailError) {
        console.error(`Failed to send direct status update email to ${finalUserEmail} for order ${orderData.orderId}:`, emailError)
      }
    } else {
       console.warn(`Could not send digital order status update for order ${orderData.orderId}. No user ID and insufficient data for direct email.`);
    }
    
    return userNotificationSent
  }

  async sendAbandonedCartReminder(cartData: {
    user: User // Expect a full User object
    items: Array<{ product: { title: string }; quantity: number; price: number }> // More specific item structure
    total: number
    currency: string
    lastUpdated: Date
  }): Promise<boolean> { // Return boolean for success indication
    const { user, items, total, currency, lastUpdated } = cartData

    if (!user || !user.id || !user.email) {
      console.error('Abandoned cart reminder: User ID or email missing.')
      return false
    }

    // Global settings check (if re-enabled)
    // const settings = await this.payload.findGlobal<'settings', any>({ slug: 'settings' })
    // if (!settings?.notificationSettings?.email?.enableAbandonedCartReminders) {
    //   console.log('Abandoned cart reminders are globally disabled.')
    //   return false
    // }

    const userLocale = user.locale || 'ru'
    const userName = user.name || user.email

    const emailTemplateContext = {
      userName,
      items: items.map(item => ({
        title: item.product.title,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      currency,
      lastUpdated: lastUpdated.toLocaleDateString(userLocale), // Use locale for date formatting
      cartUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`, // Ensure NEXT_PUBLIC_SERVER_URL is set
    }

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'Items waiting in your cart',
      message: `You have ${items.length} item(s) in your cart. Complete your purchase before they're gone!`,
      type: 'abandoned_cart', // Maps to 'marketing' category
      locale: userLocale,
      metadata: emailTemplateContext, // Re-use for in-app metadata
      emailSpecific: {
        templateSlug: 'abandoned-cart',
        templateContext: emailTemplateContext,
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      // Do not throw error here to prevent breaking other processes,
      // but log if no channel succeeded.
      if (!results.some(r => r === true)) {
          console.warn(`Abandoned cart reminder for user ${user.id} was not sent via any channel.`);
          return false;
      }
      return true
    } catch (error) {
      console.error(`Failed to dispatch abandoned cart reminder for user ${user.id}:`, error)
      return false
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
    notificationType: NotificationCategory, // Use the exported type
    channelType?: INotificationChannel['channelType'], // Optional: check for a specific channel
  ): Promise<{
    allowInApp: boolean // In-app is usually not part of this specific check, but kept for consistency
    allowEmail: boolean
    allowPush: boolean
    allowSms: boolean // Added for future SMS channel
    [key: string]: boolean // For other dynamic channels
  }> {
    const defaults = {
      allowInApp: true, // Default for in-app (often non-configurable or separately configured)
      allowEmail: true,
      allowPush: false,
      allowSms: false,
    }

    try {
      const user = await this.payload.findByID({
        collection: 'users',
        id: userId,
        depth: 0, // Preferences are top-level fields
      })

      if (!user) {
        console.warn(`User not found for preferences check: ${userId}`)
        return defaults
      }

      // User's general notification frequency
      if (user.notificationFrequency === 'never') {
        return {
          ...defaults,
          allowEmail: false,
          allowPush: false,
          allowSms: false,
        }
      }
      // Add more granular frequency checks if needed (e.g., 'digest')

      const userNotificationPrefs = user.notificationPreferences as {
        email?: {
          orderUpdates?: boolean
          subscriptionUpdates?: boolean
          accountActivity?: boolean
          marketingAndPromotions?: boolean
          productNewsAndTips?: boolean
        }
        // push?: { ... } // Future placeholder
      } | undefined

      let emailAllowed = false // Default to false if not explicitly allowed or mapped

      const emailCategoryDefaults = {
        orderUpdates: true,
        subscriptionUpdates: true,
        accountActivity: true,
        marketingAndPromotions: false,
        productNewsAndTips: false,
      }

      type EmailPreferenceKey = keyof typeof emailCategoryDefaults;
      let mappedPreferenceKey: EmailPreferenceKey | null = null

      // Map notificationType to a preference key
      if (
        [
          'payment_confirmed',
          'download_ready',
          'order_completed',
          'order_status',
          'order_cancelled',
          'order_shipped_fulfilled',
          'refund_processed',
          'initial_payment_failed',
        ].includes(notificationType)
      ) {
        mappedPreferenceKey = 'orderUpdates'
      } else if (
        [
          'subscription_activated',
          'subscription_cancelled',
          'subscription_plan_changed',
          'subscription_paused',
          'subscription_resumed',
          'subscription_expired',
          'subscription_renewal_reminder',
          'subscription_renewed_successfully',
          'subscription_payment_failed',
        ].includes(notificationType)
      ) {
        mappedPreferenceKey = 'subscriptionUpdates'
      } else if (
        [
          'welcome_email',
          'password_changed',
          'email_address_changed',
          'account_updated',
          'achievement',
          'level_up',
          'comment_reply',
          'comment_mention',
        ].includes(notificationType)
      ) {
        mappedPreferenceKey = 'accountActivity'
      } else if (
        ['promo', 'discount', 'marketing', 'abandoned_cart', 'newsletter', 'broadcast'].includes(
          notificationType,
        )
      ) {
        mappedPreferenceKey = 'marketingAndPromotions'
      } else if (
        [
          'course_completed', // Assuming general course news, not specific progress for this category
          'lesson_completed',
          'course_enrolled',
          'product_news', // Example direct type
          'platform_updates', // Example direct type
        ].includes(notificationType)
      ) {
        // This category can be refined if more specific course/product preferences are added
        mappedPreferenceKey = 'productNewsAndTips'
      }

      if (mappedPreferenceKey && userNotificationPrefs?.email) {
        const preferenceValue = userNotificationPrefs.email[mappedPreferenceKey]
        if (typeof preferenceValue === 'boolean') {
          emailAllowed = preferenceValue
        } else {
          // Value is undefined (e.g., field not on an old user doc, though Payload defaults should handle this)
          // Fallback to the schema default for this specific category.
          emailAllowed = emailCategoryDefaults[mappedPreferenceKey] ?? false // Fallback to false if key is somehow invalid
          this.payload.logger.warn(
            `Email preference for "${mappedPreferenceKey}" was undefined for user ${userId}. Used schema default: ${emailAllowed}.`,
          )
        }
      } else if (mappedPreferenceKey) {
        // userNotificationPrefs.email is missing, or userNotificationPrefs itself is missing.
        // This implies the user object might be incomplete or the structure is not as expected.
        // Fallback to schema defaults for the mapped key.
        emailAllowed = emailCategoryDefaults[mappedPreferenceKey] ?? false
        this.payload.logger.warn(
          `User's email preferences structure (user.notificationPreferences.email) was missing or incomplete for user ${userId} while checking for "${mappedPreferenceKey}". Used schema default: ${emailAllowed}.`,
        )
      } else {
        // notificationType was not mapped to any known preferenceKey
        this.payload.logger.warn(
          `Notification type "${notificationType}" not mapped to a known email preference category for user ${userId}. Email will be disabled for this type.`,
        )
        emailAllowed = false
      }

      const finalPreferences: { [key: string]: boolean } = {
        allowInApp: defaults.allowInApp,
        allowEmail: emailAllowed,
        allowPush: defaults.allowPush, // Remains false, as push preferences are not yet implemented in detail
        allowSms: defaults.allowSms,   // Remains false, as SMS preferences are not yet implemented
      }

      // If a specific channelType is requested, only return that preference
      if (channelType) {
        const singleChannelPrefKey = `allow${channelType.charAt(0).toUpperCase() + channelType.slice(1)}`;
        // Ensure the key exists in defaults before trying to construct the return object
        // Use a type assertion for defaults key access if necessary, or check existence
        const defaultChannelValue = (defaults as Record<string, boolean>)[singleChannelPrefKey] ?? (channelType === 'inApp' ? true : false);
        return { ...defaults, [singleChannelPrefKey]: finalPreferences[singleChannelPrefKey] ?? defaultChannelValue };
      }

      return finalPreferences as {
        allowInApp: boolean
        allowEmail: boolean
        allowPush: boolean
        allowSms: boolean
        [key: string]: boolean
      }
    } catch (error) {
      console.error(`Error checking user notification preferences for user ${userId}:`, error)
      return defaults // Return safe defaults on error
    }
  }

  /**
   * Dispatches a notification to all relevant channels based on user preferences.
   * @param data The notification payload.
   */
  async sendNotification(data: NotificationPayload): Promise<boolean[]> {
    let userForPrefs = data.user
    if (!userForPrefs) {
      try {
        userForPrefs = await this.payload.findByID({ collection: 'users', id: data.userId, depth: 0 })
      } catch (e) {
        console.error(`sendNotification: Could not fetch user ${data.userId} for preferences.`)
        return this.channels.map(() => false) // Return array of falses
      }
    }
    if (!userForPrefs) {
        console.error(`sendNotification: User ${data.userId} not found. Cannot send notification.`)
        return this.channels.map(() => false)
    }
    
    // Ensure the payload has the user object for channels that need it (like EmailChannel)
    const payloadWithUser: NotificationPayload = { ...data, user: userForPrefs };

    const results: boolean[] = []

    for (const channel of this.channels) {
      try {
        const preferences = await this.checkUserNotificationPreferences(
          payloadWithUser.userId,
          payloadWithUser.type, // Pass the general notification type for category mapping
        )
        
        let shouldSendViaChannel = false
        switch (channel.channelType) {
          case 'inApp':
            shouldSendViaChannel = preferences.allowInApp
            break
          case 'email':
            shouldSendViaChannel = preferences.allowEmail
            break
          case 'sms':
            shouldSendViaChannel = preferences.allowSms
            break
          case 'push':
            shouldSendViaChannel = preferences.allowPush
            break
          default:
            // For custom channels, preference key might be different
            // Assuming a convention like `allowCustomChannelName`
            const prefKey = `allow${channel.channelType.charAt(0).toUpperCase() + channel.channelType.slice(1)}`
            shouldSendViaChannel = preferences[prefKey] === true
        }

        if (shouldSendViaChannel) {
          const success = await channel.send(payloadWithUser, this)
          results.push(success)
          if (success) {
            console.log(`Notification sent via ${channel.channelType} to user ${payloadWithUser.userId}: ${payloadWithUser.title}`)
          } else {
            console.warn(`Failed to send notification via ${channel.channelType} to user ${payloadWithUser.userId}: ${payloadWithUser.title}`)
          }
        } else {
          results.push(false) // Channel not allowed by preferences
        }
      } catch (error) {
        console.error(`Error processing channel ${channel.channelType} for user ${payloadWithUser.userId}:`, error)
        results.push(false)
      }
    }
    return results
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
      return 'Ошибка платежа'
    case 'order_shipped_fulfilled':
      return 'Заказ отправлен/выполнен'
    case 'order_cancelled':
      return 'Заказ отменен'
    case 'refund_processed':
      return 'Возврат обработан'
    case 'subscription_renewal_reminder':
      return 'Напоминание о продлении подписки'
    case 'subscription_renewed_successfully':
      return 'Подписка успешно продлена'
    case 'initial_payment_failed':
      return 'Ошибка начального платежа'
    case 'welcome_email':
      return 'Добро пожаловать!'
    case 'password_changed':
      return 'Пароль изменен'
    case 'email_address_changed':
      return 'Email адрес изменен'
    case 'account_updated':
      return 'Данные аккаунта обновлены'
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
    const userObject = subscription.user
    const userId =
      typeof userObject === 'object' && userObject !== null
        ? userObject.id
        : typeof userObject === 'string'
          ? userObject
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
  
    // --- OMS Notifications ---
  
    async sendOrderCancelledNotification(orderId: string, cancellationReason?: string): Promise<boolean> {
      let fetchedUser: User | null = null
      let userIdForNotification: string | null = null
      let finalUserLocale = 'ru'
      let finalUserName = ''
      let finalUserEmail: string | null = null
      let orderNumberForMessage = orderId
  
      try {
        const order = (await this.payload.findByID({
          collection: 'orders',
          id: orderId,
          depth: 1, // Include user data
        })) as Order | null
  
        if (!order) {
          console.error(`Order not found for cancellation notification: ${orderId}`)
          return false
        }
        orderNumberForMessage = order.orderNumber || order.id
  
        if (order.customer) {
          if (typeof order.customer === 'object' && order.customer.id) {
            fetchedUser = order.customer as User
            userIdForNotification = fetchedUser.id
            finalUserLocale = fetchedUser.locale || finalUserLocale
            finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
            finalUserEmail = fetchedUser.email
          } else if (typeof order.customer === 'string') {
            userIdForNotification = order.customer
            try {
              fetchedUser = (await this.payload.findByID({
                collection: 'users',
                id: userIdForNotification,
              })) as User
              if (fetchedUser) {
                finalUserLocale = fetchedUser.locale || finalUserLocale
                finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
                finalUserEmail = fetchedUser.email
              }
            } catch (userFetchErr) {
              console.error(`Could not fetch user ${userIdForNotification} for order cancellation:`, userFetchErr)
            }
          }
        }
  
        if (!userIdForNotification || !finalUserEmail) {
          console.error(`Missing user data for order cancellation notification: ${orderId}`)
          return false
        }
  
        const notificationPayload: NotificationPayload = {
          userId: userIdForNotification,
          user: fetchedUser || undefined,
          title: this.getNotificationTitle('order_cancelled'),
          message: `Your order #${orderNumberForMessage} has been cancelled.`,
          type: 'order_cancelled', // Maps to 'order_updates' category
          locale: finalUserLocale,
          metadata: {
            orderId: order.id,
            orderNumber: orderNumberForMessage,
            cancellationReason: cancellationReason || (order as any).cancellationReason || 'Not specified',
          },
          emailSpecific: {
            templateSlug: 'order-cancelled',
            templateContext: {
              userName: finalUserName,
              orderNumber: orderNumberForMessage,
              cancellationReason: cancellationReason || (order as any).cancellationReason || 'Not specified',
            },
          },
        }
  
        const results = await this.sendNotification(notificationPayload)
        return results.some(r => r === true)
      } catch (error) {
        console.error(`Failed to dispatch order cancelled notification for ${orderId}:`, error)
        return false
      }
    }
  
    async sendRefundProcessedNotification(orderId: string, refundDetails: { amount: number; currency: string; processedAt: string }): Promise<boolean> {
      let fetchedUser: User | null = null
      let userIdForNotification: string | null = null
      let finalUserLocale = 'ru'
      let finalUserName = ''
      let finalUserEmail: string | null = null
      let orderNumberForMessage = orderId
  
      try {
        const order = (await this.payload.findByID({
          collection: 'orders',
          id: orderId,
          depth: 1, // Include user data
        })) as Order | null
  
        if (!order) {
          console.error(`Order not found for refund processed notification: ${orderId}`)
          return false
        }
        orderNumberForMessage = order.orderNumber || order.id
  
        if (order.customer) {
          if (typeof order.customer === 'object' && order.customer.id) {
            fetchedUser = order.customer as User
            userIdForNotification = fetchedUser.id
            finalUserLocale = fetchedUser.locale || finalUserLocale
            finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
            finalUserEmail = fetchedUser.email
          } else if (typeof order.customer === 'string') {
            userIdForNotification = order.customer
            try {
              fetchedUser = (await this.payload.findByID({
                collection: 'users',
                id: userIdForNotification,
              })) as User
              if (fetchedUser) {
                finalUserLocale = fetchedUser.locale || finalUserLocale
                finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
                finalUserEmail = fetchedUser.email
              }
            } catch (userFetchErr) {
              console.error(`Could not fetch user ${userIdForNotification} for refund notification:`, userFetchErr)
            }
          }
        }
  
        if (!userIdForNotification || !finalUserEmail) {
          console.error(`Missing user data for refund processed notification: ${orderId}`)
          return false
        }
  
        const notificationPayload: NotificationPayload = {
          userId: userIdForNotification,
          user: fetchedUser || undefined,
          title: this.getNotificationTitle('refund_processed'),
          message: `A refund of ${refundDetails.amount} ${refundDetails.currency} for order #${orderNumberForMessage} has been processed.`,
          type: 'refund_processed', // Maps to 'refund_notifications' category
          locale: finalUserLocale,
          metadata: {
            orderId: order.id,
            orderNumber: orderNumberForMessage,
            refundAmount: refundDetails.amount,
            currency: refundDetails.currency,
            processedAt: refundDetails.processedAt,
          },
          emailSpecific: {
            templateSlug: 'refund-processed',
            templateContext: {
              userName: finalUserName,
              orderNumber: orderNumberForMessage,
              refundAmount: refundDetails.amount,
              currency: refundDetails.currency,
              processedAt: refundDetails.processedAt,
            },
          },
        }
  
        const results = await this.sendNotification(notificationPayload)
        return results.some(r => r === true)
      } catch (error) {
        console.error(`Failed to dispatch refund processed notification for ${orderId}:`, error)
        return false
      }
    }
  
    // --- SMS Notifications ---
  
    async sendSubscriptionRenewalReminder(subscriptionId: string): Promise<boolean> {
      const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
      if (!subscription || !user || !plan) {
        console.error(`Missing data for sendSubscriptionRenewalReminder: ${subscriptionId}`)
        return false
      }
      const userLocale = user.locale || 'ru'
      const userName = user.name || user.email || 'Customer'
  
      const notificationPayload: NotificationPayload = {
        userId: user.id,
        user: user,
        title: this.getNotificationTitle('subscription_renewal_reminder'),
        message: `Your subscription to ${plan.name} is due for renewal on ${new Date(subscription.expiresAt as string).toLocaleDateString(userLocale)}.`,
        type: 'subscription_renewal_reminder', // Maps to 'renewal_reminders' category
        locale: userLocale,
        metadata: {
          subscriptionId: subscription.id,
          planName: plan.name,
          renewalDate: subscription.expiresAt,
        },
        emailSpecific: {
          templateSlug: 'subscription-renewal-reminder',
          templateContext: {
            userName,
            planName: plan.name,
            renewalDate: subscription.expiresAt as string,
          },
        },
      }
  
      try {
        const results = await this.sendNotification(notificationPayload)
        return results.some(r => r === true)
      } catch (error) {
        console.error(`Failed to dispatch subscription renewal reminder for ${subscriptionId}:`, error)
        return false
      }
    }
  
    async sendSubscriptionRenewedSuccessfully(subscriptionId: string): Promise<boolean> {
      const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
      if (!subscription || !user || !plan) {
        console.error(`Missing data for sendSubscriptionRenewedSuccessfully: ${subscriptionId}`)
        return false
      }
      const userLocale = user.locale || 'ru'
      const userName = user.name || user.email || 'Customer'
  
      const notificationPayload: NotificationPayload = {
        userId: user.id,
        user: user,
        title: this.getNotificationTitle('subscription_renewed_successfully'),
        message: `Your subscription to ${plan.name} has been successfully renewed. Next payment: ${new Date(subscription.expiresAt as string).toLocaleDateString(userLocale)}.`,
        type: 'subscription_renewed_successfully', // Maps to 'subscription_updates' category
        locale: userLocale,
        metadata: {
          subscriptionId: subscription.id,
          planName: plan.name,
          nextPaymentDate: subscription.expiresAt,
        },
        emailSpecific: {
          templateSlug: 'subscription-renewed', // Or 'subscription-renewed-successfully'
          templateContext: {
            userName,
            planName: plan.name,
            newExpiryDate: subscription.expiresAt as string,
          },
        },
      }
  
      try {
        const results = await this.sendNotification(notificationPayload)
        return results.some(r => r === true)
      } catch (error) {
        console.error(`Failed to dispatch subscription renewed successfully notification for ${subscriptionId}:`, error)
        return false
      }
    }
  
    // --- PS Notifications ---
  
    async sendInitialPaymentFailedNotification(orderId: string, reason?: string): Promise<boolean> {
      let fetchedUser: User | null = null
      let userIdForNotification: string | null = null
      let finalUserLocale = 'ru'
      let finalUserName = ''
      let finalUserEmail: string | null = null
      let orderNumberForMessage = orderId
  
      try {
        const order = (await this.payload.findByID({
          collection: 'orders',
          id: orderId,
          depth: 1, // Include user data
        })) as Order | null
  
        if (!order) {
          console.error(`Order not found for initial payment failed notification: ${orderId}`)
          return false
        }
        orderNumberForMessage = order.orderNumber || order.id
  
        if (order.customer) {
          if (typeof order.customer === 'object' && order.customer.id) {
            fetchedUser = order.customer as User
            userIdForNotification = fetchedUser.id
            finalUserLocale = fetchedUser.locale || finalUserLocale
            finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
            finalUserEmail = fetchedUser.email
          } else if (typeof order.customer === 'string') {
            userIdForNotification = order.customer
            try {
              fetchedUser = (await this.payload.findByID({
                collection: 'users',
                id: userIdForNotification,
              })) as User
              if (fetchedUser) {
                finalUserLocale = fetchedUser.locale || finalUserLocale
                finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
                finalUserEmail = fetchedUser.email
              }
            } catch (userFetchErr) {
              console.error(`Could not fetch user ${userIdForNotification} for initial payment failed:`, userFetchErr)
            }
          }
        }
  
        if (!userIdForNotification || !finalUserEmail) {
          console.error(`Missing user data for initial payment failed notification: ${orderId}`)
          return false
        }
  
        const notificationPayload: NotificationPayload = {
          userId: userIdForNotification,
          user: fetchedUser || undefined,
          title: this.getNotificationTitle('initial_payment_failed'),
          message: `We were unable to process the payment for order #${orderNumberForMessage}. ${reason || 'Please check your payment details and try again.'}`,
          type: 'initial_payment_failed', // Maps to 'billing_alerts' category
          locale: finalUserLocale,
          metadata: {
            orderId: order.id,
            orderNumber: orderNumberForMessage,
            reason: reason || 'Payment failed.',
          },
          emailSpecific: {
            templateSlug: 'initial-payment-failed',
            templateContext: {
              userName: finalUserName,
              orderNumber: orderNumberForMessage,
              failureReason: reason || 'Payment failed.',
            },
          },
        }
  
        const results = await this.sendNotification(notificationPayload)
        return results.some(r => r === true)
      } catch (error) {
        console.error(`Failed to dispatch initial payment failed notification for ${orderId}:`, error)
        return false
      }
    }
  
    // --- Account Management Notifications ---
  
    async sendWelcomeEmail(userId: string): Promise<boolean> {
      try {
        const user = await this.payload.findByID({ collection: 'users', id: userId }) as User
        if (!user || !user.email) {
          console.error(`User not found or missing email for sendWelcomeEmail: ${userId}`)
          return false
        }
        const userLocale = user.locale || 'ru'
        const userName = user.name || user.email
  
        const preferences = await this.checkUserNotificationPreferences(userId, 'welcome_email')
  
        // In-app for welcome might be optional or combined with a tour. For now, let's add it.
        if (preferences.allowInApp) {
           await this.payload.create<'notifications', any>({
            collection: 'notifications',
            data: {
              user: userId,
              title: this.getNotificationTitle('welcome_email'),
              message: `Добро пожаловать, ${userName}! Мы рады видеть вас.`,
              type: 'welcome_email' as any,
              isRead: false,
              metadata: { userId },
            },
          })
        }
  
          if (this.emailService && preferences.allowEmail) {
            await this.emailService.sendWelcomeEmail({ // Uses specific method from EmailService
              name: userName,
              email: user.email,
              locale: userLocale,
              unsubscribeToken: '', // User type does not have unsubscribeToken, passing empty string.
            })
          }
          return true
      } catch (error) {
        console.error(`Failed to send welcome email for user ${userId}:`, error)
        return false
      }
    }
  
    async sendPasswordChangedNotification(userId: string): Promise<boolean> {
      try {
        const user = await this.payload.findByID({ collection: 'users', id: userId }) as User
        if (!user || !user.email) {
          console.error(`User not found or missing email for sendPasswordChangedNotification: ${userId}`)
          return false
        }
        const userLocale = user.locale || 'ru'
        const userName = user.name || user.email
  
        const preferences = await this.checkUserNotificationPreferences(userId, 'password_changed')
  
        if (preferences.allowInApp) {
          await this.payload.create<'notifications', any>({
            collection: 'notifications',
            data: {
              user: userId,
              title: this.getNotificationTitle('password_changed'),
              message: 'Ваш пароль был успешно изменен.',
              type: 'password_changed' as any,
              isRead: false,
              metadata: { userId },
            },
          })
        }
  
          if (this.emailService && preferences.allowEmail) {
            await this.emailService.sendTemplateEmail(
              'password-changed',
              user.email,
              {
                userName,
              },
              { locale: userLocale },
            )
          }
          return true
      } catch (error) {
        console.error(`Failed to send password changed notification for user ${userId}:`, error)
        return false
      }
    }
  
    async sendEmailAddressChangedNotification(userId: string, oldEmail?: string): Promise<boolean> {
      try {
        const user = await this.payload.findByID({ collection: 'users', id: userId }) as User
        if (!user || !user.email) {
          console.error(`User not found or missing email for sendEmailAddressChangedNotification: ${userId}`)
          return false
        }
        const userLocale = user.locale || 'ru'
        const userName = user.name || user.email
  
        const preferences = await this.checkUserNotificationPreferences(userId, 'email_address_changed')
  
        if (preferences.allowInApp) {
          await this.payload.create<'notifications', any>({
            collection: 'notifications',
            data: {
              user: userId,
              title: this.getNotificationTitle('email_address_changed'),
              message: `Ваш email адрес был изменен на ${user.email}.`,
              type: 'email_address_changed' as any,
              isRead: false,
              metadata: { userId, newEmail: user.email, oldEmail },
            },
          })
        }
  
          if (this.emailService && preferences.allowEmail) {
            await this.emailService.sendTemplateEmail(
              'email-address-changed',
              user.email, // Send to new email
              {
                userName,
                newEmail: user.email,
                oldEmail: oldEmail,
              },
              { locale: userLocale },
            )
            // Security alert to old email
            if (oldEmail && oldEmail !== user.email) {
              await this.emailService.sendTemplateEmail(
                'email-address-change-security-alert', // Needs a specific template
                oldEmail,
                {
                  userName, // Or a generic greeting
                  newEmail: user.email,
                },
                { locale: userLocale }, // Or default to a common locale for security alerts
              )
            }
          }
          return true
      } catch (error) {
        console.error(`Failed to send email address changed notification for user ${userId}:`, error)
        return false
      }
    }
  
    async sendAccountUpdatedNotification(userId: string, updatedFieldsText: string): Promise<boolean> {
      try {
        const user = await this.payload.findByID({ collection: 'users', id: userId }) as User
        if (!user || !user.email) {
          console.error(`User not found or missing email for sendAccountUpdatedNotification: ${userId}`)
          return false
        }
        const userLocale = user.locale || 'ru'
        const userName = user.name || user.email
  
        const preferences = await this.checkUserNotificationPreferences(userId, 'account_updated')
  
        if (preferences.allowInApp) {
          await this.payload.create<'notifications', any>({
            collection: 'notifications',
            data: {
              user: userId,
              title: this.getNotificationTitle('account_updated'),
              message: `Данные вашего аккаунта были обновлены: ${updatedFieldsText}.`,
              type: 'account_updated' as any,
              isRead: false,
              metadata: { userId, updatedFieldsText },
            },
          })
        }
  
          if (this.emailService && preferences.allowEmail) {
            await this.emailService.sendTemplateEmail(
              'account-updated',
              user.email,
              {
                userName,
                updatedFieldsText,
              },
              { locale: userLocale },
            )
          }
          return true
      } catch (error) {
        console.error(`Failed to send account updated notification for user ${userId}:`, error)
        return false
      }
    }

  // --- New Method for Order Shipped/Fulfilled ---
  async sendOrderShippedFulfilledNotification(orderId: string, shipmentDetails?: { trackingNumber?: string; carrier?: string; shippedAt?: string }): Promise<boolean> {
    try {
      const order = await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 1, // To populate customer
      }) as Order

      if (!order) {
        console.error(`Order not found for sendOrderShippedFulfilledNotification: ${orderId}`)
        return false
      }

      const customer = order.customer
      const userId = typeof customer === 'object' && customer !== null ? customer.id : typeof customer === 'string' ? customer : null
      const userEmail = typeof customer === 'object' && customer !== null ? customer.email : null

      if (!userId || !userEmail) {
        console.error(`Missing user data for sendOrderShippedFulfilledNotification: ${orderId}`)
        return false
      }

      const user = await this.payload.findByID({ collection: 'users', id: userId }) as User
      const userName = user?.name || userEmail
      const userLocale = user?.locale || 'ru'

      const preferences = await this.checkUserNotificationPreferences(userId, 'order_shipped_fulfilled')

      if (preferences.allowInApp) {
        await this.payload.create<'notifications', any>({
          collection: 'notifications',
          data: {
            user: userId,
            title: this.getNotificationTitle('order_shipped_fulfilled'),
            message: `Ваш заказ #${order.orderNumber} был отправлен/выполнен. ${shipmentDetails?.trackingNumber ? `Трек-номер: ${shipmentDetails.trackingNumber}` : ''}`,
            type: 'order_shipped_fulfilled' as any,
            isRead: false,
            metadata: { orderId: order.id, orderNumber: order.orderNumber, ...shipmentDetails },
          },
        })
      }

      if (this.emailService && preferences.allowEmail) {
        await this.emailService.sendTemplateEmail(
          'order-shipped-fulfilled',
          userEmail,
          {
            userName,
            orderNumber: order.orderNumber,
            items: order.items?.map(item => ({ name: typeof item.product === 'object' ? (item.product as any)?.title : 'Товар', quantity: item.quantity })),
            ...shipmentDetails,
          },
          { locale: userLocale },
        )
      }
      return true
    } catch (error) {
      console.error(`Failed to send order shipped/fulfilled notification for ${orderId}:`, error)
      return false
    }
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
