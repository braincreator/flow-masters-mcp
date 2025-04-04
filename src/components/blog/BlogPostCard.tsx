'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, Clock, User as UserIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'

// Добавим недостающие переводы
const translations = {
  en: {
    readTimeUnit: 'min read',
  },
  ru: {
    readTimeUnit: 'мин чтения',
  },
}

// Вспомогательная функция для получения краткого описания из контента
function getExcerpt(content: any, maxLength = 160): string {
  if (!content) return ''
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
  }

  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Форматирование даты
function formatDate(date: Date, locale = 'en'): string {
  try {
    return format(date, 'MMM d, yyyy')
  } catch (e) {
    return ''
  }
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
  locale?: string
  layout?: 'grid' | 'list'
  imagePriority?: boolean
  showExcerpt?: boolean
  showAuthor?: boolean
  showDate?: boolean
  className?: string
}

export function BlogPostCard({
  post,
  locale = 'en',
  layout = 'grid',
  imagePriority = false,
  showExcerpt = true,
  showAuthor = true,
  showDate = true,
  className,
}: BlogPostCardProps) {
  const t = locale === 'ru' ? translations.ru : translations.en
  const postContent = post?.content ?? null
  const displayExcerpt = showExcerpt && post?.excerpt ? post.excerpt : getExcerpt(postContent, 120)

  if (!post) return null

  const formattedDate = (post.publishedAt && formatDate(new Date(post.publishedAt), locale)) || ''
  const postLink = `/${locale}/blog/${post.slug}`

  return (
    <article
      className={cn(
        'blog-card group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-colors',
        layout === 'grid' ? 'h-full' : 'flex-row gap-4',
        className,
      )}
    >
      {/* Image */}
      {post.heroImage?.url && (
        <Link
          href={postLink}
          className={cn(
            'blog-image-container relative block',
            layout === 'grid' ? 'aspect-[16/9] w-full' : 'aspect-[1/1] w-1/3 flex-none',
          )}
        >
          <Image
            src={post.heroImage.url}
            alt={post.heroImage.alt || post.title || 'Blog post image'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={imagePriority}
            className={cn(
              'blog-image object-cover transition-opacity',
              layout === 'grid' ? 'rounded-t-xl' : 'rounded-l-xl',
            )}
          />
          {post.categories?.[0] && (
            <div className="absolute right-2 top-2 z-10">
              <Link
                href={`/${locale}/blog/category/${post.categories[0].slug}`}
                className="blog-tag inline-block rounded-full bg-accent/80 px-3 py-1 text-[10px] font-medium text-accent-foreground backdrop-blur-sm"
              >
                {post.categories[0].title}
              </Link>
            </div>
          )}
        </Link>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <Link href={postLink} className="group-hover:text-accent">
          <h3 className="blog-title mb-2 text-xl font-semibold">{post.title}</h3>
        </Link>

        {/* Meta */}
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {showDate && formattedDate && (
            <div className="flex items-center">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              <time dateTime={post.publishedAt || ''}>{formattedDate}</time>
            </div>
          )}

          {post.readTime && (
            <div className="flex items-center">
              <Clock className="mr-1 h-3.5 w-3.5" />
              <span>
                {post.readTime} {t.readTimeUnit}
              </span>
            </div>
          )}
        </div>

        {/* Excerpt */}
        {showExcerpt && displayExcerpt && (
          <p className="blog-fade-in visible mb-4 line-clamp-3 text-sm text-muted-foreground">
            {displayExcerpt}
          </p>
        )}

        {/* Author - if available */}
        {showAuthor && post.author && (
          <div className="mt-auto flex items-center pt-4">
            {post.author.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name || 'Author'}
                width={32}
                height={32}
                className="mr-3 rounded-full"
              />
            ) : (
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <UserIcon className="h-4 w-4" />
              </div>
            )}
            <span className="text-sm font-medium">{post.author.name}</span>
          </div>
        )}
      </div>
    </article>
  )
}
