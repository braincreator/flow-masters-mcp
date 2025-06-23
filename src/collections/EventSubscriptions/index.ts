import type { CollectionConfig } from 'payload/types'
import { IntegrationEvents } from '@/types/events'

/**
 * Коллекция для управления подписками на события
 * Позволяет настраивать автоматические уведомления и интеграции
 */
export const EventSubscriptions: CollectionConfig = {
  slug: 'event-subscriptions',
  labels: {
    singular: 'Event Subscription',
    plural: 'Event Subscriptions',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'eventTypes', 'channels', 'isActive', 'updatedAt'],
    group: 'Integrations',
    description: 'Manage event subscriptions and notifications',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'manager'
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
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
      name: 'name',
      type: 'text',
      required: true,
      label: 'Subscription Name',
      admin: {
        description: 'Unique name for this event subscription',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Optional description of what this subscription does',
      },
    },
    {
      name: 'eventTypes',
      type: 'select',
      hasMany: true,
      required: true,
      label: 'Event Types',
      options: Object.entries(IntegrationEvents).map(([key, value]) => ({
        label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        value,
      })),
      admin: {
        description: 'Select which event types to subscribe to',
      },
    },
    {
      name: 'channels',
      type: 'select',
      hasMany: true,
      required: true,
      label: 'Notification Channels',
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
        description: 'Select notification channels to use',
      },
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'normal',
      label: 'Priority',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
      admin: {
        description: 'Priority level for this subscription',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: {
        description: 'Enable or disable this subscription',
        position: 'sidebar',
      },
    },
    // Email настройки
    {
      name: 'emailRecipients',
      type: 'array',
      label: 'Email Recipients',
      admin: {
        condition: (data) => data.channels?.includes('email'),
        description: 'Email addresses to send notifications to',
      },
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          label: 'Email Address',
        },
        {
          name: 'name',
          type: 'text',
          label: 'Recipient Name',
        },
      ],
    },
    // Telegram настройки
    {
      name: 'telegramChatIds',
      type: 'array',
      label: 'Telegram Chat IDs',
      admin: {
        condition: (data) => data.channels?.includes('telegram'),
        description: 'Telegram chat IDs to send notifications to',
      },
      fields: [
        {
          name: 'chatId',
          type: 'text',
          required: true,
          label: 'Chat ID',
          admin: {
            description: 'Telegram chat ID (can be user ID, group ID, or channel ID)',
          },
        },
        {
          name: 'name',
          type: 'text',
          label: 'Chat Name',
        },
      ],
    },
    // Slack настройки
    {
      name: 'slackChannels',
      type: 'array',
      label: 'Slack Channels',
      admin: {
        condition: (data) => data.channels?.includes('slack'),
        description: 'Slack channels to send notifications to',
      },
      fields: [
        {
          name: 'channel',
          type: 'text',
          required: true,
          label: 'Channel',
          admin: {
            description: 'Slack channel name (e.g., #general) or user ID',
          },
        },
        {
          name: 'name',
          type: 'text',
          label: 'Channel Name',
        },
      ],
    },
    // WhatsApp настройки
    {
      name: 'whatsappContacts',
      type: 'array',
      label: 'WhatsApp Contacts',
      admin: {
        condition: (data) => data.channels?.includes('whatsapp'),
        description: 'WhatsApp phone numbers to send notifications to',
      },
      fields: [
        {
          name: 'phoneNumber',
          type: 'text',
          required: true,
          label: 'Phone Number',
          admin: {
            description: 'Phone number in international format (e.g., +7 999 123-45-67)',
          },
          validate: (value) => {
            if (!value) return 'Phone number is required'
            const phoneRegex = /^\+?[\d\s\-\(\)]+$/
            if (!phoneRegex.test(value)) {
              return 'Invalid phone number format'
            }
            return true
          },
        },
        {
          name: 'name',
          type: 'text',
          label: 'Contact Name',
        },
      ],
    },
    // Webhook настройки
    {
      name: 'webhookUrl',
      type: 'text',
      label: 'Webhook URL',
      admin: {
        condition: (data) => data.channels?.includes('webhook'),
        description: 'URL to send webhook notifications to',
      },
      validate: (value, { data }) => {
        if (data.channels?.includes('webhook') && !value) {
          return 'Webhook URL is required when webhook channel is selected'
        }
        if (value && !value.startsWith('http')) {
          return 'Webhook URL must start with http:// or https://'
        }
        return true
      },
    },
    {
      name: 'webhookSecret',
      type: 'text',
      label: 'Webhook Secret',
      admin: {
        condition: (data) => data.channels?.includes('webhook'),
        description: 'Secret key for webhook signature verification (optional)',
      },
    },
    {
      name: 'webhookHeaders',
      type: 'json',
      label: 'Webhook Headers',
      admin: {
        condition: (data) => data.channels?.includes('webhook'),
        description: 'Additional headers to send with webhook requests (JSON format)',
      },
    },
    // Фильтры
    {
      name: 'filters',
      type: 'array',
      label: 'Event Filters',
      admin: {
        description: 'Optional filters to apply to events before sending notifications',
      },
      fields: [
        {
          name: 'field',
          type: 'text',
          required: true,
          label: 'Field Path',
          admin: {
            description: 'Dot-notation path to the field (e.g., data.current.email)',
          },
        },
        {
          name: 'operator',
          type: 'select',
          required: true,
          label: 'Operator',
          options: [
            { label: 'Equals', value: 'eq' },
            { label: 'Not Equals', value: 'ne' },
            { label: 'Greater Than', value: 'gt' },
            { label: 'Less Than', value: 'lt' },
            { label: 'Greater Than or Equal', value: 'gte' },
            { label: 'Less Than or Equal', value: 'lte' },
            { label: 'Contains', value: 'contains' },
            { label: 'In Array', value: 'in' },
            { label: 'Not In Array', value: 'nin' },
          ],
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Value',
          admin: {
            description: 'Value to compare against (use JSON for arrays)',
          },
        },
      ],
    },
    // Retry конфигурация
    {
      name: 'retryConfig',
      type: 'group',
      label: 'Retry Configuration',
      admin: {
        description: 'Configuration for retrying failed notifications',
      },
      fields: [
        {
          name: 'maxAttempts',
          type: 'number',
          defaultValue: 3,
          min: 1,
          max: 10,
          label: 'Max Attempts',
          admin: {
            description: 'Maximum number of retry attempts',
          },
        },
        {
          name: 'initialDelay',
          type: 'number',
          defaultValue: 1000,
          min: 100,
          label: 'Initial Delay (ms)',
          admin: {
            description: 'Initial delay before first retry in milliseconds',
          },
        },
        {
          name: 'backoffMultiplier',
          type: 'number',
          defaultValue: 2,
          min: 1,
          label: 'Backoff Multiplier',
          admin: {
            description: 'Multiplier for exponential backoff',
          },
        },
        {
          name: 'maxDelay',
          type: 'number',
          defaultValue: 30000,
          min: 1000,
          label: 'Max Delay (ms)',
          admin: {
            description: 'Maximum delay between retries in milliseconds',
          },
        },
      ],
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Валидация webhook URL
        if (data.channels?.includes('webhook') && data.webhookUrl) {
          try {
            new URL(data.webhookUrl)
          } catch (error) {
            throw new Error('Invalid webhook URL format')
          }
        }

        // Валидация email получателей
        if (data.channels?.includes('email') && data.emailRecipients) {
          for (const recipient of data.emailRecipients) {
            if (!recipient.email || !recipient.email.includes('@')) {
              throw new Error('Invalid email address in recipients')
            }
          }
        }

        // Валидация Telegram chat IDs
        if (data.channels?.includes('telegram') && data.telegramChatIds) {
          for (const chat of data.telegramChatIds) {
            if (!chat.chatId || chat.chatId.trim() === '') {
              throw new Error('Invalid Telegram chat ID')
            }
          }
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Логируем изменения подписок
        console.log(`Event subscription ${operation}: ${doc.name}`)

        // Отправляем тестовое уведомление при создании (опционально)
        if (operation === 'create' && process.env.NODE_ENV !== 'production') {
          try {
            const eventService = req.payload.services?.getEventService()
            if (eventService) {
              await eventService.testSubscription(doc.id, 'system.test')
              console.log(`Test notification sent for subscription: ${doc.name}`)
            }
          } catch (error) {
            console.warn('Failed to send test notification:', error)
          }
        }
      },
    ],
  },
}
