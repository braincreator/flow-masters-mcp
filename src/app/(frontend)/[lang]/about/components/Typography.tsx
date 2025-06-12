import React from 'react'
import { cn } from '@/utilities/ui'

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'subtitle' | 'body' | 'caption'
  className?: string
  children: React.ReactNode
  gradient?: boolean
  accent?: boolean
}

export function Typography({ 
  variant = 'body', 
  className, 
  children, 
  gradient = false,
  accent = false 
}: TypographyProps) {
  const baseClasses = {
    h1: 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight',
    h3: 'text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight',
    h4: 'text-xl md:text-2xl font-bold tracking-tight leading-tight',
    subtitle: 'text-lg md:text-xl text-muted-foreground leading-relaxed',
    body: 'text-base md:text-lg text-muted-foreground leading-relaxed',
    caption: 'text-sm text-muted-foreground leading-relaxed'
  }

  const gradientClass = gradient 
    ? 'bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent'
    : 'text-foreground'

  const accentClass = accent ? 'text-primary' : ''

  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p'

  return (
    <Component 
      className={cn(
        baseClasses[variant],
        gradient ? gradientClass : variant.startsWith('h') ? 'text-foreground' : '',
        accent ? accentClass : '',
        className
      )}
    >
      {children}
    </Component>
  )
}

// Specialized components for common patterns
export function SectionTitle({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="h2" 
      className={cn('text-center mb-4', className)} 
      {...props}
    >
      {children}
    </Typography>
  )
}

export function SectionSubtitle({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="subtitle" 
      className={cn('text-center mb-16 max-w-3xl mx-auto', className)} 
      {...props}
    >
      {children}
    </Typography>
  )
}

export function CardTitle({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="h4" 
      className={cn('mb-4', className)} 
      {...props}
    >
      {children}
    </Typography>
  )
}

export function CardDescription({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography 
      variant="body" 
      className={cn('leading-relaxed', className)} 
      {...props}
    >
      {children}
    </Typography>
  )
}
