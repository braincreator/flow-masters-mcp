import { PaymentProvider } from '@/types/constants'
import { PAYMENT_CONFIG } from '@/constants/payment'
import crypto from 'crypto'

interface CreatePaymentParams {
  provider: PaymentProvider
  orderId: string
  amount: number
  currency: string
  description: string
  customerEmail: string
}

class PaymentService {
  private getYooMoneyPaymentUrl({
    orderId,
    amount,
    currency,
    description,
    customerEmail,
  }: Omit<CreatePaymentParams, 'provider'>): string {
    const config = PAYMENT_CONFIG.providers.yoomoney
    const { merchantId, secretKey } = config.credentials

    const params = new URLSearchParams({
      'receiver': merchantId,
      'quickpay-form': 'shop',
      'targets': description,
      'paymentType': 'AC',
      'sum': amount.toString(),
      'label': orderId,
      'successURL': `${window.location.origin}${config.successPath}?orderId=${orderId}`,
      'failURL': `${window.location.origin}${config.failurePath}?orderId=${orderId}`,
    })

    return `https://yoomoney.ru/quickpay/confirm.xml?${params.toString()}`
  }

  private getRobokassaPaymentUrl({
    orderId,
    amount,
    currency,
    description,
    customerEmail,
  }: Omit<CreatePaymentParams, 'provider'>): string {
    const config = PAYMENT_CONFIG.providers.robokassa
    const { merchantId, secretKey } = config.credentials

    // Generate signature
    const signature = crypto
      .createHash('md5')
      .update(`${merchantId}:${amount}:${orderId}:${secretKey}`)
      .digest('hex')

    const params = new URLSearchParams({
      'MerchantLogin': merchantId,
      'OutSum': amount.toString(),
      'InvId': orderId,
      'Description': description,
      'SignatureValue': signature,
      'Email': customerEmail,
      'IsTest': config.test ? '1' : '0',
      'SuccessURL': `${window.location.origin}${config.successPath}?orderId=${orderId}`,
      'FailURL': `${window.location.origin}${config.failurePath}?orderId=${orderId}`,
    })

    return `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`
  }

  public async createPayment(params: CreatePaymentParams): Promise<string> {
    const { provider } = params

    switch (provider) {
      case 'yoomoney':
        return this.getYooMoneyPaymentUrl(params)
      case 'robokassa':
        return this.getRobokassaPaymentUrl(params)
      default:
        throw new Error(`Unsupported payment provider: ${provider}`)
    }
  }

  public verifyYooMoneyPayment(notification: any): boolean {
    const { secretKey } = PAYMENT_CONFIG.providers.yoomoney.credentials
    
    // Implement YooMoney notification verification
    const params = [
      notification.notification_type,
      notification.operation_id,
      notification.amount,
      notification.currency,
      notification.datetime,
      notification.sender,
      notification.codepro,
      secretKey,
      notification.label,
    ].join('&')

    const signature = crypto
      .createHash('sha1')
      .update(params)
      .digest('hex')

    return signature === notification.sha1_hash
  }

  public verifyRobokassaPayment(
    invId: string,
    outSum: string,
    signatureValue: string,
  ): boolean {
    const { secretKey } = PAYMENT_CONFIG.providers.robokassa.credentials

    // Implement Robokassa notification verification
    const signature = crypto
      .createHash('md5')
      .update(`${outSum}:${invId}:${secretKey}`)
      .digest('hex')
      .toUpperCase()

    return signature === signatureValue.toUpperCase()
  }
}

export const paymentService = new PaymentService()
