import type { CollectionConfig } from 'payload/types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Коллекция для логирования событий и их обработки
 * Хранит информацию о всех отправленных уведомлениях и их статусах
 */
export const EventLogs: CollectionConfig = {
  slug: 'event-logs',
  labels: {
    singular: 'Event Log',
    plural: 'Event Logs',
  },
  admin: {
    useAsTitle: 'eventType',
    defaultColumns: ['eventType', 'channel', 'status', 'attempts', 'createdAt'],
    group: 'Integrations',
    description: 'Event processing logs and notifications history',
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
      name: 'eventId',
      type: 'text',
      required: true,
      label: 'Event ID',
      admin: {
        readOnly: true,
        description: 'Unique identifier of the processed event',
      },
    },
    {
      name: 'eventType',
      type: 'text',
      required: true,
      label: 'Event Type',
      admin: {
        readOnly: true,
        description: 'Type of the event that was processed',
      },
    },
    {
      name: 'subscriptionId',
      type: 'relationship',
      relationTo: 'event-subscriptions',
      label: 'Subscription',
      admin: {
        description: 'The subscription that processed this event',
      },
    },
    {
      name: 'channel',
      type: 'select',
      required: true,
      label: 'Notification Channel',
      options: [
        { label: 'Email', value: 'email' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Slack', value: 'slack' },
        { label: 'Webhook', value: 'webhook' },
        { label: 'SMS', value: 'sms' },
        { label: 'Push', value: 'push' },
        { label: 'WhatsApp', value: 'whatsapp' },
      ],
      admin: {
        description: 'Channel used for notification',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
        { label: 'Retrying', value: 'retrying' },
      ],
      admin: {
        description: 'Current status of the notification',
      },
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 1,
      min: 1,
      label: 'Attempts',
      admin: {
        description: 'Number of delivery attempts',
      },
    },
    {
      name: 'lastAttempt',
      type: 'date',
      required: true,
      label: 'Last Attempt',
      admin: {
        description: 'Timestamp of the last delivery attempt',
      },
    },
    {
      name: 'nextAttempt',
      type: 'date',
      label: 'Next Attempt',
      admin: {
        condition: (data) => data.status === 'retrying',
        description: 'Scheduled time for next retry attempt',
      },
    },
    {
      name: 'error',
      type: 'textarea',
      label: 'Error Message',
      admin: {
        condition: (data) => data.status === 'failed' || data.status === 'retrying',
        description: 'Error message if delivery failed',
      },
    },
    {
      name: 'response',
      type: 'json',
      label: 'Response Data',
      admin: {
        description: 'Response data from the notification service',
      },
    },
    // Дополнительные поля для webhook логов
    {
      name: 'webhookUrl',
      type: 'text',
      label: 'Webhook URL',
      admin: {
        condition: (data) => data.channel === 'webhook',
        description: 'URL that was called for webhook notifications',
      },
    },
    {
      name: 'statusCode',
      type: 'number',
      label: 'HTTP Status Code',
      admin: {
        condition: (data) => data.channel === 'webhook',
        description: 'HTTP status code returned by webhook endpoint',
      },
    },
    {
      name: 'responseTime',
      type: 'number',
      label: 'Response Time (ms)',
      admin: {
        condition: (data) => data.channel === 'webhook',
        description: 'Time taken for webhook request in milliseconds',
      },
    },
    // Поля для email логов
    {
      name: 'emailRecipient',
      type: 'email',
      label: 'Email Recipient',
      admin: {
        condition: (data) => data.channel === 'email',
        description: 'Email address that received the notification',
      },
    },
    {
      name: 'emailSubject',
      type: 'text',
      label: 'Email Subject',
      admin: {
        condition: (data) => data.channel === 'email',
        description: 'Subject line of the sent email',
      },
    },
    // Поля для Telegram логов
    {
      name: 'telegramChatId',
      type: 'text',
      label: 'Telegram Chat ID',
      admin: {
        condition: (data) => data.channel === 'telegram',
        description: 'Telegram chat ID that received the notification',
      },
    },
    {
      name: 'telegramMessageId',
      type: 'text',
      label: 'Telegram Message ID',
      admin: {
        condition: (data) => data.channel === 'telegram' && data.status === 'sent',
        description: 'ID of the sent Telegram message',
      },
    },
    // Поля для WhatsApp логов
    {
      name: 'whatsappPhoneNumber',
      type: 'text',
      label: 'WhatsApp Phone Number',
      admin: {
        condition: (data) => data.channel === 'whatsapp',
        description: 'WhatsApp phone number that received the notification',
      },
    },
    {
      name: 'whatsappMessageId',
      type: 'text',
      label: 'WhatsApp Message ID',
      admin: {
        condition: (data) => data.channel === 'whatsapp' && data.status === 'sent',
        description: 'ID of the sent WhatsApp message',
      },
    },
    // Метаданные события
    {
      name: 'eventData',
      type: 'json',
      label: 'Event Data',
      admin: {
        description: 'Original event data that triggered the notification',
      },
    },
    {
      name: 'eventMetadata',
      type: 'json',
      label: 'Event Metadata',
      admin: {
        description: 'Additional metadata from the original event',
      },
    },
    // Производительность и отладка
    {
      name: 'processingTime',
      type: 'number',
      label: 'Processing Time (ms)',
      admin: {
        description: 'Total time taken to process the event',
      },
    },
    {
      name: 'queueTime',
      type: 'number',
      label: 'Queue Time (ms)',
      admin: {
        description: 'Time spent in queue before processing',
      },
    },
    {
      name: 'retryReason',
      type: 'text',
      label: 'Retry Reason',
      admin: {
        condition: (data) => data.attempts > 1,
        description: 'Reason for retry attempts',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Автоматически устанавливаем lastAttempt при создании
        if (operation === 'create' && !data.lastAttempt) {
          data.lastAttempt = new Date().toISOString()
        }
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // Можно добавить логику для алертов при критических ошибках
        if (doc.status === 'failed' && doc.attempts >= 3) {
          logWarn(`Critical: Event ${doc.eventType} failed after ${doc.attempts} attempts`)
          // TODO: Отправить алерт администраторам
        }
      },
    ],
  },
}
