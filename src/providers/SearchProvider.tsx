'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useI18n } from '@/providers/I18n'

// Define search result types
export interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt?: string
  type: 'post' | 'page' | 'product' | 'course' | 'service' | 'other'
  url: string
  image?: string
  category?: string
  date?: string
}

// Define search history item
export interface SearchHistoryItem {
  query: string
  timestamp: number
}

// Define the context type
export interface SearchContextType {
  // Search state
  query: string
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  totalResults: number

  // Search history
  searchHistory: SearchHistoryItem[]
  recentSearches: string[]

  // Filters
  activeFilters: {
    type?: string[]
    category?: string[]
    date?: [Date | null, Date | null]
  }

  // Methods
  search: (query: string, filters?: any) => Promise<void>
  setQuery: (query: string) => void
  clearSearch: () => void
  clearSearchHistory: () => void
  removeFromHistory: (query: string) => void
  setActiveFilters: (filters: any) => void
  clearFilters: () => void
  getSearchSuggestions: (input: string) => Promise<string[]>
}

// Create the context
export const SearchContext = createContext<SearchContextType | undefined>(undefined)

// Provider component
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { lang } = useI18n()

  // Search state
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)

  // Search history
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Filters
  const [activeFilters, setActiveFilters] = useState<{
    type?: string[]
    category?: string[]
    date?: [Date | null, Date | null]
  }>({})

  // Load search history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedHistory = localStorage.getItem('search-history')
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory) as SearchHistoryItem[]
          setSearchHistory(parsedHistory)

          // Extract recent searches (last 5, most recent first)
          const recent = parsedHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5)
            .map((item) => item.query)

          setRecentSearches(recent)
        }
      } catch (err) {
        console.error('Error loading search history from localStorage:', err)
      }
    }
  }, [])

  // Save search history to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && searchHistory.length > 0) {
      localStorage.setItem('search-history', JSON.stringify(searchHistory))
    }
  }, [searchHistory])

  // Initialize query from URL on mount
  useEffect(() => {
    const urlQuery =
      searchParams?.get('q') || searchParams?.get('query') || searchParams?.get('search')
    if (urlQuery) {
      setQueryState(urlQuery)
    }
  }, [searchParams])

  // Set query and update URL
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery)

    // Don't update history for empty queries
    if (!newQuery.trim()) return

    // Add to search history
    setSearchHistory((prev) => {
      // Remove existing entry with same query if exists
      const filtered = prev.filter((item) => item.query.toLowerCase() !== newQuery.toLowerCase())

      // Add new entry at the beginning
      const newHistory = [{ query: newQuery, timestamp: Date.now() }, ...filtered].slice(0, 20) // Keep only last 20 searches

      // Update recent searches
      setRecentSearches(
        newHistory
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5)
          .map((item) => item.query),
      )

      return newHistory
    })
  }, [])

  // Perform search
  const search = useCallback(
    async (searchQuery: string, filters = {}) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([])
        setTotalResults(0)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Import the API utility functions dynamically to avoid circular dependencies
        const { searchApi } = await import('@/lib/api')

        // Search using the API utility function
        const data = await searchApi.search(searchQuery, filters, lang)

        setResults(data.results || [])
        setTotalResults(data.totalResults || data.results?.length || 0)

        // Update URL with search query
        const currentParams = new URLSearchParams(searchParams?.toString() || '')
        currentParams.set('q', searchQuery)

        // Add filters to URL
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            currentParams.delete(key)
            value.forEach((v) => currentParams.append(key, v))
          } else if (value !== undefined && value !== null) {
            currentParams.set(key, String(value))
          } else {
            currentParams.delete(key)
          }
        })

        // Update URL without refreshing the page
        const newUrl = `${pathname}?${currentParams.toString()}`
        router.push(newUrl, { scroll: false })

        // Add to search history
        setQuery(searchQuery)
      } catch (err) {
        console.error('Error performing search:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while searching')
        setResults([])
        setTotalResults(0)
      } finally {
        setIsLoading(false)
      }
    },
    [lang, pathname, router, searchParams, setQuery],
  )

  // Clear search
  const clearSearch = useCallback(() => {
    setQueryState('')
    setResults([])
    setTotalResults(0)
    setError(null)

    // Update URL to remove search query
    const currentParams = new URLSearchParams(searchParams?.toString() || '')
    currentParams.delete('q')
    currentParams.delete('query')
    currentParams.delete('search')

    // Remove filter params
    Object.keys(activeFilters).forEach((key) => {
      currentParams.delete(key)
    })

    const newUrl = `${pathname}?${currentParams.toString()}`
    router.push(newUrl, { scroll: false })
  }, [activeFilters, pathname, router, searchParams])

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([])
    setRecentSearches([])
    localStorage.removeItem('search-history')
  }, [])

  // Remove a specific query from history
  const removeFromHistory = useCallback((queryToRemove: string) => {
    setSearchHistory((prev) => {
      const newHistory = prev.filter((item) => item.query !== queryToRemove)

      // Update recent searches
      setRecentSearches(
        newHistory
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5)
          .map((item) => item.query),
      )

      return newHistory
    })
  }, [])

  // Update active filters
  const setFilters = useCallback((filters: any) => {
    setActiveFilters(filters)
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters({})
  }, [])

  // Get search suggestions based on input
  const getSearchSuggestions = useCallback(async (input: string): Promise<string[]> => {
    if (!input || input.trim().length < 2) {
      return []
    }

    try {
      // Import the API utility functions dynamically to avoid circular dependencies
      const { searchApi } = await import('@/lib/api')

      // Get suggestions using the API utility function
      const data = await searchApi.getSuggestions(input)
      return data.suggestions || []
    } catch (err) {
      console.error('Error fetching search suggestions:', err)
      return []
    }
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const value = React.useMemo(
    () => ({
      // State
      query,
      results,
      isLoading,
      error,
      totalResults,
      searchHistory,
      recentSearches,
      activeFilters,

      // Methods
      search,
      setQuery,
      clearSearch,
      clearSearchHistory,
      removeFromHistory,
      setActiveFilters: setFilters,
      clearFilters,
      getSearchSuggestions,
    }),
    [
      query,
      results,
      isLoading,
      error,
      totalResults,
      searchHistory,
      recentSearches,
      activeFilters,
      search,
      setQuery,
      clearSearch,
      clearSearchHistory,
      removeFromHistory,
      setFilters,
      clearFilters,
      getSearchSuggestions,
    ],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

// Custom hook to use the search context
export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
