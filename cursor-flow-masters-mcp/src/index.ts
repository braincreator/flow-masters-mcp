import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import { ApiClient } from './api/client'
import { Updater } from './utils/updater'
import { EndpointsCrawler } from './utils/endpointsCrawler'
import { LLMHandler } from './utils/llmHandler'
import { MCPServerConfig, ModelContextRequest } from './types'
import axios from 'axios'

// Версия из package.json
const packageJsonPath = path.resolve(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const currentVersion = packageJson.version

// Получаем конфигурацию
let config: MCPServerConfig
try {
  const configPath = path.resolve(process.cwd(), 'config.json')
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  } else {
    config = {
      port: parseInt(process.env.PORT || '3030', 10),
      host: process.env.HOST || 'localhost',
      apiConfig: {
        apiUrl: process.env.API_URL || 'https://flow-masters-api.example.com',
        apiKey: process.env.API_KEY || '',
        autoUpdate: process.env.AUTO_UPDATE === 'true',
        updateCheckInterval: parseInt(process.env.UPDATE_CHECK_INTERVAL || '60', 10),
        basePath: process.env.API_BASE_PATH || '/api',
        apiVersion: process.env.API_VERSION || 'v1',
      },
      llm: {
        modelContextEnabled: process.env.MODEL_CONTEXT_ENABLED === 'true',
        allowedModels: process.env.ALLOWED_MODELS ? process.env.ALLOWED_MODELS.split(',') : '*',
        maxTokens: parseInt(process.env.MAX_TOKENS || '8192', 10),
        contextWindow: parseInt(process.env.CONTEXT_WINDOW || '4096', 10),
        caching: {
          enabled: process.env.CACHE_ENABLED !== 'false',
          ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
        },
      },
    }

    // Записываем конфигурацию по умолчанию
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
    console.log(`Создан файл конфигурации по умолчанию: ${configPath}`)
  }
} catch (error) {
  console.error('Ошибка при загрузке конфигурации:', error)
  process.exit(1)
}

// Создаем API клиент
const apiClient = new ApiClient(config.apiConfig)

// Создаем обновлятор и запускаем проверку обновлений
const updater = new Updater(
  apiClient,
  currentVersion,
  config.apiConfig.autoUpdate,
  config.apiConfig.updateCheckInterval,
)

// Создаем сканер эндпоинтов
const endpointsCrawler = new EndpointsCrawler(apiClient)

// Создаем обработчик LLM запросов
const llmHandler = new LLMHandler(config.llm, endpointsCrawler)

// Инициализация сканера эндпоинтов
async function initializeEndpointsCrawler() {
  try {
    await endpointsCrawler.loadKnowledgeBase()
    await endpointsCrawler.updateEndpoints()
  } catch (error) {
    console.error('Ошибка при инициализации сканера эндпоинтов:', error)
  }
}

