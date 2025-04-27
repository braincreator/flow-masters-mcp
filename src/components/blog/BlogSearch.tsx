'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from '@/components/ui/search'
import { cn } from '@/lib/utils'
import { useSearch } from '@/providers/SearchProvider'

export interface BlogSearchProps {
  onSearch?: (query: string) => void
  initialQuery?: string
  placeholder?: string
  className?: string
  preserveParams?: boolean
  variant?: 'default' | 'minimal' | 'sidebar' | 'product-style'
  showClearButton?: boolean
  size?: 'default' | 'sm' | 'lg'
}

export function BlogSearch({
  onSearch,
  initialQuery = '',
  placeholder = 'Search posts...',
  className,
  preserveParams = false,
  variant = 'default',
  showClearButton = true,
  size = 'default',
}: BlogSearchProps) {
  const [localQuery, setLocalQuery] = useState(initialQuery)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get search context
  const { query: globalQuery, setQuery: setGlobalQuery, search } = useSearch()

  // Get the current locale from the pathname
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  // Handle the search query change
  const handleSearchChange = (value: string) => {
    setLocalQuery(value)

    // Update global search context
    setGlobalQuery(value)

    // If there's an onSearch prop, call it
    if (onSearch) {
      onSearch(value)

      // Also perform search in global context
      if (value.trim().length >= 2) {
        search(value)
      }
      return
    }

    // Otherwise update the URL and perform a router-based search
    if (!value.trim() && !initialQuery) return

    // Create new search params
    const params = new URLSearchParams(preserveParams ? searchParams.toString() : '')

    if (value.trim()) {
      params.set('search', value.trim())
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page on new search

    // Navigate to search results using client-side navigation
    router.push(`/${currentLocale}/blog?${params.toString()}`, { scroll: false })
  }

  // Update query when initialQuery or globalQuery changes
  useEffect(() => {
    // Prefer initialQuery from props if provided
    if (initialQuery) {
      setLocalQuery(initialQuery)
    }
    // Otherwise use global query from context if available
    else if (globalQuery && globalQuery !== localQuery) {
      setLocalQuery(globalQuery)
    }
  }, [initialQuery, globalQuery, localQuery])

  // Get the appropriate className based on variant
  let inputClassName = ''

  if (variant === 'product-style') {
    inputClassName = cn(
      'rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200',
    )
  } else if (variant === 'default') {
    inputClassName = cn(
      'rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200',
    )
  } else if (variant === 'minimal') {
    inputClassName = cn('border border-border rounded-lg')
  } else if (variant === 'sidebar') {
    inputClassName = cn('border border-border rounded-lg shadow-sm')
  }

  return (
    <Search
      value={localQuery}
      onChange={handleSearchChange}
      placeholder={placeholder}
      className={className}
      showClearButton={showClearButton}
      size={size}
      debounceMs={300}
      inputClassName={inputClassName}
    />
  )
}
