import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

interface SpecificationTabContentProps {
  project: ProjectDetails;
  lang: string;
  // params: { lang: string }; // params.lang is available via lang prop directly
  t: (key: string, params?: any) => string;
}

const SpecificationTabContent: React.FC<SpecificationTabContentProps> = ({
  project,
  lang,
  t,
}) => {
  const currentLangSpecText = project.specificationText?.[lang] || project.specificationText?.['en'] || project.specificationText?.['ru'];

  return (
    <motion.div
      key="specification"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="py-6"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {t('specificationTextTitle')}
          </h3>
          {currentLangSpecText ? (
            <div
              className="prose dark:prose-invert max-w-none p-4 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow"
              dangerouslySetInnerHTML={{ __html: currentLangSpecText }}
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 p-4 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow">
              {t('noSpecificationText')}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {t('specificationFilesTitle')}
          </h3>
          {project.specificationFiles && project.specificationFiles.length > 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 overflow-hidden shadow">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {t('fileName')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {project.specificationFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            ></path>
                          </svg>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {file.filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={file.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          {t('downloadButton')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 p-4 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow">
              {t('noSpecificationFiles')}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SpecificationTabContent;