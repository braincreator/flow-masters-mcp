'use client'

import { useEffect, useRef } from 'react'

/**
 * Хук для безопасного использования setInterval в React компонентах
 * Автоматически очищает интервал при размонтировании компонента
 *
 * @param callback Функция, которая будет вызываться с указанным интервалом
 * @param delay Интервал в миллисекундах (null для остановки)
 * @param immediate Если true, callback будет вызван сразу при монтировании
 */
export function useInterval(callback: () => void, delay: number | null, immediate = false): void {
  const savedCallback = useRef<() => void>()
  const intervalRef = useRef<NodeJS.Timeout>()

  // Запоминаем последнюю функцию callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Настраиваем интервал
  useEffect(() => {
    // Функция для вызова callback
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }

    // Если immediate=true, вызываем callback сразу
    if (immediate && delay !== null) {
      tick()
    }

    // Если delay не null, создаем интервал
    if (delay !== null) {
      intervalRef.current = setInterval(tick, delay)

      // Очищаем интервал при размонтировании
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = undefined
        }
      }
    } else if (intervalRef.current) {
      // Если delay стал null, очищаем существующий интервал
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }

    return undefined
  }, [delay, immediate])
}

/**
 * Хук для безопасного использования setTimeout в React компонентах
 * Автоматически очищает таймаут при размонтировании компонента
 *
 * @param callback Функция, которая будет вызвана после задержки
 * @param delay Задержка в миллисекундах (null для отмены)
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Запоминаем последнюю функцию callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Настраиваем таймаут
  useEffect(() => {
    // Если delay не null, создаем таймаут
    if (delay !== null) {
      timeoutRef.current = setTimeout(() => {
        if (savedCallback.current) {
          savedCallback.current()
        }
      }, delay)

      // Очищаем таймаут при размонтировании
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = undefined
        }
      }
    } else if (timeoutRef.current) {
      // Если delay стал null, очищаем существующий таймаут
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }

    return undefined
  }, [delay])
}

/**
 * @deprecated Рекомендуется использовать useOptimizedInterval для лучшего управления памятью
 * import { useOptimizedInterval } from '@/hooks/useOptimizedInterval'
 */
