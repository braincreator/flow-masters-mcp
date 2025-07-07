#!/usr/bin/env tsx

import { getAllApiPaths } from '../src/config/api-routes'

/**
 * Скрипт для тестирования всех API endpoints
 *
 * Проверяет доступность и корректность ответов всех API маршрутов
 * Поддерживает как старые (/api/v1/), так и новые (/api/) пути
 */

interface TestResult {
  path: string
  status: number
  success: boolean
  error?: string
  responseTime: number
  contentType?: string
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  results: TestResult[]
}

// Конфигурация тестирования
const CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  TIMEOUT: 10000, // 10 секунд
  PARALLEL_REQUESTS: 5, // Количество параллельных запросов
  RETRY_COUNT: 2,
  VERBOSE: process.argv.includes('--verbose'),
  ONLY_ERRORS: process.argv.includes('--only-errors'),
  TEST_LEGACY: process.argv.includes('--test-legacy'), // Тестировать старые пути
}

// Утилиты для логирования
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warning: (msg: string) => console.log(`⚠️  ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  verbose: (msg: string) => CONFIG.VERBOSE && console.log(`🔍 ${msg}`),
}

// Список endpoints, которые требуют аутентификации
const PROTECTED_ENDPOINTS = [
  '/api/users',
  '/api/v1/users',
  '/api/orders',
  '/api/v1/orders',
  '/api/cart',
  '/api/v1/cart',
  '/api/admin',
  '/api/v1/admin',
]

// Список endpoints, которые требуют POST данные
const POST_ENDPOINTS = [
  '/api/contact',
  '/api/v1/contact',
  '/api/form-submissions',
  '/api/checkout',
  '/api/v1/checkout',
]

// Функция для выполнения HTTP запроса с таймаутом
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Тестирование одного endpoint
async function testEndpoint(path: string, retryCount = 0): Promise<TestResult> {
  const startTime = Date.now()
  const fullUrl = `${CONFIG.BASE_URL}${path}`

  log.verbose(`Тестирование: ${fullUrl}`)

  try {
    // Определяем метод запроса
    const method = POST_ENDPOINTS.some((ep) =>
      path.includes(ep.replace('/api/v1/', '').replace('/api/', '')),
    )
      ? 'POST'
      : 'GET'

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Script/1.0',
      },
    }

    // Добавляем тестовые данные для POST запросов
    if (method === 'POST') {
      options.body = JSON.stringify({ test: true })
    }

    const response = await fetchWithTimeout(fullUrl, options)
    const responseTime = Date.now() - startTime
    const contentType = response.headers.get('content-type')

    // Определяем успешность запроса
    const isSuccess = response.status < 500 && response.status !== 404

    const result: TestResult = {
      path,
      status: response.status,
      success: isSuccess,
      responseTime,
      contentType: contentType || undefined,
    }

    if (isSuccess) {
      log.verbose(`✅ ${path} - ${response.status} (${responseTime}ms)`)
    } else {
      log.verbose(`❌ ${path} - ${response.status} (${responseTime}ms)`)
    }

    return result
  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Повторная попытка при ошибке
    if (retryCount < CONFIG.RETRY_COUNT) {
      log.verbose(`🔄 Повторная попытка для ${path} (${retryCount + 1}/${CONFIG.RETRY_COUNT})`)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Ждем 1 секунду
      return testEndpoint(path, retryCount + 1)
    }

    const result: TestResult = {
      path,
      status: 0,
      success: false,
      error: errorMessage,
      responseTime,
    }

    log.verbose(`❌ ${path} - ERROR: ${errorMessage} (${responseTime}ms)`)
    return result
  }
}

// Тестирование группы endpoints параллельно
async function testEndpointsParallel(paths: string[]): Promise<TestResult[]> {
  const results: TestResult[] = []

  // Разбиваем на группы для параллельного выполнения
  for (let i = 0; i < paths.length; i += CONFIG.PARALLEL_REQUESTS) {
    const batch = paths.slice(i, i + CONFIG.PARALLEL_REQUESTS)
    const batchResults = await Promise.all(batch.map((path) => testEndpoint(path)))
    results.push(...batchResults)

    // Небольшая пауза между группами
    if (i + CONFIG.PARALLEL_REQUESTS < paths.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}

// Получение списка путей для тестирования
function getPathsToTest(): string[] {
  const paths = getAllApiPaths()

  // Фильтруем пути, которые содержат параметры
  const staticPaths = paths.filter((path) => !path.includes(':') && !path.includes('{'))

  if (CONFIG.TEST_LEGACY) {
    // Добавляем старые пути для тестирования совместимости
    const legacyPaths = staticPaths
      .filter((path) => !path.includes('/api/v1/'))
      .map((path) => path.replace('/api/', '/api/v1/'))

    return [...staticPaths, ...legacyPaths]
  }

  return staticPaths
}

// Вывод результатов тестирования
function printResults(summary: TestSummary): void {
  console.log('\n📊 Результаты тестирования API endpoints:')
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Всего протестировано: ${summary.total}`)
  console.log(`Успешно: ${summary.passed} ✅`)
  console.log(`Ошибки: ${summary.failed} ❌`)
  console.log(`Процент успеха: ${((summary.passed / summary.total) * 100).toFixed(1)}%`)

  if (summary.failed > 0) {
    console.log('\n❌ Неудачные запросы:')
    summary.results
      .filter((r) => !r.success)
      .forEach((result) => {
        console.log(
          `  ${result.path} - ${result.status || 'ERROR'} ${result.error ? `(${result.error})` : ''}`,
        )
      })
  }

  if (!CONFIG.ONLY_ERRORS && CONFIG.VERBOSE) {
    console.log('\n✅ Успешные запросы:')
    summary.results
      .filter((r) => r.success)
      .forEach((result) => {
        console.log(`  ${result.path} - ${result.status} (${result.responseTime}ms)`)
      })
  }

  // Статистика по времени ответа
  const responseTimes = summary.results.map((r) => r.responseTime)
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  const maxResponseTime = Math.max(...responseTimes)

  console.log(`\n⏱️  Среднее время ответа: ${avgResponseTime.toFixed(0)}ms`)
  console.log(`⏱️  Максимальное время ответа: ${maxResponseTime}ms`)
}

