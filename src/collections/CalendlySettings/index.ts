import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import WebhookInstructions from './components/WebhookInstructions'

export const CalendlySettings: CollectionConfig = {
  slug: 'calendly-settings',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'eventType', 'isActive'],
    group: 'Integrations & Services',
    components: {
      BeforeListView: WebhookInstructions,
    },
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название',
      admin: {
        description: 'Понятное название для идентификации настроек Calendly',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
      admin: {
        description: 'Краткое описание назначения этих настроек',
      },
    },
    {
      name: 'username',
      type: 'text',
      required: true,
      label: 'Calendly Username',
      admin: {
        description: 'Ваш username в Calendly (часть URL после calendly.com/)',
      },
    },
    {
      name: 'eventType',
      type: 'text',
      required: true,
      label: 'Тип события',
      admin: {
        description: 'Slug типа события в Calendly (часть URL после username)',
      },
    },
    {
      name: 'hideEventTypeDetails',
      type: 'checkbox',
      label: 'Скрыть детали события',
      defaultValue: true,
      admin: {
        description: 'Скрыть детали типа события в виджете Calendly',
      },
    },
    {
      name: 'hideGdprBanner',
      type: 'checkbox',
      label: 'Скрыть баннер GDPR',
      defaultValue: true,
      admin: {
        description: 'Скрыть баннер GDPR в виджете Calendly',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Активен',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      label: 'Владелец календаря',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lastUsed',
      type: 'date',
      label: 'Последнее использование',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'webhookUrl',
      type: 'text',
      label: 'Webhook URL для уведомлений',
      admin: {
        description: 'URL для получения уведомлений о новых бронированиях',
      },
    },
    {
      name: 'webhookSecret',
      type: 'text',
      label: 'Секретный ключ для webhook',
      admin: {
        description: 'Секретный ключ для проверки подлинности запросов от Calendly',
      },
    },
  ],
}
