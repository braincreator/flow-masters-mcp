import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { errorResponse } from '@/utilities/api'
import { getLocale } from '@/utilities/i18n'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = getLocale(request)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    const payload = await getPayloadClient()

    // Construct query for Payload CMS
    const query: any = {
      limit,
      page,
      sort: 'price',
      where: {},
    }

    // Filter by active status if specified
    if (status === 'active') {
      query.where.isActive = { equals: true }
    }

    // Fetch subscription plans with localized fields
    const result = await payload.find({
      collection: 'subscription-plans',
      locale,
      ...query,
    })

    // Transform response to match the frontend needs
    const plans = result.docs.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      period: plan.period,
      features: plan.features || [],
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      trialDays: plan.trialDays,
      metadata: plan.metadata,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      plans,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    })
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return errorResponse('Failed to fetch subscription plans', 500)
  }
}

// Mock response for development (use when Payload CMS is not available)
function getMockSubscriptionPlans() {
  return [
    {
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
    {
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
    {
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
  ]
}
