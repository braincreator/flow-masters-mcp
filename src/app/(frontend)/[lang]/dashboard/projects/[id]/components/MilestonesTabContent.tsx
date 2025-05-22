import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '@/utilities/formatDate';
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator';
// Note: MilestoneFormModal would be created in a future implementation
// import MilestoneFormModal from '@/components/modals/MilestoneFormModal';

// Type for milestone items
interface MilestoneItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  dueDate?: string;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  priority: string;
  associatedTasks?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

interface ProjectDetails {
  id: string;
  name: string;
  // Other necessary fields
}

interface MilestonesTabContentProps {
  milestones: MilestoneItem[];
  isLoadingMilestones: boolean;
  handleCreateMilestone: (milestoneData: { 
    title: string; 
    description?: string;
    startDate?: string;
    dueDate?: string;
    completionDate?: string;
    priority?: string;
    associatedTaskIds?: string[];
  }) => Promise<void>;
  project: ProjectDetails;
  params: { lang: string };
  t: (key: string, params?: any) => string;
  isMilestoneModalOpen: boolean;
  setIsMilestoneModalOpen: (isOpen: boolean) => void;
}

const MilestonesTabContent: React.FC<MilestonesTabContentProps> = ({
  milestones,
  isLoadingMilestones,
  handleCreateMilestone,
  project,
  params,
  t,
  isMilestoneModalOpen,
  setIsMilestoneModalOpen,
}) => {
  const { lang } = params;
  
  // Function to get status badge styling
  const getMilestoneStatusBadge = (status: string) => {
    const baseStyle = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (status) {
      case 'not_started':
        return `${baseStyle} bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200`;
      case 'in_progress':
        return `${baseStyle} bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100`;
      case 'completed':
        return `${baseStyle} bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100`;
      case 'overdue':
        return `${baseStyle} bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-600 dark:bg-gray-500 dark:text-gray-300`;
    }
  };

  // Function to get priority badge styling
  const getMilestonePriorityBadge = (priority: string) => {
    const baseStyle = 'px-2 py-0.5 text-xs font-medium rounded-full ml-2';
    switch (priority) {
      case 'low':
        return `${baseStyle} bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100`;
      case 'medium':
        return `${baseStyle} bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100`;
      case 'high':
        return `${baseStyle} bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-orange-100`;
      case 'critical':
        return `${baseStyle} bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-600 dark:bg-gray-500 dark:text-gray-300`;
    }
  };

  return (
    <motion.div
      key="milestones"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="py-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('milestonesTab.title')}
        </h3>
        <button
          onClick={() => setIsMilestoneModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors duration-150 shadow-sm hover:shadow"
        >
          {t('milestonesTab.createMilestoneButton')}
        </button>
      </div>

      {isLoadingMilestones ? (
        <div className="flex justify-center items-center py-10">
          <AnimatedLoadingIndicator size="medium" />
        </div>
      ) : milestones && milestones.length > 0 ? (
        <div className="space-y-6">
          {/* Timeline visualization */}
          <div className="relative pb-8">
            <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="relative mb-8"
              >
                <div className="flex items-start">
                  <div className={`absolute left-4 mt-1.5 w-3 h-3 rounded-full -translate-x-1.5 border-2 border-white dark:border-gray-900 ${
                    milestone.status === 'completed' 
                      ? 'bg-green-500' 
                      : milestone.status === 'in_progress' 
                        ? 'bg-blue-500' 
                        : milestone.status === 'overdue' 
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                  }`}></div>
                  <div className="ml-10">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <h4 className="text-md font-semibold mb-1">{milestone.title}</h4>
                        <div className="flex">
                          <span className={getMilestoneStatusBadge(milestone.status)}>
                            {t(`milestonesTab.status.${milestone.status}`, { defaultValue: milestone.status })}
                          </span>
                          <span className={getMilestonePriorityBadge(milestone.priority)}>
                            {t(`milestonesTab.priority.${milestone.priority}`, { defaultValue: milestone.priority })}
                          </span>
                        </div>
                      </div>
                      
                      {milestone.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {milestone.description}
                        </p>
                      )}
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-3">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500" 
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex flex-wrap gap-4">
                        {milestone.startDate && (
                          <span>{t('milestonesTab.startDate')}: {formatDate(milestone.startDate, lang)}</span>
                        )}
                        {milestone.dueDate && (
                          <span>{t('milestonesTab.dueDate')}: {formatDate(milestone.dueDate, lang)}</span>
                        )}
                        {milestone.completionDate && (
                          <span className={`${new Date(milestone.completionDate) > new Date(milestone.dueDate || '') ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                            {t('milestonesTab.completionDate')}: {formatDate(milestone.completionDate, lang)}
                          </span>
                        )}
                        <span>{t('milestonesTab.progress')}: {milestone.progress}%</span>
                      </div>
                      
                      {milestone.associatedTasks && milestone.associatedTasks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {t('milestonesTab.associatedTasks')}:
                            </h5>
                            <span className="text-xs">
                              {`${milestone.associatedTasks.filter(t => t.status === 'completed').length}/${milestone.associatedTasks.length} ${t('milestonesTab.completed')}`}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {milestone.associatedTasks.map(task => (
                              <div
                                key={task.id}
                                className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded text-xs"
                              >
                                <span>{task.title}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                  task.status === 'completed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : task.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {t(`tasksTab.status.${task.status}`, { defaultValue: task.status })}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Task Progress */}
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                              <div
                                className="bg-green-500 h-1.5 rounded-full"
                                style={{ width: `${milestone.associatedTasks.filter(t => t.status === 'completed').length / milestone.associatedTasks.length * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {t('milestonesTab.noMilestonesTitle')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('milestonesTab.noMilestonesDescription')}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsMilestoneModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('milestonesTab.createMilestoneButton')}
            </button>
          </div>
        </div>
      )}

      {/* This would be implemented later */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">{t('milestonesTab.createMilestoneTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('milestonesTab.milestoneFormModalNotImplemented')}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsMilestoneModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MilestonesTabContent;
