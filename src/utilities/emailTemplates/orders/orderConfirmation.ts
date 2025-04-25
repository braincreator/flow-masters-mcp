import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface OrderItem {
  name: string
  description?: string
  quantity: number
  price: number
  total: number
  type: 'course' | 'product' | 'subscription' | 'other'
  id: string
  url?: string
}

export interface OrderConfirmationEmailData extends BaseEmailTemplateData {
  userName: string
  orderNumber: string
  orderDate: string
  items: OrderItem[]
  subtotal: number
  discount?: number
  tax?: number
  total: number
  currency?: string
  paymentMethod?: string
  paymentStatus: 'paid' | 'pending' | 'failed'
  billingAddress?: string
  invoiceUrl?: string
}

/**
 * Email template for order confirmation
 */
export class OrderConfirmationEmail extends BaseEmailTemplate<OrderConfirmationEmailData> {
  private userName: string
  private orderNumber: string
  private orderDate: string
  private items: OrderItem[]
  private subtotal: number
  private discount?: number
  private tax?: number
  private total: number
  private currency: string
  private paymentMethod?: string
  private paymentStatus: 'paid' | 'pending' | 'failed'
  private billingAddress?: string
  private invoiceUrl?: string
  private orderUrl: string

  constructor(data: OrderConfirmationEmailData) {
    super(data)
    this.userName = data.userName
    this.orderNumber = data.orderNumber
    this.orderDate = data.orderDate
    this.items = data.items
    this.subtotal = data.subtotal
    this.discount = data.discount
    this.tax = data.tax
    this.total = data.total
    this.currency = data.currency || (this.locale === 'ru' ? 'RUB' : 'USD')
    this.paymentMethod = data.paymentMethod
    this.paymentStatus = data.paymentStatus
    this.billingAddress = data.billingAddress
    this.invoiceUrl = data.invoiceUrl
    this.orderUrl = `${this.siteUrl}/${this.locale}/account/orders/${this.orderNumber}`
  }

