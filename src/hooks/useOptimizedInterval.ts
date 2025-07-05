import { useEffect, useRef, useCallback } from 'react'
import { simpleMemoryManager } from '@/utilities/simpleMemoryManager'

/**
 * Оптимизированный хук для интервалов с автоматической очисткой
 */
export function useOptimizedInterval(
  callback: () => void,
  delay: number | null,
  options: {
    immediate?: boolean
    enabled?: boolean
  } = {}
) {
  const { immediate = false, enabled = true } = options
  const savedCallback = useRef(callback)
  const intervalRef = useRef<NodeJS.Timeout>()
  const cleanupRef = useRef<(() => void) | null>(null)

  // Сохраняем последний callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Функция для запуска интервала
  const startInterval = useCallback(() => {
    if (delay === null || !enabled) return

    // Очищаем предыдущий интервал
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }

    // Запускаем немедленно, если нужно
    if (immediate) {
      savedCallback.current()
    }

    // Создаем новый интервал
    intervalRef.current = setInterval(() => {
      savedCallback.current()
    }, delay)

    // Регистрируем в менеджере памяти
    cleanupRef.current = simpleMemoryManager.registerInterval(intervalRef.current)
  }, [delay, immediate, enabled])

  // Функция для остановки интервала
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
  }, [])

  // Запускаем/останавливаем интервал при изменении параметров
  useEffect(() => {
    if (enabled && delay !== null) {
      startInterval()
    } else {
      stopInterval()
    }

    return stopInterval
  }, [delay, enabled, startInterval, stopInterval])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      stopInterval()
    }
  }, [stopInterval])

  return {
    start: startInterval,
    stop: stopInterval,
    isRunning: intervalRef.current !== undefined,
  }
}

/**
 * Оптимизированный хук для таймаутов с автоматической очисткой
 */
export function useOptimizedTimeout(
  callback: () => void,
  delay: number | null,
  options: {
    enabled?: boolean
  } = {}
) {
  const { enabled = true } = options
  const savedCallback = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const cleanupRef = useRef<(() => void) | null>(null)

  // Сохраняем последний callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Функция для запуска таймаута
  const startTimeout = useCallback(() => {
    if (delay === null || !enabled) return

    // Очищаем предыдущий таймаут
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }

    // Создаем новый таймаут
    timeoutRef.current = setTimeout(() => {
      savedCallback.current()
      timeoutRef.current = undefined
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }, delay)

    // Регистрируем в менеджере памяти
    cleanupRef.current = simpleMemoryManager.registerTimeout(timeoutRef.current)
  }, [delay, enabled])

  // Функция для отмены таймаута
  const cancelTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
  }, [])

  // Запускаем таймаут при изменении параметров
  useEffect(() => {
    if (enabled && delay !== null) {
      startTimeout()
    } else {
      cancelTimeout()
    }

    return cancelTimeout
  }, [delay, enabled, startTimeout, cancelTimeout])

  return {
    start: startTimeout,
    cancel: cancelTimeout,
    isActive: timeoutRef.current !== undefined,
  }
}
