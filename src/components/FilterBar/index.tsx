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
import { GridIcon, ListIcon, SearchIcon } from 'lucide-react'

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

  return (
    <div className="glass-card p-4 mb-8 animate-smooth">
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="search"
            placeholder={labels.searchPlaceholder}
            value={currentSearch}
            onChange={(e) => router.push(`?${createQueryString('search', e.target.value)}`)}
            className="w-full h-10 pl-12 pr-4 rounded-md
                     bg-background/50 border border-border/50
                     focus:ring-2 focus:ring-ring focus:ring-offset-0
                     placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Categories Select */}
          <Select value={currentCategory} onValueChange={(value) => router.push(`?${createQueryString('category', value)}`)}>
            <SelectTrigger className="w-[180px] h-10 bg-background/50">
              <SelectValue placeholder={labels.categories} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.allCategories}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Select */}
          <Select value={currentSort} onValueChange={(value) => router.push(`?${createQueryString('sort', value)}`)}>
            <SelectTrigger className="w-[180px] h-10 bg-background/50">
              <SelectValue placeholder={labels.sort} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Layout Toggle */}
          <div className="flex h-10 gap-0.5 p-1 bg-background/50 rounded-md border border-border/50">
            <button
              onClick={() => router.push(`?${createQueryString('layout', 'grid')}`)}
              className={`px-3 rounded transition-colors duration-200 ${
                currentLayout === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-label={labels.layout.grid}
            >
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push(`?${createQueryString('layout', 'list')}`)}
              className={`px-3 rounded transition-colors duration-200 ${
                currentLayout === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-label={labels.layout.list}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
