import { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { createGlobalHook } from '@/utilities/revalidation'

// Create a revalidation hook
const revalidatePaymentProviders = createGlobalHook('payment-providers')

// Helper function for provider config fields (Test/Prod)
const createTestProdConfigFields = (testFields: any[], prodFields: any[]): any[] => [
  {
    name: 'testMode',
    type: 'checkbox',
    label: 'Test Mode',
    defaultValue: true,
  },
  {
    name: 'test',
    type: 'group',
    label: 'Test Credentials',
    admin: {
      condition: (_, siblingData) => siblingData?.testMode !== false,
    },
    fields: testFields,
  },
  {
    name: 'production',
    type: 'group',
    label: 'Production Credentials',
    admin: {
      condition: (_, siblingData) => siblingData?.testMode === false,
    },
    fields: prodFields,
  },
]

// Define specific credential fields for each provider
const yoomoneyCredFields = [
  {
    name: 'shop_id',
    type: 'text',
    label: 'Shop ID',
    required: true,
  },
  {
    name: 'secret_key',
    type: 'text',
    label: 'Secret Key',
    required: true,
  },
]

const stripeCredFields = [
  {
    name: 'publishable_key',
    type: 'text',
    label: 'Publishable Key',
    required: true,
  },
  {
    name: 'secret_key',
    type: 'text',
    label: 'Secret Key',
    required: true,
  },
]

const robokassaCredFields = [
  {
    name: 'merchant_login',
    type: 'text',
    label: 'Merchant Login',
    required: true,
  },
  {
    name: 'password1',
    type: 'text',
    label: 'Password #1',
    required: true,
  },
  {
    name: 'password2',
    type: 'text',
    label: 'Password #2',
    required: true,
  },
]

const paypalCredFields = [
  {
    name: 'client_id',
    type: 'text',
    label: 'Client ID',
    required: true,
  },
  {
    name: 'client_secret',
    type: 'text',
    label: 'Client Secret',
    required: true,
  },
]

const cryptoCredFields = [
  {
    name: 'api_key',
    type: 'text',
    label: 'API Key',
    required: true,
  },
  {
    name: 'webhook_secret',
    type: 'text',
    label: 'Webhook Secret',
    required: true,
  },
  {
    name: 'wallet_connect_project_id',
    type: 'text',
    label: 'WalletConnect Project ID',
    required: true,
    admin: {
      description: 'Create a project ID at https://cloud.walletconnect.com/',
    },
  },
  {
    name: 'supported_currencies',
    type: 'text',
    label: 'Supported Currencies (comma-separated)',
    defaultValue: 'ETH,USDT,DAI',
    required: true,
  },
]

export const PaymentProviders: GlobalConfig = {
  slug: 'payment-providers',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'System',
  },
  fields: [
    {
      name: 'general',
      type: 'group',
      label: 'General Settings',
      fields: [
        {
          name: 'orderCancellationTimeout',
          type: 'number',
          label: 'Order Cancellation Timeout (minutes)',
          defaultValue: 60,
          min: 5,
          max: 1440,
          required: true,
        },
      ],
    },
    {
      name: 'yoomoney',
      type: 'group',
      label: 'YooMoney',
      fields: [
        {
          name: 'yoomoney_enabled',
          type: 'checkbox',
          label: 'Enable YooMoney',
          defaultValue: false,
        },
        {
          name: 'yoomoney_displayName',
          type: 'group',
          label: 'Display Name',
          admin: {
            condition: (_, siblingData) => siblingData?.yoomoney_enabled === true,
          },
          fields: [
            {
              name: 'ru',
              type: 'text',
              label: 'Russian',
              defaultValue: 'ЮMoney',
              required: true,
            },
            {
              name: 'en',
              type: 'text',
              label: 'English',
              defaultValue: 'YooMoney',
              required: true,
            },
          ],
        },
        {
          name: 'yoomoney_config',
          type: 'group',
          label: 'Configuration',
          admin: {
            condition: (_, siblingData) => siblingData?.yoomoney_enabled === true,
          },
          fields: createTestProdConfigFields(yoomoneyCredFields, yoomoneyCredFields),
        },
      ],
    },
    {
      name: 'stripe',
      type: 'group',
      label: 'Stripe',
      fields: [
        {
          name: 'stripe_enabled',
          type: 'checkbox',
          label: 'Enable Stripe',
          defaultValue: false,
        },
        {
          name: 'stripe_displayName',
          type: 'group',
          label: 'Display Name',
          admin: {
            condition: (_, siblingData) => siblingData?.stripe_enabled === true,
          },
          fields: [
            {
              name: 'ru',
              type: 'text',
              label: 'Russian',
              defaultValue: 'Stripe',
              required: true,
            },
            {
              name: 'en',
              type: 'text',
              label: 'English',
              defaultValue: 'Stripe',
              required: true,
            },
          ],
        },
        {
          name: 'stripe_config',
          type: 'group',
          label: 'Configuration',
          admin: {
            condition: (_, siblingData) => siblingData?.stripe_enabled === true,
          },
          fields: createTestProdConfigFields(stripeCredFields, stripeCredFields),
        },
      ],
    },
    {
      name: 'robokassa',
      type: 'group',
      label: 'Robokassa',
      fields: [
        {
          name: 'robokassa_enabled',
          type: 'checkbox',
          label: 'Enable Robokassa',
          defaultValue: false,
        },
        {
          name: 'robokassa_displayName',
          type: 'group',
          label: 'Display Name',
          admin: {
            condition: (_, siblingData) => siblingData?.robokassa_enabled === true,
          },
          fields: [
            {
              name: 'ru',
              type: 'text',
              label: 'Russian',
              defaultValue: 'Робокасса',
              required: true,
            },
            {
              name: 'en',
              type: 'text',
              label: 'English',
              defaultValue: 'Robokassa',
              required: true,
            },
          ],
        },
        {
          name: 'robokassa_config',
          type: 'group',
          label: 'Configuration',
          admin: {
            condition: (_, siblingData) => siblingData?.robokassa_enabled === true,
          },
          fields: createTestProdConfigFields(robokassaCredFields, robokassaCredFields),
        },
      ],
    },
    {
      name: 'paypal',
      type: 'group',
      label: 'PayPal',
      fields: [
        {
          name: 'paypal_enabled',
          type: 'checkbox',
          label: 'Enable PayPal',
          defaultValue: false,
        },
        {
          name: 'paypal_displayName',
          type: 'group',
          label: 'Display Name',
          admin: {
            condition: (_, siblingData) => siblingData?.paypal_enabled === true,
          },
          fields: [
            {
              name: 'ru',
              type: 'text',
              label: 'Russian',
              defaultValue: 'PayPal',
              required: true,
            },
            {
              name: 'en',
              type: 'text',
              label: 'English',
              defaultValue: 'PayPal',
              required: true,
            },
          ],
        },
        {
          name: 'paypal_config',
          type: 'group',
          label: 'Configuration',
          admin: {
            condition: (_, siblingData) => siblingData?.paypal_enabled === true,
          },
          fields: createTestProdConfigFields(paypalCredFields, paypalCredFields),
        },
      ],
    },
    {
      name: 'crypto',
      type: 'group',
      label: 'Cryptocurrency',
      fields: [
        {
          name: 'crypto_enabled',
          type: 'checkbox',
          label: 'Enable Cryptocurrency Payments',
          defaultValue: false,
        },
        {
          name: 'crypto_displayName',
          type: 'group',
          label: 'Display Name',
          admin: {
            condition: (_, siblingData) => siblingData?.crypto_enabled === true,
          },
          fields: [
            {
              name: 'ru',
              type: 'text',
              label: 'Russian',
              defaultValue: 'Криптовалюта',
              required: true,
            },
            {
              name: 'en',
              type: 'text',
              label: 'English',
              defaultValue: 'Cryptocurrency',
              required: true,
            },
          ],
        },
        {
          name: 'crypto_config',
          type: 'group',
          label: 'Configuration',
          admin: {
            condition: (_, siblingData) => siblingData?.crypto_enabled === true,
          },
          fields: createTestProdConfigFields(cryptoCredFields, cryptoCredFields),
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Parse _payload if it exists
        if (data._payload && typeof data._payload === 'string') {
          try {
            const parsedPayload = JSON.parse(data._payload)

            // Apply all fields from parsed payload
            Object.keys(parsedPayload).forEach((key) => {
              if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
                data[key] = parsedPayload[key]
              }
            })

            req.payload.logger.info('PaymentProviders beforeChange - parsed _payload')
          } catch (e) {
            req.payload.logger.error('Error parsing _payload:', e)
          }
        }

        req.payload.logger.info('PaymentProviders beforeChange - final data')
        return data
      },
    ],
    afterChange: [
      // Use the standard revalidation hook
      revalidatePaymentProviders,
    ],
  },
}
