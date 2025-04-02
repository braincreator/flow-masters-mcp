import React from 'react'
import { Badge } from '@/components/ui/badge'
import { PercentIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DiscountBadgeProps {
  percentage: number
  className?: string
}

export function DiscountBadge({ percentage, className }: DiscountBadgeProps) {
  return (
    <Badge
      className={cn(
        'bg-red-600 hover:bg-red-700 text-white',
        'px-2 py-0.5',
        'text-xs font-semibold',
        'flex items-center gap-1',
        className,
      )}
    >
      -{percentage}%
    </Badge>
  )
}
