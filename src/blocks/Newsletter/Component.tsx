'use client'

import React, { useState } from 'react'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/lib/utils'

interface NewsletterBlockProps {
  heading?: string
  subheading?: string
  buttonText?: string
  placeholderText?: string
  layout?: 'inline' | 'stacked'
  settings?: any
}

export const NewsletterBlock: React.FC<NewsletterBlockProps> = ({
  heading = 'Subscribe to our newsletter',
  subheading = 'Stay updated with our latest news and articles',
  buttonText = 'Subscribe',
  placeholderText = 'Enter your email',
  layout = 'stacked',
  settings,
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
    <GridContainer settings={settings}>
      <div className="w-full max-w-4xl mx-auto p-6 border rounded-lg bg-card">
        <div className="text-center mb-6">
          {heading && <h2 className="text-2xl font-bold mb-2">{heading}</h2>}

          {subheading && <p className="text-muted-foreground">{subheading}</p>}
        </div>

        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className={cn(
              'mx-auto max-w-md',
              layout === 'inline' && 'flex gap-2',
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
                  'w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/50',
                  error && 'border-red-500 focus:ring-red-500/50',
                )}
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              className={cn(
                'bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium',
                layout === 'stacked' && 'w-full',
                layout === 'inline' && 'whitespace-nowrap',
              )}
            >
              {buttonText}
            </button>
          </form>
        ) : (
          <div className="text-center p-4 bg-green-500/10 rounded-md">
            <p className="text-green-600 font-medium">Thank you for subscribing!</p>
            <p className="text-sm text-muted-foreground mt-1">
              We've sent a confirmation email to {email}
            </p>
          </div>
        )}
      </div>
    </GridContainer>
  )
}
