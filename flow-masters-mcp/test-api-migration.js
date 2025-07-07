#!/usr/bin/env node

/**
 * Скрипт для тестирования MCP сервера после миграции API
 */

const http = require('http')

// Конфигурация тестирования (можно переопределить через переменные окружения)
const CONFIG = {
  MCP_HOST: process.env.MCP_HOST || 'localhost',
  MCP_PORT: parseInt(process.env.MCP_PORT || '3030', 10),
  API_HOST: process.env.API_HOST || 'localhost',
  API_PORT: parseInt(process.env.API_PORT || '3000', 10),
  API_URL: process.env.API_URL || null, // Полный URL API (альтернатива HOST:PORT)
  TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '10000', 10),
}

// Утилиты для логирования
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
}

// Функция для выполнения HTTP запроса
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
          }
          resolve(result)
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          })
        }
      })
    })

    req.on('error', reject)
    req.setTimeout(CONFIG.TIMEOUT, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

// Тест подключения к API
async function testApiConnection() {
  log.info('Тестирование подключения к API...')
  log.info(`API адрес: ${CONFIG.API_URL || `${CONFIG.API_HOST}:${CONFIG.API_PORT}`}`)
  
  try {
    let requestOptions
    
    if (CONFIG.API_URL) {
      // Используем полный URL (для внешних API)
      const url = new URL('/api/health', CONFIG.API_URL)
      requestOptions = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Host': url.host,
        },
      }
    } else {
      // Используем HOST:PORT (для локального тестирования)
      requestOptions = {
        hostname: CONFIG.API_HOST,
        port: CONFIG.API_PORT,
        path: '/api/health',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    }

    const response = await makeRequest(requestOptions)

    if (response.statusCode === 200) {
      log.success('API сервер доступен')
      return true
    } else {
      log.warning(`API сервер вернул статус: ${response.statusCode}`)
      return false
    }
  } catch (error) {
    log.error(`Ошибка подключения к API: ${error.message}`)
    return false
  }
}

// Тест подключения к MCP серверу
async function testMcpConnection() {
  log.info('Тестирование подключения к MCP серверу...')
  
  try {
    const response = await makeRequest({
      hostname: CONFIG.MCP_HOST,
      port: CONFIG.MCP_PORT,
      path: '/mcp/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.statusCode === 200) {
      log.success('MCP сервер доступен')
      log.info(`Статус API: ${response.body?.apiConnected ? 'подключен' : 'отключен'}`)
      return response.body?.apiConnected || false
    } else {
      log.warning(`MCP сервер вернул статус: ${response.statusCode}`)
      return false
    }
  } catch (error) {
    log.error(`Ошибка подключения к MCP серверу: ${error.message}`)
    return false
  }
}

// Тест получения версии
async function testVersionInfo() {
  log.info('Получение информации о версии...')
  
  try {
    const response = await makeRequest({
      hostname: CONFIG.MCP_HOST,
      port: CONFIG.MCP_PORT,
      path: '/mcp/version',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.statusCode === 200) {
      log.success('Информация о версии получена')
      log.info(`MCP версия: ${response.body?.version}`)
      log.info(`API версия: ${response.body?.apiVersion || 'не указана'}`)
      log.info(`Базовый путь: ${response.body?.basePath}`)
      return true
    } else {
      log.warning(`Ошибка получения версии: ${response.statusCode}`)
      return false
    }
  } catch (error) {
    log.error(`Ошибка получения версии: ${error.message}`)
    return false
  }
}

// Тест прокси запроса
async function testProxyRequest() {
  log.info('Тестирование прокси запроса...')
  
  try {
    const response = await makeRequest({
      hostname: CONFIG.MCP_HOST,
      port: CONFIG.MCP_PORT,
      path: '/mcp/proxy',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, {
      method: 'GET',
      path: '/category-types',
      params: {},
    })

    if (response.statusCode === 200 && response.body?.success) {
      log.success('Прокси запрос выполнен успешно')
      log.info(`Получено данных: ${response.body?.data?.length || 0} элементов`)
      return true
    } else {
      log.warning(`Прокси запрос неуспешен: ${response.statusCode}`)
      log.warning(`Ошибка: ${response.body?.error || 'неизвестная ошибка'}`)
      return false
    }
  } catch (error) {
    log.error(`Ошибка прокси запроса: ${error.message}`)
    return false
  }
}

// Тест получения endpoints
async function testEndpointsList() {
  log.info('Получение списка endpoints...')
  
  try {
    const response = await makeRequest({
      hostname: CONFIG.MCP_HOST,
      port: CONFIG.MCP_PORT,
      path: '/mcp/endpoints',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.statusCode === 200 && response.body?.success) {
      log.success('Список endpoints получен')
      log.info(`Найдено endpoints: ${response.body?.data?.length || 0}`)
      
      // Проверяем, что endpoints не содержат старые пути v1
      const hasV1Paths = response.body?.data?.some(endpoint => 
        endpoint.path && endpoint.path.includes('/v1/')
      )
      
      if (hasV1Paths) {
        log.warning('Обнаружены endpoints со старыми путями /v1/')
      } else {
        log.success('Все endpoints используют новые пути без /v1/')
      }
      
      return true
    } else {
      log.warning(`Ошибка получения endpoints: ${response.statusCode}`)
      return false
    }
  } catch (error) {
    log.error(`Ошибка получения endpoints: ${error.message}`)
    return false
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🧪 Тестирование MCP сервера после миграции API\n')
  
  // Выводим конфигурацию
  console.log('📋 Конфигурация тестирования:')
  console.log(`   MCP сервер: ${CONFIG.MCP_HOST}:${CONFIG.MCP_PORT}`)
  console.log(`   API сервер: ${CONFIG.API_URL || `${CONFIG.API_HOST}:${CONFIG.API_PORT}`}`)
  console.log(`   Таймаут: ${CONFIG.TIMEOUT}ms\n`)
  
  const tests = [
    { name: 'API Connection', fn: testApiConnection },
    { name: 'MCP Connection', fn: testMcpConnection },
    { name: 'Version Info', fn: testVersionInfo },
    { name: 'Endpoints List', fn: testEndpointsList },
    { name: 'Proxy Request', fn: testProxyRequest },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    console.log(`\n🔍 Тест: ${test.name}`)
    console.log('─'.repeat(50))
    
    try {
      const result = await test.fn()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      log.error(`Критическая ошибка в тесте ${test.name}: ${error.message}`)
      failed++
    }
  }
  
  // Итоговая статистика
  console.log('\n📊 Результаты тестирования:')
  console.log('═'.repeat(50))
  log.success(`Пройдено тестов: ${passed}`)
  if (failed > 0) {
    log.error(`Провалено тестов: ${failed}`)
  }
  log.info(`Общий процент успеха: ${((passed / tests.length) * 100).toFixed(1)}%`)
  
  if (failed === 0) {
    log.success('\n🎉 Все тесты пройдены! MCP сервер готов к работе с новым API.')
  } else {
    log.warning('\n⚠️  Некоторые тесты провалены. Проверьте конфигурацию и статус серверов.')
  }
  
  process.exit(failed > 0 ? 1 : 0)
}

// Запуск тестов
runTests().catch(error => {
  log.error(`Критическая ошибка: ${error.message}`)
  process.exit(1)
})