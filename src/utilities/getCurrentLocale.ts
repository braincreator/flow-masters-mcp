import { cookies, headers } from 'next/headers'
import { SUPPORTED_LOCALES } from '@/constants'
import type { Locale } from '@/types'

export async function getCurrentLocale(): Promise<Locale> {
  try {
    // Get headers and cookies
    const headersList = await headers()
    const cookieStore = await cookies()

    // Try to get locale from headers (set by middleware)
    const xLocale = headersList.get('x-locale')
    if (xLocale && SUPPORTED_LOCALES.includes(xLocale as Locale)) {
      return xLocale as Locale
    }

    // Try to get locale from cookies
    const cookieLocale = cookieStore.get('locale')?.value
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale)) {
      return cookieLocale as Locale
    }

    // Try to get locale from pathname
    const xPathname = headersList.get('x-pathname')
    if (xPathname) {
      const pathLocale = xPathname.split('/')[1]
      if (pathLocale && SUPPORTED_LOCALES.includes(pathLocale as Locale)) {
        return pathLocale as Locale
      }
    }

    // Default fallback
    return 'ru'
  } catch (error) {
    // If we're on the client side or if headers/cookies are not available
    return 'ru'
  }
}
