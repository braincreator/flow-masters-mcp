import { CollectionConfig } from 'payload/types'

export const SubscriptionPayments: CollectionConfig = {
  slug: 'subscription-payments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['subscriptionId', 'status', 'amount', 'paymentDate'],
    group: 'Subscriptions',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'subscriptionId',
      type: 'relationship',
      relationTo: 'subscriptions',
      required: true,
      admin: {
        description: 'Подписка',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Сумма платежа',
      },
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Российский рубль (RUB)',
          value: 'RUB',
        },
        {
          label: 'Доллар США (USD)',
          value: 'USD',
        },
        {
          label: 'Евро (EUR)',
          value: 'EUR',
        },
      ],
      defaultValue: 'RUB',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Успешно',
          value: 'successful',
        },
        {
          label: 'Ошибка',
          value: 'failed',
        },
        {
          label: 'Возврат',
          value: 'refunded',
        },
        {
          label: 'В обработке',
          value: 'pending',
        },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'paymentDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Дата платежа',
      },
    },
    {
      name: 'paymentMethod',
      type: 'text',
      admin: {
        description: 'Метод платежа',
      },
    },
    {
      name: 'transactionId',
      type: 'text',
      admin: {
        description: 'ID транзакции в платежной системе',
      },
    },
    {
      name: 'failureReason',
      type: 'text',
      admin: {
        description: 'Причина ошибки (если статус failed)',
      },
    },
    {
      name: 'rawResponse',
      type: 'json',
      admin: {
        description: 'Полный ответ от платежной системы',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
