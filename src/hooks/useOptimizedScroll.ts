import { useEffect, useCallback, useRef } from 'react'

interface UseOptimizedScrollOptions {
  throttleMs?: number
  onScroll?: (scrollY: number) => void
}

export function useOptimizedScroll({ 
  throttleMs = 16, 
  onScroll 
}: UseOptimizedScrollOptions = {}) {
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const updateScrollPosition = useCallback(() => {
    const scrollY = window.scrollY
    
    if (onScroll) {
      onScroll(scrollY)
    }
    
    lastScrollY.current = scrollY
    ticking.current = false
  }, [onScroll])

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollPosition)
      ticking.current = true
    }
  }, [updateScrollPosition])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const throttledScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, throttleMs)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      clearTimeout(timeoutId)
    }
  }, [handleScroll, throttleMs])

  return { lastScrollY: lastScrollY.current }
}
