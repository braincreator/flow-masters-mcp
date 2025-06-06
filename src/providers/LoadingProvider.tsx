'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useSafeTimeout, useSafeInterval } from '@/hooks/useSafeContext'

interface LoadingContextType {
  isLoading: boolean
  progress: number
  startLoading: () => void
  stopLoading: () => void
  setProgress: (progress: number) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { safeSetTimeout } = useSafeTimeout()
  const { safeSetInterval } = useSafeInterval()

  // Simulate progress for better UX
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined

    if (isLoading && progress < 90) {
      intervalId = safeSetInterval(() => {
        setProgress((prev) => {
          const increment = Math.random() * 10
          const nextProgress = Math.min(prev + increment, 90)
          return nextProgress
        })
      }, 300)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isLoading, progress, safeSetInterval])

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setProgress(0)
  }, [])

  const stopLoading = useCallback(() => {
    setProgress(100)

    // Add a small delay before hiding the loader using safe timeout
    safeSetTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 500)
  }, [safeSetTimeout])

  // Handle route changes
  useEffect(() => {
    startLoading()

    // Simulate loading time using safe timeout
    const timeoutId = safeSetTimeout(() => {
      stopLoading()
    }, 1000)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [pathname, searchParams, startLoading, stopLoading, safeSetTimeout])

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        progress,
        startLoading,
        stopLoading,
        setProgress,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
