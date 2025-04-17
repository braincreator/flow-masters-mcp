/**
 * Преобразует строку в slug (URL-friendly строку)
 * @param str Строка для преобразования
 * @returns Slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Удаляем все символы, кроме букв, цифр, пробелов и дефисов
    .replace(/[\s_-]+/g, '-') // Заменяем пробелы, подчеркивания и дефисы на одиночный дефис
    .replace(/^-+|-+$/g, '') // Удаляем начальные и конечные дефисы
}

/**
 * Транслитерирует русский текст в латиницу
 * @param str Строка для транслитерации
 * @returns Транслитерированная строка
 */
export function transliterate(str: string): string {
  const ru = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
  const en = 'abvgdeejzijklmnoprstufhzcssyye'
  
  return str.split('').map(char => {
    const lowerChar = char.toLowerCase()
    const index = ru.indexOf(lowerChar)
    
    if (index >= 0) {
      // Если символ найден в русском алфавите, заменяем его на соответствующий латинский
      return char === lowerChar ? en[index] : en[index].toUpperCase()
    }
    
    // Иначе оставляем символ без изменений
    return char
  }).join('')
}

/**
 * Создает slug из русского текста (транслитерация + slugify)
 * @param str Строка для преобразования
 * @returns Slug
 */
export function slugifyRu(str: string): string {
  return slugify(transliterate(str))
}
