'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

interface CourseAccessProps {
  courseId: string
  productId?: string
  title: string
  className?: string
}

export const CourseAccess: React.FC<CourseAccessProps> = ({
  courseId,
  productId,
  title,
  className = '',
}) => {
  const { user, isLoading: authLoading } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || authLoading) return

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/v1/courses/access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            courseId,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to check course access')
        }

        const data = await response.json()
        setHasAccess(data.hasAccess)
      } catch (err) {
        console.error('Error checking course access:', err)
        setError('Failed to check course access')
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [user, courseId, authLoading])

  const handleStartCourse = () => {
    router.push(`/courses/${courseId}/learn`)
  }

  const handlePurchase = () => {
    if (productId) {
      router.push(`/products/${productId}`)
    } else {
      router.push(`/courses/${courseId}`)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className={`course-access ${className}`}>
        <div className="animate-pulse bg-gray-200 h-10 w-full rounded"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`course-access ${className}`}>
        <Button onClick={() => router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))}>
          Login to Access Course
        </Button>
      </div>
    )
  }

  return (
    <div className={`course-access ${className}`}>
      {hasAccess ? (
        <Button onClick={handleStartCourse} variant="primary" size="lg" className="w-full">
          Start Learning
        </Button>
      ) : (
        <Button onClick={handlePurchase} variant="primary" size="lg" className="w-full">
          Purchase Course
        </Button>
      )}
      
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  )
}
