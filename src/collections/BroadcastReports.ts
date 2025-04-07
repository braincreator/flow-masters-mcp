import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const BroadcastReports: CollectionConfig = {
  slug: 'broadcast-reports',
  admin: {
    useAsTitle: 'title',
    description: 'Отчеты о результатах массовых рассылок новостей.',
    defaultColumns: ['title', 'status', 'successfullySent', 'failedToSend', 'createdAt'],
    group: 'Администрирование', // Или "Рассылки"
    readOnly: true, // Записи создаются только програмно
  },
  access: {
    read: isAdmin, // Только админы могут читать отчеты
    create: () => false, // Нельзя создавать вручную
    update: () => false, // Нельзя обновлять вручную
    delete: isAdmin, // Админы могут удалять старые отчеты
  },
  fields: [
    {
      name: 'broadcastId',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'locale',
      type: 'text',
      required: true,
    },
    {
      name: 'totalSubscribers',
      type: 'number',
      required: true,
    },
    {
      name: 'successfullySent',
      type: 'number',
      required: true,
    },
    {
      name: 'failedToSend',
      type: 'number',
      required: true,
    },
    {
      name: 'errors',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'error',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  timestamps: true, // Добавляем createdAt и updatedAt
  mongoose: {
    options: {
      suppressReservedKeysWarning: true, // Подавляем предупреждение о зарезервированных ключах
    },
  },
}
