import { Block } from 'payload/types'
import { blockFields } from '../fields'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Carousel: Block = {
  slug: 'carousel',
  labels: {
    singular: 'Карусель',
    plural: 'Карусели',
  },
  graphQL: {
    singularName: 'CarouselBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Заголовок блока (опционально)',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      admin: {
        description: 'Подзаголовок (опционально)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Описание карусели (опционально)',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Элементы карусели',
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Изображение или видео',
          },
        },
        {
          name: 'heading',
          type: 'text',
          admin: {
            description: 'Заголовок элемента (опционально)',
          },
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Подпись к элементу (опционально)',
          },
        },
        {
          name: 'content',
          type: 'richText',
          editor: lexicalEditor({}),
          admin: {
            description: 'Текстовое содержимое (опционально)',
          },
        },
        {
          name: 'actions',
          type: 'array',
          admin: {
            description: 'Кнопки или ссылки (опционально)',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'primary',
              options: [
                {
                  label: 'Основная',
                  value: 'primary',
                },
                {
                  label: 'Вторичная',
                  value: 'secondary',
                },
                {
                  label: 'Контур',
                  value: 'outline',
                },
                {
                  label: 'Ссылка',
                  value: 'link',
                },
              ],
            },
            {
              name: 'newTab',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Открыть в новой вкладке',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Автоматическое прокручивание карусели',
      },
    },
    {
      name: 'interval',
      type: 'number',
      defaultValue: 5000,
      admin: {
        description: 'Интервал прокрутки в миллисекундах',
        condition: (data) => data.autoplay === true,
      },
    },
    {
      name: 'showControls',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать кнопки управления',
      },
    },
    {
      name: 'showIndicators',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать индикаторы слайдов',
      },
    },
  ],
}
