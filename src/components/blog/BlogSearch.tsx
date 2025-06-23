'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search } from '@/components/ui/search'
import { cn } from '@/lib/utils'
import { useSearch } from '@/providers/SearchProvider'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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
  placeholder,
  className,
  preserveParams = false,
  variant = 'default',
  showClearButton = true,
  size = 'default',
}: BlogSearchProps) {
  const t = useTranslations('blog')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get search context (unused in this version)
  const { query: globalQuery, setQuery: setGlobalQuery, search } = useSearch()

  // Get the current locale from the pathname (unused in this version)
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  // Use translation for placeholder if not provided
  const searchPlaceholder = placeholder || t('searchPosts')

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

  // Function to fetch suggestions from API
  const fetchSuggestions = async (query: string): Promise<string[]> => {
    try {
      const response = await fetch(
        `/api/v1/blog/suggestions?q=${encodeURIComponent(query)}&locale=${currentLocale}`,
      )
      if (response.ok) {
        const data = await response.json()
        return data.suggestions || []
      }
    } catch (error) {
      logError('Error fetching blog suggestions:', error)
    }

    // Fallback suggestions
    return [`${query} tutorial`, `${query} guide`, `${query} tips`]
  }

  // Wrapper function to add logging
  const handleSearchChange = (query: string) => {
    logDebug('BlogSearch onChange called with:', query)
    onSearch?.(query)
  }

  return (
    <Search
      value={initialQuery}
      onChange={handleSearchChange}
      placeholder={searchPlaceholder}
      className={className}
      showClearButton={showClearButton}
      size={size}
      showSuggestions={true}
      onSuggestionsFetch={fetchSuggestions}
      locale={currentLocale}
      inputClassName={inputClassName}
    />
  )
}
