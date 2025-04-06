import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const SenderEmails: CollectionConfig = {
  slug: 'sender-emails',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'senderName', 'emailAddress'],
    group: 'Email', // Group with EmailTemplates
  },
  labels: {
    singular: 'Sender Email',
    plural: 'Sender Emails',
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
      label: 'Название',
      type: 'text',
      required: true,
      admin: {
        description: 'Внутреннее название, например, "Поддержка" или "Без ответа".',
      },
    },
    {
      name: 'senderName',
      label: 'Имя отправителя (From Name)',
      type: 'text',
      required: true,
      admin: {
        description: 'Имя, которое увидит получатель, например, "Flow Masters Support".',
      },
    },
    {
      name: 'emailAddress',
      label: 'Email адрес (From Email)',
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'signature',
      label: 'Подпись',
      type: 'richText',
      admin: {
        description: 'Подпись, которая будет добавлена к письмам, отправленным с этого адреса.',
      },
    },
  ],
}
