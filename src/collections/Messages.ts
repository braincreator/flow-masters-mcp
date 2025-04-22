import type { CollectionConfig } from 'payload/types'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    group: 'Community & Engagement',
    useAsTitle: 'subject',
    defaultColumns: ['name', 'email', 'subject', 'source', 'createdAt'],
    preview: (doc) => `/admin/collections/messages/${doc.id}`,
    description: 'Сообщения, отправленные через контактную форму или другие источники.',
  },
  access: {
    // Доступ только для аутентифицированных пользователей (администраторов)
    create: () => false, // Нельзя создавать из админки напрямую
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Имя отправителя',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email отправителя',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'subject',
      type: 'text',
      label: 'Тема сообщения',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Текст сообщения',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'source',
      type: 'text',
      label: 'Источник',
      defaultValue: 'Unknown',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
