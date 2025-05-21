'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/utilities/formatDate'
import { useLocale } from 'next-intl'

interface ServiceProject {
  id: string
  name: string
  status: string
  sourceOrder: {
    id: string
    orderNumber: string
  }
  serviceDetails: {
    serviceName: string
    serviceType: string
  }
  createdAt: string
  updatedAt: string
}

interface ServiceProjectListProps {
  projects: ServiceProject[]
}

const ServiceProjectList: React.FC<ServiceProjectListProps> = ({ projects }) => {
  const t = useTranslations('Projects')
  const locale = useLocale()

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

  const getStatusLabel = (status: string) => {
    return t(`status.${status}`)
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {projects.map((project) => (
          <li key={project.id} className="hover:bg-gray-50 transition-colors">
            <Link href={`/${locale}/dashboard/projects/${project.id}`} className="block p-4 sm:px-6 sm:py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {project.serviceDetails?.serviceName || t('unknownService')}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {t('orderNumber')}: {project.sourceOrder?.orderNumber || t('unknown')}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:space-x-4 items-start sm:items-center text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-1">{t('created')}:</span>
                    <time dateTime={project.createdAt}>
                      {formatDate(project.createdAt, locale)}
                    </time>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(project.status)}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ServiceProjectList