// Слушаем запросы для MCP
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.statusCode = 200
    res.end()
    return
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`)
  const pathname = url.pathname

  try {
    // Обработка запросов MCP
    if (pathname === '/mcp/health') {
      // Проверка здоровья
      const isConnected = await apiClient.testConnection()
      res.statusCode = isConnected ? 200 : 500
      res.end(
        JSON.stringify({
          success: isConnected,
          version: currentVersion,
          message: isConnected ? 'MCP сервер работает нормально' : 'Ошибка подключения к API',
          endpointsCount: endpointsCrawler.getEndpointCount(),
          apiConfig: {
            basePath: config.apiConfig.basePath,
            apiVersion: config.apiConfig.apiVersion,
          },
        }),
      )
    } else if (pathname === '/mcp/version') {
      // Информация о версии
      const versionInfo = await apiClient.getVersion()
      res.statusCode = versionInfo.success ? 200 : 500
      res.end(
        JSON.stringify({
          success: true,
          version: currentVersion,
          apiVersion: versionInfo.data?.apiVersion || config.apiConfig.apiVersion,
          basePath: config.apiConfig.basePath,
          data: versionInfo.data,
        }),
      )
    } else if (pathname === '/mcp/integrations') {
      // Получить список интеграций
      const type = url.searchParams.get('type') || undefined
      const integrations = await apiClient.getIntegrations(type)
      res.statusCode = integrations.success ? 200 : 500
      res.end(JSON.stringify(integrations))
    } else if (pathname === '/mcp/check-update') {
      // Ручная проверка обновлений
      const hasUpdate = await updater.checkForUpdates()
      res.statusCode = 200
      res.end(
        JSON.stringify({
          success: true,
          hasUpdate,
          currentVersion,
        }),
      )
    } else if (pathname === '/mcp/endpoints') {
      // Получить список доступных эндпоинтов
      const query = url.searchParams.get('query') || ''
      const endpoints = query
        ? endpointsCrawler.searchEndpoints(query)
        : endpointsCrawler.getAllEndpoints()

      res.statusCode = 200
      res.end(
        JSON.stringify({
          success: true,
          endpoints,
          totalEndpoints: endpointsCrawler.getEndpointCount(),
          query: query || undefined,
        }),
      )
    } else if (pathname === '/mcp/endpoints/refresh') {
      // Обновить список эндпоинтов
      const updated = await endpointsCrawler.updateEndpoints()
      res.statusCode = updated ? 200 : 500
      res.end(
        JSON.stringify({
          success: updated,
          message: updated ? 'Эндпоинты успешно обновлены' : 'Не удалось обновить эндпоинты',
          endpointsCount: endpointsCrawler.getEndpointCount(),
        }),
      )
    } else if (pathname === '/mcp/context') {
      // Обработка запроса на получение контекста модели
      if (req.method === 'POST') {
        let body = ''
        req.on('data', (chunk) => {
          body += chunk.toString()
        })

        req.on('end', async () => {
          try {
            const request: ModelContextRequest = JSON.parse(body)

            if (!request.query) {
              res.statusCode = 400
              res.end(
                JSON.stringify({
                  success: false,
                  error: 'Query is required',
                }),
              )
              return
            }

            const response = await llmHandler.handleModelContextRequest(request)
            res.statusCode = response.success ? 200 : 400
            res.end(JSON.stringify(response))
          } catch (error) {
            console.error('Error processing context request:', error)
            res.statusCode = 500
            res.end(
              JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              }),
            )
          }
        })

        return
      } else {
        res.statusCode = 405
        res.end(
          JSON.stringify({
            success: false,
            error: 'Method not allowed',
          }),
        )
      }
    } else if (pathname === '/mcp/proxy') {
      // Прокси для API запросов
      if (req.method === 'POST') {
        let body = ''
        req.on('data', (chunk) => {
          body += chunk.toString()
        })

        req.on('end', async () => {
          try {
            const proxyRequest = JSON.parse(body)
            const { method, path, data, params, headers } = proxyRequest

            if (!method || !path) {
              res.statusCode = 400
              res.end(
                JSON.stringify({
                  success: false,
                  error: 'Method and path are required',
                }),
              )
              return
            }

            const response = await apiClient.request(method, path, data, params, headers)
            res.statusCode = 200
            res.end(JSON.stringify(response))
          } catch (error) {
            console.error('Error in proxy request:', error)
            res.statusCode = 500
            res.end(
              JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              }),
            )
          }
        })

        return
      } else {
        res.statusCode = 405
        res.end(
          JSON.stringify({
            success: false,
            error: 'Method not allowed',
          }),
        )
      }
    } else if (pathname === '/') {
      // Корневой эндпоинт с информацией о сервере
      res.statusCode = 200
      res.end(
        JSON.stringify({
          name: 'Flow Masters MCP Server',
          description: 'Model Context Protocol server for Flow Masters API',
          version: currentVersion,
          apiVersion: config.apiConfig.apiVersion,
          basePath: config.apiConfig.basePath,
          endpoints: [
            '/mcp/health',
            '/mcp/version',
            '/mcp/integrations',
            '/mcp/check-update',
            '/mcp/endpoints',
            '/mcp/endpoints/refresh',
            '/mcp/context',
            '/mcp/proxy',
          ],
          llmSupport: config.llm.modelContextEnabled,
          endpointsCount: endpointsCrawler.getEndpointCount(),
        }),
      )
    } else {
      // Неизвестный путь
      res.statusCode = 404
      res.end(
        JSON.stringify({
          success: false,
          error: 'Not found',
        }),
      )
    }
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error)
    res.statusCode = 500
    res.end(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    )
  }
})

// Запускаем сервер
const port = config.port || 3030
const host = config.host || 'localhost'

server.listen(port, host, async () => {
  console.log(`MCP сервер запущен: http://${host}:${port}`)
  console.log(`Версия: ${currentVersion}`)
  console.log(
    `API URL: ${config.apiConfig.apiUrl}${config.apiConfig.basePath}/${config.apiConfig.apiVersion}`,
  )

  // Инициализация сканера эндпоинтов
  await initializeEndpointsCrawler()
  console.log(`Загружено ${endpointsCrawler.getEndpointCount()} API эндпоинтов`)

  // Запускаем проверку обновлений
  updater.startUpdateChecker()

  // Тестируем соединение с API
  apiClient
    .testConnection()
    .then((isConnected) => {
      if (isConnected) {
        console.log('Подключение к API Flow Masters успешно установлено')
      } else {
        console.error('Не удалось подключиться к API Flow Masters')
      }
    })
    .catch((error) => {
      console.error('Ошибка при проверке подключения к API:', error)
    })
})

// Обработка завершения процесса
process.on('SIGINT', () => {
  console.log('Завершение работы MCP сервера...')
  updater.stopUpdateChecker()
  server.close(() => {
    console.log('MCP сервер остановлен')
    process.exit(0)
  })
})
