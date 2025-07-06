/**
 * Middleware для обработки интернационализации
 * Унифицированная обработка локалей и редиректов
 */

import { NextRequest, NextResponse } from 'next/server'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isValidLocale, getValidLocale } from '@/config/i18n'

// Пути, которые не требуют локализации
const EXCLUDED_PATHS = [
  '/api',
  '/admin',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/sw.js',
  '/workbox-',
  '/fonts',
  '/images',
  '/icons',
  '/metrika',
  '/vk-pixel',
  '/vk-ads'
]

// Проверка, нужно ли исключить путь из локализации
function shouldExcludePath(pathname: string): boolean {
  return EXCLUDED_PATHS.some(path => pathname.startsWith(path))
}

// Получение предпочитаемой локали из заголовков
function getPreferredLocale(request: NextRequest): string {
  // Проверяем cookie
  const cookieLocale = request.cookies.get('locale')?.value
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale
  }

  // Проверяем Accept-Language заголовок
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Простой парсинг Accept-Language
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
    
    for (const lang of languages) {
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
  }

  return DEFAULT_LOCALE
}

// Основная функция middleware для i18n
export function i18nMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  // Исключаем пути, которые не требуют локализации
  if (shouldExcludePath(pathname)) {
    return null
  }

  // Получаем сегменты пути
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  // Если первый сегмент - валидная локаль
  if (firstSegment && isValidLocale(firstSegment)) {
    // Путь уже содержит локаль, продолжаем
    return null
  }

  // Если это корневой путь или путь без локали
  const preferredLocale = getPreferredLocale(request)
  
  // Если предпочитаемая локаль - дефолтная, не добавляем её в URL
  if (preferredLocale === DEFAULT_LOCALE) {
    return null
  }

  // Редиректим на локализованный URL
  const newUrl = new URL(`/${preferredLocale}${pathname}`, request.url)
  
  // Сохраняем query параметры
  newUrl.search = request.nextUrl.search

  const response = NextResponse.redirect(newUrl)
  
  // Устанавливаем cookie с выбранной локалью
  response.cookies.set('locale', preferredLocale, {
    maxAge: 60 * 60 * 24 * 365, // 1 год
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  return response
}

// Утилиты для работы с локалями в middleware
export const i18nMiddlewareUtils = {
  /**
   * Извлекает локаль из pathname
   */
  extractLocale(pathname: string): { locale: string; pathWithoutLocale: string } {
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
  },

  /**
   * Проверяет, нужно ли обрабатывать путь
   */
  shouldProcess(pathname: string): boolean {
    return !shouldExcludePath(pathname)
  },

  /**
   * Создает ответ с установкой локали
   */
  createLocaleResponse(request: NextRequest, locale: string): NextResponse {
    const response = NextResponse.next()
    
    response.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 год
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return response
  }
}
