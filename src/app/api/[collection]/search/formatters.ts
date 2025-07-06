interface SearchResults {
  docs: any[]
  totalDocs: number
  totalPages: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

/**
 * Форматирует результаты поиска в нужный формат
 */
export async function formatResults(
  results: SearchResults,
  format: string = 'json',
): Promise<string> {
  if (!results || !results.docs) {
    return JSON.stringify({ docs: [], totalCount: 0 })
  }

  switch (format.toLowerCase()) {
    case 'csv':
      return formatCSV(results.docs)
    case 'xml':
      return formatXML(results.docs)
    case 'json':
    default:
      return JSON.stringify(results)
  }
}

/**
 * Форматирует документы в CSV
 */
function formatCSV(docs: any[]): string {
  if (!docs.length) return ''

  // Получить заголовки из первого документа
  const headers = Object.keys(docs[0])

  // Сформировать строку заголовков
  const headerRow = headers.join(',')

  // Сформировать строки данных
  const rows = docs
    .map((doc) => {
      return headers
        .map((header) => {
          const value = doc[header]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""')
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        })
        .join(',')
    })
    .join('\n')

  return `${headerRow}\n${rows}`
}

/**
 * Форматирует документы в XML
 */
function formatXML(docs: any[]): string {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<results>'
  const footer = '</results>'

  const items = docs
    .map((doc) => {
      return `<item>${formatObjectToXML(doc)}</item>`
    })
    .join('\n')

  return `${header}\n${items}\n${footer}`
}

/**
 * Вспомогательная функция для форматирования объекта в XML
 */
function formatObjectToXML(obj: any): string {
  if (!obj) return ''

  return Object.entries(obj)
    .map(([key, value]) => {
      if (value === null || value === undefined) return `<${key}/>`

      if (Array.isArray(value)) {
        const items = value
          .map((item) => {
            if (typeof item === 'object') {
              return `<item>${formatObjectToXML(item)}</item>`
            }
            return `<item>${escapeXML(String(item))}</item>`
          })
          .join('')
        return `<${key}>${items}</${key}>`
      }

      if (typeof value === 'object') {
        return `<${key}>${formatObjectToXML(value)}</${key}>`
      }

      return `<${key}>${escapeXML(String(value))}</${key}>`
    })
    .join('')
}

/**
 * Экранирует специальные символы в XML
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
