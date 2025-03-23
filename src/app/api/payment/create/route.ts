import { NextResponse } from 'next/server'
import { paymentService } from '@/services/payment'
import { getPayloadClient } from '@/utilities/payload/getPayload'

export async function POST(req: Request) {
  try {
    const {
      orderId,
      amount,
      currency,
      description,
      provider,
      customerEmail,
    } = await req.json()

    // Validate the order exists and is in correct state
    const payload = await getPayloadClient()
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      )
    }

    const result = await paymentService.createPayment({
      orderId,
      amount,
      currency,
      description,
      provider,
      customerEmail,
      metadata: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
      },
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Update order with payment details
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        paymentProvider: provider,
        paymentId: result.paymentId,
        status: 'processing',
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    )
  }
}