import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import type { User, Service, Order } from '@/payload-types' // Ensure Order is imported
import { generateOrderNumber, ORDER_PREFIXES } from '@/utilities/orderNumber'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

interface InitiateServiceOrderRequestBody {
  serviceId: string
  locale: 'en' | 'ru' // Or your specific Locale type
  customerEmail?: string // Optional, if user is not logged in
  customerId?: string // Optional, if user is authenticated
}

// Helper function to get authenticated user from request
async function getAuthenticatedUser(request: NextRequest, payload: any): Promise<User | null> {
  try {
    // Try to get user from Payload's built-in authentication
    const { user } = await payload.auth({ headers: request.headers })
    return user || null
  } catch (error) {
    logDebug('No authenticated user found:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const body = (await request.json()) as InitiateServiceOrderRequestBody

    const { serviceId, locale, customerEmail, customerId } = body

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

    // 2. Determine User - Check authentication first, then fallback to guest user creation
    let userIdToLink: string | undefined
    let authenticatedUser: User | null = null

    // First, try to get authenticated user from session/cookies
    authenticatedUser = await getAuthenticatedUser(request, payload)

    if (authenticatedUser) {
      // User is authenticated - use their ID
      userIdToLink = authenticatedUser.id
      logDebug('Using authenticated user for order:', { userId: authenticatedUser.id, email: authenticatedUser.email })
    } else if (customerId) {
      // Frontend claims user is authenticated but we couldn't verify - validate the customerId
      try {
        const user = await payload.findByID({
          collection: 'users',
          id: customerId,
        })
        if (user) {
          userIdToLink = user.id
          logDebug('Using provided customerId for order:', { userId: user.id, email: user.email })
        } else {
          logWarn('Provided customerId not found, falling back to guest user creation')
        }
      } catch (error) {
        logWarn('Error validating customerId, falling back to guest user creation:', error)
      }
    }

    // If no authenticated user, create or find guest user based on email
    if (!userIdToLink && customerEmail) {
      const existingUsers = await payload.find({
        collection: 'users',
        where: { email: { equals: customerEmail } },
        limit: 1,
      })

      if (existingUsers.docs.length > 0 && existingUsers.docs[0]) {
        userIdToLink = existingUsers.docs[0].id
        logDebug('Found existing user for guest order:', { userId: userIdToLink, email: customerEmail })
      } else {
        const guestUser = await payload.create({
          collection: 'users',
          data: {
            email: customerEmail,
            name: customerEmail.split('@')[0] || 'Guest User',
            roles: ['customer'],
          },
        })
        userIdToLink = guestUser.id
        logDebug('Created new guest user for order:', { userId: userIdToLink, email: customerEmail })
      }
    }

    // Final validation - we must have a user at this point
    if (!userIdToLink) {
      logWarn('No user could be determined for service order initiation.')
      return NextResponse.json(
        {
          error: 'User authentication required. Please provide a valid email address or log in.',
          code: 'USER_REQUIRED'
        },
        { status: 400 }
      )
    }


    // 3. Prepare Order Data
    const servicePrice = typeof service.price === 'number' ? service.price : 0
    const orderNumber = generateOrderNumber(ORDER_PREFIXES.SERVICE) // Standardized order number format

    const orderData: Partial<Order> & { user: string } = { // Use Partial<Order> for flexibility
      orderNumber,
      user: userIdToLink!, // userIdToLink is guaranteed to be defined at this point
      items: [
        {
          itemType: 'service',
          service: service.id,
          quantity: 1,
          price: servicePrice, // Price at time of order
        },
      ],
      total: servicePrice,
      currency: 'USD', // Default currency, can be adjusted based on locale if needed
      status: 'pending',
    }

    // 4. Create Order
    const newOrder = await payload.create({
      collection: 'orders',
      data: orderData as Order, // Cast to Order after ensuring all required fields are met
    })

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      userAuthenticated: !!authenticatedUser,
      userId: userIdToLink
    })
  } catch (error) {
    logError('Error initiating service order:', error)
    let message = 'Failed to initiate service order'
    if (error instanceof Error) message = error.message
    return NextResponse.json({ error: message }, { status: 500 })
  }
}