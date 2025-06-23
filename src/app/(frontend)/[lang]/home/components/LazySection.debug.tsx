'use client'

import React, { useEffect, useState } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface LazySectionProps {
  children: React.ReactNode
  sectionId: string
  threshold?: number
  rootMargin?: string
}

export function LazySection({
  children,
  sectionId,
  threshold = 0.1,
  rootMargin = '200px',
}: LazySectionProps) {
  const [shouldRender, setShouldRender] = useState(false)

  const [setNode, isIntersecting] = useIntersectionObserver(
    { threshold, rootMargin },
    true, // freeze once visible
  )

  useEffect(() => {
    if (isIntersecting && !shouldRender) {
      console.log(`✅ LazySection ${sectionId} is intersecting, loading...`)
      setShouldRender(true)
    }
  }, [isIntersecting, shouldRender, sectionId])

  // Debug logging
  useEffect(() => {
    console.log(`🔍 LazySection ${sectionId} - isIntersecting: ${isIntersecting}, shouldRender: ${shouldRender}`)
  }, [isIntersecting, shouldRender, sectionId])

  return (
    <section ref={setNode} data-section={sectionId}>
      {shouldRender ? (
        children
      ) : (
        <div className="py-20 min-h-[400px] border-2 border-dashed border-yellow-300 bg-yellow-50/20">
          <div className="container mx-auto px-4">
            <div className="h-64 bg-transparent flex items-center justify-center">
              <div className="text-center">
                <div className="text-yellow-600 text-lg font-semibold mb-2">
                  🔄 Loading {sectionId}...
                </div>
                <div className="text-yellow-500 text-sm">
                  Threshold: {threshold}, RootMargin: {rootMargin}
                </div>
                <div className="text-yellow-500 text-sm">
                  Intersecting: {isIntersecting ? '✅' : '❌'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
