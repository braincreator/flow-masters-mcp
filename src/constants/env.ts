export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URI: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters',
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || '08c93b8544167b018efded89',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
  // S3 Configuration - separate bucket name from endpoint
  S3_BUCKET: process.env.S3_BUCKET || 'flow-masters-bucket',
  S3_ENDPOINT: process.env.S3_ENDPOINT || 's3.cloud.ru',
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || '',
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || '',
  S3_REGION: process.env.S3_REGION || 'ru-central-1',
  PAYLOAD_SMTP_HOST: process.env.PAYLOAD_SMTP_HOST || 'smtp.timeweb.ru',
  PAYLOAD_SMTP_PORT: process.env.PAYLOAD_SMTP_PORT || '465',
  PAYLOAD_SMTP_USER: process.env.PAYLOAD_SMTP_USER || 'admin@flow-masters.ru',
  PAYLOAD_SMTP_PASSWORD: process.env.PAYLOAD_SMTP_PASSWORD || 'directus',
  PAYLOAD_DEFAULT_SENDER_EMAIL: process.env.PAYLOAD_DEFAULT_SENDER_EMAIL || 'admin@flow-masters.ru',
  PAYLOAD_DEFAULT_SENDER_NAME: process.env.PAYLOAD_DEFAULT_SENDER_NAME || 'Flow Masters',
  CALENDLY_WEBHOOK_SECRET: process.env.CALENDLY_WEBHOOK_SECRET || '',
} as const

export const IS_PRODUCTION = ENV.NODE_ENV === 'production'
export const IS_DEVELOPMENT = ENV.NODE_ENV === 'development'
export const IS_TEST = ENV.NODE_ENV === 'test'
