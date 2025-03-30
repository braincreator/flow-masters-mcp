import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { PaymentService } from '@/services/payment'

export async function GET(req: NextRequest) {
  try {
    // Initialize services
    let payload
    try {
      payload = await getPayloadClient()
    } catch (error) {
      console.error('Failed to initialize Payload client:', error)
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // Extract query parameters
    const url = new URL(req.url)
    const orderId = url.searchParams.get('orderId')
    const paymentId = url.searchParams.get('paymentId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Fetch order details
    let order
    try {
      order = await payload.findByID({
        collection: 'orders',
        id: orderId,
      })
    } catch (error) {
      console.error('Failed to fetch order:', error)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check payment status
    let paymentStatus = order.status

    // If order status is still pending or processing, try to check with payment provider
    if (paymentStatus === 'pending' || paymentStatus === 'processing') {
      try {
        const paymentService = new PaymentService(payload)
        const provider = order.paymentProvider

        if (provider && paymentId) {
          const checkResult = await paymentService.checkPaymentStatus(provider, paymentId)

          // Update order status if payment status has changed
          if (checkResult.status !== paymentStatus) {
            await payload.update({
              collection: 'orders',
              id: orderId,
              data: {
                status: checkResult.status,
                transactionId: paymentId,
                paidAt: checkResult.status === 'paid' ? new Date().toISOString() : order.paidAt,
              },
            })

            paymentStatus = checkResult.status
          }
        }
      } catch (error) {
        console.error('Failed to check payment status with provider:', error)
        // Don't fail the request, just use the stored status
      }
    }

    // Return order status information
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: paymentStatus,
      message: getStatusMessage(paymentStatus),
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'paid':
    case 'completed':
      return 'Payment successful'
    case 'processing':
    case 'pending':
      return 'Payment is being processed'
    case 'failed':
      return 'Payment failed'
    case 'cancelled':
      return 'Payment was cancelled'
    case 'refunded':
      return 'Payment was refunded'
    default:
      return 'Unknown payment status'
  }
}
