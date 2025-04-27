'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

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
  
  // Simulate progress for better UX
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isLoading && progress < 90) {
      interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 10
          const nextProgress = Math.min(prev + increment, 90)
          return nextProgress
        })
      }, 300)
    }
    
    return () => clearInterval(interval)
  }, [isLoading, progress])
  
  const startLoading = useCallback(() => {
    setIsLoading(true)
    setProgress(0)
  }, [])
  
  const stopLoading = useCallback(() => {
    setProgress(100)
    
    // Add a small delay before hiding the loader
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 500)
  }, [])
  
  // Handle route changes
  useEffect(() => {
    startLoading()
    
    // Simulate loading time
    const timeout = setTimeout(() => {
      stopLoading()
    }, 1000)
    
    return () => clearTimeout(timeout)
  }, [pathname, searchParams, startLoading, stopLoading])
  
  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      progress,
      startLoading,
      stopLoading,
      setProgress
    }}>
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
