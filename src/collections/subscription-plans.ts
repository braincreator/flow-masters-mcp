import { CollectionConfig } from 'payload/types'

export const SubscriptionPlans: CollectionConfig = {
  slug: 'subscription-plans',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'currency', 'period', 'autoRenew'],
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
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Name of the subscription plan',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Description of the subscription plan',
      },
    },
    {
      name: 'features',
      type: 'array',
      localized: true,
      admin: {
        description: 'List of features included in this plan',
      },
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      localized: true,
      admin: {
        description: 'Price of the subscription (localized by currency)',
      },
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      localized: true,
      admin: {
        description: 'Currency for the subscription plan',
      },
      options: [
        {
          label: 'Russian Ruble (RUB)',
          value: 'RUB',
        },
        {
          label: 'US Dollar (USD)',
          value: 'USD',
        },
        {
          label: 'Euro (EUR)',
          value: 'EUR',
        },
      ],
    },
    {
      name: 'period',
      type: 'select',
      required: true,
      admin: {
        description: 'Billing period',
      },
      options: [
        {
          label: 'Daily',
          value: 'daily',
        },
        {
          label: 'Weekly',
          value: 'weekly',
        },
        {
          label: 'Monthly',
          value: 'monthly',
        },
        {
          label: 'Quarterly',
          value: 'quarterly',
        },
        {
          label: 'Annual',
          value: 'annual',
        },
      ],
      defaultValue: 'monthly',
    },
    {
      name: 'trialPeriodDays',
      type: 'number',
      admin: {
        description: 'Number of days in trial period (0 for no trial)',
      },
      defaultValue: 0,
    },
    {
      name: 'maxSubscriptionMonths',
      type: 'number',
      admin: {
        description: 'Maximum number of months for subscription (0 for unlimited)',
      },
      defaultValue: 0,
    },
    {
      name: 'autoRenew',
      type: 'checkbox',
      admin: {
        description: 'Whether the subscription auto-renews',
      },
      defaultValue: true,
    },
    {
      name: 'allowCancel',
      type: 'checkbox',
      admin: {
        description: 'Whether users can cancel the subscription',
      },
      defaultValue: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      admin: {
        description: 'Whether this plan is active and available for purchase',
      },
      defaultValue: true,
    },
    {
      name: 'isPopular',
      type: 'checkbox',
      admin: {
        description: 'Является ли тариф популярным (отображается как рекомендованный)',
      },
      defaultValue: false,
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for this plan',
      },
    },
  ],
  timestamps: true,
}
