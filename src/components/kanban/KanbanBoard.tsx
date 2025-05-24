'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskItem, TaskStatus, KanbanColumn, TaskDragResult } from '@/types/tasks'
import { KanbanColumnComponent } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/ui'
import { isValidStatusTransition } from '@/utilities/taskStatusTransitions'
import { toast } from 'sonner'

interface KanbanBoardProps {
  tasks: TaskItem[]
  onTaskUpdate: (taskId: string, updates: Partial<TaskItem>) => Promise<void>
  onTaskMove: (result: TaskDragResult) => Promise<void>
  onTaskClick: (task: TaskItem) => void
  onCreateTask?: () => void
  isLoading?: boolean
  className?: string
}

const COLUMN_DEFINITIONS: Record<TaskStatus, { title: string; color: string; limit?: number }> = {
  todo: {
    title: 'tasks.kanban.columns.todo.title',
    color: 'bg-gray-100 dark:bg-gray-800',
    limit: undefined,
  },
  in_progress: {
    title: 'tasks.kanban.columns.in_progress.title',
    color: 'bg-blue-50 dark:bg-blue-900/20',
    limit: 3, // WIP limit
  },
  review: {
    title: 'tasks.kanban.columns.review.title',
    color: 'bg-yellow-50 dark:bg-yellow-900/20',
    limit: 2,
  },
  completed: {
    title: 'tasks.kanban.columns.completed.title',
    color: 'bg-green-50 dark:bg-green-900/20',
    limit: undefined,
  },
}

export function KanbanBoard({
  tasks,
  onTaskUpdate,
  onTaskMove,
  onTaskClick,
  onCreateTask,
  isLoading = false,
  className,
}: KanbanBoardProps) {
  const t = useTranslations()
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState<TaskStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Group tasks by status
  const columns: KanbanColumn[] = useMemo(() => {
    const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'completed']

    return statusOrder.map((status) => {
      const columnTasks = tasks.filter((task) => task.status === status)
      const definition = COLUMN_DEFINITIONS[status]

      return {
        id: status,
        title: t(definition.title),
        color: definition.color,
        limit: definition.limit,
        tasks: columnTasks,
      }
    })
  }, [tasks, t])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const task = tasks.find((t) => t.id === active.id)
      setActiveTask(task || null)
    },
    [tasks],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event
      if (over) {
        const overId = over.id as string
        // Check if we're over a column
        if (Object.keys(COLUMN_DEFINITIONS).includes(overId)) {
          setDraggedOverColumn(overId as TaskStatus)
        } else {
          // We're over a task, find its column
          const task = tasks.find((t) => t.id === overId)
          if (task) {
            setDraggedOverColumn(task.status)
          }
        }
      } else {
        setDraggedOverColumn(null)
      }
    },
    [tasks],
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event

      setActiveTask(null)
      setDraggedOverColumn(null)

      if (!over || !activeTask) return

      const activeTaskId = active.id as string
      const overId = over.id as string

      // Find source task and its current position
      const sourceTask = tasks.find((t) => t.id === activeTaskId)
      if (!sourceTask) return

      const sourceStatus = sourceTask.status
      const sourceIndex = tasks
        .filter((t) => t.status === sourceStatus)
        .findIndex((t) => t.id === activeTaskId)

      let destinationStatus: TaskStatus
      let destinationIndex: number

      // Determine if we're dropping on a column or a task
      if (Object.keys(COLUMN_DEFINITIONS).includes(overId)) {
        // Dropping on a column
        destinationStatus = overId as TaskStatus
        destinationIndex = tasks.filter((t) => t.status === destinationStatus).length
      } else {
        // Dropping on a task
        const overTask = tasks.find((t) => t.id === overId)
        if (!overTask) return

        destinationStatus = overTask.status
        destinationIndex = tasks
          .filter((t) => t.status === destinationStatus)
          .findIndex((t) => t.id === overId)
      }

      // If nothing changed, return
      if (sourceStatus === destinationStatus && sourceIndex === destinationIndex) {
        return
      }

      // Validate status transition
      if (
        sourceStatus !== destinationStatus &&
        !isValidStatusTransition(sourceStatus, destinationStatus)
      ) {
        toast.error(t('tasks.statusTransitions.invalidTransition'), {
          description: t('tasks.statusTransitions.invalidTransitionMessage'),
        })
        return
      }

      // Check WIP limits
      const destinationColumn = COLUMN_DEFINITIONS[destinationStatus]
      if (destinationColumn.limit && sourceStatus !== destinationStatus) {
        const currentTasksInDestination = tasks.filter((t) => t.status === destinationStatus).length
        if (currentTasksInDestination >= destinationColumn.limit) {
          toast.error(t('tasks.statusTransitions.wipLimitReached'), {
            description: t('tasks.statusTransitions.wipLimitMessage'),
          })
          return
        }
      }

      try {
        // Call the move handler
        await onTaskMove({
          taskId: activeTaskId,
          sourceStatus,
          destinationStatus,
          sourceIndex,
          destinationIndex,
        })

        // If status changed, update the task
        if (sourceStatus !== destinationStatus) {
          await onTaskUpdate(activeTaskId, { status: destinationStatus })
        }
      } catch (error) {
        console.error('Failed to move task:', error)
        toast.error('Failed to move task', {
          description: 'There was an error moving the task. Please try again.',
        })
      }
    },
    [activeTask, tasks, onTaskMove, onTaskUpdate],
  )

  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
          'border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm',
          'p-6 h-full overflow-hidden',
          className,
        )}
      >
        {/* Loading Board Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Loading Board Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-[calc(100%-5rem)] overflow-hidden">
          <div className="flex gap-1 h-full overflow-x-auto p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-80">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 h-full animate-pulse">
                  {/* Column header skeleton */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-500 rounded"></div>
                        <div className="h-5 w-8 bg-gray-300 dark:bg-gray-500 rounded"></div>
                      </div>
                    </div>
                  </div>
                  {/* Column content skeleton */}
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, cardIndex) => (
                      <div
                        key={cardIndex}
                        className="h-24 bg-gray-200 dark:bg-gray-600 rounded-lg"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Unified Board Container */}
      <div
        className={cn(
          'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
          'border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm',
          'p-6 h-full overflow-hidden',
          className,
        )}
      >
        {/* Board Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('tasks.kanban.boardTitle', { default: 'Task Board' })}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('tasks.kanban.totalTasks', {
                  count: tasks.length,
                  default: `${tasks.length} tasks`,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Board Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-[calc(100%-5rem)] overflow-hidden">
          {/* Column Container */}
          <div className="flex gap-1 h-full overflow-x-auto p-4">
            <AnimatePresence>
              {columns.map((column, index) => (
                <motion.div
                  key={column.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex-shrink-0"
                >
                  <KanbanColumnComponent
                    column={column}
                    onTaskClick={onTaskClick}
                    onCreateTask={onCreateTask}
                    isDraggedOver={draggedOverColumn === column.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90 scale-105">
            <TaskCard task={activeTask} onClick={() => {}} isDragging={true} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
