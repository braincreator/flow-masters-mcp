import { BeforeValidateHook } from 'payload/dist/collections/config/types'
import { slugify } from './slugify'

/**
 * Функция для автоматического формирования slug из указанного поля
 * @param fieldToUse Имя поля, значение которого будет преобразовано в slug
 * @returns Hook для автоматического формирования slug
 */
const formatSlug =
  (fieldToUse: string): BeforeValidateHook =>
  ({ data, originalDoc }) => {
    // Используем значение из отправленных данных, если оно есть
    if (data?.[fieldToUse]) {
      // Форматируем slug из значения поля
      return {
        ...data,
        slug: slugify(data[fieldToUse]),
      }
    }

    // Используем значение из оригинального документа, если данные отсутствуют
    if (originalDoc?.[fieldToUse]) {
      return {
        ...data,
        slug: slugify(originalDoc[fieldToUse]),
      }
    }

    return data
  }

export default formatSlug
