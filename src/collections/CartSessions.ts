import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const CartSessions: CollectionConfig = {
  slug: 'cart-sessions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'itemCount', 'total', 'updatedAt', 'reminderSent'],
    group: 'Commerce',
  },
  access: {
    create: () => true,
    read: isAdmin,
    update: () => true,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        description: 'User associated with this cart session',
      },
    },
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      admin: {
        description: 'Unique session identifier for anonymous carts',
      },
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        description: 'Products in the cart',
      },
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
          admin: {
            description: 'Price at the time of adding to cart',
          },
        },
      ],
    },
    {
      name: 'itemCount',
      type: 'number',
      admin: {
        description: 'Total number of items in cart',
        readOnly: true,
      },
    },
    {
      name: 'total',
      type: 'number',
      admin: {
        description: 'Total price of all items in cart',
        readOnly: true,
      },
    },
    {
      name: 'currency',
      type: 'text',
      admin: {
        description: 'Currency of the cart',
      },
    },
    {
      name: 'reminderSent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether a reminder email has been sent for this cart',
      },
    },
    {
      name: 'reminderSentAt',
      type: 'date',
      admin: {
        description: 'When the reminder email was sent',
        readOnly: true,
      },
    },
    {
      name: 'convertedToOrder',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this cart has been converted to an order',
      },
    },
    {
      name: 'convertedToOrderId',
      type: 'relationship',
      relationTo: 'orders',
      admin: {
        description: 'The order this cart was converted to',
        readOnly: true,
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'When this cart session expires',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Calculate total item count and total price
        if (data.items && Array.isArray(data.items)) {
          data.itemCount = data.items.reduce((count, item) => count + (item.quantity || 0), 0)
          data.total = data.items.reduce(
            (total, item) => total + (item.price || 0) * (item.quantity || 0),
            0,
          )
        }

        // Set expiration date if not set
        if (!data.expiresAt) {
          const expirationDate = new Date()
          expirationDate.setDate(expirationDate.getDate() + 30) // Expire in 30 days
          data.expiresAt = expirationDate.toISOString()
        }

        return data
      },
    ],
  },
  timestamps: true,
}

export default CartSessions
