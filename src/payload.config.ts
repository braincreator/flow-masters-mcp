import type { Payload, BasePayload, TaskHandler } from 'payload'
import type { PayloadRequest } from 'payload'

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
// import { Messages } from './collections/Messages'

// Import constants, utils, specific components needed here
import { ENV } from '@/constants/env'
import { Users } from './collections/Users' // Needed for admin.user
import MetricsDashboard from '@/components/admin/MetricsDashboard'
import { Broadcasts } from './collections/Broadcasts'
import { BroadcastReports } from './collections/BroadcastReports'
import { NewsletterBroadcastJobData, SendToAllResult, BroadcastReport } from './jobs/types'

// Импортируем EmailService
import { EmailService } from './services/EmailService'

// Mongoose config (keep as is)
const mongooseConfig = {
  url: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters',
  connectOptions: {
    directConnection: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
    w: 'majority' as const,
    maxPoolSize: 10,
    minPoolSize: 1,
    // Remove deprecated options
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  },
}

// Объявляем тип для нашего обработчика задач
export type JobHandler = TaskHandler<any, any>

// Типизированный TaskHandler должен соответствовать интерфейсу Payload
export type NewsletterTaskHandler = (args: {
  job: {
    input: NewsletterBroadcastJobData
  }
  req: PayloadRequest
}) => Promise<{
  output: {
    status: 'completed' | 'failed'
    results: SendToAllResult
    error?: string
  }
}>

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  secret: ENV.PAYLOAD_SECRET,
  admin: {
    user: Users.slug,
    components: {
      views: {
        monitoring: {
          path: 'monitoring',
          Component: '@/components/admin/MetricsDashboard',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(__dirname),
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
      // Add visual editor configuration
      // visualEditor: {
      //   enabled: true,
      //   toolbarOptions: {
      //     enabled: true,
      //     placement: 'top',
      //   },
      //   blockControls: {
      //     enabled: true,
      //     position: 'left',
      //   },
      // },
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
    defaultFromAddress: ENV.PAYLOAD_DEFAULT_SENDER_EMAIL || 'no-reply@example.com',
    defaultFromName: ENV.PAYLOAD_DEFAULT_SENDER_NAME || 'Payload App',
    transportOptions: {
      host: ENV.PAYLOAD_SMTP_HOST,
      port: parseInt(ENV.PAYLOAD_SMTP_PORT || '587', 10),
      secure: parseInt(ENV.PAYLOAD_SMTP_PORT || '587', 10) === 465,
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
          let results = null
          let status = 'failed'

          try {
            // Используем приведение типов через any
            const data = job.input as any as NewsletterBroadcastJobData

            console.log('Starting newsletter broadcast job', {
              broadcastId: data.broadcastId,
            })

            // Создаем экземпляр EmailService и используем его для рассылки
            const emailService = new EmailService(payload)

            // Используем sendBroadcast, который сам получит настройки SMTP, если они не указаны
            results = await emailService.sendBroadcast(data.title, data.content, data.locale)

            status = 'completed'
            console.log(
              `Job ${data.broadcastId}: Newsletter broadcast job completed. Sent: ${results.successfullySent}, Failed: ${results.failedToSend}`,
            )

            return {
              output: {
                status,
                results,
              },
            }
          } catch (error) {
            console.error('Failed to process newsletter broadcast job', error)

            return {
              output: {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                results,
              },
            }
          }
        },
        retries: {
          attempts: 3,
        },
      },
    ],
    autoRun: [
      {
        cron: '* * * * *',
        limit: 10,
        queue: 'default',
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
  // express: {
  //   json: { limit: '5mb' },
  //   urlencoded: { limit: '5mb', extended: true },
  // },
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
  ],
})
