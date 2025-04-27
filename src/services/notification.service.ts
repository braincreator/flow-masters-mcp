import { Payload } from 'payload'
import { BaseService } from './base.service'
import { EmailService } from './email.service'
import { TelegramService } from './telegram.service'
import { Order } from '../payload-types'

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
      // 1. Get user details
      let userName = ''
      let userEmail = orderData.customerEmail
      let userLocale = orderData.locale || 'ru'
      let userId = null

      try {
        // Try to get user details if we have a user reference
        const order = await this.payload.findByID({
          collection: 'orders',
          id: orderData.orderId,
          depth: 1, // Include user data
        })

        if (order.user) {
          // If user is a reference and populated
          if (typeof order.user === 'object' && order.user !== null) {
            userName = order.user.name || ''
            userEmail = order.user.email || orderData.customerEmail
            userLocale = order.user.locale || orderData.locale || 'ru'
            userId = order.user.id
          } else {
            // If user is just an ID
            userId = order.user
          }
        }
      } catch (userError) {
        console.error('Error getting user details for payment confirmation:', userError)
        // Continue with the data we have
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

      // Check user notification preferences if we have a user ID
      let preferences = {
        allowInApp: true,
        allowEmail: true,
        allowPush: false,
      }

      if (userId) {
        preferences = await this.checkUserNotificationPreferences(userId, 'account')

        // Create in-app notification for the user
        await this.payload.create({
          collection: 'notifications',
          data: {
            user: userId,
            title: 'Payment Confirmed',
            message: `Your payment for order #${orderData.orderNumber} has been confirmed.`,
            type: 'payment_confirmed',
            isRead: false,
            metadata: {
              orderId: orderData.orderId,
              orderNumber: orderData.orderNumber,
              total: orderData.total,
              currency: orderData.currency,
            },
          },
        })
      }

      // 3. Send email using our template if allowed by user preferences
      if (this.emailService && preferences.allowEmail) {
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

      // 4. Отправка уведомления в Telegram (для администраторов)
      if (this.telegramService) {
        await this.telegramService.sendMessage(
          `💰 Новый оплаченный заказ!\n` +
            `Номер заказа: ${orderData.orderNumber}\n` +
            `Сумма: ${orderData.total} ${orderData.currency}\n` +
            `Email клиента: ${userEmail}`,
        )
      }

      return true
    } catch (error) {
      console.error('Failed to send payment confirmation:', error)
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

      // Получаем информацию о заказе
      const order = await this.payload.findByID<Order, any>({
        collection: 'orders',
        id: orderData.orderId,
        depth: 1, // Include user data
      })

      if (!order) {
        console.error(`Order not found: ${orderData.orderId}`)
        return false
      }

      // Получаем информацию о пользователе
      let userId = null
      let userLocale = 'ru'
      const customerEmail = order.customer?.email || orderData.customerEmail

      if (order.user) {
        // If user is a reference and populated
        if (typeof order.user === 'object' && order.user !== null) {
          userId = order.user.id
          userLocale = order.user.locale || 'ru'
        } else {
          // If user is just an ID
          userId = order.user
        }
      }

      // Проверяем настройки уведомлений пользователя
      let preferences = {
        allowInApp: true,
        allowEmail: true,
        allowPush: false,
      }

      if (userId) {
        preferences = await this.checkUserNotificationPreferences(userId, 'account')
      }

      // Создаем in-app уведомление, если есть userId
      if (userId) {
        let title = 'Order Status Update'
        let message = `Your order #${order.orderNumber} status has been updated to ${orderData.status}`

        switch (orderData.status) {
          case 'payment_confirmed':
            title = 'Payment Confirmed'
            message = `Your payment for order #${order.orderNumber} has been confirmed.`
            break
          case 'ready_for_download':
            title = 'Download Ready'
            message = `Your digital products from order #${order.orderNumber} are ready for download.`
            break
          case 'completed':
            title = 'Order Completed'
            message = `Your order #${order.orderNumber} has been completed.`
            break
        }

        await this.payload.create({
          collection: 'notifications',
          data: {
            user: userId,
            title,
            message,
            type: 'order_status',
            isRead: false,
            metadata: {
              orderId: orderData.orderId,
              orderNumber: order.orderNumber,
              status: orderData.status,
            },
          },
        })
      }

      // Отправляем email уведомление, если разрешено
      if (preferences.allowEmail && customerEmail) {
        switch (orderData.status) {
          case 'payment_confirmed':
            await this.emailService.sendTemplateEmail(
              'order_paid',
              customerEmail,
              {
                orderNumber: order.orderNumber,
                products: order.items,
              },
              { locale: userLocale },
            )
            break

          case 'ready_for_download':
            await this.emailService.sendTemplateEmail(
              'download_ready',
              customerEmail,
              {
                orderNumber: order.orderNumber,
                downloadLinks: orderData.downloadLinks,
              },
              { locale: userLocale },
            )
            break

          case 'completed':
            await this.emailService.sendTemplateEmail(
              'order_completed',
              customerEmail,
              {
                orderNumber: order.orderNumber,
              },
              { locale: userLocale },
            )
            break

          default:
            await this.emailService.sendTemplateEmail(
              'order_status_update',
              customerEmail,
              {
                orderNumber: order.orderNumber,
                status: orderData.status,
              },
              { locale: userLocale },
            )
        }
      }

      return true
    } catch (error) {
      console.error('Failed to send order status update:', error)
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

      // Check if settings allow sending abandoned cart reminders
      const settings = await this.payload.findGlobal({
        slug: 'settings',
      })

      if (!settings?.notificationSettings?.email?.enableAbandonedCartReminders) {
        return
      }

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

      // Store notification in database (in-app notification)
      await this.payload.create({
        collection: 'notifications',
        data: {
          user: user.id,
          type: 'abandoned_cart',
          title: 'Items waiting in your cart',
          message: `You have ${items.length} item(s) in your cart. Complete your purchase before they're gone!`,
          data: templateData,
          read: false,
        },
      })

      // Send email notification if allowed by user preferences
      if (preferences.allowEmail && user.email) {
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
      throw error
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.payload.update({
      collection: 'notifications',
      id: notificationId,
      data: {
        read: true,
        readAt: new Date(),
      },
    })
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
    notificationType: string,
  ): Promise<{
    allowInApp: boolean
    allowEmail: boolean
    allowPush: boolean
  }> {
    try {
      // Получаем пользователя и его настройки уведомлений
      const user = await this.payload.findByID({
        collection: 'users',
        id: userId,
      })

      // Значения по умолчанию, если настройки не найдены
      const defaults = {
        allowInApp: true,
        allowEmail: true,
        allowPush: false,
      }

      // Если у пользователя нет настроек уведомлений, используем значения по умолчанию
      if (!user.emailNotifications && !user.pushNotifications) {
        return defaults
      }

      // Проверяем частоту уведомлений
      if (user.notificationFrequency === 'never') {
        return {
          allowInApp: true, // In-app уведомления всегда разрешены
          allowEmail: false,
          allowPush: false,
        }
      }

      // Определяем категорию уведомления
      let category = 'account' // По умолчанию считаем, что это уведомление аккаунта

      // Маппинг типов уведомлений на категории
      if (['course_completed', 'lesson_completed', 'course_enrolled'].includes(notificationType)) {
        category = 'courses'
      } else if (['achievement', 'level_up'].includes(notificationType)) {
        category = 'achievements'
      } else if (['comment_reply', 'comment_mention'].includes(notificationType)) {
        category = 'comments'
      } else if (['newsletter', 'broadcast'].includes(notificationType)) {
        category = 'newsletter'
      } else if (['promo', 'discount', 'marketing'].includes(notificationType)) {
        category = 'marketing'
      }

      // Проверяем настройки email уведомлений для данной категории
      const allowEmail = user.emailNotifications?.[category] ?? defaults.allowEmail

      // Проверяем настройки push уведомлений для данной категории
      const allowPush = user.pushNotifications?.[category] ?? defaults.allowPush

      return {
        allowInApp: true, // In-app уведомления всегда разрешены
        allowEmail,
        allowPush,
      }
    } catch (error) {
      console.error('Error checking user notification preferences:', error)
      // В случае ошибки возвращаем значения по умолчанию
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
      // Проверяем настройки уведомлений пользователя
      const preferences = await this.checkUserNotificationPreferences(data.userId, data.type)

      // Создаем in-app уведомление (всегда)
      const notification = await this.payload.create({
        collection: 'notifications',
        data: {
          user: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: false,
          link: data.link,
          metadata: data.metadata,
        },
      })

      // Если разрешены email уведомления, отправляем email
      if (preferences.allowEmail && this.emailService) {
        try {
          // Получаем пользователя для получения email
          const user = await this.payload.findByID({
            collection: 'users',
            id: data.userId,
          })

          if (user.email) {
            // Отправляем email уведомление
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
          // Не прерываем выполнение, если не удалось отправить email
        }
      }

      // Если разрешены push уведомления, отправляем push (в будущем)
      if (preferences.allowPush) {
        // TODO: Реализовать отправку push-уведомлений
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
  async markAllAsRead(userId: string): Promise<void> {
    try {
      // Получаем все непрочитанные уведомления пользователя
      const notifications = await this.payload.find({
        collection: 'notifications',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              isRead: {
                equals: false,
              },
            },
          ],
        },
        limit: 1000,
      })

      // Отмечаем каждое уведомление как прочитанное
      for (const notification of notifications.docs) {
        await this.markNotificationAsRead(notification.id)
      }

      console.log(`Marked all notifications as read for user ${userId}`)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }
}
