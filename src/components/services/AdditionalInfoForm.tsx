'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdditionalInfoField } from '@/types/service'

type AdditionalInfoFormProps = {
  fields: AdditionalInfoField[]
  title?: string
  description?: string
  isRequired?: boolean
  onSubmit: (data: Record<string, any>) => void
  onSkip?: () => void
  className?: string
}

export const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({
  fields,
  title = 'Дополнительная информация',
  description,
  isRequired = false,
  onSubmit,
  onSkip,
  className = '',
}) => {
  const t = useTranslations('ServiceBooking')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Динамически создаем схему валидации на основе полей
  const formSchema = z.object(
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
        default:
          fieldSchema = z.string()
      }

      // Если поле обязательное, добавляем валидацию
      if (field.required) {
        if (field.fieldType === 'text' || field.fieldType === 'textarea' || field.fieldType === 'select') {
          fieldSchema = fieldSchema.min(1, { message: 'Это поле обязательно для заполнения' })
        } else if (field.fieldType === 'date') {
          fieldSchema = z.date({ required_error: 'Это поле обязательно для заполнения' })
        }
      } else {
        // Если поле не обязательное, делаем его опциональным
        if (field.fieldType !== 'checkbox' && field.fieldType !== 'date') {
          fieldSchema = fieldSchema.optional()
        }
      }

      return { ...schema, [field.fieldName]: fieldSchema }
    }, {})
  )

  // Создаем форму
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((values, field) => {
      if (field.fieldType === 'checkbox') {
        values[field.fieldName] = false
      } else if (field.fieldType !== 'date') {
        values[field.fieldName] = ''
      }
      return values
    }, {} as Record<string, any>),
  })

  // Обработчик отправки формы
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
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

  return (
    <div className={`p-6 border rounded-lg shadow-sm ${className}`}>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6">{description}</p>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {fields.map((field) => (
            <FormField
              key={field.fieldName}
              control={form.control}
              name={field.fieldName}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>
                    {field.fieldLabel}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>

                  {field.fieldType === 'text' && (
                    <FormControl>
                      <Input
                        placeholder={field.placeholder}
                        {...formField}
                      />
                    </FormControl>
                  )}

                  {field.fieldType === 'textarea' && (
                    <FormControl>
                      <Textarea
                        placeholder={field.placeholder}
                        {...formField}
                      />
                    </FormControl>
                  )}

                  {field.fieldType === 'number' && (
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={field.placeholder}
                        {...formField}
                      />
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
                              !formField.value && 'text-muted-foreground'
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  )}

                  {field.fieldType === 'select' && field.options && (
                    <FormControl>
                      <Select
                        onValueChange={formField.onChange}
                        defaultValue={formField.value}
                      >
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

                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <div className="flex justify-between pt-4">
            {!isRequired && onSkip && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                {t('skipAdditionalInfo')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={!isRequired && onSkip ? '' : 'w-full'}
            >
              {isSubmitting ? t('processing') : t('continueBooking')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default AdditionalInfoForm
