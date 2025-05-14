import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { PaymentProvider } from '@/types/payment'
import { ServiceRegistry } from '@/services/service.registry'

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

    if (!provider || !provider.id) {
      return NextResponse.json({ error: 'Payment provider is required' }, { status: 400 })
    }

    // Отдельные массивы для продуктов и услуг
    const productItems = items.filter((item) => item.productId)
    const serviceItems = items.filter((item) => item.serviceId)

    // Получаем продукты из базы данных
    let productsData = { docs: [] }
    if (productItems.length > 0) {
      try {
        const productIds = productItems.map((item) => item.productId).filter(Boolean)
        productsData = await payload.find({
          collection: 'products',
          where: {
            id: {
              in: productIds,
            },
          },
        })
      } catch (error) {
        console.error('Failed to fetch products:', error)
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
      }
    }

    // Получаем услуги из базы данных
    let servicesData = { docs: [] }
    if (serviceItems.length > 0) {
      try {
        const serviceIds = serviceItems.map((item) => item.serviceId).filter(Boolean)
        servicesData = await payload.find({
          collection: 'services',
          where: {
            id: {
              in: serviceIds,
            },
          },
        })
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
    productItems.forEach((item) => {
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
    serviceItems.forEach((item) => {
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

        if (userResult.docs.length > 0) {
          user = userResult.docs[0].id
        } else {
          // Create a new user if not found
          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: customer.email,
              name: customer.name || customer.email.split('@')[0],
            },
          })
          user = newUser.id
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
      const orderItems = []

      // Добавляем продукты в заказ
      productItems.forEach((item) => {
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
      serviceItems.forEach((item) => {
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
            orderNumber: `ORD-${Date.now()}`,
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
            // Сохраняем информацию о скидке, если она была применена
            discount: discount
              ? {
                  code: discount.code,
                  amount: discountAmount,
                }
              : undefined,
            status: 'pending',
            paymentProvider: provider,
            // No shipping address needed for digital products
          },
        })
      } catch (orderError) {
        console.error('Failed to create order:', orderError)

        // Special case for integration errors - if it's just an integration error,
        // we should still be able to access the created order
        if (orderError.message && orderError.message.includes('integrations')) {
          console.warn('Integration error during order creation, but order might have been created')
          // Try to retrieve the just-created order by orderNumber
          try {
            const orderNumber = `ORD-${Date.now()}`
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
    let paymentResult
    try {
      // Build payment metadata with additional parameters
      const metadata: Record<string, any> = {}

      // Add cryptocurrency selection if present
      if (provider.id === 'crypto' && selectedCurrency) {
        metadata.selectedCurrency = selectedCurrency
      }

      // Add discount info to metadata if present
      if (discount) {
        metadata.discount = {
          code: discount.code,
          amount: discountAmount,
        }
      }

      // Log the actual provider object being used
      console.log(`Creating payment with provider:`, JSON.stringify(provider, null, 2))

      // Create the payment using the provider object directly
      paymentResult = await paymentService.createPayment(provider, {
        orderId: order.id,
        amount: total,
        description: `Order ${order.orderNumber}`,
        customer: {
          email: customer.email,
          name: customer.name || '',
          phone: customer.phone || '',
        },
        currency: 'USD', // Default currency, can be made dynamic
        locale: customer.locale || 'en',
        returnUrl: returnUrl || successUrl || '/payment/success',
        metadata,
      })
    } catch (error) {
      console.error('Failed to create payment:', error)

      // If payment creation failed, update order status
      try {
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            status: 'failed',
            paymentError: error instanceof Error ? error.message : 'Unknown payment error',
          },
        })
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
      // If payment creation failed, update order status
      try {
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            status: 'failed',
            paymentError: paymentResult.error || 'Payment creation failed with no specific error',
          },
        })
      } catch (updateError) {
        console.error('Failed to update order status after payment failure:', updateError)
      }

      return NextResponse.json(
        {
          error: paymentResult.error || 'Payment provider returned an error',
        },
        { status: 400 },
      )
    }

    // Return payment URL for redirect
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
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
