import { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'type',
    group: 'System',
    description: 'System events log',
  },
  access: {
    create: () => false,
    read: isAdmin,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'type',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'data',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['type', 'timestamp'],
    },
  ],
}