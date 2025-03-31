'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to track reading progress of a blog post
 * @returns Reading progress as a percentage (0-100)
 */
export function useReadingProgress() {
  const [progress, setProgress] = useState(0)

  const scrollListener = useCallback(() => {
    // If we're in a browser environment
    if (typeof window !== 'undefined') {
      // Get the total height of the document
      const totalHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight

      // Get current scroll position
      const scrollPosition = window.scrollY

      // Calculate progress
      if (totalHeight) {
        setProgress(Number(((scrollPosition / totalHeight) * 100).toFixed(0)))
      }
    }
  }, [])

  useEffect(() => {
    // Add scroll event listener
    window.addEventListener('scroll', scrollListener)

    // Call once to set initial value
    scrollListener()

    // Clean up
    return () => {
      window.removeEventListener('scroll', scrollListener)
    }
  }, [scrollListener])

  return progress
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
