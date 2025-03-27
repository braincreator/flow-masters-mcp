'use client'

import React, { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import debounce from 'lodash.debounce'
import { GridIcon, ListIcon, SearchIcon, SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { useDropdown } from '@/providers/DropdownContext'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { translations } from '@/app/(frontend)/[lang]/products/translations'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FilterBarProps {
  categories: Array<{ label: string; value: string }>
  sortOptions: Array<{ label: string; value: string }>
  productTypes: Array<{ label: string; value: string }>
  tags: Array<{ label: string; value: string }>
  priceRange: { min: number; max: number }
  defaultLayout?: 'grid' | 'list'
  locale?: string
  showFavorites?: boolean
  currency?: {
    code: string // USD, EUR, RUB, etc.
    symbol: string // $, €, ₽, etc.
    position: 'before' | 'after' // $ before number or after
    rate?: number // conversion rate from base currency
  }
  labels?: {
    categories: string
    sort: string
    search: string
    searchPlaceholder: string
    allCategories: string
    productTypes: string
    tags: string
    priceRange: string
    layout: string
    favorites?: string
  }
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  sortOptions,
  productTypes,
  tags,
  priceRange,
  defaultLayout = 'grid',
  locale,
  showFavorites = false,
  currency = { code: 'USD', symbol: '$', position: 'before', rate: 1 },
  labels,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setOpenDropdown } = useDropdown()
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false)
  const [isSortOpen, setIsSortOpen] = React.useState(false)

  // Use translations if locale is provided, otherwise use labels prop
  const t = locale
    ? translations[locale as keyof typeof translations]
    : {
        filters: {
          categories: labels?.categories || 'Categories',
          sort: labels?.sort || 'Sort',
          search: labels?.search || 'Search',
          searchPlaceholder: labels?.searchPlaceholder || 'Search products...',
          productTypes: labels?.productTypes || 'Product Types',
          tags: labels?.tags || 'Tags',
          priceRange: labels?.priceRange || 'Price Range',
          layout: {
            grid: labels?.layout?.grid || 'Grid',
            list: labels?.layout?.list || 'List',
          },
        },
        categories: {
          all: labels?.allCategories || 'All Categories',
        },
      }

  const [layout, setLayout] = React.useState<'grid' | 'list'>(
    (searchParams.get('layout') as 'grid' | 'list') || defaultLayout,
  )
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false)
  const [currentPriceRange, setCurrentPriceRange] = React.useState<[number, number]>([
    parseInt(searchParams.get('minPrice') || priceRange.min.toString()),
    parseInt(searchParams.get('maxPrice') || priceRange.max.toString()),
  ])

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
    setOpenDropdown(null)
    const newUrl = updateSearchParams('layout', newLayout)
    router.push(newUrl)
  }

  const debouncedSearch = useCallback(
    debounce((value) => {
      router.push(updateSearchParams('search', value))
    }, 500),
    [router, updateSearchParams],
  )

  const handleSearch = (value: string) => {
    debouncedSearch(value)
  }

  const handleCategoryChange = (categoryValue: string) => {
    router.push(updateSearchParams('category', categoryValue))
  }

  const handleSortChange = (sortValue: string) => {
    router.push(updateSearchParams('sort', sortValue))
  }

  const handleProductTypeChange = (typeValue: string) => {
    router.push(updateSearchParams('productType', typeValue))
  }

  const handleTagChange = (tagValue: string) => {
    router.push(updateSearchParams('tag', tagValue))
  }

  const handlePriceRangeChange = (values: number[]) => {
    setCurrentPriceRange(values)
    const params = new URLSearchParams(searchParams.toString())
    params.set('minPrice', values[0].toString())
    params.set('maxPrice', values[1].toString())
    router.push(`?${params.toString()}`)
  }

  // Format price for display with appropriate currency
  const formatPrice = (price: number) => {
    const formattedNumber = Math.round(price * (currency.rate || 1)).toLocaleString(
      locale || 'en-US',
    )
    return currency.position === 'before'
      ? `${currency.symbol}${formattedNumber}`
      : `${formattedNumber} ${currency.symbol}`
  }

  const currentCategory = searchParams.get('category') || 'all'
  const currentSort = searchParams.get('sort') || 'newest'
  const currentProductType = searchParams.get('productType') || 'all'
  const currentTag = searchParams.get('tag') || 'all'
  const currentSearch = searchParams.get('search') || ''

  // Open filter dialog
  const openFiltersDialog = () => {
    setIsFiltersOpen(true)
  }

  // Reset all filters
  const resetAllFilters = () => {
    handleCategoryChange('all')
    handleProductTypeChange('all')
    handleTagChange('all')
    handlePriceRangeChange([priceRange.min, priceRange.max])
    handleSearch('')
  }

  // Reset only specific filter
  const hasActiveFilters =
    currentCategory !== 'all' ||
    currentProductType !== 'all' ||
    currentTag !== 'all' ||
    currentSearch ||
    currentPriceRange[0] !== priceRange.min ||
    currentPriceRange[1] !== priceRange.max

  const handleFavoritesToggle = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get('favorites') === 'true') {
      params.delete('favorites')
    } else {
      params.set('favorites', 'true')
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4 mb-8 border-b pb-6">
      {/* Main Controls Row - Search, Filters, Sort, and Layout */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={t.filters.searchPlaceholder}
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-base w-full h-10 pl-10 pr-4 rounded-lg"
          />
        </div>

        {/* Favorites Toggle Button */}
        <Button
          variant={searchParams.get('favorites') === 'true' ? 'default' : 'outline'}
          onClick={handleFavoritesToggle}
          className="h-10 px-3 justify-center"
        >
          <svg
            className={`mr-2 h-4 w-4 ${searchParams.get('favorites') === 'true' ? 'fill-white' : 'stroke-current fill-none'}`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{labels?.favorites || 'Избранное'}</span>
        </Button>

        {/* Filters Button */}
        <Button
          variant="outline"
          onClick={openFiltersDialog}
          className="h-10 px-3 justify-center bg-background hover:bg-accent hover:text-accent-foreground border border-border"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          <span>{t.filters.filters || 'Фильтры'}</span>
          {hasActiveFilters && (
            <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
              {
                [
                  currentCategory !== 'all',
                  currentProductType !== 'all',
                  currentTag !== 'all',
                  currentPriceRange[0] !== priceRange.min ||
                    currentPriceRange[1] !== priceRange.max,
                ].filter(Boolean).length
              }
            </span>
          )}
        </Button>

        {/* Sort Dropdown */}
        <div>
          <Button
            variant="outline"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="h-10 px-3 justify-center bg-background hover:bg-accent hover:text-accent-foreground border border-border"
          >
            <span className="mr-1">{t.filters.sort || 'Сортировка'}</span>
            <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
          </Button>
          {isSortOpen && (
            <div className="absolute z-10 mt-1 bg-background rounded-lg shadow-lg border border-border p-1 w-[220px]">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  onClick={() => {
                    handleSortChange(option.value)
                    setIsSortOpen(false)
                  }}
                  className={cn(
                    'w-full justify-start text-left mb-1 last:mb-0 hover:bg-accent hover:text-accent-foreground',
                    currentSort === option.value && 'bg-accent text-accent-foreground font-medium',
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={resetAllFilters}
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-destructive hover:text-destructive-foreground border border-transparent hover:border-destructive"
            title={t.filters.clearAll || 'Сбросить все фильтры'}
          >
            <X className="h-4 w-4 text-destructive" />
            <span className="sr-only">{t.filters.clearAll || 'Сбросить все фильтры'}</span>
          </Button>
        )}

        {/* Layout Toggle */}
        <div className="flex-none ml-auto flex gap-2 h-10 p-1 bg-background rounded-lg relative border border-border">
          <button
            type="button"
            onClick={() => handleLayoutChange('grid')}
            className={cn(
              'relative z-20',
              'h-8 px-2 rounded-md',
              'flex items-center justify-center',
              'transition-all duration-200',
              'border border-transparent',
              layout === 'grid' && 'bg-accent text-accent-foreground shadow-sm',
              layout !== 'grid' && 'hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <GridIcon className="h-4 w-4 mr-1" />
            <span className="text-xs hidden sm:inline">{t.filters.layout.grid}</span>
          </button>

          <button
            type="button"
            onClick={() => handleLayoutChange('list')}
            className={cn(
              'relative z-20',
              'h-8 px-2 rounded-md',
              'flex items-center justify-center',
              'transition-all duration-200',
              'border border-transparent',
              layout === 'list' && 'bg-accent text-accent-foreground shadow-sm',
              layout !== 'list' && 'hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <ListIcon className="h-4 w-4 mr-1" />
            <span className="text-xs hidden sm:inline">{t.filters.layout.list}</span>
          </button>
        </div>
      </div>

      {/* Active Filters Chips - Visible when there are active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentCategory !== 'all' && (
            <div className="inline-flex items-center bg-accent/10 px-3 py-1 rounded-full text-sm border border-accent/20">
              <span className="mr-1">
                {categories.find((c) => c.value === currentCategory)?.label || currentCategory}
              </span>
              <button
                onClick={() => handleCategoryChange('all')}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear category filter"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}

          {currentProductType !== 'all' && (
            <div className="inline-flex items-center bg-accent/10 px-3 py-1 rounded-full text-sm border border-accent/20">
              <span className="mr-1">
                {t.filters.productType[currentProductType as keyof typeof t.filters.productType] ||
                  productTypes.find((t) => t.value === currentProductType)?.label ||
                  currentProductType}
              </span>
              <button
                onClick={() => handleProductTypeChange('all')}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear product type filter"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}

          {currentTag !== 'all' && (
            <div className="inline-flex items-center bg-accent/10 px-3 py-1 rounded-full text-sm border border-accent/20">
              <span className="mr-1">
                {tags.find((t) => t.value === currentTag)?.label || currentTag}
              </span>
              <button
                onClick={() => handleTagChange('all')}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear tag filter"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}

          {(currentPriceRange[0] !== priceRange.min || currentPriceRange[1] !== priceRange.max) && (
            <div className="inline-flex items-center bg-accent/10 px-3 py-1 rounded-full text-sm border border-accent/20">
              <span className="mr-1">
                {formatPrice(currentPriceRange[0])} - {formatPrice(currentPriceRange[1])}
              </span>
              <button
                onClick={() => handlePriceRangeChange([priceRange.min, priceRange.max])}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear price filter"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filters Dialog */}
      <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border border-border">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{t.filters.filters || 'Фильтры'}</DialogTitle>
            <DialogDescription>
              {t.filters.filtersDescription || 'Выберите фильтры для товаров'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-4 max-h-[70vh] overflow-y-auto">
            {/* Categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{t.filters.categories}</h3>
              <Select value={currentCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="select-trigger w-full">
                  <SelectValue placeholder={t.filters.categories} />
                </SelectTrigger>
                <SelectContent className="border border-border">
                  <SelectItem value="all">{t.filters.categories}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Types */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{t.filters.productType.label}</h3>
              <Select value={currentProductType} onValueChange={handleProductTypeChange}>
                <SelectTrigger className="select-trigger w-full">
                  <SelectValue placeholder={t.filters.productType.all} />
                </SelectTrigger>
                <SelectContent className="border border-border">
                  <SelectItem value="all">{t.filters.productType.all}</SelectItem>
                  {productTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t.filters.productType[type.value as keyof typeof t.filters.productType] ||
                        type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{t.filters.tags}</h3>
              <Select value={currentTag} onValueChange={handleTagChange}>
                <SelectTrigger className="select-trigger w-full">
                  <SelectValue placeholder={t.filters.tags} />
                </SelectTrigger>
                <SelectContent className="border border-border">
                  <SelectItem value="all">{t.filters.tags}</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.value} value={tag.value}>
                      {tag.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t.filters.priceRange.label}</h3>
                <span className="text-xs bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full border border-accent/20">
                  {formatPrice(currentPriceRange[0])} - {formatPrice(currentPriceRange[1])}
                </span>
              </div>
              <div className="px-4 py-4 rounded-lg bg-background border border-border">
                <Slider
                  value={currentPriceRange}
                  onValueChange={handlePriceRangeChange}
                  min={priceRange.min}
                  max={priceRange.max}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-3">
                  <span>{formatPrice(priceRange.min)}</span>
                  <div className="h-4 border-l border-border/50"></div>
                  <div className="h-4 border-l border-border/50"></div>
                  <div className="h-4 border-l border-border/50"></div>
                  <span>{formatPrice(priceRange.max)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 py-3 border-t border-border">
            <Button
              variant="outline"
              onClick={resetAllFilters}
              className="mr-auto border border-border"
            >
              {t.filters.clearAll || 'Сбросить'}
            </Button>
            <Button onClick={() => setIsFiltersOpen(false)} className="border border-accent/20">
              {t.filters.apply || 'Применить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
