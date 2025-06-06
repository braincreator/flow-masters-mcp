import { getRequestConfig } from 'next-intl/server'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/constants'

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is a string and validate it
  const validLocale = typeof locale === 'string' && locale ? locale : DEFAULT_LOCALE

  // Validate that the incoming locale is valid
  if (!SUPPORTED_LOCALES.includes(validLocale as any)) {
    console.warn(`Unsupported locale: "${validLocale}". Using default locale "${DEFAULT_LOCALE}".`)
    locale = DEFAULT_LOCALE
  } else {
    locale = validLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Europe/Moscow',
    now: new Date(),
  }
})
