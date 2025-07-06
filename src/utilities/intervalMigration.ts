/**
 * Утилиты для миграции интервалов на оптимизированные версии
 * Помогает постепенно заменять старые useInterval на useOptimizedInterval
 */

import { useOptimizedInterval, useOptimizedTimeout } from '@/hooks/useOptimizedInterval'
import { logDebug, logWarn } from '@/utils/logger'

/**
 * Обертка для постепенной миграции useInterval
 * @deprecated Используйте useOptimizedInterval напрямую
 */
export function useMigratedInterval(
  callback: () => void,
  delay: number | null,
  options: {
    immediate?: boolean
    enabled?: boolean
    legacy?: boolean // Флаг для использования старой версии
  } = {}
) {
  const { immediate = false, enabled = true, legacy = false } = options

  if (legacy) {
    logWarn('Using legacy interval implementation. Consider migrating to useOptimizedInterval')
    // Здесь можно вызвать старый useInterval если нужно
  }

  return useOptimizedInterval(callback, delay, { immediate, enabled })
}

/**
 * Обертка для постепенной миграции useTimeout
 * @deprecated Используйте useOptimizedTimeout напрямую
 */
export function useMigratedTimeout(
  callback: () => void,
  delay: number | null,
  options: {
    enabled?: boolean
    legacy?: boolean
  } = {}
) {
  const { enabled = true, legacy = false } = options

  if (legacy) {
    logWarn('Using legacy timeout implementation. Consider migrating to useOptimizedTimeout')
  }

  return useOptimizedTimeout(callback, delay, { enabled })
}

/**
 * Утилита для проверки использования старых интервалов
 */
export function checkLegacyIntervals() {
  if (typeof window === 'undefined') return

  // Проверяем количество активных интервалов
  const intervalCount = (window as any).__intervalCount || 0
  const timeoutCount = (window as any).__timeoutCount || 0

  if (intervalCount > 10 || timeoutCount > 20) {
    logWarn(`High number of intervals/timeouts detected: ${intervalCount}/${timeoutCount}. Consider migration to optimized versions.`)
  }

  logDebug(`Current intervals/timeouts: ${intervalCount}/${timeoutCount}`)
}

/**
 * Хелпер для создания интервала с автоматической очисткой
 */
export function createManagedInterval(
  callback: () => void,
  delay: number,
  options: {
    immediate?: boolean
    maxExecutions?: number
    onComplete?: () => void
  } = {}
): () => void {
  const { immediate = false, maxExecutions, onComplete } = options
  let executionCount = 0
  let intervalId: NodeJS.Timeout | null = null

  const wrappedCallback = () => {
    callback()
    executionCount++

    if (maxExecutions && executionCount >= maxExecutions) {
      cleanup()
      onComplete?.()
    }
  }

  const cleanup = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Запускаем немедленно если нужно
  if (immediate) {
    wrappedCallback()
  }

  // Создаем интервал только если не достигли лимита
  if (!maxExecutions || executionCount < maxExecutions) {
    intervalId = setInterval(wrappedCallback, delay)
  }

  return cleanup
}

/**
 * Хелпер для создания таймаута с автоматической очисткой
 */
export function createManagedTimeout(
  callback: () => void,
  delay: number,
  options: {
    onCancel?: () => void
  } = {}
): () => void {
  const { onCancel } = options
  let timeoutId: NodeJS.Timeout | null = null
  let isCancelled = false

  const wrappedCallback = () => {
    if (!isCancelled) {
      callback()
    }
    timeoutId = null
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    if (!isCancelled) {
      isCancelled = true
      onCancel?.()
    }
  }

  timeoutId = setTimeout(wrappedCallback, delay)

  return cancel
}

/**
 * Утилиты для отладки интервалов
 */
export const intervalDebugUtils = {
  /**
   * Логирует все активные интервалы (только в development)
   */
  logActiveIntervals() {
    if (process.env.NODE_ENV !== 'development') return

    const intervals = (window as any).__activeIntervals || []
    const timeouts = (window as any).__activeTimeouts || []

    console.group('🔄 Active Intervals & Timeouts')
    console.log('Intervals:', intervals.length)
    console.log('Timeouts:', timeouts.length)
    
    if (intervals.length > 0) {
      console.table(intervals.map((id: any, index: number) => ({
        index,
        id,
        type: 'interval'
      })))
    }

    if (timeouts.length > 0) {
      console.table(timeouts.map((id: any, index: number) => ({
        index,
        id,
        type: 'timeout'
      })))
    }
    console.groupEnd()
  },

  /**
   * Очищает все интервалы и таймауты (только для отладки)
   */
  clearAllTimers() {
    if (process.env.NODE_ENV !== 'development') {
      logWarn('clearAllTimers should only be used in development')
      return
    }

    const intervals = (window as any).__activeIntervals || []
    const timeouts = (window as any).__activeTimeouts || []

    intervals.forEach((id: NodeJS.Timeout) => clearInterval(id))
    timeouts.forEach((id: NodeJS.Timeout) => clearTimeout(id))

    ;(window as any).__activeIntervals = []
    ;(window as any).__activeTimeouts = []

    logDebug(`Cleared ${intervals.length} intervals and ${timeouts.length} timeouts`)
  },

  /**
   * Устанавливает лимиты для интервалов (предупреждения)
   */
  setLimits(maxIntervals = 10, maxTimeouts = 20) {
    ;(window as any).__maxIntervals = maxIntervals
    ;(window as any).__maxTimeouts = maxTimeouts
  }
}

/**
 * Константы для миграции
 */
export const MIGRATION_CONSTANTS = {
  DEFAULT_INTERVAL_DELAY: 1000,
  DEFAULT_TIMEOUT_DELAY: 5000,
  MAX_SAFE_INTERVALS: 10,
  MAX_SAFE_TIMEOUTS: 20,
  CLEANUP_DELAY: 100
} as const

export default {
  useMigratedInterval,
  useMigratedTimeout,
  checkLegacyIntervals,
  createManagedInterval,
  createManagedTimeout,
  intervalDebugUtils,
  MIGRATION_CONSTANTS
}
