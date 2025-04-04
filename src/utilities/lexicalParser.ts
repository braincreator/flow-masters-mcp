import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 * Utility functions for parsing Lexical rich text content
 */

/**
 * Проверяет, является ли объект данными Lexical
 * @param content Объект для проверки
 * @returns true если объект является данными Lexical
 */
export function isLexicalContent(content: any): boolean {
  // Проверяем базовые условия
  if (!content || typeof content !== 'object') return false

  // Поддержка вложенных структур
  if (content.content && typeof content.content === 'object') {
    return isLexicalContent(content.content)
  }

  // Обработка случая, когда данные находятся в custom поле
  if (content.custom && typeof content.custom === 'object') {
    // Проверяем, если custom имеет характерные свойства Lexical
    if (
      content.custom.root ||
      content.custom.nodes ||
      (content.custom.version &&
        (typeof content.custom.version === 'number' || typeof content.custom.version === 'string'))
    ) {
      return true
    }
  }

  // Основные признаки Lexical документа
  const isLexical =
    // Стандартная структура с root
    (content.root && typeof content.root === 'object') ||
    // Альтернативная структура с nodes
    (content.nodes && Array.isArray(content.nodes)) ||
    // Структура с version
    (content.version &&
      (typeof content.version === 'number' || typeof content.version === 'string'))

  // Если это обычная структура Lexical, возвращаем true
  if (isLexical) return true

  // Проверяем содержимое text и value полей
  if (content.text && typeof content.text === 'object') {
    return isLexicalContent(content.text)
  }

  if (content.value && typeof content.value === 'object') {
    return isLexicalContent(content.value)
  }

  return false
}

/**
 * Нормализует Lexical контент к стандартному формату
 * @param content Lexical контент в любом формате
 * @returns Стандартизированный Lexical контент
 */
