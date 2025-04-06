import type { Payload, BasePayload } from 'payload'
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

// Импортируем функцию отправки рассылки
import { sendNewsletterToAllPaginated } from './utilities/emailService'

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

// Типы для данных задачи
interface NewsletterBroadcastJobData {
  title: string
  content: string
  locale?: string
}

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
    // Определяем сами задачи в свойстве tasks
    tasks: [
      {
        name: 'newsletter-broadcast',
        // @ts-ignore
        handler: async ({ job, payload }: { job: any; payload: BasePayload }) => {
          const { title, content, locale } = job.data as NewsletterBroadcastJobData
          const jobID = job.id // Сохраняем ID задачи для отчета

          payload.logger.info(`Job ${jobID}: Starting newsletter broadcast job...`)
          let results: any // Используем any для типа результатов, т.к. он сложный
          let jobStatus: 'completed' | 'failed' = 'failed' // Статус по умолчанию - ошибка

          try {
            const fullPayload = payload as Payload

            results = await sendNewsletterToAllPaginated(fullPayload, title, content, locale)

            jobStatus = 'completed' // Если дошли сюда, задача завершена
            payload.logger.info(
              `Job ${jobID}: Newsletter broadcast job completed. Sent: ${results.successfullySent}, Failed: ${results.failedToSend}`,
            )
          } catch (error: any) {
            payload.logger.error(
              `Job ${jobID}: Newsletter broadcast job failed during execution: ${error.message}`,
            )
            // Оставляем jobStatus = 'failed'
            // Можно добавить детали ошибки в results, если sendNewsletterToAllPaginated не вернула их
            if (!results) {
              results = { errors: [{ error: `Job execution failed: ${error.message}` }] }
            }
            // Не перевыбрасываем ошибку здесь, чтобы сохранить отчет
          } finally {
            // --- Сохранение отчета в коллекцию --- //
            try {
              // @ts-ignore // Игнорируем ошибки типизации до регенерации payload-types.ts
              await payload.create({
                collection: 'broadcast-reports', // Слаг нашей коллекции отчетов
                data: {
                  jobID: jobID,
                  status: jobStatus,
                  broadcastTitle: title,
                  broadcastLocale: locale || 'all',
                  totalSubscribers: results?.totalSubscribers ?? 0,
                  successfullySent: results?.successfullySent ?? 0,
                  failedToSend: results?.failedToSend ?? 0,
                  errors: results?.errors ?? [{ error: 'No results available' }],
                },
              })
              payload.logger.info(`Job ${jobID}: Broadcast report saved successfully.`)
            } catch (reportError: any) {
              payload.logger.error(
                `Job ${jobID}: FATAL - Failed to save broadcast report: ${reportError.message}`,
              )
              // Если не удалось сохранить отчет, это критическая ошибка
            }
            // Если исходная задача упала, перевыбрасываем ошибку, чтобы BullMQ знал
            if (jobStatus === 'failed') {
              throw new Error(`Newsletter broadcast job ${jobID} failed.`)
            }
          }
        },
        // Добавляем настройки повторных попыток
        maxRetries: 3, // Максимум 3 повторные попытки
        backoff: {
          delay: 60000, // Начальная задержка 1 минута
          type: 'exponential', // Увеличивать задержку экспоненциально
        },
        // priority: 'medium',
      },
      // Можно добавить другие задачи здесь
    ],
    // Можно добавить общие настройки очереди здесь, если нужно
    // adapter: ...,
    // defaultQueueName: ...
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
