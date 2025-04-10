'use client'

import React, { useState } from 'react'
import { GridContainer } from '@/components/GridContainer'
import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import type { BannerBlock as BannerBlockType } from '@/types/blocks'
import { cn } from '@/utilities/cn'

type BannerStyle = 'info' | 'success' | 'warning' | 'error'
type BannerPosition = 'top' | 'bottom' | 'inline'

const styleVariants: Record<
  BannerStyle,
  {
    bg: string
    icon: React.ComponentType<{ className?: string }>
    iconColor: string
  }
> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    icon: Info,
    iconColor: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/50',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/50',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/50',
    icon: AlertCircle,
    iconColor: 'text-red-500',
  },
}

const positionStyles: Record<BannerPosition, string> = {
  top: 'fixed top-0 left-0 right-0 z-50',
  bottom: 'fixed bottom-0 left-0 right-0 z-50',
  inline: 'relative',
}

interface BannerProps extends BannerBlockType {
  className?: string
  style?: BannerStyle
  position?: BannerPosition
  isDismissible?: boolean
}

export const Banner: React.FC<BannerProps> = ({
  content,
  actions,
  settings,
  className,
  style = 'info',
  position = 'inline',
  isDismissible = true,
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const variant = styleVariants[style]
  const Icon = variant.icon

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'w-full',
        variant.bg,
        positionStyles[position],
        position !== 'inline' && 'animate-in slide-in-from-top-2 duration-300',
        className,
      )}
      role="alert"
    >
      <GridContainer settings={settings}>
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', variant.iconColor)} />
            <div className="flex-1 text-sm">
              <RichText content={content} />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.style === 'secondary' ? 'outline' : 'default'}
                size="sm"
                href={action.href}
              >
                {action.label}
              </Button>
            ))}
            {isDismissible && (
              <button
                onClick={() => setIsVisible(false)}
                className={cn(
                  'rounded-full p-1 hover:bg-background/10 transition-colors',
                  variant.iconColor,
                )}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </button>
            )}
          </div>
        </div>
      </GridContainer>
    </div>
  )
}

export const BannerBlock = Banner
export default Banner
