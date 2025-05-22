import React from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '@/utilities/formatDate'; // Assuming this path is correct

// Copied from page.tsx - consider moving to a shared types file later
interface ProjectDetails {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    email: string;
  };
  sourceOrder: {
    id: string;
    orderNumber: string;
  };
  serviceDetails: {
    serviceName: string;
    serviceType?: string;
  };
  specificationText: {
    ru?: string | null;
    en?: string | null;
    [key: string]: string | null | undefined;
  };
  specificationFiles: Array<{
    id: string;
    filename: string;
    url: string;
  }>;
  tasks?: any[]; // Replace with TaskItem[] if defined elsewhere
  messages?: any[]; // Replace with MessageItem[] if defined elsewhere
  projectFiles?: any[]; // Replace with ProjectFile[] if defined elsewhere
}

// Copied from page.tsx - consider moving to a shared constants file later
const statusBadgeClasses: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  on_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

interface ProjectHeaderProps {
  project: ProjectDetails;
  lang: string;
  t: (key: string, params?: any) => string; // Adjusted for potential params in t function
  getStatusText: (status: string) => string;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  lang,
  t,
  getStatusText,
}) => {
  return (
    <div className="p-6 border-b dark:border-gray-700 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900">
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
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            statusBadgeClasses[project.status] || statusBadgeClasses.unknown
          }`}
        >
          {getStatusText(project.status)}
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
      >
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          <span className="text-gray-700 dark:text-gray-300">
            {t('orderNumber')}:{' '}
            <span className="font-semibold">{project.sourceOrder?.orderNumber || 'N/A'}</span>
          </span>
        </div>
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="text-gray-700 dark:text-gray-300">
            {t('created')}:{' '}
            <span className="font-semibold">{formatDate(project.createdAt, lang)}</span>
          </span>
        </div>
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2M9 15h4.582"
            ></path>
          </svg>
          <span className="text-gray-700 dark:text-gray-300">
            {t('lastUpdated')}:{' '}
            <span className="font-semibold">{formatDate(project.updatedAt, lang)}</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectHeader;