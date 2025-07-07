import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * POST /api/services/booking/additional-info
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

    // Update the Order with additionalInfo for the ServiceProject hook
    // We'll store the additionalInfo as a JSON string in specificationText.ru
    // A more robust solution would handle file uploads to specificationFiles separately.
    // This is now part of the main try block.
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        specificationText: {
          // Assuming 'ru' is a primary locale or a default for this text.
          // Adjust if different locales need specific handling.
          ru: JSON.stringify(additionalInfo),
        },
        // If additionalInfo contains file IDs, they should be processed and added to specificationFiles
        // For example: specificationFiles: additionalInfo.files?.map(file => file.id) || []
      } as any, // Added 'as any' to bypass TypeScript error for localized field
      // Ensure user context is passed if required by access controls, though admin usually bypasses.
      // req: request, // If needed for user context in hooks/access
    })
    // Removed the specific try-catch for order update to integrate into the main one.
    // If an error occurs here, it will be caught by the main catch block.
    // If specific handling for orderUpdateError is still needed, it can be re-added carefully.

    // Проверяем, есть ли уже бронирование для этого заказа (existing logic)
    const bookings = await payload.find({
      collection: 'bookings',
      where: {
        order: {
          equals: orderId,
        },
      },
    })

    let bookingIdToReturn: string | undefined

    if (bookings.docs.length > 0) {
      // Обновляем существующее бронирование
      const booking = bookings.docs[0]
      if (booking && booking.id) { // Added null check for booking and booking.id
        bookingIdToReturn = booking.id
        await payload.update({
          collection: 'bookings',
          id: booking.id,
          data: {
            // additionalInfo: JSON.stringify(additionalInfo), // Removed: additionalInfo is not a field in Bookings
            // If specific fields from additionalInfo need to go into booking.questions or booking.notes,
            // that mapping should happen here. For now, removing generic blob.
          },
        })
      }
    } else {
      // Создаем новое бронирование
      const newBooking = await payload.create({
        collection: 'bookings',
        data: {
          title: `Booking for Order ${order.orderNumber}`,
          type: 'manual', // Or derive from service settings
          status: 'confirmed', // Or derive from service settings
          order: orderId,
          startTime: new Date().toISOString(), // Added required startTime
          // additionalInfo: JSON.stringify(additionalInfo), // Removed: additionalInfo is not a field in Bookings
          // If specific fields from additionalInfo need to go into newBooking.questions or newBooking.notes,
          // that mapping should happen here.
        },
      })
      bookingIdToReturn = newBooking.id
    }

    // The createServiceProjectHook on Orders collection will handle ServiceProject creation
    // when the order status is updated to 'processing' or 'paid'.
    // The current API call only saves additional info.
    // The actual project creation is decoupled and triggered by order status change.

    return NextResponse.json({ success: true, bookingId: bookingIdToReturn })
  } catch (error: any) { // Changed to 'any' for broader error type compatibility
    // Log the specific error if it's from the order update, or a general one.
    if (error.message && error.message.includes('order with additional info')) { // Basic check
      logError('Specific error updating order with additional info:', error)
    } else {
      logError('General error in POST /api/services/booking/additional-info:', error)
    }
    return NextResponse.json({ error: 'Failed to save additional info' }, { status: 500 })
  }
}
