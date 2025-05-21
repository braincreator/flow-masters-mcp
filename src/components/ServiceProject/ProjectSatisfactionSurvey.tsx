'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { StarRating } from '@/components/ui/StarRating'
import { useNotification } from '@/hooks/useNotification'

interface ProjectSatisfactionSurveyProps {
  projectId: string
  surveyType: 'survey' | 'completion'
  onSurveySubmitted?: () => void
}

export default function ProjectSatisfactionSurvey({
  projectId,
  surveyType,
  onSurveySubmitted,
}: ProjectSatisfactionSurveyProps) {
  const t = useTranslations('ProjectFeedback')
  const { showNotification } = useNotification()

  const [overallRating, setOverallRating] = useState<number>(0)
  const [communicationRating, setCommunicationRating] = useState<number>(0)
  const [qualityRating, setQualityRating] = useState<number>(0)
  const [timelinessRating, setTimelinessRating] = useState<number>(0)
  const [valueRating, setValueRating] = useState<number>(0)
  const [comment, setComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async () => {
    if (overallRating === 0) {
      showNotification('warning', t('overallRatingRequired', { defaultValue: 'Please provide an overall satisfaction rating' }))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/project-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          feedbackType: surveyType,
          rating: overallRating,
          aspectRatings: {
            communication: communicationRating,
            quality: qualityRating,
            timeliness: timelinessRating,
            valueForMoney: valueRating,
          },
          comment,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      showNotification('success', t('feedbackSubmitted', { defaultValue: 'Thank you for your feedback!' }))
      
      // Reset form
      setOverallRating(0)
      setCommunicationRating(0)
      setQualityRating(0)
      setTimelinessRating(0)
      setValueRating(0)
      setComment('')
      
      // Call callback if provided
      if (onSurveySubmitted) {
        onSurveySubmitted()
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      showNotification('error', t('errorSubmittingFeedback', { defaultValue: 'Error submitting feedback' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {surveyType === 'completion'
            ? t('projectCompletionSurvey', { defaultValue: 'Project Completion Survey' })
            : t('projectSatisfactionSurvey', { defaultValue: 'Project Satisfaction Survey' })}
        </CardTitle>
        <CardDescription>
          {surveyType === 'completion'
            ? t('projectCompletionDescription', { defaultValue: 'Please rate your overall experience with this project' })
            : t('projectSatisfactionDescription', { defaultValue: 'Your feedback helps us improve our services' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            {t('overallSatisfaction', { defaultValue: 'Overall Satisfaction' })}*
          </h3>
          <StarRating value={overallRating} onChange={setOverallRating} size="lg" />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">
            {t('specificAspects', { defaultValue: 'Rate Specific Aspects (Optional)' })}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t('communication', { defaultValue: 'Communication' })}
              </p>
              <StarRating value={communicationRating} onChange={setCommunicationRating} size="sm" />
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t('quality', { defaultValue: 'Quality of Work' })}
              </p>
              <StarRating value={qualityRating} onChange={setQualityRating} size="sm" />
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t('timeliness', { defaultValue: 'Timeliness' })}
              </p>
              <StarRating value={timelinessRating} onChange={setTimelinessRating} size="sm" />
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t('valueForMoney', { defaultValue: 'Value for Money' })}
              </p>
              <StarRating value={valueRating} onChange={setValueRating} size="sm" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            {t('additionalComments', { defaultValue: 'Additional Comments (Optional)' })}
          </h3>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('commentPlaceholder', { defaultValue: 'Share your thoughts about the project...' })}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || overallRating === 0}
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
          ) : (
            t('submitFeedback', { defaultValue: 'Submit Feedback' })
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
