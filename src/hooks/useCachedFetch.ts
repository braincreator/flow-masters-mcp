'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCache } from '@/providers/CacheProvider'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface UseCachedFetchOptions {
  // Cache expiration in milliseconds
  cacheTime?: number
  // Automatically refetch data on window focus
  revalidateOnFocus?: boolean
  // Automatically refetch data on network reconnection
  revalidateOnReconnect?: boolean
  // Refetch interval in milliseconds (0 = no polling)
  refreshInterval?: number
  // Dependencies that trigger refetch when changed
  deps?: any[]
}

const DEFAULT_OPTIONS: UseCachedFetchOptions = {
  cacheTime: 5 * 60 * 1000, // 5 minutes
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  deps: [],
}

export function useCachedFetch<T>(
  url: string,
  options: UseCachedFetchOptions = {}
): {
  data: T | null
  error: Error | null
  isLoading: boolean
  refetch: () => Promise<void>
} {
  // Merge options with defaults
  const {
    cacheTime,
    revalidateOnFocus,
    revalidateOnReconnect,
    refreshInterval,
    deps = [],
  } = { ...DEFAULT_OPTIONS, ...options }

  const cache = useCache()
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Function to fetch data
  const fetchData = useCallback(async (skipCache = false): Promise<void> => {
    // Check cache first if not skipping cache
    if (!skipCache) {
      const cachedData = cache.get<T>(url)
      if (cachedData) {
        setData(cachedData)
        setIsLoading(false)
        return
      }
    }

    try {
      setIsLoading(true)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setError(null)

      // Store in cache
      cache.set<T>(url, result, cacheTime)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
      logError(`Error fetching ${url}:`, err)
    } finally {
      setIsLoading(false)
    }
  }, [url, cache, cacheTime])

  // Initial fetch and dependency-based refetching
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...deps])

  // Set up polling if refreshInterval is provided
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return

    const intervalId = setInterval(() => {
      fetchData(true) // Skip cache when polling
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [fetchData, refreshInterval])

  // Set up revalidation on focus if enabled
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      fetchData(true) // Skip cache when revalidating on focus
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchData, revalidateOnFocus])

  // Set up revalidation on reconnect if enabled
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const handleOnline = () => {
      fetchData(true) // Skip cache when revalidating on reconnect
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [fetchData, revalidateOnReconnect])

  return {
    data,
    error,
    isLoading,
    refetch: () => fetchData(true), // Skip cache when manually refetching
  }
}
