import type { Payload, PayloadRequest } from 'payload'
import { Response, NextFunction } from 'express'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { getServerSideURL } from './utilities/getURL'
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

// Use a string path for the MetricsDashboard component
// This ensures compatibility with the importMap generation
const dashboardPath = '@/components/admin/MetricsDashboard'

// --- Определяем интерфейс для входных данных задачи --- //
interface RecalculateSegmentsInput {
  userId: string
}
// ----------------------------------------------------- //

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  secret: ENV.PAYLOAD_SECRET,
  auth: authConfig,
  admin: {
    // Specify which collection can access the admin panel
    user: Users.slug,

    // Custom components for the admin panel
    components: {
      // Define custom views
      views: {
        monitoring: {
          path: '/monitoring',
          Component: dashboardPath,
        },
        landingGenerator: {
          path: '/landing-generator',
          Component: '@/components/admin/LandingGeneratorView',
        },
        setupRewards: {
          path: '/admin/setup-rewards',
          Component: '@/app/(admin)/admin/setup-rewards/page',
        },
        courseCreator: {
          path: '/course-creator',
          Component: '@/components/admin/CourseCreatorView',
        },
        analytics: {
          path: '/analytics',
          Component: '@/components/admin/AnalyticsView',
        },
        emailCampaigns: {
          path: '/email-campaigns',
          Component: '@/components/admin/EmailCampaignView',
        },
        endpoints: {
          path: '/endpoints',
          Component: '@/app/admin/endpoints/page',
        },
      },
      // Custom navigation components
      afterNavLinks: ['@/components/admin/CustomNavigation'],
      // Custom branding
      graphics: {
        Logo: '@/components/admin/CustomLogo',
        Icon: '@/components/admin/CustomIcon',
      },
      // Custom header
      header: ['@/components/admin/CustomHeader'],
      // Custom actions in the header
      actions: ['@/components/admin/CustomAction'],
      // Other component overrides
      beforeLogin: ['@/components/admin/CustomLoginMessage'],
      beforeDashboard: ['@/components/admin/CustomDashboard'],
      // Custom providers
      providers: ['@/components/admin/CustomProvider'],
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

  cors: [getServerSideURL()].filter(Boolean),
  collections: [...collections, Assessments, CourseReviews, AssessmentSubmissions, LearningPaths, WaitingListEntries], // Add WaitingListEntries
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
    },
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
})
