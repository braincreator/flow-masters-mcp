import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'flow-masters-bucket.s3.cloud.ru',
      // Keep any existing domains you have
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flow-masters-bucket.s3.cloud.ru',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  experimental: {
    // Optimize memory usage
    optimizeServerReact: true,
    serverMinification: true,
    // Disable features you don't need
    serverComponents: true,
    optimizeCss: true,
    streaming: true,
    serverActions: true,
  },
  // Add memory-specific settings
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 15 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  transpilePackages: ['payload-admin', 'payload'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Add optimization for production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000, // Add maxSize to limit chunk size
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1]
                return `npm.${packageName.replace('@', '')}`
              },
              chunks: 'all'
            }
          }
        }
      }
    }

    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
      },
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx'],
      }
    }

    return config
  }
}

export default withPayload(nextConfig)
