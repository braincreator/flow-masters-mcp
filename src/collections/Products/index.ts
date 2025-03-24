import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { formatPreviewURL } from '../utilities/formatPreviewURL'
import { revalidatePage } from '../utilities/revalidatePage'
import { populatePublishedAt } from '../hooks/populatePublishedAt'

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
      name: 'productType',
      type: 'select',
      required: true,
      options: [
        { label: 'Digital Product', value: 'digital' },
        { label: 'Subscription', value: 'subscription' },
      ],
      defaultValue: 'digital',
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
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'fileDetails',
      type: 'group',
      admin: {
        condition: (data) => data.productType === 'digital',
      },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
        },
        {
          name: 'size',
          type: 'number',
          required: true,
        },
        {
          name: 'mimeType',
          type: 'text',
          required: true,
        },
        {
          name: 'version',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      name: 'downloadSettings',
      type: 'group',
      admin: {
        condition: (data) => data.productType === 'digital',
      },
      fields: [
        {
          name: 'maxDownloads',
          type: 'number',
          required: true,
          defaultValue: 3,
        },
        {
          name: 'accessDuration',
          type: 'number',
          required: true,
          defaultValue: 30,
          admin: {
            description: 'Access duration in days',
          },
        },
      ],
    },
    {
      name: 'version',
      type: 'group',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
        },
        {
          name: 'releaseNotes',
          type: 'richText',
        },
      ],
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
      name: 'demoUrl',
      type: 'text',
      admin: {
        description: 'URL to preview/demo the product',
        position: 'sidebar',
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
  ],
}
