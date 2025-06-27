import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { unstable_cache } from 'next/cache'
import { lexicalToHtml } from '@/utilities/lexicalToHtml'
import {
  generateRssFeed,
  truncateForRss,
  type RssFeedConfig,
  type RssItem,
} from '@/utilities/rssHelpers'

const getRssFeed = unstable_cache(
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
      limit: 50, // Ограничиваем количество постов в RSS
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

    const currentDate = new Date().toUTCString()

    // Создаем RSS элементы для каждого поста
    const rssItems: RssItem[] = results.docs
      ? results.docs
          .filter((post) => Boolean(post?.slug))
          .map((post) => {
            const postUrl = `${SITE_URL}/posts/${post.slug}`
            const pubDate = post.publishedAt
              ? new Date(post.publishedAt).toUTCString()
              : new Date(post.updatedAt).toUTCString()

            // Получаем имя автора
            const authorName =
              post.populatedAuthors && post.populatedAuthors.length > 0
                ? post.populatedAuthors[0].name
                : 'Flow Masters'

            // Получаем категории
            const categories =
              post.categories && Array.isArray(post.categories)
                ? post.categories
                    .map((cat: any) => (typeof cat === 'object' ? cat.title : cat))
                    .filter(Boolean)
                : []

            // Конвертируем контент в HTML
            const contentHtml = post.content ? lexicalToHtml(post.content) : ''

            // Используем excerpt или первые 300 символов контента как описание
            const description = post.excerpt || truncateForRss(contentHtml)

            return {
              title: post.title,
              link: postUrl,
              guid: postUrl,
              description,
              content: contentHtml,
              pubDate,
              author: `noreply@flow-masters.ru (${authorName})`,
              categories,
            }
          })
      : []

    // Конфигурация RSS feed
    const feedConfig: RssFeedConfig = {
      title: 'Flow Masters - Блог об ИИ и автоматизации',
      description:
        'Экспертные статьи об искусственном интеллекте, автоматизации бизнес-процессов и цифровой трансформации от команды Flow Masters',
      language: 'ru',
      baseUrl: SITE_URL,
      feedUrl: `${SITE_URL}/rss.xml`,
      managingEditor: 'admin@flow-masters.ru (Flow Masters)',
      webMaster: 'admin@flow-masters.ru (Flow Masters)',
    }

    // Создаем полный RSS feed
    const rssFeed = generateRssFeed(feedConfig, rssItems)

    return rssFeed
  },
  ['rss-feed'],
  {
    tags: ['rss-feed'],
    revalidate: 3600, // Кэш на 1 час
  },
)

export async function GET() {
  try {
    const rssFeed = await getRssFeed()

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Кэш на 1 час
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}
