'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BlogSearchProps {
  onSearch?: (query: string) => void
  initialQuery?: string
  placeholder?: string
  className?: string
}

export function BlogSearch({
  onSearch,
  initialQuery = '',
  placeholder = 'Search posts...',
  className,
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
    if (!query.trim()) return

    setIsSearching(true)

    // Create new search params
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set('search', query)
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
    const params = new URLSearchParams(searchParams)
    params.delete('search')
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

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className="pr-10"
          disabled={isSearching}
        />

        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={handleClear}
            disabled={isSearching}
          >
            <span className="sr-only">Clear search</span>
            <span aria-hidden="true">×</span>
          </Button>
        ) : (
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        )}
      </div>
    </form>
  )
}
