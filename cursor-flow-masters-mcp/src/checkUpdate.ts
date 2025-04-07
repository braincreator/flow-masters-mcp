import * as fs from 'fs'
import * as path from 'path'
import { ApiClient } from './api/client'
import { Updater } from './utils/updater'

async function checkForUpdates() {
  try {
    // Чтение package.json для получения текущей версии
    const packageJsonPath = path.resolve(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const currentVersion = packageJson.version

    // Загрузка конфигурации
    let config
    try {
      const configPath = path.resolve(process.cwd(), 'config.json')
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    } catch (error) {
      console.error('Ошибка при загрузке конфигурации:', error)
      console.log('Используем параметры по умолчанию или переменные окружения')

      config = {
        apiUrl: process.env.API_URL || 'https://flow-masters-api.example.com',
        apiKey: process.env.API_KEY || '',
        autoUpdate: process.env.AUTO_UPDATE === 'true',
        updateCheckInterval: parseInt(process.env.UPDATE_CHECK_INTERVAL || '60', 10),
      }
    }

    if (!config.apiKey) {
      console.error(
        'API ключ не указан. Укажите его в config.json или через переменную окружения API_KEY',
      )
      process.exit(1)
    }

    const apiClient = new ApiClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      autoUpdate: config.autoUpdate,
      updateCheckInterval: config.updateCheckInterval,
    })

    const updater = new Updater(
      apiClient,
      currentVersion,
      config.autoUpdate,
      config.updateCheckInterval,
    )

    const hasUpdate = await updater.checkForUpdates()

    if (!hasUpdate) {
      console.log('Обновления не найдены или не могут быть применены')
      process.exit(0)
    }
  } catch (error) {
    console.error('Ошибка при проверке обновлений:', error)
    process.exit(1)
  }
}

// Запуск проверки обновлений
checkForUpdates().catch(console.error)
