import { Product } from './product'

/**
 * Enhanced API types for FlowMasters application
 */

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

// Paginated Response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Error Response
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
}

// Request with pagination
export interface PaginatedRequest {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
}

// Analytics API Types
export interface AnalyticsEvent {
  eventName: string
  eventData?: Record<string, any>
  page?: string
  userId?: string
  sessionId?: string
  timestamp?: string
}

export interface PixelResponse {
  pixelsTriggered: number
  eventScripts?: string[]
  success: boolean
}

// Form Submission Types
export interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
  subject?: string
  source?: string
}

export interface ServiceRequestData {
  name: string
  email: string
  phone?: string
  company?: string
  serviceType: string
  budget?: string
  timeline?: string
  description: string
}

// Collection Handlers (existing)
export type CollectionHandlers = {
  [K in 'products']: {
    create: (data: FormData) => Promise<Product>
    update: (id: string, data: FormData) => Promise<Product>
    delete: (id: string) => Promise<void>
  }
}

export type SupportedCollections = keyof CollectionHandlers

// Validation Types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResponse {
  valid: boolean
  errors: ValidationError[]
}

// Cookie Consent Types
export interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
  timestamp: string
  version: string
}