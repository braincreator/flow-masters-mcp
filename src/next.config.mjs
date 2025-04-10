/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: true,
  images: {
    // ... existing code ...
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
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:3002'],
    },
  },

  serverExternalPackages: ['mongoose'],

  // ... existing code ...
}
