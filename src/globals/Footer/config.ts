import type { GlobalConfig } from 'payload'
import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    group: 'Globals',
  },
  access: {
    read: () => true,
    update: () => true,
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
        }),
      ],
      maxRows: 12,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/globals/Footer/RowLabel',
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
        }),
      ],
      maxRows: 4,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/globals/Footer/RowLabel',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        const finalData = { ...data }

        // Ensure arrays are initialized if undefined
        if (!Array.isArray(finalData.bottomNavItems)) {
          finalData.bottomNavItems = []
        }
        if (!Array.isArray(finalData.mainNavItems)) {
          finalData.mainNavItems = []
        }

        req.payload.logger.info(
          'Footer beforeChange - final data:',
          JSON.stringify(finalData, null, 2),
        )
        return finalData
      },
    ],
    afterChange: [revalidateFooter],
  },
}
