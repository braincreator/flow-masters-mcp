import { Field } from 'payload'

export const productFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    required: true,
    unique: true,
  },
  {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
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
    name: 'price',
    type: 'number',
    required: true,
    min: 0,
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'category',
    type: 'relationship',
    relationTo: 'categories',
    required: true,
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
      {
        label: 'Draft',
        value: 'draft',
      },
      {
        label: 'Published',
        value: 'published',
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
      readOnly: true,
    },
  },
  {
    name: 'images',
    type: 'array',
    required: true,
    minRows: 1,
    maxRows: 10,
    labels: {
      singular: 'Image',
      plural: 'Images',
    },
    fields: [
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        required: true,
      },
      {
        name: 'alt',
        type: 'text',
        required: true,
      }
    ],
  },
  {
    name: 'features',
    type: 'array',
    label: 'Product Features',
    minRows: 0,
    maxRows: 10,
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
      }
    ],
  },
  {
    name: 'metadata',
    type: 'group',
    fields: [
      {
        name: 'sku',
        type: 'text',
        unique: true,
      },
      {
        name: 'weight',
        type: 'number',
        min: 0,
      },
      {
        name: 'dimensions',
        type: 'group',
        fields: [
          {
            name: 'length',
            type: 'number',
            min: 0,
          },
          {
            name: 'width',
            type: 'number',
            min: 0,
          },
          {
            name: 'height',
            type: 'number',
            min: 0,
          }
        ]
      }
    ]
  }
]