export function normalizeLexicalContent(content: any): SerializedEditorState {
  // Если данные отсутствуют, возвращаем пустую структуру
  if (!content) {
    return {
      root: {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    }
  }

  // Обработка случая, когда данные представлены в формате JSON-строки
  if (typeof content === 'string') {
    try {
      // Пробуем распарсить JSON строку
      const parsedContent = JSON.parse(content)
      return normalizeLexicalContent(parsedContent)
    } catch (e) {
      // Если парсинг не удался, создаем текстовый узел
      return createTextNodeFromString(content)
    }
  }

  // Обработка случая, когда контент вложен
  if (content.content && typeof content.content === 'object') {
    return normalizeLexicalContent(content.content)
  }

  // Поддержка текста в custom поле
  if (content.custom && typeof content.custom === 'object') {
    if (
      content.custom.root ||
      content.custom.nodes ||
      (content.custom.version &&
        (typeof content.custom.version === 'number' || typeof content.custom.version === 'string'))
    ) {
      return normalizeLexicalContent(content.custom)
    }
  }

  // Поддержка текста в text или value полях
  if (content.text && typeof content.text === 'object') {
    return normalizeLexicalContent(content.text)
  }

  if (content.value && typeof content.value === 'object') {
    return normalizeLexicalContent(content.value)
  }

  // Обработка случая с Payload CMS данными
  if (content.data && (content.data.root || Array.isArray(content.data.nodes))) {
    return normalizeLexicalContent(content.data)
  }

  // Если данные уже имеют правильную структуру
  if (content.root && typeof content.root === 'object') {
    // Убедимся, что children существует и это массив
    if (!content.root.children || !Array.isArray(content.root.children)) {
      content.root.children = []
    }

    // Проверяем обязательные поля для root
    if (content.root.type !== 'root') {
      content.root.type = 'root'
    }

    // Убедимся, что у root есть все необходимые свойства
    const normalizedRoot = {
      ...content.root,
      direction: content.root.direction ?? null,
      format: content.root.format ?? '',
      indent: content.root.indent ?? 0,
      version: content.root.version ?? 1,
    }

    return {
      ...content,
      root: normalizedRoot,
    }
  }

  // Если данные имеют формат с nodes вместо root
  if (content.nodes && Array.isArray(content.nodes)) {
    return {
      root: {
        children: content.nodes,
        direction: content.direction || null,
        format: content.format || '',
        indent: content.indent || 0,
        type: 'root',
        version: content.version || 1,
      },
    }
  }

  // В случае простого объекта без нужной структуры, преобразуем его в текст
  if (typeof content === 'object') {
    try {
      const textContent = JSON.stringify(content)
      return createTextNodeFromString(textContent)
    } catch (e) {
      // В случае ошибки, возвращаем пустую структуру
      return {
        root: {
          children: [],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      }
    }
  }

  // В других случаях возвращаем структуру по умолчанию
  return {
    root: {
      children: [],
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

/**
 * Создает Lexical структуру с текстовым узлом из строки
 * @param text Строка для преобразования в Lexical
 * @returns Lexical структура с текстовым содержимым
 */
function createTextNodeFromString(text: string): SerializedEditorState {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: text,
              type: 'text',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

/**
 * Преобразует данные из Payload CMS в стандартный формат Lexical
 * @param payloadData Данные из Payload CMS
 * @returns Стандартизированный Lexical контент
 */
export function convertPayloadDataToLexical(payloadData: any): SerializedEditorState {
  // Если нет данных, возвращаем пустую структуру
  if (!payloadData) {
    return normalizeLexicalContent(null)
  }

  // Обработка случая, когда данные уже в Lexical формате
  if (isLexicalContent(payloadData)) {
    return normalizeLexicalContent(payloadData)
  }

  // Специфичные варианты структуры из Payload CMS
  if (payloadData.blocks) {
    // Преобразуем блоки Payload в параграфы Lexical
    const children = payloadData.blocks
      .map((block: any) => {
        if (typeof block === 'string') {
          return {
            children: [{ text: block, type: 'text' }],
            type: 'paragraph',
          }
        } else if (block.text) {
          return {
            children: [{ text: block.text, type: 'text' }],
            type: 'paragraph',
          }
        } else if (block.content) {
          if (typeof block.content === 'string') {
            return {
              children: [{ text: block.content, type: 'text' }],
              type: 'paragraph',
            }
          } else if (isLexicalContent(block.content)) {
            // Если блок содержит Lexical данные, нормализуем их
            const normalized = normalizeLexicalContent(block.content)
            // Если есть дочерние элементы, возвращаем их напрямую
            if (normalized.root?.children?.length) {
              return normalized.root.children
            }
          }
        }
        return null
      })
      .filter(Boolean)
      .flat()

    return {
      root: {
        children,
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    }
  }

  // Для простых строковых данных
  if (typeof payloadData === 'string') {
    return createTextNodeFromString(payloadData)
  }

  // Для полей markdown или html
  if (payloadData.markdown || payloadData.html) {
    const content = payloadData.markdown || payloadData.html
    return createTextNodeFromString(content)
  }

  // Для случаев, когда не удается определить формат, пробуем преобразовать в строку
  try {
    if (typeof payloadData === 'object') {
      return createTextNodeFromString(JSON.stringify(payloadData))
    }
  } catch (e) {
    console.error('Ошибка преобразования данных Payload в Lexical:', e)
  }

  // В крайнем случае возвращаем пустую структуру
  return normalizeLexicalContent(null)
}

/**
 * Рекурсивно извлекает текст из нодов Lexical
 * @param nodes Массив нодов Lexical
 * @returns Текстовое содержимое
 */
function extractTextFromNodes(nodes: any[]): string {
  if (!Array.isArray(nodes)) return ''

  return nodes
    .map((node) => {
      // Текстовый узел
      if (node.type === 'text') {
        return node.text || ''
      }

      // Блоки с вложенными узлами
      if (node.children && Array.isArray(node.children)) {
        const childText = extractTextFromNodes(node.children)

        // Добавляем разрыв строки после заголовков и параграфов
        if (['paragraph', 'heading'].includes(node.type)) {
          return childText + '\n'
        }

        // Для списков добавляем маркеры
        if (node.type === 'listitem') {
          return '• ' + childText
        }

        // Для других типов просто возвращаем текст
        return childText
      }

      return ''
    })
    .join('')
    .replace(/\n+/g, '\n') // Заменяем несколько переносов строк на один
}

/**
 * Extracts plain text from a Lexical editor state object
 * @param content Lexical serialized editor state
 * @returns Plain text string
 */
export function extractTextFromLexical(content: any): string {
  if (!content) return ''

  // Диагностика для отладки
  if (process.env.NODE_ENV === 'development') {
    console.log('extractTextFromLexical diagnostics:')
    console.log('- Content type:', typeof content)
    console.log('- Is Lexical content:', isLexicalContent(content))

    if (typeof content === 'object') {
      console.log('- Has root:', Boolean(content.root))
      console.log('- Has nodes:', Boolean(content.nodes))

      // Попытка определить конкретный формат
      const format = (() => {
        if (content.root?.children) return 'Standard Lexical'
        if (content.nodes) return 'Nodes-based Lexical'
        if (content.content?.root) return 'Nested content.root'
        if (content.content?.nodes) return 'Nested content.nodes'
        if (content.custom?.root) return 'Custom field Lexical'
        if (content.value?.root) return 'Value field Lexical'
        if (content.text?.root) return 'Text field Lexical'
        return 'Unknown format'
      })()

      console.log('- Detected format:', format)
    }
  }

  try {
    // Нормализуем контент
    const normalizedContent = normalizeLexicalContent(content)

    // Вывод диагностики для нормализованного контента
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '- After normalization:',
        normalizedContent?.root?.children
          ? `Has ${normalizedContent.root.children.length} children`
          : 'No valid structure',
      )
    }

    // Извлекаем текст из нормализованной структуры
    if (normalizedContent.root && normalizedContent.root.children) {
      return extractTextFromNodes(normalizedContent.root.children)
    }

    // На случай, если нормализация не сработала
    if (content.root && content.root.children) {
      return extractTextFromNodes(content.root.children)
    }

    // Обработка для старых форматов
    if (content.nodes && Array.isArray(content.nodes)) {
      return extractTextFromNodes(content.nodes)
    }

    // Если есть поле content, возможно текст в нем
    if (typeof content.content === 'string') {
      return content.content
    }

    // В крайнем случае, пытаемся преобразовать в строку
    if (typeof content === 'string') {
      return content
    }

    return ''
  } catch (error) {
    console.error('Error extracting text from Lexical:', error)
    return ''
  }
}

/**
 * Extracts headings from Lexical content for table of contents
 * @param content Lexical serialized editor state
 * @returns Array of heading objects with id, text and level
 */
export function extractHeadingsFromLexical(
  content: any,
): { id: string; text: string; level: number }[] {
  if (!content) return []

  try {
    // Нормализуем контент для единообразной обработки
    const normalizedContent = normalizeLexicalContent(content)
    const nodes = normalizedContent.root?.children || []
    const headings: { id: string; text: string; level: number }[] = []

    function processNodes(nodes: any[]) {
      if (!Array.isArray(nodes)) return

      nodes.forEach((node) => {
        // Обработка заголовков
        if (node.type === 'heading') {
          const text =
            node.children
              ?.filter((child: any) => child.type === 'text')
              .map((child: any) => child.text)
              .join('') || ''

          if (text) {
            const id = text
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]/g, '')

            headings.push({
              id,
              text,
              level: node.tag || node.level || 2,
            })
          }
        }

        // Рекурсивно обрабатываем дочерние узлы
        if (node.children && Array.isArray(node.children)) {
          processNodes(node.children)
        }
      })
    }

    processNodes(nodes)
    return headings
  } catch (error) {
    console.error('Error extracting headings from Lexical:', error)
    return []
  }
}
