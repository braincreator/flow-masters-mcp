import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const FeatureFlags: CollectionConfig = {
  slug: 'feature-flags',
  admin: {
    group: 'Admin',
    useAsTitle: 'name',
    defaultColumns: ['name', 'enabled', 'percentage', 'updatedAt'],
    description: 'Manage feature flags for the application',
  },
  access: {
    read: () => true, // Allow reading for all users
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for the feature flag (e.g., "new_dashboard")',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-readable name for the feature flag',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this feature flag controls',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      required: true,
      admin: {
        description: 'Whether this feature flag is enabled',
      },
    },
    {
      name: 'userGroups',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Instructor', value: 'instructor' },
        { label: 'Customer', value: 'customer' },
        { label: 'Beta Tester', value: 'beta_tester' },
      ],
      admin: {
        description: 'User groups that have access to this feature (leave empty for all users)',
      },
    },
    {
      name: 'userIds',
      type: 'array',
      fields: [
        {
          name: 'userId',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Specific user IDs that have access to this feature',
      },
    },
    {
      name: 'percentage',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Percentage rollout (0-100). Leave empty for all users when enabled.',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        description: 'When this feature flag becomes active (optional)',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description: 'When this feature flag expires (optional)',
      },
    },
    {
      name: 'dependencies',
      type: 'array',
      fields: [
        {
          name: 'flagId',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Other feature flags that must be enabled for this one to work',
      },
    },
    {
      name: 'variants',
      type: 'array',
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'weight',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
        },
        {
          name: 'metadata',
          type: 'json',
        },
      ],
      admin: {
        description: 'A/B testing variants for this feature flag',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for this feature flag',
      },
    },
  ],
  timestamps: true,
}
