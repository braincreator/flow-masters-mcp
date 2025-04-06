import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const BroadcastReports: CollectionConfig = {
  slug: 'broadcast-reports',
  admin: {
    useAsTitle: 'jobID', // Используем ID задачи как заголовок в админке
    description: 'Отчеты о результатах массовых рассылок новостей.',
    defaultColumns: ['status', 'totalSubscribers', 'successfullySent', 'failedToSend', 'createdAt'],
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
      name: 'jobID',
      type: 'text',
      label: 'ID Задачи',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      label: 'Статус Задачи',
      type: 'select',
      options: [
        { label: 'Завершено', value: 'completed' },
        { label: 'Ошибка', value: 'failed' },
      ],
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'broadcastTitle',
      label: 'Тема Рассылки',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'broadcastLocale',
      label: 'Локаль Рассылки',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalSubscribers',
      label: 'Всего Подписчиков',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'successfullySent',
      label: 'Успешно Отправлено',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'failedToSend',
      label: 'Не Отправлено',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'errors',
      label: 'Ошибки Отправки',
      type: 'json', // Храним массив ошибок как JSON
      admin: {
        readOnly: true,
        description: 'Список email и причин ошибок при отправке.',
      },
    },
  ],
  timestamps: true, // Добавляем createdAt и updatedAt
}
