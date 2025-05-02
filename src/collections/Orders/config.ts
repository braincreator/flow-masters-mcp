import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf' // Corrected import
import { PAYMENT_CONFIG } from '@/constants/payment'
import { grantCourseAccess } from './hooks/grantCourseAccess' // Import the hook

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'user', 'total', 'status', 'createdAt'],
    group: 'E-commerce',
  },
  access: {
    create: () => true,
    read: isAdminOrSelf, // Corrected usage
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique order identifier',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      defaultValue: PAYMENT_CONFIG.defaultCurrency,
      options: PAYMENT_CONFIG.supportedCurrencies.map((currency) => ({
        label: currency,
        value: currency,
      })),
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'paymentProvider',
      type: 'select',
      options: Object.entries(PAYMENT_CONFIG.providers)
        .filter(([_, config]) => config.enabled)
        .map(([provider, config]) => ({
          label: config.name,
          value: provider,
        })),
    },
    {
      name: 'paymentId',
      type: 'text',
      admin: {
        description: 'Payment system transaction ID',
      },
    },
    {
      name: 'paymentData',
      type: 'json',
      admin: {
        description: 'Additional payment information',
      },
    },
  ],
  hooks: {
    afterChange: [grantCourseAccess], // Add the hook
  },
  timestamps: true,
}