  protected generateContent() {
    // Format the order date
    const formattedDate = new Date(this.orderDate).toLocaleDateString(
      this.locale === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    )

    // Format currency
    const formatCurrency = (amount: number) => {
      if (this.locale === 'ru') {
        return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: this.currency }).format(amount)
      } else {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: this.currency }).format(amount)
      }
    }

    // Localized texts
    const texts = this.locale === 'ru' ? {
      subject: `Подтверждение заказа #${this.orderNumber}`,
      greeting: `Здравствуйте, ${this.userName}!`,
      orderConfirmation: 'Спасибо за ваш заказ! Ниже приведены детали вашего заказа:',
      orderNumber: `Номер заказа: ${this.orderNumber}`,
      orderDate: `Дата заказа: ${formattedDate}`,
      orderDetails: 'Детали заказа',
      item: 'Товар',
      description: 'Описание',
      quantity: 'Кол-во',
      price: 'Цена',
      total: 'Сумма',
      subtotal: 'Подытог',
      discount: 'Скидка',
      tax: 'Налог',
      totalAmount: 'Итого',
      paymentMethod: `Способ оплаты: ${this.paymentMethod || 'Не указан'}`,
      paymentStatus: `Статус оплаты: ${
        this.paymentStatus === 'paid' ? 'Оплачен' : 
        this.paymentStatus === 'pending' ? 'Ожидает оплаты' : 
        'Ошибка оплаты'
      }`,
      billingAddress: 'Адрес для выставления счета:',
      viewOrder: 'Просмотреть заказ',
      viewInvoice: 'Просмотреть счет',
      paymentPending: 'Ваш заказ ожидает оплаты. Пожалуйста, завершите процесс оплаты, чтобы получить доступ к приобретенным товарам.',
      paymentFailed: 'К сожалению, при обработке вашего платежа возникла проблема. Пожалуйста, проверьте способ оплаты и попробуйте снова.',
      paymentSuccess: 'Ваш платеж успешно обработан. Спасибо за покупку!',
      courseAccess: 'Вы можете получить доступ к приобретенным курсам в своем личном кабинете.',
      supportInfo: 'Если у вас возникли вопросы по заказу, пожалуйста, свяжитесь с нашей службой поддержки.',
      footer: 'С уважением, команда Flow Masters'
    } : {
      subject: `Order Confirmation #${this.orderNumber}`,
      greeting: `Hello, ${this.userName}!`,
      orderConfirmation: 'Thank you for your order! Below are the details of your order:',
      orderNumber: `Order Number: ${this.orderNumber}`,
      orderDate: `Order Date: ${formattedDate}`,
      orderDetails: 'Order Details',
      item: 'Item',
      description: 'Description',
      quantity: 'Qty',
      price: 'Price',
      total: 'Total',
      subtotal: 'Subtotal',
      discount: 'Discount',
      tax: 'Tax',
      totalAmount: 'Total Amount',
      paymentMethod: `Payment Method: ${this.paymentMethod || 'Not specified'}`,
      paymentStatus: `Payment Status: ${
        this.paymentStatus === 'paid' ? 'Paid' : 
        this.paymentStatus === 'pending' ? 'Pending' : 
        'Failed'
      }`,
      billingAddress: 'Billing Address:',
      viewOrder: 'View Order',
      viewInvoice: 'View Invoice',
      paymentPending: 'Your order is pending payment. Please complete the payment process to gain access to your purchased items.',
      paymentFailed: 'Unfortunately, there was an issue processing your payment. Please check your payment method and try again.',
      paymentSuccess: 'Your payment has been successfully processed. Thank you for your purchase!',
      courseAccess: 'You can access your purchased courses in your account dashboard.',
      supportInfo: 'If you have any questions about your order, please contact our support team.',
      footer: 'Best regards, Flow Masters Team'
    }

    // Build the body content
    let bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.orderConfirmation}</p>
      
      <div class="highlight-box">
        <p><strong>${texts.orderNumber}</strong></p>
        <p><strong>${texts.orderDate}</strong></p>
        <p><strong>${texts.paymentStatus}</strong></p>
        ${this.paymentMethod ? `<p><strong>${texts.paymentMethod}</strong></p>` : ''}
      </div>
      
      <h2>${texts.orderDetails}</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${texts.item}</th>
            <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${texts.quantity}</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${texts.price}</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${texts.total}</th>
          </tr>
        </thead>
        <tbody>
    `

    // Add items
    this.items.forEach(item => {
      bodyContent += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <strong>${item.name}</strong>
            ${item.description ? `<br><small>${item.description}</small>` : ''}
          </td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(item.price)}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(item.total)}</td>
        </tr>
      `
    })

    // Add order totals
    bodyContent += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;"><strong>${texts.subtotal}:</strong></td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(this.subtotal)}</td>
          </tr>
    `

    if (this.discount) {
      bodyContent += `
        <tr>
          <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;"><strong>${texts.discount}:</strong></td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">-${formatCurrency(this.discount)}</td>
        </tr>
      `
    }

    if (this.tax) {
      bodyContent += `
        <tr>
          <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;"><strong>${texts.tax}:</strong></td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(this.tax)}</td>
        </tr>
      `
    }

    bodyContent += `
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;"><strong>${texts.totalAmount}:</strong></td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;"><strong>${formatCurrency(this.total)}</strong></td>
          </tr>
        </tfoot>
      </table>
    `

    // Add billing address if available
    if (this.billingAddress) {
      bodyContent += `
        <div style="margin: 20px 0;">
          <h3>${texts.billingAddress}</h3>
          <p>${this.billingAddress.replace(/\\n/g, '<br>')}</p>
        </div>
      `
    }

    // Add payment status message
    if (this.paymentStatus === 'pending') {
      bodyContent += `
        <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 5px;">
          <p><strong>${texts.paymentPending}</strong></p>
        </div>
      `
    } else if (this.paymentStatus === 'failed') {
      bodyContent += `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px;">
          <p><strong>${texts.paymentFailed}</strong></p>
        </div>
      `
    } else {
      bodyContent += `
        <div style="margin: 20px 0; padding: 15px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px;">
          <p><strong>${texts.paymentSuccess}</strong></p>
          <p>${texts.courseAccess}</p>
        </div>
      `
    }

    // Add buttons
    bodyContent += `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${this.orderUrl}" class="button">${texts.viewOrder}</a>
        ${this.invoiceUrl ? `<a href="${this.invoiceUrl}" class="button" style="margin-left: 10px;">${texts.viewInvoice}</a>` : ''}
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
 * Generate HTML for order confirmation email
 */
export function generateOrderConfirmationEmail(data: OrderConfirmationEmailData): string {
  const email = new OrderConfirmationEmail(data)
  return email.generateHTML()
}
