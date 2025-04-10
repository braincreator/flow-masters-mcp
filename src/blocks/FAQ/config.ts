import { Block } from 'payload/types'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'subheading',
      type: 'text',
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Добавьте вопросы и ответы',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          editor: lexicalEditor({}),
          required: true,
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'accordion',
      options: [
        {
          label: 'Аккордеон',
          value: 'accordion',
        },
        {
          label: 'Список',
          value: 'list',
        },
        {
          label: 'Сетка',
          value: 'grid',
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'backgroundColor',
          type: 'select',
          defaultValue: 'transparent',
          options: [
            { label: 'Прозрачный', value: 'transparent' },
            { label: 'Светлый', value: 'light' },
            { label: 'Темный', value: 'dark' },
          ],
        },
        {
          name: 'containerWidth',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'По умолчанию', value: 'default' },
            { label: 'Узкий', value: 'narrow' },
            { label: 'Широкий', value: 'wide' },
          ],
        },
      ],
    },
  ],
  labels: {
    singular: 'FAQ блок',
    plural: 'FAQ блоки',
  },
} 