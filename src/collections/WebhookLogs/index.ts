import type { CollectionConfig } from 'payload/types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Коллекция для логирования webhook вызовов
 * Хранит детальную информацию о всех исходящих webhook запросах
 */
export const WebhookLogs: CollectionConfig = {
  slug: 'webhook-logs',
  labels: {
    singular: 'Webhook Log',
    plural: 'Webhook Logs',
  },
  admin: {
    useAsTitle: 'url',
    defaultColumns: ['url', 'eventType', 'status', 'statusCode', 'responseTime', 'createdAt'],
    group: 'Integrations',
    description: 'Detailed logs of all outgoing webhook requests',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'manager'
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'system'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Webhook URL',
      admin: {
        description: 'The URL that was called',
      },
    },
    {
      name: 'eventId',
      type: 'text',
      required: true,
      label: 'Event ID',
      admin: {
        description: 'ID of the event that triggered this webhook',
      },
    },
    {
      name: 'eventType',
      type: 'text',
      required: true,
      label: 'Event Type',
      admin: {
        description: 'Type of event that was sent',
      },
    },
    {
      name: 'subscriptionId',
      type: 'relationship',
      relationTo: 'event-subscriptions',
      label: 'Subscription',
      admin: {
        description: 'The subscription that triggered this webhook',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Status',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
        { label: 'Timeout', value: 'timeout' },
        { label: 'Retrying', value: 'retrying' },
      ],
      admin: {
        description: 'Status of the webhook call',
      },
    },
    {
      name: 'statusCode',
      type: 'number',
      label: 'HTTP Status Code',
      admin: {
        description: 'HTTP status code returned by the webhook endpoint',
      },
    },
    {
      name: 'attempt',
      type: 'number',
      defaultValue: 1,
      min: 1,
      label: 'Attempt Number',
      admin: {
        description: 'Which attempt this was (for retries)',
      },
    },
    {
      name: 'responseTime',
      type: 'number',
      label: 'Response Time (ms)',
      admin: {
        description: 'Time taken for the request in milliseconds',
      },
    },
    {
      name: 'error',
      type: 'textarea',
      label: 'Error Message',
      admin: {
        condition: (data) => data.status === 'failed' || data.status === 'timeout',
        description: 'Error message if the webhook failed',
      },
    },
    {
      name: 'requestHeaders',
      type: 'json',
      label: 'Request Headers',
      admin: {
        description: 'Headers sent with the webhook request',
      },
    },
    {
      name: 'requestBody',
      type: 'json',
      label: 'Request Body',
      admin: {
        description: 'Body of the webhook request (event payload)',
      },
    },
    {
      name: 'responseHeaders',
      type: 'json',
      label: 'Response Headers',
      admin: {
        condition: (data) => data.status === 'success',
        description: 'Headers returned by the webhook endpoint',
      },
    },
    {
      name: 'responseBody',
      type: 'json',
      label: 'Response Body',
      admin: {
        condition: (data) => data.status === 'success',
        description: 'Body returned by the webhook endpoint',
      },
    },
    {
      name: 'signature',
      type: 'text',
      label: 'Signature',
      admin: {
        description: 'HMAC signature sent with the request (if configured)',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      defaultValue: 'FlowMasters-Webhook/1.0',
      label: 'User Agent',
      admin: {
        description: 'User agent string sent with the request',
      },
    },
    {
      name: 'timeout',
      type: 'number',
      label: 'Timeout (ms)',
      admin: {
        description: 'Timeout value used for this request',
      },
    },
    {
      name: 'retryAfter',
      type: 'date',
      label: 'Retry After',
      admin: {
        condition: (data) => data.status === 'retrying',
        description: 'When this webhook will be retried',
      },
    },
    // Метрики производительности
    {
      name: 'dnsLookupTime',
      type: 'number',
      label: 'DNS Lookup Time (ms)',
      admin: {
        description: 'Time taken for DNS lookup',
      },
    },
    {
      name: 'connectionTime',
      type: 'number',
      label: 'Connection Time (ms)',
      admin: {
        description: 'Time taken to establish connection',
      },
    },
    {
      name: 'tlsHandshakeTime',
      type: 'number',
      label: 'TLS Handshake Time (ms)',
      admin: {
        description: 'Time taken for TLS handshake (HTTPS only)',
      },
    },
    {
      name: 'firstByteTime',
      type: 'number',
      label: 'Time to First Byte (ms)',
      admin: {
        description: 'Time until first byte of response was received',
      },
    },
    // Информация о сервере
    {
      name: 'serverIp',
      type: 'text',
      label: 'Server IP',
      admin: {
        description: 'IP address of the webhook server',
      },
    },
    {
      name: 'serverLocation',
      type: 'text',
      label: 'Server Location',
      admin: {
        description: 'Geographic location of the webhook server',
      },
    },
    // Отладочная информация
    {
      name: 'debugInfo',
      type: 'json',
      label: 'Debug Information',
      admin: {
        description: 'Additional debug information for troubleshooting',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        description: 'Tags for categorizing and filtering webhook logs',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Автоматически добавляем теги на основе статуса и типа события
        if (operation === 'create') {
          const tags = data.tags || []
          
          // Добавляем тег статуса
          if (data.status && !tags.some((t: any) => t.tag === data.status)) {
            tags.push({ tag: data.status })
          }
          
          // Добавляем тег типа события
          if (data.eventType && !tags.some((t: any) => t.tag === data.eventType)) {
            tags.push({ tag: data.eventType })
          }
          
          // Добавляем тег домена
          if (data.url) {
            try {
              const domain = new URL(data.url).hostname
              if (!tags.some((t: any) => t.tag === domain)) {
                tags.push({ tag: domain })
              }
            } catch (error) {
              // Игнорируем ошибки парсинга URL
            }
          }
          
          data.tags = tags
        }
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // Логируем критические ошибки
        if (doc.status === 'failed' && doc.attempt >= 3) {
          logError(`Critical webhook failure: ${doc.url} for event ${doc.eventType}`)
          // TODO: Отправить алерт администраторам
        }
        
        // Логируем медленные запросы
        if (doc.responseTime && doc.responseTime > 10000) { // > 10 секунд
          logWarn(`Slow webhook response: ${doc.url} took ${doc.responseTime}ms`)
        }
      },
    ],
  },
}
