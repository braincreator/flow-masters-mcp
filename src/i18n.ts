import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/constants'

// Этот файл используется для настройки next-intl
// Он экспортирует функцию getRequestConfig, которая вызывается для каждого запроса

export default getRequestConfig(async ({ locale }) => {
  // Проверяем, поддерживается ли локаль
  if (!SUPPORTED_LOCALES.includes(locale as any)) {
    notFound()
  }

  // Загружаем сообщения для текущей локали
  let messages
  try {
    messages = (await import(`../messages/${locale}.json`)).default
  } catch (error) {
    // Если файл с сообщениями не найден, используем пустой объект
    console.warn(`Could not load messages for locale: ${locale}`, error)
    messages = {}
  }

  return {
    locale,
    messages,
    timeZone: 'Europe/Moscow',
    now: new Date(),
  }
})
