import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'
import type { User, Product, Order, Service } from '@/payload-types' // Added Service type

// Define interfaces for request bodies based on orderType
interface ProductOrderRequestBody {
  orderType: 'product' | 'subscription'
  products: Array<{ id: string; quantity: number; price: number }>
  customer: { email: string; name?: string }
  paymentMethod: string // Assuming this is the paymentProviderId
}

interface ServiceOrderRequestBody {
  orderType: 'service'
  serviceId: string
  customer: { email: string; name?: string }
  paymentMethod: string // Assuming this is the paymentProviderId
  // Add other service-specific fields if necessary, e.g., returnUrl, successUrl, failUrl
}

type UnifiedOrderRequestBody = ProductOrderRequestBody | ServiceOrderRequestBody

export async function POST(req: Request) {
  try {
    const requestData = (await req.json()) as UnifiedOrderRequestBody
    const { customer: customerInfo, paymentMethod } = requestData

    if (!customerInfo || !customerInfo.email) {
      return NextResponse.json({ error: 'Customer information is required' }, { status: 400 })
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method (paymentProviderId) is required' }, { status: 400 })
    }

    // Initialize payload client
    const payload = await getPayloadClient()

    // 1. Customer Identifier Handling (Common Logic)
    let user: User
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: customerInfo.email,
        },
      },
      limit: 1,
    })

    if (existingUsers.docs.length > 0) {
      user = existingUsers.docs[0]!
    } else {
      // Create new user
      user = await payload.create({
        collection: 'users',
        data: {
          email: customerInfo.email,
          name: customerInfo.name || customerInfo.email.split('@')[0],
          roles: ['customer'],
        },
      })
    }

    let order: Order
    let paymentLink: string | null
    let totalAmount: number // To be used for payment link generation and total field

    // Получаем PaymentService через ServiceRegistry (Common Logic)
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const paymentService = serviceRegistry.getPaymentService()

    if (requestData.orderType === 'service') {
      const { serviceId } = requestData as ServiceOrderRequestBody

      if (!serviceId) {
        return NextResponse.json({ error: 'Service ID is required for service orders' }, { status: 400 })
      }

      const service = await payload.findByID({
        collection: 'services',
        id: serviceId,
        depth: 0, // Assuming we don't need deep population here
      }) as Service // Cast to Service type

      if (!service) {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 })
      }

      // For simplicity, assuming service.price is the amount.
      // Add logic for partial_prepayment if needed, similar to the old route.
      totalAmount = service.price

      const orderData = {
        orderNumber: `SERV-${Date.now()}`, // Differentiate service order numbers
        customer: user.id,
        items: [
          {
            service: service.id,
            quantity: 1,
            price: totalAmount, // Price at time of order
            product: null, // Explicitly null for service items
          },
        ],
        total: {
          en: { amount: totalAmount, currency: 'USD' }, // Adapt currency/localization as needed
          ru: { amount: totalAmount * 90, currency: 'RUB' }, // Placeholder conversion
        },
        status: 'pending' as const,
        orderType: 'service' as const,
        paymentMethod: paymentMethod,
        serviceData: {
          serviceId: service.id,
          serviceType: service.serviceType,
          requiresBooking: service.requiresBooking,
          // Add other relevant service details from 'service' object if needed
        },
      }

      order = await payload.create({
        collection: 'orders',
        data: orderData,
        user: user,
      })

      paymentLink = await paymentService.generatePaymentLink(
        order.id,
        totalAmount,
        `Service Order: ${service.title || service.id}`,
        paymentMethod,
      )
    } else if (requestData.orderType === 'product' || requestData.orderType === 'subscription') {
      const { products: cartItems } = requestData as ProductOrderRequestBody

      if (!cartItems || cartItems.length === 0) {
        return NextResponse.json({ error: 'No products in cart for this order type' }, { status: 400 })
      }

      const orderItems = cartItems.map((item: { id: string; quantity: number; price: number }) => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      let determinedOrderType: 'product' | 'subscription' = 'product'
      const productIds = cartItems.map((item: { id: string }) => item.id)

      if (productIds.length > 0) {
        const productsDetails = await payload.find({
          collection: 'products',
          where: {
            id: {
              in: productIds,
            },
          },
          depth: 0,
        })

        for (const productDoc of productsDetails.docs as Product[]) {
          if (productDoc.productType === 'subscription') {
            determinedOrderType = 'subscription'
            break
          }
        }
      }
      // Ensure determinedOrderType matches requestData.orderType if provided, or default based on products
      // For this integration, we trust requestData.orderType if it's 'subscription'
      const finalOrderType = requestData.orderType === 'subscription' ? 'subscription' : determinedOrderType;


      totalAmount = cartItems.reduce(
        (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
        0,
      )

      const orderData = {
        orderNumber: `${finalOrderType.toUpperCase()}-${Date.now()}`,
        customer: user.id,
        items: orderItems,
        total: {
          en: { amount: totalAmount, currency: 'USD' },
          ru: { amount: totalAmount * 90, currency: 'RUB' },
        },
        status: 'pending' as const,
        orderType: finalOrderType,
        paymentMethod: paymentMethod,
      }

      order = await payload.create({
        collection: 'orders',
        data: orderData,
        user: user,
      })

      paymentLink = await paymentService.generatePaymentLink(
        order.id,
        totalAmount,
        `Order #${order.orderNumber || order.id}`,
        paymentMethod,
      )
    } else {
      // Handle unknown orderType
      // @ts-expect-error requestData might be an invalid type here
      const unknownOrderType = requestData.orderType
      return NextResponse.json({ error: `Invalid orderType: ${unknownOrderType}` }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentLink,
    })
  } catch (error) {
    console.error('Unified order endpoint error:', error)
    let errorMessage = 'An unknown error occurred'
    if (error instanceof Error) {
        errorMessage = error.message
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message)
    }
    // Log the full error object if it's not a standard Error instance for more details
    if (!(error instanceof Error)) {
        console.error('Non-Error object thrown:', error)
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    )
  }
}
