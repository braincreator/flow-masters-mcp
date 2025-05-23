'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utilities/ui'
import { useMilestones, MilestoneItem, MilestoneFormData } from '@/providers/MilestonesProvider'

// Form validation schema
const milestoneFormSchema = z
  .object({
    title: z.string().min(3, 'titleMinLength').max(100),
    description: z.string().optional(),
    startDate: z.date().optional(),
    dueDate: z.date().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    dependencies: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.dueDate) {
        return data.dueDate >= data.startDate
      }
      return true
    },
    {
      message: 'dueDateAfterStart',
      path: ['dueDate'],
    },
  )

interface MilestoneFormModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  milestone?: MilestoneItem // For editing existing milestone
}

export function MilestoneFormModal({
  isOpen,
  onClose,
  projectId,
  milestone,
}: MilestoneFormModalProps) {
  const t = useTranslations('ProjectDetails.milestonesTab')
  const {
    createMilestone,
    updateMilestone,
    deleteMilestone,
    milestones,
    validateDependencies,
    isLoading,
  } = useMilestones()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEditing = !!milestone

  const form = useForm<z.infer<typeof milestoneFormSchema>>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      dependencies: [],
    },
  })

  // Reset form when modal opens/closes or milestone changes
  useEffect(() => {
    if (isOpen) {
      if (milestone) {
        form.reset({
          title: milestone.title,
          description: milestone.description || '',
          startDate: milestone.startDate ? new Date(milestone.startDate) : undefined,
          dueDate: milestone.dueDate ? new Date(milestone.dueDate) : undefined,
          priority: milestone.priority,
          dependencies: milestone.dependencies || [],
        })
      } else {
        form.reset({
          title: '',
          description: '',
          priority: 'medium',
          dependencies: [],
        })
      }
    }
  }, [isOpen, milestone, form])

  // Available milestones for dependencies (exclude current milestone)
  const availableDependencies = milestones.filter(
    (m) => m.id !== milestone?.id && m.status !== 'completed',
  )

  const onSubmit = async (values: z.infer<typeof milestoneFormSchema>) => {
    try {
      setIsSubmitting(true)

      // Validate dependencies for circular references
      if (values.dependencies && values.dependencies.length > 0) {
        const isValid = validateDependencies(milestone?.id || '', values.dependencies)
        if (!isValid) {
          form.setError('dependencies', {
            type: 'manual',
            message: t('form.validation.dependencyLoop'),
          })
          return
        }
      }

      const formData: MilestoneFormData = {
        title: values.title,
        description: values.description,
        startDate: values.startDate?.toISOString(),
        dueDate: values.dueDate?.toISOString(),
        priority: values.priority,
        dependencies: values.dependencies,
      }

      if (isEditing && milestone) {
        await updateMilestone(milestone.id, formData)
      } else {
        await createMilestone(projectId, formData)
      }

      onClose()
    } catch (error) {
      console.error('Error submitting milestone form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!milestone) return

    try {
      setIsSubmitting(true)
      await deleteMilestone(milestone.id)
      onClose()
    } catch (error) {
      console.error('Error deleting milestone:', error)
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setShowDeleteConfirm(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editMilestoneTitle') : t('createMilestoneTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('form.editDescription') : t('form.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.title')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.titlePlaceholder')}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('form.descriptionPlaceholder')}
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('form.startDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>{t('form.selectDate')}</span>
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
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('form.dueDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>{t('form.selectDate')}</span>
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
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.priority')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.selectPriority')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">{t('priority.low')}</SelectItem>
                      <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                      <SelectItem value="high">{t('priority.high')}</SelectItem>
                      <SelectItem value="critical">{t('priority.critical')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dependencies */}
            {availableDependencies.length > 0 && (
              <FormField
                control={form.control}
                name="dependencies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.dependencies')}</FormLabel>
                    <FormDescription>{t('form.dependenciesDescription')}</FormDescription>
                    <div className="space-y-2">
                      {availableDependencies.map((dep) => (
                        <div key={dep.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`dep-${dep.id}`}
                            checked={field.value?.includes(dep.id) || false}
                            onChange={(e) => {
                              const currentDeps = field.value || []
                              if (e.target.checked) {
                                field.onChange([...currentDeps, dep.id])
                              } else {
                                field.onChange(currentDeps.filter((id) => id !== dep.id))
                              }
                            }}
                            disabled={isSubmitting}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`dep-${dep.id}`} className="text-sm">
                            {dep.title}
                          </label>
                          <Badge variant="outline" className="text-xs">
                            {t(`priority.${dep.priority}`)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                  className="sm:mr-auto"
                >
                  {t('form.delete')}
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {t('form.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? t('form.saving') : t('form.save')}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">{t('form.delete')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {t('form.deleteConfirm')}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                >
                  {t('form.cancel')}
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('form.delete')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
