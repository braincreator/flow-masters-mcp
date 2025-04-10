import { Block } from 'payload/types'
import { blockFields } from '../fields'

export const AccordionBlock: Block = {
  slug: 'accordion',
  labels: {
    singular: 'Аккордеон',
    plural: 'Аккордеоны',
  },
  graphQL: {
    singularName: 'AccordionBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Добавьте элементы аккордеона',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Заголовок элемента',
          },
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
          admin: {
            description: 'Содержимое элемента',
          },
        },
        {
          name: 'items',
          type: 'array',
          admin: {
            description: 'Вложенные элементы (опционально)',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'Обычный',
          value: 'default',
        },
        {
          label: 'Разделенный',
          value: 'separated',
        },
        {
          label: 'В рамке',
          value: 'boxed',
        },
      ],
      admin: {
        description: 'Выберите стиль отображения',
      },
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'md',
      options: [
        {
          label: 'Маленький',
          value: 'sm',
        },
        {
          label: 'Средний',
          value: 'md',
        },
        {
          label: 'Большой',
          value: 'lg',
        },
      ],
      admin: {
        description: 'Выберите размер',
      },
    },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'Обычный',
          value: 'default',
        },
        {
          label: 'Разделенный',
          value: 'separated',
        },
        {
          label: 'В рамке',
          value: 'boxed',
        },
      ],
      admin: {
        description: 'Выберите вариант отображения',
      },
    },
    {
      name: 'allowMultiple',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Разрешить открытие нескольких элементов одновременно',
      },
    },
    {
      name: 'defaultOpen',
      type: 'array',
      admin: {
        description: 'Индексы элементов, открытых по умолчанию (начиная с 0)',
      },
      fields: [
        {
          name: 'index',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Индекс элемента',
          },
        },
      ],
    },
  ],
}
