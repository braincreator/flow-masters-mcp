import type { GlobalConfig } from 'payload'
import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'mainNavItems',
      label: 'Main Navigation Items',
      type: 'array',
      localized: true,
      fields: [
        link({
          appearances: false,
          localized: true,
        }),
      ],
      maxRows: 12,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'bottomNavItems',
      label: 'Bottom Navigation Items',
      type: 'array',
      localized: true,
      fields: [
        link({
          appearances: false,
          localized: true,
        }),
      ],
      maxRows: 4,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
