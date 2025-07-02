import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://flow-masters.ru'

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const defaultSitemap = [
      {
        loc: `${SITE_URL}/`,
        lastmod: dateFallback,
        changefreq: 'daily',
        priority: 1.0,
      },
      {
        loc: `${SITE_URL}/search`,
        lastmod: dateFallback,
        changefreq: 'weekly',
        priority: 0.5,
      },
      {
        loc: `${SITE_URL}/posts`,
        lastmod: dateFallback,
        changefreq: 'daily',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/services`,
        lastmod: dateFallback,
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        loc: `${SITE_URL}/courses`,
        lastmod: dateFallback,
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/about`,
        lastmod: dateFallback,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/contact`,
        lastmod: dateFallback,
        changefreq: 'monthly',
        priority: 0.6,
      },
    ]

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .map((page) => {
            // Определяем приоритет и частоту обновления в зависимости от типа страницы
            let priority = 0.7
            let changefreq = 'weekly'

            if (page?.slug === 'home') {
              priority = 1.0
              changefreq = 'daily'
            } else if (page?.slug?.includes('service')) {
              priority = 0.9
              changefreq = 'weekly'
            } else if (page?.slug?.includes('course')) {
              priority = 0.8
              changefreq = 'weekly'
            }

            return {
              loc: page?.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
              changefreq,
              priority,
            }
          })
      : []

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
    revalidate: 3600, // Кэш на 1 час
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
