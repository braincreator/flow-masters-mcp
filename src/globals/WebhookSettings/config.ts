import { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { createGlobalHook } from '@/utilities/revalidation'

// Create a revalidation hook
const revalidateWebhookSettings = createGlobalHook('webhook-settings')

export const WebhookSettings: GlobalConfig = {
  slug: 'webhook-settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'System Settings',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Enable Webhooks',
      defaultValue: false,
    },
    {
      name: 'securitySettings',
      type: 'group',
      label: 'Security Settings',
      admin: {
        condition: (_, siblingData) => siblingData?.enabled === true,
      },
      fields: [
        {
          name: 'signatureSecret',
          type: 'text',
          label: 'Signature Secret',
          admin: {
            description: 'Secret used to sign webhooks for verification',
          },
        },
        {
          name: 'enableIPWhitelist',
          type: 'checkbox',
          label: 'Enable IP Whitelist',
          defaultValue: false,
        },
        {
          name: 'ipWhitelist',
          type: 'array',
          label: 'IP Whitelist',
          admin: {
            description: 'List of allowed IP addresses',
            condition: (_, siblingData) => siblingData?.enableIPWhitelist === true,
          },
          fields: [
            {
              name: 'ipAddress',
              type: 'text',
              label: 'IP Address',
              required: true,
            },
            {
              name: 'description',
              type: 'text',
              label: 'Description',
            },
          ],
        },
      ],
    },
    {
      name: 'retrySettings',
      type: 'group',
      label: 'Retry Settings',
      admin: {
        condition: (_, siblingData) => siblingData?.enabled === true,
      },
      fields: [
        {
          name: 'maxRetries',
          type: 'number',
          label: 'Maximum Retries',
          defaultValue: 3,
          min: 0,
          max: 10,
        },
        {
          name: 'retryInterval',
          type: 'select',
          label: 'Retry Interval',
          defaultValue: 'exponential',
          options: [
            {
              label: 'Fixed (1 minute)',
              value: 'fixed',
            },
            {
              label: 'Exponential Backoff',
              value: 'exponential',
            },
          ],
        },
      ],
    },
    {
      name: 'endpoints',
      type: 'array',
      label: 'Webhook Endpoints',
      admin: {
        description: 'Configure webhook endpoints and events',
        condition: (_, siblingData) => siblingData?.enabled === true,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
        },
        {
          name: 'active',
          type: 'checkbox',
          label: 'Active',
          defaultValue: true,
        },
        {
          name: 'events',
          type: 'select',
          label: 'Events',
          hasMany: true,
          required: true,
          options: [
            {
              label: 'Order Created',
              value: 'order.created',
            },
            {
              label: 'Order Updated',
              value: 'order.updated',
            },
            {
              label: 'Order Completed',
              value: 'order.completed',
            },
            {
              label: 'Order Cancelled',
              value: 'order.cancelled',
            },
            {
              label: 'Payment Received',
              value: 'payment.received',
            },
            {
              label: 'Payment Failed',
              value: 'payment.failed',
            },
            {
              label: 'Product Created',
              value: 'product.created',
            },
            {
              label: 'Product Updated',
              value: 'product.updated',
            },
            {
              label: 'Product Deleted',
              value: 'product.deleted',
            },
            {
              label: 'User Created',
              value: 'user.created',
            },
            {
              label: 'User Updated',
              value: 'user.updated',
            },
          ],
        },
        {
          name: 'headers',
          type: 'array',
          label: 'Custom Headers',
          fields: [
            {
              name: 'key',
              type: 'text',
              label: 'Header Key',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: 'Header Value',
              required: true,
            },
          ],
        },
        {
          name: 'lastSent',
          type: 'date',
          label: 'Last Sent',
          admin: {
            readOnly: true,
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'yyyy-MM-dd HH:mm',
            },
          },
        },
        {
          name: 'status',
          type: 'select',
          label: 'Status',
          defaultValue: 'healthy',
          admin: {
            readOnly: true,
          },
          options: [
            {
              label: 'Healthy',
              value: 'healthy',
            },
            {
              label: 'Warning',
              value: 'warning',
            },
            {
              label: 'Error',
              value: 'error',
            },
          ],
        },
      ],
    },
    {
      name: 'logs',
      type: 'array',
      label: 'Recent Logs',
      admin: {
        description: 'Recent webhook delivery logs',
        readOnly: true,
        condition: (_, siblingData) => siblingData?.enabled === true,
      },
      fields: [
        {
          name: 'timestamp',
          type: 'date',
          label: 'Timestamp',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'yyyy-MM-dd HH:mm:ss',
            },
          },
        },
        {
          name: 'endpoint',
          type: 'text',
          label: 'Endpoint',
        },
        {
          name: 'event',
          type: 'text',
          label: 'Event',
        },
        {
          name: 'status',
          type: 'select',
          label: 'Status',
          options: [
            {
              label: 'Success',
              value: 'success',
            },
            {
              label: 'Failed',
              value: 'failed',
            },
            {
              label: 'Retrying',
              value: 'retrying',
            },
          ],
        },
        {
          name: 'responseCode',
          type: 'number',
          label: 'Response Code',
        },
        {
          name: 'responseTime',
          type: 'number',
          label: 'Response Time (ms)',
        },
        {
          name: 'attemptNumber',
          type: 'number',
          label: 'Attempt Number',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Parse _payload if it exists
        if (data._payload && typeof data._payload === 'string') {
          try {
            const parsedPayload = JSON.parse(data._payload)

            // Apply all fields from parsed payload
            Object.keys(parsedPayload).forEach((key) => {
              if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
                data[key] = parsedPayload[key]
              }
            })

            req.payload.logger.info('WebhookSettings beforeChange - parsed _payload')
          } catch (e) {
            req.payload.logger.error('Error parsing _payload:', e)
          }
        }

        req.payload.logger.info('WebhookSettings beforeChange - final data')
        return data
      },
    ],
    afterChange: [
      // Use the standard revalidation hook
      revalidateWebhookSettings,
    ],
  },
}
