import crypto from 'crypto'
import type { Payload } from 'payload'
import {
  PaymentProvider as PaymentProviderType,
  PaymentMethod,
  PaymentStatus,
} from '../types/payment'
import { BaseService } from './base.service'
import { NotificationService } from './notification.service'
import { ServiceRegistry } from './service.registry'
import { EnrollmentService } from './courses/enrollmentService' // Added
// Ensure Subscription is imported if not already, or adjust if it's part of a combined type
import type { Course, Order, Product, Subscription, User } from '@/payload-types' // Added Subscription
import { add } from 'date-fns' // Added for date calculation
import type { Duration } from 'date-fns' // Added Duration type
import { v4 as uuidv4 } from 'uuid'

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

export interface PaymentResult {
  // Added export
  status: 'succeeded' | 'failed' | 'pending' | 'refunded' | 'voided' // Updated status values
  paymentId?: string // Made optional, will hold transactionId (original or new for refund)
  errorMessage?: string // Changed from error
  provider?: PaymentProviderKey // Added provider
  rawResponse?: any // Added rawResponse
}

interface RefundParams {
  originalTransactionId: string
  amount: number // Amount to refund
  currency: string
  reason?: string
  orderId: string // Associated order ID for logging/reference
}

interface VoidParams {
  originalTransactionId: string
  reason?: string
  orderId: string // Associated order ID for logging/reference
}

interface IPaymentProvider {
  processPayment(params: Omit<ProcessPaymentParams, 'provider'>): Promise<PaymentResult>
  chargeWithToken(
    token: string,
    amount: number,
    currency: string,
    description: string,
    orderId: string,
  ): Promise<{ success: boolean; transactionId?: string; error?: string; rawResponse?: any }>
  refundPayment(params: RefundParams): Promise<PaymentResult>
  voidPayment(params: VoidParams): Promise<PaymentResult>
}

