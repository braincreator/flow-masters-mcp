import { PAYMENT_CONFIG, PAYMENT_STATUSES } from '@/constants/payment'

export type PaymentProvider = keyof typeof PAYMENT_CONFIG.providers
export type PaymentStatus = typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES]
export type SupportedCurrency = typeof PAYMENT_CONFIG.supportedCurrencies[number]

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