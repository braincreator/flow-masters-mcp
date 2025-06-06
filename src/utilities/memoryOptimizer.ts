/**
 * Дополнительные оптимизации памяти для критических ситуаций
 */

import { memoryManager } from './memoryManager'

interface MemoryOptimizerOptions {
  enableGarbageCollection?: boolean
  enableProcessOptimization?: boolean
  enableImageOptimization?: boolean
  debug?: boolean
}

class MemoryOptimizer {
  private options: Required<MemoryOptimizerOptions>
  private isOptimizing = false
  private lastOptimization = 0
  private optimizationCooldown = 30000 // 30 seconds

  constructor(options: MemoryOptimizerOptions = {}) {
    this.options = {
      enableGarbageCollection: options.enableGarbageCollection ?? true,
      enableProcessOptimization: options.enableProcessOptimization ?? true,
      enableImageOptimization: options.enableImageOptimization ?? true,
      debug: options.debug ?? false,
    }

    this.setupMemoryOptimization()
  }

  private setupMemoryOptimization(): void {
    if (typeof process === 'undefined') return

    // Слушаем события критического потребления памяти
    memoryManager.on('critical', (stats) => {
      this.performCriticalOptimization(stats)
    })

    // Слушаем события высокого потребления памяти
    memoryManager.on('high', (stats) => {
      this.performHighMemoryOptimization(stats)
    })

    // Оптимизация при предупреждениях о памяти
    if (process.listenerCount('warning') === 0) {
      process.on('warning', (warning) => {
        if (warning.name === 'MaxListenersExceededWarning' || 
            warning.message.includes('memory')) {
          this.performEmergencyOptimization()
        }
      })
    }
  }

  /**
   * Критическая оптимизация при очень высоком потреблении памяти
   */
  private async performCriticalOptimization(stats: any): Promise<void> {
    if (this.isOptimizing || Date.now() - this.lastOptimization < this.optimizationCooldown) {
      return
    }

    this.isOptimizing = true
    this.lastOptimization = Date.now()

    try {
      if (this.options.debug) {
        console.log(`🚨 Critical memory optimization started: ${Math.round(stats.usage * 100)}%`)
      }

      // 1. Принудительная очистка всех кэшей
      memoryManager.clearAllCaches()

      // 2. Очистка глобальных переменных Node.js
      this.clearNodeGlobals()

      // 3. Принудительная сборка мусора
      if (this.options.enableGarbageCollection && global.gc) {
        global.gc()
        // Дополнительная сборка мусора через небольшой интервал
        setTimeout(() => {
          if (global.gc) global.gc()
        }, 1000)
      }

      // 4. Оптимизация процесса
      if (this.options.enableProcessOptimization) {
        this.optimizeProcess()
      }

      if (this.options.debug) {
        const newStats = process.memoryUsage()
        const newUsage = newStats.heapUsed / newStats.heapTotal
        console.log(`✅ Critical optimization completed: ${Math.round(newUsage * 100)}%`)
      }
    } catch (error) {
      console.error('Error during critical memory optimization:', error)
    } finally {
      this.isOptimizing = false
    }
  }

  /**
   * Оптимизация при высоком потреблении памяти
   */
  private async performHighMemoryOptimization(stats: any): Promise<void> {
    if (this.isOptimizing) return

    try {
      if (this.options.debug) {
        console.log(`⚠️ High memory optimization: ${Math.round(stats.usage * 100)}%`)
      }

      // Частичная очистка кэшей
      memoryManager.partialCleanup(0.6) // Удаляем 60% кэша

      // Мягкая сборка мусора
      if (this.options.enableGarbageCollection && global.gc) {
        setTimeout(() => {
          if (global.gc) global.gc()
        }, 500)
      }
    } catch (error) {
      console.error('Error during high memory optimization:', error)
    }
  }

  /**
   * Экстренная оптимизация
   */
  private async performEmergencyOptimization(): Promise<void> {
    try {
      if (this.options.debug) {
        console.log('🆘 Emergency memory optimization triggered')
      }

      // Очистка всех возможных ресурсов
      this.clearAllPossibleResources()

      // Множественная сборка мусора
      if (this.options.enableGarbageCollection && global.gc) {
        for (let i = 0; i < 3; i++) {
          global.gc()
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    } catch (error) {
      console.error('Error during emergency optimization:', error)
    }
  }

  /**
   * Очистка глобальных переменных Node.js
   */
  private clearNodeGlobals(): void {
    try {
      // Очистка require cache для неиспользуемых модулей
      const moduleIds = Object.keys(require.cache)
      const coreModules = ['fs', 'path', 'http', 'https', 'crypto', 'util']
      
      moduleIds.forEach(id => {
        // Не удаляем основные модули и модули из node_modules
        if (!coreModules.some(core => id.includes(core)) && 
            !id.includes('node_modules') && 
            !id.includes('payload') &&
            !id.includes('next')) {
          try {
            delete require.cache[id]
          } catch (e) {
            // Игнорируем ошибки
          }
        }
      })

      // Очистка таймеров
      if (typeof process !== 'undefined' && process._getActiveHandles) {
        const handles = process._getActiveHandles()
        handles.forEach(handle => {
          if (handle && typeof handle.unref === 'function') {
            handle.unref()
          }
        })
      }
    } catch (error) {
      if (this.options.debug) {
        console.warn('Error clearing Node globals:', error)
      }
    }
  }

  /**
   * Оптимизация процесса
   */
  private optimizeProcess(): void {
    try {
      if (typeof process === 'undefined') return

      // Установка лимитов памяти
      if (process.setMaxListeners) {
        process.setMaxListeners(20) // Уменьшаем количество слушателей
      }

      // Оптимизация V8
      if (process.env.NODE_ENV === 'production') {
        // Принудительная оптимизация V8
        if (typeof v8 !== 'undefined' && v8.setFlagsFromString) {
          v8.setFlagsFromString('--optimize-for-size')
        }
      }
    } catch (error) {
      if (this.options.debug) {
        console.warn('Error optimizing process:', error)
      }
    }
  }

  /**
   * Очистка всех возможных ресурсов
   */
  private clearAllPossibleResources(): void {
    try {
      // Очистка всех кэшей
      memoryManager.clearAllCaches()

      // Очистка глобальных переменных
      this.clearNodeGlobals()

      // Очистка буферов
      if (typeof Buffer !== 'undefined' && Buffer.poolSize) {
        // Сброс пула буферов
        Buffer.poolSize = 8192 // Уменьшаем размер пула
      }

      // Очистка консоли (если в браузере)
      if (typeof window !== 'undefined' && window.console && window.console.clear) {
        window.console.clear()
      }
    } catch (error) {
      if (this.options.debug) {
        console.warn('Error clearing resources:', error)
      }
    }
  }

  /**
   * Получение статистики оптимизации
   */
  getOptimizationStats(): {
    isOptimizing: boolean
    lastOptimization: number
    timeSinceLastOptimization: number
  } {
    return {
      isOptimizing: this.isOptimizing,
      lastOptimization: this.lastOptimization,
      timeSinceLastOptimization: Date.now() - this.lastOptimization,
    }
  }

  /**
   * Принудительная оптимизация
   */
  async forceOptimization(): Promise<void> {
    const stats = memoryManager.getStats()
    if (stats) {
      await this.performCriticalOptimization(stats)
    }
  }
}

// Создаем глобальный экземпляр оптимизатора
export const memoryOptimizer = new MemoryOptimizer({
  enableGarbageCollection: true,
  enableProcessOptimization: true,
  enableImageOptimization: true,
  debug: process.env.NODE_ENV === 'development'
})

export default memoryOptimizer
