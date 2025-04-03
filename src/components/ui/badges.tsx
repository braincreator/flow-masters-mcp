import { cn } from '@/utilities/ui'
import { type Locale } from '@/constants'

interface DiscountBadgeProps {
  percentage: number
  className?: string
}

export function DiscountBadge({ percentage, className }: DiscountBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground',
        className,
      )}
    >
      -{percentage}%
    </span>
  )
}

interface NewBadgeProps {
  locale: Locale
  className?: string
}

export function NewBadge({ locale, className }: NewBadgeProps) {
  const text = locale === 'ru' ? 'Новинка' : 'New'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white',
        className,
      )}
    >
      {text}
    </span>
  )
}

interface BestsellerBadgeProps {
  locale: Locale
  className?: string
}

export function BestsellerBadge({ locale, className }: BestsellerBadgeProps) {
  const text = locale === 'ru' ? 'Хит продаж' : 'Bestseller'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-black',
        className,
      )}
    >
      {text}
    </span>
  )
}
