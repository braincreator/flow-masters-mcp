'use client'

import { useContext } from 'react'
import { AnalyticsContext } from '@/providers/AnalyticsProvider'
import type { EventCategory, EcommerceEvent } from '@/providers/AnalyticsProvider'

/**
 * Custom hook to select specific parts of the analytics context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 * 
 * @param selector A function that selects specific parts of the analytics context
 * @returns The selected parts of the analytics context
 */
export function useAnalyticsSelector<T>(selector: (context: any) => T): T {
  const context = useContext(AnalyticsContext)
  
  if (context === undefined) {
    throw new Error('useAnalyticsSelector must be used within an AnalyticsProvider')
  }
  
  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the basic tracking methods
 */
export function useBasicTracking() {
  return useAnalyticsSelector(context => ({
    trackEvent: context.trackEvent,
    trackPageView: context.trackPageView,
  }))
}

/**
 * Select only the ecommerce tracking methods
 */
export function useEcommerceTracking() {
  return useAnalyticsSelector(context => ({
    trackEcommerce: context.trackEcommerce,
  }))
}

/**
 * Select only the user tracking methods
 */
export function useUserTracking() {
  return useAnalyticsSelector(context => ({
    trackUserAction: context.trackUserAction,
    identifyUser: context.identifyUser,
  }))
}

/**
 * Select only the content tracking methods
 */
export function useContentTracking() {
  return useAnalyticsSelector(context => ({
    trackContentInteraction: context.trackContentInteraction,
  }))
}

/**
 * Select only the recent events for debugging
 */
export function useAnalyticsDebug() {
  return useAnalyticsSelector(context => ({
    recentEvents: context.recentEvents,
    clearRecentEvents: context.clearRecentEvents,
  }))
}

/**
 * Create a tracking hook for a specific page or component
 * @param componentName The name of the component or page
 */
export function createComponentTracker(componentName: string) {
  return function useComponentTracking() {
    const { trackEvent } = useBasicTracking()
    
    return {
      trackAction: (action: string, label?: string, value?: number, properties?: Record<string, any>) => {
        trackEvent('interaction', action, label, value, {
          ...properties,
          component: componentName,
        })
      }
    }
  }
}
