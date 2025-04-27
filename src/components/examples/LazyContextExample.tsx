'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Lazy-loaded ContextExample component with appropriate loading skeleton
export const LazyContextExample = dynamic(
  () => import('./ContextExample').then((mod) => ({ default: mod.ContextExample })),
  {
    loading: () => <ContextExampleSkeleton />,
    ssr: false,
  }
)

// Skeleton for the ContextExample component
function ContextExampleSkeleton() {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-2/3" />
        </CardTitle>
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
          <div className="space-y-4 pt-4">
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-1/3 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
