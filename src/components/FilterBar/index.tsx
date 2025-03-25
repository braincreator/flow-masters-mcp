'use client'

import React, { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import debounce from 'lodash.debounce'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GridIcon, ListIcon, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { useDropdown } from '@/providers/DropdownContext'

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
  const { setOpenDropdown } = useDropdown()

  const [layout, setLayout] = React.useState<'grid' | 'list'>(
    (searchParams.get('layout') as 'grid' | 'list') || defaultLayout
  )

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'layout') {
      params.delete('page')
    }
    return `?${params.toString()}`
  }

  const handleLayoutChange = (newLayout: 'grid' | 'list') => {
    setLayout(newLayout)
    setOpenDropdown(null) // Закрываем все открытые дропдауны при смене лейаута
    const newUrl = updateSearchParams('layout', newLayout)
    router.push(newUrl)
  }

  const handleSelectClick = (dropdownId: string) => {
    setOpenDropdown((current) => (current === dropdownId ? null : dropdownId))
  }

  const debouncedSearch = useCallback(
    debounce((value) => {
      router.push(updateSearchParams('search', value));
    }, 500),
    [router, updateSearchParams]
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  return (
    <div className="relative glass-effect p-4 mb-8 [&_*]:!ring-0 [&_*]:!focus:ring-0 [&_*]:!focus:ring-offset-0 [&_*]:!outline-none">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder={labels.searchPlaceholder}
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 pl-12 pr-4 rounded-md bg-muted/40 dark:bg-muted/20 border border-border dark:border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none hover:border-accent dark:hover:border-accent transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-4 shrink-0 relative z-10">
          <div className="relative [&>*]:rounded-md [&>*]:border-0 group">
            <Select
              defaultValue={searchParams.get('category') || 'all'}
              onValueChange={(value) => {
                router.push(updateSearchParams('category', value))
                setOpenDropdown(null)
              }}
            >
              <SelectTrigger className="!w-[180px] !border !border-border dark:!border-border/50 !transition-all !duration-200 group-hover:!border-accent group-hover:dark:!border-accent">
                <SelectValue placeholder={labels.categories} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value="all">{labels.allCategories}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative [&>*]:rounded-md [&>*]:border-0 group">
            <Select
              defaultValue={searchParams.get('sort') || 'newest'}
              onValueChange={(value) => {
                router.push(updateSearchParams('sort', value))
                setOpenDropdown(null)
              }}
            >
              <SelectTrigger className="!w-[180px] !border !border-border dark:!border-border/50 !transition-all !duration-200 group-hover:!border-accent group-hover:dark:!border-accent">
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
          </div>

          <div 
            className="flex gap-2 h-10 p-1 bg-muted/40 dark:bg-muted/20 rounded-[8px] relative border border-border/50"
            style={{ isolation: 'isolate' }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleLayoutChange('grid')
              }}
              className={cn(
                "relative z-20",
                "h-8 w-8 p-0 rounded-[6px]",
                "flex items-center justify-center",
                "transition-colors duration-200",
                "border border-transparent",
                layout === 'grid' && "bg-accent text-accent-foreground border-accent/50",
                layout !== 'grid' && "hover:bg-accent hover:text-accent-foreground hover:border-accent/50"
              )}
            >
              <GridIcon className="h-4 w-4" />
              <span className="sr-only">{labels.layout.grid}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleLayoutChange('list')
              }}
              className={cn(
                "relative z-20",
                "h-8 w-8 p-0 rounded-[6px]",
                "flex items-center justify-center",
                "transition-colors duration-200",
                "border border-transparent",
                layout === 'list' && "bg-accent text-accent-foreground border-accent/50",
                layout !== 'list' && "hover:bg-accent hover:text-accent-foreground hover:border-accent/50"
              )}
            >
              <ListIcon className="h-4 w-4" />
              <span className="sr-only">{labels.layout.list}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
