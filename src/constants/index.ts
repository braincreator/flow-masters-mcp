export const SUPPORTED_LOCALES = ['en', 'ru'] as const
export type Locale = typeof SUPPORTED_LOCALES[number]

export const DEFAULT_LOCALE: Locale = 'ru'

// Add other constants as needed
export const SITE_NAME = 'Your Site Name'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'