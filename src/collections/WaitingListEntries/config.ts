import type { CollectionConfig } from 'payload'

export const WaitingListEntries: CollectionConfig = {
  slug: 'waiting-list-entries',
  admin: {
    group: 'Управление Обучением', // Translated group name
    useAsTitle: 'user', // Maybe combine user and course for title? Needs custom component.
    defaultColumns: ['user', 'course', 'createdAt'],
    description: 'Записи пользователей в списке ожидания для курсов.',
  },
  access: {
    // Admins can manage everything
    read: ({ req: { user } }) => user?.role === 'admin',
    create: ({ req: { user } }) => user?.role === 'admin', // Or allow users via custom endpoint
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
    // Users should likely not read/manage these directly, handled via hooks/endpoints
  },
  labels: {
    singular: 'Запись в Списке Ожидания',
    plural: 'Записи в Списке Ожидания',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Пользователь',
      admin: {
        readOnly: true, // Should be set programmatically
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      label: 'Курс',
      admin: {
        readOnly: true, // Should be set programmatically
      },
    },
    {
      name: 'notified',
      type: 'checkbox',
      label: 'Уведомлен о доступности?',
      defaultValue: false,
      admin: {
        description: 'Отметьте, если пользователь был уведомлен об освободившемся месте.',
      },
    },
    // Timestamps (createdAt, updatedAt) are added automatically
  ],
}