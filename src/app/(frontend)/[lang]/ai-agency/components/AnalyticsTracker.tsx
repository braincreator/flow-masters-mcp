'use client'

import { useEffect, useRef } from 'react'
import { useAnalytics } from '@/providers/AnalyticsProvider'

interface AnalyticsTrackerProps {
  children: React.ReactNode
}

export function AnalyticsTracker({ children }: AnalyticsTrackerProps) {
  const { trackEvent } = useAnalytics()
  const startTimeRef = useRef<number>(Date.now())
  const scrollDepthRef = useRef<number>(0)
  const sectionsViewedRef = useRef<Set<string>>(new Set())

  const trackScrollDepth = (percentage: number) => {
    trackEvent('engagement', 'scroll_depth', 'ai_agency_page', percentage, {
      percentage,
      timestamp: Date.now(),
    })
  }

  const trackTimeOnPage = (seconds: number) => {
    trackEvent('engagement', 'time_on_page', 'ai_agency_page', seconds, {
      seconds,
      timestamp: Date.now(),
    })
  }

  const trackSectionView = (sectionName: string) => {
    trackEvent('engagement', 'section_view', sectionName, undefined, {
      section: sectionName,
      timestamp: Date.now(),
    })
  }

  useEffect(() => {
    let timeOnPageInterval: NodeJS.Timeout

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100)

      // Track scroll depth milestones
      if (scrollPercentage > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercentage
        trackScrollDepth(scrollPercentage)
      }

      // Track section views
      const sections = document.querySelectorAll('[data-section]')
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0
        const sectionName = section.getAttribute('data-section')

        if (isVisible && sectionName && !sectionsViewedRef.current.has(sectionName)) {
          sectionsViewedRef.current.add(sectionName)
          trackSectionView(sectionName)
        }
      })
    }

    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000)
      trackTimeOnPage(timeOnPage)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000)
        trackTimeOnPage(timeOnPage)
      } else {
        startTimeRef.current = Date.now()
      }
    }

    // Set up event listeners
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Track time on page every 30 seconds
    timeOnPageInterval = setInterval(() => {
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000)
      if (timeOnPage > 30) {
        trackTimeOnPage(timeOnPage)
      }
    }, 30000)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(timeOnPageInterval)
    }
  }, [trackScrollDepth, trackTimeOnPage, trackSectionView])

  return <>{children}</>
}
