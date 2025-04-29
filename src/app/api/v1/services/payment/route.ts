import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

/**
 * POST /api/v1/services/payment
 * Создание платежа для услуги
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const paymentService = serviceRegistry.getPaymentService()

    // Получаем данные запроса
    const requestData = await request.json()
    const { serviceId, customer, provider, returnUrl, successUrl, failUrl } = requestData

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    if (!customer || !customer.email) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 })
    }

    if (!provider || !provider.id) {
      return NextResponse.json({ error: 'Payment provider is required' }, { status: 400 })
    }

    // Получаем информацию об услуге
    const service = await payload.findByID({
      collection: 'services',
      id: serviceId,
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Проверяем, требуется ли оплата
    if (!service.requiresPayment) {
      return NextResponse.json({ error: 'This service does not require payment' }, { status: 400 })
    }

    // Получаем или создаем пользователя с помощью AutoAccountService
    let user
    let isNewUser = false
    try {
      const autoAccountService = serviceRegistry.getAutoAccountService()

      // Создаем аккаунт или получаем существующий
      const accountResult = await autoAccountService.createAccountFromPayment(
        customer.email,
        customer.name,
        // Пока не передаем orderId, так как он еще не создан
      )

      user = accountResult.user
      isNewUser = accountResult.isNewUser
    } catch (error) {
      console.error('Error creating/finding user account:', error)

      // Если не удалось создать аккаунт, пробуем получить или создать пользователя стандартным способом
      try {
        // Ищем пользователя по email
        const users = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: customer.email,
            },
          },
        })

        if (users.docs.length > 0) {
          user = users.docs[0]
        } else {
          // Создаем нового пользователя
          user = await payload.create({
            collection: 'users',
            data: {
              email: customer.email,
              name: customer.name || customer.email.split('@')[0],
              roles: ['customer'],
            },
          })
          isNewUser = true
        }
      } catch (innerError) {
        console.error('Error finding/creating user:', innerError)
        return NextResponse.json(
          { error: 'Failed to process customer information' },
          { status: 500 },
        )
      }
    }

    // Рассчитываем сумму к оплате
    let amount = service.price

    // Если это частичная предоплата, рассчитываем процент
    if (
      service.paymentSettings?.paymentType === 'partial_prepayment' &&
      service.paymentSettings?.prepaymentPercentage
    ) {
      amount = (service.price * service.paymentSettings.prepaymentPercentage) / 100
    }

    // Создаем заказ
    let order
    try {
      order = await payload.create({
        collection: 'orders',
        data: {
          orderNumber: `SRV-${Date.now()}`,
          customer: user.id,
          items: [
            {
              service: serviceId,
              quantity: 1,
              price: amount,
            },
          ],
          total: {
            en: {
              amount,
              currency: 'USD',
            },
            ru: {
              amount: amount * 90, // Примерный курс, лучше использовать API для конвертации
              currency: 'RUB',
            },
          },
          status: 'pending',
          paymentProvider: provider,
          orderType: 'service',
          serviceData: {
            serviceId,
            serviceType: service.serviceType,
            requiresBooking: service.requiresBooking,
          },
        },
      })
    } catch (error) {
      console.error('Failed to create order:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Создаем платеж
    try {
      const paymentResult = await paymentService.createPayment(provider.id, {
        orderId: order.id,
        amount,
        description: `Услуга: ${service.title}`,
        customer: {
          email: customer.email,
          name: customer.name || '',
          phone: customer.phone || '',
        },
        currency: 'USD',
        locale: customer.locale || 'ru',
        returnUrl: returnUrl || successUrl || '/payment/success',
        metadata: {
          serviceId,
          serviceType: service.serviceType,
          requiresBooking: service.requiresBooking,
        },
      })

      if (!paymentResult.status || paymentResult.status === 'failed') {
        // Обновляем статус заказа в случае ошибки
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            status: 'failed',
            paymentError: paymentResult.error || 'Payment creation failed',
          },
        })

        return NextResponse.json(
          { error: paymentResult.error || 'Failed to create payment' },
          { status: 400 },
        )
      }

      // Возвращаем информацию о платеже
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentId: paymentResult.paymentId,
        paymentUrl: paymentResult.paymentUrl || '',
        requiresBooking: service.requiresBooking,
        bookingSettings: service.requiresBooking ? service.bookingSettings : null,
      })
    } catch (error) {
      console.error('Failed to create payment:', error)
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error processing service payment:', error)
    return NextResponse.json({ error: 'Failed to process service payment' }, { status: 500 })
  }
}
