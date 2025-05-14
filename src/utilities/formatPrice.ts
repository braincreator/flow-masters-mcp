import type { GlobalSettings } from '@/types/payload-types'

interface CurrencyFormat {
  minimumFractionDigits: number
  maximumFractionDigits: number
}

interface LocaleCurrencySettings {
  currency: string
  format: CurrencyFormat
}

// Глобальные переменные теперь хранятся отдельно для сервера и клиента
let localeSettingsCache: Record<string, LocaleCurrencySettings> | null = null
let baseCurrencyCache: string | null = null
let ratesCache: Record<string, number> | null = null

// Default formats to use as fallback when payload client is not available
export const DEFAULT_FORMATS: Record<string, LocaleCurrencySettings> = {
  en: {
    currency: 'USD',
    format: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  ru: {
    currency: 'RUB',
    format: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  },
}

// Fallback exchange rates
export const FALLBACK_RATES: Record<string, number> = {
  USD_RUB: 90.0,
  RUB_USD: 0.0111,
  // Можно добавить другие пары по необходимости
}

// Для клиентского использования - НЕ использует серверный код
async function getClientSettings() {
  // В клиенте просто используем дефолтные настройки или кеш
  if (!localeSettingsCache) {
    localeSettingsCache = { ...DEFAULT_FORMATS }
    baseCurrencyCache = 'USD'
    ratesCache = { ...FALLBACK_RATES }

    // Получаем настройки через API (только на клиенте)
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/v1/currency-settings')

        if (response.ok) {
          const data = await response.json()

          // Обновляем кеш
          if (data.localeSettings) localeSettingsCache = data.localeSettings
          if (data.baseCurrency) baseCurrencyCache = data.baseCurrency
          if (data.rates) ratesCache = data.rates
        }
      } catch (err) {
        console.warn('Error fetching currency settings from API, using defaults:', err)
      }
    }
  }

  // Убеждаемся, что кеши инициализированы
  if (!localeSettingsCache) localeSettingsCache = { ...DEFAULT_FORMATS }
  if (!baseCurrencyCache) baseCurrencyCache = 'USD'
  if (!ratesCache) ratesCache = { ...FALLBACK_RATES }

  return {
    localeSettings: localeSettingsCache,
    baseCurrency: baseCurrencyCache || 'USD',
    rates: ratesCache,
  }
}

// Публичный API для обновления настроек на клиенте
export const updateClientSettings = (settings: {
  localeSettings?: Record<string, LocaleCurrencySettings>
  baseCurrency?: string
  rates?: Record<string, number>
}) => {
  if (settings.localeSettings) localeSettingsCache = settings.localeSettings
  if (settings.baseCurrency) baseCurrencyCache = settings.baseCurrency
  if (settings.rates) ratesCache = settings.rates
}

// Единая функция, которая вызывает либо клиентскую, либо серверную версию
// Но не пытается импортировать серверный код на клиенте
async function getSettings() {
  // Проверяем, находимся ли мы на клиенте или сервере
  if (typeof window !== 'undefined') {
    // Клиент - только клиентский код
    return getClientSettings()
  } else {
    // Сервер - можем безопасно выполнить серверный код
    try {
      console.log('formatPrice/getSettings: server-side execution')
      // Динамический импорт на сервере
      console.log('formatPrice/getSettings: importing getPayloadClient')
      const { getPayloadClient } = await import('@/utilities/payload/index')

      // Получаем Payload
      console.log('formatPrice/getSettings: calling getPayloadClient')
      const payload = await getPayloadClient()

      // Получаем настройки валют
      console.log('formatPrice/getSettings: fetching currency-settings')
      const currencySettings = await payload.findGlobal({
        slug: 'currency-settings',
      })

      // Получаем курсы обмена
      console.log('formatPrice/getSettings: fetching exchange-rate-settings')
      const exchangeRateSettings = await payload.findGlobal({
        slug: 'exchange-rate-settings',
      })

      console.log(
        'formatPrice/getSettings: settings received:',
        'currencySettings:',
        currencySettings ? 'ok' : 'null',
        'exchangeRateSettings:',
        exchangeRateSettings ? 'ok' : 'null',
      )

      // Инициализируем результат
      const result = {
        localeSettings: { ...DEFAULT_FORMATS },
        baseCurrency: 'USD',
        rates: { ...FALLBACK_RATES },
      }

      // Обрабатываем настройки валют
      if (currencySettings) {
        // Получаем базовую валюту
        if (currencySettings.baseCurrency) {
          result.baseCurrency = currencySettings.baseCurrency
        }

        // Обрабатываем настройки локализации
        if (currencySettings.localeDefaults && Array.isArray(currencySettings.localeDefaults)) {
          const newLocaleSettings: Record<string, LocaleCurrencySettings> = {}

          currencySettings.localeDefaults.forEach((item: any) => {
            if (item.locale && item.currency && item.format) {
              newLocaleSettings[item.locale] = {
                currency: item.currency,
                format: {
                  minimumFractionDigits:
                    typeof item.format.decimalPlaces === 'string'
                      ? parseInt(item.format.decimalPlaces, 10)
                      : 2,
                  maximumFractionDigits:
                    typeof item.format.decimalPlaces === 'string'
                      ? parseInt(item.format.decimalPlaces, 10)
                      : 2,
                },
              }
            }
          })

          if (Object.keys(newLocaleSettings).length > 0) {
            result.localeSettings = newLocaleSettings
          }
        }
      }

      // Обрабатываем курсы валют
      if (
        exchangeRateSettings &&
        exchangeRateSettings.rates &&
        Array.isArray(exchangeRateSettings.rates)
      ) {
        exchangeRateSettings.rates.forEach((rate: any) => {
          if (rate.fromCurrency && rate.toCurrency && typeof rate.rate === 'number') {
            result.rates[`${rate.fromCurrency}_${rate.toCurrency}`] = rate.rate
          }
        })
      }

      // Также обновляем глобальный кеш на сервере
      localeSettingsCache = result.localeSettings
      baseCurrencyCache = result.baseCurrency
      ratesCache = result.rates

      return result
    } catch (err) {
      console.warn('Error fetching settings from Payload, using defaults:', err)
      // Возвращаем дефолтные настройки
      return {
        localeSettings: DEFAULT_FORMATS,
        baseCurrency: 'USD',
        rates: FALLBACK_RATES,
      }
    }
  }
}

