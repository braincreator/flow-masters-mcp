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
  className?: string
  variant?: 'default' | 'compact'
  preserveParams?: boolean
}

export function BlogTagCloud({
  tags,
  activeTag,
  className,
  variant = 'default',
  preserveParams = false,
}: BlogTagCloudProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  if (!tags || tags.length === 0) {
    return null
  }

  const buildHref = (tagSlug: string) => {
    const params = new URLSearchParams(preserveParams ? searchParams.toString() : '')

    // If clicking on the active tag, remove the tag filter
    if (activeTag === tagSlug) {
      params.delete('tag')
    } else {
      params.set('tag', tagSlug)
      // Reset to page 1 when changing tag
      params.delete('page')
    }

    return `/${currentLocale}/blog${params.toString() ? `?${params.toString()}` : ''}`
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => {
        const isActive = activeTag === tag.slug
        return (
          <Badge
            key={tag.id}
            variant={isActive ? 'default' : 'outline'}
            className={cn(
              'transition-colors hover:bg-primary/10',
              isActive ? 'bg-primary/15 hover:bg-primary/15 text-primary border-primary/30' : '',
              variant === 'compact' ? 'text-xs py-0 px-2' : '',
            )}
          >
            <Link href={buildHref(tag.slug)} className="block px-1" scroll={false} prefetch={false}>
              {tag.title}
              {tag.count !== undefined && variant !== 'compact' && (
                <span className="ml-1 text-xs opacity-70">({tag.count})</span>
              )}
            </Link>
          </Badge>
        )
      })}
    </div>
  )
}
