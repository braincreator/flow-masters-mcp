'use client'

import React from 'react'
import Link from 'next/link'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { usePathname } from 'next/navigation'
import { Calendar, Clock, User as UserIcon, ArrowRight, BookOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/ui'
import { formatBlogDate } from '@/lib/blogHelpers'
import { BlogTag } from '@/components/blog/BlogTag'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Вспомогательная функция для получения краткого описания из контента
function getExcerpt(content: any, maxLength = 160): string {
  if (!content) return ''

  try {
    // Простая реализация для текстового содержимого
    let text = ''
    if (typeof content === 'string') {
      text = content
    } else if (Array.isArray(content)) {
      // Предполагаем, что контент может быть массивом блоков
      text = content
        .map((block) => {
          if (typeof block === 'string') return block
          if (typeof block === 'object' && block?.text) return block.text
          return ''
        })
        .join(' ')
    } else if (typeof content === 'object' && content?.text) {
      text = content.text
    }

    // Normalize whitespace to prevent hydration mismatches
    text = text.replace(/\s+/g, ' ').trim()

    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  } catch (error) {
    // Return empty string on any error to prevent hydration issues
    return ''
  }
}

interface TagType {
  id: string
  title: string
  slug: string
}

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
  thumbnail?: {
    // Add thumbnail field
    url: string
    alt: string
  }
  content?: any // Add content field

  categories?: {
    id: string
    title: string
    slug: string
  }[]
  tags?: TagType[]
  readingTime?: number
}

interface BlogPostCardProps {
  post: Post
  locale?: string
  layout?: 'grid' | 'list'
  imagePriority?: boolean
  showExcerpt?: boolean

  showDate?: boolean
  showTags?: boolean
  className?: string
  style?: React.CSSProperties
}

export function BlogPostCard({
  post,
  locale = 'en',
  layout = 'grid',
  imagePriority = false,
  showExcerpt = true,

  showDate = true,
  showTags = true,
  className,
  style,
}: BlogPostCardProps) {
  const t = useTranslations('blog')
  const postContent = post?.content ?? null
  const displayExcerpt = showExcerpt && post?.excerpt ? post.excerpt : getExcerpt(postContent, 120)

  if (!post) return null

  const formattedDate = (post.publishedAt && formatBlogDate(post.publishedAt, locale)) || ''
  const postLink = `/${locale}/blog/${post.slug}`

  const imageUrl = post.thumbnail?.url || post.heroImage?.url || '' // Determine image URL, fallback to empty string
  const imageAlt = post.thumbnail?.alt || post.heroImage?.alt || post.title || 'Blog post image' // Use static fallback to prevent hydration issues

  return (
    <article
      className={cn(
        'blog-card group relative flex flex-col overflow-hidden rounded-2xl bg-card text-card-foreground transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border border-border/50 hover:border-primary/20',
        layout === 'grid' ? 'h-full' : 'flex-row gap-6',
        className,
      )}
      style={style}
    >
      {/* Image */}
      {imageUrl && ( // Render only if imageUrl exists
        <Link
          href={postLink}
          className={cn(
            'blog-image-container relative block overflow-hidden',
            // Adjust image size for list view
            layout === 'grid' ? 'aspect-[16/9] w-full' : 'aspect-[4/3] w-48 flex-none',
          )}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <OptimizedImage
            src={imageUrl} // Use the determined imageUrl
            alt={imageAlt} // Use the determined imageAlt
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={imagePriority}
            className={cn(
              'blog-image object-cover transition-all duration-500 group-hover:scale-105',
              // Adjust image rounding for list view
              layout === 'grid' ? 'rounded-t-2xl' : 'rounded-l-2xl rounded-r-none',
            )}
          />

          {/* Category badge */}
          {post.categories?.[0] && (
            <div className="absolute right-3 top-3 z-20">
              <Badge
                variant="secondary"
                className="bg-white/90 text-gray-900 hover:bg-white transition-colors backdrop-blur-sm border-0 shadow-sm"
              >
                {post.categories[0].title}
              </Badge>
            </div>
          )}

          {/* Reading time indicator */}
          {post.readingTime && (
            <div className="absolute left-3 top-3 z-20">
              <Badge
                variant="outline"
                className="bg-black/20 text-white border-white/30 backdrop-blur-sm"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                {post.readingTime} {t('readTimeUnit')}
              </Badge>
            </div>
          )}

          {/* Read more overlay on hover */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <ArrowRight className="w-5 h-5 text-gray-900" />
            </div>
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title */}
        <Link href={postLink} className="group">
          <h3 className="blog-title mb-3 text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {showDate && formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary/60" />
              <time dateTime={post.publishedAt || undefined} className="font-medium">
                {formattedDate}
              </time>
            </div>
          )}

          {/* Only show reading time in meta if not shown in image overlay */}
          {post.readingTime && !imageUrl && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary/60" />
              <span className="font-medium">
                {post.readingTime} {t('readTimeUnit')}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {showTags && post.tags && post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors"
              >
                {tag.title}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs bg-muted/50 text-muted-foreground border-muted"
              >
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Excerpt */}
        {showExcerpt && displayExcerpt && (
          <p className="blog-fade-in visible mb-6 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
            {displayExcerpt}
          </p>
        )}

        {/* Read More */}
        <div
          className={cn(
            'flex items-center justify-end pt-4 border-t border-border/50',
            layout === 'grid' && 'mt-auto',
          )}
        >
          {/* Read More Button */}
          <Link
            href={postLink}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            {t('readMore')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  )
}
