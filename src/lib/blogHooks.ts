'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook that tracks reading progress on a page
 * Returns a percentage value between 0 and 100
 */
export function useReadingProgress(): number {
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Function to calculate scroll progress
    const updateScrollCompletion = () => {
      // Get scroll position and document height
      const currentScrollY = window.scrollY
      const scrollHeight = document.body.scrollHeight - window.innerHeight

      // If scrollHeight is 0, set completion to 100% to avoid division by zero
      if (scrollHeight <= 0) {
        setCompletion(100)
        return
      }

      // Calculate percentage - limit between 0 and 100
      const newPercentage = Math.min(100, Math.max(0, (currentScrollY / scrollHeight) * 100))
      setCompletion(newPercentage)
    }

    // Update on mount
    updateScrollCompletion()

    // Add scroll and resize event listeners
    window.addEventListener('scroll', updateScrollCompletion, { passive: true })
    window.addEventListener('resize', updateScrollCompletion, { passive: true })

    // Clean up event listeners
    return () => {
      window.removeEventListener('scroll', updateScrollCompletion)
      window.removeEventListener('resize', updateScrollCompletion)
    }
  }, [])

  return completion
}

/**
 * Custom hook to track time spent on an article
 * Records time spent in seconds
 */
export function useReadingTime(
  postId: string,
  apiEndpoint = '/api/blog/metrics',
  updateInterval = 30000, // 30 seconds
) {
  const [activeTime, setActiveTime] = useState(0)
  const startTimeRef = useRef<number>(Date.now())
  const lastUpdateRef = useRef<number>(Date.now())
  const isActiveRef = useRef<boolean>(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to send update to API
  const sendUpdate = async (finalUpdate = false) => {
    try {
      if (activeTime <= 0) return

      const data = {
        postId,
        timeSpent: activeTime,
        isFinal: finalUpdate,
      }

      await fetch(`${apiEndpoint}?type=timeSpent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      lastUpdateRef.current = Date.now()
    } catch (error) {
      console.error('Failed to update reading time:', error)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Track visibility change
    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === 'visible'

      if (isActiveRef.current) {
        // User came back to the page - reset start time
        startTimeRef.current = Date.now()
      } else {
        // User left page - update active time
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setActiveTime((prevTime) => prevTime + elapsed)
      }
    }

    // Track window focus/blur
    const handleFocus = () => {
      isActiveRef.current = true
      startTimeRef.current = Date.now()
    }

    const handleBlur = () => {
      isActiveRef.current = false
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setActiveTime((prevTime) => prevTime + elapsed)
    }

    // Set interval to periodically update time spent
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        const currentTime = Date.now()
        const elapsed = Math.floor((currentTime - startTimeRef.current) / 1000)

        setActiveTime((prevTime) => {
          const newTime = prevTime + elapsed
          startTimeRef.current = currentTime

          // Send update if enough time has passed since last update
          if (currentTime - lastUpdateRef.current >= updateInterval) {
            sendUpdate(false)
          }

          return newTime
        })
      }
    }, 1000) // Update every second

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Add any active time since last check
      if (isActiveRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setActiveTime((prevTime) => prevTime + elapsed)
      }

      // Send final update
      sendUpdate(true)
    }
  }, [postId, apiEndpoint, updateInterval])

  return { activeTime }
}

/**
 * Custom hook to track social sharing events
 */
export function useSocialShare(postId: string, apiEndpoint = '/api/blog/metrics') {
  // Function to track share events
  const trackShare = async (platform: string) => {
    try {
      await fetch(`${apiEndpoint}?type=share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          platform,
        }),
      })
    } catch (error) {
      console.error(`Failed to track ${platform} share:`, error)
    }
  }

  return { trackShare }
}

interface BlogSearchHookOptions {
  initialQuery?: string
  onSearch?: (query: string) => void
}

/**
 * Hook to manage blog search functionality
 * @param options Configuration options
 * @returns Search state and handlers
 */
export function useBlogSearch(options: BlogSearchHookOptions = {}) {
  const { initialQuery = '', onSearch } = options
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search function
  const searchPosts = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // This would typically be an API call to search endpoint
        // For example, a search API to Payload CMS
        const response = await fetch(`/api/blog/search?q=${encodeURIComponent(searchQuery)}`)

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()
        setResults(data.docs || [])

        // Call the onSearch callback if provided
        if (onSearch) {
          onSearch(searchQuery)
        }
      } catch (err) {
        console.error('Error searching posts:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [onSearch],
  )

  // Debounce search queries
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPosts(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchPosts])

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch: () => setQuery(''),
  }
}

/**
 * Hook to track estimated reading time of blog content
 * @param content Blog content (HTML or text)
 * @returns Estimated reading time in minutes
 */
export function useEstimatedReadingTime(content: string) {
  const [readingTime, setReadingTime] = useState(0)

  useEffect(() => {
    if (!content) {
      setReadingTime(0)
      return
    }

    // Strip HTML tags if present
    const strippedContent = content.replace(/<[^>]*>/g, '')

    // Count words (split by spaces)
    const wordCount = strippedContent.split(/\s+/).length

    // Average reading speed (words per minute)
    const wordsPerMinute = 225

    // Calculate reading time
    const estimatedTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute))

    setReadingTime(estimatedTime)
  }, [content])

  return readingTime
}
