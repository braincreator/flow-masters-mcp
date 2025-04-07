import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { verifyWebhookSignature } from '@/utilities/auth'
import { ServiceRegistry } from '@/services/service.registry'

export async function POST(req: Request) {
  try {
    // Verify webhook signature
    const signature = req.headers.get('x-webhook-signature')
    const body = await req.json()

    if (!verifyWebhookSignature(signature, JSON.stringify(body))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const integrationService = serviceRegistry.getIntegrationService()
    const { type, data } = body

    // Handle different webhook types
    switch (type) {
      case 'crm.contact.created':
        await payload.create({
          collection: 'contacts',
          data: {
            email: data.email,
            name: data.name,
            source: data.source,
            crmId: data.id,
          },
        })
        await integrationService.processEvent('contact.created', data)
        break

      case 'order.status.updated':
        await payload.update({
          collection: 'orders',
          where: { orderId: data.orderId },
          data: { status: data.status },
        })
        await integrationService.processEvent('order.updated', data)
        break

      // Add more webhook handlers as needed
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
