// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { databaseConnection } from './utilities/payload/database/connection'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { authenticatedOrPublished } from './access/authenticatedOrPublished'
import { authenticated } from './access/authenticated'
import { anyone } from './access/anyone'

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Solutions } from './collections/Solutions'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import collections from './collections/collectionList'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'
import addProductsHandler from './endpoints/add-products'

console.log('Initializing Payload with DATABASE_URI:', process.env.DATABASE_URI)

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
  admin: {
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
    user: Users.slug,
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
  onInit: async (payload) => {
    console.log('Initializing Payload with DATABASE_URI:', process.env.DATABASE_URI)
    try {
      await databaseConnection.connect()
      console.log('Database connection status:', databaseConnection.getConnectionStatus())
    } catch (err) {
      console.error('Failed to initialize database connection:', err)
      process.exit(1)
    }
  },
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
  collections: [Categories, Media, Pages, Posts, Users, Solutions, Products, Orders],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
  upload: {
    limits: {
      fileSize: 10000000, // 10MB
      files: 10,
    },
    useTempFiles: true,
    tempFileDir: '/tmp',
    removeNonExistentFiles: true,
    imageResizing: {
      maxConcurrency: 4,
      maxMemoryPerTask: 512,
    },
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
    // ... other endpoints
  ],
})
