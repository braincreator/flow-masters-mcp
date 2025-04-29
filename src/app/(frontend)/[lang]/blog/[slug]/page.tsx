'use server'

import { Metadata } from 'next'
import { getPayloadClient, retryOnSessionExpired } from '@/utilities/payload/index'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { PayloadAPIProvider } from '@/providers/payload'
import { formatBlogDate, calculateReadingTime } from '@/lib/blogHelpers'
import { isLexicalContent } from '@/utilities/lexicalParser'
import { BlogPostPageClient } from './page-client'
import type { Post, Category, Tag, Media, User } from '@/payload-types'

// Импортируем стили
import '@/components/blog/blog-page.css'

interface Props {
  params: Promise<{
    lang: string
    slug: string
  }>
}

// Helper function to check if a value is a populated object with an id
const isPopulatedObject = <T extends { id: string }>(
  value: string | T | null | undefined, // Allow null/undefined
): value is T => typeof value === 'object' && value !== null && 'id' in value

// Helper function to check if a value is a populated User object
const isPopulatedUser = (value: string | User | null | undefined): value is User =>
  typeof value === 'object' && value !== null && 'id' in value && 'name' in value

export default async function BlogPostPage({ params: paramsPromise }: Props) {
  const { lang, slug } = await paramsPromise
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale

  try {
    const payload = await getPayloadClient()

    let post: Post | undefined
    let relatedPosts

    try {
      const posts = await retryOnSessionExpired(() =>
        payload.find({
          collection: 'posts',
          where: {
            slug: { equals: slug },
            _status: { equals: 'published' },
          },
          locale: currentLocale,
          depth: 2,
          limit: 1,
        }),
      )

      if (!posts?.docs || posts.docs.length === 0) {
        return notFound()
      }

      post = posts.docs[0] as Post

      if (!post) {
        return notFound()
      }

      // Extract IDs after confirming post exists
      const postId = post.id
      const categoryIds =
        post.categories?.map((cat) => (isPopulatedObject(cat) ? cat.id : cat)).filter(Boolean) || []
      const tagIds =
        post.tags?.map((tag) => (isPopulatedObject(tag) ? tag.id : tag)).filter(Boolean) || []

      // Fetch related posts using extracted IDs
      relatedPosts = await retryOnSessionExpired(() =>
        payload.find({
          collection: 'posts',
          where: {
            _status: { equals: 'published' },
            id: { not_equals: postId }, // Use variable postId
            or: [
              { 'categories.id': { in: categoryIds } }, // Use variable categoryIds
              { 'tags.id': { in: tagIds } }, // Use variable tagIds
            ],
          },
          locale: currentLocale,
          depth: 1,
          limit: 3,
          sort: '-publishedAt',
        }),
      )
    } catch (error) {
      console.error('Error loading blog post data:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw error
    }

    let processedContent = post.content

    if (processedContent) {
      if (typeof processedContent === 'string') {
        try {
          processedContent = JSON.parse(processedContent)
        } catch (e) {
          console.log('[Blog] Контент не является JSON строкой')
        }
      }
    }

    const formattedPostTags =
      post.tags
        ?.map((tag) => {
          if (isPopulatedObject<Tag>(tag)) {
            return {
              id: tag.id,
              title: tag.title,
              slug: tag.slug || '',
            }
          }
          return null
        })
        .filter(Boolean)
        .map((tag) => tag!) || []

    const formattedPostCategories =
      post.categories
        ?.map((cat) => {
          if (isPopulatedObject<Category>(cat)) {
            return {
              id: cat.id,
              title: cat.title,
              slug: cat.slug || '',
            }
          }
          return null
        })
        .filter(Boolean)
        .map((cat) => cat!) || []

    const formattedRelatedPosts =
      relatedPosts?.docs?.map((relatedPost: Post) => {
        const heroImage = relatedPost.heroImage
        let imageUrl = ''
        let imageAlt = ''
        if (isPopulatedObject<Media>(heroImage)) {
          imageUrl = heroImage.url || ''
          imageAlt = heroImage.alt || ''
        }

        return {
          id: relatedPost.id?.toString(),
          title: relatedPost.title,
          slug: relatedPost.slug,
          publishedAt: relatedPost.publishedAt,
          heroImage: heroImage
            ? {
                url: imageUrl,
                alt: imageAlt,
              }
            : undefined,
          categories: relatedPost.categories
            ?.map((cat) => {
              if (isPopulatedObject<Category>(cat)) {
                return {
                  id: cat.id,
                  title: cat.title,
                  slug: cat.slug,
                }
              }
              return null
            })
            .filter(Boolean)
            .map((cat) => cat!),
        }
      }) || []

    const postDate = post.publishedAt ? new Date(post.publishedAt) : new Date()

    // Используем сохраненное значение readingTime вместо расчета на лету
    const readTime = post.readingTime || calculateReadingTime(JSON.stringify(post.content)) || 5

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
    console.error('Error rendering blog post page:', error)
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

    const posts = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: slug },
        _status: { equals: 'published' },
      },
      locale: currentLocale,
      depth: 1, // Depth 1 to get author, tags, categories populated
      limit: 1,
    })

    if (!posts?.docs || posts.docs.length === 0) {
      return {
        title: 'Post Not Found',
      }
    }

    const post = posts.docs[0] as Post
    if (!post) {
      return {
        title: 'Post Not Found',
      }
    }

    const metaTitle = post.meta?.title || post.title || 'Blog Post'
    const metaDescription = post.meta?.description || '' // Use meta description, fallback to empty
    const metaImage =
      post.meta?.image && isPopulatedObject<Media>(post.meta.image) ? post.meta.image.url || '' : ''

    // Prepare authors and tags for OpenGraph
    const authors = post.populatedAuthors?.map((author) => author?.name).filter(Boolean) as string[]

    const tags = post.tags
      ?.map((tag) => (isPopulatedObject<Tag>(tag) ? tag.title : null))
      .filter(Boolean) as string[]

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `/blog/${slug}`,
        siteName: 'Flow Masters', // Replace with your site name if different
        images: metaImage
          ? [
              {
                url: metaImage,
                // Add width/height if available from Media type
              },
            ]
          : [],
        type: 'article',
        publishedTime: post.publishedAt || undefined, // Allow undefined
        authors: authors?.length ? authors : undefined,
        tags: tags?.length ? tags : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: metaImage ? [metaImage] : undefined,
      },
    }
  } catch (error) {
    console.error(`Error generating metadata for blog post ${slug}:`, error)
    return {
      title: 'Error',
      description: 'Failed to load post metadata',
    }
  }
}
