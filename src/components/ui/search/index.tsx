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
        <SearchIcon
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
            size === 'sm' && 'h-3.5 w-3.5',
            size === 'default' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5',
          )}
        />
        <Input
          type="search"
          value={value}
          onChange={handleChange}
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
        {showClearButton && value && (
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
    </div>
  )
}
