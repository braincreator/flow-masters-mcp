// @ts-check
import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'
import createNextIntlPlugin from 'next-intl/plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'

// Импортируем пакеты, которые использовались через require.resolve
import cryptoBrowserify from 'crypto-browserify'
import streamBrowserify from 'stream-browserify'
import buffer from 'buffer'
import util from 'util'
import pathBrowserify from 'path-browserify'
import osBrowserify from 'os-browserify/browser.js'
import streamHttp from 'stream-http'
import httpsBrowserify from 'https-browserify'
import zlib from 'browserify-zlib'
import process from 'process/browser.js'

// Получаем пути к модулям
const getModulePath = (pkg) => {
  try {
    return fileURLToPath(new URL(`node_modules/${pkg}`, import.meta.url))
  } catch (e) {
    return pkg
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
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
      {
        protocol: 'https',
        hostname: 'registry.npmmirror.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'unpkg.com',
      },
      {
        protocol: 'https',
        hostname: 'docs.flowiseai.com',
      },
      {
        protocol: 'https',
        hostname: '**.gitbook.io',
      },
      {
        protocol: 'https',
        hostname: '**.appspot.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Оптимизация изображений
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 часа
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // output: 'standalone', // Отключено для использования обычного режима с Turbopack
  distDir: '.next',
  assetPrefix: '',
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  experimental: {
    optimizeCss: true,
    // Включаем оптимизацию пакетов
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@payloadcms/ui'],
    // Оптимизации памяти
    serverActions: {
      allowedOrigins: [
        'flow-masters.ru',
        'n8n.flow-masters.ru',
        'localhost:3000',
        'localhost:3030',
        'localhost:3001',
        'localhost:3002',
      ],
    },
  },

  // Настройки кэширования
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=31536000',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  turbopack: {},
  serverExternalPackages: ['mongoose'],

  transpilePackages: [
    '@payloadcms/ui',
    'payload-admin',
    '@aws-sdk/client-s3',
    '@aws-sdk/lib-storage',
    '@aws-sdk/s3-request-presigner',
    '@payloadcms/storage-s3',
    '@aws-sdk/client-cognito-identity',
    '@aws-sdk/credential-provider-cognito-identity',
    '@aws-sdk/types',
    '@aws-sdk/util-utf8-browser',
    '@aws-sdk/smithy-client',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Add CSS optimization settings and fix worker_threads issue
  webpack: (config, { dev, isServer, webpack }) => {
    // Оптимизации памяти для webpack
    if (!dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        maxSize: 244000, // Ограничиваем размер чанков до 244KB
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          styles: {
            name: 'styles',
            test: /\.(css|scss)$/,
            chunks: 'all',
            enforce: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000,
          },
          // Отдельный чанк для Payload CMS
          payload: {
            test: /[\\/]node_modules[\\/]@payloadcms[\\/]/,
            name: 'payload',
            chunks: 'all',
            priority: 10,
          },
          // Отдельный чанк для React
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
        },
      }

      // Ограничиваем количество параллельных запросов
      config.optimization.splitChunks.maxAsyncRequests = 5
      config.optimization.splitChunks.maxInitialRequests = 3

      // Минификация CSS
      config.optimization.minimizer.push(
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        }),
      )
    }

    // Правило для принудительного включения @aws-sdk/client-s3 в бандл
    if (isServer) {
      const aws = config.externals.find(
        (external) =>
          typeof external !== 'string' && external.indexOf && external.indexOf('@aws-sdk') > -1,
      )
      if (aws) {
        config.externals = config.externals.filter((external) => external !== aws)
      }
    }

    // Fix for worker_threads issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        worker_threads: false,
        dns: false,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        crypto: getModulePath('crypto-browserify'),
        stream: getModulePath('stream-browserify'),
        buffer: getModulePath('buffer'),
        util: getModulePath('util'),
        path: getModulePath('path-browserify'),
        os: getModulePath('os-browserify/browser.js'),
        http: getModulePath('stream-http'),
        https: getModulePath('https-browserify'),
        zlib: getModulePath('browserify-zlib'),
      }

      // Добавляем полифиллы для буфера и других необходимых модулей
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser.js',
        }),
      )
    }

    return config
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
        locale: false,
      },
    ]
  },
}

const withNextIntl = createNextIntlPlugin('./i18n.ts')

export default withNextIntl(withPayload(nextConfig))
