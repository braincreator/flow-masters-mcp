'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { formatDate } from '@/utilities/formatDate'
import TaskFormModal from '@/components/modals/TaskFormModal'
import { useNotification } from '@/context/NotificationContext'

// Определение типа для проекта
interface ProjectDetails {
  id: string
  name: string
  status: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    email: string
  }
  sourceOrder: {
    id: string
    orderNumber: string
  }
  serviceDetails: {
    serviceName: string
    serviceType?: string
  }
  specificationText: {
    ru?: string | null
    en?: string | null
    [key: string]: string | null | undefined
  }
  specificationFiles: Array<{
    id: string
    filename: string
    url: string
  }>
  tasks?: TaskItem[]
  messages?: MessageItem[]
  projectFiles?: ProjectFile[]
}

// Определение типа для задачи
interface TaskItem {
  id: string
  title: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
  assignedTo?: {
    id: string
    name?: string
    email: string
  }
}

// Определение типа для сообщения
interface MessageItem {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name?: string
    email: string
  }
  isSystemMessage: boolean
  attachments?: Array<{
    id: string
    filename: string
    url: string
  }>
}

// Определение типа для файла проекта
interface ProjectFile {
  id: string
  filename: string
  url: string
  fileSize?: number
  mimeType?: string
  uploadedBy?: {
    id: string
    name?: string
    email: string
  }
  createdAt: string
  category?: string
}

