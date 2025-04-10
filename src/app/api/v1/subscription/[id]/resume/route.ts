import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { errorResponse } from '@/utilities/api'
import { verifyAuth } from '@/utilities/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify auth
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return auth.response
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
        return errorResponse('Unauthorized: You can only resume your own subscriptions', 403)
      }

      // Check if subscription can be resumed
      if (subscription.status !== 'paused') {
        return errorResponse(`Cannot resume subscription with status: ${subscription.status}`, 400)
      }

      // Calculate new next payment date based on when it was paused
      let nextPaymentDate = new Date() // Default to now
      if (subscription.metadata?.pausedAt) {
        // Get the paused date
        const pausedAt = new Date(subscription.metadata.pausedAt)

        // Calculate how many days were remaining on the subscription when it was paused
        const originalNextPayment = new Date(subscription.nextPaymentDate)
        const daysRemaining = Math.max(
          0,
          Math.floor((originalNextPayment.getTime() - pausedAt.getTime()) / (1000 * 60 * 60 * 24)),
        )

        // Add those remaining days to now
        nextPaymentDate = new Date()
        nextPaymentDate.setDate(nextPaymentDate.getDate() + daysRemaining)
      }

      // Update subscription status
      await payload.update({
        collection: 'subscriptions',
        id: subscriptionId,
        data: {
          status: 'active',
          nextPaymentDate: nextPaymentDate.toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            ...subscription.metadata,
            resumedAt: new Date().toISOString(),
            resumedBy: auth.user.id,
          },
        },
      })

      // TODO: If integrated with payment provider, call their API to resume subscription

      return NextResponse.json({
        success: true,
        message: 'Subscription resumed successfully',
        nextPaymentDate: nextPaymentDate.toISOString(),
      })
    } catch (error) {
      console.error('Error resuming subscription:', error)

      // In development, just return success for testing
      if (process.env.NODE_ENV === 'development') {
        const nextPaymentDate = new Date()
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30) // Add 30 days for mock

        return NextResponse.json({
          success: true,
          message: 'Subscription resumed successfully (mock)',
          nextPaymentDate: nextPaymentDate.toISOString(),
        })
      }

      return errorResponse('Failed to resume subscription', 500)
    }
  } catch (error) {
    console.error('Error in resume subscription route:', error)
    return errorResponse('Failed to process request', 500)
  }
}
