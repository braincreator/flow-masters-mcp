/**
 * Script to test the enhanced EmailService with Payload CMS integration
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// Load environment variables
dotenv.config()

// Test email recipient
const TEST_EMAIL = 'ay.krasnodar@gmail.com'

async function sendTestEmail() {
  let payload = null

  try {
    console.log('Starting email test using enhanced EmailService...')

    // Import the Payload config
    const { default: payloadConfig } = await import('../payload.config.ts')

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

    // Import the ServiceRegistry
    const { ServiceRegistry } = await import('../services/service.registry.js')

    // Get the email service
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const emailService = serviceRegistry.getEmailService()

    console.log('Email service initialized')

    // Test welcome email
    console.log(`Sending welcome email to ${TEST_EMAIL}...`)
    const welcomeResult = await emailService.sendWelcomeEmail({
      email: TEST_EMAIL,
      name: 'Test User',
      locale: 'en',
      unsubscribeToken: 'test-token',
    })

    console.log(`Welcome email result: ${welcomeResult ? 'Success' : 'Failed'}`)

    // Test course enrollment email
    console.log(`Sending course enrollment email to ${TEST_EMAIL}...`)
    const enrollmentResult = await emailService.sendCourseEnrollmentEmail({
      userName: 'Test User',
      email: TEST_EMAIL,
      courseName: 'Test Course',
      courseId: 'course123',
      locale: 'en',
      isPaid: true,
      orderNumber: 'ORD-12345',
    })

    console.log(`Course enrollment email result: ${enrollmentResult ? 'Success' : 'Failed'}`)

    // Test using template slug directly
    console.log(`Sending email using template slug to ${TEST_EMAIL}...`)
    const templateResult = await emailService.sendTemplateEmail(
      'course-completion',
      TEST_EMAIL,
      {
        userName: 'Test User',
        courseName: 'Test Course',
        courseId: 'course123',
        certificateId: 'cert123',
        completionDate: new Date().toISOString(),
        locale: 'en',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
      },
      { locale: 'en' },
    )

    console.log(`Template email result: ${templateResult ? 'Success' : 'Failed'}`)

    console.log('Email template tests completed')

    return true
  } catch (error) {
    console.error('Error running tests:', error)
    return false
  } finally {
    // Cleanup
    if (payload) {
      console.log('Closing Payload connection')
      await payload.disconnect()
    }
  }
}

// Run the test
sendTestEmail()
  .then((result) => {
    console.log(`Test ${result ? 'completed successfully' : 'failed'}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('Test script failed:', error)
    process.exit(1)
  })
