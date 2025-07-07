'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import RichText from '@/components/RichText'
import { cn } from '@/lib/utils'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Типы для компонента
export interface LeadMagnetOfferProps {
  heading: string
  subheading?: string
  description: any // Rich text content
  image?: {
    id: string
    url: string
    alt?: string
  }
  formFields: Array<{
    fieldName: string
    label: string
    fieldType: 'text' | 'email' | 'tel' | 'number' | 'hidden' | 'checkbox'
    placeholder?: string
    required?: boolean
    consentText?: any // Rich text for checkbox consent
  }>
  submitButtonLabel: string
  submissionTarget: 'collection' | 'email' | 'api'
  submissionSettings?: {
    targetCollection: string
  }
  emailSettings?: {
    recipientEmail: string
    subject: string
  }
  apiSettings?: {
    apiUrl: string
  }
  successAction: 'message' | 'redirect' | 'download'
  successMessage?: any // Rich text
  redirectUrl?: string
  downloadFile?: {
    id: string
    url: string
    filename?: string
  }
  layout: 'imageLeft' | 'imageRight' | 'imageTop' | 'formOnly'
  backgroundColor?: string
  blockName?: string
}

export const LeadMagnetOfferBlock: React.FC<LeadMagnetOfferProps> = ({
  heading,
  subheading,
  description,
  image,
  formFields,
  submitButtonLabel,
  submissionTarget,
  submissionSettings,
  emailSettings,
  apiSettings,
  successAction,
  successMessage,
  redirectUrl,
  downloadFile,
  layout = 'imageLeft',
  backgroundColor,
  blockName,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Создаем динамическую схему валидации на основе полей формы
  const createValidationSchema = () => {
    const schemaFields: Record<string, any> = {}

    formFields.forEach((field) => {
      if (field.fieldType === 'email') {
        schemaFields[field.fieldName] = field.required
          ? z.string().email('Введите корректный email')
          : z.string().email('Введите корректный email').optional()
      } else if (field.fieldType === 'tel') {
        schemaFields[field.fieldName] = field.required
          ? z.string().min(5, 'Введите корректный номер телефона')
          : z.string().min(5, 'Введите корректный номер телефона').optional()
      } else if (field.fieldType === 'checkbox') {
        schemaFields[field.fieldName] = field.required
          ? z.boolean().refine((val) => val === true, 'Это поле обязательно')
          : z.boolean().optional()
      } else {
        schemaFields[field.fieldName] = field.required
          ? z.string().min(1, 'Это поле обязательно')
          : z.string().optional()
      }
    })

    return z.object(schemaFields)
  }

  const formSchema = createValidationSchema()

  // Создаем форму
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((acc, field) => {
      if (field.fieldType === 'checkbox') {
        acc[field.fieldName] = false
      } else {
        acc[field.fieldName] = ''
      }
      return acc
    }, {} as Record<string, any>),
  })

  // Обработчик отправки формы
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Определяем, куда отправлять данные
      let response

      if (submissionTarget === 'collection' && submissionSettings?.targetCollection) {
        // Отправка в коллекцию Payload
        response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collection: submissionSettings.targetCollection,
            data: {
              ...values,
              source: window.location.href,
              blockName: blockName || 'Lead Magnet Offer',
            },
          }),
        })
      } else if (submissionTarget === 'email' && emailSettings?.recipientEmail) {
        // Отправка на email
        response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: emailSettings.recipientEmail,
            subject: emailSettings.subject || 'Новый лид с сайта',
            data: {
              ...values,
              source: window.location.href,
              blockName: blockName || 'Lead Magnet Offer',
            },
          }),
        })
      } else if (submissionTarget === 'api' && apiSettings?.apiUrl) {
        // Отправка на внешний API
        response = await fetch(apiSettings.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            source: window.location.href,
            blockName: blockName || 'Lead Magnet Offer',
          }),
        })
      } else {
        throw new Error('Не указаны настройки для отправки данных')
      }

      if (!response || !response.ok) {
        throw new Error('Ошибка при отправке данных')
      }

      // Обработка успешной отправки
      setIsSuccess(true)
      setIsSubscribed(true)

      // Выполняем действие после успешной отправки
      if (successAction === 'redirect' && redirectUrl) {
        window.location.href = redirectUrl
      } else if (successAction === 'download' && downloadFile?.url) {
        // Создаем ссылку для скачивания файла
        const link = document.createElement('a')
        link.href = downloadFile.url
        link.download = downloadFile.filename || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      logError('Error submitting form:', err)
      setError(err instanceof Error ? err.message : 'Произошла ошибка при отправке формы')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Если пользователь уже подписан, не показываем форму
  if (isSubscribed && successAction === 'message') {
    return (
      <div
        className={cn(
          'py-12 px-6 rounded-lg',
          backgroundColor ? '' : 'bg-slate-50',
        )}
        style={backgroundColor ? { backgroundColor } : {}}
      >
        <div className="max-w-4xl mx-auto">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Успешно!</AlertTitle>
            <AlertDescription className="text-green-700">
              {successMessage ? (
                <RichText data={successMessage} />
              ) : (
                'Спасибо! Ваша заявка успешно отправлена.'
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Определяем классы для разных макетов
  const getLayoutClasses = () => {
    switch (layout) {
      case 'imageLeft':
        return 'md:grid md:grid-cols-2 md:gap-12 items-center'
      case 'imageRight':
        return 'md:grid md:grid-cols-2 md:gap-12 items-center flex-row-reverse'
      case 'imageTop':
        return 'flex flex-col gap-8'
      case 'formOnly':
        return 'flex flex-col'
      default:
        return 'md:grid md:grid-cols-2 md:gap-12 items-center'
    }
  }

  return (
    <div
      className={cn(
        'py-12 px-6 rounded-lg',
        backgroundColor ? '' : 'bg-slate-50',
      )}
      style={backgroundColor ? { backgroundColor } : {}}
    >
      <div className={cn('max-w-6xl mx-auto', getLayoutClasses())}>
        {/* Контент блока (изображение и описание) */}
        {layout !== 'formOnly' && (
          <div className="mb-8 md:mb-0">
            {image?.url && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={image.alt || heading}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{heading}</h2>
              {subheading && <p className="text-lg text-gray-600 mb-4">{subheading}</p>}
              {description && <RichText data={description} />}
            </div>
          </div>
        )}

        {/* Форма */}
        <div className={cn(layout === 'formOnly' ? 'max-w-md mx-auto w-full' : '')}>
          {layout === 'formOnly' && (
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{heading}</h2>
              {subheading && <p className="text-lg text-gray-600 mb-4">{subheading}</p>}
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {formFields.map((field) => (
                  <FormField
                    key={field.fieldName}
                    control={form.control}
                    name={field.fieldName}
                    render={({ field: formField }) => (
                      <FormItem>
                        {field.fieldType !== 'hidden' && field.fieldType !== 'checkbox' && (
                          <FormLabel>{field.label}</FormLabel>
                        )}
                        <FormControl>
                          {field.fieldType === 'checkbox' ? (
                            <div className="flex items-start space-x-2">
                              <Checkbox
                                checked={formField.value}
                                onCheckedChange={formField.onChange}
                                id={field.fieldName}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <label
                                  htmlFor={field.fieldName}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {field.label}
                                </label>
                                {field.consentText && (
                                  <p className="text-sm text-gray-500">
                                    <RichText data={field.consentText} />
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : field.fieldType === 'hidden' ? (
                            <Input
                              {...formField}
                              type="hidden"
                              placeholder={field.placeholder}
                            />
                          ) : field.fieldType === 'text' && field.label.toLowerCase().includes('сообщение') ? (
                            <Textarea
                              {...formField}
                              placeholder={field.placeholder}
                              className="resize-y"
                            />
                          ) : (
                            <Input
                              {...formField}
                              type={field.fieldType}
                              placeholder={field.placeholder}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ошибка</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    submitButtonLabel
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadMagnetOfferBlock
