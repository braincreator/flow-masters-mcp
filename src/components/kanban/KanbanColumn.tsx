'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { KanbanColumn, TaskItem } from '@/types/tasks'
import { TaskCard } from './TaskCard'
import { cn } from '@/utilities/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Plus, Circle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface KanbanColumnProps {
  column: KanbanColumn
  onTaskClick: (task: TaskItem) => void
  onCreateTask?: () => void
  isDraggedOver?: boolean
}

export function KanbanColumnComponent({
  column,
  onTaskClick,
  onCreateTask,
  isDraggedOver = false,
}: KanbanColumnProps) {
  const t = useTranslations()
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const isOverLimit = column.limit && column.tasks.length >= column.limit
  const taskIds = column.tasks.map((task) => task.id)

  return (
    <div className="w-80 flex flex-col h-full mx-2 first:ml-0 last:mr-0">
      {/* Column Container with unified styling */}
      <div
        className={cn(
          'bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600',
          'shadow-sm h-full flex flex-col transition-all duration-200',
          isDraggedOver &&
            'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20 border-blue-300',
          isOver &&
            'ring-2 ring-green-500 ring-opacity-50 bg-green-50 dark:bg-green-900/20 border-green-300',
        )}
      >
        {/* Column Header - Fixed height */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-t-lg min-h-[72px]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Status indicator dot */}
            <div
              className={cn(
                'w-3 h-3 rounded-full flex-shrink-0',
                column.id === 'todo' && 'bg-gray-400',
                column.id === 'in_progress' && 'bg-blue-500',
                column.id === 'review' && 'bg-yellow-500',
                column.id === 'completed' && 'bg-green-500',
              )}
            />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex-shrink-0">
              {column.title}
            </h3>
            <Badge
              variant="secondary"
              className={cn(
                'text-xs font-medium px-2 py-1 flex-shrink-0',
                column.tasks.length > 0
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
              )}
            >
              {column.tasks.length}
              {column.limit && `/${column.limit}`}
            </Badge>
            {isOverLimit && (
              <AlertTriangle
                className="w-4 h-4 text-amber-500 flex-shrink-0"
                title={t('tasks.statusTransitions.wipLimitReached')}
              />
            )}
          </div>

          {/* Action button area - always reserve space */}
          <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
            {onCreateTask && column.id === 'todo' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCreateTask}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={t('tasks.createTaskButton')}
              >
                <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </Button>
            )}
          </div>
        </div>

        {/* Column Content */}
        <div
          ref={setNodeRef}
          className={cn(
            'flex-1 p-4 space-y-3 overflow-y-auto rounded-b-lg',
            'bg-white dark:bg-gray-800',
            'min-h-[200px]',
            isDraggedOver && 'bg-blue-50 dark:bg-blue-900/10',
            isOver && 'bg-green-50 dark:bg-green-900/10',
          )}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {column.tasks.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center min-h-[200px] text-gray-500 dark:text-gray-400 text-sm py-8 px-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center space-y-4 w-full">
                  <motion.div
                    className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                    whileHover={{ scale: 1.05, borderColor: '#3b82f6' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <Circle className="w-8 h-8 text-gray-400" />
                  </motion.div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t(`tasks.kanban.columns.${column.id}.emptyMessage`)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                      {t(`tasks.kanban.columns.${column.id}.emptyDescription`)}
                    </p>
                  </div>

                  {onCreateTask && column.id === 'todo' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCreateTask}
                      className="h-8 px-3 text-xs gap-2 border-dashed hover:border-solid hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    >
                      <Plus className="w-3 h-3" />
                      {t('tasks.createTaskButton')}
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              column.tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <TaskCard task={task} onClick={() => onTaskClick(task)} />
                </motion.div>
              ))
            )}
          </SortableContext>
        </div>

        {/* WIP Limit Warning */}
        {isOverLimit && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 rounded-b-lg">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>
                {t('tasks.statusTransitions.wipLimitReached')} ({column.limit})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
