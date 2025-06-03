import { getRequestConfig } from 'next-intl/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/constants';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  if (!SUPPORTED_LOCALES.includes(locale as any)) {
    console.warn(`Unsupported locale: "${locale}". Using default locale "${DEFAULT_LOCALE}".`);
    locale = DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Europe/Moscow',
    now: new Date(),
  };
});
