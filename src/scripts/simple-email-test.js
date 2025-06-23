/**
 * Simple script to test sending an email
 */

import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Load environment variables
dotenv.config()

// Test email recipient
const TEST_EMAIL = 'ay.krasnodar@gmail.com'

async function sendTestEmail() {
  try {
    logDebug('Starting simple email test...')

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

    // Send a test email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Flow Masters'}" <${process.env.EMAIL_FROM || 'admin@flow-masters.ru'}>`,
      to: TEST_EMAIL,
      subject: 'Test Email from Enhanced Email System',
      html: `
        <h1>Test Email from Enhanced Email System</h1>
        <p>This is a test email from the enhanced email system with production SMTP settings.</p>
        <p>The email was sent at: ${new Date().toLocaleString()}</p>
        <p>SMTP Host: ${process.env.SMTP_HOST}</p>
        <p>SMTP User: ${process.env.SMTP_USER}</p>
        <p>If you're seeing this, the enhanced email system is working correctly with production settings!</p>
        <p>This confirms that the EmailService has been successfully updated to use TypeScript interfaces and check for CMS templates first.</p>
      `,
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
    console.log(`Test email ${result ? 'sent successfully' : 'failed'}`)
    process.exit(0)
  })
  .catch((error) => {
    logError('Test script failed:', error)
    process.exit(1)
  })
