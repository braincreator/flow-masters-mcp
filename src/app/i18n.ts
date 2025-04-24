import { getRequestConfig } from 'next-intl/server'

// Define locales directly in this file
const locales = ['en', 'ru'] as const

// This file is used by next-intl to configure internationalization
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid and ensure it's a string
  let localeToUse = typeof locale === 'string' ? locale : 'ru'

  if (!locales.includes(localeToUse as any)) {
    localeToUse = 'ru'
  }

  // Load messages for the requested locale
  let messages
  try {
    messages = (await import(`../messages/${localeToUse}.json`)).default
  } catch (error) {
    // If the messages file is not found, use an empty object
    console.warn(`Could not load messages for locale: ${localeToUse}`, error)
    messages = {}
  }

  return {
    locale: localeToUse,
    messages,
    timeZone: 'Europe/Moscow',
    now: new Date(),
  }
})
