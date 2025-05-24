'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { CalendarIcon, X, Loader2, AlertCircle, User, Tag, Clock } from 'lucide-react'

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

// Types
import {
  TaskItem,
  TaskStatus,
  TaskPriority,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@/types/tasks'
import { cn } from '@/utilities/ui'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (taskData: CreateTaskRequest) => Promise<void>
  onUpdate?: (taskId: string, updates: UpdateTaskRequest) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  initialData?: TaskItem | null
  projectId: string
  projectUsers?: Array<{ id: string; name: string; email: string }>
  mode?: 'create' | 'edit'
}

// Validation schema
const createTaskFormSchema = (t: (key: string) => string) =>
  z.object({
    title: z
      .string()
      .min(3, t('validation.titleMinLength'))
      .max(100, t('validation.titleMaxLength')),
    description: z.string().max(1000, t('validation.descriptionMaxLength')).optional(),
    status: z.enum(['todo', 'in_progress', 'review', 'completed'] as const),
    priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
    dueDate: z.date().optional(),
    assignedTo: z.string().optional(),
    tags: z.array(z.string()).optional(),
    estimatedHours: z
      .number()
      .min(0, t('validation.estimatedHoursMin'))
      .max(1000, t('validation.estimatedHoursMax'))
      .optional(),
  })

type TaskFormData = z.infer<ReturnType<typeof createTaskFormSchema>>

// Status options
const statusOptions: { value: TaskStatus; labelKey: string }[] = [
  { value: 'todo', labelKey: 'status.todo' },
  { value: 'in_progress', labelKey: 'status.in_progress' },
  { value: 'review', labelKey: 'status.review' },
  { value: 'completed', labelKey: 'status.completed' },
]

