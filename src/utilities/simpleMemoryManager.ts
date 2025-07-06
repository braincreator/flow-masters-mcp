/**
 * Упрощенный менеджер памяти
 * Заменяет сложную систему управления памятью на более простую и надежную
 */

import { logDebug, logWarn, logError } from '@/utils/logger'

interface MemoryStats {
  used: number
  total: number
  percentage: number
}

class SimpleMemoryManager {
  private caches = new Set<{ clear: () => void }>()
  private intervals = new Set<NodeJS.Timeout>()
  private timeouts = new Set<NodeJS.Timeout>()
  private abortControllers = new Set<AbortController>()
  
  private readonly HIGH_MEMORY_THRESHOLD = 0.8 // 80%
  private readonly CHECK_INTERVAL = 60000 // 1 minute
  private checkInterval?: NodeJS.Timeout

  constructor() {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.startMonitoring()
    }
  }

  /**
   * Регистрирует кэш для управления
   */
  registerCache(cache: { clear: () => void }) {
    this.caches.add(cache)
    return () => this.caches.delete(cache)
  }

  /**
   * Регистрирует интервал для очистки
   */
  registerInterval(interval: NodeJS.Timeout) {
    this.intervals.add(interval)
    return () => {
      clearInterval(interval)
      this.intervals.delete(interval)
    }
  }

  /**
   * Регистрирует таймаут для очистки
   */
  registerTimeout(timeout: NodeJS.Timeout) {
    this.timeouts.add(timeout)
    return () => {
      clearTimeout(timeout)
      this.timeouts.delete(timeout)
    }
  }

  /**
   * Регистрирует AbortController для очистки
   */
  registerAbortController(controller: AbortController) {
    this.abortControllers.add(controller)
    return () => {
      if (!controller.signal.aborted) {
        controller.abort()
      }
      this.abortControllers.delete(controller)
    }
  }

  /**
   * Получает статистику памяти
   */
  getMemoryStats(): MemoryStats | null {
    if (typeof process === 'undefined') return null

    try {
      const memUsage = process.memoryUsage()
      const used = memUsage.heapUsed
      const total = memUsage.heapTotal
      
      return {
        used,
        total,
        percentage: used / total
      }
    } catch (error) {
      logError('Failed to get memory stats:', error)
      return null
    }
  }

  /**
   * Очищает все кэши
   */
  clearAllCaches() {
    let cleared = 0
    for (const cache of this.caches) {
      try {
        cache.clear()
        cleared++
      } catch (error) {
        logWarn('Failed to clear cache:', error)
      }
    }
    logDebug(`Cleared ${cleared} caches`)
  }

  /**
   * Очищает все интервалы и таймауты
   */
  clearAllTimers() {
    // Clear intervals
    for (const interval of this.intervals) {
      clearInterval(interval)
    }
    this.intervals.clear()

    // Clear timeouts
    for (const timeout of this.timeouts) {
      clearTimeout(timeout)
    }
    this.timeouts.clear()

    logDebug('Cleared all timers')
  }

  /**
   * Отменяет все AbortController
   */
  abortAllControllers() {
    for (const controller of this.abortControllers) {
      if (!controller.signal.aborted) {
        controller.abort()
      }
    }
    this.abortControllers.clear()
    logDebug('Aborted all controllers')
  }

  /**
   * Выполняет полную очистку
   */
  performCleanup() {
    logDebug('Performing memory cleanup...')
    
    this.clearAllCaches()
    
    // Принудительная сборка мусора, если доступна
    if (global.gc) {
      global.gc()
      logDebug('Forced garbage collection')
    }
  }

  /**
   * Запускает мониторинг памяти
   */
  private startMonitoring() {
    this.checkInterval = setInterval(() => {
      const stats = this.getMemoryStats()
      if (stats && stats.percentage > this.HIGH_MEMORY_THRESHOLD) {
        logWarn(`High memory usage detected: ${Math.round(stats.percentage * 100)}%`)
        this.performCleanup()
      }
    }, this.CHECK_INTERVAL)
  }

  /**
   * Останавливает мониторинг
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = undefined
    }
  }

  /**
   * Полная очистка при завершении работы
   */
  shutdown() {
    this.stopMonitoring()
    this.clearAllTimers()
    this.abortAllControllers()
    this.clearAllCaches()
    logDebug('Memory manager shutdown complete')
  }
}

// Создаем глобальный экземпляр
export const simpleMemoryManager = new SimpleMemoryManager()

// Очистка при завершении процесса
if (typeof process !== 'undefined') {
  process.on('exit', () => simpleMemoryManager.shutdown())
  process.on('SIGINT', () => simpleMemoryManager.shutdown())
  process.on('SIGTERM', () => simpleMemoryManager.shutdown())
}

export default simpleMemoryManager
