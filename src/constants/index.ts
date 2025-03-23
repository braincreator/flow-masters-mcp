import type {
  SupportedLocale,
  LocaleConfig,
  CollectionSlug,
  GlobalSlug,
  MediaConfig,
  UploadConfig,
  DatabaseConnectionConfig,
  CacheConfig,
  ApiRoutes,
  ApiHeaders,
  HttpMethod,
  ErrorMessage,
} from '@/types/constants'

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'ru']

export const LOCALE_CONFIG: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: 'en',
    label: 'English',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  },
  ru: {
    code: 'ru',
    label: 'Русский',
    dateFormat: 'DD.MM.YYYY',
    currency: 'RUB',
  },
} as const

export const DEFAULT_LOCALE: SupportedLocale = 'ru'

export const CACHE_REVALIDATE_SECONDS = 3600 // 1 hour

export const SITE_NAME = 'Flow Masters'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Collection slugs
export const COLLECTIONS: Record<string, CollectionSlug> = {
  CATEGORIES: 'categories',
  MEDIA: 'media',
  PAGES: 'pages',
  POSTS: 'posts',
  FORMS: 'forms',
  FORM_SUBMISSIONS: 'form-submissions',
  SEARCH: 'search',
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SOLUTIONS: 'solutions',
} as const

// Global slugs
export const GLOBALS: Record<string, GlobalSlug> = {
  HEADER: 'header',
  FOOTER: 'footer',
  SITE_CONFIG: 'site-config',
} as const

// API Routes
export const API_ROUTES: ApiRoutes = {
  REVALIDATE: '/api/revalidate',
  SEED: '/api/seed',
  PRODUCTS: {
    ADD: '/api/add-products',
    DOWNLOAD: '/api/download-product',
  },
  PAYMENT: {
    VALIDATE_DISCOUNT: '/api/validate-discount',
  },
} as const

// Cache tags
export const CACHE_TAGS = {
  POSTS: 'posts',
  PAGES: 'pages',
  SITE_CONFIG: 'site-config',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
} as const

// Site URLs
export const SITE_URL = 
  process.env.NEXT_PUBLIC_SERVER_URL || 
  process.env.VERCEL_PROJECT_PRODUCTION_URL || 
  'https://example.com'

// Media config
export const MEDIA_CONFIG: MediaConfig = {
  MAX_FILE_SIZE: 10000000, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  IMAGE_SIZES: {
    THUMBNAIL: {
      width: 300,
      height: 300,
    },
    SQUARE: {
      width: 500,
      height: 500,
      crop: 'center',
    },
    SMALL: {
      width: 600,
    },
    MEDIUM: {
      width: 900,
    },
    LARGE: {
      width: 1400,
    },
    XLARGE: {
      width: 1920,
    },
    OG: {
      width: 1200,
      height: 630,
      crop: 'center',
    },
  },
} as const

// Upload config
export const UPLOAD_CONFIG: UploadConfig = {
  LIMITS: {
    FILE_SIZE: 10000000, // 10MB
    MAX_FILES: 10,
  },
  PATHS: {
    TEMP: '/tmp',
  },
  IMAGE: {
    MAX_CONCURRENCY: 4,
    MAX_MEMORY_PER_TASK: 512,
  },
  ALLOWED_MIME_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword'],
    ARCHIVE: ['application/zip', 'application/x-rar-compressed'],
  },
} as const

// Database config
export const DATABASE_CONFIG: { CONNECTION: DatabaseConnectionConfig } = {
  CONNECTION: {
    directConnection: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
    w: 'majority',
    maxPoolSize: 10,
    minPoolSize: 1,
  },
} as const

// Cache config
export const CACHE_CONFIG: CacheConfig = {
  MAX_ITEMS: 500,
  MAX_AGE: CACHE_REVALIDATE_SECONDS * 1000,
  UPDATE_AGE_ON_GET: true,
} as const

// API Headers
export const API_HEADERS: ApiHeaders = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  LOCALE: 'x-locale',
} as const

// HTTP Methods
export const HTTP_METHODS: Record<string, HttpMethod> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const

// Error messages
export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Unauthorized access',
    statusCode: 401,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Resource not found',
    statusCode: 404,
  },
  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    message: 'Invalid request',
    statusCode: 400,
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Internal server error',
    statusCode: 500,
  },
} as const
