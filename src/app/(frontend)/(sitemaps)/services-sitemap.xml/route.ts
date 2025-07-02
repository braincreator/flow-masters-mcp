import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { unstable_cache } from 'next/cache'

const getServicesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://flow-masters.ru'

    const results = await payload.find({
      collection: 'services',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true,
        serviceType: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const sitemap = results.docs
      ? results.docs
          .filter((service) => Boolean(service?.slug))
          .map((service) => ({
            loc: `${SITE_URL}/services/${service?.slug}`,
            lastmod: service.updatedAt || dateFallback,
            changefreq: 'weekly',
            priority: 0.9, // Высокий приоритет для услуг
          }))
      : []

    return sitemap
  },
  ['services-sitemap'],
  {
    tags: ['services-sitemap'],
    revalidate: 3600, // Обновляем каждый час
  },
)

export async function GET() {
  const sitemap = await getServicesSitemap()

  return getServerSideSitemap(sitemap)
}
