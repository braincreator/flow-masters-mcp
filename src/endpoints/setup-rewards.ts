import { Endpoint, Payload, PayloadRequest } from 'payload'
// PayloadHandler import removed as Endpoint interface defines the handler type
import { Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { isAdmin } from '@/access/isAdmin'
import { EmailTemplate, EmailCampaign } from '../payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Endpoint to set up the reward system
 */
// Removed : Endpoint type annotation to allow inference
const setupRewardsEndpoint = {
  path: '/api/setup-rewards',
  method: 'post',
  handler: (async (req: PayloadRequest, res: Response, next: NextFunction) => {
    try {
      // Проверяем, что пользователь авторизован и является администратором
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized. Please log in.',
        })
      }

      // Проверяем, что пользователь имеет права администратора
      if (!isAdmin({ req })) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Admin access required.',
        })
      }
      // Продолжаем выполнение эндпоинта
      const payload = req.payload
      logDebug('Setting up reward system...')

      // Get default sender
      const senders = await payload.find({
        collection: 'sender-emails',
        limit: 1,
      })

      if (senders.docs.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No sender emails found. Please create a sender email first.',
        })
      }

      const defaultSender = senders.docs[0]!.id

      // Templates to add
      const templates = [
        {
          name: 'Общий шаблон награды',
          slug: 'reward-generic',
          subject: 'Вы получили награду!',
          templatePath: path.resolve(__dirname, '../email-templates/reward-generic.html'),
        },
        {
          name: 'Шаблон награды - скидка',
          slug: 'reward-discount',
          subject: 'Вы получили скидку!',
          templatePath: path.resolve(__dirname, '../email-templates/reward-discount.html'),
        },
        {
          name: 'Шаблон награды - бесплатный курс',
          slug: 'reward-free-course',
          subject: 'Вы получили бесплатный курс!',
          templatePath: path.resolve(__dirname, '../email-templates/reward-free-course.html'),
        },
        {
          name: 'Шаблон награды - бейдж',
          slug: 'reward-badge',
          subject: 'Вы получили бейдж!',
          templatePath: path.resolve(__dirname, '../email-templates/reward-badge.html'),
        },
        {
          name: 'Шаблон награды - сертификат',
          slug: 'reward-certificate',
          subject: 'Вы получили сертификат!',
          templatePath: path.resolve(__dirname, '../email-templates/reward-certificate.html'),
        },
        {
          name: 'Шаблон награды - эксклюзивный контент',
          slug: 'reward-exclusive-content',
          subject: 'Вы получили доступ к эксклюзивному контенту!',
          templatePath: path.resolve(__dirname, '../email-templates/reward-exclusive-content.html'),
        },
        {
          name: 'Шаблон напоминания о награде - 1',
          slug: 'reward-reminder-1',
          subject: 'Не забудьте использовать вашу награду!',
          templatePath: path.resolve(__dirname, '../email-templates/reward-reminder-1.html'),
        },
        {
          name: 'Шаблон напоминания о награде - 2',
          slug: 'reward-reminder-2',
          subject: 'Последнее напоминание о вашей награде!',
          templatePath: path.resolve(__dirname, '../email-templates/reward-reminder-2.html'),
        },
        {
          name: 'Шаблон истекающей награды',
          slug: 'reward-expiring',
          subject: 'Ваша награда скоро истечет!',
          templatePath: path.resolve(__dirname, '../email-templates/reward-expiring.html'),
        },
      ]

      // Add each template
      const createdTemplates: EmailTemplate[] = []
      const results = {
        templates: {
          created: 0,
          existing: 0,
        },
        campaigns: {
          created: 0,
          existing: 0,
        },
      }

      for (const template of templates) {
        // Check if template already exists
        const existingTemplate = await payload.find({
          collection: 'email-templates',
          where: {
            slug: {
              equals: template.slug,
            },
          },
        })

        if (existingTemplate.docs.length > 0) {
          logDebug(`Template ${template.slug} already exists, skipping...`)
          createdTemplates.push(existingTemplate.docs[0]!)
          results.templates.existing++
          continue
        }

        // Read template file
        let templateContent = ''
        try {
          templateContent = fs.readFileSync(template.templatePath, 'utf-8')
        } catch (error: unknown) {
          logError(`Error reading template file ${template.templatePath}:`, error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return res.status(500).json({
            success: false,
            message: `Error reading template file: ${errorMessage}`,
          })
        }

        // Create template
        const createdTemplate = await payload.create({
          collection: 'email-templates',
          data: {
            name: template.name,
            slug: template.slug,
            subject: template.subject,
            sender: defaultSender,
            body: templateContent,
          },
        })

        createdTemplates.push(createdTemplate)
        results.templates.created++
        logDebug(`Added template: ${template.slug}`)
      }

      logDebug('All reward email templates added successfully!')

      // Create campaign for reward.awarded event
      const awardedCampaign = {
        name: 'Награда получена - последовательность писем',
        description: 'Отправляет серию писем после получения награды для повышения вовлеченности',
        status: 'active' as const,
        triggerType: 'event' as const,
        eventTrigger: {
          eventType: 'reward.awarded' as any, // TODO: Add to EmailCampaign event types
          delay: 0,
          conditions: {},
        },
        targetAudience: {
          audienceType: 'event_related' as const,
        },
        emailSequence: [] as EmailCampaign['emailSequence'], // Initialize empty, will populate after checks
      }

      // Find templates and add to sequence, ensuring they exist
      const genericTemplate = createdTemplates.find((t) => t.slug === 'reward-generic')
      const reminder1Template = createdTemplates.find((t) => t.slug === 'reward-reminder-1')
      const reminder2Template = createdTemplates.find((t) => t.slug === 'reward-reminder-2')

      if (!genericTemplate || !reminder1Template || !reminder2Template) {
        throw new Error('Could not find all required templates for the awarded campaign sequence.')
      }

      awardedCampaign.emailSequence = [
        { template: genericTemplate.id, delay: 0 },
        {
          template: reminder1Template.id,
          delay: 72, // 3 days
          condition: { rewardStatus: 'active' },
        },
        {
          template: reminder2Template.id,
          delay: 168, // 7 days
          condition: { rewardStatus: 'active' },
        },
      ]

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
        results.campaigns.existing++
      } else {
        // Create campaign
        await payload.create({
          collection: 'email-campaigns',
          data: awardedCampaign,
        })

        results.campaigns.created++
        logDebug(`Added campaign: ${awardedCampaign.name}`)
      }

      // Create campaign for reward.expiring event
      const expiringCampaign = {
        name: 'Награда истекает - напоминание',
        description: 'Отправляет письмо, когда награда скоро истечет',
        status: 'active' as const,
        triggerType: 'event' as const,
        eventTrigger: {
          eventType: 'reward.expiring' as any, // TODO: Add to EmailCampaign event types
          delay: 0,
          conditions: {},
        },
        targetAudience: {
          audienceType: 'event_related' as const,
        },
        emailSequence: [] as EmailCampaign['emailSequence'], // Initialize empty, will populate after checks
      }

      // Find template and add to sequence, ensuring it exists
      const expiringTemplate = createdTemplates.find((t) => t.slug === 'reward-expiring')
      if (!expiringTemplate) {
        throw new Error('Could not find the required template for the expiring campaign sequence.')
      }
      expiringCampaign.emailSequence = [{ template: expiringTemplate.id, delay: 0 }]

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
        results.campaigns.existing++
      } else {
        // Create campaign
        await payload.create({
          collection: 'email-campaigns',
          data: expiringCampaign,
        })

        results.campaigns.created++
        logDebug(`Added campaign: ${expiringCampaign.name}`)
      }

      logDebug('All reward email campaigns added successfully!')
      logDebug('Reward system setup completed successfully!')

      return res.status(200).json({
        success: true,
        message: 'Reward system setup completed successfully!',
        results,
      })
    } catch (error: unknown) {
      logError('Error setting up reward system:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return res.status(500).json({
        success: false,
        message: `Error setting up reward system: ${errorMessage}`,
      })
    }
  }),
}

export default setupRewardsEndpoint
