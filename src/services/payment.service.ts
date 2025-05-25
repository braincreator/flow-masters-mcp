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
import { EnrollmentService } from './courses/enrollmentService'
import type { Course, Order, Product, Service, Subscription, User } from '@/payload-types'
import { Locale as AppLocale } from '@/constants'
import { add } from 'date-fns'
import type { Duration } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

// Local definition for EmailOrderConfirmationArgs
interface LocalEmailOrderItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
  type: 'course' | 'product' | 'subscription' | 'other' // 'service' will be mapped to 'other'
  url?: string
  description?: string
}
interface LocalEmailOrderConfirmationArgs {
  userName: string
  email: string
  orderNumber: string
  orderDate: string
  items: LocalEmailOrderItem[]
  subtotal: number
  total: number
  currency: string
  paymentMethod: string
  paymentStatus: string
  locale: AppLocale
}

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
  metadata?: Record<string, any> & {
    items?: Array<{
      productId?: string
      serviceId?: string
      quantity: number
      itemType?: 'product' | 'service'
    }>
    customerEmail?: string
    description?: string
    returnUrl?: string
    savePaymentMethod?: boolean
    paymentMethodType?: PaymentMethod
  }
  returnUrl?: string
}

interface ProcessPaymentParams {
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  paymentToken: string
  metadata: Record<string, any> & {
    orderId: string
    items?: Array<{
      productId?: string
      serviceId?: string
      quantity: number
      itemType?: 'product' | 'service'
    }>
    description?: string
    returnUrl?: string
    savePaymentMethod?: boolean
    customerEmail?: string
    locale?: string
  }
}

export interface PaymentResult {
  status: 'succeeded' | 'failed' | 'pending' | 'refunded' | 'voided'
  paymentId?: string
  errorMessage?: string
  provider?: PaymentProviderKey
  rawResponse?: any
  confirmationUrl?: string
}

interface RefundParams {
  originalTransactionId: string
  amount: number
  currency: string
  reason?: string
  orderId: string
}

interface VoidParams {
  originalTransactionId: string
  reason?: string
  orderId: string
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
  private paymentProviders: Record<PaymentProviderKey, IPaymentProvider>

