'use client'

import React, { useState, useEffect } from 'react'
import { Button, Gutter, Card } from '@payloadcms/ui'

import './index.scss'

// Email campaign types
type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'

interface EmailCampaign {
  id: string
  title: string
  subject: string
  status: CampaignStatus
  scheduledFor?: string
  sentAt?: string
  openRate?: number
  clickRate?: number
  recipients: number
  createdAt: string
}

const EmailCampaignView: React.FC = () => {
  // Simplified component without Payload hooks
  const api = '/api' // Default API path

  // Simple toast implementation
  const addToast = (toast: { type: string; message: string }) => {
    console.log(`Toast: [${toast.type}] ${toast.message}`)
    // In a real implementation, we would use a toast library
    alert(toast.message)
  }

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewCampaign, setShowNewCampaign] = useState(false)

  // New campaign form state
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('all')
  const [scheduleDate, setScheduleDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock segments for demonstration
  const segments = [
    { id: 'all', name: 'All Subscribers' },
    { id: 'active', name: 'Active Users' },
    { id: 'inactive', name: 'Inactive Users (30+ days)' },
    { id: 'course-enrolled', name: 'Course Enrolled' },
    { id: 'no-purchase', name: 'No Purchases' },
  ]

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real implementation, this would be a real API call
        // const response = await fetch(`${api}/email-campaigns`)
        // const data = await response.json()

        // For demo purposes, we'll use mock data
        const mockCampaigns = generateMockCampaigns()
        setCampaigns(mockCampaigns)
      } catch (err) {
        console.error('Error fetching campaigns:', err)
        setError('Failed to load email campaigns. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  // Generate mock campaigns for demonstration
  const generateMockCampaigns = (): EmailCampaign[] => {
    return [
      {
        id: '1',
        title: 'May Newsletter',
        subject: 'Check out our latest courses and updates!',
        status: 'sent',
        sentAt: '2023-05-15T10:30:00Z',
        openRate: 42.5,
        clickRate: 12.8,
        recipients: 1250,
        createdAt: '2023-05-14T08:15:00Z',
      },
      {
        id: '2',
        title: 'New Course Announcement',
        subject: 'Introducing our Advanced TypeScript Course',
        status: 'scheduled',
        scheduledFor: '2023-06-01T09:00:00Z',
        recipients: 1500,
        createdAt: '2023-05-20T14:30:00Z',
      },
      {
        id: '3',
        title: 'Special Discount',
        subject: 'Limited Time Offer: 30% Off All Courses',
        status: 'draft',
        recipients: 0,
        createdAt: '2023-05-22T11:45:00Z',
      },
      {
        id: '4',
        title: 'Webinar Invitation',
        subject: 'Join Our Upcoming Webinar on React Performance',
        status: 'sending',
        recipients: 980,
        createdAt: '2023-05-25T16:20:00Z',
      },
      {
        id: '5',
        title: 'April Newsletter',
        subject: 'April Updates and New Content',
        status: 'sent',
        sentAt: '2023-04-10T09:15:00Z',
        openRate: 38.2,
        clickRate: 10.5,
        recipients: 1180,
        createdAt: '2023-04-09T13:40:00Z',
      },
    ]
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !subject || !content) {
      addToast({
        type: 'error',
        message: 'Please fill in all required fields',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, this would be a real API call
      // const response = await fetch(`${api}/email-campaigns`, {
      //   method: 'POST',
      //   credentials: 'include',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     title,
      //     subject,
      //     content,
      //     segment: selectedSegment,
      //     scheduledFor: scheduleDate || undefined,
      //   }),
      // })

      // For demo purposes, we'll simulate a successful response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add the new campaign to the list
      const newCampaign: EmailCampaign = {
        id: `new-${Date.now()}`,
        title,
        subject,
        status: scheduleDate ? 'scheduled' : 'draft',
        scheduledFor: scheduleDate || undefined,
        recipients: selectedSegment === 'all' ? 1500 : 500,
        createdAt: new Date().toISOString(),
      }

      setCampaigns([newCampaign, ...campaigns])

      // Reset form
      setTitle('')
      setSubject('')
      setContent('')
      setSelectedSegment('all')
      setScheduleDate('')
      setShowNewCampaign(false)

      addToast({
        type: 'success',
        message: `Campaign "${title}" created successfully!`,
      })
    } catch (err) {
      console.error('Error creating campaign:', err)
      addToast({
        type: 'error',
        message: 'Failed to create campaign. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendNow = async (campaignId: string) => {
    try {
      // In a real implementation, this would be a real API call
      // await fetch(`${api}/email-campaigns/${campaignId}/send`, {
      //   method: 'POST',
      //   credentials: 'include',
      // })

      // For demo purposes, we'll simulate a successful response
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update the campaign status
      setCampaigns(
        campaigns.map((campaign) =>
          campaign.id === campaignId ? { ...campaign, status: 'sending' } : campaign,
        ),
      )

      addToast({
        type: 'success',
        message: 'Campaign is now being sent!',
      })
    } catch (err) {
      console.error('Error sending campaign:', err)
      addToast({
        type: 'error',
        message: 'Failed to send campaign. Please try again.',
      })
    }
  }

  const handleDuplicate = (campaign: EmailCampaign) => {
    const duplicatedCampaign: EmailCampaign = {
      ...campaign,
      id: `duplicate-${Date.now()}`,
      title: `Copy of ${campaign.title}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      sentAt: undefined,
      scheduledFor: undefined,
      openRate: undefined,
      clickRate: undefined,
    }

    setCampaigns([duplicatedCampaign, ...campaigns])

    addToast({
      type: 'success',
      message: `Campaign "${campaign.title}" duplicated successfully!`,
    })
  }

  const getStatusBadgeClass = (status: CampaignStatus) => {
    switch (status) {
      case 'draft':
        return 'status-badge--draft'
      case 'scheduled':
        return 'status-badge--scheduled'
      case 'sending':
        return 'status-badge--sending'
      case 'sent':
        return 'status-badge--sent'
      case 'failed':
        return 'status-badge--failed'
      default:
        return ''
    }
  }

  // In a real implementation, we would check if the user is authenticated
  // For now, we'll assume the user is authenticated since this is an admin view

  return (
    <div className="email-campaign-view">
      <Gutter>
        <div className="email-campaign-view__header">
          <h1>Email Campaigns</h1>

          <Button
            onClick={() => setShowNewCampaign(!showNewCampaign)}
            className="email-campaign-view__create-button"
          >
            {showNewCampaign ? 'Cancel' : 'Create Campaign'}
          </Button>
        </div>

        {showNewCampaign && (
          <Card className="email-campaign-view__form-card">
            <h2>Create New Campaign</h2>

            <form onSubmit={handleCreateCampaign} className="email-campaign-view__form">
              <div className="field-type">
                <label className="field-label" htmlFor="title">
                  Campaign Name *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. June Newsletter"
                  required
                  disabled={isSubmitting}
                  className="field-input"
                />
              </div>

              <div className="field-type">
                <label className="field-label" htmlFor="subject">
                  Email Subject Line *
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Check out our latest updates!"
                  required
                  disabled={isSubmitting}
                  className="field-input"
                />
              </div>

              <div className="field-type">
                <label className="field-label" htmlFor="content">
                  Email Content *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your email content here..."
                  required
                  disabled={isSubmitting}
                  rows={10}
                  className="field-textarea"
                />
                <p className="field-description">
                  You can use HTML or Markdown for formatting. Use {'{name}'} to personalize with
                  recipient's name.
                </p>
              </div>

              <div className="field-type">
                <label className="field-label" htmlFor="segment">
                  Recipient Segment
                </label>
                <select
                  id="segment"
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  disabled={isSubmitting}
                  className="field-select"
                >
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-type">
                <label className="field-label" htmlFor="schedule">
                  Schedule (Optional)
                </label>
                <input
                  id="schedule"
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  disabled={isSubmitting}
                  className="field-input"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="field-description">
                  Leave blank to save as draft. You can send it later.
                </p>
              </div>

              <div className="email-campaign-view__form-actions">
                <Button
                  type="button"
                  onClick={() => setShowNewCampaign(false)}
                  disabled={isSubmitting}
                  className="email-campaign-view__cancel-button"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="email-campaign-view__submit-button"
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {isLoading ? (
          <div className="email-campaign-view__loading">
            <div className="email-campaign-view__loading-spinner"></div>
            <p>Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="email-campaign-view__error">
            <p>{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="email-campaign-view__empty">
            <h3>No Campaigns Yet</h3>
            <p>Create your first email campaign to get started.</p>
            <Button onClick={() => setShowNewCampaign(true)}>Create Campaign</Button>
          </Card>
        ) : (
          <div className="email-campaign-view__campaigns">
            <div className="email-campaign-view__table-header">
              <div className="email-campaign-view__table-cell email-campaign-view__table-cell--campaign">
                Campaign
              </div>
              <div className="email-campaign-view__table-cell email-campaign-view__table-cell--status">
                Status
              </div>
              <div className="email-campaign-view__table-cell email-campaign-view__table-cell--recipients">
                Recipients
              </div>
              <div className="email-campaign-view__table-cell email-campaign-view__table-cell--performance">
                Performance
              </div>
              <div className="email-campaign-view__table-cell email-campaign-view__table-cell--actions">
                Actions
              </div>
            </div>

            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="email-campaign-view__campaign-row">
                <div className="email-campaign-view__table-cell email-campaign-view__table-cell--campaign">
                  <div className="campaign-info">
                    <h3 className="campaign-title">{campaign.title}</h3>
                    <p className="campaign-subject">{campaign.subject}</p>
                    <p className="campaign-date">
                      {campaign.status === 'sent'
                        ? `Sent: ${new Date(campaign.sentAt!).toLocaleDateString()}`
                        : campaign.status === 'scheduled'
                          ? `Scheduled: ${new Date(campaign.scheduledFor!).toLocaleDateString()}`
                          : `Created: ${new Date(campaign.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                <div className="email-campaign-view__table-cell email-campaign-view__table-cell--status">
                  <span className={`status-badge ${getStatusBadgeClass(campaign.status)}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>

                <div className="email-campaign-view__table-cell email-campaign-view__table-cell--recipients">
                  {campaign.recipients > 0 ? campaign.recipients.toLocaleString() : '-'}
                </div>

                <div className="email-campaign-view__table-cell email-campaign-view__table-cell--performance">
                  {campaign.status === 'sent' ? (
                    <div className="campaign-performance">
                      <div className="performance-metric">
                        <span className="metric-label">Opens:</span>
                        <span className="metric-value">{campaign.openRate}%</span>
                      </div>
                      <div className="performance-metric">
                        <span className="metric-label">Clicks:</span>
                        <span className="metric-value">{campaign.clickRate}%</span>
                      </div>
                    </div>
                  ) : (
                    <span className="no-data">-</span>
                  )}
                </div>

                <div className="email-campaign-view__table-cell email-campaign-view__table-cell--actions">
                  <div className="campaign-actions">
                    {campaign.status === 'draft' && (
                      <Button
                        onClick={() => handleSendNow(campaign.id)}
                        className="action-button action-button--send"
                      >
                        Send Now
                      </Button>
                    )}

                    <Button
                      onClick={() => handleDuplicate(campaign)}
                      className="action-button action-button--duplicate"
                    >
                      Duplicate
                    </Button>

                    {campaign.status === 'sent' && (
                      <Button
                        onClick={() => {
                          // View report functionality would go here
                          addToast({
                            type: 'info',
                            message: 'Campaign report view is not implemented in this demo.',
                          })
                        }}
                        className="action-button action-button--report"
                      >
                        View Report
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Gutter>
    </div>
  )
}

export default EmailCampaignView
