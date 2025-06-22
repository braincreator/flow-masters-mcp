// Основные компоненты отслеживания
export {
  TrackableButton,
  TrackableLink,
  TrackableForm,
  VisibilityTracker,
  withTracking,
} from './TrackableButton'

// Готовые компоненты для быстрого использования
export {
  CTAButton,
  BuyButton,
  ContactButton,
  LeadForm,
} from './TrackableButton'

// Компоненты для автоматического отслеживания
export { default as FormTracker, useFormTracking } from './FormTracker'
export {
  default as ButtonTracker,
  ScrollTracker,
  TimeTracker,
  InteractionTracker,
} from './ButtonTracker'

// Хуки
export { usePixelEvents, usePixelPageView } from '@/hooks/usePixelEvents'

// Типы
export type {
  TrackableButtonProps,
  TrackableLinkProps,
  TrackableFormProps,
} from './TrackableButton'

// Утилиты для отслеживания
export const trackingUtils = {
  /**
   * Создает уникальный ID для отслеживания
   */
  generateTrackingId: (prefix = 'track') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Форматирует данные события для отправки
   */
  formatEventData: (data: Record<string, any>) => {
    return {
      timestamp: new Date().toISOString(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      page_title: typeof window !== 'undefined' ? document.title : '',
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
      ...data,
    }
  },

  /**
   * Проверяет, поддерживается ли отслеживание в текущем браузере
   */
  isTrackingSupported: () => {
    return typeof window !== 'undefined' && 
           typeof fetch !== 'undefined' && 
           !navigator.doNotTrack
  },

  /**
   * Получает информацию о текущей странице
   */
  getPageInfo: () => {
    if (typeof window === 'undefined') return {}
    
    return {
      url: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      title: document.title,
      referrer: document.referrer,
    }
  },

  /**
   * Определяет тип устройства
   */
  getDeviceType: () => {
    if (typeof window === 'undefined') return 'unknown'
    
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  },
}

// Константы для событий
export const TRACKING_EVENTS = {
  // Основные события
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  LINK_CLICK: 'link_click',
  FORM_SUBMIT: 'form_submit',
  
  // Конверсии
  PURCHASE: 'purchase',
  LEAD: 'lead',
  REGISTRATION: 'registration',
  CONTACT: 'contact',
  
  // Взаимодействия
  CTA_CLICK: 'cta_click',
  PURCHASE_INTENT: 'purchase_intent',
  CONTACT_INTENT: 'contact_intent',
  ADD_TO_CART: 'add_to_cart',
  VIEW_CONTENT: 'view_content',
  SEARCH: 'search',
  
  // Поведение
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  PAGE_EXIT: 'page_exit',
  ELEMENT_VISIBLE: 'element_visible',
  
  // Внешние ссылки
  OUTBOUND_LINK: 'outbound_link_click',
  PHONE_CLICK: 'phone_click',
  EMAIL_CLICK: 'email_click',
} as const

// Константы для типов конверсий
export const CONVERSION_TYPES = {
  LEAD: 'lead',
  PURCHASE: 'purchase',
  REGISTRATION: 'registration',
  CONTACT: 'contact',
} as const

// Константы для категорий контента
export const CONTENT_CATEGORIES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  BLOG: 'blog',
  COURSE: 'course',
  LANDING: 'landing',
  ABOUT: 'about',
  CONTACT: 'contact',
} as const

// Экспорт типов для TypeScript
export type TrackingEvent = typeof TRACKING_EVENTS[keyof typeof TRACKING_EVENTS]
export type ConversionType = typeof CONVERSION_TYPES[keyof typeof CONVERSION_TYPES]
export type ContentCategory = typeof CONTENT_CATEGORIES[keyof typeof CONTENT_CATEGORIES]

// Интерфейсы для компонентов (для обратной совместимости)
interface TrackableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  trackEvent?: string
  trackData?: Record<string, any>
  conversionType?: ConversionType
  conversionValue?: number
  children: React.ReactNode
}

interface TrackableLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  trackEvent?: string
  trackData?: Record<string, any>
  children: React.ReactNode
}

interface TrackableFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  trackEvent?: string
  trackData?: Record<string, any>
  conversionType?: ConversionType
  conversionValue?: number
  formName?: string
  children: React.ReactNode
}

export type {
  TrackableButtonProps,
  TrackableLinkProps,
  TrackableFormProps,
}
