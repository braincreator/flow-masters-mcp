import { payload } from 'payload'
import { PriceConversionService } from '@/services/PriceConversionService'

export async function updateExchangeRates() {
  const priceService = PriceConversionService.getInstance()
  await priceService.updateRates()
  
  // Update all product prices
  const products = await payload.find({
    collection: 'products',
    limit: 1000,
  })

  for (const product of products.docs) {
    if (product.pricing?.basePrice) {
      const updatedPricing = {
        ...product.pricing,
        ru: {
          amount: await priceService.convertPrice(product.pricing.basePrice, 'USD', 'RUB'),
          currency: 'RUB'
        }
      }

      await payload.update({
        collection: 'products',
        id: product.id,
        data: {
          pricing: updatedPricing
        }
      })
    }
  }
}
