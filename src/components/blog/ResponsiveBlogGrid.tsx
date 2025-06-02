'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { BlogPostCard } from './BlogPostCard'
import { FeaturedPost } from './FeaturedPost'
import { EnhancedBlogSkeleton } from './EnhancedBlogSkeleton'
import { BlogPost } from '@/types/blocks'
import { Locale } from '@/constants'
import { Search, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResponsiveBlogGridProps {
  posts: BlogPost[]
  layout: 'grid' | 'list'
  locale: Locale
  isLoading?: boolean
  hasActiveFilters?: boolean
  showFeatured?: boolean
  onClearFilters?: () => void
  className?: string
}

export function ResponsiveBlogGrid({
  posts,
  layout,
  locale,
  isLoading = false,
  hasActiveFilters = false,
  showFeatured = true,
  onClearFilters,
  className,
}: ResponsiveBlogGridProps) {
  const t = useTranslations('blogPage')

  if (isLoading) {
    return (
      <div className={cn('animate-in fade-in duration-500', className)}>
        <EnhancedBlogSkeleton
          layout={layout}
          count={6}
          showFeatured={showFeatured && !hasActiveFilters}
          showProgress={false}
        />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border border-border bg-muted/20 py-16 text-center',
          className,
        )}
      >
        <div className="h-16 w-16 rounded-full bg-muted/50 p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">{t('noPostsFound')}</h3>
        <p className="max-w-md text-muted-foreground mb-4">{t('tryChangingFilters')}</p>
        {onClearFilters && (
          <Button onClick={onClearFilters} variant="outline">
            {t('clearFilters')}
          </Button>
        )}
      </div>
    )
  }

  const featuredPost = posts[0]
  const regularPosts = hasActiveFilters ? posts : posts.slice(1)

  return (
    <div className={cn('space-y-8', className)}>
      {/* Featured Post Section */}
      {showFeatured && !hasActiveFilters && featuredPost && (
        <div className="mb-16">
          <div className="mb-8 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">{t('featuredArticle')}</h2>
          </div>
          <FeaturedPost post={featuredPost} locale={locale} className="blog-fade-in" />
        </div>
      )}

      {/* Regular Posts Section */}
      {regularPosts.length > 0 && (
        <div className="space-y-8">
          {/* Section Title */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {hasActiveFilters ? t('searchResults') : t('latestArticles')}
            </h2>
            <div className="text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? t('article') : t('articles')}
            </div>
          </div>

          {/* Posts Grid */}
          <div
            className={cn(
              'gap-6',
              layout === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'flex flex-col space-y-6',
            )}
          >
            {regularPosts.map((post, index) => {
              if (!post || !post.id) {
                console.warn('Skipping invalid post:', post)
                return null
              }

              return (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  locale={locale}
                  layout={layout}
                  imagePriority={index < 3}
                  className={cn(
                    'blog-smooth-entrance h-full transition-all duration-300 hover:scale-[1.01]',
                    layout === 'list' && 'max-w-none',
                  )}
                  style={{
                    animationDelay: `${index * 0.08}s`,
                  }}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced grid container with better responsive behavior
export function BlogGridContainer({
  children,
  layout,
  className,
}: {
  children: React.ReactNode
  layout: 'grid' | 'list'
  className?: string
}) {
  return (
    <div
      className={cn(
        'w-full',
        layout === 'grid' && [
          'grid gap-6',
          'grid-cols-1',
          'sm:grid-cols-2',
          'lg:grid-cols-3',
          'xl:grid-cols-3',
          '2xl:grid-cols-4',
        ],
        layout === 'list' && 'flex flex-col space-y-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

// Masonry-style grid for varied content heights
export function MasonryBlogGrid({
  posts,
  locale,
  className,
}: {
  posts: BlogPost[]
  locale: Locale
  className?: string
}) {
  return (
    <div
      className={cn('columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6', className)}
    >
      {posts.map((post, index) => (
        <div key={post.id} className="break-inside-avoid mb-6">
          <BlogPostCard
            post={post}
            locale={locale}
            layout="grid"
            imagePriority={index < 6}
            className="blog-fade-in"
            style={{
              animationDelay: `${index * 0.05}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Infinite scroll container
export function InfiniteScrollGrid({
  posts,
  locale,
  layout,
  isLoading,
  hasMore,
  onLoadMore,
  className,
}: {
  posts: BlogPost[]
  locale: Locale
  layout: 'grid' | 'list'
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  className?: string
}) {
  const t = useTranslations('blog')

  React.useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        if (hasMore && !isLoading) {
          onLoadMore()
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoading, onLoadMore])

  return (
    <div className={className}>
      <BlogGridContainer layout={layout}>
        {posts.map((post, index) => (
          <BlogPostCard
            key={post.id}
            post={post}
            locale={locale}
            layout={layout}
            imagePriority={index < 6}
            className="blog-fade-in"
            style={{
              animationDelay: `${(index % 12) * 0.05}s`,
            }}
          />
        ))}
      </BlogGridContainer>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium">{t('loading')}</span>
          </div>
        </div>
      )}

      {/* Load more button (fallback for infinite scroll) */}
      {!isLoading && hasMore && (
        <div className="mt-8 flex justify-center">
          <Button onClick={onLoadMore} variant="outline">
            Load More Articles
          </Button>
        </div>
      )}
    </div>
  )
}
