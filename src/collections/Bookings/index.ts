import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'startTime', 'invitee.name'],
    group: 'Integrations & Services',
  },
  access: {
    read: () => true,
    create: () => true, // Разрешаем создание через API
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Название',
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Calendly', value: 'calendly' },
        { label: 'Ручное', value: 'manual' },
        { label: 'Другое', value: 'other' },
      ],
      defaultValue: 'calendly',
      required: true,
      label: 'Тип бронирования',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Подтверждено', value: 'confirmed' },
        { label: 'Отменено', value: 'canceled' },
        { label: 'Перенесено', value: 'rescheduled' },
        { label: 'Завершено', value: 'completed' },
        { label: 'Не состоялось', value: 'no-show' },
      ],
      defaultValue: 'confirmed',
      required: true,
      label: 'Статус',
    },
    {
      name: 'startTime',
      type: 'date',
      label: 'Время начала',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endTime',
      type: 'date',
      label: 'Время окончания',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'eventName',
      type: 'text',
      label: 'Название события',
    },
    {
      name: 'location',
      type: 'text',
      label: 'Тип встречи',
    },
    {
      name: 'invitee',
      type: 'group',
      label: 'Информация о клиенте',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Имя',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Телефон',
        },
        {
          name: 'timezone',
          type: 'text',
          label: 'Часовой пояс',
        },
      ],
    },
    {
      name: 'questions',
      type: 'array',
      label: 'Ответы на вопросы',
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Вопрос',
        },
        {
          name: 'answer',
          type: 'text',
          label: 'Ответ',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Примечания',
    },
    {
      name: 'cancellationReason',
      type: 'text',
      label: 'Причина отмены',
      admin: {
        condition: (data) => data.status === 'canceled',
      },
    },
    {
      name: 'canceledBy',
      type: 'text',
      label: 'Кем отменено',
      admin: {
        condition: (data) => data.status === 'canceled',
      },
    },
    {
      name: 'previousStartTime',
      type: 'date',
      label: 'Предыдущее время начала',
      admin: {
        condition: (data) => data.status === 'rescheduled',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'previousEndTime',
      type: 'date',
      label: 'Предыдущее время окончания',
      admin: {
        condition: (data) => data.status === 'rescheduled',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'calendlyURI',
      type: 'text',
      label: 'URI события Calendly',
      admin: {
        condition: (data) => data.type === 'calendly',
      },
    },
    {
      name: 'calendlyUUID',
      type: 'text',
      label: 'UUID события Calendly',
      admin: {
        condition: (data) => data.type === 'calendly',
      },
      index: true,
    },
    {
      name: 'calendlyEventTypeURI',
      type: 'text',
      label: 'URI типа события Calendly',
      admin: {
        condition: (data) => data.type === 'calendly',
      },
    },
    {
      name: 'settingsId',
      type: 'text',
      label: 'ID настроек Calendly',
      admin: {
        condition: (data) => data.type === 'calendly',
      },
    },
    {
      name: 'source',
      type: 'text',
      label: 'Источник (UTM Source)',
    },
    {
      name: 'medium',
      type: 'text',
      label: 'Канал (UTM Medium)',
    },
    {
      name: 'campaign',
      type: 'text',
      label: 'Кампания (UTM Campaign)',
    },
    {
      name: 'rawData',
      type: 'textarea',
      label: 'Исходные данные',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      label: 'Связанный заказ',
      admin: {
        description: 'Заказ, связанный с этим бронированием',
        position: 'sidebar',
      },
    },
    {
      name: 'isPaid',
      type: 'checkbox',
      label: 'Оплачено',
      defaultValue: false,
      admin: {
        description: 'Отметьте, если консультация оплачена',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
