export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URI: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters',
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'your-secret-key',
  CRON_SECRET: process.env.CRON_SECRET || 'your-cron-secret',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
  S3_BUCKET: 'flow-masters-bucket.s3.cloud.ru',
} as const

export const IS_PRODUCTION = ENV.NODE_ENV === 'production'
export const IS_DEVELOPMENT = ENV.NODE_ENV === 'development'
export const IS_TEST = ENV.NODE_ENV === 'test'