import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { authenticated } from '@/access/authenticated'
import { ServiceRegistry } from '@/services/service.registry'

export const OrderTracking: CollectionConfig = {
  slug: 'order-tracking',
  admin: {
    group: 'Shop',
    useAsTitle: 'orderId',
    defaultColumns: ['orderId', 'status', 'lastUpdated'],
  },
  access: {
    read: authenticated,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'orderId',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Order Placed', value: 'placed' },
        { label: 'Payment Processing', value: 'payment_processing' },
        { label: 'Payment Confirmed', value: 'payment_confirmed' },
        { label: 'Ready for Download', value: 'ready_for_download' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'downloadLinks',
      type: 'array',
      fields: [
        {
          name: 'productId',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          required: true,
        },
        {
          name: 'expiresAt',
          type: 'date',
        },
        {
          name: 'downloads',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'maxDownloads',
          type: 'number',
          defaultValue: 3,
        },
      ],
    },
    {
      name: 'statusHistory',
      type: 'array',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [
            { label: 'Order Placed', value: 'placed' },
            { label: 'Payment Processing', value: 'payment_processing' },
            { label: 'Payment Confirmed', value: 'payment_confirmed' },
            { label: 'Ready for Download', value: 'ready_for_download' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Refunded', value: 'refunded' },
          ],
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true,
        },
        {
          name: 'note',
          type: 'text',
        },
      ],
    },
    {
      name: 'accessExpiresAt',
      type: 'date',
      admin: {
        description: 'When access to digital products expires',
      },
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc }) => {
        data.lastUpdated = new Date()

        if (operation === 'create') {
          data.statusHistory = [
            {
              status: data.status,
              timestamp: new Date(),
              note: 'Order created',
            },
          ]
        } else if (operation === 'update' && data.status !== originalDoc.status) {
          data.statusHistory = [
            ...(originalDoc.statusHistory || []),
            {
              status: data.status,
              timestamp: new Date(),
            },
          ]
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'update') {
          const serviceRegistry = ServiceRegistry.getInstance(req.payload)
          const notificationService = serviceRegistry.getNotificationService()
          await notificationService.sendDigitalOrderStatusUpdate(doc)
        }
      },
    ],
  },
}
