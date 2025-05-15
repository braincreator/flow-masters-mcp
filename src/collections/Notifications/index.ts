import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { NotificationStoredType } from '@/types/notifications' // Import the enum

// Helper to generate a more readable label from an enum value
const generateLabel = (value: string): string => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    listSearchableFields: ['title', 'user', 'type'],
    defaultColumns: ['title', 'user', 'type', 'isRead', 'createdAt'],
    group: 'System', // Group with other system collections
    description: 'User notifications',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  indexes: [
    {
      fields: ['user', 'isRead', 'createdAt'],
    },
    {
      fields: ['user', 'createdAt'],
    },
  ],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Notification title (can be a translation key)',
      },
    },
    {
      name: 'messageKey',
      type: 'text', 
      required: true,
      admin: {
        description: 'Translation key for the notification message body',
      },
    },
    {
      name: 'messageParams',
      type: 'json', 
      admin: {
        description: 'JSON object containing parameters for message interpolation',
        // hidden: true, // Optionally hide if it's too complex for direct admin input
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'User who received the notification',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: Object.values(NotificationStoredType).map((value) => ({
        label: generateLabel(value as string), 
        value: value as string,
      })),
      admin: {
        position: 'sidebar',
        description: 'Type of notification',
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Whether the notification has been read',
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'Optional link to navigate to when clicking the notification',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the notification',
        hidden: true, 
      },
    },
  ],
  timestamps: true,
}
