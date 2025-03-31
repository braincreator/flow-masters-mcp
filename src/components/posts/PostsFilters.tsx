'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Search } from 'lucide-react'

interface Category {
  id: string
  title: string
  slug: string
}

interface PostsFiltersProps {
  categories: Category[]
  selectedCategory?: string
  selectedSort?: string
  searchQuery?: string
  className?: string
}

export function PostsFilters({
  categories,
  selectedCategory,
  selectedSort = 'latest',
  searchQuery = '',
  className,
}: PostsFiltersProps) {
  const router = useRouter()
  const [search, setSearch] = useState(searchQuery)
  const [category, setCategory] = useState(selectedCategory)
  const [sort, setSort] = useState(selectedSort)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (search) {
      params.set('q', search)
    }

    if (category) {
      params.set('category', category)
    }

    if (sort && sort !== 'latest') {
      params.set('sort', sort)
    }

    router.push(`/posts${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search */}
      <div>
        <form onSubmit={handleSearch} className="space-y-2">
          <Label htmlFor="search">Search Posts</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Categories</h3>
          <RadioGroup value={category} onValueChange={setCategory} className="space-y-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="category-all" />
              <Label htmlFor="category-all" className="text-sm cursor-pointer">
                All Categories
              </Label>
            </div>

            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <RadioGroupItem value={cat.id} id={`category-${cat.id}`} />
                <Label htmlFor={`category-${cat.id}`} className="text-sm cursor-pointer">
                  {cat.title}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Sorting */}
      <div>
        <h3 className="text-sm font-medium mb-3">Sort By</h3>
        <RadioGroup value={sort} onValueChange={setSort} className="space-y-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="latest" id="sort-latest" />
            <Label htmlFor="sort-latest" className="text-sm cursor-pointer">
              Latest First
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="oldest" id="sort-oldest" />
            <Label htmlFor="sort-oldest" className="text-sm cursor-pointer">
              Oldest First
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="title-asc" id="sort-title-asc" />
            <Label htmlFor="sort-title-asc" className="text-sm cursor-pointer">
              Title (A-Z)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="title-desc" id="sort-title-desc" />
            <Label htmlFor="sort-title-desc" className="text-sm cursor-pointer">
              Title (Z-A)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Apply filters button */}
      <Button onClick={applyFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  )
}
