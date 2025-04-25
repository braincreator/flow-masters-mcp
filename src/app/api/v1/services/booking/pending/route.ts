import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { getServerSession } from '@/utilities/auth/getServerSession'

/**
 * GET /api/v1/services/booking/pending
 * Получение списка оплаченных услуг, для которых не завершено бронирование
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем текущую сессию пользователя
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    const payload = await getPayloadClient()
    
    // Ищем заказы пользователя, которые оплачены, но не имеют связанного бронирования
    const orders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          {
            customer: {
              equals: userId,
            },
          },
          {
            status: {
              equals: 'paid',
            },
          },
          {
            orderType: {
              equals: 'service',
            },
          },
        ],
      },
      depth: 1,
    })
    
    // Фильтруем заказы, для которых требуется бронирование
    const pendingBookingOrders = []
    
    for (const order of orders.docs) {
      // Проверяем, требуется ли бронирование для этой услуги
      if (order.serviceData?.requiresBooking) {
        // Проверяем, есть ли уже бронирование для этого заказа
        const bookings = await payload.find({
          collection: 'bookings',
          where: {
            order: {
              equals: order.id,
            },
          },
          limit: 1,
        })
        
        // Если бронирований нет или они не завершены, добавляем заказ в список ожидающих
        if (bookings.docs.length === 0 || 
            (bookings.docs[0].status !== 'confirmed' && 
             bookings.docs[0].status !== 'completed')) {
          
          // Получаем информацию об услуге
          let service = null
          if (order.serviceData?.serviceId) {
            try {
              service = await payload.findByID({
                collection: 'services',
                id: order.serviceData.serviceId,
              })
            } catch (error) {
              console.error('Error fetching service:', error)
            }
          }
          
          pendingBookingOrders.push({
            order,
            service,
            booking: bookings.docs.length > 0 ? bookings.docs[0] : null,
          })
        }
      }
    }
    
    return NextResponse.json({
      pendingBookings: pendingBookingOrders,
    })
  } catch (error) {
    console.error('Error fetching pending bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending bookings' },
      { status: 500 }
    )
  }
}
