import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { ServiceRegistry } from '@/services/service.registry'

export async function POST(req: Request) {
  try {
    const notification = await req.json()
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const paymentService = serviceRegistry.getPaymentService()

    // Verify the payment notification
    if (!(await paymentService.verifyYooMoneyPayment(notification))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Extract order ID from label
    const label = notification.label
    const orderId = label.split('_').pop()

    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    // Get the order
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('YooMoney notification handling error:', error)
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 })
  }
}
