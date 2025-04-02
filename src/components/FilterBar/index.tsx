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
import { useFavorites } from '@/hooks/useFavorites'

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
  const { setOpenDropdown, openDropdown } = useDropdown()
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false)
  const [isSortOpen, setIsSortOpen] = React.useState(false)

  // Local state for filter values in the dialog
  const [tempCategory, setTempCategory] = React.useState(searchParams.get('category') || 'all')
  const [tempProductType, setTempProductType] = React.useState(
    searchParams.get('productType') || 'all',
  )
  const [tempTag, setTempTag] = React.useState(searchParams.get('tag') || 'all')
  const [tempPriceRange, setTempPriceRange] = React.useState<[number, number]>([
    parseInt(searchParams.get('minPrice') || priceRange.min.toString()),
    parseInt(searchParams.get('maxPrice') || priceRange.max.toString()),
  ])

  // Debug - Log the categories prop
  React.useEffect(() => {
    console.log('FilterBar categories prop:', categories)
  }, [categories])

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
          priceRange: {
            label: labels?.priceRange || 'Price Range',
            min: 'Min',
            max: 'Max',
            from: 'From',
            to: 'To',
            selected: 'Selected',
            reset: 'Reset',
          },
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
  const [appliedPriceRange, setAppliedPriceRange] = React.useState<[number, number]>([
    parseInt(searchParams.get('minPrice') || priceRange.min.toString()),
    parseInt(searchParams.get('maxPrice') || priceRange.max.toString()),
  ])

  // Effect to handle closing dropdowns when dropdown context changes
  React.useEffect(() => {
    if (openDropdown !== 'sort-dropdown') {
      setIsSortOpen(false)
    }
  }, [openDropdown])

  // Effect to reset temp filters when dialog opens
  React.useEffect(() => {
    if (isFiltersOpen) {
      // Reset temp filters to current URL params when dialog opens
      setTempCategory(searchParams.get('category') || 'all')
      setTempProductType(searchParams.get('productType') || 'all')
      setTempTag(searchParams.get('tag') || 'all')

      // Use database values for min/max prices if no URL params
      const urlMinPrice = searchParams.get('minPrice')
      const urlMaxPrice = searchParams.get('maxPrice')

      setTempPriceRange([
        urlMinPrice ? parseInt(urlMinPrice) : priceRange.min,
        urlMaxPrice ? parseInt(urlMaxPrice) : priceRange.max,
      ])
    }
  }, [isFiltersOpen, searchParams, priceRange])

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
    router.replace(newUrl, { scroll: false })
  }

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.replace(updateSearchParams('search', value), { scroll: false })
    }, 500),
    [router, updateSearchParams],
  )

  const handleSearch = (value: string) => {
    debouncedSearch(value)
  }

  const handleCategoryChange = (categoryValue: string) => {
    router.replace(updateSearchParams('category', categoryValue), { scroll: false })
  }

  const handleSortChange = (sortValue: string) => {
    router.replace(updateSearchParams('sort', sortValue), { scroll: false })
  }

  const handleProductTypeChange = (typeValue: string) => {
    router.replace(updateSearchParams('productType', typeValue), { scroll: false })
  }

  const handleTagChange = (tagValue: string) => {
    router.replace(updateSearchParams('tag', tagValue), { scroll: false })
  }

  const handlePriceRangeChange = (values: [number, number]) => {
    setAppliedPriceRange(values)
    const params = new URLSearchParams(searchParams.toString())
    params.set('minPrice', values[0].toString())
    params.set('maxPrice', values[1].toString())
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // These handlers are for the dialog and only update local state
  const handleDialogCategoryChange = (value: string) => {
    setTempCategory(value)
  }

  const handleDialogProductTypeChange = (value: string) => {
    setTempProductType(value)
  }

  const handleDialogTagChange = (value: string) => {
    setTempTag(value)
  }

  const handleDialogPriceRangeChange = (values: [number, number]) => {
    setTempPriceRange(values)
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

  // Reset only specific filter
  const hasActiveFilters =
    currentCategory !== 'all' ||
    currentProductType !== 'all' ||
    currentTag !== 'all' ||
    currentSearch ||
    appliedPriceRange[0] !== priceRange.min ||
    appliedPriceRange[1] !== priceRange.max

  // Open filter dialog
  const openFiltersDialog = () => {
    setIsFiltersOpen(true)
  }

  // Apply all filters from dialog
  const onDialogApply = () => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString())

    // Update all filter params from temporary state
    if (tempCategory && tempCategory !== 'all') {
      params.set('category', tempCategory)
    } else {
      params.delete('category')
    }

    if (tempProductType && tempProductType !== 'all') {
      params.set('productType', tempProductType)
    } else {
      params.delete('productType')
    }

    if (tempTag && tempTag !== 'all') {
      params.set('tag', tempTag)
    } else {
      params.delete('tag')
    }

    if (tempPriceRange[0] !== priceRange.min || tempPriceRange[1] !== priceRange.max) {
      params.set('minPrice', tempPriceRange[0].toString())
      params.set('maxPrice', tempPriceRange[1].toString())
    } else {
      params.delete('minPrice')
      params.delete('maxPrice')
    }

    // Reset page when filters change
    params.delete('page')

    // Close the dialog
    setIsFiltersOpen(false)

    // Navigate to the URL with all filters applied
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // Reset all filters in the dialog
  const resetDialogFilters = () => {
    setTempCategory('all')
    setTempProductType('all')
    setTempTag('all')
    setTempPriceRange([priceRange.min, priceRange.max])
  }

  // Reset all applied filters
  const resetAllFilters = () => {
    const params = new URLSearchParams()

    // Preserve layout and sort
    const layout = searchParams.get('layout')
    const sort = searchParams.get('sort')

    if (layout) params.set('layout', layout)
    if (sort) params.set('sort', sort)

    // Add a timestamp parameter to ensure the URL changes and triggers a refresh
    params.set('_t', Date.now().toString())

    router.replace(`?${params.toString()}`, { scroll: false })

    // Also reset dialog filters
    resetDialogFilters()

    // Update local state to reflect changes
    setAppliedPriceRange([priceRange.min, priceRange.max])
  }

  const handleFavoritesToggle = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get('favorites') === 'true') {
      params.delete('favorites')
    } else {
      params.set('favorites', 'true')

      // Перед переходом на страницу с избранными товарами, принудительно загружаем их из локального хранилища
      try {
        const { loadFromStorage, forceUpdate } = useFavorites.getState()
        loadFromStorage()
        setTimeout(() => forceUpdate(), 10)
      } catch (error) {
        console.error('Error updating favorites:', error)
      }
    }
    params.delete('page')
    router.replace(`?${params.toString()}`, { scroll: false })
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
            className="input-base w-full h-10 pl-10 pr-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
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
          <span>{t.filters.favorites || labels?.favorites || 'Favorites'}</span>
        </Button>

        {/* Filters Button */}
        <Button
          variant="outline"
          onClick={openFiltersDialog}
          className="h-10 px-3 justify-center bg-background hover:bg-accent hover:text-accent-foreground border border-border"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          <span>{t?.filters?.filters || 'Filters'}</span>
          {hasActiveFilters && (
            <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
              {
                [
                  currentCategory !== 'all',
                  currentProductType !== 'all',
                  currentTag !== 'all',
                  appliedPriceRange[0] !== priceRange.min ||
                    appliedPriceRange[1] !== priceRange.max,
                ].filter(Boolean).length
              }
            </span>
          )}
        </Button>

        {/* Sort Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => {
              if (isSortOpen) {
                setIsSortOpen(false)
                setOpenDropdown(null)
              } else {
                setIsSortOpen(true)
                setOpenDropdown('sort-dropdown')
              }
            }}
            aria-expanded={isSortOpen}
            aria-controls="sort-dropdown"
            className="h-10 px-3 justify-center bg-background hover:bg-accent hover:text-accent-foreground border border-border"
          >
            <span className="font-medium">
              {sortOptions.find((option) => option.value === currentSort)?.label ||
                t.sortOptions?.newest ||
                'По новизне'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
          </Button>
          {isSortOpen && (
            <div
              id="sort-dropdown"
              className="absolute z-10 mt-1 bg-background rounded-lg shadow-lg border border-border p-1 w-[220px]"
            >
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  onClick={() => {
                    handleSortChange(option.value)
                    setIsSortOpen(false)
                    setOpenDropdown(null)
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

        {/* Layout Toggle */}
        <div className="flex-none ml-auto flex h-10 bg-background/80 backdrop-blur-sm rounded-lg relative border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => handleLayoutChange('grid')}
            className={cn(
              'relative z-20',
              'h-10 px-3 rounded-l-md',
              'flex items-center justify-center',
              'transition-all duration-200',
              'border-r border-border/30',
              layout === 'grid'
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-accent/20',
            )}
          >
            <GridIcon className="h-4 w-4 mr-1.5" />
            <span className="text-xs sm:text-sm">{t.filters.layout.grid}</span>
          </button>

          <button
            type="button"
            onClick={() => handleLayoutChange('list')}
            className={cn(
              'relative z-20',
              'h-10 px-3 rounded-r-md',
              'flex items-center justify-center',
              'transition-all duration-200',
              layout === 'list'
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-accent/20',
            )}
          >
            <ListIcon className="h-4 w-4 mr-1.5" />
            <span className="text-xs sm:text-sm">{t.filters.layout.list}</span>
          </button>
        </div>
      </div>

      {/* Active Filters Chips - Visible when there are active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
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

          {/* Price Range Filter Chip - Always visible when price filter is applied */}
          {(appliedPriceRange[0] !== priceRange.min || appliedPriceRange[1] !== priceRange.max) && (
            <div className="inline-flex items-center bg-accent/10 px-3 py-1 rounded-full text-sm border border-accent/20">
              <span className="mr-1">
                {t.filters.priceRange.label}: {formatPrice(appliedPriceRange[0])} -{' '}
                {formatPrice(appliedPriceRange[1])}
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

          {/* Clear All Filters button - moved to be part of the filter chips */}
          <Button
            variant="outline"
            onClick={resetAllFilters}
            size="sm"
            className="h-8 border border-muted-foreground/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs ml-2"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            {t?.filters?.clearAll || 'Clear all filters'}
          </Button>
        </div>
      )}

      {/* Filters Dialog */}
      <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border border-border">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{t?.filters?.filters || 'Filters'}</DialogTitle>
            <DialogDescription>
              {t?.filters?.filtersDescription || 'Select filters for products'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-4 max-h-[70vh] overflow-y-auto">
            {/* Categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{t.filters.categories}</h3>
              <Select value={tempCategory} onValueChange={handleDialogCategoryChange}>
                <SelectTrigger className="select-trigger w-full h-10 focus:outline-none focus:border-accent">
                  <SelectValue placeholder={t.filters.categories}>
                    {tempCategory === 'all'
                      ? t?.categories?.all || 'All Categories'
                      : categories.find((c) => c.value === tempCategory)?.label || tempCategory}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border border-border">
                  <SelectItem value="all">{t?.categories?.all || 'All Categories'}</SelectItem>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label || `Category ${category.value}`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Product Types */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{t.filters.productType.label}</h3>
              <Select value={tempProductType} onValueChange={handleDialogProductTypeChange}>
                <SelectTrigger className="select-trigger w-full h-10 focus:outline-none focus:border-accent">
                  <SelectValue placeholder={t.filters.productType.all}>
                    {tempProductType === 'all'
                      ? t.filters.productType.all
                      : t.filters.productType[
                          tempProductType as keyof typeof t.filters.productType
                        ] ||
                        productTypes.find((t) => t.value === tempProductType)?.label ||
                        tempProductType}
                  </SelectValue>
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
              <Select value={tempTag} onValueChange={handleDialogTagChange}>
                <SelectTrigger className="select-trigger w-full h-10 focus:outline-none focus:border-accent">
                  <SelectValue placeholder={t.filters.tags}>
                    {tempTag === 'all'
                      ? t.filters.tags
                      : tags.find((t) => t.value === tempTag)?.label || tempTag}
                  </SelectValue>
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
              <h3 className="text-sm font-semibold">{t.filters.priceRange.label}</h3>
              <div className="rounded-md bg-background border border-border overflow-hidden">
                <div className="p-4">
                  <Slider
                    value={tempPriceRange}
                    onValueChange={handleDialogPriceRangeChange}
                    min={priceRange.min}
                    max={priceRange.max}
                    step={10}
                    className="w-full"
                  />

                  <div className="flex justify-between mt-1.5 mb-4">
                    <span className="text-xs text-muted-foreground">
                      <span className="block text-[10px] uppercase mb-0.5">
                        {t.filters.priceRange.min}
                      </span>
                      {formatPrice(priceRange.min)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <span className="block text-[10px] uppercase mb-0.5">
                        {t.filters.priceRange.max}
                      </span>
                      {formatPrice(priceRange.max)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        {t.filters.priceRange.from || t.filters.priceRange.min || 'From'}
                      </label>
                      <div className="relative">
                        {currency.position === 'before' && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                            {currency.symbol}
                          </span>
                        )}
                        <input
                          type="text"
                          value={Math.round(
                            tempPriceRange[0] * (currency.rate || 1),
                          ).toLocaleString(locale || 'en-US')}
                          readOnly
                          className={cn(
                            'w-full h-9 rounded-md border border-border text-sm bg-muted/40',
                            currency.position === 'before' ? 'pl-7 pr-3' : 'pl-3 pr-7',
                          )}
                          aria-label={
                            t.filters.priceRange.from || t.filters.priceRange.min || 'From'
                          }
                        />
                        {currency.position === 'after' && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                            {currency.symbol}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-muted-foreground mt-6">—</div>
                    <div className="relative flex-1">
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        {t.filters.priceRange.to || t.filters.priceRange.max || 'To'}
                      </label>
                      <div className="relative">
                        {currency.position === 'before' && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                            {currency.symbol}
                          </span>
                        )}
                        <input
                          type="text"
                          value={Math.round(
                            tempPriceRange[1] * (currency.rate || 1),
                          ).toLocaleString(locale || 'en-US')}
                          readOnly
                          className={cn(
                            'w-full h-9 rounded-md border border-border text-sm bg-muted/40',
                            currency.position === 'before' ? 'pl-7 pr-3' : 'pl-3 pr-7',
                          )}
                          aria-label={t.filters.priceRange.to || t.filters.priceRange.max || 'To'}
                        />
                        {currency.position === 'after' && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                            {currency.symbol}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                  <span className="text-sm">
                    {t.filters.priceRange.selected || t.filters?.selected || 'Selected'}:{' '}
                    <span className="font-medium">
                      {formatPrice(tempPriceRange[0])} – {formatPrice(tempPriceRange[1])}
                    </span>
                  </span>
                  {(tempPriceRange[0] !== priceRange.min ||
                    tempPriceRange[1] !== priceRange.max) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleDialogPriceRangeChange([priceRange.min, priceRange.max])}
                    >
                      {t.filters.priceRange.reset || t.filters?.reset || 'Reset'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 py-3 border-t border-border">
            <Button
              variant="outline"
              onClick={resetDialogFilters}
              className="mr-auto border border-border"
            >
              {t?.filters?.clearAll || 'Clear all filters'}
            </Button>
            <Button onClick={onDialogApply} className="border border-accent/20">
              {t?.filters?.apply || 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
