'use client'

import { useContext } from 'react'
import { MediaQueryContext } from '@/providers/MediaQueryProvider'
import type { Breakpoints } from '@/providers/MediaQueryProvider'

/**
 * Custom hook to select specific parts of the media query context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 * 
 * @param selector A function that selects specific parts of the media query context
 * @returns The selected parts of the media query context
 */
export function useMediaQuerySelector<T>(selector: (context: any) => T): T {
  const context = useContext(MediaQueryContext)
  
  if (context === undefined) {
    throw new Error('useMediaQuerySelector must be used within a MediaQueryProvider')
  }
  
  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the breakpoint information
 */
export function useBreakpoints() {
  return useMediaQuerySelector(context => ({
    sm: context.sm,
    md: context.md,
    lg: context.lg,
    xl: context.xl,
    xxl: context.xxl,
  }))
}

/**
 * Select only the device type information
 */
export function useDeviceType() {
  return useMediaQuerySelector(context => ({
    isMobile: context.isMobile,
    isTablet: context.isTablet,
    isDesktop: context.isDesktop,
    isLargeDesktop: context.isLargeDesktop,
  }))
}

/**
 * Select only the orientation information
 */
export function useOrientation() {
  return useMediaQuerySelector(context => ({
    orientation: context.orientation,
    isPortrait: context.orientation === 'portrait',
    isLandscape: context.orientation === 'landscape',
  }))
}

/**
 * Select only the user preference information
 */
export function useUserPreferences() {
  return useMediaQuerySelector(context => ({
    prefersReducedMotion: context.prefersReducedMotion,
    prefersColorScheme: context.prefersColorScheme,
    prefersDarkMode: context.prefersColorScheme === 'dark',
    prefersLightMode: context.prefersColorScheme === 'light',
  }))
}

/**
 * Select only the viewport dimensions
 */
export function useViewportSize() {
  return useMediaQuerySelector(context => ({
    viewportWidth: context.viewportWidth,
    viewportHeight: context.viewportHeight,
    aspectRatio: context.viewportWidth / context.viewportHeight,
  }))
}

/**
 * Create a responsive value based on breakpoints
 * @param values Object containing values for different breakpoints
 * @returns The value for the current breakpoint
 * 
 * @example
 * const fontSize = useResponsiveValue({
 *   base: '16px',
 *   sm: '18px',
 *   md: '20px',
 *   lg: '22px',
 *   xl: '24px',
 * })
 */
export function useResponsiveValue<T>(values: {
  base: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  xxl?: T
}): T {
  const { sm, md, lg, xl, xxl } = useBreakpoints()
  
  if (xxl && values.xxl !== undefined) return values.xxl
  if (xl && values.xl !== undefined) return values.xl
  if (lg && values.lg !== undefined) return values.lg
  if (md && values.md !== undefined) return values.md
  if (sm && values.sm !== undefined) return values.sm
  return values.base
}
