'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useNotification } from '@/hooks/useNotification'
import { formatDate } from '@/utilities/formatDate'

interface Report {
  id: string
  title: string
  project: {
    id: string
    name: string
  }
  reportType: 'weekly' | 'monthly' | 'milestone' | 'custom'
  reportPeriod: {
    startDate: string
    endDate: string
  }
  summary: string
  content: any // richText
  progressMetrics: {
    completionPercentage: number
    milestonesTotal: number
    milestonesCompleted: number
    milestonesInProgress: number
    milestonesDelayed: number
  }
  activitySummary: {
    messagesCount: number
    filesCount: number
    milestonesCompletedInPeriod: number
  }
  recentMilestones: Array<{
    id: string
    title: string
    status: string
  }>
  upcomingMilestones: Array<{
    id: string
    title: string
    status: string
    dueDate?: string
  }>
  sentToClient: boolean
  clientViewed: boolean
  generatedAutomatically: boolean
  createdAt: string
  updatedAt: string
}

interface ProjectReportsSectionProps {
  projectId: string
  isAdmin: boolean
}

export default function ProjectReportsSection({ projectId, isAdmin }: ProjectReportsSectionProps) {
  const t = useTranslations('ProjectReports')
  const { showNotification } = useNotification()
  
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [reportType, setReportType] = useState<string>('all')
  
  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true)
        const queryParams = new URLSearchParams({
          projectId,
          ...(reportType !== 'all' && { reportType }),
        })
        
        const response = await fetch(`/api/project-reports?${queryParams}`)
        const responseData = await response.json()
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to fetch project reports')
        }
        
        if (!responseData.success) {
          throw new Error(responseData.error || 'Failed to fetch project reports')
        }
        
        setReports(responseData.data)
      } catch (error) {
        console.error('Error fetching project reports:', error)
        showNotification('error', t('errorFetchingReports', { defaultValue: 'Error fetching project reports' }))
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchReports()
  }, [projectId, reportType, showNotification, t])
  
  // Fetch report details when a report is selected
  const fetchReportDetails = async (reportId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/project-reports/${reportId}`)
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to fetch report details')
      }
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to fetch report details')
      }
      
      setSelectedReport(responseData.data)
    } catch (error) {
      console.error('Error fetching report details:', error)
      showNotification('error', t('errorFetchingReportDetails', { defaultValue: 'Error fetching report details' }))
    } finally {
      setIsLoading(false)
    }
  }
  
  // Export report
  const exportReport = async (format: 'pdf' | 'json' = 'pdf') => {
    if (!selectedReport) return
    
    try {
      const response = await fetch(`/api/project-reports/${selectedReport.id}/export?format=${format}`)
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to export report')
      }
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to export report')
      }
      
      // For now, just show a notification
      showNotification('success', t('reportExported', { defaultValue: 'Report exported successfully' }))
      
      // In a real implementation, we would handle the PDF download here
      if (format === 'pdf') {
        // This would trigger a download in a real implementation
        alert('PDF download would start here in the real implementation')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      showNotification('error', t('errorExportingReport', { defaultValue: 'Error exporting report' }))
    }
  }
  
  // Get report type label
  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'weekly':
        return t('weekly', { defaultValue: 'Weekly' })
      case 'monthly':
        return t('monthly', { defaultValue: 'Monthly' })
      case 'milestone':
        return t('milestone', { defaultValue: 'Milestone' })
      case 'custom':
        return t('custom', { defaultValue: 'Custom' })
      default:
        return type
    }
  }
  
  // Render report list
  const renderReportList = () => {
    if (reports.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t('noReports', { defaultValue: 'No reports available for this project yet.' })}</p>
        </div>
      )
    }
    
    return (
      <div className="space-y-4">
        {reports.map(report => (
          <div 
            key={report.id}
            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50"
            onClick={() => fetchReportDetails(report.id)}
          >
            <h3 className="font-medium text-lg">{report.title}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {getReportTypeLabel(report.reportType)}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                {formatDate(report.createdAt)}
              </span>
              {report.generatedAutomatically && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {t('automated', { defaultValue: 'Automated' })}
                </span>
              )}
              {!report.clientViewed && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  {t('new', { defaultValue: 'New' })}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{report.summary}</p>
          </div>
        ))}
      </div>
    )
  }
  
  // Render report details
  const renderReportDetails = () => {
    if (!selectedReport) return null
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{selectedReport.title}</h2>
            <p className="text-gray-600">
              {formatDate(selectedReport.reportPeriod.startDate)} - {formatDate(selectedReport.reportPeriod.endDate)}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedReport(null)}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              {t('back', { defaultValue: 'Back' })}
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('exportPdf', { defaultValue: 'Export PDF' })}
            </button>
          </div>
        </div>
        
        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{t('summary', { defaultValue: 'Summary' })}</h3>
          <p className="text-gray-700">{selectedReport.summary}</p>
        </div>
        
        {/* Progress Metrics */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{t('progressMetrics', { defaultValue: 'Progress Metrics' })}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{t('completion', { defaultValue: 'Completion' })}</p>
              <p className="text-xl font-bold">{selectedReport.progressMetrics.completionPercentage}%</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{t('totalMilestones', { defaultValue: 'Total Milestones' })}</p>
              <p className="text-xl font-bold">{selectedReport.progressMetrics.milestonesTotal}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{t('completedMilestones', { defaultValue: 'Completed' })}</p>
              <p className="text-xl font-bold">{selectedReport.progressMetrics.milestonesCompleted}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{t('inProgressMilestones', { defaultValue: 'In Progress' })}</p>
              <p className="text-xl font-bold">{selectedReport.progressMetrics.milestonesInProgress}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{t('delayedMilestones', { defaultValue: 'Delayed' })}</p>
              <p className="text-xl font-bold">{selectedReport.progressMetrics.milestonesDelayed}</p>
            </div>
          </div>
        </div>
        
        {/* Activity Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{t('activitySummary', { defaultValue: 'Activity Summary' })}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{t('messages', { defaultValue: 'Messages' })}</p>
              <p className="text-xl font-bold">{selectedReport.activitySummary.messagesCount}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{t('files', { defaultValue: 'Files' })}</p>
              <p className="text-xl font-bold">{selectedReport.activitySummary.filesCount}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">{t('milestonesCompleted', { defaultValue: 'Milestones Completed' })}</p>
              <p className="text-xl font-bold">{selectedReport.activitySummary.milestonesCompletedInPeriod}</p>
            </div>
          </div>
        </div>
        
        {/* Content would be rendered here */}
        {/* For now, we'll just show a placeholder */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{t('details', { defaultValue: 'Details' })}</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-700">{t('contentPlaceholder', { defaultValue: 'Detailed report content would be displayed here.' })}</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (isLoading && !selectedReport) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('projectReports', { defaultValue: 'Project Reports' })}</h2>
        
        {/* Report type filter */}
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setReportType('all')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              reportType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-200`}
          >
            {t('all', { defaultValue: 'All' })}
          </button>
          <button
            type="button"
            onClick={() => setReportType('weekly')}
            className={`px-4 py-2 text-sm font-medium ${
              reportType === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-200`}
          >
            {t('weekly', { defaultValue: 'Weekly' })}
          </button>
          <button
            type="button"
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              reportType === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-200`}
          >
            {t('monthly', { defaultValue: 'Monthly' })}
          </button>
        </div>
      </div>
      
      {selectedReport ? renderReportDetails() : renderReportList()}
    </div>
  )
}
