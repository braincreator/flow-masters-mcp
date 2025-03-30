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
    try {
      // If no payload client, return default settings
      if (!this.payload) {
        console.warn('PaymentService: payload not set, returning default settings')
        return {
          providers: [{ id: 'robokassa', name: 'Robokassa', enabled: true }],
          defaultProvider: 'robokassa',
        }
      }

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

  async getEnabledProviders(): Promise<Array<{ id: PaymentProvider; name: string }>> {
    if (!this.payload) {
      console.warn('PaymentService: payload not set, returning default providers')
      return [
        { id: 'yoomoney', name: 'YooMoney' },
        { id: 'robokassa', name: 'Robokassa' },
      ]
    }

    try {
      const settings = await this.getSettings()
      const enabledProviders = settings?.providers?.filter((p) => p.enabled) || []

      if (enabledProviders.length === 0) {
        return [
          { id: 'yoomoney', name: 'YooMoney' },
          { id: 'robokassa', name: 'Robokassa' },
        ]
      }

      return enabledProviders.map((p) => ({
        id: p.id as PaymentProvider,
        name: p.name || p.id,
      }))
    } catch (error) {
      console.error('Error getting enabled providers:', error)
      return [
        { id: 'yoomoney', name: 'YooMoney' },
        { id: 'robokassa', name: 'Robokassa' },
      ]
    }
  }

  async getDefaultProvider(): Promise<PaymentProvider> {
    if (!this.payload) {
      console.warn('PaymentService: payload not set, returning default provider')
      return 'yoomoney'
    }

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

  // YooMoney payment methods
  async createYooMoneyPayment(
    params: PaymentCreateParams,
    provider: { id: PaymentProvider; name: string },
  ): Promise<PaymentResult> {
    // Get config from settings or use defaults
    const settings = await this.getSettings()
    const providerConfig = settings.providersConfig?.yoomoney

    if (!providerConfig) {
      console.error('YooMoney config not found')
      throw new Error('YooMoney config not found')
    }

    console.log('YooMoney config:', providerConfig) // Debug log

    const { shopId, secretKey, testMode } = providerConfig

    if (!shopId) {
      console.error('Missing required YooMoney credentials:', { shopId: !!shopId })
      throw new Error('Missing required YooMoney credentials')
    }

    const baseUrl = 'https://yoomoney.ru/quickpay/confirm.xml'

    // Generate payment ID
    const paymentId = `ym_${Date.now()}_${params.orderId}`

    const queryParams = new URLSearchParams({
      receiver: shopId,
      'quickpay-form': 'shop',
      targets: params.description || `Order #${params.orderId}`,
      paymentType: 'AC', // Card payment
      sum: params.amount.toString(),
      label: paymentId,
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

    // Add success URL with locale
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    queryParams.append(
      'successURL',
      params.returnUrl ||
        `${serverUrl}/${params.locale}/payment/success?provider=yoomoney&orderId=${params.orderId}`,
    )

    const paymentUrl = `${baseUrl}?${queryParams.toString()}`

    console.log('Generated YooMoney payment URL:', paymentUrl)

    return {
      success: true,
      paymentUrl,
      paymentId,
    }
  }

  // Robokassa payment methods
  async createRobokassaPayment(
    params: PaymentCreateParams,
    provider: PaymentProvider,
  ): Promise<PaymentResult> {
    try {
      const { orderId, amount, description, customer, locale } = params

      console.log('Creating Robokassa payment with provider:', provider)

      // Try to get credentials from the provider object first
      let credentials = provider.credentials || {}
      let merchantLogin = credentials.merchant_login || ''
      let password1 = credentials.password1 || ''

      // If credentials are missing, try to fetch from the database
      if ((!merchantLogin || !password1) && this.payload) {
        try {
          // Try to get from payment-providers global
          const paymentProviders = await this.payload.findGlobal({
            slug: 'payment-providers',
          })

          if (paymentProviders?.robokassa?.robokassa_enabled) {
            console.log('Found Robokassa configuration in globals')

            // Get config based on test mode
            const robokassaConfig = paymentProviders.robokassa?.robokassa_config || {}
            const isTestMode = robokassaConfig.testMode !== false
            const configSource = isTestMode ? robokassaConfig.test : robokassaConfig.production

            if (configSource) {
              merchantLogin = configSource.merchant_login || ''
              password1 = configSource.password1 || ''

              console.log('Using Robokassa credentials from database global settings')
            }
          }
        } catch (dbError) {
          console.error('Error fetching Robokassa settings from database:', dbError)
        }
      }

      // Fall back to environment variables if still missing
      merchantLogin = merchantLogin || process.env.ROBOKASSA_MERCHANT_LOGIN || ''
      password1 = password1 || process.env.ROBOKASSA_PASSWORD1 || ''

      console.log('Robokassa credentials check:', {
        hasMerchantLogin: !!merchantLogin,
        hasPassword1: !!password1,
      })

      if (!merchantLogin || !password1) {
        console.error(
          'Missing required Robokassa credentials - merchantLogin or password1 is empty',
        )
        return {
          success: false,
          error: 'Payment provider is not properly configured. Please contact support.',
        }
      }

      // Generate signature
      const invId = orderId
      const outSum = amount.toFixed(2)
      const signature = crypto
        .createHash('md5')
        .update(`${merchantLogin}:${outSum}:${invId}:${password1}`)
        .digest('hex')

      console.log('Generated Robokassa signature for payment', {
        merchantLogin,
        outSum,
        invId,
        hasPassword1: !!password1,
        signature,
      })

      // Build the payment URL params
      const urlParams = new URLSearchParams()
      urlParams.append('MerchantLogin', merchantLogin)
      urlParams.append('OutSum', outSum)
      urlParams.append('InvId', invId)
      urlParams.append('Description', description || `Order ${orderId}`)
      urlParams.append('SignatureValue', signature)
      urlParams.append('Culture', locale === 'ru' ? 'ru' : 'en')
      urlParams.append('Encoding', 'utf-8')

      // Add success and failure URLs if provided
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      urlParams.append('SuccessURL', `${baseUrl}/${locale}/payment/success?orderId=${orderId}`)
      urlParams.append('FailURL', `${baseUrl}/${locale}/payment/failure?orderId=${orderId}`)

      const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?${urlParams.toString()}`
      console.log('Generated Robokassa payment URL:', paymentUrl)

      return {
        success: true,
        paymentUrl,
        paymentId: invId,
      }
    } catch (error) {
      console.error('Error creating Robokassa payment:', error)
      return {
        success: false,
        error: 'Failed to create Robokassa payment. Please try again or contact support.',
      }
    }
  }

  // Stripe payment methods
  async createStripePayment(
    params: PaymentCreateParams,
    provider: { id: PaymentProvider; name: string },
  ): Promise<PaymentResult> {
    // Get config from settings or use defaults
    const settings = await this.getSettings()
    const providerConfig = settings.providersConfig?.stripe

    if (!providerConfig) {
      console.error('Stripe config not found')
      throw new Error('Stripe config not found')
    }

    console.log('Stripe config:', providerConfig) // Debug log

    const { publishableKey, secretKey } = providerConfig

    if (!publishableKey || !secretKey) {
      console.error('Missing required Stripe credentials:', {
        publishableKey: !!publishableKey,
        secretKey: !!secretKey,
      })
      throw new Error('Missing required Stripe credentials')
    }

    // In a real implementation, this would use the Stripe SDK
    // For now we'll return a fallback error
    console.warn('Stripe payment implementation is a stub')

    // For demonstration purposes, we'll simulate a redirect to Stripe
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    const successUrl = `${serverUrl}/${params.locale}/payment/success?orderId=${params.orderId}`
    const cancelUrl = `${serverUrl}/${params.locale}/payment/failure?orderId=${params.orderId}`

    // This is just a placeholder - in a real implementation, you would:
    // 1. Import the Stripe SDK
    // 2. Create a Stripe checkout session with product details
    // 3. Return the session URL

    // Placeholder for the payment URL
    const mockPaymentUrl = `https://checkout.stripe.com/placeholder?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`

    console.log('Would generate Stripe checkout URL:', mockPaymentUrl)

    return {
      success: false,
      error: 'Stripe payment not implemented yet',
    }
  }

  // PayPal payment methods
  async createPayPalPayment(
    params: PaymentCreateParams,
    provider: { id: PaymentProvider; name: string },
  ): Promise<PaymentResult> {
    // Get config from settings or use defaults
    const settings = await this.getSettings()
    const providerConfig = settings.providersConfig?.paypal

    if (!providerConfig) {
      console.error('PayPal config not found')
      throw new Error('PayPal config not found')
    }

    console.log('PayPal config:', providerConfig) // Debug log

    const { clientId, clientSecret } = providerConfig

    if (!clientId || !clientSecret) {
      console.error('Missing required PayPal credentials:', {
        clientId: !!clientId,
        clientSecret: !!clientSecret,
      })
      throw new Error('Missing required PayPal credentials')
    }

    // In a real implementation, this would use the PayPal SDK
    // For now we'll return a fallback error
    console.warn('PayPal payment implementation is a stub')

    // For demonstration purposes, we'll simulate a redirect to PayPal
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    const returnUrl = `${serverUrl}/${params.locale}/payment/success?orderId=${params.orderId}`
    const cancelUrl = `${serverUrl}/${params.locale}/payment/failure?orderId=${params.orderId}`

    // This is just a placeholder - in a real implementation, you would:
    // 1. Import the PayPal SDK
    // 2. Create a PayPal order with product details
    // 3. Return the approval URL

    // Placeholder for the payment URL
    const mockPaymentUrl = `https://www.paypal.com/checkoutnow?token=placeholder&return=${encodeURIComponent(returnUrl)}&cancel=${encodeURIComponent(cancelUrl)}`

    console.log('Would generate PayPal checkout URL:', mockPaymentUrl)

    return {
      success: false,
      error: 'PayPal payment not implemented yet',
    }
  }

  // Cryptocurrency payment methods
  private async createCryptoPayment(
    params: PaymentCreateParams,
    provider: PaymentProvider,
  ): Promise<PaymentResult> {
    try {
      const { orderId, amount, currency, locale, customer, description, returnUrl } = params
      const settings = await this.getSettings()

      console.log('Creating crypto payment with provider:', provider)

      // Get provider configuration
      const providerConfig = provider.credentials || {}
      const {
        api_key,
        merchant_id,
        webhook_secret,
        wallet_connect_project_id,
        supported_currencies = 'ETH,USDT,DAI',
        test_mode,
      } = providerConfig

      // Generate a unique payment ID
      const paymentId = `crypto-${Date.now()}-${orderId}`

      // Get selected cryptocurrency (default to ETH if not specified)
      const selectedCryptoCurrency = params.metadata?.selectedCurrency || 'ETH'

      // Build the payment URL with all necessary parameters
      const paymentUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/${locale}/crypto-payment`)

      // Add payment parameters as query parameters
      paymentUrl.searchParams.append('paymentId', paymentId)
      paymentUrl.searchParams.append('orderId', orderId)
      paymentUrl.searchParams.append('amount', amount.toString())
      paymentUrl.searchParams.append('currency', selectedCryptoCurrency)
      paymentUrl.searchParams.append(
        'successUrl',
        returnUrl ||
          `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/payment/success?orderId=${orderId}`,
      )
      paymentUrl.searchParams.append(
        'cancelUrl',
        `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/payment/failure?orderId=${orderId}`,
      )

      // Add WalletConnect project ID if available
      if (wallet_connect_project_id) {
        paymentUrl.searchParams.append('wcProjectId', wallet_connect_project_id)
      }

      // Add test mode flag if enabled
      if (test_mode) {
        paymentUrl.searchParams.append('testMode', 'true')
      }

      console.log('Generated crypto payment URL:', paymentUrl.toString())

      return {
        success: true,
        paymentUrl: paymentUrl.toString(),
        paymentId,
      }
    } catch (error) {
      console.error('Error creating crypto payment:', error)
      return {
        success: false,
        error: 'Failed to create cryptocurrency payment',
      }
    }
  }

  // Validate YooMoney callback
  async verifyYooMoneyPayment(notification: any): Promise<boolean> {
    if (!this.payload) {
      throw new Error('Payload instance not set')
    }

    try {
      const settings = await this.getSettings()
      const providerConfig = settings.providersConfig?.yoomoney

      if (!providerConfig) {
        throw new Error('YooMoney provider not configured')
      }

      const { secretKey } = providerConfig

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
      const providerConfig = settings.providersConfig?.robokassa

      if (!providerConfig) {
        throw new Error('Robokassa provider not configured')
      }

      const { password2 } = providerConfig

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

  private detectProviderFromWebhook(webhookData: any): PaymentProvider | null {
    // Detection logic for YooMoney
    if (webhookData.notification_type && webhookData.operation_id) {
      return 'yoomoney'
    }

    // Detection logic for Robokassa
    if (webhookData.OutSum && webhookData.InvId) {
      return 'robokassa'
    }

    // Detection logic for Stripe
    if (webhookData.type && webhookData.data && webhookData.data.object) {
      return 'stripe'
    }

    // Detection logic for PayPal
    if (webhookData.event_type && webhookData.resource) {
      return 'paypal'
    }

    // Detection logic for Crypto payments
    if (
      webhookData.payment_id &&
      webhookData.currency &&
      (webhookData.order_id || webhookData.custom_id)
    ) {
      return 'crypto'
    }

    return null
  }

  private verifyYooMoneyWebhook(webhookData: any): boolean {
    try {
      // In a real implementation, you would verify the signature
      // For now, we'll just check required fields
      return !!(
        webhookData.notification_type &&
        webhookData.operation_id &&
        webhookData.amount &&
        webhookData.label
      )
    } catch (error) {
      console.error('Error verifying YooMoney webhook:', error)
      return false
    }
  }

  private verifyRobokassaWebhook(webhookData: any): boolean {
    try {
      // In a real implementation, you would verify using the signature mechanism
      // For now, we'll just check required fields
      return !!(webhookData.OutSum && webhookData.InvId && webhookData.SignatureValue)
    } catch (error) {
      console.error('Error verifying Robokassa webhook:', error)
      return false
    }
  }

  private verifyStripeWebhook(webhookData: any): boolean {
    try {
      // In a real implementation, you would verify using Stripe's webhook signature
      // For now, we'll just check required fields
      return !!(webhookData.type && webhookData.data && webhookData.data.object)
    } catch (error) {
      console.error('Error verifying Stripe webhook:', error)
      return false
    }
  }

  private verifyPayPalWebhook(webhookData: any): boolean {
    try {
      // In a real implementation, you would verify using PayPal's webhook signature
      // For now, we'll just check required fields
      return !!(webhookData.event_type && webhookData.resource)
    } catch (error) {
      console.error('Error verifying PayPal webhook:', error)
      return false
    }
  }

  // Method to verify incoming webhooks
  async verifyWebhook(webhookData: any): Promise<boolean> {
    try {
      // Get provider from webhook data
      const provider = this.detectProviderFromWebhook(webhookData)

      if (!provider) {
        console.error('Could not detect payment provider from webhook data')
        return false
      }

      // Delegate to provider-specific verification logic
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
          return this.verifyCryptoWebhook(webhookData)
        default:
          console.warn(`No verification method for provider: ${provider}`)
          return false // Default to rejecting webhook if provider unknown
      }
    } catch (error) {
      console.error('Error verifying webhook:', error)
      return false
    }
  }

  // Process webhook data into a standardized format
  async processWebhookData(webhookData: any): Promise<{
    orderId: string
    status: string
    transactionId?: string
  }> {
    try {
      // Detect provider from webhook data
      const provider = this.detectProviderFromWebhook(webhookData)

      if (!provider) {
        throw new Error('Could not detect payment provider from webhook data')
      }

      // Process based on provider
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
          return this.processCryptoWebhook(webhookData)
        default:
          throw new Error(`Unsupported payment provider: ${provider}`)
      }
    } catch (error) {
      console.error('Error processing webhook data:', error)
      throw error
    }
  }

  private processYooMoneyWebhook(webhookData: any): {
    orderId: string
    status: string
    transactionId?: string
  } {
    try {
      let status: string

      // Extract order ID from label
      const orderId = webhookData.label?.split('_').pop() || ''

      // Map YooMoney status to internal status
      switch (webhookData.notification_type) {
        case 'payment.succeeded':
          status = 'paid'
          break
        case 'payment.waiting_for_capture':
          status = 'processing'
          break
        case 'payment.canceled':
          status = 'failed'
          break
        default:
          status = 'pending'
      }

      return {
        orderId,
        status,
        transactionId: webhookData.operation_id,
      }
    } catch (error) {
      console.error('Error processing YooMoney webhook:', error)
      throw error
    }
  }

  private processRobokassaWebhook(webhookData: any): {
    orderId: string
    status: string
    transactionId?: string
  } {
    try {
      // Robokassa success webhook always means a successful payment
      return {
        orderId: String(webhookData.InvId),
        status: 'paid',
        transactionId: webhookData.InvId,
      }
    } catch (error) {
      console.error('Error processing Robokassa webhook:', error)
      throw error
    }
  }

  private processStripeWebhook(webhookData: any): {
    orderId: string
    status: string
    transactionId?: string
  } {
    try {
      let status: string
      const event = webhookData.type
      const data = webhookData.data.object

      // Extract metadata containing our order ID
      const orderId = data.metadata?.orderId || ''

      // Map Stripe event to internal status
      switch (event) {
        case 'payment_intent.succeeded':
        case 'checkout.session.completed':
          status = 'paid'
          break
        case 'payment_intent.processing':
          status = 'processing'
          break
        case 'payment_intent.payment_failed':
        case 'payment_intent.canceled':
          status = 'failed'
          break
        default:
          status = 'pending'
      }

      return {
        orderId,
        status,
        transactionId: data.id,
      }
    } catch (error) {
      console.error('Error processing Stripe webhook:', error)
      throw error
    }
  }

  private processPayPalWebhook(webhookData: any): {
    orderId: string
    status: string
    transactionId?: string
  } {
    try {
      let status: string
      const event = webhookData.event_type
      const resource = webhookData.resource

      // Extract custom_id containing our order ID
      const orderId = resource.custom_id || resource.purchase_units?.[0]?.custom_id || ''

      // Map PayPal event to internal status
      switch (event) {
        case 'PAYMENT.CAPTURE.COMPLETED':
        case 'CHECKOUT.ORDER.APPROVED':
          status = 'paid'
          break
        case 'PAYMENT.CAPTURE.PENDING':
          status = 'processing'
          break
        case 'PAYMENT.CAPTURE.DENIED':
        case 'PAYMENT.CAPTURE.REFUNDED':
        case 'CHECKOUT.ORDER.CANCELLED':
          status = 'failed'
          break
        default:
          status = 'pending'
      }

      return {
        orderId,
        status,
        transactionId: resource.id,
      }
    } catch (error) {
      console.error('Error processing PayPal webhook:', error)
      throw error
    }
  }

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

  private async checkYooMoneyPaymentStatus(paymentId: string): Promise<{
    status: string
    details?: any
  }> {
    try {
      // In a real implementation, this would call the YooMoney API
      // For demo purposes, we'll simulate it based on payment ID format

      console.log(`Would check YooMoney payment status for: ${paymentId}`)

      // Mock implementation based on payment ID format
      if (paymentId.includes('success')) {
        return { status: 'paid' }
      } else if (paymentId.includes('pending')) {
        return { status: 'processing' }
      } else if (paymentId.includes('fail')) {
        return { status: 'failed' }
      }

      // Default to the current status if we can't determine
      return { status: 'pending' }
    } catch (error) {
      console.error('Error checking YooMoney payment status:', error)
      return { status: 'error', details: { error: error.message } }
    }
  }

  private async checkRobokassaPaymentStatus(paymentId: string): Promise<{
    status: string
    details?: any
  }> {
    try {
      // In a real implementation, this would call the Robokassa API
      // For demo purposes, we'll simulate it based on payment ID

      console.log(`Would check Robokassa payment status for: ${paymentId}`)

      // Mock implementation based on payment ID format
      if (paymentId.includes('success')) {
        return { status: 'paid' }
      } else if (paymentId.includes('pending')) {
        return { status: 'processing' }
      } else if (paymentId.includes('fail')) {
        return { status: 'failed' }
      }

      // Default to the current status if we can't determine
      return { status: 'pending' }
    } catch (error) {
      console.error('Error checking Robokassa payment status:', error)
      return { status: 'error', details: { error: error.message } }
    }
  }

  private async checkStripePaymentStatus(paymentId: string): Promise<{
    status: string
    details?: any
  }> {
    try {
      // In a real implementation, this would call the Stripe API
      // For demo purposes, we'll simulate it

      console.log(`Would check Stripe payment status for: ${paymentId}`)

      // Mock implementation based on payment ID format
      if (paymentId.includes('success')) {
        return { status: 'paid' }
      } else if (paymentId.includes('pending')) {
        return { status: 'processing' }
      } else if (paymentId.includes('fail')) {
        return { status: 'failed' }
      }

      // Default to the current status if we can't determine
      return { status: 'pending' }
    } catch (error) {
      console.error('Error checking Stripe payment status:', error)
      return { status: 'error', details: { error: error.message } }
    }
  }

  private async checkPayPalPaymentStatus(paymentId: string): Promise<{
    status: string
    details?: any
  }> {
    try {
      // In a real implementation, this would call the PayPal API
      // For demo purposes, we'll simulate it

      console.log(`Would check PayPal payment status for: ${paymentId}`)

      // Mock implementation based on payment ID format
      if (paymentId.includes('success')) {
        return { status: 'paid' }
      } else if (paymentId.includes('pending')) {
        return { status: 'processing' }
      } else if (paymentId.includes('fail')) {
        return { status: 'failed' }
      }

      // Default to the current status if we can't determine
      return { status: 'pending' }
    } catch (error) {
      console.error('Error checking PayPal payment status:', error)
      return { status: 'error', details: { error: error.message } }
    }
  }

  // Validate crypto payment webhook
  async verifyCryptoPayment(webhookData: any): Promise<boolean> {
    if (!this.payload) {
      throw new Error('Payload instance not set')
    }

    try {
      const settings = await this.getSettings()
      const providerConfig = settings.providersConfig?.crypto

      if (!providerConfig) {
        throw new Error('Crypto payment provider not configured')
      }

      const { webhookSecret } = providerConfig

      if (!webhookSecret) {
        throw new Error('Crypto webhook secret not configured')
      }

      // In a real implementation, we would verify the signature
      // For now, we'll check required fields
      const { payment_id, order_id, amount, currency, signature } = webhookData

      if (!payment_id || !order_id || !amount || !currency || !signature) {
        console.error('Missing required fields in crypto payment webhook')
        return false
      }

      // Mock signature verification (in a real implementation, this would use crypto libraries)
      const mockSignatureData = `${payment_id}:${order_id}:${amount}:${currency}:${webhookSecret}`
      const mockExpectedSignature = crypto
        .createHash('sha256')
        .update(mockSignatureData)
        .digest('hex')

      const isValid = signature === mockExpectedSignature

      if (isValid) {
        // Update order status
        await this.updateOrderStatus(order_id, {
          status: 'paid',
          paymentId: payment_id,
          paymentProvider: 'crypto',
          paymentData: webhookData,
        })
      }

      return isValid
    } catch (error) {
      console.error('Crypto payment verification error:', error)
      return false
    }
  }

  private verifyCryptoWebhook = async (
    payload: any,
    signature: string,
    providers: any,
  ): Promise<boolean> => {
    try {
      if (!payload || !signature) {
        console.error('Missing payload or signature for crypto webhook verification')
        return false
      }

      // Get crypto provider settings
      const cryptoProvider = providers.find((p: any) => p.id === 'crypto')
      if (!cryptoProvider) {
        console.error('Crypto provider not configured')
        return false
      }

      // Extract the webhook secret from provider settings
      const webhookSecret = cryptoProvider.credentials?.webhook_secret
      if (!webhookSecret) {
        console.error('Webhook secret not configured for crypto provider')
        return false
      }

      // Compute HMAC signature of the payload using webhook secret
      const crypto = require('crypto')
      const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex')

      // Compare signatures using constant-time comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(computedSignature, 'hex'),
        Buffer.from(signature, 'hex'),
      )

      if (!isValid) {
        console.error('Invalid webhook signature for crypto payment')
      }

      return isValid
    } catch (error) {
      console.error('Error verifying crypto webhook:', error)
      return false
    }
  }

  private processCryptoWebhook = async (
    data: any,
  ): Promise<{
    orderId: string
    success: boolean
    transactionId?: string
    status?: string
    message?: string
  }> => {
    try {
      // Validate webhook payload
      if (!data || !data.paymentId || !data.status) {
        return {
          orderId: '',
          success: false,
          message: 'Invalid webhook data',
        }
      }

      // Extract order ID from payment ID (assuming format: crypto-{timestamp}-{orderId})
      let orderId = ''
      if (data.orderId) {
        orderId = data.orderId
      } else if (data.paymentId && data.paymentId.startsWith('crypto-')) {
        const parts = data.paymentId.split('-')
        if (parts.length >= 3) {
          orderId = parts.slice(2).join('-')
        }
      }

      if (!orderId) {
        return {
          orderId: '',
          success: false,
          message: 'Could not extract order ID from webhook data',
        }
      }

      // Map crypto payment status to our internal status
      let status = 'pending'
      let success = false

      switch (data.status.toLowerCase()) {
        case 'confirmed':
        case 'completed':
        case 'success':
          status = 'completed'
          success = true
          break
        case 'failed':
        case 'rejected':
        case 'error':
          status = 'failed'
          success = false
          break
        case 'processing':
        case 'pending':
          status = 'pending'
          success = false
          break
        default:
          status = 'unknown'
          success = false
      }

      return {
        orderId,
        success,
        status,
        transactionId: data.transactionId || data.txHash || data.hash || undefined,
        message: data.message || undefined,
      }
    } catch (error) {
      console.error('Error processing crypto webhook:', error)
      return {
        orderId: '',
        success: false,
        message: 'Error processing webhook data',
      }
    }
  }

  private async checkCryptoPaymentStatus(paymentId: string): Promise<{
    status: string
    details?: any
  }> {
    try {
      // In a real implementation, this would call the crypto payment provider API
      console.log(`Would check Crypto payment status for: ${paymentId}`)

      // Mock implementation based on payment ID format
      if (paymentId.includes('success')) {
        return { status: 'paid' }
      } else if (paymentId.includes('pending')) {
        return { status: 'processing' }
      } else if (paymentId.includes('fail')) {
        return { status: 'failed' }
      }

      // Default to the current status if we can't determine
      return { status: 'pending' }
    } catch (error) {
      console.error('Error checking Crypto payment status:', error)
      return { status: 'error', details: { error: error.message } }
    }
  }
}

export const paymentService = new PaymentService()
