import { getRequestConfig } from 'next-intl/server'
// import {LocalePathnames} from 'next-intl/navigation'; // Temporarily remove to avoid type error if not found

export const locales = ['en', 'ru'] as const
export type AppLocale = (typeof locales)[number] // Renamed to AppLocale to be distinct
export const defaultLocale: AppLocale = 'ru'

export const pathnames = {
  '/': '/',
  '/chat': '/chat',
  '/login': '/login',
  '/blog': '/blog',
  '/blog/[slug]': '/blog/[slug]',
  '/courses': '/courses',
  '/courses/[slug]': '/courses/[slug]',
  // Add other paths as needed
} // Removed 'satisfies LocalePathnames<typeof locales>' to simplify and rely on inference

export const localePrefix = 'always'

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is a string and validate it
  const validLocale = typeof locale === 'string' && locale ? locale : defaultLocale

  // The `locale` parameter from getRequestConfig is guaranteed to be a string
  // and one of your configured locales if your middleware is set up correctly.
  // We'll cast to AppLocale for type safety with our defined locales.
  const currentLocale = locales.includes(validLocale as AppLocale)
    ? (validLocale as AppLocale)
    : defaultLocale

  if (!locales.includes(validLocale as AppLocale)) {
    console.warn(
      `Unsupported locale: "${validLocale}". Falling back to default locale "${defaultLocale}".`,
    )
  }

  return {
    locale: currentLocale, // Ensure this is always a valid, non-undefined string from your locales
    messages: (await import(`./messages/${currentLocale}.json`)).default,
  }
})
