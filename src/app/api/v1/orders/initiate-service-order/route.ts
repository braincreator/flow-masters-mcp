import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import type { User, Service, Order } from '@/payload-types' // Ensure Order is imported
// Removed import for getServerSideUser as its location/existence is problematic

interface InitiateServiceOrderRequestBody {
  serviceId: string
  locale: 'en' | 'ru' // Or your specific Locale type
  customerEmail?: string // Optional, if user is not logged in
  customerId?: string // Optional, if user is authenticated
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const body = (await request.json()) as InitiateServiceOrderRequestBody

    const { serviceId, locale, customerEmail, customerId } = body

    console.log('Received service order request:', { serviceId, locale, customerEmail, customerId })

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

    // First check if customerId is provided (user is authenticated)
    if (customerId) {
      console.log('Using provided customerId:', customerId)

      // Verify that the user exists
      try {
        const user = await payload.findByID({
          collection: 'users',
          id: customerId,
        })

        if (user) {
          userIdToLink = customerId
          console.log('Verified user exists with ID:', userIdToLink)
        } else {
          console.warn('Provided customerId does not exist:', customerId)
          // Fall back to email-based user lookup
        }
      } catch (error) {
        console.error('Error verifying customerId:', error)
        // Fall back to email-based user lookup
      }
    }

    // If no valid customerId, try to find or create user by email
    if (!userIdToLink && customerEmail) {
      console.log('Looking up user by email:', customerEmail)

      // Find or create guest user
      try {
        const existingUsers = await payload.find({
          collection: 'users',
          where: { email: { equals: customerEmail } },
          limit: 1,
        })

        if (existingUsers.docs.length > 0 && existingUsers.docs[0]) {
          userIdToLink = existingUsers.docs[0].id
          console.log('Found existing user by email with ID:', userIdToLink)
        } else {
          console.log('Creating new user with email:', customerEmail)

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
          console.log('Created new user with ID:', userIdToLink)
        }
      } catch (error) {
        console.error('Error finding/creating user by email:', error)
        throw new Error('Failed to find or create user account')
      }
    }

    // If we still don't have a user ID, we can't proceed
    if (!userIdToLink) {
      console.error('No user ID available - cannot create order without customer')
      return NextResponse.json({
        error: 'Customer information is required. Please provide either a customer ID or email.'
      }, { status: 400 })
    }


    // 3. Prepare Order Data
    const servicePrice = typeof service.price === 'number' ? service.price : 0
    const orderNumber = `SERV-INIT-${Date.now()}` // Unique order number

    // Ensure we have a valid customer ID before creating the order
    if (!userIdToLink) {
      console.error('Cannot create order without customer ID')
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    console.log('Creating order with customer ID:', userIdToLink)

    const orderData = { // Use a properly typed object
      orderNumber,
      customer: userIdToLink, // This is now guaranteed to be a valid user ID
      items: [
        {
          service: service.id,
          quantity: 1,
          price: servicePrice, // Price at time of order
          product: null, // Explicitly set product to null for service items
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
    console.log('Creating order with data:', JSON.stringify(orderData, null, 2))

    try {
      // Validate the order data before creating
      if (!orderData.customer) {
        throw new Error('Customer ID is required for order creation')
      }

      // Create the order
      const newOrder = await payload.create({
        collection: 'orders',
        data: orderData,
      })

      console.log('Order created successfully:', {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customer: typeof newOrder.customer === 'string' ? newOrder.customer : 'object'
      })

      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        orderNumber: orderNumber // Include the formatted order number in the response
      })
    } catch (createError) {
      console.error('Error creating order:', createError)
      let errorMessage = 'Failed to create service order'

      if (createError instanceof Error) {
        errorMessage = createError.message
        console.error('Error details:', errorMessage)

        // Check for specific error types
        if (errorMessage.includes('customer')) {
          errorMessage = 'Invalid customer information. Please check your account details.'
        } else if (errorMessage.includes('required')) {
          errorMessage = 'Missing required field in order data. Please check all required fields are provided.'
        }
      }

      // Return a proper error response
      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error initiating service order:', error)
    let message = 'Failed to initiate service order'
    if (error instanceof Error) message = error.message
    return NextResponse.json({ error: message }, { status: 500 })
  }
}