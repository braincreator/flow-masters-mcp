'use client'

import { useCart } from '@/providers/CartProvider'
import { cn } from '@/utilities/ui'
import { Skeleton } from '@/components/ui/skeleton'

export function CartBadge() {
  const { itemCount, isLoading } = useCart()

  if (isLoading) {
    return <Skeleton className="absolute -top-2 -right-2 rounded-full w-5 h-5" />
  }

  if (itemCount <= 0) return null

  return (
    <span
      className={cn(
        'absolute -top-2 -right-2 bg-amber-500 text-black font-bold',
        'rounded-full min-w-5 h-5 flex items-center justify-center text-xs',
        'px-1 shadow-sm border border-background',
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {itemCount}
    </span>
  )
}
