import { Metadata } from 'next'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload'
import { getServerSideURL } from '@/utilities/getURL'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { BlogTagCloud } from '@/components/blog/BlogTagCloud'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { Pagination } from '@/components/Pagination'
import { Newsletter } from '@/components/Newsletter'
import { Post, Category, Media } from '@/payload-types'
import { BlogPost, BlogTag } from '@/types/blocks'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Localized texts
const texts = {
  en: {
    title: 'Blog',
    description: 'Our latest articles and updates',
    posts: 'posts',
    categories: 'Categories',
    tags: 'Tags',
    noPostsFound: 'No posts found',
    tryChangingFilters: 'Try changing your search filters',
    filters: 'Filters',
    clearFilters: 'Clear filters',
    searchPlaceholder: 'Search articles...',
    activeFilters: 'Active filters',
    all: 'All',
  },
  ru: {
    title: 'Блог',
    description: 'Наши последние статьи и обновления',
    posts: 'статей',
    categories: 'Категории',
    tags: 'Теги',
    noPostsFound: 'Статьи не найдены',
    tryChangingFilters: 'Попробуйте изменить параметры поиска',
    filters: 'Фильтры',
    clearFilters: 'Очистить фильтры',
    searchPlaceholder: 'Поиск статей...',
    activeFilters: 'Активные фильтры',
    all: 'Все',
  },
}

// Get properly typed params
type PageParams = {
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
  const locale = ((await params).lang || DEFAULT_LOCALE) as Locale
  const t = texts[locale]

  return {
    title: t.title,
    description: t.description,
  }
}

export default async function BlogPage(props: PageParams) {
  try {
    // Destructure props
    const { lang } = await props.params
    const { page, category, tag, search } = await props.searchParams

    const locale = (lang || DEFAULT_LOCALE) as Locale
    const t = texts[locale]
    const currentPage = parseInt(page || '1', 10)
    const limit = 9 // Posts per page

    // Ensure we have a valid server URL for Payload
    // This is critical for resolving the "Failed to fetch" error
    const serverUrl = getServerSideURL()
    console.log(`Using server URL: ${serverUrl}`)

    // Initialize PayloadCMS client with proper error handling
    let payload
    try {
      payload = await getPayloadClient()
    } catch (error) {
      console.error('Failed to initialize PayloadCMS client:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network error detected. Check server connectivity and CORS configuration.')
        throw new Error(
          'Database connection error: Cannot connect to Payload API. Please ensure the API server is running.',
        )
      }
      throw new Error('Database connection error. Please try again later.')
    }

    // Build the query conditions
    const query: any = {
      _status: { equals: 'published' },
    }

    // Track if we have any active filters
    const hasActiveFilters = !!(category || tag || search)

    if (category) {
      query['categories.slug'] = { equals: category }
    }

    if (tag) {
      query['tags.slug'] = { equals: tag }
    }

    if (search) {
      query.or = [{ title: { like: search } }]
    }

    // Fetch posts based on filters
    let posts
    try {
      posts = await payload.find({
        collection: 'posts',
        where: query,
        sort: '-publishedAt',
        limit,
        page: currentPage,
        depth: 1, // Load relations 1 level deep
        locale: locale,
      })
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw new Error('Failed to fetch blog posts. Please try again later.')
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
      console.error('Error fetching categories:', error)
      // Continue with empty categories
      categories = { docs: [] }
    }

    // Format categories
    const formattedCategories = categories.docs.map((cat: any) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug || '',
      count: 0, // We don't have this info
    }))

    // Try to fetch tags (this might not work if tags collection doesn't exist)
    let formattedTags: BlogTag[] = []
    try {
      const tagsResponse = await payload.find({
        collection: 'tags' as any, // Using type assertion as a workaround
        limit: 30,
        locale: locale,
      })

      formattedTags = tagsResponse.docs.map((tagItem: any) => ({
        id: tagItem.id,
        title: tagItem.title || '',
        slug: tagItem.slug || '',
        count: 0,
      }))
    } catch (err) {
      console.error('Error fetching tags:', err)
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
        console.error('Error processing hero image:', err)
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
        readTime: 5, // Default reading time
      }
    })

    // Find active category details if we have a category filter
    const activeCategory = category
      ? formattedCategories.find((cat) => cat.slug === category)
      : undefined

    // Helper function to build filter URLs (preserving other params)
    const buildFilterUrl = (params: { category?: string; tag?: string; search?: string }) => {
      const urlParams = new URLSearchParams()

      if (params.category) urlParams.set('category', params.category)
      if (params.tag) urlParams.set('tag', params.tag)
      if (params.search) urlParams.set('search', params.search)

      return `/${locale}/blog${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
    }

    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">{t.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="md:col-span-2 space-y-8">
              {/* Search and filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <BlogSearch
                  initialQuery={search || ''}
                  placeholder={t.searchPlaceholder}
                  preserveParams={true}
                  className="w-full sm:max-w-md"
                  variant="product-style"
                  showClearButton={true}
                  size="default"
                />

                {hasActiveFilters && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-muted-foreground">{t.activeFilters}:</span>

                    {category && activeCategory && (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 border-primary/30 text-primary"
                      >
                        {activeCategory.title}
                      </Badge>
                    )}

                    {tag && (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 border-primary/30 text-primary"
                      >
                        {formattedTags.find((t) => t.slug === tag)?.title || tag}
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <Link href={`/${locale}/blog`} scroll={false}>
                        {t.clearFilters}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Categories (horizontal) */}
              {formattedCategories.length > 0 && (
                <div className="pt-2 pb-4 border-b">
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <Button
                      variant={!category ? 'secondary' : 'ghost'}
                      size="sm"
                      className="whitespace-nowrap"
                      asChild
                    >
                      <Link href={buildFilterUrl({ tag, search })} scroll={false}>
                        {t.all}
                      </Link>
                    </Button>

                    {formattedCategories.slice(0, 8).map((cat) => (
                      <Button
                        key={cat.id}
                        variant={category === cat.slug ? 'secondary' : 'ghost'}
                        size="sm"
                        className="whitespace-nowrap"
                        asChild
                      >
                        <Link
                          href={buildFilterUrl({ category: cat.slug, tag, search })}
                          scroll={false}
                        >
                          {cat.title}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results info */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{posts.totalDocs}</span> {t.posts}
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
                <div className="py-12 text-center border rounded-md bg-background">
                  <h3 className="text-xl font-medium mb-2">{t.noPostsFound}</h3>
                  <p className="text-muted-foreground">{t.tryChangingFilters}</p>
                </div>
              )}

              {/* Pagination */}
              {posts.totalPages > 1 && (
                <Pagination
                  page={currentPage}
                  totalPages={posts.totalPages}
                  baseUrl={`/${locale}/blog`}
                  searchParams={Object.fromEntries(
                    Object.entries(props.searchParams).filter(([key]) => key !== 'page'),
                  )}
                  scroll={false}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Tags */}
              {formattedTags.length > 0 && (
                <div className="rounded-lg border shadow-sm p-6 bg-card">
                  <h3 className="font-medium text-lg mb-4">{t.tags}</h3>
                  <BlogTagCloud tags={formattedTags} activeTag={tag} preserveParams={true} />
                </div>
              )}

              {/* Newsletter */}
              <div className="rounded-lg border shadow-sm p-6 bg-card">
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
