/**
 * Утилита для очистки ресурсов и предотвращения утечек памяти
 */

import { cleanupGlobalCache } from './getGlobals'
import { cleanupLocaleCache } from './localization'

// Хранилище для интервалов, которые нужно очистить
const intervals = new Set<NodeJS.Timeout>()

// Хранилище для таймаутов, которые нужно очистить
const timeouts = new Set<NodeJS.Timeout>()

// Хранилище для AbortController, которые нужно отменить
const controllers = new Set<AbortController>()

/**
 * Регистрирует интервал для последующей очистки
 * @param interval Интервал для регистрации
 * @returns Тот же интервал для цепочки вызовов
 */
export function registerInterval(interval: NodeJS.Timeout): NodeJS.Timeout {
  intervals.add(interval)
  return interval
}

/**
 * Регистрирует таймаут для последующей очистки
 * @param timeout Таймаут для регистрации
 * @returns Тот же таймаут для цепочки вызовов
 */
export function registerTimeout(timeout: NodeJS.Timeout): NodeJS.Timeout {
  timeouts.add(timeout)
  return timeout
}

/**
 * Регистрирует AbortController для последующей очистки
 * @param controller AbortController для регистрации
 * @returns Тот же контроллер для цепочки вызовов
 */
export function registerController(controller: AbortController): AbortController {
  controllers.add(controller)
  return controller
}

/**
 * Очищает зарегистрированный интервал и удаляет его из хранилища
 * @param interval Интервал для очистки
 */
export function clearRegisteredInterval(interval: NodeJS.Timeout): void {
  if (intervals.has(interval)) {
    clearInterval(interval)
    intervals.delete(interval)
  }
}

/**
 * Очищает зарегистрированный таймаут и удаляет его из хранилища
 * @param timeout Таймаут для очистки
 */
export function clearRegisteredTimeout(timeout: NodeJS.Timeout): void {
  if (timeouts.has(timeout)) {
    clearTimeout(timeout)
    timeouts.delete(timeout)
  }
}

/**
 * Отменяет зарегистрированный AbortController и удаляет его из хранилища
 * @param controller AbortController для отмены
 */
export function abortRegisteredController(controller: AbortController): void {
  if (controllers.has(controller)) {
    controller.abort()
    controllers.delete(controller)
  }
}

/**
 * Очищает все зарегистрированные ресурсы
 */
export function cleanupAllResources(): void {
  // Очищаем все интервалы
  intervals.forEach(interval => {
    clearInterval(interval)
  })
  intervals.clear()

  // Очищаем все таймауты
  timeouts.forEach(timeout => {
    clearTimeout(timeout)
  })
  timeouts.clear()

  // Отменяем все AbortController
  controllers.forEach(controller => {
    controller.abort()
  })
  controllers.clear()

  // Очищаем кэши
  cleanupGlobalCache()
  cleanupLocaleCache()

  // Принудительный вызов сборщика мусора, если доступен
  if (global.gc) {
    global.gc()
  }
}

// Регистрируем обработчик для очистки ресурсов при завершении работы
if (typeof process !== 'undefined') {
  process.on('SIGTERM', cleanupAllResources)
  process.on('SIGINT', cleanupAllResources)
  
  // Регистрируем обработчик для очистки ресурсов при высокой нагрузке на память
  process.on('memoryPressure', () => {
    console.warn('Memory pressure detected, cleaning up resources')
    cleanupAllResources()
  })
}

// Экспортируем функцию для создания AbortController с автоматической регистрацией
export function createAbortController(): AbortController {
  const controller = new AbortController()
  return registerController(controller)
}

// Экспортируем функцию для создания интервала с автоматической регистрацией
export function createInterval(callback: () => void, ms: number): NodeJS.Timeout {
  const interval = setInterval(callback, ms)
  return registerInterval(interval)
}

// Экспортируем функцию для создания таймаута с автоматической регистрацией
export function createTimeout(callback: () => void, ms: number): NodeJS.Timeout {
  const timeout = setTimeout(callback, ms)
  return registerTimeout(timeout)
}
