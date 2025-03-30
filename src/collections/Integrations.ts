import { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Integrations: CollectionConfig = {
  slug: 'integrations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'lastSync'],
  },
  access: {
    read: isAdmin,
    update: isAdmin,
    create: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Webhook', value: 'webhook' },
        { label: 'Email', value: 'email' },
        { label: 'CRM', value: 'crm' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'webhookUrl',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'webhook',
      },
    },
    {
      name: 'apiKey',
      type: 'text',
      admin: {
        description: 'API key for authentication',
      },
    },
    {
      name: 'triggers',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'event',
          type: 'select',
          required: true,
          options: [
            { label: 'Order Created', value: 'order.created' },
            { label: 'Order Updated', value: 'order.updated' },
            { label: 'Payment Received', value: 'payment.received' },
            { label: 'User Registered', value: 'user.registered' },
            { label: 'Form Submitted', value: 'form.submitted' },
          ],
        },
        {
          name: 'conditions',
          type: 'array',
          fields: [
            {
              name: 'field',
              type: 'text',
              required: true,
            },
            {
              name: 'operator',
              type: 'select',
              required: true,
              options: [
                { label: 'Equals', value: 'eq' },
                { label: 'Not Equals', value: 'ne' },
                { label: 'Greater Than', value: 'gt' },
                { label: 'Less Than', value: 'lt' },
                { label: 'Contains', value: 'contains' },
              ],
            },
            {
              name: 'value',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'actions',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'HTTP Request', value: 'http' },
            { label: 'Send Email', value: 'email' },
          ],
        },
        {
          name: 'config',
          type: 'group',
          fields: [
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'http',
              },
            },
            {
              name: 'method',
              type: 'select',
              defaultValue: 'POST',
              options: [
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
                { label: 'PATCH', value: 'PATCH' },
                { label: 'DELETE', value: 'DELETE' },
              ],
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'http',
              },
            },
            {
              name: 'headers',
              type: 'json',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'http',
              },
            },
            {
              name: 'body',
              type: 'json',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'http',
              },
            },
            {
              name: 'to',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'email',
              },
            },
            {
              name: 'from',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'email',
              },
            },
            {
              name: 'subject',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'email',
              },
            },
            {
              name: 'emailBody',
              type: 'textarea',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'email',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'lastSync',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastSyncStatus',
      type: 'select',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastError',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
}
