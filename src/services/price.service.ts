import { Payload } from 'payload'
import { BaseService } from './base.service'
import { PriceError } from '../utilities/errorHandling'

interface PriceSettings {
  baseCurrency: string
  roundingRules: Array<{
    currency: string
    roundTo: string
    roundingMethod: 'round' | 'ceil' | 'floor'
  }>
  markup: Array<{
    currency: string
    percentage: number
  }>
}

export class PriceService extends BaseService {
  private static instance: PriceService
  private settings: PriceSettings | null = null
  private exchangeRates: Record<string, number> = {}

  private constructor(payload: Payload) {
    super(payload)
  }

  static getInstance(payload: Payload): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService(payload)
    }
    return PriceService.instance
  }

  async init() {
    const settings = await this.payload.findGlobal({
      slug: 'settings',
    })

    this.settings = {
      baseCurrency: settings.currencies.baseCurrency,
      roundingRules: settings.currencies.roundingRules || [],
      markup: settings.currencies.markup || [],
    }

    // Загружаем курсы валют
    this.exchangeRates = settings.exchangeRates.rates.reduce((acc, rate) => ({
      ...acc,
      [`${rate.fromCurrency}_${rate.toCurrency}`]: rate.rate,
    }), {})
  }

  private applyRounding(amount: number, currency: string): number {
    const rule = this.settings?.roundingRules.find(r => r.currency === currency)
    if (!rule) return amount

    const roundTo = parseInt(rule.roundTo)
    if (roundTo === 1) return amount

    const rounded = amount / roundTo
    switch (rule.roundingMethod) {
      case 'ceil':
        return Math.ceil(rounded) * roundTo
      case 'floor':
        return Math.floor(rounded) * roundTo
      default:
        return Math.round(rounded) * roundTo
    }
  }

  private applyMarkup(amount: number, currency: string): number {
    const markup = this.settings?.markup.find(m => m.currency === currency)
    if (!markup) return amount

    return amount * (1 + markup.percentage / 100)
  }

  async convertPrice(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (!this.settings) await this.init()

    if (fromCurrency === toCurrency) return amount

    const rate = this.exchangeRates[`${fromCurrency}_${toCurrency}`]
    if (!rate) {
      throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`)
    }

    let converted = amount * rate
    converted = this.applyMarkup(converted, toCurrency)
    converted = this.applyRounding(converted, toCurrency)

    return converted
  }

  async formatPrice(
    amount: number,
    currency: string,
    locale: string = 'en'
  ): Promise<string> {
    if (!this.settings) await this.init()

    const settings = await payload.findGlobal({
      slug: 'settings',
    })

    const localeSetting = settings.currencies.localeDefaults.find(
      (l) => l.locale === locale
    )

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: localeSetting?.format.minimumFractionDigits ?? 2,
      maximumFractionDigits: localeSetting?.format.maximumFractionDigits ?? 2,
    }).format(amount)
  }

  invalidateCache() {
    this.settings = null
    this.exchangeRates = {}
  }
}
