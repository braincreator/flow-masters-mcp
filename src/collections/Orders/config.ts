import type { CollectionConfig, Condition, Operation, User } from 'payload'; 
import type { Order } from '@/payload-types'; 
import OrderActions from './components/OrderActions' 
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf' 
import { PAYMENT_CONFIG } from '@/constants/payment'
import { grantCourseAccess } from './hooks/grantCourseAccess' 

type OrderItemSiblingData = { itemType?: 'product' | 'service' };

// Type for the options argument in validate functions
type CustomValidateOptions = { 
  siblingData: OrderItemSiblingData; 
  operation?: Operation; 
  user?: User; 
  id?: string | number; 
  data?: Partial<Order>; 
  originalDoc?: Partial<Order>; 
  req?: any; 
};


export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: [
      'orderNumber',
      'user',
      'total',
      'currency',
      'status',
      'paymentProvider',
      'createdAt',
    ],
    group: 'E-commerce',
  },
  access: {
    create: () => true,
    read: isAdminOrSelf, 
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
          name: 'itemType',
          type: 'select',
          options: [
            { label: 'Product', value: 'product' },
            { label: 'Service', value: 'service' },
          ],
          defaultValue: 'product',
          required: true,
          admin: {
            description: 'Type of item being ordered.',
          },
        },
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: false, 
          admin: {
            condition: (data: Partial<Order>, siblingData: OrderItemSiblingData) => siblingData?.itemType === 'product',
          },
          validate: (value: any, options: CustomValidateOptions) => {
            const { siblingData, operation } = options;
            if (operation === 'create' || operation === 'update') {
              if (siblingData?.itemType === 'product' && !value) {
                return 'Product is required when item type is "Product".';
              }
            }
            return true;
          },
        },
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          required: false, 
          admin: {
            condition: (data: Partial<Order>, siblingData: OrderItemSiblingData) => siblingData?.itemType === 'service',
          },
          validate: (value: any, options: CustomValidateOptions) => {
            const { siblingData, operation } = options;
            if (operation === 'create' || operation === 'update') {
              if (siblingData?.itemType === 'service' && !value) {
                return 'Service is required when item type is "Service".';
              }
            }
            return true;
          },
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
        { label: 'Shipped', value: 'shipped' },
        { label: 'Cancelled', value: 'cancelled' },
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
    {
      name: 'customOrderActions',
      type: 'ui', 
      admin: {
        components: {
          Field: OrderActions as any, 
        },
      },
    },
  ],
  hooks: {
    afterChange: [grantCourseAccess], 
  },
  timestamps: true,
}
