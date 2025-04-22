import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { authenticateRequest } from '@/utilities/auth'

/**
 * API endpoint to manually trigger an email campaign
 * POST /api/v1/email-campaigns/trigger
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Authenticate the request
  const auth = await authenticateRequest(req)
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
  }

  try {
    // Parse request body
    const body = await req.json()
    const { campaignId } = body

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

    // Check if campaign is in a state that can be triggered
    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      return NextResponse.json(
        { 
          error: 'Campaign cannot be triggered', 
          details: `Campaign is in ${campaign.status} state. Only draft or paused campaigns can be triggered.` 
        }, 
        { status: 400 }
      )
    }

    // Update campaign status to active
    await payload.update({
      collection: 'email-campaigns',
      id: campaignId,
      data: {
        status: 'active',
        logs: [
          ...(campaign.logs || []),
          {
            timestamp: new Date().toISOString(),
            message: 'Campaign manually triggered via API',
            level: 'info',
          },
        ],
      },
    })

    // For manual campaigns, this will trigger the afterChange hook which will queue the job
    // For scheduled campaigns, the next scheduled check will pick it up

    return NextResponse.json({
      success: true,
      message: 'Campaign triggered successfully',
      campaignId,
    })
  } catch (error) {
    console.error('Error triggering email campaign:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: 'Failed to trigger campaign', details: errorMessage },
      { status: 500 }
    )
  }
}
