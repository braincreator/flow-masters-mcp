import React from 'react'
import { Badge } from '@/components/ui/badge'
import { type Locale } from '@/constants'

interface NewBadgeProps {
  locale: Locale
  className?: string
}

export function NewBadge({ locale, className }: NewBadgeProps) {
  return (
    <Badge variant="default" className={`bg-accent text-accent-foreground ${className || ''}`}>
      {locale === 'ru' ? 'Новинка' : 'New'}
    </Badge>
  )
}
