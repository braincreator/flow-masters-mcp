'use client'

import React, { useCallback, useRef, useEffect, useState } from 'react'
import { SearchIcon, X, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface SearchProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  showClearButton?: boolean
  size?: 'default' | 'sm' | 'lg'
  inputClassName?: string
  showSuggestions?: boolean
  onSuggestionsFetch?: (query: string) => Promise<string[]>
  locale?: string
}

export function Search({
  value = '',
  onChange,
  placeholder = 'Search...',
  className,
  showClearButton = true,
  size = 'default',
  inputClassName,
  showSuggestions = false,
  onSuggestionsFetch,
  locale = 'en',
}: SearchProps) {
  const [internalValue, setInternalValue] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Update internal value when external value changes
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value)
    }
  }, [value, internalValue])

  // Load recent searches from localStorage
  useEffect(() => {
    if (showSuggestions) {
      const stored = localStorage.getItem('search-recent-searches')
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored).slice(0, 5))
        } catch (error) {
          logError('Error loading recent searches:', error)
        }
      }
    }
  }, [showSuggestions])

  // Fetch suggestions when value changes
  useEffect(() => {
    if (showSuggestions && onSuggestionsFetch && internalValue.length >= 2) {
      fetchSuggestions(internalValue)
    } else {
      setSuggestions([])
    }
  }, [internalValue, showSuggestions, onSuggestionsFetch])

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!onSuggestionsFetch) return

      setIsLoading(true)
      try {
        const results = await onSuggestionsFetch(query)
        setSuggestions(results)
      } catch (error) {
        logError('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    },
    [onSuggestionsFetch],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    // Always call onChange immediately
    onChange?.(newValue)
  }

  const handleClear = () => {
    setInternalValue('')
    setSuggestions([])
    onChange?.('')
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: string) => {
    logDebug('Suggestion clicked:', suggestion)

    setInternalValue(suggestion)
    // Call onChange immediately when suggestion is clicked
    onChange?.(suggestion)
    setSuggestions([])
    setIsFocused(false)

    // Add to recent searches
    if (showSuggestions) {
      const newRecentSearches = [
        suggestion,
        ...recentSearches.filter((s) => s !== suggestion),
      ].slice(0, 5)

      setRecentSearches(newRecentSearches)
      localStorage.setItem('search-recent-searches', JSON.stringify(newRecentSearches))
    }

    // Blur the input to hide mobile keyboard
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
      setIsFocused(false)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (internalValue.trim()) {
        handleSuggestionClick(internalValue.trim())
      }
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsFocused(false)
        setSuggestions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showDropdown =
    isFocused && showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <SearchIcon
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
            size === 'sm' && 'h-3.5 w-3.5',
            size === 'default' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5',
          )}
        />
        <Input
          ref={inputRef}
          type="search"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-9 pr-9 rounded-lg',
            'border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200',
            'placeholder:text-slate-400',
            size === 'sm' && 'h-8 text-sm',
            size === 'default' && 'h-10 text-sm',
            size === 'lg' && 'h-12 text-base',
            // Hide browser's default clear button for search inputs
            '[&::-webkit-search-cancel-button]:[-webkit-appearance:none]',
            '[&::-ms-clear]:[display:none] [&::-ms-clear]:[width:0] [&::-ms-clear]:[height:0]',
            inputClassName,
          )}
        />
        {showClearButton && internalValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X
              className={cn(
                size === 'sm' && 'h-3.5 w-3.5',
                size === 'default' && 'h-4 w-4',
                size === 'lg' && 'h-5 w-5',
              )}
            />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && !internalValue && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading suggestions...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
