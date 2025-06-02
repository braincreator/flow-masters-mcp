'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EnhancedBlogSkeletonProps {
  layout?: 'grid' | 'list'
  count?: number
  showFeatured?: boolean
  showProgress?: boolean
  className?: string
}

export function EnhancedBlogSkeleton({
  layout = 'grid',
  count = 6,
  showFeatured = false,
  showProgress = false,
  className,
}: EnhancedBlogSkeletonProps) {
  return (
    <div className={cn('space-y-8 blog-smooth-entrance', className)}>
      {/* Subtle Loading Indicator - только тонкая полоска прогресса */}
      {showProgress && (
        <div className="mb-8">
          <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary/60 to-primary animate-pulse rounded-full w-1/3" />
          </div>
        </div>
      )}

      {/* Featured Post Skeleton */}
      {showFeatured && (
        <div className="mb-16 blog-smooth-entrance" style={{ animationDelay: '0.1s' }}>
          <div className="mb-8 flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-lg animate-pulse" />
            <Skeleton className="h-8 w-48 animate-pulse" />
          </div>
          <Card className="overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="lg:flex lg:items-center lg:gap-8">
              {/* Image Section */}
              <div className="lg:w-1/2 relative">
                {/* Featured Badge Skeleton */}
                <div className="absolute left-6 top-6 z-30">
                  <Badge className="bg-gradient-to-r from-primary/60 to-primary/40 text-primary-foreground shadow-lg animate-pulse border-0 font-semibold">
                    <Skeleton className="h-3 w-3 mr-1.5 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </Badge>
                </div>

                <div className="relative aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden">
                  <Skeleton className="h-full w-full bg-gradient-to-br from-muted/50 to-muted animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Category Badge Skeleton */}
                  <div className="absolute right-4 top-4 z-20">
                    <Badge variant="secondary" className="animate-pulse bg-white/80">
                      <Skeleton className="h-3 w-12" />
                    </Badge>
                  </div>

                  {/* Reading Time Badge Skeleton */}
                  <div className="absolute left-4 bottom-4 z-20">
                    <Badge variant="outline" className="animate-pulse bg-black/20 border-white/30">
                      <Skeleton className="h-3 w-3 mr-1.5 rounded-full" />
                      <Skeleton className="h-3 w-12" />
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="lg:w-1/2 p-8 lg:p-12">
                {/* Title Skeleton */}
                <div className="mb-4 space-y-2">
                  <Skeleton className="h-8 w-full animate-pulse" />
                  <Skeleton className="h-8 w-3/4 animate-pulse" />
                </div>

                {/* Meta Skeleton */}
                <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                    <Skeleton className="h-4 w-20 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                    <Skeleton className="h-4 w-16 animate-pulse" />
                  </div>
                </div>

                {/* Tags Skeleton */}
                <div className="mb-6 flex flex-wrap gap-2">
                  <Badge variant="outline" className="animate-pulse bg-primary/10">
                    <Skeleton className="h-3 w-12" />
                  </Badge>
                  <Badge variant="outline" className="animate-pulse bg-primary/10">
                    <Skeleton className="h-3 w-16" />
                  </Badge>
                  <Badge variant="outline" className="animate-pulse bg-primary/10">
                    <Skeleton className="h-3 w-10" />
                  </Badge>
                </div>

                {/* Excerpt Skeleton */}
                <div className="mb-8 space-y-2">
                  <Skeleton className="h-4 w-full animate-pulse" />
                  <Skeleton className="h-4 w-full animate-pulse" />
                  <Skeleton className="h-4 w-2/3 animate-pulse" />
                </div>

                {/* Author and Button Skeleton */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20 animate-pulse" />
                      <Skeleton className="h-3 w-12 animate-pulse" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-32 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Section Title Skeleton */}
      <div
        className="flex items-center justify-between blog-smooth-entrance"
        style={{ animationDelay: '0.2s' }}
      >
        <Skeleton className="h-8 w-48 animate-pulse" />
        <Skeleton className="h-5 w-24 animate-pulse" />
      </div>

      {/* Posts Grid/List Skeleton */}
      <div
        className={cn(
          'gap-6',
          layout === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col',
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} layout={layout} delay={index * 80} />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div
        className="mt-12 flex justify-center blog-smooth-entrance"
        style={{ animationDelay: '0.5s' }}
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md animate-pulse" />
          <Skeleton className="h-10 w-10 rounded-md animate-pulse" />
          <Skeleton className="h-10 w-10 rounded-md animate-pulse" />
          <span className="mx-2 text-muted-foreground">...</span>
          <Skeleton className="h-10 w-10 rounded-md animate-pulse" />
          <Skeleton className="h-10 w-10 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  )
}

interface SkeletonCardProps {
  layout: 'grid' | 'list'
  delay?: number
}

function SkeletonCard({ layout, delay = 0 }: SkeletonCardProps) {
  return (
    <Card
      className={cn(
        'group overflow-hidden border border-border/50 shadow-sm transition-all duration-300',
        'blog-smooth-entrance',
        layout === 'grid' ? 'h-full' : 'flex-row',
      )}
      style={
        {
          animationDelay: `${delay}ms`,
        } as React.CSSProperties
      }
    >
      <div className={cn(layout === 'grid' ? 'flex flex-col' : 'flex flex-row')}>
        {/* Image Skeleton */}
        <div
          className={cn(
            'relative bg-gradient-to-br from-muted/50 to-muted overflow-hidden',
            layout === 'grid' ? 'aspect-[16/9] w-full' : 'aspect-[4/3] w-48 flex-none',
          )}
        >
          <Skeleton className="h-full w-full animate-pulse" />

          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Category Badge Skeleton */}
          <div className="absolute right-3 top-3">
            <Badge variant="secondary" className="animate-pulse bg-primary/20">
              <Skeleton className="h-3 w-16" />
            </Badge>
          </div>

          {/* Reading Time Badge Skeleton */}
          <div className="absolute left-3 top-3">
            <Badge variant="outline" className="animate-pulse bg-background/80">
              <Skeleton className="h-3 w-12" />
            </Badge>
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className="flex flex-1 flex-col p-6">
          {/* Title Skeleton */}
          <div className="mb-3 space-y-2">
            <Skeleton className="h-6 w-full animate-pulse" />
            <Skeleton className="h-6 w-3/4 animate-pulse" />
          </div>

          {/* Meta Skeleton */}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
              <Skeleton className="h-4 w-20 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
              <Skeleton className="h-4 w-16 animate-pulse" />
            </div>
          </div>

          {/* Tags Skeleton */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="animate-pulse bg-muted/50">
              <Skeleton className="h-3 w-12" />
            </Badge>
            <Badge variant="secondary" className="animate-pulse bg-muted/50">
              <Skeleton className="h-3 w-16" />
            </Badge>
            <Badge variant="secondary" className="animate-pulse bg-muted/50">
              <Skeleton className="h-3 w-10" />
            </Badge>
          </div>

          {/* Excerpt Skeleton */}
          <div className="mb-6 space-y-2">
            <Skeleton className="h-4 w-full animate-pulse" />
            <Skeleton className="h-4 w-full animate-pulse" />
            <Skeleton className="h-4 w-2/3 animate-pulse" />
          </div>

          {/* Footer Skeleton */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
            {/* Author Skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full animate-pulse" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20 animate-pulse" />
                <Skeleton className="h-3 w-12 animate-pulse" />
              </div>
            </div>
            {/* Read More Button Skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 animate-pulse" />
              <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

// Enhanced loading animation with shimmer effect
export function BlogLoadingShimmer() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-muted/20 p-8">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </div>
  )
}

// Keyframe animation for shimmer effect
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
`

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.querySelector('#shimmer-styles')) {
  const style = document.createElement('style')
  style.id = 'shimmer-styles'
  style.textContent = shimmerKeyframes
  document.head.appendChild(style)
}
