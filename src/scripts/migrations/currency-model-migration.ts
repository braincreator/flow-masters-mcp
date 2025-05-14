/**
 * Миграция модели цен
 * Этот скрипт преобразует старую модель цен (базовая цена + локализованные переопределения)
 * в новую модель с локализованными ценами для каждой локали.
 */
import path from 'path'
import dotenv from 'dotenv'
import { getPayloadClient } from '../../utilities/payload'

// Загружаем переменные окружения из правильного файла
const env = process.env.NODE_ENV || 'development'
const envPath = path.resolve(process.cwd(), `.env.${env}`)
dotenv.config({ path: envPath })

// Курсы валют для конвертации (эти значения нужно заменить на актуальные)
const EXCHANGE_RATES = {
  USD_RUB: 90.0, // Курс доллара к рублю (примерный)
  // Добавьте другие курсы при необходимости
}

/**
 * Основная функция миграции
 */
async function runMigration() {
  console.log('Начинаем миграцию модели цен...')

  try {
    // Инициализируем Payload CMS
    const payload = await getPayloadClient()
    console.log('Успешно подключились к Payload CMS')

    // Мигрируем цены для продуктов
    await migrateProducts(payload)

    // Мигрируем цены для услуг
    await migrateServices(payload)

    // Мигрируем цены для заказов
    await migrateOrders(payload)

    console.log('Миграция успешно завершена!')
    process.exit(0)
  } catch (error) {
    console.error('Ошибка при миграции:', error)
    process.exit(1)
  }
}

/**
 * Миграция цен для продуктов
 */
async function migrateProducts(payload) {
  console.log('Мигрируем цены для продуктов...')

  // Получаем все продукты
  const { docs: products } = await payload.find({
    collection: 'products',
    limit: 1000, // Увеличьте лимит, если у вас больше продуктов
    depth: 0,
  })

  console.log(`Найдено ${products.length} продуктов для миграции.`)

  for (const product of products) {
    try {
      const { id, pricing } = product

      if (!pricing) {
        console.log(`Пропускаем продукт ${id}, т.к. нет ценовой информации.`)
        continue
      }

      const basePrice = pricing.basePrice || 0
      const localizedPrices = pricing.localizedPrices || {}

      // Создаем новую структуру цен с локализацией
      const updatedPricing = {
        ...pricing,
        price: {
          en: localizedPrices.en || basePrice, // Цена в USD для английской локали
          ru: localizedPrices.ru || Math.round(basePrice * EXCHANGE_RATES.USD_RUB), // Цена в рублях для русской локали
        },
      }

      // Удаляем ненужные поля
      delete updatedPricing.basePrice
      delete updatedPricing.localizedPrices

      // Обновляем продукт
      await payload.update({
        collection: 'products',
        id,
        data: {
          pricing: updatedPricing,
        },
      })

      console.log(`Успешно обновлен продукт ${id}`)
    } catch (error) {
      console.error(`Ошибка при обновлении продукта ${product.id}:`, error)
    }
  }

  console.log('Миграция продуктов завершена.')
}

/**
 * Миграция цен для услуг
 */
async function migrateServices(payload) {
  console.log('Мигрируем цены для услуг...')

  // Получаем все услуги
  const { docs: services } = await payload.find({
    collection: 'services',
    limit: 1000, // Увеличьте лимит, если у вас больше услуг
    depth: 0,
  })

  console.log(`Найдено ${services.length} услуг для миграции.`)

  for (const service of services) {
    try {
      const { id, price, localizedPrices } = service

      if (price === undefined || price === null) {
        console.log(`Пропускаем услугу ${id}, т.к. нет ценовой информации.`)
        continue
      }

      // Создаем локализованные цены
      const localizedPrice = {
        en: (localizedPrices && localizedPrices.en) || price, // Цена в USD для английской локали
        ru: (localizedPrices && localizedPrices.ru) || Math.round(price * EXCHANGE_RATES.USD_RUB), // Цена в рублях для русской локали
      }

      // Обновляем услугу
      await payload.update({
        collection: 'services',
        id,
        data: {
          price: localizedPrice,
        },
      })

      console.log(`Успешно обновлена услуга ${id}`)
    } catch (error) {
      console.error(`Ошибка при обновлении услуги ${service.id}:`, error)
    }
  }

  console.log('Миграция услуг завершена.')
}

/**
 * Миграция цен для заказов
 */
async function migrateOrders(payload) {
  console.log('Мигрируем цены для заказов...')

  // Получаем все заказы
  const { docs: orders } = await payload.find({
    collection: 'orders',
    limit: 1000, // Увеличьте лимит, если у вас больше заказов
    depth: 2,
  })

  console.log(`Найдено ${orders.length} заказов для миграции.`)

  for (const order of orders) {
    try {
      const { id, items, total, subtotal } = order

      // Пропускаем заказы без элементов
      if (!items || !items.length) {
        console.log(`Пропускаем заказ ${id}, т.к. нет элементов заказа.`)
        continue
      }

      // Обновляем элементы заказа
      const updatedItems = items.map((item) => {
        const basePrice = item.price || 0

        // Создаем локализованные цены для каждого элемента
        const price = {
          en: item.localizedPrices?.en || basePrice,
          ru: item.localizedPrices?.ru || Math.round(basePrice * EXCHANGE_RATES.USD_RUB),
        }

        // Удаляем устаревшие поля
        const updatedItem = { ...item }
        delete updatedItem.localizedPrices

        return {
          ...updatedItem,
          price,
        }
      })

      // Обновляем общие суммы, если они не локализованы
      let updatedTotal = total
      let updatedSubtotal = subtotal

      if (typeof total === 'number') {
        updatedTotal = {
          en: { amount: total, currency: 'USD' },
          ru: { amount: Math.round(total * EXCHANGE_RATES.USD_RUB), currency: 'RUB' },
        }
      }

      if (typeof subtotal === 'number') {
        updatedSubtotal = {
          en: { amount: subtotal, currency: 'USD' },
          ru: { amount: Math.round(subtotal * EXCHANGE_RATES.USD_RUB), currency: 'RUB' },
        }
      }

      // Обновляем заказ
      await payload.update({
        collection: 'orders',
        id,
        data: {
          items: updatedItems,
          total: updatedTotal,
          subtotal: updatedSubtotal,
        },
      })

      console.log(`Успешно обновлен заказ ${id}`)
    } catch (error) {
      console.error(`Ошибка при обновлении заказа ${order.id}:`, error)
    }
  }

  console.log('Миграция заказов завершена.')
}

// Запускаем миграцию
runMigration()
