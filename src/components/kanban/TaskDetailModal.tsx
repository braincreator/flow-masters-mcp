'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { TaskItem, TaskPriority, TaskStatus, TaskFormData } from '@/types/tasks'
import { ModalDialog } from '@/components/ui/modal-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utilities/ui'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Tag, 
  AlertTriangle, 
  CheckCircle2, 
  Edit2, 
  Save, 
  X,
  MessageSquare,
  Paperclip,
  Activity,
  Trash2
} from 'lucide-react'
import { formatDate } from '@/utilities/formatDate'

interface TaskDetailModalProps {
  task: TaskItem | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (taskId: string, updates: Partial<TaskItem>) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  projectUsers?: Array<{ id: string; name?: string; email: string }>
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-blue-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
]

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: 'text-gray-600' },
  { value: 'in_progress', label: 'In Progress', color: 'text-blue-600' },
  { value: 'review', label: 'Review', color: 'text-yellow-600' },
  { value: 'completed', label: 'Completed', color: 'text-green-600' },
]

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  projectUsers = [],
}: TaskDetailModalProps) {
  const t = useTranslations()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    tags: [],
    estimatedHours: 0,
  })
  const [newComment, setNewComment] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || '',
        assignedTo: task.assignedTo?.id || '',
        tags: task.tags || [],
        estimatedHours: task.estimatedHours || 0,
      })
      setSelectedDate(task.dueDate ? new Date(task.dueDate) : undefined)
    }
  }, [task])

  const handleSave = async () => {
    if (!task) return

    setIsLoading(true)
    try {
      const updates: Partial<TaskItem> = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: selectedDate?.toISOString(),
        tags: formData.tags,
        estimatedHours: formData.estimatedHours,
      }

      if (formData.assignedTo) {
        const assignedUser = projectUsers.find(u => u.id === formData.assignedTo)
        if (assignedUser) {
          updates.assignedTo = assignedUser
        }
      }

      await onUpdate(task.id, updates)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task || !onDelete) return

    if (confirm(t('tasks.confirmDelete'))) {
      setIsLoading(true)
      try {
        await onDelete(task.id)
        onClose()
      } catch (error) {
        console.error('Failed to delete task:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleProgressUpdate = async (progress: number) => {
    if (!task) return

    try {
      await onUpdate(task.id, { progress })
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'

  if (!task) return null

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {task.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          {isOverdue && <AlertTriangle className="w-5 h-5 text-red-500" />}
          <span className="truncate">{task.title}</span>
        </div>
      }
      size="xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge className={cn(
              'text-xs',
              PRIORITY_OPTIONS.find(p => p.value === task.priority)?.color
            )}>
              {PRIORITY_OPTIONS.find(p => p.value === task.priority)?.label}
            </Badge>
            <Badge className={cn(
              'text-xs',
              STATUS_OPTIONS.find(s => s.value === task.status)?.color
            )}>
              {STATUS_OPTIONS.find(s => s.value === task.status)?.label}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="details" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">
                Comments {task.comments?.length ? `(${task.comments.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="attachments">
                Files {task.attachments?.length ? `(${task.attachments.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                {isEditing ? (
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task title"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{task.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {task.description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Progress</label>
                  <span className="text-sm text-gray-500">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
                {isEditing && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={task.progress}
                    onChange={(e) => handleProgressUpdate(Number(e.target.value))}
                    className="w-full"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  {isEditing ? (
                    <Select
                      value={formData.status}
                      onValueChange={(value: TaskStatus) => 
                        setFormData(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className={option.color}>{option.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className={STATUS_OPTIONS.find(s => s.value === task.status)?.color}>
                      {STATUS_OPTIONS.find(s => s.value === task.status)?.label}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  {isEditing ? (
                    <Select
                      value={formData.priority}
                      onValueChange={(value: TaskPriority) => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className={option.color}>{option.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className={PRIORITY_OPTIONS.find(p => p.value === task.priority)?.color}>
                      {PRIORITY_OPTIONS.find(p => p.value === task.priority)?.label}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !selectedDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? formatDate(selectedDate.toISOString(), 'en') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className={cn(
                      'flex items-center gap-2',
                      isOverdue && 'text-red-500'
                    )}>
                      <CalendarIcon className="w-4 h-4" />
                      {task.dueDate ? formatDate(task.dueDate, 'en') : 'No due date'}
                    </p>
                  )}
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignee</label>
                  {isEditing ? (
                    <Select
                      value={formData.assignedTo}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, assignedTo: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {projectUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {task.assignedTo ? 
                        (task.assignedTo.name || task.assignedTo.email) : 
                        'Unassigned'
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Estimated Hours */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Hours</label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      estimatedHours: Number(e.target.value) 
                    }))}
                    placeholder="0"
                  />
                ) : (
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {task.estimatedHours ? `${task.estimatedHours} hours` : 'Not estimated'}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {task.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  )) || <span className="text-gray-500 text-sm">No tags</span>}
                </div>
              </div>

              {/* Timestamps */}
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Created:</span> {formatDate(task.createdAt, 'en')}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {formatDate(task.updatedAt, 'en')}
                </div>
                {task.completedAt && (
                  <div className="col-span-2">
                    <span className="font-medium">Completed:</span> {formatDate(task.completedAt, 'en')}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4 mt-6">
              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <Button 
                  size="sm" 
                  disabled={!newComment.trim()}
                  onClick={() => {
                    // TODO: Implement add comment
                    setNewComment('')
                  }}
                >
                  Add Comment
                </Button>
              </div>

              <Separator />

              {/* Comments List */}
              <div className="space-y-4">
                {task.comments?.length ? (
                  task.comments.map(comment => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{comment.author.name || comment.author.email}</span>
                        <span className="text-gray-500">{formatDate(comment.createdAt, 'en')}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No comments yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4 mt-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Drag files here or click to upload</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Choose Files
                </Button>
              </div>

              {/* Attachments List */}
              <div className="space-y-2">
                {task.attachments?.length ? (
                  task.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{attachment.filename}</p>
                          <p className="text-sm text-gray-500">
                            {(attachment.size / 1024).toFixed(1)} KB • 
                            Uploaded by {attachment.uploadedBy.name || attachment.uploadedBy.email}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No attachments</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-6">
              <div className="space-y-4">
                {task.activities?.length ? (
                  task.activities.map(activity => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.author.name || activity.author.email}</span>
                          {' '}{activity.description}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(activity.createdAt, 'en')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No activity yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ModalDialog>
  )
}
