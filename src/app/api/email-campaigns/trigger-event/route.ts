import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { getServerSession } from '@/lib/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * API endpoint to trigger event-based email campaigns
 * POST /api/email-campaigns/trigger-event
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate using getServerSession
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user) {
      logError('Email campaigns trigger-event: User not authenticated')
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Check if user is admin
    if (!session.user.isAdmin && session.user.role !== 'admin') {
      logError('Email campaigns trigger-event: User not admin', {
        role: session.user.role,
        isAdmin: session.user.isAdmin,
      })
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    // Parse request body
    const body = await req.json()
    const { eventType, entityId, data } = body

    if (!eventType) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 })
    }

    // Initialize Payload
    const payload = await getPayloadClient()

    // Find campaigns that match this event type
    const campaigns = await payload.find({
      collection: 'email-campaigns',
      where: {
        and: [
          {
            status: {
              equals: 'active',
            },
          },
          {
            triggerType: {
              equals: 'event',
            },
          },
          {
            'eventTrigger.eventType': {
              equals: eventType,
            },
          },
        ],
      },
    })

    if (campaigns.docs.length === 0) {
      return NextResponse.json({
        message: 'No matching campaigns found for this event type',
        eventType,
      })
    }

    // Process each matching campaign
    const results = []

    for (const campaign of campaigns.docs) {
      try {
        // Check if there are additional conditions to match
        if (
          campaign.eventTrigger?.conditions &&
          Object.keys(campaign.eventTrigger.conditions).length > 0
        ) {
          // Implement condition matching logic here
          // For now, we'll just assume all conditions match
          // In a real implementation, you'd need to check if the data matches the conditions
        }

        // Calculate delay if needed
        const delay = campaign.eventTrigger?.delay || 0

        // If there's a delay, schedule the campaign for later
        if (delay > 0) {
          // Add a log entry about scheduling
          await payload.update({
            collection: 'email-campaigns',
            id: campaign.id,
            data: {
              logs: [
                ...(campaign.logs || []),
                {
                  timestamp: new Date().toISOString(),
                  message: `Event "${eventType}" triggered campaign with ${delay} hour delay. Entity ID: ${entityId || 'N/A'}`,
                  level: 'info',
                },
              ],
            },
          })

          // In a real implementation, you'd need to schedule this for later
          // For now, we'll just queue it immediately
        }

        // Queue the campaign job
        await payload.jobs.queue({
          task: 'email-campaign',
          input: {
            campaignId: campaign.id,
            eventData: {
              eventType,
              entityId,
              data,
            },
          },
        })

        // Update campaign status to processing
        await payload.update({
          collection: 'email-campaigns',
          id: campaign.id,
          data: {
            status: 'processing',
            lastRun: new Date().toISOString(),
          },
        })

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          status: 'queued',
        })
      } catch (error) {
        logError(`Error processing campaign ${campaign.id}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          status: 'error',
          error: errorMessage,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} campaigns for event type "${eventType}"`,
      results,
    })
  } catch (error) {
    logError('Error triggering event-based campaigns:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      { error: 'Failed to process event', details: errorMessage },
      { status: 500 },
    )
  }
}
