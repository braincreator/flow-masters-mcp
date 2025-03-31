'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'

interface Tag {
  id: string
  title: string
  slug: string
  count?: number
}

interface BlogTagCloudProps {
  tags: Tag[]
  type?: 'tags' | 'categories'
  showCount?: boolean
  limit?: number
  sizeFactor?: boolean
  className?: string
}

export function BlogTagCloud({
  tags,
  type = 'tags',
  showCount = false,
  limit,
  sizeFactor = false,
  className,
}: BlogTagCloudProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  // Sort tags by count if available
  const sortedTags = [...tags].sort((a, b) => {
    // If counts are available, sort by count
    if (typeof a.count === 'number' && typeof b.count === 'number') {
      return b.count - a.count
    }
    // Otherwise sort by title
    return a.title.localeCompare(b.title)
  })

  // Limit the number of tags shown
  const limitedTags = limit ? sortedTags.slice(0, limit) : sortedTags

  // Calculate size factors if needed
  const maxCount = sizeFactor ? Math.max(...limitedTags.map((tag) => tag.count || 0), 1) : 1

  const getTagSize = (count: number = 0) => {
    if (!sizeFactor) return 'text-sm'

    const ratio = count / maxCount

    if (ratio > 0.8) return 'text-lg font-semibold'
    if (ratio > 0.6) return 'text-base font-medium'
    if (ratio > 0.4) return 'text-sm'
    if (ratio > 0.2) return 'text-xs'
    return 'text-xs'
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {limitedTags.map((tag) => (
        <Link
          key={tag.id}
          href={`/${currentLocale}/blog?${type === 'categories' ? 'category' : 'tag'}=${tag.slug}`}
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors',
            'bg-background hover:bg-muted',
            getTagSize(tag.count),
          )}
        >
          {tag.title}
          {showCount && tag.count !== undefined && (
            <span className="ml-1 text-xs text-muted-foreground">({tag.count})</span>
          )}
        </Link>
      ))}

      {limit && sortedTags.length > limit && (
        <Link
          href={`/${currentLocale}/blog/${type}`}
          className="inline-flex items-center rounded-full border px-2.5 py-0.5 bg-background hover:bg-muted text-sm text-muted-foreground"
        >
          +{sortedTags.length - limit} more
        </Link>
      )}
    </div>
  )
}
