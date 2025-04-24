/**
 * Утилита для исправления некорректного JSON
 */

/**
 * Исправляет некорректный JSON, применяя серию преобразований
 * @param content Строка с потенциально некорректным JSON
 * @returns Исправленная строка JSON
 */
export function fixJson(content: string): string {
  if (!content) return content

  // Сохраняем оригинальный контент для логирования
  const originalContent = content

  try {
    // Проверяем, является ли контент уже валидным JSON
    JSON.parse(content)
    return content // Если JSON валидный, возвращаем как есть
  } catch (error) {
    console.log('JSON is invalid, attempting to fix...')

    // Логируем первые 100 символов контента для отладки
    console.log('Content preview:', content.substring(0, 100) + (content.length > 100 ? '...' : ''))

    // Серия преобразований для исправления распространенных ошибок в JSON

    // 1. Удаляем маркдаун-разметку для блоков кода, если она есть
    if (content.includes('```json') || content.includes('```')) {
      content = content.replace(/```json\n?/g, '').replace(/```/g, '')
    }

    // 2. Удаляем любые символы перед началом JSON
    const jsonStartIndex = content.indexOf('{')
    if (jsonStartIndex > 0) {
      content = content.substring(jsonStartIndex)
    }

    // 3. Удаляем любые символы после конца JSON
    const lastBraceIndex = content.lastIndexOf('}')
    if (lastBraceIndex !== -1 && lastBraceIndex < content.length - 1) {
      content = content.substring(0, lastBraceIndex + 1)
    }

    // 4. Заменяем одиночные кавычки на двойные
    content = content.replace(/([{,]\s*)(')(.*?)('\s*:)/g, '$1"$3"$4')
    content = content.replace(/(:\s*)'([^']*)'/g, ':"$2"')

    // 5. Удаляем запятые после последнего элемента в массивах и объектах
    content = content.replace(/,\s*([\]\}])/g, '$1')

    // 6. Добавляем запятые между элементами, где их не хватает
    content = content.replace(/"\s*\}\s*"\s*:/g, '",":')
    content = content.replace(/"\s*\]\s*"\s*:/g, '",":')

    // 7. Исправляем некорректные экранирования в строках
    content = content.replace(/\\\\n/g, '\\n')

    // 8. Исправляем незакрытые строки
    content = content.replace(/([^\\])"([^"]*)(\n)/g, '$1"$2"$3')

    // 9. Исправляем отсутствующие закрывающие кавычки перед закрывающей скобкой массива
    content = content.replace(/([^"\s])\s*\]/g, '$1"\]')

    // 10. Исправляем отсутствующие закрывающие кавычки перед запятыми в массивах
    content = content.replace(/([^"\s])\s*,\s*/g, '$1",\n      "')

    // 11. Удаляем непечатаемые символы и управляющие последовательности
    content = content.replace(/[\x00-\x1F\x7F-\x9F]/g, '')

    // 12. Исправляем некорректные символы в строках
    content = content.replace(/"([^"]*)\t([^"]*)"/g, '"$1 $2"')

    // 13. Исправляем лишние кавычки до и после запятой в строковых значениях
    content = content.replace(/"([^"]+)"\s*,\s*"([^"]+)"/g, '"$1, $2"')

    // 14. Исправляем несколько раз для случаев с несколькими запятыми
    for (let i = 0; i < 5; i++) {
      content = content.replace(/"([^"]+)"\s*,\s*"([^"]+)"/g, '"$1, $2"')
    }

    // 15. Исправляем лишние кавычки внутри объекта
    content = content.replace(/("[^"]+")\s*:\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,/g, '$1: "$2, $3",')
    content = content.replace(/("[^"]+")\s*:\s*"([^"]+)"\s*,\s*"([^"]+)"\s*}/g, '$1: "$2, $3"}')

    // 16. Исправляем случай, когда отсутствует закрывающая кавычка и следующее поле включено в значение
    content = content.replace(/"([^"]+)"\s*:\s*"([^"]+),\s*([^"]+)"\s*:/g, '"$1": "$2", "$3":')

    // 17. Исправляем специфический случай с title и excerpt
    content = content.replace(
      /"title"\s*:\s*"([^"]+),\s*excerpt"\s*:/g,
      '"title": "$1", "excerpt":',
    )

    // 18. Удаляем все переносы строк
    content = content.replace(/"\n/g, '')
    content = content.replace(/\n/g, ' ')

    // 19. Исправляем случай, когда отсутствует закрывающая кавычка перед закрывающей скобкой
    content = content.replace(/"([^"]+)"\s*:\s*"([^"]+)\s*\}/g, '"$1": "$2"}')

    // 20. Исправляем случай, когда отсутствует закрывающая кавычка перед закрывающей скобкой массива
    content = content.replace(/"([^"]+)"\s*:\s*"([^"]+)\s*\]/g, '"$1": "$2"]')

    // 21. Исправляем случай с пропущенными запятыми между свойствами объекта
    content = content.replace(/"([^"]+)"\s*:\s*"([^"]+)"\s*"([^"]+)"\s*:/g, '"$1": "$2", "$3":')

    // 22. Исправляем случай с пропущенными запятыми между элементами массива
    content = content.replace(/"([^"]+)"\s*"([^"]+)"/g, '"$1", "$2"')

    // 23. Исправляем случай с неэкранированными кавычками внутри строк
    content = content.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"$3"')

    // 24. Исправляем случай с неправильно закрытыми объектами
    content = content.replace(/\}\s*\{/g, '},{')

    // 25. Исправляем случай с неправильно закрытыми массивами
    content = content.replace(/\]\s*\[/g, '],[')

    // 26. Исправляем случай с пропущенными двоеточиями
    content = content.replace(/"([^"]+)"\s+"/g, '"$1": "')

    // 27. Исправляем случай с лишними двоеточиями
    content = content.replace(/:\s*:\s*/g, ': ')

    // 28. Исправляем случай с пропущенными кавычками вокруг ключей
    content = content.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')

    // 29. Исправляем случай с пропущенными кавычками вокруг строковых значений
    content = content.replace(/:(\s*)([a-zA-Z0-9_]+)([,}])/g, ':"$2"$3')

    // 30. Исправляем случай с неправильно экранированными обратными слешами
    content = content.replace(/\\\\/g, '\\')

    // 38. Исправляем случай с незакрытыми кавычками в конце массива перед закрывающей скобкой
    content = content.replace(/([^"\s])\s*\]/g, '$1"\]')

    // 39. Исправляем случай с незакрытыми кавычками в конце объекта перед закрывающей скобкой
    content = content.replace(/([^"\s])\s*\}/g, '$1"\}')

    // 40. Исправляем случай с отсутствующими кавычками вокруг ключей с пробелами
    content = content.replace(/([{,]\s*)([a-zA-Z0-9_\s]+)(\s*:)/g, '$1"$2"$3')

    // Проверяем, удалось ли исправить JSON
    try {
      JSON.parse(content)
      console.log('JSON fixed successfully!')
      return content
    } catch (jsonError) {
      console.warn('Standard JSON parsing still failed, trying JSON5...')

      try {
        // Если стандартный JSON.parse не работает, пробуем использовать JSON5
        // Для этого нужно установить пакет json5: npm install json5
        const JSON5 = require('json5')
        JSON5.parse(content)
        console.log('JSON5 parsing successful!')
        return content
      } catch (json5Error) {
        console.error('JSON5 parsing also failed, applying additional fixes...')

        // Дополнительные исправления для особо сложных случаев

        // 31. Исправляем некорректные символы переноса строки в строках
        content = content.replace(/([^\\])"([^"]*)\n([^"]*)"/g, '$1"$2\\n$3"')

        // 32. Исправляем некорректные запятые в массивах
        content = content.replace(/\[\s*,/g, '[')
        content = content.replace(/,\s*,/g, ',')

        // 33. Исправляем случай с пропущенными запятыми между объектами в массиве
        content = content.replace(/\}\s*\{/g, '},{')

        // 34. Исправляем случай с пропущенными запятыми между массивами
        content = content.replace(/\]\s*\[/g, '],[')

        // 35. Исправляем случай с неправильно вложенными структурами
        content = content.replace(/\}\s*\]/g, '}]')
        content = content.replace(/\[\s*\}/g, '[{')

        // 36. Исправляем случай с неправильно закрытыми строками
        content = content.replace(/"([^"]*)$/g, '"$1"')

        // 37. Исправляем случай с неправильно открытыми строками
        content = content.replace(/^([^"]*)"/g, '"$1"')

        // Последняя попытка с JSON5
        try {
          const JSON5 = require('json5')
          JSON5.parse(content)
          console.log('JSON5 parsing successful after additional fixes!')
          return content
        } catch (finalError) {
          console.error('All parsing attempts failed. Original content:', originalContent)
          console.error('Final content after fixes:', content)
          console.error('Final error:', finalError)

          // Возвращаем исправленный контент, даже если он все еще не является валидным JSON
          // Это позволит вызывающему коду решить, что делать дальше
          return content
        }
      }
    }
  }
}

/**
 * Пытается преобразовать строку в объект JSON, применяя исправления при необходимости
 * @param content Строка с потенциально некорректным JSON
 * @param defaultValue Значение по умолчанию, если парсинг не удался
 * @returns Объект JSON, defaultValue или null, если преобразование невозможно
 */
export function parseJsonSafely<T>(content: string, defaultValue?: T): T | null {
  // Проверяем, является ли контент строкой
  if (typeof content !== 'string') {
    console.warn('parseJsonSafely: content is not a string', content)
    return defaultValue || null
  }

  // Проверяем, не пустая ли строка
  if (!content.trim()) {
    console.warn('parseJsonSafely: content is empty')
    return defaultValue || null
  }

  try {
    // Сначала пробуем стандартный JSON.parse
    return JSON.parse(content) as T
  } catch (jsonError) {
    console.log('Standard JSON parsing failed, attempting to fix...')
    // Если не удалось, пробуем исправить JSON
    const fixedContent = fixJson(content)

    try {
      // Пробуем снова с исправленным контентом
      return JSON.parse(fixedContent) as T
    } catch (fixedJsonError) {
      try {
        // Если все еще не удалось, пробуем JSON5
        const JSON5 = require('json5')
        return JSON5.parse(fixedContent) as T
      } catch (json5Error) {
        console.error('Failed to parse JSON even after fixes:', json5Error)
        console.error('Original content:', content)
        console.error('Fixed content:', fixedContent)
        return defaultValue || null
      }
    }
  }
}
