import { AIAgencyPlan } from '../hooks/useAIAgencyPlans'

// Функция для форматирования цены плана (простой формат как в оригинале)
export function formatPlanPrice(plan: AIAgencyPlan, locale: 'en' | 'ru' = 'ru'): string {
  const { price } = plan

  // Форматируем число с разделителями тысяч (русский стиль с пробелами)
  const formattedPrice = formatNumberSimple(price)

  // Возвращаем отформатированную цену с рублями (как в оригинале)
  return `${formattedPrice} ₽`
}

// Функция для форматирования предоплаты (простой формат как в оригинале)
export function formatPrepayment(plan: AIAgencyPlan, locale: 'en' | 'ru' = 'ru'): string {
  const { prepayment } = plan

  // Форматируем число с разделителями тысяч (русский стиль с пробелами)
  const formattedPrepayment = formatNumberSimple(prepayment)

  // Возвращаем отформатированную предоплату с рублями (как в оригинале)
  return `${formattedPrepayment} ₽`
}

// Функция для получения символа валюты
function getCurrencySymbol(currency: 'RUB' | 'USD' | 'EUR'): string {
  const symbols = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
  }
  return symbols[currency] || '₽'
}

// Простая функция для форматирования числа с пробелами (как в оригинале)
function formatNumberSimple(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Функция для форматирования числа с разделителями тысяч
function formatNumber(num: number, locale: 'en' | 'ru' = 'ru'): string {
  if (locale === 'en') {
    return num.toLocaleString('en-US')
  } else {
    return num.toLocaleString('ru-RU')
  }
}

// Функция для определения, является ли цена "от" (например, для корпоративных планов)
export function isPriceFrom(plan: AIAgencyPlan): boolean {
  // Логика определения "от" цены
  // Например, если цена больше 300000 или название содержит "корпоративный"/"enterprise"
  return (
    plan.price >= 300000 ||
    plan.name.toLowerCase().includes('корпоративный') ||
    plan.name.toLowerCase().includes('enterprise') ||
    plan.name.toLowerCase().includes('custom')
  )
}

// Функция для форматирования полной цены с префиксом "от" если нужно (простой формат)
export function formatFullPrice(plan: AIAgencyPlan, locale: 'en' | 'ru' = 'ru', t?: any): string {
  const basePrice = formatNumberSimple(plan.price)

  if (isPriceFrom(plan)) {
    const fromText = t ? t('AIAgency.pricing.from') : locale === 'ru' ? 'от' : 'from'
    return `${fromText} ${basePrice} ₽`
  }

  return `${basePrice} ₽`
}

// Функция для получения CSS класса цвета валюты
export function getCurrencyColorClass(currency: 'RUB' | 'USD' | 'EUR'): string {
  const colorClasses = {
    RUB: 'text-blue-600',
    USD: 'text-green-600',
    EUR: 'text-purple-600',
  }
  return colorClasses[currency] || 'text-blue-600'
}

// Функция для получения процента предоплаты
export function getPrepaymentPercentage(plan: AIAgencyPlan): number {
  if (plan.price === 0) return 0
  return Math.round((plan.prepayment / plan.price) * 100)
}
