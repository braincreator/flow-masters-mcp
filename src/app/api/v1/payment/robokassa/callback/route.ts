import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    // Extract Robokassa parameters
    const invId = formData.get('InvId')?.toString() || ''
    const outSum = formData.get('OutSum')?.toString() || ''
    const signatureValue = formData.get('SignatureValue')?.toString() || ''

    if (!invId || !outSum || !signatureValue) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const paymentService = serviceRegistry.getPaymentService()

    // Verify payment signature
    if (
      !(await paymentService.verifyWebhook({
        provider: 'robokassa',
        data: {
          invId,
          outSum,
          signatureValue,
        },
      }))
    ) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Get the order
    const order = await payload.findByID({
      collection: 'orders',
      id: invId,
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Robokassa notification handling error:', error)
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 })
  }
}
