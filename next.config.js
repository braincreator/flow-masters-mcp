import { withPayload } from '@payloadcms/next/withPayload'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

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
  webpack: (config, { isServer }) => {
    // Add MiniCssExtractPlugin
    if (!isServer) {
      config.plugins.push(
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash].css',
          chunkFilename: 'static/css/[name].[contenthash].css',
        }),
      )
    }

    return config
  },
  async headers() {
    return [
      {
        source: '/api/revalidate',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
