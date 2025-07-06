import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * API endpoint для предоставления структурированного контента для LLM
 * Оптимизирован для индексации AI ботами
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const language = searchParams.get('lang') || 'ru'

    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'

    let content: any = {
      site: {
        name: 'Flow Masters',
        description: 'Автоматизация бизнес-процессов и AI решения',
        url: baseUrl,
        language: language,
        topics: [
          'Автоматизация бизнес-процессов',
          'Искусственный интеллект',
          'Чат-боты',
          'Интеграция систем',
          'Разработка ПО',
          'Цифровая трансформация',
        ],
        expertise: [
          'n8n автоматизация',
          'OpenAI API интеграция',
          'Telegram боты',
          'CRM интеграция',
          'Workflow оптимизация',
          'AI решения для бизнеса',
        ],
        lastUpdated: new Date().toISOString(),
      },
    }

    // Получаем контент в зависимости от типа
    if (type === 'all' || type === 'posts') {
      const posts = await payload.find({
        collection: 'posts',
        limit,
        select: {
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          tags: true,
          categories: true,
          publishedDate: true,
          updatedAt: true,
        },
      })

      content.posts = posts.docs.map((post: any) => ({
        title: typeof post.title === 'object' ? post.title[language] || post.title.ru : post.title,
        url: `${baseUrl}/${language}/posts/${post.slug}`,
        excerpt:
          typeof post.excerpt === 'object'
            ? post.excerpt[language] || post.excerpt.ru
            : post.excerpt,
        content: extractTextFromRichText(post.content),
        tags: post.tags || [],
        categories: post.categories || [],
        publishedDate: post.publishedDate,
        lastModified: post.updatedAt,
        type: 'blog_post',
        language: language,
      }))
    }

    if (type === 'all' || type === 'services') {
      const services = await payload.find({
        collection: 'services',
        limit,
        select: {
          title: true,
          slug: true,
          description: true,
          content: true,
          serviceType: true,
          features: true,
          updatedAt: true,
        },
      })

      content.services = services.docs.map((service: any) => ({
        title:
          typeof service.title === 'object'
            ? service.title[language] || service.title.ru
            : service.title,
        url: `${baseUrl}/${language}/services/${service.slug}`,
        description:
          typeof service.description === 'object'
            ? service.description[language] || service.description.ru
            : service.description,
        content: extractTextFromRichText(service.content),
        serviceType: service.serviceType,
        features: service.features || [],
        lastModified: service.updatedAt,
        type: 'service',
        language: language,
      }))
    }

    if (type === 'all' || type === 'pages') {
      const pages = await payload.find({
        collection: 'pages',
        limit,
        select: {
          title: true,
          slug: true,
          content: true,
          updatedAt: true,
        },
      })

      content.pages = pages.docs.map((page: any) => ({
        title: typeof page.title === 'object' ? page.title[language] || page.title.ru : page.title,
        url:
          page.slug === 'home' ? `${baseUrl}/${language}` : `${baseUrl}/${language}/${page.slug}`,
        content: extractTextFromRichText(page.content),
        lastModified: page.updatedAt,
        type: 'page',
        language: language,
      }))
    }

    // Добавляем метаданные для LLM
    content.metadata = {
      contentType: 'structured_data',
      generatedAt: new Date().toISOString(),
      totalItems: Object.values(content).reduce((acc: number, val: any) => {
        return acc + (Array.isArray(val) ? val.length : 0)
      }, 0),
      language: language,
      encoding: 'utf-8',
      format: 'json',
      version: '1.0',
    }

    return NextResponse.json(content, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Content-Language': language,
        'X-Content-Type': 'llm-optimized',
        'X-Robots-Tag': 'index, follow',
      },
    })
  } catch (error) {
    console.error('Error generating LLM content:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}

/**
 * Извлекает текст из rich text контента Payload CMS
 */
function extractTextFromRichText(content: any): string {
  if (!content) return ''

  if (typeof content === 'string') return content

  if (Array.isArray(content)) {
    return content.map(extractTextFromRichText).join(' ')
  }

  if (typeof content === 'object') {
    if (content.text) return content.text
    if (content.children) return extractTextFromRichText(content.children)
    if (content.content) return extractTextFromRichText(content.content)
  }

  return ''
}
