import { useCallback, useRef, useState } from 'react'

export function useStableState<T>(initialValue: T) {
  const [state, setState] = useState(initialValue)
  const callbackRef = useRef<((value: T) => void)[]>([])
  
  const setStableState = useCallback((value: T) => {
    setState(value)
    callbackRef.current.forEach(callback => callback(value))
  }, [])
  
  const subscribe = useCallback((callback: (value: T) => void) => {
    callbackRef.current.push(callback)
    return () => {
      callbackRef.current = callbackRef.current.filter(cb => cb !== callback)
    }
  }, [])
  
  return [state, setStableState, subscribe] as const
}