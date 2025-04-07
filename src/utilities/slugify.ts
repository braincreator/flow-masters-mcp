/**
 * Преобразует строку в формат slug (URL-friendly).
 * @param str Строка для преобразования
 * @returns Строка в формате slug
 */
export const slugify = (str: string): string => {
  // Заменяем все кириллические символы на латинские
  const transliterate = (text: string): string => {
    const ru = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя'
    const en = 'ABVGDEEZhZIJKLMNOPRSTUFHCChShSchYYEYuYaabvgdeezh zijklmnoprstufhcchshschyyeyuya'

    let result = ''
    for (let i = 0; i < text.length; i++) {
      const index = ru.indexOf(text[i])
      if (index > -1) {
        result += en[index]
      } else {
        result += text[i]
      }
    }
    return result
  }

  // Транслитерируем строку
  const transliterated = transliterate(str)

  // Приводим к нижнему регистру, заменяем пробелы и специальные символы на дефисы
  // и удаляем все недопустимые символы
  return transliterated
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}
