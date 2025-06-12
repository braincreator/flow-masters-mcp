'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utilities/ui'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'glass' | 'gradient'
  hover?: boolean
  accent?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  delay?: number
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  accent = false,
  padding = 'lg',
  rounded = '3xl',
  delay = 0
}: CardProps) {
  const baseClasses = 'relative overflow-hidden transition-all duration-500'
  
  const variantClasses = {
    default: 'bg-card border border-border/50',
    elevated: 'bg-card border border-border/50 shadow-lg hover:shadow-xl',
    glass: 'bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/30',
    gradient: 'bg-gradient-to-br from-card via-card/90 to-card/70 border border-border/40'
  }

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  }

  const roundedClasses = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl'
  }

  const hoverClasses = hover 
    ? 'hover:scale-[1.02] hover:shadow-2xl hover:border-primary/40 group'
    : ''

  const accentClasses = accent
    ? 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500'
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        roundedClasses[rounded],
        hoverClasses,
        accentClasses,
        className
      )}
    >
      {children}
    </motion.div>
  )
}

// Specialized card components
export function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  description, 
  delay = 0 
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  description?: string
  delay?: number
}) {
  return (
    <Card variant="glass" hover accent delay={delay} className="text-center group">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.1 }}
        viewport={{ once: true }}
        className="relative z-10 flex justify-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500">
          <Icon className="w-10 h-10 text-primary" />
        </div>
      </motion.div>

      {/* Value */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
        viewport={{ once: true }}
        className="relative z-10 mb-6"
      >
        <div className="text-5xl md:text-6xl font-bold text-foreground mb-3 tracking-tight">
          {value}
        </div>
        <div className="text-lg font-semibold text-primary uppercase tracking-wide">
          {label}
        </div>
      </motion.div>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: delay + 0.3 }}
          viewport={{ once: true }}
          className="relative z-10 text-sm text-muted-foreground leading-relaxed"
        >
          {description}
        </motion.p>
      )}
    </Card>
  )
}

export function ValueCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  delay?: number
}) {
  return (
    <Card variant="glass" hover accent delay={delay} className="text-center h-full">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.1 }}
        viewport={{ once: true }}
        className="relative z-10 mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 mx-auto">
          <Icon className="w-10 h-10 text-primary" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
          viewport={{ once: true }}
          className="text-2xl font-bold mb-4 text-foreground tracking-tight"
        >
          {title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: delay + 0.3 }}
          viewport={{ once: true }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          {description}
        </motion.p>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  )
}
