// @ts-check
import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'flow-masters-bucket.s3.cloud.ru',
      'raw.githubusercontent.com',
      'github.com',
      'localhost',
      'payload-cms.imgix.net',
      'images.unsplash.com',
    ].filter(Boolean),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flow-masters-bucket.s3.cloud.ru',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.github.com',
      },
      {
        protocol: 'https',
        hostname: 'payload-cms.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  experimental: {
    optimizeServerReact: true,
    serverMinification: true,
    optimizeCss: true,
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
  transpilePackages: ['payload-admin', 'payload'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Add CSS optimization settings
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      }
    }
    return config
  },
}

export default withPayload(nextConfig)
