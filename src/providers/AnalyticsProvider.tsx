'use client'

import React, { createContext, useContext, useCallback, useEffect, useMemo, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePathname, useSearchParams } from 'next/navigation'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export type EventCategory = 'page_view' | 'user' | 'content' | 'ecommerce' | 'interaction'

export interface AnalyticsEvent {
  category: EventCategory
  action: string
  label?: string
  value?: number
  properties?: Record<string, any>
  timestamp: Date
}

export interface EcommerceEvent {
  action:
    | 'view_item'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'begin_checkout'
    | 'purchase'
    | 'refund'
  items: Array<{
    id: string
    name: string
    category?: string
    price?: number
    quantity?: number
  }>
  value?: number
  currency?: string
  transactionId?: string
}

interface AnalyticsContextType {
  // Basic tracking
  trackEvent: (
    category: EventCategory,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>,
  ) => void
  trackPageView: (path?: string, title?: string) => void

  // Specialized tracking
  trackEcommerce: (event: EcommerceEvent) => void
  trackUserAction: (action: string, properties?: Record<string, any>) => void
  trackContentInteraction: (
    contentId: string,
    action: string,
    properties?: Record<string, any>,
  ) => void

  // User identification
  identifyUser: (userId: string, traits?: Record<string, any>) => void

  // Recent events for debugging
  recentEvents: AnalyticsEvent[]
  clearRecentEvents: () => void
}

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Store recent events for debugging (not persisted)
  const [recentEvents, setRecentEvents] = React.useState<AnalyticsEvent[]>([])

  // Track page views automatically
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname])

  // Identify user when they log in
  useEffect(() => {
    if (user?.id) {
      identifyUser(user.id, {
        email: user.email,
        name: user.name,
        role: user.role,
      })
    }
  }, [user?.id])

  // Basic event tracking
  const trackEvent = useCallback(
    (
      category: EventCategory,
      action: string,
      label?: string,
      value?: number,
      properties?: Record<string, any>,
    ) => {
      const event: AnalyticsEvent = {
        category,
        action,
        label,
        value,
        properties,
        timestamp: new Date(),
      }

      // Log event for debugging
      logDebug('Analytics event:', event)

      // Add to recent events
      setRecentEvents((prev) => [event, ...prev].slice(0, 20))

      // Send to analytics service
      if (typeof window !== 'undefined') {
        // Google Analytics
        if ('gtag' in window) {
          // @ts-ignore
          window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
            ...properties,
          })
        }

        // Segment
        if ('analytics' in window) {
          // @ts-ignore
          window.analytics.track(action, {
            category,
            label,
            value,
            ...properties,
          })
        }
      }
    },
    [],
  )

  // Track page views
  const trackPageView = useCallback(
    (path?: string, title?: string) => {
      const currentPath = path || pathname
      const pageTitle = title || document.title

      trackEvent('page_view', 'view', currentPath)

      // Send to analytics services
      if (typeof window !== 'undefined') {
        // Google Analytics
        if ('gtag' in window) {
          // @ts-ignore
          window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
            page_path: currentPath,
            page_title: pageTitle,
          })
        }

        // Segment
        if ('analytics' in window) {
          // @ts-ignore
          window.analytics.page(pageTitle, {
            path: currentPath,
            url: window.location.origin + currentPath,
            title: pageTitle,
          })
        }
      }
    },
    [pathname, trackEvent],
  )

  // Track ecommerce events
  const trackEcommerce = useCallback(
    (event: EcommerceEvent) => {
      trackEvent('ecommerce', event.action, undefined, event.value, {
        items: event.items,
        currency: event.currency,
        transaction_id: event.transactionId,
      })

      // Send specialized ecommerce events to analytics services
      if (typeof window !== 'undefined') {
        // Google Analytics
        if ('gtag' in window) {
          // @ts-ignore
          window.gtag('event', event.action, {
            currency: event.currency || 'USD',
            value: event.value,
            items: event.items.map((item) => ({
              item_id: item.id,
              item_name: item.name,
              item_category: item.category,
              price: item.price,
              quantity: item.quantity || 1,
            })),
            transaction_id: event.transactionId,
          })
        }
      }
    },
    [trackEvent],
  )

  // Track user actions
  const trackUserAction = useCallback(
    (action: string, properties?: Record<string, any>) => {
      trackEvent('user', action, undefined, undefined, properties)
    },
    [trackEvent],
  )

  // Track content interactions
  const trackContentInteraction = useCallback(
    (contentId: string, action: string, properties?: Record<string, any>) => {
      trackEvent('content', action, contentId, undefined, properties)
    },
    [trackEvent],
  )

  // Identify user
  const identifyUser = useCallback((userId: string, traits?: Record<string, any>) => {
    logDebug('Identify user:', userId, traits)

    // Send to analytics services
    if (typeof window !== 'undefined') {
      // Google Analytics
      if ('gtag' in window) {
        // @ts-ignore
        window.gtag('set', 'user_properties', {
          user_id: userId,
          ...traits,
        })
      }

      // Segment
      if ('analytics' in window) {
        // @ts-ignore
        window.analytics.identify(userId, traits)
      }
    }
  }, [])

  // Clear recent events
  const clearRecentEvents = useCallback(() => {
    setRecentEvents([])
  }, [])

  // Memoize context value
  const value = useMemo(
    () => ({
      trackEvent,
      trackPageView,
      trackEcommerce,
      trackUserAction,
      trackContentInteraction,
      identifyUser,
      recentEvents,
      clearRecentEvents,
    }),
    [
      trackEvent,
      trackPageView,
      trackEcommerce,
      trackUserAction,
      trackContentInteraction,
      identifyUser,
      recentEvents,
      clearRecentEvents,
    ],
  )

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}
