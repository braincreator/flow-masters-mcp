import { cache } from 'react'
import { CACHE_REVALIDATE_SECONDS } from '@/constants'
import { getPayloadClient } from './payload'

export const getCachedGlobal = ({
  slug,
  depth = 1,
  locale,
}: {
  slug: string
  depth?: number
  locale?: string
}) =>
  cache(
    async () => {
      const payload = await getPayloadClient()
      
      const global = await payload.findGlobal({
        slug,
        depth,
        locale,
        draft: false,
      })

      if (!global) {
        throw new Error(`Global not found: ${slug}`)
      }

      return global
    },
    [`global-${slug}-${locale}`],
  )
