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
