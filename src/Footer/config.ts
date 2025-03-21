import type { GlobalConfig } from 'payload'
import { link } from '../fields/link'
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
    beforeChange: [
      ({ data, req }) => {
        let finalData = { ...data }

        // Parse _payload if it exists
        if (data._payload && typeof data._payload === 'string') {
          try {
            const parsedPayload = JSON.parse(data._payload)
            
            // Handle navigation items specifically
            if (Array.isArray(parsedPayload.bottomNavItems)) {
              finalData.bottomNavItems = parsedPayload.bottomNavItems
            }
            if (Array.isArray(parsedPayload.mainNavItems)) {
              finalData.mainNavItems = parsedPayload.mainNavItems
            }

            // Copy over other fields except navigation items
            Object.keys(parsedPayload).forEach(key => {
              if (key !== 'bottomNavItems' && key !== 'mainNavItems') {
                finalData[key] = parsedPayload[key]
              }
            })

            // Remove the _payload field
            delete finalData._payload
          } catch (e) {
            req.payload.logger.error('Error parsing _payload:', e)
          }
        }

        // Ensure arrays are initialized if undefined
        if (!Array.isArray(finalData.bottomNavItems)) {
          finalData.bottomNavItems = []
        }
        if (!Array.isArray(finalData.mainNavItems)) {
          finalData.mainNavItems = []
        }

        req.payload.logger.info('Footer beforeChange - final data:', JSON.stringify(finalData, null, 2))
        return finalData
      }
    ],
    afterChange: [
      async ({ doc, req }) => {
        req.payload.logger.info('Footer afterChange - saved doc:', JSON.stringify(doc, null, 2))
        return await revalidateFooter({ doc, req })
      }
    ],
  },
}
