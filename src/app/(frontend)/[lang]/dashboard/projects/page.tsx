'use client'

import React, { useEffect, useState, Suspense, use } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { formatDate } from '@/utilities/formatDate'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator'

// Определение типа для проекта в списке
interface ProjectItem {
  id: string
  name: string
  status: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    email: string
  }
  serviceDetails: {
    serviceName: string
    serviceType?: string
  }
}

// Определяем соответствие статусов проектов для отображения
const statusBadgeClasses: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  on_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

// This is the main component that will use React.use() to unwrap the params
export default function ProjectsPage({ params }: { params: any }) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[300px]">
        <AnimatedLoadingIndicator size="large" color="text-blue-600" />
      </div>
    }>
      <ProjectsPageWrapper params={params} />
    </Suspense>
  )
}

// This component will safely unwrap the params
function ProjectsPageWrapper({ params }: { params: any }) {
  // Safely unwrap the params using React.use()
  const unwrappedParams = use(params) as { lang: string }
  const lang = unwrappedParams.lang

  return <ProjectsPageContent lang={lang} />
}

// This is a wrapper component that will handle the Promise nature of params
function ProjectsPageContent({ lang }: { lang: string }) {
  const t = useTranslations('Projects')
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Получение списка проектов
  useEffect(() => {
    const fetchProjects = async (retryCount = 0) => {
      try {
        setIsLoading(true)
        console.log('Fetching projects from API...')

        const response = await fetch('/api/service-projects', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Ensure cookies are sent with the request
          cache: 'no-store' // Prevent caching issues
        })

        console.log(`Projects API response status: ${response.status}`)

        if (!response.ok) {
          // Try to get more detailed error information
          const errorMessage = t('errorLoadingProjects')
          let errorDetails = ''

          try {
            const errorData = await response.json()
            console.error('Error response data:', errorData)
            errorDetails = errorData.details || errorData.error || ''
          } catch (parseError) {
            console.error('Could not parse error response:', parseError)
          }

          // Handle specific status codes
          if (response.status === 401) {
            console.error('User is not authenticated, redirecting to login page')

            // Check if we're in development mode and should retry
            if (process.env.NODE_ENV === 'development' && retryCount < 1) {
              console.log('Development mode detected, retrying request...')
              setTimeout(() => fetchProjects(retryCount + 1), 1000)
              return
            }

            // Only redirect if we're not in development mode or we've already retried
            window.location.href = `/${lang}/login?redirect=${encodeURIComponent(window.location.pathname)}`
            return
          }

          throw new Error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`)
        }

        const data = await response.json()
        console.log(`Received ${data.length} projects`)
        setProjects(data)
        setError(null) // Clear any previous errors
      } catch (err) {
        console.error('Error fetching projects:', err)

        // Check if it's a network error and retry if needed
        const isNetworkError = err instanceof TypeError &&
          (err.message.includes('fetch') || err.message.includes('network'));

        if (isNetworkError && retryCount < 2) {
          console.log(`Network error, retrying (${retryCount + 1}/3)...`)
          setTimeout(() => fetchProjects(retryCount + 1), 1000)
          return
        }

        setError(err instanceof Error ? err.message : t('unknownError'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [t, lang])

  // Получаем список проектов в соответствии с выбранным фильтром
  const filteredProjects =
    statusFilter === 'all'
      ? projects
      : projects.filter((project) => project.status === statusFilter)

  // Функция для перевода статуса
  const getStatusText = (status: string) => {
    return t(`status.${status}`, { defaultValue: status })
  }

  // Card item animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring", 
        stiffness: 400,
        damping: 10
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <AnimatedLoadingIndicator size="large" color="text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <motion.div 
        className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg p-4 my-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p>{error}</p>
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div 
        className="flex flex-wrap items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('title')}</h1>

        {/* Фильтр по статусу - улучшенный дизайн */}
        <motion.div
          className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-2 border border-gray-200 dark:border-gray-700 relative"
          whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <svg
            className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">{t('filterByStatus')}</span>
          <motion.select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-grow bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-200 appearance-none pr-8"
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="new">{t('status.new')}</option>
            <option value="in_progress">{t('status.in_progress')}</option>
            <option value="on_review">{t('status.on_review')}</option>
            <option value="completed">{t('status.completed')}</option>
            <option value="cancelled">{t('status.cancelled')}</option>
          </motion.select>
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute right-5 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {filteredProjects.length === 0 ? (
          <motion.div 
            key="empty-state"
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="text-gray-500 dark:text-gray-400 mb-3"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              {statusFilter === 'all'
                ? t('noProjects')
                : t('noProjectsWithStatus', { status: t(`status.${statusFilter}`) })}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/${lang}/dashboard/services`}
                className="inline-block px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                {t('orderNewService')}
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md"
                variants={cardVariants}
                whileHover="hover"
                custom={index}
              >
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h2
                      className="text-base font-semibold text-gray-800 dark:text-white line-clamp-2"
                      title={project.name}
                    >
                      {project.name}
                    </h2>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                        statusBadgeClasses[project.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {project.serviceDetails.serviceName || t('unknownService')}
                    {project.serviceDetails.serviceType && (
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        - {project.serviceDetails.serviceType}
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="px-5 py-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('created')}:</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {formatDate(project.createdAt, lang)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('updated')}:</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {formatDate(project.updatedAt, lang)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={`/${lang}/dashboard/projects/${project.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
                    >
                      <svg 
                        className="w-4 h-4 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                      {t('view')}
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
