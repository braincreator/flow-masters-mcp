import type { Media, User } from '../payload-types'

export type ServiceType = 'consultation' | 'training' | 'development' | 'support' | 'other'

export type BookingProvider = 'calendly' | 'internal' | 'other'

export type PaymentType = 'full_prepayment' | 'partial_prepayment' | 'post_payment'

export interface AdditionalInfoField {
  fieldName: string
  fieldLabel: string
  fieldType: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox'
  required: boolean
  options?: Array<{ label: string; value: string }>
  description?: string
  placeholder?: string
  sendToCalendly?: boolean
}

export interface BookingSettings {
  provider: BookingProvider
  calendlyUsername?: string
  calendlyEventType?: string
  hideEventTypeDetails?: boolean
  hideGdprBanner?: boolean
  enableAdditionalInfo?: boolean
  additionalInfoFields?: AdditionalInfoField[]
  additionalInfoTitle?: string
  additionalInfoDescription?: string
  additionalInfoRequired?: boolean
}

export interface PaymentSettings {
  paymentType: PaymentType
  prepaymentPercentage?: number
}

export interface ServiceFeature {
  name: string
  description: string
}

export interface Service {
  id: string
  title: string
  slug: string
  serviceType: ServiceType
  description: any // RichText content
  shortDescription: string
  price: number
  duration?: number
  thumbnail?: Media
  features?: ServiceFeature[]
  requiresBooking: boolean
  bookingSettings?: BookingSettings
  requiresPayment: boolean
  paymentSettings?: PaymentSettings
  status: 'draft' | 'published' | 'archived'
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ServiceCreateInput {
  title: string
  serviceType: ServiceType
  description: any
  shortDescription: string
  price: number
  duration?: number
  thumbnail?: string
  features?: ServiceFeature[]
  requiresBooking?: boolean
  bookingSettings?: BookingSettings
  requiresPayment?: boolean
  paymentSettings?: PaymentSettings
  status?: 'draft' | 'published' | 'archived'
}

export interface ServiceUpdateInput extends Partial<ServiceCreateInput> {
  id: string
}

export interface ServiceQueryOptions {
  page?: number
  limit?: number
  where?: Record<string, any>
  locale?: string
}

export interface ServiceListResponse {
  docs: Service[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export interface ServiceBookingRequest {
  serviceId: string
  customer: {
    name?: string
    email: string
    phone?: string
    locale?: string
  }
  date?: string
  time?: string
  notes?: string
}

export interface ServicePaymentRequest {
  serviceId: string
  customer: {
    name?: string
    email: string
    phone?: string
    locale?: string
  }
  provider: {
    id: string
    [key: string]: any
  }
  returnUrl?: string
  successUrl?: string
  failUrl?: string
}

export interface ServicePaymentResponse {
  success: boolean
  orderId: string
  orderNumber: string
  paymentId: string
  paymentUrl: string
  requiresBooking: boolean
  bookingSettings?: BookingSettings
}

export interface ServiceBooking {
  id: string
  service: Service
  customer: User
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}
