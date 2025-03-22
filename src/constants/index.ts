export const SUPPORTED_LOCALES = ['en', 'ru'] as const
export type Locale = typeof SUPPORTED_LOCALES[number]

export const DEFAULT_LOCALE: Locale = 'ru'

export const CACHE_REVALIDATE_SECONDS = 3600 // 1 hour

// Add other constants as needed
export const SITE_NAME = 'Your Site Name'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
