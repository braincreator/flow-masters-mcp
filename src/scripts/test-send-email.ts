/**
 * This script sends a test email using the enhanced email template system
 * It demonstrates how to use the EmailService with CMS templates
 */

import dotenv from 'dotenv'
import { EmailTemplateSlug } from '../types/emailTemplates'
import payload from 'payload'
import { ServiceRegistry } from '../services/service.registry'
import payloadConfig from '../payload.config'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Load environment variables
dotenv.config()

// Test email recipient
const TEST_EMAIL = 'ay.krasnodar@gmail.com'

async function runTest() {
  try {
    logDebug('Starting email template test...')

    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      mongoURL: process.env.MONGODB_URI,
      local: true,
      config: payloadConfig,
    })

    logDebug('Connected to Payload CMS')

    // Get the email service
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const emailService = serviceRegistry.getEmailService()

    logDebug('Email service initialized')

    // Test welcome email
    logDebug(`Sending welcome email to ${TEST_EMAIL}...`)
    const welcomeResult = await emailService.sendWelcomeEmail({
      email: TEST_EMAIL,
      name: 'Test User',
      locale: 'en',
      unsubscribeToken: 'test-token',
    })

    console.log(`Welcome email result: ${welcomeResult ? 'Success' : 'Failed'}`)

    // Test course enrollment email
    logDebug(`Sending course enrollment email to ${TEST_EMAIL}...`)
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
    logDebug(`Sending email using template slug to ${TEST_EMAIL}...`)
    const templateResult = await emailService.sendTemplateEmail(
      EmailTemplateSlug.COURSE_COMPLETION,
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

    logDebug('Email template tests completed')

    // Disconnect from Payload
    await payload.disconnect()
  } catch (error) {
    logError('Error running tests:', error)
  }
}

// Run the tests
runTest()
  .then(() => {
    logDebug('Test script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    logError('Test script failed:', error)
    process.exit(1)
  })
