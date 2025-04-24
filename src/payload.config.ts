import type { Payload, PayloadRequest, PayloadComponent, TaskHandlerArgs } from 'payload'
import { Response, NextFunction } from 'express'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { getServerSideURL } from './utilities/getURL'
import { defaultLexical } from '@/fields/defaultLexical'

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

// Plugins
import { plugins } from './plugins'

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import consolidated lists
import globalsList from '@/globals'
import collections from '@/collections/collectionList'

// Import constants, utils, specific components needed here
import { ENV } from '@/constants/env'
import { Users } from './collections/Users' // Needed for admin.user
import MetricsDashboard from '@/components/admin/MetricsDashboard'
import { Broadcasts } from './collections/Broadcasts'
import { BroadcastReports } from './collections/BroadcastReports'
import { NewsletterBroadcastJobData, SendToAllResult } from './jobs/types'
import { processEmailCampaign } from './jobs/emailCampaign'
import { checkScheduledEmailCampaigns } from './jobs/scheduledEmailCampaigns'
import { checkExpiringRewards } from './jobs/checkExpiringRewards'
import setupRewardsEndpoint from './endpoints/setup-rewards'
// Используем строковый путь к компоненту для настройки наград

import { ServiceRegistry } from '@/services/service.registry'

// Import blocks from central index
import { availableBlocks } from './blocks'

// Mongoose config (keep as is)
const mongooseConfig = {
  url: ENV.DATABASE_URI,
  connectOptions: {
    directConnection: true,
    serverSelectionTimeoutMS: 20000,
    maxPoolSize: 30,
    minPoolSize: 5,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    family: 4,
  },
}

// Объявляем тип для MetricsDashboard компонента
const Dashboard = MetricsDashboard as unknown as PayloadComponent

// --- Определяем интерфейс для входных данных задачи --- //
interface RecalculateSegmentsInput {
  userId: string
}
// ----------------------------------------------------- //

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  secret: ENV.PAYLOAD_SECRET,
  admin: {
    user: Users.slug,
    components: {
      views: {
        monitoring: {
          path: '/monitoring',
          Component: Dashboard,
        },
        landingGenerator: {
          path: '/landing-generator',
          Component: '@/components/admin/LandingGeneratorView',
        },
        setupRewards: {
          path: '/admin/setup-rewards',
          Component: '@/app/(admin)/admin/setup-rewards/page',
        },
      },
    },
    nav: {
      Content: {
        default: true,
      },
      Generators: {
        sections: [
          {
            label: 'Генератор лендингов',
            url: '/landing-generator',
          },
          {
            label: 'Создание курса',
            url: '/course-creator',
          },
        ],
      },
      Marketing: {
        sections: [
          {
            label: 'Email кампании',
            url: '/email-campaigns',
          },
          {
            label: 'Настройка наград',
            url: '/admin/setup-rewards',
          },
        ],
      },
      Analytics: {
        sections: [
          {
            label: 'Аналитика курсов',
            url: '/analytics/courses',
          },
        ],
      },
    },
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
  collections: [...collections],
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

  // --- Добавляем конфигурацию фоновых задач --- //
  jobs: {
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
        },
      },
      {
        slug: 'recalculate-user-segments',
        // Используем any как временное решение для типа input
        handler: async (args: TaskHandlerArgs<any>) => {
          const { job, req } = args
          const payload = req.payload
          // Используем приведение типа для доступа к input
          const inputData = job.input as RecalculateSegmentsInput
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
            // Оставляем @ts-expect-error до регенерации типов
            // @ts-expect-error Property 'segments' does not exist on type 'User' until types are regenerated.
            await payload.update({
              collection: 'users',
              id: userId,
              data: {
                segments: matchingSegmentIds,
              },
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
          // Убираем нестандартное поле `delay`
          // Можно добавить backoff: true, если нужно экспоненциальное увеличение задержки
          // backoff: true,
        },
      },
      // --- КОНЕЦ НОВОЙ ЗАДАЧИ ---

      // Email Campaign Task
      {
        slug: 'email-campaign',
        handler: async (args) => {
          const { job, req } = args
          const payload = req.payload

          try {
            const data = job.input as { campaignId: string }

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
        },
      },
    ],
    autoRun: [
      {
        cron: '* * * * *',
        limit: 10,
        queue: 'default',
      },
      {
        cron: '0 * * * *', // Run every hour
        handler: async ({ payload }) => {
          payload.logger.info('Running scheduled email campaigns check')
          await checkScheduledEmailCampaigns()
          return { success: true }
        },
      },
      {
        cron: '0 10 * * *', // Run every day at 10:00 AM
        handler: async ({ payload }) => {
          payload.logger.info('Running expiring rewards check')
          await checkExpiringRewards()
          return { success: true }
        },
      },
    ],
    shouldAutoRun: async () => true,
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
      handler: async (req: PayloadRequest & { params: any }, res: Response, next: NextFunction) => {
        const { id } = req.params
        try {
          const template: any = await req.payload.findByID({
            collection: 'email-templates',
            id: id,
            depth: 0,
          })

          if (!template) {
            return res.status(404).send('Template not found')
          }

          if (typeof template.html !== 'string') {
            req.payload.logger.warn(`Template ${id} has no generated HTML content for preview.`)
            return res.status(500).send('<p>Error: Template HTML not generated.</p>')
          }

          res.setHeader('Content-Type', 'text/html')
          res.status(200).send(template.html)
        } catch (error: any) {
          req.payload.logger.error(`Preview endpoint error for ID ${id}: ${error.message}`, error)
          res.status(500).send(`Error generating preview: ${error.message}`)
        }
      },
    },
    {
      path: '/api/v1/setup-rewards',
      method: 'post',
      handler: setupRewardsEndpoint.handler,
    },
  ],
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  blocks: availableBlocks,
})
