import React from 'react'
import { Star } from 'lucide-react'

interface RatingBadgeProps {
  rating: number
  className?: string
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
      <span className="text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}
