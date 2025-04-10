import type { Block } from 'payload'
import { blockFields } from '../fields'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const ArticleHeader: Block = {
  slug: 'articleHeader',
  labels: {
    singular: 'Заголовок статьи',
    plural: 'Заголовки статей',
  },
  graphQL: {
    singularName: 'ArticleHeaderBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Заголовок статьи',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Подзаголовок (опционально)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Краткое описание статьи (опционально)',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Обложка статьи',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      admin: {
        description: 'Дата публикации',
      },
    },
    {
      name: 'author',
      type: 'group',
      admin: {
        description: 'Информация об авторе',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Имя автора',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Аватар автора (опционально)',
          },
        },
        {
          name: 'role',
          type: 'text',
          admin: {
            description: 'Должность автора (опционально)',
          },
        },
      ],
    },
    {
      name: 'categories',
      type: 'array',
      admin: {
        description: 'Категории статьи (опционально)',
      },
      fields: [
        {
          name: 'category',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'standard',
      options: [
        {
          label: 'Стандартный',
          value: 'standard',
        },
        {
          label: 'С большой обложкой',
          value: 'large',
        },
        {
          label: 'Минималистичный',
          value: 'minimal',
        },
      ],
      admin: {
        description: 'Стиль отображения заголовка статьи',
      },
    },
  ],
}
