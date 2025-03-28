import type { GlobalConfig } from 'payload/types'
import { deepMerge } from 'payload/utilities'
import { isAdmin } from '@/access/isAdmin'

type BeforeValidateHook = (args: { data: any }) => any

const beforeValidateCurrency: BeforeValidateHook = ({ data }) => {
  console.log('Validating currency settings:', data)
  return data
}

export const Currencies: GlobalConfig = {
  slug: 'currencies',
  label: 'Currency Settings',
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Financial Settings',
    components: {
      views: {
        edit: () => import('@/globals/Currencies/CurrenciesEdit').then(module => ({
          Component: module.default,
          path: '/edit'
        })),
      }
    }
  },
  hooks: {
    beforeValidate: [beforeValidateCurrency]
  },
  fields: [
    {
      name: 'baseCurrency',
      type: 'select',
      required: true,
      options: ['USD', 'EUR', 'RUB'],
      defaultValue: 'USD'
    },
    {
      name: 'exchangeRates',
      type: 'group',
      fields: [
        {
          name: 'autoUpdateEnabled',
          type: 'checkbox',
          defaultValue: true
        },
        {
          name: 'updateInterval',
          type: 'select',
          options: ['1h', '6h', '12h', '24h'],
          defaultValue: '6h'
        }
      ]
    }
  ]
}