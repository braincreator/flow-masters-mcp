import React from 'react'
import { Badge } from '@/components/ui/badge'
import { PercentIcon } from 'lucide-react'

interface DiscountBadgeProps {
  percentage: number
  className?: string
}

export function DiscountBadge({ percentage, className }: DiscountBadgeProps) {
  return (
    <Badge variant="destructive" className={`flex items-center gap-1 ${className || ''}`}>
      <PercentIcon className="h-3 w-3" />-{percentage}%
    </Badge>
  )
}
