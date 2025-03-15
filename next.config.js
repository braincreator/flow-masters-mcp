import { withPayload } from '@payloadcms/next/withPayload'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      {
        hostname: 'flow-masters-bucket.s3.cloud.ru',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  // experimental: {
  //   // Enable Turbopack
  //   turbo: true,
  // },
  // ... other config options
}

export default withPayload(nextConfig)
