import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Award } from 'lucide-react'
import { type Locale } from '@/constants'

interface BestsellerBadgeProps {
  locale: Locale
  className?: string
}

export function BestsellerBadge({ locale, className }: BestsellerBadgeProps) {
  return (
    <Badge variant="secondary" className={`flex items-center gap-1 ${className || ''}`}>
      <Award className="h-3 w-3" />
      {locale === 'ru' ? 'Хит продаж' : 'Bestseller'}
    </Badge>
  )
}
