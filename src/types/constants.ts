// Locale types
export type SupportedLocale = 'en' | 'ru'
export type LocaleConfig = {
  code: SupportedLocale
  label: string
  dateFormat: string
  currency: string
}

// Collection types
export type CollectionSlug = 
  | 'categories'
  | 'media'
  | 'pages'
  | 'posts'
  | 'forms'
  | 'form-submissions'
  | 'search'
  | 'users'
  | 'products'
  | 'orders'
  | 'solutions'

// Global types
export type GlobalSlug = 
  | 'header'
  | 'footer'
  | 'site-config'

// Media types
export type ImageSize = {
  width: number
  height?: number
  crop?: 'center' | 'top' | 'bottom'
}

export type MediaConfig = {
  MAX_FILE_SIZE: number
  ALLOWED_TYPES: string[]
  IMAGE_SIZES: {
    [key: string]: ImageSize
  }
}

// Upload types
export type MimeTypes = {
  IMAGE: string[]
  DOCUMENT: string[]
  ARCHIVE: string[]
}

export type UploadConfig = {
  LIMITS: {
    FILE_SIZE: number
    MAX_FILES: number
  }
  PATHS: {
    TEMP: string
  }
  IMAGE: {
    MAX_CONCURRENCY: number
    MAX_MEMORY_PER_TASK: number
  }
  ALLOWED_MIME_TYPES: MimeTypes
}

// Database types
export type DatabaseConnectionConfig = {
  directConnection: boolean
  serverSelectionTimeoutMS: number
  connectTimeoutMS: number
  socketTimeoutMS: number
  retryWrites: boolean
  retryReads: boolean
  w: string
  maxPoolSize: number
  minPoolSize: number
}

// Cache types
export type CacheConfig = {
  MAX_ITEMS: number
  MAX_AGE: number
  UPDATE_AGE_ON_GET: boolean
}

// API types
export type ApiRoutes = {
  REVALIDATE: string
  SEED: string
  PRODUCTS: {
    ADD: string
    DOWNLOAD: string
  }
  PAYMENT: {
    VALIDATE_DISCOUNT: string
  }
}

export type ApiHeaders = {
  CONTENT_TYPE: string
  AUTHORIZATION: string
  LOCALE: string
}

// HTTP types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

// Error types
export type ErrorMessage = {
  code: string
  message: string
  statusCode: number
}

// Payment types
export type PaymentProvider = keyof typeof PAYMENT_CONFIG.providers
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'
export type Currency = typeof PAYMENT_CONFIG.supportedCurrencies[number]

export interface PaymentMethod {
  id: string
  provider: PaymentProvider
  name: string
  icon: string
  description?: string
}

export type PaymentConfig = {
  providers: Record<PaymentProvider, {
    enabled: boolean
    test: boolean
    credentials: {
      merchantId: string
      secretKey: string
      publicKey?: string
    }
    methods: PaymentMethod[]
    currencies: PaymentCurrency[]
    webhookPath: string
    successPath: string
    failurePath: string
    minAmount: number
    maxAmount: number
  }>
  defaultProvider: PaymentProvider
  defaultCurrency: PaymentCurrency
  allowedCountries: string[]
  taxRate: number
  commission: {
    fixed: number
    percentage: number
  }
}

// Order types
export type OrderStatus = 
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export type OrderConfig = {
  statuses: Record<OrderStatus, {
    label: string
    color: string
    icon: string
    description: string
  }>
  defaultStatus: OrderStatus
  expirationTime: number // in minutes
  autoCancel: boolean
  notifications: {
    email: boolean
    sms: boolean
    telegram: boolean
  }
}

// Product types
export type ProductType = 
  | 'digital'
  | 'physical'
  | 'subscription'
  | 'service'

export type ProductStatus = 
  | 'draft'
  | 'active'
  | 'inactive'
  | 'archived'

export type ProductConfig = {
  types: Record<ProductType, {
    label: string
    icon: string
    features: string[]
  }>
  statuses: Record<ProductStatus, {
    label: string
    color: string
  }>
  defaultType: ProductType
  defaultStatus: ProductStatus
  pricing: {
    allowDecimal: boolean
    minPrice: number
    maxPrice: number
    defaultTaxRate: number
  }
  inventory: {
    track: boolean
    lowStockThreshold: number
    allowBackorder: boolean
  }
}

// Notification types
export type NotificationType = 
  | 'email'
  | 'sms'
  | 'telegram'
  | 'push'

export type NotificationTemplate = 
  | 'order_created'
  | 'order_confirmed'
  | 'order_completed'
  | 'payment_success'
  | 'payment_failed'

export type NotificationConfig = {
  providers: Record<NotificationType, {
    enabled: boolean
    credentials: Record<string, string>
  }>
  templates: Record<NotificationTemplate, {
    subject: string
    body: string
    variables: string[]
  }>
  defaults: {
    from: string
    replyTo: string
    language: SupportedLocale
  }
}
