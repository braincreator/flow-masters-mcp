'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { 
  Plus, 
  Search, 
  BarChart3, 
  Users, 
  Kanban, 
  FileText, 
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react'

export interface EmptyStateProps {
  variant: 'kanban' | 'list' | 'stats' | 'search' | 'general'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  icon?: React.ReactNode
  showAnimation?: boolean
}

const VARIANT_CONFIG = {
  kanban: {
    icon: Kanban,
    defaultTitle: 'tasks.emptyStates.kanban.title',
    defaultDescription: 'tasks.emptyStates.kanban.description',
    actionLabel: 'tasks.emptyStates.kanban.action',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    iconColor: 'text-blue-500',
  },
  list: {
    icon: FileText,
    defaultTitle: 'tasks.emptyStates.list.title',
    defaultDescription: 'tasks.emptyStates.list.description',
    actionLabel: 'tasks.emptyStates.list.action',
    bgColor: 'bg-gray-50 dark:bg-gray-900/10',
    iconColor: 'text-gray-500',
  },
  stats: {
    icon: TrendingUp,
    defaultTitle: 'tasks.emptyStates.stats.title',
    defaultDescription: 'tasks.emptyStates.stats.description',
    actionLabel: 'tasks.emptyStates.stats.action',
    bgColor: 'bg-green-50 dark:bg-green-900/10',
    iconColor: 'text-green-500',
  },
  search: {
    icon: Search,
    defaultTitle: 'tasks.emptyStates.search.title',
    defaultDescription: 'tasks.emptyStates.search.description',
    actionLabel: 'tasks.emptyStates.search.action',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
    iconColor: 'text-yellow-500',
  },
  general: {
    icon: Users,
    defaultTitle: 'tasks.emptyStates.general.title',
    defaultDescription: 'tasks.emptyStates.general.description',
    actionLabel: 'tasks.emptyStates.general.action',
    bgColor: 'bg-gray-50 dark:bg-gray-900/10',
    iconColor: 'text-gray-500',
  },
}

export function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  className,
  icon,
  showAnimation = true,
}: EmptyStateProps) {
  const t = useTranslations()
  const config = VARIANT_CONFIG[variant]
  const IconComponent = icon || config.icon

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20
      }
    },
    hover: {
      scale: 1.1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    }
  }

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700',
        config.bgColor,
        'min-h-[300px]',
        className
      )}
      variants={showAnimation ? containerVariants : undefined}
      initial={showAnimation ? 'hidden' : undefined}
      animate={showAnimation ? 'visible' : undefined}
    >
      {/* Animated Icon */}
      <motion.div
        className={cn(
          'w-16 h-16 mb-6 rounded-full flex items-center justify-center',
          'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700'
        )}
        variants={showAnimation ? iconVariants : undefined}
        whileHover={showAnimation ? 'hover' : undefined}
      >
        <IconComponent className={cn('w-8 h-8', config.iconColor)} />
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-xl font-semibold text-gray-900 dark:text-white mb-3"
        variants={showAnimation ? itemVariants : undefined}
      >
        {title || t(config.defaultTitle)}
      </motion.h3>

      {/* Description */}
      <motion.p
        className="text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed"
        variants={showAnimation ? itemVariants : undefined}
      >
        {description || t(config.defaultDescription)}
      </motion.p>

      {/* Action Button */}
      {onAction && (
        <motion.div
          variants={showAnimation ? itemVariants : undefined}
        >
          <Button
            onClick={onAction}
            className="gap-2"
            size="lg"
          >
            <Plus className="w-4 h-4" />
            {actionLabel || t(config.actionLabel)}
          </Button>
        </motion.div>
      )}

      {/* Decorative Elements for Stats View */}
      {variant === 'stats' && (
        <motion.div
          className="mt-8 grid grid-cols-3 gap-4 opacity-30"
          variants={showAnimation ? itemVariants : undefined}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded bg-green-200 dark:bg-green-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded bg-red-200 dark:bg-red-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-xs text-gray-500">Overdue</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Specialized empty state components for specific use cases
export function KanbanEmptyState({ onCreateTask }: { onCreateTask?: () => void }) {
  return (
    <EmptyState
      variant="kanban"
      onAction={onCreateTask}
    />
  )
}

export function ListEmptyState({ onCreateTask }: { onCreateTask?: () => void }) {
  return (
    <EmptyState
      variant="list"
      onAction={onCreateTask}
    />
  )
}

export function StatsEmptyState({ onCreateTask }: { onCreateTask?: () => void }) {
  return (
    <EmptyState
      variant="stats"
      onAction={onCreateTask}
    />
  )
}

export function SearchEmptyState({ onClearSearch }: { onClearSearch?: () => void }) {
  return (
    <EmptyState
      variant="search"
      onAction={onClearSearch}
      actionLabel="Clear Search"
    />
  )
}
