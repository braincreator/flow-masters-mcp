import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * API endpoint для LLM-оптимизированного sitemap
 * Предоставляет структурированную информацию о всех страницах сайта
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const language = searchParams.get('lang') || 'ru'

    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'

    // Получаем все страницы
    const [posts, services, pages] = await Promise.all([
      payload.find({
        collection: 'posts',
        limit: 1000,
        select: {
          title: true,
          slug: true,
          excerpt: true,
          tags: true,
          categories: true,
          publishedDate: true,
          updatedAt: true,
        },
      }),
      payload.find({
        collection: 'services',
        limit: 1000,
        select: {
          title: true,
          slug: true,
          description: true,
          serviceType: true,
          updatedAt: true,
        },
      }),
      payload.find({
        collection: 'pages',
        limit: 1000,
        select: {
          title: true,
          slug: true,
          updatedAt: true,
        },
      }),
    ])

    const sitemap = {
      site: {
        name: 'Flow Masters',
        url: baseUrl,
        language: language,
        description: 'Автоматизация бизнес-процессов и AI решения',
        lastUpdated: new Date().toISOString(),
      },
      pages: [
        // Главная страница
        {
          url: `${baseUrl}/${language}`,
          title: 'Flow Masters - Автоматизация и AI решения',
          type: 'homepage',
          priority: 1.0,
          changeFreq: 'daily',
          lastModified: new Date().toISOString(),
          contentType: 'landing',
          topics: ['автоматизация', 'ИИ', 'бизнес-процессы'],
        },
        // Статические страницы
        ...pages.docs.map((page: any) => ({
          url:
            page.slug === 'home' ? `${baseUrl}/${language}` : `${baseUrl}/${language}/${page.slug}`,
          title:
            typeof page.title === 'object' ? page.title[language] || page.title.ru : page.title,
          type: 'page',
          priority: getPagePriority(page.slug),
          changeFreq: getPageChangeFreq(page.slug),
          lastModified: page.updatedAt,
          contentType: 'informational',
        })),
        // Посты блога
        ...posts.docs.map((post: any) => ({
          url: `${baseUrl}/${language}/posts/${post.slug}`,
          title:
            typeof post.title === 'object' ? post.title[language] || post.title.ru : post.title,
          excerpt:
            typeof post.excerpt === 'object'
              ? post.excerpt[language] || post.excerpt.ru
              : post.excerpt,
          type: 'blog_post',
          priority: 0.8,
          changeFreq: 'weekly',
          lastModified: post.updatedAt,
          publishedDate: post.publishedDate,
          contentType: 'article',
          tags: post.tags || [],
          categories: post.categories || [],
        })),
        // Услуги
        ...services.docs.map((service: any) => ({
          url: `${baseUrl}/${language}/services/${service.slug}`,
          title:
            typeof service.title === 'object'
              ? service.title[language] || service.title.ru
              : service.title,
          description:
            typeof service.description === 'object'
              ? service.description[language] || service.description.ru
              : service.description,
          type: 'service',
          serviceType: service.serviceType,
          priority: 0.9,
          changeFreq: 'weekly',
          lastModified: service.updatedAt,
          contentType: 'commercial',
        })),
      ],
      metadata: {
        totalPages: pages.docs.length + posts.docs.length + services.docs.length + 1,
        generatedAt: new Date().toISOString(),
        language: language,
        format: format,
        version: '1.0',
        crawlInstructions: {
          respectRobotsTxt: true,
          crawlDelay: 1,
          maxDepth: 3,
          followLinks: true,
          indexContent: true,
        },
      },
    }

    if (format === 'xml') {
      const xml = generateXMLSitemap(sitemap)
      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }

    return NextResponse.json(sitemap, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Content-Language': language,
        'X-Content-Type': 'llm-sitemap',
        'X-Robots-Tag': 'index, follow',
      },
    })
  } catch (error) {
    console.error('Error generating LLM sitemap:', error)
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
  }
}

function getPagePriority(slug: string): number {
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

function getPageChangeFreq(slug: string): string {
  const frequencies: Record<string, string> = {
    home: 'daily',
    services: 'weekly',
    blog: 'daily',
    about: 'monthly',
    contact: 'monthly',
  }
  return frequencies[slug] || 'monthly'
}

function generateXMLSitemap(sitemap: any): string {
  const urls = sitemap.pages
    .map(
      (page: any) => `
    <url>
      <loc>${page.url}</loc>
      <lastmod>${page.lastModified}</lastmod>
      <changefreq>${page.changeFreq}</changefreq>
      <priority>${page.priority}</priority>
      <content-type>${page.contentType}</content-type>
      ${page.tags ? `<tags>${page.tags.join(', ')}</tags>` : ''}
    </url>
  `,
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:content="http://www.google.com/schemas/sitemap-content/1.0">
  ${urls}
</urlset>`
}
