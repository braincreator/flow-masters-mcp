import { payload } from 'payload'

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

async function getSettings() {
  if (!localeSettingsCache) {
    const settings = await payload.findGlobal({
      slug: 'settings',
    })

    baseCurrencyCache = settings.currencies.baseCurrency

    localeSettingsCache = settings.currencies.localeDefaults.reduce((acc, item) => ({
      ...acc,
      [item.locale]: {
        currency: item.currency,
        format: item.format,
      }
    }), {})
  }

  return {
    localeSettings: localeSettingsCache,
    baseCurrency: baseCurrencyCache,
  }
}

export async function getLocaleCurrency(locale: string): Promise<string> {
  const { localeSettings } = await getSettings()
  return localeSettings[locale]?.currency || 'USD'
}

export async function getBaseCurrency(): Promise<string> {
  const { baseCurrency } = await getSettings()
  return baseCurrency
}

export const formatPrice = async (
  price: number,
  locale: string = 'en'
): Promise<string> => {
  const { localeSettings } = await getSettings()
  const settings = localeSettings[locale] || localeSettings.en

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits: settings.format.minimumFractionDigits,
    maximumFractionDigits: settings.format.maximumFractionDigits,
  }).format(price)
}

export const getLocalePrice = (product: any, locale: string = 'en'): number => {
  if (!product?.pricing) return 0
  return product.pricing[locale]?.amount || 
         product.pricing?.basePrice || 
         product.pricing?.finalPrice || 
         0
}

export const convertPrice = (amount: number, fromLocale: string, toLocale: string): number => {
  // Add your conversion rates here
  const rates = {
    'USD_RUB': 90, // Example rate
    'RUB_USD': 1/90
  }
  
  if (fromLocale === toLocale) return amount
  
  const rateKey = `${DEFAULT_FORMATS[fromLocale].currency}_${DEFAULT_FORMATS[toLocale].currency}`
  const rate = rates[rateKey] || 1
  
  return Math.round(amount * rate)
}

// Инвалидация кеша при обновлении настроек
export const invalidateSettingsCache = () => {
  localeSettingsCache = null
  baseCurrencyCache = null
}
