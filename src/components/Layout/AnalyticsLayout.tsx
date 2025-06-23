'use client'

import { useEffect, useState, useMemo, memo } from 'react'
import { usePathname } from 'next/navigation'
import PixelManager from '@/components/PixelManager'
import { PixelDebug } from '@/components/PixelManager/PixelDebug'
import { usePixelPageView } from '@/hooks/usePixelEvents'
import { InteractionTracker } from '@/components/Analytics/ButtonTracker'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { useIsClient, useClientEnv } from '@/hooks/useIsClient'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

/**
 * Определяет тип страницы на основе pathname
 */
function determinePageType(pathname: string): string {
  // Главная страница
  if (pathname === '/' || pathname === '/home') {
    return 'home'
  }

  // Страницы продуктов и услуг
  if (pathname.startsWith('/products') || pathname.includes('product')) {
    return 'products'
  }

  if (pathname.startsWith('/services') || pathname.includes('service')) {
    return 'services'
  }

  // Блог и статьи
  if (pathname.startsWith('/blog') || pathname.startsWith('/posts') || pathname.includes('article')) {
    return 'blog'
  }

  // Контакты
  if (pathname.startsWith('/contact') || pathname.includes('contact')) {
    return 'contacts'
  }

  // О нас
  if (pathname.startsWith('/about') || pathname.includes('about')) {
    return 'about'
  }

  // Формы
  if (pathname.includes('form') || pathname.includes('application')) {
    return 'forms'
  }

  // Оплата и заказы
  if (pathname.includes('checkout') || pathname.includes('payment') || pathname.includes('order')) {
    return 'checkout'
  }

  // Страницы благодарности
  if (pathname.includes('thank') || pathname.includes('success') || pathname.includes('complete')) {
    return 'thank_you'
  }

  // Курсы и обучение
  if (pathname.includes('course') || pathname.includes('training') || pathname.includes('education')) {
    return 'courses'
  }

  // Лендинги
  if (pathname.includes('landing') || pathname.includes('promo')) {
    return 'landing'
  }

  // По умолчанию
  return 'all'
}

interface AnalyticsLayoutProps {
  children: React.ReactNode
}

/**
 * Layout компонент для интеграции аналитики и пикселей
 * Автоматически загружает пиксели и отслеживает просмотры страниц
 */
const AnalyticsLayout = memo(function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  const pathname = usePathname()
  const { trackPageView } = usePixelPageView()
  const { hasAnalytics, hasMarketing, hasPreferences } = useCookieConsent()

  // SSR-safe hooks
  const isClient = useIsClient()
  const env = useClientEnv()

  // Мемоизируем определение типа страницы
  const currentPage = useMemo(() => determinePageType(pathname), [pathname])

  // Отслеживаем просмотры страниц при изменении маршрута
  useEffect(() => {
    if (hasAnalytics || hasMarketing) {
      // Небольшая задержка для загрузки пикселей
      const timer = setTimeout(() => {
        trackPageView(currentPage)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [pathname, hasAnalytics, hasMarketing, currentPage, trackPageView])

  // Мемоизируем определение загрузки пикселей (SSR-safe)
  const shouldLoadPixels = useMemo(() => {
    // Не загружаем на сервере
    if (!isClient) return false

    // 🚀 ПРИНУДИТЕЛЬНЫЙ РЕЖИМ - загружаем всегда
    if (env.NEXT_PUBLIC_FORCE_LOAD_PIXELS === 'true') {
      console.log('🚀 FORCE MODE: Loading all pixels regardless of consent')
      return true
    }

    // В development режиме всегда загружаем для тестирования
    if (env.NODE_ENV === 'development') return true

    // В production проверяем согласие
    return hasAnalytics || hasMarketing || hasPreferences
  }, [isClient, env.NEXT_PUBLIC_FORCE_LOAD_PIXELS, env.NODE_ENV, hasAnalytics, hasMarketing, hasPreferences])

  return (
    <>
      {children}

      {/* Пиксели загружаются только при наличии согласия */}
      {shouldLoadPixels && (
        <PixelManager
          currentPage={currentPage}
          userConsent={true}
          forceLoad={env.NEXT_PUBLIC_FORCE_LOAD_PIXELS === 'true'}
        />
      )}

      {/* Автоматическое отслеживание взаимодействий */}
      {shouldLoadPixels && <InteractionTracker />}

      {/* Отладочная панель пикселей (только в development) */}
      {isClient && env.NODE_ENV === 'development' && <PixelDebug />}
    </>
  )
})


/**
 * Хук для отслеживания событий конверсии
 */
export function useConversionTracking() {
  const { hasMarketing } = useCookieConsent()

  const trackConversion = async (
    conversionType: 'lead' | 'purchase' | 'registration' | 'contact',
    data: any = {}
  ) => {
    if (!hasMarketing) return

    try {
      // Отправляем событие конверсии в пиксели
      const response = await fetch('/api/pixels/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: conversionType,
          eventData: data,
          page: determinePageType(window.location.pathname),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Выполняем скрипты событий
        if (result.eventScripts) {
          result.eventScripts.forEach((script: string) => {
            try {
              const func = new Function(script)
              func()
            } catch (error) {
              logWarn('Failed to execute conversion script:', error)
            }
          })
        }

        logInfo(`Conversion "${conversionType}" tracked in ${result.pixelsTriggered} pixels`)
      }
    } catch (error) {
      logError('Error tracking conversion:', error)
    }
  }

  return { trackConversion }
}

/**
 * Компонент для отслеживания конверсий на странице
 */
export function ConversionTracker({ 
  conversionType, 
  conversionData,
  trigger = 'mount' 
}: {
  conversionType: 'lead' | 'purchase' | 'registration' | 'contact'
  conversionData?: any
  trigger?: 'mount' | 'manual'
}) {
  const { trackConversion } = useConversionTracking()

  useEffect(() => {
    if (trigger === 'mount') {
      // Небольшая задержка для загрузки пикселей
      const timer = setTimeout(() => {
        trackConversion(conversionType, conversionData)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [conversionType, conversionData, trigger, trackConversion])

  return null // Компонент невидимый
}

export default AnalyticsLayout
