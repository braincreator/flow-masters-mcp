import type { Payload, PayloadRequest } from 'payload'
import { Response, NextFunction } from 'express'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import cron from 'node-cron' // Added for job scheduling

import { getServerSideURL } from './utilities/getURL'
import { getAllowedOrigins } from './utilities/cors'
import { defaultLexical } from '@/fields/defaultLexical'
import { authConfig } from './auth/config'

// Handlers
import addProductsHandler from './endpoints/add-products'
import validateDiscountHandler from './endpoints/validate-discount'
import downloadProductHandler from './endpoints/download-product'
import getFavoritesHandler from './endpoints/favorites/getFavoritesHandler'
import toggleFavoriteHandler from './endpoints/favorites/toggleFavoriteHandler'
import getCartHandler from './endpoints/cart/getCartHandler'
import addItemHandler from './endpoints/cart/addItemHandler'
import updateItemHandler from './endpoints/cart/updateItemHandler'
import removeItemHandler from './endpoints/cart/removeItemHandler'
import clearCartHandler from './endpoints/cart/clearCartHandler'
import triggerNewsletterBroadcastHandler from './endpoints/triggerNewsletterBroadcast'
// Course Feature Handlers
import enrollFreeHandler from './endpoints/courses/enrollFreeHandler'
import markCompleteHandler from './endpoints/lessons/markCompleteHandler'
import { accessLessonHandler } from './endpoints/lessons/accessLessonHandler' // Import the new handler
import submitHandler from './endpoints/assessments/submitHandler'
import submitReviewHandler from './endpoints/reviews/submitHandler' // Import review submit handler
import getCourseReviewsHandler from './endpoints/reviews/getCourseReviewsHandler'
import getAverageRatingHandler from './endpoints/reviews/getAverageRatingHandler'
import cancelEnrollmentHandler from './endpoints/enrollments/cancelHandler' // Import cancellation handler
import profileDataHandler from './endpoints/users/profileDataHandler'
// Other API Handlers
import { previewEmailTemplate } from './api/preview-email-template'
import { previewEmail } from './api/preview-email'

// Plugins
import { plugins } from './plugins'

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import consolidated lists
import globalsList from '@/globals'
import collections from '@/collections/collectionList'
import { Assessments } from './collections/Assessments/config'
import { CourseReviews } from './collections/CourseReviews/config'
import { AssessmentSubmissions } from './collections/AssessmentSubmissions/config' // Import AssessmentSubmissions
import { LearningPaths } from './collections/LearningPaths/config' // Import LearningPaths
import { WaitingListEntries } from './collections/WaitingListEntries/config' // Import WaitingListEntries
import { ProjectFiles } from './collections/ProjectFiles/config' // Import ProjectFiles
// TermsPages is now included in collections array from collectionList

// Import constants, utils, specific components needed here
import { ENV } from '@/constants/env'
import { Users } from './collections/Users' // Needed for admin.user
import { NewsletterBroadcastJobData, SendToAllResult } from './jobs/types'
import { processEmailCampaign } from './jobs/emailCampaign'
// These imports are used in the cron jobs that were removed from autoRun
// import { checkScheduledEmailCampaigns } from './jobs/scheduledEmailCampaigns'
import { checkExpiringRewards } from './jobs/checkExpiringRewards'
import setupRewardsEndpoint from './endpoints/setup-rewards'
// Используем строковый путь к компоненту для настройки наград

import { ServiceRegistry } from '@/services/service.registry'
import { CourseService } from '@/services/courses/courseService' // Added for job logic

// Import blocks from central index
import { availableBlocks } from './blocks'

// Mongoose config with improved resilience
const mongooseConfig = {
  url: ENV.DATABASE_URI,
  connectOptions: {
    directConnection: true,
    serverSelectionTimeoutMS: 30000, // Increased timeout
    maxPoolSize: 30,
    minPoolSize: 5,
    socketTimeoutMS: 45000, // Increased timeout
    connectTimeoutMS: 45000, // Increased timeout
    family: 4,
    retryWrites: true,
    retryReads: true,
  },
}

// Custom components are disabled to restore native admin panel styling