// Priority options
const priorityOptions: { value: TaskPriority; labelKey: string; color: string }[] = [
  { value: 'low', labelKey: 'priority.low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', labelKey: 'priority.medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', labelKey: 'priority.high', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', labelKey: 'priority.urgent', color: 'bg-red-100 text-red-800' },
]

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  initialData = null,
  projectId,
  projectUsers = [],
  mode = initialData ? 'edit' : 'create',
}) => {
  const t = useTranslations('TaskForm')
  const tTasks = useTranslations('tasks')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tagInput, setTagInput] = useState('')

  // Form schema with translations
  const formSchema = createTaskFormSchema(t)

  // Initialize form
  const form = useForm<TaskFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: undefined,
      assignedTo: 'unassigned',
      tags: [],
      estimatedHours: undefined,
    },
  })

  // Reset form when modal opens/closes or data changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        form.reset({
          title: initialData.title || '',
          description: initialData.description || '',
          status: initialData.status || 'todo',
          priority: initialData.priority || 'medium',
          dueDate: initialData.dueDate ? new Date(initialData.dueDate) : undefined,
          assignedTo: initialData.assignedTo?.id || 'unassigned',
          tags: initialData.tags || [],
          estimatedHours: initialData.estimatedHours || undefined,
        })
      } else {
        form.reset({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: undefined,
          assignedTo: 'unassigned',
          tags: [],
          estimatedHours: undefined,
        })
      }
    }
  }, [isOpen, initialData, mode, form])

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: TaskFormData) => {
      try {
        setIsSubmitting(true)

        if (mode === 'edit' && initialData && onUpdate) {
          const updateData: UpdateTaskRequest = {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate?.toISOString(),
            assignedTo:
              data.assignedTo && data.assignedTo !== 'unassigned' ? data.assignedTo : undefined,
            tags: data.tags,
            estimatedHours: data.estimatedHours,
          }
          await onUpdate(initialData.id, updateData)
          toast.success(t('notifications.updateSuccess'))
        } else if (mode === 'create' && onSubmit) {
          const createData: CreateTaskRequest = {
            projectId,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate?.toISOString(),
            assignedTo:
              data.assignedTo && data.assignedTo !== 'unassigned' ? data.assignedTo : undefined,
            tags: data.tags,
            estimatedHours: data.estimatedHours,
          }
          await onSubmit(createData)
          toast.success(t('notifications.createSuccess'))
        }

        onClose()
      } catch (error) {
        console.error('Error submitting task:', error)
        const errorMessage =
          mode === 'edit' ? t('notifications.updateError') : t('notifications.createError')
        toast.error(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    },
    [mode, initialData, onUpdate, onSubmit, projectId, t, onClose],
  )

  // Handle task deletion
  const handleDelete = useCallback(async () => {
    if (!initialData || !onDelete) return

    try {
      setIsDeleting(true)
      await onDelete(initialData.id)
      toast.success(t('notifications.deleteSuccess'))
      onClose()
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error(t('notifications.deleteError'))
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }, [initialData, onDelete, t, onClose])

  // Handle tag addition
  const handleAddTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim()
      if (trimmedTag && !form.getValues('tags')?.includes(trimmedTag)) {
        const currentTags = form.getValues('tags') || []
        form.setValue('tags', [...currentTags, trimmedTag])
        setTagInput('')
      }
    },
    [form],
  )

  // Handle tag removal
  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const currentTags = form.getValues('tags') || []
      form.setValue(
        'tags',
        currentTags.filter((tag) => tag !== tagToRemove),
      )
    },
    [form],
  )

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      if (event.key === 'Escape') {
        onClose()
      } else if (event.ctrlKey && event.key === 'Enter') {
        form.handleSubmit(handleSubmit)()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, form, handleSubmit])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'edit' ? (
              <>
                <AlertCircle className="h-5 w-5" />
                {t('editTask')}
              </>
            ) : (
              <>
                <Tag className="h-5 w-5" />
                {t('createTask')}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? t('editTaskDescription') : t('createTaskDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {t('fields.title')}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.titlePlaceholder')} {...field} className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('fields.descriptionPlaceholder')}
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue
                            placeholder={t('fields.statusPlaceholder')}
                            className="text-foreground font-medium"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="data-[highlighted]:text-white"
                          >
                            {tTasks(option.labelKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority Field */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.priority')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue
                            placeholder={t('fields.priorityPlaceholder')}
                            className="text-foreground font-medium"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="data-[highlighted]:text-white"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={cn('text-xs font-medium border', option.color)}>
                                {tTasks(option.labelKey)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Due Date and Assignee Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date Field */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {t('fields.dueDate')}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-12 w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>{t('fields.dueDatePlaceholder')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assignee Field */}
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('fields.assignedTo')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value="unassigned"
                          className="data-[highlighted]:text-white data-[highlighted]:*:text-white"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                              <User className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            </div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                              {t('fields.unassigned')}
                            </span>
                          </div>
                        </SelectItem>
                        {projectUsers.map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id}
                            className="data-[highlighted]:text-white data-[highlighted]:*:text-white"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border">
                                <span className="text-xs font-medium text-primary">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags Field */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {t('fields.tags')}
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                        {field.value?.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                        <Input
                          placeholder={t('fields.tagsPlaceholder')}
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddTag(tagInput)
                            }
                          }}
                          className="border-none shadow-none focus-visible:ring-0 flex-1 min-w-[120px]"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>Press Enter to add tags</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estimated Hours Field */}
            <FormField
              control={form.control}
              name="estimatedHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('fields.estimatedHours')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('fields.estimatedHoursPlaceholder')}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="h-12"
                      min="0"
                      step="0.5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 pt-4 border-t">
              <div className="flex space-x-2">
                {mode === 'edit' && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting || isDeleting}
                    className="flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    {isDeleting ? t('actions.deleting') : t('actions.delete')}
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Tag className="h-4 w-4" />
                  )}
                  {isSubmitting ? t('actions.saving') : t('actions.save')}
                </Button>
              </div>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="text-xs text-muted-foreground text-center space-y-1 pt-2 border-t">
              <p>{t('shortcuts.save')}</p>
              <p>{t('shortcuts.cancel')}</p>
            </div>
          </form>
        </Form>

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-background p-6 rounded-lg shadow-lg max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <h3 className="text-lg font-semibold">{t('actions.delete')}</h3>
                </div>
                <p className="text-muted-foreground mb-6">{t('confirmDelete')}</p>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    {t('actions.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    {isDeleting ? t('actions.deleting') : t('actions.delete')}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default TaskFormModal
