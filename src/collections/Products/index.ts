import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { formatPreviewURL } from '../utilities/formatPreviewURL'
import { revalidatePage } from '../utilities/revalidatePage'
import { populatePublishedAt } from '../hooks/populatePublishedAt'
import { slugField } from '../fields/slug'
import { PRODUCT_TYPE_LABELS } from '@/constants/localization'
import { DEFAULT_LOCALE } from '@/constants'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', 'publishedAt', 'status'],
    preview: (doc, { locale }) => formatPreviewURL('products', doc, locale),
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidatePage],
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
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'N8N Workflows', value: 'n8n' },
        { label: 'Make.com Workflows', value: 'make' },
        { label: 'Tutorials', value: 'tutorials' },
        { label: 'Courses', value: 'courses' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'basePrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Base price in USD',
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
            hidden: true,
          },
          hooks: {
            beforeChange: [
              ({ siblingData }) => {
                if (siblingData.basePrice) {
                  const basePrice = siblingData.basePrice
                  const discount = siblingData.discountPercentage || 0
                  return basePrice * (1 - discount / 100)
                }
                return siblingData.basePrice
              }
            ]
          }
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          admin: {
            description: 'Original price for comparison (optional)',
          },
        }
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
      required: true,
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
      name: 'downloadLink',
      type: 'text',
      admin: {
        description: 'URL to download the digital product (only visible after purchase)',
        condition: (data) => data.productType === 'digital',
      },
      validate: (value, { data }) => {
        if (data.productType === 'digital' && !value) {
          return 'Download link is required for digital products'
        }
        return true
      },
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
            // You'll need to implement the logic to calculate if the product
            // is ordered 15% more than others. This is just a placeholder.
            const allOrders = await req.payload.find({
              collection: 'orders',
              depth: 0,
            })
            
            // Calculate average orders per product
            const productOrders = {} // Map to store order count per product
            let totalOrders = 0
            
            allOrders.docs.forEach(order => {
              order.products.forEach(product => {
                productOrders[product.id] = (productOrders[product.id] || 0) + 1
                totalOrders++
              })
            })
            
            const averageOrders = totalOrders / Object.keys(productOrders).length
            const thisProductOrders = productOrders[data.id] || 0
            
            // Set isPopular if orders are 15% above average
            return thisProductOrders > (averageOrders * 1.15)
          }
        ]
      }
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
    slugField(),
  ],
}