export async function getLocaleCurrency(locale: string): Promise<string> {
  const { localeSettings } = await getSettings()
  return localeSettings[locale]?.currency || DEFAULT_FORMATS[locale]?.currency || 'USD'
}

export async function getBaseCurrency(): Promise<string> {
  const { baseCurrency } = await getSettings()
  return baseCurrency || 'USD'
}

// Server-side async version
export const formatPriceAsync = async (price: number, locale: string = 'en'): Promise<string> => {
  try {
    const { localeSettings } = await getSettings()
    // Убеждаемся, что есть fallback формат
    const fallbackFormat = DEFAULT_FORMATS.en!
    const settings =
      localeSettings[locale] || localeSettings.en || DEFAULT_FORMATS[locale] || fallbackFormat

    if (!settings) {
      throw new Error(`No currency settings found for locale ${locale}`)
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: settings.format.minimumFractionDigits,
      maximumFractionDigits: settings.format.maximumFractionDigits,
    }).format(price)
  } catch (error) {
    // Fallback if async call fails
    return formatPrice(price, locale)
  }
}

// Client-side sync version that can be used in components
export const formatPrice = (price: number, locale: string = 'en'): string => {
  // Используем настройки из кеша (если он есть на клиенте) или дефолтные
  // Убеждаемся, что есть fallback формат
  const fallbackFormat = DEFAULT_FORMATS.en!
  const settings = localeSettingsCache?.[locale] || DEFAULT_FORMATS[locale] || fallbackFormat

  if (!settings) {
    // Если все типы настроек отсутствуют, используем дефолтный формат для USD
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  // Используем custom форматирование для рубля в русской локали
  if (locale === 'ru' && settings.currency === 'RUB') {
    return `${Math.round(price).toLocaleString('ru-RU')} ₽`
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits: settings.format.minimumFractionDigits,
    maximumFractionDigits: settings.format.maximumFractionDigits,
  }).format(price)
}

// Original getLocalePrice
const getOriginalLocalePrice = (product: any, locale: string = 'en'): number => {
  // No pricing data at all
  if (!product) return 0

  // Direct price field (simple products)
  if (typeof product.price === 'number') {
    return product.price
  }

  // No pricing object
  if (!product.pricing) return 0

  // Check for locale-specific pricing
  if (product.pricing[locale]?.amount) {
    return product.pricing[locale].amount
  }

  // Fallback to other pricing fields
  // Prioritize finalPrice if it exists (calculated price after discount)
  if (typeof product.pricing.finalPrice === 'number') {
    return product.pricing.finalPrice
  }

  // Then fallback to basePrice
  if (typeof product.pricing.basePrice === 'number') {
    return product.pricing.basePrice
  }

  // Use the first available locale price as last resort
  const firstLocaleWithPrice = Object.keys(product.pricing).find(
    (key) => product.pricing[key]?.amount,
  )

  if (firstLocaleWithPrice) {
    return product.pricing[firstLocaleWithPrice].amount
  }

  return 0
}

// Функция для получения цены продукта или услуги с учетом локали
export const getLocalePrice = (item: any, targetLocale: string = 'en'): number => {
  if (!item) return 0

  try {
    // Проверяем наличие локализованных цен для нужной локали
    if (
      item.localizedPrices &&
      item.localizedPrices[targetLocale] &&
      item.localizedPrices[targetLocale] > 0
    ) {
      return item.localizedPrices[targetLocale]
    }

    // Для продуктов работаем с pricing структурой
    if (item.pricing) {
      // Проверяем наличие локализованных цен в новом формате
      if (
        item.pricing.localizedPrices &&
        item.pricing.localizedPrices[targetLocale] &&
        item.pricing.localizedPrices[targetLocale] > 0
      ) {
        return item.pricing.localizedPrices[targetLocale]
      }

      // Используем finalPrice как основную цену
      return item.pricing.finalPrice || item.pricing.basePrice || 0
    }

    // Для услуг используем поле price напрямую
    return item.price || 0
  } catch (error) {
    console.error('Error in getLocalePrice:', error)
    // Если что-то пошло не так, возвращаем 0
    return 0
  }
}

