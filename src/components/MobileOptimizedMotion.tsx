'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import {
  useMobileAnimations,
  getSmoothAnimationProps,
  getMobileAnimationClasses,
  getGPUAcceleratedStyles
} from '@/hooks/useMobileAnimations'
import { cn } from '@/lib/utils'

interface MobileOptimizedMotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
  enableStagger?: boolean
  fallbackAnimation?: 'fade' | 'slide' | 'scale'
}

/**
 * Mobile-optimized animation component that automatically adjusts
 * animation complexity based on device capabilities.
 * Uses CSS animations on mobile for better performance.
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
    { threshold, rootMargin: '30px' },
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

  // For mobile or reduced motion, use optimized CSS animations
  if (config.preferCSSAnimations || config.shouldReduceMotion) {
    const animationClass = config.shouldReduceMotion
      ? 'opacity-100'
      : getMobileAnimationClasses(config, fallbackAnimation)

    const gpuStyles = getGPUAcceleratedStyles(config)

    return (
      <div
        ref={setNode}
        className={cn(
          'mobile-optimized-container',
          !hasAnimated && 'opacity-0',
          hasAnimated && animationClass,
          className
        )}
        style={{
          animationDelay: hasAnimated ? `${delay}ms` : undefined,
          ...gpuStyles,
        }}
      >
        {children}
      </div>
    )
  }

  // For desktop, use framer-motion with smooth optimized settings
  const animationProps = getSmoothAnimationProps(config, delay / 1000)
  const gpuStyles = getGPUAcceleratedStyles(config)

  return (
    <motion.div
      ref={setNode}
      className={cn('mobile-optimized-container', className)}
      style={gpuStyles}
      {...animationProps}
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
  const gpuStyles = getGPUAcceleratedStyles(config)

  // On mobile or reduced motion, disable staggered animations for performance
  if (config.preferCSSAnimations || config.shouldReduceMotion || !config.enableStaggeredAnimations) {
    return (
      <div className={cn('mobile-optimized-container', className)} style={gpuStyles}>
        {React.Children.map(children, (child, index) => (
          <MobileOptimizedMotion
            key={index}
            delay={config.enableStaggeredAnimations ? index * staggerDelay : 0}
            threshold={threshold}
            fallbackAnimation="fade"
          >
            {child}
          </MobileOptimizedMotion>
        ))}
      </div>
    )
  }

  // For desktop, use framer-motion with smooth staggered animations
  return (
    <div className={className} style={gpuStyles}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{
            duration: config.animationDuration,
            delay: index * (staggerDelay / 1000),
            ease: [0.25, 0.1, 0.25, 1], // Smooth cubic bezier
          }}
          className="mobile-optimized-container"
          style={gpuStyles}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Optimized wrapper for hover animations that are disabled on mobile
 * Uses GPU acceleration and smooth transitions
 */
interface MobileOptimizedHoverProps {
  children: React.ReactNode
  className?: string
  hoverClassName?: string
  disableScale?: boolean
}

export function MobileOptimizedHover({
  children,
  className,
  hoverClassName = 'hover:scale-[1.02] hover:shadow-lg',
  disableScale = false,
}: MobileOptimizedHoverProps) {
  const config = useMobileAnimations()
  const gpuStyles = getGPUAcceleratedStyles(config)

  // On mobile, use simple opacity hover or no hover at all
  const mobileHoverClass = config.isMobile
    ? 'active:opacity-80'
    : config.enableHoverAnimations
      ? hoverClassName
      : ''

  return (
    <div
      className={cn(
        className,
        mobileHoverClass,
        // Use shorter transition duration for smoother feel
        config.isMobile ? 'transition-opacity duration-200' : 'transition-all duration-300 ease-out',
        // Disable scale transforms on mobile if requested
        config.isMobile && disableScale && 'hover:scale-100'
      )}
      style={gpuStyles}
    >
      {children}
    </div>
  )
}
