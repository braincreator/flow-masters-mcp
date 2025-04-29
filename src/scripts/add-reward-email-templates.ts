import { getPayloadClient } from '@/utilities/payload/index'
import fs from 'fs'
import path from 'path'

/**
 * Script to add reward email templates to the database
 */
async function addRewardEmailTemplates() {
  try {
    console.log('Adding reward email templates to the database...')
    const payload = await getPayloadClient()

    // Get default sender
    const senders = await payload.find({
      collection: 'sender-emails',
      limit: 1,
    })

    if (senders.docs.length === 0) {
      console.error('No sender emails found. Please create a sender email first.')
      return
    }

    const defaultSender = senders.docs[0].id

    // Templates to add
    const templates = [
      {
        name: 'Общий шаблон награды',
        slug: 'reward-generic',
        subject: 'Вы получили награду!',
        templatePath: 'reward-generic.html',
      },
      {
        name: 'Шаблон награды - скидка',
        slug: 'reward-discount',
        subject: 'Вы получили скидку!',
        templatePath: 'reward-discount.html',
      },
      {
        name: 'Шаблон награды - бесплатный курс',
        slug: 'reward-free-course',
        subject: 'Вы получили бесплатный курс!',
        templatePath: 'reward-free-course.html',
      },
      {
        name: 'Шаблон награды - бейдж',
        slug: 'reward-badge',
        subject: 'Вы получили бейдж!',
        templatePath: 'reward-badge.html',
      },
      {
        name: 'Шаблон награды - сертификат',
        slug: 'reward-certificate',
        subject: 'Вы получили сертификат!',
        templatePath: 'reward-certificate.html',
      },
      {
        name: 'Шаблон награды - эксклюзивный контент',
        slug: 'reward-exclusive-content',
        subject: 'Вы получили доступ к эксклюзивному контенту!',
        templatePath: 'reward-exclusive-content.html',
      },
      {
        name: 'Шаблон напоминания о награде - 1',
        slug: 'reward-reminder-1',
        subject: 'Не забудьте использовать вашу награду!',
        templatePath: 'reward-reminder-1.html',
      },
      {
        name: 'Шаблон напоминания о награде - 2',
        slug: 'reward-reminder-2',
        subject: 'Последнее напоминание о вашей награде!',
        templatePath: 'reward-reminder-2.html',
      },
      {
        name: 'Шаблон истекающей награды',
        slug: 'reward-expiring',
        subject: 'Ваша награда скоро истечет!',
        templatePath: 'reward-expiring.html',
      },
    ]

    // Add each template
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
        console.log(`Template ${template.slug} already exists, skipping...`)
        continue
      }

      // Read template file
      const templatePath = path.resolve(__dirname, '../email-templates', template.templatePath)
      const templateContent = fs.readFileSync(templatePath, 'utf-8')

      // Create template
      await payload.create({
        collection: 'email-templates',
        data: {
          name: template.name,
          slug: template.slug,
          subject: template.subject,
          sender: defaultSender,
          body: templateContent,
        },
      })

      console.log(`Added template: ${template.slug}`)
    }

    console.log('All reward email templates added successfully!')
  } catch (error) {
    console.error('Error adding reward email templates:', error)
  }
}

// Run the script
addRewardEmailTemplates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
