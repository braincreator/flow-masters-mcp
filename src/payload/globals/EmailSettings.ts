import { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  admin: {
    group: 'System',
  },
  label: 'Email Settings',
  access: {
    read: () => true, // Or your specific access control
    update: isAdmin,
  },
  hooks: {},
  fields: [
    {
      name: 'smtpHost',
      label: 'SMTP Хост',
      type: 'text',
      required: true,
    },
    {
      name: 'smtpPort',
      label: 'SMTP Порт',
      type: 'number',
      required: true,
      defaultValue: 587,
    },
    {
      name: 'smtpUser',
      label: 'SMTP Пользователь',
      type: 'text',
      required: true,
    },
    {
      name: 'smtpPassword',
      label: 'SMTP Пароль',
      type: 'text',
      required: true,
      // Consider using a more secure field type or environment variables for production
    },
  ],
}
