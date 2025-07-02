import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { unstable_cache } from 'next/cache'
import { lexicalToHtml } from '@/utilities/lexicalToHtml'

const getServicesRssFeed = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://flow-masters.ru'

    // Получаем активные услуги
    const results = await payload.find({
      collection: 'services',
      overrideAccess: false,
      draft: false,
      depth: 2,
      limit: 100, // Все услуги
      pagination: false,
      where: {
        businessStatus: {
          equals: 'active',
        },
      },
      sort: '-updatedAt', // Сортируем по дате обновления
      select: {
        title: true,
        slug: true,
        description: true,
        content: true,
        updatedAt: true,
        createdAt: true,
        publishedAt: true,
        meta: true,
      },
    })

    const currentDate = new Date().toUTCString()

    // Создаем RSS элементы для каждой услуги
    const rssItems = results.docs
      ? results.docs
          .filter((service) => Boolean(service?.slug))
          .map((service) => {
            const serviceUrl = `${SITE_URL}/services/${service.slug}`
            const pubDate = service.publishedAt
              ? new Date(service.publishedAt).toUTCString()
              : service.createdAt
                ? new Date(service.createdAt).toUTCString()
                : new Date(service.updatedAt).toUTCString()

            // Конвертируем контент в HTML
            const contentHtml = service.content ? lexicalToHtml(service.content) : ''

            // Используем description или первые 300 символов контента как описание
            const description =
              service.description ||
              (contentHtml ? contentHtml.replace(/<[^>]*>/g, '').substring(0, 300) + '...' : '')

            // Экранируем HTML для XML
            const escapeXml = (str: string) => {
              return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
            }

            return `
    <item>
      <title><![CDATA[${service.title}]]></title>
      <link>${serviceUrl}</link>
      <guid isPermaLink="true">${serviceUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author>admin@flow-masters.ru (Flow Masters)</author>
      <category><![CDATA[AI Services]]></category>
    </item>`
          })
          .join('')
      : ''

    // Создаем полный RSS feed для услуг
    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Flow Masters - AI Services</title>
    <link>${SITE_URL}/services</link>
    <description>Услуги по внедрению искусственного интеллекта и автоматизации бизнес-процессов от Flow Masters</description>
    <language>ru</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <managingEditor>admin@flow-masters.ru (Flow Masters)</managingEditor>
    <webMaster>admin@flow-masters.ru (Flow Masters)</webMaster>
    <generator>Flow Masters CMS</generator>
    <image>
      <url>${SITE_URL}/favicon.ico</url>
      <title>Flow Masters Services</title>
      <link>${SITE_URL}/services</link>
    </image>
    <atom:link href="${SITE_URL}/services-rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`

    return rssFeed
  },
  ['services-rss-feed'],
  {
    tags: ['services-rss-feed'],
    revalidate: 7200, // Кэш на 2 часа (услуги обновляются реже)
  },
)

export async function GET() {
  try {
    const rssFeed = await getServicesRssFeed()

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=7200, s-maxage=7200', // Кэш на 2 часа
      },
    })
  } catch (error) {
    console.error('Error generating Services RSS feed:', error)

    // Возвращаем пустой, но валидный RSS feed в случае ошибки
    const errorFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Flow Masters - AI Services</title>
    <link>https://flow-masters.ru/services</link>
    <description>RSS feed временно недоступен</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`

    return new NextResponse(errorFeed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Короткий кэш для ошибок
      },
      status: 200, // Возвращаем 200, но с пустым feed
    })
  }
}
