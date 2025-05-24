'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { KanbanColumn, TaskItem } from '@/types/tasks'
import { TaskCard } from './TaskCard'
import { cn } from '@/utilities/ui'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Plus } from 'lucide-react'

interface KanbanColumnProps {
  column: KanbanColumn
  onTaskClick: (task: TaskItem) => void
  isDraggedOver?: boolean
}

export function KanbanColumnComponent({
  column,
  onTaskClick,
  isDraggedOver = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const isOverLimit = column.limit && column.tasks.length >= column.limit
  const taskIds = column.tasks.map(task => task.id)

  return (
    <div className="w-80 flex flex-col h-full">
      {/* Column Header */}
      <div className={cn(
        'flex items-center justify-between p-4 rounded-t-lg border-b',
        column.color,
        isDraggedOver && 'ring-2 ring-blue-500 ring-opacity-50',
        isOver && 'ring-2 ring-green-500 ring-opacity-50'
      )}>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {column.title}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {column.tasks.length}
            {column.limit && `/${column.limit}`}
          </Badge>
          {isOverLimit && (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          )}
        </div>
        
        <button
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Add task"
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-4 space-y-3 overflow-y-auto rounded-b-lg',
          column.color,
          'min-h-[200px]',
          isDraggedOver && 'bg-opacity-70',
          isOver && 'bg-green-50 dark:bg-green-900/10'
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 opacity-50">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                No tasks
              </div>
            </div>
          ) : (
            column.tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <TaskCard
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
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
            <span>WIP limit reached ({column.limit})</span>
          </div>
        </div>
      )}
    </div>
  )
}
