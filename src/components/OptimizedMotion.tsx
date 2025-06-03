'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/utils'

interface OptimizedMotionProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade' | 'slide' | 'scale'
  delay?: number
  threshold?: number
  once?: boolean
}

export function OptimizedMotion({
  children,
  className,
  animation = 'fade',
  delay = 0,
  threshold = 0.1,
  once = true,
}: OptimizedMotionProps) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const [setNode, isIntersecting] = useIntersectionObserver(
    { threshold },
    once
  )

  useEffect(() => {
    if (isIntersecting && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [isIntersecting, hasAnimated, delay])

  const animationClass = {
    fade: 'animate-fade-in-optimized',
    slide: 'animate-slide-in-optimized',
    scale: 'animate-scale-in-optimized',
  }[animation]

  return (
    <div
      ref={setNode}
      className={cn(
        'opacity-0',
        hasAnimated && animationClass,
        hasAnimated && 'opacity-100',
        className
      )}
      style={{
        animationDelay: hasAnimated ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  )
}

// Мемоизированная версия для статичного контента
export const MemoizedOptimizedMotion = React.memo(OptimizedMotion)

// Компонент для группы анимаций
interface OptimizedMotionGroupProps {
  children: React.ReactNode[]
  staggerDelay?: number
  animation?: 'fade' | 'slide' | 'scale'
  className?: string
}

export function OptimizedMotionGroup({
  children,
  staggerDelay = 100,
  animation = 'fade',
  className,
}: OptimizedMotionGroupProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <OptimizedMotion
          key={index}
          animation={animation}
          delay={index * staggerDelay}
        >
          {child}
        </OptimizedMotion>
      ))}
    </div>
  )
}
