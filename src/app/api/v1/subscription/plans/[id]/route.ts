import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { errorResponse } from '@/utilities/api'
import { getLocale } from '@/utilities/i18n'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const planId = params.id
    const locale = getLocale(request)

    if (!planId) {
      return errorResponse('Plan ID is required', 400)
    }

    const payload = await getPayloadClient()

    try {
      // Fetch subscription plan
      const plan = await payload.findByID({
        collection: 'subscription-plans',
        id: planId,
        locale,
      })

      return NextResponse.json({
        success: true,
        plan: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          period: plan.period,
          features: plan.features || [],
          isActive: plan.isActive,
          trialDays: plan.trialDays,
          metadata: plan.metadata,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        },
      })
    } catch (error) {
      // If plan not found or other error, return mock data in dev environment
      if (process.env.NODE_ENV === 'development') {
        const mockPlan = getMockPlanById(planId)
        if (mockPlan) {
          return NextResponse.json({
            success: true,
            plan: mockPlan,
          })
        }
      }

      return errorResponse('Subscription plan not found', 404)
    }
  } catch (error) {
    console.error('Error fetching subscription plan:', error)
    return errorResponse('Failed to fetch subscription plan', 500)
  }
}

// Mock data for development without Payload CMS
function getMockPlanById(id: string) {
  const mockPlans = {
    'basic-plan': {
      id: 'basic-plan',
      name: 'Basic Plan',
      description: 'Essential features for small projects',
      price: 9.99,
      currency: 'USD',
      period: 'monthly',
      features: ['Up to 3 projects', '1GB storage', 'Email support'],
      isActive: true,
      trialDays: 14,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'pro-plan': {
      id: 'pro-plan',
      name: 'Pro Plan',
      description: 'Advanced features for growing teams',
      price: 29.99,
      currency: 'USD',
      period: 'monthly',
      features: [
        'Unlimited projects',
        '10GB storage',
        'Priority support',
        'Advanced analytics',
        'Custom domains',
      ],
      isActive: true,
      trialDays: 7,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'enterprise-plan': {
      id: 'enterprise-plan',
      name: 'Enterprise Plan',
      description: 'Complete solution for large organizations',
      price: 99.99,
      currency: 'USD',
      period: 'monthly',
      features: [
        'Unlimited everything',
        '100GB storage',
        '24/7 premium support',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
      ],
      isActive: true,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  return mockPlans[id as keyof typeof mockPlans]
}
