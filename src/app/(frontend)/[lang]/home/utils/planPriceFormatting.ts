import { AIAgencyPlan } from '../hooks/useAIAgencyPlans'
import { formatCurrencyLocalized } from '@/utilities/formatLocalized'

// Функция для форматирования цены плана с локализацией
export function formatPlanPrice(plan: AIAgencyPlan, locale: 'en' | 'ru' = 'ru'): string {
  const { price } = plan

  // Используем локализованное форматирование валют
  return formatCurrencyLocalized(price, locale)
}

// Функция для форматирования предоплаты с локализацией
export function formatPrepayment(plan: AIAgencyPlan, locale: 'en' | 'ru' = 'ru'): string {
  const { prepayment } = plan

  // Используем локализованное форматирование валют
  return formatCurrencyLocalized(prepayment, locale)
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

// Функция для форматирования полной цены с префиксом "от" если нужно (локализованный формат)
export function formatFullPrice(plan: AIAgencyPlan, locale: 'en' | 'ru' = 'ru', t?: any): string {
  const basePrice = formatCurrencyLocalized(plan.price, locale)

  if (isPriceFrom(plan)) {
    const fromText = t ? t('from') : locale === 'ru' ? 'от' : 'from'
    return `${fromText} ${basePrice}`
  }

  return basePrice
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
