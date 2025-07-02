import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { unstable_cache } from 'next/cache'

const getEnSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'

    // Получаем все материалы
    const [posts, services, pages] = await Promise.all([
      payload.find({
        collection: 'posts',
        limit: 1000,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'services',
        limit: 1000,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'pages',
        limit: 1000,
        select: { slug: true, updatedAt: true },
      }),
    ])

    const dateFallback = new Date().toISOString()

    const sitemap = [
      // Главная страница
      {
        loc: `${SITE_URL}/en`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0,
        alternateRefs: [
          {
            href: `${SITE_URL}/en`,
            hreflang: 'en',
          },
          {
            href: `${SITE_URL}/ru`,
            hreflang: 'ru',
          },
        ],
      },
      
      // Статические страницы
      ...pages.docs
        .filter((page) => Boolean(page?.slug))
        .map((page) => ({
          loc: page?.slug === 'home' 
            ? `${SITE_URL}/en` 
            : `${SITE_URL}/en/${page?.slug}`,
          lastmod: page.updatedAt || dateFallback,
          changefreq: getPageChangeFreq(page?.slug),
          priority: getPagePriority(page?.slug),
          alternateRefs: [
            {
              href: page?.slug === 'home' 
                ? `${SITE_URL}/en` 
                : `${SITE_URL}/en/${page?.slug}`,
              hreflang: 'en',
            },
            {
              href: page?.slug === 'home' 
                ? `${SITE_URL}/ru` 
                : `${SITE_URL}/ru/${page?.slug}`,
              hreflang: 'ru',
            },
          ],
        })),

      // Посты блога
      ...posts.docs
        .filter((post) => Boolean(post?.slug))
        .map((post) => ({
          loc: `${SITE_URL}/en/posts/${post?.slug}`,
          lastmod: post.updatedAt || dateFallback,
          changefreq: 'weekly',
          priority: 0.8,
          alternateRefs: [
            {
              href: `${SITE_URL}/en/posts/${post?.slug}`,
              hreflang: 'en',
            },
            {
              href: `${SITE_URL}/ru/posts/${post?.slug}`,
              hreflang: 'ru',
            },
          ],
        })),

      // Услуги
      ...services.docs
        .filter((service) => Boolean(service?.slug))
        .map((service) => ({
          loc: `${SITE_URL}/en/services/${service?.slug}`,
          lastmod: service.updatedAt || dateFallback,
          changefreq: 'weekly',
          priority: 0.9,
          alternateRefs: [
            {
              href: `${SITE_URL}/en/services/${service?.slug}`,
              hreflang: 'en',
            },
            {
              href: `${SITE_URL}/ru/services/${service?.slug}`,
              hreflang: 'ru',
            },
          ],
        })),
    ]

    return sitemap
  },
  ['en-sitemap'],
  {
    tags: ['en-sitemap'],
    revalidate: 3600,
  },
)

export async function GET() {
  const sitemap = await getEnSitemap()
  return getServerSideSitemap(sitemap)
}

function getPagePriority(slug?: string): number {
  if (!slug) return 0.6
  
  const priorities: Record<string, number> = {
    home: 1.0,
    services: 0.9,
    about: 0.8,
    contact: 0.8,
    blog: 0.7,
    cases: 0.7,
    courses: 0.7,
  }
  return priorities[slug] || 0.6
}

function getPageChangeFreq(slug?: string): string {
  if (!slug) return 'monthly'
  
  const frequencies: Record<string, string> = {
    home: 'daily',
    services: 'weekly',
    blog: 'daily',
    about: 'monthly',
    contact: 'monthly',
  }
  return frequencies[slug] || 'monthly'
}
