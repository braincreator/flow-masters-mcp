import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'subject', 'sender', 'updatedAt'],
    group: 'Marketing & Communications',
  },
  labels: {
    singular: 'Email Template',
    plural: 'Email Templates',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // If the template was synced from code, add a flag
        if (data.lastSyncedAt) {
          data.syncedFromCode = true
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      label: 'Название шаблона (для админки)',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Описание',
      type: 'textarea',
      admin: {
        description: 'Краткое описание назначения шаблона',
      },
    },
    {
      name: 'slug',
      label: 'Идентификатор (slug)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Уникальный идентификатор для использования в коде (например, "welcome-email").',
      },
    },
    {
      name: 'templateType',
      label: 'Тип шаблона',
      type: 'select',
      options: [
        { label: 'Аутентификация', value: 'auth' },
        { label: 'Курсы', value: 'courses' },
        { label: 'Заказы', value: 'orders' },
        { label: 'Награды', value: 'rewards' },
        { label: 'Рассылки', value: 'newsletters' },
        { label: 'Другое', value: 'other' },
      ],
      defaultValue: 'other',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sender',
      label: 'Отправитель (Адрес и Подпись)',
      type: 'relationship',
      relationTo: 'sender-emails',
      required: true,
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'subject',
      label: 'Тема письма',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'body',
      label: 'Тело письма',
      type: 'code',
      required: true,
      admin: {
        description: 'Используйте {{placeholder}} для вставки динамических данных.',
        language: 'html',
      },
    },
    {
      name: 'placeholders',
      label: 'Доступные плейсхолдеры',
      type: 'text',
      admin: {
        description: 'Список доступных плейсхолдеров, разделенных запятыми',
        readOnly: true,
      },
    },
    {
      name: 'syncedFromCode',
      label: 'Синхронизирован из кода',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Этот шаблон был создан или обновлен из кода',
      },
    },
    {
      name: 'lastSyncedAt',
      label: 'Последняя синхронизация',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'previewNote',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Для предпросмотра шаблона сохраните изменения',
      },
      defaultValue: 'Предпросмотр доступен после сохранения',
    },
  ],
}
