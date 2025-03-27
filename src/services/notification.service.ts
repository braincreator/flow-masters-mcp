import { Payload } from 'payload'
import { EmailService } from './EmailService'
import { TelegramService } from './TelegramService'

export class NotificationService {
  private payload: Payload
  private emailService: EmailService
  private telegramService: TelegramService

  constructor(payload: Payload) {
    this.payload = payload
    this.emailService = new EmailService()
    this.telegramService = new TelegramService()
  }

  async sendDigitalOrderStatusUpdate(orderTracking: any): Promise<void> {
    try {
      const order = await this.payload.findByID({
        collection: 'orders',
        id: orderTracking.orderId,
      })

      const user = await this.payload.findByID({
        collection: 'users',
        id: order.user,
      })

      const templateData = {
        orderNumber: order.orderNumber,
        status: orderTracking.status,
        downloadLinks: orderTracking.downloadLinks,
        accessExpiresAt: orderTracking.accessExpiresAt,
        userName: user.name,
      }

      let emailTemplate = 'digital-order-status-update'

      // Send download links only when order is ready
      if (orderTracking.status === 'ready_for_download') {
        emailTemplate = 'digital-order-download-ready'
      }

      // Send email notification
      await this.emailService.sendTemplate(emailTemplate, {
        to: user.email,
        templateData,
      })

      // Send telegram notification if user has connected account
      if (user.telegramChatId) {
        await this.telegramService.sendDigitalOrderUpdate(user.telegramChatId, templateData)
      }

      // Store notification in database
      await this.payload.create({
        collection: 'notifications',
        data: {
          user: user.id,
          type: 'digital_order_status_update',
          title: `Order ${order.orderNumber} Status Update`,
          message: this.getStatusMessage(orderTracking.status),
          data: templateData,
          read: false,
        },
      })
    } catch (error) {
      console.error('Failed to send digital order status notification:', error)
      throw error
    }
  }

  private getStatusMessage(status: string): string {
    const messages = {
      placed: 'Your order has been placed successfully',
      payment_processing: 'Payment is being processed',
      payment_confirmed: 'Payment confirmed successfully',
      ready_for_download: 'Your digital products are ready for download',
      completed: 'Order completed',
      cancelled: 'Order has been cancelled',
      refunded: 'Order has been refunded',
    }
    return messages[status] || `Order status updated to: ${status}`
  }

  async sendPaymentConfirmation(order: any): Promise<void> {
    try {
      const user = await this.payload.findByID({
        collection: 'users',
        id: order.user,
      })

      const templateData = {
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency,
        itemCount: order.items.length,
        date: new Date().toLocaleDateString(),
        userName: user.name || user.email,
      }

      // Send email notification
      await this.emailService.sendTemplate('payment-confirmation', {
        to: user.email,
        templateData,
      })

      // Send telegram notification if user has connected account
      if (user.telegramChatId) {
        await this.telegramService.sendPaymentConfirmation(user.telegramChatId, templateData)
      }

      // Store notification in database
      await this.payload.create({
        collection: 'notifications',
        data: {
          user: user.id,
          type: 'payment_confirmation',
          title: `Payment for order ${order.orderNumber} confirmed`,
          message: `Your payment of ${order.total} ${order.currency} has been received. Thank you for your purchase!`,
          data: templateData,
          read: false,
        },
      })
    } catch (error) {
      console.error('Failed to send payment confirmation notification:', error)
      throw error
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
}
