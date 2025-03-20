import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'

export const getSiteConfig = unstable_cache(
  async () => {
    const payload = await getPayload({ config: await configPromise })
    const siteConfig = await payload.findGlobal({
      slug: 'site-config',
    }).catch(() => null)
    
    return siteConfig
  },
  ['site-config'],
  {
    tags: ['site-config'],
    revalidate: 60, // Cache for 1 minute
  }
)