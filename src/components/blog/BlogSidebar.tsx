'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BlogSearch } from './BlogSearch'
import { BlogTagCloud } from './BlogTagCloud'

interface Category {
  id: string
  title: string
  slug: string
  count?: number
}

interface Tag {
  id: string
  title: string
  slug: string
  count?: number
}

interface BlogSidebarProps {
  categories: Category[]
  tags: Tag[]
  currentLocale: string
  searchQuery?: string
  className?: string
}

export function BlogSidebar({
  categories,
  tags,
  currentLocale,
  searchQuery = '',
  className,
}: BlogSidebarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllTags, setShowAllTags] = useState(false)

  return (
    <aside className={cn('space-y-8', className)}>
      {/* Search */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium text-lg mb-3">Search</h3>
        <BlogSearch
          initialQuery={searchQuery}
          placeholder="Search posts..."
          className="w-full"
          variant="product-style"
          preserveParams={false}
          size="default"
        />
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-medium text-lg mb-3">Categories</h3>
          <BlogTagCloud
            tags={categories}
            type="categories"
            showCount
            limit={showAllCategories ? undefined : 8}
            onShowAll={() => setShowAllCategories(true)}
            preserveParams={true}
            className="flex flex-col gap-1"
          />
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-medium text-lg mb-3">Tags</h3>
          <BlogTagCloud
            tags={tags}
            type="tags"
            showCount
            limit={showAllTags ? undefined : 15}
            onShowAll={() => setShowAllTags(true)}
            preserveParams={true}
          />
        </div>
      )}

      {/* Popular posts */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium text-lg mb-3">Subscribe to newsletter</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Stay updated with our latest posts and news by subscribing to our newsletter.
        </p>
        <form className="space-y-2">
          <Input type="email" placeholder="Your email" required />
          <Button type="submit" className="w-full">
            Subscribe
          </Button>
        </form>
      </div>
    </aside>
  )
}
