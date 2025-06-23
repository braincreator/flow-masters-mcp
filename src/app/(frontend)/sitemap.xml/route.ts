import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function GET() {
  try {
    const payload = await getPayload({ config })
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'
    const currentDate = new Date().toISOString()

    // Получаем данные из всех коллекций
    const [pages, posts, services] = await Promise.all([
      payload.find({
        collection: 'pages',
        where: { _status: { equals: 'published' } },
        limit: 1000,
        select: { slug: true, updatedAt: true }
      }),
      payload.find({
        collection: 'posts',
        where: { _status: { equals: 'published' } },
        limit: 1000,
        select: { slug: true, updatedAt: true }
      }),
      payload.find({
        collection: 'services',
        where: { _status: { equals: 'published' } },
        limit: 1000,
        select: { slug: true, updatedAt: true }
      })
    ])

    // Создаем URL записи
    const createUrlEntry = (loc: string, lastmod: string, changefreq: string, priority: number) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`

    // Статические страницы
    const staticUrls = [
      createUrlEntry(`${baseUrl}/`, currentDate, 'daily', 1.0),
      createUrlEntry(`${baseUrl}/services`, currentDate, 'weekly', 0.9),
      createUrlEntry(`${baseUrl}/posts`, currentDate, 'daily', 0.8),
      createUrlEntry(`${baseUrl}/about`, currentDate, 'monthly', 0.7),
      createUrlEntry(`${baseUrl}/contact`, currentDate, 'monthly', 0.6),
      createUrlEntry(`${baseUrl}/search`, currentDate, 'weekly', 0.5),
    ]

    // Динамические страницы
    const pageUrls = pages.docs
      ?.filter(page => page.slug && page.slug !== 'home')
      .map(page => createUrlEntry(
        `${baseUrl}/${page.slug}`,
        page.updatedAt || currentDate,
        'weekly',
        0.7
      )) || []

    // Посты блога
    const postUrls = posts.docs
      ?.filter(post => post.slug)
      .map(post => createUrlEntry(
        `${baseUrl}/posts/${post.slug}`,
        post.updatedAt || currentDate,
        'weekly',
        0.8
      )) || []

    // Услуги
    const serviceUrls = services.docs
      ?.filter(service => service.slug)
      .map(service => createUrlEntry(
        `${baseUrl}/services/${service.slug}`,
        service.updatedAt || currentDate,
        'weekly',
        0.9
      )) || []

    // Собираем все URL
    const allUrls = [
      ...staticUrls,
      ...pageUrls,
      ...postUrls,
      ...serviceUrls
    ]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls.join('')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Кэш на 1 час
      },
    })

  } catch (error) {
    logError('Error generating sitemap:', error)
    
    // Возвращаем базовый sitemap в случае ошибки
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'
    const currentDate = new Date().toISOString()
    
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/posts</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Короткий кэш для fallback
      },
    })
  }
}
