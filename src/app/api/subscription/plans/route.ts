import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { errorResponse } from '@/utilities/api'
import { getLocale } from '@/utilities/i18n'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface WhereCondition {
  equals?: boolean | string | number
  not_equals?: boolean | string | number
  in?: (string | number)[]
  not_in?: (string | number)[]
  exists?: boolean
  greater_than?: number
  greater_than_equal?: number
  less_than?: number
  less_than_equal?: number
  like?: string
  contains?: string
}

type QueryWhere = Record<string, WhereCondition>

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = getLocale(request)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    const payload = await getPayloadClient()

    // Construct query for Payload CMS
    const query = {
      limit,
      page,
      sort: 'price' as const,
      where: {} as QueryWhere,
    }

    // Filter by active status if specified
    if (status === 'active') {
      query.where.isActive = { equals: true }
    }

    // Filter by category if specified (for AI Agency plans)
    if (category) {
      query.where['metadata.category'] = { equals: category }
    }

    // Fetch subscription plans with localized fields
    const result = await payload.find({
      collection: 'subscription-plans',
      locale: locale as 'en' | 'ru' | 'all',
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
      trialPeriodDays: plan.trialPeriodDays, // Исправлено: было trialDays
      maxSubscriptionMonths: plan.maxSubscriptionMonths,
      autoRenew: plan.autoRenew,
      allowCancel: plan.allowCancel,
      metadata: plan.metadata,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: {
        docs: plans,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        page: result.page,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
      // Для обратной совместимости
      plans,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    })
  } catch (error) {
    logError('Error fetching subscription plans:', error)
    return errorResponse('Failed to fetch subscription plans', 500)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = await getPayloadClient()

    // Создаем новый план
    const result = await payload.create({
      collection: 'subscription-plans',
      data: body,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logError('Error creating subscription plan:', error)
    return errorResponse('Failed to create subscription plan', 500)
  }
}
