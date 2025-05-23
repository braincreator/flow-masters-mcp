import React from 'react'
import { motion } from 'framer-motion'
import { formatDate } from '@/utilities/formatDate'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, RefreshCw } from 'lucide-react'

// Copied from page.tsx - consider moving to a shared types file later
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
  tasks?: any[] // Replace with TaskItem[] if defined elsewhere
  messages?: any[] // Replace with MessageItem[] if defined elsewhere
  projectFiles?: any[] // Replace with ProjectFile[] if defined elsewhere
}

// Status badge variants for shadcn/ui Badge component
const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'new':
      return 'default'
    case 'in_progress':
      return 'secondary'
    case 'on_review':
      return 'outline'
    case 'completed':
      return 'default'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'on_review':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

interface ProjectHeaderProps {
  project: ProjectDetails
  lang: string
  t: (key: string, params?: any) => string // Adjusted for potential params in t function
  getStatusText: (status: string) => string
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, lang, t, getStatusText }) => {
  return (
    <Card className="border-0 rounded-none border-b dark:border-gray-700">
      <CardContent className="p-6 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-2xl font-semibold text-gray-800 dark:text-white"
            >
              {project.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {project.serviceDetails?.serviceName || t('serviceNameNotAvailable')}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Badge
              variant={getStatusVariant(project.status)}
              className={getStatusColor(project.status)}
            >
              {getStatusText(project.status)}
            </Badge>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
        >
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {t('orderNumber')}:{' '}
              <span className="font-semibold">{project.sourceOrder?.orderNumber || 'N/A'}</span>
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {t('created')}:{' '}
              <span className="font-semibold">{formatDate(project.createdAt, lang)}</span>
            </span>
          </div>
          <div className="flex items-center">
            <RefreshCw className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {t('lastUpdated')}:{' '}
              <span className="font-semibold">{formatDate(project.updatedAt, lang)}</span>
            </span>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}

export default ProjectHeader
