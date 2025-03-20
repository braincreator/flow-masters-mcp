import { cookies, headers } from 'next/headers'

export type Locale = 'en' | 'ru'
const DEFAULT_LOCALE: Locale = 'ru'
const SUPPORTED_LOCALES: Locale[] = ['en', 'ru']

export async function getCurrentLocale(): Promise<Locale> {
  // Try to get locale from headers (set by middleware)
  const headersList = headers()
  const xLocale = headersList.get('x-locale')
  if (xLocale && SUPPORTED_LOCALES.includes(xLocale as Locale)) {
    return xLocale as Locale
  }

  // Try to get locale from cookies
  const cookieStore = cookies()
  const cookieLocale = cookieStore.get('locale')?.value
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale
  }

  // Try to get locale from pathname
  const pathname = headersList.get('x-pathname') || ''
  const pathLocale = pathname.split('/')[1]
  if (pathLocale && SUPPORTED_LOCALES.includes(pathLocale as Locale)) {
    return pathLocale as Locale
  }

  // Fallback to default locale
  return DEFAULT_LOCALE
}

export function setLocale(locale: Locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Unsupported locale: ${locale}`)
  }
  document.cookie = `locale=${locale};path=/;max-age=31536000` // 1 year
}
