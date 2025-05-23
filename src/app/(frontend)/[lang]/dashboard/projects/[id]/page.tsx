'use client'

import React, { useEffect, useState } from 'react'
import MilestonesTabContent from './components/MilestonesTabContent'
import CalendarTabContent from './components/CalendarTabContent'
import FeedbackTabContent from './components/FeedbackTabContent'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { formatDate } from '@/utilities/formatDate'
import { useNotification } from '@/context/NotificationContext'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

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
  status: 'new' | 'in_progress' | 'completed'
  dueDate?: string
  completionDate?: string
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

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
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

  // Состояние для этапов проекта (milestones)
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false)
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)

  // Состояние для календаря проекта
  const [isLoadingCalendarData, setIsLoadingCalendarData] = useState(false)

  // Состояние для отзывов проекта
  const [feedback, setFeedback] = useState<any[]>([])
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)

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

  // Получение этапов проекта при переключении на вкладку этапов
  useEffect(() => {
    const fetchMilestones = async () => {
      if (activeTab !== 'milestones' || !project) {
        if (activeTab === 'milestones')
          console.log('Milestones load: Skipped, project not yet loaded.')
        return
      }
      console.log(
        'Milestones load: activeTab is "milestones" and project exists. Fetching milestones.',
      )
      try {
        setIsLoadingMilestones(true)
        console.log('Milestones load: isLoadingMilestones set to true')

        // In the future, this would be an actual API call
        // For now, we'll just simulate a delay and return dummy data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Dummy milestone data
        const dummyMilestones = [
          {
            id: '1',
            title: 'Анализ требований',
            description: 'Анализ и уточнение требований к проекту',
            status: 'completed',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
            completionDate: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(), // 26 days ago (completed before deadline)
            createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
            updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
            progress: 100,
            priority: 'high',
            associatedTasks: [
              { id: 'a1', title: 'Интервью с заказчиком', status: 'completed' },
              { id: 'a2', title: 'Анализ конкурентов', status: 'completed' },
              { id: 'a3', title: 'Составление ТЗ', status: 'completed' },
            ],
          },
          {
            id: '2',
            title: 'Проектирование',
            description: 'Разработка архитектуры и дизайна проекта',
            status: 'completed',
            startDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(), // 24 days ago
            dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
            completionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago (completed after deadline)
            createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(), // 26 days ago
            updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
            progress: 100,
            priority: 'medium',
            associatedTasks: [
              { id: 'b1', title: 'Создание архитектуры проекта', status: 'completed' },
              { id: 'b2', title: 'Разработка дизайн-макетов', status: 'completed' },
              { id: 'b3', title: 'Согласование с заказчиком', status: 'completed' },
            ],
          },
          {
            id: '3',
            title: 'Разработка',
            description: 'Реализация функциональности проекта',
            status: 'in_progress',
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days in the future
            createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days ago
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            progress: 65,
            priority: 'high',
            associatedTasks: [
              { id: 'c1', title: 'Создание базовой структуры проекта', status: 'completed' },
              { id: 'c2', title: 'Реализация авторизации', status: 'completed' },
              { id: 'c3', title: 'Разработка API', status: 'in_progress' },
              { id: 'c4', title: 'Интеграция с внешними сервисами', status: 'in_progress' },
              { id: 'c5', title: 'Тестирование компонентов', status: 'not_started' },
            ],
          },
          {
            id: '4',
            title: 'Тестирование',
            description: 'Проверка качества и соответствия требованиям',
            status: 'not_started',
            startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days in the future
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days in the future
            createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days ago
            updatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days ago
            progress: 0,
            priority: 'medium',
            associatedTasks: [
              { id: 'd1', title: 'Разработка тест-кейсов', status: 'not_started' },
              { id: 'd2', title: 'Тестирование функциональности', status: 'not_started' },
              { id: 'd3', title: 'Исправление ошибок', status: 'not_started' },
            ],
          },
          {
            id: '5',
            title: 'Запуск',
            description: 'Публикация проекта',
            status: 'not_started',
            startDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days in the future
            dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days in the future
            createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days ago
            updatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days ago
            progress: 0,
            priority: 'critical',
            associatedTasks: [
              { id: 'e1', title: 'Развертывание на сервере', status: 'not_started' },
              { id: 'e2', title: 'Финальное тестирование', status: 'not_started' },
              { id: 'e3', title: 'Демонстрация заказчику', status: 'not_started' },
            ],
          },
        ]

        // Calculate progress based on tasks
        dummyMilestones.forEach((milestone) => {
          if (milestone.associatedTasks && milestone.associatedTasks.length > 0) {
            const completedTasks = milestone.associatedTasks.filter(
              (task) => task.status === 'completed',
            ).length
            const totalTasks = milestone.associatedTasks.length
            milestone.progress = Math.round((completedTasks / totalTasks) * 100)
          }
        })

        setMilestones(dummyMilestones)
        console.log(
          'Milestones load: isLoadingMilestones set to false. Milestones data:',
          dummyMilestones,
        )
      } catch (err) {
        console.error('Error fetching milestones:', err)
        console.log('Milestones load: isLoadingMilestones set to false. Error:', err)
      } finally {
        setIsLoadingMilestones(false)
        console.log(
          'Milestones load: fetchMilestones finally block, isLoadingMilestones set to false',
        )
      }

      // Функция для создания нового этапа
      const handleCreateMilestone = async (milestoneData: {
        title: string
        description?: string
        startDate?: string
        dueDate?: string
        priority?: string
      }) => {
        if (!project) return

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500))

          const newMilestone = {
            id: `milestone-${Date.now()}`,
            ...milestoneData,
            status: 'not_started',
            progress: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          setMilestones((prev) => [newMilestone, ...prev])
          showNotification('success', t('milestoneCreatedSuccess'))
          setIsMilestoneModalOpen(false)
        } catch (err) {
          console.error('Error creating milestone:', err)
          showNotification('error', t('errorCreatingMilestone'))
          throw err
        }
      }

      // Функция для создания нового отзыва
      const handleCreateFeedback = async (feedbackData: {
        title: string
        rating: number
        comment: string
        feedbackType: string
        isPublic: boolean
      }) => {
        if (!project) return

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500))

          const newFeedback = {
            id: `feedback-${Date.now()}`,
            ...feedbackData,
            author: {
              id: project.customer.id,
              name: 'Текущий пользователь',
              email: project.customer.email,
            },
            createdAt: new Date().toISOString(),
          }

          setFeedback((prev) => [...prev, newFeedback])
          showNotification('success', t('feedbackCreatedSuccess'))
          return newFeedback
        } catch (err) {
          console.error('Error creating feedback:', err)
          showNotification('error', t('errorCreatingFeedback'))
          throw err
        }
      }
    }

    fetchMilestones()
  }, [activeTab, project])

  // Получение данных для календаря при переключении на вкладку календаря
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (activeTab !== 'calendar' || !project) {
        if (activeTab === 'calendar') console.log('Calendar load: Skipped, project not yet loaded.')
        return
      }
      console.log('Calendar load: activeTab is "calendar" and project exists.')

      try {
        setIsLoadingCalendarData(true)
        console.log('Calendar load: isLoadingCalendarData set to true')

        // Calendar data is a combination of milestones and tasks
        // We'll use the existing data, so just simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        console.log('Calendar load: isLoadingCalendarData set to false.')
      } catch (err) {
        console.error('Error preparing calendar data:', err)
        console.log('Calendar load: isLoadingCalendarData set to false. Error:', err)
      } finally {
        setIsLoadingCalendarData(false)
        console.log(
          'Calendar load: fetchCalendarData finally block, isLoadingCalendarData set to false',
        )
      }
    }

    fetchCalendarData()
  }, [activeTab, project, milestones, tasks])

  // Получение отзывов проекта при переключении на вкладку отзывов
  useEffect(() => {
    const fetchFeedback = async () => {
      if (activeTab !== 'feedback' || !project) {
        if (activeTab === 'feedback') console.log('Feedback load: Skipped, project not yet loaded.')
        return
      }
      console.log('Feedback load: activeTab is "feedback" and project exists. Fetching feedback.')

      try {
        setIsLoadingFeedback(true)
        console.log('Feedback load: isLoadingFeedback set to true')

        // In the future, this would be an actual API call
        // For now, we'll just simulate a delay and return dummy data
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Dummy feedback data
        const dummyFeedback = [
          {
            id: '1',
            title: 'Отличное начало проекта',
            rating: 5,
            comment:
              'Этап анализа требований был проведен очень тщательно. Команда учла все пожелания и предложила отличные решения.',
            author: {
              id: project.customer.id,
              name: 'Клиент',
              email: project.customer.email,
            },
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
            feedbackType: 'milestone',
            isPublic: true,
          },
          {
            id: '2',
            title: 'Хорошая коммуникация',
            rating: 4,
            comment:
              'Команда всегда на связи и оперативно отвечает на вопросы. Есть небольшие замечания по срокам, но в целом все отлично.',
            author: {
              id: project.customer.id,
              name: 'Клиент',
              email: project.customer.email,
            },
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
            feedbackType: 'collaboration',
            isPublic: false,
          },
        ]

        setFeedback(dummyFeedback)
        console.log('Feedback load: isLoadingFeedback set to false. Feedback data:', dummyFeedback)
      } catch (err) {
        console.error('Error fetching feedback:', err)
        console.log('Feedback load: isLoadingFeedback set to false. Error:', err)
      } finally {
        setIsLoadingFeedback(false)
        console.log('Feedback load: fetchFeedback finally block, isLoadingFeedback set to false')
      }
    }

    fetchFeedback()
  }, [activeTab, project])

  // Получение сообщений проекта при переключении на вкладку обсуждений
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeTab !== 'discussions' || !project) {
        if (activeTab === 'discussions')
          console.log('Messages load: Skipped, project not yet loaded.')
        return
      }
      console.log(
        'Messages load: activeTab is "discussions" and project exists. Fetching messages.',
      )
      try {
        setIsLoadingMessages(true)
        console.log('Messages load: isLoadingMessages set to true')
        const response = await fetch(`/api/project-messages?projectId=${project.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(t('errorLoadingMessages'))
        }

        const data = await response.json()
        setMessages(data)
        console.log('Messages load: isLoadingMessages set to false. Messages data:', data)
      } catch (err) {
        console.error('Error fetching messages:', err)
        console.log('Messages load: isLoadingMessages set to false. Error:', err)
      } finally {
        setIsLoadingMessages(false)
        console.log('Messages load: fetchMessages finally block, isLoadingMessages set to false')
      }
    }

    fetchMessages()
  }, [activeTab, project, t])

  // Получение файлов проекта при переключении на вкладку файлов
  useEffect(() => {
    const fetchFiles = async () => {
      if (activeTab !== 'files' || !project) {
        if (activeTab === 'files') console.log('Files load: Skipped, project not yet loaded.')
        return
      }
      console.log('Files load: activeTab is "files" and project exists. Fetching files.')
      try {
        setIsLoadingFiles(true)
        console.log('Files load: isLoadingFiles set to true')
        const response = await fetch(`/api/project-files?projectId=${project.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(t('errorLoadingFiles'))
        }

        const data = await response.json()
        console.log('Files load: isLoadingFiles set to false. Files data:', data)
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
        console.log('Files load: isLoadingFiles set to false. Error:', err)
      } finally {
        setIsLoadingFiles(false)
        console.log('Files load: fetchFiles finally block, isLoadingFiles set to false')
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

  // Функция для создания нового этапа
  const handleCreateMilestone = async (milestoneData: {
    title: string
    description?: string
    startDate?: string
    dueDate?: string
    completionDate?: string
    priority?: string
    associatedTaskIds?: string[]
  }) => {
    if (!project) return

    try {
      // Get associated tasks if ids were provided
      let associatedTasks: Array<{ id: string; title: string; status: string }> = []
      if (milestoneData.associatedTaskIds && milestoneData.associatedTaskIds.length > 0) {
        associatedTasks = tasks
          .filter((task) => milestoneData.associatedTaskIds?.includes(task.id))
          .map((task) => ({
            id: task.id,
            title: task.title,
            status: task.status,
          }))
      }

      // Calculate progress based on associated tasks
      let progress = 0
      if (associatedTasks.length > 0) {
        const completedTasks = associatedTasks.filter((task) => task.status === 'completed').length
        progress = Math.round((completedTasks / associatedTasks.length) * 100)
      }

      // Determine status
      let status = 'not_started'
      if (milestoneData.completionDate) {
        status = 'completed'
      } else if (progress > 0) {
        status = 'in_progress'
      }

      const newMilestone = {
        id: `milestone-${Date.now()}`,
        ...milestoneData,
        status,
        progress,
        associatedTasks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setMilestones((prev) => [newMilestone, ...prev])
      showNotification('success', t('milestoneCreatedSuccess'))
      setIsMilestoneModalOpen(false)
    } catch (err) {
      console.error('Error creating milestone:', err)
      showNotification('error', t('errorCreatingMilestone'))
      throw err
    }
  }

  // Функция для создания нового отзыва
  const handleCreateFeedback = async (feedbackData: {
    title: string
    rating: number
    comment: string
    feedbackType: string
    isPublic: boolean
  }) => {
    if (!project) return

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newFeedback = {
        id: `feedback-${Date.now()}`,
        ...feedbackData,
        author: {
          id: project.customer.id,
          name: 'Текущий пользователь',
          email: project.customer.email,
        },
        createdAt: new Date().toISOString(),
      }

      setFeedback((prev) => [...prev, newFeedback])
      showNotification('success', t('feedbackCreatedSuccess'))
      // No need to return the feedback object, as the component expects Promise<void>
    } catch (err) {
      console.error('Error creating feedback:', err)
      showNotification('error', t('errorCreatingFeedback'))
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
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || t('projectNotFound')}</AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href={`/${lang}/dashboard/projects`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('backToProjects')}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/${lang}/dashboard/projects`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('backToProjects')}
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700">
          {/* Project Header - using the extracted component */}
          <ProjectHeader project={project} lang={lang} t={t} getStatusText={getStatusText} />

          {/* Tab Navigation - using the extracted component */}
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

          {/* Tab Content - using the extracted components */}
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'specification' && (
                <SpecificationTabContent project={project} lang={lang} t={t} />
              )}

              {activeTab === 'tasks' && (
                <TasksTabContent
                  tasks={tasks}
                  isLoadingTasks={isLoadingTasks}
                  handleCreateTask={handleCreateTask}
                  project={project}
                  lang={lang}
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
                  lang={lang}
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

              {activeTab === 'milestones' && <MilestonesTabContent project={project} lang={lang} />}

              {activeTab === 'calendar' && (
                <CalendarTabContent
                  milestones={milestones}
                  tasks={tasks}
                  isLoadingCalendarData={isLoadingCalendarData}
                  project={project}
                  lang={lang}
                  t={t}
                />
              )}

              {activeTab === 'feedback' && (
                <FeedbackTabContent
                  feedback={feedback}
                  isLoadingFeedback={isLoadingFeedback}
                  handleCreateFeedback={handleCreateFeedback}
                  project={project}
                  lang={lang}
                  t={t}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
