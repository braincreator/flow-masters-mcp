'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimateInViewProps {
  children: React.ReactNode
  className?: string
  threshold?: number
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

const AnimateInView: React.FC<AnimateInViewProps> = ({
  children,
  className,
  threshold = 0.1,
  delay = 0,
  direction = 'up',
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold },
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  // Определяем класс анимации в зависимости от direction
  const getAnimationClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translate-y-16 opacity-0'
        case 'down':
          return '-translate-y-16 opacity-0'
        case 'left':
          return 'translate-x-16 opacity-0'
        case 'right':
          return '-translate-x-16 opacity-0'
        case 'none':
          return 'opacity-0'
        default:
          return 'translate-y-16 opacity-0'
      }
    }
    return 'translate-y-0 translate-x-0 opacity-100'
  }

  return (
    <div
      ref={ref}
      className={cn('transition-all duration-700 ease-out', getAnimationClass(), className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default AnimateInView
