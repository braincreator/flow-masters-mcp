'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import PixelManager from '@/components/PixelManager'
import CookieConsent, { useCookieConsent } from '@/components/CookieConsent'
import { usePixelPageView } from '@/hooks/usePixelEvents'
import { InteractionTracker } from '@/components/Analytics/ButtonTracker'

interface AnalyticsLayoutProps {
  children: React.ReactNode
}

/**
 * Layout компонент для интеграции аналитики и пикселей
 * Автоматически загружает пиксели и отслеживает просмотры страниц
 */
export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  const pathname = usePathname()
  const { consent, updateConsent } = useCookieConsent()
  const { trackPageView } = usePixelPageView()
  const [currentPage, setCurrentPage] = useState('all')

  // Определяем тип текущей страницы
  useEffect(() => {
    const page = determinePageType(pathname)
    setCurrentPage(page)
  }, [pathname])

  // Отслеживаем просмотры страниц при изменении маршрута
  useEffect(() => {
    if (consent?.analytics || consent?.marketing) {
      // Небольшая задержка для загрузки пикселей
      const timer = setTimeout(() => {
        trackPageView(currentPage)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [pathname, consent, currentPage, trackPageView])

  const handleConsentChange = (newConsent: any) => {
    updateConsent(newConsent)
    
    // Если пользователь дал согласие на аналитику, отслеживаем текущую страницу
    if (newConsent.analytics || newConsent.marketing) {
      setTimeout(() => {
        trackPageView(currentPage)
      }, 1000)
    }
  }

  // Определяем, нужно ли загружать пиксели
  const shouldLoadPixels = consent && (
    consent.analytics || 
    consent.marketing || 
    consent.preferences
  )

  return (
    <>
      {children}

      {/* Пиксели загружаются только при наличии согласия */}
      {shouldLoadPixels && (
        <PixelManager
          currentPage={currentPage}
          userConsent={true}
        />
      )}

      {/* Автоматическое отслеживание взаимодействий */}
      {shouldLoadPixels && <InteractionTracker />}

      {/* Баннер согласия на cookies */}
      <CookieConsent onConsentChange={handleConsentChange} />
    </>
  )
}

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

/**
 * Хук для отслеживания событий конверсии
 */
export function useConversionTracking() {
  const { consent } = useCookieConsent()

  const trackConversion = async (
    conversionType: 'lead' | 'purchase' | 'registration' | 'contact',
    data: any = {}
  ) => {
    if (!consent?.marketing) return

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
              console.warn('Failed to execute conversion script:', error)
            }
          })
        }

        console.log(`Conversion "${conversionType}" tracked in ${result.pixelsTriggered} pixels`)
      }
    } catch (error) {
      console.error('Error tracking conversion:', error)
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
