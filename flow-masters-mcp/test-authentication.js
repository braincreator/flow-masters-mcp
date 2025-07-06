#!/usr/bin/env node

/**
 * Скрипт для тестирования аутентификации между MCP и Flow Masters
 */

const http = require('http')
const https = require('https')

// Конфигурация тестирования
const CONFIG = {
  API_HOST: process.env.API_HOST || 'localhost',
  API_PORT: parseInt(process.env.API_PORT || '3000', 10),
  API_URL: process.env.API_URL || null,
  API_KEY: process.env.API_KEY || 'test-api-key',
  TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '10000', 10),
  USE_HTTPS: process.env.USE_HTTPS === 'true',
}

// Утилиты для логирования
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  debug: (msg) => console.log(`🔍 ${msg}`),
}

// Функция для выполнения HTTP/HTTPS запроса
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http
    
    const req = client.request(options, (res) => {
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
            rawBody: body,
          }
          resolve(result)
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: body,
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

// Создание опций запроса
function createRequestOptions(path, method = 'GET', headers = {}) {
  if (CONFIG.API_URL) {
    const url = new URL(path, CONFIG.API_URL)
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Host': url.host,
        ...headers,
      },
    }
  } else {
    return {
      protocol: CONFIG.USE_HTTPS ? 'https:' : 'http:',
      hostname: CONFIG.API_HOST,
      port: CONFIG.API_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  }
}

// Тест с валидным API ключом
async function testValidApiKey() {
  log.info('Тестирование с валидным API ключом...')
  
  try {
    const options = createRequestOptions('/api/category-types', 'GET', {
      'Authorization': `Bearer ${CONFIG.API_KEY}`,
      'X-Client': 'MCP-Auth-Test',
    })
    
    log.debug(`Запрос: ${options.method} ${options.protocol}//${options.hostname}:${options.port}${options.path}`)
    log.debug(`Заголовок: Authorization: Bearer ${CONFIG.API_KEY.substring(0, 8)}...`)
    
    const response = await makeRequest(options)
    
    if (response.statusCode === 200) {
      log.success('Аутентификация с валидным ключом прошла успешно')
      log.info(`Получено данных: ${response.body?.data?.length || 0} элементов`)
      return true
    } else {
      log.warning(`Неожиданный статус: ${response.statusCode}`)
      log.warning(`Ответ: ${response.rawBody}`)
      return false
    }
  } catch (error) {
    log.error(`Ошибка при тестировании валидного ключа: ${error.message}`)
    return false
  }
}

// Тест с невалидным API ключом
async function testInvalidApiKey() {
  log.info('Тестирование с невалидным API ключом...')
  
  try {
    const options = createRequestOptions('/api/category-types', 'GET', {
      'Authorization': 'Bearer invalid-api-key-12345',
      'X-Client': 'MCP-Auth-Test',
    })
    
    const response = await makeRequest(options)
    
    if (response.statusCode === 403) {
      log.success('Невалидный ключ корректно отклонен (403 Forbidden)')
      return true
    } else if (response.statusCode === 401) {
      log.success('Невалидный ключ корректно отклонен (401 Unauthorized)')
      return true
    } else {
      log.warning(`Неожиданный статус для невалидного ключа: ${response.statusCode}`)
      log.warning(`Ответ: ${response.rawBody}`)
      return false
    }
  } catch (error) {
    log.error(`Ошибка при тестировании невалидного ключа: ${error.message}`)
    return false
  }
}

// Тест без API ключа
async function testMissingApiKey() {
  log.info('Тестирование без API ключа...')
  
  try {
    const options = createRequestOptions('/api/category-types', 'GET', {
      'X-Client': 'MCP-Auth-Test',
    })
    
    const response = await makeRequest(options)
    
    if (response.statusCode === 401) {
      log.success('Отсутствующий ключ корректно отклонен (401 Unauthorized)')
      return true
    } else {
      log.warning(`Неожиданный статус для отсутствующего ключа: ${response.statusCode}`)
      log.warning(`Ответ: ${response.rawBody}`)
      return false
    }
  } catch (error) {
    log.error(`Ошибка при тестировании отсутствующего ключа: ${error.message}`)
    return false
  }
}

