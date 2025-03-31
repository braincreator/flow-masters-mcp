'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BlogSearchProps {
  onSearch?: (query: string) => void
  initialQuery?: string
  placeholder?: string
  className?: string
  preserveParams?: boolean
  variant?: 'default' | 'minimal'
}

export function BlogSearch({
  onSearch,
  initialQuery = '',
  placeholder = 'Search posts...',
  className,
  preserveParams = false,
  variant = 'default',
}: BlogSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get the current locale from the pathname
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // If there's an onSearch prop, call it
    if (onSearch) {
      onSearch(query)
      return
    }

    // Otherwise update the URL and perform a router-based search
    if (!query.trim() && !initialQuery) return

    setIsSearching(true)

    // Create new search params
    const params = new URLSearchParams(preserveParams ? searchParams.toString() : '')

    if (query.trim()) {
      params.set('search', query.trim())
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page on new search

    // Navigate to search results
    router.push(`/${currentLocale}/blog?${params.toString()}`)
  }

  // Handle clear search
  const handleClear = () => {
    setQuery('')

    if (onSearch) {
      onSearch('')
      return
    }

    // Remove search from URL
    const params = new URLSearchParams(preserveParams ? searchParams.toString() : '')
    params.delete('search')
    params.delete('page')

    router.push(`/${currentLocale}/blog?${params.toString()}`)

    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  // Reset isSearching state when the search is complete
  useEffect(() => {
    setIsSearching(false)
  }, [searchParams])

  // Update query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('relative w-full', variant === 'minimal' ? 'max-w-sm' : 'max-w-md', className)}
    >
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>

        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className={cn(
            'pl-10 pr-10 bg-background border-input',
            variant === 'minimal'
              ? 'h-9'
              : 'shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow',
            isSearching ? 'opacity-80' : '',
          )}
          disabled={isSearching}
        />

        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
            onClick={handleClear}
            disabled={isSearching}
          >
            <span className="sr-only">Clear search</span>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
