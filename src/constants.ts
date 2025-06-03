export const SUPPORTED_LOCALES = ['en', 'ru'] as const
export const DEFAULT_LOCALE = 'ru'
export type Locale = (typeof SUPPORTED_LOCALES)[number]

// Cache configuration
export const CACHE_REVALIDATE_SECONDS = 60 // Adjust this value based on your needs
