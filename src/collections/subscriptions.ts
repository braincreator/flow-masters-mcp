import { CollectionConfig, PayloadRequest } from 'payload'
import { SubscriptionService } from '../services/subscription.service'
import { NotificationService } from '../services/notification.service'
import { Subscription as PayloadSubscription, SubscriptionPlan } from '../payload-types'
import {
  Subscription as AppSubscription,
  SubscriptionStatus,
  SubscriptionStatusEnum,
} from '../types/subscription'
import { anyone } from '@/access/anyone'
import { isAdmin } from '@/access/isAdmin'
import { checkRole } from '@/access/checkRole'
import { ServiceRegistry } from '@/services/service.registry'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'id',
    description: 'User subscriptions.',
    defaultColumns: ['id', 'user', 'plan', 'status', 'startedAt', 'expiresAt', 'paymentMethod', 'updatedAt'],
    group: 'Orders & Subscriptions',
  },
  access: {
    read: ({ req }) => {
      if (isAdmin({ req })) {
        return true
      }
      // Allow users to read their own subscriptions
      return {
        user: {
          equals: req.user?.id,
        },
      }
    },
    create: ({ req }) => checkRole(['admin'], req.user ?? undefined),
    update: ({ req }) => checkRole(['admin'], req.user ?? undefined),
    delete: ({ req }) => checkRole(['admin'], req.user ?? undefined),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      index: true,
      admin: {
        readOnly: true, // Usually set on creation
      },
    },
    {
      name: 'plan',
      type: 'relationship',
      relationTo: 'subscription-plans',
      required: true,
      hasMany: false,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: Object.values(SubscriptionStatusEnum).map((statusValue: SubscriptionStatusEnum) => ({
        label: statusValue.charAt(0).toUpperCase() + statusValue.slice(1),
        value: statusValue,
      })),
      required: true,
      defaultValue: SubscriptionStatusEnum.PENDING,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paymentMethod', // e.g., 'yoomoney', 'robokassa', 'crypto'
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'paymentId', // ID from the payment provider
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'startedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
        readOnly: true, // Usually set on activation
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'renewedAt', // Last renewal date
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'canceledAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'pausedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
        readOnly: true,
      },
    },
    // Поля для отслеживания попыток оплаты и статуса последней попытки
    {
      name: 'paymentRetryAttempt',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Number of payment retry attempts made for the current billing cycle.',
      },
    },
    {
      name: 'lastPaymentAttemptFailed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Indicates if the last payment attempt for this subscription failed.',
      },
    },
    // Potentially add a field for cancellation reason or pause reason
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        if (data.status === SubscriptionStatusEnum.CANCELED && data.status !== originalDoc.status) {
          data.canceledAt = new Date()
          if (data.pausedAt) {
            data.pausedAt = null
          }
        }
        if (data.status === SubscriptionStatusEnum.PAUSED && data.status !== originalDoc.status) {
          data.pausedAt = new Date()
          if (data.canceledAt) {
            data.canceledAt = null
          }
        }
        if (
          originalDoc.status === SubscriptionStatusEnum.PAUSED &&
          data.status !== SubscriptionStatusEnum.PAUSED
        ) {
          data.pausedAt = null
        }
        if (
          originalDoc.status === SubscriptionStatusEnum.CANCELED &&
          data.status !== SubscriptionStatusEnum.CANCELED
        ) {
          data.canceledAt = null
        }
        return data
      },
    ],
    afterChange: [
      // Добавляем хук для событий подписок
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие создания подписки
          await eventService.publishEvent('subscription.created', {
            id: doc.id,
            user: typeof doc.user === 'object' ? doc.user.id : doc.user,
            userName: typeof doc.user === 'object' ? doc.user.name : null,
            userEmail: typeof doc.user === 'object' ? doc.user.email : null,
            plan: typeof doc.plan === 'object' ? doc.plan.id : doc.plan,
            planName: typeof doc.plan === 'object' ? doc.plan.name : null,
            planPrice: typeof doc.plan === 'object' ? doc.plan.price : null,
            status: doc.status,
            paymentMethod: doc.paymentMethod,
            startedAt: doc.startedAt,
            expiresAt: doc.expiresAt,
            createdAt: doc.createdAt,
          }, {
            source: 'subscription_creation',
            collection: 'subscriptions',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие продления подписки
          if (doc.renewedAt && doc.renewedAt !== previousDoc.renewedAt) {
            await eventService.publishEvent('subscription.renewed', {
              id: doc.id,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              plan: typeof doc.plan === 'object' ? doc.plan.id : doc.plan,
              planName: typeof doc.plan === 'object' ? doc.plan.name : null,
              planPrice: typeof doc.plan === 'object' ? doc.plan.price : null,
              previousExpiresAt: previousDoc.expiresAt,
              newExpiresAt: doc.expiresAt,
              renewedAt: doc.renewedAt,
            }, {
              source: 'subscription_renewal',
              collection: 'subscriptions',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие отмены подписки
          if (doc.status === SubscriptionStatusEnum.CANCELED && previousDoc.status !== SubscriptionStatusEnum.CANCELED) {
            await eventService.publishEvent('subscription.cancelled', {
              id: doc.id,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              plan: typeof doc.plan === 'object' ? doc.plan.id : doc.plan,
              planName: typeof doc.plan === 'object' ? doc.plan.name : null,
              previousStatus: previousDoc.status,
              canceledAt: doc.canceledAt,
              expiresAt: doc.expiresAt,
            }, {
              source: 'subscription_cancellation',
              collection: 'subscriptions',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие истечения подписки
          if (doc.status === SubscriptionStatusEnum.EXPIRED && previousDoc.status !== SubscriptionStatusEnum.EXPIRED) {
            await eventService.publishEvent('subscription.expired', {
              id: doc.id,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              plan: typeof doc.plan === 'object' ? doc.plan.id : doc.plan,
              planName: typeof doc.plan === 'object' ? doc.plan.name : null,
              previousStatus: previousDoc.status,
              expiresAt: doc.expiresAt,
              expiredAt: new Date().toISOString(),
            }, {
              source: 'subscription_expiration',
              collection: 'subscriptions',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие приостановки подписки
          if (doc.status === SubscriptionStatusEnum.PAUSED && previousDoc.status !== SubscriptionStatusEnum.PAUSED) {
            await eventService.publishEvent('subscription.paused', {
              id: doc.id,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              plan: typeof doc.plan === 'object' ? doc.plan.id : doc.plan,
              planName: typeof doc.plan === 'object' ? doc.plan.name : null,
              previousStatus: previousDoc.status,
              pausedAt: doc.pausedAt,
            }, {
              source: 'subscription_pause',
              collection: 'subscriptions',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие неудачной попытки оплаты
          if (doc.lastPaymentAttemptFailed && !previousDoc.lastPaymentAttemptFailed) {
            await eventService.publishEvent('subscription.payment_failed', {
              id: doc.id,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              plan: typeof doc.plan === 'object' ? doc.plan.id : doc.plan,
              planName: typeof doc.plan === 'object' ? doc.plan.name : null,
              paymentRetryAttempt: doc.paymentRetryAttempt,
              expiresAt: doc.expiresAt,
            }, {
              source: 'subscription_payment_failure',
              collection: 'subscriptions',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие скорого истечения подписки (за 7 дней)
          const daysUntilExpiry = doc.expiresAt ?
            Math.ceil((new Date(doc.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

          if (daysUntilExpiry <= 7 && daysUntilExpiry > 0 && doc.status === SubscriptionStatusEnum.ACTIVE) {
            await eventService.publishEvent('subscription.expiring_soon', {
              id: doc.id,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              plan: typeof doc.plan === 'object' ? doc.plan.id : doc.plan,
              planName: typeof doc.plan === 'object' ? doc.plan.name : null,
              expiresAt: doc.expiresAt,
              daysUntilExpiry,
            }, {
              source: 'subscription_expiring_soon',
              collection: 'subscriptions',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }
      },
    ],
  },
}
