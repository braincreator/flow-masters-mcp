import { Metadata } from 'next'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { BlogTagCloud } from '@/components/blog/BlogTagCloud'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { Pagination } from '@/components/Pagination'
import { Newsletter } from '@/components/Newsletter'
import { Post, Category, Media } from '@/payload-types'
import { BlogPost, BlogTag } from '@/types/blocks'

// Define the props interface
interface BlogPageProps {
  params: { lang: string }
  searchParams: {
    page?: string
    category?: string
    tag?: string
    search?: string
  }
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const locale = (params.lang || DEFAULT_LOCALE) as Locale

  return {
    title: locale === 'ru' ? 'Блог' : 'Blog',
    description:
      locale === 'ru' ? 'Наши последние статьи и обновления' : 'Our latest articles and updates',
  }
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  try {
    const locale = (params.lang || DEFAULT_LOCALE) as Locale
    const currentPage = parseInt(searchParams.page || '1', 10)
    const limit = 9 // Posts per page

    // Initialize PayloadCMS client
    const payload = await getPayloadClient()

    // Build the query conditions
    const query: any = {
      _status: { equals: 'published' },
    }

    if (searchParams.category) {
      query['categories.slug'] = { equals: searchParams.category }
    }

    if (searchParams.tag) {
      query['tags.slug'] = { equals: searchParams.tag }
    }

    if (searchParams.search) {
      query.or = [
        { title: { like: searchParams.search } },
        { excerpt: { like: searchParams.search } },
      ]
    }

    // Fetch posts based on filters
    const posts = await payload.find({
      collection: 'posts',
      where: query,
      sort: '-publishedAt',
      limit,
      page: currentPage,
      depth: 1, // Load relations 1 level deep
      locale: locale,
    })

    // Fetch all categories for filtering
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
      locale: locale,
    })

    // Try to fetch tags (this might not work if tags collection doesn't exist)
    let formattedTags: BlogTag[] = []
    try {
      const tagsResponse = await payload.find({
        collection: 'tags' as any, // Using type assertion as a workaround
        limit: 30,
        locale: locale,
      })

      formattedTags = tagsResponse.docs.map((tag: any) => ({
        id: tag.id,
        title: tag.title || '',
        slug: tag.slug || '',
        count: 0,
      }))
    } catch (err) {
      console.error('Error fetching tags:', err)
      // Continue with empty tags array
    }

    // Format data for components
    const formattedPosts: BlogPost[] = posts.docs.map((post: Post) => {
      let heroImageUrl = ''
      let heroImageAlt = ''

      if (post.heroImage && typeof post.heroImage !== 'string') {
        const media = post.heroImage as Media
        if (media && typeof media === 'object') {
          heroImageUrl = 'url' in media && media.url ? media.url : ''
          heroImageAlt = 'alt' in media && media.alt ? media.alt : post.title
        }
      }

      return {
        id: post.id,
        title: post.title,
        slug: post.slug || '',
        publishedAt: post.publishedAt || undefined,
        heroImage:
          post.heroImage && typeof post.heroImage !== 'string'
            ? {
                url: heroImageUrl,
                alt: heroImageAlt,
              }
            : undefined,
        author:
          post.authors && post.authors.length > 0 && typeof post.authors[0] !== 'string'
            ? {
                id: post.authors[0].id,
                name: post.authors[0].name || 'Unknown',
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
        readTime: 5, // Default reading time
      }
    })

    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              {locale === 'ru' ? 'Блог' : 'Blog'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {locale === 'ru'
                ? 'Наши последние статьи и обновления'
                : 'Our latest articles and updates'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="md:col-span-2 space-y-8">
              {/* Search and filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <BlogSearch
                  initialQuery={searchParams.search || ''}
                  placeholder={locale === 'ru' ? 'Поиск статей...' : 'Search posts...'}
                />
              </div>

              {/* Results info */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {posts.totalDocs} {locale === 'ru' ? 'статей' : 'posts'}
                  {searchParams.category && <span> • {searchParams.category}</span>}
                  {searchParams.tag && <span> • {searchParams.tag}</span>}
                  {searchParams.search && <span> • "{searchParams.search}"</span>}
                </p>
              </div>

              {/* Posts grid */}
              {formattedPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {formattedPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <h3 className="text-xl font-medium mb-2">
                    {locale === 'ru' ? 'Статьи не найдены' : 'No posts found'}
                  </h3>
                  <p className="text-muted-foreground">
                    {locale === 'ru'
                      ? 'Попробуйте изменить параметры поиска'
                      : 'Try changing your search filters'}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {posts.totalPages > 1 && (
                <Pagination
                  page={currentPage}
                  totalPages={posts.totalPages}
                  baseUrl={`/${locale}/blog`}
                  searchParams={Object.fromEntries(
                    Object.entries(searchParams).filter(([key]) => key !== 'page'),
                  )}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Tags */}
              {formattedTags.length > 0 && (
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium text-lg mb-4">{locale === 'ru' ? 'Теги' : 'Tags'}</h3>
                  <BlogTagCloud tags={formattedTags} />
                </div>
              )}

              {/* Newsletter */}
              <div className="border rounded-lg p-6">
                <Newsletter
                  title={
                    locale === 'ru' ? 'Подпишитесь на рассылку' : 'Subscribe to our newsletter'
                  }
                  description={
                    locale === 'ru'
                      ? 'Получайте наши новости и статьи на почту'
                      : 'Stay updated with our latest news and articles'
                  }
                  buttonText={locale === 'ru' ? 'Подписаться' : 'Subscribe'}
                  placeholderText={locale === 'ru' ? 'Ваш email' : 'Enter your email'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading blog page:', error)
    return notFound()
  }
}
