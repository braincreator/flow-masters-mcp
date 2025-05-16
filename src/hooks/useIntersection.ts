import { useState, useEffect, RefObject } from 'react'

interface IntersectionOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
}

/**
 * Хук для определения, когда элемент становится видимым в области просмотра
 * Используется для реализации бесконечной прокрутки
 */
export const useIntersection = (
  elementRef: RefObject<Element>,
  options: IntersectionOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0,
  },
): boolean => {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false)

  useEffect(() => {
    const element = elementRef?.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [elementRef, options])

  return isIntersecting
}
