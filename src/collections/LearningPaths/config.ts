import type { CollectionConfig } from 'payload'

export const LearningPaths: CollectionConfig = {
  slug: 'learning-paths',
  admin: {
    group: 'Learning Management',
    useAsTitle: 'title',
    description: 'Определите последовательности курсов для пользователей.',
    defaultColumns: ['title', 'updatedAt'],
  },
  labels: {
    singular: 'Учебный Путь',
    plural: 'Учебные Пути',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название Учебного Пути',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
    },
    {
      name: 'courses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      label: 'Курсы в Пути',
      required: true,
      admin: {
        description: 'Выберите курсы и упорядочите их в нужной последовательности.',
        // Note: Payload's default relationship UI allows drag-and-drop reordering when hasMany is true.
      },
    },
    // Future enhancement: Could add prerequisites for the path itself, or link to a product.
  ],
}