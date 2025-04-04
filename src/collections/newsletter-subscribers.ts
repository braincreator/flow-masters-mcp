import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrHasSiteAccess } from '@/access/isAdminOrHasSiteAccess'
import { generateUniqueToken } from '@/utilities/generateUniqueToken'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'createdAt'],
    group: 'Контент',
  },
  access: {
    read: () => true,
    create: () => true, // Разрешаем публичное создание для подписки
    update: isAdminOrHasSiteAccess, // Только админы могут обновлять
    delete: isAdmin, // Только админы могут удалять
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Генерируем уникальный токен для отписки при создании нового подписчика
        if (!data.unsubscribeToken) {
          return {
            ...data,
            unsubscribeToken: generateUniqueToken(),
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Email адрес подписчика',
      },
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Имя подписчика (опционально)',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        {
          label: 'Активный',
          value: 'active',
        },
        {
          label: 'Отписан',
          value: 'unsubscribed',
        },
        {
          label: 'Ошибка',
          value: 'bounced',
        },
      ],
      admin: {
        description: 'Статус подписки',
      },
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      unique: true,
      admin: {
        description: 'Уникальный токен для отписки',
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        read: () => true,
        update: () => false, // Не разрешаем обновлять токен вручную
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Источник подписки (блог, главная страница и т.д.)',
      },
    },
    {
      name: 'locale',
      type: 'select',
      options: [
        {
          label: 'Русский',
          value: 'ru',
        },
        {
          label: 'English',
          value: 'en',
        },
      ],
      defaultValue: 'ru',
      admin: {
        description: 'Предпочитаемый язык',
      },
    },
    {
      name: 'lastSent',
      type: 'date',
      admin: {
        description: 'Дата последней отправки рассылки',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Дополнительные данные о подписчике',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
