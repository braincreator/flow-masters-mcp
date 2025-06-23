import { getPayloadClient } from '../utilities/payload/index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Script to add reward email campaign to the database
 */
async function addRewardEmailCampaign() {
  try {
    logDebug('Adding reward email campaign to the database...')
    const payload = await getPayloadClient()

    // Check if templates exist
    const templates = await payload.find({
      collection: 'email-templates',
      where: {
        slug: {
          in: ['reward-generic', 'reward-reminder-1', 'reward-reminder-2', 'reward-expiring'],
        },
      },
    })

    if (templates.docs.length < 4) {
      logError(
        'Required email templates not found. Please run add-reward-email-templates.js first.',
      )
      return
    }

    // Create campaign for reward.awarded event
    const awardedCampaign = {
      name: 'Награда получена - последовательность писем',
      description: 'Отправляет серию писем после получения награды для повышения вовлеченности',
      status: 'active',
      triggerType: 'event',
      eventTrigger: {
        eventType: 'reward.awarded',
        delay: 0,
        conditions: {},
      },
      targetAudience: {
        audienceType: 'event_related',
      },
      emailSequence: [
        {
          template: templates.docs.find((t) => t.slug === 'reward-generic')?.id,
          delay: 0,
        },
        {
          template: templates.docs.find((t) => t.slug === 'reward-reminder-1')?.id,
          delay: 72, // 3 days
          condition: {
            rewardStatus: 'active',
          },
        },
        {
          template: templates.docs.find((t) => t.slug === 'reward-reminder-2')?.id,
          delay: 168, // 7 days
          condition: {
            rewardStatus: 'active',
          },
        },
      ],
    }

    // Check if campaign already exists
    const existingCampaign = await payload.find({
      collection: 'email-campaigns',
      where: {
        name: {
          equals: awardedCampaign.name,
        },
      },
    })

    if (existingCampaign.docs.length > 0) {
      console.log(`Campaign "${awardedCampaign.name}" already exists, skipping...`)
    } else {
      // Create campaign
      await payload.create({
        collection: 'email-campaigns',
        data: awardedCampaign,
      })

      logDebug(`Added campaign: ${awardedCampaign.name}`)
    }

    // Create campaign for reward.expiring event
    const expiringCampaign = {
      name: 'Награда истекает - напоминание',
      description: 'Отправляет письмо, когда награда скоро истечет',
      status: 'active',
      triggerType: 'event',
      eventTrigger: {
        eventType: 'reward.expiring',
        delay: 0,
        conditions: {},
      },
      targetAudience: {
        audienceType: 'event_related',
      },
      emailSequence: [
        {
          template: templates.docs.find((t) => t.slug === 'reward-expiring')?.id,
          delay: 0,
        },
      ],
    }

    // Check if campaign already exists
    const existingExpiringCampaign = await payload.find({
      collection: 'email-campaigns',
      where: {
        name: {
          equals: expiringCampaign.name,
        },
      },
    })

    if (existingExpiringCampaign.docs.length > 0) {
      console.log(`Campaign "${expiringCampaign.name}" already exists, skipping...`)
    } else {
      // Create campaign
      await payload.create({
        collection: 'email-campaigns',
        data: expiringCampaign,
      })

      logDebug(`Added campaign: ${expiringCampaign.name}`)
    }

    logDebug('All reward email campaigns added successfully!')
  } catch (error) {
    logError('Error adding reward email campaigns:', error)
  }
}

// Run the script
addRewardEmailCampaign()
  .then(() => process.exit(0))
  .catch((error) => {
    logError('Script failed:', error)
    process.exit(1)
  })
