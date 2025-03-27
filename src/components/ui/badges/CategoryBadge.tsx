import React from 'react'
import { type Locale } from '@/constants'

interface CategoryBadgeProps {
  title: string | Record<string, string>
  locale: Locale
  className?: string
}

export function CategoryBadge({ title, locale, className }: CategoryBadgeProps) {
  const displayTitle = typeof title === 'object' ? title[locale] : title
  
  return (
    <span
      className={`text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full
        dark:border dark:border-border/50 dark:hover:border-accent/30
        transition-colors duration-200 ${className || ''}`}
    >
      {displayTitle}
    </span>
  )
} 