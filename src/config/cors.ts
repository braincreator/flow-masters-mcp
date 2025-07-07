/**
 * CORS Configuration for FlowMasters
 * Centralized configuration for Cross-Origin Resource Sharing
 */

export const CORS_CONFIG = {
  // Production domains
  PRODUCTION_ORIGINS: [
    'https://flow-masters.ru',
    'https://www.flow-masters.ru',
    'https://admin.flow-masters.ru',
    'https://api.flow-masters.ru',
  ],

  // FlowMasters ecosystem services
  ECOSYSTEM_ORIGINS: [
    'https://n8n.flow-masters.ru',
    'https://flowise.flow-masters.ru',
    'https://openwebui.flow-masters.ru',
    'https://letta.flow-masters.ru',
    'https://crawl4ai.flow-masters.ru',
    'https://qdrant.flow-masters.ru',
    'https://weaviate.flow-masters.ru',
  ],

  // Monitoring and admin services
  MONITORING_ORIGINS: [
    'https://grafana.flow-masters.ru',
    'https://prometheus.flow-masters.ru',
    'https://cadvisor.flow-masters.ru',
    'https://coolify.flow-masters.ru',
  ],

  // Development origins
  DEVELOPMENT_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3030',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:3030',
  ],

  // Allowed methods
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],

  // Allowed headers
  ALLOWED_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name',
    'X-API-Key',
    'X-Client-Version',
    'X-Request-ID',
  ],

  // Exposed headers (headers that the client can access)
  EXPOSED_HEADERS: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Request-ID',
    'X-Response-Time',
  ],

  // Cache duration for preflight requests (in seconds)
  MAX_AGE: 86400, // 24 hours

  // Whether to allow credentials
  ALLOW_CREDENTIALS: true,
} as const

/**
 * API-specific CORS configurations
 */
export const API_CORS_CONFIG = {
  // Public API endpoints (more permissive)
  PUBLIC_ENDPOINTS: [
    '/api/health',
    '/api/health',
    '/api/globals',
    '/api/globals',
    '/api/posts',
    '/api/posts',
    '/api/categories',
    '/api/categories',
    '/api/tags',
    '/api/tags',
  ],

  // Protected API endpoints (stricter CORS)
  PROTECTED_ENDPOINTS: [
    '/api/users',
    '/api/users',
    '/api/admin',
    '/api/admin',
    '/api/auth',
    '/api/auth',
    '/api/payments',
    '/api/payments',
    '/api/orders',
    '/api/orders',
  ],

  // Internal API endpoints (most restrictive)
  INTERNAL_ENDPOINTS: [
    '/api/revalidate',
    '/api/revalidate',
    '/api/cron',
    '/api/cron',
    '/api/webhooks',
    '/api/webhooks',
    '/api/monitoring',
    '/api/monitoring',
  ],
} as const

/**
 * Environment-specific configurations
 */
export const ENV_CORS_CONFIG = {
  development: {
    allowAllOrigins: true,
    strictMode: false,
    logRequests: true,
  },

  staging: {
    allowAllOrigins: false,
    strictMode: true,
    logRequests: true,
  },

  production: {
    allowAllOrigins: false,
    strictMode: true,
    logRequests: false,
  },
} as const
