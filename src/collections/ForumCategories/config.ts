import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'

export const ForumCategories: CollectionConfig = {
  slug: 'forum-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'description'],
    description: 'Категории для организации тем на форуме.',
  },
  labels: {
    singular: 'Категория Форума',
    plural: 'Категории Форума',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Название категории',
      required: true,
      localized: true,
    },
    ...slugField(),
    {
      name: 'description',
      type: 'textarea',
      label: 'Краткое описание категории',
      localized: true,
    },
    // Можно добавить поле для иконки категории
    // {
    //   name: 'icon',
    //   type: 'upload',
    //   relationTo: 'media',
    // }
    // Можно добавить поле для порядка сортировки
    // {
    //   name: 'order',
    //   type: 'number'
    // }
  ],
}
