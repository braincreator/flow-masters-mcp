import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { ServiceRegistry } from '@/services/service.registry'

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
    group: 'User Management',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' || operation === 'update') {
          const serviceRegistry = ServiceRegistry.getInstance(req.payload)
          const integrationService = serviceRegistry.getIntegrationService()
          await integrationService.processEvent('user.registered', {
            id: doc.id,
            email: doc.email,
            name: doc.name,
            role: doc.role,
            createdAt: doc.createdAt,
          })
        }
      },
    ],
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
    {
      name: 'segments',
      label: 'Сегменты пользователя (автоматически)',
      type: 'relationship',
      relationTo: 'user-segments',
      hasMany: true,
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description:
          'Сегменты, к которым относится пользователь. Вычисляются и обновляются автоматически.',
      },
    },
  ],
  timestamps: true,
}
