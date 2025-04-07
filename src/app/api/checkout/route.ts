import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { ServiceRegistry } from '@/services/service.registry'

export async function POST(req: Request) {
  try {
    const requestData = await req.json()
    const { products, customer, paymentMethod } = requestData

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products in cart' }, { status: 400 })
    }

    if (!customer || !customer.email) {
      return NextResponse.json({ error: 'Customer information is required' }, { status: 400 })
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 })
    }

    // Initialize payload client
    const payload = await getPayloadClient()

    // Получаем PaymentService через ServiceRegistry
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const paymentService = serviceRegistry.getPaymentService()

    // Create order in database
    const order = await payload.create({
      collection: 'orders',
      data: {
        products: products.map((p) => ({ product: p.id, quantity: p.quantity })),
        customer: customer.email,
        total: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
        status: 'pending',
        paymentMethod,
      },
    })

    // Generate payment link
    const paymentLink = await paymentService.generatePaymentLink(
      order.id,
      order.total,
      `Order #${order.id}`,
      paymentMethod,
    )

    return NextResponse.json({
      success: true,
      order: order.id,
      paymentLink,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 },
    )
  }
}
