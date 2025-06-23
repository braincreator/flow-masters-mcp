'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { toast } from 'sonner'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import { useAuth } from '@/providers/AuthProvider' // Assuming auth provider

interface LessonFeedbackProps {
  lessonId: string
  courseId: string
}

export function LessonFeedback({ lessonId, courseId }: LessonFeedbackProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)

  const handleRating = (rate: number) => {
    setRating(rate)
  }

  const handleSubmit = async () => {
    if (!user || (rating === 0 && !comment.trim())) {
      toast.info('Please provide a rating or comment.')
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Implement API call to save feedback
      // Example: POST /api/feedback or /api/comments
      const response = await fetch('/api/lesson-feedback', { // Placeholder API endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          courseId,
          userId: user.id,
          rating,
          comment: comment.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit feedback')
      }

      toast.success('Thank you for your feedback!')
      setSubmitted(true)
      // Optionally clear form: setRating(0); setComment('');
    } catch (error: any) {
      logError('Error submitting feedback:', error)
      toast.error('Failed to submit feedback', { description: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mt-6 p-4 border rounded-lg bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">Thank you for your feedback!</p>
      </div>
    )
  }

  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="text-lg font-semibold mb-3">Rate this lesson</h3>
      <div className="flex items-center space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 text-muted-foreground hover:text-yellow-500 transition-colors"
            aria-label={`Rate ${star} out of 5`}
          >
            <Star
              className={cn(
                'h-6 w-6',
                (hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-500' : 'fill-muted',
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Leave an optional comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-3"
        rows={3}
      />
      <Button onClick={handleSubmit} disabled={isSubmitting || (rating === 0 && !comment.trim())}>
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </div>
  )
}