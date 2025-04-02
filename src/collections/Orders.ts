import { CollectionConfig } from 'payload'
import { IntegrationEvents } from '../types/events'
import { IntegrationService } from '../services/integration.service'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customer', 'status', 'total', 'createdAt'],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      name: 'total',
      type: 'group',
      fields: [
        {
          name: 'en',
          type: 'group',
          fields: [
            {
              name: 'amount',
              type: 'number',
              required: true,
            },
            {
              name: 'currency',
              type: 'text',
              required: true,
              defaultValue: 'USD',
            },
          ],
        },
        {
          name: 'ru',
          type: 'group',
          fields: [
            {
              name: 'amount',
              type: 'number',
              required: true,
            },
            {
              name: 'currency',
              type: 'text',
              required: true,
              defaultValue: 'RUB',
            },
          ],
        },
      ],
      hooks: {
        beforeChange: [
          ({ data, value }) => {
            if (!value) return value
            // Ensure both locale prices are set
            if (value.en?.amount && !value.ru?.amount) {
              value.ru = {
                amount: convertPrice(value.en.amount, 'en', 'ru'),
                currency: 'RUB',
              }
            }
            if (value.ru?.amount && !value.en?.amount) {
              value.en = {
                amount: convertPrice(value.ru.amount, 'ru', 'en'),
                currency: 'USD',
              }
            }
            return value
          },
        ],
      },
    },
    // No shipping fields needed for digital products
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Generate order number if not provided
        if (!data.orderNumber) {
          data.orderNumber = `ORD-${Date.now()}`
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req: { payload } }) => {
        try {
          const integrationService = IntegrationService.getInstance(payload)

          if (operation === 'create') {
            await integrationService.processEvent(IntegrationEvents.ORDER_CREATED, doc)
          } else {
            await integrationService.processEvent(IntegrationEvents.ORDER_UPDATED, doc)
          }
        } catch (error) {
          console.error('Error processing integration for order:', error)
          // Don't throw the error to avoid failing the order operation
        }
      },
    ],
  },
}
