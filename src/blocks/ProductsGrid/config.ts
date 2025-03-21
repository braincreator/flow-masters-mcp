import { Block } from 'payload/types'

export const ProductsGrid: Block = {
  slug: 'productsGrid',
  interfaceName: 'ProductsGridBlock',
  fields: [
    {
      name: 'productsPerPage',
      type: 'number',
      defaultValue: 12,
      admin: {
        description: 'Number of products to display per page',
      },
    },
    {
      name: 'showPagination',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        {
          label: 'Grid',
          value: 'grid',
        },
        {
          label: 'List',
          value: 'list',
        },
      ],
      defaultValue: 'grid',
    },
  ],
}