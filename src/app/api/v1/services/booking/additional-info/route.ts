import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

/**
 * POST /api/v1/services/booking/additional-info
 * Сохранение дополнительной информации для бронирования
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    // Получаем данные запроса
    const { orderId, serviceId, additionalInfo } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    if (!additionalInfo) {
      return NextResponse.json({ error: 'Additional info is required' }, { status: 400 })
    }

    // Получаем информацию о заказе
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Проверяем, есть ли уже бронирование для этого заказа
    const bookings = await payload.find({
      collection: 'bookings',
      where: {
        order: {
          equals: orderId,
        },
      },
    })

    if (bookings.docs.length > 0) {
      // Обновляем существующее бронирование
      const booking = bookings.docs[0]

      await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: {
          additionalInfo: JSON.stringify(additionalInfo),
        },
      })

      return NextResponse.json({ success: true, bookingId: booking.id })
    } else {
      // Создаем новое бронирование
      const booking = await payload.create({
        collection: 'bookings',
        data: {
          title: `Booking for Order ${order.orderNumber}`,
          type: 'manual',
          status: 'confirmed',
          order: orderId,
          additionalInfo: JSON.stringify(additionalInfo),
        },
      })

      return NextResponse.json({ success: true, bookingId: booking.id })
    }
  } catch (error) {
    console.error('Error saving additional info:', error)
    return NextResponse.json({ error: 'Failed to save additional info' }, { status: 500 })
  }
}
