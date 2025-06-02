'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface LoadingState {
  isLoading: boolean
  loadingType: 'initial' | 'search' | 'filter' | 'pagination' | 'refresh'
  progress: number
  message?: string
  error?: string
}

interface BlogLoadingContextType {
  loadingState: LoadingState
  setLoading: (loading: boolean, type?: LoadingState['loadingType'], message?: string) => void
  setProgress: (progress: number) => void
  setError: (error: string | null) => void
  clearError: () => void
  isLoadingType: (type: LoadingState['loadingType']) => boolean
}

const BlogLoadingContext = createContext<BlogLoadingContextType | undefined>(undefined)

interface BlogLoadingProviderProps {
  children: React.ReactNode
}

export function BlogLoadingProvider({ children }: BlogLoadingProviderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingType: 'initial',
    progress: 0,
    message: undefined,
    error: undefined,
  })

  const setLoading = useCallback((
    loading: boolean, 
    type: LoadingState['loadingType'] = 'initial', 
    message?: string
  ) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: loading,
      loadingType: type,
      message,
      progress: loading ? 0 : 100,
      error: loading ? undefined : prev.error, // Clear error when starting new loading
    }))
  }, [])

  const setProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setLoadingState(prev => ({
      ...prev,
      error: error || undefined,
      isLoading: false,
      progress: error ? 0 : prev.progress,
    }))
  }, [])

  const clearError = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      error: undefined,
    }))
  }, [])

  const isLoadingType = useCallback((type: LoadingState['loadingType']) => {
    return loadingState.isLoading && loadingState.loadingType === type
  }, [loadingState.isLoading, loadingState.loadingType])

  // Auto-progress simulation for better UX
  useEffect(() => {
    if (!loadingState.isLoading || loadingState.progress >= 90) return

    const interval = setInterval(() => {
      setLoadingState(prev => {
        if (!prev.isLoading || prev.progress >= 90) return prev
        
        // Simulate realistic loading progress
        const increment = Math.random() * 10 + 5 // 5-15% increments
        const newProgress = Math.min(90, prev.progress + increment)
        
        return {
          ...prev,
          progress: newProgress,
        }
      })
    }, 200 + Math.random() * 300) // Random interval between 200-500ms

    return () => clearInterval(interval)
  }, [loadingState.isLoading, loadingState.progress])

  const value: BlogLoadingContextType = {
    loadingState,
    setLoading,
    setProgress,
    setError,
    clearError,
    isLoadingType,
  }

  return (
    <BlogLoadingContext.Provider value={value}>
      {children}
    </BlogLoadingContext.Provider>
  )
}

export function useBlogLoading() {
  const context = useContext(BlogLoadingContext)
  if (context === undefined) {
    throw new Error('useBlogLoading must be used within a BlogLoadingProvider')
  }
  return context
}

// Hook for managing loading states with automatic cleanup
export function useLoadingState(type: LoadingState['loadingType'] = 'initial') {
  const { setLoading, setProgress, setError, clearError, isLoadingType } = useBlogLoading()

  const startLoading = useCallback((message?: string) => {
    setLoading(true, type, message)
  }, [setLoading, type])

  const stopLoading = useCallback(() => {
    setProgress(100)
    setTimeout(() => setLoading(false), 200) // Small delay for smooth transition
  }, [setLoading, setProgress])

  const updateProgress = useCallback((progress: number) => {
    setProgress(progress)
  }, [setProgress])

  const handleError = useCallback((error: string) => {
    setError(error)
  }, [setError])

  return {
    isLoading: isLoadingType(type),
    startLoading,
    stopLoading,
    updateProgress,
    handleError,
    clearError,
  }
}

// Hook for search-specific loading states
export function useSearchLoading() {
  return useLoadingState('search')
}

// Hook for filter-specific loading states
export function useFilterLoading() {
  return useLoadingState('filter')
}

// Hook for pagination-specific loading states
export function usePaginationLoading() {
  return useLoadingState('pagination')
}

// Higher-order component for automatic loading management
interface WithLoadingProps {
  loadingType?: LoadingState['loadingType']
  loadingMessage?: string
}

export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  defaultLoadingType: LoadingState['loadingType'] = 'initial'
) {
  return function WrappedComponent(props: P & WithLoadingProps) {
    const { loadingType = defaultLoadingType, loadingMessage, ...componentProps } = props
    const { startLoading, stopLoading } = useLoadingState(loadingType)

    useEffect(() => {
      startLoading(loadingMessage)
      return () => stopLoading()
    }, [startLoading, stopLoading, loadingMessage])

    return <Component {...(componentProps as P)} />
  }
}

// Utility function for async operations with loading states
export async function withLoadingAsync<T>(
  operation: () => Promise<T>,
  loadingHook: ReturnType<typeof useLoadingState>,
  message?: string
): Promise<T> {
  try {
    loadingHook.startLoading(message)
    const result = await operation()
    loadingHook.stopLoading()
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    loadingHook.handleError(errorMessage)
    throw error
  }
}
