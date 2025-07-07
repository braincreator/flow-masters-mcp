'use client'

import React, { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { newsletterSchema, type NewsletterData } from '@/types/forms'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useFormAnalytics } from '@/hooks/useFormAnalytics'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { PrivacyConsent } from '@/components/forms/PrivacyConsent'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface NewsletterProps {
  title?: string
  description?: string
  buttonText?: string
  placeholderText?: string
  layout?: 'inline' | 'stacked'
  variant?: 'default' | 'compact'
  className?: string
  forceShow?: boolean
  storageKey?: string
  locale?: string
  errorMessage?: string
  successTitle?: string
  successMessage?: string
  source?: string
}

export const Newsletter: React.FC<NewsletterProps> = ({
  title: initialTitle,
  description: initialDescription,
  buttonText: initialButtonText,
  placeholderText: initialPlaceholderText,
  layout = 'stacked',
  variant = 'default',
  className,
  forceShow = false,
  storageKey = 'newsletter_subscribed',
  locale = 'en',
  errorMessage,
  successTitle,
  successMessage: initialSuccessMessage,
  source = 'website',
}) => {
  const t = useTranslations('Newsletter')

  const title = initialTitle || t('defaultTitle')
  const description = initialDescription || t('defaultDescription')
  const buttonText = initialButtonText || t('defaultButtonText')
  const placeholderText = initialPlaceholderText || t('defaultPlaceholderText')

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Аналитика форм
  const formAnalytics = useFormAnalytics({
    formName: 'newsletter',
    formType: 'subscription',
  })

  // React Hook Form с Zod валидацией
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      consent: false, // Пользователь должен явно дать согласие
    },
  })

  const consentValue = watch('consent')

  const messages = {
    error: errorMessage || t('errorInvalidEmail'),
    successTitle: successTitle || t('successTitle'),
    successMessage: initialSuccessMessage || t('successMessage'),
    networkError: t('errorNetwork'),
    serverError: t('errorServer'),
    alreadySubscribed: t('errorAlreadySubscribed'),
  }

  useEffect(() => {
    setIsClient(true)
    const subscriptionStatus = localStorage.getItem(storageKey)

    if (subscriptionStatus) {
      try {
        const data = JSON.parse(subscriptionStatus)
        if (data.subscribed && data.email) {
          setIsSubscribed(true)
        }
      } catch (e) {
        localStorage.removeItem(storageKey)
      }
    }
  }, [storageKey])

  const onSubmit: SubmitHandler<NewsletterData> = async (data) => {
    try {
      // Трекаем начало отправки
      formAnalytics.handleFormSubmit(true)

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          source,
          locale,
          metadata: {
            subscriptionDate: new Date().toISOString(),
            userAgent: window.navigator.userAgent,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || messages.serverError)
      }

      const responseData = await response.json()

      if (responseData.alreadySubscribed) {
        toast.info(messages.alreadySubscribed)
      }

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          subscribed: true,
          email: data.email,
          date: new Date().toISOString(),
        }),
      )

      setIsSubmitted(true)
      setIsSubscribed(true)
      reset()
    } catch (error) {
      logError('Newsletter subscription error:', error)
      const errorMessage = error instanceof Error ? error.message : messages.networkError
      toast.error(errorMessage)
      // Трекаем ошибку подписки
      formAnalytics.handleFormSubmit(false)
    }
  }

  const isCompact = variant === 'compact'

  if (isClient && isSubscribed && !forceShow && !isSubmitted) {
    return null
  }

  return (
    <div
      className={cn(
        'w-full border rounded-lg bg-card shadow-sm',
        isCompact ? 'p-3' : 'p-6',
        className,
      )}
    >
      <div className={cn('text-center mb-4', isCompact && 'mb-2')}>
        {title && (
          <h3 className={cn('font-bold', isCompact ? 'text-base' : 'text-xl mb-2')}>{title}</h3>
        )}
        {description && (
          <p className={cn('text-muted-foreground', isCompact ? 'text-xs' : 'text-sm')}>
            {description}
          </p>
        )}
      </div>

      {!isSubmitted ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={cn(
            'mx-auto',
            isCompact ? 'max-w-full' : 'max-w-md',
            layout === 'inline' && 'flex gap-2 items-start',
            layout === 'stacked' && 'space-y-2',
          )}
        >
          <div className={cn(layout === 'inline' && 'flex-1', layout === 'stacked' && 'w-full')}>
            <Input
              type="email"
              placeholder={placeholderText}
              {...register('email')}
              className={cn(
                isCompact ? 'h-8 text-sm' : 'h-10',
                errors.email && 'border-destructive',
              )}
              aria-label={t('emailInputLabel')}
              disabled={isSubmitting}
              onFocus={() => formAnalytics.handleFieldFocus('email')}
            />
            {errors.email && (
              <p className={cn('text-destructive mt-1', isCompact ? 'text-[10px]' : 'text-xs')}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Согласие на обработку персональных данных для newsletter */}
          {layout === 'stacked' && (
            <div className="w-full">
              <PrivacyConsent
                id="newsletter-consent"
                checked={consentValue}
                onCheckedChange={(checked) => setValue('consent', checked)}
                error={errors.consent?.message}
                size={isCompact ? 'sm' : 'md'}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              isCompact ? 'h-8 px-3 text-sm' : 'h-10 px-4',
              layout === 'stacked' && 'w-full',
              layout === 'inline' && 'whitespace-nowrap',
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('submittingText')}
              </>
            ) : (
              buttonText
            )}
          </Button>

          {/* Согласие для inline layout - показываем под формой */}
          {layout === 'inline' && (
            <div className="w-full mt-2">
              <PrivacyConsent
                id="newsletter-consent-inline"
                checked={consentValue}
                onCheckedChange={(checked) => setValue('consent', checked)}
                error={errors.consent?.message}
                size="sm"
              />
            </div>
          )}
        </form>
      ) : (
        <div className={cn('text-center bg-green-500/10 rounded-md', isCompact ? 'p-2' : 'p-4')}>
          <p
            className={cn('text-green-600 dark:text-green-400 font-medium', isCompact && 'text-sm')}
          >
            {messages.successTitle}
          </p>
          <p className={cn('text-muted-foreground mt-1', isCompact ? 'text-xs' : 'text-sm')}>
            {messages.successMessage}
          </p>
        </div>
      )}
    </div>
  )
}
