/**
 * This script updates all email methods in the EmailService to check for CMS templates first.
 * It's a one-time script to help with the migration to the hybrid email template system.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to the EmailService file
const emailServicePath = path.resolve(__dirname, '../services/email.service.ts')

// Read the file
let content = fs.readFileSync(emailServicePath, 'utf8')

// Define the methods to update and their corresponding template slugs
const methodsToUpdate = [
  {
    methodName: 'sendPasswordResetEmail',
    templateSlug: 'password-reset',
    dataParam: 'userData',
    emailField: 'userData.email',
  },
  {
    methodName: 'sendUnsubscribeConfirmationEmail',
    templateSlug: 'unsubscribe-confirmation',
    dataParam: 'subscriberData',
    emailField: 'subscriberData.email',
  },
  {
    methodName: 'sendCourseCompletionEmail',
    templateSlug: 'course-completion',
    dataParam: 'data',
    emailField: "data.userName?.includes('@') ? data.userName : data.email || ''",
  },
  {
    methodName: 'sendCourseProgressEmail',
    templateSlug: 'course-progress',
    dataParam: 'data',
    emailField: "data.userName?.includes('@') ? data.userName : data.email || ''",
  },
  {
    methodName: 'sendCourseCertificateEmail',
    templateSlug: 'course-certificate',
    dataParam: 'data',
    emailField: "data.userName?.includes('@') ? data.userName : data.email || ''",
  },
  {
    methodName: 'sendOrderConfirmationEmail',
    templateSlug: 'order-confirmation',
    dataParam: 'data',
    emailField: "data.userName?.includes('@') ? data.userName : data.email || ''",
  },
  {
    methodName: 'sendPaymentConfirmationEmail',
    templateSlug: 'payment-confirmation',
    dataParam: 'data',
    emailField: "data.userName?.includes('@') ? data.userName : data.email || ''",
  },
  {
    methodName: 'sendRewardEmail',
    templateSlug: 'reward-generic',
    dataParam: 'data',
    emailField: "data.userName?.includes('@') ? data.userName : data.email || ''",
  },
  {
    methodName: 'sendAdminNewSubscriberNotification',
    templateSlug: 'admin-new-subscriber',
    dataParam: 'subscriberData',
    emailField: 'process.env.ADMIN_EMAIL || "admin@flow-masters.ru"',
  },
]

// Update each method
methodsToUpdate.forEach(({ methodName, templateSlug, dataParam, emailField }) => {
  // Find the method in the file
  const methodRegex = new RegExp(
    `async ${methodName}\\([^)]*\\)[^{]*{[\\s\\S]*?try {([\\s\\S]*?)const html = generate`,
    'g',
  )

  // Create the CMS template check code
  const cmsTemplateCheck = `
      // First try to use a CMS template
      const cmsResult = await this.sendTemplateEmail(
        '${templateSlug}',
        ${emailField},
        // Convert to Record<string, unknown> safely
        Object.fromEntries(Object.entries(${dataParam})),
        { locale: ${dataParam}.locale || 'ru' },
      )

      // If CMS template was found and email sent successfully, return
      if (cmsResult) {
        return true
      }

      `

  // Replace the method implementation
  content = content.replace(methodRegex, (match, group1) => {
    return match.replace(group1, cmsTemplateCheck)
  })
})

// Write the updated content back to the file
fs.writeFileSync(emailServicePath, content, 'utf8')

console.log('Email methods updated successfully!')
