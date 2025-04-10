"use client"
'use client'

import React, { useState } from 'react'
import type { NewsletterBlock as NewsletterBlockType } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utilities/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { RichText } from '@/components/RichText'

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
}

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const Newsletter: React.FC<NewsletterProps> = ({
  heading,
  description,
  buttonText = 'Subscribe',
  settings,
  className,
  style = 'default',
}) => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setStatus('loading')
    setError('')

    try {
      // Здесь должна быть интеграция с API для подписки
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Имитация запроса
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <GridContainer settings={settings}>
      <div className={cn('w-full max-w-2xl mx-auto', className)}>
        <div
          className={cn(
            'relative overflow-hidden',
            styleVariants[style],
            'animate-in fade-in slide-in-from-bottom-4 duration-700',
          )}
        >
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
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
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
                  {status === 'success' ? 'Subscribed!' : buttonText}
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
                <span>Thank you for subscribing!</span>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground">
              By subscribing, you agree to our{' '}
              <a href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>
    </GridContainer>
  )
}

export const NewsletterBlock = Newsletter
export default Newsletter
