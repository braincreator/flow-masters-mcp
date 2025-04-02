import { EmailService } from './email'
import { TelegramService } from './telegram'

// Types
interface PaymentConfirmationData {
  email: string
  orderNumber: string
  amount: number
  items: Array<{
    title: string
    quantity: number
    price: number
  }>
}

interface OrderStatusUpdateData {
  email: string
  orderNumber: string
  status: string
  message?: string
}

export class NotificationService {
  private emailService: EmailService | null = null
  private telegramService: TelegramService | null = null

  constructor() {
    try {
      this.emailService = new EmailService()
    } catch (error) {
      console.warn('Email service initialization failed:', error)
      this.emailService = null
    }

    try {
      this.telegramService = new TelegramService()
    } catch (error) {
      console.warn('Telegram service initialization failed:', error)
      this.telegramService = null
    }

    if (!this.emailService && !this.telegramService) {
      console.warn('Warning: All notification services failed to initialize')
    }
  }

  async sendPaymentConfirmation(data: PaymentConfirmationData): Promise<boolean> {
    const { email, orderNumber, amount, items } = data
    let success = false
    const errors: Error[] = []

    // Format user-friendly email content
    const subject = `Payment confirmed for order #${orderNumber}`
    const itemsList = items
      .map(
        (item) => `${item.title} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`,
      )
      .join('\n')

    const emailContent = `
Dear Customer,

Thank you for your purchase! Your payment for order #${orderNumber} has been confirmed.

Order Details:
${itemsList}

Total: $${amount.toFixed(2)}

You will receive your product(s) shortly.

Thank you for your business!
    `.trim()

    // Send email notification
    if (this.emailService) {
      try {
        await this.emailService.sendEmail(email, subject, emailContent)
        success = true
      } catch (error) {
        console.error('Failed to send payment confirmation email:', error)
        errors.push(error instanceof Error ? error : new Error('Unknown email error'))
      }
    }

    // Send Telegram notification (for admin)
    if (this.telegramService) {
      try {
        const telegramMessage = `💰 New payment confirmed!\nOrder: #${orderNumber}\nAmount: $${amount.toFixed(2)}\nCustomer: ${email}`
        await this.telegramService.sendMessage(telegramMessage)
        success = true
      } catch (error) {
        console.error('Failed to send payment confirmation to Telegram:', error)
        errors.push(error instanceof Error ? error : new Error('Unknown telegram error'))
      }
    }

    // If all available services failed, throw an error with details
    if (!success && errors.length > 0) {
      const combinedError = new Error('All notification attempts failed')
      combinedError.cause = errors
      throw combinedError
    }

    return success
  }

  async sendOrderStatusUpdate(data: OrderStatusUpdateData): Promise<boolean> {
    const { email, orderNumber, status, message } = data
    let success = false
    const errors: Error[] = []

    // Format status for readability
    const readableStatus = status.charAt(0).toUpperCase() + status.slice(1)

    // Format user-friendly email content
    const subject = `Order #${orderNumber} Status Update: ${readableStatus}`
    const emailContent = `
Dear Customer,

Your order #${orderNumber} status has been updated to: ${readableStatus}

${message ? `\nAdditional information:\n${message}\n` : ''}

Thank you for your business!
    `.trim()

    // Send email notification
    if (this.emailService) {
      try {
        await this.emailService.sendEmail(email, subject, emailContent)
        success = true
      } catch (error) {
        console.error('Failed to send order status update email:', error)
        errors.push(error instanceof Error ? error : new Error('Unknown email error'))
      }
    }

    // Send Telegram notification (for admin)
    if (this.telegramService) {
      try {
        const statusEmoji = this.getStatusEmoji(status)
        const telegramMessage = `${statusEmoji} Order status updated!\nOrder: #${orderNumber}\nStatus: ${readableStatus}\nCustomer: ${email}`
        await this.telegramService.sendMessage(telegramMessage)
        success = true
      } catch (error) {
        console.error('Failed to send order status update to Telegram:', error)
        errors.push(error instanceof Error ? error : new Error('Unknown telegram error'))
      }
    }

    // If all available services failed, throw an error with details
    if (!success && errors.length > 0) {
      const combinedError = new Error('All notification attempts failed')
      combinedError.cause = errors
      throw combinedError
    }

    return success
  }

  private getStatusEmoji(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return '✅'
      case 'processing':
      case 'pending':
        return '⏳'
        // Removed shipped case as we only have digital products
        return '📦'
      case 'cancelled':
        return '❌'
      case 'refunded':
        return '💸'
      case 'failed':
        return '⚠️'
      default:
        return '📝'
    }
  }
}
