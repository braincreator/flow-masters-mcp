import { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'timestamp'],
  },
  access: {
    read: isAdmin,
    update: isAdmin,
    create: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'type',
      type: 'text',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
      required: true,
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
    },
  ],
}
