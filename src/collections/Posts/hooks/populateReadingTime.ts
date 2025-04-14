import { CollectionBeforeChangeHook } from 'payload/types'
import { calculateReadingTime } from '@/utilities/calculateReadingTime'
import { type Node } from 'slate'

// Хук для автоматического расчета и сохранения времени чтения
export const populateReadingTime: CollectionBeforeChangeHook = async ({
  data, // incoming data to update or create
  req, // full express request
  operation, // 'create' or 'update'
  originalDoc, // original document if operation is 'update'
}) => {
  const contentField = 'content' // Имя вашего поля RichText (Slate JSON)

  // Проверяем, изменился ли контент или это новая запись
  const isNew = operation === 'create'
  const contentChanged =
    operation === 'update' && data[contentField] !== originalDoc?.[contentField]

  // Если контент изменился или это новая запись, пересчитываем время
  if (data[contentField] && (isNew || contentChanged)) {
    try {
      // Убедимся, что data[contentField] имеет тип Node[]
      const contentNodes = data[contentField] as Node[] | null | undefined
      const readingTime = calculateReadingTime(contentNodes)
      // Возвращаем обновленные данные с новым временем чтения
      return { ...data, readingTime }
    } catch (error) {
      req.payload.logger.error(
        `Error calculating reading time for post ${data.id || '(new)'}: ${error}`,
      )
    }
  }

  // Если контент не менялся, возвращаем исходные данные
  return data
}
