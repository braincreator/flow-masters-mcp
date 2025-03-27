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
