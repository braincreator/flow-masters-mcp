'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface ProductsFilterProps {
  enableCategories?: boolean
  enableSort?: boolean
  enableSearch?: boolean
}

export const ProductsFilter: React.FC<ProductsFilterProps> = ({
  enableCategories = true,
  enableSort = true,
  enableSearch = true,
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = React.useState('')

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
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
    </div>
  )
}