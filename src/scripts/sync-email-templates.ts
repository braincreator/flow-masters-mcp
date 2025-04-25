import { Payload } from 'payload'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { lexicalToHtml } from '../utilities/lexicalToHtml'

// Load environment variables
dotenv.config()

// Template definitions - mapping code templates to CMS templates
interface TemplateDefinition {
  slug: string
  name: string
  description: string
  codeTemplatePath: string
  sampleData: Record<string, any>
}

// Define the templates to sync
const templates: TemplateDefinition[] = [
  {
    slug: 'welcome-email',
    name: 'Welcome Email',
    description: 'Sent when a user subscribes to the newsletter or creates an account',
    codeTemplatePath: '../utilities/emailTemplates/auth/welcome.ts',
    sampleData: {
      userName: 'John Doe',
      email: 'user@example.com',
      locale: 'en',
      unsubscribeToken: 'sample-token',
    },
  },
  {
    slug: 'password-reset',
    name: 'Password Reset',
    description: 'Sent when a user requests a password reset',
    codeTemplatePath: '../utilities/emailTemplates/auth/passwordReset.ts',
    sampleData: {
      email: 'user@example.com',
      name: 'John Doe',
      resetToken: 'sample-reset-token',
      locale: 'en',
    },
  },
  {
    slug: 'unsubscribe-confirmation',
    name: 'Unsubscribe Confirmation',
    description: 'Sent when a user unsubscribes from the newsletter',
    codeTemplatePath: '../utilities/emailTemplates/auth/unsubscribeConfirmation.ts',
    sampleData: {
      email: 'user@example.com',
      locale: 'en',
    },
  },
  {
    slug: 'course-enrollment',
    name: 'Course Enrollment',
    description: 'Sent when a user enrolls in a course',
    codeTemplatePath: '../utilities/emailTemplates/courses/courseEnrollment.ts',
    sampleData: {
      userName: 'John Doe',
      email: 'user@example.com',
      courseName: 'Introduction to Flow Masters',
      courseId: 'course123',
      locale: 'en',
      isPaid: true,
      orderNumber: 'ORD-12345',
    },
  },
  {
    slug: 'course-completion',
    name: 'Course Completion',
    description: 'Sent when a user completes a course',
    codeTemplatePath: '../utilities/emailTemplates/courses/courseCompletion.ts',
    sampleData: {
      userName: 'John Doe',
      email: 'user@example.com',
      courseName: 'Introduction to Flow Masters',
      courseId: 'course123',
      certificateId: 'cert123',
      completionDate: new Date().toISOString(),
      locale: 'en',
      nextCourseId: 'course456',
      nextCourseName: 'Advanced Flow Masters',
    },
  },
  {
    slug: 'course-progress',
    name: 'Course Progress',
    description: 'Sent when a user reaches a progress milestone in a course',
    codeTemplatePath: '../utilities/emailTemplates/courses/courseProgress.ts',
    sampleData: {
      userName: 'John Doe',
      email: 'user@example.com',
      courseName: 'Introduction to Flow Masters',
      courseId: 'course123',
      progressPercentage: 50,
      locale: 'en',
      nextLessonName: 'Advanced Concepts',
      nextLessonUrl: 'https://flow-masters.ru/courses/course123/lessons/lesson456',
    },
  },
  {
    slug: 'course-certificate',
    name: 'Course Certificate',
    description: 'Sent when a user receives a certificate for completing a course',
    codeTemplatePath: '../utilities/emailTemplates/courses/courseCertificate.ts',
    sampleData: {
      userName: 'John Doe',
      email: 'user@example.com',
      courseName: 'Introduction to Flow Masters',
      courseId: 'course123',
      certificateId: 'cert123',
      completionDate: new Date().toISOString(),
      locale: 'en',
    },
  },
  {
    slug: 'order-confirmation',
    name: 'Order Confirmation',
    description: 'Sent when a user places an order',
    codeTemplatePath: '../utilities/emailTemplates/orders/orderConfirmation.ts',
    sampleData: {
      userName: 'John Doe',
      email: 'user@example.com',
      orderNumber: 'ORD-12345',
      orderDate: new Date().toISOString(),
      items: [
        {
          name: 'Introduction to Flow Masters',
          description: 'Beginner course',
          quantity: 1,
          price: 99.99,
          total: 99.99,
          type: 'course',
          id: 'course123',
        },
      ],
      subtotal: 99.99,
      total: 99.99,
      currency: 'USD',
      paymentMethod: 'Credit Card',
      paymentStatus: 'paid',
      locale: 'en',
    },
  },
  {
    slug: 'payment-confirmation',
    name: 'Payment Confirmation',
    description: 'Sent when a payment is confirmed',
    codeTemplatePath: '../utilities/emailTemplates/orders/paymentConfirmation.ts',
    sampleData: {
      userName: 'John Doe',
      email: 'user@example.com',
      orderNumber: 'ORD-12345',
      paymentDate: new Date().toISOString(),
      paymentAmount: 99.99,
      currency: 'USD',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-12345',
      locale: 'en',
    },
  },
  {
    slug: 'reward-generic',
    name: 'Generic Reward',
    description: 'Sent when a user receives a generic reward',
    codeTemplatePath: '../utilities/emailTemplates/rewards/rewardGeneric.ts',
    sampleData: {
      userName: 'John Doe',
      email: 'user@example.com',
      rewardTitle: 'Achievement Unlocked',
      rewardDescription: 'You have unlocked a special reward!',
      rewardType: 'generic',
      rewardId: 'reward123',
      rewardCode: 'REWARD123',
      locale: 'en',
    },
  },
  {
    slug: 'reward-discount',
    name: 'Discount Reward',
    description: 'Sent when a user receives a discount reward',
    codeTemplatePath: '../utilities/emailTemplates/rewards/rewardDiscount.ts',
    sampleData: {
      userName: 'John Doe',
      email: 'user@example.com',
      rewardTitle: '25% Discount',
      rewardDescription: 'You have received a 25% discount on all courses!',
      rewardType: 'discount',
      rewardId: 'reward123',
      rewardCode: 'DISCOUNT25',
      discountAmount: '25',
      discountType: 'percentage',
      applicableTo: 'All courses',
      locale: 'en',
    },
  },
  {
    slug: 'reward-free-course',
    name: 'Free Course Reward',
    description: 'Sent when a user receives a free course reward',
    codeTemplatePath: '../utilities/emailTemplates/rewards/rewardFreeCourse.ts',
    sampleData: {
      userName: 'John Doe',
      email: 'user@example.com',
      rewardTitle: 'Free Course',
      rewardDescription: 'You have received a free course!',
      rewardType: 'free_course',
      rewardId: 'reward123',
      rewardCode: 'FREECOURSE',
      courseId: 'course123',
      courseUrl: 'https://flow-masters.ru/courses/course123',
      courseDuration: '4 weeks',
      courseLevel: 'Beginner',
      locale: 'en',
    },
  },
]

