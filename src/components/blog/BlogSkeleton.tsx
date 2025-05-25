'use client'

import React from 'react'
import { cn } from '@/utilities/ui'

interface BlogSkeletonProps {
  layout?: 'grid' | 'list'
  count?: number
  showFeatured?: boolean
  className?: string
}

function SkeletonCard({ layout = 'grid' }: { layout?: 'grid' | 'list' }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl border border-border/50 bg-card overflow-hidden',
        layout === 'grid' ? 'h-full' : 'flex flex-row gap-6',
      )}
    >
      {/* Image skeleton */}
      <div
        className={cn(
          'bg-muted',
          layout === 'grid' ? 'aspect-[16/9] w-full' : 'aspect-[4/3] w-48 flex-none',
        )}
      />
      
      {/* Content skeleton */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title skeleton */}
        <div className="mb-3 space-y-2">
          <div className="h-6 bg-muted rounded-md w-4/5" />
          <div className="h-6 bg-muted rounded-md w-3/5" />
        </div>
        
        {/* Meta skeleton */}
        <div className="mb-4 flex items-center gap-4">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-16" />
        </div>
        
        {/* Tags skeleton */}
        <div className="mb-4 flex gap-2">
          <div className="h-6 bg-muted rounded-full w-16" />
          <div className="h-6 bg-muted rounded-full w-20" />
          <div className="h-6 bg-muted rounded-full w-14" />
        </div>
        
        {/* Excerpt skeleton */}
        <div className="mb-6 space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
        
        {/* Author and button skeleton */}
        <div className={cn('flex items-center justify-between pt-4 border-t border-border/50', layout === 'grid' && 'mt-auto')}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-muted rounded-full" />
            <div className="space-y-1">
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-3 bg-muted rounded w-12" />
            </div>
          </div>
          <div className="h-8 bg-muted rounded-full w-24" />
        </div>
      </div>
    </div>
  )
}

function FeaturedSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-border/50 bg-card overflow-hidden">
      <div className="lg:flex lg:items-center lg:gap-8">
        {/* Image skeleton */}
        <div className="lg:w-1/2 aspect-[16/10] lg:aspect-[4/3] bg-muted" />
        
        {/* Content skeleton */}
        <div className="lg:w-1/2 p-8 lg:p-12">
          {/* Featured badge skeleton */}
          <div className="mb-4 h-6 bg-muted rounded-full w-24" />
          
          {/* Title skeleton */}
          <div className="mb-4 space-y-3">
            <div className="h-8 bg-muted rounded-md w-full" />
            <div className="h-8 bg-muted rounded-md w-4/5" />
            <div className="h-8 bg-muted rounded-md w-3/5" />
          </div>
          
          {/* Meta skeleton */}
          <div className="mb-6 flex items-center gap-6">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-4 bg-muted rounded w-20" />
          </div>
          
          {/* Tags skeleton */}
          <div className="mb-6 flex gap-2">
            <div className="h-6 bg-muted rounded-full w-20" />
            <div className="h-6 bg-muted rounded-full w-24" />
            <div className="h-6 bg-muted rounded-full w-18" />
            <div className="h-6 bg-muted rounded-full w-16" />
          </div>
          
          {/* Excerpt skeleton */}
          <div className="mb-8 space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-4/5" />
          </div>
          
          {/* Author and button skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted rounded-full" />
              <div className="space-y-1">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            </div>
            <div className="h-12 bg-muted rounded-full w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function BlogSkeleton({
  layout = 'grid',
  count = 6,
  showFeatured = false,
  className,
}: BlogSkeletonProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* Featured post skeleton */}
      {showFeatured && (
        <div className="mb-12">
          <FeaturedSkeleton />
        </div>
      )}
      
      {/* Regular posts skeleton */}
      <div
        className={cn(
          'gap-6',
          layout === 'grid' ? 'grid sm:grid-cols-2' : 'flex flex-col',
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} layout={layout} />
        ))}
      </div>
    </div>
  )
}

// Individual skeleton components for more granular use
export { SkeletonCard, FeaturedSkeleton }
