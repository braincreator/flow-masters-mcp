'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface NewsletterProps {
  title?: string
  description?: string
  buttonText?: string
  placeholderText?: string
  layout?: 'inline' | 'stacked'
  className?: string
}

export const Newsletter: React.FC<NewsletterProps> = ({
  title = 'Subscribe to our newsletter',
  description = 'Stay updated with our latest news and articles',
  buttonText = 'Subscribe',
  placeholderText = 'Enter your email',
  layout = 'stacked',
  className,
}) => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Clear error if valid
    setError('')

    // Here you would typically handle the subscription logic
    // For now, we'll just simulate a successful submission
    setIsSubmitted(true)
  }

  return (
    <div className={cn('w-full p-6 border rounded-lg bg-card shadow-sm', className)}>
      <div className="text-center mb-6">
        {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>

      {!isSubmitted ? (
        <form
          onSubmit={handleSubmit}
          className={cn(
            'mx-auto max-w-md',
            layout === 'inline' && 'flex gap-2 items-start',
            layout === 'stacked' && 'space-y-3',
          )}
        >
          <div className={cn(layout === 'inline' && 'flex-1', layout === 'stacked' && 'w-full')}>
            <input
              type="email"
              placeholder={placeholderText}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50',
                error && 'border-red-500 focus:ring-red-500/50',
              )}
              aria-label="Email address"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className={cn(
              'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors',
              layout === 'stacked' && 'w-full',
              layout === 'inline' && 'whitespace-nowrap',
            )}
          >
            {buttonText}
          </button>
        </form>
      ) : (
        <div className="text-center p-4 bg-green-500/10 rounded-md">
          <p className="text-green-600 dark:text-green-400 font-medium">
            Thank you for subscribing!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            We've sent a confirmation email to {email}
          </p>
        </div>
      )}
    </div>
  )
}
