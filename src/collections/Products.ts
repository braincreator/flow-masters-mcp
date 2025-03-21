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
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
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
      },
    },
    {
      name: 'demoUrl',
      type: 'text',
      admin: {
        description: 'URL to preview/demo the product',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
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
    ...slugField(),
  ],
}
