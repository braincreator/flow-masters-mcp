'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { formatDate } from '@/utilities/formatDate'
import { useNotification } from '@/context/NotificationContext'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator'

// Import new components
import ProjectHeader from './components/ProjectHeader'
import TabNavigation from './components/TabNavigation'
import SpecificationTabContent from './components/SpecificationTabContent'
import TasksTabContent from './components/TasksTabContent'
import DiscussionsTabContent from './components/DiscussionsTabContent'
import FilesTabContent from './components/FilesTabContent'

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
  project: string // ID проекта
  file: {
    // Ссылка на документ из коллекции 'media'
    id: string
    filename: string
    url: string
    fileSize?: number
    mimeType?: string
    createdAt: string
    updatedAt: string
  }
  uploadedBy?: {
    // Пользователь, который добавил файл к проекту (не обязательно тот, кто загрузил медиа)
    id: string
    name?: string
    email: string
  }
  createdAt: string
  updatedAt: string
  category?: string
}

export default function ProjectDetailsPage({ params }: { params: { lang: string; id: string } }) {
  const { id, lang } = React.use(params)
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
  // Состояние для отслеживания файла, который в процессе удаления
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)

  // Функция для перевода статуса
  const getStatusText = (status: string) => {
    return t(`status.${status}`, { defaultValue: status })
  }

  // Получение данных проекта
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true)
        console.log('Initial load: isLoading set to true')
        const response = await fetch(`/api/service-projects/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(t('errorLoadingProject'))
        }

        const data = await response.json()
        setProject(data)
        console.log('Initial load: isLoading set to false. Project data:', data)
      } catch (err) {
        console.error('Error fetching project details:', err)
        setError(err instanceof Error ? err.message : t('unknownError'))
        console.log('Initial load: isLoading set to false. Error:', err)
        showNotification('error', t('errorLoadingProject'))
      } finally {
        setIsLoading(false)
        console.log('Initial load: fetchProjectDetails finally block, isLoading set to false')
      }
    }

    fetchProjectDetails()
  }, [id, t, showNotification])

  // Получение задач проекта при переключении на вкладку задач
  useEffect(() => {
    const fetchTasks = async () => {
      if (activeTab !== 'tasks' || !project) {
        if (activeTab === 'tasks') console.log('Tasks load: Skipped, project not yet loaded.')
        return
      }
      console.log('Tasks load: activeTab is "tasks" and project exists. Fetching tasks.')
      try {
        setIsLoadingTasks(true)
        console.log('Tasks load: isLoadingTasks set to true')
        const response = await fetch(`/api/tasks?projectId=${project.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          // Attempt to read response body for more details
          let errorDetails = ''
          try {
            const errorData = await response.json()
            errorDetails = errorData.details || errorData.error || JSON.stringify(errorData)
          } catch (parseError) {
            errorDetails = response.statusText
          }
          throw new Error(t('errorLoadingTasks') + (errorDetails ? `: ${errorDetails}` : ''))
        }

        const data = await response.json()
        setTasks(data)
        console.log('Tasks load: isLoadingTasks set to false. Tasks data:', data)
      } catch (err) {
        console.error('Error fetching tasks:', err)
        console.log('Tasks load: isLoadingTasks set to false. Error:', err)
      } finally {
        setIsLoadingTasks(false)
        console.log('Tasks load: fetchTasks finally block, isLoadingTasks set to false')
      }
    }

    fetchTasks()
  }, [activeTab, project, t])

  // Получение сообщений проекта при переключении на вкладку обсуждений
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeTab !== 'discussions' || !project) {
        if (activeTab === 'discussions') console.log('Messages load: Skipped, project not yet loaded.');
        return;
      }
      console.log('Messages load: activeTab is "discussions" and project exists. Fetching messages.');
      try {
        setIsLoadingMessages(true)
        console.log('Messages load: isLoadingMessages set to true');
        const response = await fetch(`/api/project-messages?projectId=${project.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(t('errorLoadingMessages'))
        }

        const data = await response.json()
        setMessages(data)
        console.log('Messages load: isLoadingMessages set to false. Messages data:', data);
      } catch (err) {
        console.error('Error fetching messages:', err)
        console.log('Messages load: isLoadingMessages set to false. Error:', err);
      } finally {
        setIsLoadingMessages(false)
        console.log('Messages load: fetchMessages finally block, isLoadingMessages set to false');
      }
    }

    fetchMessages()
  }, [activeTab, project, t])

  // Получение файлов проекта при переключении на вкладку файлов
  useEffect(() => {
    const fetchFiles = async () => {
      if (activeTab !== 'files' || !project) {
        if (activeTab === 'files') console.log('Files load: Skipped, project not yet loaded.');
        return;
      }
      console.log('Files load: activeTab is "files" and project exists. Fetching files.');
      try {
        setIsLoadingFiles(true)
        console.log('Files load: isLoadingFiles set to true');
        const response = await fetch(`/api/project-files?projectId=${project.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(t('errorLoadingFiles'))
        }

        const data = await response.json()
        console.log('Files load: isLoadingFiles set to false. Files data:', data);
        // API возвращает массив файлов напрямую
        if (Array.isArray(data)) {
          setProjectFiles(data)
        } else {
          // Если структура неизвестна или не массив, используем пустой массив
          setProjectFiles([])
          console.error('Unexpected response format from project-files API:', data)
        }
      } catch (err) {
        console.error('Error fetching files:', err)
        console.log('Files load: isLoadingFiles set to false. Error:', err);
      } finally {
        setIsLoadingFiles(false)
        console.log('Files load: fetchFiles finally block, isLoadingFiles set to false');
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

    setIsLoadingFiles(true) // Показываем индикатор загрузки

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
        // Проверяем структуру данных и устанавливаем projectFiles
        if (Array.isArray(data)) {
          setProjectFiles(data)
        } else if (data.docs && Array.isArray(data.docs)) {
          // Если API возвращает объект с полем docs (стандартный формат Payload CMS)
          setProjectFiles(data.docs)
        } else if (data.files && Array.isArray(data.files)) {
          // Если API возвращает объект с полем files
          setProjectFiles(data.files)
        } else {
          // Если структура неизвестна, используем пустой массив
          setProjectFiles([])
          console.error('Unexpected response format from project-files API:', data)
        }
        showNotification('success', t('filesUploadedSuccess', { count: files.length }))
      }
    } catch (err) {
      console.error('Error uploading files:', err)
      showNotification('error', t('errorUploadingFiles'))
    } finally {
      setIsLoadingFiles(false) // Скрываем индикатор загрузки
    }
  }

  // Функция для удаления файла проекта
  const handleDeleteFile = async (fileEntryId: string) => {
    if (!project || !fileEntryId) return

    if (!confirm(t('filesTab.confirmDeleteFile'))) return

    try {
      // Устанавливаем ID файла, который удаляется (для анимации)
      setDeletingFileId(fileEntryId)

      const response = await fetch(
        `/api/project-files?projectId=${project.id}&fileId=${fileEntryId}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t('errorDeletingFile'))
      }

      // Ждем завершения анимации перед обновлением списка
      setTimeout(() => {
        // Обновляем список файлов после успешного удаления
        if (Array.isArray(projectFiles)) {
          setProjectFiles(
            projectFiles.filter((projectFile) => projectFile && projectFile.id !== fileEntryId),
          )
        }
        setDeletingFileId(null) // Сбрасываем ID удаляемого файла
        showNotification('success', t('filesTab.fileDeletedSuccessfully'))
      }, 300) // Время должно соответствовать длительности анимации exit
    } catch (err) {
      console.error('Error deleting project file:', err)
      showNotification('error', err instanceof Error ? err.message : t('unknownError'))
      setDeletingFileId(null) // Сбрасываем ID удаляемого файла в случае ошибки
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AnimatedLoadingIndicator size="large" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg p-4 my-4">
        <p>{error || t('projectNotFound')}</p>
        <Link
          href={`/${lang}/dashboard/projects`}
          className="mt-4 inline-block text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
          href={`/${lang}/dashboard/projects`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
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

      <motion.div
        className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Project Header - using the extracted component */}
        <ProjectHeader
          project={project}
          lang={lang}
          t={t}
          getStatusText={getStatusText}
        />

        {/* Tab Navigation - using the extracted component */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

        {/* Tab Content - using the extracted components */}
        <motion.div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'specification' && (
              <SpecificationTabContent
                project={project}
                lang={lang}
                t={t}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksTabContent
                tasks={tasks}
                isLoadingTasks={isLoadingTasks}
                handleCreateTask={handleCreateTask}
                project={project}
                params={{ lang }}
                t={t}
                isTaskModalOpen={isTaskModalOpen}
                setIsTaskModalOpen={setIsTaskModalOpen}
              />
            )}

            {activeTab === 'discussions' && (
              <DiscussionsTabContent
                messages={messages}
                isLoadingMessages={isLoadingMessages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                project={project}
                params={{ lang }}
                t={t}
              />
            )}

            {activeTab === 'files' && (
              <FilesTabContent
                projectFiles={projectFiles}
                isLoadingFiles={isLoadingFiles}
                handleUploadFile={handleUploadFile}
                handleDeleteFile={handleDeleteFile}
                deletingFileId={deletingFileId}
                project={project}
                lang={lang}
                t={t}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
