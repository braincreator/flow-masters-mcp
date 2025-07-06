/**
 * Единая конфигурация интернационализации
 * Консолидирует все i18n настройки в одном месте
 */

import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { logDebug, logWarn, logError } from '@/utils/logger'

// Поддерживаемые локали
export const SUPPORTED_LOCALES = ['ru', 'en'] as const
export const DEFAULT_LOCALE = 'ru' as const

export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

// Проверка валидности локали
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
}

// Получение валидной локали с fallback
export function getValidLocale(locale: string | undefined): SupportedLocale {
  if (!locale || !isValidLocale(locale)) {
    return DEFAULT_LOCALE
  }
  return locale
}

// Кэш для сообщений
const messagesCache = new Map<string, any>()

// Загрузка сообщений с кэшированием
async function loadMessages(locale: SupportedLocale): Promise<any> {
  const cacheKey = `messages-${locale}`
  
  if (messagesCache.has(cacheKey)) {
    return messagesCache.get(cacheKey)
  }

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default
    messagesCache.set(cacheKey, messages)
    logDebug(`Loaded messages for locale: ${locale}`)
    return messages
  } catch (error) {
    logWarn(`Could not load messages for locale: ${locale}`, error)
    
    // Fallback к дефолтной локали
    if (locale !== DEFAULT_LOCALE) {
      try {
        const fallbackMessages = (await import(`../../messages/${DEFAULT_LOCALE}.json`)).default
        logDebug(`Using fallback messages for locale: ${locale}`)
        return fallbackMessages
      } catch (fallbackError) {
        logError('Failed to load fallback messages:', fallbackError)
      }
    }
    
    return {}
  }
}

// Основная конфигурация next-intl
export default getRequestConfig(async ({ locale }) => {
  // Валидация локали
  const validLocale = getValidLocale(locale)
  
  if (!isValidLocale(locale)) {
    logWarn(`Invalid locale requested: ${locale}, using fallback: ${validLocale}`)
  }

  // Загружаем сообщения
  const messages = await loadMessages(validLocale)

  return {
    locale: validLocale,
    messages,
    timeZone: 'Europe/Moscow',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        }
      },
      number: {
        currency: {
          style: 'currency',
          currency: validLocale === 'ru' ? 'RUB' : 'USD'
        }
      }
    }
  }
})

// Утилиты для работы с локалями
export const i18nUtils = {
  /**
   * Получает локаль из URL пути
   */
  getLocaleFromPath(pathname: string): SupportedLocale {
    const segments = pathname.split('/')
    const potentialLocale = segments[1]
    return getValidLocale(potentialLocale)
  },

  /**
   * Создает локализованный путь
   */
  createLocalizedPath(path: string, locale: SupportedLocale): string {
    // Убираем ведущий слэш если есть
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    
    // Если это дефолтная локаль и путь пустой, возвращаем корень
    if (locale === DEFAULT_LOCALE && !cleanPath) {
      return '/'
    }
    
    return `/${locale}${cleanPath ? `/${cleanPath}` : ''}`
  },

  /**
   * Удаляет локаль из пути
   */
  removeLocaleFromPath(pathname: string): string {
    const segments = pathname.split('/')
    if (segments.length > 1 && isValidLocale(segments[1])) {
      return '/' + segments.slice(2).join('/')
    }
    return pathname
  },

  /**
   * Получает альтернативные языковые ссылки для SEO
   */
  getAlternateLinks(pathname: string, baseUrl: string) {
    const pathWithoutLocale = this.removeLocaleFromPath(pathname)
    
    return SUPPORTED_LOCALES.map(locale => ({
      hrefLang: locale,
      href: `${baseUrl}${this.createLocalizedPath(pathWithoutLocale, locale)}`
    }))
  }
}

// Очистка кэша (для разработки)
export function clearMessagesCache() {
  messagesCache.clear()
  logDebug('Messages cache cleared')
}
