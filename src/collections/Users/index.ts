import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin } from '@/access/isAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    admin: isAdmin,
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'customer',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Customer',
          value: 'customer',
        },
      ],
      access: {
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
    },
  ],
  timestamps: true,
}
