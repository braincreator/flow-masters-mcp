import { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Settings: GlobalConfig = {
  slug: 'settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'System',
  },
  fields: [
    {
      name: 'currencies',
      type: 'group',
      label: 'Currency Settings',
      fields: [
        {
          name: 'baseCurrency',
          type: 'select',
          required: true,
          defaultValue: 'USD',
          admin: {
            description: 'Base currency for price calculations and conversions',
          },
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'RUB', value: 'RUB' },
          ],
        },
        {
          name: 'localeDefaults',
          type: 'array',
          label: 'Default Currencies by Locale',
          admin: {
            description: 'Set default display currency for each locale',
          },
          fields: [
            {
              name: 'locale',
              type: 'select',
              required: true,
              options: [
                { label: 'English', value: 'en' },
                { label: 'Russian', value: 'ru' },
              ],
            },
            {
              name: 'currency',
              type: 'select',
              required: true,
              options: [
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' },
                { label: 'RUB', value: 'RUB' },
              ],
            },
            {
              name: 'format',
              type: 'group',
              fields: [
                {
                  name: 'minimumFractionDigits',
                  type: 'number',
                  defaultValue: 2,
                  admin: {
                    step: 1,
                    description: 'Minimum number of decimal places',
                  },
                },
                {
                  name: 'maximumFractionDigits',
                  type: 'number',
                  defaultValue: 2,
                  admin: {
                    step: 1,
                    description: 'Maximum number of decimal places',
                  },
                },
              ],
            },
          ],
          admin: {
            components: {
              RowLabel: ({ data }) => {
                return `${data?.locale}: ${data?.currency}`
              },
            },
          },
        },
        {
          name: 'roundingRules',
          type: 'array',
          label: 'Rounding Rules',
          admin: {
            description: 'Special rounding rules for specific currencies',
          },
          fields: [
            {
              name: 'currency',
              type: 'select',
              required: true,
              options: [
                { label: 'RUB', value: 'RUB' },
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' },
              ],
            },
            {
              name: 'roundTo',
              type: 'select',
              required: true,
              defaultValue: '1',
              options: [
                { label: 'No rounding', value: '1' },
                { label: 'Round to 10', value: '10' },
                { label: 'Round to 50', value: '50' },
                { label: 'Round to 100', value: '100' },
              ],
            },
            {
              name: 'roundingMethod',
              type: 'select',
              required: true,
              defaultValue: 'round',
              options: [
                { label: 'Round (mathematical)', value: 'round' },
                { label: 'Round up', value: 'ceil' },
                { label: 'Round down', value: 'floor' },
              ],
            }
          ]
        },
        {
          name: 'markup',
          type: 'array',
          label: 'Currency Markup',
          admin: {
            description: 'Add percentage markup when converting to specific currencies',
          },
          fields: [
            {
              name: 'currency',
              type: 'select',
              required: true,
              options: [
                { label: 'RUB', value: 'RUB' },
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' },
              ],
            },
            {
              name: 'percentage',
              type: 'number',
              required: true,
              defaultValue: 0,
              min: 0,
              max: 100,
              admin: {
                step: 0.1,
                description: 'Markup percentage (e.g., 5 for 5%)',
              },
            }
          ]
        }
      ],
    },
    {
      name: 'exchangeRates',
      type: 'group',
      label: 'Exchange Rates',
      fields: [
        {
          name: 'rates',
          type: 'array',
          label: 'Currency Rates',
          admin: {
            description: 'Manual currency exchange rates. These override automatic rates.',
          },
          fields: [
            {
              name: 'fromCurrency',
              type: 'select',
              required: true,
              options: [
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' },
                { label: 'RUB', value: 'RUB' },
                // Добавьте другие валюты по необходимости
              ],
            },
            {
              name: 'toCurrency',
              type: 'select',
              required: true,
              options: [
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' },
                { label: 'RUB', value: 'RUB' },
                // Добавьте другие валюты по необходимости
              ],
            },
            {
              name: 'rate',
              type: 'number',
              required: true,
              min: 0,
              admin: {
                step: 0.0001,
                description: 'Exchange rate value',
              },
            },
            {
              name: 'enabled',
              type: 'checkbox',
              label: 'Override automatic rate',
              defaultValue: true,
            },
          ],
          admin: {
            components: {
              RowLabel: ({ data }) => {
                return `${data?.fromCurrency} → ${data?.toCurrency}: ${data?.rate}`
              },
            },
          },
        },
        {
          name: 'autoUpdateEnabled',
          type: 'checkbox',
          label: 'Enable automatic rate updates',
          defaultValue: true,
        },
        {
          name: 'updateInterval',
          type: 'select',
          label: 'Auto-update interval',
          defaultValue: '6h',
          options: [
            { label: 'Every hour', value: '1h' },
            { label: 'Every 6 hours', value: '6h' },
            { label: 'Every 12 hours', value: '12h' },
            { label: 'Every 24 hours', value: '24h' },
          ],
          admin: {
            condition: (data, siblingData) => siblingData.autoUpdateEnabled,
          },
        },
        {
          name: 'lastUpdate',
          type: 'date',
          label: 'Last Update',
          admin: {
            position: 'sidebar',
            readOnly: true,
            description: 'Last time rates were updated',
          },
        },
      ],
    },
    {
      name: 'webhooks',
      type: 'array',
      label: 'Webhooks',
      admin: {
        description: 'Configure webhooks for product events',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'Webhook endpoint URL',
          },
        },
        {
          name: 'secret',
          type: 'text',
          admin: {
            description: 'Secret key for webhook signature',
          },
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'events',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Product Created', value: 'product.created' },
            { label: 'Product Updated', value: 'product.updated' },
            { label: 'Product Deleted', value: 'product.deleted' },
            { label: 'Product Published', value: 'product.published' },
            { label: 'Product Unpublished', value: 'product.unpublished' },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (data.exchangeRates?.rates) {
          // Validate that we don't have duplicate currency pairs
          const pairs = new Set()
          for (const rate of data.exchangeRates.rates) {
            const pair = `${rate.fromCurrency}_${rate.toCurrency}`
            if (pairs.has(pair)) {
              throw new Error(`Duplicate currency pair: ${pair}`)
            }
            pairs.add(pair)
          }
        }
        return data
      }
    ],
    afterChange: [
      async ({ doc, previousDoc }) => {
        // Если изменились курсы валют или правила округления
        if (
          JSON.stringify(doc.exchangeRates) !== JSON.stringify(previousDoc.exchangeRates) ||
          JSON.stringify(doc.currencies.roundingRules) !== JSON.stringify(previousDoc.currencies.roundingRules) ||
          JSON.stringify(doc.currencies.markup) !== JSON.stringify(previousDoc.currencies.markup)
        ) {
          // Инвалидируем кеш
          const priceService = PriceService.getInstance()
          priceService.invalidateCache()
          
          // Обновляем цены всех продуктов
          await updateProductPrices()
        }
      }
    ]
  },
}
