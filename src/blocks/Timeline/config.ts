import { Block } from 'payload/types'
import { blockFields } from '../fields'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Timeline: Block = {
  slug: 'timeline',
  labels: {
    singular: 'Таймлайн',
    plural: 'Таймлайны',
  },
  graphQL: {
    singularName: 'TimelineBlock',
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
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'События таймлайна',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Заголовок события',
          },
        },
        {
          name: 'date',
          type: 'text',
          admin: {
            description: 'Дата события (текстовый формат, например "Июнь 2023")',
          },
        },
        {
          name: 'description',
          type: 'richText',
          editor: lexicalEditor({}),
          admin: {
            description: 'Описание события',
          },
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Изображение для события (опционально)',
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'vertical',
      options: [
        {
          label: 'Вертикальный',
          value: 'vertical',
        },
        {
          label: 'Горизонтальный',
          value: 'horizontal',
        },
        {
          label: 'Зигзаг',
          value: 'zigzag',
        },
      ],
      admin: {
        description: 'Стиль отображения таймлайна',
      },
    },
    {
      name: 'showDates',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать даты',
      },
    },
    {
      name: 'showLines',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать соединительные линии',
      },
    },
  ],
}
