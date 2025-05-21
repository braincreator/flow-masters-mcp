'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProjectFeedbackAnalytics from './ProjectFeedbackAnalytics'
import ProjectSatisfactionSurvey from './ProjectSatisfactionSurvey'
import { useNotification } from '@/hooks/useNotification'

interface ProjectFeedbackSectionProps {
  projectId: string
  isAdmin: boolean
}

export default function ProjectFeedbackSection({
  projectId,
  isAdmin,
}: ProjectFeedbackSectionProps) {
  const t = useTranslations('ProjectFeedback')
  const { showNotification } = useNotification()
  
  const [activeTab, setActiveTab] = useState<string>('analytics')
  const [projectStatus, setProjectStatus] = useState<string>('in_progress')
  const [recentSurveys, setRecentSurveys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch project status and recent surveys
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch project details to get status
        const projectResponse = await fetch(`/api/service-projects/${projectId}`)
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project details')
        }
        const projectData = await projectResponse.json()
        setProjectStatus(projectData.status)
        
        // Fetch recent surveys
        const feedbackResponse = await fetch(`/api/project-feedback?projectId=${projectId}&feedbackType=survey`)
        if (!feedbackResponse.ok) {
          throw new Error('Failed to fetch feedback data')
        }
        const feedbackData = await feedbackResponse.json()
        setRecentSurveys(feedbackData)
      } catch (error) {
        console.error('Error fetching project data:', error)
        showNotification('error', t('errorFetchingData', { defaultValue: 'Error fetching project data' }))
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProjectData()
  }, [projectId, showNotification, t])

  const handleSurveySubmitted = () => {
    // Refresh the analytics data
    setActiveTab('analytics')
  }

  // Determine which survey type to show based on project status
  const getSurveyType = () => {
    return projectStatus === 'completed' ? 'completion' : 'survey'
  }

  // Check if a survey was submitted in the last 7 days
  const canSubmitSurvey = () => {
    if (recentSurveys.length === 0) return true
    
    const lastSurveyDate = new Date(recentSurveys[0].createdAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    return lastSurveyDate < sevenDaysAgo
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t('clientSatisfaction', { defaultValue: 'Client Satisfaction' })}</h2>
      
      <Tabs defaultValue="analytics" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="analytics">{t('analytics', { defaultValue: 'Analytics' })}</TabsTrigger>
          {!isAdmin && canSubmitSurvey() && (
            <TabsTrigger value="survey">{t('provideFeedback', { defaultValue: 'Provide Feedback' })}</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="analytics" className="mt-6">
          <ProjectFeedbackAnalytics projectId={projectId} isAdmin={isAdmin} />
        </TabsContent>
        
        {!isAdmin && canSubmitSurvey() && (
          <TabsContent value="survey" className="mt-6">
            <ProjectSatisfactionSurvey 
              projectId={projectId} 
              surveyType={getSurveyType()} 
              onSurveySubmitted={handleSurveySubmitted}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
