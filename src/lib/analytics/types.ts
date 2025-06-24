/**
 * Modern Analytics Types for Next.js App Directory
 * Supports Yandex Metrica and VK Ads Pixel
 */

// Base analytics event structure
export interface AnalyticsEvent {
  id: string
  timestamp: string
  type: 'page_view' | 'event' | 'goal' | 'ecommerce' | 'user_action'
  service: 'yandex_metrica' | 'vk_pixel' | 'all'
  data: Record<string, any>
}

// Yandex Metrica specific types
export interface YandexMetricaConfig {
  counterId: string | number
  options?: {
    clickmap?: boolean
    trackLinks?: boolean
    accurateTrackBounce?: boolean
    webvisor?: boolean
    defer?: boolean
    triggerEvent?: boolean
    trackHash?: boolean
    ecommerce?: boolean | string
  }
  version?: '1' | '2'
  enabled?: boolean
}

export interface YandexMetricaGoal {
  name: string
  params?: Record<string, any>
}

export interface YandexMetricaEcommerce {
  action: 'purchase' | 'add' | 'remove' | 'detail' | 'checkout'
  items: Array<{
    id: string
    name: string
    category?: string
    price?: number
    quantity?: number
    brand?: string
    variant?: string
  }>
  currency?: string
  value?: number
  transaction_id?: string
}

// VK Ads Pixel specific types
export interface VKPixelConfig {
  pixelId: string
  enabled?: boolean
  trackPageView?: boolean
  loadPriority?: 'high' | 'normal' | 'low'
}

export interface VKPixelEvent {
  event: string
  params?: Record<string, any>
}

// Top.Mail.Ru (VK Ads) specific types
export interface TopMailRuConfig {
  counterId: string
  enabled?: boolean
  trackPageView?: boolean
  loadPriority?: 'high' | 'normal' | 'low'
}

export interface TopMailRuEvent {
  type: 'pageView' | 'reachGoal' | 'event'
  goal?: string
  params?: Record<string, any>
}

// Top.Mail.Ru specific types
export interface TopMailRuConfig {
  counterId: string
  enabled?: boolean
  trackPageView?: boolean
  loadPriority?: 'high' | 'normal' | 'low'
}

export interface TopMailRuEvent {
  type: 'pageView' | 'reachGoal' | 'event'
  goal?: string
  params?: Record<string, any>
}

// Unified analytics configuration
export interface AnalyticsConfig {
  yandexMetrica?: YandexMetricaConfig
  vkPixel?: VKPixelConfig | VKPixelConfig[]
  topMailRu?: TopMailRuConfig
  debug?: boolean
  enabled?: boolean
}

// Analytics provider context type
export interface AnalyticsContextType {
  // Configuration
  config: AnalyticsConfig
  isReady: boolean
  
  // Yandex Metrica methods
  ymHit: (url?: string, options?: Record<string, any>) => void
  ymGoal: (goal: string, params?: Record<string, any>) => void
  ymEcommerce: (event: YandexMetricaEcommerce) => void
  ymUserParams: (params: Record<string, any>) => void
  
  // VK Pixel methods
  vkEvent: (event: string, params?: Record<string, any>) => void
  vkGoal: (goal: string, params?: Record<string, any>) => void

  // Top.Mail.Ru methods
  tmrPageView: (params?: Record<string, any>) => void
  tmrGoal: (goal: string, params?: Record<string, any>) => void
  tmrEvent: (event: TopMailRuEvent) => void
  
  // Universal methods
  trackPageView: (url?: string, title?: string) => void
  trackEvent: (event: string, params?: Record<string, any>) => void
  trackGoal: (goal: string, params?: Record<string, any>) => void
  trackEcommerce: (event: YandexMetricaEcommerce) => void
  
  // User identification
  identifyUser: (userId: string, traits?: Record<string, any>) => void
  
  // Debug and health
  getHealth: () => AnalyticsHealth
  getRecentEvents: () => AnalyticsEvent[]
  clearEvents: () => void
}

// Health check types
export interface AnalyticsHealth {
  yandexMetrica: {
    loaded: boolean
    counterId?: string | number
    error?: string
  }
  vkPixel: {
    loaded: boolean
    pixelIds: string[]
    error?: string
  }
  topMailRu: {
    loaded: boolean
    counterId?: string
    error?: string
  }
  timestamp: string
}

// Hook return types
export interface UseYandexMetricaReturn {
  hit: (url?: string, options?: Record<string, any>) => void
  goal: (goal: string, params?: Record<string, any>) => void
  ecommerce: (event: YandexMetricaEcommerce) => void
  userParams: (params: Record<string, any>) => void
  isReady: boolean
}

export interface UseVKPixelReturn {
  event: (event: string, params?: Record<string, any>) => void
  goal: (goal: string, params?: Record<string, any>) => void
  isReady: boolean
}

export interface UseTopMailRuReturn {
  pageView: (params?: Record<string, any>) => void
  goal: (goal: string, params?: Record<string, any>) => void
  event: (event: TopMailRuEvent) => void
  isReady: boolean
}

export interface UseAnalyticsReturn extends AnalyticsContextType {}

// Window extensions for analytics scripts
declare global {
  interface Window {
    ym?: (counterId: number | string, method: string, ...args: any[]) => void
    VK?: {
      Retargeting?: {
        Init: (pixelId: string) => void
        Hit: () => void
        Event: (event: string, params?: Record<string, any>) => void
        Goal: (goal: string, params?: Record<string, any>) => void
      }
    }
    dataLayer?: any[]
  }
}

// Error types
export class AnalyticsError extends Error {
  constructor(
    message: string,
    public service: 'yandex_metrica' | 'vk_pixel',
    public code?: string
  ) {
    super(message)
    this.name = 'AnalyticsError'
  }
}
