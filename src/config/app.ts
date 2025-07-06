/**
 * Centralized application configuration
 */

// Environment variables with validation
const requiredEnvVars = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  DATABASE_URI: process.env.DATABASE_URI || 'mongodb://localhost:27017/flowmasters',
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'your-secret-here',
} as const

// Optional environment variables
const optionalEnvVars = {
  NEXT_PUBLIC_YANDEX_METRIKA_ID: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
  NEXT_PUBLIC_YANDEX_METRIKA_USE_ALTERNATIVE_CDN: process.env.NEXT_PUBLIC_YANDEX_METRIKA_USE_ALTERNATIVE_CDN,
  NEXT_PUBLIC_YANDEX_METRIKA_CDN_URL: process.env.NEXT_PUBLIC_YANDEX_METRIKA_CDN_URL,
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
  NEXT_PUBLIC_FACEBOOK_PIXEL_ID: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_BUCKET: process.env.AWS_BUCKET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_BUCKET: process.env.AWS_BUCKET,

} as const

// Validate required environment variables
const validateEnv = () => {
  const missing = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value || value === 'your-secret-here')
    .map(([key]) => key)

  if (missing.length > 0 && requiredEnvVars.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return true
}

// Validate environment on import
validateEnv()

// Application configuration
export const appConfig = {
  // Environment
  env: requiredEnvVars.NODE_ENV,
  isDevelopment: requiredEnvVars.NODE_ENV === 'development',
  isProduction: requiredEnvVars.NODE_ENV === 'production',
  isTest: requiredEnvVars.NODE_ENV === 'test',

  // Site information
  site: {
    name: 'FlowMasters',
    title: 'FlowMasters - AI-Powered Business Automation',
    description: 'Автоматизация бизнес-процессов с помощью ИИ. Создаем умные решения для вашего бизнеса.',
    url: requiredEnvVars.NEXT_PUBLIC_SITE_URL,
    logo: '/images/logo.png',
    favicon: '/favicon.ico',
    ogImage: '/images/og-default.jpg',
  },

  // Database
  database: {
    uri: requiredEnvVars.DATABASE_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // Payload CMS
  payload: {
    secret: requiredEnvVars.PAYLOAD_SECRET,
    adminPath: '/admin',
    serverURL: requiredEnvVars.NEXT_PUBLIC_SITE_URL,
  },

  // Analytics
  analytics: {
    yandexMetrika: optionalEnvVars.NEXT_PUBLIC_YANDEX_METRIKA_ID,
    yandexMetrikaUseAlternativeCDN: optionalEnvVars.NEXT_PUBLIC_YANDEX_METRIKA_USE_ALTERNATIVE_CDN === 'true',
    yandexMetrikaCdnUrl: optionalEnvVars.NEXT_PUBLIC_YANDEX_METRIKA_CDN_URL,
    googleAnalytics: optionalEnvVars.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    facebookPixel: optionalEnvVars.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
  },

  // Email configuration
  email: {
    smtp: {
      host: optionalEnvVars.SMTP_HOST,
      port: optionalEnvVars.SMTP_PORT ? parseInt(optionalEnvVars.SMTP_PORT) : 587,
      user: optionalEnvVars.SMTP_USER,
      pass: optionalEnvVars.SMTP_PASS,
    },
    from: {
      name: 'FlowMasters',
      email: 'noreply@flow-masters.ru',
    },
    templates: {
      contact: 'contact-form',
      serviceRequest: 'service-request',
      newsletter: 'newsletter-welcome',
    },
  },

  // File storage
  storage: {
    provider: 'local', // 'local' | 'aws' | 'cloudinary'
    local: {
      uploadDir: './uploads',
      publicPath: '/uploads',
    },
    aws: {
      accessKeyId: optionalEnvVars.AWS_ACCESS_KEY_ID,
      secretAccessKey: optionalEnvVars.AWS_SECRET_ACCESS_KEY,
      region: optionalEnvVars.AWS_REGION || 'eu-west-1',
      bucket: optionalEnvVars.AWS_BUCKET,
    },
  },

  // API configuration
  api: {
    baseUrl: `${requiredEnvVars.NEXT_PUBLIC_SITE_URL}/api`,
    timeout: 30000,
    retries: 3,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  // Security
  security: {
    cors: {
      origin: requiredEnvVars.NODE_ENV === 'production' 
        ? [requiredEnvVars.NEXT_PUBLIC_SITE_URL]
        : true,
      credentials: true,
    },
    csrf: {
      enabled: requiredEnvVars.NODE_ENV === 'production',
    },
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },

  // Internationalization
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
    localeDetection: true,
  },

  // Features flags
  features: {
    analytics: true,
    newsletter: true,
    blog: true,
    ecommerce: false,
    multiLanguage: true,
    darkMode: true,
    search: true,
  },

  // Cache configuration
  cache: {
    ttl: {
      static: 60 * 60 * 24, // 24 hours
      dynamic: 60 * 5, // 5 minutes
      api: 60, // 1 minute
    },
    redis: {
      enabled: false,
      url: process.env.REDIS_URL,
    },
  },

  // Logging
  logging: {
    level: requiredEnvVars.NODE_ENV === 'production' ? 'info' : 'debug',
    format: 'json',
    destinations: {
      console: true,
      file: requiredEnvVars.NODE_ENV === 'production',
      external: false, // Sentry, LogRocket, etc.
    },
  },

  // Performance
  performance: {
    enableCompression: true,
    enableCaching: true,
    imageOptimization: true,
    bundleAnalyzer: process.env.ANALYZE === 'true',
  },

  // Social media
  social: {
    telegram: 'https://t.me/flowmasters',
    github: 'https://github.com/flowmasters',
    linkedin: 'https://www.linkedin.com/in/braincreator',
    tenchat: 'https://tenchat.ru/BrainCoder?utm_source=cc3e9af7-cdae-4780-b03a-be550424b55a',
  },

  // Contact information
  contact: {
    email: 'hello@flow-masters.ru',
    phone: '+7 (XXX) XXX-XX-XX',
    address: 'Москва, Россия',
    workingHours: 'Пн-Пт 9:00-18:00 МСК',
  },

  // Business information
  business: {
    name: 'ООО "ФлоуМастерс"',
    inn: 'XXXXXXXXXX',
    kpp: 'XXXXXXXXX',
    ogrn: 'XXXXXXXXXXXXX',
    address: 'Москва, ул. Примерная, д. 1',
  },
} as const

// Type for the configuration
export type AppConfig = typeof appConfig

// Helper functions
export const getApiUrl = (endpoint: string) => {
  return `${appConfig.api.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

export const getAssetUrl = (path: string) => {
  return `${appConfig.site.url}${path.startsWith('/') ? path : `/${path}`}`
}

export const isFeatureEnabled = (feature: keyof typeof appConfig.features) => {
  return appConfig.features[feature]
}

export const getLocaleUrl = (locale: string, path: string = '') => {
  const basePath = locale === appConfig.i18n.defaultLocale ? '' : `/${locale}`
  return `${appConfig.site.url}${basePath}${path}`
}

// Export individual configurations for convenience
export const {
  site,
  database,
  payload,
  analytics,
  email,
  storage,
  api,
  security,
  i18n,
  features,
  cache,
  logging,
  performance,
  social,
  contact,
  business,
} = appConfig

export default appConfig
