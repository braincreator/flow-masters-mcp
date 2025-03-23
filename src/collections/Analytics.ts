import { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Analytics: CollectionConfig = {
  slug: 'analytics',
  admin: {
    useAsTitle: 'type',
    group: 'Analytics',
    description: 'Product analytics and metrics',
  },
  access: {
    create: () => true, // Allow tracking
    read: isAdmin,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Product View', value: 'product_view' },
        { label: 'Purchase', value: 'purchase' },
        { label: 'Cart Add', value: 'cart_add' },
        { label: 'Download', value: 'download' },
      ],
    },
    {
      name: 'productId',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'orderId',
      type: 'relationship',
      relationTo: 'orders',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'revenue',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional event metadata',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['type', 'productId', 'timestamp'],
    },
    {
      fields: ['userId', 'timestamp'],
    },
  ],
}