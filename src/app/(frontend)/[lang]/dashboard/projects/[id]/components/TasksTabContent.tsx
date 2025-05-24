import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  TaskItem,
  TaskDragResult,
  TasksResponse,
  CreateTaskRequest,
  TaskStats,
} from '@/types/tasks'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { TaskDetailModal } from '@/components/kanban/TaskDetailModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator'
import TaskFormModal from '@/components/modals/TaskFormModal'
import { formatDate } from '@/utilities/formatDate'
import {
  EmptyState,
  KanbanEmptyState,
  ListEmptyState,
  StatsEmptyState,
  SearchEmptyState,
} from '@/components/ui/empty-state'
import { isValidStatusTransition } from '@/utilities/taskStatusTransitions'
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

interface ProjectDetails {
  id: string
  name: string
  // Add other necessary ProjectDetails fields if used directly in this component
  // For now, only 'id' and 'name' are explicitly used by TaskFormModal or general context
}

interface TasksTabContentProps {
  tasks: TaskItem[]
  isLoadingTasks: boolean
  handleCreateTask: (taskData: CreateTaskRequest) => Promise<void>
  project: ProjectDetails
  lang: string
  t: (key: string, params?: any) => string
  isTaskModalOpen: boolean
  setIsTaskModalOpen: (isOpen: boolean) => void
}

