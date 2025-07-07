'use client'

import React, { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { newsletterSchema, type NewsletterData } from '@/types/forms'
import type { NewsletterBlock as NewsletterBlockType } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utilities/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { RichText } from '@/components/RichText'
import { useTranslations } from 'next-intl'
import { useFormAnalytics } from '@/hooks/useFormAnalytics'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type NewsletterStyle = 'default' | 'card' | 'minimal'
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

const styleVariants: Record<NewsletterStyle, string> = {
  default: 'bg-muted/50 p-8 rounded-lg',
  card: 'bg-card p-8 rounded-lg border shadow-sm',
  minimal: 'border-l-4 border-primary pl-8',
}

interface NewsletterProps extends NewsletterBlockType {
  className?: string
  style?: NewsletterStyle
  storageKey?: string
  forceShow?: boolean
}



export const Newsletter: React.FC<NewsletterProps> = ({
  heading,
  description,
  buttonText,
  settings,
  className,
  style = 'default',
  storageKey = 'newsletter_subscribed',
  forceShow = false,
}) => {
  const t = useTranslations('forms.newsletter')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Use translation as default if not provided
  const defaultButtonText = buttonText || t('buttons.subscribe')

  // Аналитика форм
  const formAnalytics = useFormAnalytics({
    formName: 'newsletter_block',
    formType: 'subscription'
  })

  // React Hook Form с Zod валидацией
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      consent: true, // Автоматически согласие для newsletter
    },
  })

  useEffect(() => {
    setIsClient(true)
    const subscriptionStatus = localStorage.getItem(storageKey)
    if (subscriptionStatus) {
      try {
        const data = JSON.parse(subscriptionStatus)
        if (data.subscribed) {
          setIsSubscribed(true)
        }
      } catch (e) {
        logError('Error parsing subscription status from localStorage', e)
        localStorage.removeItem(storageKey)
      }
    }
  }, [storageKey])

  const onSubmit: SubmitHandler<NewsletterData> = async (data) => {
    setStatus('loading')

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
          metadata: {
            subscriptionDate: new Date().toISOString(),
            userAgent: window.navigator.userAgent,
            source: 'newsletter_block',
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t('errors.submitError'))
      }

      setStatus('success')

      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            subscribed: true,
            email: data.email,
            date: new Date().toISOString(),
          }),
        )
        setIsSubscribed(true)
      } catch (storageError) {
        logError('Failed to save subscription status to localStorage', storageError)
      }

      reset()

    } catch (err) {
      setStatus('error')
      logError('Subscription error:', err)
      // Трекаем ошибку подписки
      formAnalytics.handleFormSubmit(false)
    }
  }

  if (!isClient || (isSubscribed && !forceShow && status !== 'success')) {
    if (isClient && isSubscribed && status === 'success') {
    } else if (isClient && isSubscribed && !forceShow) {
      return null
    } else if (!isClient) {
      return null
    }
  }

  return (
    <GridContainer settings={settings}>
      <div className={cn('w-full max-w-2xl mx-auto', className)}>
        <div
          className={cn(
            'relative overflow-hidden',
            styleVariants[style],
            isClient &&
              (!isSubscribed || forceShow) &&
              'animate-in fade-in slide-in-from-bottom-4 duration-700',
          )}
        >
          {status !== 'success' || (isClient && isSubscribed) ? (
            <>
              <div className="text-center mb-6">
                {heading && (
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-3">{heading}</h2>
                )}
                {description && (
                  <div className="text-muted-foreground">
                    <RichText content={description} />
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder={t('fields.email.placeholder')}
                    {...register('email')}
                    aria-label={t('fields.email.label')}
                    disabled={isSubmitting || status === 'success'}
                    className={cn('flex-1', errors.email && 'border-destructive')}
                    onFocus={() => formAnalytics.handleFieldFocus('email')}
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting || status === 'success'}
                    className="relative"
                  >
                    {isSubmitting && (
                      <Loader2 className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                    )}
                    <span className={cn(isSubmitting && 'opacity-0')}>
                      {status === 'success' ? t('buttons.subscribed') : defaultButtonText}
                    </span>
                  </Button>
                </div>

                {errors.email && (
                  <div className="flex items-center gap-2 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                    <XCircle className="h-4 w-4" />
                    <span>{errors.email.message}</span>
                  </div>
                )}

                {status === 'success' && (
                  <div className="flex items-center gap-2 text-sm text-green-500 animate-in fade-in slide-in-from-top-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>{t('buttons.subscribed')}</span>
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 text-lg text-green-600 p-8">
              <CheckCircle className="h-6 w-6" />
              <span>{t('buttons.subscribed')}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-500 animate-in fade-in slide-in-from-top-1">
              <CheckCircle className="h-4 w-4" />
              <span>{t('buttons.subscribed')}</span>
            </div>
          )}

          {status !== 'success' && (
            <p className="mt-4 text-xs text-center text-muted-foreground">
              By subscribing, you agree to our{' '}
              <a href="/privacy" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </p>
          )}
        </div>
      </div>
    </GridContainer>
  )
}

export const NewsletterBlock = Newsletter
export default Newsletter
