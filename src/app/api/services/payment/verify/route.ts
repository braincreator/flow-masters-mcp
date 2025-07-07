import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * GET /api/services/payment/verify
 * Проверка статуса оплаты услуги
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Получаем информацию о заказе
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 1,
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Проверяем, оплачен ли заказ
    const isPaid = order.status === 'paid' || order.status === 'completed'

    // Если заказ не оплачен, проверяем статус платежа через платежный сервис
    if (!isPaid && order.paymentId) {
      const serviceRegistry = ServiceRegistry.getInstance(payload)
      const paymentService = serviceRegistry.getPaymentService()

      // Получаем платежный провайдер из заказа
      const paymentProvider = order.paymentProvider?.id || 'yoomoney'

      // Проверяем статус платежа
      const paymentStatus = await paymentService.checkPaymentStatus(
        paymentProvider,
        order.paymentId,
      )

      // Если платеж завершен, но статус заказа не обновлен, обновляем его
      if (paymentStatus.status === 'completed' || paymentStatus.status === 'paid') {
        // Обновляем статус заказа
        await payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            status: 'paid',
          },
        })

        // Получаем информацию о пользователе
        const customer = order.customer

        // Отправляем уведомление о создании аккаунта, если это незарегистрированный пользователь
        try {
          // Проверяем, есть ли у пользователя пароль
          const user = await payload.findByID({
            collection: 'users',
            id: customer.id,
            depth: 0,
          })

          // Если у пользователя нет пароля, создаем его и отправляем уведомление
          if (!user.hasOwnProperty('password') || !user.password) {
            const autoAccountService = serviceRegistry.getAutoAccountService()

            // Создаем аккаунт и отправляем уведомление
            await autoAccountService.createAccountFromPayment(user.email, user.name, orderId)
          }
        } catch (accountError) {
          logError('Error sending account notification:', accountError)
          // Не прерываем процесс в случае ошибки
        }

        // Возвращаем информацию о подтвержденном платеже
        return NextResponse.json({
          verified: true,
          order: {
            ...order,
            status: 'paid',
          },
        })
      }
    }

    // Получаем информацию об услуге, если это заказ на услугу
    let service = null
    if (order.orderType === 'service' && order.serviceData?.serviceId) {
      try {
        service = await payload.findByID({
          collection: 'services',
          id: order.serviceData.serviceId,
        })
      } catch (error) {
        logError('Error fetching service:', error)
      }
    }

    // Возвращаем статус проверки
    return NextResponse.json({
      verified: isPaid,
      order,
      service,
    })
  } catch (error) {
    logError('Error verifying service payment:', error)
    return NextResponse.json({ error: 'Failed to verify service payment' }, { status: 500 })
  }
}
