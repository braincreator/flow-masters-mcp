import type { Block } from 'payload'
import { blockFields } from '../fields'

export const Blockquote: Block = {
  slug: 'blockquote',
  labels: {
    singular: 'Цитата',
    plural: 'Цитаты',
  },
  graphQL: {
    singularName: 'BlockquoteBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Текст цитаты',
      },
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        description: 'Автор цитаты (опционально)',
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Источник цитаты или должность автора (опционально)',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Изображение автора (опционально)',
      },
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'Стандартный',
          value: 'default',
        },
        {
          label: 'С выделением',
          value: 'highlight',
        },
        {
          label: 'Минималистичный',
          value: 'minimal',
        },
      ],
      admin: {
        description: 'Стиль оформления цитаты',
      },
    },
    {
      name: 'align',
      type: 'select',
      defaultValue: 'left',
      options: [
        {
          label: 'По левому краю',
          value: 'left',
        },
        {
          label: 'По центру',
          value: 'center',
        },
        {
          label: 'По правому краю',
          value: 'right',
        },
      ],
      admin: {
        description: 'Выравнивание текста',
      },
    },
  ],
}
