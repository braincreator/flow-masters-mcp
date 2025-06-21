'use client'

import React from 'react'
import {
  MobileOptimizedMotion,
  MobileOptimizedMotionGroup,
  MobileOptimizedHover
} from '@/components/MobileOptimizedMotion'
import {
  useMobileAnimations,
  getSmoothAnimationProps,
  getGPUAcceleratedStyles
} from '@/hooks/useMobileAnimations'
import { cn } from '@/lib/utils'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  stagger?: boolean
  once?: boolean
  fallbackAnimation?: 'fade' | 'slide' | 'scale'
}

/**
 * Optimized AnimatedSection that uses our mobile-optimized animation system
 * Automatically switches between CSS and JS animations based on device capabilities
 */
export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = 'up',
  stagger = false,
  once = true,
  fallbackAnimation = 'fade'
}: AnimatedSectionProps) {
  const animationConfig = useMobileAnimations()

  // Map direction to fallback animation type
  const getAnimationType = (dir: string): 'fade' | 'slide' | 'scale' => {
    switch (dir) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        return 'slide'
      case 'fade':
        return 'fade'
      default:
        return fallbackAnimation
    }
  }

  const animationType = getAnimationType(direction)

  // For staggered animations, use MobileOptimizedMotionGroup
  if (stagger) {
    return (
      <MobileOptimizedMotionGroup
        className={cn('mobile-optimized-container', className)}
        staggerDelay={animationConfig.isMobile ? 50 : 100}
      >
        {React.Children.toArray(children)}
      </MobileOptimizedMotionGroup>
    )
  }

  // For single animations, use MobileOptimizedMotion
  return (
    <MobileOptimizedMotion
      className={cn('mobile-optimized-container', className)}
      delay={delay}
      fallbackAnimation={animationType}
    >
      {children}
    </MobileOptimizedMotion>
  )
}

// Specialized optimized animation components
export function FadeInUp({ children, delay = 0, className }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <MobileOptimizedMotion delay={delay} className={className} fallbackAnimation="slide">
      {children}
    </MobileOptimizedMotion>
  )
}

export function FadeInLeft({ children, delay = 0, className }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <MobileOptimizedMotion delay={delay} className={className} fallbackAnimation="slide">
      {children}
    </MobileOptimizedMotion>
  )
}

export function FadeInRight({ children, delay = 0, className }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <MobileOptimizedMotion delay={delay} className={className} fallbackAnimation="slide">
      {children}
    </MobileOptimizedMotion>
  )
}

export function StaggeredFadeIn({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <MobileOptimizedMotionGroup className={className}>
      {React.Children.toArray(children)}
    </MobileOptimizedMotionGroup>
  )
}

// Optimized hover wrapper
export function AnimatedHover({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <MobileOptimizedHover className={className}>
      {children}
    </MobileOptimizedHover>
  )
}
