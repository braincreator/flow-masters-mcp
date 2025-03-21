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
  ],
}