import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import type { User, Service, Order } from '@/payload-types' // Ensure Order is imported
import { generateOrderNumber, ORDER_PREFIXES } from '@/utilities/orderNumber'
// Removed import for getServerSideUser as its location/existence is problematic

interface InitiateServiceOrderRequestBody {
  serviceId: string
  locale: 'en' | 'ru' // Or your specific Locale type
  customerEmail?: string // Optional, if user is not logged in
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const body = (await request.json()) as InitiateServiceOrderRequestBody

    const { serviceId, locale, customerEmail } = body

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }
    if (!locale) {
      return NextResponse.json({ error: 'Locale is required' }, { status: 400 })
    }

    // 1. Fetch Service Details
    const service = await payload.findByID({
      collection: 'services',
      id: serviceId,
      locale: locale, // Fetch localized title
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 2. Determine User
    let userIdToLink: string | undefined
    // const { user: loggedInUser } = await getServerSideUser(request.cookies) // Removed usage of getServerSideUser

    // Rely on customerEmail for now.
    // A more robust solution would involve checking session/token for logged-in user.
    if (customerEmail) {
      // Find or create guest user
      const existingUsers = await payload.find({
        collection: 'users',
        where: { email: { equals: customerEmail } },
        limit: 1,
      })
      if (existingUsers.docs.length > 0 && existingUsers.docs[0]) {
        userIdToLink = existingUsers.docs[0].id
      } else {
        const guestUser = await payload.create({
          collection: 'users',
          data: {
            email: customerEmail,
            name: customerEmail.split('@')[0] || 'Guest User',
            roles: ['customer'], // Or a specific 'guest' role
            // Add any other required fields for user creation
          },
        })
        userIdToLink = guestUser.id
      }
    } else {
      // This case should ideally not happen if the UI ensures email is collected for guests
      // or user is logged in. For now, we'll proceed without a user if none is found.
      // A more robust solution might return an error or assign to a default guest account.
      console.warn('No logged-in user or customer email provided for service order initiation.')
    }


    // 3. Prepare Order Data
    const servicePrice = typeof service.price === 'number' ? service.price : 0
    const orderNumber = generateOrderNumber(ORDER_PREFIXES.SERVICE) // Standardized order number format

    const orderData: Partial<Order> & { customer: string | undefined } = { // Use Partial<Order> for flexibility
      orderNumber,
      customer: userIdToLink,
      items: [
        {
          service: service.id,
          quantity: 1,
          price: servicePrice, // Price at time of order
          // product: null, // Not needed if your Order 'items' field is flexible or uses 'product?: string | Product'
        },
      ],
      total: {
        // Assuming USD as base, adjust if your price conversion logic is different
        en: { amount: servicePrice, currency: 'USD' },
        // Add other locales if necessary, potentially converting price
        ru: { amount: servicePrice, currency: 'RUB' }, // Placeholder, actual conversion needed if prices differ
      },
      subtotal: { // Subtotal often matches total for single item orders without tax/discount
        en: { amount: servicePrice, currency: 'USD' },
        ru: { amount: servicePrice, currency: 'RUB' },
      },
      status: 'pending', // Or 'pending' if 'pending_details' is not a defined status
      orderType: 'service',
      // paymentMethod: null, // No payment method selected yet
      paidAt: null, // Not paid
      serviceData: {
        serviceId: service.id,
        serviceType: service.serviceType,
        requiresBooking: service.requiresBooking,
      },
      // Ensure all required fields for 'orders' collection are present
      // For example, if 'currency' is a top-level required field:
      // currency: 'USD', // Or derive from locale/service
    }

    // 4. Create Order
    const newOrder = await payload.create({
      collection: 'orders',
      data: orderData as Order, // Cast to Order after ensuring all required fields are met
    })

    return NextResponse.json({ success: true, orderId: newOrder.id })
  } catch (error) {
    console.error('Error initiating service order:', error)
    let message = 'Failed to initiate service order'
    if (error instanceof Error) message = error.message
    return NextResponse.json({ error: message }, { status: 500 })
  }
}