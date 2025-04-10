// @ts-check
import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

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
  distDir: '.next',
  assetPrefix: '',
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  experimental: {
    optimizeCss: true,
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
  turbopack: true,
  serverExternalPackages: ['mongoose'],

  transpilePackages: [
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
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      }
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
}

export default withPayload(nextConfig)