// Function to generate HTML from a code template
async function generateHtmlFromCodeTemplate(
  templatePath: string,
  sampleData: Record<string, any>,
): Promise<{ html: string; subject: string }> {
  try {
    // Dynamically import the template module
    const templateModule = await import(templatePath)

    // Find the generate function (convention: generateXxxxEmail)
    const generateFunctionName = Object.keys(templateModule).find(
      (key) => key.startsWith('generate') && key.endsWith('Email'),
    )

    if (!generateFunctionName) {
      throw new Error(`Generate function not found in ${templatePath}`)
    }

    // Call the generate function with sample data
    const html = templateModule[generateFunctionName]({
      ...sampleData,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
    })

    // Extract subject from HTML
    const subjectMatch = html.match(/<title>(.*?)<\/title>/)
    const subject = subjectMatch ? subjectMatch[1] : 'No subject found'

    return { html, subject }
  } catch (error) {
    console.error(`Error generating HTML from ${templatePath}:`, error)
    throw error
  }
}

// Function to extract placeholders from HTML
function extractPlaceholders(html: string): string[] {
  const placeholderRegex = /{{([\w.]+)}}/g
  const placeholders: string[] = []
  let match

  while ((match = placeholderRegex.exec(html)) !== null) {
    placeholders.push(match[1])
  }

  return [...new Set(placeholders)] // Remove duplicates
}

// Function to convert HTML to a template with placeholders
function convertToTemplateSyntax(html: string, sampleData: Record<string, any>): string {
  let templateHtml = html

  // Replace actual values with placeholders
  Object.entries(sampleData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Escape special characters in the value for regex
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escapedValue, 'g')
      templateHtml = templateHtml.replace(regex, `{{${key}}}`)
    }
  })

  return templateHtml
}

// Main function to sync templates
async function syncTemplates() {
  let payload: Payload | null = null

  try {
    // Import the Payload config
    const { default: payloadConfig } = await import('../payload.config')

    // Initialize Payload
    payload = await import('payload').then(async (module) => {
      await module.default.init({
        secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
        mongoURL: process.env.MONGODB_URI || 'mongodb://localhost/payload',
        config: payloadConfig,
        local: true,
      })
      return module.default
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

        // Generate HTML from code template
        const { html, subject } = await generateHtmlFromCodeTemplate(
          template.codeTemplatePath,
          template.sampleData,
        )

        // Convert HTML to template with placeholders
        const templateHtml = convertToTemplateSyntax(html, template.sampleData)

        // Extract placeholders
        const placeholders = extractPlaceholders(templateHtml)

        // Create or update template in CMS
        if (existingTemplate.docs.length > 0) {
          console.log(`Updating existing template: ${template.slug}`)

          await payload.update({
            collection: 'email-templates',
            id: existingTemplate.docs[0].id,
            data: {
              name: template.name,
              description: template.description,
              subject: subject,
              body: templateHtml,
              placeholders: placeholders.join(', '),
              lastSyncedAt: new Date().toISOString(),
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
              subject: subject,
              body: templateHtml,
              sender: defaultSender,
              placeholders: placeholders.join(', '),
              lastSyncedAt: new Date().toISOString(),
            },
          })
        }

        console.log(`Successfully processed template: ${template.slug}`)
      } catch (error) {
        console.error(`Error processing template ${template.slug}:`, error)
      }
    }

    console.log('Template sync completed')
  } catch (error) {
    console.error('Error syncing templates:', error)
  } finally {
    // Cleanup
    if (payload) {
      console.log('Closing Payload connection')
      await payload.disconnect()
    }
  }
}

// Run the sync function
syncTemplates()
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
