import crypto from 'crypto'

interface YooMoneyConfig {
  shopId: string
  secretKey: string
  returnUrl: string
}

interface RobokassaConfig {
  merchantLogin: string
  password1: string
  password2: string
  testMode: boolean
  returnUrl: string
}

interface YooMoneyNotification {
  sha1_hash: string;
  notification_type: string;
  operation_id: string;
  amount: string;
  currency: string;
  datetime: string;
  sender: string;
  codepro: string;
  label: string;
}

export class PaymentService {
  private yoomoneyConfig: YooMoneyConfig = {
    shopId: process.env.YOOMONEY_SHOP_ID!,
    secretKey: process.env.YOOMONEY_SECRET_KEY!,
    returnUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/yoomoney/callback`,
  }

  private robokassaConfig: RobokassaConfig = {
    merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN!,
    password1: process.env.ROBOKASSA_PASSWORD1!,
    password2: process.env.ROBOKASSA_PASSWORD2!,
    testMode: process.env.NODE_ENV !== 'production',
    returnUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/robokassa/callback`,
  }

  generateYooMoneyPaymentLink(orderId: string, amount: number, description: string) {
    const data = {
      receiver: this.yoomoneyConfig.shopId,
      'quickpay-form': 'shop',
      targets: `Order ${orderId}`,
      paymentType: 'AC',
      sum: amount,
      label: orderId,
      successURL: this.yoomoneyConfig.returnUrl,
    }

    const queryString = new URLSearchParams(data).toString()
    return `https://yoomoney.ru/quickpay/confirm.xml?${queryString}`
  }

  generateRobokassaPaymentLink(orderId: string, amount: number, description: string) {
    const baseUrl = this.robokassaConfig.testMode
      ? 'https://test.robokassa.ru/Index.aspx'
      : 'https://auth.robokassa.ru/Merchant/Index.aspx'

    const signature = crypto
      .createHash('md5')
      .update(
        `${this.robokassaConfig.merchantLogin}:${amount}:${orderId}:${this.robokassaConfig.password1}`
      )
      .digest('hex')

    const params = new URLSearchParams({
      MerchantLogin: this.robokassaConfig.merchantLogin,
      OutSum: amount.toString(),
      InvId: orderId,
      Description: description,
      SignatureValue: signature,
      IsTest: this.robokassaConfig.testMode ? '1' : '0',
      SuccessURL: this.robokassaConfig.returnUrl,
    })

    return `${baseUrl}?${params.toString()}`
  }

  async verifyYooMoneyPayment(notification: unknown): Promise<boolean> {
    if (!this.isValidNotification(notification)) {
      throw new Error('Invalid notification format')
    }

    const typedNotification = notification as YooMoneyNotification
    const { sha1_hash, notification_type, operation_id, amount, currency, datetime, sender, codepro, label } = typedNotification

    if (!this.yoomoneyConfig.secretKey) {
      throw new Error('YooMoney secret key is not configured')
    }

    const hash = crypto
      .createHash('sha1')
      .update(
        [notification_type, operation_id, amount, currency, datetime, sender, codepro, this.yoomoneyConfig.secretKey, label].join('&')
      )
      .digest('hex')

    if (hash === sha1_hash) {
      const integrationService = new IntegrationService(this.payload)
      try {
        await integrationService.processEvent('payment.received', {
          provider: 'yoomoney',
          ...typedNotification
        })
        return true
      } catch (error) {
        console.error('Failed to process payment event:', error)
        throw new Error('Payment verification succeeded but event processing failed')
      }
    }

    return false
  }

  verifyRobokassaPayment(invId: string, outSum: string, signatureValue: string): boolean {
    const expectedSignature = crypto
      .createHash('md5')
      .update(`${outSum}:${invId}:${this.robokassaConfig.password2}`)
      .digest('hex')
      .toUpperCase()

    return expectedSignature === signatureValue.toUpperCase()
  }

  private isValidNotification(notification: unknown): notification is YooMoneyNotification {
    if (!notification || typeof notification !== 'object') return false
    
    const required = ['sha1_hash', 'notification_type', 'operation_id', 'amount', 
                     'currency', 'datetime', 'sender', 'codepro', 'label']
    
    return required.every(field => 
      field in notification && 
      typeof (notification as Record<string, unknown>)[field] === 'string'
    )
  }
}

export const paymentService = new PaymentService()
