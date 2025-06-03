'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoading } from '@/providers/LoadingProvider'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useDeviceType, useMediaQueryUserPreferences } from '@/hooks/useMediaQuerySelector'

// Simple CSS-based loader for better performance
function SimpleLoader() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Central circle */}
        <div
          className={cn(
            'w-16 h-16 rounded-full border-4 border-t-transparent animate-spin',
            isDark ? 'border-blue-400' : 'border-blue-600'
          )}
        />
        
        {/* Inner circle */}
        <div
          className={cn(
            'absolute top-2 left-2 w-12 h-12 rounded-full border-2 border-b-transparent animate-spin',
            isDark ? 'border-purple-400' : 'border-purple-600'
          )}
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
        
        {/* Core */}
        <div
          className={cn(
            'absolute top-6 left-6 w-4 h-4 rounded-full animate-pulse',
            isDark ? 'bg-indigo-400' : 'bg-indigo-600'
          )}
        />
      </div>
    </div>
  )
}

// Lightweight particle effect using CSS
function CSSParticles() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'absolute w-2 h-2 rounded-full animate-pulse-subtle',
            isDark ? 'bg-blue-400/30' : 'bg-blue-600/30'
          )}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  )
}

export function OptimizedLoader() {
  const { isLoading, progress } = useLoading()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { isMobile } = useDeviceType()
  const { prefersReducedMotion } = useMediaQueryUserPreferences()
  
  // Check if device can handle WebGL
  const [canUseWebGL, setCanUseWebGL] = useState(false)

  useEffect(() => {
    // Simple WebGL capability check
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    setCanUseWebGL(!!gl && !isMobile && !prefersReducedMotion)
  }, [isMobile, prefersReducedMotion])

  if (!isLoading) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background */}
        <div 
          className={cn(
            'absolute inset-0',
            isDark ? 'bg-gray-900/95' : 'bg-white/95'
          )} 
        />

        {/* Particles effect for non-mobile devices */}
        {!isMobile && !prefersReducedMotion && <CSSParticles />}

        {/* Main loader */}
        <div className="relative z-10 flex flex-col items-center">
          <SimpleLoader />
          
          {/* Progress text */}
          <motion.div
            className={cn(
              'mt-6 text-lg font-medium',
              isDark ? 'text-white' : 'text-gray-800'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Loading AI Systems
          </motion.div>

          {/* Progress bar */}
          <div className="mt-4 w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Progress percentage */}
          <motion.div
            className={cn(
              'mt-2 text-sm',
              isDark ? 'text-gray-300' : 'text-gray-600'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {Math.round(progress)}%
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Lazy-loaded WebGL version for high-end devices
export const WebGLLoader = React.lazy(() => 
  import('./ai-loader').then(module => ({ default: module.AILoader }))
)
