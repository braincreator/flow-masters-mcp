'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Tag,
  Clock,
  Search,
  GridIcon,
  ListIcon,
  Heart,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import { useFavorites } from '@/hooks/useFavorites'

interface FilterOption {
  id: string
  label: string
  value: string
  count?: number
}

interface ProductFiltersProps {
  categories: FilterOption[]
  productTypes: FilterOption[]
  tags?: FilterOption[]
  priceRange: { min: number; max: number }
  locale: string
  searchTerm: string
  layout?: 'grid' | 'list'
  onFilterChange: (filters: {
    categories: string[]
    productTypes: string[]
    tags: string[]
    priceRange: { min: number; max: number }
    sort: string
    search: string
    favorites: boolean
  }) => void
  onLayoutChange?: (layout: 'grid' | 'list') => void
}

export function ProductFilters({
  categories = [],
  productTypes = [],
  tags = [],
  priceRange,
  locale,
  searchTerm,
  layout = 'grid',
  onFilterChange,
  onLayoutChange,
}: ProductFiltersProps) {
  const { count: favoritesCount } = useFavorites()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState(searchTerm)
  const [showFavorites, setShowFavorites] = useState(false)

  // Update local state when props change
  useEffect(() => {
    setSearch(searchTerm)
  }, [searchTerm])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFilterChange({
      categories: selectedCategories,
      productTypes: selectedProductTypes,
      tags: selectedTags,
      priceRange,
      sort,
      search: value,
      favorites: showFavorites,
    })
  }

  const handleCategoryChange = (categoryValue: string) => {
    const newCategories = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter((value) => value !== categoryValue)
      : [...selectedCategories, categoryValue]
    setSelectedCategories(newCategories)
    onFilterChange({
      categories: newCategories,
      productTypes: selectedProductTypes,
      tags: selectedTags,
      priceRange,
      sort,
      search,
      favorites: showFavorites,
    })
  }

  const handleProductTypeChange = (typeValue: string) => {
    const newTypes = selectedProductTypes.includes(typeValue)
      ? selectedProductTypes.filter((value) => value !== typeValue)
      : [...selectedProductTypes, typeValue]
    setSelectedProductTypes(newTypes)
    onFilterChange({
      categories: selectedCategories,
      productTypes: newTypes,
      tags: selectedTags,
      priceRange,
      sort,
      search,
      favorites: showFavorites,
    })
  }

  const handleTagChange = (tagValue: string) => {
    const newTags = selectedTags.includes(tagValue)
      ? selectedTags.filter((value) => value !== tagValue)
      : [...selectedTags, tagValue]
    setSelectedTags(newTags)
    onFilterChange({
      categories: selectedCategories,
      productTypes: selectedProductTypes,
      tags: newTags,
      priceRange,
      sort,
      search,
      favorites: showFavorites,
    })
  }

  const handleSortChange = (value: string) => {
    setSort(value)
    onFilterChange({
      categories: selectedCategories,
      productTypes: selectedProductTypes,
      tags: selectedTags,
      priceRange,
      sort: value,
      search,
      favorites: showFavorites,
    })
  }

  const handlePriceRangeChange = (value: number[]) => {
    const newPriceRange = { min: value[0], max: value[1] }
    onFilterChange({
      categories: selectedCategories,
      productTypes: selectedProductTypes,
      tags: selectedTags,
      priceRange: newPriceRange,
      sort,
      search,
      favorites: showFavorites,
    })
  }

  const handleFavoritesChange = (checked: boolean) => {
    setShowFavorites(checked)
    onFilterChange({
      categories: selectedCategories,
      productTypes: selectedProductTypes,
      tags: selectedTags,
      priceRange,
      sort,
      search,
      favorites: checked,
    })
  }

  return (
    <div className="space-y-6">
      {/* Mobile Filters Button */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Favorites filter */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="favorites-mobile"
                    checked={showFavorites}
                    onCheckedChange={handleFavoritesChange}
                  />
                  <label
                    htmlFor="favorites-mobile"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    <Heart className="h-4 w-4 mr-1.5 text-rose-500" />
                    {locale === 'ru' ? 'Избранные товары' : 'Favorite items'}
                    {favoritesCount > 0 && (
                      <span className="ml-2 text-muted-foreground">({favoritesCount})</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Categories</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.value)}
                        onCheckedChange={() => handleCategoryChange(category.value)}
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.label}
                        {category.count && (
                          <span className="ml-2 text-muted-foreground">({category.count})</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Types */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Types</label>
                <div className="space-y-2">
                  {productTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={selectedProductTypes.includes(type.value)}
                        onCheckedChange={() => handleProductTypeChange(type.value)}
                      />
                      <label
                        htmlFor={type.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {type.label}
                        {type.count && (
                          <span className="ml-2 text-muted-foreground">({type.count})</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleTagChange(tag.value)}
                    >
                      {tag.label}
                      {tag.count && (
                        <span className="ml-1 text-muted-foreground">({tag.count})</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <Slider
                  value={[priceRange.min, priceRange.max]}
                  onValueChange={handlePriceRangeChange}
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange.min}</span>
                  <span>${priceRange.max}</span>
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'newest', label: 'Newest' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                    { value: 'name-asc', label: 'Name: A to Z' },
                    { value: 'name-desc', label: 'Name: Z to A' },
                  ].map((option) => (
                    <Badge
                      key={option.value}
                      variant={sort === option.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleSortChange(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <Input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Favorites filter */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorites-desktop"
              checked={showFavorites}
              onCheckedChange={handleFavoritesChange}
            />
            <label
              htmlFor="favorites-desktop"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
            >
              <Heart className="h-4 w-4 mr-1.5 text-rose-500" />
              {locale === 'ru' ? 'Избранные товары' : 'Favorite items'}
              {favoritesCount > 0 && (
                <span className="ml-2 text-muted-foreground">({favoritesCount})</span>
              )}
            </label>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Categories</label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.value)}
                  onCheckedChange={() => handleCategoryChange(category.value)}
                />
                <label
                  htmlFor={category.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.label}
                  {category.count && (
                    <span className="ml-2 text-muted-foreground">({category.count})</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Product Types */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Product Types</label>
          <div className="space-y-2">
            {productTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={selectedProductTypes.includes(type.value)}
                  onCheckedChange={() => handleProductTypeChange(type.value)}
                />
                <label
                  htmlFor={type.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type.label}
                  {type.count && <span className="ml-2 text-muted-foreground">({type.count})</span>}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleTagChange(tag.value)}
              >
                {tag.label}
                {tag.count && <span className="ml-1 text-muted-foreground">({tag.count})</span>}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Price Range</label>
          <Slider
            value={[priceRange.min, priceRange.max]}
            onValueChange={handlePriceRangeChange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange.min}</span>
            <span>${priceRange.max}</span>
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sort</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'newest', label: 'Newest' },
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'name-asc', label: 'Name: A to Z' },
              { value: 'name-desc', label: 'Name: Z to A' },
            ].map((option) => (
              <Badge
                key={option.value}
                variant={sort === option.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Layout Toggle */}
        {onLayoutChange && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Layout</label>
            <div className="flex gap-2 h-10 p-1 bg-muted/40 dark:bg-muted/20 rounded-[8px] relative border border-border/50">
              <button
                type="button"
                onClick={() => onLayoutChange('grid')}
                className={cn(
                  'relative z-20',
                  'h-8 w-8 p-0 rounded-[6px]',
                  'flex items-center justify-center',
                  'transition-colors duration-200',
                  'border border-transparent',
                  layout === 'grid' && 'bg-accent text-accent-foreground border-accent/50',
                  layout !== 'grid' &&
                    'hover:bg-accent hover:text-accent-foreground hover:border-accent/50',
                )}
              >
                <GridIcon className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </button>

              <button
                type="button"
                onClick={() => onLayoutChange('list')}
                className={cn(
                  'relative z-20',
                  'h-8 w-8 p-0 rounded-[6px]',
                  'flex items-center justify-center',
                  'transition-colors duration-200',
                  'border border-transparent',
                  layout === 'list' && 'bg-accent text-accent-foreground border-accent/50',
                  layout !== 'list' &&
                    'hover:bg-accent hover:text-accent-foreground hover:border-accent/50',
                )}
              >
                <ListIcon className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
