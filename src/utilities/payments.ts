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

  verifyYooMoneyPayment(notification: any): boolean {
    const { sha1_hash, notification_type, operation_id, amount, currency, datetime, sender, codepro, label } = notification

    const hash = crypto
      .createHash('sha1')
      .update(
        [notification_type, operation_id, amount, currency, datetime, sender, codepro, this.yoomoneyConfig.secretKey, label].join('&')
      )
      .digest('hex')

    return hash === sha1_hash
  }

  verifyRobokassaPayment(invId: string, outSum: string, signatureValue: string): boolean {
    const expectedSignature = crypto
      .createHash('md5')
      .update(`${outSum}:${invId}:${this.robokassaConfig.password2}`)
      .digest('hex')
      .toUpperCase()

    return expectedSignature === signatureValue.toUpperCase()
  }
}

export const paymentService = new PaymentService()