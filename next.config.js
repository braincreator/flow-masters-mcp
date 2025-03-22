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
    // Enable React server components
    serverComponents: true,
    // Optimize memory usage
    optimizeCss: true,
    // Enable streaming
    streaming: true
  },

  // Modify webpack config to handle workers better
  webpack: (config, { dev, isServer }) => {
    // Add worker-loader configuration
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.worker\.(js|ts)$/,
          use: { 
            loader: 'worker-loader',
            options: { inline: 'no-fallback' }
          }
        }
      ]
    }

    // Add optimization for production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          minRemainingSize: 0,
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

    return config
  }
}

export default withPayload(nextConfig)
