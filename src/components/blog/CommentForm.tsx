'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PrivacyConsent } from '@/components/forms/PrivacyConsent'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Переводы для форм комментариев
const translations = {
  en: {
    name: 'Name',
    email: 'Email',
    comment: 'Comment',
    submit: 'Submit Comment',
    reply: 'Reply',
    cancel: 'Cancel',
    success: 'Comment submitted',
    successMessage: 'Thank you for your comment! It will be visible after review.',
    error: 'Error',
    errorMessage: 'Something went wrong. Please try again.',
    emailDisclaimer: 'Your email address will not be published. Required fields are marked with *.',
    leaveComment: 'Leave a comment',
    leaveReply: 'Leave a reply',
    nameRequired: 'Name must be at least 2 characters',
    emailRequired: 'Please enter a valid email address',
    commentRequired: 'Comment must be at least 2 characters',
    commentTooLong: 'Comment must be less than 1000 characters',
    privacyConsentRequired: 'Consent to personal data processing is required',
  },
  ru: {
    name: 'Имя',
    email: 'Email',
    comment: 'Комментарий',
    submit: 'Отправить комментарий',
    reply: 'Ответить',
    cancel: 'Отмена',
    success: 'Комментарий отправлен',
    successMessage: 'Спасибо за ваш комментарий! Он будет виден после проверки.',
    error: 'Ошибка',
    errorMessage: 'Что-то пошло не так. Пожалуйста, попробуйте снова.',
    emailDisclaimer: 'Ваш email не будет опубликован. Обязательные поля отмечены *.',
    leaveComment: 'Оставить комментарий',
    leaveReply: 'Оставить ответ',
    nameRequired: 'Имя должно содержать не менее 2 символов',
    emailRequired: 'Пожалуйста, введите корректный email адрес',
    commentRequired: 'Комментарий должен содержать не менее 2 символов',
    commentTooLong: 'Комментарий должен содержать менее 1000 символов',
    privacyConsentRequired: 'Необходимо согласие на обработку персональных данных',
  },
}

// Схема для валидации полей формы комментария
const createCommentSchema = (t: any) =>
  z.object({
    name: z.string().min(2, t.nameRequired),
    email: z.string().email(t.emailRequired),
    comment: z.string().min(2, t.commentRequired).max(1000, t.commentTooLong),
    privacyConsent: z.boolean().refine((val) => val === true, {
      message: t.privacyConsentRequired,
    }),
  })

// Схема для авторизованного пользователя (только комментарий)
const createAuthCommentSchema = (t: any) =>
  z.object({
    comment: z.string().min(2, t.commentRequired).max(1000, t.commentTooLong),
  })

type CommentFormValues = z.infer<ReturnType<typeof createCommentSchema>>
type AuthCommentFormValues = z.infer<ReturnType<typeof createAuthCommentSchema>>

export interface CommentFormProps {
  postId: string
  parentCommentId?: string
  className?: string
  onSuccess?: () => void
  onCancel?: () => void
  locale?: 'en' | 'ru'
  user?: any // Пользователь, если авторизован
  addComment?: (postId: string, content: string, parentCommentId?: string) => Promise<boolean>
}

export function CommentForm({
  postId,
  parentCommentId,
  className,
  onSuccess,
  onCancel,
  locale = 'en',
  user = null,
  addComment,
}: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Получаем переводы в зависимости от локали
  const t = locale === 'ru' ? translations.ru : translations.en

  // Определяем схему валидации в зависимости от авторизации
  const schema = user ? createAuthCommentSchema(t) : createCommentSchema(t)

  // Инициализируем react-hook-form
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: user
      ? { comment: '' }
      : { name: '', email: '', comment: '', privacyConsent: false },
  })

  // Отправка комментария
  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // If addComment is provided through props (from BlogProvider), try it first
      if (addComment) {
        const success = await addComment(postId, data.comment, parentCommentId)

        if (success) {
          setSubmitStatus('success')
          form.reset()
          onSuccess?.()
          return // Successfully submitted via BlogProvider
        }
        // If addComment returns false (e.g., for guest users), fall through to direct API call
      }

      // Direct API call (fallback or when addComment is not provided)
      const payload = {
        postId,
        ...(parentCommentId ? { parentComment: parentCommentId } : {}),
        content: data.comment,
        author: user
          ? {
              name: user.name,
              email: user.email,
              ...(user.avatar ? { avatar: user.avatar } : {}),
            }
          : {
              name: data.name,
              email: data.email,
            },
      }

      logDebug('CommentForm fallback sending:', JSON.stringify(payload, null, 2))

      const response = await fetch('/api/blog/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to submit comment')
      }

      setSubmitStatus('success')
      form.reset()
      onSuccess?.()
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Получаем инициалы из имени (для аватара)
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {submitStatus === 'success' ? (
        <Alert variant="default" className="border-success bg-success/5 text-foreground rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle className="text-sm font-medium">{t.success}</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            {t.successMessage}
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            {parentCommentId ? (
              <h3 className="text-base font-medium mb-3">{t.leaveReply}</h3>
            ) : null}

            {/* Информация о пользователе (если авторизован) */}
            {user && (
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8 border border-border">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}

            {/* Поля для гостя */}
            {!user && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">{t.name}*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.name}
                            className="h-9 bg-background text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">{t.email}*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.email}
                            type="email"
                            className="h-9 bg-background text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">{t.comment}*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.comment}
                      className="min-h-[100px] resize-y bg-background text-sm rounded-md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Согласие на обработку персональных данных для неавторизованных пользователей */}
            {!user && (
              <FormField
                control={form.control}
                name="privacyConsent"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PrivacyConsent
                        id="comment-privacy-consent"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        error={form.formState.errors.privacyConsent?.message}
                        size="sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            {/* Error message */}
            {submitStatus === 'error' && (
              <Alert variant="destructive" className="py-2 px-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm">{t.error}</AlertTitle>
                <AlertDescription className="text-xs">
                  {errorMessage || t.errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Form actions */}
            <div className="flex flex-wrap gap-2 justify-end">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="h-9 text-xs px-3 rounded-md"
                >
                  {t.cancel}
                </Button>
              )}

              <Button type="submit" disabled={isSubmitting} className="h-9 text-xs px-4 rounded-md">
                {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {parentCommentId ? t.reply : t.submit}
              </Button>
            </div>

            {!user && !parentCommentId && (
              <p className="text-xs text-muted-foreground mt-1">{t.emailDisclaimer}</p>
            )}
          </form>
        </Form>
      )}
    </div>
  )
}
