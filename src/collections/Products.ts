import { CollectionConfig } from 'payload/types'
import { isAdmin } from '../access/isAdmin'
import { slugField } from '../fields/slug'
import { populatePublishedAt } from '../hooks/populatePublishedAt'
import { formatPreviewURL } from '../utilities/formatPreviewURL'
import { revalidatePage } from '../utilities/revalidatePage'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'category', 'publishedAt', 'status'],
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
      async ({ doc, operation, req }) => {
        const integrationService = new IntegrationService(req.payload)
        if (operation === 'create') {
          await integrationService.processEvent('product.created', doc)
        } else {
          await integrationService.processEvent('product.updated', doc)
        }
      }
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
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        position: 'sidebar',
      },
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
          name: 'feature',
          type: 'text',
        },
      ],
    },
    {
      name: 'downloadUrl',
      type: 'text',
      admin: {
        description: 'URL to download the digital product (only visible to customers after purchase)',
        position: 'sidebar',
      },
    },
    {
      name: 'demoUrl',
      type: 'text',
      admin: {
        description: 'URL to preview/demo the product',
        position: 'sidebar',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
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
        },
      ],
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
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
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
      ],
      admin: {
        position: 'sidebar',
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
      ],
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
  ],
}
