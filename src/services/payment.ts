import crypto from 'crypto'
import type { Payload } from 'payload'
import { PaymentProvider, PaymentMethod, PaymentStatus } from '@/types/payment'

interface PaymentCreateParams {
  orderId: string
  amount: number
  description: string
  customer: {
    email: string
    name?: string
    phone?: string
  }
  currency: string
  locale: string
  provider?: PaymentProvider
  metadata?: Record<string, any>
  returnUrl?: string
}

interface PaymentResult {
  success: boolean
  paymentUrl?: string
  paymentId?: string
  error?: string
}

export class PaymentService {
  private payload: Payload | null = null
  private settings: any = null
  private settingsLoaded = false

  constructor(payload?: Payload) {
    if (payload) {
      this.payload = payload
    }
  }

  setPayload(payload: Payload) {
    this.payload = payload
  }

  async getSettings() {
    if (!this.payload) {
      throw new Error('Payload instance not set')
    }

    if (!this.settingsLoaded) {
      try {
        const result = await this.payload.findGlobal({
          slug: 'settings',
        })

        this.settings = result
        this.settingsLoaded = true
      } catch (error) {
        console.error('Failed to load payment settings:', error)
        throw new Error('Failed to load payment settings')
      }
    }

    return this.settings
  }

  async getEnabledProviders() {
    const settings = await this.getSettings()

    if (!settings?.paymentSettings?.availableProviders) {
      return []
    }

    return settings.paymentSettings.availableProviders
      .filter((provider) => provider.enabled)
      .map((provider) => ({
        id: provider.provider,
        name: provider.displayName,
        config: provider.config[provider.provider],
      }))
  }

  async getDefaultProvider() {
    const settings = await this.getSettings()
    return settings?.paymentSettings?.defaultProvider || null
  }

  async createPayment(params: PaymentCreateParams): Promise<PaymentResult> {
    try {
      const providers = await this.getEnabledProviders()
      const defaultProvider = await this.getDefaultProvider()

      // Use requested provider or default
      const providerId = params.provider || defaultProvider

      if (!providerId) {
        throw new Error('No payment provider specified and no default configured')
      }

      const provider = providers.find((p) => p.id === providerId)

      if (!provider) {
        throw new Error(`Payment provider '${providerId}' not found or disabled`)
      }

      // Create payment based on provider
      switch (provider.id) {
        case 'yoomoney':
          return this.createYoomoneyPayment(provider.config, params)
        case 'robokassa':
          return this.createRobokassaPayment(provider.config, params)
        case 'stripe':
          return this.createStripePayment(provider.config, params)
        case 'paypal':
          return this.createPayPalPayment(provider.config, params)
        default:
          throw new Error(`Unsupported payment provider: ${provider.id}`)
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown payment error',
      }
    }
  }

  // YooMoney payment methods
  private createYoomoneyPayment(config: any, params: PaymentCreateParams): PaymentResult {
    const { shopId, testMode } = config
    const baseUrl = 'https://yoomoney.ru/quickpay/confirm.xml'

    // Generate payment ID
    const paymentId = `ym_${Date.now()}_${params.orderId}`

    const queryParams = new URLSearchParams({
      receiver: shopId,
      'quickpay-form': 'shop',
      targets: params.description,
      paymentType: 'AC', // Card payment
      sum: params.amount.toString(),
      label: paymentId,
      successURL:
        params.returnUrl ||
        `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/success?provider=yoomoney&orderId=${params.orderId}`,
      'need-email': 'true',
      'need-phone': 'false',
      'need-fio': 'false',
      'need-address': 'false',
      'test-mode': testMode ? '1' : '0',
    })

    // Add customer email if available
    if (params.customer?.email) {
      queryParams.append('email', params.customer.email)
    }

    const paymentUrl = `${baseUrl}?${queryParams.toString()}`

    return {
      success: true,
      paymentUrl,
      paymentId,
    }
  }

  // Robokassa payment methods
  private createRobokassaPayment(config: any, params: PaymentCreateParams): PaymentResult {
    const { merchantLogin, password1, testMode } = config
    const baseUrl = testMode
      ? 'https://test.robokassa.ru/Index.aspx'
      : 'https://auth.robokassa.ru/Merchant/Index.aspx'

    // Generate signature
    const signature = crypto
      .createHash('md5')
      .update(`${merchantLogin}:${params.amount}:${params.orderId}:${password1}`)
      .digest('hex')

    const queryParams = new URLSearchParams({
      MerchantLogin: merchantLogin,
      OutSum: params.amount.toString(),
      InvId: params.orderId,
      Description: params.description,
      SignatureValue: signature,
      IsTest: testMode ? '1' : '0',
      Email: params.customer?.email || '',
      Culture: params.locale === 'ru' ? 'ru' : 'en',
      SuccessURL:
        params.returnUrl ||
        `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/success?provider=robokassa&orderId=${params.orderId}`,
    })

    const paymentUrl = `${baseUrl}?${queryParams.toString()}`
    const paymentId = `rb_${params.orderId}`

    return {
      success: true,
      paymentUrl,
      paymentId,
    }
  }

