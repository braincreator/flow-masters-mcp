import { Payload } from 'payload'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { lexicalToHtml } from '../utilities/lexicalToHtml'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import type { OrderCompletedEmailData, SubscriptionCancelledEmailData, SubscriptionPaymentFailedEmailData, SubscriptionPlanChangedEmailData, SubscriptionPausedEmailData, SubscriptionResumedEmailData, SubscriptionExpiredEmailData, SubscriptionRenewalReminderEmailData, SubscriptionRenewedSuccessfullyEmailData, OrderCancelledEmailData, RefundProcessedEmailData, InitialPaymentFailedEmailData, PasswordChangedEmailData, EmailAddressChangedEmailData, AccountUpdatedEmailData, OrderShippedFulfilledEmailData, DigitalProductReadyEmailData, AbandonedCartEmailData, AdminNewSubscriberNotificationEmailData } from '../types/emailTemplates' // Added import

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
  {
    slug: 'waiting-list-vacancy', // Use kebab-case for slugs
    name: 'Waiting List Vacancy Notification',
    description: 'Sent when a spot opens up for a user on the waiting list',
    codeTemplatePath: '../utilities/emailTemplates/courses/waitingListVacancy.ts',
    sampleData: {
      userName: 'Jane Doe',
      email: 'waitlist@example.com', // Sample email
      courseName: 'Advanced Flow Techniques',
      courseLink: 'https://flow-masters.ru/courses/advanced-flow', // Example link
      locale: 'en',
    },
  },
  {
    slug: 'subscription-activated',
    name: 'Subscription Activated',
    description: 'Sent when a user\'s subscription becomes active.',
    codeTemplatePath: '../utilities/emailTemplates/subscriptions/subscriptionActivated.ts', // Adjusted path
    sampleData: {
      userName: 'Jane Subscriber',
      email: 'subscriber@example.com',
      planName: 'Pro Plan',
      startDate: new Date().toISOString(),
      nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      locale: 'en',
      siteUrl: 'https://flow-masters.ru', // Ensure siteUrl is included if baseLayout needs it directly
    },
  },
  {
    slug: 'order_completed', // Using underscore as per NotificationService
    name: 'Order Completed (Digital/Service)',
    description: 'Sent when a digital or service order is marked as fully completed/fulfilled.',
    codeTemplatePath: '../utilities/emailTemplates/orders/orderCompleted.ts',
    sampleData: {
      userName: 'Digital Buyer',
      email: 'digital@example.com',
      orderNumber: 'ORD-DIGI-67890',
      orderDate: new Date().toISOString(),
      items: [
        { name: 'Ebook: Advanced Flow Theory', quantity: 1 },
        { name: 'Consultation Service', quantity: 1 },
      ],
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as OrderCompletedEmailData, // Cast to ensure type compatibility
  },
  {
    slug: 'subscription-cancelled',
    name: 'Subscription Cancelled',
    description: 'Sent when a user\'s subscription is cancelled.',
    codeTemplatePath: '../utilities/emailTemplates/subscriptions/subscriptionCancelled.ts',
    sampleData: {
      userName: 'Former Subscriber',
      email: 'former@example.com',
      planName: 'Basic Plan',
      endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), // Cancellation effective in 5 days
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as SubscriptionCancelledEmailData,
  },
  {
    slug: 'subscription-payment-failed',
    name: 'Subscription Payment Failed',
    description: 'Sent when a recurring subscription payment fails.',
    codeTemplatePath: '../utilities/emailTemplates/subscriptions/subscriptionPaymentFailed.ts',
    sampleData: {
      userName: 'Valued Customer',
      email: 'customer@example.com',
      planName: 'Premium Plan',
      nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), // Next attempt in 3 days
      amount: 29.99,
      currency: 'USD',
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as SubscriptionPaymentFailedEmailData,
  },
  {
    slug: 'subscription-plan-changed',
    name: 'Subscription Plan Changed',
    description: 'Sent when a user changes their subscription plan.',
    codeTemplatePath: '../utilities/emailTemplates/subscriptions/subscriptionPlanChanged.ts',
    sampleData: {
      userName: 'Flexible User',
      email: 'flexible@example.com',
      oldPlanName: 'Basic Plan',
      newPlanName: 'Pro Plan',
      effectiveDate: new Date().toISOString(),
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as SubscriptionPlanChangedEmailData,
  },
  {
    slug: 'subscription-paused',
    name: 'Subscription Paused',
    description: 'Sent when a user\'s subscription is paused.',
    codeTemplatePath: '../utilities/emailTemplates/subscriptions/subscriptionPaused.ts',
    sampleData: {
      userName: 'User Taking A Break',
      email: 'break@example.com',
      planName: 'Standard Plan',
      pausedAt: new Date().toISOString(),
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as SubscriptionPausedEmailData,
  },
  {
    slug: 'subscription-resumed',
    name: 'Subscription Resumed',
    description: 'Sent when a user\'s paused subscription is resumed.',
    codeTemplatePath: '../utilities/emailTemplates/subscriptions/subscriptionResumed.ts',
    sampleData: {
      userName: 'Returning User',
      email: 'returning@example.com',
      planName: 'Standard Plan',
      resumedAt: new Date().toISOString(),
      nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as SubscriptionResumedEmailData,
  },
  {
    slug: 'subscription-expired',
    name: 'Subscription Expired',
    description: 'Sent when a user\'s subscription expires.',
    codeTemplatePath: '../utilities/emailTemplates/subscriptions/subscriptionExpired.ts',
    sampleData: {
      userName: 'Past User',
      email: 'pastuser@example.com',
      planName: 'Annual Plan',
      expiredAt: new Date().toISOString(),
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as SubscriptionExpiredEmailData,
  },
  {
    slug: 'subscription-renewal-reminder',
    name: 'Subscription Renewal Reminder',
    description: 'Sent as a reminder before a subscription is automatically renewed.',
    codeTemplatePath: '../utilities/emailTemplates/subscriptions/subscriptionRenewalReminder.ts',
    sampleData: {
      userName: 'Loyal Customer',
      email: 'loyal@example.com',
      planName: 'Gold Plan',
      renewalDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // Renewal in 7 days
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as SubscriptionRenewalReminderEmailData,
  },
  {
    slug: 'subscription-renewed', // Matching NotificationService slug
    name: 'Subscription Renewed Successfully',
    description: 'Sent when a subscription is successfully renewed.',
    codeTemplatePath: '../utilities/emailTemplates/subscriptions/subscriptionRenewed.ts',
    sampleData: {
      userName: 'Continuing Subscriber',
      email: 'continuing@example.com',
      planName: 'Pro Plan',
      newExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Renewed for a year
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as SubscriptionRenewedSuccessfullyEmailData,
  },
  {
    slug: 'order-cancelled',
    name: 'Order Cancelled',
    description: 'Sent when an order is cancelled.',
    codeTemplatePath: '../utilities/emailTemplates/orders/orderCancelled.ts',
    sampleData: {
      userName: 'Customer Name',
      email: 'customer@example.com',
      orderNumber: 'ORD-CNCL-11223',
      cancellationDate: new Date().toISOString(),
      cancellationReason: 'Item out of stock.',
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as OrderCancelledEmailData,
  },
  {
    slug: 'refund-processed',
    name: 'Refund Processed',
    description: 'Sent when a refund for an order has been processed.',
    codeTemplatePath: '../utilities/emailTemplates/orders/refundProcessed.ts',
    sampleData: {
      userName: 'Valued Customer',
      email: 'customer@example.com',
      orderNumber: 'ORD-REF-44556',
      refundAmount: 49.99,
      currency: 'USD',
      processedAt: new Date().toISOString(),
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as RefundProcessedEmailData,
  },
  {
    slug: 'initial-payment-failed',
    name: 'Initial Payment Failed',
    description: 'Sent when an initial payment for an order fails.',
    codeTemplatePath: '../utilities/emailTemplates/orders/initialPaymentFailed.ts',
    sampleData: {
      userName: 'Prospective Customer',
      email: 'paymentfail@example.com',
      orderNumber: 'ORD-FAIL-77889',
      failureReason: 'Insufficient funds.',
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as InitialPaymentFailedEmailData,
  },
  {
    slug: 'password-changed',
    name: 'Password Changed Confirmation',
    description: 'Sent to a user after their password has been successfully changed.',
    codeTemplatePath: '../utilities/emailTemplates/auth/passwordChanged.ts', // Assuming path
    sampleData: {
      userName: 'Security Conscious User',
      email: 'secure@example.com',
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as PasswordChangedEmailData,
  },
  {
    slug: 'email-address-changed',
    name: 'Email Address Changed Confirmation (to New Email)',
    description: 'Sent to the new email address after a user changes their email.',
    codeTemplatePath: '../utilities/emailTemplates/auth/emailAddressChanged.ts', // Assuming path
    sampleData: {
      userName: 'User NewEmail',
      email: 'new.email@example.com', // This is the 'to' address for this template
      newEmail: 'new.email@example.com',
      oldEmail: 'old.email@example.com',
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as EmailAddressChangedEmailData,
  },
  {
    slug: 'email-address-change-security-alert',
    name: 'Email Address Change Security Alert (to Old Email)',
    description: 'Sent to the old email address as a security alert when an email is changed.',
    codeTemplatePath: '../utilities/emailTemplates/auth/emailAddressChangeSecurityAlert.ts', // Assuming path
    sampleData: {
      userName: 'User OldEmail', // Or a generic greeting if name not relevant to old email context
      email: 'old.email@example.com', // This is the 'to' address for this template
      newEmail: 'new.email@example.com',
      oldEmail: 'old.email@example.com',
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as EmailAddressChangedEmailData, // Uses the same data structure
  },
  {
    slug: 'account-updated',
    name: 'Account Details Updated',
    description: 'Sent to a user after their account details (e.g., profile information) have been updated.',
    codeTemplatePath: '../utilities/emailTemplates/auth/accountUpdated.ts', // Assuming path
    sampleData: {
      userName: 'Detail Oriented User',
      email: 'details@example.com',
      updatedFieldsText: 'your profile name and contact number', // Example text
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as AccountUpdatedEmailData,
  },
  {
    slug: 'order-shipped-fulfilled',
    name: 'Order Shipped/Fulfilled',
    description: 'Sent when a physical order is shipped or a service order is fulfilled.',
    codeTemplatePath: '../utilities/emailTemplates/orders/orderShippedFulfilled.ts',
    sampleData: {
      userName: 'Eager Customer',
      email: 'eager@example.com',
      orderNumber: 'ORD-SHIP-99001',
      shippedAt: new Date().toISOString(),
      trackingNumber: '1Z999AA10123456784',
      carrier: 'UPS',
      items: [
        { name: 'Physical Product A', quantity: 1 },
        { name: 'Service B', quantity: 1 },
      ],
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as OrderShippedFulfilledEmailData,
  },
  {
    slug: 'digital_product_ready', // Using underscore as per NotificationService
    name: 'Digital Product Ready for Download/Access',
    description: 'Sent when digital products in an order are ready for download or access.',
    codeTemplatePath: '../utilities/emailTemplates/orders/digitalProductReady.ts',
    sampleData: {
      userName: 'Digital User',
      email: 'digital.user@example.com',
      orderNumber: 'ORD-DIGI-12345',
      items: [
        { name: 'Awesome E-book Vol. 1' },
        { name: 'Exclusive Video Tutorial Pack' },
      ],
      downloadLinks: [
        'https://flow-masters.ru/download/ebook123',
        'https://flow-masters.ru/access/videos456',
      ],
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as DigitalProductReadyEmailData,
  },
  {
    slug: 'abandoned-cart',
    name: 'Abandoned Cart Reminder',
    description: 'Sent to users who have items in their cart but have not completed the purchase.',
    codeTemplatePath: '../utilities/emailTemplates/orders/abandonedCart.ts',
    sampleData: {
      userName: 'Valued Shopper',
      email: 'shopper@example.com',
      items: [
        { title: 'Amazing Gadget', quantity: 1, price: 49.99 },
        { title: 'Useful Accessory', quantity: 2, price: 9.99 },
      ],
      total: 69.97,
      currency: 'USD',
      lastUpdated: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Cart updated yesterday
      cartUrl: 'https://flow-masters.ru/cart',
      locale: 'en',
      siteUrl: 'https://flow-masters.ru',
    } as AbandonedCartEmailData,
  },
  {
    slug: 'admin-new-subscriber',
    name: 'Admin Notification: New Newsletter Subscriber',
    description: 'Sent to the admin when a new user subscribes to the newsletter.',
    codeTemplatePath: '../utilities/emailTemplates/newsletters/adminNewSubscriber.ts',
    sampleData: {
      newSubscriberEmail: 'new.subscriber@example.com',
      newSubscriberName: 'Newby McSubscriberson', // Optional
      adminPanelUrl: 'https://flow-masters.ru/admin/collections/newsletter-subscribers',
      siteUrl: 'https://flow-masters.ru',
      // email: 'admin@flow-masters.ru', // This is 'to' address, not part of template data itself
      locale: 'ru', // Admin notifications often default to a specific locale
    } as Omit<AdminNewSubscriberNotificationEmailData, 'email'>, // Omit 'email' as it's the recipient
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
    logError(`Error generating HTML from ${templatePath}:`, error)
    throw error
  }
}

// Function to extract placeholders from HTML
function extractPlaceholders(html: string): string[] {
  const placeholderRegex = /{{([\w.]+)}}/g
  const placeholders: string[] = []
  let match

  while ((match = placeholderRegex.exec(html)) !== null) {
    // Ensure the capture group exists before pushing
    if (match[1]) {
      placeholders.push(match[1])
    }
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
        // secret is usually defined in the config
        // mongoURL is typically not needed if DATABASE_URI is set in .env for the default adapter
        config: payloadConfig,
        // 'local: true' might be inferred or not needed if PAYLOAD_CONFIG_PATH is correctly set
        // and the script environment is detected as non-server.
      })
      return module.default
    })

    logDebug('Connected to Payload CMS')

    // Add a null check for payload after initialization
    if (!payload) {
      throw new Error('Payload failed to initialize.');
    }

    // Get default sender email
    const senderEmails = await payload.find({
      collection: 'sender-emails',
      limit: 1,
    })

    if (senderEmails.docs.length === 0 || !senderEmails.docs[0]) {
      throw new Error('No sender emails found. Please create at least one sender email in the CMS.')
    }

    const defaultSender = senderEmails.docs[0].id! // Added non-null assertion as the check above ensures it exists

    // Process each template
    for (const template of templates) {
      logDebug(`Processing template: ${template.name} (${template.slug})`)

      try {
        // Add null check before using payload in loop
        if (!payload) {
          logError(`Payload instance is null, skipping template ${template.slug}`);
          continue; // Skip this iteration
        }

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
        if (existingTemplate.docs.length > 0 && existingTemplate.docs[0]) {
          logDebug(`Updating existing template: ${template.slug}`)

          await payload.update({
            collection: 'email-templates',
            id: existingTemplate.docs[0].id!, // Added non-null assertion due to the guard condition
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
          logDebug(`Creating new template: ${template.slug}`)

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

        logDebug(`Successfully processed template: ${template.slug}`)
      } catch (error) {
        logError(`Error processing template ${template.slug}:`, error)
      }
    }

    logDebug('Template sync completed')
  } catch (error) {
    logError('Error syncing templates:', error)
  } finally {
    // Cleanup
    // The disconnect method might be deprecated or unnecessary with local init
    // if (payload) {
    //   logDebug('Closing Payload connection')
    //   await payload.disconnect()
    // }
  }
}

// Run the sync function
syncTemplates()
  .then(() => {
    logDebug('Script completed')
    process.exit(0)
  })
  .catch((error) => {
    logError('Script failed:', error)
    process.exit(1)
  })
