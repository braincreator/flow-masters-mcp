'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet'
import { SlidersHorizontal, X } from 'lucide-react'

interface FilterOption {
  id: string
  label: string
  value: string
}

interface ProductFiltersProps {
  categories: FilterOption[]
  productTypes: FilterOption[]
  locale: string
  onFilterChange: (filters: any) => void
}

export function ProductFilters({ 
  categories, 
  productTypes, 
  locale,
  onFilterChange 
}: ProductFiltersProps) {
  const [filters, setFilters] = useState({
    categories: [] as string[],
    productTypes: [] as string[],
    priceRange: { min: '', max: '' },
    search: ''
  })

  const handleFilterChange = (type: string, value: any) => {
    const newFilters = {
      ...filters,
      [type]: value
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      categories: [],
      productTypes: [],
      priceRange: { min: '', max: '' },
      search: ''
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="lg:hidden dark:border-border/50 dark:hover:border-primary/30"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {locale === 'ru' ? 'Фильтры' : 'Filters'}
        </Button>
      </SheetTrigger>
      <div className="hidden lg:block space-y-6">
        <FilterSection />
      </div>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>{locale === 'ru' ? 'Фильтры' : 'Filters'}</SheetTitle>
        </SheetHeader>
        <FilterSection />
      </SheetContent>
    </Sheet>
  )

  function FilterSection() {
    return (
      <div className="space-y-6 py-4">
        {/* Search */}
        <div className="space-y-2">
          <h3 className="font-medium">
            {locale === 'ru' ? 'Поиск' : 'Search'}
          </h3>
          <Input
            placeholder={locale === 'ru' ? 'Поиск...' : 'Search...'}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="dark:border-border/50 dark:focus:border-primary/30"
          />
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="font-medium">
            {locale === 'ru' ? 'Категории' : 'Categories'}
          </h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={filters.categories.includes(category.value)}
                  onCheckedChange={(checked) => {
                    const newCategories = checked
                      ? [...filters.categories, category.value]
                      : filters.categories.filter(id => id !== category.value)
                    handleFilterChange('categories', newCategories)
                  }}
                  className="dark:border-border/50 dark:data-[state=checked]:border-primary"
                />
                <label htmlFor={category.id} className="text-sm">
                  {category.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Product Types */}
        <div className="space-y-4">
          <h3 className="font-medium">
            {locale === 'ru' ? 'Тип продукта' : 'Product Type'}
          </h3>
          <div className="space-y-2">
            {productTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={filters.productTypes.includes(type.value)}
                  onCheckedChange={(checked) => {
                    const newTypes = checked
                      ? [...filters.productTypes, type.value]
                      : filters.productTypes.filter(id => id !== type.value)
                    handleFilterChange('productTypes', newTypes)
                  }}
                  className="dark:border-border/50 dark:data-[state=checked]:border-primary"
                />
                <label htmlFor={type.id} className="text-sm">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <h3 className="font-medium">
            {locale === 'ru' ? 'Цена' : 'Price Range'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder={locale === 'ru' ? 'От' : 'Min'}
              value={filters.priceRange.min}
              onChange={(e) => handleFilterChange('priceRange', {
                ...filters.priceRange,
                min: e.target.value
              })}
              className="dark:border-border/50 dark:focus:border-primary/30"
            />
            <Input
              type="number"
              placeholder={locale === 'ru' ? 'До' : 'Max'}
              value={filters.priceRange.max}
              onChange={(e) => handleFilterChange('priceRange', {
                ...filters.priceRange,
                max: e.target.value
              })}
              className="dark:border-border/50 dark:focus:border-primary/30"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <Button
          variant="outline"
          className="w-full dark:border-border/50 dark:hover:border-primary/30"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-2" />
          {locale === 'ru' ? 'Очистить фильтры' : 'Clear Filters'}
        </Button>
      </div>
    )
  }
} 