'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'

interface CourseProgressBarProps {
  progress: number
  showPercentage?: boolean
  showLabel?: boolean
  className?: string
}

export default function CourseProgressBar({
  progress,
  showPercentage = true,
  showLabel = true,
  className = '',
}: CourseProgressBarProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Прогресс курса</span>
          {showPercentage && <span className="text-sm font-medium">{normalizedProgress}%</span>}
        </div>
      )}
      <Progress value={normalizedProgress} className="h-2" />
    </div>
  )
}
