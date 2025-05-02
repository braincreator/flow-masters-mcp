import crypto from 'crypto'
import type { Payload } from 'payload'
import {
  PaymentProvider as PaymentProviderType,
  PaymentMethod,
  PaymentStatus,
} from '@/types/payment'
import { BaseService } from './base.service'
import { NotificationService } from './notification.service'
import { ServiceRegistry } from './service.registry'
import { EnrollmentService } from './courses/enrollmentService' // Added
import type { Course, Order, Product, User } from '@/payload-types' // Added
import { add } from 'date-fns' // Added for date calculation
import type { Duration } from 'date-fns' // Added Duration type

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
  provider?: PaymentProviderType
  metadata?: Record<string, any>
  returnUrl?: string
}

interface ProcessPaymentParams {
  amount: number
  currency: string
  provider: string
  paymentMethod: string
  paymentToken: string
  metadata: Record<string, any>
}

interface PaymentResult {
  status: 'successful' | 'failed' | 'pending'
  paymentId: string
  error?: string
}

interface IPaymentProvider {
  processPayment(params: Omit<ProcessPaymentParams, 'provider'>): Promise<PaymentResult>
}

type PaymentProviderKey = 'yoomoney' | 'robokassa' | 'stripe' | 'paypal' | 'crypto'

interface PaymentProviders extends Record<PaymentProviderKey, IPaymentProvider> {}

interface GlobalSettings {
  providers: Array<{
    id: PaymentProviderKey
    name: string
    enabled: boolean
  }>
  defaultProvider: PaymentProviderKey
  providersConfig: Partial<Record<PaymentProviderKey, any>>
}

export class PaymentService extends BaseService {
  private static instance: PaymentService | null = null
  private settings: GlobalSettings | null = null
  private settingsLoaded = false

  private constructor(payload: Payload) {
    super(payload)
    this.loadSettings().catch((err) =>
      console.error('Failed to load settings during initialization:', err),
    )
  }

