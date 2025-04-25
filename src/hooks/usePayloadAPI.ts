'use client'

import { useState, useEffect } from 'react'

interface UsePayloadAPIOptions {
  refreshInterval?: number
  refreshDeps?: any[]
}

export function usePayloadAPI(url: string, options: UsePayloadAPIOptions = {}) {
  const { refreshInterval, refreshDeps = [] } = options
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    let intervalId: NodeJS.Timeout | null = null

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (isMounted) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    if (refreshInterval) {
      intervalId = setInterval(fetchData, refreshInterval)
    }

    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [url, refreshInterval, ...refreshDeps])

  return { data, error, isLoading }
}
