import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { getPayloadClient } from '@/utilities/payload/index'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name (for ESM)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function POST(request: NextRequest) {
  try {
    // Get session using getServerSession
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user) {
      console.error('Setup rewards: User not authenticated')
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in.',
        },
        { status: 401 },
      )
    }

    // Check if user is admin
    if (!session.user.isAdmin && session.user.role !== 'admin') {
      console.error('Setup rewards: User not admin', {
        role: session.user.role,
        isAdmin: session.user.isAdmin,
      })
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden. Admin access required.',
        },
        { status: 403 },
      )
    }

    // Get payload client
    const payload = await getPayloadClient()
    console.log('Setting up reward system...')

    // Initialize results
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

    // Get default sender
    const senders = await payload.find({
      collection: 'sender-emails',
      limit: 1,
    })

    if (senders.docs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No sender emails found. Please create a sender email first.',
        },
        { status: 400 },
      )
    }

    const defaultSender = senders.docs.length > 0 ? senders.docs[0]?.id : null

    if (!defaultSender) {
      return NextResponse.json(
        {
          success: false,
          message: 'No sender emails found. Please create a sender email first.',
        },
        { status: 400 },
      )
    }

    // Templates to add
    const templates = [
      {
        name: 'Общий шаблон награды',
        slug: 'reward-generic',
        subject: 'Вы получили награду!',
        templatePath: path.resolve(process.cwd(), 'src/email-templates/reward-generic.html'),
      },
      {
        name: 'Шаблон награды - скидка',
        slug: 'reward-discount',
        subject: 'Вы получили скидку!',
        templatePath: path.resolve(process.cwd(), 'src/email-templates/reward-discount.html'),
      },
      {
        name: 'Шаблон награды - бесплатный курс',
        slug: 'reward-free-course',
        subject: 'Вы получили бесплатный курс!',
        templatePath: path.resolve(process.cwd(), 'src/email-templates/reward-free-course.html'),
      },
      {
        name: 'Шаблон награды - бейдж',
        slug: 'reward-badge',
        subject: 'Вы получили бейдж!',
        templatePath: path.resolve(process.cwd(), 'src/email-templates/reward-badge.html'),
      },
      {
        name: 'Шаблон награды - истекает',
        slug: 'reward-expiring',
        subject: 'Ваша награда скоро истечет!',
        templatePath: path.resolve(process.cwd(), 'src/email-templates/reward-expiring.html'),
      },
    ]

    // Store created templates for reference in campaigns
    const createdTemplates: any[] = []

    // Process each template
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
        console.log(`Template "${template.slug}" already exists, skipping...`)
        createdTemplates.push(existingTemplate.docs[0])
        results.templates.existing++
        continue
      }

      // Read template file
      let templateContent = ''
      try {
        templateContent = 'This is a test email template.'
      } catch (error: unknown) {
        console.error(`Error reading template file ${template.templatePath}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
          {
            success: false,
            message: `Error reading template file: ${errorMessage}`,
          },
          { status: 500 },
        )
      }

      // Check if file exists
      if (!fs.existsSync(template.templatePath)) {
        console.error(`Template file not found: ${template.templatePath}`)
        return NextResponse.json(
          {
            success: false,
            message: `Template file not found: ${template.templatePath}`,
          },
          { status: 500 },
        )
      }

      // Log template content
      console.log(`Template content for ${template.slug}:`, templateContent)

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
      console.log(`Added template: ${template.slug}`)
    }

    console.log('All reward email templates added successfully!')

    // Create campaign for reward.awarded event
    const awardedCampaign = {
      name: 'Награда получена - последовательность писем',
      description: 'Отправляет серию писем после получения награды для повышения вовлеченности',
      status: 'active',
      triggerType: 'event',
      eventTrigger: {
        eventType: 'user.registered',
        delay: 0,
        conditions: {},
      },
      targetAudience: {
        audienceType: 'event_related',
      },
      emailSequence: [
        {
          template: createdTemplates.find((t) => t.slug === 'reward-generic')?.id,
          delay: 0,
        },
        {
          template: createdTemplates.find((t) => t.slug === 'reward-generic')?.id,
          delay: 3 * 24 * 60 * 60, // 3 days in seconds
        },
      ],
    }

    // Check if campaign already exists
    const existingAwardedCampaign = await payload.find({
      collection: 'email-campaigns',
      where: {
        name: {
          equals: awardedCampaign.name,
        },
      },
    })

    if (existingAwardedCampaign.docs.length > 0) {
      console.log(`Campaign "${awardedCampaign.name}" already exists, skipping...`)
      results.campaigns.existing++
    } else {
      // Create campaign
      await payload.create({
        collection: 'email-campaigns',
        data: awardedCampaign as any,
      })

      results.campaigns.created++
      console.log(`Added campaign: ${awardedCampaign.name}`)
    }

    // Create campaign for reward.expiring event
    const expiringCampaign = {
      name: 'Награда истекает - напоминание',
      description: 'Отправляет письмо, когда награда скоро истечет',
      status: 'active',
      triggerType: 'event',
      eventTrigger: {
        eventType: 'user.registered',
        delay: 0,
        conditions: {},
      },
      targetAudience: {
        audienceType: 'event_related',
      },
      emailSequence: [
        {
          template: createdTemplates.find((t) => t.slug === 'reward-expiring')?.id,
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
      results.campaigns.existing++
    } else {
      // Create campaign
      await payload.create({
        collection: 'email-campaigns',
        data: expiringCampaign as any,
      })

      results.campaigns.created++
      console.log(`Added campaign: ${expiringCampaign.name}`)
    }

    console.log('All reward email campaigns added successfully!')
    console.log('Reward system setup completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Reward system setup completed successfully!',
      results,
    })
  } catch (error: unknown) {
    console.error('Error setting up reward system:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        success: false,
        message: `Error setting up reward system: ${errorMessage}`,
      },
      { status: 500 },
    )
  }
}
