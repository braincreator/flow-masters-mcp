'use client'

import { useCart } from '@/hooks/useCart'
import { cn } from '@/utilities/ui'

export function CartBadge() {
  const { itemCount } = useCart()

  if (itemCount <= 0) return null

  return (
    <span
      className={cn(
        'absolute -top-2 -right-2 bg-amber-500 text-black font-bold',
        'rounded-full min-w-5 h-5 flex items-center justify-center text-xs',
        'px-1 shadow-sm border border-background',
      )}
    >
      {itemCount}
    </span>
  )
}
