'use server'

import { Metadata } from 'next'
import { getPayloadClient, retryOnSessionExpired } from '@/utilities/payload'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { PayloadAPIProvider } from '@/providers/payload'
import { formatBlogDate, calculateReadingTime } from '@/lib/blogHelpers'
import { isLexicalContent } from '@/utilities/lexicalParser'
import { BlogPostPageClient } from './page-client'

// Импортируем стили
import '@/components/blog/blog-page.css'

interface Props {
  params: Promise<{
    lang: string
    slug: string
  }>
}

/**
 * Глубокая диагностика структуры контента
 */
function analyzeContent(content: any, maxDepth = 3): string {
  if (!content) return 'Контент отсутствует'

  try {
    const type = typeof content

    if (type === 'string') {
      try {
        // Проверяем, может ли это быть JSON
        const parsed = JSON.parse(content)
        return `Строка (JSON): ${analyzeContent(parsed, maxDepth)}`
      } catch {
        // Не JSON, просто строка
        return `Строка (${content.length} символов)`
      }
    }

    if (type !== 'object') {
      return `Примитивный тип: ${type}`
    }

    if (Array.isArray(content)) {
      return `Массив с ${content.length} элементами`
    }

    // Анализ объекта
    const keys = Object.keys(content)
    let info = `Объект с ${keys.length} ключами: ${keys.join(', ')}`

    if (maxDepth > 0) {
      // Проверяем Lexical структуру
      if (content.root && typeof content.root === 'object') {
        info += `\nLexical root содержит ${content.root.children?.length || 0} дочерних элементов`

        // Анализируем первые несколько дочерних элементов
        if (content.root.children && content.root.children.length > 0) {
          info += `\nПервые элементы: ${content.root.children
            .slice(0, 3)
            .map((c: any) => c.type + (c.children ? `(${c.children.length} детей)` : ''))
            .join(', ')}`
        }
      }
    }

    return info
  } catch (e) {
    return `Ошибка анализа: ${e instanceof Error ? e.message : 'неизвестная ошибка'}`
  }
}

export default async function BlogPostPage({ params: paramsPromise }: Props) {
  const { lang, slug } = await paramsPromise
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale

  try {
    const payload = await getPayloadClient()

    // Подготовка контента блога с обработкой ошибок
    let post
    let relatedPosts

    try {
      // Fetch the post by slug с использованием retryOnSessionExpired
      const posts = await retryOnSessionExpired(() =>
        payload.find({
          collection: 'posts',
          where: {
            slug: { equals: slug },
            _status: { equals: 'published' },
          },
          locale: currentLocale,
          depth: 2, // Load relationships 2 levels deep
          limit: 1,
        }),
      )

      if (!posts?.docs || posts.docs.length === 0) {
        return notFound()
      }

      post = posts.docs[0]

      // Get related posts based on categories and tags с использованием retryOnSessionExpired
      relatedPosts = await retryOnSessionExpired(() =>
        payload.find({
          collection: 'posts',
          where: {
            _status: { equals: 'published' },
            id: { not_equals: post.id },
            or: [
              { 'categories.id': { in: post.categories?.map((cat: any) => cat.id) || [] } },
              { 'tags.id': { in: post.tags?.map((tag: any) => tag.id) || [] } },
            ],
          },
          locale: currentLocale,
          depth: 1,
          limit: 3,
          sort: '-publishedAt',
        }),
      )
    } catch (error) {
      console.error('Error loading blog post:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw error
    }

    // Подготовка контента
    let processedContent = post.content

    // Проверяем и структурируем контент если нужно
    if (processedContent) {
      // Убеждаемся что у контента есть необходимая структура для Lexical
      if (typeof processedContent === 'string') {
        try {
          // Проверяем, является ли строка JSON
          processedContent = JSON.parse(processedContent)
        } catch (e) {
          // Если не JSON, то оставляем как есть
          console.log('[Blog] Контент не является JSON строкой')
        }
      }

      // Логируем информацию о контенте в режиме разработки
      if (process.env.NODE_ENV === 'development') {
        console.log('[Blog] Тип контента:', typeof processedContent)
        if (typeof processedContent === 'object') {
          console.log('[Blog] Ключи контента:', Object.keys(processedContent))
          console.log('[Blog] Анализ контента:', analyzeContent(processedContent))
          console.log('[Blog] Является Lexical контентом:', isLexicalContent(processedContent))
        }
      }
    }

    // Format the post data for components
    const formattedPostTags =
      post.tags?.map((tag: any) => ({
        id: tag.id?.toString(),
        title: tag.title,
        slug: tag.slug,
      })) || []

    const formattedPostCategories =
      post.categories?.map((cat: any) => ({
        id: cat.id?.toString(),
        title: cat.title,
        slug: cat.slug,
      })) || []

    // Format related posts for the component
    const formattedRelatedPosts = relatedPosts.docs.map((post: any) => ({
      id: post.id?.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      heroImage: post.heroImage
        ? {
            url: post.heroImage.url,
            alt: post.heroImage.alt || '',
          }
        : undefined,
      categories: post.categories?.map((cat: any) => ({
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
      })),
    }))

    const postDate = post.publishedAt ? new Date(post.publishedAt) : new Date()

    // Get estimate reading time if not provided
    const readTime = post.readTime || calculateReadingTime(JSON.stringify(post.content)) || 5

    return (
      <PayloadAPIProvider>
        <BlogPostPageClient
          post={post}
          formattedPostTags={formattedPostTags}
          formattedPostCategories={formattedPostCategories}
          formattedRelatedPosts={formattedRelatedPosts}
          currentLocale={currentLocale}
          postDate={postDate}
          readTime={readTime}
          processedContent={processedContent}
        />
      </PayloadAPIProvider>
    )
  } catch (error) {
    // Улучшенная обработка ошибок
    console.error('Error generating blog post page:', error)
    throw error
  }
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await paramsPromise
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale

  try {
    const payload = await getPayloadClient()

    // Fetch the post by slug for metadata
    const posts = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: slug },
        _status: { equals: 'published' },
      },
      locale: currentLocale,
      depth: 1,
      limit: 1,
    })

    if (!posts?.docs || posts.docs.length === 0) {
      return {
        title: 'Post Not Found',
      }
    }

    const post = posts.docs[0]

    return {
      title: `${post.title} | Flow Masters Blog`,
      description: post.excerpt || '',
      openGraph: post.heroImage?.url
        ? {
            images: [{ url: post.heroImage.url, alt: post.heroImage.alt || post.title }],
            type: 'article',
            publishedTime: post.publishedAt,
            authors: post.author ? [post.author.name] : undefined,
            tags: post.tags?.map((tag) => tag.title),
          }
        : undefined,
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || '',
        images: post.heroImage?.url ? [post.heroImage.url] : undefined,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Post | Flow Masters',
    }
  }
}
