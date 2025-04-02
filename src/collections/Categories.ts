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
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'General or Blog categories.',
    listSearchableFields: ['title'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'A brief description of this category',
      },
    },
    {
      name: 'blogCategoryDetails',
      type: 'group',
      admin: {
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
}
