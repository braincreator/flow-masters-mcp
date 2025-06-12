'use client'

import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  stagger?: boolean
  once?: boolean
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = 'up',
  stagger = false,
  once = true
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reduced motion variants
  const reducedMotionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  // Full motion variants
  const motionVariants = {
    up: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    },
    down: {
      hidden: { opacity: 0, y: -30 },
      visible: { opacity: 1, y: 0 }
    },
    left: {
      hidden: { opacity: 0, x: -30 },
      visible: { opacity: 1, x: 0 }
    },
    right: {
      hidden: { opacity: 0, x: 30 },
      visible: { opacity: 1, x: 0 }
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    }
  }

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay
      }
    }
  }

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  // Don't render animations on server
  if (!isMounted) {
    return <div className={className}>{children}</div>
  }

  const variants = shouldReduceMotion ? reducedMotionVariants : motionVariants[direction]
  const transition = {
    duration: shouldReduceMotion ? 0.3 : 0.6,
    delay: shouldReduceMotion ? 0 : delay,
    ease: 'easeOut'
  }

  if (stagger) {
    return (
      <motion.div
        className={className}
        variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-50px' }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}

// Specialized animation components
export function FadeInUp({ children, delay = 0, className }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <AnimatedSection direction="up" delay={delay} className={className}>
      {children}
    </AnimatedSection>
  )
}

export function FadeInLeft({ children, delay = 0, className }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <AnimatedSection direction="left" delay={delay} className={className}>
      {children}
    </AnimatedSection>
  )
}

export function FadeInRight({ children, delay = 0, className }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <AnimatedSection direction="right" delay={delay} className={className}>
      {children}
    </AnimatedSection>
  )
}

export function StaggeredFadeIn({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <AnimatedSection stagger className={className}>
      {children}
    </AnimatedSection>
  )
}

// Hook for scroll-triggered animations
export function useScrollAnimation() {
  const shouldReduceMotion = useReducedMotion()
  
  return {
    fadeInUp: shouldReduceMotion 
      ? { opacity: 1 }
      : {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-50px' },
          transition: { duration: 0.6, ease: 'easeOut' }
        },
    fadeInLeft: shouldReduceMotion
      ? { opacity: 1 }
      : {
          initial: { opacity: 0, x: -30 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: '-50px' },
          transition: { duration: 0.6, ease: 'easeOut' }
        },
    fadeInRight: shouldReduceMotion
      ? { opacity: 1 }
      : {
          initial: { opacity: 0, x: 30 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: '-50px' },
          transition: { duration: 0.6, ease: 'easeOut' }
        }
  }
}
