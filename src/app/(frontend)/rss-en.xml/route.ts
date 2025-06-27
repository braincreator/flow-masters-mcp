import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { unstable_cache } from 'next/cache'
import { lexicalToHtml } from '@/utilities/lexicalToHtml'

const getRssFeedEn = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://flow-masters.ru'

    // Получаем опубликованные посты на английском языке
    const results = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 2,
      limit: 50, // Ограничиваем количество постов в RSS
      pagination: false,
      locale: 'en', // Английская локаль
      where: {
        _status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt', // Сортируем по дате публикации (новые первыми)
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        publishedAt: true,
        updatedAt: true,
        authors: true,
        populatedAuthors: true,
        categories: true,
        meta: true,
      },
    })

    const currentDate = new Date().toUTCString()

    // Создаем RSS элементы для каждого поста
    const rssItems = results.docs
      ? results.docs
          .filter((post) => Boolean(post?.slug))
          .map((post) => {
            const postUrl = `${SITE_URL}/en/posts/${post.slug}`
            const pubDate = post.publishedAt 
              ? new Date(post.publishedAt).toUTCString()
              : new Date(post.updatedAt).toUTCString()
            
            // Получаем имя автора
            const authorName = post.populatedAuthors && post.populatedAuthors.length > 0
              ? post.populatedAuthors[0].name
              : 'Flow Masters'

            // Получаем категории
            const categories = post.categories && Array.isArray(post.categories)
              ? post.categories
                  .map((cat: any) => typeof cat === 'object' ? cat.title : cat)
                  .filter(Boolean)
              : []

            // Конвертируем контент в HTML
            const contentHtml = post.content ? lexicalToHtml(post.content) : ''
            
            // Используем excerpt или первые 300 символов контента как описание
            const description = post.excerpt || 
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
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author>noreply@flow-masters.ru (${escapeXml(authorName)})</author>
      ${categories.map(cat => `<category><![CDATA[${cat}]]></category>`).join('\n      ')}
    </item>`
          })
          .join('')
      : ''

    // Создаем полный RSS feed
    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Flow Masters - AI and Automation Blog</title>
    <link>${SITE_URL}/en</link>
    <description>Expert articles about artificial intelligence, business process automation, and digital transformation from the Flow Masters team</description>
    <language>en</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <managingEditor>admin@flow-masters.ru (Flow Masters)</managingEditor>
    <webMaster>admin@flow-masters.ru (Flow Masters)</webMaster>
    <generator>Flow Masters CMS</generator>
    <image>
      <url>${SITE_URL}/favicon.ico</url>
      <title>Flow Masters</title>
      <link>${SITE_URL}/en</link>
    </image>
    <atom:link href="${SITE_URL}/rss-en.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`

    return rssFeed
  },
  ['rss-feed-en'],
  {
    tags: ['rss-feed-en'],
    revalidate: 3600, // Кэш на 1 час
  },
)

export async function GET() {
  try {
    const rssFeed = await getRssFeedEn()

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Кэш на 1 час
      },
    })
  } catch (error) {
    console.error('Error generating English RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}
