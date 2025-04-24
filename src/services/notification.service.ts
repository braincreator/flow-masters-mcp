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
  }): Promise<boolean> {
    try {
      // 1. Отправка email подтверждения
      if (this.emailService) {
        await this.emailService.sendTemplate('payment_confirmation', orderData.customerEmail, {
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          total: orderData.total,
          currency: orderData.currency,
        })
      }

      // 2. Отправка уведомления в Telegram (для администраторов)
      if (this.telegramService) {
        await this.telegramService.sendMessage(
          `💰 Новый оплаченный заказ!\n` +
            `Номер заказа: ${orderData.orderNumber}\n` +
            `Сумма: ${orderData.total} ${orderData.currency}\n` +
            `Email клиента: ${orderData.customerEmail}`,
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
      })

      if (!order) {
        console.error(`Order not found: ${orderData.orderId}`)
        return false
      }

      // Получаем email клиента
      const customerEmail = (order as any).customer || orderData.customerEmail

      // Отправляем уведомление в зависимости от статуса
      switch (orderData.status) {
        case 'payment_confirmed':
          await this.emailService.sendTemplate('order_paid', customerEmail, {
            orderNumber: (order as any).orderNumber,
            products: (order as any).items,
          })
          break

        case 'ready_for_download':
          await this.emailService.sendTemplate('download_ready', customerEmail, {
            orderNumber: order.orderNumber,
            downloadLinks: orderData.downloadLinks,
          })
          break

        case 'completed':
          await this.emailService.sendTemplate('order_completed', customerEmail, {
            orderNumber: order.orderNumber,
          })
          break

        default:
          await this.emailService.sendTemplate('order_status_update', customerEmail, {
            orderNumber: order.orderNumber,
            status: orderData.status,
          })
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

      // Send email notification
      await this.emailService.sendTemplate('abandoned-cart', {
        to: user.email,
        templateData,
      })

      // Store notification in database
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
