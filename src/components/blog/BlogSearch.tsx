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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get search context (unused in this version)
  const { query: globalQuery, setQuery: setGlobalQuery, search } = useSearch()

  // Get the current locale from the pathname (unused in this version)
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

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
      value={initialQuery}
      onChange={onSearch}
      placeholder={placeholder}
      className={className}
      showClearButton={showClearButton}
      size={size}
      debounceMs={300}
      // debounceMs is handled internally by the generic Search component
      inputClassName={inputClassName}
    />
  )
}