// Форматирование цены с учетом флага "от" (нефиксированная цена)
export const formatPriceWithPrefix = (
  price: number,
  locale: string = 'en',
  isStartingFrom: boolean = false,
): string => {
  const formattedPrice = formatPrice(price, locale)

  if (isStartingFrom) {
    // Добавляем префикс "от" в зависимости от локали
    return locale === 'ru' ? `от ${formattedPrice}` : `from ${formattedPrice}`
  }

  return formattedPrice
}

// Вспомогательная функция для форматирования цены с учетом всех параметров
export const formatItemPrice = (item: any, locale: string = 'en'): string => {
  if (!item) return ''

  // Получаем цену в правильной локали
  const price = getLocalePrice(item, locale)

  // Проверяем, является ли цена нефиксированной
  const isStartingFrom =
    item.isPriceStartingFrom === true || (item.pricing && item.pricing.isPriceStartingFrom === true)

  // Форматируем с учетом префикса
  return formatPriceWithPrefix(price, locale, isStartingFrom)
}

// Инвалидация кеша при обновлении настроек
export const invalidateSettingsCache = () => {
  localeSettingsCache = null
  baseCurrencyCache = null
  ratesCache = null
}

// Simple currency formatter for client components that don't need localization settings
export const formatCurrency = (amount: number, locale: string = 'en'): string => {
  const currency = locale === 'ru' ? 'RUB' : 'USD'
  // Используем DEFAULT_FORMATS для определения дробной части
  const format = DEFAULT_FORMATS[locale]?.format || DEFAULT_FORMATS.en!.format

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: format.minimumFractionDigits,
    maximumFractionDigits: format.maximumFractionDigits,
  }).format(amount)
}

// Функция конвертации с использованием кешированных курсов
export const convertPrice = (amount: number, fromLocale: string, toLocale: string): number => {
  if (amount === 0 || fromLocale === toLocale) return amount

  // Get the currencies for each locale
  const fromCurrency = DEFAULT_FORMATS[fromLocale]?.currency || 'USD'
  const toCurrency = DEFAULT_FORMATS[toLocale]?.currency || 'USD'

  if (fromCurrency === toCurrency) return amount

  // Используем кеш курсов или дефолтные значения
  const rates = ratesCache || FALLBACK_RATES

  const rateKey = `${fromCurrency}_${toCurrency}`
  let rate = rates[rateKey]

  // If direct conversion rate not found, try inverse
  if (!rate) {
    const inverseRateKey = `${toCurrency}_${fromCurrency}`
    const inverseRate = rates[inverseRateKey]

    if (inverseRate) {
      rate = 1 / inverseRate
    } else {
      // Fallback to USD as intermediate if direct conversion not available
      const toUsdRate = rates[`${fromCurrency}_USD`]
      const fromUsdRate = rates[`USD_${toCurrency}`]

      if (toUsdRate && fromUsdRate) {
        rate = toUsdRate * fromUsdRate
      } else {
        // Default 1:1 ratio if no conversion path found
        rate = 1
        console.warn(`No conversion rate found for ${fromCurrency} to ${toCurrency}`)
      }
    }
  }

  // Apply the conversion
  const convertedAmount = amount * rate

  // Round according to currency display conventions
  if (toCurrency === 'JPY' || toCurrency === 'RUB' || toCurrency === 'INR') {
    // These currencies typically don't show decimal places
    return Math.round(convertedAmount)
  } else {
    // Most currencies show 2 decimal places
    return Math.round(convertedAmount * 100) / 100
  }
}

// Функция для получения конвертированной цены и её форматированного представления
export const getConvertedPrice = async (
  amount: number,
  fromLocale: string,
  toLocale: string,
): Promise<{ convertedPrice: number; formattedPrice: string }> => {
  try {
    // Получаем настройки валют для локалей
    const fromCurrency = await getLocaleCurrency(fromLocale)
    const toCurrency = await getLocaleCurrency(toLocale)

    // Конвертируем цену
    const convertedPrice = convertPrice(amount, fromLocale, toLocale)

    // Форматируем конвертированную цену для отображения
    const formattedPrice = formatPrice(convertedPrice, toLocale)

    // Возвращаем и числовое, и форматированное значения
    return {
      convertedPrice,
      formattedPrice,
    }
  } catch (error) {
    console.error('Error converting price:', error)
    // В случае ошибки возвращаем оригинальную цену и её форматированное представление
    return {
      convertedPrice: amount,
      formattedPrice: formatPrice(amount, fromLocale),
    }
  }
}
