import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export const ApiKeys: CollectionConfig = {
  slug: 'apiKeys',
  admin: {
    useAsTitle: 'name',
    description: 'Manage API keys for external services and integrations.',
    defaultColumns: ['name', 'keyType', 'isEnabled', 'lastUsed', 'createdAt'],
    group: 'Security',
    listSearchableFields: ['name', 'description', 'keyType'],
  },
  access: {
    // Only admins can manage API keys
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Generate API key if not provided during creation
        if (operation === 'create' && !data.key) {
          data.key = crypto.randomBytes(32).toString('hex')
        }

        // Hash the key for storage (keep original for response)
        if (data.key && (operation === 'create' || data.key !== data.originalKey)) {
          data.hashedKey = await bcrypt.hash(data.key, 12)
        }

        // Set creation metadata
        if (operation === 'create') {
          data.createdAt = new Date()
          data.usageCount = 0
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // Log key creation/updates for security audit
        if (operation === 'create') {
          console.log(`[SECURITY] New API key created: ${doc.name} (ID: ${doc.id})`)
        } else if (operation === 'update') {
          console.log(`[SECURITY] API key updated: ${doc.name} (ID: ${doc.id})`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      label: 'Key Name',
      type: 'text',
      required: true,
      admin: {
        description:
          'A descriptive name for this API key (e.g., "MCP Server Key", "Mobile App", "Third-party Integration").',
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      admin: {
        description: 'Optional description of what this API key is used for.',
        rows: 3,
      },
    },
    {
      name: 'keyType',
      label: 'Key Type',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        { label: 'General API Access', value: 'general' },
        { label: 'MCP Server', value: 'mcp' },
        { label: 'Mobile Application', value: 'mobile' },
        { label: 'Third-party Integration', value: 'integration' },
        { label: 'Development/Testing', value: 'development' },
        { label: 'Webhook', value: 'webhook' },
      ],
      admin: {
        description: 'Type of API key to determine access permissions.',
      },
    },
    {
      name: 'key',
      label: 'API Key',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'The API key. Leave empty to auto-generate a secure key.',
        readOnly: false,
        components: {
          Field: '@/components/admin/ApiKeyField', // Custom component for key display
        },
      },
    },
    {
      name: 'hashedKey',
      label: 'Hashed Key',
      type: 'text',
      admin: {
        hidden: true, // Hidden from admin interface
      },
    },
    {
      name: 'isEnabled',
      label: 'Enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Disable this key to revoke its access immediately.',
        position: 'sidebar',
      },
    },
    {
      name: 'permissions',
      label: 'Permissions',
      type: 'select',
      hasMany: true,
      defaultValue: ['read'],
      options: [
        { label: 'Read Access', value: 'read' },
        { label: 'Write Access', value: 'write' },
        { label: 'Delete Access', value: 'delete' },
        { label: 'Admin Access', value: 'admin' },
        { label: 'Debug Access', value: 'debug' },
      ],
      admin: {
        description: 'Permissions granted to this API key.',
        position: 'sidebar',
      },
    },
    {
      name: 'allowedIPs',
      label: 'Allowed IP Addresses',
      type: 'array',
      admin: {
        description: 'Restrict this key to specific IP addresses. Leave empty to allow all IPs.',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'ip',
          label: 'IP Address',
          type: 'text',
          required: true,
          admin: {
            description: 'IP address or CIDR range (e.g., 192.168.1.1 or 192.168.1.0/24)',
          },
        },
      ],
    },
    {
      name: 'rateLimit',
      label: 'Rate Limiting',
      type: 'group',
      admin: {
        description: 'Configure rate limiting for this API key.',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'enabled',
          label: 'Enable Rate Limiting',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'requestsPerHour',
          label: 'Requests per Hour',
          type: 'number',
          defaultValue: 1000,
          min: 1,
          max: 10000,
          admin: {
            condition: (data) => data.rateLimit?.enabled,
          },
        },
        {
          name: 'requestsPerMinute',
          label: 'Requests per Minute',
          type: 'number',
          defaultValue: 60,
          min: 1,
          max: 1000,
          admin: {
            condition: (data) => data.rateLimit?.enabled,
          },
        },
      ],
    },
    {
      name: 'expiresAt',
      label: 'Expiration Date',
      type: 'date',
      admin: {
        description: 'Optional expiration date for this API key. Leave empty for no expiration.',
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    // Usage tracking fields
    {
      name: 'usageCount',
      label: 'Usage Count',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Total number of API requests made with this key.',
      },
    },
    {
      name: 'lastUsed',
      label: 'Last Used',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When this API key was last used.',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'lastUsedIP',
      label: 'Last Used IP',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'IP address from which this key was last used.',
      },
    },
    {
      name: 'lastUsedUserAgent',
      label: 'Last Used User Agent',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'User agent from the last request.',
      },
    },
    // Security and audit fields
    {
      name: 'createdBy',
      label: 'Created By',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        description: 'User who created this API key.',
      },
    },
    {
      name: 'notes',
      label: 'Internal Notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this API key (not visible to key users).',
        rows: 3,
      },
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'array',
      admin: {
        description: 'Tags for organizing and filtering API keys.',
      },
      fields: [
        {
          name: 'tag',
          label: 'Tag',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
