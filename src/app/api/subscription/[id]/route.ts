import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { SubscriptionService } from '@/services/subscription'
import { UpdateSubscriptionParams } from '@/types/subscription'
import { errorResponse } from '@/utilities/api'
import { verifyAuth } from '@/utilities/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify auth
    const auth = await verifyAuth(req)
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
        return errorResponse('Unauthorized: You can only view your own subscriptions', 403)
      }

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          userId: subscription.userId,
          planId: subscription.planId,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          nextPaymentDate: subscription.nextPaymentDate,
          amount: subscription.amount,
          currency: subscription.currency,
          period: subscription.period,
          paymentMethod: subscription.paymentMethod,
          paymentProviderId: subscription.paymentProviderId,
          metadata: subscription.metadata,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        },
      })
    } catch (error) {
      console.error('Error fetching subscription:', error)

      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          subscription: getMockSubscription(subscriptionId, auth.user.id),
        })
      }

      return errorResponse('Subscription not found', 404)
    }
  } catch (error) {
    console.error('Error getting subscription:', error)
    return errorResponse('Failed to fetch subscription', 500)
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // Инициализация сервисов
    let payload
    try {
      payload = await getPayloadClient()
    } catch (error) {
      console.error('Failed to initialize Payload client:', error)
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
    }

    // Парсим данные запроса
    let updateData: UpdateSubscriptionParams
    try {
      updateData = await req.json()
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    const subscriptionService = new SubscriptionService(payload)
    const updatedSubscription = await subscriptionService.updateSubscription(id, updateData)

    if (!updatedSubscription) {
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Verify auth
    const auth = await verifyAuth(req)
    if (!auth.success) {
      return auth.response
    }

    const subscriptionId = params.id

    if (!subscriptionId) {
      return errorResponse('Subscription ID is required', 400)
    }

    // Get URL parameters
    const { searchParams } = new URL(req.url)
    const immediate = searchParams.get('immediate') === 'true'

    const payload = await getPayloadClient()

    // First, get the subscription to verify ownership
    try {
      const subscription = await payload.findByID({
        collection: 'subscriptions',
        id: subscriptionId,
      })

      // Ensure user has access to this subscription
      if (subscription.userId !== auth.user.id && !auth.user.isAdmin) {
        return errorResponse('Unauthorized: You can only cancel your own subscriptions', 403)
      }

      // Check if subscription is already canceled
      if (subscription.status === 'canceled') {
        return errorResponse('Subscription is already canceled', 400)
      }

      // Update subscription status
      const status = immediate ? 'canceled' : 'pending_cancellation'
      const endDate = immediate ? new Date().toISOString() : subscription.nextPaymentDate

      await payload.update({
        collection: 'subscriptions',
        id: subscriptionId,
        data: {
          status,
          endDate,
          updatedAt: new Date().toISOString(),
        },
      })

      // TODO: If integrated with payment provider, call their API to cancel subscription

      return NextResponse.json({
        success: true,
        message: immediate
          ? 'Subscription canceled immediately'
          : 'Subscription will be canceled at the end of the billing period',
      })
    } catch (error) {
      console.error('Error canceling subscription:', error)

      // In development, just return success for testing
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: immediate
            ? 'Subscription canceled immediately (mock)'
            : 'Subscription will be canceled at the end of the billing period (mock)',
        })
      }

      return errorResponse('Failed to cancel subscription', 500)
    }
  } catch (error) {
    console.error('Error in DELETE subscription route:', error)
    return errorResponse('Failed to process request', 500)
  }
}

// Mock data for development
function getMockSubscription(id: string, userId: string) {
  const today = new Date()

  // Helper to add days to date
  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  return {
    id,
    userId,
    planId: 'pro-plan',
    status: 'active',
    startDate: addDays(today, -30).toISOString(),
    nextPaymentDate: addDays(today, 30).toISOString(),
    amount: 29.99,
    currency: 'USD',
    period: 'monthly',
    paymentMethod: 'card',
    paymentProviderId: 'pm_123456',
    metadata: {},
    createdAt: addDays(today, -30).toISOString(),
    updatedAt: addDays(today, -30).toISOString(),
  }
}
