'use client'

import React, { useCallback } from 'react'
import debounce from 'lodash.debounce'
import { SearchIcon, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  showClearButton?: boolean
  size?: 'default' | 'sm' | 'lg'
  inputClassName?: string
}

export function Search({
  value = '',
  onChange,
  placeholder = 'Search...',
  className,
  debounceMs = 500,
  showClearButton = true,
  size = 'default',
  inputClassName,
}: SearchProps) {
  const debouncedOnChange = useCallback(
    debounce((value: string) => {
      onChange?.(value)
    }, debounceMs),
    [onChange, debounceMs],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    debouncedOnChange(newValue)
  }

  const handleClear = () => {
    onChange?.('')
  }

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'w-full pl-9 pr-9',
            size === 'sm' && 'h-8 text-sm',
            size === 'lg' && 'h-12 text-lg',
            inputClassName,
          )}
        />
        {showClearButton && value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
