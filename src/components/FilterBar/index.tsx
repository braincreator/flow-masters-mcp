'use client'

import React, { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GridIcon, ListIcon } from 'lucide-react'

interface FilterBarProps {
  categories: Array<{ label: string; value: string }>
  sortOptions: Array<{ label: string; value: string }>
  defaultLayout?: 'grid' | 'list'
  labels: {
    categories: string
    sort: string
    search: string
    searchPlaceholder: string
    allCategories: string
    layout: {
      grid: string
      list: string
    }
  }
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  sortOptions,
  defaultLayout = 'grid',
  labels,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const currentCategory = searchParams.get('category') || 'all'
  const currentSort = searchParams.get('sort') || 'newest'
  const currentLayout = searchParams.get('layout') || defaultLayout
  const currentSearch = searchParams.get('search') || ''

  const handleCategoryChange = (value: string) => {
    router.push(`?${createQueryString('category', value)}`)
  }

  const handleSortChange = (value: string) => {
    router.push(`?${createQueryString('sort', value)}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 rounded-lg border border-border bg-card">
      {/* Search Input */}
      <div className="relative flex-1">
        <input
          type="search"
          placeholder={labels.searchPlaceholder}
          value={currentSearch}
          onChange={(e) => router.push(`?${createQueryString('search', e.target.value)}`)}
          className="w-full px-4 py-2 rounded-md border border-border
                   bg-background text-foreground
                   placeholder:text-muted-foreground
                   focus:outline-none focus:ring-2 focus:ring-primary
                   transition duration-200"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Categories and Sort Selects */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={currentCategory}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={labels.categories} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.allCategories}</SelectItem>
              {categories.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={currentSort}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={labels.sort} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Layout Toggle */}
        <div className="flex gap-2 border border-border rounded-md p-1 bg-background">
          <button
            onClick={() => router.push(`?${createQueryString('layout', 'grid')}`)}
            className={`p-2 rounded transition-colors
                      ${currentLayout === 'grid' 
                        ? 'bg-muted text-primary' 
                        : 'text-foreground hover:text-primary hover:bg-muted'}`}
            aria-label={labels.layout.grid}
          >
            <GridIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`?${createQueryString('layout', 'list')}`)}
            className={`p-2 rounded transition-colors
                      ${currentLayout === 'list' 
                        ? 'bg-muted text-primary' 
                        : 'text-foreground hover:text-primary hover:bg-muted'}`}
            aria-label={labels.layout.list}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
