import serializeSlateToText from './slateToText'
import { type Node } from 'slate'
import { CollectionBeforeChangeHook } from 'payload/types'

// Средняя скорость чтения (слов в минуту)
const WORDS_PER_MINUTE = 200

// Функция для расчета времени чтения
export const calculateReadingTime = (content: Node[] | undefined | null): number => {
  if (!content) {
    return 0
  }

  const text = serializeSlateToText(content)
  // Remove extra whitespace and count words
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  if (wordCount === 0) {
    return 0
  }

  const minutes = wordCount / WORDS_PER_MINUTE
  return Math.max(1, Math.ceil(minutes)) // Return reading time in minutes, at least 1 minute
}

// Хук для обновления времени чтения перед сохранением поста
export const updateReadingTime: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  // Выполняем расчет только если есть поле content и это операция создания или обновления
  if (data.content && (operation === 'create' || operation === 'update')) {
    const estimatedReadingTime = calculateReadingTime(data.content)
    // Возвращаем обновленные данные с новым полем readingTime
    return {
      ...data,
      readingTime: estimatedReadingTime,
    }
  }

  // В остальных случаях возвращаем исходные данные
  return data
}
