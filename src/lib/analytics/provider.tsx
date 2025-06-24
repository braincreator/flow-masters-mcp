'use client'

/**
 * Modern Analytics Provider for Next.js App Directory
 * Supports Yandex Metrica and VK Ads Pixel with React hooks
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { 
  AnalyticsConfig, 
  AnalyticsContextType, 
  AnalyticsEvent, 
  AnalyticsHealth,
  YandexMetricaEcommerce 
} from './types'
import { YandexMetricaService } from './yandex-metrica'
import { VKPixelService } from './vk-pixel'
import { TopMailRuService } from './top-mail-ru'

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

interface AnalyticsProviderProps {
  children: ReactNode
  config: AnalyticsConfig
}

export function AnalyticsProvider({ children, config }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Services
  const [yandexService, setYandexService] = useState<YandexMetricaService | null>(null)
  const [vkService, setVKService] = useState<VKPixelService | null>(null)
  const [topMailRuService, setTopMailRuService] = useState<TopMailRuService | null>(null)
  const [isReady, setIsReady] = useState(false)
  
  // Event tracking for debugging
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([])

  // Initialize services
  useEffect(() => {
    if (!config.enabled || typeof window === 'undefined') {
      return
    }

    const initializeServices = async () => {
      try {
        // Initialize Yandex Metrica
        if (config.yandexMetrica?.counterId) {
          const ymService = new YandexMetricaService(config.yandexMetrica, config.debug)
          await ymService.initialize()
          setYandexService(ymService)
        }

        // Initialize VK Pixel
        if (config.vkPixel) {
          const vkService = new VKPixelService(config.vkPixel, config.debug)
          await vkService.initialize()
          setVKService(vkService)
        }

        // Initialize Top.Mail.Ru (VK Ads)
        if (config.topMailRu?.counterId) {
          const tmrService = new TopMailRuService(config.topMailRu, config.debug)
          await tmrService.initialize()
          setTopMailRuService(tmrService)
        }

        setIsReady(true)

        if (config.debug) {
          console.log('[Analytics] All services initialized successfully')
        }
      } catch (error) {
        if (config.debug) {
          console.error('[Analytics] Failed to initialize services:', error)
        }
      }
    }

    initializeServices()
  }, [config])

  // Track page views automatically
  useEffect(() => {
    if (!isReady) return

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(url)
  }, [pathname, searchParams, isReady])

  // Add event to recent events for debugging
  const addEvent = useCallback((event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
    if (!config.debug) return

    const fullEvent: AnalyticsEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    }

    setRecentEvents(prev => [fullEvent, ...prev].slice(0, 50))
  }, [config.debug])

  // Yandex Metrica methods
  const ymHit = useCallback((url?: string, options?: Record<string, any>) => {
    if (yandexService?.isReady()) {
      yandexService.hit(url, options)
      addEvent({
        type: 'page_view',
        service: 'yandex_metrica',
        data: { url, options }
      })
    }
  }, [yandexService, addEvent])

  const ymGoal = useCallback((goal: string, params?: Record<string, any>) => {
    if (yandexService?.isReady()) {
      yandexService.goal(goal, params)
      addEvent({
        type: 'goal',
        service: 'yandex_metrica',
        data: { goal, params }
      })
    }
  }, [yandexService, addEvent])

  const ymEcommerce = useCallback((event: YandexMetricaEcommerce) => {
    if (yandexService?.isReady()) {
      yandexService.ecommerce(event)
      addEvent({
        type: 'ecommerce',
        service: 'yandex_metrica',
        data: event
      })
    }
  }, [yandexService, addEvent])

  const ymUserParams = useCallback((params: Record<string, any>) => {
    if (yandexService?.isReady()) {
      yandexService.userParams(params)
      addEvent({
        type: 'user_action',
        service: 'yandex_metrica',
        data: { userParams: params }
      })
    }
  }, [yandexService, addEvent])

  // VK Pixel methods
  const vkEvent = useCallback((event: string, params?: Record<string, any>) => {
    if (vkService?.isReady()) {
      vkService.event(event, params)
      addEvent({
        type: 'event',
        service: 'vk_pixel',
        data: { event, params }
      })
    }
  }, [vkService, addEvent])

  const vkGoal = useCallback((goal: string, params?: Record<string, any>) => {
    if (vkService?.isReady()) {
      vkService.goal(goal, params)
      addEvent({
        type: 'goal',
        service: 'vk_pixel',
        data: { goal, params }
      })
    }
  }, [vkService, addEvent])

  // Top.Mail.Ru methods
  const tmrPageView = useCallback((params?: Record<string, any>) => {
    if (topMailRuService?.isReady()) {
      topMailRuService.pageView(params)
      addEvent({
        type: 'page_view',
        service: 'vk_pixel', // Top.Mail.Ru is part of VK Ads
        data: { params }
      })
    }
  }, [topMailRuService, addEvent])

  const tmrGoal = useCallback((goal: string, params?: Record<string, any>) => {
    if (topMailRuService?.isReady()) {
      topMailRuService.goal(goal, params)
      addEvent({
        type: 'goal',
        service: 'vk_pixel', // Top.Mail.Ru is part of VK Ads
        data: { goal, params }
      })
    }
  }, [topMailRuService, addEvent])

  const tmrEvent = useCallback((event: TopMailRuEvent) => {
    if (topMailRuService?.isReady()) {
      topMailRuService.event(event)
      addEvent({
        type: 'event',
        service: 'vk_pixel', // Top.Mail.Ru is part of VK Ads
        data: event
      })
    }
  }, [topMailRuService, addEvent])

  // Universal methods
  const trackPageView = useCallback((url?: string, title?: string) => {
    ymHit(url)
    if (vkService?.isReady()) {
      vkService.hit()
    }
    tmrPageView({ url, title })

    addEvent({
      type: 'page_view',
      service: 'all',
      data: { url, title }
    })
  }, [ymHit, vkService, tmrPageView, addEvent])

  const trackEvent = useCallback((event: string, params?: Record<string, any>) => {
    vkEvent(event, params)
    
    addEvent({
      type: 'event',
      service: 'all',
      data: { event, params }
    })
  }, [vkEvent, addEvent])

  const trackGoal = useCallback((goal: string, params?: Record<string, any>) => {
    ymGoal(goal, params)
    vkGoal(goal, params)
    tmrGoal(goal, params)

    addEvent({
      type: 'goal',
      service: 'all',
      data: { goal, params }
    })
  }, [ymGoal, vkGoal, tmrGoal, addEvent])

  const trackEcommerce = useCallback((event: YandexMetricaEcommerce) => {
    ymEcommerce(event)
    
    addEvent({
      type: 'ecommerce',
      service: 'all',
      data: event
    })
  }, [ymEcommerce, addEvent])

  const identifyUser = useCallback((userId: string, traits?: Record<string, any>) => {
    const userParams = { user_id: userId, ...traits }
    ymUserParams(userParams)
    
    addEvent({
      type: 'user_action',
      service: 'all',
      data: { userId, traits }
    })
  }, [ymUserParams, addEvent])

  // Health and debugging
  const getHealth = useCallback((): AnalyticsHealth => {
    return {
      yandexMetrica: yandexService?.getHealth() || {
        loaded: false,
        error: 'Service not initialized'
      },
      vkPixel: vkService?.getHealth() || {
        loaded: false,
        pixelIds: [],
        error: 'Service not initialized'
      },
      topMailRu: topMailRuService?.getHealth() || {
        loaded: false,
        error: 'Service not initialized'
      },
      timestamp: new Date().toISOString()
    }
  }, [yandexService, vkService, topMailRuService])

  const getRecentEvents = useCallback(() => recentEvents, [recentEvents])
  
  const clearEvents = useCallback(() => {
    setRecentEvents([])
  }, [])

  const contextValue: AnalyticsContextType = {
    config,
    isReady,
    ymHit,
    ymGoal,
    ymEcommerce,
    ymUserParams,
    vkEvent,
    vkGoal,
    tmrPageView,
    tmrGoal,
    tmrEvent,
    trackPageView,
    trackEvent,
    trackGoal,
    trackEcommerce,
    identifyUser,
    getHealth,
    getRecentEvents,
    clearEvents
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}
