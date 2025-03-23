import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Discounts: CollectionConfig = {
  slug: 'discounts',
  admin: {
    group: 'Shop',
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'status', 'usageCount'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Promotional code (e.g. SUMMER2024)',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Percentage off', value: 'percentage' },
        { label: 'Fixed amount off', value: 'fixed' },
        { label: 'Free shipping', value: 'shipping' },
      ],
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      admin: {
        description: 'Discount amount (percentage or fixed amount)',
        condition: (data) => ['percentage', 'fixed'].includes(data?.type),
      },
    },
    {
      name: 'currency',
      type: 'select',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'RUB', value: 'RUB' },
      ],
      admin: {
        condition: (data) => data?.type === 'fixed',
      },
    },
    {
      name: 'minOrderAmount',
      type: 'number',
      admin: {
        description: 'Minimum order amount to apply discount',
      },
    },
    {
      name: 'maxDiscount',
      type: 'number',
      admin: {
        description: 'Maximum discount amount (optional)',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'maxUsage',
      type: 'number',
      admin: {
        description: 'Maximum number of times this code can be used',
      },
    },
    {
      name: 'maxUsagePerUser',
      type: 'number',
      admin: {
        description: 'Maximum times a single user can use this code',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      name: 'applicableProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'Leave empty to apply to all products',
      },
    },
    {
      name: 'excludedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    {
      name: 'applicableCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Leave empty to apply to all categories',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create') {
          data.usageCount = 0
        }
        return data
      },
    ],
  },
}