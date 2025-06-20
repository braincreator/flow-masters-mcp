'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Tag {
  id: string
  title: string
  slug: string
  count?: number
}

interface BlogTagCloudProps {
  tags: Tag[]
  activeTag?: string
  type?: 'tags' | 'categories'
  showCount?: boolean
  sizeFactor?: boolean
  limit?: number
  preserveParams?: boolean
  className?: string
  onTagClick?: (slug: string | undefined) => void // Add onTagClick prop
  onShowAll?: () => void // Add onShowAll prop for expanding the block
}

export function BlogTagCloud({
  tags,
  activeTag,
  type = 'tags',
  showCount = false,
  sizeFactor = false,
  limit,
  preserveParams = false,
  className,
  onTagClick, // Destructure onTagClick prop
  onShowAll, // Destructure onShowAll prop
}: BlogTagCloudProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  // Filter out any tags without a slug
  const validTags = tags.filter((tag) => tag.slug && tag.title)

  // Apply limit if provided
  const displayTags = limit ? validTags.slice(0, limit) : validTags

  // Get the base URL for the tag links
  const getTagUrl = (tagSlug: string) => {
    // Create new search params if we need to preserve existing ones
    if (preserveParams) {
      const params = new URLSearchParams(searchParams.toString())
      const typeParam = type === 'tags' ? 'tag' : 'category'

      // Set or clear the tag parameter
      if (tagSlug === 'all') {
        params.delete(typeParam)
      } else {
        params.set(typeParam, tagSlug)
      }

      return `/${currentLocale}/blog?${params.toString()}`
    }

    // Default behavior - navigate to dedicated tag/category page
    if (tagSlug === 'all') {
      return `/${currentLocale}/blog`
    }

    if (type === 'tags') {
      return `/${currentLocale}/blog/tag/${tagSlug}`
    }

    return `/${currentLocale}/blog/category/${tagSlug}`
  }

  if (displayTags.length === 0) {
    return null
  }

  // Find the maximum count to normalize sizes
  let maxCount = 1
  if (sizeFactor && showCount) {
    maxCount = Math.max(...displayTags.map((tag) => tag.count || 1))
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Include "All" option if activeTag is provided */}
      {activeTag !== undefined && ( // Only show "All" if activeTag is being managed
        <Link
          href={onTagClick ? '#' : getTagUrl('all')} // Use '#' if onTagClick is provided
          onClick={(e) => {
            if (onTagClick) {
              e.preventDefault() // Prevent default link navigation
              onTagClick(undefined) // Call handler with undefined for "All"
            }
          }}
          className={cn(
            'blog-tag inline-flex items-center rounded-full px-3 py-1 text-sm transition-colors',
            activeTag === undefined // "All" is active when activeTag is undefined
              ? 'bg-accent text-accent-foreground font-medium'
              : 'bg-muted hover:bg-accent/20 text-foreground',
          )}
        >
          {currentLocale === 'ru' ? 'Все' : 'All'}
        </Link>
      )}

      {displayTags.map((tag, index) => {
        const isActive = activeTag === tag.slug

        // Calculate size factor if enabled (between 0.8 and 1.4)
        const sizeStyle = {}
        if (sizeFactor && showCount && tag.count) {
          const sizeFactor = 0.8 + (tag.count / maxCount) * 0.6
          Object.assign(sizeStyle, {
            fontSize: `${sizeFactor}rem`,
            padding: `${0.25 * sizeFactor}rem ${0.75 * sizeFactor}rem`,
          })
        }

        return (
          <Link
            key={tag.slug || index}
            href={onTagClick ? '#' : getTagUrl(tag.slug || '')} // Use '#' if onTagClick is provided
            onClick={(e) => {
              if (onTagClick) {
                e.preventDefault() // Prevent default link navigation
                onTagClick(tag.slug || undefined) // Call handler with tag slug
              }
            }}
            style={sizeStyle}
            className={cn(
              'blog-tag inline-flex items-center rounded-full px-3 py-1 text-sm transition-all',
              isActive
                ? 'bg-accent text-accent-foreground font-medium'
                : 'bg-muted hover:bg-accent/20 text-foreground',
            )}
          >
            <span>{tag.title}</span>
            {showCount && tag.count !== undefined && (
              <span
                className={cn(
                  'ml-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium',
                  isActive ? 'bg-accent-foreground/20 text-accent-foreground' : 'bg-foreground/10',
                )}
              >
                {tag.count}
              </span>
            )}
          </Link>
        )
      })}

      {/* "Show more" button if tags are limited */}
      {limit && validTags.length > limit && (
        <button
          onClick={onShowAll || (() => {})}
          className="blog-tag inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm text-accent hover:bg-accent/20 transition-colors cursor-pointer"
        >
          {currentLocale === 'ru' ? 'Показать все' : 'Show all'}
          <span className="ml-1.5">({validTags.length})</span>
        </button>
      )}
    </div>
  )
}
