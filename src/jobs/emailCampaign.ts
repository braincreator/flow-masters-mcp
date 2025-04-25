import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

interface EmailCampaignJobData {
  campaignId: string
  eventData?: {
    eventType: string
    entityId?: string
    data?: Record<string, unknown>
  }
}

// Define the campaign type to avoid TypeScript errors
interface EmailCampaign {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'processing' | 'completed' | 'paused' | 'error'
  triggerType: 'manual' | 'schedule' | 'event'
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly'
    startDate: string
    endDate?: string
  }
  eventTrigger?: {
    eventType: string
    delay?: number
    conditions?: Record<string, unknown>
  }
  targetAudience?: {
    audienceType: 'all_subscribers' | 'user_segment' | 'user_filter' | 'event_related'
    segment?: string
    filter?: Record<string, unknown>
    locale?: string
  }
  emailSequence: Array<{
    template: string | { id: string; slug: string }
    delay?: number
    condition?: Record<string, unknown>
  }>
  lastRun?: string
  stats?: {
    totalSent: number
    opened?: number
    clicked?: number
    bounced?: number
    unsubscribed?: number
  }
  logs?: Array<{
    timestamp: string
    message: string
    level: 'info' | 'warning' | 'error' | 'success'
  }>
}

/**
 * Job that processes email campaigns
 */
export const processEmailCampaign = async (data: EmailCampaignJobData) => {
  try {
    console.log(`Running email campaign job for campaign ID: ${data.campaignId}`)
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const emailService = serviceRegistry.getEmailService()

    // Get campaign data
    const campaignData = (await payload.findByID({
      collection: 'email-campaigns',
      id: data.campaignId,
      depth: 2, // Load related entities like templates
    })) as unknown as EmailCampaign

    // Cast to our interface to avoid TypeScript errors
    const campaign = campaignData

    if (!campaign) {
      console.error(`Campaign with ID ${data.campaignId} not found`)
      return
    }

    // Log start of campaign processing
    await addCampaignLog(payload, data.campaignId, 'info', `Starting campaign processing`)

    // Get target audience
    const targetAudience = campaign.targetAudience
    let recipients: Array<{ id: string; email: string; name?: string; locale?: string }> = []

    // Process audience based on type
    switch (targetAudience?.audienceType) {
      case 'all_subscribers':
        recipients = await getAllSubscribers(payload, targetAudience.locale)
        break
      case 'user_segment':
        if (targetAudience.segment) {
          recipients = await getUsersFromSegment(
            payload,
            targetAudience.segment,
            targetAudience.locale,
          )
        }
        break
      case 'user_filter':
        if (targetAudience.filter) {
          recipients = await getUsersByFilter(payload, targetAudience.filter, targetAudience.locale)
        }
        break
      case 'event_related':
        // Handle event-related audience
        if (data.eventData) {
          recipients = await getEventRelatedRecipients(
            payload,
            data.eventData,
            targetAudience.locale,
          )
        } else {
          await addCampaignLog(
            payload,
            data.campaignId,
            'warning',
            `Event-related audience requires event data, which was not provided`,
          )
        }
        break
      default:
        await addCampaignLog(
          payload,
          data.campaignId,
          'error',
          `Unknown audience type: ${targetAudience?.audienceType}`,
        )
        return
    }

    // Log number of recipients
    await addCampaignLog(
      payload,
      data.campaignId,
      'info',
      `Found ${recipients.length} recipients for campaign`,
    )

    // Process email sequence
    if (!campaign.emailSequence || campaign.emailSequence.length === 0) {
      await addCampaignLog(
        payload,
        data.campaignId,
        'error',
        `No email sequence defined for campaign`,
      )

      // Update campaign status to error
      await payload.update({
        collection: 'email-campaigns',
        id: data.campaignId,
        data: {
          status: 'error',
          logs: [
            ...(campaign.logs || []),
            {
              timestamp: new Date().toISOString(),
              message: 'Campaign failed: No email sequence defined',
              level: 'error',
            },
          ],
        },
      })

      return
    }

    // For now, we'll just process the first email in the sequence
    // In a real implementation, you'd need to handle delays and conditions
    const firstEmail = campaign.emailSequence[0]

    if (!firstEmail || !firstEmail.template) {
      await addCampaignLog(payload, data.campaignId, 'error', `Invalid email template in sequence`)
      return
    }

    // Get template details
    const templateId =
      typeof firstEmail.template === 'object' ? firstEmail.template.id : firstEmail.template
    const template = await payload.findByID({
      collection: 'email-templates',
      id: templateId,
    })

    if (!template) {
      await addCampaignLog(
        payload,
        data.campaignId,
        'error',
        `Template with ID ${templateId} not found`,
      )
      return
    }

    // Send emails to all recipients
    let successCount = 0
    let failureCount = 0

    for (const recipient of recipients) {
      try {
        // Prepare data for template
        const templateData = {
          recipient: {
            email: recipient.email,
            name: recipient.name || '',
            id: recipient.id,
          },
          campaign: {
            id: campaign.id,
            name: campaign.name,
          },
          // Add any other data needed for the template
        }

        // Send email using template
        const result = await emailService.sendTemplateEmail(
          template.slug,
          recipient.email,
          templateData,
          {
            locale: recipient.locale || targetAudience.locale || 'ru',
          },
        )

        if (result) {
          successCount++
        } else {
          failureCount++
          await addCampaignLog(
            payload,
            data.campaignId,
            'warning',
            `Failed to send email to ${recipient.email}`,
          )
        }
      } catch (error) {
        failureCount++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await addCampaignLog(
          payload,
          data.campaignId,
          'error',
          `Error sending email to ${recipient.email}: ${errorMessage}`,
        )
      }
    }

    // Update campaign stats
    await payload.update({
      collection: 'email-campaigns',
      id: data.campaignId,
      data: {
        status: failureCount === recipients.length ? 'error' : 'completed',
        stats: {
          ...(campaign.stats || {}),
          totalSent: (campaign.stats?.totalSent || 0) + successCount,
        },
        logs: [
          ...(campaign.logs || []),
          {
            timestamp: new Date().toISOString(),
            message: `Campaign completed. Sent: ${successCount}, Failed: ${failureCount}`,
            level: successCount > 0 ? 'success' : 'error',
          },
        ],
      },
    })

    console.log(`Email campaign job completed for campaign ID: ${data.campaignId}`)
  } catch (error) {
    console.error('Failed to process email campaign:', error)
  }
}

