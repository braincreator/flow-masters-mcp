import { Block } from 'payload'

export const ProductsFilter: Block = {
  slug: 'productsFilter',
  interfaceName: 'ProductsFilterBlock',
  fields: [
    {
      name: 'enableCategories',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Category Filter',
    },
    {
      name: 'enableSort',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Sort Options',
    },
    {
      name: 'enableSearch',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Search',
    },
    {
      name: 'enablePriceRange',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Price Range Filter',
    },
    {
      name: 'priceRanges',
      type: 'group',
      fields: [
        {
          name: 'en',
          type: 'group',
          fields: [
            {
              name: 'min',
              type: 'number',
              defaultValue: 0,
              label: 'Minimum Price (USD)',
            },
            {
              name: 'max',
              type: 'number',
              defaultValue: 1000,
              label: 'Maximum Price (USD)',
            },
          ],
        },
        {
          name: 'ru',
          type: 'group',
          fields: [
            {
              name: 'min',
              type: 'number',
              defaultValue: 0,
              label: 'Minimum Price (RUB)',
            },
            {
              name: 'max',
              type: 'number',
              defaultValue: 100000,
              label: 'Maximum Price (RUB)',
            },
          ],
        },
      ],
      admin: {
        condition: (data) => data.enablePriceRange,
      },
    },
  ],
}