  // Placeholder for Stripe payment implementation
  private createStripePayment(config: any, params: PaymentCreateParams): PaymentResult {
    // This would be implemented with Stripe SDK
    throw new Error('Stripe payment not implemented yet')
  }

  // Placeholder for PayPal payment implementation
  private createPayPalPayment(config: any, params: PaymentCreateParams): PaymentResult {
    // This would be implemented with PayPal SDK
    throw new Error('PayPal payment not implemented yet')
  }

  // Validate YooMoney callback
  async verifyYooMoneyPayment(notification: any): Promise<boolean> {
    if (!this.payload) {
      throw new Error('Payload instance not set')
    }

    try {
      const settings = await this.getSettings()
      const providers = settings.paymentSettings.availableProviders
      const yoomoneyProvider = providers.find((p) => p.provider === 'yoomoney' && p.enabled)

      if (!yoomoneyProvider) {
        throw new Error('YooMoney provider not configured or disabled')
      }

      const { secretKey } = yoomoneyProvider.config.yoomoney

      if (!secretKey) {
        throw new Error('YooMoney secret key not configured')
      }

      const {
        notification_type,
        operation_id,
        amount,
        currency,
        datetime,
        sender,
        label,
        sha1_hash,
      } = notification

      // Create hash for verification
      const hash = crypto
        .createHash('sha1')
        .update(
          [
            notification_type,
            operation_id,
            amount,
            currency,
            datetime,
            sender,
            label,
            secretKey,
          ].join('&'),
        )
        .digest('hex')

      const isValid = hash === sha1_hash

      if (isValid) {
        // Update order status
        const orderId = label.split('_').pop()

        if (orderId) {
          await this.updateOrderStatus(orderId, {
            status: 'paid',
            paymentId: operation_id,
            paymentProvider: 'yoomoney',
            paymentData: notification,
          })
        }
      }

      return isValid
    } catch (error) {
      console.error('YooMoney payment verification error:', error)
      return false
    }
  }

  // Validate Robokassa callback
  async verifyRobokassaPayment(
    invId: string,
    outSum: string,
    signatureValue: string,
  ): Promise<boolean> {
    if (!this.payload) {
      throw new Error('Payload instance not set')
    }

    try {
      const settings = await this.getSettings()
      const providers = settings.paymentSettings.availableProviders
      const robokassaProvider = providers.find((p) => p.provider === 'robokassa' && p.enabled)

      if (!robokassaProvider) {
        throw new Error('Robokassa provider not configured or disabled')
      }

      const { password2 } = robokassaProvider.config.robokassa

      if (!password2) {
        throw new Error('Robokassa password2 not configured')
      }

      // Create signature
      const expectedSignature = crypto
        .createHash('md5')
        .update(`${outSum}:${invId}:${password2}`)
        .digest('hex')
        .toUpperCase()

      const isValid = expectedSignature === signatureValue.toUpperCase()

      if (isValid) {
        // Update order status
        await this.updateOrderStatus(invId, {
          status: 'paid',
          paymentId: `rb_${invId}`,
          paymentProvider: 'robokassa',
          paymentData: { outSum, signatureValue },
        })
      }

      return isValid
    } catch (error) {
      console.error('Robokassa payment verification error:', error)
      return false
    }
  }

  // Update order status after payment
  private async updateOrderStatus(
    orderId: string,
    update: {
      status: string
      paymentId: string
      paymentProvider: string
      paymentData: any
    },
  ) {
    if (!this.payload) {
      throw new Error('Payload instance not set')
    }

    try {
      // Update order
      await this.payload.update({
        collection: 'orders',
        id: orderId,
        data: {
          status: update.status,
          paymentId: update.paymentId,
          paymentProvider: update.paymentProvider,
          paymentData: update.paymentData,
          paidAt: new Date().toISOString(),
        },
      })

      // Send payment notification
      const settings = await this.getSettings()
      if (settings?.notificationSettings?.email?.enablePaymentNotifications) {
        const order = await this.payload.findByID({
          collection: 'orders',
          id: orderId,
        })

        // Get notification service to send email
        const { NotificationService } = await import('./notification.service')
        const notificationService = new NotificationService(this.payload)

        await notificationService.sendPaymentConfirmation(order)
      }

      return true
    } catch (error) {
      console.error('Failed to update order status:', error)
      return false
    }
  }
}

export const paymentService = new PaymentService()
