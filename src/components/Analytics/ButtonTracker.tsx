'use client'

import { useEffect } from 'react'
import { usePixelEvents } from '@/hooks/usePixelEvents'

interface ButtonTrackerProps {
  selector?: string
  eventName?: string
  eventData?: Record<string, any>
  trackClicks?: boolean
  trackOutboundLinks?: boolean
}

/**
 * Компонент для автоматического отслеживания кликов по кнопкам и ссылкам
 */
export default function ButtonTracker({
  selector = '[data-track]',
  eventName = 'button_click',
  eventData = {},
  trackClicks = true,
  trackOutboundLinks = true,
}: ButtonTrackerProps) {
  const { trackEvent } = usePixelEvents()

  useEffect(() => {
    if (!trackClicks && !trackOutboundLinks) return

    const handleClick = async (event: Event) => {
      const target = event.target as HTMLElement
      const clickedElement = target.closest('button, a, [data-track]') as HTMLElement

      if (!clickedElement) return

      // Отслеживание кликов по элементам с data-track
      if (trackClicks && clickedElement.matches(selector)) {
        const trackData = {
          element_type: clickedElement.tagName.toLowerCase(),
          element_text: clickedElement.textContent?.trim() || '',
          element_id: clickedElement.id || '',
          element_class: clickedElement.className || '',
          ...eventData,
        }

        // Получаем дополнительные данные из data-атрибутов
        const dataAttributes = clickedElement.dataset
        Object.keys(dataAttributes).forEach(key => {
          if (key.startsWith('track')) {
            const eventKey = key.replace('track', '').toLowerCase()
            trackData[eventKey] = dataAttributes[key]
          }
        })

        await trackEvent(eventName, trackData)
      }

      // Отслеживание внешних ссылок
      if (trackOutboundLinks && clickedElement.tagName === 'A') {
        const link = clickedElement as HTMLAnchorElement
        const href = link.href

        if (href && isOutboundLink(href)) {
          await trackEvent('outbound_link_click', {
            link_url: href,
            link_text: link.textContent?.trim() || '',
            link_domain: new URL(href).hostname,
            ...eventData,
          })
        }
      }

      // Отслеживание кликов по кнопкам CTA
      if (clickedElement.matches('.cta-button, [data-cta], .btn-primary')) {
        await trackEvent('cta_click', {
          cta_text: clickedElement.textContent?.trim() || '',
          cta_id: clickedElement.id || '',
          cta_position: getCTAPosition(clickedElement),
          ...eventData,
        })
      }

      // Отслеживание кликов по кнопкам "Купить"
      if (clickedElement.matches('[data-buy], .buy-button, .purchase-btn')) {
        await trackEvent('purchase_intent', {
          button_text: clickedElement.textContent?.trim() || '',
          button_id: clickedElement.id || '',
          ...eventData,
        })
      }

      // Отслеживание кликов по номерам телефонов
      if (clickedElement.matches('a[href^="tel:"]')) {
        await trackEvent('phone_click', {
          phone_number: link.href.replace('tel:', ''),
          link_text: clickedElement.textContent?.trim() || '',
          ...eventData,
        })
      }

      // Отслеживание кликов по email
      if (clickedElement.matches('a[href^="mailto:"]')) {
        await trackEvent('email_click', {
          email: link.href.replace('mailto:', ''),
          link_text: clickedElement.textContent?.trim() || '',
          ...eventData,
        })
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [selector, eventName, eventData, trackClicks, trackOutboundLinks, trackEvent])

  return null // Компонент невидимый
}

/**
 * Проверяет, является ли ссылка внешней
 */
function isOutboundLink(href: string): boolean {
  try {
    const url = new URL(href)
    const currentDomain = window.location.hostname
    return url.hostname !== currentDomain && !url.hostname.includes(currentDomain)
  } catch {
    return false
  }
}

/**
 * Определяет позицию CTA кнопки на странице
 */
function getCTAPosition(element: HTMLElement): string {
  const rect = element.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  
  if (rect.top < viewportHeight * 0.3) {
    return 'top'
  } else if (rect.top < viewportHeight * 0.7) {
    return 'middle'
  } else {
    return 'bottom'
  }
}

/**
 * Компонент для отслеживания скролла страницы
 */
export function ScrollTracker() {
  const { trackEvent } = usePixelEvents()

  useEffect(() => {
    let scrollDepths = [25, 50, 75, 90, 100]
    let trackedDepths = new Set<number>()

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100)

      scrollDepths.forEach(depth => {
        if (scrollPercent >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth)
          trackEvent('scroll_depth', {
            scroll_depth: depth,
            page_url: window.location.href,
            page_title: document.title,
          })
        }
      })
    }

    const throttledScroll = throttle(handleScroll, 500)
    window.addEventListener('scroll', throttledScroll)
    
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [trackEvent])

  return null
}

/**
 * Компонент для отслеживания времени на странице
 */
export function TimeTracker() {
  const { trackEvent } = usePixelEvents()

  useEffect(() => {
    const startTime = Date.now()
    let timeThresholds = [30, 60, 120, 300] // секунды
    let trackedThresholds = new Set<number>()

    const checkTimeSpent = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      
      timeThresholds.forEach(threshold => {
        if (timeSpent >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold)
          trackEvent('time_on_page', {
            time_threshold: threshold,
            page_url: window.location.href,
            page_title: document.title,
          })
        }
      })
    }

    const interval = setInterval(checkTimeSpent, 10000) // проверяем каждые 10 секунд

    // Отслеживаем уход со страницы
    const handleBeforeUnload = () => {
      const totalTime = Math.round((Date.now() - startTime) / 1000)
      trackEvent('page_exit', {
        time_on_page: totalTime,
        page_url: window.location.href,
        page_title: document.title,
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [trackEvent])

  return null
}

/**
 * Утилита для throttling функций
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Комплексный трекер для всех взаимодействий
 */
export function InteractionTracker() {
  return (
    <>
      <ButtonTracker />
      <ScrollTracker />
      <TimeTracker />
    </>
  )
}
