import { cn } from '@/utilities/ui'
import { type Locale } from '@/constants'
import { TagIcon, SparklesIcon, FlameIcon } from 'lucide-react'

interface DiscountBadgeProps {
  percentage: number
  className?: string
}

export function DiscountBadge({ percentage, className }: DiscountBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-xs font-semibold',
        'bg-gradient-to-r from-rose-600 to-red-500 text-white',
        'shadow-sm shadow-red-600/20',
        'animate-badge-pulse',
        'transform transition-all duration-300 hover:scale-105',
        className,
      )}
    >
      <TagIcon className="h-3 w-3" />-{percentage}%
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
        'inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-xs font-semibold',
        'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
        'shadow-sm shadow-blue-500/20',
        'transform transition-all duration-300 hover:scale-105',
        className,
      )}
    >
      <SparklesIcon className="h-3 w-3" />
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
        'inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-xs font-semibold',
        'bg-gradient-to-r from-amber-400 to-yellow-500 text-black',
        'shadow-sm shadow-amber-500/20',
        'transform transition-all duration-300 hover:scale-105',
        className,
      )}
    >
      <FlameIcon className="h-3 w-3" />
      {text}
    </span>
  )
}
