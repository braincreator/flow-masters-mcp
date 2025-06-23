'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/utilities/formatDate'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface User {
  id: string
  name: string
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

interface ProjectTasksSectionProps {
  projectId: string
  tasks: Task[]
  isAdmin: boolean
}

const ProjectTasksSection: React.FC<ProjectTasksSectionProps> = ({ projectId, tasks, isAdmin }) => {
  const t = useTranslations('ProjectDetails')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const getStatusLabel = (status: string) => {
    return t(`taskStatus.${status}`)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Функция для обновления статуса задачи
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка при обновлении статуса задачи')
      }

      // Обновляем задачу на странице (в реальном приложении здесь должен быть запрос на обновление состояния)
      window.location.reload()
    } catch (error) {
      logError('Error updating task status:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {errorMessage && <div className="p-4 bg-red-100 text-red-700 rounded-md">{errorMessage}</div>}

      {/* Заголовок секции с кнопкой добавления задачи (только для админов) */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('tasks')}</h2>
        {isAdmin && (
          <a
            href={`/admin/collections/tasks/create?project=${projectId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('addTask')}
          </a>
        )}
      </div>

      {/* Список задач */}
      {tasks.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(task.status)}`}
                      >
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <div className="mt-2 text-sm text-gray-700">{task.description}</div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center text-sm text-gray-500 gap-x-6 gap-y-2">
                    <div>
                      <span className="font-medium">{t('assignedTo')}:</span> {task.assignedTo.name}
                    </div>
                    <div>
                      <span className="font-medium">{t('created')}:</span>{' '}
                      {formatDate(task.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">{t('updated')}:</span>{' '}
                      {formatDate(task.updatedAt)}
                    </div>
                  </div>

                  {/* Кнопки обновления статуса (для админов или задач назначенных пользователю) */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {task.status !== 'in_progress' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        {t('markInProgress')}
                      </button>
                    )}

                    {task.status !== 'completed' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        {t('markCompleted')}
                      </button>
                    )}

                    {isAdmin && task.status !== 'new' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'new')}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {t('resetToNew')}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">{t('noTasks')}</p>
          {isAdmin && <p className="mt-2 text-sm text-gray-500">{t('createFirstTask')}</p>}
        </div>
      )}
    </div>
  )
}

export default ProjectTasksSection
