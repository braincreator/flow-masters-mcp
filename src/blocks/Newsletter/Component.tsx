'use client'
'use client'

import React, { useState, useEffect } from 'react'
import type { NewsletterBlock as NewsletterBlockType } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utilities/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { RichText } from '@/components/RichText'
import { useTranslations } from 'next-intl'

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

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
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
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [error, setError] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Use translation as default if not provided
  const defaultButtonText = buttonText || t('buttons.subscribe')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setError(t('errors.invalidEmail'))
      return
    }

    setStatus('loading')
    setError('')

    try {
      logDebug(`Subscribing ${email}... (Simulated API Call)`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus('success')

      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            subscribed: true,
            email: email,
            date: new Date().toISOString(),
          }),
        )
        setIsSubscribed(true)
      } catch (storageError) {
        logError('Failed to save subscription status to localStorage', storageError)
      }
    } catch (err) {
      setStatus('error')
      setError(t('errors.submitError'))
      logError('Subscription error:', err)
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder={t('fields.email.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label={t('fields.email.label')}
                    disabled={status === 'loading' || status === 'success'}
                    className={cn('flex-1', error && 'border-red-500 focus-visible:ring-red-500')}
                  />
                  <Button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="relative"
                  >
                    {status === 'loading' && (
                      <Loader2 className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                    )}
                    <span className={cn(status === 'loading' && 'opacity-0')}>
                      {status === 'success' ? t('buttons.subscribed') : defaultButtonText}
                    </span>
                  </Button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
                    <XCircle className="h-4 w-4" />
                    <span>{error}</span>
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
