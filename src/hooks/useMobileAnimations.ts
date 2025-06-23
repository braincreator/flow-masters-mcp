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
  useGPUAcceleration: boolean
  preferCSSAnimations: boolean
}

/**
 * Hook for detecting mobile devices and optimizing animations accordingly
 * Aggressively reduces animation complexity on mobile devices to prevent choppiness
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
    useGPUAcceleration: true,
    preferCSSAnimations: false,
  })

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // More aggressive mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768 || 'ontouchstart' in window

    // Enhanced low performance detection
    const isLowPerformance =
      // Low memory devices (less than 4GB)
      (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4 ||
      // Slow connection
      (navigator as any).connection &&
      ((navigator as any).connection.effectiveType === 'slow-2g' ||
       (navigator as any).connection.effectiveType === '2g') ||
      // Old mobile devices or low pixel density
      (isMobile && window.devicePixelRatio < 2) ||
      // Low hardware concurrency (single/dual core)
      navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4

    // Very aggressive optimization for mobile
    const finalShouldReduceMotion = prefersReducedMotion || isLowPerformance || isMobile
    const animationDuration = finalShouldReduceMotion ? 0.2 : isMobile ? 0.25 : 0.5

    // Disable complex animations on mobile entirely
    const enableComplexAnimations = !isMobile && !finalShouldReduceMotion && !isLowPerformance
    const enableStaggeredAnimations = !isMobile && !finalShouldReduceMotion
    const enableHoverAnimations = !isMobile && !('ontouchstart' in window)

    // Always use GPU acceleration when available
    const useGPUAcceleration = true

    // Prefer CSS animations on mobile and low-performance devices
    const preferCSSAnimations = isMobile || isLowPerformance || finalShouldReduceMotion

    setConfig({
      shouldReduceMotion: finalShouldReduceMotion,
      isMobile,
      isLowPerformance,
      animationDuration,
      enableComplexAnimations,
      enableStaggeredAnimations,
      enableHoverAnimations,
      useGPUAcceleration,
      preferCSSAnimations,
    })

    // Listen for window resize to update mobile detection
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768 || 'ontouchstart' in window
      if (newIsMobile !== isMobile) {
        const newFinalShouldReduceMotion = prefersReducedMotion || isLowPerformance || newIsMobile
        setConfig(prev => ({
          ...prev,
          isMobile: newIsMobile,
          shouldReduceMotion: newFinalShouldReduceMotion,
          enableComplexAnimations: !newIsMobile && !newFinalShouldReduceMotion && !isLowPerformance,
          enableStaggeredAnimations: !newIsMobile && !newFinalShouldReduceMotion,
          enableHoverAnimations: !newIsMobile && !('ontouchstart' in window),
          preferCSSAnimations: newIsMobile || isLowPerformance || newFinalShouldReduceMotion,
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
 * Heavily optimized for mobile performance
 */
export function getOptimizedAnimationProps(config: AnimationConfig) {
  // For reduced motion or mobile, return minimal animation
  if (config.shouldReduceMotion || config.preferCSSAnimations) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    }
  }

  // For mobile devices, use only opacity changes
  if (config.isMobile) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: { once: true, margin: '-10px' },
      transition: {
        duration: config.animationDuration,
        ease: [0.25, 0.1, 0.25, 1], // Smooth easing curve
      },
    }
  }

  // For desktop, allow more complex animations but with smooth easing
  return {
    initial: { opacity: 0, y: 15 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-30px' },
    transition: {
      duration: config.animationDuration,
      ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for smooth motion
    },
  }
}

/**
 * Get smooth animation props that eliminate snap-to-place effects
 */
export function getSmoothAnimationProps(config: AnimationConfig, delay: number = 0) {
  if (config.shouldReduceMotion || config.preferCSSAnimations) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    }
  }

  const smoothEasing = [0.25, 0.1, 0.25, 1] // Smooth cubic bezier

  if (config.isMobile) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: { once: true, margin: '-10px' },
      transition: {
        duration: config.animationDuration,
        delay,
        ease: smoothEasing,
      },
    }
  }

  return {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-30px' },
    transition: {
      duration: config.animationDuration,
      delay,
      ease: smoothEasing,
    },
  }
}

/**
 * Get CSS class names for mobile-optimized animations
 */
export function getMobileAnimationClasses(config: AnimationConfig, variant: 'fade' | 'slide' | 'scale' = 'fade') {
  if (config.shouldReduceMotion) {
    return 'opacity-100'
  }

  if (config.preferCSSAnimations || config.isMobile) {
    switch (variant) {
      case 'slide':
        return 'mobile-slide-up-smooth'
      case 'scale':
        return 'mobile-scale-in-smooth'
      default:
        return 'mobile-fade-in-smooth'
    }
  }

  return 'desktop-slide-in-smooth'
}

/**
 * Get GPU-accelerated CSS properties for smooth animations
 */
export function getGPUAcceleratedStyles(config: AnimationConfig) {
  if (!config.useGPUAcceleration) {
    return {}
  }

  return {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden' as const,
    willChange: 'transform, opacity',
  }
}

/**
 * Get optimized hover animation props
 */
export function getOptimizedHoverProps(config: AnimationConfig) {
  if (!config.enableHoverAnimations || config.isMobile) {
    return {}
  }

  return {
    whileHover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    whileTap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
  }
}
