import { payload } from 'payload'
import { PriceService } from '../services/PriceService'

export const updateProductPrices = async () => {
  const priceService = PriceService.getInstance()
  const settings = await payload.findGlobal({
    slug: 'settings',
  })

  const baseCurrency = settings.currencies.baseCurrency

  // Получаем все продукты
  const { docs: products } = await payload.find({
    collection: 'products',
    limit: 1000,
  })

  // Обновляем цены для каждого продукта
  for (const product of products) {
    const basePrice = product.price
    const convertedPrices = {}

    // Конвертируем в каждую поддерживаемую валюту
    for (const rate of settings.exchangeRates.rates) {
      if (rate.enabled) {
        const converted = await priceService.convertPrice(
          basePrice,
          baseCurrency,
          rate.toCurrency
        )
        convertedPrices[rate.toCurrency] = converted
      }
    }

    // Обновляем продукт
    await payload.update({
      collection: 'products',
      id: product.id,
      data: {
        convertedPrices,
        lastPriceUpdate: new Date().toISOString(),
      },
    })
  }
}