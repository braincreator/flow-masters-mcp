import { Payload } from 'payload'
import { BaseService } from './base.service'
import { EmailService } from './email.service'
import { TelegramService } from './telegram.service'
import { Order, Subscription, User, SubscriptionPlan, Notification } from '../payload-types'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import { getTranslations } from 'next-intl/server'
import { NotificationStoredType } from '../types/notifications'

export type NotificationEventType =
  | 'account_welcome'
  | 'welcome_email'
  | 'account_password_changed'
  | 'password_changed'
  | 'account_email_changed'
  | 'email_address_changed'
  | 'account_details_updated'
  | 'account_updated'
  | 'course_enrolled'
  | 'lesson_completed'
  | 'module_completed'
  | 'assessment_submitted'
  | 'assessment_graded'
  | 'course_completed'
  | 'certificate_issued'
  | 'achievement_unlocked'
  | 'level_up'
  | 'order_created'
  | 'order_paid'
  | 'order_payment_failed'
  | 'payment_failed'
  | 'order_shipped_fulfilled'
  | 'order_cancelled'
  | 'order_refunded'
  | 'refund_processed'
  | 'order_completed'
  | 'download_ready'
  | 'payment_confirmed'
  | 'order_confirmation'
  | 'initial_payment_failed'
  | 'order_status'
  | 'subscription_activated'
  | 'subscription_cancelled'
  | 'subscription_payment_failed'
  | 'subscription_plan_changed'
  | 'subscription_paused'
  | 'subscription_resumed'
  | 'subscription_expired'
  | 'subscription_renewal_reminder'
  | 'subscription_renewed_successfully'
  | 'billing_alert'
  | 'newsletter_subscribed'
  | 'promotional_message'
  | 'abandoned_cart'
  | 'comment_new'
  | 'comment_reply'
  | 'comment_mention'
  | 'system_alert'
  | 'general_info'
  | 'account'
  | 'courses'
  | 'achievements'
  | 'comments'
  | 'newsletter'
  | 'marketing'
  | 'billing_alerts'
  | 'subscription_updates'
  | 'order_updates'
  | 'refund_notifications'
  | 'renewal_reminders'

export interface NotificationPayload {
  userId: string
  user?: User
  title: string
  messageKey: string
  messageParams?: Record<string, any>
  type: NotificationEventType
  link?: string
  metadata?: Record<string, any>
  locale?: string
  emailSpecific?: {
    templateSlug: string
    templateContext: Record<string, any>
  }
  inAppSpecific?: {}
}

export interface INotificationChannel {
  channelType: 'email' | 'inApp' | 'sms' | 'push' | string
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
      let storedNotificationType: NotificationStoredType = NotificationStoredType.GENERAL_INFO

      const eventToStoredTypeMap: Partial<Record<NotificationEventType, NotificationStoredType>> = {
        course_enrolled: NotificationStoredType.COURSE_ENROLLED,
        lesson_completed: NotificationStoredType.LESSON_COMPLETED,
        module_completed: NotificationStoredType.MODULE_COMPLETED,
        assessment_submitted: NotificationStoredType.ASSESSMENT_SUBMITTED,
        assessment_graded: NotificationStoredType.ASSESSMENT_GRADED,
        course_completed: NotificationStoredType.COURSE_COMPLETED,
        certificate_issued: NotificationStoredType.CERTIFICATE_ISSUED,
        achievement_unlocked: NotificationStoredType.ACHIEVEMENT_UNLOCKED,
        level_up: NotificationStoredType.LEVEL_UP,
        account_welcome: NotificationStoredType.ACCOUNT_ACTIVITY,
        welcome_email: NotificationStoredType.ACCOUNT_ACTIVITY,
        account_password_changed: NotificationStoredType.ACCOUNT_ACTIVITY,
        password_changed: NotificationStoredType.ACCOUNT_ACTIVITY,
        account_email_changed: NotificationStoredType.ACCOUNT_ACTIVITY,
        email_address_changed: NotificationStoredType.ACCOUNT_ACTIVITY,
        account_details_updated: NotificationStoredType.ACCOUNT_ACTIVITY,
        account_updated: NotificationStoredType.ACCOUNT_ACTIVITY,
        account: NotificationStoredType.ACCOUNT_ACTIVITY,
        order_created: NotificationStoredType.ORDER_UPDATE,
        order_paid: NotificationStoredType.ORDER_UPDATE,
        order_payment_failed: NotificationStoredType.ORDER_UPDATE,
        payment_failed: NotificationStoredType.ORDER_UPDATE,
        order_shipped_fulfilled: NotificationStoredType.ORDER_UPDATE,
        order_cancelled: NotificationStoredType.ORDER_UPDATE,
        order_refunded: NotificationStoredType.ORDER_UPDATE,
        refund_processed: NotificationStoredType.ORDER_UPDATE,
        download_ready: NotificationStoredType.ORDER_UPDATE,
        payment_confirmed: NotificationStoredType.ORDER_UPDATE,
        order_confirmation: NotificationStoredType.ORDER_UPDATE,
        initial_payment_failed: NotificationStoredType.ORDER_UPDATE,
        order_status: NotificationStoredType.ORDER_UPDATE,
        order_updates: NotificationStoredType.ORDER_UPDATE,
        refund_notifications: NotificationStoredType.ORDER_UPDATE,
        subscription_activated: NotificationStoredType.SUBSCRIPTION_UPDATE,
        subscription_cancelled: NotificationStoredType.SUBSCRIPTION_UPDATE,
        subscription_payment_failed: NotificationStoredType.SUBSCRIPTION_UPDATE,
        subscription_plan_changed: NotificationStoredType.SUBSCRIPTION_UPDATE,
        subscription_paused: NotificationStoredType.SUBSCRIPTION_UPDATE,
        subscription_resumed: NotificationStoredType.SUBSCRIPTION_UPDATE,
        subscription_expired: NotificationStoredType.SUBSCRIPTION_UPDATE,
        subscription_renewal_reminder: NotificationStoredType.SUBSCRIPTION_UPDATE,
        subscription_renewed_successfully: NotificationStoredType.SUBSCRIPTION_UPDATE,
        subscription_updates: NotificationStoredType.SUBSCRIPTION_UPDATE,
        renewal_reminders: NotificationStoredType.SUBSCRIPTION_UPDATE,
        billing_alert: NotificationStoredType.SYSTEM_ALERT,
        system_alert: NotificationStoredType.SYSTEM_ALERT,
        billing_alerts: NotificationStoredType.SYSTEM_ALERT,
        newsletter_subscribed: NotificationStoredType.PROMOTIONAL,
        promotional_message: NotificationStoredType.PROMOTIONAL,
        abandoned_cart: NotificationStoredType.PROMOTIONAL,
        newsletter: NotificationStoredType.PROMOTIONAL,
        marketing: NotificationStoredType.PROMOTIONAL,
        general_info: NotificationStoredType.GENERAL_INFO,
        comment_new: NotificationStoredType.SOCIAL_INTERACTION,
        comment_reply: NotificationStoredType.SOCIAL_INTERACTION,
        comment_mention: NotificationStoredType.SOCIAL_INTERACTION,
        comments: NotificationStoredType.SOCIAL_INTERACTION,
        courses: NotificationStoredType.GENERAL_INFO,
        achievements: NotificationStoredType.ACHIEVEMENT_UNLOCKED,
      }

