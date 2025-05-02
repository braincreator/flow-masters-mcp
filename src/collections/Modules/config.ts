import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { availableBlocks } from '../../blocks'

export const Modules: CollectionConfig = {
  slug: 'modules',
  admin: {
    group: 'Learning Management',
    useAsTitle: 'title',
    listSearchableFields: ['title'],
    defaultColumns: ['title', 'course', 'order', 'status', 'updatedAt'],
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
    // NEW: Order field for sequencing within the course
    {
      name: 'order',
      type: 'number',
      label: 'Порядок',
      required: true,
      admin: {
        description: 'Порядковый номер модуля в курсе.',
        position: 'sidebar',
      },
    },
    // NEW: Optional prerequisites (other modules)
    {
      name: 'prerequisites',
      type: 'relationship',
      relationTo: 'modules',
      hasMany: true,
      label: 'Предварительные модули',
      required: false,
      admin: {
        description: 'Модули, которые должны быть завершены перед началом этого.',
      },
    },
  ],
  // TODO: Implement hook for unique slug within course if needed
  // hooks: {
  //   beforeValidate: [
  //     async ({ data, req, originalDoc }) => {
  //       // Логика генерации слага...
  //       return data;
  //     }
  //   ]
  // }
}
