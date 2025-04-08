import React from 'react'
import { useSearchParams } from 'next/navigation'
import { Select } from '@/components/Select'
import { Input } from '@/components/Input'
import { type FilterLabels, type SortOption } from '../../types'

interface FilterBarProps {
  categories: string[]
  sortOptions: SortOption[]
  labels: FilterLabels
  onSearch: (value: string) => void
  onCategoryChange: (value: string) => void
  onSortChange: (value: string) => void
  onLayoutChange: (value: 'grid' | 'list') => void
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  sortOptions,
  labels,
  onSearch,
  onCategoryChange,
  onSortChange,
  onLayoutChange,
}) => {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || ''
  const currentSort = searchParams.get('sort') || ''
  const currentLayout = (searchParams.get('layout') as 'grid' | 'list') || 'grid'

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
        <Select
          label={labels.categories}
          value={currentCategory}
          onChange={onCategoryChange}
          options={[
            { label: labels.allCategories, value: '' },
            ...categories.map((category) => ({
              label: category,
              value: category,
            })),
          ]}
          className="w-full md:w-48"
        />
        <Select
          label={labels.sort}
          value={currentSort}
          onChange={onSortChange}
          options={sortOptions}
          className="w-full md:w-48"
        />
        <Input
          type="search"
          placeholder={labels.searchPlaceholder}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full md:w-64"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onLayoutChange('grid')}
          className={`p-2 ${currentLayout === 'grid' ? 'text-primary' : 'text-gray-500'}`}
        >
          <GridIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onLayoutChange('list')}
          className={`p-2 ${currentLayout === 'list' ? 'text-primary' : 'text-gray-500'}`}
        >
          <ListIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

const GridIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
    />
  </svg>
)

const ListIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
    />
  </svg>
)