// Определяем соответствие статусов проектов для отображения
const statusBadgeClasses: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  on_review: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function ProjectDetailsPage({ params }: { params: { lang: string; id: string } }) {
  const t = useTranslations('ProjectDetails')
  const { showNotification } = useNotification()
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [activeTab, setActiveTab] = useState<string>('specification')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Состояние для задач проекта
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  // Состояние для сообщений проекта
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  // Состояние для файлов проекта
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  // Состояние для нового сообщения
  const [newMessage, setNewMessage] = useState('')
  // Состояние для модального окна создания задачи
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  // Функция для перевода статуса
  const getStatusText = (status: string) => {
    return t(`status.${status}`, { defaultValue: status })
  }

  // Получение данных проекта
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/service-projects/${params.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(t('errorLoadingProject'))
        }

        const data = await response.json()
        setProject(data)
      } catch (err) {
        console.error('Error fetching project details:', err)
        setError(err instanceof Error ? err.message : t('unknownError'))
        showNotification('error', t('errorLoadingProject'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectDetails()
  }, [params.id, t, showNotification])

  // Получение задач проекта при переключении на вкладку задач
  useEffect(() => {
    const fetchTasks = async () => {
      if (activeTab !== 'tasks' || !project) return

      try {
        setIsLoadingTasks(true)
        const response = await fetch(`/api/tasks?projectId=${project.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(t('errorLoadingTasks'))
        }

        const data = await response.json()
        setTasks(data)
      } catch (err) {
        console.error('Error fetching tasks:', err)
      } finally {
        setIsLoadingTasks(false)
      }
    }

    fetchTasks()
  }, [activeTab, project, t])

  // Получение сообщений проекта при переключении на вкладку обсуждений
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeTab !== 'discussions' || !project) return

      try {
        setIsLoadingMessages(true)
        const response = await fetch(`/api/project-messages?projectId=${project.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(t('errorLoadingMessages'))
        }

        const data = await response.json()
        setMessages(data)
      } catch (err) {
        console.error('Error fetching messages:', err)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [activeTab, project, t])

  // Получение файлов проекта при переключении на вкладку файлов
  useEffect(() => {
    const fetchFiles = async () => {
      if (activeTab !== 'files' || !project) return

      try {
        setIsLoadingFiles(true)
        const response = await fetch(`/api/project-files?projectId=${project.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(t('errorLoadingFiles'))
        }

        const data = await response.json()
        setProjectFiles(data.projectFiles || [])
      } catch (err) {
        console.error('Error fetching files:', err)
      } finally {
        setIsLoadingFiles(false)
      }
    }

    fetchFiles()
  }, [activeTab, project, t])

  // Функция для создания новой задачи
  const handleCreateTask = async (taskData: { title: string; description?: string }) => {
    if (!project) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          ...taskData,
        }),
      })

      if (!response.ok) {
        throw new Error(t('errorCreatingTask'))
      }

      const newTask = await response.json()
      setTasks((prev) => [newTask, ...prev])
      showNotification('success', t('taskCreatedSuccess'))
    } catch (err) {
      console.error('Error creating task:', err)
      showNotification('error', t('errorCreatingTask'))
      throw err
    }
  }

  // Функция для отправки нового сообщения
  const handleSendMessage = async () => {
    if (!project || !newMessage.trim()) return

    try {
      const response = await fetch('/api/project-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error(t('errorSendingMessage'))
      }

      const createdMessage = await response.json()
      setMessages((prev) => [...prev, createdMessage])
      setNewMessage('') // Очищаем поле ввода
      showNotification('success', t('messageSentSuccess'))
    } catch (err) {
      console.error('Error sending message:', err)
      showNotification('error', t('errorSendingMessage'))
    }
  }

  // Функция для загрузки файлов проекта
  const handleUploadFile = async (files: File[]) => {
    if (!project || !files.length) return

    try {
      // Сначала загружаем файлы в медиа-библиотеку
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const uploadResponse = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload file: ${file.name}`)
        }

        return await uploadResponse.json()
      })

      // Ожидаем завершения всех загрузок
      const uploadedFiles = await Promise.all(uploadPromises)
      const fileIds = uploadedFiles.map((file) => file.id)

      // Добавляем файлы к проекту
      const response = await fetch('/api/project-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          fileIds,
          category: 'project',
        }),
      })

      if (!response.ok) {
        throw new Error(t('errorAddingFilesToProject'))
      }

      // Обновляем список файлов
      const updatedFilesResponse = await fetch(`/api/project-files?projectId=${project.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (updatedFilesResponse.ok) {
        const data = await updatedFilesResponse.json()
        setProjectFiles(data.projectFiles || [])
        showNotification('success', t('filesUploadedSuccess', { count: files.length }))
      }
    } catch (err) {
      console.error('Error uploading files:', err)
      showNotification('error', t('errorUploadingFiles'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">
          <svg
            className="animate-spin h-8 w-8 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 my-4">
        <p>{error || t('projectNotFound')}</p>
        <Link
          href={`/${params.lang}/dashboard/projects`}
          className="mt-4 inline-block text-sm text-red-600 hover:text-red-800"
        >
          {t('backToProjects')}
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          href={`/${params.lang}/dashboard/projects`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          {t('backToProjects')}
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Заголовок проекта */}
        <div className="p-6 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <p className="text-gray-600">{project.serviceDetails.serviceName}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClasses[project.status] || 'bg-gray-100 text-gray-800'}`}
            >
              {getStatusText(project.status)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">{t('orderNumber')}:</span>{' '}
              <span className="font-medium">
                {project.sourceOrder?.orderNumber || t('unknown')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">{t('created')}:</span>{' '}
              <span>{formatDate(project.createdAt, params.lang)}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('updated')}:</span>{' '}
              <span>{formatDate(project.updatedAt, params.lang)}</span>
            </div>
          </div>
        </div>

        {/* Навигация по табам */}
        <div className="border-b">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('specification')}
              className={`text-sm font-medium py-4 px-6 border-b-2 ${
                activeTab === 'specification'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabs.specification')}
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`text-sm font-medium py-4 px-6 border-b-2 ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabs.tasks')}
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`text-sm font-medium py-4 px-6 border-b-2 ${
                activeTab === 'discussions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabs.discussions')}
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`text-sm font-medium py-4 px-6 border-b-2 ${
                activeTab === 'files'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabs.files')}
            </button>
          </nav>
        </div>

        {/* Контент текущего таба */}
        <div className="p-6">
          {activeTab === 'specification' && (
            <div>
              <h2 className="text-lg font-medium mb-4">{t('specification')}</h2>

              {/* Текст спецификации */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">{t('specificationText')}</h3>
                {project.specificationText && project.specificationText[params.lang] ? (
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <div className="prose max-w-none whitespace-pre-wrap">
                      {project.specificationText[params.lang]}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">{t('noSpecificationText')}</p>
                )}
              </div>

              {/* Файлы спецификации */}
              <div>
                <h3 className="text-md font-medium mb-2">{t('specificationFiles')}</h3>
                {project.specificationFiles && project.specificationFiles.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {t('fileName')}
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                          >
                            {t('actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {project.specificationFiles.map((file) => (
                          <tr key={file.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <span className="truncate">{file.filename}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                {t('download')}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">{t('noSpecificationFiles')}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">{t('tasks')}</h2>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  {t('createTask')}
                </button>
              </div>

              {isLoadingTasks ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{task.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {t(`taskStatus.${task.status}`)}
                        </span>
                      </div>

                      {task.description && (
                        <p className="mt-2 text-gray-600 text-sm">{task.description}</p>
                      )}

                      <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
                        <div>
                          {task.assignedTo && (
                            <span>
                              {t('assignedTo')}: {task.assignedTo.name || task.assignedTo.email}
                            </span>
                          )}
                        </div>
                        <div>
                          {t('updated')}: {formatDate(task.updatedAt, params.lang)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-500 mb-3">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600">{t('noTasks')}</p>
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('createFirstTask')}
                  </button>
                </div>
              )}

              {/* Модальное окно создания задачи */}
              <TaskFormModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSubmit={handleCreateTask}
                projectId={project?.id || ''}
              />
            </div>
          )}

          {activeTab === 'discussions' && (
            <div>
              <h2 className="text-lg font-medium mb-4">{t('discussions')}</h2>

              {isLoadingMessages ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-6 mb-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.isSystemMessage
                          ? 'bg-gray-100'
                          : message.author.id === project?.customer.id
                            ? 'bg-blue-50 border border-blue-100'
                            : 'bg-green-50 border border-green-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {message.isSystemMessage
                            ? t('system')
                            : message.author.name || message.author.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(message.createdAt, params.lang)}
                        </div>
                      </div>

                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                        {message.content}
                      </div>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs text-gray-500 mb-2">{t('attachments')}:</div>
                          <div className="space-y-2">
                            {message.attachments.map((file) => (
                              <div key={file.id} className="flex items-center text-sm">
                                <svg
                                  className="w-4 h-4 mr-1 text-gray-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                  />
                                </svg>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 truncate"
                                >
                                  {file.filename}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center mb-8">
                  <div className="text-gray-500 mb-3">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600">{t('noMessages')}</p>
                </div>
              )}

              {/* Форма для отправки нового сообщения */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-md font-medium mb-3">{t('newMessage')}</h3>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full border rounded-md p-3 mb-3 min-h-[120px]"
                  placeholder={t('messageText')}
                />

                <div className="flex flex-wrap gap-2 justify-between">
                  <div>
                    <button className="flex items-center text-sm text-gray-600 px-3 py-1 border rounded hover:bg-gray-50">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      {t('attachFile')}
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`px-4 py-2 text-white rounded ${
                      newMessage.trim()
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-300 cursor-not-allowed'
                    }`}
                  >
                    {t('send')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">{t('files')}</h2>
                <label className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleUploadFile(Array.from(e.target.files))
                      }
                    }}
                  />
                  {t('uploadFile')}
                </label>
              </div>

              {/* Спецификация файлы отображаем всегда */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-3">{t('specificationFiles')}</h3>
                {project.specificationFiles && project.specificationFiles.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {t('fileName')}
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                          >
                            {t('actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {project.specificationFiles.map((file) => (
                          <tr key={file.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <span className="truncate">{file.filename}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                {t('download')}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">{t('noSpecificationFiles')}</p>
                )}
              </div>

              {/* Файлы проекта */}
              <div>
                <h3 className="text-md font-medium mb-3">{t('projectFiles')}</h3>
                {isLoadingFiles ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                ) : projectFiles && projectFiles.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {t('fileName')}
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {t('uploadedBy')}
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {t('date')}
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                          >
                            {t('actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {projectFiles.map((file) => (
                          <tr key={file.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <span className="truncate">{file.filename}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {file.uploadedBy?.name || file.uploadedBy?.email || t('unknown')}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatDate(file.createdAt, params.lang)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                {t('download')}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="text-gray-500 mb-3">
                      <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600">{t('noProjectFiles')}</p>
                    <label className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block cursor-pointer">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleUploadFile(Array.from(e.target.files))
                          }
                        }}
                      />
                      {t('uploadFirstFile')}
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