  public static getInstance(payload: Payload): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService(payload)
    }
    return PaymentService.instance
  }

  /**
   * Загружает настройки асинхронно при инициализации
   */
  private async loadSettings(): Promise<void> {
    try {
      // Try to get payment providers from global
      try {
        const paymentProviders = await this.payload.findGlobal({
          slug: 'payment-providers',
        })

        if (paymentProviders) {
          console.log('Retrieved payment-providers global')
          this.settings = this.transformPaymentProviders(paymentProviders) as GlobalSettings
          this.settingsLoaded = true
          return
        }
      } catch (error) {
        console.warn('Failed to retrieve payment-providers global:', error)
      }

      // Set default settings if all attempts failed
      this.settings = {
        providers: [{ id: 'robokassa', name: 'Robokassa', enabled: true }],
        defaultProvider: 'robokassa',
        providersConfig: {
          robokassa: {
            merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN || '',
            password1: process.env.ROBOKASSA_PASSWORD1 || '',
            password2: process.env.ROBOKASSA_PASSWORD2 || '',
            testMode: true,
          },
        },
      }
      this.settingsLoaded = true
    } catch (error) {
      console.error('Error in loadSettings:', error)
      this.settings = {
        providers: [{ id: 'robokassa', name: 'Robokassa', enabled: true }],
        defaultProvider: 'robokassa',
        providersConfig: {
          robokassa: {
            merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN || '',
            password1: process.env.ROBOKASSA_PASSWORD1 || '',
            password2: process.env.ROBOKASSA_PASSWORD2 || '',
            testMode: true,
          },
        },
      }
      this.settingsLoaded = true
    }
  }

  /**
   * Получает настройки платежных систем
   */
  getSettings(): GlobalSettings {
    if (!this.settingsLoaded || !this.settings) {
      console.warn('Settings not loaded yet, returning default settings')
      return {
        providers: [{ id: 'robokassa', name: 'Robokassa', enabled: true }],
        defaultProvider: 'robokassa',
        providersConfig: {
          robokassa: {
            merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN || '',
            password1: process.env.ROBOKASSA_PASSWORD1 || '',
            password2: process.env.ROBOKASSA_PASSWORD2 || '',
            testMode: true,
          },
        },
      }
    }
    return this.settings
  }

  private transformPaymentProviders(paymentProviders: any) {
    // Transform the payment-providers global structure to our expected format
    const providers = []
    const providersConfig: Partial<Record<PaymentProviderKey, any>> = {} // Typed providersConfig

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
      // Safer default provider handling
      // Safer default provider handling, added non-null assertion assuming providers[0] exists if length > 0
      defaultProvider: providers.find(p => p.enabled)?.id || (providers.length > 0 ? providers[0]!.id : 'robokassa'),
    }
  }

  async getEnabledProviders(): Promise<
    Array<{ id: PaymentProviderKey; name: string; enabled: boolean }>
  > {
    try {
      const settings = this.getSettings()
      return settings.providers.filter((p) => p.enabled)
    } catch (error) {
      console.error('Error getting enabled providers:', error)
      return []
    }
  }

  async getDefaultProvider(): Promise<PaymentProviderKey> {
    try {
      const settings = this.getSettings()
      const defaultProvider = settings.defaultProvider

      if (!defaultProvider) {
        throw new Error('Default payment provider not found')
      }

      return defaultProvider
    } catch (error) {
      console.error('Error getting default provider:', error)
      return 'robokassa'
    }
  }

  async createPayment(
    provider: PaymentProviderKey,
    params: PaymentCreateParams,
  ): Promise<PaymentResult> {
    try {
      const paymentProvider = this.getPaymentProvider(provider)
      const result = await paymentProvider.processPayment({
        amount: params.amount,
        currency: params.currency,
        paymentMethod: params.provider ? String(params.provider) : 'card',
        paymentToken: '',
        metadata: params.metadata || {},
      })

      return {
        status: result.status,
        paymentId: result.paymentId,
        error: result.error,
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      return {
        status: 'failed',
        paymentId: '',
        error: error instanceof Error ? error.message : 'Unknown error during payment creation',
      }
    }
  }

  // Corrected provider type
  async processPayment(params: Omit<ProcessPaymentParams, 'provider'> & { provider: PaymentProviderKey }): Promise<PaymentResult> {
    try {
      const { provider, ...paymentData } = params
      const paymentProvider = this.getPaymentProvider(provider) // Now provider is PaymentProviderKey

      const result = await paymentProvider.processPayment(paymentData)

      return {
        status: result.status,
        paymentId: result.paymentId,
        error: result.error,
      }
    } catch (error) {
      return {
        status: 'failed',
        paymentId: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Здесь идет реализация других методов из payment.ts
  // Методы для создания платежей через различные провайдеры
  // Методы для проверки статуса платежей
  // Другая функциональность платежной системы

  // Check status of payment with provider
  // Corrected provider type
  async checkPaymentStatus(
    provider: PaymentProviderKey,
    paymentId: string,
  ): Promise<{
    status: string
    details?: any
  }> {
    try {
      // Delegate to provider-specific status check
      // No need for cast now, provider is PaymentProviderKey
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
    } catch (error: unknown) { // Catch as unknown
      console.error(`Error checking payment status with ${provider}:`, error)
      // Check if error is an instance of Error before accessing message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { status: 'error', details: { error: errorMessage } }
    }
  }

  // Заглушки для методов, которые должны быть реализованы
  private async createYooMoneyPayment(params: PaymentCreateParams): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { status: 'failed', paymentId: '', error: 'Not implemented' }
  }

  private async createRobokassaPayment(params: PaymentCreateParams): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { status: 'failed', paymentId: '', error: 'Not implemented' }
  }

  private async createStripePayment(params: PaymentCreateParams): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { status: 'failed', paymentId: '', error: 'Not implemented' }
  }

  private async createPayPalPayment(params: PaymentCreateParams): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { status: 'failed', paymentId: '', error: 'Not implemented' }
  }

  private async createCryptoPayment(params: PaymentCreateParams): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { status: 'failed', paymentId: '', error: 'Not implemented' }
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
  private detectProviderFromWebhook(webhookData: any): PaymentProviderKey | null {
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
          // Cast status to the expected enum type
          status: update.status as Order['status'],
          // NOTE: paymentId, paymentProvider, paymentData might be missing from Order type in payload-types.ts
          // Add these fields to src/collections/Orders.ts if they are intended to be stored.
          paymentId: update.paymentId,
          paymentProvider: update.paymentProvider,
          paymentData: update.paymentData,
          ...(update.status === 'paid' && { paidAt: new Date().toISOString() }),
        },
      })

      // Если заказ оплачен, отправляем уведомление
      if (update.status === 'paid') {
        try {
          const serviceRegistry = ServiceRegistry.getInstance(this.payload)
          const notificationService = serviceRegistry.getNotificationService()
          const emailService = serviceRegistry.getEmailService()
          const enrollmentService = serviceRegistry.getEnrollmentService() // Added

          // Get order details with items (ensure customer is populated if it's an object)
          const orderWithItems = await this.payload.findByID({
            collection: 'orders',
            id: orderId,
            // Depth 3 might be needed if customer is an object and product->course is needed
            depth: 3, // Increase depth to ensure product.course is populated
          })

          // Format order items and handle customer type
          const customerField = orderWithItems.customer
          const customerIsObject = typeof customerField === 'object' && customerField !== null && 'id' in customerField // More robust check for populated User
          // Access properties only if it's a populated User object
          const customerName = customerIsObject ? customerField.name : 'Customer' // Provide a default name
          const customerEmail = customerIsObject ? customerField.email : String(customerField || '') // Email might be the ID if not populated
          const customerLocale = customerIsObject ? (customerField as User).locale || 'ru' : 'ru' // Cast to User to access locale if needed

          const items = (orderWithItems.items || []).map((item) => {
            const product = typeof item.product === 'object' ? (item.product as Product) : null
            return {
              product: typeof item.product === 'string' ? item.product : product?.id || '',
              quantity: item.quantity || 1,
              price: item.price || 0,
              name: product?.title || 'Product',
              type: product?.isCourse ? 'course' : 'product',
            }
          })

          // Send order confirmation email using extracted customer details and total
          try {
            // Assuming 'en' locale for price display, adjust if needed
            const displayTotal = orderWithItems.total?.en?.amount ?? orderWithItems.total?.ru?.amount ?? 0
            const displayCurrency = orderWithItems.total?.en?.currency ?? orderWithItems.total?.ru?.currency ?? 'USD'
            const displaySubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0) // Subtotal might need locale conversion too

            await emailService.sendOrderConfirmationEmail({
              userName: customerName, // Use extracted name
              email: customerEmail, // Use extracted email
              orderNumber: orderWithItems.orderNumber || orderId,
              orderDate: orderWithItems.createdAt || new Date().toISOString(),
              items: items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                // Cast type to satisfy the stricter email function type
                type: item.type as 'course' | 'product' | 'subscription' | 'other',
                id: item.product,
              })),
              subtotal: displaySubtotal, // Use calculated subtotal
              total: displayTotal, // Use locale-specific total
              currency: displayCurrency, // Use locale-specific currency
              paymentMethod: update.paymentProvider,
              paymentStatus: 'paid',
              locale: customerLocale, // Use extracted locale
            })
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError)
          }

          // Send payment confirmation notification using extracted details
          // Assuming 'en' locale for price display, adjust if needed
          const displayTotalNotif = orderWithItems.total?.en?.amount ?? orderWithItems.total?.ru?.amount ?? 0
          const displayCurrencyNotif = orderWithItems.total?.en?.currency ?? orderWithItems.total?.ru?.currency ?? 'USD'

          await notificationService.sendPaymentConfirmation({
            orderId,
            orderNumber: orderWithItems.orderNumber || orderId,
            customerEmail: customerEmail, // Use extracted email
            total: displayTotalNotif, // Use locale-specific total
            currency: displayCurrencyNotif, // Use locale-specific currency
            // Cast item type for notification service if needed
            items: items.map(item => ({ ...item, type: item.type as any })),
            paymentMethod: update.paymentProvider,
            paymentId: update.paymentId,
          })

          // --- Course Enrollment Logic ---
          if (enrollmentService && orderWithItems.items && Array.isArray(orderWithItems.items)) {
            const customerField = orderWithItems.customer
            const userId = typeof customerField === 'object' && customerField !== null ? customerField.id : typeof customerField === 'string' ? customerField : null

            if (!userId) {
              console.error(`Cannot enroll in course: User ID not found for order ${orderId}.`)
            } else {
              for (const item of orderWithItems.items) {
                const product = typeof item.product === 'object' ? (item.product as Product) : null
                if (product && product.isCourse && product.course) {
                  const courseRef = product.course
                  const courseId = typeof courseRef === 'object' && courseRef !== null ? courseRef.id : typeof courseRef === 'string' ? courseRef : null

                  if (courseId) {
                    try {
                      // Fetch the full course details (removed explicit generic)
                      // Using 'any' temporarily for course due to potential outdated types
                      const course: any = await this.payload.findByID({
                        collection: 'courses',
                        id: courseId,
                        depth: 0, // Keep depth 0, accessDuration should be top-level
                      })

                      let expiresAt: string | undefined = undefined
                      // Use optional chaining extensively due to potential type issues
                      if (course?.accessDuration?.type === 'limited' && course?.accessDuration?.duration && course?.accessDuration?.unit) {
                        const durationOptions: Duration = {}
                        // Ensure unit is a valid key for Duration and cast
                        const unit = course.accessDuration.unit as keyof Duration
                        if (['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'].includes(unit)) {
                           durationOptions[unit] = course.accessDuration.duration
                           expiresAt = add(new Date(), durationOptions).toISOString()
                        } else {
                          console.warn(`Invalid duration unit '${course.accessDuration.unit}' for course ${courseId}`)
                        }
                      }

                      await enrollmentService.enrollUserInCourse({
                        userId: userId,
                        courseId: courseId,
                        source: 'purchase',
                        orderId: orderId,
                        expiresAt: expiresAt,
                      })
                      console.log(`Successfully enrolled user ${userId} in course ${courseId} from order ${orderId}.`)

                    } catch (enrollmentError) {
                      console.error(`Failed to enroll user ${userId} in course ${courseId} for order ${orderId}:`, enrollmentError)
                      // Decide if this error should be surfaced or just logged
                    }
                  } else {
                     console.warn(`Product ${product.id} in order ${orderId} is marked as course but has no valid course linked.`)
                  }
                }
              }
            }
          }
          // --- End Course Enrollment Logic ---
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

  /**
   * Генерирует ссылку на оплату в зависимости от выбранного провайдера
   */
  async generatePaymentLink(
    orderId: string,
    amount: number,
    description: string,
    providerKey: PaymentProviderKey, // Changed parameter name and type
  ): Promise<string> {
    switch (providerKey) { // Use the key directly
      case 'yoomoney':
        return this.generateYooMoneyPaymentLink(orderId, amount, description)
      case 'robokassa':
        return this.generateRobokassaPaymentLink(orderId, amount, description)
      case 'stripe':
        // TODO: Implement Stripe payment link generation
        throw new Error('Stripe payment links not implemented yet')
      case 'paypal':
        // TODO: Implement PayPal payment link generation
        throw new Error('PayPal payment links not implemented yet')
      case 'crypto':
        // TODO: Implement Crypto payment links not implemented yet')
      default:
        // Use the correct variable name 'providerKey'
        throw new Error(`Unsupported payment provider: ${providerKey}`)
    }
  }

  private getPaymentProvider(provider: PaymentProviderKey): IPaymentProvider {
    const defaultProvider: IPaymentProvider = {
      processPayment: async (params) => {
        return { status: 'failed' as const, paymentId: '', error: 'Not implemented' }
      },
    }

    const providers = {
      yoomoney: defaultProvider,
      robokassa: defaultProvider,
      stripe: defaultProvider,
      paypal: defaultProvider,
      crypto: defaultProvider,
    } as const

    return providers[provider]
  }
}
