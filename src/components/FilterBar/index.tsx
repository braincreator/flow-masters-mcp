'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { GridIcon, ListIcon, SearchIcon } from 'lucide-react'

type Option = {
  label: string
  value: string
}

type Props = {
  categories: Option[]
  sortOptions: Option[]
  defaultLayout?: 'grid' | 'list'
}

export const FilterBar: React.FC<Props> = ({
  categories,
  sortOptions,
  defaultLayout = 'grid',
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

  const handleSearch = (value: string) => {
    router.push(`?${createQueryString('search', value)}`)
  }

  const handleCategoryChange = (value: string) => {
    router.push(`?${createQueryString('category', value)}`)
  }

  const handleSortChange = (value: string) => {
    router.push(`?${createQueryString('sort', value)}`)
  }

  const handleLayoutChange = (value: 'grid' | 'list') => {
    router.push(`?${createQueryString('layout', value)}`)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={currentSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={currentCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2 border rounded-lg p-1">
            <button
              onClick={() => handleLayoutChange('grid')}
              className={`p-2 rounded ${
                currentLayout === 'grid'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              <GridIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleLayoutChange('list')}
              className={`p-2 rounded ${
                currentLayout === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              <ListIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}