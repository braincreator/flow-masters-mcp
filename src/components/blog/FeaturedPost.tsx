'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, User as UserIcon, ArrowRight, BookOpen, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/ui'
import { formatBlogDate } from '@/lib/blogHelpers'
import { Badge } from '@/components/ui/badge'

// Вспомогательная функция для получения краткого описания из контента
function getExcerpt(content: any, maxLength = 200): string {
  if (!content) return ''

  try {
    let text = ''
    if (typeof content === 'string') {
      text = content
    } else if (Array.isArray(content)) {
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
    url: string
    alt: string
  }
  content?: any
  author?: {
    name: string
    avatar?: string
  }
  categories?: {
    id: string
    title: string
    slug: string
  }[]
  tags?: TagType[]
  readingTime?: number
}

interface FeaturedPostProps {
  post: Post
  locale?: string
  className?: string
}

export function FeaturedPost({ post, locale = 'en', className }: FeaturedPostProps) {
  const t = useTranslations('blog')
  const postContent = post?.content ?? null
  const displayExcerpt = post?.excerpt ? post.excerpt : getExcerpt(postContent, 200)

  if (!post) return null

  const formattedDate = (post.publishedAt && formatBlogDate(post.publishedAt, locale)) || ''
  const postLink = `/${locale}/blog/${post.slug}`
  const imageUrl = post.thumbnail?.url || post.heroImage?.url || ''
  const imageAlt =
    post.thumbnail?.alt || post.heroImage?.alt || post.title || 'Featured blog post image'

  return (
    <article
      className={cn(
        'featured-post group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-background to-primary/5 border border-primary/10 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10',
        className,
      )}
    >
      <div className="lg:flex lg:items-center lg:gap-8">
        {/* Image */}
        {imageUrl && (
          <div className="lg:w-1/2 relative">
            {/* Featured Badge - перемещен внутрь контейнера изображения */}
            <div className="absolute left-6 top-6 z-30">
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 border-0 font-semibold">
                <Star className="w-3 h-3 mr-1.5 fill-current" />
                {t('featured')}
              </Badge>
            </div>

            <Link
              href={postLink}
              className="block relative overflow-hidden aspect-[16/10] lg:aspect-[4/3] rounded-2xl"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />

              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover transition-all duration-700 group-hover:scale-105"
              />

              {/* Category badge */}
              {post.categories?.[0] && (
                <div className="absolute right-4 top-4 z-20">
                  <Badge
                    variant="secondary"
                    className="bg-white/95 text-gray-900 hover:bg-white transition-all duration-300 backdrop-blur-sm border-0 shadow-md font-medium"
                  >
                    {post.categories[0].title}
                  </Badge>
                </div>
              )}

              {/* Reading time indicator */}
              {post.readingTime && (
                <div className="absolute left-4 bottom-4 z-20">
                  <Badge
                    variant="outline"
                    className="bg-black/30 text-white border-white/40 backdrop-blur-sm hover:bg-black/40 transition-all duration-300 font-medium"
                  >
                    <BookOpen className="w-3 h-3 mr-1.5" />
                    {post.readingTime} {t('readTimeUnit')}
                  </Badge>
                </div>
              )}
            </Link>
          </div>
        )}

        {/* Content */}
        <div className={cn('p-8 lg:p-12', imageUrl ? 'lg:w-1/2' : 'w-full relative')}>
          {/* Featured Badge для случая без изображения */}
          {!imageUrl && (
            <div className="absolute right-8 top-8 z-30">
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 border-0 font-semibold">
                <Star className="w-3 h-3 mr-1.5 fill-current" />
                {t('featured')}
              </Badge>
            </div>
          )}

          {/* Title */}
          <Link href={postLink} className="group">
            <h2 className="mb-4 text-3xl lg:text-4xl font-bold leading-tight group-hover:text-primary transition-colors duration-200">
              {post.title}
            </h2>
          </Link>

          {/* Meta */}
          <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {formattedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary/60" />
                <time dateTime={post.publishedAt || undefined} className="font-medium">
                  {formattedDate}
                </time>
              </div>
            )}

            {post.readingTime && !imageUrl && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary/60" />
                <span className="font-medium">
                  {post.readingTime} {t('readTimeUnit')}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {post.tags.slice(0, 4).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors"
                >
                  {tag.title}
                </Badge>
              ))}
              {post.tags.length > 4 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-muted/50 text-muted-foreground border-muted"
                >
                  +{post.tags.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Excerpt */}
          {displayExcerpt && (
            <p className="mb-8 text-base text-muted-foreground leading-relaxed line-clamp-3">
              {displayExcerpt}
            </p>
          )}

          {/* Author and Read More */}
          <div className="flex items-center justify-between">
            {/* Author */}
            {post.author && (
              <div className="flex items-center gap-3">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name || 'Author'}
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                    <UserIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{post.author.name}</span>
                </div>
              </div>
            )}

            {/* Read More Button */}
            <Link
              href={postLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 group"
            >
              {t('readMore')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
