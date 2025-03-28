import { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { createGlobalHook } from '@/utilities/revalidation'

// Create a revalidation hook
const revalidateCurrencySettings = createGlobalHook('currency-settings')

export const CurrencySettings: GlobalConfig = {
  slug: 'currency-settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'System',
  },
  fields: [
    {
      name: 'baseCurrency',
      type: 'select',
      label: 'Base Currency',
      required: true,
      defaultValue: 'RUB',
      options: [
        { label: 'Russian Ruble (₽)', value: 'RUB' },
        { label: 'US Dollar ($)', value: 'USD' },
        { label: 'Euro (€)', value: 'EUR' },
        { label: 'British Pound (£)', value: 'GBP' },
        { label: 'Japanese Yen (¥)', value: 'JPY' },
        { label: 'Chinese Yuan (¥)', value: 'CNY' },
        { label: 'Indian Rupee (₹)', value: 'INR' },
        { label: 'Canadian Dollar ($)', value: 'CAD' },
        { label: 'Australian Dollar ($)', value: 'AUD' },
        { label: 'Swiss Franc (Fr)', value: 'CHF' },
      ],
      admin: {
        description: 'Primary currency used for internal calculations',
      },
    },
    {
      name: 'supportedCurrencies',
      type: 'select',
      label: 'Supported Currencies',
      required: true,
      hasMany: true,
      defaultValue: ['RUB', 'USD', 'EUR'],
      options: [
        { label: 'Russian Ruble (₽)', value: 'RUB' },
        { label: 'US Dollar ($)', value: 'USD' },
        { label: 'Euro (€)', value: 'EUR' },
        { label: 'British Pound (£)', value: 'GBP' },
        { label: 'Japanese Yen (¥)', value: 'JPY' },
        { label: 'Chinese Yuan (¥)', value: 'CNY' },
        { label: 'Indian Rupee (₹)', value: 'INR' },
        { label: 'Canadian Dollar ($)', value: 'CAD' },
        { label: 'Australian Dollar ($)', value: 'AUD' },
        { label: 'Swiss Franc (Fr)', value: 'CHF' },
      ],
      admin: {
        description: 'Currencies available to customers on the frontend',
      },
    },
    {
      name: 'displayFormat',
      type: 'group',
      label: 'Display Format',
      fields: [
        {
          name: 'symbolPosition',
          type: 'radio',
          label: 'Currency Symbol Position',
          required: true,
          defaultValue: 'after',
          options: [
            {
              label: 'Before value (e.g., $100)',
              value: 'before',
            },
            {
              label: 'After value (e.g., 100₽)',
              value: 'after',
            },
          ],
        },
        {
          name: 'showCurrencyCode',
          type: 'checkbox',
          label: 'Show Currency Code',
          defaultValue: false,
          admin: {
            description: 'Display currency code along with the symbol (e.g., $100 USD)',
          },
        },
        {
          name: 'thousandsSeparator',
          type: 'select',
          label: 'Thousands Separator',
          required: true,
          defaultValue: ' ',
          options: [
            {
              label: 'Space (1 000 000)',
              value: ' ',
            },
            {
              label: 'Comma (1,000,000)',
              value: ',',
            },
            {
              label: 'Period (1.000.000)',
              value: '.',
            },
            {
              label: 'None (1000000)',
              value: '',
            },
          ],
        },
        {
          name: 'decimalSeparator',
          type: 'select',
          label: 'Decimal Separator',
          required: true,
          defaultValue: '.',
          options: [
            {
              label: 'Period (100.00)',
              value: '.',
            },
            {
              label: 'Comma (100,00)',
              value: ',',
            },
          ],
        },
        {
          name: 'decimalPlaces',
          type: 'select',
          label: 'Decimal Places',
          required: true,
          defaultValue: '2',
          options: [
            {
              label: '0 (100)',
              value: '0',
            },
            {
              label: '1 (100.0)',
              value: '1',
            },
            {
              label: '2 (100.00)',
              value: '2',
            },
          ],
        },
      ],
    },
    {
      name: 'localeDefaults',
      type: 'array',
      label: 'Locale-specific Currency Settings',
      admin: {
        description: 'Override default currency for specific locales',
      },
      fields: [
        {
          name: 'locale',
          type: 'select',
          label: 'Locale',
          required: true,
          options: [
            {
              label: 'English',
              value: 'en',
            },
            {
              label: 'Russian',
              value: 'ru',
            },
          ],
        },
        {
          name: 'currency',
          type: 'select',
          label: 'Default Currency',
          required: true,
          options: [
            { label: 'Russian Ruble (₽)', value: 'RUB' },
            { label: 'US Dollar ($)', value: 'USD' },
            { label: 'Euro (€)', value: 'EUR' },
            { label: 'British Pound (£)', value: 'GBP' },
            { label: 'Japanese Yen (¥)', value: 'JPY' },
            { label: 'Chinese Yuan (¥)', value: 'CNY' },
            { label: 'Indian Rupee (₹)', value: 'INR' },
            { label: 'Canadian Dollar ($)', value: 'CAD' },
            { label: 'Australian Dollar ($)', value: 'AUD' },
            { label: 'Swiss Franc (Fr)', value: 'CHF' },
          ],
        },
        {
          name: 'format',
          type: 'group',
          label: 'Format Overrides',
          fields: [
            {
              name: 'symbolPosition',
              type: 'radio',
              label: 'Currency Symbol Position',
              options: [
                {
                  label: 'Before value (e.g., $100)',
                  value: 'before',
                },
                {
                  label: 'After value (e.g., 100₽)',
                  value: 'after',
                },
              ],
            },
            {
              name: 'thousandsSeparator',
              type: 'select',
              label: 'Thousands Separator',
              options: [
                {
                  label: 'Space (1 000 000)',
                  value: ' ',
                },
                {
                  label: 'Comma (1,000,000)',
                  value: ',',
                },
                {
                  label: 'Period (1.000.000)',
                  value: '.',
                },
                {
                  label: 'None (1000000)',
                  value: '',
                },
              ],
            },
            {
              name: 'decimalSeparator',
              type: 'select',
              label: 'Decimal Separator',
              options: [
                {
                  label: 'Period (100.00)',
                  value: '.',
                },
                {
                  label: 'Comma (100,00)',
                  value: ',',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'roundingRules',
      type: 'array',
      label: 'Price Rounding Rules',
      admin: {
        description: 'Rules for rounding prices in different ranges',
      },
      fields: [
        {
          name: 'minPrice',
          type: 'number',
          label: 'Min Price (inclusive)',
          required: true,
          min: 0,
        },
        {
          name: 'maxPrice',
          type: 'number',
          label: 'Max Price (exclusive)',
          required: true,
          min: 0,
        },
        {
          name: 'roundTo',
          type: 'number',
          label: 'Round To',
          required: true,
          min: 0,
          admin: {
            description: 'Round to nearest value (e.g., 5, 10, 99, etc.)',
          },
        },
        {
          name: 'strategy',
          type: 'select',
          label: 'Rounding Strategy',
          defaultValue: 'nearest',
          options: [
            {
              label: 'Round to nearest',
              value: 'nearest',
            },
            {
              label: 'Round down',
              value: 'down',
            },
            {
              label: 'Round up',
              value: 'up',
            },
          ],
        },
      ],
    },
    {
      name: 'markup',
      type: 'array',
      label: 'Currency Markup',
      admin: {
        description: 'Add additional markup for specific currencies',
      },
      fields: [
        {
          name: 'currency',
          type: 'select',
          label: 'Currency',
          required: true,
          options: [
            { label: 'Russian Ruble (₽)', value: 'RUB' },
            { label: 'US Dollar ($)', value: 'USD' },
            { label: 'Euro (€)', value: 'EUR' },
            { label: 'British Pound (£)', value: 'GBP' },
            { label: 'Japanese Yen (¥)', value: 'JPY' },
            { label: 'Chinese Yuan (¥)', value: 'CNY' },
            { label: 'Indian Rupee (₹)', value: 'INR' },
            { label: 'Canadian Dollar ($)', value: 'CAD' },
            { label: 'Australian Dollar ($)', value: 'AUD' },
            { label: 'Swiss Franc (Fr)', value: 'CHF' },
          ],
        },
        {
          name: 'percentage',
          type: 'number',
          label: 'Markup Percentage',
          required: true,
          defaultValue: 0,
          min: -100,
          max: 100,
          admin: {
            description:
              'Additional percentage to add to exchange rate (can be negative for discounts)',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Parse _payload if it exists
        if (data._payload && typeof data._payload === 'string') {
          try {
            const parsedPayload = JSON.parse(data._payload)

            // Apply all fields from parsed payload
            Object.keys(parsedPayload).forEach((key) => {
              if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
                data[key] = parsedPayload[key]
              }
            })

            req.payload.logger.info('CurrencySettings beforeChange - parsed _payload')
          } catch (e) {
            req.payload.logger.error('Error parsing _payload:', e)
          }
        }

        req.payload.logger.info('CurrencySettings beforeChange - final data')
        return data
      },
    ],
    afterChange: [
      // Use the standard revalidation hook
      revalidateCurrencySettings,
    ],
  },
}
