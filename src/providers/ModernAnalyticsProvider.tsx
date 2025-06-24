'use client'

/**
 * Modern Analytics Provider - Drop-in replacement for the old AnalyticsProvider
 * 
 * This provider maintains backward compatibility while using the new analytics library
 */

import React, { ReactNode } from 'react'
import { AnalyticsProvider, createAnalyticsConfigFromEnv } from '@/lib/analytics'

interface ModernAnalyticsProviderProps {
  children: ReactNode
}

export function ModernAnalyticsProvider({ children }: ModernAnalyticsProviderProps) {
  // Create config from environment variables (same as before)
  const config = createAnalyticsConfigFromEnv()

  return (
    <AnalyticsProvider config={config}>
      {children}
    </AnalyticsProvider>
  )
}

// Re-export the hook for backward compatibility
export { useAnalytics } from '@/lib/analytics'
