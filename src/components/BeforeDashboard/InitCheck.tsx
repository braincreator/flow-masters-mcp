import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ClientContent } from './ClientContent'
import { cache } from 'react'

// Cache the check function
const checkSiteConfig = cache(async () => {
  try {
    const payload = await getPayload({ config: await configPromise })
    const siteConfig = await payload
      .findGlobal({
        slug: 'site-config',
      })
      .catch(() => null)

    return Boolean(siteConfig)
  } catch (error) {
    return false
  }
})

export async function InitCheck() {
  const needsSiteConfig = !(await checkSiteConfig())

  return <ClientContent initialNeedsSiteConfig={needsSiteConfig} />
}