// Helper function to calculate task statistics
function calculateTaskStats(tasks: TaskItem[]): TaskStats {
  const stats: TaskStats = {
    total: tasks.length,
    byStatus: {
      todo: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
    overdue: 0,
    completedThisWeek: 0,
    averageCompletionTime: 0,
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  let totalCompletionTime = 0
  let completedTasksCount = 0

  tasks.forEach((task) => {
    // Count by status
    stats.byStatus[task.status]++

    // Count by priority
    stats.byPriority[task.priority]++

    // Count overdue tasks
    if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed') {
      stats.overdue++
    }

    // Count completed this week
    if (task.status === 'completed' && task.completedAt && new Date(task.completedAt) > weekAgo) {
      stats.completedThisWeek++
    }

    // Calculate average completion time
    if (task.status === 'completed' && task.completedAt) {
      const completionTime =
        new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()
      totalCompletionTime += completionTime
      completedTasksCount++
    }
  })

  if (completedTasksCount > 0) {
    stats.averageCompletionTime = Math.round(
      totalCompletionTime / completedTasksCount / (1000 * 60 * 60 * 24),
    ) // in days
  }

  return stats
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
  const tTasks = useTranslations('tasks')
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'stats'>('kanban')
  const [tasksData, setTasksData] = useState<TasksResponse | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch tasks with stats
  const fetchTasks = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch(`/api/tasks?projectId=${project.id}`)
      if (response.ok) {
        const data: TasksResponse = await response.json()
        setTasksData(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [project.id])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Filter tasks based on search query - use tasksData.tasks as the primary source
  const currentTasks = tasksData?.tasks || []
  const filteredTasks = currentTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleTaskClick = useCallback((task: TaskItem) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }, [])

  const handleTaskUpdate = useCallback(
    async (taskId: string, updates: Partial<TaskItem>) => {
      try {
        // Optimistic update - update local state immediately
        setTasksData((prev) => {
          if (!prev) return prev
          const updatedTasks = prev.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task,
          )
          return {
            ...prev,
            tasks: updatedTasks,
            stats: calculateTaskStats(updatedTasks),
          }
        })

        // Update selected task if it's the one being updated
        if (selectedTask?.id === taskId) {
          setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null))
        }

        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          // Revert optimistic update on failure
          await fetchTasks()
          throw new Error('Failed to update task')
        }
      } catch (error) {
        console.error('Failed to update task:', error)
        // Refresh from server to ensure consistency
        await fetchTasks()
        throw error
      }
    },
    [fetchTasks, selectedTask],
  )

  const handleTaskMove = useCallback(
    async (result: TaskDragResult) => {
      if (!result.destination) return

      const { taskId, source, destination } = result

      // If moving to a different status, update the task
      if (source.status !== destination.status) {
        await handleTaskUpdate(taskId, { status: destination.status })
      }
    },
    [handleTaskUpdate],
  )

  const handleTaskDelete = useCallback(
    async (taskId: string) => {
      try {
        // Optimistic update - remove task from local state immediately
        setTasksData((prev) => {
          if (!prev) return prev
          const updatedTasks = prev.tasks.filter((task) => task.id !== taskId)
          return {
            ...prev,
            tasks: updatedTasks,
            stats: calculateTaskStats(updatedTasks),
          }
        })

        setIsTaskDetailOpen(false)
        setSelectedTask(null)

        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          // Revert optimistic update on failure
          await fetchTasks()
          throw new Error('Failed to delete task')
        }
      } catch (error) {
        console.error('Failed to delete task:', error)
        // Refresh from server to ensure consistency
        await fetchTasks()
        throw error
      }
    },
    [fetchTasks],
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 space-y-4">
        {/* Top Row - Title and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('tasksTab.title')}
            </h3>
            {tasksData?.stats && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-medium">
                  {tasksData.stats.total} {tTasks('stats.total').toLowerCase()}
                </Badge>
                {tasksData.stats.overdue > 0 && (
                  <Badge variant="destructive" className="text-xs font-medium">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {tasksData.stats.overdue} {tTasks('stats.overdue').toLowerCase()}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={() => setIsTaskModalOpen(true)}
            size="default"
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('tasksTab.createTaskButton')}
          </Button>
        </div>

        {/* Bottom Row - Search and View Toggle */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={tTasks('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveView('kanban')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                activeView === 'kanban'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50',
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{tTasks('views.kanban')}</span>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                activeView === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50',
              )}
            >
              <Users className="w-4 h-4" />
              <span>{tTasks('views.list')}</span>
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                activeView === 'stats'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50',
              )}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{tTasks('views.stats')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'kanban' && (
          <div className="h-full">
            {!tasksData && (isLoadingTasks || isRefreshing) ? (
              <div className="flex justify-center items-center h-64">
                <AnimatedLoadingIndicator size="medium" />
              </div>
            ) : filteredTasks.length === 0 && searchQuery ? (
              <div className="h-full flex flex-col">
                <div className="mb-4">
                  <SearchEmptyState onClearSearch={() => setSearchQuery('')} />
                </div>
                <KanbanBoard
                  tasks={[]}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskMove={handleTaskMove}
                  onTaskClick={handleTaskClick}
                  onCreateTask={() => setIsTaskModalOpen(true)}
                  isLoading={isRefreshing}
                  className="flex-1"
                />
              </div>
            ) : (
              <KanbanBoard
                tasks={filteredTasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskMove={handleTaskMove}
                onTaskClick={handleTaskClick}
                onCreateTask={() => setIsTaskModalOpen(true)}
                isLoading={isRefreshing}
                className="h-full"
              />
            )}
          </div>
        )}

        {activeView === 'list' && (
          <div className="space-y-4 h-full overflow-y-auto p-1">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
                  onClick={() => handleTaskClick(task)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-6 text-xs text-gray-500">
                          {task.dueDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </span>
                          )}
                          {task.assignedTo && (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">
                                {task.assignedTo.name || task.assignedTo.email}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 ml-4">
                        <Badge
                          className={cn(
                            'text-xs font-medium px-2.5 py-1',
                            task.priority === 'urgent' &&
                              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                            task.priority === 'high' &&
                              'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                            task.priority === 'medium' &&
                              'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                            task.priority === 'low' &&
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                          )}
                        >
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                        <Badge
                          className={cn(
                            'text-xs font-medium px-2.5 py-1',
                            task.status === 'completed' &&
                              'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                            task.status === 'in_progress' &&
                              'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                            task.status === 'review' &&
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                            task.status === 'todo' &&
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                          )}
                        >
                          {task.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : searchQuery ? (
              <SearchEmptyState onClearSearch={() => setSearchQuery('')} />
            ) : (
              <ListEmptyState onCreateTask={() => setIsTaskModalOpen(true)} />
            )}
          </div>
        )}

        {activeView === 'stats' && (
          <div className="h-full">
            {tasksData?.stats && tasksData.stats.total > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-1">
                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tTasks('stats.total')}
                    </CardTitle>
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {tasksData.stats.total}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {tTasks('stats.allProjectTasks')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tTasks('stats.completed')}
                    </CardTitle>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {tasksData.stats.byStatus.completed}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {tasksData.stats.completedThisWeek} {tTasks('stats.completedThisWeek')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tTasks('stats.inProgress')}
                    </CardTitle>
                    <Clock className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {tasksData.stats.byStatus.in_progress}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {tTasks('stats.currentlyActive')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tTasks('stats.overdue')}
                    </CardTitle>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {tasksData.stats.overdue}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {tTasks('stats.needAttention')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : !tasksData && (isLoadingTasks || isRefreshing) ? (
              <div className="flex justify-center items-center h-64">
                <AnimatedLoadingIndicator size="medium" />
              </div>
            ) : (
              <StatsEmptyState onCreateTask={() => setIsTaskModalOpen(true)} />
            )}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => {
          setIsTaskDetailOpen(false)
          setSelectedTask(null)
        }}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />

      {/* Task Creation Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projectId={project.id}
      />
    </div>
  )
}

export default TasksTabContent
