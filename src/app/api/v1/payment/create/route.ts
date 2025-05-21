import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { PaymentProvider, PaymentResult } from '@/types/payment'
import { ServiceRegistry } from '@/services/service.registry'
import { generateSecurePassword } from '@/utilities/generatePassword'
import { PaymentService } from '@/services/payment.service'

// Определяем интерфейсы для типизации
interface CartItem {
  productId?: string
  serviceId?: string
  quantity: number
}

interface Product {
  id: string
  price?: number
  pricing?: {
    finalPrice?: number
  }
}

interface Service {
  id: string
  price?: number
}

// Расширяем существующий тип PaymentResult для наших нужд
interface ExtendedPaymentResult extends PaymentResult {
  paymentUrl?: string
  success: boolean
  orderId: string
  status?: string
  error?: string
  confirmationUrl?: string
  rawResponse?: any // Добавляем поле rawResponse, которое используется в коде
}

// Определяем типы для скидок
interface DiscountData {
  code: string
  description: string
  amount: {
    en: { amount: number; currency: string }
    ru: { amount: number; currency: string }
  }
}

export async function POST(req: Request) {
  try {
    let payload

    try {
      payload = await getPayloadClient()
    } catch (error) {
      console.error('Failed to initialize Payload client:', error)
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    let paymentService
    try {
      const serviceRegistry = ServiceRegistry.getInstance(payload)
      paymentService = serviceRegistry.getPaymentService()
    } catch (error) {
      console.error('Failed to initialize PaymentService:', error)
      return NextResponse.json({ error: 'Payment service unavailable' }, { status: 503 })
    }

    // Extract data from the request
    let requestData
    try {
      requestData = await req.json()
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    const {
      items,
      customer,
      provider,
      returnUrl,
      selectedCurrency,
      successUrl,
      failUrl,
      discount,
    } = requestData

    // Input validation
    if (!items || !items.length) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    if (!customer || !customer.email) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 })
    }

    if (!provider) {
      return NextResponse.json({ error: 'Payment provider is required' }, { status: 400 })
    }

    // Получаем ID провайдера - теперь с клиента приходит строка, а не объект
    const providerId = typeof provider === 'string' ? provider : provider.id

    if (!providerId) {
      return NextResponse.json({ error: 'Invalid payment provider' }, { status: 400 })
    }

    // Отдельные массивы для продуктов и услуг
    const productItems = items.filter((item: CartItem) => item.productId)
    const serviceItems = items.filter((item: CartItem) => item.serviceId)

    // Получаем продукты из базы данных
    let productsData: { docs: Product[] } = { docs: [] }
    if (productItems.length > 0) {
      try {
        const productIds = productItems.map((item: CartItem) => item.productId).filter(Boolean)
        const result = await payload.find({
          collection: 'products',
          where: {
            id: {
              in: productIds,
            },
          },
        })
        productsData = result as { docs: Product[] }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
      }
    }

    // Получаем услуги из базы данных
    let servicesData: { docs: Service[] } = { docs: [] }
    if (serviceItems.length > 0) {
      try {
        const serviceIds = serviceItems.map((item: CartItem) => item.serviceId).filter(Boolean)
        const result = await payload.find({
          collection: 'services',
          where: {
            id: {
              in: serviceIds,
            },
          },
        })
        servicesData = result as { docs: Service[] }
      } catch (error) {
        console.error('Failed to fetch services:', error)
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
      }
    }

    // Проверяем, что нашли все товары и услуги
    if (productItems.length > 0 && productsData.docs.length === 0) {
      return NextResponse.json({ error: 'Products not found' }, { status: 404 })
    }

    if (serviceItems.length > 0 && servicesData.docs.length === 0) {
      return NextResponse.json({ error: 'Services not found' }, { status: 404 })
    }

    // Расчет общей стоимости заказа
    let total = 0

    // Добавляем стоимость продуктов
    productItems.forEach((item: CartItem) => {
      const product = productsData.docs.find((p) => p.id === item.productId)
      if (product) {
        // Используем finalPrice из pricing если доступен, иначе обычную цену
        const price =
          product.pricing?.finalPrice !== undefined
            ? product.pricing.finalPrice
            : product.price || 0
        total += price * item.quantity
      }
    })

    // Добавляем стоимость услуг
    serviceItems.forEach((item: CartItem) => {
      const service = servicesData.docs.find((s) => s.id === item.serviceId)
      if (service) {
        const price = service.price || 0
        total += price * item.quantity
      }
    })

    // Применяем скидку если есть
    let discountAmount = 0
    if (discount && discount.amount) {
      discountAmount = discount.amount
      total = Math.max(0, total - discountAmount)
    }

    if (total <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 })
    }

    // Create order in database
    let order
    try {
      // Find or create user
      let user
      try {
        // Try to find existing user by email
        const userResult = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: customer.email,
            },
          },
        })

        if (userResult.docs.length > 0 && userResult.docs[0]) {
          user = userResult.docs[0].id
        } else {
          // Create a new user if not found
          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: customer.email,
              name: customer.name || customer.email.split('@')[0],
              // Используем существующую функцию для генерации безопасного пароля
              password: generateSecurePassword(),
              // Установить флаг для последующего сброса пароля
              roles: ['customer'],
              passwordResetRequired: true,
            },
          })
          user = newUser.id

          // Отправляем ссылку для сброса пароля
          try {
            await payload.forgotPassword({
              collection: 'users',
              data: {
                email: customer.email,
              },
            })
          } catch (forgotPasswordError) {
            console.error('Failed to send password reset email:', forgotPasswordError)
            // Не блокируем создание заказа из-за проблем с отправкой email
          }
        }
      } catch (userError) {
        console.error('Failed to find or create user:', userError)
        return NextResponse.json({ error: 'Failed to process customer data' }, { status: 500 })
      }

      // Calculate prices in different currencies
      const usdTotal = total
      // Используем более реалистичный курс конвертации
      const conversionRate = customer.locale === 'ru' ? 90 : 1
      const rubTotal = total * conversionRate

      // Prepare order items - комбинируем продукты и услуги
      const orderItems: Array<{
        itemType: string
        product?: string
        service?: string
        quantity: number
        price: number
      }> = []

      // Добавляем продукты в заказ
      productItems.forEach((item: CartItem) => {
        const product = productsData.docs.find((p) => p.id === item.productId)
        if (product) {
          const price =
            product.pricing?.finalPrice !== undefined
              ? product.pricing.finalPrice
              : product.price || 0

          orderItems.push({
            itemType: 'product',
            product: item.productId,
            quantity: item.quantity,
            price: price,
          })
        }
      })

      // Добавляем услуги в заказ
      serviceItems.forEach((item: CartItem) => {
        const service = servicesData.docs.find((s) => s.id === item.serviceId)
        if (service) {
          orderItems.push({
            itemType: 'service',
            service: item.serviceId,
            quantity: item.quantity,
            price: service.price || 0,
          })
        }
      })

      // Use try/catch to prevent integration service errors from failing order creation
      try {
        order = await payload.create({
          collection: 'orders',
          data: {
            // Import the utility function for consistent order number generation
            orderNumber: require('@/utilities/orderNumber').generateOrderNumber('ORD'),
            customer: user, // Link to the user ID
            items: orderItems,
            // Format total according to the required structure
            total: {
              en: {
                amount: usdTotal,
                currency: 'USD',
              },
              ru: {
                amount: rubTotal,
                currency: 'RUB',
              },
            },
            // Добавляем обязательное поле subtotal
            subtotal: {
              en: {
                amount: usdTotal,
                currency: 'USD',
              },
              ru: {
                amount: rubTotal,
                currency: 'RUB',
              },
            },
            // Сохраняем информацию о скидке, если она была применена
            discounts: discount
              ? [
                  {
                    code: discount.code || '',
                    description: 'Applied discount',
                    amount: {
                      en: { amount: discountAmount, currency: 'USD' },
                      ru: {
                        amount: discountAmount * (customer.locale === 'ru' ? 90 : 1),
                        currency: 'RUB',
                      },
                    },
                  },
                ]
              : undefined,
            status: 'pending',
            paymentProvider: providerId,
            // Добавляем orderType
            orderType: serviceItems.length > 0 ? 'service' : 'product',
            // Сохраняем локаль в paymentData
            paymentData: {
              customerLocale: customer.locale || 'en',
              originalTotal: usdTotal,
            },
          },
        })
      } catch (orderError) {
        console.error('Failed to create order:', orderError)

        // Special case for integration errors - if it's just an integration error,
        // we should still be able to access the created order
        if (
          orderError instanceof Error &&
          orderError.message &&
          orderError.message.includes('integrations')
        ) {
          console.warn('Integration error during order creation, but order might have been created')
          // Try to retrieve the just-created order by orderNumber
          try {
            // Use the same utility function for consistent order number generation
            const orderNumber = require('@/utilities/orderNumber').generateOrderNumber('ORD')
            const orderResult = await payload.find({
              collection: 'orders',
              where: {
                orderNumber: {
                  equals: orderNumber,
                },
              },
            })

            if (orderResult.docs.length > 0) {
              order = orderResult.docs[0]
              console.log('Successfully retrieved order despite integration error')
            } else {
              throw new Error('Could not find created order')
            }
          } catch (retrievalError) {
            console.error('Failed to retrieve order after integration error:', retrievalError)
            throw orderError // Rethrow the original error
          }
        } else {
          // If it's not an integration error, rethrow
          throw orderError
        }
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      return NextResponse.json(
        {
          error:
            'Failed to create order: ' + (error instanceof Error ? error.message : 'Unknown error'),
        },
        { status: 500 },
      )
    }

    // Generate payment URL
    let paymentResult: ExtendedPaymentResult = {
      success: false,
      orderId: order?.id || '',
    }
    try {
      // Build payment metadata with additional parameters
      const metadata: Record<string, any> = {}

      // Add cryptocurrency selection if present
      if (providerId === 'crypto' && selectedCurrency) {
        metadata.selectedCurrency = selectedCurrency
      }

      // Add discount info to metadata if present
      if (discount) {
        metadata.discount = {
          code: discount.code,
          amount: discountAmount,
        }
      }

      // Используем ID провайдера из CMS
      console.log(`Creating payment with providerId:`, providerId)

      // Определяем целевую валюту на основе локали
      const targetCurrency = customer.locale === 'ru' ? 'RUB' : 'USD'

      // Create the payment using the provider object directly
      const paymentResultData = await paymentService.createPayment(providerId, {
        orderId: order?.id || '',
        amount: total,
        description: `Order ${order?.orderNumber || 'Unknown'}`,
        customer: {
          email: customer.email,
          name: customer.name || '',
          phone: customer.phone || '',
        },
        currency: targetCurrency, // Используем валюту, соответствующую локали
        locale: customer.locale || 'en',
        returnUrl: returnUrl || successUrl || '/payment/success',
        metadata: {
          ...metadata,
          // Добавляем информацию о конвертации для аудита
          originalAmount: total,
          targetCurrency,
          locale: customer.locale || 'en',
        },
      })

      // Совместимое преобразование для ExtendedPaymentResult
      paymentResult = {
        ...paymentResultData,
        success: paymentResultData.status === 'succeeded',
        orderId: order?.id || '',
        paymentUrl: paymentResultData.confirmationUrl,
      }
    } catch (error) {
      console.error('Failed to create payment:', error)

      // If payment creation failed, update order status
      try {
        if (order?.id) {
          // Преобразуем информацию об ошибке в текстовый формат для поля reason
          const detailedReason = `Ошибка платежа: ${error instanceof Error ? error.message : 'Unknown payment error'}${
            error instanceof Error ? `. Детали: ${error.message}` : ''
          }${
            paymentResult.rawResponse
              ? `. Данные провайдера: ${JSON.stringify(paymentResult.rawResponse)}`
              : ''
          }`

          await payload.update({
            collection: 'orders',
            id: order.id,
            data: {
              status: 'cancelled',
              cancellationDetails: {
                cancelledAt: new Date().toISOString(),
                reason: detailedReason, // Используем строковое представление всех деталей ошибки
              },
            },
          })
        }
      } catch (updateError) {
        console.error('Failed to update order status after payment failure:', updateError)
      }

      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to create payment',
        },
        { status: 500 },
      )
    }

    if (!paymentResult.success || !paymentResult.paymentUrl) {
      // Получаем более детальную информацию об ошибке
      let errorMessage = paymentResult.error || 'Payment creation failed with no specific error'
      let errorDetails = null

      // Если у нас есть rawResponse, извлекаем из него детали ошибки
      if (paymentResult.rawResponse) {
        console.log('Payment raw response:', JSON.stringify(paymentResult.rawResponse, null, 2))

        // Проверяем, есть ли в ответе детальная информация об ошибке
        if (typeof paymentResult.rawResponse === 'object') {
          if (paymentResult.rawResponse.Description) {
            // Для Robokassa часто ошибка содержится в поле Description
            errorDetails = paymentResult.rawResponse.Description
            errorMessage = `Robokassa: ${errorDetails}`
          } else if (paymentResult.rawResponse.message) {
            errorDetails = paymentResult.rawResponse.message
            errorMessage = `Payment error: ${errorDetails}`
          }

          // Сохраняем код ошибки если он есть
          if (paymentResult.rawResponse.ResultCode) {
            errorMessage += ` (код: ${paymentResult.rawResponse.ResultCode})`
          }
        }
      }

      // If payment creation failed, update order status
      try {
        if (order?.id) {
          // Преобразуем информацию об ошибке в текстовый формат для поля reason
          const detailedReason = `Ошибка платежа: ${errorMessage}${
            errorDetails ? `. Детали: ${errorDetails}` : ''
          }${
            paymentResult.rawResponse
              ? `. Данные провайдера: ${JSON.stringify(paymentResult.rawResponse)}`
              : ''
          }`

          await payload.update({
            collection: 'orders',
            id: order.id,
            data: {
              status: 'cancelled',
              cancellationDetails: {
                cancelledAt: new Date().toISOString(),
                reason: detailedReason, // Используем строковое представление всех деталей ошибки
              },
            },
          })
        }
      } catch (updateError) {
        console.error('Failed to update order status after payment failure:', updateError)
      }

      console.error(
        `Payment creation API returning 400. paymentResult.success: ${paymentResult.success}, paymentResult.status (from provider): ${paymentResult.status}, paymentResult.paymentUrl: ${paymentResult.paymentUrl}, orderId: ${order?.id}`,
      );
      return NextResponse.json(
        {
          error: errorMessage,
          errorDetails: errorDetails,
          providerError: paymentResult.rawResponse ? true : false,
        },
        { status: 400 },
      )
    }

    // Return payment URL for redirect
    return NextResponse.json({
      success: true,
      orderId: order?.id || '',
      orderNumber: order?.orderNumber || '',
      paymentUrl: paymentResult.paymentUrl,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
