import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { PaymentService } from '@/services/payment.service'
import { OrderService } from '@/services/order.service'

export async function POST(req: Request) {
  try {
    const data = await req.formData()
    const invId = data.get('InvId') as string
    const outSum = data.get('OutSum') as string
    const signatureValue = data.get('SignatureValue') as string

    if (!paymentService.verifyRobokassaPayment(invId, outSum, signatureValue)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    
    // Update order status
    await payload.update({
      collection: 'orders',
      id: invId,
      data: {
        status: 'paid',
        paymentId: invId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Robokassa callback error:', error)
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 })
  }
}
