import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { getServerSession } from '@/lib/auth'

/**
 * API endpoint to check the status of an email campaign
 * GET /api/v1/email-campaigns/status?id=campaignId
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate using getServerSession
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user) {
      console.error('Email campaigns status: User not authenticated')
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Check if user is admin
    if (!session.user.isAdmin && session.user.role !== 'admin') {
      console.error('Email campaigns status: User not admin', {
        role: session.user.role,
        isAdmin: session.user.isAdmin,
      })
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    // Get campaign ID from query params
    const url = new URL(req.url)
    const campaignId = url.searchParams.get('id')

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Initialize Payload
    const payload = await getPayloadClient()

    // Get campaign
    const campaign = await payload.findByID({
      collection: 'email-campaigns',
      id: campaignId,
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Return campaign status
    return NextResponse.json({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      lastRun: campaign.lastRun,
      stats: campaign.stats,
      recentLogs: campaign.logs?.slice(-5) || [],
    })
  } catch (error) {
    console.error('Error checking email campaign status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      { error: 'Failed to check campaign status', details: errorMessage },
      { status: 500 },
    )
  }
}

/**
 * API endpoint to get a list of all email campaigns
 * GET /api/v1/email-campaigns/status/all
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Authenticate the request
  const auth = await authenticateRequest(req)
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
  }

  try {
    // Parse request body for filters
    const body = await req.json()
    const { status, limit = 10, page = 1 } = body

    // Initialize Payload
    const payload = await getPayloadClient()

    // Build query
    const query: any = {}
    if (status) {
      query.status = {
        equals: status,
      }
    }

    // Get campaigns
    const campaigns = await payload.find({
      collection: 'email-campaigns',
      where: query,
      limit,
      page,
      sort: '-createdAt',
    })

    // Return campaigns list
    return NextResponse.json({
      campaigns: campaigns.docs.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        triggerType: campaign.triggerType,
        lastRun: campaign.lastRun,
        stats: campaign.stats,
      })),
      totalDocs: campaigns.totalDocs,
      totalPages: campaigns.totalPages,
      page: campaigns.page,
    })
  } catch (error) {
    console.error('Error listing email campaigns:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      { error: 'Failed to list campaigns', details: errorMessage },
      { status: 500 },
    )
  }
}
