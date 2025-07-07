import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Рассчитывает схожесть документов на основе указанного ID
 */
export async function calculateSimilarity(collection: string, documentId: string): Promise<any[]> {
  try {
    const payload = await getPayloadClient()

    // Получаем документ, для которого нужно найти похожие
    const document = await payload.findByID({
      collection,
      id: documentId,
    })

    if (!document) {
      return []
    }

    // Получаем категории и теги документа для поиска похожих
    const categories = document.categories || []
    const tags = document.tags || []

    // Строим запрос для поиска похожих документов
    const query: any = {
      collection,
      where: {
        and: [
          {
            id: {
              not_equals: documentId, // Исключаем текущий документ
            },
          },
        ],
      },
      limit: 10,
    }

    // Добавляем условия для категорий и тегов, если они есть
    if (categories.length > 0) {
      query.where.and.push({
        categories: {
          in: Array.isArray(categories)
            ? categories.map((c) => (typeof c === 'object' ? c.id : c))
            : [categories],
        },
      })
    }

    if (tags.length > 0) {
      query.where.and.push({
        tags: {
          in: Array.isArray(tags) ? tags : [tags],
        },
      })
    }

    // Выполняем запрос
    const results = await payload.find(query)

    // Сортируем результаты по релевантности (можно реализовать более сложную логику)
    return results.docs.map((doc) => ({
      id: doc.id,
      // Можно добавить оценку схожести, например:
      score: calculateSimilarityScore(document, doc),
    }))
  } catch (error) {
    logError('Error calculating similarity:', error)
    return []
  }
}

/**
 * Простая функция для расчета схожести двух документов
 */
function calculateSimilarityScore(doc1: any, doc2: any): number {
  let score = 0

  // Схожесть по категориям
  const categories1 = extractIds(doc1.categories || [])
  const categories2 = extractIds(doc2.categories || [])

  const commonCategories = categories1.filter((id) => categories2.includes(id))
  score += commonCategories.length * 2 // Категории имеют больший вес

  // Схожесть по тегам
  const tags1 = Array.isArray(doc1.tags) ? doc1.tags : []
  const tags2 = Array.isArray(doc2.tags) ? doc2.tags : []

  const commonTags = tags1.filter((tag) => tags2.includes(tag))
  score += commonTags.length

  return score
}

/**
 * Извлекает ID из массива объектов или возвращает массив, если это уже массив ID
 */
function extractIds(items: any[]): string[] {
  if (!Array.isArray(items)) return []

  return items.map((item) => {
    if (typeof item === 'object' && item.id) {
      return item.id
    }
    return item
  })
}
