import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const UserAchievements: CollectionConfig = {
  slug: 'user-achievements',
  admin: {
    useAsTitle: 'id', // TODO: Consider hook/component for better title (User - Achievement)
    listSearchableFields: ['user', 'achievement'],
    defaultColumns: ['user', 'achievement', 'awardedAt', 'status'],
    group: 'Learning Management',
    description: 'User achievements tracking',
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
        description: 'User who earned the achievement',
      },
    },
    {
      name: 'achievement',
      type: 'relationship',
      relationTo: 'achievements',
      required: true,
      admin: {
        description: 'The achievement earned by the user',
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
        description: 'When the achievement was awarded',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Revoked', value: 'revoked' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current status of the achievement',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the achievement',
        hidden: true, // Hide raw JSON from admin UI
      },
    },
  ],
  timestamps: true,
}
