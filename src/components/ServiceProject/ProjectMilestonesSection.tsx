'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { formatDate } from '@/utilities/formatDate'
import { CheckCircle, Clock, AlertCircle, PlayCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotification } from '@/hooks/useNotification'
import { StarRating } from '@/components/ui/StarRating'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface Deliverable {
  id?: string
  title: string
  description?: string
  files?: Array<{
    id: string
    filename: string
    url: string
  }>
}

interface Milestone {
  id: string
  title: string
  description?: string
  status: 'planned' | 'in_progress' | 'completed' | 'delayed'
  order: number
  dueDate?: string
  completedAt?: string
  deliverables?: Deliverable[]
  clientApprovalRequired?: boolean
  clientApproved?: boolean
  clientFeedback?: string
  satisfactionRating?: number
}

interface ProjectMilestonesSectionProps {
  projectId: string
  isAdmin: boolean
}

export default function ProjectMilestonesSection({ projectId, isAdmin }: ProjectMilestonesSectionProps) {
  const t = useTranslations('ProjectMilestones')
  const locale = useLocale()
  const { showNotification } = useNotification()

  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({})
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({})
  const [satisfactionRatings, setSatisfactionRatings] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({})

  // Fetch milestones
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/project-milestones?projectId=${projectId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch milestones')
        }

        const data = await response.json()
        setMilestones(data.sort((a: Milestone, b: Milestone) => a.order - b.order))

        // Initialize expanded state for all milestones
        const expanded: Record<string, boolean> = {}
        data.forEach((milestone: Milestone) => {
          expanded[milestone.id] = false
        })
        setExpandedMilestones(expanded)
      } catch (error) {
        logError('Error fetching milestones:', error)
        showNotification('error', t('errorFetchingMilestones', { defaultValue: 'Error fetching milestones' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchMilestones()
  }, [projectId, showNotification, t])

  const toggleMilestone = (id: string) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleFeedbackChange = (id: string, text: string) => {
    setFeedbackText(prev => ({
      ...prev,
      [id]: text
    }))
  }

  const handleRatingChange = (id: string, rating: number) => {
    setSatisfactionRatings(prev => ({
      ...prev,
      [id]: rating
    }))
  }

  const handleApprove = async (milestoneId: string, approve: boolean) => {
    try {
      // Validate that a rating is provided if approving
      if (approve && !satisfactionRatings[milestoneId]) {
        showNotification('warning', t('ratingRequired', { defaultValue: 'Please provide a satisfaction rating' }))
        return
      }

      setIsSubmitting(prev => ({ ...prev, [milestoneId]: true }))

      const response = await fetch(`/api/project-milestones/${milestoneId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved: approve,
          feedback: feedbackText[milestoneId] || '',
          satisfactionRating: satisfactionRatings[milestoneId] || 0
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update milestone')
      }

      // Update the milestone in the local state
      const updatedMilestone = await response.json()
      setMilestones(prev =>
        prev.map(m => m.id === milestoneId ? updatedMilestone : m)
      )

      showNotification(
        'success',
        approve
          ? t('milestoneApproved', { defaultValue: 'Milestone approved successfully' })
          : t('feedbackSubmitted', { defaultValue: 'Feedback submitted successfully' })
      )

      // Clear feedback text
      setFeedbackText(prev => ({
        ...prev,
        [milestoneId]: ''
      }))
    } catch (error) {
      logError('Error updating milestone:', error)
      showNotification('error', t('errorUpdatingMilestone', { defaultValue: 'Error updating milestone' }))
    } finally {
      setIsSubmitting(prev => ({ ...prev, [milestoneId]: false }))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <PlayCircle className="h-5 w-5 text-blue-500" />
      case 'delayed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (milestones.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">{t('noMilestones', { defaultValue: 'No milestones have been defined for this project yet.' })}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t('projectMilestones', { defaultValue: 'Project Milestones' })}</h2>

      <div className="relative">
        {/* Timeline connector */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>

        {/* Milestones */}
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              <div
                className={`flex items-start p-4 rounded-lg border ${
                  milestone.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                {/* Status indicator */}
                <div className="flex-shrink-0 mr-4 z-10 bg-white rounded-full p-1">
                  {getStatusIcon(milestone.status)}
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{milestone.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(milestone.status)}`}>
                          {t(`status.${milestone.status}`, { defaultValue: milestone.status })}
                        </span>

                        {milestone.dueDate && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            {t('dueDate', { defaultValue: 'Due' })}: {formatDate(milestone.dueDate, locale)}
                          </span>
                        )}

                        {milestone.completedAt && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            {t('completed', { defaultValue: 'Completed' })}: {formatDate(milestone.completedAt, locale)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleMilestone(milestone.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedMilestones[milestone.id] ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded content */}
                  {expandedMilestones[milestone.id] && (
                    <div className="mt-4 space-y-4">
                      {milestone.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">{t('description', { defaultValue: 'Description' })}</h4>
                          <p className="mt-1 text-sm text-gray-600">{milestone.description}</p>
                        </div>
                      )}

                      {/* Deliverables */}
                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">{t('deliverables', { defaultValue: 'Deliverables' })}</h4>
                          <ul className="mt-2 space-y-2">
                            {milestone.deliverables.map((deliverable, i) => (
                              <li key={i} className="flex items-start">
                                <FileText className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">{deliverable.title}</p>
                                  {deliverable.description && (
                                    <p className="text-xs text-gray-600">{deliverable.description}</p>
                                  )}

                                  {/* Files */}
                                  {deliverable.files && deliverable.files.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {deliverable.files.map(file => (
                                        <a
                                          key={file.id}
                                          href={file.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:underline flex items-center"
                                        >
                                          <FileText className="h-3 w-3 mr-1" />
                                          {file.filename}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Client approval section */}
                      {milestone.clientApprovalRequired && milestone.status === 'completed' && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700">
                            {t('clientApproval', { defaultValue: 'Client Approval' })}
                          </h4>

                          {milestone.clientApproved ? (
                            <div className="space-y-3">
                              <div className="mt-2 flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                <span className="text-sm">{t('approved', { defaultValue: 'Approved' })}</span>
                              </div>

                              {milestone.satisfactionRating && (
                                <div className="mt-2">
                                  <h5 className="text-xs font-medium text-gray-700">
                                    {t('yourRating', { defaultValue: 'Your Satisfaction Rating' })}:
                                  </h5>
                                  <div className="mt-1">
                                    <StarRating value={milestone.satisfactionRating} readOnly size="sm" />
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-2 space-y-3">
                              <p className="text-sm text-gray-600">
                                {t('approvalRequired', { defaultValue: 'Your approval is required for this milestone.' })}
                              </p>

                              <div>
                                <h5 className="text-xs font-medium text-gray-700 mb-1">
                                  {t('satisfactionRating', { defaultValue: 'How satisfied are you with this milestone?' })}
                                </h5>
                                <StarRating
                                  value={satisfactionRatings[milestone.id] || 0}
                                  onChange={(rating) => handleRatingChange(milestone.id, rating)}
                                  size="md"
                                />
                              </div>

                              <textarea
                                value={feedbackText[milestone.id] || ''}
                                onChange={(e) => handleFeedbackChange(milestone.id, e.target.value)}
                                placeholder={t('feedbackPlaceholder', { defaultValue: 'Provide feedback (optional)' })}
                                className="w-full p-2 text-sm border border-gray-300 rounded-md"
                                rows={3}
                              />

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleApprove(milestone.id, true)}
                                  disabled={isSubmitting[milestone.id]}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {isSubmitting[milestone.id] ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                                  ) : (
                                    t('approve', { defaultValue: 'Approve' })
                                  )}
                                </Button>

                                <Button
                                  onClick={() => handleApprove(milestone.id, false)}
                                  disabled={isSubmitting[milestone.id] || !feedbackText[milestone.id]}
                                  variant="outline"
                                >
                                  {t('sendFeedback', { defaultValue: 'Send Feedback' })}
                                </Button>
                              </div>
                            </div>
                          )}

                          {milestone.clientFeedback && (
                            <div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-700">
                                {t('yourFeedback', { defaultValue: 'Your Feedback' })}:
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">{milestone.clientFeedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
