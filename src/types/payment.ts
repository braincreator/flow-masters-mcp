import { PAYMENT_CONFIG, PAYMENT_STATUSES } from '@/constants/payment'

/**
 * Payment provider types supported by the application
 */
export type PaymentProvider = 'yoomoney' | 'robokassa' | 'stripe' | 'paypal' | 'crypto'

/**
 * Payment method types
 */
export type PaymentMethod =
  | 'card' // Credit/debit card
  | 'wallet' // Electronic wallet
  | 'bank' // Bank transfer
  | 'cash' // Cash on delivery

/**
 * Payment status values
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

/**
 * Transaction data from payment provider
 */
export interface PaymentTransaction {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: PaymentProvider
  method: PaymentMethod
  createdAt: string
  completedAt?: string
  failedAt?: string
  refundedAt?: string
  metadata?: Record<string, any>
}

/**
 * Payment webhook notification data structure
 */
export interface PaymentNotification {
  type: string
  paymentId: string
  orderId: string
  status: PaymentStatus
  amount: number
  currency: string
  timestamp: string
  provider: PaymentProvider
  rawData: Record<string, any>
}

/**
 * Payment provider configuration
 */
export interface PaymentProviderConfig {
  enabled: boolean
  name: {
    en: string
    ru: string
  }
  credentials: Record<string, string>
  testMode: boolean
  methods: PaymentMethod[]
  logoUrl?: string
}

/**
 * Payment settings structure
 */
export interface PaymentSettings {
  providers: Record<PaymentProvider, PaymentProviderConfig>
  defaultProvider: PaymentProvider
  defaultCurrency: string
  supportedCurrencies: string[]
  orderExpirationMinutes: number
}

export type SupportedCurrency = (typeof PAYMENT_CONFIG.supportedCurrencies)[number]

export interface PaymentFormData {
  provider: PaymentProvider
  orderId: string
  amount: number
  currency: SupportedCurrency
  description: string
  customerEmail: string
}

export interface PaymentResult {
  success: boolean
  orderId: string
  transactionId?: string
  error?: string
}
