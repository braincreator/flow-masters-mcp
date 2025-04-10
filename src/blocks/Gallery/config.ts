import { Block } from 'payload/types'
import { blockFields } from '../fields'

export const Gallery: Block = {
  slug: 'gallery',
  labels: {
    singular: 'Галерея',
    plural: 'Галереи',
  },
  graphQL: {
    singularName: 'GalleryBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Заголовок галереи (опционально)',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Изображения для галереи',
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Выберите изображение',
          },
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Подпись к изображению (опционально)',
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
          label: 'Masonry',
          value: 'masonry',
        },
        {
          label: 'Карусель',
          value: 'carousel',
        },
      ],
      admin: {
        description: 'Выберите тип отображения',
      },
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
        description: 'Количество колонок',
        condition: (data) => data.layout !== 'carousel',
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
        description: 'Расстояние между изображениями',
      },
    },
  ],
}
