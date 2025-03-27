import { Payload } from 'payload'

interface CurrencyFormat {
  minimumFractionDigits: number
  maximumFractionDigits: number
}

interface LocaleCurrencySettings {
  currency: string
  format: CurrencyFormat
}

let localeSettingsCache: Record<string, LocaleCurrencySettings> | null = null
let baseCurrencyCache: string | null = null

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

async function getSettings() {
  if (!localeSettingsCache) {
    try {
      // Check if we're running on the server, not the client
      if (typeof window === 'undefined') {
        // Use dynamic import to avoid SSR issues
        const { getPayloadClient } = await import('@/utilities/payload')
        const payload = await getPayloadClient()
        const settings = await payload.findGlobal({
          slug: 'settings',
        })

        baseCurrencyCache = settings.currencies.baseCurrency

        localeSettingsCache = settings.currencies.localeDefaults.reduce(
          (acc, item) => ({
            ...acc,
            [item.locale]: {
              currency: item.currency,
              format: item.format,
            },
          }),
          {},
        )
      } else {
        // On client, just use defaults
        console.warn('Running on client side, using default currency settings')
        localeSettingsCache = DEFAULT_FORMATS
        baseCurrencyCache = 'USD'
      }
    } catch (error) {
      console.warn('Could not fetch currency settings from Payload, using defaults')
      localeSettingsCache = DEFAULT_FORMATS
      baseCurrencyCache = 'USD'
    }
  }

  return {
    localeSettings: localeSettingsCache,
    baseCurrency: baseCurrencyCache,
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
    const settings =
      localeSettings[locale] || localeSettings.en || DEFAULT_FORMATS[locale] || DEFAULT_FORMATS.en

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
  const settings = localeSettingsCache?.[locale] || DEFAULT_FORMATS[locale] || DEFAULT_FORMATS.en

  // Handle special formatting for different currencies
  const minimumFractionDigits =
    settings.currency === 'JPY' || settings.currency === 'RUB'
      ? 0
      : settings.format.minimumFractionDigits

  const maximumFractionDigits =
    settings.currency === 'JPY' || settings.currency === 'RUB'
      ? 0
      : settings.format.maximumFractionDigits

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits,
    maximumFractionDigits,
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
  if (typeof product.pricing.basePrice === 'number') {
    return product.pricing.basePrice
  }

  if (typeof product.pricing.finalPrice === 'number') {
    return product.pricing.finalPrice
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

// Enhanced version that applies currency conversion
export const getLocalePrice = (product: any, targetLocale: string = 'en'): number => {
  // First, determine if we have a base locale specified in the product
  const baseLocale = product?.pricing?.baseLocale || 'en'
  const basePrice = getOriginalLocalePrice(product, baseLocale)

  // If the product has a price directly in the target locale, use that
  if (product?.pricing?.[targetLocale]?.amount) {
    return product.pricing[targetLocale].amount
  }

  // If the product doesn't have the target locale price, convert from the base price
  // Only convert if we have a non-zero base price and target locale is different
  if (basePrice > 0 && baseLocale !== targetLocale) {
    return convertPrice(basePrice, baseLocale, targetLocale)
  }

  // If no base locale price or it's zero, fall back to original logic
  return getOriginalLocalePrice(product, targetLocale)
}

export const convertPrice = (amount: number, fromLocale: string, toLocale: string): number => {
  if (amount === 0 || fromLocale === toLocale) return amount

  // Get the currencies for each locale
  const fromCurrency = DEFAULT_FORMATS[fromLocale]?.currency || 'USD'
  const toCurrency = DEFAULT_FORMATS[toLocale]?.currency || 'USD'

  if (fromCurrency === toCurrency) return amount

  // Exchange rates as of a recent date - these should ideally come from an API
  // These are approximate and should be updated regularly in production
  const rates: Record<string, number> = {
    // USD to other currencies
    USD_EUR: 0.92,
    USD_GBP: 0.79,
    USD_JPY: 149.5,
    USD_RUB: 91.5,
    USD_CNY: 7.2,
    USD_INR: 83.5,
    USD_CAD: 1.37,
    USD_AUD: 1.52,

    // EUR to other currencies
    EUR_USD: 1.09,
    EUR_GBP: 0.86,
    EUR_JPY: 162.8,
    EUR_RUB: 99.6,
    EUR_CNY: 7.84,
    EUR_INR: 90.9,
    EUR_CAD: 1.49,
    EUR_AUD: 1.66,

    // GBP to other currencies
    GBP_USD: 1.27,
    GBP_EUR: 1.16,
    GBP_JPY: 188.9,
    GBP_RUB: 115.8,
    GBP_CNY: 9.11,
    GBP_INR: 105.5,
    GBP_CAD: 1.73,
    GBP_AUD: 1.93,

    // RUB to other currencies
    RUB_USD: 0.0109,
    RUB_EUR: 0.01,
    RUB_GBP: 0.0086,
    RUB_JPY: 1.63,
    RUB_CNY: 0.079,
    RUB_INR: 0.91,
    RUB_CAD: 0.015,
    RUB_AUD: 0.017,
  }

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

// Инвалидация кеша при обновлении настроек
export const invalidateSettingsCache = () => {
  localeSettingsCache = null
  baseCurrencyCache = null
}

// Simple currency formatter for client components that don't need localization settings
export const formatCurrency = (amount: number, locale: string = 'en'): string => {
  const currency = locale === 'ru' ? 'RUB' : 'USD'
  const minimumFractionDigits = currency === 'RUB' ? 0 : 2
  const maximumFractionDigits = currency === 'RUB' ? 0 : 2

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}
