import type { Payload } from 'payload'
import type { PayloadRequest } from 'payload'

import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { getServerSideURL } from './utilities/getURL'
import collections from './collections/collectionList'
import { defaultLexical } from '@/fields/defaultLexical'

// Import handlers
import addProductsHandler from './endpoints/add-products'
import validateDiscountHandler from './endpoints/validate-discount'
import downloadProductHandler from './endpoints/download-product'

// Import plugins
import { plugins } from './plugins'

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import globals
import { Header } from './Header/config'
import { Footer } from './Footer/config'
import { PaymentProviders } from './globals/PaymentProviders/config'
import { NotificationSettings } from './globals/NotificationSettings'
import { CurrencySettings } from './globals/CurrencySettings'
import { ExchangeRateSettings } from './globals/ExchangeRateSettings'
import { WebhookSettings } from './globals/WebhookSettings'

// Import collections
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Solutions } from './collections/Solutions'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'
import { Integrations } from './collections/Integrations'
import { Events } from './collections/Events'

// Import constants
import { ENV } from '@/constants/env'
import { DATABASE_CONFIG } from '@/constants/index'

// Use the collections array from collectionList.ts
// const payloadCollections = [
//   Categories,
//   Media,
//   Pages,
//   Posts,
//   Users,
//   Solutions,
//   Products,
//   Orders,
//   Integrations,
//   Events,
// ]

// Add more robust connection options
const mongooseConfig = {
  url: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters',
  connectOptions: {
    directConnection: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
    w: 'majority',
    maxPoolSize: 10,
    minPoolSize: 1,
    // Remove deprecated options
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  },
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  secret: ENV.PAYLOAD_SECRET,
  admin: {
    user: Users.slug,
    components: {
      views: [
        {
          path: 'monitoring',
          Component: '@/components/admin/MetricsDashboard',
        },
      ],
    },
    nav: [
      {
        type: 'group',
        label: 'System',
        items: [
          {
            type: 'view',
            label: 'Monitoring',
            path: 'monitoring',
            icon: 'chart',
          },
        ],
      },
    ],
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
    // nav: [
    //   {
    //     type: 'group',
    //     label: 'System',
    //     items: [
    //       {
    //         label: 'Monitoring',
    //         path: '/admin/monitoring',
    //       },
    //     ],
    //   },
    // ],
  },
  // This config helps us configure global or default features that the other editors can inherit
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
  collections: [...collections],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [
    Header,
    Footer,
    PaymentProviders,
    NotificationSettings,
    CurrencySettings,
    ExchangeRateSettings,
    WebhookSettings,
  ],
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
  express: {
    json: { limit: '5mb' },
    urlencoded: { limit: '5mb', extended: true },
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
  ],
})
