'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StarRating } from '@/components/ui/StarRating'
import { formatDate } from '@/utilities/formatDate'
import { useLocale } from 'next-intl'
import { useNotification } from '@/hooks/useNotification'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

interface FeedbackItem {
  id: string
  project: string
  milestone?: string
  feedbackType: 'milestone' | 'survey' | 'completion'
  rating: number
  aspectRatings?: {
    communication?: number
    quality?: number
    timeliness?: number
    valueForMoney?: number
  }
  comment?: string
  submittedBy: string
  createdAt: string
}

interface ProjectFeedbackAnalyticsProps {
  projectId: string
  isAdmin: boolean
}

export default function ProjectFeedbackAnalytics({
  projectId,
  isAdmin,
}: ProjectFeedbackAnalyticsProps) {
  const t = useTranslations('ProjectFeedback')
  const locale = useLocale()
  const { showNotification } = useNotification()

  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>('overview')

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/project-feedback?projectId=${projectId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch feedback')
        }

        const data = await response.json()
        setFeedback(data)
      } catch (error) {
        console.error('Error fetching feedback:', error)
        showNotification('error', t('errorFetchingFeedback', { defaultValue: 'Error fetching feedback data' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [projectId, showNotification, t])

  // Calculate average ratings
  const calculateAverages = () => {
    if (feedback.length === 0) return { overall: 0, communication: 0, quality: 0, timeliness: 0, valueForMoney: 0 }

    const sum = feedback.reduce(
      (acc, item) => {
        acc.overall += item.rating
        
        if (item.aspectRatings) {
          if (item.aspectRatings.communication) {
            acc.communication += item.aspectRatings.communication
            acc.communicationCount++
          }
          
          if (item.aspectRatings.quality) {
            acc.quality += item.aspectRatings.quality
            acc.qualityCount++
          }
          
          if (item.aspectRatings.timeliness) {
            acc.timeliness += item.aspectRatings.timeliness
            acc.timelinessCount++
          }
          
          if (item.aspectRatings.valueForMoney) {
            acc.valueForMoney += item.aspectRatings.valueForMoney
            acc.valueForMoneyCount++
          }
        }
        
        return acc
      },
      { 
        overall: 0, 
        communication: 0, 
        quality: 0, 
        timeliness: 0, 
        valueForMoney: 0,
        communicationCount: 0,
        qualityCount: 0,
        timelinessCount: 0,
        valueForMoneyCount: 0
      }
    )

    return {
      overall: sum.overall / feedback.length,
      communication: sum.communicationCount > 0 ? sum.communication / sum.communicationCount : 0,
      quality: sum.qualityCount > 0 ? sum.quality / sum.qualityCount : 0,
      timeliness: sum.timelinessCount > 0 ? sum.timeliness / sum.timelinessCount : 0,
      valueForMoney: sum.valueForMoneyCount > 0 ? sum.valueForMoney / sum.valueForMoneyCount : 0,
    }
  }

  const averages = calculateAverages()

  // Prepare data for charts
  const prepareAspectData = () => {
    return [
      {
        name: t('communication', { defaultValue: 'Communication' }),
        rating: averages.communication,
      },
      {
        name: t('quality', { defaultValue: 'Quality' }),
        rating: averages.quality,
      },
      {
        name: t('timeliness', { defaultValue: 'Timeliness' }),
        rating: averages.timeliness,
      },
      {
        name: t('valueForMoney', { defaultValue: 'Value' }),
        rating: averages.valueForMoney,
      },
    ]
  }

  const prepareTrendData = () => {
    // Sort feedback by date
    const sortedFeedback = [...feedback].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    
    return sortedFeedback.map(item => ({
      date: formatDate(item.createdAt, locale, { month: 'short', day: 'numeric' }),
      rating: item.rating,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (feedback.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('feedbackAnalytics', { defaultValue: 'Feedback Analytics' })}</CardTitle>
          <CardDescription>
            {t('noFeedbackYet', { defaultValue: 'No feedback has been collected for this project yet.' })}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('feedbackAnalytics', { defaultValue: 'Feedback Analytics' })}</CardTitle>
        <CardDescription>
          {t('feedbackAnalyticsDescription', { defaultValue: 'Analysis of client satisfaction for this project' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">{t('overview', { defaultValue: 'Overview' })}</TabsTrigger>
            <TabsTrigger value="aspects">{t('aspects', { defaultValue: 'Aspects' })}</TabsTrigger>
            <TabsTrigger value="trends">{t('trends', { defaultValue: 'Trends' })}</TabsTrigger>
            <TabsTrigger value="comments">{t('comments', { defaultValue: 'Comments' })}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-medium mb-2">
                {t('overallSatisfaction', { defaultValue: 'Overall Satisfaction' })}
              </h3>
              <div className="flex items-center gap-2">
                <StarRating value={averages.overall} readOnly size="lg" />
                <span className="text-2xl font-bold">{averages.overall.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t('basedOn', { defaultValue: 'Based on {{count}} ratings', count: feedback.length })}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">
                  {t('milestoneApprovals', { defaultValue: 'Milestone Approvals' })}
                </h4>
                <p className="text-2xl font-bold">
                  {feedback.filter(item => item.feedbackType === 'milestone').length}
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">
                  {t('surveysCompleted', { defaultValue: 'Surveys Completed' })}
                </h4>
                <p className="text-2xl font-bold">
                  {feedback.filter(item => item.feedbackType === 'survey' || item.feedbackType === 'completion').length}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="aspects">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareAspectData()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rating" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="comments">
            <div className="space-y-4">
              {feedback
                .filter(item => item.comment)
                .map(item => (
                  <div key={item.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <StarRating value={item.rating} readOnly size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.createdAt, locale)}
                      </span>
                    </div>
                    <p className="text-sm">{item.comment}</p>
                  </div>
                ))}
              
              {feedback.filter(item => item.comment).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  {t('noComments', { defaultValue: 'No comments have been provided yet.' })}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
