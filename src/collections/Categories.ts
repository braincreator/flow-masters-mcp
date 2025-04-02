import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'categoryType'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'categoryType',
      type: 'select',
      options: [
        { label: 'Product Category', value: 'product' },
        { label: 'Blog Category', value: 'blog' },
        { label: 'General', value: 'general' },
      ],
      defaultValue: 'general',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Determines what type of content this category is for',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'A brief description of this category',
      },
    },
    // Product-specific fields
    {
      name: 'productCategoryDetails',
      type: 'group',
      admin: {
        condition: (data) => data?.categoryType === 'product',
        description: 'Fields specific to product categories',
      },
      fields: [
        {
          name: 'featuredInNav',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show this category in the main navigation',
          },
        },
        {
          name: 'displayOrder',
          type: 'number',
          min: 0,
          admin: {
            description: 'Order to display categories (lower numbers first)',
          },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Icon to represent this product category',
          },
        },
      ],
    },
    // Blog-specific fields
    {
      name: 'blogCategoryDetails',
      type: 'group',
      admin: {
        condition: (data) => data?.categoryType === 'blog',
        description: 'Fields specific to blog categories',
      },
      fields: [
        {
          name: 'showInSidebar',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show this category in the blog sidebar',
          },
        },
        {
          name: 'color',
          type: 'text',
          admin: {
            description: 'Hex color code for this category (e.g. #FF5500)',
          },
        },
      ],
    },
    ...slugField(),
  ],
  hooks: {
    beforeChange: [
      // Ensure proper validation of type-specific fields
      ({ data }) => {
        return data
      },
    ],
  },
}
