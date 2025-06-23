import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Scheduled job that checks for email campaigns that need to be run
 * This should be run periodically (e.g., every hour) to check for scheduled campaigns
 * @param payloadInstance Optional Payload instance (if not provided, will be initialized)
 */
export const checkScheduledEmailCampaigns = async (payloadInstance?: any) => {
  try {
    logDebug('Checking for scheduled email campaigns...')
    const payload = payloadInstance || (await getPayloadClient())

    // Get current date
    const now = new Date()

    // Find campaigns that are scheduled to run now
    const scheduledCampaigns = await payload.find({
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
              equals: 'schedule',
            },
          },
          {
            'schedule.startDate': {
              less_than_equal: now.toISOString(),
            },
          },
        ],
      },
    })

    logDebug(`Found ${scheduledCampaigns.docs.length} campaigns to process`)

    // Process each campaign
    for (const campaign of scheduledCampaigns.docs) {
      try {
        // Check if this is a recurring campaign or a one-time campaign
        const isRecurring = campaign.schedule?.frequency !== 'once'

        // For recurring campaigns, check if it's time to run again based on the last run
        if (isRecurring && campaign.lastRun) {
          const lastRun = new Date(campaign.lastRun)
          const nextRun = getNextRunDate(lastRun, campaign.schedule.frequency)

          // If it's not time to run yet, skip this campaign
          if (nextRun > now) {
            logDebug(`Campaign ${campaign.id} (${campaign.name}) is not due to run yet. Next run: ${nextRun.toISOString()}`,  )
            continue
          }

          // If there's an end date and we've passed it, skip this campaign
          if (campaign.schedule.endDate && new Date(campaign.schedule.endDate) < now) {
            logDebug(`Campaign ${campaign.id} (${campaign.name}) has ended. Updating status to completed.`,  )

            // Update campaign status to completed
            await payload.update({
              collection: 'email-campaigns',
              id: campaign.id,
              data: {
                status: 'completed',
                logs: [
                  ...(campaign.logs || []),
                  {
                    timestamp: new Date().toISOString(),
                    message: 'Campaign ended (end date reached)',
                    level: 'info',
                  },
                ],
              },
            })

            continue
          }
        }

        // Queue the campaign job
        logDebug(`Queueing campaign ${campaign.id} (${campaign.name})`)

        await payload.jobs.queue({
          task: 'email-campaign',
          input: {
            campaignId: campaign.id,
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

        // For one-time campaigns, update status to completed after queueing
        if (!isRecurring) {
          await payload.update({
            collection: 'email-campaigns',
            id: campaign.id,
            data: {
              status: 'completed',
              logs: [
                ...(campaign.logs || []),
                {
                  timestamp: new Date().toISOString(),
                  message: 'One-time campaign processed',
                  level: 'info',
                },
              ],
            },
          })
        }
      } catch (error) {
        logError(`Error processing campaign ${campaign.id}:`, error)

        // Update campaign status to error
        await payload.update({
          collection: 'email-campaigns',
          id: campaign.id,
          data: {
            status: 'error',
            logs: [
              ...(campaign.logs || []),
              {
                timestamp: new Date().toISOString(),
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                level: 'error',
              },
            ],
          },
        })
      }
    }

    logDebug('Finished checking scheduled email campaigns')
  } catch (error) {
    logError('Failed to check scheduled email campaigns:', error)
  }
}

/**
 * Calculate the next run date based on frequency
 */
function getNextRunDate(lastRun: Date, frequency: string): Date {
  const nextRun = new Date(lastRun)

  switch (frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1)
      break
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7)
      break
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1)
      break
    default:
      // For 'once' or unknown frequencies, set to a far future date
      nextRun.setFullYear(nextRun.getFullYear() + 100)
  }

  return nextRun
}
