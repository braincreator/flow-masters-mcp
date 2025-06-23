'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useNotification } from '@/context/NotificationContext'
import { formatDate } from '@/utilities/formatDate'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

interface ProjectAnalytics {
  projectId: string
  projectName: string
  startDate: string
  estimatedEndDate?: string
  actualEndDate?: string
  currentStatus: string
  completionPercentage: number
  milestoneStats: {
    total: number
    completed: number
    inProgress: number
    planned: number
    delayed: number
  }
  milestoneTimeline: Array<{
    id: string
    title: string
    status: string
    dueDate?: string
    completedAt?: string
    onTime: boolean
  }>
  activityByWeek: Array<{
    week: string
    messages: number
    milestones: number
    files: number
  }>
  timeToMilestone: Array<{
    milestone: string
    plannedDays: number
    actualDays: number
  }>
}

interface ProjectAnalyticsSectionProps {
  projectId: string
}

// Chart colors
const COLORS = {
  completed: '#4ade80', // green-400
  inProgress: '#3b82f6', // blue-500
  planned: '#94a3b8', // slate-400
  delayed: '#ef4444', // red-500
  onTime: '#10b981', // emerald-500
  late: '#f97316', // orange-500
  messages: '#8b5cf6', // violet-500
  milestones: '#0ea5e9', // sky-500
  files: '#f59e0b', // amber-500
  planned_time: '#a3a3a3', // neutral-400
  actual_time: '#3b82f6', // blue-500
}

// Status color mapping
const STATUS_COLORS = {
  completed: COLORS.completed,
  in_progress: COLORS.inProgress,
  planned: COLORS.planned,
  delayed: COLORS.delayed,
  new: COLORS.planned,
  on_review: '#a855f7', // purple-500
  cancelled: '#6b7280', // gray-500
}

export default function ProjectAnalyticsSection({ projectId }: ProjectAnalyticsSectionProps) {
  const t = useTranslations('ProjectAnalytics')
  const { showNotification } = useNotification()

  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('month')

  // Fetch project analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/project-analytics/${projectId}?timeframe=${timeframe}`)
        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to fetch project analytics')
        }

        if (!responseData.success) {
          throw new Error(responseData.error || 'Failed to fetch project analytics')
        }

        setAnalytics(responseData.data)
      } catch (error) {
        logError('Error fetching project analytics:', error)
        showNotification('error', t('errorFetchingAnalytics', { defaultValue: 'Error fetching project analytics' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [projectId, timeframe, showNotification, t])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">{t('noAnalyticsAvailable', { defaultValue: 'No analytics data is available for this project yet.' })}</p>
      </div>
    )
  }

  // Prepare data for milestone status pie chart
  const milestoneStatusData = [
    { name: t('completed', { defaultValue: 'Completed' }), value: analytics.milestoneStats.completed, color: COLORS.completed },
    { name: t('inProgress', { defaultValue: 'In Progress' }), value: analytics.milestoneStats.inProgress, color: COLORS.inProgress },
    { name: t('planned', { defaultValue: 'Planned' }), value: analytics.milestoneStats.planned, color: COLORS.planned },
    { name: t('delayed', { defaultValue: 'Delayed' }), value: analytics.milestoneStats.delayed, color: COLORS.delayed },
  ].filter(item => item.value > 0)

  // Prepare data for time to milestone chart
  const timeToMilestoneData = analytics.timeToMilestone.map(item => ({
    name: item.milestone.length > 20 ? item.milestone.substring(0, 20) + '...' : item.milestone,
    planned: item.plannedDays,
    actual: item.actualDays,
  }))

  // Prepare data for activity chart
  const activityData = analytics.activityByWeek.map(week => ({
    name: week.week,
    messages: week.messages,
    milestones: week.milestones,
    files: week.files,
  }))

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">{t('projectAnalytics', { defaultValue: 'Project Analytics' })}</h2>

      {/* Project Overview Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">{t('projectOverview', { defaultValue: 'Project Overview' })}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Completion Percentage */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">{t('completionPercentage', { defaultValue: 'Completion' })}</p>
            <div className="flex items-end mt-1">
              <span className="text-2xl font-bold">{analytics.completionPercentage}%</span>
              <div className="ml-2 flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${analytics.completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">{t('timeline', { defaultValue: 'Timeline' })}</p>
            <p className="text-xs mt-1">
              <span className="font-medium">{t('started', { defaultValue: 'Started' })}:</span> {formatDate(analytics.startDate)}
            </p>
            {analytics.estimatedEndDate && (
              <p className="text-xs">
                <span className="font-medium">{t('estimatedEnd', { defaultValue: 'Est. Completion' })}:</span> {formatDate(analytics.estimatedEndDate)}
              </p>
            )}
            {analytics.actualEndDate && (
              <p className="text-xs">
                <span className="font-medium">{t('completed', { defaultValue: 'Completed' })}:</span> {formatDate(analytics.actualEndDate)}
              </p>
            )}
          </div>

          {/* Milestone Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">{t('milestones', { defaultValue: 'Milestones' })}</p>
            <p className="text-xs mt-1">
              <span className="font-medium">{t('total', { defaultValue: 'Total' })}:</span> {analytics.milestoneStats.total}
            </p>
            <p className="text-xs">
              <span className="font-medium">{t('completed', { defaultValue: 'Completed' })}:</span> {analytics.milestoneStats.completed}
            </p>
            <p className="text-xs">
              <span className="font-medium">{t('inProgress', { defaultValue: 'In Progress' })}:</span> {analytics.milestoneStats.inProgress}
            </p>
            {analytics.milestoneStats.delayed > 0 && (
              <p className="text-xs text-red-500">
                <span className="font-medium">{t('delayed', { defaultValue: 'Delayed' })}:</span> {analytics.milestoneStats.delayed}
              </p>
            )}
          </div>

          {/* Current Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">{t('currentStatus', { defaultValue: 'Current Status' })}</p>
            <div className="mt-2">
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${STATUS_COLORS[analytics.currentStatus as keyof typeof STATUS_COLORS] || '#94a3b8'}20`,
                  color: STATUS_COLORS[analytics.currentStatus as keyof typeof STATUS_COLORS] || '#94a3b8'
                }}
              >
                {t(`status.${analytics.currentStatus}`, { defaultValue: analytics.currentStatus })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-200`}
          >
            {t('week', { defaultValue: 'Week' })}
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeframe === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-200`}
          >
            {t('month', { defaultValue: 'Month' })}
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('all')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              timeframe === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-200`}
          >
            {t('all', { defaultValue: 'All' })}
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">{t('milestoneStatus', { defaultValue: 'Milestone Status' })}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={milestoneStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {milestoneStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, t('milestones', { defaultValue: 'Milestones' })]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time to Milestone Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">{t('timeToMilestone', { defaultValue: 'Time to Milestone (Days)' })}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeToMilestoneData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" name={t('plannedDays', { defaultValue: 'Planned Days' })} fill={COLORS.planned_time} />
                <Bar dataKey="actual" name={t('actualDays', { defaultValue: 'Actual Days' })} fill={COLORS.actual_time} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">{t('projectActivity', { defaultValue: 'Project Activity' })}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="messages" name={t('messages', { defaultValue: 'Messages' })} stroke={COLORS.messages} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="milestones" name={t('milestones', { defaultValue: 'Milestones' })} stroke={COLORS.milestones} />
                <Line type="monotone" dataKey="files" name={t('files', { defaultValue: 'Files' })} stroke={COLORS.files} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
