import React, { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  Plus,
  Filter,
  SortAsc,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Calendar,
  Target,
  Users,
  BarChart3,
  List,
  Columns,
  Activity,
  GripVertical,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/utilities/formatDate'
import { cn } from '@/utilities/ui'
import { MilestonesProvider, useMilestones } from '@/providers/MilestonesProvider'
import { MilestoneFormModal } from '@/components/modals/MilestoneFormModal'

interface ProjectDetails {
  id: string
  name: string
  // Other necessary fields
}

interface MilestonesTabContentProps {
  project: ProjectDetails
  lang: string
}

// Enhanced Milestone Item Component
function MilestoneItem({
  milestone,
  onEdit,
  onDelete,
  onStatusChange,
  onMove,
}: {
  milestone: any
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: string) => void
  onMove: (direction: 'up' | 'down') => void
}) {
  const t = useTranslations('ProjectDetails.milestonesTab')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'overdue':
        return 'bg-red-500'
      case 'blocked':
        return 'bg-orange-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {/* Status Indicator */}
              <div
                className={cn(
                  'w-3 h-3 rounded-full mt-1.5 flex-shrink-0',
                  getStatusColor(milestone.status),
                )}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm truncate">{milestone.title}</h4>
                  <Badge variant={getPriorityVariant(milestone.priority)} className="text-xs">
                    {t(`priority.${milestone.priority}`)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {t(`status.${milestone.status}`)}
                  </Badge>
                </div>

                {milestone.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {milestone.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{t('progressLabel')}</span>
                    <span>{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                </div>

                {/* Dates */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {milestone.startDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(milestone.startDate)}</span>
                    </div>
                  )}
                  {milestone.dueDate && (
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{formatDate(milestone.dueDate)}</span>
                    </div>
                  )}
                  {milestone.associatedTasks && milestone.associatedTasks.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {milestone.associatedTasks.length} {t('associatedTasks')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMove('up')}
                className="h-8 w-8 p-0"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMove('down')}
                className="h-8 w-8 p-0"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('actions.edit')}
                  </DropdownMenuItem>
                  {milestone.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('actions.markComplete')}
                    </DropdownMenuItem>
                  )}
                  {milestone.status !== 'in_progress' && milestone.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => onStatusChange('in_progress')}>
                      <Clock className="mr-2 h-4 w-4" />
                      {t('actions.markInProgress')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('actions.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Main component implementation
function MilestonesContent({ project }: { project: ProjectDetails }) {
  const t = useTranslations('ProjectDetails.milestonesTab')
  const tCommon = useTranslations('common')
  const {
    filteredMilestones,
    isLoading,
    error,
    currentFilter,
    currentSorting,
    setFilter,
    setSorting,
    updateMilestoneStatus,
    moveMilestone,
    deleteMilestone,
    milestones,
  } = useMilestones()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'kanban'>('list')

  // Calculate progress statistics
  const progressStats = React.useMemo(() => {
    const total = milestones.length
    const completed = milestones.filter((m) => m.status === 'completed').length
    const inProgress = milestones.filter((m) => m.status === 'in_progress').length
    const overdue = milestones.filter((m) => m.status === 'overdue').length

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }, [milestones])

  const handleEditMilestone = (milestone: any) => {
    setEditingMilestone(milestone)
    setIsModalOpen(true)
  }

  const handleCreateMilestone = () => {
    setEditingMilestone(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingMilestone(null)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>{tCommon('tryAgain')}</Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Progress Overview */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{progressStats.completionRate}%</div>
            <div className="text-xs text-muted-foreground">{t('progress.overall')}</div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">{progressStats.completed}</div>
              <div className="text-muted-foreground">{t('progress.completed')}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{progressStats.inProgress}</div>
              <div className="text-muted-foreground">{t('progress.inProgress')}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{progressStats.overdue}</div>
              <div className="text-muted-foreground">{t('progress.overdue')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Filter */}
          <Select value={currentFilter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t('filters.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all')}</SelectItem>
              <SelectItem value="active">{t('filters.active')}</SelectItem>
              <SelectItem value="completed">{t('filters.completed')}</SelectItem>
              <SelectItem value="overdue">{t('filters.overdue')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={currentSorting} onValueChange={setSorting}>
            <SelectTrigger className="w-[180px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t('sorting.byOrder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="byOrder">{t('sorting.byOrder')}</SelectItem>
              <SelectItem value="byDueDate">{t('sorting.byDueDate')}</SelectItem>
              <SelectItem value="byPriority">{t('sorting.byPriority')}</SelectItem>
              <SelectItem value="byProgress">{t('sorting.byProgress')}</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Activity className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <Columns className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button onClick={handleCreateMilestone}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createMilestoneButton')}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMilestones.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredMilestones.map((milestone) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                onEdit={() => handleEditMilestone(milestone)}
                onDelete={() => {
                  if (confirm(t('form.deleteConfirm'))) {
                    deleteMilestone(milestone.id)
                  }
                }}
                onStatusChange={(status) => updateMilestoneStatus(milestone.id, status)}
                onMove={(direction) => moveMilestone(milestone.id, direction)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noMilestonesTitle')}</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {t('noMilestonesDescription')}
            </p>
            <Button onClick={handleCreateMilestone}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createMilestoneButton')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <MilestoneFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        projectId={project.id}
        milestone={editingMilestone}
      />
    </motion.div>
  )
}

const MilestonesTabContent: React.FC<MilestonesTabContentProps> = ({ project, lang }) => {
  return (
    <MilestonesProvider projectId={project.id}>
      <Suspense
        fallback={
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <MilestonesContent project={project} />
      </Suspense>
    </MilestonesProvider>
  )
}

export default MilestonesTabContent
