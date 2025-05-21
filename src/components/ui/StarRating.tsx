'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/utilities/ui'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
  className?: string
}

export function StarRating({
  value,
  onChange,
  size = 'md',
  readOnly = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0)

  const handleRating = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating)
    }
  }

  const starSizeClass = 
    size === 'sm' ? 'h-4 w-4' : 
    size === 'lg' ? 'h-7 w-7' : 
    'h-6 w-6'

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleRating(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          className={cn(
            'p-1 transition-colors',
            readOnly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-500'
          )}
          disabled={readOnly}
          aria-label={`Rate ${star} out of 5`}
        >
          <Star
            className={cn(
              starSizeClass,
              (hoverRating || value) >= star 
                ? 'fill-yellow-400 text-yellow-500' 
                : 'fill-muted text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  )
}
