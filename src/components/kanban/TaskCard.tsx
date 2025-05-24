'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { TaskItem, TaskPriority } from '@/types/tasks'
import { cn } from '@/utilities/ui'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  MessageSquare,
  Paperclip,
  User,
} from 'lucide-react'
import { formatDate } from '@/utilities/formatDate'
import { useTranslations } from 'next-intl'

interface TaskCardProps {
  task: TaskItem
  onClick: () => void
  isDragging?: boolean
}

const getPriorityConfig = (
  t: any,
): Record<TaskPriority, { color: string; icon: React.ReactNode; label: string }> => ({
  low: {
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    icon: <Circle className="w-3 h-3" />,
    label: t('priority.low'),
  },
  medium: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    icon: <Circle className="w-3 h-3 fill-current" />,
    label: t('priority.medium'),
  },
  high: {
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    icon: <AlertTriangle className="w-3 h-3 fill-current" />,
    label: t('priority.high'),
  },
  urgent: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    icon: <AlertTriangle className="w-3 h-3 fill-current" />,
    label: t('priority.urgent'),
  },
})

export function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
  const t = useTranslations('tasks')
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  const priorityConfig = getPriorityConfig(t)[task.priority]
  const hasComments = task.comments && task.comments.length > 0
  const hasAttachments = task.attachments && task.attachments.length > 0

  const cardContent = (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer',
        'p-4 space-y-3',
        isDragging && 'shadow-lg rotate-3 scale-105',
        isSortableDragging && 'opacity-50',
        isOverdue && 'border-red-300 dark:border-red-700',
        task.status === 'completed' && 'opacity-75',
      )}
      onClick={onClick}
    >
      {/* Header with priority and status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge className={cn('text-xs px-2 py-1', priorityConfig.color)}>
            <span className="flex items-center gap-1">
              {priorityConfig.icon}
              {priorityConfig.label}
            </span>
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              {t('taskCard.overdue')}
            </Badge>
          )}
        </div>

        {task.status === 'completed' && (
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        )}
      </div>

      {/* Task title */}
      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight">
        {task.title}
      </h4>

      {/* Task description */}
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{task.description}</p>
      )}

      {/* Progress bar */}
      {task.progress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{t('taskCard.progress')}</span>
            <span>{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="h-1.5" />
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Footer with metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          {/* Due date */}
          {task.dueDate && (
            <div
              className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-red-500 dark:text-red-400',
              )}
            >
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate, 'en', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}

          {/* Estimated hours */}
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}

          {/* Comments count */}
          {hasComments && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments!.length}</span>
            </div>
          )}

          {/* Attachments count */}
          {hasAttachments && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments!.length}</span>
            </div>
          )}
        </div>

        {/* Assignee avatar */}
        {task.assignedTo && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate max-w-[80px]">
              {task.assignedTo.name || task.assignedTo.email.split('@')[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  if (isDragging) {
    return cardContent
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {cardContent}
    </div>
  )
}
