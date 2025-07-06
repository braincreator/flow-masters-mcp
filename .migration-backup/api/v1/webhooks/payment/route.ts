import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function POST(req: NextRequest) {
  try {
    // Initialize services
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const paymentService = serviceRegistry.getPaymentService()
    const notificationService = serviceRegistry.getNotificationService()

    // Parse the webhook data
    let webhookData
    try {
      webhookData = await req.json()
    } catch (error) {
      logError('Failed to parse webhook data:', error)
      return NextResponse.json({ error: 'Invalid webhook format' }, { status: 400 })
    }

    // Verify webhook authenticity
    try {
      const isValid = await paymentService.verifyWebhook(webhookData)
      if (!isValid) {
        logError('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 403 })
      }
    } catch (error) {
      logError('Error verifying webhook:', error)
      // Continue processing as some providers don't require verification
      // but log the error for monitoring
    }

    // Process the webhook data
    const { orderId, status, transactionId } = await paymentService.processWebhookData(webhookData)

    if (!orderId) {
      logError('No order ID found in webhook data')
      return NextResponse.json({ error: 'No order ID in webhook data' }, { status: 400 })
    }

    // Update order status in database
    let order
    try {
      order = await payload.findByID({
        collection: 'orders',
        id: orderId,
      })
    } catch (error) {
      logError(`Failed to find order ${orderId}:`, error)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order) {
      logError(`Order ${orderId} not found`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    try {
      await payload.update({
        collection: 'orders',
        id: orderId,
        data: {
          status,
          transactionId: transactionId || order.transactionId,
          paidAt: status === 'paid' ? new Date().toISOString() : order.paidAt,
        },
      })
    } catch (error) {
      logError(`Failed to update order ${orderId}:`, error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Send notification if payment is successful
    if (status === 'paid') {
      try {
        await notificationService.sendPaymentConfirmation({
          email: order.user?.email || order.user, // Handle both user reference and email string
          orderNumber: order.orderNumber,
          amount: order.total,
          items: order.items.map((item) => ({
            title: item.product?.title || 'Product',
            quantity: item.quantity,
            price: item.price,
          })),
        })
      } catch (error) {
        // Log but don't fail the webhook on notification error
        logError('Failed to send payment confirmation notification:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Webhook processing error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
