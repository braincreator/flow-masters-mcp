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
        await this.telegramService.sendDigitalOrderUpdate(
          user.telegramChatId,
          templateData
        )
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