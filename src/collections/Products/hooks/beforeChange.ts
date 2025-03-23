import { BeforeChangeHook } from 'payload/types'
import { PriceConversionService } from '@/services/price.conversion.service'

export const beforeChangePricing: BeforeChangeHook = async ({ data, req }) => {
  if (!data.pricing) return data

  const priceService = PriceConversionService.getInstance()

  // If basePrice is changed, update all locale prices
  if (data.pricing.basePrice) {
    data.pricing = {
      ...data.pricing,
      en: {
        amount: data.pricing.basePrice,
        currency: 'USD'
      },
      ru: {
        amount: await priceService.convertPrice(data.pricing.basePrice, 'USD', 'RUB'),
        currency: 'RUB'
      }
    }
  }

  return data
}