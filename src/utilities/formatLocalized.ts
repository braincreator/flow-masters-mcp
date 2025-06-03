/**
 * Утилиты для локализованного форматирования валют, дат и времени
 */

// Локализованное форматирование валют
export function formatCurrencyLocalized(amount: number, locale: 'en' | 'ru' = 'ru'): string {
  if (locale === 'ru') {
    // Для русской локали используем рубли
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } else {
    // Для английской локали используем доллары
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
}

// Локализованное форматирование дат
export function formatDateLocalized(
  date: Date | string,
  locale: 'en' | 'ru' = 'ru',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const localeString = locale === 'ru' ? 'ru-RU' : 'en-US'
  return new Intl.DateTimeFormat(localeString, options).format(dateObj)
}

// Локализованное форматирование времени
export function formatTimeLocalized(
  date: Date | string,
  locale: 'en' | 'ru' = 'ru',
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const localeString = locale === 'ru' ? 'ru-RU' : 'en-US'
  return new Intl.DateTimeFormat(localeString, options).format(dateObj)
}

// Локализованное форматирование даты и времени
export function formatDateTimeLocalized(
  date: Date | string,
  locale: 'en' | 'ru' = 'ru',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const localeString = locale === 'ru' ? 'ru-RU' : 'en-US'
  return new Intl.DateTimeFormat(localeString, options).format(dateObj)
}

// Локализованное относительное время
export function formatRelativeTimeLocalized(
  date: Date | string,
  locale: 'en' | 'ru' = 'ru'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  // Используем Intl.RelativeTimeFormat для локализации
  const rtf = new Intl.RelativeTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    numeric: 'auto'
  })

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (Math.abs(diffInSeconds) < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return rtf.format(-minutes, 'minute')
  } else if (Math.abs(diffInSeconds) < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return rtf.format(-hours, 'hour')
  } else if (Math.abs(diffInSeconds) < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return rtf.format(-days, 'day')
  } else {
    const months = Math.floor(diffInSeconds / 2592000)
    return rtf.format(-months, 'month')
  }
}

// Локализованное форматирование чисел
export function formatNumberLocalized(
  number: number,
  locale: 'en' | 'ru' = 'ru',
  options: Intl.NumberFormatOptions = {}
): string {
  const localeString = locale === 'ru' ? 'ru-RU' : 'en-US'
  return new Intl.NumberFormat(localeString, options).format(number)
}

// Локализованное форматирование процентов
export function formatPercentLocalized(
  number: number,
  locale: 'en' | 'ru' = 'ru',
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 1
): string {
  const localeString = locale === 'ru' ? 'ru-RU' : 'en-US'
  return new Intl.NumberFormat(localeString, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(number / 100)
}
