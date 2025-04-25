import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { errorResponse } from '@/utilities/api'
import { verifyAuth } from '@/utilities/auth'

export async function POST(request: Request) {
  try {
    // Verify auth
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return auth.response
    }

    // Parse request data
    let requestData
    try {
      requestData = await request.json()
    } catch (error) {
      return errorResponse('Invalid request format', 400)
    }

    // Validate required fields
    if (!requestData.planId) {
      return errorResponse('Plan ID is required', 400)
    }

    // Use authenticated user ID if not specified
    const userId = requestData.userId || auth.user.id

    // If a different user ID is specified, ensure the requester is an admin
    if (userId !== auth.user.id && !auth.user.isAdmin) {
      return errorResponse('Unauthorized: You can only create subscriptions for yourself', 403)
    }

    // Get payment method/provider details
    const paymentProvider = requestData.paymentProvider || 'yoomoney'
    const paymentMethod = requestData.paymentMethod || 'card'

    try {
      const payload = await getPayloadClient()

      // First, get the subscription plan to verify it exists and is active
      let plan
      try {
        plan = await payload.findByID({
          collection: 'subscription-plans',
          id: requestData.planId,
        })

        if (!plan.isActive) {
          return errorResponse('Selected subscription plan is not active', 400)
        }
      } catch (error) {
        return errorResponse('Subscription plan not found', 404)
      }

      // Calculate dates
      const today = new Date()
      const startDate = requestData.startDate ? new Date(requestData.startDate) : today

      // Calculate next payment date based on period
      let nextPaymentDate = new Date(startDate)
      switch (plan.period) {
        case 'daily':
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 1)
          break
        case 'weekly':
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 7)
          break
        case 'monthly':
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
          break
        case 'quarterly':
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 3)
          break
        case 'annual':
          nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1)
          break
      }

      // Apply trial period if available
      if (plan.trialDays && plan.trialDays > 0) {
        nextPaymentDate = new Date(startDate)
        nextPaymentDate.setDate(nextPaymentDate.getDate() + plan.trialDays)
      }

      // Create subscription in database
      const subscription = await payload.create({
        collection: 'subscriptions',
        data: {
          userId,
          planId: requestData.planId,
          status: 'pending',
          paymentProvider,
          paymentMethod,
          paymentToken: requestData.paymentToken,
          period: plan.period,
          amount: plan.price,
          currency: plan.currency,
          startDate: startDate.toISOString(),
          nextPaymentDate: nextPaymentDate.toISOString(),
          metadata: {
            ...requestData.metadata,
            createdBy: auth.user.id,
            trialDays: plan.trialDays,
          },
        },
      })

      // For development environment, simulate successful payment
      if (process.env.NODE_ENV === 'development') {
        // Update subscription to active
        await payload.update({
          collection: 'subscriptions',
          id: subscription.id,
          data: {
            status: 'active',
          },
        })

        // Create a mock payment record
        await payload.create({
          collection: 'subscription-payments',
          data: {
            subscriptionId: subscription.id,
            amount: plan.price,
            currency: plan.currency,
            status: 'successful',
            paymentDate: new Date().toISOString(),
            paymentMethod,
            transactionId: `mock_${Date.now()}`,
          },
        })

        return NextResponse.json({
          success: true,
          subscription: {
            ...subscription,
            status: 'active',
          },
          message: 'Subscription created and activated successfully (mock payment)',
        })
      }

      // In production, redirect to payment provider or return subscription info
      return NextResponse.json({
        success: true,
        subscription,
        message: 'Subscription created successfully, pending payment',
      })
    } catch (error) {
      console.error('Error creating subscription:', error)
      return errorResponse('Failed to create subscription', 500)
    }
  } catch (error) {
    console.error('Error in subscription creation route:', error)
    return errorResponse('Failed to process request', 500)
  }
}
