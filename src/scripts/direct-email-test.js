/**
 * Direct test of the EmailService without initializing the full Payload CMS
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'
import { EmailTemplateSlug } from '../types/emailTemplates.js'
import { generateWelcomeEmail } from '../utilities/emailTemplates/auth/welcome.js'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Get the current file's directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

// Load environment variables from .env and .env.local
dotenv.config({ path: path.resolve(rootDir, '.env') })
dotenv.config({ path: path.resolve(rootDir, '.env.local') })

// Log environment variables for debugging
logDebug('SMTP_HOST:', process.env.SMTP_HOST)
logDebug('SMTP_USER:', process.env.SMTP_USER)
logDebug('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***' : 'not set')

// Test email recipient
const TEST_EMAIL = 'ay.krasnodar@gmail.com'

async function sendTestEmail() {
  try {
    logDebug('Starting direct email test...')

    // Use production SMTP settings
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error(
        'SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables.',
      )
    }

    // Create a transporter with production settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE !== 'false', // Default to true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    logDebug('Created transporter')

    // Generate a welcome email using the template function
    const emailData = {
      name: 'Test User',
      email: TEST_EMAIL,
      locale: 'en',
      unsubscribeToken: 'test-token',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
    }

    const html = generateWelcomeEmail(emailData)

    logDebug('Generated welcome email HTML')

    // Send the email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Flow Masters'}" <${process.env.EMAIL_FROM || 'admin@flow-masters.ru'}>`,
      to: TEST_EMAIL,
      subject:
        emailData.locale === 'ru' ? 'Добро пожаловать в Flow Masters!' : 'Welcome to Flow Masters!',
      html,
    })

    logDebug('Message sent: %s', info.messageId)
    logDebug(`Email successfully sent to ${TEST_EMAIL}. Please check the inbox.`)

    return true
  } catch (error) {
    logError('Error sending test email:', error)
    return false
  }
}

// Run the test
sendTestEmail()
  .then((result) => {
    console.log(`Test ${result ? 'completed successfully' : 'failed'}`)
    process.exit(0)
  })
  .catch((error) => {
    logError('Test script failed:', error)
    process.exit(1)
  })
