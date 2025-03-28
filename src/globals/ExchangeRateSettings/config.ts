import { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { createGlobalHook } from '@/utilities/revalidation'

// Create a revalidation hook
const revalidateExchangeRateSettings = createGlobalHook('exchange-rate-settings')

export const ExchangeRateSettings: GlobalConfig = {
  slug: 'exchange-rate-settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'System',
  },
  fields: [
    {
      name: 'auto',
      type: 'group',
      label: 'Automatic Exchange Rates',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable Automatic Updates',
          defaultValue: false,
        },
        {
          name: 'provider',
          type: 'select',
          label: 'Exchange Rate Provider',
          required: true,
          defaultValue: 'openexchangerates',
          options: [
            {
              label: 'Open Exchange Rates',
              value: 'openexchangerates',
            },
            {
              label: 'Exchange Rate API',
              value: 'exchangerateapi',
            },
            {
              label: 'Fixer.io',
              value: 'fixer',
            },
            {
              label: 'Currency Layer',
              value: 'currencylayer',
            },
          ],
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
        },
        {
          name: 'apiKey',
          type: 'text',
          label: 'API Key',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
        },
        {
          name: 'updateFrequency',
          type: 'select',
          label: 'Update Frequency',
          required: true,
          defaultValue: 'daily',
          options: [
            {
              label: 'Hourly',
              value: 'hourly',
            },
            {
              label: 'Daily',
              value: 'daily',
            },
            {
              label: 'Weekly',
              value: 'weekly',
            },
          ],
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
        },
        {
          name: 'lastUpdated',
          type: 'date',
          label: 'Last Updated',
          admin: {
            readOnly: true,
            description: 'Timestamp of the last automatic update',
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'yyyy-MM-dd HH:mm',
            },
          },
        },
      ],
    },
    {
      name: 'rates',
      type: 'array',
      label: 'Exchange Rates',
      admin: {
        description: 'Manual exchange rates (these will override automatic rates)',
      },
      fields: [
        {
          name: 'fromCurrency',
          type: 'select',
          label: 'From Currency',
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
          name: 'toCurrency',
          type: 'select',
          label: 'To Currency',
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
          name: 'rate',
          type: 'number',
          label: 'Exchange Rate',
          required: true,
          min: 0.000001,
          admin: {
            description: 'Rate to convert from the base currency to the target currency',
            step: 0.000001,
          },
        },
        {
          name: 'manuallySet',
          type: 'checkbox',
          label: 'Manually Set',
          defaultValue: true,
          admin: {
            description: 'Whether this rate should be preserved during automatic updates',
          },
        },
        {
          name: 'lastUpdated',
          type: 'date',
          label: 'Last Updated',
          admin: {
            readOnly: true,
            description: 'Timestamp of the last update for this rate',
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'yyyy-MM-dd HH:mm',
            },
          },
        },
      ],
    },
    {
      name: 'display',
      type: 'group',
      label: 'Display Settings',
      fields: [
        {
          name: 'showExchangeRate',
          type: 'checkbox',
          label: 'Show Exchange Rate in UI',
          defaultValue: true,
          admin: {
            description: 'Show the current exchange rate when user switches currency',
          },
        },
        {
          name: 'allowUserCurrencySwitch',
          type: 'checkbox',
          label: 'Allow Users to Switch Currency',
          defaultValue: true,
        },
        {
          name: 'showPriceInMultipleCurrencies',
          type: 'checkbox',
          label: 'Show Price in Multiple Currencies',
          defaultValue: false,
          admin: {
            description: 'Show price in both the user-selected currency and the base currency',
          },
        },
      ],
    },
    {
      name: 'failover',
      type: 'group',
      label: 'Failover Settings',
      fields: [
        {
          name: 'maxRateAge',
          type: 'number',
          label: 'Maximum Rate Age (hours)',
          required: true,
          defaultValue: 48,
          min: 1,
          max: 720,
          admin: {
            description: 'Maximum age of rates before they are considered stale',
          },
        },
        {
          name: 'fallbackToManualRates',
          type: 'checkbox',
          label: 'Fallback to Manual Rates',
          defaultValue: true,
          admin: {
            description: 'Use manually set rates if automatic update fails',
          },
        },
        {
          name: 'disableCurrencySwitching',
          type: 'checkbox',
          label: 'Disable Currency Switching When Rates are Stale',
          defaultValue: false,
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

            req.payload.logger.info('ExchangeRateSettings beforeChange - parsed _payload')
          } catch (e) {
            req.payload.logger.error('Error parsing _payload:', e)
          }
        }

        // Set lastUpdated timestamp for manual rates
        if (data.rates && Array.isArray(data.rates)) {
          const now = new Date().toISOString()
          data.rates.forEach((rate) => {
            if (!rate.lastUpdated) {
              rate.lastUpdated = now
            }
          })
        }

        req.payload.logger.info('ExchangeRateSettings beforeChange - final data')
        return data
      },
    ],
    afterChange: [
      // Use the standard revalidation hook
      revalidateExchangeRateSettings,
    ],
  },
}
