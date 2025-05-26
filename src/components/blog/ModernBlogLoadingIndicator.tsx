'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { Loader2, BookOpen, Search, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ModernBlogLoadingIndicatorProps {
  variant?: 'default' | 'minimal' | 'detailed' | 'search'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function ModernBlogLoadingIndicator({
  variant = 'default',
  size = 'md',
  showText = true,
  className,
}: ModernBlogLoadingIndicatorProps) {
  const t = useTranslations('blog')

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  const containerSizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="relative">
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-muted border-t-primary',
              sizeClasses[size],
            )}
          />
        </div>
      </div>
    )
  }

  if (variant === 'search') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className={cn('flex items-center gap-3', containerSizeClasses[size])}>
            <div className="relative">
              <Search className={cn('animate-pulse text-primary', sizeClasses[size])} />
              <div className="absolute -inset-1 animate-ping rounded-full bg-primary/20" />
            </div>
            {showText && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{t('searchResults')}</p>
                <p className="text-xs text-muted-foreground animate-pulse">{t('loading')}...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-6', className)}>
        {/* Main Loading Animation */}
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <BookOpen className={cn('animate-bounce text-primary', sizeClasses[size])} />
              <div className="absolute -inset-2 animate-ping rounded-full bg-primary/20" />
            </div>
            <div className="flex space-x-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        {showText && (
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground animate-pulse">{t('loading')}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Fetching the latest articles for you...
            </p>
          </div>
        )}

        {/* Progress Indicators */}
        <div className="flex space-x-4">
          <Badge variant="secondary" className="animate-pulse">
            <TrendingUp className="w-3 h-3 mr-1" />
            Articles
          </Badge>
          <Badge variant="outline" className="animate-pulse">
            <Search className="w-3 h-3 mr-1" />
            Categories
          </Badge>
        </div>
      </div>
    )
  }

  // Default variant - минималистичный спиннер
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-muted/30 border-t-primary',
            sizeClasses[size],
          )}
        />
      </div>
    </div>
  )
}

// Progressive Loading Component
interface ProgressiveBlogLoadingProps {
  steps?: string[]
  currentStep?: number
  className?: string
}

export function ProgressiveBlogLoading({
  steps = ['Loading articles...', 'Fetching categories...', 'Preparing content...'],
  currentStep = 0,
  className,
}: ProgressiveBlogLoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-6', className)}>
      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Loading</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-foreground">
            {steps[currentStep] || 'Loading...'}
          </span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex space-x-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-2 w-2 rounded-full transition-all duration-300',
              index <= currentStep ? 'bg-primary' : 'bg-muted',
              index === currentStep && 'animate-pulse scale-125',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// Floating Loading Indicator
interface FloatingLoadingIndicatorProps {
  show: boolean
  className?: string
}

export function FloatingLoadingIndicator({ show, className }: FloatingLoadingIndicatorProps) {
  if (!show) return null

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300',
        className,
      )}
    >
      <div className="h-1 w-16 bg-muted/30 rounded-full overflow-hidden">
        <div className="h-full bg-primary animate-pulse rounded-full w-2/3" />
      </div>
    </div>
  )
}
