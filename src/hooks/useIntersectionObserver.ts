import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(
  options = {},
  freezeOnceVisible = false
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [node, setNode] = useState<Element | null>(null)
  const frozen = entry?.isIntersecting && freezeOnceVisible
  
  const observer = useRef<IntersectionObserver>()
  
  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect()
    }
    
    if (frozen) return
    
    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry)
    }, options)
    
    const { current: currentObserver } = observer
    
    if (node) currentObserver.observe(node)
    
    return () => {
      currentObserver.disconnect()
    }
  }, [node, JSON.stringify(options), frozen])
  
  return [setNode, entry?.isIntersecting, entry] as const
}