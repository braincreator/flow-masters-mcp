import { CollectionBeforeChangeHook } from 'payload/types'

// Средняя скорость чтения (слов в минуту)
const WORDS_PER_MINUTE = 200

// Рекурсивная функция для извлечения текста из узлов Lexical
function extractTextFromNode(node: any): string {
  let text = ''
  if (node.type === 'text') {
    text += node.text || ''
  } else if (node.children && Array.isArray(node.children)) {
    node.children.forEach((childNode: any) => {
      text += extractTextFromNode(childNode)
    })
  }
  // Добавляем пробел после каждого узла уровня блока для разделения слов
  if (['paragraph', 'heading', 'listitem', 'quote', 'code'].includes(node.type)) {
    text += ' '
  }
  return text
}

// Функция для расчета времени чтения
export function calculateReadingTime(lexicalContent: any): number {
  if (!lexicalContent?.root?.children) {
    return 0
  }

  const fullText = extractTextFromNode(lexicalContent.root).trim()
  // Разделяем по пробелам и непустым строкам, считаем слова
  const wordCount = fullText.split(/\s+/).filter(Boolean).length

  if (wordCount === 0) {
    return 0
  }

  const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE)
  return readingTime
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

