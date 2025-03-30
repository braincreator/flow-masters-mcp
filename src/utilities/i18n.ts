import { headers } from 'next/headers'
import { getLocale as getNextIntlLocale } from 'next-intl/server'

/**
 * Get locale from request
 * @param request Request object or undefined to get from headers()
 * @returns Locale string (default 'ru')
 */
export function getLocale(request?: Request): string {
  try {
    // If request is provided, use it to extract locale
    if (request) {
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')

      // Check if the path has a language segment (typically the first segment after the leading slash)
      if (pathParts.length > 1 && pathParts[1]) {
        const possibleLocale = pathParts[1]

        // Validate if it's a supported locale
        if (['ru', 'en'].includes(possibleLocale)) {
          return possibleLocale
        }
      }

      // Also check for locale in query params (for API routes)
      const localeParam = url.searchParams.get('locale')
      if (localeParam && ['ru', 'en'].includes(localeParam)) {
        return localeParam
      }
    }

    // Try to get locale from headers
    const headersList = headers()
    const acceptLanguage = headersList.get('accept-language')
    if (acceptLanguage) {
      // Parse Accept-Language header (e.g. "en-US,en;q=0.9,ru;q=0.8")
      const languages = acceptLanguage.split(',')

      for (const lang of languages) {
        const [language] = lang.trim().split(';')
        const code = language.split('-')[0]

        if (code === 'en') return 'en'
        if (code === 'ru') return 'ru'
      }
    }

    // Try to get locale from next-intl
    try {
      return getNextIntlLocale()
    } catch (e) {
      // Fallback if next-intl is not configured
    }

    // Default to Russian
    return 'ru'
  } catch (error) {
    console.error('Error getting locale:', error)
    return 'ru'
  }
}
