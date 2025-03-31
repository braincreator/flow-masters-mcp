'use client'

import React from 'react'
import { useReadingProgress } from '@/lib/blogHooks'
import { cn } from '@/lib/utils'

export interface ReadingProgressBarProps {
  className?: string
  barClassName?: string
  gradient?: boolean
  height?: number
  position?: 'top' | 'bottom'
  showPercentage?: boolean
}

export function ReadingProgressBar({
  className,
  barClassName,
  gradient = false,
  height = 4,
  position = 'top',
  showPercentage = false,
}: ReadingProgressBarProps) {
  const progress = useReadingProgress()

  // Format as percentage with no decimal places
  const percentage = Math.round(progress)

  // Determine position styles
  const positionStyles = position === 'top' ? { top: 0 } : { bottom: 0 }

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-50',
        position === 'top' ? 'top-0' : 'bottom-0',
        className,
      )}
      style={positionStyles}
    >
      <div
        className={cn(
          'bg-primary transition-all ease-out',
          gradient ? 'bg-gradient-to-r from-primary to-secondary' : '',
          barClassName,
        )}
        style={{
          height: `${height}px`,
          width: `${percentage}%`,
        }}
      />

      {showPercentage && (
        <div className="absolute right-2 top-1 text-xs font-medium">{percentage}%</div>
      )}
    </div>
  )
}
