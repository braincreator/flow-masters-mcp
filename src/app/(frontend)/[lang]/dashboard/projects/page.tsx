'use client'

import React, { useEffect, useState, Suspense, use } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { formatDate } from '@/utilities/formatDate'

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
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  on_review: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

// This is the main component that will use React.use() to unwrap the params
export default function ProjectsPage({ params }: { params: any }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
          let errorMessage = t('errorLoadingProjects')
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 my-4">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>

        {/* Фильтр по статусу */}
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">{t('filterByStatus')}:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="new">{t('status.new')}</option>
            <option value="in_progress">{t('status.in_progress')}</option>
            <option value="on_review">{t('status.on_review')}</option>
            <option value="completed">{t('status.completed')}</option>
            <option value="cancelled">{t('status.cancelled')}</option>
          </select>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600">
            {statusFilter === 'all'
              ? t('noProjects')
              : t('noProjectsWithStatus', { status: t(`status.${statusFilter}`) })}
          </p>
          <Link
            href={`/${lang}/dashboard/services`}
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('orderNewService')}
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('projectName')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('serviceType')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('statusLabel')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('updated')}
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">{t('actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500">
                        {t('created')}: {formatDate(project.createdAt, lang)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {project.serviceDetails.serviceName}
                      </div>
                      {project.serviceDetails.serviceType && (
                        <div className="text-sm text-gray-500">
                          {project.serviceDetails.serviceType}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          statusBadgeClasses[project.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getStatusText(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(project.updatedAt, lang)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/${lang}/dashboard/projects/${project.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {t('view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
