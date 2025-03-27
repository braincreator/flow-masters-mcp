import { paymentService } from '@/services/payment'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getPayloadClient } from '@/utilities/payload'
import { authOptions } from '@/utilities/auth'

export async function POST(req: Request) {
  try {
    const { items, customer, provider, returnUrl } = await req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    if (!customer?.email) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const session = await getServerSession(authOptions)

    // Set up the payment service with payload
    paymentService.setPayload(payload)

    // Find products
    const productIds = items.map((item) => item.productId)
    const products = await payload.find({
      collection: 'products',
      where: {
        id: {
          in: productIds,
        },
      },
    })

    if (products.docs.length === 0) {
      return NextResponse.json({ error: 'No valid products found' }, { status: 400 })
    }

    // Calculate order total
    let total = 0
    const orderItems = items
      .map((item) => {
        const product = products.docs.find((p) => p.id === item.productId)
        if (!product) return null

        const price = product.price || 0
        const subtotal = price * item.quantity
        total += subtotal

        return {
          product: item.productId,
          quantity: item.quantity,
          price,
        }
      })
      .filter(Boolean)

    // Create order
    const order = await payload.create({
      collection: 'orders',
      data: {
        orderNumber: `ORD-${Date.now()}`,
        user: session?.user?.id,
        items: orderItems,
        total,
        currency: customer.locale === 'ru' ? 'RUB' : 'USD',
        status: 'pending',
        paymentProvider: provider,
      },
    })

    // Create payment
    const result = await paymentService.createPayment({
      orderId: order.id,
      amount: total,
      description: `Order ${order.orderNumber}`,
      customer: {
        email: customer.email,
        name: customer.name,
      },
      currency: customer.locale === 'ru' ? 'RUB' : 'USD',
      locale: customer.locale || 'en',
      provider,
      returnUrl,
    })

    if (!result.success) {
      // Clean up created order
      await payload.delete({
        collection: 'orders',
        id: order.id,
      })

      return NextResponse.json(
        { error: result.error || 'Payment creation failed' },
        { status: 400 },
      )
    }

    // Update order with payment ID
    if (result.paymentId) {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          paymentId: result.paymentId,
        },
      })
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentUrl: result.paymentUrl,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment creation failed' },
      { status: 500 },
    )
  }
}
