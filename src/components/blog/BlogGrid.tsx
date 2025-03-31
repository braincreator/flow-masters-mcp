'use client'

import React from 'react'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { cn } from '@/lib/utils'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
  heroImage?: {
    url: string
    alt: string
  }
  author?: {
    id: string
    name: string
    avatar?: string
  }
  categories?: {
    id: string
    title: string
    slug: string
  }[]
  readTime?: number
}

interface BlogGridProps {
  posts: Post[]
  layout?: 'grid' | 'list'
  emptyMessage?: string
  className?: string
}

export function BlogGrid({
  posts,
  layout = 'grid',
  emptyMessage = 'No posts available.',
  className,
}: BlogGridProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        layout === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'flex flex-col gap-4',
        className,
      )}
    >
      {posts.map((post) => (
        <BlogPostCard
          key={post.id}
          post={post}
          variant={layout === 'list' ? 'horizontal' : 'default'}
        />
      ))}
    </div>
  )
}
