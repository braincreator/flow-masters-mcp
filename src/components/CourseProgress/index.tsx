'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Progress } from '@/components/ui/progress'

interface CourseProgressProps {
  courseId: string
  className?: string
}

export const CourseProgress: React.FC<CourseProgressProps> = ({ courseId, className = '' }) => {
  const { user } = useAuth()
  const [progress, setProgress] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch user's enrollment for this course
        const response = await fetch(`/api/v1/courses/enrollment?userId=${user.id}&courseId=${courseId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch course progress')
        }

        const data = await response.json()
        
        if (data.enrollment) {
          setProgress(data.enrollment.progress || 0)
        } else {
          setProgress(0)
        }
      } catch (err) {
        console.error('Error fetching course progress:', err)
        setError('Failed to load progress')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
  }, [user, courseId])

  if (isLoading) {
    return (
      <div className={`course-progress ${className}`}>
        <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`course-progress ${className}`}>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className={`course-progress ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">Course Progress</span>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <Progress value={progress} max={100} />
    </div>
  )
}