export type PaymentProviderKey = 'yoomoney' | 'robokassa' | 'crypto' | 'genericGateway'

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
      defaultProvider:
        providers.find((p) => p.enabled)?.id ||
        (providers.length > 0 ? providers[0]!.id : 'robokassa'),
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
        errorMessage: result.errorMessage, // Changed error to errorMessage
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      return {
        status: 'failed',
        paymentId: '',
        errorMessage:
          error instanceof Error ? error.message : 'Unknown error during payment creation', // Changed error to errorMessage
      }
    }
  }

  // Corrected provider type
  async processPayment(
    paymentToken: string,
    amount: number,
    currency: string,
    orderId: string,
    paymentProviderId: PaymentProviderKey,
  ): Promise<PaymentResult> {
    try {
      const providerService = this.getPaymentProvider(paymentProviderId) // Using getPaymentProvider as per existing code
      if (!providerService) {
        console.error(
          `Payment provider ${paymentProviderId} not found or not configured for recurring payments.`,
        )
        return {
          status: 'failed',
          errorMessage: `Payment provider ${paymentProviderId} not found.`,
          provider: paymentProviderId,
        }
      }

      // Ensure chargeWithToken exists on the providerService instance
      if (
        !('chargeWithToken' in providerService) ||
        typeof providerService.chargeWithToken !== 'function'
      ) {
        console.error(`Provider ${paymentProviderId} does not support chargeWithToken.`)
        return {
          status: 'failed',
          errorMessage: `Provider ${paymentProviderId} does not support tokenized payments.`,
          provider: paymentProviderId,
        }
      }

      const description = `Subscription payment for order ${orderId}`
      const chargeResponse = await providerService.chargeWithToken(
        paymentToken,
        amount,
        currency,
        description,
        orderId,
      )

      if (chargeResponse.success) {
        return {
          status: 'succeeded',
          paymentId: chargeResponse.transactionId, // Mapped to paymentId
          provider: paymentProviderId,
          rawResponse: chargeResponse.rawResponse,
        }
      } else {
        return {
          status: 'failed',
          errorMessage: chargeResponse.error || 'Recurring payment failed at provider.',
          provider: paymentProviderId,
          rawResponse: chargeResponse.rawResponse,
        }
      }
    } catch (error) {
      console.error(
        `Error processing recurring payment for order ${orderId} with ${paymentProviderId}:`,
        error,
      )
      return {
        status: 'failed',
        errorMessage:
          error instanceof Error ? error.message : 'Unknown error during recurring payment.',
        provider: paymentProviderId,
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
        case 'crypto':
          return await this.checkCryptoPaymentStatus(paymentId)
        default:
          console.warn(`No status check method for provider: ${provider}`)
          return { status: 'unknown' }
      }
    } catch (error: unknown) {
      // Catch as unknown
      console.error(`Error checking payment status with ${provider}:`, error)
      // Check if error is an instance of Error before accessing message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { status: 'error', details: { error: errorMessage } }
    }
  }

  // Заглушки для методов, которые должны быть реализованы
  private async createRobokassaPayment(params: PaymentCreateParams): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { status: 'failed', paymentId: '', errorMessage: 'Not implemented' }
  }

  private async createCryptoPayment(params: PaymentCreateParams): Promise<PaymentResult> {
    // Реализация из payment.ts
    return { status: 'failed', paymentId: '', errorMessage: 'Not implemented' }
  }

  private async checkYooMoneyPaymentStatus(
    paymentId: string,
  ): Promise<{ status: PaymentStatus; details?: any }> {
    const yoomoneyConfig = this.settings?.providersConfig?.yoomoney
    if (!yoomoneyConfig?.shopId || !yoomoneyConfig?.secretKey) {
      this.payload.logger.error(
        'YooMoney configuration (shopId/secretKey) is missing for checkPaymentStatus.',
      )
      return {
        status: PaymentStatus.PENDING,
        details: { error: 'YooMoney configuration missing.' },
      }
    }

    const YOOMONEY_API_URL = `https://api.yookassa.ru/v3/payments/${paymentId}`
    const headers = {
      Authorization: `Basic ${Buffer.from(`${yoomoneyConfig.shopId}:${yoomoneyConfig.secretKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    }

    try {
      this.payload.logger.info(`Checking YooMoney payment status for paymentId: ${paymentId}`)
      const response = await fetch(YOOMONEY_API_URL, { method: 'GET', headers })
      const responseData = await response.json()

      if (!response.ok) {
        this.payload.logger.error(
          `YooMoney API error checking status for ${paymentId}: ${response.status}`,
          responseData,
        )
        return {
          status: PaymentStatus.PENDING,
          details: {
            error: responseData.description || `API Error: ${response.status}`,
            rawResponse: responseData,
          },
        }
      }

      this.payload.logger.info(
        `YooMoney payment status for ${paymentId}: ${responseData.status}`,
        responseData,
      )

      let mappedStatus: PaymentStatus
      switch (responseData.status) {
        case 'succeeded':
          mappedStatus = PaymentStatus.COMPLETED
          break
        case 'pending':
          mappedStatus = PaymentStatus.PENDING
          break
        case 'waiting_for_capture': // Typically means payment authorized, needs capture
          mappedStatus = PaymentStatus.PENDING // Or a more specific status like 'requires_action' or 'processing'
          break
        case 'canceled':
          mappedStatus = PaymentStatus.CANCELLED
          break
        default:
          mappedStatus = PaymentStatus.PENDING // Default to PENDING if status is truly unknown or unhandled
          break
      }
      return { status: mappedStatus, details: responseData }
    } catch (apiError: any) {
      this.payload.logger.error(
        `YooMoney checkPaymentStatus API request failed for paymentId ${paymentId}:`,
        apiError,
      )
      return {
        status: PaymentStatus.PENDING,
        details: { error: apiError.message || 'API request failed', rawResponse: apiError },
      }
    }
  }

  private async checkRobokassaPaymentStatus(
    orderId: string, // This is InvId for Robokassa
  ): Promise<{ status: PaymentStatus; details?: any }> {
    const robokassaConfig = this.settings?.providersConfig?.robokassa
    if (
      !robokassaConfig?.merchantLogin ||
      !robokassaConfig?.password2 // Password2 is typically used for API operations like OpState
    ) {
      this.payload.logger.error(
        'Robokassa configuration (merchantLogin/password2) is missing for checkPaymentStatus.',
      )
      return {
        status: PaymentStatus.PENDING,
        details: { error: 'Robokassa configuration missing.' },
      }
    }

    const merchantLogin = robokassaConfig.merchantLogin
    const password2 = robokassaConfig.password2
    const isTestMode = robokassaConfig.testMode === true

    // Robokassa OpState URL
    const opStateUrl = isTestMode
      ? 'https://test.robokassa.ru/WebAPI/api/OpState' // Test OpState URL
      : 'https://auth.robokassa.ru/WebAPI/api/OpState' // Production OpState URL

    const signatureString = `${merchantLogin}:${orderId}:${password2}`
    const signatureValue = crypto
      .createHash('md5')
      .update(signatureString)
      .digest('hex')
      .toUpperCase()

    const requestUrl = `${opStateUrl}?MerchantLogin=${merchantLogin}&InvoiceID=${orderId}&Signature=${signatureValue}`

    try {
      this.payload.logger.info(
        `Checking Robokassa payment status for orderId (InvId): ${orderId} using URL: ${requestUrl}`,
      )
      const response = await fetch(requestUrl, { method: 'GET' })
      const responseData = await response.json()

      if (!response.ok || responseData.ResultCode !== 0) {
        const errorMessage =
          responseData.Description || `Robokassa OpState API Error: ${response.status}`
        this.payload.logger.error(
          `Robokassa OpState API error for InvId ${orderId}: ${errorMessage}`,
          responseData,
        )
        return {
          status: PaymentStatus.PENDING,
          details: {
            error: errorMessage,
            rawResponse: responseData,
          },
        }
      }

      const stateCode = responseData.State?.Code || responseData.StateCode

      this.payload.logger.info(
        `Robokassa payment status for InvId ${orderId}: StateCode ${stateCode}`,
        responseData,
      )

      let mappedStatus: PaymentStatus
      switch (stateCode) {
        case 100: // Payment successful
          mappedStatus = PaymentStatus.COMPLETED
          break
        case 5: // Payment initiated
        case 10: // Payment accepted by Robokassa, user not yet redirected to payment system
        case 50: // Payment initiated, waiting for user action on payment system side
        case 60: // Payment authorized, waiting for confirmation from payment system (e.g., for cards)
        case 80: // Payment confirmed by payment system, waiting for Robokassa to process
          mappedStatus = PaymentStatus.PENDING
          break
        case 0: // Payment cancelled by user or timeout
        case 1000: // Generic error or payment rejected
          mappedStatus = PaymentStatus.CANCELLED // Or FAILED depending on context
          break
        default:
          this.payload.logger.warn(`Unknown Robokassa StateCode ${stateCode} for InvId ${orderId}`)
          mappedStatus = PaymentStatus.PENDING // Default to PENDING for unknown states
          break
      }
      return { status: mappedStatus, details: responseData }
    } catch (apiError: any) {
      this.payload.logger.error(
        `Robokassa checkPaymentStatus API request failed for InvId ${orderId}:`,
        apiError,
      )
      return {
        status: PaymentStatus.PENDING,
        details: { error: apiError.message || 'API request failed', rawResponse: apiError },
      }
    }
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
    // Example detection logic:
    // Check for YooMoney specific fields
    if (webhookData.notification_type && webhookData.operation_id) {
      return 'yoomoney'
    }
    // Check for Robokassa specific fields
    if (webhookData.InvId && webhookData.OutSum && webhookData.SignatureValue) {
      return 'robokassa'
    }
    // Add checks for other providers (Crypto, etc.) if necessary
    // if (webhookData.crypto_specific_field) {
    //   return 'crypto';
    // }

    console.warn('Could not detect payment provider from webhook data:', webhookData)
    return null
  }

  /**
   * Проверяет подлинность вебхука YooMoney, включая криптографическую подпись.
   */
  private async isValidAndVerifyYooMoneySignature(req: any): Promise<boolean> {
    // --- ВАЖНО: НАСТРОЙКА RAW BODY ---
    // Этот метод требует доступа к необработанному телу запроса (req.rawBody).
    // Убедитесь, что для эндпоинта, принимающего вебхуки YooMoney, настроен соответствующий middleware.
    // В Express это может быть bodyParser.raw({ type: 'application/json' }).
    // В Payload CMS v3 это может потребовать настройки на уровне сервера или использования beforeOperation хука
    // для кастомного эндпоинта вебхуков, чтобы сохранить rawBody в req.
    // --- КОНЕЦ ВАЖНОГО ЗАМЕЧАНИЯ ---

    // req должен содержать необработанное тело запроса (rawBody) и заголовки (headers).
    // Убедитесь, что middleware для обработки rawBody (например, bodyParser.raw()) используется для эндпоинта вебхуков.
    // В Payload CMS это можно настроить в server.ts или через beforeOperation хук эндпоинта.
    const notificationBody = req.rawBody
    // Используем правильное имя заголовка согласно документации Yoomoney
    const signatureHeader = req.headers['sha1_hash']

    if (!notificationBody) {
      console.error(
        'YooMoney Webhook Error: Missing raw body. Ensure rawBody middleware is configured for the webhook endpoint.',
      )
      return false
    }
    if (!signatureHeader) {
      console.error('YooMoney Webhook Error: Missing sha1_hash header.')
      return false
    }

    await this.ensureSettingsLoaded() // Убедимся, что настройки загружены
    const providerConfig = this.settings?.providersConfig?.yoomoney
    const secretKey = providerConfig?.secretKey

    if (!secretKey) {
      console.error(
        'YooMoney Webhook Error: Secret key is not configured in Payment Provider settings.',
      )
      return false // Не можем проверить подпись без ключа
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha1', secretKey)
        .update(notificationBody)
        .digest('hex')

      // Use timingSafeEqual for security
      const signaturesMatch = crypto.timingSafeEqual(
        Buffer.from(signatureHeader as string),
        Buffer.from(expectedSignature),
      )

      if (!signaturesMatch) {
        console.warn(
          `YooMoney Webhook Signature Verification Failed. Expected: ${expectedSignature}, Received: ${signatureHeader}`,
        )
        return false
      }

      console.log('YooMoney Webhook Signature Verified Successfully.')
      return true
    } catch (error) {
      console.error('Error during YooMoney signature verification:', error)
      return false
    }
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
    // Используем Non-Null Assertion Operator '!', так как мы уверены, что password2 есть, если Robokassa включена и настроена
    const config = providersConfig.robokassa

    if (!config?.password2) {
      console.error('Robokassa password2 is not configured in Payment Provider settings.')
      return false
    }

    // Формируем строку для проверки и вычисляем хэш
    // Убеждаемся, что параметры добавлены в правильном порядке и с нужными разделителями
    const signatureString = `${OutSum}:${InvId}:${config.password2}` // Порядок важен!
    const expectedSignature = crypto
      .createHash('md5')
      .update(signatureString)
      .digest('hex')
      .toUpperCase()

    // Сравниваем хэши, используя безопасное сравнение по времени, чтобы предотвратить атаки по времени
    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(SignatureValue.toUpperCase()),
      Buffer.from(expectedSignature),
    )

    if (!signaturesMatch) {
      console.warn(
        `Robokassa Webhook Signature Verification Failed. Expected: ${expectedSignature}, Received: ${SignatureValue.toUpperCase()}. String: ${signatureString}`,
      )
      return false
    }

    console.log('Robokassa Webhook Signature Verified Successfully.')
    return true
  }

  /**
   * Проверяет подлинность вебхука по данным платежной системы
   * @param req - Объект запроса (предположительно Express Request), должен содержать rawBody и headers
   */
  async verifyWebhook(req: any): Promise<boolean> {
    // Обнаружение провайдера может потребовать анализа тела или заголовков
    // req.body может быть уже распарсенным JSON/формой, используем его для детекции
    // req.rawBody используется для проверки подписи YooMoney
    const provider = this.detectProviderFromWebhook(req.body)

    if (!provider) {
      console.warn(
        'Webhook Verification: Could not detect payment provider from request body:',
        req.body,
      )
      return false
    }

    switch (provider) {
      case 'yoomoney':
        // Передаем весь объект req для доступа к rawBody и headers
        return await this.isValidAndVerifyYooMoneySignature(req)
      case 'robokassa':
        // Robokassa использует параметры запроса (тело) для подписи
        return this.verifyRobokassaWebhook(req.body)
      // case 'crypto':
      //     return await this.isValidAndVerifyCryptoSignature(req); // Пример для крипто
      default:
        console.warn(`Webhook Verification: Provider ${provider} not supported for verification.`)
        return false // Или true, если не хотим блокировать неподдерживаемые, но это рискованно
    }
  }

  private async ensureSettingsLoaded(): Promise<void> {
    if (!this.settingsLoaded) {
      console.log('Settings not loaded, attempting to load now...')
      await this.loadSettings()
      if (!this.settingsLoaded) {
        throw new Error('Failed to load payment settings.')
      }
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
        case 'crypto':
          // Временная заглушка для crypto
          // TODO: Implement proper crypto webhook processing
          this.payload.logger.info(
            '[processWebhookData] Processing crypto webhook (stub)',
            webhookData,
          )
          return {
            orderId:
              webhookData.order_id || webhookData.metadata?.order_id || 'unknown_crypto_order',
            status: PaymentStatus.COMPLETED, // Предполагаем COMPLETED для заглушки
            transactionId: webhookData.transaction_id || webhookData.id || undefined,
          }
        default:
          // Эта ошибка будет поймана в общем catch блоке ниже
          throw new Error(`Обработка вебхука для провайдера ${provider} не реализована`)
      }
    } catch (error: any) {
      // Улучшенное логирование
      // Попытаемся определить провайдера еще раз для лога, если он не был определен ранее или ошибка произошла до этого
      const detectedProviderForLog = this.detectProviderFromWebhook(webhookData)
      this.payload.logger.error(
        `[processWebhookData] Error processing webhook data: ${error?.message || 'Unknown error'}`,
        {
          providerAttempted: detectedProviderForLog || 'unknown_or_failed_detection',
          method: 'processWebhookData',
          // Осторожно с логированием всего webhookData, может содержать PII или быть очень большим.
          // Логируем только наличие или ключевые нечувствительные идентификаторы, если это безопасно.
          webhookReceived: true,
          webhookKeys: webhookData ? Object.keys(webhookData) : [], // Логируем ключи для понимания структуры
          errorDetails: {
            message: error?.message,
            name: error?.name,
            stack: error?.stack,
          },
          rawErrorObject: error,
        },
      )
      throw error // Перебрасываем ошибку, чтобы она была обработана выше, если это необходимо
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
      status = PaymentStatus.COMPLETED // Use enum
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
    status: PaymentStatus // Use the enum type
    transactionId?: string
  } {
    const orderId = webhookData.InvId
    if (!orderId) {
      console.error('Robokassa Webhook Error: Missing orderId (InvId)')
      throw new Error('Missing orderId in Robokassa webhook data')
    }

    // Robokassa typically sends webhooks only for successful payments (ResultURL).
    // SuccessURL is a redirect, FailureURL is a redirect.
    // We rely on the verification step to ensure this is a valid success notification.
    const status = PaymentStatus.COMPLETED // Use enum

    // Optional: Verify OutSum matches the order total
    // const expectedAmount = ... fetch order amount ...
    // if (parseFloat(webhookData.OutSum) >= expectedAmount) {
    //    status = PaymentStatus.PAID
    // } else {
    //    console.warn(`Robokassa Webhook: Amount mismatch for order ${orderId}. Received ${webhookData.OutSum}, expected ${expectedAmount}`)
    //    status = PaymentStatus.FAILED // Or handle partial payment
    // }

    return {
      orderId: String(orderId), // Ensure it's a string
      status,
      transactionId: String(orderId), // Robokassa uses InvId as the transaction identifier
    }
  }

  private extractPaymentTokenFromProviderData(
    paymentData: any,
    provider: PaymentProviderKey,
  ): string | null {
    if (!paymentData) {
      console.warn(`No paymentData provided to extract token for provider: ${provider}`)
      return null
    }

    // Provider-specific logic to extract token. This is highly dependent on provider's response structure.
    // Add more cases as new providers are integrated or existing ones change.
    console.log(
      `Attempting to extract payment token for provider: ${provider} from data:`,
      JSON.stringify(paymentData, null, 2),
    )

    let potentialToken: string | undefined | null = null

    // General common patterns - prioritize more specific provider logic if available
    // These are common field names for reusable tokens or payment method identifiers.
    potentialToken =
      paymentData?.recurring_token || // Common in some custom integrations
      paymentData?.payment_method_id || // Common in Stripe (PaymentIntent, SetupIntent)
      paymentData?.token || // Generic token field
      paymentData?.id // Sometimes the ID of a payment method object itself is the token

    // Check nested structures, e.g., Stripe's card details within payment_method_details
    if (paymentData?.payment_method_details?.card?.token) {
      potentialToken = paymentData.payment_method_details.card.token
    } else if (paymentData?.card?.token) {
      // Some providers might nest card token directly
      potentialToken = paymentData.card.token
    }

    // Placeholder for specific provider logic, e.g., YooMoney, Robokassa, Crypto
    // This section should be expanded based on how each provider returns reusable tokens.
    switch (provider) {
      case 'yoomoney':
        // YooMoney might require a specific call to save a payment method or use a token from `save_payment_method: true` flow.
        // If a token is directly in webhook data (e.g. `payment_method_data.id` if it's a saved method), extract it here.
        // For now, relying on generic patterns.
        console.log(
          'YooMoney: Check paymentData for a recurring token if applicable for their API (e.g., saved payment method ID).',
        )
        if (paymentData?.payment_method_data?.id) {
          potentialToken = paymentData.payment_method_data.id
        }
        break
      case 'robokassa':
        // Robokassa's standard flow might not directly provide a reusable token in the webhook for recurring.
        // It often involves a separate "recurring payment" setup or specific parameters.
        // If a token is available, extract it here.
        // For Robokassa, the InvId from the initial payment notification often serves as the identifier for recurring setups.
        console.log(
          'Robokassa: Check if InvId (initial order ID) is available in paymentData to be used as a token for recurring.',
        )
        if (paymentData?.InvId) {
          potentialToken = String(paymentData.InvId)
        }
        break
      case 'crypto':
        // Crypto payments are less likely to have traditional "tokens" unless it's a specific service.
        console.log('Crypto: Unlikely to have standard payment tokens for recurring billing.')
        break
      // Add other specific provider handlers here
      default:
        console.log(
          `No specific token extraction logic for provider: ${provider}. Relying on generic patterns.`,
        )
    }

    if (potentialToken) {
      console.log(
        `Potential payment token found: ${String(potentialToken)} for provider ${provider}`,
      )
      return String(potentialToken)
    }

    console.warn(
      `Could not extract a reusable payment token for provider ${provider} from the provided paymentData. Recurring payments may fail or require manual setup.`,
    )
    return null
  }

  private async updateOrderStatus(
    orderId: string,
    update: {
      status: string
      paymentId: string
      paymentProvider: string
      paymentData: any // This is the raw data from the provider's webhook/callback
    },
  ) {
    if (!this.payload) {
      throw new Error('Payload client not initialized')
    }

    try {
      // Fetch the order first. Ensure depth is sufficient for orderType and paymentProvider.
      // The existing depth: 3 in the successful payment block should be fine.
      // However, we need the order object *before* the main update to check its current state for token processing.
      let order = await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 1, // Minimal depth for initial checks, will re-fetch with more depth later if needed
      })

      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }

      // Обновляем статус заказа
      await this.payload.update({
        collection: 'orders',
        id: orderId,
        data: {
          status: update.status as Order['status'],
          paymentId: update.paymentId,
          paymentProvider: update.paymentProvider,
          // Storing raw paymentData might be too verbose or contain sensitive info not meant for long-term storage in order.
          // Consider if this is necessary or if specific fields should be extracted.
          // For now, keeping as per existing structure.
          paymentData: update.paymentData,
          ...(update.status === PaymentStatus.COMPLETED && { paidAt: new Date().toISOString() }),
        },
      })

      // Re-fetch order after update to have the latest state for subsequent operations, including paidAt
      order = await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 3, // Depth for notifications, enrollments, and token processing
      })
      if (!order) {
        // Should not happen if previous find and update succeeded, but good practice
        throw new Error(`Order ${orderId} not found after update`)
      }

      // Если заказ оплачен (COMPLETED), отправляем уведомление и обрабатываем подписку
      if (update.status === PaymentStatus.COMPLETED) {
        // --- Existing Notification and Enrollment Logic ---
        try {
          const serviceRegistry = ServiceRegistry.getInstance(this.payload)
          const notificationService = serviceRegistry.getNotificationService()
          const emailService = serviceRegistry.getEmailService()
          const enrollmentService = serviceRegistry.getEnrollmentService()

          const orderWithItems = order // Use the already fetched and updated order

          const customerField = orderWithItems.customer
          const customerIsObject =
            typeof customerField === 'object' && customerField !== null && 'id' in customerField
          const customerName = customerIsObject ? customerField.name : 'Customer'
          const customerEmail = customerIsObject ? customerField.email : String(customerField || '')
          const customerLocale = customerIsObject ? (customerField as User).locale || 'ru' : 'ru'

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

          try {
            const displayTotal =
              orderWithItems.total?.en?.amount ?? orderWithItems.total?.ru?.amount ?? 0
            const displayCurrency =
              orderWithItems.total?.en?.currency ?? orderWithItems.total?.ru?.currency ?? 'USD'
            const displaySubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

            await emailService.sendOrderConfirmationEmail({
              userName: customerName,
              email: customerEmail,
              orderNumber: orderWithItems.orderNumber || orderId,
              orderDate:
                orderWithItems.paidAt || orderWithItems.createdAt || new Date().toISOString(), // Prefer paidAt
              items: items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                type: item.type as 'course' | 'product' | 'subscription' | 'other',
                id: item.product,
              })),
              subtotal: displaySubtotal,
              total: displayTotal,
              currency: displayCurrency,
              paymentMethod: update.paymentProvider,
              paymentStatus: 'paid',
              locale: customerLocale,
            })
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError)
          }

          const displayTotalNotif =
            orderWithItems.total?.en?.amount ?? orderWithItems.total?.ru?.amount ?? 0
          const displayCurrencyNotif =
            orderWithItems.total?.en?.currency ?? orderWithItems.total?.ru?.currency ?? 'USD'

          await notificationService.sendPaymentConfirmation({
            orderId,
            orderNumber: orderWithItems.orderNumber || orderId,
            customerEmail: customerEmail,
            total: displayTotalNotif,
            currency: displayCurrencyNotif,
            items: items.map((item) => ({ ...item, type: item.type as any })),
            paymentMethod: update.paymentProvider,
            paymentId: update.paymentId,
          })

          if (enrollmentService && orderWithItems.items && Array.isArray(orderWithItems.items)) {
            const userId =
              typeof customerField === 'object' && customerField !== null
                ? customerField.id
                : typeof customerField === 'string'
                  ? customerField
                  : null

            if (!userId) {
              console.error(`Cannot enroll in course: User ID not found for order ${orderId}.`)
            } else {
              for (const item of orderWithItems.items) {
                const product = typeof item.product === 'object' ? (item.product as Product) : null
                if (product && product.isCourse && product.course) {
                  const courseRef = product.course
                  const courseId =
                    typeof courseRef === 'object' && courseRef !== null
                      ? courseRef.id
                      : typeof courseRef === 'string'
                        ? courseRef
                        : null

                  if (courseId) {
                    try {
                      const courseDetails: any = await this.payload.findByID({
                        collection: 'courses',
                        id: courseId,
                        depth: 0,
                      })

                      let expiresAt: string | undefined = undefined
                      if (
                        courseDetails?.accessDuration?.type === 'limited' &&
                        courseDetails?.accessDuration?.duration &&
                        courseDetails?.accessDuration?.unit
                      ) {
                        const durationOptions: Duration = {}
                        const unit = courseDetails.accessDuration.unit as keyof Duration
                        if (
                          [
                            'years',
                            'months',
                            'weeks',
                            'days',
                            'hours',
                            'minutes',
                            'seconds',
                          ].includes(unit)
                        ) {
                          durationOptions[unit] = courseDetails.accessDuration.duration
                          expiresAt = add(new Date(), durationOptions).toISOString()
                        } else {
                          console.warn(
                            `Invalid duration unit '${courseDetails.accessDuration.unit}' for course ${courseId}`,
                          )
                        }
                      }

                      await enrollmentService.enrollUserInCourse({
                        userId: userId,
                        courseId: courseId,
                        source: 'purchase',
                        orderId: orderId,
                        expiresAt: expiresAt,
                      })
                      console.log(
                        `Successfully enrolled user ${userId} in course ${courseId} from order ${orderId}.`,
                      )
                    } catch (enrollmentError) {
                      console.error(
                        `Failed to enroll user ${userId} in course ${courseId} for order ${orderId}:`,
                        enrollmentError,
                      )
                    }
                  } else {
                    console.warn(
                      `Product ${product.id} in order ${orderId} is marked as course but has no valid course linked.`,
                    )
                  }
                }
              }
            }
          }
        } catch (notifError) {
          console.error('Failed to send payment notification or enroll user:', notifError)
        }

        // --- New Subscription Payment Token Logic ---
        // Ensure order.orderType and order.subscriptionProcessedToken are available in your Order type.
        // These fields need to be defined in src/collections/Orders.ts
        if (
          order.orderType === 'subscription' &&
          !order.subscriptionProcessedToken // Check if token has already been processed for this order
        ) {
          console.log(`Processing token for initial subscription payment for order ${order.id}`)
          const paymentToken = this.extractPaymentTokenFromProviderData(
            update.paymentData, // Raw data from provider
            order.paymentProvider as PaymentProviderKey,
          )

          if (paymentToken) {
            try {
              const subscriptionsResult = await this.payload.find({
                collection: 'subscriptions',
                where: {
                  AND: [
                    {
                      order: {
                        equals: order.id,
                      },
                    },
                  ],
                }, // Assumes 'order' field in Subscription links to Order ID
                limit: 1,
                depth: 0, // Not much depth needed to update subscription
              })

              if (subscriptionsResult.docs.length > 0) {
                const subscription = subscriptionsResult.docs[0] as Subscription // Cast to Subscription type

                // Additional check: ensure this subscription is still in a state expecting a token (e.g., 'pending')
                // This prevents overwriting a token if, for some reason, this logic runs multiple times for an active sub.
                if (subscription.status === 'pending' || !subscription.paymentToken) {
                  await this.payload.update({
                    collection: 'subscriptions',
                    id: subscription.id,
                    data: {
                      paymentToken: paymentToken,
                      // Use the correct field name 'paymentProvider' and cast to the Subscription's paymentProvider type
                      paymentProvider: order.paymentProvider as Subscription['paymentProvider'],
                      status: 'active', // Update subscription status
                    },
                  })
                  console.log(
                    `Stored payment token and set status to 'active' for subscription ${subscription.id} (order ${order.id})`,
                  )

                  // Mark the order to prevent reprocessing token for this specific order
                  await this.payload.update({
                    collection: 'orders',
                    id: order.id,
                    data: {
                      subscriptionProcessedToken: true, // This field must exist in the Order collection
                    },
                  })
                  console.log(`Marked order ${order.id} as subscription token processed.`)
                } else {
                  console.warn(
                    `Subscription ${subscription.id} (order ${order.id}) is not in a pending/incomplete state (current: ${subscription.status}) or already has a token. Token storage skipped.`,
                  )
                }
              } else {
                console.error(
                  `No subscription found linked to successful order ${order.id} to store payment token.`,
                )
              }
            } catch (tokenError) {
              console.error(
                `Error storing payment token for subscription linked to order ${order.id}:`,
                tokenError,
              )
            }
          } else {
            console.warn(
              `No payment token found/extracted from provider data for subscription order ${order.id} with provider ${order.paymentProvider}. Recurring payments may fail.`,
            )
          }
        }
        // --- End Subscription Payment Token Logic ---
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
    switch (
      providerKey // Use the key directly
    ) {
      case 'yoomoney':
        return this.generateYooMoneyPaymentLink(orderId, amount, description)
      case 'robokassa':
        return this.generateRobokassaPaymentLink(orderId, amount, description)
      case 'crypto':
        // TODO: Implement Crypto payment links
        const cryptoErrorMsg = `[generatePaymentLink] Crypto payment links not implemented yet for order ${orderId}.`
        this.payload.logger.error(cryptoErrorMsg, {
          provider: 'crypto',
          method: 'generatePaymentLink',
          orderId,
        })
        throw new Error('Crypto payment links not implemented yet')
      default:
        // Логируем ошибку перед throw
        const unsupportedErrorMsg = `[generatePaymentLink] Unsupported payment provider requested: ${providerKey} for order ${orderId}.`
        this.payload.logger.error(unsupportedErrorMsg, {
          provider: providerKey,
          method: 'generatePaymentLink',
          orderId,
        })
        // Use the correct variable name 'providerKey'
        throw new Error(`Unsupported payment provider: ${providerKey}`)
    }
  }

  // Method to process a refund
  async refundPayment(
    orderId: string,
    currency: string, // <<< ДОБАВЛЕН ПАРАМЕТР ВАЛЮТЫ
    amountToRefund?: number, // Optional: if not provided, attempt full refund
    reason?: string,
  ): Promise<PaymentResult> {
    this.payload.logger.info(
      `Attempting to refund payment for orderId: ${orderId}, currency: ${currency}, amount: ${amountToRefund}, reason: ${reason}`,
    )
    try {
      // УДАЛЯЕМ ЯВНЫЙ ТИП <Order>
      const order = await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 1, // Увеличим depth, чтобы точно получить customer и total
      })

      if (!order) {
        this.payload.logger.error(`Order ${orderId} not found for refund.`)
        return { status: 'failed', errorMessage: `Order ${orderId} not found.` }
      }

      if (!order.paymentId || !order.paymentProvider) {
        this.payload.logger.error(
          `Order ${orderId} is missing paymentId or paymentProvider. Cannot process refund.`,
        )
        return { status: 'failed', errorMessage: 'Missing payment transaction details on order.' }
      }

      const providerKey = order.paymentProvider as PaymentProviderKey
      const paymentProvider = this.getPaymentProvider(providerKey)

      if (!paymentProvider.refundPayment) {
        this.payload.logger.error(
          `Refund functionality not implemented for provider: ${providerKey}`,
        )
        return { status: 'failed', errorMessage: `Refunds not supported by ${providerKey}.` }
      }

      // Определяем сумму возврата: если не указана, используем order.total в ПЕРЕДАННОЙ валюте.
      // Извлекаем локаль из запрошенной валюты (простое предположение: 'rub' -> 'ru', остальное -> 'en')
      // В РЕАЛЬНОСТИ: Локаль должна определяться более надежно, например, по локали пользователя заказа.
      const orderLocale = currency.toLowerCase() === 'rub' ? 'ru' : 'en'
      const orderTotalForCurrency = (order.total as any)?.[orderLocale]?.amount

      const finalAmountToRefund = amountToRefund ?? orderTotalForCurrency ?? 0 // Используем сумму заказа в нужной валюте

      // Используем переданную валюту
      const finalCurrency = currency

      if (finalAmountToRefund <= 0) {
        this.payload.logger.error(
          `Invalid refund amount ${finalAmountToRefund} for order ${orderId} in currency ${finalCurrency}. Order total in this currency: ${orderTotalForCurrency}`,
        )
        return { status: 'failed', errorMessage: 'Invalid refund amount.' }
      }

      const refundResult = await paymentProvider.refundPayment({
        originalTransactionId: order.paymentId,
        amount: finalAmountToRefund,
        currency: finalCurrency, // <<< ПЕРЕДАЕМ ПРАВИЛЬНУЮ ВАЛЮТУ
        reason: reason || `Refund for order ${orderId}`,
        orderId: orderId,
      })

      if (refundResult.status === 'succeeded' || refundResult.status === 'refunded') {
        this.payload.logger.info(
          `Refund successful for order ${orderId}, new transactionId: ${refundResult.paymentId}`,
        )
        // Update order status to 'refunded' or a similar status
        await this.payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            // TODO: Change status to 'refunded' once payload-types.ts is updated to reflect Orders.ts
            status: 'cancelled', // Or a more specific status like 'partially_refunded' if applicable
            // Potentially store refund transaction ID or details
            // refundDetails: {
            //   refundTransactionId: refundResult.paymentId,
            //   refundedAt: new Date().toISOString(),
            //   amount: finalAmountToRefund,
            //   reason: reason,
            // },
          },
        })
      } else {
        this.payload.logger.error(
          `Refund failed for order ${orderId}: ${refundResult.errorMessage}`,
        )
      }

      return refundResult
    } catch (error) {
      this.payload.logger.error(`Error during refund process for order ${orderId}:`, error)
      return {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error during refund.',
      }
    }
  }

  // Method to void a payment
  async voidPayment(orderId: string, reason?: string): Promise<PaymentResult> {
    this.payload.logger.info(
      `Attempting to void payment for orderId: ${orderId}, reason: ${reason}`,
    )
    try {
      const order = await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
      })

      if (!order) {
        this.payload.logger.error(`Order ${orderId} not found for void.`)
        return { status: 'failed', errorMessage: `Order ${orderId} not found.` }
      }

      if (!order.paymentId || !order.paymentProvider) {
        this.payload.logger.error(
          `Order ${orderId} is missing paymentId or paymentProvider. Cannot process void.`,
        )
        return { status: 'failed', errorMessage: 'Missing payment transaction details on order.' }
      }

      const providerKey = order.paymentProvider as PaymentProviderKey
      const paymentProvider = this.getPaymentProvider(providerKey)

      if (!paymentProvider.voidPayment) {
        this.payload.logger.error(`Void functionality not implemented for provider: ${providerKey}`)
        return { status: 'failed', errorMessage: `Voids not supported by ${providerKey}.` }
      }

      const voidResult = await paymentProvider.voidPayment({
        originalTransactionId: order.paymentId,
        reason: reason || `Void for order ${orderId}`,
        orderId: orderId,
      })

      if (voidResult.status === 'succeeded' || voidResult.status === 'voided') {
        this.payload.logger.info(`Void successful for order ${orderId}`)
        // Update order status to 'cancelled' or 'voided'
        await this.payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            status: 'cancelled', // Or 'voided'
            // Potentially store void details
            // voidDetails: {
            //   voidedAt: new Date().toISOString(),
            //   reason: reason,
            // },
          },
        })
      } else {
        this.payload.logger.error(`Void failed for order ${orderId}: ${voidResult.errorMessage}`)
      }

      return voidResult
    } catch (error) {
      this.payload.logger.error(`Error during void process for order ${orderId}:`, error)
      return {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error during void.',
      }
    }
  }

  private getPaymentProvider(provider: PaymentProviderKey): IPaymentProvider {
    const defaultProvider: IPaymentProvider = {
      processPayment: async (params) => {
        this.payload.logger.warn(
          `Default provider processPayment STUB called for amount: ${params.amount}`,
        )
        return {
          status: 'failed',
          paymentId: '',
          errorMessage: 'Not implemented in default provider',
        }
      },
      chargeWithToken: async (token, amount, currency, description, orderId) => {
        this.payload.logger.warn(
          `chargeWithToken called on defaultProvider stub for token: ${token}, orderId: ${orderId}`,
        )
        if (token === 'valid_token_for_success_stub') {
          return {
            success: true,
            transactionId: `stub_tx_${Date.now()}`,
            rawResponse: { message: 'Stubbed successful charge from default provider' },
          }
        }
        return {
          success: false,
          error: 'Invalid token or stubbed failure from default provider',
          rawResponse: { message: 'Stubbed failed charge from default provider' },
        }
      },
      refundPayment: async (params: RefundParams): Promise<PaymentResult> => {
        this.payload.logger.warn(
          `STUB: DefaultProvider.refundPayment called for order ${params.orderId}, originalTx: ${params.originalTransactionId}, amount: ${params.amount} ${params.currency}. Real API integration needed.`,
        )
        // Simulate a successful refund
        return {
          status: 'refunded', // Use the new status
          paymentId: `stub_refund_${Date.now()}_${params.originalTransactionId}`, // New ID for the refund transaction
          provider: 'genericGateway',
          rawResponse: { stubbed: true, ...params },
        }
      },
      voidPayment: async (params: VoidParams): Promise<PaymentResult> => {
        this.payload.logger.warn(
          `STUB: DefaultProvider.voidPayment called for order ${params.orderId}, originalTx: ${params.originalTransactionId}. Real API integration needed.`,
        )
        // Simulate a successful void
        return {
          status: 'voided', // Use the new status
          paymentId: params.originalTransactionId, // Void usually refers to the original transaction
          provider: 'genericGateway',
          rawResponse: { stubbed: true, ...params },
        }
      },
    }

    const yoomoneyProvider: IPaymentProvider = {
      processPayment: async (
        params: Omit<ProcessPaymentParams, 'provider'>,
      ): Promise<PaymentResult> => {
        const yoomoneyConfig = this.settings?.providersConfig?.yoomoney
        if (!yoomoneyConfig?.shopId || !yoomoneyConfig?.secretKey) {
          this.payload.logger.error(
            'YooMoney configuration (shopId/secretKey) is missing for processPayment.',
          )
          return {
            status: 'failed',
            errorMessage: 'YooMoney configuration missing.',
            provider: 'yoomoney',
          }
        }

        const idempotenceKey = uuidv4()
        const YOOMONEY_API_PAYMENTS_ENDPOINT = 'https://api.yookassa.ru/v3/payments'
        const headers = {
          Authorization: `Basic ${Buffer.from(`${yoomoneyConfig.shopId}:${yoomoneyConfig.secretKey}`).toString('base64')}`,
          'Idempotence-Key': idempotenceKey,
          'Content-Type': 'application/json',
        }

        // Extract orderId from metadata if available, otherwise generate a reference
        const orderId = params.metadata?.orderId || `order_${Date.now()}`
        const description = params.metadata?.description || `Payment for order ${orderId}`
        const returnUrl =
          params.metadata?.returnUrl ||
          `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/callback/yoomoney`

        const body = {
          amount: {
            value: params.amount.toFixed(2),
            currency: params.currency,
          },
          confirmation: {
            type: 'redirect',
            return_url: returnUrl,
          },
          description: description,
          metadata: {
            // Pass all metadata, ensuring orderId is present
            ...params.metadata,
            order_id: orderId, // Ensure order_id is explicitly in metadata for YooMoney
          },
          capture: true, // Auto-capture payment
          // payment_method_data: params.paymentMethod ? { type: params.paymentMethod } : undefined, // e.g. 'bank_card', 'yoo_money'
          save_payment_method: params.metadata?.savePaymentMethod === true, // For recurring payments
        }

        try {
          this.payload.logger.info(
            `Creating YooMoney payment for order ${orderId}, amount: ${params.amount} ${params.currency}. Idempotence-Key: ${idempotenceKey}`,
          )
          const response = await fetch(YOOMONEY_API_PAYMENTS_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          })
          const responseData = await response.json()

          if (!response.ok || !responseData.id) {
            this.payload.logger.error(
              `YooMoney API error creating payment for order ${orderId}: ${response.status}`,
              responseData,
            )
            return {
              status: 'failed',
              errorMessage: responseData.description || `API Error: ${response.status}`,
              provider: 'yoomoney',
              rawResponse: responseData,
            }
          }

          this.payload.logger.info(
            `YooMoney payment created successfully for order ${orderId}: PaymentID ${responseData.id}, Status ${responseData.status}`,
          )
          // Return confirmation URL if available
          const confirmationUrl = responseData.confirmation?.confirmation_url

          return {
            status: responseData.status === 'succeeded' ? 'succeeded' : 'pending', // Map YooMoney status
            paymentId: responseData.id,
            provider: 'yoomoney',
            rawResponse: { ...responseData, confirmationUrl }, // Include confirmationUrl in rawResponse
          }
        } catch (apiError: any) {
          this.payload.logger.error(
            `YooMoney processPayment API request failed for order ${orderId}:`,
            apiError,
          )
          return {
            status: 'failed',
            errorMessage: apiError.message || 'API request failed',
            provider: 'yoomoney',
            rawResponse: apiError,
          }
        }
      },
      chargeWithToken: async (
        token: string, // This is payment_method_id from YooMoney
        amount: number,
        currency: string,
        description: string,
        orderId: string,
      ): Promise<{
        success: boolean
        transactionId?: string
        error?: string
        rawResponse?: any
      }> => {
        const yoomoneyConfig = this.settings?.providersConfig?.yoomoney
        if (!yoomoneyConfig?.shopId || !yoomoneyConfig?.secretKey) {
          this.payload.logger.error(
            'YooMoney configuration (shopId/secretKey) is missing for chargeWithToken.',
          )
          return { success: false, error: 'YooMoney configuration missing.' }
        }

        const idempotenceKey = uuidv4()
        const YOOMONEY_API_PAYMENTS_ENDPOINT = 'https://api.yookassa.ru/v3/payments'
        const headers = {
          Authorization: `Basic ${Buffer.from(`${yoomoneyConfig.shopId}:${yoomoneyConfig.secretKey}`).toString('base64')}`,
          'Idempotence-Key': idempotenceKey,
          'Content-Type': 'application/json',
        }

        const body = {
          amount: {
            value: amount.toFixed(2),
            currency: currency,
          },
          payment_method_id: token,
          description: description,
          metadata: {
            order_id: orderId,
          },
          capture: true,
        }

        try {
          this.payload.logger.info(
            `Charging YooMoney token ${token} for order ${orderId}, amount: ${amount} ${currency}. Idempotence-Key: ${idempotenceKey}`,
          )
          const response = await fetch(YOOMONEY_API_PAYMENTS_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          })
          const responseData = await response.json()

          if (!response.ok || responseData.status !== 'succeeded') {
            this.payload.logger.error(
              `YooMoney API error charging token for order ${orderId}: ${response.status}`,
              responseData,
            )
            return {
              success: false,
              error: responseData.description || `API Error: ${response.status}`,
              rawResponse: responseData,
            }
          }

          this.payload.logger.info(
            `YooMoney token charge successful for order ${orderId}: PaymentID ${responseData.id}`,
          )
          return {
            success: true,
            transactionId: responseData.id,
            rawResponse: responseData,
          }
        } catch (apiError: any) {
          this.payload.logger.error(
            `YooMoney chargeWithToken API request failed for order ${orderId}:`,
            apiError,
          )
          return {
            success: false,
            error: apiError.message || 'API request failed',
            rawResponse: apiError,
          }
        }
      },
      refundPayment: async (params: RefundParams): Promise<PaymentResult> => {
        const yoomoneyConfig = this.settings?.providersConfig?.yoomoney
        if (!yoomoneyConfig?.shopId || !yoomoneyConfig?.secretKey) {
          this.payload.logger.error(
            'YooMoney configuration (shopId/secretKey) is missing for refundPayment.',
          )
          return {
            status: 'failed',
            errorMessage: 'YooMoney configuration missing.',
            provider: 'yoomoney',
          }
        }

        const idempotenceKey = uuidv4()
        const YOOMONEY_API_REFUND_ENDPOINT = 'https://api.yookassa.ru/v3/refunds'
        const headers = {
          Authorization: `Basic ${Buffer.from(`${yoomoneyConfig.shopId}:${yoomoneyConfig.secretKey}`).toString('base64')}`,
          'Idempotence-Key': idempotenceKey,
          'Content-Type': 'application/json',
        }

        const body = {
          payment_id: params.originalTransactionId,
          amount: {
            value: params.amount.toFixed(2),
            currency: params.currency,
          },
          description: params.reason || `Refund for order ${params.orderId}`,
          metadata: {
            order_id: params.orderId,
          },
        }

        try {
          this.payload.logger.info(
            `Refunding YooMoney payment ${params.originalTransactionId} for order ${params.orderId}, amount: ${params.amount} ${params.currency}. Idempotence-Key: ${idempotenceKey}`,
          )
          const response = await fetch(YOOMONEY_API_REFUND_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          })
          const responseData = await response.json()

          if (!response.ok || responseData.status !== 'succeeded') {
            this.payload.logger.error(
              `YooMoney API error refunding payment for order ${params.orderId}: ${response.status}`,
              responseData,
            )
            return {
              status: 'failed',
              errorMessage: responseData.description || `API Error: ${response.status}`,
              provider: 'yoomoney',
              rawResponse: responseData,
            }
          }

          this.payload.logger.info(
            `YooMoney refund successful for order ${params.orderId}: RefundID ${responseData.id}`,
          )
          return {
            status: 'refunded',
            paymentId: responseData.id, // This is the refund_id
            provider: 'yoomoney',
            rawResponse: responseData,
          }
        } catch (apiError: any) {
          this.payload.logger.error(
            `YooMoney refundPayment API request failed for order ${params.orderId}:`,
            apiError,
          )
          return {
            status: 'failed',
            errorMessage: apiError.message || 'API request failed',
            provider: 'yoomoney',
            rawResponse: apiError,
          }
        }
      },
      voidPayment: async (params: VoidParams): Promise<PaymentResult> => {
        const yoomoneyConfig = this.settings?.providersConfig?.yoomoney
        if (!yoomoneyConfig?.shopId || !yoomoneyConfig?.secretKey) {
          this.payload.logger.error(
            'YooMoney configuration (shopId/secretKey) is missing for voidPayment.',
          )
          return {
            status: 'failed',
            errorMessage: 'YooMoney configuration missing.',
            provider: 'yoomoney',
          }
        }

        const idempotenceKey = uuidv4()
        const YOOMONEY_API_CANCEL_ENDPOINT = `https://api.yookassa.ru/v3/payments/${params.originalTransactionId}/cancel`
        const headers = {
          Authorization: `Basic ${Buffer.from(`${yoomoneyConfig.shopId}:${yoomoneyConfig.secretKey}`).toString('base64')}`,
          'Idempotence-Key': idempotenceKey,
          'Content-Type': 'application/json',
        }

        try {
          this.payload.logger.info(
            `Voiding/Cancelling YooMoney payment ${params.originalTransactionId} for order ${params.orderId}. Idempotence-Key: ${idempotenceKey}`,
          )
          // YooMoney cancel API might not require a body, or a minimal one.
          const response = await fetch(YOOMONEY_API_CANCEL_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify({}), // Empty body or specific if required by YooMoney for cancel
          })
          const responseData = await response.json()

          // YooMoney cancellation returns the payment object with status 'canceled'
          if (!response.ok || responseData.status !== 'canceled') {
            this.payload.logger.error(
              `YooMoney API error voiding payment for order ${params.orderId}: ${response.status}`,
              responseData,
            )
            return {
              status: 'failed',
              errorMessage: responseData.description || `API Error: ${response.status}`,
              provider: 'yoomoney',
              rawResponse: responseData,
            }
          }

          this.payload.logger.info(
            `YooMoney void/cancel successful for order ${params.orderId}: PaymentID ${responseData.id} now Canceled`,
          )
          return {
            status: 'voided', // Our internal status
            paymentId: responseData.id, // Original payment_id
            provider: 'yoomoney',
            rawResponse: responseData,
          }
        } catch (apiError: any) {
          this.payload.logger.error(
            `YooMoney voidPayment API request failed for order ${params.orderId}:`,
            apiError,
          )
          return {
            status: 'failed',
            errorMessage: apiError.message || 'API request failed',
            provider: 'yoomoney',
            rawResponse: apiError,
          }
        }
      },
    }

    const robokassaProvider: IPaymentProvider = {
      processPayment: async (
        params: Omit<ProcessPaymentParams, 'provider'>,
      ): Promise<PaymentResult> => {
        const robokassaConfig = this.settings?.providersConfig?.robokassa
        if (
          !robokassaConfig?.merchantLogin ||
          !robokassaConfig?.password1 // Password1 for payment link generation
        ) {
          this.payload.logger.error(
            'Robokassa configuration (merchantLogin/password1) is missing for processPayment.',
          )
          return {
            status: 'failed',
            errorMessage: 'Robokassa configuration missing.',
            provider: 'robokassa',
          }
        }

        const orderId = params.metadata?.orderId || `order_${Date.now()}`
        const description = params.metadata?.description || `Payment for order ${orderId}`
        const amount = params.amount

        const paymentUrl = this.generateRobokassaPaymentLink(orderId, amount, description)

        this.payload.logger.info(
          `Robokassa payment link generated for order ${orderId}: ${paymentUrl}`,
        )

        return {
          status: 'pending',
          paymentId: orderId,
          provider: 'robokassa',
          rawResponse: {
            confirmationUrl: paymentUrl,
            message: 'Redirect user to Robokassa to complete payment.',
          },
        }
      },
      chargeWithToken: async (
        initialInvoiceId: string, // Renamed token to initialInvoiceId for clarity
        amount: number,
        currency: string, // Currency might not be needed for Robokassa recurring, but kept for interface consistency
        description: string, // Description might not be needed for Robokassa recurring
        orderId: string, // This is the NEW order ID for the current renewal attempt
      ): Promise<{
        success: boolean
        transactionId?: string
        error?: string
        rawResponse?: any
      }> => {
        const robokassaConfig = this.settings?.providersConfig?.robokassa
        if (
          !robokassaConfig?.merchantLogin ||
          !robokassaConfig?.password2 // Password2 is needed for recurring API calls
        ) {
          this.payload.logger.error(
            'Robokassa configuration (merchantLogin/password2) is missing for chargeWithToken (recurring).',
          )
          return { success: false, error: 'Robokassa configuration missing.' }
        }

        const merchantLogin = robokassaConfig.merchantLogin
        const password2 = robokassaConfig.password2
        const isTestMode = robokassaConfig.testMode === true

        // Robokassa Recurring Payment API Endpoint (Confirm this endpoint from official docs)
        // This might be the same endpoint as initial payment but with different parameters,
        // or a dedicated recurring/subscription endpoint. Assuming a common endpoint for now.
        const RECURRING_API_URL = isTestMode
          ? 'https://test.robokassa.ru/Merchant/Recurring' // Example Test URL - VERIFY
          : 'https://auth.robokassa.ru/Merchant/Recurring' // Example Prod URL - VERIFY

        // Parameters for recurring payment (These might vary based on Robokassa's specific API)
        // - MerchantLogin
        // - PreviousInvoiceID (or similar identifier from the initial payment)
        // - InvoiceID (The NEW ID for this specific recurring charge attempt - using orderId)
        // - OutSum (Amount for this charge)
        // - SignatureValue (Calculated using Password2)
        // - Potentially other parameters like Receipt, Description etc.

        const newInvoiceId = orderId // Use the new order ID for this specific charge attempt
        const signatureString = `${merchantLogin}:${amount}:${newInvoiceId}:${password2}` // Signature based on NEW InvoiceID and amount
        const signatureValue = crypto
          .createHash('md5')
          .update(signatureString)
          .digest('hex')
          .toUpperCase()

        const params = new URLSearchParams({
          MerchantLogin: merchantLogin,
          PreviousInvoiceID: initialInvoiceId, // Link to the initial payment
          InvoiceID: newInvoiceId, // ID for this specific charge
          OutSum: amount.toFixed(2),
          SignatureValue: signatureValue,
          // Description: description, // Optional, might not be used in recurring
          // Receipt: JSON.stringify({...}), // Optional: If receipt details are needed
          IsTest: isTestMode ? '1' : '0',
        })

        const requestUrl = `${RECURRING_API_URL}?${params.toString()}`

        try {
          this.payload.logger.info(
            `Attempting Robokassa recurring charge for new order ${newInvoiceId} (linked to initial ${initialInvoiceId}), amount: ${amount}. URL: ${requestUrl}`,
          )
          // IMPORTANT: Robokassa recurring might be a POST request or require specific headers. Adjust fetch call accordingly.
          // Assuming GET for simplicity based on some Robokassa API patterns, but VERIFY THIS.
          const response = await fetch(requestUrl, { method: 'GET' }) // VERIFY METHOD (GET/POST)

          // Robokassa API response format for recurring needs verification.
          // It might return XML or JSON. Assuming JSON for now.
          // Success might be indicated by ResultCode=0 or a specific success message.
          const responseText = await response.text() // Read as text first to handle potential non-JSON
          let responseData: any = {}
          try {
            responseData = JSON.parse(responseText) // Try parsing as JSON
          } catch (e) {
            // If not JSON, maybe XML or plain text success/error code?
            this.payload.logger.warn(
              `Robokassa recurring response for ${newInvoiceId} was not valid JSON: ${responseText}`,
            )
            // Attempt to parse common success indicators if not JSON
            if (
              responseText.includes('OK') ||
              responseText.includes('Success') ||
              responseText.match(/^0$/)
            ) {
              // Example checks
              responseData = { ResultCode: 0, RawText: responseText } // Simulate success structure
            } else {
              responseData = {
                ResultCode: -1,
                Description: 'Failed to parse response or unknown format.',
                RawText: responseText,
              } // Simulate failure
            }
          }

          // Check for success based on Robokassa's recurring API response structure
          // (e.g., ResultCode === 0 or specific success status) - VERIFY THIS
          if (!response.ok || responseData.ResultCode !== 0) {
            const errorMessage =
              responseData.Description || `Robokassa Recurring API Error: ${response.status}`
            this.payload.logger.error(
              `Robokassa recurring charge failed for new order ${newInvoiceId}: ${errorMessage}`,
              responseData,
            )
            return {
              success: false,
              error: errorMessage,
              rawResponse: responseData,
            }
          }

          this.payload.logger.info(
            `Robokassa recurring charge successful for new order ${newInvoiceId}. Transaction ID (InvoiceID): ${newInvoiceId}`,
          )
          return {
            success: true,
            transactionId: newInvoiceId, // The new InvoiceID acts as the transaction ID for this charge
            rawResponse: responseData,
          }
        } catch (apiError: any) {
          this.payload.logger.error(
            `Robokassa chargeWithToken API request failed for new order ${newInvoiceId}:`,
            apiError,
          )
          return {
            success: false,
            error: apiError.message || 'API request failed',
            rawResponse: apiError,
          }
        }
      },
      refundPayment: async (params: RefundParams): Promise<PaymentResult> => {
        this.payload.logger.warn(
          `Robokassa.refundPayment called for order ${params.orderId}. Robokassa refunds often require manual processing via their merchant panel or a separate, specific API for refunds if available. Direct refund via this generic method is not implemented.`,
        )
        return {
          status: 'failed',
          errorMessage:
            'Automated refunds for Robokassa are not implemented. Please process manually or integrate specific Robokassa refund API.',
          provider: 'robokassa',
          rawResponse: { message: 'Robokassa refund not implemented in this provider.' },
        }
      },
      voidPayment: async (params: VoidParams): Promise<PaymentResult> => {
        this.payload.logger.warn(
          `Robokassa.voidPayment called for order ${params.orderId}. Robokassa may not support direct voids for uncaptured payments in the same way as other gateways, as payments are typically captured immediately or handled by their system. Cancellation might be the closer equivalent if payment is not yet final.`,
        )
        return {
          status: 'failed',
          errorMessage:
            'Automated void/cancellation for Robokassa are not implemented. Please process manually or integrate specific Robokassa API.',
          provider: 'robokassa',
          rawResponse: { message: 'Robokassa void not implemented in this provider.' },
        }
      },
    }

    const cryptoProvider: IPaymentProvider = {
      ...defaultProvider, // Start with default stubs
      // TODO: Implement Crypto specific refund/void. This is highly dependent on the crypto payment gateway used.
      // Refunds in crypto can be complex (sending crypto back). Voids might not be applicable post-confirmation.
      refundPayment: async (params: RefundParams): Promise<PaymentResult> => {
        this.payload.logger.warn(
          `STUB: CryptoProvider.refundPayment called for order ${params.orderId}. Crypto refunds are complex and gateway-specific.`,
        )
        return defaultProvider.refundPayment(params) // Fallback to default stub
      },
      voidPayment: async (params: VoidParams): Promise<PaymentResult> => {
        this.payload.logger.warn(
          `STUB: CryptoProvider.voidPayment called for order ${params.orderId}. Voids may not be applicable for most crypto transactions post-confirmation.`,
        )
        return defaultProvider.voidPayment(params) // Fallback to default stub
      },
    }

    // A generic provider for future use or as a more explicit default
    const genericGatewayProvider: IPaymentProvider = { ...defaultProvider }

    const providers: Record<PaymentProviderKey, IPaymentProvider> = {
      yoomoney: yoomoneyProvider,
      robokassa: robokassaProvider,
      crypto: cryptoProvider, // Use the more specific cryptoProvider
      genericGateway: genericGatewayProvider, // Added genericGateway
    }

    return providers[provider] || genericGatewayProvider // Fallback to genericGatewayProvider
  }
}
