/**
 * Утилиты для постепенной миграции на новую систему i18n
 * Позволяет плавно переходить с старой системы на новую
 */

import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale, i18nUtils } from '@/config/i18n'
import { logDebug, logWarn } from '@/utils/logger'

/**
 * Проверяет, является ли строка валидной локалью
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
}

/**
 * Получает валидную локаль с fallback на дефолтную
 */
export function getValidLocale(locale: string | undefined): SupportedLocale {
  if (!locale || !isValidLocale(locale)) {
    return DEFAULT_LOCALE
  }
  return locale
}

/**
 * Извлекает локаль из pathname (совместимо со старой системой)
 */
export function extractLocaleFromPath(pathname: string): {
  locale: SupportedLocale
  pathWithoutLocale: string
} {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (firstSegment && isValidLocale(firstSegment)) {
    return {
      locale: firstSegment,
      pathWithoutLocale: '/' + segments.slice(1).join('/')
    }
  }

  return {
    locale: DEFAULT_LOCALE,
    pathWithoutLocale: pathname
  }
}

/**
 * Создает локализованный URL (совместимо со старой системой)
 */
export function createLocalizedUrl(path: string, locale: SupportedLocale): string {
  // Убираем ведущий слэш если есть
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // Если это дефолтная локаль и путь пустой, возвращаем корень
  if (locale === DEFAULT_LOCALE && !cleanPath) {
    return '/'
  }
  
  return `/${locale}${cleanPath ? `/${cleanPath}` : ''}`
}

/**
 * Получает локаль из различных источников (для совместимости)
 */
export function getLocaleFromSources(sources: {
  pathname?: string
  cookie?: string
  header?: string
  fallback?: SupportedLocale
}): SupportedLocale {
  const { pathname, cookie, header, fallback = DEFAULT_LOCALE } = sources

  // 1. Проверяем pathname
  if (pathname) {
    const { locale } = extractLocaleFromPath(pathname)
    if (locale !== DEFAULT_LOCALE) {
      logDebug('Locale from pathname:', locale)
      return locale
    }
  }

  // 2. Проверяем cookie
  if (cookie && isValidLocale(cookie)) {
    logDebug('Locale from cookie:', cookie)
    return cookie
  }

  // 3. Проверяем Accept-Language header
  if (header) {
    const preferredLocale = parseAcceptLanguage(header)
    if (preferredLocale) {
      logDebug('Locale from header:', preferredLocale)
      return preferredLocale
    }
  }

  // 4. Fallback
  logDebug('Using fallback locale:', fallback)
  return fallback
}

/**
 * Парсит Accept-Language заголовок
 */
function parseAcceptLanguage(acceptLanguage: string): SupportedLocale | null {
  try {
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [language, quality] = lang.trim().split(';q=')
        return {
          lang: language.toLowerCase(),
          quality: quality ? parseFloat(quality) : 1.0
        }
      })
      .sort((a, b) => b.quality - a.quality)

    for (const { lang } of languages) {
      // Проверяем точное совпадение
      if (isValidLocale(lang)) {
        return lang
      }
      
      // Проверяем совпадение по языку (ru-RU -> ru)
      const langCode = lang.split('-')[0]
      if (isValidLocale(langCode)) {
        return langCode
      }
    }
  } catch (error) {
    logWarn('Failed to parse Accept-Language header:', error)
  }

  return null
}

/**
 * Миграционная обертка для компонентов
 * Позволяет постепенно переходить на новую систему
 */
export function withI18nMigration<T extends { locale?: string }>(
  Component: React.ComponentType<T>
) {
  return function I18nMigratedComponent(props: T) {
    const locale = getValidLocale(props.locale)
    
    return <Component {...props} locale={locale} />
  }
}

/**
 * Хук для получения текущей локали (для клиентских компонентов)
 */
export function useCurrentLocale(): SupportedLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  const pathname = window.location.pathname
  const { locale } = extractLocaleFromPath(pathname)
  
  return locale
}

/**
 * Утилиты для работы с переводами (совместимость со старой системой)
 */
export const translationUtils = {
  /**
   * Получает переведенное значение из объекта локализации
   */
  getLocalizedValue<T>(
    localizedObject: Record<string, T> | T,
    locale: SupportedLocale,
    fallbackLocale: SupportedLocale = DEFAULT_LOCALE
  ): T | undefined {
    if (!localizedObject || typeof localizedObject !== 'object') {
      return localizedObject as T
    }

    const obj = localizedObject as Record<string, T>
    
    // Пробуем получить значение для текущей локали
    if (obj[locale] !== undefined) {
      return obj[locale]
    }

    // Fallback на дефолтную локаль
    if (obj[fallbackLocale] !== undefined) {
      return obj[fallbackLocale]
    }

    // Возвращаем первое доступное значение
    const firstKey = Object.keys(obj)[0]
    return firstKey ? obj[firstKey] : undefined
  },

  /**
   * Создает локализованный объект
   */
  createLocalizedObject<T>(value: T, locale: SupportedLocale): Record<SupportedLocale, T> {
    return SUPPORTED_LOCALES.reduce((acc, loc) => {
      acc[loc] = value
      return acc
    }, {} as Record<SupportedLocale, T>)
  },

  /**
   * Проверяет, является ли объект локализованным
   */
  isLocalizedObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object') {
      return false
    }

    const keys = Object.keys(obj)
    return keys.length > 0 && keys.every(key => SUPPORTED_LOCALES.includes(key as SupportedLocale))
  }
}

/**
 * Константы для миграции
 */
export const MIGRATION_CONSTANTS = {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME: 'locale',
  LOCALE_HEADER_NAME: 'accept-language'
} as const

export default {
  isValidLocale,
  getValidLocale,
  extractLocaleFromPath,
  createLocalizedUrl,
  getLocaleFromSources,
  withI18nMigration,
  useCurrentLocale,
  translationUtils,
  MIGRATION_CONSTANTS
}