// Основная функция тестирования
async function runTests(): Promise<void> {
  console.log('🧪 Запуск тестирования API endpoints...\n')

  const pathsToTest = getPathsToTest()
  log.info(`Найдено ${pathsToTest.length} endpoints для тестирования`)

  if (CONFIG.TEST_LEGACY) {
    log.info('Включено тестирование legacy путей (/api/v1/)')
  }

  const startTime = Date.now()
  const results = await testEndpointsParallel(pathsToTest)
  const totalTime = Date.now() - startTime

  const summary: TestSummary = {
    total: results.length,
    passed: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  }

  printResults(summary)

  console.log(`\n⏱️  Общее время тестирования: ${totalTime}ms`)

  // Возвращаем код выхода в зависимости от результатов
  if (summary.failed > 0) {
    process.exit(1)
  }
}

// Функция для проверки доступности сервера
async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${CONFIG.BASE_URL}/api/health`)
    return response.ok
  } catch {
    return false
  }
}

// Главная функция
async function main(): void {
  console.log('🚀 API Endpoints Tester\n')

  // Проверяем доступность сервера
  log.info('Проверка доступности сервера...')
  const serverHealthy = await checkServerHealth()

  if (!serverHealthy) {
    log.error(`Сервер недоступен по адресу: ${CONFIG.BASE_URL}`)
    log.info('Убедитесь, что сервер запущен и доступен')
    process.exit(1)
  }

  log.success('Сервер доступен')

  await runTests()
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log.error(`Критическая ошибка: ${error.message}`)
    process.exit(1)
  })
}

export { testEndpoint, runTests }
