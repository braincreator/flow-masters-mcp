'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { markLessonAsViewed, getLessonProgressStatus } from '@/lib/api/lessons'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface LessonProgressProps {
  lessonId: string
  courseId: string
  onComplete?: () => void
}

export default function LessonProgress({ lessonId, courseId, onComplete }: LessonProgressProps) {
  const t = useTranslations('LessonProgress')
  const { user } = useAuth()
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkProgress = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await getLessonProgressStatus(lessonId)
        setIsCompleted(response.completed)
      } catch (err) {
        logError('Error checking lesson progress:', err)
        setError(t('errorCheckingProgress'))
      } finally {
        setLoading(false)
      }
    }

    checkProgress()
  }, [user, lessonId, t])

  const handleMarkAsCompleted = async () => {
    if (!user || isCompleted || marking) return

    try {
      setMarking(true)
      await markLessonAsViewed(lessonId, courseId)
      setIsCompleted(true)
      if (onComplete) onComplete()
    } catch (err) {
      logError('Error marking lesson as completed:', err)
      setError(t('errorMarkingCompleted'))
    } finally {
      setMarking(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t('checkingProgress')}</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>
  }

  return (
    <div className="flex items-center gap-4">
      {isCompleted ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>{t('lessonCompleted')}</span>
        </div>
      ) : (
        <Button
          onClick={handleMarkAsCompleted}
          disabled={marking}
          className="flex items-center gap-2"
        >
          {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Circle className="h-4 w-4" />}
          <span>{t('markAsCompleted')}</span>
        </Button>
      )}
    </div>
  )
}
