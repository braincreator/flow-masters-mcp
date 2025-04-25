import { getPayloadClient } from '@/utilities/payload/index'
import { fetchExchangeRates } from '@/utilities/api'

export class PriceConversionService {
  private static instance: PriceConversionService
  private rates: Record<string, number> = {}
  private lastUpdate: Date | null = null

  private constructor() {}

  static getInstance(): PriceConversionService {
    if (!PriceConversionService.instance) {
      PriceConversionService.instance = new PriceConversionService()
    }
    return PriceConversionService.instance
  }

  async invalidateCache(): Promise<void> {
    this.lastUpdate = null
    this.rates = {}
  }

  private async getSettings() {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({
      slug: 'settings',
    })
    return settings.exchangeRates
  }

  private async getManualRates(): Promise<Record<string, number>> {
    const settings = await this.getSettings()

    return settings.rates
      .filter((rate) => rate.enabled)
      .reduce(
        (acc, rate) => ({
          ...acc,
          [`${rate.fromCurrency}_${rate.toCurrency}`]: rate.rate,
        }),
        {},
      )
  }

  async updateRates(): Promise<void> {
    try {
      const settings = await this.getSettings()

      // Get manual rates first
      const manualRates = await this.getManualRates()

      // Get auto rates if enabled
      let autoRates = {}
      if (settings.autoUpdateEnabled) {
        autoRates = await fetchExchangeRates()
      }

      // Combine rates, giving priority to manual rates
      this.rates = {
        ...autoRates,
        ...manualRates,
      }

      // Update lastUpdate timestamp in settings
      const payload = await getPayloadClient()
      await payload.updateGlobal({
        slug: 'settings',
        data: {
          exchangeRates: {
            ...settings,
            lastUpdate: new Date(),
          },
        },
      })

      this.lastUpdate = new Date()
    } catch (error) {
      console.error('Failed to update exchange rates:', error)
      throw new Error('Failed to update exchange rates')
    }
  }

  async getRate(from: string, to: string): Promise<number> {
    const settings = await this.getSettings()
    const updateIntervalHours = parseInt(settings.updateInterval)

    if (
      !this.lastUpdate ||
      Date.now() - this.lastUpdate.getTime() > updateIntervalHours * 3600000
    ) {
      await this.updateRates()
    }

    const rateKey = `${from}_${to}`
    const rate = this.rates[rateKey]

    if (!rate) {
      throw new Error(`Exchange rate not found for ${rateKey}`)
    }

    return rate
  }

  async convertPrice(amount: number, from: string, to: string): Promise<number> {
    const rate = await this.getRate(from, to)
    return Math.round(amount * rate)
  }
}
