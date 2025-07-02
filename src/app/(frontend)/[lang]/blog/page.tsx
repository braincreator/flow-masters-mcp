import { Metadata } from 'next'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload/index'
import { getServerSideURL } from '@/utilities/getURL'
import { NewsletterWrapper } from '@/components/blog/NewsletterWrapper'
import { Post, Category, Media } from '@/payload-types'
import { BlogPost, BlogTag } from '@/types/blocks'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import BlogPageClient from './page.client' // Import the client component

// Get properly typed params
type PageParams = {
  params: Promise<{ lang: string }>
  searchParams: {
    page?: string
    category?: string
    tag?: string
    search?: string
  }
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const params = await paramsPromise
  const locale = (params.lang || DEFAULT_LOCALE) as Locale

  setRequestLocale(locale)
  const t = await getTranslations('blogPage')

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function BlogPage(props: PageParams) {
  try {
    // Destructure props
    const { lang } = await props.params

    const locale = (lang || DEFAULT_LOCALE) as Locale
    setRequestLocale(locale)
    const t = await getTranslations('blogPage')
    const limit = 9 // Posts per page

    // Ensure we have a valid server URL for Payload
    // This is critical for resolving the "Failed to fetch" error
    const serverUrl = getServerSideURL()
    logDebug(`Using server URL: ${serverUrl}`)

    // Initialize PayloadCMS client with proper error handling
    let payload
    try {
      logDebug('Initializing PayloadCMS client...')
      payload = await getPayloadClient()
      logDebug('PayloadCMS client initialized successfully')

      // Debug: Check available collections
      try {
        const collections = payload.config.collections
        logDebug('Available collections:', collections.map(c => c.slug))
      } catch (err) {
        logWarn('Could not list collections:', err)
      }
    } catch (error) {
      logError('Failed to initialize PayloadCMS client:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        logError('Network error detected. Check server connectivity and CORS configuration.')
        throw new Error(
          'Database connection error: Cannot connect to Payload API. Please ensure the API server is running.',
        )
      }
      throw new Error('Database connection error. Please try again later.')
    }

    // Fetch the first page of posts
    let posts
    try {
      logDebug('Fetching posts from collection "posts"...')
      logDebug('Query parameters:', {
        collection: 'posts',
        where: { _status: { equals: 'published' } },
        sort: '-publishedAt',
        limit,
        page: 1,
        depth: 1,
        locale: locale,
      })

      posts = await payload.find({
        collection: 'posts',
        where: {
          _status: { equals: 'published' },
        },
        sort: '-publishedAt',
        limit,
        page: 1, // Fetch only the first page initially
        depth: 1, // Load relations 1 level deep
        locale: locale,
      })

      logDebug('Posts fetched successfully:', {
        totalDocs: posts.totalDocs,
        docsCount: posts.docs.length,
        page: posts.page,
        totalPages: posts.totalPages
      })
    } catch (error) {
      logError('Error fetching posts:', error)
      logError('Error details:', {
        name: error?.name,
        message: error?.message,
        status: error?.status,
        data: error?.data
      })

      // Try alternative approach - fetch without filters first
      try {
        logDebug('Trying alternative approach - fetching all posts...')
        posts = await payload.find({
          collection: 'posts',
          limit,
          page: 1,
          depth: 1,
          locale: locale,
        })
        logDebug('Alternative fetch successful:', {
          totalDocs: posts.totalDocs,
          docsCount: posts.docs.length
        })
      } catch (altError) {
        logError('Alternative fetch also failed:', altError)
        throw new Error('Failed to fetch blog posts. Please try again later.')
      }
    }

    // Fetch all categories for filtering
    let categories
    try {
      categories = await payload.find({
        collection: 'categories',
        limit: 100,
        locale: locale,
      })
    } catch (error) {
      logError('Error fetching categories:', error)
      // Continue with empty categories
      categories = { docs: [] }
    }

    // Fetch and format categories with post counts
    const formattedCategories = await Promise.all(
      categories.docs.map(async (cat: any) => {
        try {
          const postsInCategory = await payload.find({
            collection: 'posts',
            where: {
              _status: { equals: 'published' },
              categories: { equals: cat.id },
            },
            limit: 0, // We only need the count, not the documents
            locale: locale,
          })
          return {
            id: cat.id,
            title: cat.title,
            slug: cat.slug || '',
            count: postsInCategory.totalDocs,
          }
        } catch (error) {
          logError(`Error fetching posts for category ${cat.id}:`, error)
          return {
            id: cat.id,
            title: cat.title,
            slug: cat.slug || '',
            count: 0, // Default to 0 if fetching fails
          }
        }
      }),
    )

    // Try to fetch tags (this might not work if tags collection doesn't exist)
    let formattedTags: BlogTag[] = []
    try {
      const tagsResponse = await payload.find({
        collection: 'tags' as any, // Using type assertion as a workaround
        limit: 30,
        locale: locale,
      })

      // Fetch and format tags with post counts
      formattedTags = await Promise.all(
        tagsResponse.docs.map(async (tagItem: any) => {
          try {
            const postsWithTag = await payload.find({
              collection: 'posts',
              where: {
                _status: { equals: 'published' },
                tags: { equals: tagItem.id },
              },
              limit: 0, // We only need the count
              locale: locale,
            })
            return {
              id: tagItem.id,
              title: tagItem.title || '',
              slug: tagItem.slug || '',
              count: postsWithTag.totalDocs,
            }
          } catch (error) {
            logError(`Error fetching posts for tag ${tagItem.id}:`, error)
            return {
              id: tagItem.id,
              title: tagItem.title || '',
              slug: tagItem.slug || '',
              count: 0, // Default to 0 if fetching fails
            }
          }
        }),
      )
    } catch (err) {
      logError('Error fetching tags:', err)
      // Continue with empty tags array
    }

    // Format data for components
    const formattedPosts: BlogPost[] = posts.docs.map((post: Post) => {
      // Safely handle the hero image
      let heroImage: { url: string; alt: string } | undefined = undefined

      try {
        if (post.heroImage && typeof post.heroImage === 'object') {
          // Type assertion with a check for required properties
          const media = post.heroImage as Record<string, any>

          if (media && media.url) {
            heroImage = {
              url: String(media.url),
              alt: media.alt ? String(media.alt) : post.title,
            }
          }
        }
      } catch (err) {
        logError('Error processing hero image:', err)
      }

      return {
        id: post.id,
        title: post.title,
        slug: post.slug || '',
        publishedAt: post.publishedAt || undefined,
        heroImage,
        author:
          post.authors && post.authors.length > 0 && typeof post.authors[0] !== 'string'
            ? {
                id:
                  typeof post.authors[0] === 'object' && post.authors[0]
                    ? post.authors[0].id || ''
                    : '',
                name:
                  typeof post.authors[0] === 'object' && post.authors[0]
                    ? post.authors[0].name || 'Unknown'
                    : 'Unknown',
                avatar: undefined, // We don't have avatar in the Post type
              }
            : undefined,
        categories: post.categories?.map((cat) => {
          if (typeof cat === 'string') return { id: cat, title: '', slug: '' }
          return {
            id: cat.id,
            title: cat.title,
            slug: cat.slug || '',
          }
        }),
        // Добавляем теги для отображения на карточках
        tags: post.tags?.map((tag) => {
          if (typeof tag === 'string') {
            // Попробуем найти тег в списке всех тегов
            const foundTag = formattedTags.find((t) => t.id === tag)
            if (foundTag) {
              return foundTag
            }
            return { id: tag, title: '', slug: '' }
          }
          return {
            id: tag.id,
            title: tag.title,
            slug: tag.slug || '',
          }
        }),
        readingTime: post.readingTime || 5, // Используем поле readingTime с запасным значением 5 мин
      }
    })

    // Create a new PaginatedDocs object with formatted posts
    const initialBlogPosts = {
      ...posts, // Copy pagination info (page, totalDocs, limit, etc.)
      docs: formattedPosts, // Use the formatted posts array
    }

    // Prepare translations for client component
    const translations = {
      title: t('title'),
      description: t('description'),
      searchPlaceholder: t('searchPlaceholder'),
      noPostsFound: t('noPostsFound'),
      loadMore: t('loadMore'),
      categories: t('categories'),
      tags: t('tags'),
      allCategories: t('allCategories'),
      allTags: t('allTags'),
    }

    // Render server-side content with client-side interactivity
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('description')}</p>
        </div>

        {/* Client-side interactive components */}
        <BlogPageClient
          initialPosts={initialBlogPosts}
          categories={formattedCategories}
          tags={formattedTags}
          locale={locale}
          translations={translations}
        />
      </div>
    )
  } catch (error) {
    logError('Error loading blog page:', error)
    return notFound()
  }
}
