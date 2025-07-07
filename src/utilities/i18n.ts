import { headers } from 'next/headers'
import { getLocale as getNextIntlLocale } from 'next-intl/server'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Get locale from request
 * @param request Request object or undefined to get from headers()
 * @returns Locale string (default 'ru')
 */
export function getLocale(request?: Request): string {
  try {
    console.log('🌐 getLocale() called')

    // If request is provided, use it to extract locale
    if (request) {
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/').filter(Boolean)

      console.log('  Request URL:', request.url)
      console.log('  Path parts:', pathParts)

      // Check if the path has a language segment (typically the first segment after the leading slash)
      if (pathParts.length > 0 && pathParts[0]) {
        const possibleLocale = pathParts[0]
        console.log('  Possible locale from path:', possibleLocale)

        // Validate if it's a supported locale
        if (['ru', 'en'].includes(possibleLocale)) {
          console.log('  ✅ Using locale from path:', possibleLocale)
          return possibleLocale
        }
      }

      // Also check for locale in query params (for API routes)
      const localeParam = url.searchParams.get('locale')
      console.log('  Locale param from query:', localeParam)
      if (localeParam && ['ru', 'en'].includes(localeParam)) {
        console.log('  ✅ Using locale from query:', localeParam)
        return localeParam
      }
    }

    // Try to get locale from headers (only if request is provided)
    if (request) {
      const acceptLanguage = request.headers.get('accept-language')
      console.log('  Accept-Language header:', acceptLanguage)
      if (acceptLanguage) {
        // Parse Accept-Language header (e.g. "en-US,en;q=0.9,ru;q=0.8")
        const languages = acceptLanguage.split(',')

        for (const lang of languages) {
          const [language] = lang.trim().split(';')
          const code = language.split('-')[0]

          if (code === 'en') {
            console.log('  ✅ Using locale from headers: en')
            return 'en'
          }
          if (code === 'ru') {
            console.log('  ✅ Using locale from headers: ru')
            return 'ru'
          }
        }
      }
    } else {
      // Fallback to Next.js headers() only when request is not available
      try {
        const headersList = headers()
        const acceptLanguage = headersList.get('accept-language')
        console.log('  Accept-Language header (fallback):', acceptLanguage)
        if (acceptLanguage) {
          // Parse Accept-Language header (e.g. "en-US,en;q=0.9,ru;q=0.8")
          const languages = acceptLanguage.split(',')

          for (const lang of languages) {
            const [language] = lang.trim().split(';')
            const code = language.split('-')[0]

            if (code === 'en') {
              console.log('  ✅ Using locale from headers (fallback): en')
              return 'en'
            }
            if (code === 'ru') {
              console.log('  ✅ Using locale from headers (fallback): ru')
              return 'ru'
            }
          }
        }
      } catch (e) {
        console.log('  ⚠️ Could not access headers():', e)
      }
    }

    // Try to get locale from next-intl
    try {
      const nextIntlLocale = getNextIntlLocale()
      console.log('  Next-intl locale:', nextIntlLocale)
      return nextIntlLocale
    } catch (e) {
      console.log('  Next-intl not available:', e)
      // Fallback if next-intl is not configured
    }

    // Default to Russian
    console.log('  ⚠️ Using default locale: ru')
    return 'ru'
  } catch (error) {
    logError('Error getting locale:', error)
    return 'ru'
  }
}
