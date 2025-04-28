'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoading } from '@/providers/LoadingProvider'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import {
  useDeviceType,
  useMediaQueryUserPreferences,
  useViewportSize,
} from '@/hooks/useMediaQuerySelector'
import { useUserPreferences } from '@/providers/UserPreferencesProvider'

export function CosmicLoader() {
  const { isLoading, progress } = useLoading()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Get device information from MediaQueryProvider
  const { isMobile, isTablet, isDesktop } = useDeviceType()
  const { prefersReducedMotion } = useMediaQueryUserPreferences()
  const { viewportWidth, viewportHeight } = useViewportSize()

  // Adjust number of stars based on device type and viewport size
  const starCount = React.useMemo(() => {
    if (isMobile) return 20
    if (isTablet) return 35
    return 50
  }, [isMobile, isTablet])

  // Generate random stars for the background
  const stars = React.useMemo(() => {
    return Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: prefersReducedMotion ? 0 : Math.random() * 3 + 2,
    }))
  }, [starCount, prefersReducedMotion])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Cosmic background with stars */}
          <motion.div
            className={cn(
              'absolute inset-0',
              isDark
                ? 'bg-gradient-to-b from-black via-indigo-950/30 to-black'
                : 'bg-gradient-to-b from-white via-blue-50 to-white',
            )}
          >
            {/* Animated stars */}
            {stars.map((star) => (
              <motion.div
                key={star.id}
                className={cn('absolute rounded-full', isDark ? 'bg-white' : 'bg-indigo-600')}
                style={{
                  width: star.size,
                  height: star.size,
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                }}
                animate={{
                  opacity: [0.1, 0.8, 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>

          {/* Central loading element */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Orbital rings - Adjust size based on device */}
            <div className="relative">
              {[...Array(isMobile ? 2 : 3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    'absolute rounded-full border-2',
                    isDark ? 'border-indigo-500/30' : 'border-indigo-500/20',
                  )}
                  style={{
                    width: `${(i + 1) * (isMobile ? 40 : isTablet ? 50 : 60)}px`,
                    height: `${(i + 1) * (isMobile ? 40 : isTablet ? 50 : 60)}px`,
                    top: `${-(i + 1) * (isMobile ? 20 : isTablet ? 25 : 30) + (isMobile ? 30 : 50)}px`,
                    left: `${-(i + 1) * (isMobile ? 20 : isTablet ? 25 : 30) + (isMobile ? 30 : 50)}px`,
                  }}
                  animate={
                    prefersReducedMotion
                      ? {}
                      : {
                          rotate: i % 2 === 0 ? 360 : -360,
                        }
                  }
                  transition={{
                    duration: 8 + i * 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              ))}

              {/* Orbiting particles - Reduce count on mobile */}
              {!prefersReducedMotion &&
                [...Array(isMobile ? 2 : isTablet ? 3 : 5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      'absolute rounded-full',
                      isDark ? 'bg-indigo-400' : 'bg-indigo-600',
                      isMobile ? 'w-2 h-2' : 'w-3 h-3',
                    )}
                    animate={{
                      x: [
                        0,
                        ...Array.from({ length: isMobile ? 10 : 20 }).map(
                          () => Math.random() * (isMobile ? 50 : 100) - (isMobile ? 25 : 50),
                        ),
                      ],
                      y: [
                        0,
                        ...Array.from({ length: isMobile ? 10 : 20 }).map(
                          () => Math.random() * (isMobile ? 50 : 100) - (isMobile ? 25 : 50),
                        ),
                      ],
                      scale: [
                        1,
                        ...Array.from({ length: isMobile ? 10 : 20 }).map(
                          () => Math.random() + 0.5,
                        ),
                      ],
                      opacity: [
                        0.7,
                        ...Array.from({ length: isMobile ? 10 : 20 }).map(
                          () => Math.random() * 0.5 + 0.5,
                        ),
                      ],
                    }}
                    transition={{
                      duration: isMobile ? 15 : 20,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      top: isMobile ? '30px' : '50px',
                      left: isMobile ? '30px' : '50px',
                    }}
                  />
                ))}

              {/* Central pulsing orb - Adjust size based on device */}
              <motion.div
                className={cn(
                  'relative rounded-full flex items-center justify-center',
                  isDark
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-700'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600',
                  isMobile ? 'w-14 h-14' : isTablet ? 'w-16 h-16' : 'w-20 h-20',
                )}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        boxShadow: [
                          isDark
                            ? '0 0 20px 0 rgba(79, 70, 229, 0.3)'
                            : '0 0 20px 0 rgba(79, 70, 229, 0.2)',
                          isDark
                            ? '0 0 40px 10px rgba(79, 70, 229, 0.5)'
                            : '0 0 40px 10px rgba(79, 70, 229, 0.3)',
                          isDark
                            ? '0 0 20px 0 rgba(79, 70, 229, 0.3)'
                            : '0 0 20px 0 rgba(79, 70, 229, 0.2)',
                        ],
                        scale: [1, 1.05, 1],
                      }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Your app logo or icon */}
                <motion.span
                  className={cn('text-white font-bold', isMobile ? 'text-xl' : 'text-2xl')}
                  animate={prefersReducedMotion ? {} : { opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  A
                </motion.span>
              </motion.div>
            </div>

            {/* Progress indicator - Adjust width based on device */}
            <div className={cn('mt-12 relative', isMobile ? 'w-48' : isTablet ? 'w-56' : 'w-64')}>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Progress percentage */}
              <motion.div
                className="mt-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {Math.round(progress)}%
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
