'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLocale } from '@/hooks/useLocale'
import { Slider } from '@/components/ui/slider'

interface ProductsFilterProps {
  enableCategories?: boolean
  enableSort?: boolean
  enableSearch?: boolean
  enablePriceRange?: boolean // New prop
  priceRanges?: Record<string, { min: number, max: number }>
}

export const ProductsFilter: React.FC<ProductsFilterProps> = ({
  enableCategories = true,
  enableSort = true,
  enableSearch = true,
  enablePriceRange = true,
  priceRanges,
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { locale } = useLocale()
  const [search, setSearch] = React.useState('')
  
  const defaultPriceRanges = {
    en: { min: 0, max: 1000 },
    ru: { min: 0, max: 100000 }
  }
  
  const localePriceRange = priceRanges?.[locale] || defaultPriceRanges[locale]

  const [priceRange, setPriceRange] = React.useState([
    parseInt(searchParams.get('minPrice') || localePriceRange.min.toString()),
    parseInt(searchParams.get('maxPrice') || localePriceRange.max.toString()),
  ])

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`?${params.toString()}`)
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    const params = new URLSearchParams(searchParams.toString())
    params.set('minPrice', values[0].toString())
    params.set('maxPrice', values[1].toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {enableSearch && (
          <div className="w-full md:w-auto">
            <input
              type="search"
              placeholder="Search products..."
              className="w-full md:w-64 px-4 py-2 border rounded-lg"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                updateFilters('search', e.target.value)
              }}
            />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4">
          {enableCategories && (
            <select
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => updateFilters('category', e.target.value)}
              defaultValue={searchParams.get('category') || 'all'}
            >
              <option value="all">All Categories</option>
              <option value="n8n">N8N Workflows</option>
              <option value="make">Make.com Workflows</option>
              <option value="tutorials">Tutorials</option>
              <option value="courses">Courses</option>
            </select>
          )}

          {enableSort && (
            <select
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => updateFilters('sort', e.target.value)}
              defaultValue={searchParams.get('sort') || 'newest'}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          )}
        </div>
      </div>

      {enablePriceRange && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="px-2">
            <Slider
              min={localePriceRange.min}
              max={localePriceRange.max}
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              className="mt-2"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
