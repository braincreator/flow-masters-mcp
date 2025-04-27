'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'

export interface Breakpoints {
  sm: boolean // Small devices (640px and up)
  md: boolean // Medium devices (768px and up)
  lg: boolean // Large devices (1024px and up)
  xl: boolean // Extra large devices (1280px and up)
  xxl: boolean // Extra extra large devices (1536px and up)
}

export interface MediaQueryContextType extends Breakpoints {
  // Device type shortcuts
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  
  // Orientation
  orientation: 'portrait' | 'landscape'
  
  // Preference queries
  prefersReducedMotion: boolean
  prefersColorScheme: 'dark' | 'light' | 'no-preference'
  
  // Viewport dimensions
  viewportWidth: number
  viewportHeight: number
}

const defaultBreakpoints: Breakpoints = {
  sm: false,
  md: false,
  lg: false,
  xl: false,
  xxl: false
}

const MediaQueryContext = createContext<MediaQueryContextType | undefined>(undefined)

export function MediaQueryProvider({ children }: { children: ReactNode }) {
  // Initialize with default values
  const [breakpoints, setBreakpoints] = useState<Breakpoints>(defaultBreakpoints)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [prefersColorScheme, setPrefersColorScheme] = useState<'dark' | 'light' | 'no-preference'>('no-preference')
  const [viewportWidth, setViewportWidth] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Update all media queries
    const updateMediaQueries = () => {
      // Update breakpoints
      setBreakpoints({
        sm: window.matchMedia('(min-width: 640px)').matches,
        md: window.matchMedia('(min-width: 768px)').matches,
        lg: window.matchMedia('(min-width: 1024px)').matches,
        xl: window.matchMedia('(min-width: 1280px)').matches,
        xxl: window.matchMedia('(min-width: 1536px)').matches,
      })
      
      // Update orientation
      setOrientation(
        window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
      )
      
      // Update prefers-reduced-motion
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
      
      // Update prefers-color-scheme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setPrefersColorScheme('dark')
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        setPrefersColorScheme('light')
      } else {
        setPrefersColorScheme('no-preference')
      }
      
      // Update viewport dimensions
      setViewportWidth(window.innerWidth)
      setViewportHeight(window.innerHeight)
    }
    
    // Initial update
    updateMediaQueries()
    
    // Add resize listener
    window.addEventListener('resize', updateMediaQueries)
    
    // Add media query change listeners
    const mediaQueryLists = [
      window.matchMedia('(min-width: 640px)'),
      window.matchMedia('(min-width: 768px)'),
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(min-width: 1280px)'),
      window.matchMedia('(min-width: 1536px)'),
      window.matchMedia('(orientation: portrait)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-color-scheme: light)'),
    ]
    
    mediaQueryLists.forEach(mql => {
      mql.addEventListener('change', updateMediaQueries)
    })
    
    return () => {
      window.removeEventListener('resize', updateMediaQueries)
      mediaQueryLists.forEach(mql => {
        mql.removeEventListener('change', updateMediaQueries)
      })
    }
  }, [])
  
  // Derive device type from breakpoints
  const isMobile = useMemo(() => !breakpoints.md, [breakpoints.md])
  const isTablet = useMemo(() => breakpoints.md && !breakpoints.lg, [breakpoints.md, breakpoints.lg])
  const isDesktop = useMemo(() => breakpoints.lg && !breakpoints.xl, [breakpoints.lg, breakpoints.xl])
  const isLargeDesktop = useMemo(() => breakpoints.xl, [breakpoints.xl])
  
  // Memoize context value
  const value = useMemo(() => ({
    ...breakpoints,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    orientation,
    prefersReducedMotion,
    prefersColorScheme,
    viewportWidth,
    viewportHeight,
  }), [
    breakpoints,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    orientation,
    prefersReducedMotion,
    prefersColorScheme,
    viewportWidth,
    viewportHeight,
  ])
  
  return (
    <MediaQueryContext.Provider value={value}>
      {children}
    </MediaQueryContext.Provider>
  )
}

export function useMediaQuery() {
  const context = useContext(MediaQueryContext)
  if (context === undefined) {
    throw new Error('useMediaQuery must be used within a MediaQueryProvider')
  }
  return context
}
