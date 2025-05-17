/**
 * Форматирует дату ISO в локализованный формат
 *
 * @param isoDate - ISO строка даты
 * @param locale - Код локали (например, 'ru' или 'en')
 * @param options - Опции форматирования
 * @returns Отформатированная строка даты
 */
export function formatDate(
  isoDate: string,
  locale: string = 'ru',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  if (!isoDate) return ''

  try {
    const date = new Date(isoDate)

    // Проверка на валидность даты
    if (isNaN(date.getTime())) {
      return ''
    }

    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Возвращает относительное время (например, "2 часа назад")
 *
 * @param isoDate - ISO строка даты
 * @param locale - Код локали (например, 'ru' или 'en')
 * @returns Строка с относительным временем
 */
export function formatRelativeTime(isoDate: string, locale: string = 'ru'): string {
  if (!isoDate) return ''

  try {
    const date = new Date(isoDate)
    const now = new Date()

    // Проверка на валидность даты
    if (isNaN(date.getTime())) {
      return ''
    }

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    // Относительное время для разных временных промежутков
    if (diffInSeconds < 60) {
      return locale === 'ru' ? 'только что' : 'just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return locale === 'ru'
        ? `${minutes} ${getMinutesText(minutes)}`
        : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return locale === 'ru'
        ? `${hours} ${getHoursText(hours)}`
        : `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return locale === 'ru'
        ? `${days} ${getDaysText(days)}`
        : `${days} ${days === 1 ? 'day' : 'days'} ago`
    } else {
      // Если прошло больше месяца, возвращаем форматированную дату
      return formatDate(isoDate, locale)
    }
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return ''
  }
}

// Вспомогательные функции для склонения слов в русском языке
function getMinutesText(minutes: number): string {
  const lastDigit = minutes % 10
  const lastTwoDigits = minutes % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'минут назад'
  }

  if (lastDigit === 1) {
    return 'минуту назад'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'минуты назад'
  }

  return 'минут назад'
}

function getHoursText(hours: number): string {
  const lastDigit = hours % 10
  const lastTwoDigits = hours % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'часов назад'
  }

  if (lastDigit === 1) {
    return 'час назад'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'часа назад'
  }

  return 'часов назад'
}

function getDaysText(days: number): string {
  const lastDigit = days % 10
  const lastTwoDigits = days % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'дней назад'
  }

  if (lastDigit === 1) {
    return 'день назад'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'дня назад'
  }

  return 'дней назад'
}
