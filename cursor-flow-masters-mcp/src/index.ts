import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import { ApiClient } from './api/client'
import { Updater } from './utils/updater'
import { MCPServerConfig } from './types'
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

// Слушаем запросы для MCP
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

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
          apiVersion: versionInfo.data?.apiVersion || 'unknown',
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
    } else if (pathname === '/mcp/n8n-template') {
      // Получить шаблон конфигурации для n8n
      try {
        const response = await axios.get(
          `${config.apiConfig.apiUrl}/api/integrations/n8n-template`,
          {
            headers: {
              Authorization: `ApiKey ${config.apiConfig.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        )

        res.statusCode = 200
        res.end(JSON.stringify(response.data))
      } catch (error) {
        console.error('Ошибка при получении шаблона n8n:', error)
        res.statusCode = 500
        res.end(
          JSON.stringify({
            success: false,
            error: 'Не удалось получить шаблон n8n',
          }),
        )
      }
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

server.listen(port, host, () => {
  console.log(`MCP сервер запущен: http://${host}:${port}`)
  console.log(`Версия: ${currentVersion}`)

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
