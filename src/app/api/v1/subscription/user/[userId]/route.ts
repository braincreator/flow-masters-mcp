import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { ServiceRegistry } from '@/services/service.registry'
import { errorResponse } from '@/utilities/api'
import { verifyAuth } from '@/utilities/auth'

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    // Verify auth and permissions
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow users to access their own subscriptions or admins to access any
    if (params.userId !== auth.user.id && !auth.user.isAdmin) {
      return errorResponse('Unauthorized: You can only view your own subscriptions', 403)
    }

    const userId = params.userId
    const payload = await getPayloadClient()

    try {
      // Find all subscriptions for this user
      const result = await payload.find({
        collection: 'subscriptions',
        where: {
          userId: {
            equals: userId,
          },
        },
        sort: '-createdAt', // Newest first
      })

      // Transform data for frontend
      const subscriptions = result.docs.map((subscription) => ({
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
      }))

      return NextResponse.json({
        success: true,
        subscriptions,
        totalSubscriptions: result.totalDocs,
      })
    } catch (error) {
      console.error('Error fetching user subscriptions:', error)

      // In development, return mock data
      if (process.env.NODE_ENV === 'development') {
        const mockSubscriptions = getMockSubscriptionsForUser(userId)
        return NextResponse.json({
          success: true,
          subscriptions: mockSubscriptions,
          totalSubscriptions: mockSubscriptions.length,
        })
      }

      throw error
    }
  } catch (error) {
    console.error('Error in subscription/user/[userId] route:', error)
    return errorResponse('Failed to fetch user subscriptions', 500)
  }
}

// Mock data for development
function getMockSubscriptionsForUser(userId: string) {
  const today = new Date()

  // Helper to add days to date
  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  return [
    {
      id: 'sub_123456',
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
    },
    {
      id: 'sub_654321',
      userId,
      planId: 'basic-plan',
      status: 'canceled',
      startDate: addDays(today, -90).toISOString(),
      endDate: addDays(today, -60).toISOString(),
      nextPaymentDate: addDays(today, -60).toISOString(),
      amount: 9.99,
      currency: 'USD',
      period: 'monthly',
      paymentMethod: 'card',
      paymentProviderId: 'pm_654321',
      metadata: {},
      createdAt: addDays(today, -90).toISOString(),
      updatedAt: addDays(today, -60).toISOString(),
    },
  ]
}