/**
 * Get recipients related to an event
 */
async function getEventRelatedRecipients(
  payload: any,
  eventData: {
    eventType: string
    entityId?: string
    data?: Record<string, unknown>
  },
  locale = '',
): Promise<Array<{ id: string; email: string; name?: string; locale?: string }>> {
  try {
    const { eventType, entityId } = eventData
    console.log(`Getting recipients for event ${eventType} with entity ID ${entityId || 'N/A'}`)

    // Handle different event types
    switch (eventType) {
      case 'user.registered':
        // Get the user who registered
        if (entityId) {
          const user = await payload.findByID({
            collection: 'users',
            id: entityId,
          })

          if (user && user.email) {
            return [
              {
                id: user.id,
                email: user.email,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
                locale: user.locale || locale,
              },
            ]
          }
        }
        break

      case 'order.created':
      case 'order.status.updated':
        // Get the user who placed the order
        if (entityId) {
          const order = await payload.findByID({
            collection: 'orders',
            id: entityId,
            depth: 1, // To get user information
          })

          if (order && order.user) {
            const userId = typeof order.user === 'object' ? order.user.id : order.user
            const user =
              typeof order.user === 'object'
                ? order.user
                : await payload.findByID({
                    collection: 'users',
                    id: userId,
                  })

            if (user && user.email) {
              return [
                {
                  id: user.id,
                  email: user.email,
                  name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
                  locale: user.locale || locale,
                },
              ]
            }
          } else if (order && order.customer && order.customer.email) {
            // Handle guest checkout
            return [
              {
                id: `guest-${order.id}`,
                email: order.customer.email,
                name: order.customer.name || undefined,
                locale,
              },
            ]
          }
        }
        break

      case 'newsletter.subscribed':
        // Get the subscriber
        if (entityId) {
          const subscriber = await payload.findByID({
            collection: 'newsletter-subscribers',
            id: entityId,
          })

          if (subscriber && subscriber.email) {
            return [
              {
                id: subscriber.id,
                email: subscriber.email,
                name: subscriber.name || undefined,
                locale: subscriber.locale || locale,
              },
            ]
          }
        }
        break

      case 'cart.abandoned':
        // Get the user with an abandoned cart
        if (entityId) {
          const cartSession = await payload.findByID({
            collection: 'cart-sessions',
            id: entityId,
          })

          if (cartSession && cartSession.email) {
            return [
              {
                id: `cart-${cartSession.id}`,
                email: cartSession.email,
                name: cartSession.customerName || undefined,
                locale,
              },
            ]
          }
        }
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
        break
    }

    // If we couldn't find any recipients or the event type is not handled
    return []
  } catch (error) {
    console.error('Error getting event-related recipients:', error)
    return []
  }
}

/**
 * Add a log entry to the campaign
 */
async function addCampaignLog(payload: any, campaignId: string, level: string, message: string) {
  try {
    const campaign = await payload.findByID({
      collection: 'email-campaigns',
      id: campaignId,
    })

    await payload.update({
      collection: 'email-campaigns',
      id: campaignId,
      data: {
        logs: [
          ...(campaign.logs || []),
          {
            timestamp: new Date().toISOString(),
            message,
            level,
          },
        ],
      },
    })
  } catch (error) {
    console.error(`Failed to add log to campaign ${campaignId}:`, error)
  }
}

/**
 * Get all active newsletter subscribers
 */
async function getAllSubscribers(
  payload: any,
  locale = '',
): Promise<Array<{ id: string; email: string; name?: string; locale?: string }>> {
  const query: any = {
    status: {
      equals: 'active',
    },
  }

  if (locale) {
    query.locale = {
      equals: locale,
    }
  }

  const subscribers = await payload.find({
    collection: 'newsletter-subscribers',
    where: query,
  })

  return subscribers.docs.map((subscriber: any) => ({
    id: subscriber.id,
    email: subscriber.email,
    name: subscriber.name,
    locale: subscriber.locale,
  }))
}

/**
 * Get users from a segment
 */
async function getUsersFromSegment(_payload: any, segmentId: string, locale = '') {
  // This would require implementing the segment logic
  // For now, we'll just return an empty array
  console.log(`Getting users from segment ${segmentId} with locale ${locale || 'any'}`)
  return []
}

/**
 * Get users by filter
 */
async function getUsersByFilter(_payload: any, _filter: Record<string, unknown>, locale = '') {
  // This would require implementing the filter logic
  // For now, we'll just return an empty array
  console.log(`Getting users by filter with locale ${locale || 'any'}`)
  return []
}
