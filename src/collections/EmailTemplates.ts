import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'subject', 'sender', 'updatedAt'],
    group: 'Email',
  },
  labels: {
    singular: 'Email Шаблон',
    plural: 'Email Шаблоны',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {},
  fields: [
    {
      name: 'name',
      label: 'Название шаблона (для админки)',
      type: 'text',
      required: true,
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
      type: 'richText',
      required: true,
      localized: true,
      admin: {
        description: 'Используйте {{placeholder}} для вставки динамических данных.',
      },
    },
  ],
}
