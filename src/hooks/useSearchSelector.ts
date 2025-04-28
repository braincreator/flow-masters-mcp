'use client'

import { useContext } from 'react'
import { SearchContext, SearchContextType } from '@/providers/SearchProvider' // Added SearchContextType import

/**
 * Custom hook to select specific parts of the search context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 *
 * @param selector A function that selects specific parts of the search context
 * @returns The selected parts of the search context
 */
export function useSearchSelector<T>(selector: (context: SearchContextType) => T): T {
  // Changed 'any' to 'SearchContextType'
  const context = useContext(SearchContext)

  if (context === undefined) {
    throw new Error('useSearchSelector must be used within a SearchProvider')
  }

  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the current search state from the search context
 */
export function useSearchState() {
  return useSearchSelector((context) => ({
    query: context.query,
    results: context.results,
    isLoading: context.isLoading,
    error: context.error,
    totalResults: context.totalResults,
    setQuery: context.setQuery,
    search: context.search,
    clearSearch: context.clearSearch,
  }))
}

/**
 * Select only the search history state from the search context
 */
export function useSearchHistory() {
  return useSearchSelector((context) => ({
    searchHistory: context.searchHistory,
    recentSearches: context.recentSearches,
    clearSearchHistory: context.clearSearchHistory,
    removeFromHistory: context.removeFromHistory,
  }))
}

/**
 * Select only the filter state from the search context
 */
export function useSearchFilters() {
  return useSearchSelector((context) => ({
    activeFilters: context.activeFilters,
    setActiveFilters: context.setActiveFilters,
    clearFilters: context.clearFilters,
  }))
}

/**
 * Select only the suggestions functionality from the search context
 */
export function useSearchSuggestions() {
  return useSearchSelector((context) => ({
    query: context.query,
    getSearchSuggestions: context.getSearchSuggestions,
  }))
}
