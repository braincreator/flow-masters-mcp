interface CurrencyFormat {
  minimumFractionDigits: number
  maximumFractionDigits: number
}

interface LocaleCurrencySettings {
  currency: string
  format: CurrencyFormat
}

// Default formats for each locale
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

// Main price formatting function
export const formatPrice = (price: number, locale: string = 'en'): string => {
  // Handle zero prices with localized "Free" text
  if (price <= 0) {
    return locale === 'ru' ? 'Бесплатно' : 'Free'
  }

  const settings = DEFAULT_FORMATS[locale] || DEFAULT_FORMATS.en

  // Use custom formatting for Russian ruble
  if (locale === 'ru' && settings.currency === 'RUB') {
    return `${Math.round(price).toLocaleString('ru-RU')} ₽`
  }

  // Use standard Intl.NumberFormat for other currencies
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits: settings.format.minimumFractionDigits,
    maximumFractionDigits: settings.format.maximumFractionDigits,
  }).format(price)
}

// Get price from item based on locale (simplified for locale-based pricing)
export const getLocalePrice = (item: any, locale: string = 'en'): number => {
  if (!item) return 0

  try {
    // For products with pricing group
    if (item.pricing) {
      // Check if pricing has localized price field
      if (item.pricing.price && typeof item.pricing.price === 'object') {
        return item.pricing.price[locale] || item.pricing.price.en || 0
      }
      // Fallback to single price field
      return item.pricing.price || item.pricing.finalPrice || 0
    }

    // For services and other items with direct price field
    if (item.price) {
      // Check if price is localized
      if (typeof item.price === 'object') {
        return item.price[locale] || item.price.en || 0
      }
      return item.price
    }

    return 0
  } catch (error) {
    console.error('Error in getLocalePrice:', error)
    return 0
  }
}

// Format price with "from" prefix for starting prices
export const formatPriceWithPrefix = (
  price: number,
  locale: string = 'en',
  isStartingFrom: boolean = false,
): string => {
  const formattedPrice = formatPrice(price, locale)

  if (isStartingFrom) {
    return locale === 'ru' ? `от ${formattedPrice}` : `from ${formattedPrice}`
  }

  return formattedPrice
}

// Format item price with all parameters
export const formatItemPrice = (item: any, locale: string = 'en'): string => {
  if (!item) return ''

  const price = getLocalePrice(item, locale)
  const isStartingFrom =
    item.isPriceStartingFrom === true || (item.pricing && item.pricing.isPriceStartingFrom === true)

  return formatPriceWithPrefix(price, locale, isStartingFrom)
}

// Simple currency formatter for components
export const formatCurrency = (amount: number, locale: string = 'en'): string => {
  const currency = locale === 'ru' ? 'RUB' : 'USD'
  const format = DEFAULT_FORMATS[locale]?.format || DEFAULT_FORMATS.en.format

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: format.minimumFractionDigits,
    maximumFractionDigits: format.maximumFractionDigits,
  }).format(amount)
}
