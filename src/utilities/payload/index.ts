import { Payload, getPayload } from 'payload'
import { ServiceRegistry } from '../../services/service.registry'
import config from '../../payload.config'
import { connectionMonitor } from './monitoring'
import { logger } from '../logger'

// Используем глобальную переменную для кеширования в серверном окружении
declare global {
  var payloadClient: Payload | null
}

// В разработке всегда создаем новый клиент при перезагрузке серверного кода
if (process.env.NODE_ENV !== 'production') {
  global.payloadClient = null
}

/**
 * Обертка для повторного выполнения операций MongoDB при истечении сессии
 * @param operation Функция с операцией MongoDB
 * @param maxRetries Максимальное количество попыток
 * @returns Результат операции
 */
export async function retryOnSessionExpired<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: any = null
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      attempts++

      // Повторяем только при ошибке истечения сессии
      if (error?.name === 'MongoExpiredSessionError' && attempts < maxRetries) {
        logger.warn(`MongoDB сессия истекла, повторная попытка ${attempts}/${maxRetries}`)
        await new Promise((resolve) => setTimeout(resolve, 100 * attempts)) // Небольшая задержка
        continue
      }

      // Для других ошибок или если закончились попытки, пробрасываем ошибку
      throw error
    }
  }

  throw lastError
}

export const getPayloadClient = async (): Promise<Payload> => {
  // Используем глобальную переменную для кеширования
  if (global.payloadClient) {
    return global.payloadClient
  }

  try {
    const payload = await getPayload({
      config,
      initOptions: {
        local: true,
        secret: process.env.PAYLOAD_SECRET || '',
        mongoURL: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters',
        onInit: (initPayload) => {
          // Инициализация после успешного запуска
          logger.info('Payload initialized successfully')
          // Инициализация сервисного реестра
          ServiceRegistry.getInstance(initPayload)
        },
      },
    })

    // Помещаем в глобальную переменную вместо локальной
    global.payloadClient = payload

    return payload
  } catch (error) {
    logger.error('Error initializing Payload client:', error)
    connectionMonitor.recordError(error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}
