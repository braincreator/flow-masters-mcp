import type {
  PaymentConfig,
  OrderConfig,
  ProductConfig,
  NotificationConfig,
  SupportedLocale,
} from '@/types/constants'
import { PRODUCT_TYPE_LABELS, PRODUCT_FEATURE_LABELS } from './localization'

export const PAYMENT_CONFIG = {
  defaultCurrency: 'USD',
  supportedCurrencies: ['USD', 'EUR', 'RUB'] as const,
  providers: {
    yoomoney: {
      name: 'YooMoney',
      enabled: true,
      test: process.env.NODE_ENV !== 'production',
      credentials: {
        merchantId: process.env.YOOMONEY_MERCHANT_ID || '',
        secretKey: process.env.YOOMONEY_SECRET_KEY || '',
      },
      successPath: '/payment/success',
      failurePath: '/payment/failure',
      callbackPath: '/api/payment/yoomoney/callback',
    },
    robokassa: {
      name: 'Robokassa',
      enabled: true,
      test: process.env.NODE_ENV !== 'production',
      credentials: {
        merchantId: process.env.ROBOKASSA_MERCHANT_ID || '',
        secretKey: process.env.ROBOKASSA_SECRET_KEY || '',
      },
      successPath: '/payment/success',
      failurePath: '/payment/failure',
      callbackPath: '/api/payment/robokassa/callback',
    },
  },
} as const

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

export const ORDER_CONFIG: OrderConfig = {
  statuses: {
    draft: {
      label: 'Draft',
      color: 'gray',
      icon: 'draft',
      description: 'Order is being created',
    },
    pending: {
      label: 'Pending',
      color: 'yellow',
      icon: 'pending',
      description: 'Waiting for payment',
    },
    confirmed: {
      label: 'Confirmed',
      color: 'blue',
      icon: 'confirmed',
      description: 'Payment received',
    },
    processing: {
      label: 'Processing',
      color: 'orange',
      icon: 'processing',
      description: 'Order is being processed',
    },
    completed: {
      label: 'Completed',
      color: 'green',
      icon: 'completed',
      description: 'Order fulfilled',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'red',
      icon: 'cancelled',
      description: 'Order was cancelled',
    },
    refunded: {
      label: 'Refunded',
      color: 'purple',
      icon: 'refunded',
      description: 'Payment was refunded',
    },
  },
  defaultStatus: 'draft',
  expirationTime: 60, // 60 minutes
  autoCancel: true,
  notifications: {
    email: true,
    sms: false,
    telegram: true,
  },
} as const

export const getProductConfig = (locale: SupportedLocale) => ({
  types: {
    digital: {
      label: PRODUCT_TYPE_LABELS[locale].digital,
      icon: 'digital',
      features: ['instant-delivery', 'download', 'no-shipping'].map(
        feature => ({
          key: feature,
          label: PRODUCT_FEATURE_LABELS[locale][feature],
        })
      ),
    },
    subscription: {
      label: PRODUCT_TYPE_LABELS[locale].subscription,
      icon: 'subscription',
      features: ['recurring-billing', 'access-control', 'updates'].map(
        feature => ({
          key: feature,
          label: PRODUCT_FEATURE_LABELS[locale][feature],
        })
      ),
    },
    service: {
      label: PRODUCT_TYPE_LABELS[locale].service,
      icon: 'service',
      features: ['booking', 'scheduling', 'custom-delivery'].map(
        feature => ({
          key: feature,
          label: PRODUCT_FEATURE_LABELS[locale][feature],
        })
      ),
    },
    access: {
      label: PRODUCT_TYPE_LABELS[locale].access,
      icon: 'access',
      features: ['instant-activation', 'feature-gating', 'access-control'].map(
        feature => ({
          key: feature,
          label: PRODUCT_FEATURE_LABELS[locale][feature],
        })
      ),
    },
  },
  statuses: {
    draft: {
      label: 'Draft',
      color: 'gray',
    },
    active: {
      label: 'Active',
      color: 'green',
    },
    inactive: {
      label: 'Inactive',
      color: 'yellow',
    },
    archived: {
      label: 'Archived',
      color: 'red',
    },
  },
  defaultType: 'digital',
  defaultStatus: 'draft',
  pricing: {
    allowDecimal: true,
    minPrice: 100,
    maxPrice: 1000000,
    defaultTaxRate: 0.20,
  },
  inventory: {
    track: true,
    lowStockThreshold: 5,
    allowBackorder: false,
  },
}) as const

export const NOTIFICATION_CONFIG: NotificationConfig = {
  providers: {
    email: {
      enabled: true,
      credentials: {
        host: process.env.SMTP_HOST || '',
        port: process.env.SMTP_PORT || '',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
    sms: {
      enabled: false,
      credentials: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
      },
    },
    telegram: {
      enabled: true,
      credentials: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_CHAT_ID || '',
      },
    },
    push: {
      enabled: false,
      credentials: {
        vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
        vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
      },
    },
  },
  templates: {
    order_created: {
      subject: 'New order #{orderId}',
      body: 'Thank you for your order! We will process it shortly.',
      variables: ['orderId', 'customerName', 'amount'],
    },
    order_confirmed: {
      subject: 'Order #{orderId} confirmed',
      body: 'Your order has been confirmed and is being processed.',
      variables: ['orderId', 'customerName', 'amount'],
    },
    order_completed: {
      subject: 'Order #{orderId} completed',
      body: 'Your order has been completed. Thank you for shopping with us!',
      variables: ['orderId', 'customerName', 'amount'],
    },
    payment_success: {
      subject: 'Payment successful for order #{orderId}',
      body: 'We have received your payment. Thank you!',
      variables: ['orderId', 'customerName', 'amount'],
    },
    payment_failed: {
      subject: 'Payment failed for order #{orderId}',
      body: 'There was a problem processing your payment. Please try again.',
      variables: ['orderId', 'customerName', 'amount'],
    },
  },
  defaults: {
    from: 'noreply@example.com',
    replyTo: 'support@example.com',
    language: 'en',
  },
} as const
