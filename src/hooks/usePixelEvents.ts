'use client'

import { useCallback } from 'react'

interface PixelEventData {
  value?: number
  currency?: string
  content_name?: string
  content_category?: string
  content_ids?: string[]
  num_items?: number
  [key: string]: any
}

interface UsePixelEventsReturn {
  trackEvent: (eventName: string, eventData?: PixelEventData, options?: {
    pixelTypes?: string[]
    page?: string
  }) => Promise<void>
  trackPurchase: (data: {
    value: number
    currency?: string
    orderId?: string
    items?: any[]
  }) => Promise<void>
  trackLead: (data?: {
    value?: number
    currency?: string
    content_name?: string
  }) => Promise<void>
  trackRegistration: (data?: {
    method?: string
    content_name?: string
  }) => Promise<void>
  trackAddToCart: (data: {
    value: number
    currency?: string
    content_name?: string
    content_ids?: string[]
  }) => Promise<void>
  trackViewContent: (data?: {
    content_name?: string
    content_category?: string
    content_ids?: string[]
    value?: number
    currency?: string
  }) => Promise<void>
  trackSearch: (data?: {
    search_string?: string
    content_category?: string
  }) => Promise<void>
  trackContact: (data?: {
    content_name?: string
  }) => Promise<void>
}

/**
 * Хук для отправки событий в пиксели аналитики и рекламы
 */
export function usePixelEvents(): UsePixelEventsReturn {
  const trackEvent = useCallback(async (
    eventName: string, 
    eventData: PixelEventData = {},
    options: {
      pixelTypes?: string[]
      page?: string
    } = {}
  ) => {
    try {
      // Отправляем событие через API
      const response = await fetch('/api/pixels/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName,
          eventData,
          pixelTypes: options.pixelTypes,
          page: options.page || getCurrentPage(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Выполняем полученные скрипты событий
        if (result.eventScripts && Array.isArray(result.eventScripts)) {
          result.eventScripts.forEach((script: string) => {
            try {
              // Безопасное выполнение скрипта
              const func = new Function(script)
              func()
            } catch (error) {
              console.warn('Failed to execute pixel event script:', error)
            }
          })
        }

        console.log(`Pixel event "${eventName}" sent to ${result.pixelsTriggered} pixels`)
      } else {
        console.error('Failed to send pixel event:', response.statusText)
      }
    } catch (error) {
      console.error('Error sending pixel event:', error)
    }
  }, [])

  const trackPurchase = useCallback(async (data: {
    value: number
    currency?: string
    orderId?: string
    items?: any[]
  }) => {
    await trackEvent('purchase', {
      value: data.value,
      currency: data.currency || 'RUB',
      content_ids: data.items?.map(item => item.id) || [],
      num_items: data.items?.length || 1,
      order_id: data.orderId,
    })
  }, [trackEvent])

  const trackLead = useCallback(async (data: {
    value?: number
    currency?: string
    content_name?: string
  } = {}) => {
    await trackEvent('lead', {
      value: data.value,
      currency: data.currency || 'RUB',
      content_name: data.content_name,
    })
  }, [trackEvent])

  const trackRegistration = useCallback(async (data: {
    method?: string
    content_name?: string
  } = {}) => {
    await trackEvent('registration', {
      method: data.method || 'email',
      content_name: data.content_name,
    })
  }, [trackEvent])

  const trackAddToCart = useCallback(async (data: {
    value: number
    currency?: string
    content_name?: string
    content_ids?: string[]
  }) => {
    await trackEvent('add_to_cart', {
      value: data.value,
      currency: data.currency || 'RUB',
      content_name: data.content_name,
      content_ids: data.content_ids || [],
    })
  }, [trackEvent])

  const trackViewContent = useCallback(async (data: {
    content_name?: string
    content_category?: string
    content_ids?: string[]
    value?: number
    currency?: string
  } = {}) => {
    await trackEvent('view_content', {
      content_name: data.content_name,
      content_category: data.content_category,
      content_ids: data.content_ids || [],
      value: data.value,
      currency: data.currency || 'RUB',
    })
  }, [trackEvent])

  const trackSearch = useCallback(async (data: {
    search_string?: string
    content_category?: string
  } = {}) => {
    await trackEvent('search', {
      search_string: data.search_string,
      content_category: data.content_category,
    })
  }, [trackEvent])

  const trackContact = useCallback(async (data: {
    content_name?: string
  } = {}) => {
    await trackEvent('contact', {
      content_name: data.content_name,
    })
  }, [trackEvent])

  return {
    trackEvent,
    trackPurchase,
    trackLead,
    trackRegistration,
    trackAddToCart,
    trackViewContent,
    trackSearch,
    trackContact,
  }
}

/**
 * Определяет текущую страницу для пикселей
 */
function getCurrentPage(): string {
  if (typeof window === 'undefined') return 'all'
  
  const pathname = window.location.pathname
  
  // Маппинг путей на типы страниц
  if (pathname === '/' || pathname === '/home') return 'home'
  if (pathname.startsWith('/products')) return 'products'
  if (pathname.startsWith('/services')) return 'services'
  if (pathname.startsWith('/blog') || pathname.startsWith('/posts')) return 'blog'
  if (pathname.startsWith('/contact')) return 'contacts'
  if (pathname.startsWith('/about')) return 'about'
  if (pathname.includes('checkout') || pathname.includes('payment')) return 'checkout'
  if (pathname.includes('thank') || pathname.includes('success')) return 'thank_you'
  
  return 'all'
}

/**
 * Хук для автоматического отслеживания просмотров страниц
 */
export function usePixelPageView() {
  const { trackEvent } = usePixelEvents()

  const trackPageView = useCallback(async (pageName?: string) => {
    await trackEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      content_name: pageName,
    })
  }, [trackEvent])

  return { trackPageView }
}
