import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatDate } from '@/utilities/formatDate'
import TaskFormModal from '@/components/modals/TaskFormModal' // Assuming this path is correct
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator' // Assuming this path

// --- Copied/defined types - consider moving to a shared types file ---
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

interface ProjectDetails {
  id: string
  name: string
  // Add other necessary ProjectDetails fields if used directly in this component
  // For now, only 'id' and 'name' are explicitly used by TaskFormModal or general context
}
// --- End of types ---

interface TasksTabContentProps {
  tasks: TaskItem[]
  isLoadingTasks: boolean
  handleCreateTask: (taskData: { title: string; description?: string }) => Promise<void> // Adjusted for async
  project: ProjectDetails // Ensure this has at least 'id' and 'name' for TaskFormModal
  lang: string
  t: (key: string, params?: any) => string
  isTaskModalOpen: boolean
  setIsTaskModalOpen: (isOpen: boolean) => void
}

const TasksTabContent: React.FC<TasksTabContentProps> = ({
  tasks,
  isLoadingTasks,
  handleCreateTask,
  project,
  lang,
  t,
  isTaskModalOpen,
  setIsTaskModalOpen,
}) => {
  // Function to get status badge styling (can be moved to a utility if shared)
  const getTaskStatusBadge = (status: string) => {
    const baseStyle = 'px-2 py-0.5 text-xs font-medium rounded-full'
    switch (status) {
      case 'todo':
        return `${baseStyle} bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200`
      case 'in_progress':
        return `${baseStyle} bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100`
      case 'completed':
        return `${baseStyle} bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100`
      case 'on_review':
        return `${baseStyle} bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100`
      default:
        return `${baseStyle} bg-gray-100 text-gray-600 dark:bg-gray-500 dark:text-gray-300`
    }
  }

  return (
    <motion.div
      key="tasks"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="py-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('tasksTab.title')}
        </h3>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors duration-150 shadow-sm hover:shadow"
        >
          {t('tasksTab.createTaskButton')}
        </button>
      </div>

      {isLoadingTasks ? (
        <div className="flex justify-center items-center py-10">
          <AnimatedLoadingIndicator size="medium" />
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <Link
                  href={`/${lang}/dashboard/tasks/${task.id}`}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <h4 className="text-md font-semibold mb-1">{task.title}</h4>
                </Link>
                <span className={getTaskStatusBadge(task.status)}>
                  {t(`tasksTab.status.${task.status}`, { defaultValue: task.status })}
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>
                  {t('tasksTab.created')}: {formatDate(task.createdAt, lang)}
                </span>
                {task.assignedTo && (
                  <span className="ml-2">
                    | {t('tasksTab.assignedTo')}: {task.assignedTo.name || task.assignedTo.email}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
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
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {t('tasksTab.noTasksTitle')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('tasksTab.noTasksDescription')}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('tasksTab.createTaskButton')}
            </button>
          </div>
        </div>
      )}

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projectId={project.id}
      />
    </motion.div>
  )
}

export default TasksTabContent
