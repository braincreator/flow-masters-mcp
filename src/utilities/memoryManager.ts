/**
 * Централизованный менеджер памяти для оптимизации потребления ресурсов
 */

import { LRUCache } from 'lru-cache'
import { EventEmitter } from 'events'

interface MemoryStats {
  heapUsed: number
  heapTotal: number
  rss: number
  external: number
  usage: number // Процент использования кучи
}

interface MemoryManagerOptions {
  checkIntervalMs?: number
  highMemoryThreshold?: number
  criticalMemoryThreshold?: number
  autoCleanup?: boolean
  debug?: boolean
}

class MemoryManager extends EventEmitter {
  private checkIntervalMs: number
  private highMemoryThreshold: number
  private criticalMemoryThreshold: number
  private autoCleanup: boolean
  private debug: boolean
  private intervalId?: NodeJS.Timeout
  private isRunning = false
  private lastStats?: MemoryStats
  private caches = new Set<LRUCache<any, any>>()

  constructor(options: MemoryManagerOptions = {}) {
    super()
    this.checkIntervalMs = options.checkIntervalMs ?? 60000 // 1 minute
    this.highMemoryThreshold = options.highMemoryThreshold ?? 0.7 // 70%
    this.criticalMemoryThreshold = options.criticalMemoryThreshold ?? 0.85 // 85%
    this.autoCleanup = options.autoCleanup ?? true
    this.debug = options.debug ?? false
  }

  /**
   * Регистрирует кэш для мониторинга
   */
  registerCache(cache: LRUCache<any, any>): void {
    this.caches.add(cache)
  }

  /**
   * Удаляет кэш из мониторинга
   */
  unregisterCache(cache: LRUCache<any, any>): void {
    this.caches.delete(cache)
  }

  /**
   * Запускает мониторинг памяти
   */
  start(): void {
    if (this.isRunning) return
    
    if (typeof process === 'undefined') {
      console.warn('Memory manager can only run on the server side')
      return
    }
    
    this.isRunning = true
    this.checkMemory() // Проверяем сразу при запуске
    
    this.intervalId = setInterval(() => {
      this.checkMemory()
    }, this.checkIntervalMs)
    
    if (this.debug) {
      console.log(`Memory manager started. Checking every ${this.checkIntervalMs / 1000} seconds`)
    }
  }

  /**
   * Останавливает мониторинг памяти
   */
  stop(): void {
    if (!this.isRunning) return
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    
    this.isRunning = false
    
    if (this.debug) {
      console.log('Memory manager stopped')
    }
  }

  /**
   * Получает текущую статистику памяти
   */
  getStats(): MemoryStats | undefined {
    return this.lastStats
  }

  /**
   * Принудительная очистка всех кэшей
   */
  clearAllCaches(): void {
    let totalCleared = 0
    
    for (const cache of this.caches) {
      const size = cache.size
      cache.clear()
      totalCleared += size
    }
    
    if (this.debug) {
      console.log(`Cleared ${totalCleared} items from ${this.caches.size} caches`)
    }
    
    // Принудительный вызов сборщика мусора, если доступен
    if (global.gc) {
      global.gc()
    }
  }

  /**
   * Частичная очистка кэшей (удаляет старые элементы)
   */
  partialCleanup(percentage: number = 0.3): void {
    let totalCleared = 0
    
    for (const cache of this.caches) {
      const size = cache.size
      const itemsToRemove = Math.ceil(size * percentage)
      let removed = 0
      
      // Удаляем старые элементы
      for (const key of cache.keys()) {
        if (removed >= itemsToRemove) break
        cache.delete(key)
        removed++
      }
      
      totalCleared += removed
    }
    
    if (this.debug) {
      console.log(`Partially cleared ${totalCleared} items from ${this.caches.size} caches`)
    }
    
    // Принудительный вызов сборщика мусора, если доступен
    if (global.gc) {
      global.gc()
    }
  }

  /**
   * Проверяет текущее использование памяти
   */
  private checkMemory(): void {
    if (typeof process === 'undefined') return
    
    try {
      const memoryUsage = process.memoryUsage()
      const stats: MemoryStats = {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        rss: memoryUsage.rss,
        external: memoryUsage.external,
        usage: memoryUsage.heapUsed / memoryUsage.heapTotal
      }
      
      this.lastStats = stats
      
      // Отправляем событие с текущей статистикой
      this.emit('stats', stats)
      
      if (this.debug) {
        console.log(`Memory usage: ${Math.round(stats.usage * 100)}% (${this.formatBytes(stats.heapUsed)} / ${this.formatBytes(stats.heapTotal)})`)
      }
      
      // Проверяем пороги использования памяти
      if (stats.usage >= this.criticalMemoryThreshold) {
        this.emit('critical', stats)
        
        if (this.autoCleanup) {
          if (this.debug) {
            console.warn(`Critical memory usage detected: ${Math.round(stats.usage * 100)}%. Clearing all caches...`)
          }
          this.clearAllCaches()
        }
      } else if (stats.usage >= this.highMemoryThreshold) {
        this.emit('high', stats)
        
        if (this.autoCleanup) {
          if (this.debug) {
            console.warn(`High memory usage detected: ${Math.round(stats.usage * 100)}%. Partial cleanup...`)
          }
          this.partialCleanup(0.5) // Удаляем 50% при высоком потреблении
        }
      }
    } catch (error) {
      console.error('Error checking memory usage:', error)
    }
  }

  /**
   * Форматирует байты в читаемый формат
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Создаем глобальный экземпляр менеджера памяти
export const memoryManager = new MemoryManager({
  checkIntervalMs: 60000, // 1 минута
  highMemoryThreshold: 0.7, // 70%
  criticalMemoryThreshold: 0.85, // 85%
  autoCleanup: true,
  debug: process.env.NODE_ENV === 'development'
})

// Запускаем мониторинг только на сервере
if (typeof window === 'undefined') {
  memoryManager.start()
}

// Обработчики для очистки ресурсов при завершении работы
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    memoryManager.stop()
    memoryManager.clearAllCaches()
  })
  
  process.on('SIGINT', () => {
    memoryManager.stop()
    memoryManager.clearAllCaches()
  })
}

export default memoryManager
