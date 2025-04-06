import type { Payload } from 'payload'
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
  ],
})
