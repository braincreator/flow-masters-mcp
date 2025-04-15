'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { formatDate } from '@/lib/blogHelpers'
import { BadgeCheck, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { BlogTag } from '@/components/blog/BlogTag'

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
  tags?: {
    id: string
    title: string
    slug: string
  }[]
  readTime?: number
}

interface BlogFeaturedPostProps {
  post: Post
  className?: string
}

export function BlogFeaturedPost({ post, className }: BlogFeaturedPostProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  return (
    <div className={cn('group relative overflow-hidden rounded-xl', className)}>
      {/* Background image with gradient overlay */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl">
        {post.heroImage ? (
          <Image
            src={post.heroImage.url}
            alt={post.heroImage.alt || post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <div className="flex items-center space-x-2 mb-3">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <span className="text-primary-foreground text-sm font-medium">Featured Post</span>
        </div>

        {post.categories && post.categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.categories.slice(0, 3).map((category) => (
              <Link
                key={category.id}
                href={`/${currentLocale}/blog?category=${category.slug}`}
                className="bg-primary/20 backdrop-blur-sm text-primary-foreground text-xs px-3 py-1 rounded-full hover:bg-primary/30 transition-colors"
              >
                {category.title}
              </Link>
            ))}
          </div>
        )}

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">{post.title}</h2>

        {post.excerpt && (
          <p className="text-white/90 mb-6 max-w-2xl text-base md:text-lg line-clamp-2">
            {post.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 mb-6 text-white/70 text-sm">
          {post.author && (
            <div className="flex items-center gap-2">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/30" />
              )}
              <span>{post.author.name}</span>
            </div>
          )}

          {post.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
          )}

          {post.readTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {post.readTime} {currentLocale === 'ru' ? 'мин чтения' : 'min read'}
              </span>
            </div>
          )}

          {/* Теги */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 mb-6">
              {post.tags.map((tag) => (
                <BlogTag key={tag.id} tag={tag} locale={currentLocale} showIcon={true} size="md" />
              ))}
            </div>
          )}
        </div>

        <Button asChild className="w-full sm:w-auto" size="lg">
          <Link href={`/${currentLocale}/blog/${post.slug}`}>
            {currentLocale === 'ru' ? 'Читать статью' : 'Read Article'}
          </Link>
        </Button>
      </div>
    </div>
  )
}
