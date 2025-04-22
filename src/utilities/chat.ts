import { Message, ChatHistoryItem } from '@/types/chat'

/**
 * Преобразует сообщения чата в формат истории для API
 */
export function formatChatHistory(messages: Message[]): ChatHistoryItem[] {
  return messages.map((message) => {
    // Ensure timestamp is a valid Date object or create a fallback
    let timestampStr: string | undefined
    if (message.timestamp) {
      if (message.timestamp instanceof Date) {
        timestampStr = message.timestamp.toISOString()
      } else if (typeof message.timestamp === 'string') {
        // Try to parse string timestamp
        try {
          timestampStr = new Date(message.timestamp).toISOString()
        } catch (e) {
          console.warn('Invalid timestamp format:', message.timestamp)
          timestampStr = new Date().toISOString()
        }
      } else if (typeof message.timestamp === 'number') {
        // Handle timestamp as number (milliseconds)
        timestampStr = new Date(message.timestamp).toISOString()
      } else {
        // Fallback to current time
        timestampStr = new Date().toISOString()
      }
    } else {
      // If timestamp is missing, use current time
      timestampStr = new Date().toISOString()
    }

    return {
      role: message.sender === 'user' ? 'user' : 'assistant',
      content:
        typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
      timestamp: timestampStr,
    }
  })
}

/**
 * Возвращает случайный резервный ответ из списка
 */
export function getRandomFallbackResponse(fallbackResponses: { response: any }[]): any {
  if (!fallbackResponses.length) {
    return 'Извините, произошла ошибка при обработке вашего запроса.'
  }

  const randomIndex = Math.floor(Math.random() * fallbackResponses.length)
  return fallbackResponses[randomIndex].response
}

/**
 * Проверяет, содержит ли сообщение запрещенный контент
 */
export function containsProhibitedContent(message: string): boolean {
  // Здесь можно добавить проверку на запрещенный контент
  const prohibitedPatterns = [
    /script\s*\(/i,
    /<script/i,
    /eval\s*\(/i,
    /javascript:/i,
    // Добавьте другие паттерны по необходимости
  ]

  return prohibitedPatterns.some((pattern) => pattern.test(message))
}

/**
 * Очищает сообщение от потенциально опасного контента
 */
export function sanitizeMessage(message: string): string {
  // Простая санитизация - удаление HTML-тегов
  return message.replace(/<[^>]*>?/gm, '')
}
