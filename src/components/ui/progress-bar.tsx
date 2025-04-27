'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLoading } from '@/providers/LoadingProvider'
import { useDeviceType, useUserPreferences } from '@/hooks/useMediaQuerySelector'
import { cn } from '@/lib/utils'

export function ProgressBar() {
  const { isLoading, progress } = useLoading()
  const { isMobile, isTablet } = useDeviceType()
  const { prefersReducedMotion } = useUserPreferences()

  // Adjust height based on device type
  const barHeight = isMobile ? 'h-1' : 'h-0.5'

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={cn('fixed top-0 left-0 right-0 z-50 bg-transparent', barHeight)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={cn(
              'h-full',
              prefersReducedMotion
                ? 'bg-indigo-500'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
            )}
            style={{ width: `${progress}%` }}
            transition={{
              ease: 'easeOut',
              duration: prefersReducedMotion ? 0.1 : 0.3,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