// Тест с неправильным форматом заголовка
async function testWrongHeaderFormat() {
  log.info('Тестирование с неправильным форматом заголовка...')
  
  try {
    const options = createRequestOptions('/api/category-types', 'GET', {
      'Authorization': `ApiKey ${CONFIG.API_KEY}`, // Старый формат
      'X-Client': 'MCP-Auth-Test',
    })
    
    const response = await makeRequest(options)
    
    if (response.statusCode === 401) {
      log.success('Неправильный формат заголовка корректно отклонен (401 Unauthorized)')
      return true
    } else {
      log.warning(`Неожиданный статус для неправильного формата: ${response.statusCode}`)
      log.warning(`Ответ: ${response.rawBody}`)
      return false
    }
  } catch (error) {
    log.error(`Ошибка при тестировании неправильного формата: ${error.message}`)
    return false
  }
}

// Тест доступности API
async function testApiAvailability() {
  log.info('Проверка доступности API...')
  
  try {
    const options = createRequestOptions('/api/health', 'GET')
    
    const response = await makeRequest(options)
    
    if (response.statusCode === 200) {
      log.success('API сервер доступен')
      return true
    } else {
      log.warning(`API сервер вернул статус: ${response.statusCode}`)
      return false
    }
  } catch (error) {
    log.error(`API сервер недоступен: ${error.message}`)
    return false
  }
}

// Тест различных endpoints
async function testDifferentEndpoints() {
  log.info('Тестирование различных endpoints...')
  
  const endpoints = [
    '/api/category-types',
    '/api/services',
    '/api/subscription-plans',
    '/api/blocks',
  ]
  
  let successCount = 0
  
  for (const endpoint of endpoints) {
    try {
      const options = createRequestOptions(endpoint, 'GET', {
        'Authorization': `Bearer ${CONFIG.API_KEY}`,
        'X-Client': 'MCP-Auth-Test',
      })
      
      const response = await makeRequest(options)
      
      if (response.statusCode === 200) {
        log.success(`${endpoint}: OK`)
        successCount++
      } else {
        log.warning(`${endpoint}: ${response.statusCode}`)
      }
    } catch (error) {
      log.error(`${endpoint}: ${error.message}`)
    }
  }
  
  log.info(`Успешно протестировано endpoints: ${successCount}/${endpoints.length}`)
  return successCount === endpoints.length
}

// Основная функция тестирования
async function runAuthenticationTests() {
  console.log('🔐 Тестирование аутентификации MCP ↔ Flow Masters\n')
  
  // Выводим конфигурацию
  console.log('📋 Конфигурация тестирования:')
  console.log(`   API сервер: ${CONFIG.API_URL || `${CONFIG.API_HOST}:${CONFIG.API_PORT}`}`)
  console.log(`   API ключ: ${CONFIG.API_KEY.substring(0, 8)}...`)
  console.log(`   Протокол: ${CONFIG.USE_HTTPS ? 'HTTPS' : 'HTTP'}`)
  console.log(`   Таймаут: ${CONFIG.TIMEOUT}ms\n`)
  
  const tests = [
    { name: 'API Availability', fn: testApiAvailability },
    { name: 'Valid API Key', fn: testValidApiKey },
    { name: 'Invalid API Key', fn: testInvalidApiKey },
    { name: 'Missing API Key', fn: testMissingApiKey },
    { name: 'Wrong Header Format', fn: testWrongHeaderFormat },
    { name: 'Different Endpoints', fn: testDifferentEndpoints },
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
  console.log('\n📊 Результаты тестирования аутентификации:')
  console.log('═'.repeat(60))
  log.success(`Пройдено тестов: ${passed}`)
  if (failed > 0) {
    log.error(`Провалено тестов: ${failed}`)
  }
  log.info(`Общий процент успеха: ${((passed / tests.length) * 100).toFixed(1)}%`)
  
  if (failed === 0) {
    log.success('\n🎉 Все тесты аутентификации пройдены! MCP ↔ Flow Masters готовы к работе.')
  } else {
    log.warning('\n⚠️  Некоторые тесты провалены. Проверьте конфигурацию API ключей.')
  }
  
  // Рекомендации
  console.log('\n💡 Рекомендации:')
  console.log('  1. Убедитесь, что API_KEY одинаковый в MCP и Flow Masters')
  console.log('  2. Проверьте, что PAYLOAD_SECRET установлен в основном приложении')
  console.log('  3. Используйте HTTPS в продакшн окружении')
  console.log('  4. Регулярно ротируйте API ключи')
  
  process.exit(failed > 0 ? 1 : 0)
}

// Запуск тестов
runAuthenticationTests().catch(error => {
  log.error(`Критическая ошибка: ${error.message}`)
  process.exit(1)
})