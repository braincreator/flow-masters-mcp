'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Gift, Clock } from 'lucide-react'
import { useAnalytics } from '@/providers/AnalyticsProvider'
import { cn } from '@/lib/utils'

interface TrackedCTAProps {
  text: string
  section: string
  variant?: 'primary' | 'secondary' | 'urgent' | 'gift'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: 'arrow' | 'zap' | 'gift' | 'clock' | 'none'
  position?: number
  onClick?: () => void
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  pulse?: boolean
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
  secondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-white',
  urgent:
    'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl animate-pulse',
  gift: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl',
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
}

const iconComponents = {
  arrow: ArrowRight,
  zap: Zap,
  gift: Gift,
  clock: Clock,
  none: null,
}

export function TrackedCTA({
  text,
  section,
  variant = 'primary',
  size = 'lg',
  icon = 'arrow',
  position = 0,
  onClick,
  className,
  disabled = false,
  fullWidth = false,
  pulse = false,
}: TrackedCTAProps) {
  const { trackEvent } = useAnalytics()
  const IconComponent = iconComponents[icon]

  const trackCTAClick = (text: string, section: string, position: number) => {
    trackEvent('interaction', 'cta_click', `${section}_${text}`, position, {
      section,
      text,
      position,
      variant,
      size,
    })
  }

  const handleClick = () => {
    if (!disabled) {
      trackCTAClick(text, section, position)
      onClick?.()
    }
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'font-semibold rounded-xl transition-all duration-300 group relative overflow-hidden',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        pulse && 'animate-pulse',
        disabled && 'opacity-50 cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className,
      )}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

      <span className="relative flex items-center justify-center gap-2">
        {text}
        {IconComponent && (
          <IconComponent
            className={cn(
              'transition-transform duration-300',
              icon === 'arrow' && 'group-hover:translate-x-1',
              icon === 'zap' && 'group-hover:scale-110',
              icon === 'gift' && 'group-hover:rotate-12',
              icon === 'clock' && 'group-hover:rotate-180',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-5 h-5',
              size === 'lg' && 'w-5 h-5',
              size === 'xl' && 'w-6 h-6',
            )}
          />
        )}
      </span>
    </motion.button>
  )
}

// Специализированные CTA компоненты
export function UrgentCTA({
  text,
  section,
  position,
  onClick,
  className,
}: Omit<TrackedCTAProps, 'variant' | 'icon'>) {
  return (
    <TrackedCTA
      text={text}
      section={section}
      variant="urgent"
      icon="zap"
      position={position}
      onClick={onClick}
      className={className}
      pulse
    />
  )
}

export function GiftCTA({
  text,
  section,
  position,
  onClick,
  className,
}: Omit<TrackedCTAProps, 'variant' | 'icon'>) {
  return (
    <TrackedCTA
      text={text}
      section={section}
      variant="gift"
      icon="gift"
      position={position}
      onClick={onClick}
      className={className}
    />
  )
}

export function SecondaryCTA({
  text,
  section,
  position,
  onClick,
  className,
}: Omit<TrackedCTAProps, 'variant'>) {
  return (
    <TrackedCTA
      text={text}
      section={section}
      variant="secondary"
      position={position}
      onClick={onClick}
      className={className}
    />
  )
}
