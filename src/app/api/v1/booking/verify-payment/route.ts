import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

export async function GET(request: NextRequest) {
  try {
    // Get the order ID from the query parameters
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Initialize Payload
    const payload = await getPayloadClient()

    // Get the order
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if the order is paid
    const isPaid = order.status === 'paid' || order.status === 'completed'

    // If the order is not paid, check with the payment service
    if (!isPaid && order.paymentId) {
      const serviceRegistry = ServiceRegistry.getInstance(payload)
      const paymentService = serviceRegistry.getPaymentService()

      // Get the payment provider from the order
      const paymentProvider = order.paymentProvider?.id || 'yoomoney'

      // Check the payment status
      const paymentStatus = await paymentService.checkPaymentStatus(
        paymentProvider,
        order.paymentId
      )

      // If the payment is completed but the order status is not updated,
      // update the order status
      if (paymentStatus.status === 'completed' || paymentStatus.status === 'paid') {
        await payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            status: 'paid',
          },
        })

        // Return verified status
        return NextResponse.json({ verified: true })
      }
    }

    // Return the verification status
    return NextResponse.json({ verified: isPaid })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment status' },
      { status: 500 }
    )
  }
}
