'use client'

import { useLoadingConfig } from '@/providers/LoadingConfigProvider'
import { CosmicLoader } from '@/components/ui/cosmic-loader'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useUserPreferences } from '@/hooks/useMediaQuerySelector'

export function SmartLoading() {
  const { loadingStyle, isFirstVisit } = useLoadingConfig()
  const { prefersReducedMotion } = useUserPreferences()

  // If user prefers reduced motion, always use the minimal style
  if (prefersReducedMotion) {
    return <ProgressBar />
  }

  // Always show cosmic loader on first visit for wow factor (unless reduced motion is preferred)
  if (isFirstVisit) {
    return <CosmicLoader />
  }

  // Otherwise use the configured style
  return (
    <>
      {(loadingStyle === 'cosmic' || loadingStyle === 'both') && <CosmicLoader />}
      {(loadingStyle === 'minimal' || loadingStyle === 'both') && <ProgressBar />}
    </>
  )
}
