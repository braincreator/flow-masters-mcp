'use client'

import { useRef, useCallback, useEffect } from 'react'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Хук для безопасного использования контекста в асинхронных операциях
 * Предотвращает ошибки "Context can only be read while React is rendering"
 */
export function useSafeContext<T>(contextValue: T) {
  const contextRef = useRef<T>(contextValue)
  const isMountedRef = useRef(true)

  // Обновляем ref при изменении контекста
  useEffect(() => {
    contextRef.current = contextValue
  }, [contextValue])

  // Отмечаем компонент как размонтированный
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Безопасная функция для получения контекста
  const getSafeContext = useCallback(() => {
    if (!isMountedRef.current) {
      logWarn('Attempting to access context after component unmount')
      return null
    }
    return contextRef.current
  }, [])

  // Безопасная функция для выполнения операций с контекстом
  const withSafeContext = useCallback(
    <R>(operation: (context: T) => R): R | null => {
      const context = getSafeContext()
      if (!context) return null
      
      try {
        return operation(context)
      } catch (error) {
        logWarn('Error in safe context operation:', error)
        return null
      }
    },
    [getSafeContext]
  )

  return {
    getSafeContext,
    withSafeContext,
    isMounted: () => isMountedRef.current
  }
}

/**
 * Хук для безопасного выполнения асинхронных операций с контекстом
 */
export function useSafeAsyncContext<T>(contextValue: T) {
  const { getSafeContext, withSafeContext, isMounted } = useSafeContext(contextValue)

  const withSafeAsyncContext = useCallback(
    async <R>(operation: (context: T) => Promise<R>): Promise<R | null> => {
      const context = getSafeContext()
      if (!context || !isMounted()) return null
      
      try {
        const result = await operation(context)
        // Проверяем, что компонент все еще смонтирован после асинхронной операции
        if (!isMounted()) {
          logWarn('Component unmounted during async operation')
          return null
        }
        return result
      } catch (error) {
        logWarn('Error in safe async context operation:', error)
        return null
      }
    },
    [getSafeContext, isMounted]
  )

  return {
    getSafeContext,
    withSafeContext,
    withSafeAsyncContext,
    isMounted
  }
}

/**
 * Хук для безопасного использования setTimeout с контекстом
 */
export function useSafeTimeout() {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      // Очищаем все таймауты при размонтировании
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current.clear()
    }
  }, [])

  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    if (!isMountedRef.current) return

    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        try {
          callback()
        } catch (error) {
          logWarn('Error in safe timeout callback:', error)
        }
      }
      timeoutsRef.current.delete(timeoutId)
    }, delay)

    timeoutsRef.current.add(timeoutId)
    return timeoutId
  }, [])

  const clearSafeTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    clearTimeout(timeoutId)
    timeoutsRef.current.delete(timeoutId)
  }, [])

  return {
    safeSetTimeout,
    clearSafeTimeout,
    isMounted: () => isMountedRef.current
  }
}

/**
 * Хук для безопасного использования setInterval с контекстом
 */
export function useSafeInterval() {
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      // Очищаем все интервалы при размонтировании
      intervalsRef.current.forEach(interval => clearInterval(interval))
      intervalsRef.current.clear()
    }
  }, [])

  const safeSetInterval = useCallback((callback: () => void, delay: number) => {
    if (!isMountedRef.current) return

    const intervalId = setInterval(() => {
      if (isMountedRef.current) {
        try {
          callback()
        } catch (error) {
          logWarn('Error in safe interval callback:', error)
        }
      } else {
        clearInterval(intervalId)
        intervalsRef.current.delete(intervalId)
      }
    }, delay)

    intervalsRef.current.add(intervalId)
    return intervalId
  }, [])

  const clearSafeInterval = useCallback((intervalId: NodeJS.Timeout) => {
    clearInterval(intervalId)
    intervalsRef.current.delete(intervalId)
  }, [])

  return {
    safeSetInterval,
    clearSafeInterval,
    isMounted: () => isMountedRef.current
  }
}
