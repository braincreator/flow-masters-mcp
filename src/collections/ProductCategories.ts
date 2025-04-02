import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { anyone } from '@/access/anyone'
import { slugField } from '@/fields/slug'

export const ProductCategories: CollectionConfig = {
  slug: 'productCategories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    listSearchableFields: ['title'],
    description: 'Categories specific to products.',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    // Добавляем поле slug, используя slugField(), которое будет генерировать slug из title
    ...slugField(), 
  ],
} 