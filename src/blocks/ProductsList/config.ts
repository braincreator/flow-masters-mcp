import { Block } from 'payload/types'
import { blockFields } from '../fields'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const ProductsList: Block = {
  slug: 'productsList',
  labels: {
    singular: 'Список продуктов',
    plural: 'Списки продуктов',
  },
  graphQL: {
    singularName: 'ProductsListBlock',
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
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'Выберите продукты для отображения',
        condition: (data) => data.enableDynamicSource !== true,
      },
    },
    {
      name: 'enableDynamicSource',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Использовать динамический источник продуктов',
      },
    },
    {
      name: 'source',
      type: 'select',
      admin: {
        description: 'Источник продуктов',
        condition: (data) => data.enableDynamicSource === true,
      },
      options: [
        {
          label: 'Новые продукты',
          value: 'new',
        },
        {
          label: 'Популярные продукты',
          value: 'popular',
        },
        {
          label: 'Акционные продукты',
          value: 'sale',
        },
        {
          label: 'Рекомендуемые продукты',
          value: 'featured',
        },
      ],
    },
    {
      name: 'limit',
      type: 'number',
      min: 1,
      max: 50,
      defaultValue: 6,
      admin: {
        description: 'Максимальное количество продуктов',
        condition: (data) => data.enableDynamicSource === true,
      },
    },
    {
      name: 'enableFiltering',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Включить фильтрацию продуктов',
      },
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
      admin: {
        description: 'Стиль отображения продуктов',
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
        condition: (data) => data.layout === 'grid',
      },
    },
  ],
}
