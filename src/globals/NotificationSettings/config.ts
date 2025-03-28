import { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { createGlobalHook } from '@/utilities/revalidation'

// Create a revalidation hook
const revalidateNotificationSettings = createGlobalHook('notification-settings')

export const NotificationSettings: GlobalConfig = {
  slug: 'notification-settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'System',
  },
  fields: [
    {
      name: 'email',
      type: 'group',
      label: 'Email Notifications',
      fields: [
        {
          name: 'sender',
          type: 'group',
          label: 'Sender Details',
          fields: [
            {
              name: 'senderName',
              type: 'group',
              label: 'Sender Name',
              fields: [
                {
                  name: 'ru',
                  type: 'text',
                  label: 'Russian',
                  required: true,
                  defaultValue: 'Flow Masters',
                },
                {
                  name: 'en',
                  type: 'text',
                  label: 'English',
                  required: true,
                  defaultValue: 'Flow Masters',
                },
              ],
            },
            {
              name: 'senderEmail',
              type: 'email',
              label: 'Sender Email',
              required: true,
              defaultValue: 'noreply@example.com',
            },
          ],
        },
        {
          name: 'adminEmail',
          type: 'email',
          label: 'Admin Notification Email',
          required: true,
          defaultValue: 'admin@example.com',
          admin: {
            description: 'Email address where admin notifications will be sent',
          },
        },
        {
          name: 'templates',
          type: 'group',
          label: 'Email Templates',
          fields: [
            {
              name: 'orderConfirmation',
              type: 'group',
              label: 'Order Confirmation',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Enable',
                  defaultValue: true,
                },
                {
                  name: 'subject',
                  type: 'group',
                  label: 'Subject',
                  fields: [
                    {
                      name: 'ru',
                      type: 'text',
                      label: 'Russian',
                      required: true,
                      defaultValue: 'Ваш заказ подтвержден',
                    },
                    {
                      name: 'en',
                      type: 'text',
                      label: 'English',
                      required: true,
                      defaultValue: 'Your order has been confirmed',
                    },
                  ],
                },
                {
                  name: 'template',
                  type: 'group',
                  label: 'Template',
                  fields: [
                    {
                      name: 'ru',
                      type: 'richText',
                      label: 'Russian',
                      required: true,
                    },
                    {
                      name: 'en',
                      type: 'richText',
                      label: 'English',
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'paymentConfirmation',
              type: 'group',
              label: 'Payment Confirmation',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Enable',
                  defaultValue: true,
                },
                {
                  name: 'subject',
                  type: 'group',
                  label: 'Subject',
                  fields: [
                    {
                      name: 'ru',
                      type: 'text',
                      label: 'Russian',
                      required: true,
                      defaultValue: 'Ваш платеж получен',
                    },
                    {
                      name: 'en',
                      type: 'text',
                      label: 'English',
                      required: true,
                      defaultValue: 'Your payment has been received',
                    },
                  ],
                },
                {
                  name: 'template',
                  type: 'group',
                  label: 'Template',
                  fields: [
                    {
                      name: 'ru',
                      type: 'richText',
                      label: 'Russian',
                      required: true,
                    },
                    {
                      name: 'en',
                      type: 'richText',
                      label: 'English',
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'orderShipped',
              type: 'group',
              label: 'Order Shipped',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Enable',
                  defaultValue: true,
                },
                {
                  name: 'subject',
                  type: 'group',
                  label: 'Subject',
                  fields: [
                    {
                      name: 'ru',
                      type: 'text',
                      label: 'Russian',
                      required: true,
                      defaultValue: 'Ваш заказ отправлен',
                    },
                    {
                      name: 'en',
                      type: 'text',
                      label: 'English',
                      required: true,
                      defaultValue: 'Your order has been shipped',
                    },
                  ],
                },
                {
                  name: 'template',
                  type: 'group',
                  label: 'Template',
                  fields: [
                    {
                      name: 'ru',
                      type: 'richText',
                      label: 'Russian',
                      required: true,
                    },
                    {
                      name: 'en',
                      type: 'richText',
                      label: 'English',
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'downloadableProduct',
              type: 'group',
              label: 'Downloadable Product',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Enable',
                  defaultValue: true,
                },
                {
                  name: 'subject',
                  type: 'group',
                  label: 'Subject',
                  fields: [
                    {
                      name: 'ru',
                      type: 'text',
                      label: 'Russian',
                      required: true,
                      defaultValue: 'Ваш цифровой продукт готов к скачиванию',
                    },
                    {
                      name: 'en',
                      type: 'text',
                      label: 'English',
                      required: true,
                      defaultValue: 'Your digital product is ready for download',
                    },
                  ],
                },
                {
                  name: 'template',
                  type: 'group',
                  label: 'Template',
                  fields: [
                    {
                      name: 'ru',
                      type: 'richText',
                      label: 'Russian',
                      required: true,
                    },
                    {
                      name: 'en',
                      type: 'richText',
                      label: 'English',
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'sms',
      type: 'group',
      label: 'SMS Notifications',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable SMS Notifications',
          defaultValue: false,
        },
        {
          name: 'provider',
          type: 'select',
          label: 'SMS Provider',
          options: [
            {
              label: 'Twilio',
              value: 'twilio',
            },
            {
              label: 'Nexmo/Vonage',
              value: 'nexmo',
            },
            {
              label: 'Custom API',
              value: 'custom',
            },
          ],
          defaultValue: 'twilio',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
        },
        {
          name: 'providerConfig',
          type: 'group',
          label: 'Provider Configuration',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
          fields: [
            {
              name: 'accountSid',
              type: 'text',
              label: 'Account SID/API Key',
              required: true,
              admin: {
                condition: (_, { provider }) => provider === 'twilio' || provider === 'nexmo',
              },
            },
            {
              name: 'authToken',
              type: 'text',
              label: 'Auth Token/API Secret',
              required: true,
              admin: {
                condition: (_, { provider }) => provider === 'twilio' || provider === 'nexmo',
              },
            },
            {
              name: 'fromNumber',
              type: 'text',
              label: 'From Number',
              required: true,
            },
            {
              name: 'apiEndpoint',
              type: 'text',
              label: 'API Endpoint',
              required: true,
              admin: {
                condition: (_, { provider }) => provider === 'custom',
              },
            },
          ],
        },
        {
          name: 'templates',
          type: 'group',
          label: 'SMS Templates',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
          fields: [
            {
              name: 'orderConfirmation',
              type: 'group',
              label: 'Order Confirmation',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Enable',
                  defaultValue: true,
                },
                {
                  name: 'message',
                  type: 'group',
                  label: 'Message',
                  fields: [
                    {
                      name: 'ru',
                      type: 'textarea',
                      label: 'Russian',
                      required: true,
                    },
                    {
                      name: 'en',
                      type: 'textarea',
                      label: 'English',
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'paymentConfirmation',
              type: 'group',
              label: 'Payment Confirmation',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Enable',
                  defaultValue: true,
                },
                {
                  name: 'message',
                  type: 'group',
                  label: 'Message',
                  fields: [
                    {
                      name: 'ru',
                      type: 'textarea',
                      label: 'Russian',
                      required: true,
                    },
                    {
                      name: 'en',
                      type: 'textarea',
                      label: 'English',
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'push',
      type: 'group',
      label: 'Push Notifications',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable Push Notifications',
          defaultValue: false,
        },
        {
          name: 'firebaseConfig',
          type: 'group',
          label: 'Firebase Configuration',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
          fields: [
            {
              name: 'apiKey',
              type: 'text',
              label: 'API Key',
              required: true,
            },
            {
              name: 'projectId',
              type: 'text',
              label: 'Project ID',
              required: true,
            },
            {
              name: 'appId',
              type: 'text',
              label: 'App ID',
              required: true,
            },
            {
              name: 'messagingSenderId',
              type: 'text',
              label: 'Messaging Sender ID',
              required: true,
            },
          ],
        },
        {
          name: 'templates',
          type: 'group',
          label: 'Push Notification Templates',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
          fields: [
            {
              name: 'orderStatusUpdate',
              type: 'group',
              label: 'Order Status Update',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Enable',
                  defaultValue: true,
                },
                {
                  name: 'title',
                  type: 'group',
                  label: 'Title',
                  fields: [
                    {
                      name: 'ru',
                      type: 'text',
                      label: 'Russian',
                      required: true,
                    },
                    {
                      name: 'en',
                      type: 'text',
                      label: 'English',
                      required: true,
                    },
                  ],
                },
                {
                  name: 'body',
                  type: 'group',
                  label: 'Body',
                  fields: [
                    {
                      name: 'ru',
                      type: 'textarea',
                      label: 'Russian',
                      required: true,
                    },
                    {
                      name: 'en',
                      type: 'textarea',
                      label: 'English',
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
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

            req.payload.logger.info('NotificationSettings beforeChange - parsed _payload')
          } catch (e) {
            req.payload.logger.error('Error parsing _payload:', e)
          }
        }

        req.payload.logger.info('NotificationSettings beforeChange - final data')
        return data
      },
    ],
    afterChange: [
      // Use the standard revalidation hook
      revalidateNotificationSettings,
    ],
  },
}