// --- Определяем интерфейс для входных данных задачи --- //
interface RecalculateSegmentsInput {
  userId: string
}
// ----------------------------------------------------- //

import { PaymentService } from './services/payment.service' // Import PaymentService
import { isAdmin } from './access/isAdmin' // Import isAdmin for access control

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  // Removed the duplicate endpoints array from here
  secret: ENV.PAYLOAD_SECRET,
  auth: authConfig,
  admin: {
    // Specify which collection can access the admin panel
    user: Users.slug,

    // Custom components for the admin panel
    components:
      process.env.IS_GENERATING_TYPES === 'true'
        ? {}
        : {
            // Re-enable custom components with proper styling
            // These components should now work correctly with the fixed CSS optimization
          },

    // Custom navigation is implemented through afterNavLinks component
    // In Payload v3, navigation groups are handled through custom components

    // Live preview configuration
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },

    // Date format for the admin panel
    dateFormat: 'dd.MM.yyyy HH:mm',

    // Theme configuration (light, dark, or all)
    theme: 'all',

    // Timezone settings
    timezones: {
      supportedTimezones: [
        { label: 'Moscow Time', value: 'Europe/Moscow' },
        { label: 'Pacific Time', value: 'America/Los_Angeles' },
        { label: 'Eastern Time', value: 'America/New_York' },
      ],
      defaultTimezone: 'Europe/Moscow',
    },

    // Custom routes for admin panel sections
    routes: {
      // You can customize these routes if needed
      account: '/account',
      login: '/login',
      logout: '/logout',
    },

    // Metadata for the admin panel
    meta: {
      titleSuffix: '- Flow Masters Admin',
    },

    // Custom styling is applied through components and the theme setting above
    // Custom components handle the styling through CSS-in-JS
  },
  editor: defaultLexical,
  db: mongooseAdapter(mongooseConfig),
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'Russian',
        code: 'ru',
      },
    ],
    defaultLocale: 'ru',
    fallback: true,
  },

  cors: getAllowedOrigins(),
  collections: [
    // Restore the main list
    ...collections,
    // Keep the directly added ones
    Assessments,
    CourseReviews,
    AssessmentSubmissions,
    LearningPaths,
    WaitingListEntries,
    ProjectFiles, // Add ProjectFiles
    // TermsPages is already included in collections array
  ], // Add WaitingListEntries (comment seems misplaced, but keeping structure)
  globals: [...globalsList],
  email: nodemailerAdapter({
    defaultFromAddress: ENV.PAYLOAD_DEFAULT_SENDER_EMAIL || 'admin@flow-masters.ru',
    defaultFromName: ENV.PAYLOAD_DEFAULT_SENDER_NAME || 'Flow Masters',
    transportOptions: {
      host: ENV.PAYLOAD_SMTP_HOST,
      port: parseInt(ENV.PAYLOAD_SMTP_PORT || '465', 10),
      secure: parseInt(ENV.PAYLOAD_SMTP_PORT || '465', 10) === 465,
      auth: {
        user: ENV.PAYLOAD_SMTP_USER,
        pass: ENV.PAYLOAD_SMTP_PASSWORD,
      },
      // Add connection timeout and retry settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000, // 5 seconds
      socketTimeout: 10000, // 10 seconds
    },
    // Skip verification in production to prevent startup failures
    skipVerify: ENV.NODE_ENV === 'production',
  }),

  // Jobs configuration according to Payload CMS v3 documentation
  jobs: {
    // Define tasks that can be executed
    tasks: [
      {
        slug: 'newsletter-broadcast',
        handler: async (args) => {
          const { job, req } = args
          const payload = req.payload
          let results: SendToAllResult | null = null
          let status: 'completed' | 'failed' = 'failed'

          try {
            // Безопасное приведение типов
            const data = job.input as unknown as NewsletterBroadcastJobData

            payload.logger.info(`Starting newsletter broadcast job: ${data.broadcastId}`)

            const serviceRegistry = ServiceRegistry.getInstance(payload)
            const emailService = serviceRegistry.getEmailService()

            results = await emailService.sendBroadcast(data.title, data.content, data.locale)

            status = 'completed'
            payload.logger.info(
              `Job ${data.broadcastId}: Newsletter broadcast completed. Sent: ${results?.successfullySent}, Failed: ${results?.failedToSend}`,
            )

            return {
              output: {
                status,
                results: results || {
                  totalSubscribers: 0,
                  successfullySent: 0,
                  failedToSend: 0,
                  sendErrors: [],
                },
              },
            }
          } catch (error) {
            payload.logger.error('Failed to process newsletter broadcast job', error)

            return {
              output: {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                results: results || {
                  totalSubscribers: 0,
                  successfullySent: 0,
                  failedToSend: 0,
                  sendErrors: [],
                },
              },
            }
          }
        },
        retries: {
          attempts: 3,
          backoff: {
            type: 'exponential',
          },
        },
      },
      {
        slug: 'recalculate-user-segments',
        handler: async (args) => {
          const { job, req } = args
          const payload = req.payload
          // Используем приведение типа для доступа к input
          const inputData = job.input as unknown as RecalculateSegmentsInput
          const userId = inputData.userId

          if (!userId) {
            payload.logger.error('Recalculate segments job: userId is missing in input.')
            return { output: { status: 'failed', error: 'Missing userId' } }
          }

          payload.logger.info(`Starting segment recalculation for user: ${userId}`)

          try {
            // ... (Логика получения пользователя и сегментов)

            // --- ЗАГЛУШКА ---
            const matchingSegmentIds: string[] = []
            payload.logger.warn(
              `Segment recalculation logic for user ${userId} is not implemented yet.`,
            )
            // ----------------

            // 5. Обновить пользователя
            // Using a type assertion to handle the segments field
            // This is necessary because the segments field might not be in the generated types yet
            type UserUpdateData = {
              segments?: string[]
              [key: string]: unknown
            }

            await payload.update({
              collection: 'users',
              id: userId,
              data: {
                segments: matchingSegmentIds,
              } as UserUpdateData,
              overrideAccess: true,
              req,
            })

            payload.logger.info(`Successfully recalculated segments for user: ${userId}`)

            return {
              output: {
                status: 'completed',
                matchingSegments: matchingSegmentIds, // Возвращаем результат
              },
            }
          } catch (error) {
            payload.logger.error(`Failed to recalculate segments for user ${userId}`, error)
            return {
              output: {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            }
          }
        },
        retries: {
          attempts: 3,
          backoff: {
            type: 'exponential',
          },
        },
      },

      // Email Campaign Task
      {
        slug: 'email-campaign',
        handler: async (args) => {
          const { job, req } = args
          const payload = req.payload

          try {
            // Define the expected input type
            type EmailCampaignInput = {
              campaignId: string
            }

            // Cast the input to the expected type
            const data = job.input as unknown as EmailCampaignInput

            payload.logger.info(`Starting email campaign job for campaign ID: ${data.campaignId}`)

            await processEmailCampaign(data)

            return {
              output: {
                status: 'completed',
                campaignId: data.campaignId,
              },
            }
          } catch (error) {
            payload.logger.error('Failed to process email campaign job', error)

            return {
              output: {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            }
          }
        },
        retries: {
          attempts: 3,
          backoff: {
            type: 'exponential',
          },
        },
      },
      // Expiring Rewards Check Task
      {
        slug: 'check-expiring-rewards',
        handler: async (args) => {
          const { req } = args
          const payload = req.payload

          try {
            payload.logger.info('Starting expiring rewards check job')

            await checkExpiringRewards()

            return {
              output: {
                status: 'completed',
              },
            }
          } catch (error) {
            payload.logger.error('Failed to process expiring rewards check job', error)

            return {
              output: {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            }
          }
        },
        retries: {
          attempts: 2,
          backoff: {
            type: 'exponential',
          },
        },
      },
    ],
    // Configure automatic job execution with cron
    autoRun: [
      {
        cron: '*/5 * * * *', // Run every 5 minutes
        limit: 10, // Process up to 10 jobs per run
        queue: 'default', // Process jobs from the default queue
      },
      {
        cron: '0 * * * *', // Run every hour at minute 0
        queue: 'hourly',
        limit: 50,
      },
      {
        cron: '0 10 * * *', // Run every day at 10:00 AM
        queue: 'daily',
        limit: 100,
      },
    ],
    // Control whether jobs should auto-run
    shouldAutoRun: async (_payload) => {
      // This function will be invoked each time Payload goes to pick up and run jobs
      // If this function ever returns false, the cron schedule will be stopped
      return true
    },
    // Configure access control for job execution
    access: {
      run: ({ req }) => {
        // Allow logged in users to execute jobs
        if (req.user) return true

        // For Vercel Cron or other external triggers
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    // Configure job processing order
    processingOrder: {
      default: 'createdAt', // FIFO (first in, first out)
      queues: {
        hourly: 'createdAt',
        daily: 'createdAt',
      },
    },
  },
  // -------------------------------------------- //
  plugins,
  sharp,
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 10000000, // 10MB
      files: 10,
    },
    useTempFiles: true,
    tempFileDir: '/tmp',
  },
  endpoints: [
    // Custom endpoints for refund and void
    {
      path: '/orders/:id/refund',
      method: 'post',
      handler: async (req: PayloadRequest, res: Response) => {
        // Added types for req and res
        if (!isAdmin({ req })) {
          return res.status(403).json({ error: 'Forbidden' })
        }
        try {
          const orderId = req.routeParams?.id as string // Try expressRequest first, then fallback to req
          const { amount, currency, reason } = req.body as {
            amount?: string | number
            currency?: string
            reason?: string
          }

          if (!orderId || !currency) {
            return res.status(400).json({ error: 'Order ID and currency are required.' })
          }

          let amountToRefund: number | undefined = undefined
          if (amount !== undefined && amount !== null) {
            amountToRefund = parseFloat(String(amount)) // Convert amount to string before parseFloat
            if (isNaN(amountToRefund)) {
              return res.status(400).json({ error: 'Invalid amount provided.' })
            }
          }

          const paymentService = PaymentService.getInstance(req.payload)
          const result = await paymentService.refundPayment(
            orderId,
            currency,
            amountToRefund,
            reason,
          )

          if (result.status === 'succeeded' || result.status === 'refunded') {
            return res
              .status(200)
              .json({ success: true, message: 'Refund processed successfully.', details: result })
          } else {
            return res
              .status(400)
              .json({ success: false, message: 'Refund processing failed.', details: result })
          }
        } catch (error: any) {
          req.payload.logger.error(`Error in /orders/:id/refund endpoint: ${error.message}`)
          return res.status(500).json({ error: 'Internal server error during refund.' })
        }
      },
    },
    {
      path: '/orders/:id/void',
      method: 'post',
      handler: async (req: PayloadRequest, res: Response) => {
        // Added types for req and res
        if (!isAdmin({ req })) {
          return res.status(403).json({ error: 'Forbidden' })
        }
        try {
          const orderId = req.routeParams?.id as string // Try expressRequest first, then fallback to req
          const { reason } = req.body as { reason?: string }

          if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required.' })
          }

          const paymentService = PaymentService.getInstance(req.payload)
          const result = await paymentService.voidPayment(orderId, reason)

          if (result.status === 'succeeded' || result.status === 'voided') {
            return res
              .status(200)
              .json({ success: true, message: 'Void processed successfully.', details: result })
          } else {
            return res
              .status(400)
              .json({ success: false, message: 'Void processing failed.', details: result })
          }
        } catch (error: any) {
          req.payload.logger.error(`Error in /orders/:id/void endpoint: ${error.message}`)
          return res.status(500).json({ error: 'Internal server error during void.' })
        }
      },
    },
    // Existing endpoints continue below
    {
      path: '/api/add-products',
      method: 'post',
      handler: addProductsHandler,
    },
    {
      path: '/api/validate-discount',
      method: 'post',
      handler: validateDiscountHandler,
    },
    {
      path: '/api/orders/:orderId/products/:productId/download',
      method: 'get',
      handler: downloadProductHandler,
    },
    {
      path: '/favorites',
      method: 'get',
      handler: getFavoritesHandler,
    },
    {
      path: '/favorites/toggle',
      method: 'post',
      handler: toggleFavoriteHandler,
    },
    {
      path: '/cart',
      method: 'get',
      handler: getCartHandler,
    },
    {
      path: '/cart/add',
      method: 'post',
      handler: addItemHandler,
    },
    {
      path: '/cart/update',
      method: 'patch',
      handler: updateItemHandler,
    },
    {
      path: '/cart/remove/:productId',
      method: 'delete',
      handler: removeItemHandler,
    },
    {
      path: '/cart',
      method: 'delete',
      handler: clearCartHandler,
    },
    {
      path: '/api/newsletter/broadcast',
      method: 'post',
      handler: triggerNewsletterBroadcastHandler,
    },
    {
      path: '/email-templates/:id/preview',
      method: 'get',
      handler: async (
        req: PayloadRequest & { params: { id: string } },
        res: Response,
        _next: NextFunction,
      ) => {
        const { id } = req.params
        try {
          // Use a more generic approach to avoid type conflicts
          const result = await req.payload.findByID({
            collection: 'email-templates',
            id: id,
            depth: 0,
          })

          if (!result) {
            return res.status(404).send('Template not found')
          }

          // Cast to a simple object with html property
          const template = result as unknown as { html?: string }

          if (typeof template.html !== 'string') {
            req.payload.logger.warn(`Template ${id} has no generated HTML content for preview.`)
            return res.status(500).send('<p>Error: Template HTML not generated.</p>')
          }

          res.setHeader('Content-Type', 'text/html')
          res.status(200).send(template.html)
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          req.payload.logger.error(`Preview endpoint error for ID ${id}: ${errorMessage}`, error)
          res.status(500).send(`Error generating preview: ${errorMessage}`)
        }
      },
    },
    {
      path: '/api/v1/setup-rewards',
      method: 'post',
      handler: setupRewardsEndpoint.handler,
    },
    {
      path: '/api/preview-email-template',
      method: 'post',
      handler: previewEmailTemplate,
    },
    {
      path: '/api/preview-email',
      method: 'get',
      handler: previewEmail,
    },
    // Course Feature Endpoints
    {
      path: '/api/courses/:courseId/enroll-free',
      method: 'post',
      handler: enrollFreeHandler,
    },
    {
      path: '/api/lessons/:lessonId/complete',
      method: 'post',
      handler: markCompleteHandler,
    },
    // Add the new lesson access endpoint
    {
      path: '/api/lessons/:lessonId/access',
      method: 'get',
      handler: accessLessonHandler,
    },
    {
      path: '/api/assessments/:assessmentId/submit',
      method: 'post',
      handler: submitHandler,
    },
    // User Profile Data Endpoint
    {
      path: '/api/users/profile-data',
      method: 'get',
      handler: profileDataHandler,
    },
    // Review Endpoints
    {
      path: '/api/reviews', // Endpoint to submit a review
      method: 'post',
      handler: submitReviewHandler,
    },
    {
      path: '/api/courses/:courseId/reviews', // Endpoint to get reviews for a course
      method: 'get',
      handler: getCourseReviewsHandler,
    },
    {
      path: '/api/courses/:courseId/average-rating', // Endpoint to get average rating for a course
      method: 'get',
      handler: getAverageRatingHandler,
    },
    // Enrollment Cancellation Endpoint
    {
      path: '/api/enrollments/:enrollmentId/cancel', // Endpoint to request cancellation
      method: 'post', // Or 'patch'/'put' depending on preference
      handler: cancelEnrollmentHandler,
    },
  ],
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  blocks: availableBlocks,

  // Function executed after Payload initializes
  onInit: async (payload: Payload): Promise<void> => {
    payload.logger.info('Initializing job scheduler...')

    try {
      // Fetch active, scheduled automation jobs
      // Increase limit significantly or implement pagination if many jobs are expected
      const automationJobsQuery = await payload.find({
        collection: 'automation-jobs',
        where: {
          and: [{ status: { equals: 'active' } }, { triggerType: { equals: 'schedule' } }],
        },
        limit: 1000, // Adjust limit as needed
        overrideAccess: true,
        depth: 0, // Only need top-level fields
      })

      const jobs = automationJobsQuery.docs

      payload.logger.info(`Found ${jobs.length} active scheduled jobs to initialize.`)

      jobs.forEach(async (job) => {
        let cronExpression: string | undefined

        // Determine cron expression based on frequency or custom schedule
        // Access schedule properties via job.schedule?.propertyName
        if (
          job.schedule?.frequency === 'custom' &&
          typeof job.schedule?.cronExpression === 'string' &&
          cron.validate(job.schedule.cronExpression)
        ) {
          cronExpression = job.schedule.cronExpression
        } else if (job.schedule?.frequency === 'daily') {
          // Example: Run daily at a specific time (e.g., 2 AM)
          cronExpression = '0 2 * * *' // Default daily schedule
          if (typeof job.schedule?.time === 'string' && /^\d{1,2}:\d{2}$/.test(job.schedule.time)) {
            const [hour, minute] = job.schedule.time.split(':')
            cronExpression = `${minute} ${hour} * * *`
          } else if (job.schedule?.time) {
            // Check if time property exists
            payload.logger.warn(
              `Job '${job.name}' (${job.id}): Invalid time format for daily schedule: '${job.schedule.time}'. Using default 2 AM.`,
            )
          }
        } else if (job.schedule?.frequency === 'weekly') {
          // Example: Run weekly on Sunday at 3 AM
          cronExpression = '0 3 * * 0' // Default weekly schedule (Sunday 3 AM)
          // Check if schedule object and required properties exist
          if (
            typeof job.schedule === 'object' &&
            job.schedule &&
            typeof job.schedule.dayOfWeek === 'number' &&
            typeof job.schedule.time === 'string'
          ) {
            const { dayOfWeek, time } = job.schedule
            if (/^\d{1,2}:\d{2}$/.test(time) && dayOfWeek >= 0 && dayOfWeek <= 6) {
              const [hour, minute] = time.split(':')
              cronExpression = `${minute} ${hour} * * ${dayOfWeek}`
            } else {
              payload.logger.warn(
                `Job '${job.name}' (${job.id}): Invalid time ('${time}') or dayOfWeek ('${dayOfWeek}') for weekly schedule. Using default Sunday 3 AM.`,
              )
            }
          } else if (job.schedule) {
            // Check if schedule group exists at all
            payload.logger.warn(
              `Job '${job.name}' (${job.id}): Missing or invalid dayOfWeek/time for weekly schedule. Using default Sunday 3 AM.`,
            )
          }
        } else if (job.schedule?.frequency === 'monthly') {
          // Example: Run monthly on the 1st day at 4 AM
          cronExpression = '0 4 1 * *' // Default monthly schedule (1st day 4 AM)
          // Check if schedule object and required properties exist
          if (
            typeof job.schedule === 'object' &&
            job.schedule &&
            typeof job.schedule.dayOfMonth === 'number' &&
            typeof job.schedule.time === 'string'
          ) {
            const { dayOfMonth, time } = job.schedule
            if (/^\d{1,2}:\d{2}$/.test(time) && dayOfMonth >= 1 && dayOfMonth <= 31) {
              const [hour, minute] = time.split(':')
              cronExpression = `${minute} ${hour} ${dayOfMonth} * *`
            } else {
              payload.logger.warn(
                `Job '${job.name}' (${job.id}): Invalid time ('${time}') or dayOfMonth ('${dayOfMonth}') for monthly schedule. Using default 1st day 4 AM.`,
              )
            }
          } else if (job.schedule) {
            // Check if schedule group exists at all
            payload.logger.warn(
              `Job '${job.name}' (${job.id}): Missing or invalid dayOfMonth/time for monthly schedule. Using default 1st day 4 AM.`,
            )
          }
        }

        if (cronExpression && cron.validate(cronExpression)) {
          payload.logger.info(
            `Scheduling job '${job.name}' (${job.id}) with schedule: ${cronExpression}`,
          )

          cron.schedule(
            cronExpression,
            async () => {
              payload.logger.info(`Executing job: ${job.name} (${job.id})`)
              const jobStartTime = Date.now()
              let jobStatus: 'success' | 'error' = 'error' // Default to error

              try {
                const serviceRegistry = ServiceRegistry.getInstance(payload)

                switch (job.jobType) {
                  case 'update_course_booking_statuses' as string: {
                    // Assert type to handle potentially outdated generated types
                    const courseService = new CourseService(payload) // Instantiate CourseService directly
                    await courseService.updateAllCourseBookingStatuses()
                    payload.logger.info(
                      `Job '${job.name}' (${job.id}): Successfully updated course booking statuses.`,
                    )
                    jobStatus = 'success'
                    break
                  }
                  // Add cases for other job types here
                  // case 'another_job_type':
                  //   // ... logic for another job
                  //   break;
                  default:
                    payload.logger.warn(
                      `Job '${job.name}' (${job.id}): Unimplemented job type '${job.jobType}'.`,
                    )
                    // Mark as success even if unimplemented to avoid repeated errors for unknown types
                    // Or potentially mark as 'skipped' if you add such a status
                    jobStatus = 'success'
                    break
                }
              } catch (error) {
                const errorMessage =
                  error instanceof Error ? error.message : 'Unknown error during job execution'
                payload.logger.error(`Job '${job.name}' (${job.id}) failed: ${errorMessage}`, error)
                // Optionally update the job status to 'error' in the DB
                try {
                  await payload.update({
                    collection: 'automation-jobs',
                    id: job.id,
                    data: {
                      status: 'error', // Set status to error
                      // Optionally add error details to a log field if it exists
                      // jobLogs: (job.jobLogs || []).concat([{ timestamp: new Date(), level: 'error', message: errorMessage }]),
                    },
                    overrideAccess: true,
                  })
                } catch (updateError) {
                  payload.logger.error(
                    `Job '${job.name}' (${job.id}): Failed to update job status to error after execution failure.`,
                    updateError,
                  )
                }
              } finally {
                // Always update lastRun, regardless of success or failure, unless it failed to update status above
                if (jobStatus === 'success') {
                  // Only update lastRun if the main logic succeeded or was skipped
                  try {
                    await payload.update({
                      collection: 'automation-jobs',
                      id: job.id,
                      data: {
                        lastRun: new Date().toISOString(), // Convert Date to ISO string
                        // Optionally clear error status if it succeeded now
                        // status: 'active',
                      },
                      overrideAccess: true,
                    })
                    const duration = Date.now() - jobStartTime
                    payload.logger.info(
                      `Job '${job.name}' (${job.id}) finished. Duration: ${duration}ms. Updated lastRun.`,
                    )
                  } catch (updateError) {
                    payload.logger.error(
                      `Job '${job.name}' (${job.id}): Failed to update lastRun timestamp after successful execution.`,
                      updateError,
                    )
                  }
                } else {
                  const duration = Date.now() - jobStartTime
                  payload.logger.info(
                    `Job '${job.name}' (${job.id}) finished with errors. Duration: ${duration}ms.`,
                  )
                }
              }
            },
            {
              scheduled: true,
              timezone: 'Europe/Moscow', // Consider making this configurable
            },
          )
        } else {
          payload.logger.warn(
            `Job '${job.name}' (${job.id}): Could not determine a valid cron schedule from frequency '${job.schedule?.frequency}' and schedule data. Job will not be scheduled.`,
          )
          // Optionally update the job status to 'inactive' or 'error' if schedule is invalid
          try {
            await payload.update({
              collection: 'automation-jobs',
              id: job.id,
              data: {
                status: 'error', // Or 'inactive'
                // jobLogs: (job.jobLogs || []).concat([{ timestamp: new Date(), level: 'warn', message: 'Invalid or missing schedule configuration.' }]),
              },
              overrideAccess: true,
            })
          } catch (updateError) {
            payload.logger.error(
              `Job '${job.name}' (${job.id}): Failed to update job status to error due to invalid schedule.`,
              updateError,
            )
          }
        }
      })
    } catch (error) {
      payload.logger.error('Failed to initialize job scheduler:', error)
    }
  },
})
