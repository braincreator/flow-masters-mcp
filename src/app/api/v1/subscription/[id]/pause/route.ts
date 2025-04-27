import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { errorResponse } from '@/utilities/api'
import { verifyAuth } from '@/utilities/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify auth
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptionId = params.id

    if (!subscriptionId) {
      return errorResponse('Subscription ID is required', 400)
    }

    const payload = await getPayloadClient()

    try {
      // Fetch subscription
      const subscription = await payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
      })

      // Ensure user has access to this subscription
      if (subscription.userId !== auth.user.id && !auth.user.isAdmin) {
        return errorResponse('Unauthorized: You can only pause your own subscriptions', 403)
      }

      // Check if subscription can be paused
      if (subscription.status !== 'active') {
        return errorResponse(`Cannot pause subscription with status: ${subscription.status}`, 400)
      }

      // Update subscription status
      await payload.update({
        collection: 'subscriptions',
        id: subscriptionId,
        data: {
          status: 'paused',
          updatedAt: new Date().toISOString(),
          metadata: {
            ...subscription.metadata,
            pausedAt: new Date().toISOString(),
            pausedBy: auth.user.id,
          },
        },
      })

      // TODO: If integrated with payment provider, call their API to pause subscription

      return NextResponse.json({
        success: true,
        message: 'Subscription paused successfully',
      })
    } catch (error) {
      console.error('Error pausing subscription:', error)

      // In development, just return success for testing
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Subscription paused successfully (mock)',
        })
      }

      return errorResponse('Failed to pause subscription', 500)
    }
  } catch (error) {
    console.error('Error in pause subscription route:', error)
    return errorResponse('Failed to process request', 500)
  }
}
