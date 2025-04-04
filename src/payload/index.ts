import { getPayloadClient } from '@/utilities/payload/client'

// Экспортируем функцию для получения клиента Payload
export const getPayload = async () => {
  const payload = await getPayloadClient()
  return payload
}

// Для прямого импорта в серверных компонентах
export const payload = getPayload()
