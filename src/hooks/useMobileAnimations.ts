'use client'

import { useState, useEffect } from 'react'

interface AnimationConfig {
  shouldReduceMotion: boolean
  isMobile: boolean
  isLowPerformance: boolean
  animationDuration: number
  enableComplexAnimations: boolean
  enableStaggeredAnimations: boolean
  enableHoverAnimations: boolean
}

/**
 * Hook for detecting mobile devices and optimizing animations accordingly
 * Reduces animation complexity on mobile devices to prevent choppiness
 */
export function useMobileAnimations(): AnimationConfig {
  const [config, setConfig] = useState<AnimationConfig>({
    shouldReduceMotion: false,
    isMobile: false,
    isLowPerformance: false,
    animationDuration: 0.6,
    enableComplexAnimations: true,
    enableStaggeredAnimations: true,
    enableHoverAnimations: true,
  })

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768

    // Detect low performance indicators
    const isLowPerformance = 
      // Low memory devices
      (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4 ||
      // Slow connection
      (navigator as any).connection && (navigator as any).connection.effectiveType === 'slow-2g' ||
      // Old mobile devices (rough heuristic)
      (isMobile && window.devicePixelRatio < 2)

    // Calculate optimized settings
    const shouldReduceMotion = prefersReducedMotion || isLowPerformance
    const animationDuration = isMobile ? 0.3 : shouldReduceMotion ? 0.1 : 0.6
    const enableComplexAnimations = !isMobile && !shouldReduceMotion
    const enableStaggeredAnimations = !isMobile && !shouldReduceMotion
    const enableHoverAnimations = !isMobile

    setConfig({
      shouldReduceMotion,
      isMobile,
      isLowPerformance,
      animationDuration,
      enableComplexAnimations,
      enableStaggeredAnimations,
      enableHoverAnimations,
    })

    // Listen for window resize to update mobile detection
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768
      if (newIsMobile !== isMobile) {
        setConfig(prev => ({
          ...prev,
          isMobile: newIsMobile,
          enableComplexAnimations: !newIsMobile && !shouldReduceMotion,
          enableStaggeredAnimations: !newIsMobile && !shouldReduceMotion,
          enableHoverAnimations: !newIsMobile,
        }))
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return config
}

/**
 * Get optimized animation props for framer-motion based on device capabilities
 */
export function getOptimizedAnimationProps(config: AnimationConfig) {
  if (config.shouldReduceMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    }
  }

  if (config.isMobile) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: { once: true, margin: '-20px' },
      transition: { duration: config.animationDuration, ease: 'easeOut' },
    }
  }

  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: config.animationDuration, ease: 'easeOut' },
  }
}

/**
 * Get CSS class names for mobile-optimized animations
 */
export function getMobileAnimationClasses(config: AnimationConfig) {
  if (config.shouldReduceMotion) {
    return 'opacity-100'
  }

  if (config.isMobile) {
    return 'mobile-fade-in'
  }

  return 'desktop-slide-in'
}
