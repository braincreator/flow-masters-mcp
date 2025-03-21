import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { paymentService } from '@/utilities/payments'

export async function POST(req: Request) {
  try {
    const { productIds, email, paymentMethod } = await req.json()
    const payload = await getPayloadClient()

    // Get products
    const products = await payload.find({
      collection: 'products',
      where: {
        id: {
          in: productIds,
        },
      },
    })

    // Calculate total
    const total = products.docs.reduce((sum, product) => sum + product.price, 0)

    // Create order
    const order = await payload.create({
      collection: 'orders',
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customer: email,
        items: products.docs.map(product => ({
          product: product.id,
          price: product.price,
        })),
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