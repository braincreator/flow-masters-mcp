import { BeforeChangeHook } from 'payload/types'
import { PriceConversionService } from '@/services/price.conversion.service'

// Hook to handle pricing calculations and currency conversion
export const beforeChangePricing: BeforeChangeHook = async ({ data, req }) => {
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

// Hook to validate category selection
export const validateCategory: BeforeChangeHook = async ({ data, req }) => {
  // Skip validation if no category is selected
  if (!data.category) return data

  try {
    // Fetch the selected category to verify it's a product category
    const category = await req.payload.findByID({
      collection: 'categories',
      id: data.category,
    })

    // Check if this is a product category
    if (category && category.categoryType !== 'product') {
      throw new Error('Selected category is not a product category')
    }
  } catch (error) {
    console.error('Error validating product category:', error)
    // You can choose to handle this error differently,
    // but for now we'll just return the data unchanged
  }

  return data
}