      const mappedType = eventToStoredTypeMap[data.type]
      if (mappedType) {
        storedNotificationType = mappedType
      } else {
        console.warn(
          `InAppNotificationChannel: EventType "${data.type}" not explicitly mapped. Defaulting to "${storedNotificationType}". Consider adding it to eventToStoredTypeMap.`,
        )
      }

      console.log(
        `Creating notification: EventType=${data.type}, Mapped StoredType=${storedNotificationType}`,
      )

      const notificationDataToCreate: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'> = {
        user: data.userId,
        title: data.title,
        messageKey: data.messageKey,
        messageParams: data.messageParams,
        type: storedNotificationType as Notification['type'],
        isRead: false,
        link: data.link,
        metadata: data.metadata,
      }

      await this.payload.create({
        collection: 'notifications',
        data: notificationDataToCreate,
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
    const localeForEmail = data.locale || data.user?.locale || 'en'

    if (!data.emailSpecific?.templateSlug) {
      console.error(
        `Email channel: Template slug not provided for user ${data.userId}, type ${data.type}`,
      )
      try {
        const tGlobal = await getTranslations({ locale: localeForEmail })
        const translatedMessage = data.messageKey
          ? tGlobal(data.messageKey, data.messageParams)
          : 'Notification content unavailable.'

        await this.emailService.sendTemplateEmail(
          'notification',
          data.user.email,
          {
            title: data.title,
            message: translatedMessage,
            type: data.type,
            link: data.link,
            ...(data.metadata || {}),
          },
          { locale: localeForEmail },
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
        { locale: localeForEmail },
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
  private emailService: EmailService | null = null
  private telegramService: TelegramService | null = null
  private channels: INotificationChannel[] = []

  private constructor(payload: Payload) {
    super(payload)
    this.emailService = EmailService.getInstance(payload)
    this.telegramService = TelegramService.getInstance(payload)

    this.channels.push(new InAppNotificationChannel(payload))
    if (this.emailService) {
      this.channels.push(new EmailNotificationChannel(this.emailService))
    }
  }

  public static getInstance(payload: Payload): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(payload)
    }
    return NotificationService.instance
  }

  private async getSubscriptionContext(subscriptionId: string): Promise<{
    subscription: Subscription | null
    user: User | null
    plan: SubscriptionPlan | null
  }> {
    try {
      const subscription = (await this.payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
        depth: 1,
      })) as unknown as Subscription

      if (!subscription) return { subscription: null, user: null, plan: null }

      const user =
        typeof subscription.user === 'object' && subscription.user !== null
          ? (subscription.user as User)
          : null
      const plan =
        typeof subscription.plan === 'object' && subscription.plan !== null
          ? (subscription.plan as SubscriptionPlan)
          : null

      if (!user && typeof subscription.user === 'string') {
        console.warn(`User object not populated for subscription ${subscriptionId} despite depth=1`)
      }
      if (!plan && typeof subscription.plan === 'string') {
        console.warn(`Plan object not populated for subscription ${subscriptionId} despite depth=1`)
      }

      return { subscription, user, plan }
    } catch (error) {
      console.error(`Error fetching context for subscription ${subscriptionId}:`, error)
      return { subscription: null, user: null, plan: null }
    }
  }

  async sendSubscriptionActivated(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan) {
      console.error(`Missing data for sendSubscriptionActivated: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'en'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'subscription_activated',
      messageKey: 'NotificationBodies.subscription_activated_detail',
      messageParams: { planName: plan.name },
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
      return results.some((result) => result === true)
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
    const userLocale = user.locale || 'en'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'subscription_cancelled',
      messageKey: 'NotificationBodies.subscription_cancelled_detail',
      messageParams: { planName: plan.name },
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
      return results.some((result) => result === true)
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
    const userLocale = user.locale || 'en'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'subscription_payment_failed',
      messageKey: 'NotificationBodies.subscription_payment_failed_detail',
      messageParams: { planName: plan.name },
      type: 'subscription_payment_failed',
      locale: userLocale,
      metadata: {
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
        nextPaymentAttempt: subscription.expiresAt,
      },
      emailSpecific: {
        templateSlug: 'subscription-payment-failed',
        templateContext: {
          userName,
          planName: plan.name,
          nextPaymentDate: subscription.expiresAt as string,
          amount: plan.price,
          currency: plan.currency,
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some((result) => result === true)
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
    const userLocale = user.locale || 'en'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'subscription_plan_changed',
      messageKey: 'NotificationBodies.subscription_plan_changed_detail',
      messageParams: { oldPlanName: oldPlanName, newPlanName: newPlan.name },
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
          effectiveDate: new Date().toISOString(),
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some((result) => result === true)
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
    const userLocale = user.locale || 'en'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'subscription_paused',
      messageKey: 'NotificationBodies.subscription_paused_detail',
      messageParams: { planName: plan.name },
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
      return results.some((result) => result === true)
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
    const userLocale = user.locale || 'en'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'subscription_resumed',
      messageKey: 'NotificationBodies.subscription_resumed_detail',
      messageParams: { planName: plan.name },
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
      return results.some((result) => result === true)
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
    const userLocale = user.locale || 'en'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'subscription_expired',
      messageKey: 'NotificationBodies.subscription_expired_detail',
      messageParams: { planName: plan.name },
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
      return results.some((result) => result === true)
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
    let fetchedUser: User | null = null
    let userIdForNotification: string | null = null
    let finalUserLocale = orderData.locale || 'en'
    let finalUserName = ''
    let finalUserEmail = orderData.customerEmail

    try {
      const order = (await this.payload.findByID({
        collection: 'orders',
        id: orderData.orderId,
        depth: 0,
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
    }

    const orderItems = (orderData.items || []).map((item) => ({
      name: item.name || 'Product',
      description: '',
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      type: item.type || 'product',
      id: item.product,
    }))

    let userNotificationSent = false
    if (userIdForNotification) {
      const notificationPayload: NotificationPayload = {
        userId: userIdForNotification,
        user: fetchedUser || undefined,
        title: 'payment_confirmed',
        messageKey: 'NotificationBodies.payment_confirmed_detail',
        messageParams: { orderNumber: orderData.orderNumber },
        type: 'payment_confirmed',
        locale: finalUserLocale,
        metadata: {
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          total: orderData.total,
          currency: orderData.currency,
        },
        emailSpecific: {
          templateSlug: 'payment-confirmation',
          templateContext: {
            userName: finalUserName || finalUserEmail,
            email: finalUserEmail,
            orderNumber: orderData.orderNumber,
            paymentDate: new Date().toISOString(),
            paymentAmount: orderData.total,
            currency: orderData.currency,
            paymentMethod: orderData.paymentMethod,
            transactionId: orderData.paymentId,
            purchasedItems: orderItems.map((item) => ({
              name: item.name,
              type: item.type as 'course' | 'product' | 'subscription' | 'other',
              id: item.id,
            })),
          },
        },
      }
      try {
        const results = await this.sendNotification(notificationPayload)
        userNotificationSent = results.some((r) => r === true)
      } catch (e) {
        console.error(
          `Failed to dispatch payment confirmation for user ${userIdForNotification}:`,
          e,
        )
      }
    } else {
      if (this.emailService && orderData.customerEmail) {
        console.log(
          `No user ID for order ${orderData.orderId}, attempting direct email to ${orderData.customerEmail}`,
        )
        try {
          await this.emailService.sendPaymentConfirmationEmail({
            userName: orderData.customerEmail,
            email: orderData.customerEmail,
            orderNumber: orderData.orderNumber,
            paymentDate: new Date().toISOString(),
            paymentAmount: orderData.total,
            currency: orderData.currency,
            paymentMethod: orderData.paymentMethod,
            transactionId: orderData.paymentId,
            locale: finalUserLocale,
            purchasedItems: orderItems.map((item) => ({
              name: item.name,
              type: item.type as 'course' | 'product' | 'subscription' | 'other',
              id: item.id,
            })),
          })
          userNotificationSent = true
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

    if (this.telegramService) {
      try {
        await this.telegramService.sendMessage(
          `💰 Новый оплаченный заказ!\n` +
            `Номер заказа: ${orderData.orderNumber}\n` +
            `Сумма: ${orderData.total} ${orderData.currency}\n` +
            `Email клиента: ${finalUserEmail || 'Неизвестен'}`,
        )
      } catch (telegramError) {
        console.error(`Failed to send Telegram payment confirmation:`, telegramError)
      }
    }

    return userNotificationSent
  }

  async sendDigitalOrderStatusUpdate(orderData: {
    orderId: string
    status: string
    customerEmail?: string
    downloadLinks?: string[]
  }): Promise<boolean> {
    if (!orderData.orderId || !orderData.status) {
      console.error('Invalid order data for status update notification')
      return false
    }

    let fetchedUser: User | null = null
    let userIdForNotification: string | null = null
    let finalUserLocale = 'en'
    let finalUserName = ''
    let finalUserEmail = orderData.customerEmail

    let orderNumberForMessage = orderData.orderId

    try {
      const order = (await this.payload.findByID({
        collection: 'orders',
        id: orderData.orderId,
        depth: 0,
      })) as Order | null

      if (!order) {
        console.error(`Order not found for status update: ${orderData.orderId}`)
        if (!orderData.customerEmail) return false
      } else {
        orderNumberForMessage = order.orderNumber || order.id
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
              console.error(
                `Could not fetch user ${userIdForNotification} for status update:`,
                userFetchErr,
              )
            }
          }
        }
      }
    } catch (fetchError) {
      console.error(
        `Error getting order/user details for status update (orderId: ${orderData.orderId}):`,
        fetchError,
      )
      if (!orderData.customerEmail && !userIdForNotification) return false
    }

    if (!userIdForNotification && !finalUserEmail) {
      console.error(
        `Cannot send status update for order ${orderData.orderId}: No user ID or customer email.`,
      )
      return false
    }

    let titleKey = 'order_status'
    let messageKey = 'NotificationBodies.order_status_update_detail'
    let messageParams: Record<string, any> = {
      orderNumber: orderNumberForMessage,
      status: orderData.status,
    }
    let notificationType: NotificationEventType = 'order_status'
    let emailTemplateSlug: string | null = null
    const emailTemplateContext: Record<string, any> = {
      orderNumber: orderNumberForMessage,
      userName: finalUserName || finalUserEmail,
    }

    switch (orderData.status) {
      case 'ready_for_download':
        titleKey = 'download_ready'
        messageKey = 'NotificationBodies.download_ready_detail'
        messageParams = { orderNumber: orderNumberForMessage }
        notificationType = 'download_ready'
        emailTemplateSlug = 'digital_product_ready'
        emailTemplateContext.downloadLinks = orderData.downloadLinks || []
        break
      case 'completed':
        titleKey = 'order_completed'
        messageKey = 'NotificationBodies.order_completed_detail'
        messageParams = { orderNumber: orderNumberForMessage }
        notificationType = 'order_completed'
        emailTemplateSlug = 'order_completed'
        break
    }

    let userNotificationSent = false
    if (userIdForNotification) {
      const notificationPayload: NotificationPayload = {
        userId: userIdForNotification,
        user: fetchedUser || undefined,
        title: titleKey,
        messageKey: messageKey,
        messageParams: messageParams,
        type: notificationType as NotificationEventType,
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
        userNotificationSent = results.some((r) => r === true)
      } catch (e) {
        console.error(
          `Failed to dispatch status update for user ${userIdForNotification}, order ${orderData.orderId}:`,
          e,
        )
      }
    } else if (finalUserEmail && emailTemplateSlug && this.emailService) {
      console.log(
        `No user ID for order ${orderData.orderId}, attempting direct email for status ${orderData.status} to ${finalUserEmail}`,
      )
      try {
        const localizedTitle = await this.getNotificationTitle(notificationType, finalUserLocale)
        emailTemplateContext.title = localizedTitle

        await this.emailService.sendTemplateEmail(
          emailTemplateSlug,
          finalUserEmail,
          emailTemplateContext,
          { locale: finalUserLocale },
        )
        userNotificationSent = true
      } catch (emailError) {
        console.error(
          `Failed to send direct status update email to ${finalUserEmail} for order ${orderData.orderId}:`,
          emailError,
        )
      }
    } else {
      console.warn(
        `Could not send digital order status update for order ${orderData.orderId}. No user ID and insufficient data for direct email.`,
      )
    }

    return userNotificationSent
  }

  async sendAbandonedCartReminder(cartData: {
    user: User
    items: Array<{ product: { title: string }; quantity: number; price: number }>
    total: number
    currency: string
    lastUpdated: Date
  }): Promise<boolean> {
    const { user, items, total, currency, lastUpdated } = cartData

    if (!user || !user.id || !user.email) {
      console.error('Abandoned cart reminder: User ID or email missing.')
      return false
    }

    const userLocale = user.locale || 'en'
    const userName = user.name || user.email

    const emailTemplateContext = {
      userName,
      items: items.map((item) => ({
        title: item.product.title,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      currency,
      lastUpdated: lastUpdated.toLocaleDateString(userLocale),
      cartUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
    }

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'abandoned_cart',
      messageKey: 'NotificationBodies.abandoned_cart_detail',
      messageParams: { itemCount: items.length },
      type: 'abandoned_cart',
      locale: userLocale,
      metadata: emailTemplateContext,
      emailSpecific: {
        templateSlug: 'abandoned-cart',
        templateContext: emailTemplateContext,
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      if (!results.some((r) => r === true)) {
        console.warn(`Abandoned cart reminder for user ${user.id} was not sent via any channel.`)
        return false
      }
      return true
    } catch (error) {
      console.error(`Failed to dispatch abandoned cart reminder for user ${user.id}:`, error)
      return false
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.payload.update({
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
    // Consider returning PaginatedDocs<Notification>
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

  async checkUserNotificationPreferences(
    userId: string,
    notificationType: NotificationEventType,
    channelType?: INotificationChannel['channelType'],
  ): Promise<{
    allowInApp: boolean
    allowEmail: boolean
    allowPush: boolean
    allowSms: boolean
    [key: string]: boolean
  }> {
    const defaults = {
      allowInApp: true,
      allowEmail: true,
      allowPush: false,
      allowSms: false,
    }

    try {
      const user = await this.payload.findByID({
        collection: 'users',
        id: userId,
        depth: 0,
      })

      if (!user) {
        console.warn(`User not found for preferences check: ${userId}`)
        return defaults
      }

      if (user.notificationFrequency === 'never') {
        return {
          ...defaults,
          allowEmail: false,
          allowPush: false,
          allowSms: false,
        }
      }

      const userNotificationPrefs = user.notificationPreferences as
        | {
            email?: {
              orderUpdates?: boolean
              subscriptionUpdates?: boolean
              accountActivity?: boolean
              marketingAndPromotions?: boolean
              productNewsAndTips?: boolean
            }
          }
        | undefined

      let emailAllowed = false

      const emailCategoryDefaults = {
        orderUpdates: true,
        subscriptionUpdates: true,
        accountActivity: true,
        marketingAndPromotions: false,
        productNewsAndTips: false,
      }

      type EmailPreferenceKey = keyof typeof emailCategoryDefaults
      let mappedPreferenceKey: EmailPreferenceKey | null = null

      const orderUpdateTypes: NotificationEventType[] = [
        'order_created',
        'order_paid',
        'order_payment_failed',
        'order_shipped_fulfilled',
        'order_cancelled',
        'order_refunded',
        'refund_processed',
        'order_completed',
        'download_ready',
        'payment_confirmed',
        'order_confirmation',
        'initial_payment_failed',
        'order_status',
        'order_updates',
        'refund_notifications',
        'system_alert',
        'billing_alert',
        'billing_alerts',
      ]
      const subscriptionUpdateTypes: NotificationEventType[] = [
        'subscription_activated',
        'subscription_cancelled',
        'subscription_payment_failed',
        'subscription_plan_changed',
        'subscription_paused',
        'subscription_resumed',
        'subscription_expired',
        'subscription_renewal_reminder',
        'subscription_renewed_successfully',
        'subscription_updates',
        'renewal_reminders',
        'payment_failed',
      ]
      const accountActivityTypes: NotificationEventType[] = [
        'account_welcome',
        'welcome_email',
        'account_password_changed',
        'password_changed',
        'account_email_changed',
        'email_address_changed',
        'account_details_updated',
        'account_updated',
        'achievement_unlocked',
        'level_up',
        'certificate_issued',
        'comment_reply',
        'comment_mention',
        'comment_new',
        'account',
        'achievements',
        'comments',
      ]
      const marketingAndPromotionsTypes: NotificationEventType[] = [
        'newsletter_subscribed',
        'promotional_message',
        'abandoned_cart',
        'newsletter',
        'marketing',
      ]
      const productNewsAndTipsTypes: NotificationEventType[] = [
        'course_enrolled',
        'lesson_completed',
        'module_completed',
        'assessment_submitted',
        'assessment_graded',
        'course_completed',
        'courses',
        'general_info',
      ]

      if (orderUpdateTypes.includes(notificationType)) {
        mappedPreferenceKey = 'orderUpdates'
      } else if (subscriptionUpdateTypes.includes(notificationType)) {
        mappedPreferenceKey = 'subscriptionUpdates'
      } else if (accountActivityTypes.includes(notificationType)) {
        mappedPreferenceKey = 'accountActivity'
      } else if (marketingAndPromotionsTypes.includes(notificationType)) {
        mappedPreferenceKey = 'marketingAndPromotions'
      } else if (productNewsAndTipsTypes.includes(notificationType)) {
        mappedPreferenceKey = 'productNewsAndTips'
      }

      if (mappedPreferenceKey && userNotificationPrefs?.email) {
        const preferenceValue = userNotificationPrefs.email[mappedPreferenceKey]
        if (typeof preferenceValue === 'boolean') {
          emailAllowed = preferenceValue
        } else {
          emailAllowed = emailCategoryDefaults[mappedPreferenceKey] ?? false
          this.payload.logger.warn(
            `Email preference for "${mappedPreferenceKey}" was undefined for user ${userId}. Used schema default: ${emailAllowed}.`,
          )
        }
      } else if (mappedPreferenceKey) {
        emailAllowed = emailCategoryDefaults[mappedPreferenceKey] ?? false
        this.payload.logger.warn(
          `User's email preferences structure (user.notificationPreferences.email) was missing or incomplete for user ${userId} while checking for "${mappedPreferenceKey}". Used schema default: ${emailAllowed}.`,
        )
      } else {
        this.payload.logger.warn(
          `Notification type "${notificationType}" not mapped to a known email preference category for user ${userId}. Email will be disabled for this type.`,
        )
        emailAllowed = false
      }

      const finalPreferences: { [key: string]: boolean } = {
        allowInApp: defaults.allowInApp,
        allowEmail: emailAllowed,
        allowPush: defaults.allowPush,
        allowSms: defaults.allowSms,
      }

      if (channelType) {
        const singleChannelPrefKey = `allow${channelType.charAt(0).toUpperCase() + channelType.slice(1)}`
        const defaultChannelValue =
          (defaults as Record<string, boolean>)[singleChannelPrefKey] ??
          (channelType === 'inApp' ? true : false)
        return {
          ...defaults,
          [singleChannelPrefKey]: finalPreferences[singleChannelPrefKey] ?? defaultChannelValue,
        }
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
      return defaults
    }
  }

  async sendNotification(data: NotificationPayload): Promise<boolean[]> {
    let userForPrefs = data.user
    if (!userForPrefs) {
      try {
        userForPrefs = await this.payload.findByID({
          collection: 'users',
          id: data.userId,
          depth: 0,
        })
      } catch (e) {
        console.error(`sendNotification: Could not fetch user ${data.userId} for preferences.`)
        return this.channels.map(() => false)
      }
    }
    if (!userForPrefs) {
      console.error(`sendNotification: User ${data.userId} not found. Cannot send notification.`)
      return this.channels.map(() => false)
    }

    const notificationLocale = data.locale || userForPrefs.locale || 'en'
    const localizedTitle = await this.getNotificationTitle(data.type, notificationLocale)

    const payloadWithUserAndLocale: NotificationPayload = {
      ...data,
      user: userForPrefs,
      title: localizedTitle,
      locale: notificationLocale,
    }

    const results: boolean[] = []

    for (const channel of this.channels) {
      try {
        const preferences = await this.checkUserNotificationPreferences(
          payloadWithUserAndLocale.userId,
          payloadWithUserAndLocale.type,
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
            const prefKey = `allow${channel.channelType.charAt(0).toUpperCase() + channel.channelType.slice(1)}`
            shouldSendViaChannel = preferences[prefKey] === true
        }

        if (shouldSendViaChannel) {
          const success = await channel.send(payloadWithUserAndLocale, this)
          results.push(success)
          if (success) {
            console.log(
              `Notification sent via ${channel.channelType} to user ${payloadWithUserAndLocale.userId}: ${payloadWithUserAndLocale.title}`,
            )
          } else {
            console.warn(
              `Failed to send notification via ${channel.channelType} to user ${payloadWithUserAndLocale.userId}: ${payloadWithUserAndLocale.title}`,
            )
          }
        } else {
          results.push(false)
        }
      } catch (error) {
        console.error(
          `Error processing channel ${channel.channelType} for user ${payloadWithUserAndLocale.userId}:`,
          error,
        )
        results.push(false)
      }
    }
    return results
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const whereClause: Where = {
      // Renamed to avoid conflict if 'where' is a keyword in a broader scope
      user: {
        equals: userId,
      },
      isRead: {
        equals: false,
      },
    }
    try {
      await this.payload.update({
        collection: 'notifications',
        where: whereClause,
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

  private async getNotificationTitle(
    type: NotificationEventType,
    locale: string = 'en',
  ): Promise<string> {
    try {
      const t = await getTranslations({ locale, namespace: 'NotificationTitles' })
      let titleKey = type as string
      if (type === 'welcome_email') titleKey = 'account_welcome'
      if (type === 'password_changed') titleKey = 'account_password_changed'
      if (type === 'email_address_changed') titleKey = 'account_email_changed'
      if (type === 'account_updated') titleKey = 'account_details_updated'
      if (type === 'refund_processed') titleKey = 'order_refunded'
      if (type === 'payment_failed' && type.startsWith('subscription'))
        titleKey = 'subscription_payment_failed'
      else if (type === 'payment_failed') titleKey = 'order_payment_failed'

      let translatedTitle = t(titleKey)

      if (translatedTitle === titleKey) {
        const genericTitleMap: Partial<Record<NotificationEventType, string>> = {
          account: 'account_details_updated',
          courses: 'general_info',
          achievements: 'achievement_unlocked',
          comments: 'comment_new',
          newsletter: 'newsletter_subscribed',
          marketing: 'promotional_message',
          billing_alerts: 'billing_alert',
          subscription_updates: 'subscription_activated',
          order_updates: 'order_status',
          refund_notifications: 'order_refunded',
          renewal_reminders: 'subscription_renewal_reminder',
        }
        if (genericTitleMap[type]) {
          translatedTitle = t(genericTitleMap[type]!)
        } else {
          translatedTitle = t('default')
        }
      }
      return translatedTitle
    } catch (error) {
      console.error(`Error getting notification title for type ${type}, locale ${locale}:`, error)
      const fallbackTitles: Record<string, string> = {
        order_confirmation: 'Order Confirmed',
        subscription_activated: 'Subscription Activated',
        default: 'New Notification',
      }
      const fallbackTitle = fallbackTitles[type as string]
      return fallbackTitle ?? fallbackTitles.default ?? 'New Notification'
    }
  }

  async sendOrderConfirmation(order: Order): Promise<boolean> {
    const customer = order.customer
    const userIdValue = // Renamed to avoid conflict with function parameter 'userId' in other methods
      typeof customer === 'object' && customer !== null
        ? customer.id
        : typeof customer === 'string'
          ? customer
          : null

    if (!userIdValue) {
      console.error('Cannot send order confirmation: User ID not found in order.')
      return false
    }

    let user: User | undefined = undefined
    if (typeof customer === 'object' && customer !== null) {
      user = customer as User
    } else if (typeof customer === 'string') {
      try {
        user = (await this.payload.findByID({
          collection: 'users',
          id: customer,
          depth: 0,
        })) as User
      } catch (e) {
        console.warn(`Could not fetch user object for order confirmation: ${customer}`)
      }
    }

    const userLocale = user?.locale || 'en'
    const userName = user?.name || user?.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: userIdValue,
      user,
      title: 'order_confirmation',
      messageKey: 'NotificationBodies.order_confirmation_detail',
      messageParams: { orderNumber: order.orderNumber || order.id },
      type: 'order_confirmation',
      locale: userLocale,
      link: `/account/orders/${order.id}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber || order.id,
        total:
          userLocale === 'en' && order.total.en
            ? order.total.en.amount
            : order.total.ru
              ? order.total.ru.amount
              : 0,
        currency:
          userLocale === 'en' && order.total.en
            ? order.total.en.currency
            : order.total.ru
              ? order.total.ru.currency
              : 'USD',
      },
      emailSpecific: {
        templateSlug: 'order-confirmation',
        templateContext: {
          userName,
          orderNumber: order.orderNumber || order.id,
          orderDate: order.createdAt,
          total:
            userLocale === 'en' && order.total.en
              ? order.total.en.amount
              : order.total.ru
                ? order.total.ru.amount
                : 0,
          currency:
            userLocale === 'en' && order.total.en
              ? order.total.en.currency
              : order.total.ru
                ? order.total.ru.currency
                : 'USD',
          items: order.items?.map((item) => ({
            name: typeof item.product === 'object' ? (item.product as any)?.title : 'Product',
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some((result) => result === true)
    } catch (error) {
      console.error(`Failed to dispatch order confirmation for order ${order.id}:`, error)
      return false
    }
  }

  async sendPaymentFailed(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan) {
      console.error(`Missing data for sendPaymentFailed (direct call): ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'en'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'payment_failed',
      messageKey: 'NotificationBodies.payment_failed_subscription_detail',
      messageParams: { planName: plan.name },
      type: 'payment_failed',
      locale: userLocale,
      link: `/account/subscriptions/${subscription.id}`,
      metadata: {
        subscriptionId: subscription.id,
        planId: plan.id,
        planName: plan.name,
      },
      emailSpecific: {
        templateSlug: 'subscription-payment-failed',
        templateContext: {
          userName,
          planName: plan.name,
          nextPaymentDate: subscription.expiresAt as string,
        },
      },
    }
    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some((result) => result === true)
    } catch (error) {
      console.error(
        `Failed to dispatch payment failed notification for subscription ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendOrderCancelledNotification(
    orderId: string,
    cancellationReason?: string,
  ): Promise<boolean> {
    let fetchedUser: User | null = null
    let userIdForNotification: string | null = null
    let finalUserLocale = 'en'
    let finalUserName = ''
    let finalUserEmail: string | null = null
    let orderNumberForMessage = orderId

    try {
      const order = (await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
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
              depth: 0,
            })) as User
            if (fetchedUser) {
              finalUserLocale = fetchedUser.locale || finalUserLocale
              finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
              finalUserEmail = fetchedUser.email
            }
          } catch (userFetchErr) {
            console.error(
              `Could not fetch user ${userIdForNotification} for order cancellation:`,
              userFetchErr,
            )
          }
        }
      }

      if (!userIdForNotification || !finalUserEmail) {
        console.error(`Missing user data for order cancellation notification: ${orderId}`)
        return false
      }
      const tNotificationBodies = await getTranslations({
        locale: finalUserLocale,
        namespace: 'NotificationBodies',
      })
      const reasonText =
        cancellationReason ||
        (order as any).cancellationReason ||
        tNotificationBodies('defaultCancellationReason')

      const notificationPayload: NotificationPayload = {
        userId: userIdForNotification,
        user: fetchedUser || undefined,
        title: 'order_cancelled',
        messageKey: 'NotificationBodies.order_cancelled_detail',
        messageParams: { orderNumber: orderNumberForMessage, reason: reasonText },
        type: 'order_cancelled',
        locale: finalUserLocale,
        metadata: {
          orderId: order.id,
          orderNumber: orderNumberForMessage,
          cancellationReason: reasonText,
        },
        emailSpecific: {
          templateSlug: 'order-cancelled',
          templateContext: {
            userName: finalUserName,
            orderNumber: orderNumberForMessage,
            cancellationReason: reasonText,
          },
        },
      }

      const results = await this.sendNotification(notificationPayload)
      return results.some((r) => r === true)
    } catch (error) {
      console.error(`Failed to dispatch order cancelled notification for ${orderId}:`, error)
      return false
    }
  }

  async sendRefundProcessedNotification(
    orderId: string,
    refundDetails: { amount: number; currency: string; processedAt: string },
  ): Promise<boolean> {
    let fetchedUser: User | null = null
    let userIdForNotification: string | null = null
    let finalUserLocale = 'en'
    let finalUserName = ''
    let finalUserEmail: string | null = null
    let orderNumberForMessage = orderId

    try {
      const order = (await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
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
              depth: 0,
            })) as User
            if (fetchedUser) {
              finalUserLocale = fetchedUser.locale || finalUserLocale
              finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
              finalUserEmail = fetchedUser.email
            }
          } catch (userFetchErr) {
            console.error(
              `Could not fetch user ${userIdForNotification} for refund notification:`,
              userFetchErr,
            )
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
        title: 'order_refunded',
        messageKey: 'NotificationBodies.refund_processed_detail',
        messageParams: {
          amount: refundDetails.amount,
          currency: refundDetails.currency,
          orderNumber: orderNumberForMessage,
        },
        type: 'refund_processed',
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
      return results.some((r) => r === true)
    } catch (error) {
      console.error(`Failed to dispatch refund processed notification for ${orderId}:`, error)
      return false
    }
  }

  async sendSubscriptionRenewalReminder(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan) {
      console.error(`Missing data for sendSubscriptionRenewalReminder: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'en'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'subscription_renewal_reminder',
      messageKey: 'NotificationBodies.subscription_renewal_reminder_detail',
      messageParams: {
        planName: plan.name,
        renewalDate: new Date(subscription.expiresAt as string).toLocaleDateString(userLocale),
      },
      type: 'subscription_renewal_reminder',
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
      return results.some((r) => r === true)
    } catch (error) {
      console.error(
        `Failed to dispatch subscription renewal reminder for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendSubscriptionRenewedSuccessfully(subscriptionId: string): Promise<boolean> {
    const { subscription, user, plan } = await this.getSubscriptionContext(subscriptionId)
    if (!subscription || !user || !plan) {
      console.error(`Missing data for sendSubscriptionRenewedSuccessfully: ${subscriptionId}`)
      return false
    }
    const userLocale = user.locale || 'en'
    const userName = user.name || user.email || 'Customer'

    const notificationPayload: NotificationPayload = {
      userId: user.id,
      user: user,
      title: 'subscription_renewed_successfully',
      messageKey: 'NotificationBodies.subscription_renewed_successfully_detail',
      messageParams: {
        planName: plan.name,
        nextPaymentDate: new Date(subscription.expiresAt as string).toLocaleDateString(userLocale),
      },
      type: 'subscription_renewed_successfully',
      locale: userLocale,
      metadata: {
        subscriptionId: subscription.id,
        planName: plan.name,
        nextPaymentDate: subscription.expiresAt,
      },
      emailSpecific: {
        templateSlug: 'subscription-renewed',
        templateContext: {
          userName,
          planName: plan.name,
          newExpiryDate: subscription.expiresAt as string,
        },
      },
    }

    try {
      const results = await this.sendNotification(notificationPayload)
      return results.some((r) => r === true)
    } catch (error) {
      console.error(
        `Failed to dispatch subscription renewed successfully notification for ${subscriptionId}:`,
        error,
      )
      return false
    }
  }

  async sendInitialPaymentFailedNotification(orderId: string, reason?: string): Promise<boolean> {
    let fetchedUser: User | null = null
    let userIdForNotification: string | null = null
    let finalUserLocale = 'en'
    let finalUserName = ''
    let finalUserEmail: string | null = null
    let orderNumberForMessage = orderId

    try {
      const order = (await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
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
              depth: 0,
            })) as User
            if (fetchedUser) {
              finalUserLocale = fetchedUser.locale || finalUserLocale
              finalUserName = fetchedUser.name || fetchedUser.email || 'Customer'
              finalUserEmail = fetchedUser.email
            }
          } catch (userFetchErr) {
            console.error(
              `Could not fetch user ${userIdForNotification} for initial payment failed:`,
              userFetchErr,
            )
          }
        }
      }

      if (!userIdForNotification || !finalUserEmail) {
        console.error(`Missing user data for initial payment failed notification: ${orderId}`)
        return false
      }
      const tNotificationBodies = await getTranslations({
        locale: finalUserLocale,
        namespace: 'NotificationBodies',
      })
      const reasonText = reason || tNotificationBodies('defaultPaymentFailedReason')

      const notificationPayload: NotificationPayload = {
        userId: userIdForNotification,
        user: fetchedUser || undefined,
        title: 'initial_payment_failed',
        messageKey: 'NotificationBodies.initial_payment_failed_detail',
        messageParams: {
          orderNumber: orderNumberForMessage,
          reason: reasonText,
        },
        type: 'initial_payment_failed',
        locale: finalUserLocale,
        metadata: {
          orderId: order.id,
          orderNumber: orderNumberForMessage,
          reason: reasonText,
        },
        emailSpecific: {
          templateSlug: 'initial-payment-failed',
          templateContext: {
            userName: finalUserName,
            orderNumber: orderNumberForMessage,
            failureReason: reasonText,
          },
        },
      }

      const results = await this.sendNotification(notificationPayload)
      return results.some((r) => r === true)
    } catch (error) {
      console.error(`Failed to dispatch initial payment failed notification for ${orderId}:`, error)
      return false
    }
  }

  async sendWelcomeEmail(userId: string): Promise<boolean> {
    try {
      const user = (await this.payload.findByID({
        collection: 'users',
        id: userId,
        depth: 0,
      })) as User
      if (!user || !user.email) {
        console.error(`User not found or missing email for sendWelcomeEmail: ${userId}`)
        return false
      }
      const userLocale = user.locale || 'en'
      const userName = user.name || user.email

      const notificationPayload: NotificationPayload = {
        userId,
        user,
        title: 'account_welcome',
        messageKey: 'NotificationBodies.welcome_detail',
        messageParams: { userName },
        type: 'welcome_email',
        locale: userLocale,
        link: '/account',
        metadata: { userId },
        emailSpecific: {
          templateSlug: 'welcome',
          templateContext: {
            name: userName,
            email: user.email,
          },
        },
      }

      const results = await this.sendNotification(notificationPayload)
      return results.some((result) => result === true)
    } catch (error) {
      console.error(`Failed to send welcome email for user ${userId}:`, error)
      return false
    }
  }

  async sendPasswordChangedNotification(userId: string): Promise<boolean> {
    try {
      const user = (await this.payload.findByID({
        collection: 'users',
        id: userId,
        depth: 0,
      })) as User
      if (!user || !user.email) {
        console.error(
          `User not found or missing email for sendPasswordChangedNotification: ${userId}`,
        )
        return false
      }
      const userLocale = user.locale || 'en'
      const userName = user.name || user.email

      const notificationPayload: NotificationPayload = {
        userId,
        user,
        title: 'account_password_changed',
        messageKey: 'NotificationBodies.password_changed_detail',
        messageParams: {},
        type: 'password_changed',
        locale: userLocale,
        link: '/account/security',
        metadata: { userId },
        emailSpecific: {
          templateSlug: 'password-changed',
          templateContext: {
            userName,
          },
        },
      }
      const results = await this.sendNotification(notificationPayload)
      return results.some((result) => result === true)
    } catch (error) {
      console.error(`Failed to send password changed notification for user ${userId}:`, error)
      return false
    }
  }

  async sendEmailAddressChangedNotification(userId: string, oldEmail?: string): Promise<boolean> {
    try {
      const user = (await this.payload.findByID({
        collection: 'users',
        id: userId,
        depth: 0,
      })) as User
      if (!user || !user.email) {
        console.error(
          `User not found or missing email for sendEmailAddressChangedNotification: ${userId}`,
        )
        return false
      }
      const userLocale = user.locale || 'en'
      const userName = user.name || user.email

      const notificationPayload: NotificationPayload = {
        userId,
        user,
        title: 'account_email_changed',
        messageKey: 'NotificationBodies.email_address_changed_detail',
        messageParams: { newEmail: user.email },
        type: 'email_address_changed',
        locale: userLocale,
        link: '/account/profile',
        metadata: { userId, newEmail: user.email, oldEmail },
        emailSpecific: {
          templateSlug: 'email-address-changed',
          templateContext: {
            userName,
            newEmail: user.email,
            oldEmail: oldEmail,
          },
        },
      }

      const results = await this.sendNotification(notificationPayload)
      let securityAlertSent = true

      if (oldEmail && oldEmail !== user.email && this.emailService) {
        try {
          await this.emailService.sendTemplateEmail(
            'email-address-change-security-alert',
            oldEmail,
            {
              userName: userName,
              newEmail: user.email,
            },
            { locale: userLocale },
          )
        } catch (secError) {
          console.error(`Failed to send security alert to old email ${oldEmail}:`, secError)
          securityAlertSent = false
        }
      }
      return results.some((result) => result === true) && securityAlertSent
    } catch (error) {
      console.error(`Failed to send email address changed notification for user ${userId}:`, error)
      return false
    }
  }

  async sendAccountUpdatedNotification(
    userId: string,
    updatedFieldsText: string,
  ): Promise<boolean> {
    try {
      const user = (await this.payload.findByID({
        collection: 'users',
        id: userId,
        depth: 0,
      })) as User
      if (!user || !user.email) {
        console.error(
          `User not found or missing email for sendAccountUpdatedNotification: ${userId}`,
        )
        return false
      }
      const userLocale = user.locale || 'en'
      const userName = user.name || user.email

      const notificationPayload: NotificationPayload = {
        userId,
        user,
        title: 'account_details_updated',
        messageKey: 'NotificationBodies.account_updated_detail',
        messageParams: { updatedFieldsText },
        type: 'account_updated',
        locale: userLocale,
        link: '/account/profile',
        metadata: { userId, updatedFieldsText },
        emailSpecific: {
          templateSlug: 'account-updated',
          templateContext: {
            userName,
            updatedFieldsText,
          },
        },
      }

      const results = await this.sendNotification(notificationPayload)
      return results.some((result) => result === true)
    } catch (error) {
      console.error(`Failed to send account updated notification for user ${userId}:`, error)
      return false
    }
  }

  async sendOrderShippedFulfilledNotification(
    orderId: string,
    shipmentDetails?: { trackingNumber?: string; carrier?: string; shippedAt?: string },
  ): Promise<boolean> {
    try {
      const order = (await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
      })) as Order

      if (!order) {
        console.error(`Order not found for sendOrderShippedFulfilledNotification: ${orderId}`)
        return false
      }

      const customer = order.customer
      const userIdValue =
        typeof customer === 'object' && customer !== null
          ? customer.id
          : typeof customer === 'string'
            ? customer
            : null
      const userEmail = typeof customer === 'object' && customer !== null ? customer.email : null

      if (!userIdValue || !userEmail) {
        console.error(`Missing user data for sendOrderShippedFulfilledNotification: ${orderId}`)
        return false
      }

      const user = (await this.payload.findByID({
        collection: 'users',
        id: userIdValue,
        depth: 0,
      })) as User
      const userName = user?.name || userEmail
      const userLocale = user?.locale || 'en'

      let resolvedMessageKey = 'NotificationBodies.order_shipped_fulfilled_detail_no_tracking'
      const resolvedMessageParams: Record<string, any> = {
        orderNumber: order.orderNumber || order.id,
      }

      if (shipmentDetails?.trackingNumber) {
        resolvedMessageKey = 'NotificationBodies.order_shipped_fulfilled_detail_with_tracking'
        resolvedMessageParams.trackingNumber = shipmentDetails.trackingNumber
      }

      const notificationPayload: NotificationPayload = {
        userId: userIdValue,
        user,
        title: 'order_shipped_fulfilled',
        messageKey: resolvedMessageKey,
        messageParams: resolvedMessageParams,
        type: 'order_shipped_fulfilled',
        locale: userLocale,
        link: `/account/orders/${order.id}`,
        metadata: { orderId: order.id, orderNumber: order.orderNumber, ...shipmentDetails },
        emailSpecific: {
          templateSlug: 'order-shipped-fulfilled',
          templateContext: {
            userName,
            orderNumber: order.orderNumber,
            items: order.items?.map((item) => ({
              name: typeof item.product === 'object' ? (item.product as any)?.title : 'Товар',
              quantity: item.quantity,
            })),
            ...shipmentDetails,
          },
        },
      }

      const results = await this.sendNotification(notificationPayload)
      return results.some((result) => result === true)
    } catch (error) {
      console.error(`Failed to send order shipped/fulfilled notification for ${orderId}:`, error)
      return false
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const notification = (await this.payload.findByID({
        collection: 'notifications',
        id: notificationId,
        depth: 0,
      })) as Notification | null // Added type assertion

      if (
        !notification ||
        (typeof notification.user === 'string'
          ? notification.user !== userId
          : notification.user?.id !== userId)
      ) {
        console.warn(
          `Notification ${notificationId} not found or does not belong to user ${userId}.`,
        )
        return false
      }

      if (notification.isRead === true) {
        return true
      }

      await this.payload.update({
        collection: 'notifications',
        id: notificationId,
        data: {
          isRead: true,
        } as Partial<Notification>, // Use Partial for update data
      })
      return true
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error)
      return false
    }
  }

  async markAllUserNotificationsAsRead(userId: string): Promise<void> {
    const whereClause: Where = {
      user: {
        equals: userId,
      },
      isRead: {
        equals: false,
      },
    }
    try {
      await this.payload.update({
        collection: 'notifications',
        where: whereClause,
        data: {
          isRead: true,
        } as Partial<Notification>, // Use Partial for update data
      })
      console.log(`Attempted to mark all unread notifications as read for user ${userId}.`)
    } catch (error) {
      console.error(`Error marking all notifications as read for user ${userId}:`, error)
      throw error
    }
  }

  async getNotificationsForUser(
    userId: string,
    limit: number = 10,
    page: number = 1,
  ): Promise<{ docs: Notification[]; totalDocs: number } | null> {
    const whereClause: Where = {
      // Renamed to avoid conflict
      user: {
        equals: userId,
      },
    }
    try {
      const results = await this.payload.find({
        collection: 'notifications',
        where: whereClause,
        sort: '-createdAt',
        limit,
        page,
        depth: 0,
      })
      return results as { docs: Notification[]; totalDocs: number }
    } catch (error) {
      console.error(`Error fetching notifications for user ${userId}:`, error)
      return null
    }
  }

  async getUnreadCount(userIdValue: string): Promise<number> {
    // Renamed userId to userIdValue
    const whereClause: Where = {
      // Renamed to avoid conflict
      user: {
        equals: userIdValue, // Use renamed variable
      },
      isRead: {
        equals: false,
      },
    }
    try {
      const result = await this.payload.count<'notifications'>({
        collection: 'notifications',
        where: whereClause, // Use renamed variable
      })
      return result.totalDocs
    } catch (error) {
      console.error(`Error fetching unread notification count for user ${userIdValue}:`, error) // Use renamed variable
      return 0
    }
  }
}
