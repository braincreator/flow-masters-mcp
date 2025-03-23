import type { SearchConfig } from '@payloadcms/plugin-search/types'

export const searchConfig: SearchConfig = {
  collections: ['posts'],
  searchOverrides: {
    fields: [
      {
        name: 'title',
        weight: 2,
      },
      {
        name: 'description',
        weight: 1,
      },
      {
        name: 'slug',
        weight: 1,
      },
    ],
  },
}