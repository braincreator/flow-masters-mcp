/**
 * This is a simplified script to sync email templates to the CMS.
 * It doesn't try to generate HTML from code templates, but instead uses predefined HTML templates.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Define the templates to sync
const templates = [
  {
    name: 'Welcome Email',
    slug: 'welcome-email',
    description: 'Sent when a user subscribes to the newsletter or creates an account',
    subject: {
      en: 'Welcome to Flow Masters',
      ru: 'Добро пожаловать в Flow Masters',
    },
    templateType: 'auth',
    placeholders: 'name, email, unsubscribeToken, siteUrl',
  },
  {
    name: 'Password Reset',
    slug: 'password-reset',
    description: 'Sent when a user requests a password reset',
    subject: {
      en: 'Password Reset',
      ru: 'Сброс пароля',
    },
    templateType: 'auth',
    placeholders: 'name, email, resetToken, siteUrl',
  },
  {
    name: 'Unsubscribe Confirmation',
    slug: 'unsubscribe-confirmation',
    description: 'Sent when a user unsubscribes from the newsletter',
    subject: {
      en: 'You have successfully unsubscribed',
      ru: 'Вы успешно отписались от рассылки',
    },
    templateType: 'auth',
    placeholders: 'email, siteUrl',
  },
  {
    name: 'Course Enrollment',
    slug: 'course-enrollment',
    description: 'Sent when a user enrolls in a course',
    subject: {
      en: 'You\'ve successfully enrolled in "{{courseName}}"',
      ru: 'Вы успешно записаны на курс "{{courseName}}"',
    },
    templateType: 'courses',
    placeholders:
      'userName, email, courseName, courseId, courseUrl, isPaid, orderNumber, locale, siteUrl',
  },
  {
    name: 'Course Completion',
    slug: 'course-completion',
    description: 'Sent when a user completes a course',
    subject: {
      en: 'Congratulations on completing "{{courseName}}"!',
      ru: 'Поздравляем с завершением курса "{{courseName}}"!',
    },
    templateType: 'courses',
    placeholders:
      'userName, email, courseName, courseId, certificateId, certificateUrl, completionDate, nextCourseId, nextCourseName, locale, siteUrl',
  },
  {
    name: 'Course Progress',
    slug: 'course-progress',
    description: 'Sent when a user reaches a progress milestone in a course',
    subject: {
      en: '{{progressPercentage}}% completed in "{{courseName}}"',
      ru: '{{progressPercentage}}% пройдено в курсе "{{courseName}}"',
    },
    templateType: 'courses',
    placeholders:
      'userName, email, courseName, courseId, progressPercentage, nextLessonName, nextLessonUrl, remainingLessons, estimatedTimeToComplete, locale, siteUrl',
  },
  {
    name: 'Course Certificate',
    slug: 'course-certificate',
    description: 'Sent when a user receives a certificate for completing a course',
    subject: {
      en: 'Your certificate for "{{courseName}}"',
      ru: 'Ваш сертификат за курс "{{courseName}}"',
    },
    templateType: 'courses',
    placeholders:
      'userName, email, courseName, courseId, certificateId, certificateUrl, completionDate, instructorName, shareableUrl, locale, siteUrl',
  },
  {
    name: 'Order Confirmation',
    slug: 'order-confirmation',
    description: 'Sent when a user places an order',
    subject: {
      en: 'Order Confirmation #{{orderNumber}}',
      ru: 'Подтверждение заказа #{{orderNumber}}',
    },
    templateType: 'orders',
    placeholders:
      'userName, email, orderNumber, orderDate, items, subtotal, discount, tax, total, currency, paymentMethod, paymentStatus, billingAddress, invoiceUrl, locale, siteUrl',
  },
  {
    name: 'Payment Confirmation',
    slug: 'payment-confirmation',
    description: 'Sent when a payment is confirmed',
    subject: {
      en: 'Payment Confirmation for Order #{{orderNumber}}',
      ru: 'Подтверждение оплаты для заказа #{{orderNumber}}',
    },
    templateType: 'orders',
    placeholders:
      'userName, email, orderNumber, paymentDate, paymentAmount, currency, paymentMethod, transactionId, orderUrl, receiptUrl, purchasedItems, locale, siteUrl',
  },
  {
    name: 'Generic Reward',
    slug: 'reward-generic',
    description: 'Sent when a user receives a generic reward',
    subject: {
      en: "You've received a reward: {{rewardTitle}}",
      ru: 'Вы получили награду: {{rewardTitle}}',
    },
    templateType: 'rewards',
    placeholders:
      'userName, email, rewardTitle, rewardDescription, rewardType, rewardId, rewardCode, expiresAt, rewardUrl, locale, siteUrl',
  },
  {
    name: 'Discount Reward',
    slug: 'reward-discount',
    description: 'Sent when a user receives a discount reward',
    subject: {
      en: "You've received a discount: {{rewardTitle}}",
      ru: 'Вы получили скидку: {{rewardTitle}}',
    },
    templateType: 'rewards',
    placeholders:
      'userName, email, rewardTitle, rewardDescription, rewardType, rewardId, rewardCode, discountAmount, discountType, applicableTo, expiresAt, rewardUrl, locale, siteUrl',
  },
  {
    name: 'Free Course Reward',
    slug: 'reward-free-course',
    description: 'Sent when a user receives a free course reward',
    subject: {
      en: "You've received a free course: {{rewardTitle}}",
      ru: 'Вы получили бесплатный курс: {{rewardTitle}}',
    },
    templateType: 'rewards',
    placeholders:
      'userName, email, rewardTitle, rewardDescription, rewardType, rewardId, rewardCode, courseId, courseUrl, courseDuration, courseLevel, expiresAt, locale, siteUrl',
  },
]

// Sample HTML template
const sampleTemplate = `
<!DOCTYPE html>
<html lang="{{locale}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 0;
      background-color: #ffffff;
      border: 1px solid #eaeaea;
      border-radius: 5px;
      overflow: hidden;
    }
    .email-header {
      text-align: center;
      padding: 25px 20px;
      background-color: #f8f8f8;
      border-bottom: 1px solid #eaeaea;
    }
    .email-logo {
      max-width: 150px;
      height: auto;
    }
    .email-content {
      padding: 30px 30px;
    }
    .email-footer {
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
      background-color: #f8f8f8;
      border-top: 1px solid #eaeaea;
    }
    .button {
      display: inline-block;
      padding: 12px 25px;
      background-color: #0070f3;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="{{siteUrl}}/logo.png" alt="Flow Masters Logo" class="email-logo">
    </div>
    <div class="email-content">
      <h1>{{title}}</h1>
      <p>This is a template for {{description}}.</p>
      <p>You can edit this template in the CMS to customize it for your needs.</p>
      <p>Available placeholders: {{placeholders}}</p>
      <a href="{{siteUrl}}" class="button">Visit Flow Masters</a>
    </div>
    <div class="email-footer">
      <p>© ${new Date().getFullYear()} Flow Masters</p>
      {{#if unsubscribeUrl}}
      <p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
      {{/if}}
    </div>
  </div>
</body>
</html>
`

// Function to create templates in Payload CMS
async function createTemplates() {
  try {
    console.log('Starting template creation...')

    // Import Payload and config
    const { default: payload } = await import('payload')
    const { default: payloadConfig } = await import('../payload.config.ts')

    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      mongoURL: process.env.MONGODB_URI,
      config: payloadConfig,
      local: true,
    })

    console.log('Connected to Payload CMS')

    // Get default sender email
    const senderEmails = await payload.find({
      collection: 'sender-emails',
      limit: 1,
    })

    if (senderEmails.docs.length === 0) {
      throw new Error('No sender emails found. Please create at least one sender email in the CMS.')
    }

    const defaultSender = senderEmails.docs[0].id

    // Process each template
    for (const template of templates) {
      console.log(`Processing template: ${template.name} (${template.slug})`)

      try {
        // Check if template already exists
        const existingTemplate = await payload.find({
          collection: 'email-templates',
          where: {
            slug: {
              equals: template.slug,
            },
          },
        })

        // Prepare the HTML template
        const html = sampleTemplate
          .replace('{{title}}', template.name)
          .replace('{{description}}', template.description)
          .replace('{{placeholders}}', template.placeholders)

        // Create or update template in CMS
        if (existingTemplate.docs.length > 0) {
          console.log(`Updating existing template: ${template.slug}`)

          await payload.update({
            collection: 'email-templates',
            id: existingTemplate.docs[0].id,
            data: {
              name: template.name,
              description: template.description,
              subject: template.subject,
              templateType: template.templateType,
              body: html,
              placeholders: template.placeholders,
              lastSyncedAt: new Date().toISOString(),
              syncedFromCode: true,
            },
          })
        } else {
          console.log(`Creating new template: ${template.slug}`)

          await payload.create({
            collection: 'email-templates',
            data: {
              name: template.name,
              slug: template.slug,
              description: template.description,
              subject: template.subject,
              templateType: template.templateType,
              body: html,
              sender: defaultSender,
              placeholders: template.placeholders,
              lastSyncedAt: new Date().toISOString(),
              syncedFromCode: true,
            },
          })
        }

        console.log(`Successfully processed template: ${template.slug}`)
      } catch (error) {
        console.error(`Error processing template ${template.slug}:`, error)
      }
    }

    console.log('Template sync completed')

    // Disconnect from Payload
    await payload.disconnect()
  } catch (error) {
    console.error('Error creating templates:', error)
  }
}

// Run the function
createTemplates()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
