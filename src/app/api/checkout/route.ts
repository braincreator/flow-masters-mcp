import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { paymentService } from '@/utilities/payments'

export async function POST(req: Request) {
  try {
    const { items, email, paymentMethod } = await req.json()
    const payload = await getPayloadClient()

    // Get products with quantities
    const products = await payload.find({
      collection: 'products',
      where: {
        id: {
          in: items.map(item => item.id),
        },
      },
    })

    // Calculate total with quantities
    const total = items.reduce((sum, item) => {
      const product = products.docs.find(p => p.id === item.id)
      return sum + (product?.price || 0) * item.quantity
    }, 0)

    // Create order with quantities
    const order = await payload.create({
      collection: 'orders',
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customer: email,
        items: items.map(item => {
          const product = products.docs.find(p => p.id === item.id)
          return {
            product: item.id,
            quantity: item.quantity,
            price: product?.price || 0,
            subtotal: (product?.price || 0) * item.quantity
          }
        }),
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    })

    // Generate payment link based on selected method
    let paymentUrl
    const description = `Order ${order.orderNumber}`

    if (paymentMethod === 'yoomoney') {
      paymentUrl = paymentService.generateYooMoneyPaymentLink(
        order.id,
        total,
        description
      )
    } else if (paymentMethod === 'robokassa') {
      paymentUrl = paymentService.generateRobokassaPaymentLink(
        order.id,
        total,
        description
      )
    } else {
      throw new Error('Invalid payment method')
    }

    return NextResponse.json({
      paymentUrl,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
