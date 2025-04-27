'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy-loaded blog components with appropriate loading skeletons

export const LazyBlogPostCard = dynamic(
  () => import('./BlogPostCard').then((mod) => ({ default: mod.BlogPostCard })),
  {
    loading: () => (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    ),
    ssr: false,
  }
)

export const LazyBlogSearch = dynamic(
  () => import('./BlogSearch').then((mod) => ({ default: mod.BlogSearch })),
  {
    loading: () => <Skeleton className="h-10 w-full rounded-md" />,
    ssr: false,
  }
)

export const LazyBlogTagCloud = dynamic(
  () => import('./BlogTagCloud').then((mod) => ({ default: mod.BlogTagCloud })),
  {
    loading: () => (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
    ),
    ssr: false,
  }
)

export const LazyComments = dynamic(
  () => import('./Comments').then((mod) => ({ default: mod.Comments })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
)

export const LazyCommentForm = dynamic(
  () => import('./CommentForm').then((mod) => ({ default: mod.CommentForm })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    ),
    ssr: false,
  }
)
