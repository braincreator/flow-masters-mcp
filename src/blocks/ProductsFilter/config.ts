import { Block } from 'payload/types'

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
      name: 'minPrice',
      type: 'number',
      defaultValue: 0,
      label: 'Minimum Price',
      admin: {
        condition: (data) => data.enablePriceRange,
      },
    },
    {
      name: 'maxPrice',
      type: 'number',
      defaultValue: 1000,
      label: 'Maximum Price',
      admin: {
        condition: (data) => data.enablePriceRange,
      },
    },
  ],
}
