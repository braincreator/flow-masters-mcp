import type { CollectionConfig } from 'payload'
import type { CollectionBeforeChangeHook, FieldHook } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { formatPreviewURL } from '@/utilities/formatPreviewURL'
import { revalidatePage } from '@/utilities/revalidatePage'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { slugField } from '@/fields/slug'
import { PRODUCT_TYPE_LABELS } from '@/constants/localization'
import { DEFAULT_LOCALE } from '@/constants'
import type { Product } from '@/payload-types'
import { ServiceRegistry } from '@/services/service.registry'

// Simple pricing hook for discount calculation
const pricingHook: FieldHook = ({ value }) => {
  if (!value) return value

  const price = Number(value.price) || 0
  const discountPercentage = Number(value.discountPercentage) || 0

  // Calculate final price after discount
  const finalPrice = price * (1 - discountPercentage / 100)

  return {
    ...value,
    price,
    discountPercentage,
    finalPrice: Math.round(finalPrice * 100) / 100,
  }
}

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    group: 'E-commerce',
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'productCategory.title',
      'pricing.price',
      'publishedAt',
      'status',
    ],
    preview: (doc, { locale }) => formatPreviewURL('products', doc, locale),
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      revalidatePage,
      // Добавляем хук для событий продуктов
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие создания продукта
          await eventService.publishEvent('product.created', {
            id: doc.id,
            title: doc.title,
            productType: doc.productType,
            price: doc.pricing?.price,
            finalPrice: doc.pricing?.finalPrice,
            category: typeof doc.productCategory === 'object' ? doc.productCategory.title : null,
            status: doc.status,
            isFeatured: doc.isFeatured,
            isCourse: doc.isCourse,
            createdAt: doc.createdAt,
          }, {
            source: 'product_creation',
            collection: 'products',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие публикации продукта
          if (doc.status === 'published' && previousDoc.status === 'draft') {
            await eventService.publishEvent('product.published', {
              id: doc.id,
              title: doc.title,
              productType: doc.productType,
              price: doc.pricing?.price,
              finalPrice: doc.pricing?.finalPrice,
              category: typeof doc.productCategory === 'object' ? doc.productCategory.title : null,
              publishedAt: doc.publishedAt,
            }, {
              source: 'product_publication',
              collection: 'products',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие изменения цены
          if (doc.pricing?.price !== previousDoc.pricing?.price) {
            await eventService.publishEvent('product.price_changed', {
              id: doc.id,
              title: doc.title,
              previousPrice: previousDoc.pricing?.price,
              newPrice: doc.pricing?.price,
              priceChange: (doc.pricing?.price || 0) - (previousDoc.pricing?.price || 0),
              priceChangePercent: previousDoc.pricing?.price ?
                Math.round(((doc.pricing?.price || 0) - previousDoc.pricing?.price) / previousDoc.pricing?.price * 100) : 0,
            }, {
              source: 'product_price_change',
              collection: 'products',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие обновления продукта (если опубликован)
          if (doc.status === 'published') {
            await eventService.publishEvent('product.updated', {
              id: doc.id,
              title: doc.title,
              productType: doc.productType,
              price: doc.pricing?.price,
              finalPrice: doc.pricing?.finalPrice,
              category: typeof doc.productCategory === 'object' ? doc.productCategory.title : null,
              updatedAt: new Date().toISOString(),
            }, {
              source: 'product_update',
              collection: 'products',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }
      },
    ],
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'productCategory',
      type: 'relationship',
      relationTo: 'productCategories',
      hasMany: false,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Select a product category',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      hooks: {
        beforeChange: [pricingHook],
      },
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          localized: true,
          admin: {
            description: 'Price in the locale currency (USD for English, RUB for Russian)',
          },
        },
        {
          name: 'discountPercentage',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Discount percentage (0-100)',
          },
        },
        {
          name: 'finalPrice',
          type: 'number',
          admin: {
            description: 'Final price after discount (calculated automatically)',
            readOnly: true,
          },
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          localized: true,
          admin: {
            description: 'Original price for comparison (optional)',
          },
        },
        {
          name: 'isPriceStartingFrom',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Price is a starting price (will be displayed as "from X")',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      maxLength: 160,
      admin: {
        description: 'Brief description for product cards (max 160 characters)',
      },
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: false,
      filterOptions: {
        mimeType: { contains: 'image' },
      },
      admin: {
        description: 'Main product image (required)',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
    {
      name: 'productType',
      type: 'select',
      required: true,
      options: Object.entries(PRODUCT_TYPE_LABELS[DEFAULT_LOCALE]).map(([value, label]) => ({
        label,
        value,
      })),
      defaultValue: 'digital',
      admin: {
        position: 'sidebar',
        description: 'Product type determines available features and delivery method',
      },
    },
    {
      name: 'isCourse',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is this product a course?',
        position: 'sidebar',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      admin: {
        description: 'Related course (if this is a course product)',
        condition: (data) => data.isCourse === true,
      },
    },
    {
      name: 'downloadLink',
      type: 'text',
      admin: {
        description: 'URL to download the digital product (only visible after purchase)',
        condition: (data) => data.productType === 'digital',
      },
      validate: ((value: string | undefined, { data }: { data: any }) => {
        const typedData = data as { productType?: string }
        const typedValue = value as string | undefined

        if (typedData.productType === 'digital' && !typedValue) {
          return 'Download link is required for digital products'
        }
        return true
      }) as any,
    },
    {
      name: 'subscriptionDetails',
      type: 'group',
      admin: {
        description: 'Subscription details',
        condition: (data) => data.productType === 'subscription',
      },
      fields: [
        {
          name: 'recurringPrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Recurring price for subscription (per billing interval)',
          },
        },
        {
          name: 'billingInterval',
          type: 'select',
          required: true,
          options: [
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Annual', value: 'annual' },
          ],
          defaultValue: 'monthly',
          admin: {
            description: 'How often to bill the customer',
          },
        },
        {
          name: 'trialDays',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of trial days (0 for no trial)',
          },
        },
      ],
      validate: ((
        value: { recurringPrice?: number; billingInterval?: string } | undefined,
        { data }: { data: any },
      ) => {
        const typedData = data as { productType?: string }
        if (typedData?.productType === 'subscription') {
          if (!value?.recurringPrice) {
            return 'Recurring price is required for subscription products'
          }
          if (!value?.billingInterval) {
            return 'Billing interval is required for subscription products'
          }
        }
        return true
      }) as any,
    },
    {
      name: 'accessDetails',
      type: 'group',
      admin: {
        description: 'Define the features or areas this access product unlocks',
        condition: (data) => data.productType === 'access',
      },
      fields: [
        {
          name: 'features',
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            { label: 'Premium Content', value: 'premium_content' },
            { label: 'Advanced Features', value: 'advanced_features' },
            { label: 'API Access', value: 'api_access' },
            { label: 'Priority Support', value: 'priority_support' },
          ],
        },
        {
          name: 'validityPeriod',
          type: 'number',
          required: true,
          admin: {
            description: 'Access validity in days (0 for unlimited)',
          },
        },
      ],
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show this product in featured section',
        position: 'sidebar',
      },
    },
    {
      name: 'isPopular',
      type: 'checkbox',
      admin: {
        readOnly: true,
        description: 'Automatically set based on order volume (15% above average)',
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          async ({ req, data }) => {
            const allOrders = await (req.payload.find as any)({
              collection: 'orders',
              depth: 0,
            })
            const productOrders: Record<string, number> = {}
            let totalOrders = 0
            if (allOrders?.docs && Array.isArray(allOrders.docs)) {
              allOrders.docs.forEach((order: any) => {
                if (order?.products && Array.isArray(order.products)) {
                  order.products.forEach((product: any) => {
                    if (product?.id) {
                      productOrders[product.id] = (productOrders[product.id] || 0) + 1
                      totalOrders++
                    }
                  })
                }
              })
            }
            const averageOrders = totalOrders / Math.max(1, Object.keys(productOrders).length)
            const thisProductOrders = data?.id ? productOrders[data.id] || 0 : 0
            return thisProductOrders > averageOrders * 1.15
          },
        ],
      },
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'Select related products to display',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Meta Title',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Social Share Image',
        },
      ],
    },
    ...slugField(),
  ],
}
