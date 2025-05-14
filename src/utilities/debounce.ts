/**
 * Возвращает дебаунсированную версию функции,
 * которая откладывает вызов до тех пор, пока не пройдет указанное время после последнего вызова
 *
 * @param func Функция для дебаунсинга
 * @param wait Время ожидания в миллисекундах
 * @returns Дебаунсированная функция
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)
  }
}
