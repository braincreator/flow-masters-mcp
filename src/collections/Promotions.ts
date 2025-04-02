import { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'code',
    group: 'Marketing',
    description: 'Manage promotion codes and discounts',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Promotion code (e.g., SUMMER2023)',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Percentage Discount', value: 'percentage' },
        { label: 'Fixed Amount', value: 'fixed' },
        { label: 'Buy X Get Y', value: 'buy_x_get_y' },
      ],
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      admin: {
        description: 'Discount value (percentage or amount)',
      },
    },
    {
      name: 'minPurchase',
      type: 'number',
      admin: {
        description: 'Minimum purchase amount required',
      },
    },
    {
      name: 'maxDiscount',
      type: 'number',
      admin: {
        description: 'Maximum discount amount',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'usageLimit',
      type: 'number',
      admin: {
        description: 'Maximum number of times this code can be used',
      },
    },
    {
      name: 'userLimit',
      type: 'number',
      admin: {
        description: 'Maximum times a single user can use this code',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Expired', value: 'expired' },
      ],
      defaultValue: 'active',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'Specific products this promotion applies to (leave empty for all products)',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Specific categories this promotion applies to',
      },
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['status', 'startDate', 'endDate'],
    },
  ],
}