'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { useMobileAnimations, getOptimizedAnimationProps } from '@/hooks/useMobileAnimations'
import { cn } from '@/lib/utils'

interface MobileOptimizedMotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
  enableStagger?: boolean
  fallbackAnimation?: 'fade' | 'slide' | 'none'
}

/**
 * Mobile-optimized animation component that automatically adjusts
 * animation complexity based on device capabilities
 */
export function MobileOptimizedMotion({
  children,
  className,
  delay = 0,
  threshold = 0.1,
  enableStagger = false,
  fallbackAnimation = 'fade',
}: MobileOptimizedMotionProps) {
  const config = useMobileAnimations()
  const [hasAnimated, setHasAnimated] = useState(false)
  const [setNode, isIntersecting] = useIntersectionObserver(
    { threshold, rootMargin: '50px' },
    true // freeze once visible
  )

  useEffect(() => {
    if (isIntersecting && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [isIntersecting, hasAnimated, delay])

  // For reduced motion or mobile, use CSS animations
  if (config.shouldReduceMotion || config.isMobile) {
    const animationClass = config.shouldReduceMotion 
      ? 'opacity-100' 
      : config.isMobile 
        ? 'mobile-fade-in' 
        : 'desktop-slide-in'

    return (
      <div
        ref={setNode}
        className={cn(
          'mobile-optimized-container',
          !hasAnimated && 'opacity-0',
          hasAnimated && animationClass,
          config.isMobile && 'mobile-no-transform',
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

  // For desktop, use framer-motion with optimized props
  const animationProps = getOptimizedAnimationProps(config)

  return (
    <motion.div
      ref={setNode}
      className={cn('animated-section', className)}
      {...animationProps}
      transition={{
        ...animationProps.transition,
        delay: delay / 1000, // Convert to seconds for framer-motion
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Optimized motion component for groups of elements with staggered animations
 */
interface MobileOptimizedMotionGroupProps {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
  threshold?: number
}

export function MobileOptimizedMotionGroup({
  children,
  className,
  staggerDelay = 100,
  threshold = 0.1,
}: MobileOptimizedMotionGroupProps) {
  const config = useMobileAnimations()

  // On mobile, disable staggered animations for performance
  if (config.isMobile || config.shouldReduceMotion) {
    return (
      <div className={cn('mobile-optimized-container', className)}>
        {React.Children.map(children, (child, index) => (
          <MobileOptimizedMotion
            key={index}
            delay={config.enableStaggeredAnimations ? index * staggerDelay : 0}
            threshold={threshold}
          >
            {child}
          </MobileOptimizedMotion>
        ))}
      </div>
    )
  }

  // For desktop, use framer-motion with staggered animations
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: config.animationDuration,
            delay: index * (staggerDelay / 1000),
            ease: 'easeOut',
          }}
          className="animated-section"
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Simple wrapper for hover animations that are disabled on mobile
 */
interface MobileOptimizedHoverProps {
  children: React.ReactNode
  className?: string
  hoverClassName?: string
}

export function MobileOptimizedHover({
  children,
  className,
  hoverClassName = 'hover:scale-105 hover:shadow-lg',
}: MobileOptimizedHoverProps) {
  const config = useMobileAnimations()

  return (
    <div
      className={cn(
        className,
        config.enableHoverAnimations ? hoverClassName : 'mobile-simple-hover',
        'transition-all duration-300'
      )}
    >
      {children}
    </div>
  )
}
