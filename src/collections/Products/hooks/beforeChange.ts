import type { BeforeChangeHook as PayloadBeforeChangeHook } from 'payload/dist/collections/config/types'
import { PriceConversionService } from '@/services/price.conversion.service'

// Hook to handle pricing calculations and currency conversion
export const beforeChangePricing = async ({ data, req }: { data: any; req: any }) => {
  if (!data.pricing) return data

  const priceService = PriceConversionService.getInstance()

  // Calculate finalPrice based on basePrice and discountPercentage
  if (data.pricing.basePrice) {
    const basePrice = data.pricing.basePrice
    const discount = data.pricing.discountPercentage || 0
    data.pricing.finalPrice = basePrice * (1 - discount / 100)

    // Store localized prices in a separate locales field to avoid structure mismatch
    data.pricing.locales = {
      en: {
        amount: data.pricing.basePrice,
        currency: 'USD',
      },
      ru: {
        amount: await priceService.convertPrice(data.pricing.basePrice, 'USD', 'RUB'),
        currency: 'RUB',
      },
    }
  }

  return data
}
