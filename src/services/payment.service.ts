import crypto from 'crypto'
import type { Payload } from 'payload'
import { PaymentProvider, PaymentMethod, PaymentStatus } from '@/types/payment'
import { BaseService } from './base.service'
import { NotificationService } from './notification.service'

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

export class PaymentService extends BaseService {
  private static instance: PaymentService | null = null
  private settings: any = null
  private settingsLoaded = false

  private constructor(payload: Payload) {
    super(payload)
  }

  public static getInstance(payload: Payload): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService(payload)
    }
    return PaymentService.instance
  }

  async getSettings() {
    try {
      // If settings already loaded, return them
      if (this.settingsLoaded && this.settings) {
        return this.settings
      }

      // Try to get payment providers from global
      try {
        const paymentProviders = await this.payload.findGlobal({
          slug: 'payment-providers',
        })

        if (paymentProviders) {
          console.log('Retrieved payment-providers global')
          this.settings = this.transformPaymentProviders(paymentProviders)
          this.settingsLoaded = true
          return this.settings
        }
      } catch (error) {
        console.warn('Failed to retrieve payment-providers global:', error)
      }

      // Try fallback to settings global
      try {
        const settings = await this.payload.findGlobal({
          slug: 'settings',
        })

        if (settings) {
          this.settings = settings
          this.settingsLoaded = true
          return this.settings
        }
      } catch (error) {
        console.warn('Failed to retrieve settings global:', error)
      }

      // Return default settings if all attempts failed
      return {
        providers: [{ id: 'robokassa', name: 'Robokassa', enabled: true }],
        defaultProvider: 'robokassa',
      }
    } catch (error) {
      console.error('Error in getSettings:', error)
      return {
        providers: [{ id: 'robokassa', name: 'Robokassa', enabled: true }],
        defaultProvider: 'robokassa',
      }
    }
  }

  private transformPaymentProviders(paymentProviders: any) {
    // Transform the payment-providers global structure to our expected format
    const providers = []
    const providersConfig = {}

    // Process YooMoney settings
    if (paymentProviders.yoomoney?.yoomoney_enabled) {
      providers.push({
        id: 'yoomoney',
        name: paymentProviders.yoomoney?.yoomoney_displayName?.en || 'YooMoney',
        enabled: true,
      })

      // Get config based on test mode
      const yoomoneyConfig = paymentProviders.yoomoney?.yoomoney_config || {}
      const isTestMode = yoomoneyConfig.testMode !== false
      const configSource = isTestMode ? yoomoneyConfig.test : yoomoneyConfig.production

      providersConfig.yoomoney = {
        shopId: configSource?.shop_id || process.env.YOOMONEY_SHOP_ID || 'your_shop_id',
        secretKey: configSource?.secret_key || process.env.YOOMONEY_SECRET_KEY || 'your_secret_key',
        testMode: isTestMode,
      }
    }

    // Process Robokassa settings
    if (paymentProviders.robokassa?.robokassa_enabled) {
      providers.push({
        id: 'robokassa',
        name: paymentProviders.robokassa?.robokassa_displayName?.en || 'Robokassa',
        enabled: true,
      })

      // Get config based on test mode
      const robokassaConfig = paymentProviders.robokassa?.robokassa_config || {}
      const isTestMode = robokassaConfig.testMode !== false
      const configSource = isTestMode ? robokassaConfig.test : robokassaConfig.production

      providersConfig.robokassa = {
        merchantLogin:
          configSource?.merchant_login ||
          process.env.ROBOKASSA_MERCHANT_LOGIN ||
          'your_merchant_login',
        password1: configSource?.password1 || process.env.ROBOKASSA_PASSWORD1 || 'your_password1',
        password2: configSource?.password2 || process.env.ROBOKASSA_PASSWORD2 || 'your_password2',
        testMode: isTestMode,
      }
    }

    // Process Stripe settings
    if (paymentProviders.stripe?.stripe_enabled) {
      providers.push({
        id: 'stripe',
        name: paymentProviders.stripe?.stripe_displayName?.en || 'Stripe',
        enabled: true,
      })

      // Get config based on test mode
      const stripeConfig = paymentProviders.stripe?.stripe_config || {}
      const isTestMode = stripeConfig.testMode !== false
      const configSource = isTestMode ? stripeConfig.test : stripeConfig.production

      providersConfig.stripe = {
        publishableKey:
          configSource?.publishable_key ||
          process.env.STRIPE_PUBLISHABLE_KEY ||
          'your_publishable_key',
        secretKey: configSource?.secret_key || process.env.STRIPE_SECRET_KEY || 'your_secret_key',
        testMode: isTestMode,
      }
    }

    // Process PayPal settings
    if (paymentProviders.paypal?.paypal_enabled) {
      providers.push({
        id: 'paypal',
        name: paymentProviders.paypal?.paypal_displayName?.en || 'PayPal',
        enabled: true,
      })

      // Get config based on test mode
      const paypalConfig = paymentProviders.paypal?.paypal_config || {}
      const isTestMode = paypalConfig.testMode !== false
      const configSource = isTestMode ? paypalConfig.test : paypalConfig.production

      providersConfig.paypal = {
        clientId: configSource?.client_id || process.env.PAYPAL_CLIENT_ID || 'your_client_id',
        clientSecret:
          configSource?.client_secret || process.env.PAYPAL_CLIENT_SECRET || 'your_client_secret',
        testMode: isTestMode,
      }
    }

    // Process Crypto payment settings
    if (paymentProviders.crypto?.crypto_enabled) {
      providers.push({
        id: 'crypto',
        name: paymentProviders.crypto?.crypto_displayName?.en || 'Cryptocurrency',
        enabled: true,
      })

      // Get config based on test mode
      const cryptoConfig = paymentProviders.crypto?.crypto_config || {}
      const isTestMode = cryptoConfig.testMode !== false
      const configSource = isTestMode ? cryptoConfig.test : cryptoConfig.production

      providersConfig.crypto = {
        apiKey: configSource?.api_key || process.env.CRYPTO_API_KEY || 'your_api_key',
        webhookSecret:
          configSource?.webhook_secret ||
          process.env.CRYPTO_WEBHOOK_SECRET ||
          'your_webhook_secret',
        supportedCurrencies: configSource?.supported_currencies?.split(',') || [
          'BTC',
          'ETH',
          'USDT',
        ],
        testMode: isTestMode,
        walletConnectProjectId:
          configSource?.wallet_connect_project_id || process.env.WALLET_CONNECT_PROJECT_ID,
      }
    }

    return {
      providers,
      providersConfig,
      defaultProvider: providers.length > 0 ? providers[0].id : 'yoomoney',
    }
  }

  async getEnabledProviders(): Promise<
    Array<{ id: PaymentProvider; name: string; enabled: boolean }>
  > {
    try {
      const settings = await this.getSettings()
      const enabledProviders = settings?.providers?.filter((p) => p.enabled) || []

      if (enabledProviders.length === 0) {
        return [
          { id: 'yoomoney', name: 'YooMoney', enabled: true },
          { id: 'robokassa', name: 'Robokassa', enabled: true },
        ]
      }

      return enabledProviders
    } catch (error) {
      console.error('Failed to get enabled providers:', error)
      return [
        { id: 'yoomoney', name: 'YooMoney', enabled: true },
        { id: 'robokassa', name: 'Robokassa', enabled: true },
      ]
    }
  }

  async getDefaultProvider(): Promise<PaymentProvider> {
    try {
      const settings = await this.getSettings()
      const defaultProvider = settings?.defaultProvider as PaymentProvider

      if (!defaultProvider) {
        const enabledProviders = await this.getEnabledProviders()
        return enabledProviders[0]?.id || 'yoomoney'
      }

      return defaultProvider
    } catch (error) {
      console.error('Error getting default provider:', error)
      return 'yoomoney' // Default fallback
    }
  }

  async createPayment(
    provider: PaymentProvider,
    params: PaymentCreateParams,
  ): Promise<PaymentResult> {
    try {
      console.log('Creating payment with provider:', provider)

      if (!provider || !provider.id) {
        return {
          success: false,
          error: 'Payment provider is missing or invalid',
        }
      }

      const providerId = provider.id

      // Based on provider ID, call the appropriate payment creation method
      switch (providerId) {
        case 'yoomoney':
          return await this.createYooMoneyPayment(params, provider)
        case 'robokassa':
          return await this.createRobokassaPayment(params, provider)
        case 'stripe':
          return await this.createStripePayment(params, provider)
        case 'paypal':
          return await this.createPayPalPayment(params, provider)
        case 'crypto':
          return await this.createCryptoPayment(params, provider)
        default:
          throw new Error(`Unsupported payment provider: ${providerId}`)
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during payment creation',
      }
    }
  }

  // Здесь идет реализация других методов из payment.ts
  // Методы для создания платежей через различные провайдеры
  // Методы для проверки статуса платежей
  // Другая функциональность платежной системы

  // Check status of payment with provider
  async checkPaymentStatus(
    provider: PaymentProvider,
    paymentId: string,
  ): Promise<{
    status: string
    details?: any
  }> {
    try {
      // Delegate to provider-specific status check
      switch (provider) {
        case 'yoomoney':
          return await this.checkYooMoneyPaymentStatus(paymentId)
        case 'robokassa':
          return await this.checkRobokassaPaymentStatus(paymentId)
        case 'stripe':
          return await this.checkStripePaymentStatus(paymentId)
        case 'paypal':
          return await this.checkPayPalPaymentStatus(paymentId)
        case 'crypto':
          return await this.checkCryptoPaymentStatus(paymentId)
        default:
          console.warn(`No status check method for provider: ${provider}`)
          return { status: 'unknown' }
      }
    } catch (error) {
      console.error(`Error checking payment status with ${provider}:`, error)
      return { status: 'error', details: { error: error.message } }
    }
  }

  // Заглушки для методов, которые должны быть реализованы
  private async createYooMoneyPayment(
    params: PaymentCreateParams,
    provider: any,
  ): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { success: false, error: 'Not implemented' }
  }

  private async createRobokassaPayment(
    params: PaymentCreateParams,
    provider: any,
  ): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { success: false, error: 'Not implemented' }
  }

  private async createStripePayment(
    params: PaymentCreateParams,
    provider: any,
  ): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { success: false, error: 'Not implemented' }
  }

  private async createPayPalPayment(
    params: PaymentCreateParams,
    provider: any,
  ): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { success: false, error: 'Not implemented' }
  }

  private async createCryptoPayment(
    params: PaymentCreateParams,
    provider: any,
  ): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { success: false, error: 'Not implemented' }
  }

  private async checkYooMoneyPaymentStatus(
    paymentId: string,
  ): Promise<{ status: string; details?: any }> {
    // Реализация из payment.ts
    return { status: 'unknown' }
  }

  private async checkRobokassaPaymentStatus(
    paymentId: string,
  ): Promise<{ status: string; details?: any }> {
    // Реализация из payment.ts
    return { status: 'unknown' }
  }

  private async checkStripePaymentStatus(
    paymentId: string,
  ): Promise<{ status: string; details?: any }> {
    // Реализация из payment.ts
    return { status: 'unknown' }
  }

  private async checkPayPalPaymentStatus(
    paymentId: string,
  ): Promise<{ status: string; details?: any }> {
    // Реализация из payment.ts
    return { status: 'unknown' }
  }

  private async checkCryptoPaymentStatus(
    paymentId: string,
  ): Promise<{ status: string; details?: any }> {
    // TODO: Implement crypto payment status check
    return { status: 'unknown' }
  }

  /**
   * Обнаруживает провайдера платежей из данных вебхука
   */
  private detectProviderFromWebhook(webhookData: any): PaymentProvider | null {
    // Проверяем YooMoney
    if (
      webhookData?.notification_type === 'p2p-incoming' ||
      webhookData?.operation_id ||
      webhookData?.sha1_hash
    ) {
      return 'yoomoney'
    }

    // Проверяем Robokassa
    if (webhookData?.InvId && webhookData?.OutSum && webhookData?.SignatureValue) {
      return 'robokassa'
    }

    // Проверяем Stripe
    if (webhookData?.type && webhookData?.data?.object?.object === 'payment_intent') {
      return 'stripe'
    }

    // Проверяем PayPal
    if (webhookData?.event_type && webhookData?.resource?.id) {
      return 'paypal'
    }

    // Проверяем Crypto
    if (webhookData?.crypto_event) {
      return 'crypto'
    }

    return null
  }

  /**
   * Проверяет подлинность вебхука YooMoney
   */
  private verifyYooMoneyWebhook(webhookData: any): boolean {
    // Проверяем формат уведомления
    if (
      !webhookData ||
      typeof webhookData !== 'object' ||
      !this.isValidYooMoneyNotification(webhookData)
    ) {
      console.error('Invalid YooMoney notification format')
      return false
    }

    const {
      sha1_hash,
      notification_type,
      operation_id,
      amount,
      currency,
      datetime,
      sender,
      codepro,
      label,
    } = webhookData

    // Получаем настройки
    const settings = this.getSettings()
    const providersConfig = settings?.providersConfig || {}
    const config = providersConfig.yoomoney || {
      secretKey: process.env.YOOMONEY_SECRET_KEY,
    }

    if (!config.secretKey) {
      console.error('YooMoney secret key is not configured')
      return false
    }

    // Формируем строку для проверки и вычисляем хэш
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
          codepro,
          config.secretKey,
          label,
        ].join('&'),
      )
      .digest('hex')

    // Сравниваем хэши
    return hash === sha1_hash
  }

  /**
   * Проверяет валидность формата уведомления YooMoney
   */
  private isValidYooMoneyNotification(notification: any): boolean {
    if (!notification || typeof notification !== 'object') {
      return false
    }

    const required = [
      'sha1_hash',
      'notification_type',
      'operation_id',
      'amount',
      'currency',
      'datetime',
      'sender',
      'codepro',
      'label',
    ]

    return required.every(
      (field) => field in notification && typeof notification[field] === 'string',
    )
  }

  /**
   * Проверяет подлинность вебхука Robokassa
   */
  private verifyRobokassaWebhook(webhookData: any): boolean {
    if (!webhookData || !webhookData.InvId || !webhookData.OutSum || !webhookData.SignatureValue) {
      console.error('Invalid Robokassa notification format')
      return false
    }

    const { InvId, OutSum, SignatureValue } = webhookData

    // Получаем настройки
    const settings = this.getSettings()
    const providersConfig = settings?.providersConfig || {}
    const config = providersConfig.robokassa || {
      password2: process.env.ROBOKASSA_PASSWORD2,
    }

    if (!config.password2) {
      console.error('Robokassa password2 is not configured')
      return false
    }

    // Формируем строку для проверки и вычисляем хэш
    const expectedSignature = crypto
      .createHash('md5')
      .update(`${OutSum}:${InvId}:${config.password2}`)
      .digest('hex')
      .toUpperCase()

    // Сравниваем хэши
    return expectedSignature === SignatureValue.toUpperCase()
  }

  /**
   * Проверяет подлинность вебхука Stripe
   */
  private verifyStripeWebhook(webhookData: any): boolean {
    // Здесь должна быть реализация проверки подписи Stripe
    return true
  }

  /**
   * Проверяет подлинность вебхука PayPal
   */
  private verifyPayPalWebhook(webhookData: any): boolean {
    // Здесь должна быть реализация проверки подписи PayPal
    return true
  }

  /**
   * Проверяет подлинность вебхука по данным платежной системы
   */
  async verifyWebhook(webhookData: any): Promise<boolean> {
    try {
      const provider = this.detectProviderFromWebhook(webhookData)
      if (!provider) {
        console.error('Неизвестный провайдер платежей в вебхуке')
        return false
      }

      switch (provider) {
        case 'yoomoney':
          return this.verifyYooMoneyWebhook(webhookData)
        case 'robokassa':
          return this.verifyRobokassaWebhook(webhookData)
        case 'stripe':
          return this.verifyStripeWebhook(webhookData)
        case 'paypal':
          return this.verifyPayPalWebhook(webhookData)
        case 'crypto':
          return true // Временная заглушка для crypto
        default:
          console.error(`Проверка подписи для провайдера ${provider} не реализована`)
          return false
      }
    } catch (error) {
      console.error('Ошибка при проверке подписи вебхука:', error)
      return false
    }
  }

  /**
   * Обрабатывает данные вебхука и извлекает нужную информацию
   */
  async processWebhookData(webhookData: any): Promise<{
    orderId: string
    status: string
    transactionId?: string
  }> {
    try {
      const provider = this.detectProviderFromWebhook(webhookData)
      if (!provider) {
        throw new Error('Неизвестный провайдер платежей в вебхуке')
      }

      switch (provider) {
        case 'yoomoney':
          return this.processYooMoneyWebhook(webhookData)
        case 'robokassa':
          return this.processRobokassaWebhook(webhookData)
        case 'stripe':
          return this.processStripeWebhook(webhookData)
        case 'paypal':
          return this.processPayPalWebhook(webhookData)
        case 'crypto':
          // Временная заглушка для crypto
          return {
            orderId: webhookData.order_id || 'unknown',
            status: 'paid',
            transactionId: webhookData.transaction_id,
          }
        default:
          throw new Error(`Обработка вебхука для провайдера ${provider} не реализована`)
      }
    } catch (error) {
      console.error('Ошибка при обработке данных вебхука:', error)
      throw error
    }
  }

  /**
   * Обрабатывает вебхук YooMoney
   */
  private processYooMoneyWebhook(webhookData: any): {
    orderId: string
    status: string
    transactionId?: string
  } {
    // Извлекаем orderId из label (где мы его сохраняли при создании платежа)
    const orderId = webhookData.label || 'unknown'

    // Проверяем, был ли платеж защищен (codepro)
    const isProtected = webhookData.codepro === 'true' || webhookData.codepro === true

    // Определяем статус платежа
    let status = 'processing'
    if (webhookData.unaccepted === 'true' || webhookData.unaccepted === true) {
      status = 'waiting'
    } else if (isProtected) {
      status = 'hold'
    } else {
      status = 'paid'
    }

    return {
      orderId,
      status,
      transactionId: webhookData.operation_id,
    }
  }

  /**
   * Обрабатывает вебхук Robokassa
   */
  private processRobokassaWebhook(webhookData: any): {
    orderId: string
    status: string
    transactionId?: string
  } {
    return {
      orderId: webhookData.InvId.toString(),
      status: 'paid', // Robokassa отправляет вебхук только при успешной оплате
      transactionId: webhookData.InvId.toString(),
    }
  }

  /**
   * Обрабатывает вебхук Stripe
   */
  private processStripeWebhook(webhookData: any): {
    orderId: string
    status: string
    transactionId?: string
  } {
    // Извлекаем данные из объекта события Stripe
    const stripeEvent = webhookData
    const paymentIntent = stripeEvent.data.object

    // Извлекаем orderId из метаданных
    const orderId = paymentIntent.metadata?.orderId || 'unknown'

    // Определяем статус на основе статуса Stripe
    let status = 'processing'

    switch (paymentIntent.status) {
      case 'succeeded':
        status = 'paid'
        break
      case 'processing':
        status = 'processing'
        break
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        status = 'waiting'
        break
      case 'canceled':
        status = 'canceled'
        break
      default:
        status = 'processing'
    }

    return {
      orderId,
      status,
      transactionId: paymentIntent.id,
    }
  }

  /**
   * Обрабатывает вебхук PayPal
   */
  private processPayPalWebhook(webhookData: any): {
    orderId: string
    status: string
    transactionId?: string
  } {
    // Извлекаем данные из объекта события PayPal
    const paypalEvent = webhookData
    const resource = paypalEvent.resource

    // Извлекаем orderId из метаданных или custom_id
    const orderId = resource.custom_id || resource.purchase_units?.[0]?.custom_id || 'unknown'

    // Определяем статус на основе типа события PayPal
    let status

    switch (paypalEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'CHECKOUT.ORDER.APPROVED':
        status = 'paid'
        break
      case 'PAYMENT.CAPTURE.PENDING':
      case 'CHECKOUT.ORDER.PROCESSING':
        status = 'processing'
        break
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'CHECKOUT.ORDER.CANCELLED':
        status = 'canceled'
        break
      default:
        status = 'processing'
    }

    return {
      orderId,
      status,
      transactionId: resource.id,
    }
  }

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
      throw new Error('Payload client not initialized')
    }

    try {
      // Сначала проверяем, существует ли заказ
      const order = await this.payload.findByID({
        collection: 'orders',
        id: orderId,
      })

      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }

      // Обновляем статус заказа
      await this.payload.update({
        collection: 'orders',
        id: orderId,
        data: {
          status: update.status,
          paymentId: update.paymentId,
          paymentProvider: update.paymentProvider,
          paymentData: update.paymentData,
          ...(update.status === 'paid' && { paidAt: new Date().toISOString() }),
        },
      })

      // Если заказ оплачен, отправляем уведомление
      if (update.status === 'paid') {
        try {
          const { ServiceRegistry } = require('./service.registry')
          const serviceRegistry = ServiceRegistry.getInstance(this.payload)
          const notificationService = serviceRegistry.getNotificationService()

          await notificationService.sendPaymentConfirmation({
            orderId,
            data: {
              ...order,
              paymentId: update.paymentId,
              paymentProvider: update.paymentProvider,
            },
          })
        } catch (notifError) {
          console.error('Failed to send payment notification:', notifError)
        }
      }

      return true
    } catch (error) {
      console.error(`Failed to update order ${orderId} status:`, error)
      return false
    }
  }

  /**
   * Создает ссылку для оплаты через YooMoney
   */
  generateYooMoneyPaymentLink(orderId: string, amount: number, description: string): string {
    const settings = this.getSettings()
    const providersConfig = settings.providersConfig || {}
    const config = providersConfig.yoomoney || {
      shopId: process.env.YOOMONEY_SHOP_ID!,
      returnUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/yoomoney/callback`,
    }

    const data = {
      receiver: config.shopId,
      'quickpay-form': 'shop',
      targets: `Order ${orderId}`,
      paymentType: 'AC',
      sum: amount.toString(),
      label: orderId,
      successURL: config.returnUrl,
    }

    const queryString = new URLSearchParams(data).toString()
    return `https://yoomoney.ru/quickpay/confirm.xml?${queryString}`
  }

  /**
   * Создает ссылку для оплаты через Robokassa
   */
  generateRobokassaPaymentLink(orderId: string, amount: number, description: string): string {
    const settings = this.getSettings()
    const providersConfig = settings.providersConfig || {}
    const config = providersConfig.robokassa || {
      merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN!,
      password1: process.env.ROBOKASSA_PASSWORD1!,
      testMode: process.env.NODE_ENV !== 'production',
      returnUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/robokassa/callback`,
    }

    const baseUrl = config.testMode
      ? 'https://test.robokassa.ru/Index.aspx'
      : 'https://auth.robokassa.ru/Merchant/Index.aspx'

    const signature = crypto
      .createHash('md5')
      .update(`${config.merchantLogin}:${amount}:${orderId}:${config.password1}`)
      .digest('hex')

    const params = new URLSearchParams({
      MerchantLogin: config.merchantLogin,
      OutSum: amount.toString(),
      InvId: orderId,
      Description: description,
      SignatureValue: signature,
      IsTest: config.testMode ? '1' : '0',
      SuccessURL: config.returnUrl,
    })

    return `${baseUrl}?${params.toString()}`
  }
}
