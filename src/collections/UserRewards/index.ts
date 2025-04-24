import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const UserRewards: CollectionConfig = {
  slug: 'user-rewards',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'reward', 'awardedAt', 'status', 'expiresAt'],
    group: 'Learning Management',
    description: 'User rewards tracking',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'User who received the reward',
      },
    },
    {
      name: 'reward',
      type: 'relationship',
      relationTo: 'rewards',
      required: true,
      admin: {
        description: 'The reward that was awarded',
      },
    },
    {
      name: 'awardedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the reward was awarded',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the reward expires (if applicable)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Активна', value: 'active' },
        { label: 'Использована', value: 'used' },
        { label: 'Истекла', value: 'expired' },
        { label: 'Отозвана', value: 'revoked' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current status of the reward',
      },
    },
    {
      name: 'usedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the reward was used (if applicable)',
        condition: (data) => data.status === 'used',
      },
    },
    {
      name: 'code',
      type: 'text',
      admin: {
        description: 'Unique code for the reward (if applicable)',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the user reward',
      },
    },
  ],
  timestamps: true,
}
