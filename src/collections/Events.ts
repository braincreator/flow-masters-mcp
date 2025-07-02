import { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'source', 'timestamp', 'createdAt'],
    group: 'System',
    description: 'Системные события и логи активности',
  },
  labels: {
    singular: 'Событие',
    plural: 'События',
  },
  access: {
    read: isAdmin,
    update: isAdmin,
    create: isAdmin, // Разрешаем создание для системы
    delete: isAdmin,
  },
  fields: [
    {
      name: 'type',
      type: 'text',
      required: true,
      label: 'Тип события',
      admin: {
        description: 'Тип события (например, lead.created, post.published)',
      },
    },
    {
      name: 'source',
      type: 'text',
      label: 'Источник',
      admin: {
        description: 'Источник события (например, lead_creation, post_publication)',
      },
    },
    {
      name: 'data',
      type: 'json',
      required: true,
      label: 'Данные события',
      admin: {
        description: 'Полезная нагрузка события в формате JSON',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      label: 'Метаданные',
      admin: {
        description: 'Дополнительные метаданные события (пользователь, коллекция, операция)',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      label: 'Время события',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'processed',
      type: 'checkbox',
      label: 'Обработано',
      defaultValue: false,
      admin: {
        description: 'Отметка о том, что событие было обработано',
      },
    },
  ],
  timestamps: true,
}
