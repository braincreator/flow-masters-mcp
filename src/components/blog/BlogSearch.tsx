'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import debounce from 'lodash.debounce' // Import debounce
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
  debounceMs?: number // Add debounceMs to the interface
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
  debounceMs, // Add debounceMs to prop destructuring
}: BlogSearchProps) {
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get search context
  const { query: globalQuery, setQuery: setGlobalQuery, search } = useSearch()

  // Get the current locale from the pathname
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  // The onChange prop from the parent (page.client.tsx) is already debounced.
  // We just need to pass the value and the onChange handler down to the generic Search component.

  // Effect to update local query when initialQuery prop changes
  useEffect(() => {
    setLocalQuery(initialQuery);
  }, [initialQuery]);

  // Effect to debounce local query changes and call onSearch
  useEffect(() => {
    const handler = debounce(() => {
      onSearch?.(localQuery);
    }, debounceMs) as typeof onSearch & { cancel: () => void }; // Type assertion to include cancel

    // Call the debounced handler
    handler();

    // Cleanup: Cancel the debounced call on unmount or when dependencies change
    return () => {
      handler.cancel();
    };
  }, [localQuery, debounceMs, onSearch]); // Dependencies: localQuery, debounceMs, and onSearch

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
      onChange={setLocalQuery} // Update local state directly
      placeholder={placeholder}
      className={className}
      showClearButton={showClearButton}
      size={size}
      // debounceMs is handled internally by this component's useEffect
      inputClassName={inputClassName}
    />
  )
}
