import { PaymentProvider } from './payment'

export type SubscriptionStatus =
  | 'active' // подписка активна
  | 'paused' // временно приостановлена
  | 'canceled' // отменена пользователем
  | 'expired' // истекла по сроку
  | 'failed' // неудачный платеж
  | 'pending' // ожидает первого платежа

export enum SubscriptionStatusEnum {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  FAILED = 'failed',
  PENDING = 'pending',
}

export type SubscriptionPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  paymentProvider: PaymentProvider
  paymentMethod?: string
  paymentToken?: string

  // Периодичность
  period: SubscriptionPeriod
  amount: number
  currency: string

  // Даты
  startDate: string
  nextPaymentDate: string | undefined
  endDate?: string
  canceledAt?: string
  pausedAt?: string

  // Метаданные
  metadata?: Record<string, any>
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'yearly'
  features: string[]
  isActive: boolean
  trialDays?: number
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface SubscriptionPaymentHistory {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'successful' | 'failed' | 'refunded' | 'pending'
  paymentDate: string
  paymentMethod: string
  transactionId?: string
  failureReason?: string
}

export interface CreateSubscriptionParams {
  userId: string
  planId: string
  paymentProvider: PaymentProvider
  paymentMethod?: string
  paymentToken?: string
  startDate?: string // Если не указана, используется текущая дата
  metadata?: Record<string, any>
}

export interface UpdateSubscriptionParams {
  status?: SubscriptionStatus
  plan?: string
  paymentMethod?: string
  paymentToken?: string
  period?: SubscriptionPeriod
  amount?: number
  currency?: 'RUB' | 'USD' | 'EUR'
  nextPaymentDate?: string
  endDate?: string
  canceledAt?: string
  pausedAt?: string
  lastPaymentDate?: string
  paymentRetryAttempt?: number
  lastPaymentAttemptFailed?: boolean
  metadata?: Record<string, any>
}

export interface PaymentMethod {
  id: string
  userId: string
  type: 'card' | 'bank_account' | 'wallet'
  provider: string
  isDefault: boolean
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  cardType?: string
  holderName?: string
  metadata?: Record<string, any>
}

export interface SubscriptionPayment {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'pending' | 'refunded'
  paymentDate: string
  paymentMethodId: string
  transactionId: string
  metadata?: Record<string, any>
}

export interface SubscriptionInvoice {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'paid' | 'unpaid' | 'void' | 'draft'
  issueDate: string
  dueDate: string
  paidDate?: string
  items: Array<{
    description: string
    amount: number
    quantity: number
  }>
  metadata?: Record<string, any>
}
