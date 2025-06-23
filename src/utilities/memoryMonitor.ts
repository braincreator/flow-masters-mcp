/**
 * Утилита для мониторинга использования памяти
 */

import { EventEmitter } from 'events'
import { cleanupAllResources } from './memoryCleanup'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface MemoryStats {
  heapUsed: number
  heapTotal: number
  rss: number
  external: number
  arrayBuffers?: number
  usage: number // Процент использования кучи
}

interface MemoryMonitorOptions {
  checkIntervalMs?: number
  highMemoryThreshold?: number
  criticalMemoryThreshold?: number
  autoCleanup?: boolean
  debug?: boolean
}

class MemoryMonitor extends EventEmitter {
  private checkIntervalMs: number
  private highMemoryThreshold: number
  private criticalMemoryThreshold: number
  private autoCleanup: boolean
  private debug: boolean
  private intervalId?: NodeJS.Timeout
  private isRunning: boolean = false
  private lastStats?: MemoryStats

  constructor(options: MemoryMonitorOptions = {}) {
    super()
    this.checkIntervalMs = options.checkIntervalMs || 60000 // 1 минута по умолчанию
    this.highMemoryThreshold = options.highMemoryThreshold || 0.7 // 70% использования кучи
    this.criticalMemoryThreshold = options.criticalMemoryThreshold || 0.85 // 85% использования кучи
    this.autoCleanup = options.autoCleanup !== undefined ? options.autoCleanup : true
    this.debug = options.debug || false
  }

  /**
   * Запускает мониторинг памяти
   */
  start(): void {
    if (this.isRunning) return
    
    if (typeof process === 'undefined') {
      logWarn('Memory monitor can only run on the server side')
      return
    }
    
    this.isRunning = true
    this.checkMemory() // Проверяем сразу при запуске
    
    this.intervalId = setInterval(() => {
      this.checkMemory()
    }, this.checkIntervalMs)
    
    if (this.debug) {
      logDebug(`Memory monitor started. Checking every ${this.checkIntervalMs / 1000} seconds`)
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
      logDebug('Memory monitor stopped')
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
        arrayBuffers: memoryUsage.arrayBuffers,
        usage: memoryUsage.heapUsed / memoryUsage.heapTotal
      }
      
      this.lastStats = stats
      
      // Отправляем событие с текущей статистикой
      this.emit('stats', stats)
      
      if (this.debug) {
        logDebug(`Memory usage: ${Math.round(stats.usage * 100)}% (${this.formatBytes(stats.heapUsed)} / ${this.formatBytes(stats.heapTotal)})`)
      }
      
      // Проверяем пороги использования памяти
      if (stats.usage >= this.criticalMemoryThreshold) {
        this.emit('critical', stats)
        
        if (this.autoCleanup) {
          if (this.debug) {
            logWarn(`Critical memory usage detected: ${Math.round(stats.usage * 100)}%. Cleaning up resources...`)
          }
          cleanupAllResources()
        } else if (this.debug) {
          logWarn(`Critical memory usage detected: ${Math.round(stats.usage * 100)}%`)
        }
      } else if (stats.usage >= this.highMemoryThreshold) {
        this.emit('high', stats)
        
        if (this.debug) {
          logWarn(`High memory usage detected: ${Math.round(stats.usage * 100)}%`)
        }
      }
    } catch (error) {
      logError('Error checking memory usage:', error)
    }
  }

  /**
   * Возвращает последнюю статистику использования памяти
   */
  getStats(): MemoryStats | undefined {
    return this.lastStats
  }

  /**
   * Форматирует байты в человекочитаемый формат
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Создаем и экспортируем экземпляр монитора
export const memoryMonitor = new MemoryMonitor({ debug: process.env.NODE_ENV === 'development' })

// Запускаем монитор только на сервере
if (typeof window === 'undefined') {
  memoryMonitor.start()
}

export default memoryMonitor
