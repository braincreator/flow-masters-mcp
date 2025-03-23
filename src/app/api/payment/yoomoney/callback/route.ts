import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { PaymentService } from '@/services/payment.service'
import { OrderService } from '@/services/order.service'

export async function POST(req: Request) {
  try {
    const notification = await req.json()
    
    if (!paymentService.verifyYooMoneyPayment(notification)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    
    // Update order status
    await payload.update({
      collection: 'orders',
      id: notification.label,
      data: {
        status: 'paid',
        paymentId: notification.operation_id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('YooMoney callback error:', error)
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 })
  }
}
