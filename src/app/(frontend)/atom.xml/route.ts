import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { unstable_cache } from 'next/cache'
import { lexicalToHtml } from '@/utilities/lexicalToHtml'

const getAtomFeed = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://flow-masters.ru'

    // Получаем опубликованные посты
    const results = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 2,
      limit: 50, // Ограничиваем количество постов в Atom
      pagination: false,
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

    const currentDate = new Date().toISOString()
    const feedId = `${SITE_URL}/atom.xml`

    // Находим дату последнего обновления
    const lastUpdated = results.docs && results.docs.length > 0
      ? new Date(results.docs[0].publishedAt || results.docs[0].updatedAt).toISOString()
      : currentDate

    // Создаем Atom элементы для каждого поста
    const atomEntries = results.docs
      ? results.docs
          .filter((post) => Boolean(post?.slug))
          .map((post) => {
            const postUrl = `${SITE_URL}/posts/${post.slug}`
            const published = post.publishedAt 
              ? new Date(post.publishedAt).toISOString()
              : new Date(post.updatedAt).toISOString()
            const updated = new Date(post.updatedAt).toISOString()
            
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
            const summary = post.excerpt || 
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
  <entry>
    <title type="text">${escapeXml(post.title)}</title>
    <link href="${postUrl}" rel="alternate" type="text/html"/>
    <id>${postUrl}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <author>
      <name>${escapeXml(authorName)}</name>
      <email>noreply@flow-masters.ru</email>
    </author>
    <summary type="text">${escapeXml(summary)}</summary>
    <content type="html"><![CDATA[${contentHtml}]]></content>
    ${categories.map(cat => `<category term="${escapeXml(cat)}" />`).join('\n    ')}
  </entry>`
          })
          .join('')
      : ''

    // Создаем полный Atom feed
    const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Flow Masters - Блог об ИИ и автоматизации</title>
  <subtitle>Экспертные статьи об искусственном интеллекте, автоматизации бизнес-процессов и цифровой трансформации</subtitle>
  <link href="${SITE_URL}" rel="alternate" type="text/html"/>
  <link href="${feedId}" rel="self" type="application/atom+xml"/>
  <id>${feedId}</id>
  <updated>${lastUpdated}</updated>
  <author>
    <name>Flow Masters</name>
    <email>admin@flow-masters.ru</email>
  </author>
  <generator uri="${SITE_URL}" version="1.0">Flow Masters CMS</generator>
  <icon>${SITE_URL}/favicon.ico</icon>
  <logo>${SITE_URL}/favicon.ico</logo>
  <rights>© ${new Date().getFullYear()} Flow Masters. Все права защищены.</rights>
  ${atomEntries}
</feed>`

    return atomFeed
  },
  ['atom-feed'],
  {
    tags: ['atom-feed'],
    revalidate: 3600, // Кэш на 1 час
  },
)

export async function GET() {
  try {
    const atomFeed = await getAtomFeed()

    return new NextResponse(atomFeed, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Кэш на 1 час
      },
    })
  } catch (error) {
    console.error('Error generating Atom feed:', error)
    return new NextResponse('Error generating Atom feed', { status: 500 })
  }
}
