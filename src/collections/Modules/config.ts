import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { availableBlocks } from '../../blocks'

export const Modules: CollectionConfig = {
  slug: 'modules',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'status', 'updatedAt'],
    description: 'Коллекция для модулей внутри курсов.',
  },
  versions: {
    drafts: true,
  },
  labels: {
    singular: 'Модуль Курса',
    plural: 'Модули Курса',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название модуля',
      required: true,
      localized: true,
    },
    ...slugField('title', { slugOverrides: { admin: { readOnly: true } } }),
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликован', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      label: 'Курс',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'layout',
      label: 'Содержимое модуля',
      type: 'blocks',
      minRows: 1,
      blocks: availableBlocks,
      required: true,
      localized: true,
    },
  ],
  // Хук для генерации уникального slug вида course-slug/module-slug
  // hooks: {
  //   beforeValidate: [
  //     async ({ data, req, originalDoc }) => {
  //       // Логика генерации слага...
  //       return data;
  //     }
  //   ]
  // }
}
