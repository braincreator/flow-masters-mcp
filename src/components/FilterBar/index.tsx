'use client'

import React, { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import debounce from 'lodash.debounce'
import {
  GridIcon,
  ListIcon,
  SearchIcon,
  SlidersHorizontal,
  ChevronDown,
  X,
  LayoutGrid,
  List,
  Heart,
} from 'lucide-react'
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
import { useAuth } from '@/hooks/useAuth'

interface FilterBarProps {
  categories: Array<{ label: string; value: string }>
  sortOptions: Array<{ label: string; value: string }>
  productTypes: Array<{ label: string; value: string }>
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
    priceRange: string
    layout: string
    favorites?: string
    filtersTitle?: string
  }
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  sortOptions,
  productTypes,
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
  const { user, isLoading: isLoadingAuth } = useAuth()

  // Local state for filter values in the dialog
  const [tempCategory, setTempCategory] = React.useState(
    searchParams.get('productCategory') || 'all',
  )
  const [tempProductType, setTempProductType] = React.useState(
    searchParams.get('productType') || 'all',
  )
  const [tempPriceRange, setTempPriceRange] = React.useState<[number, number]>([
    parseInt(searchParams.get('minPrice') || priceRange.min.toString()),
    parseInt(searchParams.get('maxPrice') || priceRange.max.toString()),
  ])

  // Debug - Log the categories prop
  React.useEffect(() => {
    console.log('FilterBar categories prop:', categories)
  }, [categories])

  // Возвращаем productTypes к карте строк в fallback
  const t = locale
    ? translations[locale as keyof typeof translations]
    : {
        filters: {
          title: labels?.filtersTitle || 'Filters',
          categories: labels?.categories || 'Categories',
          sort: labels?.sort || 'Sort',
          search: labels?.search || 'Search',
          searchPlaceholder: labels?.searchPlaceholder || 'Search products...',
          productTypes: {
            label: labels?.productTypes || 'Product Types',
            all: 'All Types',
            digital: 'Digital',
            physical: 'Physical',
          },
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
            grid: 'Grid',
            list: 'List',
          },
          apply: 'Apply',
          clearAll: 'Clear all',
          favorites: 'Favorites',
        },
        categories: {
          all: labels?.allCategories || 'All Categories',
        },
        sortOptions: { newest: 'Newest' /* ... */ },
        sharing: { linkCopied: 'Link copied!', share: 'Share' },
        product: {
          addToCart: 'Add to cart',
          addedToCart: 'Added',
          share: 'Share',
          download: 'Download',
          description: 'Description',
          details: 'Details',
          specifications: 'Specifications',
          reviews: 'Reviews',
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
      setTempCategory(searchParams.get('productCategory') || 'all')
      setTempProductType(searchParams.get('productType') || 'all')

      // Use database values for min/max prices if no URL params
      const urlMinPrice = searchParams.get('minPrice')
      const urlMaxPrice = searchParams.get('maxPrice')

      setTempPriceRange([
        urlMinPrice ? parseInt(urlMinPrice) : priceRange.min,
        urlMaxPrice ? parseInt(urlMaxPrice) : priceRange.max,
      ])
    }
  }, [isFiltersOpen, searchParams, priceRange])

  const handleLayoutChange = (newLayout: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('layout', newLayout)
    // page не удаляем при смене layout
    router.replace(`?${params.toString()}`, { scroll: false })
    setLayout(newLayout)
    setOpenDropdown(null)
  }

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      params.delete('page')
      router.replace(`?${params.toString()}`, { scroll: false })
    }, 500),
    [router, searchParams],
  )

  const handleSearch = (value: string) => {
    debouncedSearch(value)
  }

  const handleCategoryChange = (categoryValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    // Удаляем старый ключ, если он был
    params.delete('productCategory')
    // Удаляем ключ where, если он был (на всякий случай)
    params.delete('where[productCategory][equals]')

    if (categoryValue && categoryValue !== 'all') {
      // Устанавливаем новый ключ в формате where
      params.set('where[productCategory][equals]', categoryValue)
    }
    // Удаляем пагинацию при смене фильтра
    params.delete('page')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sortValue) {
      params.set('sort', sortValue)
    } else {
      params.delete('sort')
    }
    params.delete('page')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleProductTypeChange = (typeValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (typeValue && typeValue !== 'all') {
      params.set('productType', typeValue)
    } else {
      params.delete('productType')
    }
    params.delete('page')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handlePriceRangeChange = (values: [number, number]) => {
    setAppliedPriceRange(values)
    const params = new URLSearchParams(searchParams.toString())
    params.set('minPrice', values[0].toString())
    params.set('maxPrice', values[1].toString())
    params.delete('page') // Сбрасываем страницу при изменении цены
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // These handlers are for the dialog and only update local state
  const handleDialogCategoryChange = (value: string) => {
    setTempCategory(value)
  }

  const handleDialogProductTypeChange = (value: string) => {
    setTempProductType(value)
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

  const currentCategory = searchParams.get('productCategory') || 'all'
  const currentSort = searchParams.get('sort') || 'newest'
  const currentProductType = searchParams.get('productType') || 'all'
  const currentSearch = searchParams.get('search') || ''

  // Reset only specific filter
  const hasActiveFilters =
    currentCategory !== 'all' ||
    currentProductType !== 'all' ||
    currentSearch ||
    appliedPriceRange[0] !== priceRange.min ||
    appliedPriceRange[1] !== priceRange.max

  // Open filter dialog
  const openFiltersDialog = () => {
    setIsFiltersOpen(true)
  }

  // Apply all filters from dialog
  const onDialogApply = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Удаляем старые/неправильные ключи перед установкой новых
    params.delete('productCategory')
    params.delete('where[productCategory][equals]')
    params.delete('productType')
    params.delete('minPrice')
    params.delete('maxPrice')

    // Update category filter using 'where' syntax
    if (tempCategory && tempCategory !== 'all') {
      params.set('where[productCategory][equals]', tempCategory)
    }

    // Update other filters
    if (tempProductType && tempProductType !== 'all') {
      params.set('productType', tempProductType)
    }

    if (tempPriceRange[0] !== priceRange.min || tempPriceRange[1] !== priceRange.max) {
      params.set('minPrice', tempPriceRange[0].toString())
      params.set('maxPrice', tempPriceRange[1].toString())
    }

    // Reset page when filters change
    params.delete('page')

    setIsFiltersOpen(false)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // Reset all filters in the dialog
  const resetDialogFilters = () => {
    setTempCategory('all')
    setTempProductType('all')
    setTempPriceRange([priceRange.min, priceRange.max])
  }

  // Reset all applied filters
  const resetAllFilters = () => {
    const params = new URLSearchParams()
    const layout = searchParams.get('layout')
    const sort = searchParams.get('sort')
    if (layout) params.set('layout', layout)
    if (sort) params.set('sort', sort)
    params.set('_t', Date.now().toString())
    router.replace(`?${params.toString()}`, { scroll: false })
    resetDialogFilters()
    setAppliedPriceRange([priceRange.min, priceRange.max])
  }

  const handleFavoritesToggle = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get('favorites') === 'true') {
      params.delete('favorites')
    } else {
      params.set('favorites', 'true')
    }
    params.delete('page')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // Helper to safely access product type translations
  const getProductTypeTranslation = (key: string): string => {
    if (typeof t.filters.productTypes === 'object' && t.filters.productTypes !== null) {
      const translations = t.filters.productTypes as { [key: string]: string }
      if (translations[key]) {
        return translations[key]
      }
    }
    // Fallback logic if translation is not found or productTypes is not an object
    return productTypes.find((typ) => typ.value === key)?.label || key
  }

  // Safe accessors
  const productTypesLabel =
    (typeof t.filters.productTypes === 'object' && t.filters.productTypes?.label) || 'Product Type'
  const productTypesAllLabel =
    (typeof t.filters.productTypes === 'object' && t.filters.productTypes?.all) || 'All Types'
  const layoutGridLabel = (typeof t.filters.layout === 'object' && t.filters.layout?.grid) || 'Grid'
  const layoutListLabel = (typeof t.filters.layout === 'object' && t.filters.layout?.list) || 'List'
  const filtersButtonLabel = labels?.filtersTitle || t.filters.title || 'Filters'

  const isShowingFavorites = searchParams.get('favorites') === 'true'

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

        {/* Favorites Toggle Button - Скрываем для неавторизованных */}
        {!isLoadingAuth && !!user && (
          <Button
            variant={isShowingFavorites ? 'secondary' : 'outline'}
            onClick={handleFavoritesToggle}
            className={cn(
              'h-10 px-3 justify-center hover:bg-accent hover:text-accent-foreground border border-border',
              {
                'bg-accent text-white hover:bg-accent/90': isShowingFavorites,
              },
            )}
          >
            <Heart
              className={cn('mr-2 h-4 w-4', {
                'fill-red-500 text-red-500': isShowingFavorites,
              })}
            />
            <span>{t.filters.favorites}</span>
          </Button>
        )}

        {/* Filters Button */}
        <Button
          variant="outline"
          onClick={openFiltersDialog}
          className="h-10 px-3 justify-center bg-background hover:bg-accent hover:text-accent-foreground border border-border"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          <span>{filtersButtonLabel}</span>
          {hasActiveFilters && (
            <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
              {
                [
                  currentCategory !== 'all',
                  currentProductType !== 'all',
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

        {/* Layout Toggle - Возвращаем старый вид */}
        <div className="flex-none ml-auto flex h-10 bg-background/80 backdrop-blur-sm rounded-lg relative border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => handleLayoutChange('grid')}
            aria-label={layoutGridLabel} // aria-label оставляем
            className={cn(
              'relative z-20',
              'h-10 px-3',
              'flex items-center justify-center',
              'transition-all duration-200',
              'border-r border-border/30',
              layout === 'grid'
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-accent/20',
            )}
          >
            <GridIcon className="h-4 w-4 mr-1.5" />
            <span className="text-xs sm:text-sm">{layoutGridLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => handleLayoutChange('list')}
            aria-label={layoutListLabel} // aria-label оставляем
            className={cn(
              'relative z-20',
              'h-10 px-3',
              'flex items-center justify-center',
              'transition-all duration-200',
              layout === 'list'
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-accent/20',
            )}
          >
            <ListIcon className="h-4 w-4 mr-1.5" />
            <span className="text-xs sm:text-sm">{layoutListLabel}</span>
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
              <span className="mr-1">{getProductTypeTranslation(currentProductType)}</span>
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

          {/* Clear All Filters button - moved to be part of the filter chips */}
          <Button
            variant="outline"
            onClick={resetAllFilters}
            size="sm"
            className="h-8 border border-muted-foreground/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs ml-2"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            {t.filters.clearAll}
          </Button>
        </div>
      )}

      {/* Filters Dialog */}
      <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border border-border">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{filtersButtonLabel}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-background">
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
              <h3 className="text-sm font-semibold">{productTypesLabel}</h3>
              <Select value={tempProductType} onValueChange={handleDialogProductTypeChange}>
                <SelectTrigger className="select-trigger w-full h-10 focus:outline-none focus:border-accent">
                  <SelectValue placeholder={productTypesAllLabel}>
                    {tempProductType === 'all'
                      ? productTypesAllLabel
                      : getProductTypeTranslation(tempProductType)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border border-border">
                  <SelectItem value="all">{productTypesAllLabel}</SelectItem>
                  {productTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {getProductTypeTranslation(type.value)}
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
                    {t.filters.priceRange.selected}:{' '}
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
                      {t.filters.priceRange.reset}
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
              {t.filters.clearAll}
            </Button>
            <Button onClick={onDialogApply} className="border border-accent/20">
              {t.filters.apply}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
