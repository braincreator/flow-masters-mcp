import { Block } from 'payload/types'
import { blockFields } from '../fields'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Features: Block = {
  slug: 'features',
  labels: {
    singular: 'Блок с фичами',
    plural: 'Блоки с фичами',
  },
  graphQL: {
    singularName: 'FeaturesBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Заголовок блока',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Описание блока (опционально)',
      },
    },
    {
      name: 'features',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Список фич',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          editor: lexicalEditor({}),
        },
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Имя иконки из коллекции',
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        {
          label: 'Сетка',
          value: 'grid',
        },
        {
          label: 'Список',
          value: 'list',
        },
        {
          label: 'Карусель',
          value: 'carousel',
        },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: 3,
      options: [
        {
          label: '2 колонки',
          value: 2,
        },
        {
          label: '3 колонки',
          value: 3,
        },
        {
          label: '4 колонки',
          value: 4,
        },
      ],
      admin: {
        condition: (data) => data.layout === 'grid',
      },
    },
  ],
} 