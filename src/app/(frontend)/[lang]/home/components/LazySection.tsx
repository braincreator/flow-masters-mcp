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
  rootMargin = '100px',
}: LazySectionProps) {
  const [shouldRender, setShouldRender] = useState(false)

  const [setNode, isIntersecting] = useIntersectionObserver(
    { threshold, rootMargin },
    true, // freeze once visible
  )

  useEffect(() => {
    if (isIntersecting && !shouldRender) {
      setShouldRender(true)
    }
  }, [isIntersecting, shouldRender])

  return (
    <section ref={setNode} data-section={sectionId}>
      {shouldRender ? (
        children
      ) : (
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="h-32 bg-transparent"></div>
          </div>
        </div>
      )}
    </section>
  )
}
