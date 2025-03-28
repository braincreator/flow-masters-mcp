'use client'

import { useCallback } from 'react'

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    console.log(`[Analytics] ${eventName}`, properties)

    // In a real implementation, you would send this event to your analytics provider
    // Example: window.gtag('event', eventName, properties)
    try {
      if (typeof window !== 'undefined') {
        // For Google Analytics
        if ((window as any).gtag) {
          ;(window as any).gtag('event', eventName, properties)
        }

        // For Facebook Pixel
        if ((window as any).fbq) {
          ;(window as any).fbq('track', eventName, properties)
        }
      }
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }, [])

  return {
    trackEvent,
  }
}

export default useAnalytics
