import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface PaymentConfirmationEmailData extends BaseEmailTemplateData {
  userName: string
  orderNumber: string
  paymentDate: string
  paymentAmount: number
  currency?: string
  paymentMethod?: string
  transactionId?: string
  orderUrl?: string
  receiptUrl?: string
  purchasedItems?: Array<{
    name: string
    type: 'course' | 'product' | 'subscription' | 'other'
    id: string
    url?: string
  }>
}

/**
 * Email template for payment confirmation
 */
export class PaymentConfirmationEmail extends BaseEmailTemplate<PaymentConfirmationEmailData> {
  private userName: string
  private orderNumber: string
  private paymentDate: string
  private paymentAmount: number
  private currency: string
  private paymentMethod?: string
  private transactionId?: string
  private orderUrl: string
  private receiptUrl?: string
  private purchasedItems?: Array<{
    name: string
    type: 'course' | 'product' | 'subscription' | 'other'
    id: string
    url?: string
  }>

  constructor(data: PaymentConfirmationEmailData) {
    super(data)
    this.userName = data.userName
    this.orderNumber = data.orderNumber
    this.paymentDate = data.paymentDate
    this.paymentAmount = data.paymentAmount
    this.currency = data.currency || (this.locale === 'ru' ? 'RUB' : 'USD')
    this.paymentMethod = data.paymentMethod
    this.transactionId = data.transactionId
    this.orderUrl = data.orderUrl || `${this.siteUrl}/${this.locale}/account/orders/${this.orderNumber}`
    this.receiptUrl = data.receiptUrl
    this.purchasedItems = data.purchasedItems
  }

  protected generateContent() {
    // Format the payment date
    const formattedDate = new Date(this.paymentDate).toLocaleDateString(
      this.locale === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    )

    // Format currency
    const formattedAmount = this.locale === 'ru'
      ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: this.currency }).format(this.paymentAmount)
      : new Intl.NumberFormat('en-US', { style: 'currency', currency: this.currency }).format(this.paymentAmount)

    // Localized texts
    const texts = this.locale === 'ru' ? {
      subject: `Подтверждение оплаты для заказа #${this.orderNumber}`,
      greeting: `Здравствуйте, ${this.userName}!`,
      paymentConfirmation: `Мы получили вашу оплату на сумму ${formattedAmount} за заказ #${this.orderNumber}. Спасибо!`,
      paymentDetails: 'Детали платежа',
      orderNumber: `Номер заказа: ${this.orderNumber}`,
      paymentDate: `Дата оплаты: ${formattedDate}`,
      paymentAmount: `Сумма: ${formattedAmount}`,
      paymentMethod: `Способ оплаты: ${this.paymentMethod || 'Не указан'}`,
      transactionId: `ID транзакции: ${this.transactionId || 'Не указан'}`,
      purchasedItems: 'Приобретенные товары',
      accessItems: 'Вы можете получить доступ к приобретенным товарам в своем личном кабинете:',
      viewOrder: 'Просмотреть заказ',
      viewReceipt: 'Просмотреть чек',
      accessCourse: 'Перейти к курсу',
      supportInfo: 'Если у вас возникли вопросы по оплате, пожалуйста, свяжитесь с нашей службой поддержки.',
      footer: 'С уважением, команда Flow Masters'
    } : {
      subject: `Payment Confirmation for Order #${this.orderNumber}`,
      greeting: `Hello, ${this.userName}!`,
      paymentConfirmation: `We have received your payment of ${formattedAmount} for order #${this.orderNumber}. Thank you!`,
      paymentDetails: 'Payment Details',
      orderNumber: `Order Number: ${this.orderNumber}`,
      paymentDate: `Payment Date: ${formattedDate}`,
      paymentAmount: `Amount: ${formattedAmount}`,
      paymentMethod: `Payment Method: ${this.paymentMethod || 'Not specified'}`,
      transactionId: `Transaction ID: ${this.transactionId || 'Not specified'}`,
      purchasedItems: 'Purchased Items',
      accessItems: 'You can access your purchased items in your account dashboard:',
      viewOrder: 'View Order',
      viewReceipt: 'View Receipt',
      accessCourse: 'Go to Course',
      supportInfo: 'If you have any questions about your payment, please contact our support team.',
      footer: 'Best regards, Flow Masters Team'
    }

    // Build the body content
    let bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.paymentConfirmation}</p>
      
      <div class="highlight-box">
        <h3>${texts.paymentDetails}</h3>
        <p><strong>${texts.orderNumber}</strong></p>
        <p><strong>${texts.paymentDate}</strong></p>
        <p><strong>${texts.paymentAmount}</strong></p>
        ${this.paymentMethod ? `<p><strong>${texts.paymentMethod}</strong></p>` : ''}
        ${this.transactionId ? `<p><strong>${texts.transactionId}</strong></p>` : ''}
      </div>
    `

    // Add purchased items if available
    if (this.purchasedItems && this.purchasedItems.length > 0) {
      bodyContent += `
        <h3>${texts.purchasedItems}</h3>
        <ul>
      `

      this.purchasedItems.forEach(item => {
        bodyContent += `
          <li>
            <strong>${item.name}</strong>
            ${item.url ? ` - <a href="${item.url}">${texts.accessCourse}</a>` : ''}
          </li>
        `
      })

      bodyContent += `
        </ul>
        <p>${texts.accessItems}</p>
      `
    }

    // Add buttons
    bodyContent += `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${this.orderUrl}" class="button">${texts.viewOrder}</a>
        ${this.receiptUrl ? `<a href="${this.receiptUrl}" class="button" style="margin-left: 10px;">${texts.viewReceipt}</a>` : ''}
      </div>
      
      <p>${texts.supportInfo}</p>
    `

    const footerContent = `
      <p>${texts.footer}</p>
    `

    return {
      subject: texts.subject,
      bodyContent,
      footerContent
    }
  }
}

/**
 * Generate HTML for payment confirmation email
 */
export function generatePaymentConfirmationEmail(data: PaymentConfirmationEmailData): string {
  const email = new PaymentConfirmationEmail(data)
  return email.generateHTML()
}
