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
    afterChange: [],
  },
}
