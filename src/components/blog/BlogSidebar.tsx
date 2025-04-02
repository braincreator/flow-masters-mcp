'use client'

import React from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BlogSearch } from './BlogSearch'

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
          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/${currentLocale}/blog?category=${category.slug}`}
                  className="flex items-center justify-between py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>{category.title}</span>
                  <span className="text-xs bg-muted rounded-full px-2 py-1">
                    {category.count || 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-medium text-lg mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/${currentLocale}/blog?tag=${tag.slug}`}
                className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                {tag.title}
                <span className="ml-1 text-xs text-muted-foreground/75">({tag.count || 0})</span>
              </Link>
            ))}
          </div>
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
