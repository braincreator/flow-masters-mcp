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

interface FilterBarProps {
  categories: Array<{ label: string; value: string }>
  sortOptions: Array<{ label: string; value: string }>
  productTypes: Array<{ label: string; value: string }>
  tags: Array<{ label: string; value: string }>
  priceRange: { min: number; max: number }
  defaultLayout?: 'grid' | 'list'
  locale?: string
  labels?: {
    categories: string
    sort: string
    search: string
    searchPlaceholder: string
    allCategories: string
    productTypes: string
    tags: string
    priceRange: string
    layout: {
      grid: string
      list: string
    }
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
  labels,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setOpenDropdown } = useDropdown()

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

  const currentCategory = searchParams.get('category') || 'all'
  const currentSort = searchParams.get('sort') || 'newest'
  const currentProductType = searchParams.get('productType') || 'all'
  const currentTag = searchParams.get('tag') || 'all'
  const currentSearch = searchParams.get('search') || ''

  return (
    <div className="space-y-4">
      {/* Common Search Bar - Visible on all devices */}
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder={t.filters.searchPlaceholder}
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-transparent transition-all duration-200"
        />
      </div>

      {/* Active Filters Chips - Visible on all devices */}
      <div className="flex flex-wrap gap-2">
        {currentCategory !== 'all' && (
          <div className="inline-flex items-center bg-accent/10 px-3 py-1 rounded-full text-sm">
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
          <div className="inline-flex items-center bg-accent/10 px-3 py-1 rounded-full text-sm">
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
          <div className="inline-flex items-center bg-accent/10 px-3 py-1 rounded-full text-sm">
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

        {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
          <div className="inline-flex items-center bg-accent/10 px-3 py-1 rounded-full text-sm">
            <span className="mr-1">
              ${currentPriceRange[0].toLocaleString('en-US')} - $
              {currentPriceRange[1].toLocaleString('en-US')}
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

        {(currentCategory !== 'all' ||
          currentProductType !== 'all' ||
          currentTag !== 'all' ||
          searchParams.get('minPrice') ||
          searchParams.get('maxPrice')) && (
          <button
            onClick={() => {
              handleCategoryChange('all')
              handleProductTypeChange('all')
              handleTagChange('all')
              handlePriceRangeChange([priceRange.min, priceRange.max])
            }}
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            {t.filters.clearAll || 'Clear all filters'}
          </button>
        )}
      </div>

      {/* Controls Row - Visible on all devices */}
      <div className="flex items-center justify-between">
        {/* Mobile Filters Button */}
        <div className="lg:hidden">
          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="justify-start bg-background hover:bg-accent/5 border-border/50 text-foreground font-medium"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t.filters.filters || 'Фильтры'}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-xl">
              <div className="h-full flex flex-col">
                <SheetHeader className="px-4 py-3 border-b bg-muted/40 dark:bg-muted/20 rounded-t-xl sticky top-0 z-10">
                  <SheetTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>{t.filters.filters || 'Фильтры'}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="h-8 w-8 rounded-full"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Закрыть</span>
                    </Button>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="space-y-6">
                    {/* Categories */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">{t.filters.categories}</h3>
                      <Select value={currentCategory} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full h-11 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-transparent transition-all duration-200">
                          <SelectValue placeholder={t.filters.categories} />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectTrigger className="w-full h-11 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-transparent transition-all duration-200">
                          <SelectValue placeholder={t.filters.productType.all} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t.filters.productType.all}</SelectItem>
                          {productTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {t.filters.productType[
                                type.value as keyof typeof t.filters.productType
                              ] || type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">{t.filters.tags}</h3>
                      <Select value={currentTag} onValueChange={handleTagChange}>
                        <SelectTrigger className="w-full h-11 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-transparent transition-all duration-200">
                          <SelectValue placeholder={t.filters.tags} />
                        </SelectTrigger>
                        <SelectContent>
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
                      <div className="px-3 py-4 rounded-lg bg-background border border-border/50">
                        <Slider
                          value={currentPriceRange}
                          onValueChange={handlePriceRangeChange}
                          max={priceRange.max}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-4">
                          <span>
                            {t.filters.priceRange.min}: $
                            {currentPriceRange[0].toLocaleString('en-US')}
                          </span>
                          <span>
                            {t.filters.priceRange.max}: $
                            {currentPriceRange[1].toLocaleString('en-US')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">{t.filters.sort}</h3>
                      <Select value={currentSort} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-full h-11 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-transparent transition-all duration-200">
                          <SelectValue placeholder={t.filters.sort} />
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
                  </div>
                </div>

                {/* Mobile Sheet Footer */}
                <div className="px-4 py-3 border-t bg-background/80 backdrop-blur-sm sticky bottom-0">
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleCategoryChange('all')
                        handleProductTypeChange('all')
                        handleTagChange('all')
                        handlePriceRangeChange([priceRange.min, priceRange.max])
                        setIsMobileFiltersOpen(false)
                      }}
                    >
                      {t.filters.clearAll || 'Очистить всё'}
                    </Button>
                    <Button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {t.filters.apply || 'Применить'}
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sort Dropdown (Mobile) */}
        <div className="lg:hidden">
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[160px] h-10 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-transparent transition-all duration-200">
              <SelectValue placeholder={t.filters.sort} />
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

        {/* Layout Toggle (Mobile & Desktop) */}
        <div className="flex gap-2 h-10 p-1 bg-background rounded-lg relative border border-border/50">
          <button
            type="button"
            onClick={() => handleLayoutChange('grid')}
            className={cn(
              'relative z-20',
              'h-8 w-8 p-0 rounded-md',
              'flex items-center justify-center',
              'transition-all duration-200',
              'border border-transparent',
              layout === 'grid' && 'bg-accent text-accent-foreground shadow-sm',
              layout !== 'grid' && 'hover:bg-accent/10',
            )}
          >
            <GridIcon className="h-4 w-4" />
            <span className="sr-only">{t.filters.layout.grid}</span>
          </button>

          <button
            type="button"
            onClick={() => handleLayoutChange('list')}
            className={cn(
              'relative z-20',
              'h-8 w-8 p-0 rounded-md',
              'flex items-center justify-center',
              'transition-all duration-200',
              'border border-transparent',
              layout === 'list' && 'bg-accent text-accent-foreground shadow-sm',
              layout !== 'list' && 'hover:bg-accent/10',
            )}
          >
            <ListIcon className="h-4 w-4" />
            <span className="sr-only">{t.filters.layout.list}</span>
          </button>
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-4">
          {/* Categories Dropdown */}
          <div className="w-[200px]">
            <Select value={currentCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full h-10 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-transparent transition-all duration-200">
                <SelectValue placeholder={t.filters.categories} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.filters.categories}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Types Dropdown */}
          <div className="w-[200px]">
            <Select value={currentProductType} onValueChange={handleProductTypeChange}>
              <SelectTrigger className="w-full h-10 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-transparent transition-all duration-200">
                <SelectValue placeholder={t.filters.productType.all} />
              </SelectTrigger>
              <SelectContent>
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

          {/* Tags Dropdown */}
          <div className="w-[200px]">
            <Select value={currentTag} onValueChange={handleTagChange}>
              <SelectTrigger className="w-full h-10 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-transparent transition-all duration-200">
                <SelectValue placeholder={t.filters.tags} />
              </SelectTrigger>
              <SelectContent>
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
          <div className="w-[300px]">
            <div className="px-3 py-2 rounded-lg bg-background border border-border/50 h-10 flex items-center">
              <span className="text-sm text-muted-foreground mr-2">
                {t.filters.priceRange.label}:
              </span>
              <span className="text-sm">
                ${currentPriceRange[0].toLocaleString('en-US')} - $
                {currentPriceRange[1].toLocaleString('en-US')}
              </span>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="w-[200px] ml-auto">
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full h-10 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-transparent transition-all duration-200">
                <SelectValue placeholder={t.filters.sort} />
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
        </div>
      </div>
    </div>
  )
}
