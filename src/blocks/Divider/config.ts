import { Block } from 'payload/types'
import { blockFields } from '../fields'

export const Divider: Block = {
  slug: 'divider',
  labels: {
    singular: 'Разделитель',
    plural: 'Разделители',
  },
  graphQL: {
    singularName: 'DividerBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'style',
      type: 'select',
      defaultValue: 'solid',
      options: [
        {
          label: 'Сплошная линия',
          value: 'solid',
        },
        {
          label: 'Пунктирная линия',
          value: 'dashed',
        },
        {
          label: 'Точечная линия',
          value: 'dotted',
        },
      ],
      admin: {
        description: 'Стиль разделителя',
      },
    },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'full',
      options: [
        {
          label: 'Узкий',
          value: 'narrow',
        },
        {
          label: 'Средний',
          value: 'medium',
        },
        {
          label: 'Широкий',
          value: 'wide',
        },
        {
          label: 'Полная ширина',
          value: 'full',
        },
      ],
      admin: {
        description: 'Ширина разделителя',
      },
    },
    {
      name: 'spacing',
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
        description: 'Внешний отступ',
      },
    },
  ],
}
