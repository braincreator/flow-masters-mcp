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

      // Повторяем только при ошибке истечения сессии или потери соединения
      if (
        (error?.name === 'MongoExpiredSessionError' || error?.name === 'MongoNotConnectedError') &&
        attempts < maxRetries
      ) {
        logger.warn(`MongoDB ошибка соединения, повторная попытка ${attempts}/${maxRetries}`)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts)) // Увеличенная задержка

        // Пробуем переподключиться если соединение потеряно
        if (error?.name === 'MongoNotConnectedError') {
          try {
            if (global.payloadClient) {
              await global.payloadClient.disconnect()
              global.payloadClient = null
            }
          } catch (disconnectError) {
            logger.error('Ошибка при отключении:', disconnectError)
          }
        }
        continue
      }

      throw error
    }
  }

  throw lastError
}

export const getPayloadClient = async (): Promise<Payload> => {
  try {
    // Проверяем существующее соединение
    if (global.payloadClient) {
      try {
        // Проверяем живо ли соединение
        await global.payloadClient.db.connection.db.admin().ping()
        return global.payloadClient
      } catch (error) {
        logger.warn('Соединение потеряно, переподключаемся...')
        try {
          await global.payloadClient.disconnect()
        } catch (disconnectError) {
          logger.error('Ошибка при отключении:', disconnectError)
        }
        global.payloadClient = null
      }
    }

    const payload = await getPayload({
      config,
      initOptions: {
        local: true,
        secret: process.env.PAYLOAD_SECRET || '',
        mongoURL: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters',
        onInit: (initPayload) => {
          logger.info('Payload initialized successfully')
          ServiceRegistry.getInstance(initPayload)
        },
      },
    })

    global.payloadClient = payload
    return payload
  } catch (error) {
    logger.error('Error initializing Payload client:', error)
    connectionMonitor.recordError(error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}
