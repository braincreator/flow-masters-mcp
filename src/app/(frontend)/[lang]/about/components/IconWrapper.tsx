'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utilities/ui'

interface IconWrapperProps {
  icon: React.ComponentType<{ className?: string }>
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'filled' | 'outlined' | 'gradient' | 'glass'
  color?: 'primary' | 'secondary' | 'accent' | 'muted'
  shape?: 'circle' | 'square' | 'rounded'
  glow?: boolean
  pulse?: boolean
  hover?: boolean
  className?: string
  delay?: number
}

export function IconWrapper({
  icon: Icon,
  size = 'md',
  variant = 'default',
  color = 'primary',
  shape = 'rounded',
  glow = false,
  pulse = false,
  hover = true,
  className,
  delay = 0
}: IconWrapperProps) {
  const sizeClasses = {
    sm: { container: 'w-12 h-12', icon: 'w-6 h-6' },
    md: { container: 'w-16 h-16', icon: 'w-8 h-8' },
    lg: { container: 'w-20 h-20', icon: 'w-10 h-10' },
    xl: { container: 'w-24 h-24', icon: 'w-12 h-12' },
    '2xl': { container: 'w-32 h-32', icon: 'w-16 h-16' }
  }

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-2xl'
  }

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    muted: 'text-muted-foreground'
  }

  const variantClasses = {
    default: `bg-${color}/10`,
    filled: `bg-${color} text-${color}-foreground`,
    outlined: `border-2 border-${color}/20 bg-transparent`,
    gradient: `bg-gradient-to-br from-${color}/20 to-${color}/10`,
    glass: `bg-gradient-to-br from-${color}/20 to-${color}/10 backdrop-blur-sm border border-${color}/20`
  }

  const hoverClasses = hover ? {
    default: `hover:bg-${color}/20 hover:shadow-lg`,
    filled: `hover:bg-${color}/90 hover:shadow-xl`,
    outlined: `hover:border-${color}/40 hover:bg-${color}/5`,
    gradient: `hover:from-${color}/30 hover:to-${color}/15 hover:shadow-lg`,
    glass: `hover:from-${color}/30 hover:to-${color}/15 hover:shadow-xl hover:border-${color}/30`
  } : {}

  const baseClasses = cn(
    'flex items-center justify-center transition-all duration-500 relative',
    sizeClasses[size].container,
    shapeClasses[shape],
    variantClasses[variant],
    hover ? hoverClasses[variant] : '',
    className
  )

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className={baseClasses}>
        {/* Glow effect */}
        {glow && (
          <div className={cn(
            'absolute inset-0 blur-xl scale-110 opacity-20',
            `bg-${color}`,
            shapeClasses[shape]
          )} />
        )}
        
        {/* Icon */}
        <Icon className={cn(
          sizeClasses[size].icon,
          variant === 'filled' ? 'text-current' : colorClasses[color],
          pulse ? 'animate-pulse' : ''
        )} />
      </div>
    </motion.div>
  )
}

// Specialized icon components
export function FeatureIcon({ 
  icon, 
  delay = 0 
}: { 
  icon: React.ComponentType<{ className?: string }>
  delay?: number 
}) {
  return (
    <IconWrapper
      icon={icon}
      size="lg"
      variant="gradient"
      color="primary"
      shape="rounded"
      glow
      delay={delay}
    />
  )
}

export function StatIcon({ 
  icon, 
  delay = 0 
}: { 
  icon: React.ComponentType<{ className?: string }>
  delay?: number 
}) {
  return (
    <IconWrapper
      icon={icon}
      size="xl"
      variant="glass"
      color="primary"
      shape="rounded"
      hover
      delay={delay}
    />
  )
}

export function ProcessIcon({ 
  icon, 
  step,
  delay = 0 
}: { 
  icon: React.ComponentType<{ className?: string }>
  step: number
  delay?: number 
}) {
  return (
    <div className="relative">
      <IconWrapper
        icon={icon}
        size="xl"
        variant="glass"
        color="primary"
        shape="rounded"
        hover
        delay={delay}
      />
      
      {/* Step number */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
        viewport={{ once: true }}
        className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-xl"
      >
        {step}
      </motion.div>
    </div>
  )
}

export function SocialIcon({ 
  icon, 
  platform,
  delay = 0 
}: { 
  icon: React.ComponentType<{ className?: string }>
  platform: string
  delay?: number 
}) {
  return (
    <IconWrapper
      icon={icon}
      size="sm"
      variant="outlined"
      color="primary"
      shape="circle"
      hover
      delay={delay}
      className="group-hover:scale-110"
    />
  )
}

// Animated icon with floating effect
export function FloatingIcon({ 
  icon, 
  delay = 0 
}: { 
  icon: React.ComponentType<{ className?: string }>
  delay?: number 
}) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
      }}
    >
      <IconWrapper
        icon={icon}
        size="2xl"
        variant="gradient"
        color="primary"
        shape="rounded"
        glow
        hover={false}
      />
    </motion.div>
  )
}
