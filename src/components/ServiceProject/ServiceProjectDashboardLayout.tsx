'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/utilities/formatDate'
import ProjectDocumentsSection from './ProjectDocumentsSection'
import ProjectTasksSection from './ProjectTasksSection'
import ProjectDiscussionsSection from './ProjectDiscussionsSection'
import ProjectFilesSection from './ProjectFilesSection'
import ProjectMilestonesSection from './ProjectMilestonesSection'
import ProjectAnalyticsSection from './ProjectAnalyticsSection'
import ProjectReportsSection from './ProjectReportsSection'
import ProjectCalendarSection from './ProjectCalendarSection'
import ProjectFeedbackSection from './ProjectFeedbackSection'
import ProjectTemplateSelector from '../admin/ProjectTemplateSelector'

interface User {
  id: string
  name: string
}

interface Order {
  id: string
  orderNumber: string
}

interface ServiceProject {
  id: string
  name: string
  status: string
  sourceOrder: Order
  customer: User
  assignedTo?: User
  serviceDetails: {
    serviceName: string
    serviceType: string
  }
  specificationText: {
    ru?: string
    en?: string
  }
  specificationFiles: Array<{
    id: string
    filename: string
    url: string
  }>
  notes?: any // richText
  createdAt: string
  updatedAt: string
}

interface Task {
  id: string
  name: string
  description?: string
  status: string
  assignedTo: User
  createdAt: string
  updatedAt: string
}

interface Message {
  id: string
  author: User
  content: any // richText
  attachments?: Array<{
    id: string
    filename: string
    url: string
  }>
  isSystemMessage?: boolean
  createdAt: string
}

interface ServiceProjectDashboardLayoutProps {
  project: ServiceProject
  tasks: Task[]
  messages: Message[]
  isAdmin: boolean
}

type TabType = 'documents' | 'tasks' | 'discussions' | 'files' | 'milestones' | 'analytics' | 'reports' | 'calendar' | 'feedback'

const ServiceProjectDashboardLayout: React.FC<ServiceProjectDashboardLayoutProps> = ({
  project,
  tasks,
  messages,
  isAdmin,
}) => {
  const t = useTranslations('ProjectDetails')
  const [activeTab, setActiveTab] = useState<TabType>('documents')

  // Статус проекта с локализацией
  const getStatusLabel = (status: string) => {
    return t(`status.${status}`)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'on_review':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'documents':
        return <ProjectDocumentsSection project={project} isAdmin={isAdmin} />
      case 'tasks':
        return <ProjectTasksSection projectId={project.id} tasks={tasks} isAdmin={isAdmin} />
      case 'discussions':
        return (
          <ProjectDiscussionsSection projectId={project.id} messages={messages} isAdmin={isAdmin} />
        )
      case 'milestones':
        return <ProjectMilestonesSection projectId={project.id} isAdmin={isAdmin} />
      case 'analytics':
        return <ProjectAnalyticsSection projectId={project.id} />
      case 'reports':
        return <ProjectReportsSection projectId={project.id} isAdmin={isAdmin} />
      case 'calendar':
        return <ProjectCalendarSection projectId={project.id} isAdmin={isAdmin} />
      case 'feedback':
        return <ProjectFeedbackSection projectId={project.id} isAdmin={isAdmin} />
      case 'files':
        // Convert project and messages to the format expected by ProjectFilesSection
        const projectForFiles = {
          id: project.id,
          specificationFiles: project.specificationFiles.map(file => ({
            id: file.id,
            filename: file.filename,
            url: file.url,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt
          }))
        }
        const messagesForFiles = messages.map(message => ({
          id: message.id,
          author: message.author,
          content: message.content,
          attachments: message.attachments?.map(attachment => ({
            id: attachment.id,
            filename: attachment.filename,
            url: attachment.url,
            createdAt: message.createdAt,
            updatedAt: message.createdAt
          })),
          isSystemMessage: message.isSystemMessage,
          createdAt: message.createdAt
        }))
        return <ProjectFilesSection
          project={projectForFiles}
          messages={messagesForFiles}
          isAdmin={isAdmin}
        />
      default:
        return <ProjectDocumentsSection project={project} isAdmin={isAdmin} />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок проекта */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.serviceDetails.serviceName}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(project.status)}`}
            >
              {getStatusLabel(project.status)}
            </span>
            {isAdmin && (
              <ProjectTemplateSelector
                projectId={project.id}
                onTemplateApplied={() => window.location.reload()}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p>
              <span className="font-medium">{t('orderNumber')}:</span>{' '}
              {project.sourceOrder.orderNumber}
            </p>
            <p>
              <span className="font-medium">{t('customer')}:</span> {project.customer.name}
            </p>
            {project.assignedTo && (
              <p>
                <span className="font-medium">{t('assignedTo')}:</span> {project.assignedTo.name}
              </p>
            )}
          </div>
          <div>
            <p>
              <span className="font-medium">{t('created')}:</span> {formatDate(project.createdAt)}
            </p>
            <p>
              <span className="font-medium">{t('updated')}:</span> {formatDate(project.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Навигация по вкладкам */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tabs.documents')}
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'milestones'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tabs.milestones', { defaultValue: 'Milestones' })}
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tabs.tasks')} {tasks.length > 0 && `(${tasks.length})`}
          </button>
          <button
            onClick={() => setActiveTab('discussions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'discussions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tabs.discussions')}
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'files'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tabs.files')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tabs.analytics', { defaultValue: 'Analytics' })}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tabs.reports', { defaultValue: 'Reports' })}
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tabs.calendar', { defaultValue: 'Calendar' })}
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'feedback'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tabs.feedback', { defaultValue: 'Feedback' })}
          </button>
        </nav>
      </div>

      {/* Содержимое активной вкладки */}
      {renderTabContent()}
    </div>
  )
}

export default ServiceProjectDashboardLayout
