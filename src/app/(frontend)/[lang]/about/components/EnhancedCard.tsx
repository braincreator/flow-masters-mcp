import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface EnhancedCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'bordered' | 'elevated'
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export function EnhancedCard({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  padding = 'md'
}: EnhancedCardProps) {
  const variants = {
    default: 'bg-card border border-border/50',
    gradient: 'bg-gradient-to-br from-card to-card/50 border border-border/30',
    bordered: 'bg-card border-2 border-border',
    elevated: 'bg-card border border-border/50 shadow-lg'
  }

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const hoverEffect = hover 
    ? 'transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-accent/50'
    : ''

  return (
    <Card className={cn(
      variants[variant],
      paddings[padding],
      hoverEffect,
      'rounded-xl',
      className
    )}>
      {children}
    </Card>
  )
}

export function StatCard({ 
  value, 
  label, 
  icon, 
  className 
}: { 
  value: string | number
  label: string
  icon?: React.ReactNode
  className?: string 
}) {
  return (
    <EnhancedCard variant="gradient" className={cn('text-center', className)}>
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
      <div className="text-5xl md:text-6xl font-bold text-accent mb-2">
        {value}
      </div>
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </EnhancedCard>
  )
}

export function ValueCard({ 
  title, 
  description, 
  icon, 
  className 
}: { 
  title: string
  description: string
  icon?: React.ReactNode
  className?: string 
}) {
  return (
    <EnhancedCard variant="elevated" className={cn('text-center', className)}>
      {icon && (
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-xl font-bold mb-4 text-foreground">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </EnhancedCard>
  )
}

export function ProcessCard({ 
  step, 
  title, 
  description, 
  className 
}: { 
  step: number
  title: string
  description: string
  className?: string 
}) {
  return (
    <EnhancedCard variant="bordered" className={cn('relative', className)}>
      <div className="absolute -top-6 left-6">
        <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg">
          {step}
        </div>
      </div>
      <div className="pt-8">
        <h3 className="text-xl font-bold mb-4 text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </EnhancedCard>
  )
}
