import { getPayload } from 'payload'
import { Payload } from 'payload'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Кэш для хранения экземпляра Payload для повторного использования
let cachedPayload: Payload | null = null

/**
 * Получает или создает экземпляр Payload клиента для использования в серверных компонентах.
 * Кэширует экземпляр для повторного использования.
 *
 * @returns Экземпляр Payload клиента
 */
export const getPayloadClient = async (): Promise<Payload> => {
  if (cachedPayload) {
    return cachedPayload
  }

  try {
    // Получаем глобальный экземпляр Payload или создаем новый, если он еще не инициализирован
    const payload = await getPayload({
      // Передаем опции при необходимости
      // Например, для среды разработки:
      // initOptions: { local: process.env.NODE_ENV === 'development' }
    })

    // Кэшируем экземпляр для повторного использования
    cachedPayload = payload

    return payload
  } catch (error) {
    logError('Error initializing Payload client:', error)
    throw error
  }
}

/**
 * Сбрасывает кэшированный экземпляр Payload клиента.
 * Полезно для тестирования или при необходимости обновить соединение.
 */
export const resetPayloadClient = (): void => {
  cachedPayload = null
}
