import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'

const checkSiteConfigExists = unstable_cache(
  async () => {
    const payload = await getPayload({ config: await configPromise })
    const siteConfig = await payload.findGlobal({
      slug: 'site-config',
    }).catch(() => null)
    
    return Boolean(siteConfig)
  },
  ['site-config-exists'],
  {
    tags: ['site-config'],
    revalidate: 60, // Cache for 1 minute
  }
)

export async function GET() {
  try {
    const exists = await checkSiteConfigExists()
    return NextResponse.json({ exists })
  } catch (error) {
    return NextResponse.json({ exists: false })
  }
}
