import { Metadata } from 'next'
import { getPayloadClient } from '@/utilities/payload'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { PayloadAPIProvider } from '@/providers/payload'
import { BlogBlock } from '@/blocks/Blog/Component'

// Define the number of posts per page
const POSTS_PER_PAGE = 9

// Define the props interface
interface BlogPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    page?: string
    category?: string
    tag?: string
    search?: string
  }>
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await paramsPromise
  const locale = (lang || DEFAULT_LOCALE) as Locale

  return {
    title: locale === 'ru' ? 'Блог' : 'Blog',
    description:
      locale === 'ru' ? 'Наши последние статьи и обновления' : 'Our latest articles and updates',
  }
}

export default async function BlogPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: BlogPageProps) {
  const { lang } = await paramsPromise
  const { page, category, tag, search } = await searchParamsPromise

  const locale = (lang || DEFAULT_LOCALE) as Locale
  const currentPage = page ? parseInt(page, 10) : 1
  const categorySlug = category || ''
  const tagSlug = tag || ''
  const searchQuery = search || ''

  try {
    // Initialize Payload client
    const payload = await getPayloadClient()

    // Prepare query for fetching posts
    const query: any = {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    }

    // Add search filter if provided
    if (searchQuery) {
      query.and.push({
        or: [
          {
            title: {
              like: searchQuery,
            },
          },
          {
            excerpt: {
              like: searchQuery,
            },
          },
          {
            'content.richText': {
              like: searchQuery,
            },
          },
        ],
      })
    }

    // Add category filter if provided
    if (categorySlug) {
      // First find the category by slug
      const categoryResults = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: categorySlug,
          },
        },
        limit: 1,
      })

      if (categoryResults.docs.length > 0) {
        query.and.push({
          categories: {
            in: categoryResults.docs[0].id,
          },
        })
      }
    }

    // Add tag filter if provided
    if (tagSlug) {
      // First find the tag by slug
      const tagResults = await payload.find({
        collection: 'tags',
        where: {
          slug: {
            equals: tagSlug,
          },
        },
        limit: 1,
      })

      if (tagResults.docs.length > 0) {
        query.and.push({
          tags: {
            in: tagResults.docs[0].id,
          },
        })
      }
    }

    // Fetch posts with pagination
    const posts = await payload.find({
      collection: 'posts',
      where: query,
      page: currentPage,
      limit: POSTS_PER_PAGE,
      sort: '-publishedAt',
      locale,
      depth: 2, // Load related data with depth of 2
    })

    // Fetch categories for sidebar
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
      locale,
    })

    // Fetch tags for sidebar
    const tags = await payload.find({
      collection: 'tags',
      limit: 100,
      locale,
    })

    // Format posts for the component
    const formattedPosts = posts.docs.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      heroImage: post.heroImage
        ? {
            url: post.heroImage.url,
            alt: post.heroImage.alt || post.title,
          }
        : undefined,
      author: post.author
        ? {
            id: post.author.id,
            name: post.author.name,
            avatar: post.author.avatar?.url,
          }
        : undefined,
      categories: post.categories?.map((category: any) => ({
        id: category.id,
        title: category.title,
        slug: category.slug,
      })),
      readTime: post.readTime || undefined,
    }))

    // Format categories for the component
    const formattedCategories = await Promise.all(
      categories.docs.map(async (category) => {
        // Count published posts in this category
        const postsCount = await payload.find({
          collection: 'posts',
          where: {
            and: [
              {
                _status: {
                  equals: 'published',
                },
              },
              {
                categories: {
                  in: category.id,
                },
              },
            ],
          },
          limit: 0,
        })

        return {
          id: category.id,
          title: category.title,
          slug: category.slug,
          count: postsCount.totalDocs,
        }
      }),
    )

    // Format tags for the component
    const formattedTags = await Promise.all(
      tags.docs.map(async (tag) => {
        // Count published posts with this tag
        const postsCount = await payload.find({
          collection: 'posts',
          where: {
            and: [
              {
                _status: {
                  equals: 'published',
                },
              },
              {
                tags: {
                  in: tag.id,
                },
              },
            ],
          },
          limit: 0,
        })

        return {
          id: tag.id,
          title: tag.title,
          slug: tag.slug,
          count: postsCount.totalDocs,
        }
      }),
    )

    // Filter out categories and tags with no posts
    const filteredCategories = formattedCategories.filter((cat) => cat.count > 0)
    const filteredTags = formattedTags.filter((tag) => tag.count > 0)

    return (
      <div className="min-h-screen bg-background">
        <PayloadAPIProvider>
          <BlogBlock
            initialPosts={formattedPosts}
            initialCategories={filteredCategories}
            initialTags={filteredTags}
            title={locale === 'ru' ? 'Блог' : 'Blog'}
            description={
              locale === 'ru'
                ? 'Наши последние статьи и обновления'
                : 'Our latest articles and updates'
            }
            postsPerPage={POSTS_PER_PAGE}
            showFeaturedPost={true}
            showSearch={true}
            showCategories={true}
            showTags={true}
            showPagination={true}
          />
        </PayloadAPIProvider>
      </div>
    )
  } catch (error) {
    console.error('Error loading blog page:', error)
    return notFound()
  }
}
