'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  title = 'Subscribe to our newsletter',
  description = 'Stay updated with our latest news and articles',
  buttonText = 'Subscribe',
  placeholderText = 'Enter your email',
  layout = 'stacked',
  variant = 'default',
  className,
  forceShow = false,
  storageKey = 'newsletter_subscribed',
  locale = 'en',
  errorMessage,
  successTitle,
  successMessage,
  source = 'website',
}) => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const messages = {
    error:
      errorMessage ||
      (locale === 'ru'
        ? 'Пожалуйста, введите корректный email адрес'
        : 'Please enter a valid email address'),
    successTitle:
      successTitle || (locale === 'ru' ? 'Спасибо за подписку!' : 'Thank you for subscribing!'),
    successMessage:
      successMessage ||
      (locale === 'ru'
        ? 'Мы отправили письмо с подтверждением на '
        : "We've sent a confirmation email to "),
    networkError:
      locale === 'ru'
        ? 'Ошибка сети при подписке. Пожалуйста, попробуйте позже.'
        : 'Network error during subscription. Please try again later.',
    serverError:
      locale === 'ru'
        ? 'Ошибка сервера при подписке. Пожалуйста, попробуйте позже.'
        : 'Server error during subscription. Please try again later.',
    alreadySubscribed:
      locale === 'ru'
        ? 'Этот email уже подписан на нашу рассылку.'
        : 'This email is already subscribed to our newsletter.',
  }

  useEffect(() => {
    setIsClient(true)
    const subscriptionStatus = localStorage.getItem(storageKey)

    if (subscriptionStatus) {
      try {
        const data = JSON.parse(subscriptionStatus)
        if (data.subscribed && data.email) {
          setIsSubscribed(true)
          setEmail(data.email)
        }
      } catch (e) {
        localStorage.removeItem(storageKey)
      }
    }
  }, [storageKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(messages.error)
      return
    }

    setIsSubmitting(true)

    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
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

      const data = await response.json()

      if (data.alreadySubscribed) {
        toast.info(messages.alreadySubscribed)
      }

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          subscribed: true,
          email,
          date: new Date().toISOString(),
        }),
      )

      setIsSubmitted(true)
      setIsSubscribed(true)
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setError(error instanceof Error ? error.message : messages.networkError)
      toast.error(error instanceof Error ? error.message : messages.networkError)
    } finally {
      setIsSubmitting(false)
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
          onSubmit={handleSubmit}
          className={cn(
            'mx-auto',
            isCompact ? 'max-w-full' : 'max-w-md',
            layout === 'inline' && 'flex gap-2 items-start',
            layout === 'stacked' && 'space-y-2',
          )}
        >
          <div className={cn(layout === 'inline' && 'flex-1', layout === 'stacked' && 'w-full')}>
            <input
              type="email"
              placeholder={placeholderText}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'w-full rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50',
                isCompact ? 'px-3 py-1 text-sm' : 'px-4 py-2',
                error && 'border-red-500 focus:ring-red-500/50',
              )}
              aria-label="Email address"
              disabled={isSubmitting}
            />
            {error && (
              <p className={cn('text-red-500 mt-1', isCompact ? 'text-[10px]' : 'text-xs')}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={cn(
              'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors',
              isCompact ? 'px-3 py-1 text-sm' : 'px-4 py-2',
              layout === 'stacked' && 'w-full',
              layout === 'inline' && 'whitespace-nowrap',
              isSubmitting && 'opacity-70 cursor-not-allowed',
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? (locale === 'ru' ? 'Подписка...' : 'Subscribing...') : buttonText}
          </button>
        </form>
      ) : (
        <div className={cn('text-center bg-green-500/10 rounded-md', isCompact ? 'p-2' : 'p-4')}>
          <p
            className={cn('text-green-600 dark:text-green-400 font-medium', isCompact && 'text-sm')}
          >
            {messages.successTitle}
          </p>
          <p className={cn('text-muted-foreground mt-1', isCompact ? 'text-xs' : 'text-sm')}>
            {messages.successMessage + email}
          </p>
        </div>
      )}
    </div>
  )
}
