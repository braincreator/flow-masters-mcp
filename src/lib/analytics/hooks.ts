'use client'

/**
 * Modern Analytics Hooks for Next.js App Directory
 */

import { useCallback } from 'react'
import { useAnalytics } from './provider'
import {
  UseYandexMetricaReturn,
  UseVKPixelReturn,
  UseTopMailRuReturn,
  UseAnalyticsReturn,
  YandexMetricaEcommerce,
  TopMailRuEvent
} from './types'

/**
 * Hook for Yandex Metrica specific functionality
 */
export function useYandexMetrica(): UseYandexMetricaReturn {
  const analytics = useAnalytics()

  const hit = useCallback((url?: string, options?: Record<string, any>) => {
    analytics.ymHit(url, options)
  }, [analytics])

  const goal = useCallback((goal: string, params?: Record<string, any>) => {
    analytics.ymGoal(goal, params)
  }, [analytics])

  const ecommerce = useCallback((event: YandexMetricaEcommerce) => {
    analytics.ymEcommerce(event)
  }, [analytics])

  const userParams = useCallback((params: Record<string, any>) => {
    analytics.ymUserParams(params)
  }, [analytics])

  return {
    hit,
    goal,
    ecommerce,
    userParams,
    isReady: analytics.isReady
  }
}

/**
 * Hook for VK Pixel specific functionality
 */
export function useVKPixel(): UseVKPixelReturn {
  const analytics = useAnalytics()

  const event = useCallback((event: string, params?: Record<string, any>) => {
    analytics.vkEvent(event, params)
  }, [analytics])

  const goal = useCallback((goal: string, params?: Record<string, any>) => {
    analytics.vkGoal(goal, params)
  }, [analytics])

  return {
    event,
    goal,
    isReady: analytics.isReady
  }
}

/**
 * Hook for Top.Mail.Ru (VK Ads) specific functionality
 */
export function useTopMailRu(): UseTopMailRuReturn {
  const analytics = useAnalytics()

  const pageView = useCallback((params?: Record<string, any>) => {
    analytics.tmrPageView(params)
  }, [analytics])

  const goal = useCallback((goal: string, params?: Record<string, any>) => {
    analytics.tmrGoal(goal, params)
  }, [analytics])

  const event = useCallback((event: TopMailRuEvent) => {
    analytics.tmrEvent(event)
  }, [analytics])

  return {
    pageView,
    goal,
    event,
    isReady: analytics.isReady
  }
}

/**
 * Main analytics hook with all functionality
 */
export function useAnalyticsHook(): UseAnalyticsReturn {
  return useAnalytics()
}

/**
 * Hook for tracking page views manually
 */
export function usePageTracking() {
  const analytics = useAnalytics()

  const trackPage = useCallback((url?: string, title?: string) => {
    analytics.trackPageView(url, title)
  }, [analytics])

  return { trackPage, isReady: analytics.isReady }
}

/**
 * Hook for tracking events
 */
export function useEventTracking() {
  const analytics = useAnalytics()

  const trackEvent = useCallback((event: string, params?: Record<string, any>) => {
    analytics.trackEvent(event, params)
  }, [analytics])

  const trackGoal = useCallback((goal: string, params?: Record<string, any>) => {
    analytics.trackGoal(goal, params)
  }, [analytics])

  return { 
    trackEvent, 
    trackGoal, 
    isReady: analytics.isReady 
  }
}

/**
 * Hook for ecommerce tracking
 */
export function useEcommerceTracking() {
  const analytics = useAnalytics()

  const trackPurchase = useCallback((items: YandexMetricaEcommerce['items'], transactionId: string, value?: number) => {
    analytics.trackEcommerce({
      action: 'purchase',
      items,
      transaction_id: transactionId,
      value,
      currency: 'RUB'
    })
  }, [analytics])

  const trackAddToCart = useCallback((items: YandexMetricaEcommerce['items']) => {
    analytics.trackEcommerce({
      action: 'add',
      items
    })
  }, [analytics])

  const trackRemoveFromCart = useCallback((items: YandexMetricaEcommerce['items']) => {
    analytics.trackEcommerce({
      action: 'remove',
      items
    })
  }, [analytics])

  const trackViewItem = useCallback((items: YandexMetricaEcommerce['items']) => {
    analytics.trackEcommerce({
      action: 'detail',
      items
    })
  }, [analytics])

  const trackCheckout = useCallback((items: YandexMetricaEcommerce['items'], value?: number) => {
    analytics.trackEcommerce({
      action: 'checkout',
      items,
      value
    })
  }, [analytics])

  return {
    trackPurchase,
    trackAddToCart,
    trackRemoveFromCart,
    trackViewItem,
    trackCheckout,
    isReady: analytics.isReady
  }
}

/**
 * Hook for user identification
 */
export function useUserTracking() {
  const analytics = useAnalytics()

  const identifyUser = useCallback((userId: string, traits?: Record<string, any>) => {
    analytics.identifyUser(userId, traits)
  }, [analytics])

  return { 
    identifyUser, 
    isReady: analytics.isReady 
  }
}

/**
 * Hook for debugging and health monitoring
 */
export function useAnalyticsDebug() {
  const analytics = useAnalytics()

  const getHealth = useCallback(() => {
    return analytics.getHealth()
  }, [analytics])

  const getRecentEvents = useCallback(() => {
    return analytics.getRecentEvents()
  }, [analytics])

  const clearEvents = useCallback(() => {
    analytics.clearEvents()
  }, [analytics])

  return {
    getHealth,
    getRecentEvents,
    clearEvents,
    isReady: analytics.isReady,
    config: analytics.config
  }
}
