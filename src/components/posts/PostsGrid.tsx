'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { formatDate } from '@/lib/blogHelpers'
import { Calendar } from 'lucide-react'
import { Media } from '@/components/Media'

interface Post {
  id: string
  title: string
  slug: string
  categories?: {
    id: string
    title: string
  }[]
  meta?: {
    description?: string
    image?: any
  }
  createdAt?: string
  publishedAt?: string
}

interface PostsGridProps {
  posts: Post[]
  emptyMessage?: string
  className?: string
}

export function PostsGrid({
  posts,
  emptyMessage = 'No posts available.',
  className,
}: PostsGridProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.slug}`}>
          <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md border-border group">
            {/* Image */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              {post.meta?.image ? (
                <Media
                  resource={post.meta.image}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  fill
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}

              {/* Category tag */}
              {post.categories && post.categories.length > 0 && (
                <div className="absolute top-3 left-3">
                  <span className="inline-block bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded backdrop-blur-sm">
                    {post.categories[0].title}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <CardHeader className="p-4">
              <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
            </CardHeader>

            {post.meta?.description && (
              <CardContent className="px-4 pt-0">
                <CardDescription className="line-clamp-2">{post.meta.description}</CardDescription>
              </CardContent>
            )}

            <CardFooter className="px-4 pb-4 mt-auto">
              <div className="flex items-center text-muted-foreground text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <time dateTime={new Date(post.publishedAt || post.createdAt || '').toISOString()}>
                  {formatDate(post.publishedAt || post.createdAt || '')}
                </time>
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
