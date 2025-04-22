import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    group: 'Site Structure',
  },
  access: {
    read: () => true,
    update: () => true, // Ensure update access is granted
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      localized: true,
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/globals/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Parse _payload if it exists
        if (data._payload && typeof data._payload === 'string') {
          try {
            const parsedPayload = JSON.parse(data._payload)
            // Merge navItems from parsed payload if they exist
            if (parsedPayload.navItems) {
              data.navItems = parsedPayload.navItems
            }
          } catch (e) {
            req.payload.logger.error('Error parsing _payload:', e)
          }
        }

        req.payload.logger.info('Header beforeChange - final data:', JSON.stringify(data, null, 2))
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        req.payload.logger.info('Header afterChange - saved doc:', JSON.stringify(doc, null, 2))
        return await revalidateHeader({ doc, req })
      },
    ],
  },
}
