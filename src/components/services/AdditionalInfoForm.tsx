'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { AlertCircle, CalendarIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import FileUpload from '@/components/FileUpload'
import type { AdditionalInfoField } from '@/types/service'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Define a generic type for the form data
type FormData = Record<string, any>

type AdditionalInfoFormProps = {
  fields: AdditionalInfoField[]
  title?: string
  description?: string
  isRequired?: boolean
  onSubmit: (data: FormData) => Promise<void> | void
  onSkip?: () => void
  className?: string
  isSubmittingFiles?: boolean // New prop to indicate if files are being submitted
}

const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({
  fields,
  title = 'Дополнительная информация',
  description,
  isRequired = false,
  onSubmit,
  onSkip,
  className = '',
  isSubmittingFiles = false,
}) => {
  const t = useTranslations('ServiceBooking')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Динамически создаем схему валидации на основе полей
  const formSchema = React.useMemo(
    () =>
      z.object(
        fields.reduce((schema, field) => {
          let fieldSchema

          switch (field.fieldType) {
            case 'text':
              fieldSchema = z.string()
              break
            case 'textarea':
              fieldSchema = z.string()
              break
            case 'number':
              fieldSchema = z.coerce.number()
              break
            case 'date':
              fieldSchema = z.date().optional()
              break
            case 'select':
              fieldSchema = z.string()
              break
            case 'checkbox':
              fieldSchema = z.boolean().default(false)
              break
            case 'fileUpload':
              // Validate as an array of File objects
              fieldSchema = z.array(z.instanceof(File))
              break
            default:
              fieldSchema = z.string()
          }

          // Если поле обязательное, добавляем валидацию
          if (field.required) {
            if (
              field.fieldType === 'text' ||
              field.fieldType === 'textarea' ||
              field.fieldType === 'select'
            ) {
              // Type assertion to fix the min method not existing on all types
              fieldSchema = (fieldSchema as z.ZodString).min(1, { message: t('fieldRequired', { defaultValue: 'This field is required' }) })
            } else if (field.fieldType === 'date') {
              fieldSchema = z.date({ required_error: t('fieldRequired', { defaultValue: 'This field is required' }) })
            } else if (field.fieldType === 'fileUpload') {
              fieldSchema = z.array(z.instanceof(File)).min(1, {
                message: t('fileRequired', { defaultValue: 'Please upload at least one file' })
              })
            }
          } else {
            // Если поле не обязательное, делаем его опциональным
            if (
              field.fieldType !== 'checkbox' &&
              field.fieldType !== 'date' &&
              field.fieldType !== 'fileUpload'
            ) {
              fieldSchema = fieldSchema.optional()
            } else if (field.fieldType === 'fileUpload') {
              fieldSchema = z.array(z.instanceof(File)).optional().default([])
            }
          }

          return { ...schema, [field.fieldName]: fieldSchema }
        }, {})
      ),
    [fields, t]
  )

  // Создаем форму
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: React.useMemo(
      () =>
        fields.reduce(
          (values, field) => {
            if (field.fieldType === 'checkbox') {
              values[field.fieldName] = field.defaultValue === 'true' || false
            } else if (field.fieldType === 'fileUpload') {
              values[field.fieldName] = [] // Default to empty array for files
            } else if (field.fieldType === 'number') {
              values[field.fieldName] = field.defaultValue ? Number(field.defaultValue) : 0
            } else if (field.fieldType === 'date') {
              values[field.fieldName] = field.defaultValue ? new Date(field.defaultValue) : undefined
            } else {
              values[field.fieldName] = field.defaultValue || ''
            }
            return values
          },
          {} as Record<string, any>,
        ),
      [fields], // Зависимость от полей
    ),
  })

  // Обработчик отправки формы
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      // Log form data for debugging (remove in production)
      logDebug('Submitting form data:', data)

      // Check for file uploads and validate file sizes
      const hasLargeFiles = Object.entries(data).some(([key, value]) => {
        const field = fields.find(f => f.fieldName === key)
        if (field?.fieldType === 'fileUpload' && Array.isArray(value)) {
          return value.some(file => file.size > 10 * 1024 * 1024) // 10MB limit
        }
        return false
      })

      if (hasLargeFiles) {
        form.setError('root', {
          message: t('fileTooLarge', { defaultValue: 'One or more files exceed the 10MB size limit' })
        })
        return
      }

      // Call onSubmit and handle both Promise and non-Promise returns
      const result = onSubmit(data)
      if (result instanceof Promise) {
        await result
      }
    } catch (error) {
      logError('Error submitting form:', error)

      // Show error message to user
      form.setError('root', {
        message: t('submissionError', {
          defaultValue: 'An error occurred while submitting the form. Please try again.'
        })
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Обработчик пропуска формы
  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    }
  }

  // Определяем, должна ли кнопка отправки быть отключена
  const isSubmitDisabled = isSubmitting || isSubmittingFiles;

  return (
    <div className={`p-6 border rounded-lg shadow-sm ${className}`}>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6">{description}</p>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Display form-level errors */}
          {form.formState.errors.root && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          )}

          {/* Добавляем индикатор загрузки файлов, если isSubmittingFiles === true */}
          {isSubmittingFiles && (
             <Alert className="mb-4">
               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
               <AlertDescription>{t('uploadingFiles', { defaultValue: 'Uploading files...' })}</AlertDescription>
             </Alert>
          )}
          {fields.map((field) => (
            <FormField
              key={field.fieldName}
              control={form.control}
              name={field.fieldName as any}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>
                    {field.fieldLabel}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>

                  {field.fieldType === 'text' && (
                    <FormControl>
                      <Input placeholder={field.placeholder} {...formField} />
                    </FormControl>
                  )}

                  {field.fieldType === 'fileUpload' && ( // New file upload field type
                    <FormControl>
                      <FileUpload
                        onFilesAdded={(files) => formField.onChange(files)}
                        multiple={field.multipleFiles || false} // Assuming a 'multipleFiles' prop on field
                        accept={field.allowedFileTypes || '*/*'}
                        maxSize={field.maxFileSize || 5 * 1024 * 1024} // Assuming 'maxFileSize' prop on field
                        isUploading={isSubmittingFiles} // Pass the submitting state
                      />
                    </FormControl>
                  )}



                  {field.fieldType === 'textarea' && (
                    <FormControl>
                      <Textarea placeholder={field.placeholder} {...formField} />
                    </FormControl>
                  )}

                  {field.fieldType === 'number' && (
                    <FormControl>
                      <Input type="number" placeholder={field.placeholder} {...formField} />
                    </FormControl>
                  )}

                  {field.fieldType === 'date' && (
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !formField.value && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formField.value ? (
                              format(formField.value, 'PPP')
                            ) : (
                              <span>{field.placeholder || 'Выберите дату'}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formField.value}
                            onSelect={formField.onChange}
                            // initialFocus is deprecated, removed
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  )}

                  {field.fieldType === 'select' && field.options && (
                    <FormControl>
                      <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || 'Выберите опцию'} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  )}

                  {field.fieldType === 'checkbox' && (
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                          id={field.fieldName}
                        />
                        <label
                          htmlFor={field.fieldName}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {field.placeholder || field.fieldLabel}
                        </label>
                      </div>
                    </FormControl>
                  )}

                  {field.description && <FormDescription>{field.description}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <div className="flex justify-between pt-4">
            {!isRequired && onSkip && (
              <Button type="button" variant="outline" onClick={handleSkip} disabled={isSubmitDisabled}> {/* Use isSubmitDisabled here */}
                {t('skipAdditionalInfo')}
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSubmitDisabled} // Use isSubmitDisabled here
              className={!isRequired && onSkip ? '' : 'w-full'}
            >
              {isSubmitting ? t('processing') : t('continueBooking')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AdditionalInfoForm;