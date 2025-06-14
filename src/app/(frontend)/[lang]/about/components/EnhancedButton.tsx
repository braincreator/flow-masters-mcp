'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

interface EnhancedButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
  external?: boolean
  disabled?: boolean
  loading?: boolean
  className?: string
  fullWidth?: boolean
  gradient?: boolean
  glow?: boolean
}

export function EnhancedButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  external = false,
  disabled = false,
  loading = false,
  className,
  fullWidth = false,
  gradient = false,
  glow = false,
}: EnhancedButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  const variantClasses = {
    primary: gradient
      ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 dark:hover:from-primary/95 dark:hover:to-primary/80 text-primary-foreground'
      : 'bg-primary hover:bg-primary/90 dark:hover:bg-primary/95 text-primary-foreground',
    secondary:
      'bg-secondary hover:bg-secondary/90 dark:hover:bg-secondary/95 text-secondary-foreground',
    outline:
      'border-2 border-primary/30 dark:border-primary/40 hover:border-primary/50 dark:hover:border-primary/60 text-foreground hover:text-primary hover:bg-primary/15 dark:hover:bg-primary/20',
    ghost: 'hover:bg-primary/15 dark:hover:bg-primary/20 text-foreground hover:text-primary',
  }

  const baseClasses = cn(
    'group relative overflow-hidden font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    sizeClasses[size],
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    glow
      ? 'shadow-lg dark:shadow-primary/10 hover:shadow-2xl dark:hover:shadow-primary/20'
      : 'hover:shadow-lg dark:hover:shadow-primary/10',
    className,
  )

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  }

  const content = (
    <>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {Icon && iconPosition === 'left' && (
          <Icon className={cn(iconClasses[size], 'transition-transform group-hover:scale-110')} />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon
            className={cn(iconClasses[size], 'transition-transform group-hover:translate-x-1')}
          />
        )}
        {!Icon && iconPosition === 'right' && (
          <ArrowRight
            className={cn(iconClasses[size], 'transition-transform group-hover:translate-x-1')}
          />
        )}
        {external && (
          <ExternalLink
            className={cn(iconClasses[size], 'transition-transform group-hover:scale-110')}
          />
        )}
      </span>

      {/* Hover effect overlay */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/25 dark:from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Glow effect */}
      {glow && (
        <div className="absolute inset-0 bg-primary/25 dark:bg-primary/30 rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-50 dark:group-hover:opacity-60 transition-opacity duration-500" />
      )}
    </>
  )

  if (href) {
    if (external) {
      return (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          aria-disabled={disabled}
        >
          {content}
        </motion.a>
      )
    }

    return (
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <Link href={href} className={baseClasses} aria-disabled={disabled}>
          {content}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {loading ? (
        <span className="relative z-10 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Загрузка...
        </span>
      ) : (
        content
      )}
    </motion.button>
  )
}

// Specialized button components
export function CTAButton({ children, ...props }: Omit<EnhancedButtonProps, 'variant' | 'size'>) {
  return (
    <EnhancedButton variant="primary" size="lg" gradient glow {...props}>
      {children}
    </EnhancedButton>
  )
}

export function SecondaryButton({ children, ...props }: Omit<EnhancedButtonProps, 'variant'>) {
  return (
    <EnhancedButton variant="outline" {...props}>
      {children}
    </EnhancedButton>
  )
}

export function SocialButton({
  platform,
  href,
  icon: Icon,
}: {
  platform: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <EnhancedButton
      href={href}
      external
      variant="outline"
      size="sm"
      icon={Icon}
      iconPosition="left"
      className="rounded-full px-6 py-3"
    >
      {platform}
    </EnhancedButton>
  )
}
