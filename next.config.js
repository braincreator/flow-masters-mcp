import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: process.env.NEXT_PUBLIC_SERVER_URL 
          ? new URL(process.env.NEXT_PUBLIC_SERVER_URL).hostname 
          : 'localhost',
        protocol: 'https',
      },
      {
        hostname: `${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT}`,
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
}

export default withPayload(nextConfig)
