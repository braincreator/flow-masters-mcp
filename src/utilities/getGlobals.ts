import type { Config } from '../payload-types'
import { getPayloadClient } from './payload'
import { unstable_cache } from 'next/cache'

interface GlobalParams {
  slug: keyof Config['globals']
  depth?: number
  locale?: string
}

export async function getGlobal({ slug, depth = 0, locale }: GlobalParams) {
  const payload = await getPayloadClient()

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
  })

  return global
}

export const getCachedGlobal = ({ 
  slug, 
  depth = 0, 
  locale, 
  tags = [] 
}: GlobalParams & { tags?: string[] }) =>
  unstable_cache(
    async () => getGlobal({ slug, depth, locale }),
    [slug, ...(locale ? [locale] : [])],
    {
      tags: [`global_${slug}`, ...tags],
    }
  )
