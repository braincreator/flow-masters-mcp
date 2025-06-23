import { CollectionConfig } from 'payload'
import { ServiceRegistry } from '@/services/service.registry'

export const SubscriptionPayments: CollectionConfig = {
  slug: 'subscription-payments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'subscriptionId', 'status', 'amount', 'currency', 'paymentDate', 'paymentMethod', 'transactionId'],
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
  hooks: {
    afterChange: [
      // Добавляем хук для событий платежей по подпискам
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие создания платежа
          await eventService.publishEvent('subscription_payment.created', {
            id: doc.id,
            subscription: typeof doc.subscriptionId === 'object' ? doc.subscriptionId.id : doc.subscriptionId,
            amount: doc.amount,
            currency: doc.currency,
            status: doc.status,
            paymentMethod: doc.paymentMethod,
            transactionId: doc.transactionId,
            paymentDate: doc.paymentDate,
            createdAt: doc.createdAt,
          }, {
            source: 'subscription_payment_creation',
            collection: 'subscription-payments',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие успешного платежа
          if (doc.status === 'successful' && previousDoc.status !== 'successful') {
            await eventService.publishEvent('subscription_payment.successful', {
              id: doc.id,
              subscription: typeof doc.subscriptionId === 'object' ? doc.subscriptionId.id : doc.subscriptionId,
              amount: doc.amount,
              currency: doc.currency,
              paymentMethod: doc.paymentMethod,
              transactionId: doc.transactionId,
              paymentDate: doc.paymentDate,
              previousStatus: previousDoc.status,
            }, {
              source: 'subscription_payment_success',
              collection: 'subscription-payments',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие неудачного платежа
          if (doc.status === 'failed' && previousDoc.status !== 'failed') {
            await eventService.publishEvent('subscription_payment.failed', {
              id: doc.id,
              subscription: typeof doc.subscriptionId === 'object' ? doc.subscriptionId.id : doc.subscriptionId,
              amount: doc.amount,
              currency: doc.currency,
              paymentMethod: doc.paymentMethod,
              transactionId: doc.transactionId,
              failureReason: doc.failureReason,
              paymentDate: doc.paymentDate,
              previousStatus: previousDoc.status,
            }, {
              source: 'subscription_payment_failure',
              collection: 'subscription-payments',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие возврата платежа
          if (doc.status === 'refunded' && previousDoc.status !== 'refunded') {
            await eventService.publishEvent('subscription_payment.refunded', {
              id: doc.id,
              subscription: typeof doc.subscriptionId === 'object' ? doc.subscriptionId.id : doc.subscriptionId,
              amount: doc.amount,
              currency: doc.currency,
              paymentMethod: doc.paymentMethod,
              transactionId: doc.transactionId,
              paymentDate: doc.paymentDate,
              refundedAt: new Date().toISOString(),
              previousStatus: previousDoc.status,
            }, {
              source: 'subscription_payment_refund',
              collection: 'subscription-payments',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие повторной попытки платежа
          if (doc.status === 'pending' && previousDoc.status === 'failed') {
            await eventService.publishEvent('subscription_payment.retry', {
              id: doc.id,
              subscription: typeof doc.subscriptionId === 'object' ? doc.subscriptionId.id : doc.subscriptionId,
              amount: doc.amount,
              currency: doc.currency,
              paymentMethod: doc.paymentMethod,
              previousFailureReason: previousDoc.failureReason,
              retryAt: new Date().toISOString(),
            }, {
              source: 'subscription_payment_retry',
              collection: 'subscription-payments',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }
      },
    ],
  },
  timestamps: true,
}
