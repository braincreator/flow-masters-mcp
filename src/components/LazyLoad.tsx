'use client'

import React, { useEffect, useState, ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'

interface LazyLoadProps {
  children: ReactNode
  placeholder?: ReactNode
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  className?: string
}

/**
 * LazyLoad component that renders its children only when they come into view
 * This helps improve initial load performance by deferring the rendering of off-screen components
 */
export function LazyLoad({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = '100px',
  triggerOnce = true,
  className,
}: LazyLoadProps) {
  const [loaded, setLoaded] = useState(false)
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
  })

  useEffect(() => {
    if (inView && !loaded) {
      setLoaded(true)
    }
  }, [inView, loaded])

  return (
    <div ref={ref} className={className}>
      {loaded ? children : placeholder || <LazyLoadPlaceholder />}
    </div>
  )
}

/**
 * Default placeholder component that shows a subtle loading animation
 */
function LazyLoadPlaceholder() {
  return (
    <div className="animate-pulse flex flex-col space-y-4 w-full">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  )
}
