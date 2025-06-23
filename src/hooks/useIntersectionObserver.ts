import { useEffect, useRef, useState, useMemo } from 'react'

export function useIntersectionObserver(
  options = {},
  freezeOnceVisible = false
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [node, setNode] = useState<Element | null>(null)
  const frozen = entry?.isIntersecting && freezeOnceVisible

  const observer = useRef<IntersectionObserver>()

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options, [
    options.root,
    options.rootMargin,
    options.threshold
  ])

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect()
    }

    if (frozen) return

    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry)
    }, memoizedOptions)

    const { current: currentObserver } = observer

    if (node) currentObserver.observe(node)

    return () => {
      currentObserver.disconnect()
    }
  }, [node, memoizedOptions, frozen])

  return [setNode, entry?.isIntersecting, entry] as const
}