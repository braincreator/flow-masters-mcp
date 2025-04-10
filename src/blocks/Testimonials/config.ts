import { Block } from 'payload/types'
import { blockFields } from '../fields'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Testimonials: Block = {
  slug: 'testimonials',
  labels: {
    singular: 'Отзывы',
    plural: 'Отзывы',
  },
  graphQL: {
    singularName: 'TestimonialsBlock',
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
        description: 'Список отзывов',
      },
      fields: [
        {
          name: 'author',
          type: 'text',
          required: true,
          admin: {
            description: 'Имя автора отзыва',
          },
        },
        {
          name: 'role',
          type: 'text',
          admin: {
            description: 'Должность или роль автора (опционально)',
          },
        },
        {
          name: 'company',
          type: 'text',
          admin: {
            description: 'Название компании автора (опционально)',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Фото автора (опционально)',
          },
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Текст отзыва',
          },
        },
        {
          name: 'rating',
          type: 'select',
          options: [
            {
              label: '1 звезда',
              value: 1,
            },
            {
              label: '2 звезды',
              value: 2,
            },
            {
              label: '3 звезды',
              value: 3,
            },
            {
              label: '4 звезды',
              value: 4,
            },
            {
              label: '5 звезд',
              value: 5,
            },
          ],
          admin: {
            description: 'Рейтинг (опционально)',
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
          label: 'Карусель',
          value: 'carousel',
        },
        {
          label: 'Выделенный',
          value: 'featured',
        },
      ],
      admin: {
        description: 'Стиль отображения отзывов',
      },
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'card',
      options: [
        {
          label: 'Карточка',
          value: 'card',
        },
        {
          label: 'Минимальный',
          value: 'minimal',
        },
        {
          label: 'Цитата',
          value: 'quote',
        },
      ],
      admin: {
        description: 'Стиль отображения',
      },
    },
  ],
}
