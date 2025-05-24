import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { TaskItem, TaskDragResult, TasksResponse, CreateTaskRequest } from '@/types/tasks'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { TaskDetailModal } from '@/components/kanban/TaskDetailModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator'
import TaskFormModal from '@/components/modals/TaskFormModal'
import { formatDate } from '@/utilities/formatDate'
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
  TrendingUp
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

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTaskClick = useCallback((task: TaskItem) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }, [])

  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<TaskItem>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      
      if (response.ok) {
        // Refresh tasks to get updated data
        await fetchTasks()
        // Update selected task if it's the one being updated
        if (selectedTask?.id === taskId) {
          setSelectedTask(prev => prev ? { ...prev, ...updates } : null)
        }
      } else {
        throw new Error('Failed to update task')
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }, [fetchTasks, selectedTask])

  const handleTaskMove = useCallback(async (result: TaskDragResult) => {
    // Optimistic update - move task immediately in UI
    // The actual update will be handled by handleTaskUpdate
    console.log('Task moved:', result)
  }, [])

  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchTasks()
        setIsTaskDetailOpen(false)
        setSelectedTask(null)
      } else {
        throw new Error('Failed to delete task')
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  }, [fetchTasks])

  return (
    <motion.div
      key="tasks"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t('tasksTab.title')}
            </h3>
            {tasksData?.stats && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {tasksData.stats.total} total
                </Badge>
                {tasksData.stats.overdue > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {tasksData.stats.overdue} overdue
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Search and Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          {/* View Toggle */}
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="kanban" className="text-xs">
                <BarChart3 className="w-4 h-4 mr-1" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs">
                <Users className="w-4 h-4 mr-1" />
                List
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">
                <TrendingUp className="w-4 h-4 mr-1" />
                Stats
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={() => setIsTaskModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            {t('tasksTab.createTaskButton')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeView} className="h-full">
          <TabsContent value="kanban" className="h-full mt-0">
            {isLoadingTasks ? (
              <div className="flex justify-center items-center h-64">
                <AnimatedLoadingIndicator size="medium" />
              </div>
            ) : (
              <KanbanBoard
                tasks={filteredTasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskMove={handleTaskMove}
                onTaskClick={handleTaskClick}
                isLoading={isRefreshing}
                className="h-full"
              />
            )}
          </TabsContent>
          
          <TabsContent value="list" className="h-full mt-0">
            <div className="space-y-4 h-full overflow-y-auto">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleTaskClick(task)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {task.assignedTo && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {task.assignedTo.name || task.assignedTo.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={cn(
                            'text-xs',
                            task.priority === 'urgent' && 'bg-red-100 text-red-700',
                            task.priority === 'high' && 'bg-orange-100 text-orange-700',
                            task.priority === 'medium' && 'bg-blue-100 text-blue-700',
                            task.priority === 'low' && 'bg-gray-100 text-gray-700'
                          )}>
                            {task.priority}
                          </Badge>
                          <Badge className={cn(
                            'text-xs',
                            task.status === 'completed' && 'bg-green-100 text-green-700',
                            task.status === 'in_progress' && 'bg-blue-100 text-blue-700',
                            task.status === 'review' && 'bg-yellow-100 text-yellow-700',
                            task.status === 'todo' && 'bg-gray-100 text-gray-700'
                          )}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No tasks found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'Try adjusting your search criteria' : 'Create your first task to get started'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="h-full mt-0">
            {tasksData?.stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tasksData.stats.total}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tasksData.stats.byStatus.completed}</div>
                    <p className="text-xs text-muted-foreground">
                      {tasksData.stats.completedThisWeek} this week
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tasksData.stats.byStatus.in_progress}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{tasksData.stats.overdue}</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <AnimatedLoadingIndicator size="medium" />
              </div>
            )}
          </TabsContent>
        </Tabs>
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
    </motion.div>
  )
}

export default TasksTabContent
