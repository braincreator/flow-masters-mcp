import { CollectionConfig } from 'payload/types'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['status', 'userId', 'planId', 'period', 'amount', 'nextPaymentDate'],
    group: 'Subscriptions',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'userId',
      type: 'text',
      required: true,
      admin: {
        description: 'ID пользователя',
      },
    },
    {
      name: 'planId',
      type: 'relationship',
      relationTo: 'subscription-plans',
      required: true,
      admin: {
        description: 'План подписки',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Активна',
          value: 'active',
        },
        {
          label: 'Приостановлена',
          value: 'paused',
        },
        {
          label: 'Отменена',
          value: 'canceled',
        },
        {
          label: 'Истекла',
          value: 'expired',
        },
        {
          label: 'Ошибка платежа',
          value: 'failed',
        },
        {
          label: 'Ожидает оплаты',
          value: 'pending',
        },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'paymentProvider',
      type: 'select',
      required: true,
      options: [
        {
          label: 'YooMoney',
          value: 'yoomoney',
        },
        {
          label: 'Robokassa',
          value: 'robokassa',
        },
        {
          label: 'Stripe',
          value: 'stripe',
        },
        {
          label: 'PayPal',
          value: 'paypal',
        },
      ],
      defaultValue: 'yoomoney',
    },
    {
      name: 'paymentMethod',
      type: 'text',
      admin: {
        description: 'Метод оплаты (например, card, wallet)',
      },
    },
    {
      name: 'paymentToken',
      type: 'text',
      admin: {
        description: 'Токен платежного метода для рекуррентных платежей',
        position: 'sidebar',
      },
    },
    {
      name: 'period',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Ежедневно',
          value: 'daily',
        },
        {
          label: 'Еженедельно',
          value: 'weekly',
        },
        {
          label: 'Ежемесячно',
          value: 'monthly',
        },
        {
          label: 'Ежеквартально',
          value: 'quarterly',
        },
        {
          label: 'Ежегодно',
          value: 'annual',
        },
      ],
      defaultValue: 'monthly',
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
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Дата начала подписки',
      },
    },
    {
      name: 'nextPaymentDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Дата следующего платежа',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Дата окончания подписки (если есть)',
      },
    },
    {
      name: 'canceledAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Дата отмены подписки (если отменена)',
        position: 'sidebar',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Дополнительные метаданные',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
