export interface CurrencyRate {
  from: string
  to: string
  value: number
}

export interface CurrencySettings {
  rates: CurrencyRate[]
  baseCurrency: string
  localeDefaults: Array<{
    locale: string
    currency: string
    format: {
      minimumFractionDigits: number
      maximumFractionDigits: number
    }
  }>
}

export interface GlobalSettings {
  currencies: CurrencySettings
}

declare module 'payload' {
  interface Globals {
    settings: GlobalSettings
  }
} 