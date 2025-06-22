import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { ServiceRegistry } from '@/services/service.registry'

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
        description: 'Items in the cart (products or services)',
      },
      fields: [
        {
          name: 'itemType',
          type: 'select', // Or radio
          options: [
            { label: 'Product', value: 'product' },
            { label: 'Service', value: 'service' },
          ],
          required: true,
          admin: {
            description: 'The type of item added to the cart.',
          },
        },
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: false,
          admin: {
            condition: ({ siblingData }) => siblingData?.itemType === 'product',
          },
        },
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          required: false,
          admin: {
            condition: ({ siblingData }) => siblingData?.itemType === 'service',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'priceSnapshot', // Renamed from 'price'
          type: 'number',
          required: true,
          admin: {
            description: 'Price of the item at the time it was added to the cart.',
          },
        },
        {
          name: 'titleSnapshot', // New field
          type: 'text',
          required: false, // Optional, but good to have
          admin: {
            description: 'Title/name of the item at the time it was added to the cart.',
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
          data.total = data.items.reduce((currentTotal, item) => {
            // Ensure priceSnapshot and quantity are valid numbers
            const price = typeof item.priceSnapshot === 'number' ? item.priceSnapshot : 0;
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            return currentTotal + price * quantity;
          }, 0);
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
    afterChange: [
      // Добавляем хук для событий корзины
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие создания корзины (первое добавление товара)
          await eventService.publishEvent('cart.created', {
            id: doc.id,
            sessionId: doc.sessionId,
            user: typeof doc.user === 'object' ? doc.user.id : doc.user,
            itemCount: doc.itemCount,
            total: doc.total,
            currency: doc.currency,
            items: doc.items,
            createdAt: doc.createdAt,
          }, {
            source: 'cart_creation',
            collection: 'cart-sessions',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие добавления товара в корзину
          if (doc.itemCount > previousDoc.itemCount) {
            await eventService.publishEvent('cart.item_added', {
              id: doc.id,
              sessionId: doc.sessionId,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              previousItemCount: previousDoc.itemCount,
              newItemCount: doc.itemCount,
              previousTotal: previousDoc.total,
              newTotal: doc.total,
              currency: doc.currency,
              addedItems: doc.items?.slice(previousDoc.items?.length || 0),
            }, {
              source: 'cart_item_added',
              collection: 'cart-sessions',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие удаления товара из корзины
          if (doc.itemCount < previousDoc.itemCount) {
            await eventService.publishEvent('cart.item_removed', {
              id: doc.id,
              sessionId: doc.sessionId,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              previousItemCount: previousDoc.itemCount,
              newItemCount: doc.itemCount,
              previousTotal: previousDoc.total,
              newTotal: doc.total,
              currency: doc.currency,
            }, {
              source: 'cart_item_removed',
              collection: 'cart-sessions',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие конверсии корзины в заказ
          if (doc.convertedToOrder && !previousDoc.convertedToOrder) {
            await eventService.publishEvent('cart.converted', {
              id: doc.id,
              sessionId: doc.sessionId,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              orderId: typeof doc.convertedToOrderId === 'object' ? doc.convertedToOrderId.id : doc.convertedToOrderId,
              itemCount: doc.itemCount,
              total: doc.total,
              currency: doc.currency,
              conversionTime: new Date().toISOString(),
            }, {
              source: 'cart_conversion',
              collection: 'cart-sessions',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }
      },
    ],
  },
  timestamps: true,
}

export default CartSessions
