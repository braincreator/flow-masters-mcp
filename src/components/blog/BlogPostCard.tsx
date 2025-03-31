'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'

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

interface BlogPostCardProps {
  post: Post
  variant?: 'default' | 'featured' | 'minimal' | 'horizontal'
  className?: string
}

export function BlogPostCard({ post, variant = 'default', className }: BlogPostCardProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  const isFeatured = variant === 'featured'
  const isMinimal = variant === 'minimal'
  const isHorizontal = variant === 'horizontal'

  return (
    <Link href={`/${currentLocale}/blog/${post.slug}`}>
      <Card
        className={cn(
          'h-full overflow-hidden transition-all duration-200 hover:shadow-md border-border',
          isHorizontal ? 'flex flex-col sm:flex-row' : 'flex flex-col',
          className,
        )}
      >
        {/* Image */}
        {post.heroImage?.url && (
          <div
            className={cn(
              'relative overflow-hidden',
              isHorizontal
                ? 'h-48 sm:h-full sm:w-1/3 sm:min-h-[240px]'
                : isMinimal
                  ? 'h-40'
                  : 'h-48',
            )}
          >
            <Image
              src={post.heroImage.url}
              alt={post.heroImage.alt || post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {isFeatured && post.categories && post.categories.length > 0 && (
              <div className="absolute top-4 left-4">
                <span className="inline-block bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  {post.categories[0].title}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn('flex flex-1 flex-col', isHorizontal ? 'sm:w-2/3' : '')}>
          <CardHeader className={cn(isMinimal ? 'p-3' : 'p-5')}>
            {post.categories && post.categories.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-medium text-primary">{post.categories[0].title}</span>
              </div>
            )}

            <h3
              className={cn(
                'font-bold line-clamp-2',
                isFeatured ? 'text-2xl' : isMinimal ? 'text-base' : 'text-xl',
              )}
            >
              {post.title}
            </h3>
          </CardHeader>

          {!isMinimal && post.excerpt && (
            <CardContent className={cn('px-5 pt-0')}>
              <CardDescription className={cn('line-clamp-2', isFeatured ? 'text-base' : 'text-sm')}>
                {post.excerpt}
              </CardDescription>
            </CardContent>
          )}

          <CardFooter className={cn('mt-auto', isMinimal ? 'p-3' : 'p-5 pt-0')}>
            <div className="flex items-center justify-between w-full text-muted-foreground text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                {post.author && <span>{post.author.name}</span>}

                {post.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <time dateTime={new Date(post.publishedAt).toISOString()}>
                      {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                    </time>
                  </div>
                )}

                {post.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{post.readTime} min read</span>
                  </div>
                )}
              </div>
            </div>
          </CardFooter>
        </div>
      </Card>
    </Link>
  )
}
