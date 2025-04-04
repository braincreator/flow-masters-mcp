import crypto from 'crypto'

/**
 * Генерирует уникальный токен для процессов, требующих верификации (например, отписка)
 * @returns {string} Токен в формате строки
 */
export const generateUniqueToken = (): string => {
  // Создаем 32 байта случайных данных и конвертируем в hex-строку
  return crypto.randomBytes(32).toString('hex')
}
