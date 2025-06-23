'use client'

import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFormAnalytics } from '@/hooks/useFormAnalytics'

type ContactFormData = {
  name: string
  email: string
  subject?: string
  message: string
}

export function ContactForm() {
  const t = useTranslations('forms.contactForm')
  const { toast } = useToast()

  // Аналитика форм
  const formAnalytics = useFormAnalytics({
    formName: 'contact_form',
    formType: 'contact'
  })

  // Create schema with translations
  const contactFormSchema = z.object({
    name: z.string().min(2, { message: t('fields.name.validation') }),
    email: z.string().email({ message: t('fields.email.validation') }),
    subject: z.string().optional(),
    message: z.string().min(10, { message: t('fields.message.validation') }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('errors.failedToSend'))
      }

      // Трекаем успешную отправку
      formAnalytics.handleFormSubmit(true)

      toast({
        title: t('success.title'),
        description: t('success.description'),
      })
      reset() // Очистить форму после успешной отправки
    } catch (error) {
      console.error('Ошибка отправки формы:', error)

      // Трекаем ошибку отправки
      formAnalytics.handleFormSubmit(false)

      toast({
        title: t('errors.title'),
        description: error instanceof Error ? error.message : t('errors.description'),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          {t('fields.name.label')} *
        </label>
        <Input
          id="name"
          placeholder={t('fields.name.placeholder')}
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
          aria-invalid={errors.name ? 'true' : 'false'}
          onFocus={() => formAnalytics.handleFieldFocus('name')}
        />
        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          {t('fields.email.label')} *
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t('fields.email.placeholder')}
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">
          {t('fields.subject.label')}
        </label>
        <Input
          id="subject"
          placeholder={t('fields.subject.placeholder')}
          {...register('subject')}
          className={errors.subject ? 'border-destructive' : ''}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
          {t('fields.message.label')} *
        </label>
        <Textarea
          id="message"
          placeholder={t('fields.message.placeholder')}
          rows={6}
          {...register('message')}
          className={errors.message ? 'border-destructive' : ''}
          aria-invalid={errors.message ? 'true' : 'false'}
        />
        {errors.message && (
          <p className="text-destructive text-sm mt-1">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('buttons.sending')}
          </>
        ) : (
          t('buttons.submit')
        )}
      </Button>
    </form>
  )
}