  private constructor(payload: Payload) {
    super(payload)
    this.paymentProviders = this.initializePaymentProviders()
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

  private async loadSettings(): Promise<void> {
    try {
      try {
        const paymentProvidersGlobal = await this.payload.findGlobal({
          slug: 'payment-providers',
        })

        if (paymentProvidersGlobal) {
          console.log('Retrieved payment-providers global')
          this.settings = this.transformPaymentProviders(paymentProvidersGlobal)
          this.settingsLoaded = true
          this.paymentProviders = this.initializePaymentProviders()
          return
        }
      } catch (error) {
        console.warn('Failed to retrieve payment-providers global:', error)
      }

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
      this.paymentProviders = this.initializePaymentProviders()
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
      this.paymentProviders = this.initializePaymentProviders()
    }
  }

  private async ensureSettingsLoaded(): Promise<void> {
    if (!this.settingsLoaded || !this.settings) {
      this.payload.logger.info(
        'Settings not loaded, attempting to load now in ensureSettingsLoaded...',
      )
      await this.loadSettings()
      if (!this.settingsLoaded || !this.settings) {
        throw new Error('Failed to load payment settings after explicit attempt.')
      }
    }
  }

  getSettings(): GlobalSettings {
    if (!this.settingsLoaded || !this.settings) {
      console.warn(
        'Settings not loaded yet, returning default settings. This should have been handled by ensureSettingsLoaded.',
      )
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

  private transformPaymentProviders(paymentProvidersGlobal: any): GlobalSettings {
    const providers: Array<{ id: PaymentProviderKey; name: string; enabled: boolean }> = []
    const providersConfig: Partial<Record<PaymentProviderKey, any>> = {}

    if (paymentProvidersGlobal.yoomoney?.yoomoney_enabled) {
      providers.push({
        id: 'yoomoney',
        name: paymentProvidersGlobal.yoomoney?.yoomoney_displayName?.en || 'YooMoney',
        enabled: true,
      })
      const yoomoneyConfig = paymentProvidersGlobal.yoomoney?.yoomoney_config || {}
      const isTestMode = yoomoneyConfig.testMode !== false
      const configSource = isTestMode ? yoomoneyConfig.test : yoomoneyConfig.production
      providersConfig.yoomoney = {
        shopId: configSource?.shop_id || process.env.YOOMONEY_SHOP_ID || 'your_shop_id',
        secretKey: configSource?.secret_key || process.env.YOOMONEY_SECRET_KEY || 'your_secret_key',
        testMode: isTestMode,
      }
    }

    if (paymentProvidersGlobal.robokassa?.robokassa_enabled) {
      providers.push({
        id: 'robokassa',
        name: paymentProvidersGlobal.robokassa?.robokassa_displayName?.en || 'Robokassa',
        enabled: true,
      })
      const robokassaConfig = paymentProvidersGlobal.robokassa?.robokassa_config || {}
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

    if (paymentProvidersGlobal.crypto?.crypto_enabled) {
      providers.push({
        id: 'crypto',
        name: paymentProvidersGlobal.crypto?.crypto_displayName?.en || 'Cryptocurrency',
        enabled: true,
      })
      const cryptoConfig = paymentProvidersGlobal.crypto?.crypto_config || {}
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

    const defaultProviderId =
      providers.find((p) => p.enabled)?.id ||
      (providers.length > 0 ? providers[0]!.id : 'robokassa')

    return {
      providers,
      providersConfig,
      defaultProvider: defaultProviderId as PaymentProviderKey,
    }
  }

  async getEnabledProviders(): Promise<
    Array<{ id: PaymentProviderKey; name: string; enabled: boolean }>
  > {
    await this.ensureSettingsLoaded()
    return this.settings!.providers.filter((p) => p.enabled)
  }

  async getDefaultProvider(): Promise<PaymentProviderKey> {
    await this.ensureSettingsLoaded()
    const defaultProvider = this.settings!.defaultProvider
    if (!defaultProvider) {
      throw new Error('Default payment provider not found')
    }
    return defaultProvider
  }

  async createPayment(
    providerKey: PaymentProviderKey,
    params: PaymentCreateParams,
  ): Promise<PaymentResult> {
    try {
      await this.ensureSettingsLoaded()

      // Проверяем доступность провайдера в настройках
      const settings = this.getSettings()
      const providerConfig = settings?.providersConfig?.[providerKey]

      // Проверяем наличие конфигурации для Robokassa
      if (providerKey === 'robokassa') {
        if (!providerConfig || !providerConfig.merchantLogin || !providerConfig.password1) {
          this.payload.logger.error(
            `Robokassa configuration is incomplete: ${JSON.stringify(providerConfig || {})}`,
          )
          return {
            status: 'failed',
            errorMessage: 'Robokassa configuration is incomplete. Please check payment settings.',
            provider: providerKey,
            rawResponse: {
              error: 'configuration_incomplete',
              details: 'Missing required credentials in Robokassa configuration',
              missing: providerConfig
                ? Object.entries({
                    merchantLogin: !providerConfig.merchantLogin,
                    password1: !providerConfig.password1,
                  })
                    .filter(([k, v]) => v)
                    .map(([k]) => k)
                : ['all configuration'],
            },
          }
        }
      }

      const paymentProviderInstance = this.paymentProviders[providerKey]
      if (!paymentProviderInstance) {
        throw new Error(`Payment provider ${providerKey} not found or not initialized.`)
      }

      // Получаем локаль из параметров или из заказа
      let targetLocale = params.locale || 'en'

      // Если orderId указан, пробуем получить локаль из заказа
      if (params.orderId && !params.locale) {
        try {
          const order = await this.payload.findByID({
            collection: 'orders',
            id: params.orderId,
          })

          if (order && order.paymentData && typeof order.paymentData === 'object') {
            const paymentData = order.paymentData as Record<string, any>
            if (paymentData.customerLocale) {
              targetLocale = paymentData.customerLocale
              this.payload.logger.info(`Using locale ${targetLocale} from order ${params.orderId}`)
            }
          }
        } catch (orderError) {
          this.payload.logger.error(
            `Error fetching order ${params.orderId} for locale: ${orderError}`,
          )
        }
      }

      // Use the original amount without conversion
      const convertedAmount = params.amount

      const metadataForProvider: ProcessPaymentParams['metadata'] = {
        orderId: params.orderId,
        items: params.metadata?.items || [],
        description: params.description,
        returnUrl: params.returnUrl,
        savePaymentMethod: params.metadata?.savePaymentMethod,
        customerEmail: params.customer.email,
        locale: targetLocale,
        ...(params.metadata || {}),
        originalAmount: params.amount, // Сохраняем оригинальную цену для аудита
        conversionRate: convertedAmount / params.amount, // Сохраняем коэффициент конвертации
      }

      this.payload.logger.info(
        `Processing payment with converted price: original=${params.amount}, converted=${convertedAmount}, locale=${targetLocale}`,
      )

      const result = await paymentProviderInstance.processPayment({
        amount: convertedAmount, // Используем конвертированную цену
        currency: params.currency,
        paymentMethod: (params.metadata?.paymentMethodType || 'bank_card') as PaymentMethod,
        paymentToken: '',
        metadata: metadataForProvider,
      })

      return {
        status: result.status,
        paymentId: result.paymentId,
        errorMessage: result.errorMessage,
        confirmationUrl: result.confirmationUrl,
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      return {
        status: 'failed',
        paymentId: '',
        errorMessage:
          error instanceof Error ? error.message : 'Unknown error during payment creation',
      }
    }
  }

  async processPayment(
    paymentToken: string,
    amount: number,
    currency: string,
    orderId: string,
    paymentProviderId: PaymentProviderKey,
    locale: string = 'en', // Добавляем параметр локали
  ): Promise<PaymentResult> {
    try {
      await this.ensureSettingsLoaded()
      const providerService = this.paymentProviders[paymentProviderId]
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

      // Получаем локаль из параметров или из заказа
      let targetLocale = locale

      // Если локаль не указана и orderId указан, пробуем получить локаль из заказа
      if (orderId && locale === 'en') {
        try {
          const order = await this.payload.findByID({
            collection: 'orders',
            id: orderId,
          })

          if (order && order.paymentData && typeof order.paymentData === 'object') {
            const paymentData = order.paymentData as Record<string, any>
            if (paymentData.customerLocale) {
              targetLocale = paymentData.customerLocale
              this.payload.logger.info(
                `Using locale ${targetLocale} from order ${orderId} for token payment`,
              )
            }
          }
        } catch (orderError) {
          this.payload.logger.error(
            `Error fetching order ${orderId} for locale in token payment: ${orderError}`,
          )
        }
      }

      // Use the original amount without conversion
      const convertedAmount = amount

      const description = `Subscription payment for order ${orderId}`
      const chargeResponse = await providerService.chargeWithToken(
        paymentToken,
        convertedAmount, // Используем конвертированную цену
        currency,
        description,
        orderId,
      )

      if (chargeResponse.success) {
        return {
          status: 'succeeded',
          paymentId: chargeResponse.transactionId,
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

  async checkPaymentStatus(
    provider: PaymentProviderKey,
    paymentId: string,
  ): Promise<{
    status: string
    details?: any
  }> {
    try {
      await this.ensureSettingsLoaded()
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
      console.error(`Error checking payment status with ${provider}:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { status: 'error', details: { error: errorMessage } }
    }
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
        case 'waiting_for_capture':
          mappedStatus = PaymentStatus.PENDING
          break
        case 'canceled':
          mappedStatus = PaymentStatus.CANCELLED
          break
        default:
          mappedStatus = PaymentStatus.PENDING
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
    orderId: string,
  ): Promise<{ status: PaymentStatus; details?: any }> {
    const robokassaConfig = this.settings?.providersConfig?.robokassa
    if (!robokassaConfig?.merchantLogin || !robokassaConfig?.password2) {
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

    const opStateUrl = isTestMode
      ? 'https://test.robokassa.ru/WebAPI/api/OpState'
      : 'https://auth.robokassa.ru/WebAPI/api/OpState'

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
        case 100:
          mappedStatus = PaymentStatus.COMPLETED
          break
        case 5:
        case 10:
        case 50:
        case 60:
        case 80:
          mappedStatus = PaymentStatus.PENDING
          break
        case 0:
        case 1000:
          mappedStatus = PaymentStatus.CANCELLED
          break
        default:
          this.payload.logger.warn(`Unknown Robokassa StateCode ${stateCode} for InvId ${orderId}`)
          mappedStatus = PaymentStatus.PENDING
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
    return { status: 'unknown' }
  }

  private detectProviderFromWebhook(webhookData: any): PaymentProviderKey | null {
    if (webhookData.notification_type && webhookData.operation_id) {
      return 'yoomoney'
    }
    if (webhookData.InvId && webhookData.OutSum && webhookData.SignatureValue) {
      return 'robokassa'
    }
    console.warn('Could not detect payment provider from webhook data:', webhookData)
    return null
  }

  private async isValidAndVerifyYooMoneySignature(req: any): Promise<boolean> {
    const notificationBody = req.rawBody
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

    await this.ensureSettingsLoaded()
    const providerConfig = this.settings?.providersConfig?.yoomoney
    const secretKey = providerConfig?.secretKey

    if (!secretKey) {
      console.error(
        'YooMoney Webhook Error: Secret key is not configured in Payment Provider settings.',
      )
      return false
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha1', secretKey)
        .update(notificationBody)
        .digest('hex')

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

  private verifyRobokassaWebhook(webhookData: any): boolean {
    if (!webhookData || !webhookData.InvId || !webhookData.OutSum || !webhookData.SignatureValue) {
      console.error('Invalid Robokassa notification format')
      return false
    }

    const { InvId, OutSum, SignatureValue } = webhookData

    const settings = this.getSettings()
    const providersConfig = settings?.providersConfig || {}
    const config = providersConfig.robokassa

    if (!config?.password2) {
      console.error('Robokassa password2 is not configured in Payment Provider settings.')
      return false
    }

    const signatureString = `${OutSum}:${InvId}:${config.password2}`
    const expectedSignature = crypto
      .createHash('md5')
      .update(signatureString)
      .digest('hex')
      .toUpperCase()

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

  async verifyWebhook(req: any): Promise<boolean> {
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
        return await this.isValidAndVerifyYooMoneySignature(req)
      case 'robokassa':
        return this.verifyRobokassaWebhook(req.body)
      default:
        console.warn(`Webhook Verification: Provider ${provider} not supported for verification.`)
        return false
    }
  }

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
          this.payload.logger.info(
            '[processWebhookData] Processing crypto webhook (stub)',
            webhookData,
          )
          return {
            orderId:
              webhookData.order_id || webhookData.metadata?.order_id || 'unknown_crypto_order',
            status: PaymentStatus.COMPLETED,
            transactionId: webhookData.transaction_id || webhookData.id || undefined,
          }
        default:
          throw new Error(`Обработка вебхука для провайдера ${provider} не реализована`)
      }
    } catch (error: any) {
      const detectedProviderForLog = this.detectProviderFromWebhook(webhookData)
      this.payload.logger.error(
        `[processWebhookData] Error processing webhook data: ${error?.message || 'Unknown error'}`,
        {
          providerAttempted: detectedProviderForLog || 'unknown_or_failed_detection',
          method: 'processWebhookData',
          webhookReceived: true,
          webhookKeys: webhookData ? Object.keys(webhookData) : [],
          errorDetails: {
            message: error?.message,
            name: error?.name,
            stack: error?.stack,
          },
          rawErrorObject: error,
        },
      )
      throw error
    }
  }

  private processYooMoneyWebhook(webhookData: any): {
    orderId: string
    status: string
    transactionId?: string
  } {
    const orderId = webhookData.label || 'unknown'
    const isProtected = webhookData.codepro === 'true' || webhookData.codepro === true
    let status = 'processing'
    if (webhookData.unaccepted === 'true' || webhookData.unaccepted === true) {
      status = 'waiting'
    } else if (isProtected) {
      status = 'hold'
    } else {
      status = PaymentStatus.COMPLETED
    }

    return {
      orderId,
      status,
      transactionId: webhookData.operation_id,
    }
  }

  private processRobokassaWebhook(webhookData: any): {
    orderId: string
    status: PaymentStatus
    transactionId?: string
  } {
    const orderId = webhookData.InvId
    if (!orderId) {
      console.error('Robokassa Webhook Error: Missing orderId (InvId)')
      throw new Error('Missing orderId in Robokassa webhook data')
    }
    const status = PaymentStatus.COMPLETED
    return {
      orderId: String(orderId),
      status,
      transactionId: String(orderId),
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
    console.log(
      `Attempting to extract payment token for provider: ${provider} from data:`,
      JSON.stringify(paymentData, null, 2),
    )

    let potentialToken: string | undefined | null = null

    potentialToken =
      paymentData?.recurring_token ||
      paymentData?.payment_method_id ||
      paymentData?.token ||
      paymentData?.id

    if (paymentData?.payment_method_details?.card?.token) {
      potentialToken = paymentData.payment_method_details.card.token
    } else if (paymentData?.card?.token) {
      potentialToken = paymentData.card.token
    }

    switch (provider) {
      case 'yoomoney':
        console.log(
          'YooMoney: Check paymentData for a recurring token if applicable for their API (e.g., saved payment method ID).',
        )
        if (paymentData?.payment_method_data?.id) {
          potentialToken = paymentData.payment_method_data.id
        }
        break
      case 'robokassa':
        console.log(
          'Robokassa: Check if InvId (initial order ID) is available in paymentData to be used as a token for recurring.',
        )
        if (paymentData?.InvId) {
          potentialToken = String(paymentData.InvId)
        }
        break
      case 'crypto':
        console.log('Crypto: Unlikely to have standard payment tokens for recurring billing.')
        break
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
      paymentData: any
    },
  ) {
    if (!this.payload) {
      throw new Error('Payload client not initialized')
    }

    try {
      let order = (await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 1,
      })) as Order

      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }

      await this.payload.update({
        collection: 'orders',
        id: orderId,
        data: {
          status: update.status as Order['status'],
          paymentId: update.paymentId,
          paymentProvider: update.paymentProvider,
          paymentData: update.paymentData,
          ...(update.status === PaymentStatus.COMPLETED && { paidAt: new Date().toISOString() }),
        },
      })

      order = (await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 3,
      })) as Order
      if (!order) {
        throw new Error(`Order ${orderId} not found after update`)
      }

      if (update.status === PaymentStatus.COMPLETED) {
        try {
          const serviceRegistry = ServiceRegistry.getInstance(this.payload)
          const notificationService = serviceRegistry.getNotificationService()
          const emailService = serviceRegistry.getEmailService()
          const enrollmentService = serviceRegistry.getEnrollmentService()

          const orderWithItems = order

          const customerField = orderWithItems.customer
          const customerIsObject =
            typeof customerField === 'object' && customerField !== null && 'id' in customerField
          const customerName = customerIsObject ? (customerField as User).name : 'Customer'
          const customerEmail = customerIsObject
            ? (customerField as User).email
            : String(customerField || '')
          const customerLocale = customerIsObject ? (customerField as User).locale || 'ru' : 'ru'

          const items: LocalEmailOrderItem[] = (orderWithItems.items || []).map(
            (orderItem: any): LocalEmailOrderItem => {
              const product =
                typeof orderItem.product === 'object' ? (orderItem.product as Product) : null
              const service =
                typeof orderItem.service === 'object' ? (orderItem.service as Service) : null

              let name = 'Item'
              let type: LocalEmailOrderItem['type'] = 'other'
              let entityId = ''
              // Infer itemType if not present on orderItem, or use it if present
              const itemType =
                orderItem.itemType || (product ? 'product' : service ? 'service' : 'other')

              if (itemType === 'product' && product) {
                name = product.title || 'Product'
                type = product.isCourse ? 'course' : 'product'
                entityId = product.id
              } else if (itemType === 'service' && service) {
                name = service.title || 'Service'
                type = 'other' // Map 'service' to 'other' for email items
                entityId = service.id
              }

              return {
                id: entityId,
                name: name,
                quantity: orderItem.quantity || 1,
                price: orderItem.price || 0,
                total: (orderItem.price || 0) * (orderItem.quantity || 1),
                type: type,
              }
            },
          )

          try {
            const displayTotal =
              (orderWithItems.total as any)?.en?.amount ??
              (orderWithItems.total as any)?.ru?.amount ??
              0
            const displayCurrency =
              (orderWithItems.total as any)?.en?.currency ??
              (orderWithItems.total as any)?.ru?.currency ??
              'USD'
            const displaySubtotal = items.reduce(
              (sum: number, currentItem: LocalEmailOrderItem) =>
                sum + currentItem.price * currentItem.quantity,
              0,
            )

            await emailService.sendOrderConfirmationEmail({
              userName: customerName,
              email: customerEmail,
              orderNumber: orderWithItems.orderNumber || orderId,
              orderDate:
                orderWithItems.paidAt || orderWithItems.createdAt || new Date().toISOString(),
              items: items,
              subtotal: displaySubtotal,
              total: displayTotal,
              currency: displayCurrency,
              paymentMethod: update.paymentProvider,
              paymentStatus: 'paid',
              locale: customerLocale as AppLocale,
            })
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError)
          }

          const displayTotalNotif =
            (orderWithItems.total as any)?.en?.amount ??
            (orderWithItems.total as any)?.ru?.amount ??
            0
          const displayCurrencyNotif =
            (orderWithItems.total as any)?.en?.currency ??
            (orderWithItems.total as any)?.ru?.currency ??
            'USD'

          await notificationService.sendPaymentConfirmation({
            orderId,
            orderNumber: orderWithItems.orderNumber || orderId,
            customerEmail: customerEmail,
            total: displayTotalNotif,
            currency: displayCurrencyNotif,
            items: items.map((notifItem: LocalEmailOrderItem) => ({
              product: notifItem.id,
              name: notifItem.name,
              quantity: notifItem.quantity,
              price: notifItem.price,
              type: notifItem.type as any,
            })),
            paymentMethod: update.paymentProvider,
            paymentId: update.paymentId,
          })

          if (enrollmentService && orderWithItems.items && Array.isArray(orderWithItems.items)) {
            const userId =
              typeof customerField === 'object' && customerField !== null
                ? (customerField as User).id
                : typeof customerField === 'string'
                  ? customerField
                  : null

            if (!userId) {
              console.error(`Cannot enroll in course: User ID not found for order ${orderId}.`)
            } else {
              for (const orderItem of orderWithItems.items) {
                const mappedItem = items.find(
                  (i) =>
                    i.id ===
                      (typeof orderItem.product === 'string'
                        ? orderItem.product
                        : (orderItem.product as Product)?.id) ||
                    i.id ===
                      (typeof orderItem.service === 'string'
                        ? orderItem.service
                        : (orderItem.service as Service)?.id),
                )

                if (mappedItem?.type === 'course') {
                  const product =
                    typeof orderItem.product === 'object' ? (orderItem.product as Product) : null
                  if (product && product.isCourse && product.course) {
                    const courseRef = product.course
                    const courseId =
                      typeof courseRef === 'object' && courseRef !== null
                        ? (courseRef as Course).id
                        : typeof courseRef === 'string'
                          ? courseRef
                          : null

                    if (courseId) {
                      try {
                        const courseDetails = (await this.payload.findByID({
                          collection: 'courses',
                          id: courseId,
                          depth: 0,
                        })) as Course

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
          }
        } catch (notifError) {
          console.error('Failed to send payment notification or enroll user:', notifError)
        }

        if (order.orderType === 'subscription' && !order.subscriptionProcessedToken) {
          console.log(`Processing token for initial subscription payment for order ${order.id}`)
          const paymentToken = this.extractPaymentTokenFromProviderData(
            update.paymentData,
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
                },
                limit: 1,
                depth: 0,
              })

              if (subscriptionsResult.docs.length > 0) {
                const subscription = subscriptionsResult.docs[0] as Subscription
                if (subscription.status === 'pending' || !subscription.paymentId) {
                  await this.payload.update({
                    collection: 'subscriptions',
                    id: subscription.id,
                    data: {
                      paymentId: paymentToken,
                      paymentMethod: order.paymentProvider as Subscription['paymentMethod'],
                      status: 'active',
                    },
                  })
                  console.log(
                    `Stored payment token and set status to 'active' for subscription ${subscription.id} (order ${order.id})`,
                  )

                  await this.payload.update({
                    collection: 'orders',
                    id: order.id,
                    data: {
                      subscriptionProcessedToken: true,
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
      }

      return true
    } catch (error) {
      console.error(`Failed to update order ${orderId} status:`, error)
      return false
    }
  }

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

  generateRobokassaPaymentLink(orderId: string, amount: number, description: string): string {
    // Валидация входных параметров
    if (!orderId) {
      throw new Error('Order ID is required for Robokassa payment link generation')
    }

    if (!amount || amount <= 0) {
      throw new Error(`Invalid amount for Robokassa payment link: ${amount}`)
    }

    if (!description || description.trim() === '') {
      this.payload.logger.warn('Empty description for Robokassa payment - using default')
      description = `Payment for order ${orderId}`
    }

    const settings = this.getSettings()
    const providersConfig = settings.providersConfig || {}
    const config = providersConfig.robokassa

    // Проверяем наличие конфигурации
    if (!config || !config.merchantLogin || !config.password1) {
      this.payload.logger.error('Robokassa configuration missing for payment link generation')

      // Пытаемся использовать переменные окружения как запасной вариант
      if (!process.env.ROBOKASSA_MERCHANT_LOGIN || !process.env.ROBOKASSA_PASSWORD1) {
        throw new Error('Robokassa credentials not found in settings or environment variables')
      }

      this.payload.logger.warn('Using Robokassa credentials from environment variables')
    }

    // Используем конфигурацию или значения из переменных окружения как запасной вариант
    const merchantLogin = config?.merchantLogin || process.env.ROBOKASSA_MERCHANT_LOGIN!
    const password1 = config?.password1 || process.env.ROBOKASSA_PASSWORD1!
    const testMode =
      config?.testMode !== undefined ? config.testMode : process.env.NODE_ENV !== 'production'
    const returnUrl =
      config?.returnUrl || `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/robokassa/callback`

    if (!merchantLogin || !password1) {
      throw new Error('Robokassa credentials are required for payment link generation')
    }

    const baseUrl = testMode
      ? 'https://test.robokassa.ru/Index.aspx'
      : 'https://auth.robokassa.ru/Merchant/Index.aspx'

    try {
      const signature = crypto
        .createHash('md5')
        .update(`${merchantLogin}:${amount}:${orderId}:${password1}`)
        .digest('hex')

      const params = new URLSearchParams({
        MerchantLogin: merchantLogin,
        OutSum: amount.toString(),
        InvId: orderId,
        Description: description,
        SignatureValue: signature,
        IsTest: testMode ? '1' : '0',
        SuccessURL: returnUrl,
      })

      const paymentUrl = `${baseUrl}?${params.toString()}`

      // Проверяем URL на валидность
      try {
        new URL(paymentUrl)
      } catch (urlError: any) {
        throw new Error(
          `Invalid payment URL generated: ${urlError?.message || 'URL validation failed'}`,
        )
      }

      return paymentUrl
    } catch (error: any) {
      this.payload.logger.error(
        `Error generating Robokassa payment link: ${error?.message || 'Unknown error'}`,
      )
      throw new Error(
        `Failed to generate Robokassa payment link: ${error?.message || 'Unknown error'}`,
      )
    }
  }

  async generatePaymentLink(
    orderId: string,
    amount: number,
    description: string,
    providerKey: PaymentProviderKey,
  ): Promise<string> {
    switch (providerKey) {
      case 'yoomoney':
        return this.generateYooMoneyPaymentLink(orderId, amount, description)
      case 'robokassa':
        return this.generateRobokassaPaymentLink(orderId, amount, description)
      case 'crypto':
        const cryptoErrorMsg = `[generatePaymentLink] Crypto payment links not implemented yet for order ${orderId}.`
        this.payload.logger.error(cryptoErrorMsg, {
          provider: 'crypto',
          method: 'generatePaymentLink',
          orderId,
        })
        throw new Error('Crypto payment links not implemented yet')
      default:
        const unsupportedErrorMsg = `[generatePaymentLink] Unsupported payment provider requested: ${providerKey} for order ${orderId}.`
        this.payload.logger.error(unsupportedErrorMsg, {
          provider: providerKey,
          method: 'generatePaymentLink',
          orderId,
        })
        throw new Error(`Unsupported payment provider: ${providerKey}`)
    }
  }

  public async refundPayment(
    orderId: string,
    currency: string,
    amountToRefund?: number,
    reason?: string,
  ): Promise<PaymentResult> {
    await this.ensureSettingsLoaded()
    this.payload.logger.info(
      `Attempting to refund payment for orderId: ${orderId}, currency: ${currency}, amount: ${amountToRefund}, reason: ${reason}`,
    )
    try {
      const order = (await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 1,
      })) as Order

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
      const paymentProvider = this.paymentProviders[providerKey]
      if (!paymentProvider || !paymentProvider.refundPayment) {
        this.payload.logger.error(
          `Refund functionality not implemented for provider: ${providerKey}`,
        )
        return { status: 'failed', errorMessage: `Refunds not supported by ${providerKey}.` }
      }

      const orderLocale = currency.toLowerCase() === 'rub' ? 'ru' : 'en'
      const orderTotalForCurrency = (order.total as any)?.[orderLocale]?.amount

      const finalAmountToRefund = amountToRefund ?? orderTotalForCurrency ?? 0

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
        currency: finalCurrency,
        reason: reason || `Refund for order ${orderId}`,
        orderId: orderId,
      })

      if (refundResult.status === 'succeeded' || refundResult.status === 'refunded') {
        this.payload.logger.info(
          `Refund successful for order ${orderId}, new transactionId: ${refundResult.paymentId}`,
        )
        await this.payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            status: 'refunded',
          },
        })

        try {
          const notificationService = ServiceRegistry.getInstance(
            this.payload,
          ).getNotificationService()
          await notificationService.sendRefundProcessedNotification(orderId, {
            amount: finalAmountToRefund,
            currency: finalCurrency,
            processedAt: new Date().toISOString(),
          })
          this.payload.logger.info(`Refund processed notification sent for order ${orderId}.`)
        } catch (notificationError: any) {
          this.payload.logger.error(
            `Failed to send refund processed notification for order ${orderId}: ${notificationError.message}`,
          )
        }
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

  public async voidPayment(orderId: string, reason?: string): Promise<PaymentResult> {
    await this.ensureSettingsLoaded()
    this.payload.logger.info(
      `Attempting to void payment for orderId: ${orderId}, reason: ${reason}`,
    )
    try {
      const order = (await this.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
      })) as Order

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
      const paymentProvider = this.paymentProviders[providerKey]

      if (!paymentProvider || !paymentProvider.voidPayment) {
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
        await this.payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            status: 'cancelled',
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

  private initializePaymentProviders(): Record<PaymentProviderKey, IPaymentProvider> {
    const defaultProviderImpl: IPaymentProvider = {
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
        return {
          status: 'refunded',
          paymentId: `stub_refund_${Date.now()}_${params.originalTransactionId}`,
          provider: 'genericGateway',
          rawResponse: { stubbed: true, ...params },
        }
      },
      voidPayment: async (params: VoidParams): Promise<PaymentResult> => {
        this.payload.logger.warn(
          `STUB: DefaultProvider.voidPayment called for order ${params.orderId}, originalTx: ${params.originalTransactionId}. Real API integration needed.`,
        )
        return {
          status: 'voided',
          paymentId: params.originalTransactionId,
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

        const orderId = params.metadata?.orderId || `order_${Date.now()}`
        let calculatedAmount = 0
        let paymentDescription = `Payment for order ${orderId}. Items: `
        const itemDetailsForProvider: any[] = []

        if (params.metadata?.items && Array.isArray(params.metadata.items)) {
          for (const item of params.metadata.items) {
            if (item.serviceId) {
              try {
                const service = (await this.payload.findByID({
                  collection: 'services',
                  id: item.serviceId,
                  depth: 0,
                })) as Service
                if (service && service.price) {
                  calculatedAmount += service.price * (item.quantity || 1)
                  const serviceName = service.title || 'Service'
                  paymentDescription += `${serviceName} (x${item.quantity || 1}), `
                  itemDetailsForProvider.push({
                    description: serviceName,
                    quantity: (item.quantity || 1).toString(),
                    amount: { value: service.price.toFixed(2), currency: params.currency },
                    vat_code: 1,
                  })
                }
              } catch (e) {
                this.payload.logger.error(`Error fetching service ${item.serviceId}: ${e}`)
              }
            } else if (item.productId) {
              try {
                const product = (await this.payload.findByID({
                  collection: 'products',
                  id: item.productId,
                  depth: 0,
                })) as Product
                if (product && product.pricing?.finalPrice) {
                  calculatedAmount += product.pricing.finalPrice * (item.quantity || 1)
                  const productName = product.title || 'Product'
                  paymentDescription += `${productName} (x${item.quantity || 1}), `
                  itemDetailsForProvider.push({
                    description: productName,
                    quantity: (item.quantity || 1).toString(),
                    amount: {
                      value: product.pricing.finalPrice.toFixed(2),
                      currency: params.currency,
                    },
                    vat_code: 1,
                  })
                }
              } catch (e) {
                this.payload.logger.error(`Error fetching product ${item.productId}: ${e}`)
              }
            }
          }
        }

        if (calculatedAmount <= 0 && params.metadata?.items && params.metadata.items.length > 0) {
          this.payload.logger.error(
            `Calculated amount for order ${orderId} is zero or negative. Original amount: ${params.amount}. Items: ${JSON.stringify(params.metadata.items)}`,
          )
          calculatedAmount = params.amount
        } else if (calculatedAmount <= 0) {
          calculatedAmount = params.amount
        }

        paymentDescription =
          paymentDescription.length > 128
            ? paymentDescription.substring(0, 125) + '...'
            : paymentDescription.slice(0, -2)

        const returnUrl =
          params.metadata?.returnUrl ||
          `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/yoomoney/callback`

        const body: any = {
          amount: {
            value: calculatedAmount.toFixed(2),
            currency: params.currency,
          },
          confirmation: {
            type: 'redirect',
            return_url: returnUrl,
          },
          description: paymentDescription,
          metadata: {
            ...params.metadata,
            order_id: orderId,
          },
          capture: true,
          save_payment_method: params.metadata?.savePaymentMethod === true,
        }

        if (itemDetailsForProvider.length > 0 && params.metadata?.customerEmail) {
          body.receipt = {
            customer: {
              email: params.metadata.customerEmail,
            },
            items: itemDetailsForProvider,
          }
        }

        try {
          this.payload.logger.info(
            `Creating YooMoney payment for order ${orderId}, amount: ${calculatedAmount} ${params.currency}. Idempotence-Key: ${idempotenceKey}`,
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
          const confirmationUrl = responseData.confirmation?.confirmation_url

          return {
            status: responseData.status === 'succeeded' ? 'succeeded' : 'pending',
            paymentId: responseData.id,
            provider: 'yoomoney',
            rawResponse: { ...responseData, confirmationUrl },
            confirmationUrl,
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
        token: string,
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
            paymentId: responseData.id,
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
          const response = await fetch(YOOMONEY_API_CANCEL_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify({}),
          })
          const responseData = await response.json()

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
            status: 'voided',
            paymentId: responseData.id,
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
        if (!robokassaConfig?.merchantLogin || !robokassaConfig?.password1) {
          this.payload.logger.error(
            'Robokassa configuration (merchantLogin/password1) is missing for processPayment.',
          )
          return {
            status: 'failed',
            errorMessage: 'Robokassa configuration missing: merchant credentials not found.',
            provider: 'robokassa',
            rawResponse: {
              error: 'configuration_error',
              description: 'Robokassa merchant credentials not configured properly',
              solution: 'Check payment provider settings in admin panel',
            },
          }
        }

        // Дополнительная проверка параметров
        if (!params.amount || params.amount <= 0) {
          this.payload.logger.error(`Invalid amount for Robokassa payment: ${params.amount}`)
          return {
            status: 'failed',
            errorMessage: 'Invalid payment amount',
            provider: 'robokassa',
            rawResponse: {
              error: 'invalid_amount',
              description: `Amount must be greater than 0, got: ${params.amount}`,
              solution: 'Check cart total calculation',
            },
          }
        }

        // Проверяем наличие ID заказа
        if (!params.metadata?.orderId) {
          this.payload.logger.error('Missing orderId for Robokassa payment')
          return {
            status: 'failed',
            errorMessage: 'Order ID is required for Robokassa payment',
            provider: 'robokassa',
            rawResponse: {
              error: 'missing_order_id',
              description: 'Order ID is required but was not provided',
            },
          }
        }

        const orderId = params.metadata?.orderId || `order_${Date.now()}`
        let calculatedAmount = 0
        let paymentDescription = `Payment for order ${orderId}. Items: `

        if (params.metadata?.items && Array.isArray(params.metadata.items)) {
          for (const item of params.metadata.items) {
            if (item.serviceId) {
              try {
                const service = (await this.payload.findByID({
                  collection: 'services',
                  id: item.serviceId,
                  depth: 0,
                })) as Service
                if (service && service.price) {
                  calculatedAmount += service.price * (item.quantity || 1)
                  const serviceName = service.title || 'Service'
                  paymentDescription += `${serviceName} (x${item.quantity || 1}), `
                }
              } catch (e) {
                this.payload.logger.error(
                  `Error fetching service ${item.serviceId} for Robokassa: ${e}`,
                )
              }
            } else if (item.productId) {
              try {
                const product = (await this.payload.findByID({
                  collection: 'products',
                  id: item.productId,
                  depth: 0,
                })) as Product
                if (product && product.pricing?.finalPrice) {
                  calculatedAmount += product.pricing.finalPrice * (item.quantity || 1)
                  const productName = product.title || 'Product'
                  paymentDescription += `${productName} (x${item.quantity || 1}), `
                }
              } catch (e) {
                this.payload.logger.error(
                  `Error fetching product ${item.productId} for Robokassa: ${e}`,
                )
              }
            }
          }
        }

        if (calculatedAmount <= 0 && params.metadata?.items && params.metadata.items.length > 0) {
          this.payload.logger.error(
            `Calculated amount for order ${orderId} is zero or negative for Robokassa. Original amount: ${params.amount}. Items: ${JSON.stringify(params.metadata.items)}`,
          )
          calculatedAmount = params.amount
        } else if (calculatedAmount <= 0) {
          calculatedAmount = params.amount
        }
        paymentDescription =
          paymentDescription.length > 100
            ? paymentDescription.substring(0, 97) + '...'
            : paymentDescription.slice(0, -2)

        let paymentUrl
        try {
          paymentUrl = this.generateRobokassaPaymentLink(
            orderId,
            calculatedAmount,
            paymentDescription,
          )

          this.payload.logger.info(
            `Robokassa payment link generated for order ${orderId}: ${paymentUrl}`,
          )
        } catch (linkError) {
          const errorMessage = linkError instanceof Error ? linkError.message : 'Unknown error'
          this.payload.logger.error(
            `Failed to generate Robokassa payment link for order ${orderId}: ${errorMessage}`,
          )

          return {
            status: 'failed',
            paymentId: orderId,
            provider: 'robokassa',
            errorMessage: `Failed to generate payment link: ${errorMessage}`,
            rawResponse: {
              error: 'payment_link_generation_failed',
              description: errorMessage,
              technical_info:
                linkError instanceof Error
                  ? {
                      name: linkError.name,
                      stack: linkError.stack,
                    }
                  : undefined,
            },
          }
        }

        return {
          status: 'pending',
          paymentId: orderId,
          provider: 'robokassa',
          rawResponse: {
            confirmationUrl: paymentUrl,
            message: 'Redirect user to Robokassa to complete payment.',
          },
          confirmationUrl: paymentUrl,
        }
      },
      chargeWithToken: async (
        initialInvoiceId: string,
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
        const robokassaConfig = this.settings?.providersConfig?.robokassa
        if (!robokassaConfig?.merchantLogin || !robokassaConfig?.password2) {
          this.payload.logger.error(
            'Robokassa configuration (merchantLogin/password2) is missing for chargeWithToken (recurring).',
          )
          return { success: false, error: 'Robokassa configuration missing.' }
        }

        const merchantLogin = robokassaConfig.merchantLogin
        const password2 = robokassaConfig.password2
        const isTestMode = robokassaConfig.testMode === true

        const RECURRING_API_URL = isTestMode
          ? 'https://test.robokassa.ru/Merchant/Recurring'
          : 'https://auth.robokassa.ru/Merchant/Recurring'

        const newInvoiceId = orderId
        const signatureString = `${merchantLogin}:${amount}:${newInvoiceId}:${password2}`
        const signatureValue = crypto
          .createHash('md5')
          .update(signatureString)
          .digest('hex')
          .toUpperCase()

        const queryParams = new URLSearchParams({
          MerchantLogin: merchantLogin,
          PreviousInvoiceID: initialInvoiceId,
          InvoiceID: newInvoiceId,
          OutSum: amount.toFixed(2),
          SignatureValue: signatureValue,
          IsTest: isTestMode ? '1' : '0',
        })

        const requestUrl = `${RECURRING_API_URL}?${queryParams.toString()}`

        try {
          this.payload.logger.info(
            `Attempting Robokassa recurring charge for new order ${newInvoiceId} (linked to initial ${initialInvoiceId}), amount: ${amount}. URL: ${requestUrl}`,
          )
          const response = await fetch(requestUrl, { method: 'GET' })

          const responseText = await response.text()
          let responseData: any = {}
          try {
            responseData = JSON.parse(responseText)
          } catch (e) {
            this.payload.logger.warn(
              `Robokassa recurring response for ${newInvoiceId} was not valid JSON: ${responseText}`,
            )
            if (
              responseText.includes('OK') ||
              responseText.includes('Success') ||
              responseText.match(/^0$/)
            ) {
              responseData = { ResultCode: 0, RawText: responseText }
            } else {
              responseData = {
                ResultCode: -1,
                Description: 'Failed to parse response or unknown format.',
                RawText: responseText,
              }
            }
          }

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
            transactionId: newInvoiceId,
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
          `Robokassa.refundPayment called for order ${params.orderId}, amount ${params.amount} ${params.currency}. Based on available information, Robokassa refunds are typically handled manually via their merchant panel. A direct programmatic refund API is not clearly documented or may not be generally available. Please verify with Robokassa's official documentation or support if an API for refunds exists.`,
        )
        return {
          status: 'failed',
          errorMessage:
            'Programmatic refunds for Robokassa are not implemented due to lack of clear public API. Please process manually via Robokassa merchant panel or verify API availability.',
          provider: 'robokassa',
          rawResponse: { message: 'Robokassa refund API details needed for implementation.' },
        }
      },
      voidPayment: async (params: VoidParams): Promise<PaymentResult> => {
        this.payload.logger.warn(
          `Robokassa.voidPayment called for order ${params.orderId}. Robokassa generally does not support a 'void' operation for processed payments like other gateways. If a payment is completed, a refund is the standard procedure. If an invoice is unpaid, it typically expires. This 'void' operation is considered not applicable or not supported via a standard API.`,
        )
        return {
          status: 'failed',
          errorMessage:
            'Automated void for Robokassa is not implemented as it is generally not applicable or supported. For completed payments, use refund. For unpaid invoices, they typically expire.',
          provider: 'robokassa',
          rawResponse: { message: 'Robokassa void operation not applicable/supported here.' },
        }
      },
    }

    const cryptoProvider: IPaymentProvider = {
      ...defaultProviderImpl,
      refundPayment: async (params: RefundParams): Promise<PaymentResult> => {
        this.payload.logger.warn(
          `STUB: CryptoProvider.refundPayment called for order ${params.orderId}. Crypto refunds are complex and gateway-specific.`,
        )
        return defaultProviderImpl.refundPayment(params)
      },
      voidPayment: async (params: VoidParams): Promise<PaymentResult> => {
        this.payload.logger.warn(
          `STUB: CryptoProvider.voidPayment called for order ${params.orderId}. Voids may not be applicable for most crypto transactions post-confirmation.`,
        )
        return defaultProviderImpl.voidPayment(params)
      },
    }

    const genericGatewayProvider: IPaymentProvider = { ...defaultProviderImpl }

    return {
      yoomoney: yoomoneyProvider,
      robokassa: robokassaProvider,
      crypto: cryptoProvider,
      genericGateway: genericGatewayProvider,
    }
  }

  private getPaymentProvider(providerKey: PaymentProviderKey): IPaymentProvider {
    const providerInstance = this.paymentProviders[providerKey]
    if (!providerInstance) {
      this.payload.logger.error(
        `Payment provider ${providerKey} not found or not initialized correctly. Falling back to genericGateway.`,
      )
      return this.paymentProviders.genericGateway
    }
    return providerInstance
  }
}
